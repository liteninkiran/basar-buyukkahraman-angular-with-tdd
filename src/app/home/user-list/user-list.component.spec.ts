import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { getPage } from './test-helper';
import { RouterTestingModule } from '@angular/router/testing';
import { UserListItemComponent } from '../user-list-item/user-list-item.component';

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
        status: 'span[role="status"]',
    }

    beforeEach(async (): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [
                UserListComponent,
                UserListItemComponent,
            ],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
            ],
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

    it('Displays spinner during the API call', (): void => {
        const request = httpTestingController.expectOne(() => true);
        expect(fixture.nativeElement.querySelector(selectors.status)).toBeTruthy();
        request.flush(getPage(0, 3));
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector(selectors.status)).toBeFalsy();
    });

});
