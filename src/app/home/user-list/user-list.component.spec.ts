import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';

export const getPage = (page: number, size: number) => {
    let start = page * size;
    let end = start + size;
    return ({
        content: users.slice(start, end),
        page,
        size,
        totalPages: Math.ceil(users.length / size)
    });
}

const users = [
    { id: 1, username: 'user1', email: 'user1@mail.com' },
    { id: 2, username: 'user2', email: 'user2@mail.com' },
    { id: 3, username: 'user3', email: 'user3@mail.com' },
    { id: 4, username: 'user4', email: 'user4@mail.com' },
    { id: 5, username: 'user5', email: 'user5@mail.com' },
    { id: 6, username: 'user6', email: 'user6@mail.com' },
    { id: 7, username: 'user7', email: 'user7@mail.com' },
];

const parsePageParams = (request: TestRequest) => {
    let size = Number.parseInt(request.request.params.get('size')!);
    let page = Number.parseInt(request.request.params.get('page')!);
    if (Number.isNaN(size)) { size = 5; }
    if (Number.isNaN(page)) { page = 0; }
    return ({ size, page });
}

describe('UserListComponent', (): void => {
    let component: UserListComponent;
    let fixture: ComponentFixture<UserListComponent>;
    let httpTestingController: HttpTestingController;

    const selectors = {
        nextButton: 'button[data-testid="next-button"]',
        prevButton: 'button[data-testid="previous-button"]',
    }

    beforeEach(async (): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [UserListComponent],
            imports: [HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach((): void => {
        fixture = TestBed.createComponent(UserListComponent);
        httpTestingController = TestBed.inject(HttpTestingController);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Displays three users in a list', (): void => {
        const request = httpTestingController.expectOne((): boolean => true);
        const { page, size } = parsePageParams(request);
        request.flush(getPage(page, size));
        fixture.detectChanges();
        const listItems = fixture.nativeElement.querySelectorAll('li');
        expect(listItems.length).toBe(3);
    });

    it('Sends size param as three', (): void => {
        const request = httpTestingController.expectOne((): boolean => true);
        expect(request.request.params.get('size')).toBe(3);
    });

    it('Displays next page button', (): void => {
        const request = httpTestingController.expectOne(() => true);
        request.flush(getPage(0, 3));
        fixture.detectChanges();
        const nextPageButton = fixture.nativeElement.querySelector(selectors.nextButton);
        expect(nextPageButton).toBeTruthy();
    });

    it('Request next page after clicking next page button', (): void => {
        const request = httpTestingController.expectOne(() => true);
        request.flush(getPage(0, 3));
        fixture.detectChanges();
        const nextPageButton = fixture.nativeElement.querySelector(selectors.nextButton);
        nextPageButton.click();
        const nextRequest = httpTestingController.expectOne(() => true);
        expect(nextRequest.request.params.get('page')).toBe(1);
    });

    it('Does not display next page at last page', (): void => {
        const request = httpTestingController.expectOne(() => true);
        request.flush(getPage(2, 3));
        fixture.detectChanges();
        const nextPageButton = fixture.nativeElement.querySelector(selectors.nextButton);
        const prevPageButton = fixture.nativeElement.querySelector(selectors.prevButton);
        expect(nextPageButton).toBeFalsy();
        expect(prevPageButton).toBeTruthy();
    });

    it('Does not display previous page button at first page', (): void => {
        const request = httpTestingController.expectOne(() => true);
        request.flush(getPage(0, 3));
        fixture.detectChanges();
        const nextPageButton = fixture.nativeElement.querySelector(selectors.nextButton);
        const prevPageButton = fixture.nativeElement.querySelector(selectors.prevButton);
        expect(nextPageButton).toBeTruthy();
        expect(prevPageButton).toBeFalsy();
    });

    it('Displays previous page button in page 2', (): void => {
        const request = httpTestingController.expectOne(() => true);
        request.flush(getPage(1, 3));
        fixture.detectChanges();
        const previousPageButton = fixture.nativeElement.querySelector(selectors.prevButton);
        expect(previousPageButton).toBeTruthy();
    });

    it('Displays previous page after clicking previous page button', (): void => {
        const request = httpTestingController.expectOne(() => true);
        request.flush(getPage(1, 3));
        fixture.detectChanges();
        const previousPageButton = fixture.nativeElement.querySelector(selectors.prevButton);
        previousPageButton.click();
        const previousPageRequest = httpTestingController.expectOne(() => true);
        expect(previousPageRequest.request.params.get('page')).toBe(0);
    });

});
