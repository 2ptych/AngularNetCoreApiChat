import { Component, OnInit, AfterViewInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NotificationService } from "../../services/notification.service";
import { ChatModel } from "../../models/chat.model";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AuthenticationService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { StateManagmentService } from "../../services/state-managment.service";
import { environment } from "../../../environments/environment";
import { HubConnectionState } from "@microsoft/signalr";

@Component({
  selector: 'chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {
  // форма поиска
  searchForm: FormGroup;
  // список чатов
  chatList: ChatModel[] = [];
  // текущий собеседник
  selectChat: ChatModel;
  userListUploaded: boolean = false;
  private readonly imageUrl = environment.imagePathUrl;

  constructor(private formBuilder: FormBuilder,
    private noteService: NotificationService,
    private authService: AuthenticationService,
    private router: Router,
    private sharedData: StateManagmentService) {
    this.searchForm = this.formBuilder.group({
      search: ['']
    });
  }

  public logoutUser() {
    this.sharedData.closeSignalRConnection();
    this.authService.logout();
    this.setLoggedUser(null);
    this.router.navigateByUrl('login');
  }

  get connection() {
    return this.sharedData.getSignalRConnection();
  }

  get selectedUser() {
    return this.selectChat;
  }

  get searchControl() {
    return this.searchForm.get('search');
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
      if (!this.sharedData.nameResolver.resolveId(parsedList[i].ChatId))
        this.sharedData.nameResolver.addName(parsedList[i].ChatId, parsedList[i].Title);
    }
    return chatUsers as ChatModel[];
  }

  ngOnInit() {
    if (this.connection.state !== HubConnectionState.Connected)
      this.sharedData.startSignalRConnection();

    this.connection.on('RecieveLoggedUser', (user: string) => {
      let loggedUser = JSON.parse(user);
      this.setLoggedUser(loggedUser);
    });

    // добавление чата для пользователя,
    // которому другой пользователь написал впервые
    this.connection.on('GetNewChat', (newUser: string) => {
      let user: ChatModel = this.stringToChatModel(JSON.parse(newUser));
      this.chatList.push(user);
    });

    // после создания чата на сервере, сюда возвращается ChatId 
    this.connection.on('UpdateForNewChat', (recievedNewChat: string) => {
      this.selectChat.chatId = recievedNewChat;
      console.log('ID созданного чата: ', recievedNewChat);
    });
    
    // получение и отображение чатов пользователя
    this.connection.on('RecieveUsersList', (recievedUserList: string) => {
      try {
        this.chatList = this.stringUsersToChatModels(recievedUserList);
        //console.log(this.chatList);
        this.userListUploaded = true;
      }
      catch {
        this.noteService.error("Не удалось получить список пользователей!");
      }
    });
    // поиск пользователей
    this.searchControl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      ).subscribe(value => {
        this.connection.invoke('SearchUsersByString', value);
      });
    // подписка на событие кнопки Назад
    this.sharedData.backButton.subscribe(() => this.clearChatSelection());

    // событие на выбор чата
    this.sharedData.currentChat.subscribe(currentChat => {
      // при выборе чата - получаем актуальную версию
      // в этом компоненте
      this.selectChat = currentChat;
    });
  }

  clearChatSelection() {
    var contacts = document.getElementsByClassName('chat');
    var contactsArray = Array.from(contacts);
    for (var i = 0; i < contactsArray.length; i++) {
      contactsArray[i].classList.remove('active');
    }
  }

  // при клике на переписке
  public activate($target, item: ChatModel) {

    // снимаем выделение с прошлого чата
    this.clearChatSelection();

    this.selectChat = item;
    // текущий чат отправляется в StateManagmentService
    this.sharedData.selectChat(item);

    let div = $target.target;
    if (!($target.target instanceof HTMLDivElement)) {
      div = $target.target.closest('.chat');
    }
    div.classList.add('active');
  }

  stringToChatModel(strUsr: string): ChatModel {
    return new ChatModel(strUsr['Title'], strUsr['UserId'], strUsr['ChatImage'], strUsr['ChatId']);
  }

  setLoggedUser(user: ChatModel) {
    if (user) {
      let userPic = this.getUserProfilePicture();
      let userTitle = this.getUserTitlePicture();
      userPic.src = this.imageUrl + user['ChatImage'];
      userTitle.textContent = user['Title'];
      this.sharedData.loggedUser = new ChatModel(user['Title'], user['UserId'], user['ChatImage'], null);
    }
    else this.sharedData.loggedUser = null;
  }

  getUserProfilePicture(): HTMLImageElement {
    return document.getElementById('profile-pic-id') as HTMLImageElement;
  }

  getUserTitlePicture(): HTMLParagraphElement {
    return document.getElementById('profile-title-id') as HTMLParagraphElement;
  }

  public getUserChats() {
    this.connection.invoke('GetUsersChatList');
  }
}
