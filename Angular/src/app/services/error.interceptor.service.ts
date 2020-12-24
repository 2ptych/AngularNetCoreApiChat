import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse, HttpInterceptor } from "@angular/common/http";
import { AuthenticationService as AuthService } from "./auth.service";
import { catchError, timeout } from "rxjs/operators";
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';
import { HttpStates } from '../models/http-states.enum';

@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {

  constructor(private noteService: NotificationService,
    private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request)
      .pipe(
        catchError((error) => {
          if (error instanceof HttpErrorResponse)
            switch (error.status) {
              case HttpStates.Unauthorized: {
                return throwError(error.status);
              };
              case HttpStates.InternalServerError: {
                console.log("Internal Server Error");
                this.noteService.error("Внутренняя ошибка сервера");
              };
              case HttpStates.Forbidden: {
                console.log("Redirect to login page");
                this.router.navigateByUrl('/login');
              } 
            }
      }));
  }
}
