import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/user.service';
import { UserPage } from 'src/app/shared/types';

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

    constructor(private userService: UserService) { }

    public ngOnInit(): void {
        this.loadData();
    }
    
    public loadData(pageNumber: number = 0) {
        this.fetchingData = true;
        this.userService
            .loadUsers(pageNumber)
            .subscribe((res: UserPage) => {
                this.page = res;
                this.fetchingData = false;
            });
    }
}
