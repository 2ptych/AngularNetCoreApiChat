"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function EqualPasswordValidator(password, comfirmPass) {
    return function (formGroup) {
        var passwordCtrl = formGroup.controls[password];
        var confPasswordCtrl = formGroup.controls[comfirmPass];
        // если пароль поля password валиден и нет ошибки mismatch
        if (passwordCtrl.errors && confPasswordCtrl.errors.mismatch) {
            return;
        }
        if (passwordCtrl.value !== confPasswordCtrl.value) {
            confPasswordCtrl.setErrors({ mismatch: true });
        }
        /*else {
          confPasswordCtrl.setErrors(null);
        }*/
    };
}
exports.EqualPasswordValidator = EqualPasswordValidator;
//# sourceMappingURL=comparePasswords.validator.js.map