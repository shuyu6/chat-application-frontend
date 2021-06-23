import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core";
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

  MESSAGE_SIZE = 15;
  hasPrevious = false;
  currentPageNo = 0;
  
  constructor(private loginService: LoginService, 
    private chatService: ChatService,
    private cdr: ChangeDetectorRef){}
  
  ngOnInit() {
    this.initUserList();
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

  public handleMessage(text: string) {
    const msg: any = {
      content: text,
      senderId: sessionStorage.getItem("user_id"),
      chatRoomId: this.chatRoomId
    };
    this.chatService.sendMessage(msg);
  }

  /**
   * When user selected, will connected to a chat room. 
   * @param user 
   */
  public handleUserSelect(user: IUser) {  
    let senderId: number = parseInt(sessionStorage.getItem("user_id"));
    this.selectedUser = user;
    this.messages = [];
    this.cdr.markForCheck();

    this.chatService.getChatRoomId(senderId, user.id).then(res=>{
      this.chatRoomId = res['chatRoomId'];
      this.cdr.markForCheck();
      this.chatService.connect(this.chatRoomId);
      this.messageReceivedSetup();
    })
  }
  /**
   * Subscibe to message source 
   */
  private messageReceivedSetup(){
    this.retrievePreviousMessage();
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
  }

  retrievePreviousMessage=(pageNo=0)=>{
    this.chatService.getPreviousMessage(parseInt(this.chatRoomId), this.MESSAGE_SIZE, pageNo)
      .then(res =>{
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
        console.log(res);
      })


  }
}
