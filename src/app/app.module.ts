import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatAppComponent } from './component/chat-app/chat-app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login.component.service';
import { HttpClientModule } from '@angular/common/http';
import { ChatWindowComponent } from './component/chat-window/chat-window.component';
import { MessageComponent } from './component/message/message.component';
import { UsersListComponent } from './component/users-list/users-list.component';
import { ChatService } from './component/chat.component.service';

@NgModule({
  declarations: [
    AppComponent, 
    ChatAppComponent,
    ChatWindowComponent,
    MessageComponent,
    UsersListComponent,
    LoginComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
  ],
  providers: [
    LoginService,
    ChatService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
