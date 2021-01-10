import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppComponent } from './app.component';
import { AuthenticationService as AuthService } from './services/auth.service';
import { AuthenticationGuardService as AuthGuard } from './services/auth.guard';
import { ExistEmailValidator } from './validators/existEmail.validator';
import { NotificationService } from './services/notification.service';
import { SignalRService } from './services/signalr.service';
import { NotificationComponent } from './notification/notification.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DragNDropDirective } from './directives/dragndrop.directive';
import { ErrorInterceptorService } from './services/error.interceptor.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const routes: Routes = [
    {
      path: 'chat',
      canActivate: [AuthGuard],
      loadChildren:
        () => import('../app/chat/chat.module').then(m => m.ChatModule)
    },
    {
      path: 'login',
      component: LoginComponent
      //loadChildren: () => import('../app/login/login.module').then(m => m.LoginModule)
    },
    {
      path: 'register',
      component: RegisterComponent
      //loadChildren: () => import('../app/register/register.module').then(m => m.RegisterModule) 
    },
    {
      path: '',
      redirectTo: 'chat',
      pathMatch: 'full'
    }
];

@NgModule({
  declarations: [
    AppComponent,
    NotificationComponent,
    LoginComponent,
    RegisterComponent,
    DragNDropDirective
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    MatTooltipModule,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
  ],
  providers: [
    RouterModule,
    AuthService,
    AuthGuard,
    HttpClientModule,
    ExistEmailValidator,
    NotificationService,
    SignalRService,
      /*{
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptorService,
        multi: true
      },*/
      {
        provide: HTTP_INTERCEPTORS,
        useClass: ErrorInterceptorService,
        multi: true
      }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
