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

    constructor() { }

    public ngOnInit(): void {
    }

    public onChangePassword(event: InputEvent): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        this.password = target.value;
        this.setDisabled();
    }

    public onChangeConfirmPassword(event: InputEvent): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        this.confirmPassword = target.value;
        this.setDisabled();
    }

    private setDisabled(): void {
        this.disabled = this.password !== this.confirmPassword || (this.password.length + this.confirmPassword.length === 0);
    }
}
