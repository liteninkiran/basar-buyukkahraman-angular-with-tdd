import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface IBody {
    username: string,
    email: string,
    password: string,
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private httpClient: HttpClient) { }

    public signUp(body: IBody): Observable<any> {
        return this.httpClient.post('/api/1.0/users', body);
    }

    public isEmailTaken(value: string): Observable<any> {
        return this.httpClient.post('/api/1.0/user/email', { email: value });
    }

    public activate(token: string): Observable<any> {
        return this.httpClient.post('/api/1.0/users/token/' + token, {});
    }

    public loadUsers(page: number = 0): Observable<any> {
        return this.httpClient.get('/api/1.0/users', {
            params: { size: 3, page },
        });
    }

    public getUserById(id: string): Observable<any> {
        return this.httpClient.get('/api/1.0/users/' + id);
    }

    public authenticate(email: string, password: string): Observable<any> {
        return this.httpClient.post('/api/1.0/auth', { email, password });
    }
}
