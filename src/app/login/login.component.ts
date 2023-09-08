import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [ ],
})
export class LoginComponent implements OnInit {

    public email = '';
    public password = '';
    public error = '';
    public apiProgress = false;

    constructor(private userService: UserService) { }

    public ngOnInit(): void {
    }

    public isDisabled(): boolean {
        return !this.email || !this.password;
    }

    public onClickLogin(): void {
        this.apiProgress = true;
        this.userService
            .authenticate(this.email, this.password)
            .subscribe({
                next: () => {
                    this.apiProgress = false;
                    console.log('Logged in');
                },
                error: (err: HttpErrorResponse) => {
                    this.error = err.error.message;
                    this.apiProgress = false;
                }
            });
    }

}
