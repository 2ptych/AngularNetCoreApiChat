import { NgModule } from "@angular/core";
import { ChatComponent } from "./chat.component";
import { Routes, RouterModule } from "@angular/router";
import { AuthenticationService } from "../services/auth.service";
import { ChatListComponent } from "./chat-list/chat-list.component";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ChatPanelComponent } from "./chat-panel/chat-panel.component";
import { AngularResizedEventModule } from "angular-resize-event";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { TokenInterceptorService } from "../services/token.interceptor";
import { StateManagmentService } from "../services/state-managment.service";
import { WindowService } from "../services/window.service";
import { NameResolverService } from "../services/name-resolver.service";

const routes: Routes = [
  {
    path: '',
    component: ChatComponent
  }
];

@NgModule({
  declarations: [
    ChatListComponent,
    ChatPanelComponent,
    ChatComponent,
  ],
  providers: [
    AuthenticationService,
    StateManagmentService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    RouterModule,
    {
      provide: 'windowObject',
      useValue: window
    },
    WindowService,
    NameResolverService
  ],
  
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularResizedEventModule,
    RouterModule.forChild(routes)
  ]
})
export class ChatModule { }
