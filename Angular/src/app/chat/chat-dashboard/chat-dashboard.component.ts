import { Component, Input, OnInit } from '@angular/core';
import { ChatModel } from 'src/app/models/chat.model';
import { NotificationService } from 'src/app/services/notification.service';
import { StateManagmentService } from 'src/app/services/state-managment.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HubConnectionState } from '@microsoft/signalr';

@Component({
  selector: 'chat-dashboard',
  templateUrl: './chat-dashboard.component.html',
  styleUrls: ['./chat-dashboard.component.css']
})
export class ChatDashboardComponent implements OnInit {

  @Input() chatList: ChatModel[];
  userListUploading: boolean = false;
  // форма поиска
  searchForm: FormGroup;
  //selectionBS = new BehaviorSubject<ChatModel>(null);
  //selection: Subscription = this.selectionBS.subscribe();
  //selection = this.selectionBS.asObservable();

  constructor(private formBuilder: FormBuilder,
    private sharedData: StateManagmentService,
    private noteService: NotificationService) { 
      this.searchForm = this.formBuilder.group({
        search: ['']
      });
      //this.searchUser(null);
    }

  ngOnInit(): void {
    
  // добавление чата для пользователя,
  // которому другой пользователь написал впервые
  this.connection.on('GetNewChat', (newUser: string) => {
    let user: ChatModel = this.stringToChatModel(JSON.parse(newUser));
    this.chatList.push(user);
  });

  // после создания чата на сервере, сюда возвращается ChatId 
  this.connection.on('UpdateForNewChat', (recievedNewChat: string) => {
    // ожидается объект вида { "userId": <value>, "chatId": <value> } 

    // нужно ли менять значение в observable,
    // если меняется исходное значение ???

    let newChat = JSON.parse(recievedNewChat);
    let target: ChatModel = this.chatList.find(x => x.userId === newChat.userId);
    if (target) {
      //console.log('1 target chatId' + target.chatId);
      //console.log('1 target userId' + target.userId);
      target.chatId = newChat.chatId;
      target.userId = null;
      //console.log('2 target chatId' + target.chatId);
      //console.log('2 target userId' + target.userId);
    }
  });
    
  // поиск пользователей
  this.searchControl.valueChanges
    .pipe(
      debounceTime(100)//,
      //distinctUntilChanged()
    ).subscribe(value => {
      //this.connection.invoke('SearchUsersByString', value);
      this.searchUser(value);
    });

    // получение и отображение чатов пользователя
    this.connection.on('RecieveUsersList', (recievedUserList: string) => {
      try {
        this.chatList = this.stringUsersToChatModels(recievedUserList);
        console.log("получен список чатов" + this.chatList);
      }
      catch {
        //this.noteService.error("Не удалось получить список пользователей!");
        alert("Не удалось получить список пользователей!");
      }
    });
  }

  searchUser(value: string){
    this.connection.invoke('SearchUsersByString', value);
  }

  stringUsersToChatModels(users: string): ChatModel[] {
    let chatUsers = [];
    let parsedList = JSON.parse(users);
    for (var i = 0; i < parsedList.length; i++) {
      chatUsers.push(
        new ChatModel(
          parsedList[i].Title,
          parsedList[i].UserId,
          parsedList[i].ChatImage,
          parsedList[i].ChatId
        )
      );
      // добавляем имена в резолвер
      /*if (!this.sharedData.nameResolver.resolveId(parsedList[i].ChatId))
        this.sharedData.nameResolver.addName(parsedList[i].ChatId, parsedList[i].Title);*/
    }
    return chatUsers as ChatModel[];
  }

  public trackContacts(index, item: ChatModel){
    if (!item) return null;
    return index;
  }

  selectionComparer(chat: ChatModel): boolean{
    let result: boolean;
    this.sharedData.currentChat.subscribe((currentChat: ChatModel) => {
      if (chat === currentChat) result = true;
      else result = false;
    });
    //console.log(result);
    return result;
  }

  // при клике на переписке
  public chatSelected(item: ChatModel) {
    console.log("emit chatSelected " + item.title);
    // снимаем выделение с прошлого чата
    //this.clearChatSelection();

    //this.selectChat = item;
    // текущий чат отправляется в StateManagmentService
    this.sharedData.selectChat(item);

    /*let div = $target.target;
    if (!($target.target instanceof HTMLDivElement)) {
      div = $target.target.closest('.chat');
    }
    div.classList.add('active');*/
  }

  /*clearChatSelection() {
    var contacts = document.getElementsByClassName('chat');
    var contactsArray = Array.from(contacts);
    for (var i = 0; i < contactsArray.length; i++) {
      contactsArray[i].classList.remove('active');
    }
  }*/

  stringToChatModel(strUsr: string): ChatModel {
    return new ChatModel(strUsr['Title'], strUsr['UserId'], strUsr['ChatImage'], strUsr['ChatId']);
  }

  get connection(){
    return this.sharedData.getSignalRConnection();
  }

  get searchControl() {
    return this.searchForm.get('search');
  }
}
