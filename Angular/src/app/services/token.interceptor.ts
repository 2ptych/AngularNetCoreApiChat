import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthenticationService as AuthService } from "./auth.service";
import { Router } from "@angular/router";

@Injectable()
export class TokenInterceptorService implements HttpInterceptor{
  notToUseUrls: Array<string>;

  constructor(public authService: AuthService, public router: Router) {
    // исключаемые из работы интерсептора url'ы
    this.notToUseUrls = ['register'];
  } 

  intercept(request: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    let token = this.getToken();
    if (this.isValidRequestForInterceptor(request.url)) {
      request = request.clone(
        {
          setHeaders:
          {
            Authorization: `Bearer ${token}`
          }
        });
    } //else alert('token interceptor не отработал!');
    return next.handle(request);
  }

  private isValidRequestForInterceptor(requestUrl: string): boolean {
    requestUrl = requestUrl.toLowerCase();
    for (var str in this.notToUseUrls) {
      if (str.includes(requestUrl)) return false;
    }
    return true;
  }

  private getToken(): string {
    return this.authService.getAccesTokenString();
  }
}
