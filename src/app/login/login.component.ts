import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../core/user.service';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../core/authentication.service';
import { User } from '../shared/types';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [ ],
})
export class LoginComponent implements OnInit {

    @ViewChild('emailInput') emailInput!: FormControl;
    @ViewChild('passwordInput') passwordInput!: FormControl;

    public email = '';
    public password = '';
    public error = '';
    public apiProgress = false;

    constructor(
        private userService: UserService,
        private router: Router,
        private authService: AuthenticationService,
    ) { }

    public ngOnInit(): void {
    }

    public isDisabled(): boolean {
        return !this.email
            || !this.password 
            || this.isInvalid(this.emailInput)
            || this.isInvalid(this.passwordInput);
    }

    public onClickLogin(): void {
        this.apiProgress = true;
        this.userService
            .authenticate(this.email, this.password)
            .subscribe({
                next: (body: any) => {
                    this.router.navigate(['/']);
                    this.authService.setLoggedInUser(body as User);
                },
                error: (err: HttpErrorResponse) => {
                    this.error = err.error.message;
                    this.apiProgress = false;
                }
            });
    }

    public isInvalid(field: FormControl): boolean {
        const { invalid, dirty, touched } = field;
        return invalid && (dirty || touched);
    }

    public onChange(): void {
        this.error = '';
    }
}
