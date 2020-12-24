import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { StateManagmentService } from "../../services/state-managment.service";
import { environment } from "../../../environments/environment";
import { ChatModel } from 'src/app/models/chat.model';
import { HubConnectionState } from "@microsoft/signalr";

@Component({
  selector: 'chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {
  // текущий собеседник - будет храниться только в StateManagmentService
  private readonly imageUrl = environment.imagePathUrl;

  constructor(private authService: AuthenticationService,
    private router: Router,
    private sharedData: StateManagmentService) {
  }

  ngOnInit() {
    // открывает соединение SignalR
    if (this.connection.state !== HubConnectionState.Connected)
      this.sharedData.startSignalRConnection();

      this.connection.on('RecieveLoggedUser', (user: string) => {
        let loggedUser = JSON.parse(user);
        this.setLoggedUser(loggedUser);
      });
    // подписка на событие кнопки Назад
    // this.sharedData.backButton.subscribe(() => this.clearChatSelection());

    // событие на выбор чата
    /*this.sharngedData.currentChat.subscribe(currentChat => {
      // при выборе чата - получаем актуальную версию
      // в этом компоненте
      this.selectChat = currentChat;
    });*/
  }

  public logoutUser() {
    this.sharedData.closeSignalRConnection();
    this.authService.logout();
    this.setLoggedUser(null);
    this.router.navigateByUrl('login');
  }

  setLoggedUser(user: ChatModel) {
    if (user) {
      let userPic = this.getUserProfilePicture();
      let userTitle = this.getUserTitlePicture();
      userPic.src = this.imageUrl + user['ChatImage'];
      userTitle.textContent = user['Title'];
      this.sharedData.loggedUser =
        new ChatModel(user['Title'], user['UserId'], user['ChatImage'], null);
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

  get connection() {
    return this.sharedData.getSignalRConnection();
  }

  get selectedUser() {
    return this.sharedData.currentChat;
  }
}
