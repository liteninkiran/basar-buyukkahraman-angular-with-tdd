import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/user.service';
import { UserPage } from 'src/app/shared/types';
import { Router } from '@angular/router';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {

    public fetchingData = false;
    public page: UserPage = {
        content: [],
        page: 0,
        size: 3,
        totalPages: 0,
    }

    get hasNextPage(): boolean {
        const { page, totalPages } = this.page;
        return totalPages > page + 1;
    }

    get hasPreviousPage(): boolean {
        return this.page.page !== 0;
    }

    constructor(
        private userService: UserService,
        private router: Router,
    ) { }

    public ngOnInit(): void {
        this.loadData();
    }
    
    public loadData(pageNumber: number = 0): void {
        this.fetchingData = true;
        this.userService
            .loadUsers(pageNumber)
            .subscribe((res: UserPage) => {
                this.page = res;
                this.fetchingData = false;
            });
    }

    public navigate(id: number): void {
        this.router.navigate(['/user/', id]);
    }
}
