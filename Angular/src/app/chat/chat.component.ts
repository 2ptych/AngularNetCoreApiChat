import { Component, OnInit, HostListener } from "@angular/core";
import { ResizedEvent } from "angular-resize-event";
import { StateManagmentService } from "../services/state-managment.service";
import { ChatModel } from "../models/chat.model";
import { Subscription, BehaviorSubject } from "rxjs";
import { WindowSize } from '../models/window-size.model';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  actualWidth: number;
  selectChat: ChatModel;
  //windowSize: WindowSize;
  //windowSizeSubscription: Subscription;

  windowSizeBS = new BehaviorSubject<WindowSize>(null);
  windowSize = this.windowSizeBS.asObservable();
  load: boolean = true;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // при ресайзе создаем новый объект
    this.windowSizeBS.next(new WindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    }))
    ;
  }
  constructor(private sharedData: StateManagmentService) { }

  ngOnInit() {
    this.hideChatContent();

    /*this.windowSizeBS.next(new WindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    }))*/

    // событие клика по чату
    this.sharedData.currentChat.subscribe(value => {
      if (!this.load) {
        this.selectChat = value;
        //console.log('чат получен ' + value);
        if (this.windowSize["width"] <= 576) {
          this.showChatContent();
          this.showChatAreaOnly();
        }
        else {
          this.showChatContent();
        }
      }
    });

    // событие нажатия на кнопку Назад
    this.sharedData.backButton.subscribe(
      () => {
        if (!this.load) {
          console.log('нажата кнопка назад');
          if (this.windowSize["width"] <= 576) {
            this.showSidePanelOnly();
            this.hideChatContent();
          }
        }
      }
    );

    this.load = false;
  }

  public onResized(event: ResizedEvent) {
    //this.actualWidth = event.newWidth;
    // если узкий экран
    if (event.newWidth <= 576) {
      if (this.selectChat) {
        this.showChatAreaOnly();
      }
      else {
        this.showSidePanelOnly();
      }
      // показать кнопку Назад
      this.showBackButton();
    }
    else {
      this.showChatSideBoth();
      // иниче скрыть кнопку Назад
      this.hideBackButton();
    }
  }

  public getBackButton() {
    // получить кнопку Назад
    return document.getElementById('back-button-id');
  }

  public showBackButton() {
    let backButton = this.getBackButton();
    backButton.classList.remove('hide');
  }

  public hideBackButton() {
    let backButton = this.getBackButton();
    backButton.classList.add('hide');
  }

  public getSidePanel() {
    // получить элемент со списком контактов
    return document.getElementById('side-panel-id');
  }

  public getChatArea() {
    // получить элемент с чатом
    return document.getElementById('content-id');
  }

  public showChatContent() {
    // показать переписку
    let chatHeader = document.getElementById('chat-header-id');
    let chatArea = document.getElementById('chat-area-id');
    let messageInput = document.getElementById('message-block-id');
    chatHeader.classList.remove('hide');
    chatArea.classList.remove('hide');
    messageInput.classList.remove('hide');
  }

  public hideChatContent() {
    // скрыть переписку
    let chatHeader = document.getElementById('chat-header-id');
    let chatArea = document.getElementById('chat-area-id');
    let messageInput = document.getElementById('message-block-id');
    chatHeader.classList.add('hide');
    chatArea.classList.add('hide');
    messageInput.classList.add('hide');
  }

  public showSidePanel() {
    let side = this.getSidePanel();
    side.classList.remove('hide');
  }

  public hideSidePanel() {
    let side = this.getSidePanel();
    side.classList.add('hide');
  }

  public showChatArea() {
    let content = this.getChatArea();
    content.classList.remove('hide');
  }

  public hideChatArea() {
    let content = this.getChatArea();
    content.classList.add('hide');
  }

  public showSidePanelOnly() {
    this.showSidePanel();
    this.hideChatArea();
  }

  public showChatAreaOnly() {
    this.showChatArea();
    this.hideSidePanel();
  }

  public showChatSideBoth() {
    this.showChatArea();
    this.showSidePanel();
  }
}
