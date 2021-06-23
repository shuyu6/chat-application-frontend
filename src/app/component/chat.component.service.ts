import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import * as SockJS from 'sockjs-client';
import {Stomp} from '@stomp/stompjs';

@Injectable()
export class ChatService {
    urlHttp: string = "http://localhost:9001/chat"
    urlWebSocket: string = "http://localhost:9002/ws"
    messageSource = new Subject<any>();
    messageSource$ = this.messageSource.asObservable();

    private stompClient = null;
    private chatRoomId;
    
    constructor(private http: HttpClient) {
    }

    public connect(chatRoomId: string) {
        //todo: prevent subscibe to multiple time to the same endpoint ? 
        const socket = new SockJS(this.urlWebSocket);
        this.stompClient = Stomp.over(socket);
        this.chatRoomId = chatRoomId;
        this.stompClient.connect({}, this.subscription);
    }

    private subscription=(frame)=>{
        // console.log('Connected: ' + frame);
        this.stompClient.subscribe(`/user/${this.chatRoomId}/queue/messages`, this.queueMessageCallbackFunction);
    }
    private queueMessageCallbackFunction=(res)=>{
        this.messageSource.next(res.body);
    }

    public sendMessage(body: any){
        this.stompClient.send("/app/chat", {}, JSON.stringify(body));
    }

    public getChatRoomId(senderId: number, receiverId: number){
        let body = {senderId:senderId,receiverId:receiverId};
        return this.http.post( this.urlHttp+"/chat-room-id", body).toPromise();
    }
    public getPreviousMessage(chatRoomId: number, pageSize: number, pageNo: number){
        return this.http
            .get(`${this.urlHttp}/chat-history?chatRoomId=${chatRoomId}&pageSize=${pageSize}&pageNo=${pageNo}`)
            .toPromise();
    }
}