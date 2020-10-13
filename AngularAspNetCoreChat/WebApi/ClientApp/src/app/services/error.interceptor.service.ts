import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { AuthenticationService as AuthService } from "./auth.service";
import { tap } from "rxjs/operators";
import { NotificationService } from './notification.service';

@Injectable()
export class ErrorInterceptorService {

  constructor(private noteService: NotificationService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('Server response: ', event.statusText);
        }
      },
        error => {
          if (error instanceof HttpErrorResponse) {
            console.log('Error response', error);
            this.noteService.error('Внутренняя ошибка сервера ' + error);
            switch (error.status) {
              case 500: {

                break;
              }
            }
          }
        })
      //  catchError(event => {
      //  if (event instanceof HttpErrorResponse) {
      //    console.log("Error Interceptor: ", event.message);
      //    if (event.status === 401) {
      //      //console.log("редирект на страницу авторизации...");
      //      this.router.navigateByUrl('/login');
      //      return throwError("ошибка 401: не авторизован");
      //    }
      //  }
      //})
    );
  }
}
