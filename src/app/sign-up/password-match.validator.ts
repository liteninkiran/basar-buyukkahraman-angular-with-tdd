import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password: AbstractControl = control.get('password') as AbstractControl;
    const confirmPassword: AbstractControl = control.get('confirmPassword') as AbstractControl;
    if (password.value === confirmPassword.value) {
        return null;
    }
    return {
        passwordMatch: true,
    }
}
