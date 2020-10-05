import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginModel } from '../models/login.model';
import { _throw as throwError } from 'rxjs/observable/throw';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationService {

  // название поля (ключа) для хранения токена в локальном хранилище
  private readonly AccessTokenField = "user_credentials";
  private readonly AccessTokenExpirationField = "exp";
  public readonly AccessTokenFieldKey = "accessToken";
  private readonly AuthenticationUrl = `${environment.authApiUrl}`;

  constructor(private http: HttpClient,
    private noteService: NotificationService,
    private router: Router) {
  }

  public login(loginModel: LoginModel) {
    console.log('начинается выполнение post-запроса');
    this.logout();
    return this.http.post<any>(this.AuthenticationUrl, loginModel)
      .pipe(map(response => {
        this.setUserCredentials(JSON.stringify(response));
        console.log('Успешная авторизация');
        //console.log('Ответ сервера: ', response);
        this.noteService.success("Успешная авторизация");
        this.router.navigateByUrl('chat');
      }),
        catchError(event => {
          if ((event instanceof HttpErrorResponse) && (event.status === 401)) {
            this.noteService.error("Неверный логин или пароль");
            console.log("401: ", event);
            return throwError("Авторизация не удалась");
          }
      }));
  }

  public logout() {
    this.removeAccessToken();
  }

  public isAuthenticated(): boolean {
    if (this.isUserCredentialsSet && !this.isAccessTokenExpired()) {
      console.log("аутентифицирован");
      return true;
    }
    else {
      console.log("не аутентифицирован");
      return false;
    }
  }

  /////////////////////////////////////////////////////////////

  public getSignedUserJsonClaims() {
    if (this.isUserCredentialsSet()) {
      let userCredits = this.getUserCredentials();
      userCredits = this.stringToJson(userCredits)[this.AccessTokenFieldKey];
      userCredits = this.getTokenPayload(userCredits);
      userCredits = this.base64ToString(userCredits);
      return this.stringToJson(userCredits);
    }
    return null;
  }

  private isAccessTokenExpired(): boolean {
    if (this.isUserCredentialsSet()) {
      var expirationDate = this.getExpirationFromAccessToken();
      //console.log("timestamp из токена ", expirationDate);
      var nowDate = Math.floor(Date.now() / 1000);
      //console.log("текущий timestamp ", nowDate);
      if (expirationDate > nowDate)  {
        console.log("токен не истек");
        return false;
      }
    }
    console.log("токен истек");
    return true;
  }

  private isUserCredentialsSet(): boolean {
    //console.log('isUserCredentialsSet start');
    var credentials = this.getUserCredentials();
    if (credentials) return true;
    else return false;
  }

  private setUserCredentials(credentials: string) {
    //console.log("isAccessTokenExpired start");
    this.setAccessToken(credentials);
  }

  public getUserCredentials(): string {
    //console.log("getUserCredentials start");
    return this.getAccessToken();
  }
  public getAccesTokenString(): string {
    let credentials: string = this.getUserCredentials();
    if (credentials) {
      let accessToken: string = this.stringToJson(credentials);
      //console.log(accessToken[this.AccessTokenFieldKey]);
      return accessToken[this.AccessTokenFieldKey];
    }
    else return null;
  }
  public getExpirationFromAccessToken(): number {
    //console.log("getExpirationFromAccessToken start");
    // получаю токен
    var token = this.getAccessToken();
    //console.log(`${token}`);
    // преобразую в JSON
    token = this.stringToJson(token);
    // получаю accessToken
    token = token[this.AccessTokenFieldKey];
    //console.log(`${token}`);
    // убираю хедер и hmac-подпись
    token = this.getTokenPayload(token);
    //console.log(`${token}`);
    // раскодирую payload-часть из base64 в строку
    token = this.base64ToString(token);
    //console.log(`${token}`);
    // снова преобразую в JSON
    token = this.stringToJson(token);
    // наконец достаю utc timestamp 
    token = token[this.AccessTokenExpirationField];
    //console.log(`${token}`);
    //console.log("getExpirationFromAccessToken end");
    return parseInt(token);
  }

  getTokenPayload(token: string): string {
    const startChar = 37; // начало части payload
    const endChar = 44; // hmacsha256
    token = token.slice(startChar, token.length - endChar);
    return token;
  }

  base64ToString(base64String: string): string {
    return atob(base64String);
  }

  stringToJson(str: string) {
    return JSON.parse(str);
  }

  // получение токена
  public getAccessToken(): string {
    const token = localStorage.getItem(this.AccessTokenField);
    return token; 
  }

  // установка токена
  private setAccessToken(accessToken: string) {
    localStorage.setItem(this.AccessTokenField, accessToken);
  }

  // удаление токена
  private removeAccessToken() {
    localStorage.removeItem(this.AccessTokenField);
  }
}
