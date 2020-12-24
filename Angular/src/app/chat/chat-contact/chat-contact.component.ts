import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable, Subscribable, Subscription } from 'rxjs';
import { ChatModel } from 'src/app/models/chat.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'chat-contact',
  templateUrl: './chat-contact.component.html',
  styleUrls: ['./chat-contact.component.css']
})
export class ChatContactComponent implements OnInit, OnDestroy {
  readonly imageUrl = environment.imagePathUrl;
  @Input() chat: ChatModel;
  @Output() chatSelected = new EventEmitter<ChatModel>();

  constructor() { }

  ngOnInit(): void{
  }

  ngOnDestroy(): void{
  }

  selectChat(){
    this.chatSelected.emit(this.chat);
  }
}
