import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

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

    constructor(private httpClient: HttpClient) { }

    public ngOnInit(): void {
    }

    public onChangePassword(event: InputEvent): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        this.password = target.value;
        this.setDisabled();
    }

    public onChangeConfirmPassword(event: InputEvent): void {
        this.confirmPassword = (event.target as HTMLInputElement).value;
        this.setDisabled();
    }

    public onChangeUsername(event: InputEvent) {
        this.username = (event.target as HTMLInputElement).value;
    }

    public onChangeEmail(event: InputEvent) {
        this.email = (event.target as HTMLInputElement).value;
    }

    public onClickSignUp() {
        this.toggleApi();
        this.signUp();
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
        this.httpClient
            .post(url, body)
            .subscribe(() => {
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
