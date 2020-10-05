import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginModel } from '../models/login.model';
import { AuthenticationService } from '../services/auth.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { HttpErrorResponse, HttpResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import { _throw as throwError } from 'rxjs/observable/throw';
import { NotificationService } from '../services/notification.service';
import { TokenInterceptorService } from '../services/token.interceptor';

@Component({
  selector: 'app-login-form',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginFormGroup: FormGroup;
  loginModel: LoginModel = new LoginModel();
  submitted: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    //private router: Router,
    //private noteService: NotificationService
  ) { }

  ngOnInit() {
    this.loginFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    //this.loginFormGroup.get("password").valueChanges.subscribe(value => console.log(value));
  }

  login() {
    if (this.loginModel.email && this.loginModel.password) {
      this.authService.login(this.loginModel).subscribe();
    }
  }

  onSubmit() {
    this.submitted = true;
    
    this.loginModel.email = this.loginFormGroup.get("email").value as string;
    this.loginModel.password = this.loginFormGroup.get("password").value as string;
    this.login();
    console.log('Submitted');
    this.loginFormGroup.reset();
  }

  getValidationErrors(state: any) {
    let messages: string[] = [];
    if (state.errors) {
      for (let error in state.errors) {
        switch (error) {
          case "required":
            messages.push("Необходимо заполнить поле");
            break;
          case "email":
            messages.push("Укажите действительный адрес");
            break;
        }
      }
    }
    return messages[0] as string;
  }

  get emailControl() {
    return this.loginFormGroup.get("email");
  }

  get passwordControl() {
    return this.loginFormGroup.get("password");
  }
}
