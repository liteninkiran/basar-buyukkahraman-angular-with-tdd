import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {

    public disabled = true;
    public password = '';
    public confirmPassword = '';
    public username = '';
    public email = '';
    public apiProgress: boolean = false;
    public signUpSuccess = false;

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
        const url = '/api/1.0/users';
        const body = {
            username: this.username,
            password: this.password,
            email: this.email,
        };
        this.userService.signUp(body).subscribe((res) => {
            this.toggleApi();
            this.signUpSuccess = true;
        });
    }

    private setDisabled(): void {
        const inputConfig = {
            checks: [
                this.password === this.confirmPassword,
                this.password.length + this.confirmPassword.length > 0,
                !this.apiProgress,
            ],
            enabled: false,
        };
        const passingChecks = inputConfig.checks.filter(Boolean);
        inputConfig.enabled = passingChecks.length === inputConfig.checks.length;
        this.disabled = !inputConfig.enabled;
    }
}
