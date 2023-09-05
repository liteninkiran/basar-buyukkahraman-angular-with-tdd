import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscriber } from 'rxjs';
import { AlertComponent } from '../shared/alert/alert.component';
import { ActivateComponent } from './activate.component';

type RouteParams = {
    id: string,
}

describe('ActivateComponent', () => {
    const config = [
        { id: '123', url: '/api/1.0/users/token/123' },
        { id: '456', url: '/api/1.0/users/token/456' },
    ];

    let component: ActivateComponent;
    let fixture: ComponentFixture<ActivateComponent>;
    let httpTestingController: HttpTestingController;
    let subscriber!: Subscriber<RouteParams>;

    beforeEach(async (): Promise<void> => {
        const observable = new Observable<RouteParams>(sub => subscriber = sub);

        await TestBed.configureTestingModule({
            declarations: [ActivateComponent, AlertComponent],
            imports: [HttpClientTestingModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: observable,
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach((): void => {
        fixture = TestBed.createComponent(ActivateComponent);
        httpTestingController = TestBed.inject(HttpTestingController);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Sends account activation request', (): void => {
        subscriber.next({ id: config[0].id });
        const requests = httpTestingController.match(config[0].url)
        expect(requests.length).toBe(1);
    });

    it('Displays activation success message when token is valid', (): void => {
        subscriber.next({ id: config[0].id });
        const request = httpTestingController.expectOne(config[0].url)
        request.flush({});
        fixture.detectChanges();
        const alert = fixture.nativeElement.querySelector('.alert');
        expect(alert.textContent).toContain('Account is activated');
    });

    it('Displays activation failure message when token is invalid', (): void => {
        subscriber.next({ id: config[1].id });
        const request = httpTestingController.expectOne(config[1].url)
        request.flush({}, { status: 400, statusText: 'Bad Request' });
        fixture.detectChanges();
        const alert = fixture.nativeElement.querySelector('.alert');
        expect(alert.textContent).toContain('Activation failure');
    });

    it('Displays spinner during activation request', (): void => {
        subscriber.next({ id: config[0].id });
        const selector = 'span[role="status"]';
        const request = httpTestingController.expectOne(config[0].url);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector(selector)).toBeTruthy();
        request.flush({});
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector(selector)).toBeFalsy();
    });
});
