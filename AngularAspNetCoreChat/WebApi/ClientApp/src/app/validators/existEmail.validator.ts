import { AbstractControl } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from '../../environments/environment';
import { Injectable } from "@angular/core";
import { switchMap } from "rxjs/operator/switchMap";
import { map, debounceTime, distinctUntilChanged } from "rxjs/operators";
//import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";
//import { debounceTime } from "rxjs/operator/debounceTime";

@Injectable()
export class ExistEmailValidator {

  constructor(private httpClient: HttpClient) { }

  public httpRequest(email) {
    let formData = { 'email': `${email}` }
    return this.httpClient.post<any>(environment.validationEmailApiUrl, formData)
      .pipe(
        map((value) => {
          return value['userEmailExist'];
        })
      );
  }
}
