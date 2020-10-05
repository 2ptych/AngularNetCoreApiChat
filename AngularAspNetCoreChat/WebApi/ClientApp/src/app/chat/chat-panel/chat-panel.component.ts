import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MessageModel } from "../../models/message.model";
import { StateManagmentService } from "../../services/state-managment.service";
import { environment } from "../../../environments/environment";
import { ChatModel } from "../../models/chat.model";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { ChatCacheModel } from "../../models/chat-cache.model";
import { HubConnectionState } from "@microsoft/signalr";

@Component({
  selector: 'chat-panel',
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.css']
})
export class ChatPanelComponent implements OnInit {
  // форма отправки сообщений
  messageForm: FormGroup;
  messages: MessageModel[] = [];
  load: boolean = true;
  // текущий собеседник
  selectChat: ChatModel;
  private readonly imageUrl = environment.imagePathUrl;
  private readonly resolverUrl = environment.nameResolverUrl;
  private messageBase: ChatCacheModel[] = [];

  constructor(private formBuilder: FormBuilder,
    private sharedData: StateManagmentService,
    private httpClient: HttpClient) {
    this.messageForm = this.formBuilder.group({
      message: ['', Validators.required]
    });
  }

  get connection() {
    return this.sharedData.getSignalRConnection();
  }

  get messageControl() {
    return this.messageForm.get('message');
  }

  objectToMessageModel(obj): MessageModel {
    
    return new MessageModel(obj['Sender'], obj['Reciever'],
      obj['Text'], obj['Date']);
  }

  ngOnInit() {
    this.connection.on('RecieveMessage', recievedMessage => {
      let parsedMessage = JSON.parse(recievedMessage);
      let message: MessageModel = new MessageModel(parsedMessage['Sender'], parsedMessage['Reciever'], parsedMessage['Text'], parsedMessage['Date']);
      let messagesInBase = this.getChatMessageArray(message.reciever);
      if (messagesInBase === null) {
        this.connection.invoke('GetMessageHistory', message.reciever);
      } 
      else messagesInBase.push(message);
    });

    this.connection.on('RecieveMessageHistory', (chatId: string, messageHistory: string) => {
      console.log('messageHistory ', messageHistory);
      let messages = JSON.parse(messageHistory);
      let messagesForShow: MessageModel[] = [];
      for (var i = 0; i < messages.length; i++) {

        messagesForShow.push(
          new MessageModel(messages[i]['Sender'],
            messages[i]['Reciever'],
            messages[i]['Text'],
            messages[i]['Date']));
      }
      this.addMessagesHistoryInBase(chatId, messagesForShow);
      this.showMessagesInChatPanel(messagesForShow);
    });

    this.sharedData.currentChat.subscribe(currentChat => {
      if (!this.load) {
        this.selectChat = currentChat;
        this.setCompanionPic(currentChat.chatImage);
        this.setCompanionTitle(currentChat.title);
        this.renderMessages(currentChat);
      }
    });

    this.load = false;
  }

  getChatMessageArray(chatId: string) {
    let index = this.messageBase.findIndex(x => x.chat === chatId);
    if (index !== -1) return this.messageBase[index].messageArray;
    else return null;
  }

  renderMessages(chat: ChatModel) {
    let result = this.getChatMessageArray(chat.chatId);
    if (result !== null) {
      this.showMessagesInChatPanel(result);
    }
    else {
      if (this.connection.state === HubConnectionState.Connected) {
        this.connection.invoke('GetMessageHistory', chat.chatId);
      }
    }
  }

  showMessagesInChatPanel(messageHistory: MessageModel[]) {
    this.messages = messageHistory;
  }

  addMessagesHistoryInBase(chatId: string, messageHistory: MessageModel[]) {
    this.messageBase.push({ chat: chatId, messageArray: messageHistory } as ChatCacheModel);
  }

  cutEnterChar(str: string): string {
    return str.replace('\n', '');
  }

  sendMessage() {
    let messageStr: string = this.cutEnterChar(this.messageControl.value);
    let reciever: string;
    if (this.selectChat.chatId == null)
      reciever = this.selectChat.userId;
    else reciever = this.selectChat.chatId;
    if (messageStr !== ''){
      if (this.selectChat && this.sharedData.loggedUser) {
        let message =
          new MessageModel(this.sharedData.loggedUser.userId, reciever, messageStr, null);
        this.connection.invoke('SendMessage', message);
      }
    }
    this.clearMessageInput();
  }

  clearMessageInput() {
    this.messageControl.setValue('');
  }

  resolveUser(message: MessageModel) {
    let user = this.sharedData.nameResolver.resolveId(message.sender);
    let userName = null;
    if (user) return user.title;
    else {
      let formData: FormData = new FormData();
      formData.append('id', `${message.sender}`);
      console.log('formData: ', formData);
      this.httpClient.post<any>(this.resolverUrl, formData)
        .pipe(
          map(value => {
            return value['value'];
          })).subscribe(data => {
            if ((data !== 'error') && (data)) {
              console.log('name: ', data);
              this.sharedData.nameResolver.addName(message.sender, data);
              userName = data;
            }
          });
      return userName;
    }
  }

  isSender(message: MessageModel): boolean {
    if (message.sender === this.sharedData.loggedUser.userId) return true;
    else return false;
  }

  clickBackButton() {
    this.sharedData.backButton.next(null);
  }

  getCompanionPic() {
    return document.getElementById('companion-pic-id') as HTMLImageElement;
  }

  clearCompanionPic() {
    let picture = this.getCompanionPic();
    picture.src = '';
  }

  setCompanionPic(source: string) {
    let picture = this.getCompanionPic();
    picture.src = this.imageUrl + source;
  }

  getCompanionTitle() {
    return document.getElementById('companion-title-id') as HTMLParagraphElement;
  }

  clearCompanionTitle() {
    let paragraph = this.getCompanionTitle();
    paragraph.textContent = '';
  }

  setCompanionTitle(text: string) {
    let paragraph = this.getCompanionTitle();
    paragraph.textContent = text;
  }
}
