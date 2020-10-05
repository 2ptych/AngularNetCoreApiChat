import { FormGroup } from "@angular/forms";

export function EqualPasswordValidator(
  password: string,
  comfirmPass: string
) {
  return (formGroup: FormGroup) => {
    const passwordCtrl = formGroup.controls[password];
    const confPasswordCtrl = formGroup.controls[comfirmPass];

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
