import { Injectable, OnInit, OnDestroy } from "@angular/core";
import * as SignalR from "@microsoft/signalr";
import { environment } from "../../environments/environment";
import { AuthenticationService } from "./auth.service";
import { BehaviorSubject, Observable } from "rxjs";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";

@Injectable()
export class SignalRService /*implements OnDestroy*/ {
  // links
  /// https://docs.microsoft.com/ru-ru/aspnet/signalr/overview/guide-to-the-api/handling-connection-lifetime-events

  private hubConnection: HubConnection;
  private readonly hubUrl = environment.signalrHubUrl;
  private connectionStateBS: BehaviorSubject<HubConnectionState>;
  // состояние соединения
  private connectionState: Observable<HubConnectionState>;

  constructor(private authService: AuthenticationService) {
    this.createConnection();
    //this.subscrForEvents();
    //console.log("Новый экземпляр SignalR");
  }

  /*subscrForEvents() {
    this.hubConnection.onclose(() => {
      //console.log("Повтор соединения...");
      //this.startConnection();
      this.connectionClosed();
    });
    this.hubConnection.onreconnecting(() => this.connectionReconnecting());
    this.hubConnection.onreconnected(() => this.connectionEstablished());
  }*/

  getSignalRConnectionState() {
    return this.connectionState;
  }

  getHubConnection() {
    return this.hubConnection;
  }

  ////// *** Создание и управление соединением *** //////

  private createConnection() {
    let accessToken =
      JSON.parse(this.authService.getUserCredentials())['accessToken'];
    if (accessToken) {
      this.hubConnection = new SignalR.HubConnectionBuilder()
        //.configureLogging(SignalR.LogLevel.Trace)
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => accessToken,
          //skipNegotiation: true,
          //transport: SignalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect([0, 1, 2, 3])
        .build();
      // настройка для отображения состояния соединения
      this.stateMonitorSetup();
    }
    else {
      console.log("SR AccessToken не обнаружен - запускаю счетчик");
      setTimeout(() => { this.createConnection() }, 1000);
    }
  }

  private stateMonitorSetup(){
    this.connectionStateBS = new BehaviorSubject<HubConnectionState>(this.hubConnection.state);
    this.connectionState = this.connectionStateBS.asObservable();
  }

  public startConnection() {
    this.createConnection();
    this.hubConnection
      .start()
      .then(() => {
        //this.connectionEstablished();
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
        //this.connectionClosed();

        console.log('Соединение закрыто!');
      })
      .catch(err => {
        console.log('Не удалось закрыть соединение!');
        setTimeout(() => { this.closeConnection() }, 1000);
      });
  }

}
