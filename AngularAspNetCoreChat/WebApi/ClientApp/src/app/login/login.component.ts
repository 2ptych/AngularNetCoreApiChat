import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoginModel } from '../models/login.model';
import { AuthenticationService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpStates } from '../models/http-states.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginFormGroup: FormGroup;
  loginModel: LoginModel = new LoginModel();
  submitted: boolean = false;

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

  ngOnDestroy() {
    
  }

   
  login() {
    if (this.loginModel.email && this.loginModel.password) {
      this.authService.login(this.loginModel).subscribe(response => {
        console.log('получен код ответа ', response);
        this.router.navigateByUrl('/chat');
      }, error => {
          console.log('получен код ошибки ', error);
          this.addUnautorizedErrorInState();
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    
    this.loginModel.email = this.loginFormGroup.get("email").value as string;
    this.loginModel.password = this.loginFormGroup.get("password").value as string;
    this.login();
    this.loginFormGroup.reset();
  }

  addUnautorizedErrorInState() {
    this.passwordControl.setErrors({ unauthorized: true });
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
          case "unauthorized":
            messages.push("Неверный логин или пароль");
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
