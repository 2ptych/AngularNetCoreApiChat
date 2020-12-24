import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoginModel } from '../models/login.model';
import { AuthenticationService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login-form',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginFormGroup: FormGroup;
  loginModel: LoginModel = new LoginModel();
  submitted: boolean = false;
  getResponse: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    //private noteService: NotificationService
  ) { }

  ngOnInit() {
    this.loginFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // подписка на событие
    /*this.sharedData.unauthLoginError.subscribe((loginSuccess) => {
      this.addUnautorizedErrorInState();
      console.log("Login Result ", loginSuccess);
    });*/
  }
   
  login() {
    if (this.loginModel.email && this.loginModel.password) {
      this.authService.login(this.loginModel)
      .pipe(
        timeout(3000),
        catchError((error) => {
          // пробрасываем ошибку до свича
          return throwError(408);
        })).subscribe(response => {
        console.log('получен код ответа ', response);
        this.router.navigateByUrl('/chat');
      }, error => {
        switch(error){
          case 401: {
            this.addUnautorizedErrorInState();
            break;
          }
          case 408: {
            this.handleTimeout();
            break;
          }
        }
          console.log('получен код ошибки ', error);
          this.submitted = false;
          this.getResponse = true;
      });
    }
  }

  handleTimeout(){
    console.log("Timeout");
    this.passwordControl.setErrors({ timeout: true });
  }

  onSubmit() {
    this.submitted = true;
    this.getResponse = false;
    this.loginModel.email = this.loginFormGroup.get("email").value as string;
    this.loginModel.password = this.loginFormGroup.get("password").value as string;
    this.login();
    this.loginFormGroup.reset();
  }

  addUnautorizedErrorInState() {
    this.passwordControl.setErrors({ unauthorized: true });
    //alert("401");
  }

  getValidationErrors(state: any) {
    let messages: string[] = [];
    if (state.errors) {
      for (let error in state.errors) {
        switch (error) {
          case "unauthorized":
            messages.push("Неверный логин или пароль");
            break;
          case "timeout":
              messages.push("Сервер не отвечает");
              break;
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
