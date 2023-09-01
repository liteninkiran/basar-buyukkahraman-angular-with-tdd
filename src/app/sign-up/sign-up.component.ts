import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {

    public disabled = true;
    public apiProgress: boolean = false;
    public signUpSuccess = false;
    public form = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.minLength(4)]),
        email: new FormControl(''),
        password: new FormControl(''),
        confirmPassword: new FormControl(''),
    });

    get usernameError(): string | undefined {
        const field = this.form.get('username');
        const hasErrors = field?.errors && (field?.touched || field?.dirty);
        return hasErrors
            ? field.errors['required']
                ? 'Username is required'
                : 'Username must be at least 4 characters long'
            : undefined;
    }

    constructor(private userService: UserService) { }

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
        this.userService.signUp(body).subscribe((res) => {
            this.toggleApi();
            this.signUpSuccess = true;
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
