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
}