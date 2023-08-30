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
        const url = '/api/1.0/users';
        const body = {
            username: this.username,
            password: this.password,
            email: this.email,
        };
        this.httpClient.post(url, body).subscribe();
    }

    private setDisabled(): void {
        this.disabled = this.password !== this.confirmPassword || (this.password.length + this.confirmPassword.length === 0);
    }
}
