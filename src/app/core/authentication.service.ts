import { Injectable } from '@angular/core';
import { LoggedInUser, User } from '../shared/types';

const emptyUser = {
    id: 0,
    username: '',
    email: '',
    isLoggedIn: false,
}

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    public loggedInUser: LoggedInUser = emptyUser;

    constructor() {
        const storedData = localStorage.getItem('auth');
        if (storedData) {
            try {
                this.loggedInUser = JSON.parse(storedData);
            } catch (err) {

            }
        }
    }

    public setLoggedInUser(user: User): void {
        this.loggedInUser = { ...user, isLoggedIn: true }
        localStorage.setItem('auth', JSON.stringify(this.loggedInUser));
    }

    public logout(): void {
        this.loggedInUser = emptyUser;
        localStorage.removeItem('auth');
    }
}
