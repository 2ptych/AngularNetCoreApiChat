import { Injectable, OnInit, OnDestroy } from "@angular/core";
import { HubConnection } from '@microsoft/signalr';
//import * as SignalR from "@aspnet/signalr";
import * as SignalR from "@microsoft/signalr";
import { environment } from "../../environments/environment";
import { AuthenticationService } from "./auth.service";
import { setTimeout } from "timers";
import { BehaviorSubject } from "rxjs";

export enum ConnectionState {
  closed,      //закрыто
  established, //открыто
  inProgress   //открывается,возобновляется
};

@Injectable()
export class SignalRService /*implements OnDestroy*/ {
  // links
  /// https://docs.microsoft.com/ru-ru/aspnet/signalr/overview/guide-to-the-api/handling-connection-lifetime-events

  private hubConnection: HubConnection;
  private readonly hubUrl = environment.signalrHubUrl;
  private connectionStateNotices$ = new BehaviorSubject<ConnectionState>(ConnectionState.closed);
  // состояние соединения
  private readonly connectionState = this.connectionStateNotices$.asObservable(); 

  constructor(private authService: AuthenticationService) {
    this.createConnection();
    this.subscrForEvents();
    console.log("Новый экземпляр SignalR");
  }

  subscrForEvents() {
    this.hubConnection.onclose(() => {
      /*console.log("Повтор соединения...");
      this.startConnection();*/
      this.connectionClosed();
    });
    this.hubConnection.onreconnecting(() => this.connectionReconnecting());
    this.hubConnection.onreconnected(() => this.connectionEstablished());
  }

  getSignalRConnectionState() {
    return this.connectionState;
  }

  getHubConnection() {
    return this.hubConnection;
  }

  ////// *** Создание и управление соединением *** //////

  public createConnection() {
    let accessToken =
      JSON.parse(this.authService.getUserCredentials())['accessToken'];
    if (accessToken) {
      this.hubConnection = new SignalR.HubConnectionBuilder()
        //.configureLogging(SignalR.LogLevel.Trace)
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => accessToken,
          skipNegotiation: true,
          transport: SignalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect([0, 1, 2, 3])
        .build();
      //this.startConnection();
    }
    else {
      console.log("SR AccessToken не обнаружен - запускаю счетчик");
      setTimeout(() => { this.createConnection() }, 1000);
    }
  }

  public startConnection() {
    this.createConnection();
    this.hubConnection
      .start()
      .then(() => {
        this.connectionEstablished();
        console.log("Соединение открыто!");
        // setTimeout(() => { this.closeConnection(); }, 10000);
      })
      .catch(err => {
        console.log("Соединение не стартовало! " + err);
        setTimeout(() => { this.startConnection(); }, 1000);
      });
  }

  public closeConnection() {
    this.hubConnection
      .stop()
      .then(() => {
        this.connectionClosed();
        console.log('Соединение закрыто!');
      })
      .catch(err => {
        console.log('Не удалось закрыть соединение!');
        setTimeout(() => { this.closeConnection() }, 1000);
      });
  }

  ////// *** Состояние соединения *** //////

  connectionEstablished() {
    this.connectionStateNotices$.next(ConnectionState.established);
  }

  connectionClosed() {
    this.connectionStateNotices$.next(ConnectionState.closed);
  }

  connectionReconnecting() {
    this.connectionStateNotices$.next(ConnectionState.inProgress);
  }
}
