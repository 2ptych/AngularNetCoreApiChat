import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators, FormGroup, FormControl, AbstractControl } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthenticationService } from "../services/auth.service";
import { RegisterModel } from "../models/register.model";
import { EqualPasswordValidator } from "../validators/comparePasswords.validator";
import {
  filter, map, catchError,
  switchMap, debounceTime, distinctUntilChanged
} from 'rxjs/operators';
import { environment } from "../../environments/environment";
import { HttpClient, HttpErrorResponse, HttpEventType, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { ExistEmailValidator } from "../validators/existEmail.validator";
import { NotificationService } from "../services/notification.service";

@Component({
  selector: 'app-register-form',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  uploadFormGroup: FormGroup;
  registerFormGroup: FormGroup;
  registerModel: RegisterModel = new RegisterModel();
  submitted: boolean = false;
  passwordMinLength: number = 9;
  private readonly uploadUrl = environment.uploadPhotoApiUrl;
  private readonly registerUrl = environment.registerApiUrl;
  upFile: any;
  formData: FormData;
  localUserPicPath: any = '';

  constructor(private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private httpClient: HttpClient,
    private existEmailValidator: ExistEmailValidator,
    private noteService: NotificationService) {
    //this.noteService.success("Успешная регистрация!");
    this.uploadFormGroup = this.formBuilder.group({
      file: ['']
    });
  }

  ngOnInit() {
    this.registerFormGroup = this.formBuilder.group(
      {
        photo: ['',
          this.photoRequiredValidator
        ],
        email: ['',
          [
            Validators.required,
            Validators.email
          ]/*,
           * вместо валидатора здесь повесим валидатор
           * на событие valueChanges соответствующего
           * input, так как иначе не представляется возможным
           * применить distinctUntilChanged() и debounceTime()
          this.validateEmailExist.bind(this)*/
        ],
        name: ['',
          [
            Validators.required,
            Validators.max(20)
          ]
        ],
        familyName: ['',
          [
            Validators.required,
            Validators.max(20)
          ]
        ],
        password: ['',
          [Validators.required,
            Validators.minLength(this.passwordMinLength)
          ]
        ],
        confirmPassword: ['',
          [
            Validators.required,
            Validators.minLength(this.passwordMinLength)
          ]
        ]
      },
      {
        validator: EqualPasswordValidator("password", "confirmPassword")
      });
    // Асинхронный валидатор уже использующегося email
    this.emailControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(100)
      ).subscribe(value => {
        if (this.emailControl.errors === null)
          this.validateEmailExist(value)
            .subscribe(value => {
              if (value === true) this.emailControl.setErrors({ userEmailExist: true});
            });
      });
  }

  validateEmailExist(/*control: AbstractControl*/controlValue: string) {
    return of(controlValue)
      .pipe(
        /*distinctUntilChanged(),
        debounceTime(2000),*/
        switchMap(input => {
          return this.existEmailValidator.httpRequest(input);
        })
    );
  }

  // валидатор input для фото
  photoRequiredValidator(control: FormControl) {
    if (control.value === "") {
      return {"photoRequired": true}
    }
    return null;
  }

  onSubmit() {
    this.register();
  }

  register() {

    // проверка валидности формы
    if (this.registerFormGroup.invalid) {
      console.log('Ошибка в модели');
      return;
    }

    this.registerModel.photo = this.photoControl.value as string;
    this.registerModel.email = this.emailControl.value as string;
    this.registerModel.name = this.nameControl.value as string;
    this.registerModel.familyName = this.familyNameControl.value as string;
    this.registerModel.password = this.passwordControl.value as string;
    this.registerModel.confirmPassword = this.confirmPasswordControl.value as string;

    this.httpClient.post<any>(this.registerUrl, this.registerModel)
      .pipe(map(value => value['registration']))
      .subscribe(result => {
        if (result === 'success') {
          this.router.navigateByUrl('/login');
          // отобразить сообщение об успехе регистрации
          this.noteService.success("Успешная регистрация!");

        }
        if (result === 'fail') {
          alert("Регистрация не удалась!");
          this.noteService.error("Регистрация не удалась!");
        }
      });
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
          case "mismatch":
            messages.push("Пароли не совпадают");
            break;
          case "minlength":
            messages.push(`Пароль должен содержать не менее ${this.passwordMinLength} символов`);
            break;
          case "userEmailExist":
            messages.push('Такой email уже используется');
            break;
          case "photoRequired":
            messages.push('Загрузите фото профиля');
            break;
        }
      }
    }
    return messages[0] as string;
  }

  onFileDropped($event) {
    this.prepareFile($event);
  }

  fileHandler(files: any /*File[]*/) {
    this.prepareFile(files);
    var reader = new FileReader()
    this.localUserPicPath = reader.readAsDataURL(files[0]);
  }

  prepareFile(files: any) {
    //console.log("файлы: ", files);
    this.formData = new FormData();
    for (let file of files) {
      this.formData.append("attach", file);
      console.log("локальный путь к файлу:", this.localUserPicPath);
    }
    this.fileUploader(this.formData);
  }

  fileUploader(formData: FormData) {
    let progressBar = this.getProgressBar();
    progressBar.hidden = false;
    console.log(formData);
    let header = new HttpHeaders();
    header.set('enctype', 'multipart/form-data');
    return this.httpClient.post<any>(this.uploadUrl,
      formData,
      {
        headers: header,
        reportProgress: true,
        observe: "events"
      })
      .pipe()
      .subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log("Request sent");
            break;
          case HttpEventType.ResponseHeader:
            //this.photoControl.setErrors({ "photoRequired": true });
            console.log("Response header recieved", event.statusText);
            break;
          case HttpEventType.UploadProgress:
            this.setUploadProgress(event.loaded, event.total);
            break;
          case HttpEventType.Response:
            this.getPhotoName(event.body);
            break;
        }
      });
  }

  public getProgressBar() {
    return document.getElementById('progress-bar-js') as HTMLProgressElement;
  }

  public setUploadProgress(loaded: number, total: number) {
    let progressBar = this.getProgressBar();
    //progressBar.hidden = false;
    progressBar.value = Math.round(total / loaded * 100);
  }

  public hidePhotoUploadForm() {
    let dragForm = document.getElementById('drag-drop-area-js') as HTMLElement;
    dragForm.classList.add('hide');
  }

  public showPhotoUploadForm() {
    let dragForm = document.getElementById('drag-drop-area-js') as HTMLElement;
    dragForm.classList.remove('hide');
  }

  // получает имя файла с сервера
  getPhotoName(response) {
    if (response) {
      console.log(response['message']);
      this.photoControl.setValue(response['message']);
      let image = document.getElementById('user-photo-js') as HTMLImageElement;
      image.src = "/images/" + response['message'];
      this.hidePhotoUploadForm();
      let progressBar = this.getProgressBar();
      progressBar.value = 0;
      progressBar.hidden = true;
    }
  }

  public openFileWindow() {
    let fileInput = document.getElementById('file-input-js') as HTMLInputElement;
    fileInput.click();
  }

  get photoControl() {
    return this.registerFormGroup.get("photo");
  }

  get emailControl() {
    return this.registerFormGroup.get("email");
  }

  get nameControl() {
    return this.registerFormGroup.get("name");
  }

  get familyNameControl() {
    return this.registerFormGroup.get("familyName");
  }

  get passwordControl() {
    return this.registerFormGroup.get("password");
  }

  get confirmPasswordControl() {
    return this.registerFormGroup.get("confirmPassword");
  }
}
