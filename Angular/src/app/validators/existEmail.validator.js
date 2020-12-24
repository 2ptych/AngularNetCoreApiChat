"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ExistEmailValidator(control, httpClient) {
    var response;
    var email = control.value;
    //const request$: Observable<any> = httpClient.post<any>(environment.validationEmailApiUrl, email).subscribe(value => response = value);
    console.log(email);
    if (response)
        return { emailExist: true };
    return null;
}
exports.ExistEmailValidator = ExistEmailValidator;
//# sourceMappingURL=existEmail.validator.js.map