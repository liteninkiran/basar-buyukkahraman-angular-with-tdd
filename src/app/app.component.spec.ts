import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { routes } from './router/app-router.module';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let router: Router;
    let appComponent: HTMLElement;

    beforeEach(async (): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                SignUpComponent,
                HomeComponent,
                LoginComponent,
            ],
            imports: [
                RouterTestingModule.withRoutes(routes),
                HttpClientTestingModule,
                SharedModule,
                ReactiveFormsModule,
            ],
        }).compileComponents();
    });
    beforeEach((): void => {
        fixture = TestBed.createComponent(AppComponent);
        router = TestBed.inject(Router);
        component = fixture.componentInstance;
        fixture.detectChanges();
        appComponent = fixture.nativeElement;
    });

    describe('Routing', (): void => {
        const testCases = [
            { path: '/', pageId: 'home-page' },
            { path: '/signup', pageId: 'sign-up-page' },
            { path: '/login', pageId: 'login-page' },
            { path: '/user/1', pageId: 'user-page' },
            { path: '/user/2', pageId: 'user-page' },
        ];

        testCases.forEach(({ path, pageId }): void => {
            it(`Displays ${pageId} when path is ${path}`, async (): Promise<void> => {
                await router.navigate([path]);
                fixture.detectChanges();
                const page = appComponent.querySelector(`[data-testid="${pageId}"]`);
                expect(page).toBeTruthy();
            });
        });

        const linkTests = [
            { path: '/', title: 'Home' },
            { path: '/signup', title: 'Sign Up' },
            { path: '/login', title: 'Login' },
        ];

        linkTests.forEach(({ path, title }) => {
            it(`Has link with title '${title}' to '${path}'`, async (): Promise<void> => {
                const linkElement: HTMLAnchorElement = appComponent.querySelector(`a[title="${title}"]`) as HTMLAnchorElement;
                expect(linkElement.pathname).toEqual(path);
            });
        });

        const navigationTests = [
            {
                initialPath: '/',
                clickingTo: 'Sign Up',
                visiblePage: 'sign-up-page',
            },
            {
                initialPath: '/signup',
                clickingTo: 'Home',
                visiblePage: 'home-page',
            },
            {
                initialPath: '/',
                clickingTo: 'Login',
                visiblePage: 'login-page',
            },
        ];

        navigationTests.forEach(({ initialPath, clickingTo, visiblePage }) => {
            it(`Displays '${visiblePage}' after clicking '${clickingTo}' link`, fakeAsync(async (): Promise<void> => {
                await router.navigate([initialPath]);
                const linkElement: HTMLAnchorElement = appComponent.querySelector(`a[title="${clickingTo}"]`) as HTMLAnchorElement;
                linkElement.click();
                tick();
                fixture.detectChanges();
                const page = appComponent.querySelector(`[data-testid="${visiblePage}"]`);
                expect(page).toBeTruthy();
            }));
        });
    });
});
