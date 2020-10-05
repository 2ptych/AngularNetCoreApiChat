import { NgModule } from "@angular/core";
import { RegisterComponent } from "./register.component";
import { Routes, RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { DragNDropDirective } from "../directives/dragndrop.directive";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { TokenInterceptorService } from "../services/token.interceptor";

const routes: Routes = [
  {
    path: '', component: RegisterComponent
  }
];

@NgModule({
  declarations: [
    RegisterComponent,
    DragNDropDirective,
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    RouterModule,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }
  ]
})
export class RegisterModule { }
