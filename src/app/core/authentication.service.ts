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

    constructor() { }

    public setLoggedInUser(user: User): void {
        this.loggedInUser = { ...user, isLoggedIn: true }
    }
}
