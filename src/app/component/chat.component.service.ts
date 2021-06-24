import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { takeUntil} from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as SockJS from 'sockjs-client';
import {Stomp} from '@stomp/stompjs';

@Injectable()
export class ChatService {
    public ngUnsubscribe: Subject<void> = new Subject<void>();
    public messageSource = new Subject<any>();
    public messageSource$ = this.messageSource.asObservable();
    public notificationSource = new Subject<any>();

    private urlHttp: string = "http://localhost:9001/chat"
    private urlWebSocket: string = "http://localhost:9002/ws"
        private stompClient = null;
    private chatRoomId;
    
    constructor(private http: HttpClient) {
    }

    public connect() {
        //todo: prevent subscibe to multiple time to the same endpoint ? 
        const socket = new SockJS(this.urlWebSocket);
        this.stompClient = Stomp.over(socket);
        this.stompClient.connect({},this.connectCallback);
    }
    private connectCallback = ()=>{ 
        console.log("connected");
        this.subscribeNotificationSocket();
    }
    private subscribeNotificationSocket=()=>{
        console.log("subscribe notification url ")
        let userId = sessionStorage.getItem("user_id");
        this.stompClient.subscribe(`/user/${userId}/queue/notification`, this.notificationCallbackFunction, { id: `notification${userId}`})
    }

    public subscribeChatRoomSocket(chatRoomId: string){
        this.chatRoomId = chatRoomId;
        this.stompClient.subscribe(`/user/${this.chatRoomId}/queue/messages`, this.queueMessageCallbackFunction, { id: `chatRoom${chatRoomId}`});
    }
    public unsubscribeChatRoomSocket(chatRoomId: string){
        this.stompClient.unsubscribe(`chatRoom${chatRoomId}`);
    }
    private queueMessageCallbackFunction=(res)=>{
        this.messageSource.next(res.body);
    }
    private notificationCallbackFunction=(res)=>{
        this.notificationSource.next(res.body);
    }
    public sendMessage(body: any){
        this.stompClient.send("/app/chat", {}, JSON.stringify(body));
    }

    public getChatRoomId(senderId: number, receiverId: number){
        let body = {senderId:senderId,receiverId:receiverId};
        return this.http.post( this.urlHttp+"/chat-room-id", body)
            .pipe(takeUntil(this.ngUnsubscribe))
            .toPromise();
    }
    public getPreviousMessage(chatRoomId: number, pageSize: number, pageNo: number){
        return this.http
            .get(`${this.urlHttp}/chat-history?chatRoomId=${chatRoomId}&pageSize=${pageSize}&pageNo=${pageNo}`)
            .toPromise();
    }
}