import { Injectable } from '@angular/core';
import { LoggedInUser, User } from '../shared/types';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    public loggedInUser: LoggedInUser = {
        id: 0,
        username: '',
        email: '',
        isLoggedIn: false,
    }

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
}
