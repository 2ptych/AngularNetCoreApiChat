import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { AuthenticationService as AuthService } from "./auth.service";
import { Router } from "@angular/router";
import { catchError } from "rxjs/operators";
import { _throw as throwError } from 'rxjs/observable/throw';

@Injectable()
export class ErrorInterceptorService {

  constructor(public authService: AuthService, public router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(event => {
      if (event instanceof HttpErrorResponse) {
        console.log("Error Interceptor: ", event.message);
        if (event.status === 401) {
          //console.log("редирект на страницу авторизации...");
          this.router.navigateByUrl('/login');
          return throwError("ошибка 401: не авторизован");
        }
      }
    }));
  }
}
