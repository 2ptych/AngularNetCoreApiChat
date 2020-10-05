import { Injectable, OnInit, OnDestroy } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ChatModel } from "../models/chat.model";
import { WindowSize, WindowService } from "./window.service";
import { SignalRService, ConnectionState  } from "./signalr.service";
import { NameResolverService } from "./name-resolver.service";
import { MessageModel } from "../models/message.model";

@Injectable()
export class StateManagmentService implements OnDestroy {

  private chatSelection = new BehaviorSubject<ChatModel>(null);
  // текущий собеседник
  currentChat = this.chatSelection.asObservable();
  // кнопка назад
  backButton = new BehaviorSubject(null);
  // для отправки сообщений в компонент Chat-Panel
  private messageSenderBS = new BehaviorSubject<MessageModel[]>(null);
  messageSender = this.messageSenderBS.asObservable();
  // залогиненый пользователь
  loggedUser: ChatModel;

  windowSize: WindowSize;
  private windowSizeSubscription;

  // сервис с разрешением экрана
  // и событием ресайза окна
  constructor(private windowService: WindowService,
    private signalrService: SignalRService,
    public nameResolver: NameResolverService) {
    // получение размеров окна при изменении
    this.windowSizeSubscription = this.windowService.windowSizeChanged
      .subscribe(value => {
        this.windowSize = value;
      });
  }

  selectChat(chat: ChatModel) {
    this.chatSelection.next(chat);
  }

  resetChat() {
    this.chatSelection.next(null);
  }

  //////////

  setMessagesInPanel(messages: MessageModel[]) {
    this.messageSenderBS.next(messages);
  }

  resetMessagesInPanel() {
    this.messageSenderBS.next([]);
  }

  //////////

  // возвращает соединение SignalR
  getSignalRConnection() {
    return this.signalrService.getHubConnection();
  }

  startSignalRConnection() {
    this.signalrService.startConnection();
  }

  closeSignalRConnection() {
    this.signalrService.closeConnection();
  }

  //////////

  ngOnDestroy() {
    this.windowSizeSubscription = null;
  }
}
