import { NgModule } from "@angular/core";
import { LoginComponent } from "./login.component";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { TokenInterceptorService } from "../services/token.interceptor";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { AuthenticationService as AuthService  } from "../services/auth.service";
import { BrowserModule } from "@angular/platform-browser";
import { NotificationService } from "../services/notification.service";
import { AuthenticationGuardService } from "../services/auth.guard";

const routes: Routes = [
  {
    path: '', component: LoginComponent
  }
];

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    AuthService,
    AuthenticationGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    //ReactiveFormsModule,
    //NotificationService,
    HttpClientModule,
    //RouterModule
  ]
})
export class LoginModule { }
