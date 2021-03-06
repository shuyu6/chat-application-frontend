import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core";
import { Subject } from "rxjs";
import { LoginService } from "src/app/login/login.component.service";
import { IUser, IMessage } from "src/assets/interfaces/shared.interface";
import { Message, User } from "../chat.component.model";
import { ChatService } from "../chat.component.service";

@Component({
  selector: "chat-app",
  templateUrl: "./chat-app.component.html",
  styleUrls: ["./chat-app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatAppComponent implements OnInit {  
  public currentUser: IUser;
  public usersList: IUser[] = [];
  public messages: IMessage[] = [];
  public selectedUser: IUser;
  public chatRoomId: string;
  public isRefreshing = false;

  MESSAGE_SIZE = 20;
  hasPrevious = false;
  currentPageNo = 0;
  
  constructor(private loginService: LoginService, 
    private chatService: ChatService,
    private cdr: ChangeDetectorRef) {}
  
  ngOnInit() {
    this.initUserList();
    this.chatServiceSetup();
  }
  private initUserList(){
    this.loginService.userList().then(res=>{
      for(let user of res){
        let temp: IUser = new User();
        temp.id = user.userId;
        temp.isCurrent = user.userId == sessionStorage.getItem("user_id");
        temp.name = user.username;

        this.usersList = [
          ...this.usersList,
          {...temp},
        ]
        
      }
      this.cdr.markForCheck();
    });
  }

  private chatServiceSetup(){
    this.chatService.connect();
    this.chatService.messageSource$.subscribe(res=>{
      const msgTemp = JSON.parse(res);
      let msg = new Message();
      msg.text = msgTemp.content;
      msg.id = msgTemp.chatRoomId;
      msg.userId = msgTemp.senderId;
      msg.timestamp = msgTemp.timestamp;
      msg.userName = msgTemp.senderUsername;

      this.messages = [
        ...this.messages,
        {
          ...msg,
        }
      ];
      this.cdr.markForCheck();
    });

    this.chatService.notificationSource.subscribe(res=>{
      const msgTemp = JSON.parse(res);
      let user = this.usersList.find(u=> u.id == msgTemp.senderId);
      if(!this.chatRoomId || this.chatRoomId!=msgTemp.chatRoomId){
        user.notification += 1;
      }
      this.usersList = [...this.usersList];
      this.cdr.markForCheck();
    })
  }

  public handleMessage(text: string) {
    const msg: any = {
      content: text,
      senderId: sessionStorage.getItem("user_id"),
      chatRoomId: this.chatRoomId
    };
    this.chatService.sendMessage(msg);
  }

  public handleRequestPreviousMessage(){
    if(this.hasPrevious && !this.isRefreshing) {
      this.isRefreshing = true;
      this.cdr.markForCheck();
      this.retrievePreviousMessage(this.currentPageNo+1);
    }
  }

  /**
   * When user selected, will connected to a chat room. 
   * @param user 
   */
  public handleUserSelect(user: IUser) {  
    let senderId: number = parseInt(sessionStorage.getItem("user_id"));
    this.selectedUser = user;
    this.selectedUser.notification = 0;
    this.usersList = [...this.usersList];

    this.onChatRoomChanged();

    this.chatService.getChatRoomId(senderId, user.id).then(res=>{
      this.isRefreshing = false;
      this.chatRoomId = res['chatRoomId'];
      this.cdr.markForCheck();
      this.chatService.subscribeChatRoomSocket(this.chatRoomId);
      this.retrievePreviousMessage();
    })
  }

  onChatRoomChanged(){
    this.isRefreshing = true;
    this.chatService.ngUnsubscribe.next();
    if(this.chatRoomId){
      this.chatService.unsubscribeChatRoomSocket(this.chatRoomId);
    }
    this.messages = [];
    this.cdr.markForCheck();
  }

  retrievePreviousMessage=(pageNo=0)=>{
    this.chatService.getPreviousMessage(parseInt(this.chatRoomId), this.MESSAGE_SIZE, pageNo)
      .then(res =>{
        this.isRefreshing = false;
        this.currentPageNo = pageNo;
        this.hasPrevious = res['hasNext'];
        const historyMessages = res['messageList'];

        for(let msg of historyMessages){
          let message = new Message();
          message.text = msg.content;
          message.id = msg.id;
          message.userId = msg.senderId;
          message.userName = msg.username;
          message.timestamp = msg.timestamp;

          this.messages = [
            {...message},
            ...this.messages,
          ]
        }
        this.cdr.markForCheck();
      })
  }
}
