import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';
import { AbstractControl, AbstractControlOptions, FormControl, FormGroup, Validators } from '@angular/forms';
import { passwordMatchValidator } from './password-match.validator';
import { UniqueEmailValidator } from './unique-email.validator';
import { HttpErrorResponse } from '@angular/common/http';

interface IValidatorOptions {
    username: AbstractControlOptions;
    email: AbstractControlOptions;
    password: AbstractControlOptions;
    form: AbstractControlOptions;
}

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {

    public disabled = true;
    public apiProgress: boolean = false;
    public signUpSuccess = false;
    public options: IValidatorOptions = {
        username: {
            validators: [
                Validators.required,
                Validators.minLength(4),
            ],
        },
        email: {
            validators: [
                Validators.required,
                Validators.email,
            ],
            asyncValidators: [
                this.uniqueEmailValidator.validate.bind(this.uniqueEmailValidator),
            ],
            updateOn: 'blur',
        },
        password: {
            validators: [
                Validators.required,
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
            ],
        },
        form: {
            validators: passwordMatchValidator,
        },
    }
    public form = new FormGroup({
        username: new FormControl('', this.options.username),
        email: new FormControl('', this.options.email),
        password: new FormControl('', this.options.password),
        confirmPassword: new FormControl(''),
    }, this.options.form);

    get usernameError(): string | undefined {
        const field: AbstractControl = this.form.get('username') as AbstractControl;
        const hasErrors: boolean = (field.errors && (field.touched || field.dirty)) as boolean;
        return hasErrors
            ? field.errors && field.errors['required']
                ? 'Username is required'
                : 'Username must be at least 4 characters long'
            : undefined;
    }

    get emailError() {
        const field = this.form.get('email');
        if ((field?.errors && (field?.touched || field?.dirty))) {
            if (field.errors['required']) {
                return 'Email is required';
            } else if (field.errors['email']) {
                return 'Invalid email address';
            } else if (field.errors['uniqueEmail']) {
                return 'Email in use';
            } else if (field.errors['backend']) {
                return field.errors['backend'];
            }
        }
        return;
    }

    get passwordError(): string | undefined {
        const field: AbstractControl = this.form.get('password') as AbstractControl;
        const hasErrors: boolean = (field.errors && (field.touched || field.dirty)) as boolean;
        return hasErrors
            ? field.errors && field.errors['required']
                ? 'Password is required'
                : 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'
            : undefined;
    }

    get confirmPasswordError(): string | undefined {
        const form: FormGroup = this.form;
        const hasErrors: boolean = (form.errors && (form.touched || form.dirty)) as boolean;
        return hasErrors
            ? form.errors && form.errors['passwordMatch']
                ? 'Passwords do not match'
                : undefined
            : undefined;
    }

    constructor(
        private userService: UserService,
        private uniqueEmailValidator: UniqueEmailValidator,
    ) { }

    public ngOnInit(): void {
    }

    public onClickSignUp() {
        this.toggleApi();
        this.signUp();
    }

    public onChange() {
        this.setDisabled();
    }

    private toggleApi(): void {
        this.apiProgress = !this.apiProgress;
        this.setDisabled();
    }

    private signUp(): void {
        const body: any = this.form.value;
        delete body.confirmPassword;
        this.userService.signUp(body).subscribe({
            next: (): void => {
                this.toggleApi();
                this.signUpSuccess = true;
            },
            error: (httpError: HttpErrorResponse): void => {
                const emailValidationErrorMessage = httpError.error.validationErrors.email
                this.form.get('email')?.setErrors({ backend: emailValidationErrorMessage });
            }
        });
    }

    private setDisabled(): void {
        const password = this.form.get('password')?.value;
        const confirmPassword = this.form.get('confirmPassword')?.value;
        const inputConfig = {
            checks: [
                password === confirmPassword,
                password.length + confirmPassword.length > 0,
                !this.apiProgress,
            ],
            enabled: false,
        };
        const passingChecks = inputConfig.checks.filter(Boolean);
        inputConfig.enabled = passingChecks.length === inputConfig.checks.length;
        this.disabled = !inputConfig.enabled;
    }
}
