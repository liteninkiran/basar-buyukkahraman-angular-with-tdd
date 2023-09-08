// Angular
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, TestModuleMetadata } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscriber } from 'rxjs';

// Components
import { AlertComponent } from '../shared/alert/alert.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';
import { UserComponent } from './user.component';

type RouteParams = {
    id: string,
}

describe('UserComponent', (): void => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;
    let httpTestingController: HttpTestingController;
    let subscriber!: Subscriber<RouteParams>;

    const selector = 'span[role="status"]';
    const url = (id: number): string => {
        return '/api/1.0/users/' + id.toString();
    }
    const testUser = {
        id: 1,
        username: 'user1',
        email: 'user1@mail.com',
    }

    beforeEach(async (): Promise<void> => {
        const observable = new Observable<RouteParams>(sub => subscriber = sub);
        const moduleDef: TestModuleMetadata = {
            declarations: [
                UserComponent,
                AlertComponent,
                ProfileCardComponent,
            ],
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: observable,
                    },
                },
            ],
        }
        await TestBed.configureTestingModule(moduleDef).compileComponents();
    });

    beforeEach((): void => {
        fixture = TestBed.createComponent(UserComponent);
        httpTestingController = TestBed.inject(HttpTestingController);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Sends request to get user data', (): void => {
        subscriber.next({ id: '1' });
        const requests = httpTestingController.match(url(1));
        expect(requests.length).toBe(1);
    });

    it('Displays username on page when user is found', (): void => {
        subscriber.next({ id: '1' });
        const request = httpTestingController.expectOne(url(1));
        request.flush(testUser);
        fixture.detectChanges();
        const header = fixture.nativeElement.querySelector('h3');
        expect(header.textContent).toContain(testUser.username);
    });

    it('Displays error when user not found', (): void => {
        subscriber.next({ id: '2' });
        const request = httpTestingController.expectOne(url(2));
        request.flush({ message: 'User not found' }, { status: 404, statusText: 'Not Found' });
        fixture.detectChanges();
        const alert = fixture.nativeElement.querySelector('.alert');
        expect(alert.textContent).toContain('User not found');
    });

    it('Displays spinner during user GET request', (): void => {
        subscriber.next({ id: '1' });
        const request = httpTestingController.expectOne(url(1));
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector(selector)).toBeTruthy();
        request.flush(testUser);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector(selector)).toBeFalsy();
    });
});
