import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ActivateComponent } from './activate/activate.component';
import { routes } from './router/app-router.module';
import { UserComponent } from './user/user.component';
import { UserListComponent } from './home/user-list/user-list.component';
import { Location } from '@angular/common';
import { UserListItemComponent } from './home/user-list-item/user-list-item.component';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let router: Router;
    let appComponent: HTMLElement;
    let httpTestingController: HttpTestingController;
    let location: Location;

    const testUser = {
        password: 'P4ssword',
        email: 'user1@mail.com',
    }
    const selectors = {
        email: {
            label: 'label[for="email"]',
            input: 'input[id="email"]',
        },
        password: {
            label: 'label[for="password"]',
            input: 'input[id="password"]',
        },
        h1: 'h1',
        status: 'span[role="status"]',
        alert: '.alert',
        homePage: '[data-testid="home-page"]',
    }

    beforeEach(async (): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                SignUpComponent,
                HomeComponent,
                UserComponent,
                LoginComponent,
                ActivateComponent,
                UserListComponent,
                UserListItemComponent,
            ],
            imports: [
                RouterTestingModule.withRoutes(routes),
                HttpClientTestingModule,
                SharedModule,
                ReactiveFormsModule,
                FormsModule,
            ],
        }).compileComponents();
    });

    beforeEach((): void => {
        fixture = TestBed.createComponent(AppComponent);
        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        httpTestingController = TestBed.inject(HttpTestingController);
        component = fixture.componentInstance;
        fixture.detectChanges();
        appComponent = fixture.nativeElement;
    });

    describe('Routing', (): void => {

        const tests = {
            routing: [
                { path: '/', pageId: 'home-page' },
                { path: '/signup', pageId: 'sign-up-page' },
                { path: '/login', pageId: 'login-page' },
                { path: '/user/1', pageId: 'user-page' },
                { path: '/user/2', pageId: 'user-page' },
                { path: '/activate/123', pageId: 'activation-page' },
                { path: '/activate/456', pageId: 'activation-page' },
            ],
            link: [
                { path: '/', title: 'Home' },
                { path: '/signup', title: 'Sign Up' },
                { path: '/login', title: 'Login' },
            ],
            navigation: [
                { initialPath: '/', clickingTo: 'Sign Up', visiblePage: 'sign-up-page' },
                { initialPath: '/signup', clickingTo: 'Home', visiblePage: 'home-page' },
                { initialPath: '/', clickingTo: 'Login', visiblePage: 'login-page' },
            ],
        }

        // Displays correct pageId for each path
        tests.routing.forEach(({ path, pageId }): void => {
            it(`Displays '${pageId}' when path is '${path}'`, async (): Promise<void> => {
                await router.navigate([path]);
                fixture.detectChanges();
                const page = appComponent.querySelector(`[data-testid="${pageId}"]`);
                expect(page).toBeTruthy();
            });
        });

        // Has link with correct title for each path
        tests.link.forEach(({ path, title }): void => {
            it(`Has link with title '${title}' to '${path}'`, async (): Promise<void> => {
                const linkElement: HTMLAnchorElement = appComponent.querySelector(`a[title="${title}"]`) as HTMLAnchorElement;
                expect(linkElement.pathname).toEqual(path);
            });
        });

        // Displays correct page after clicking each link
        tests.navigation.forEach(({ initialPath, clickingTo, visiblePage }): void => {
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

        it('Navigates to the user page when clicking the username on user list', fakeAsync(async (): Promise<void> => {
            let selector = '.list-group-item';
            await router.navigate(['/']);
            fixture.detectChanges();
            const request = httpTestingController.expectOne(() => true);
            request.flush({
                content: [ { id: 1, username: 'user1', email: 'user1@mail.com' } ],
                page: 0,
                size: 3,
                totalPages: 1,
            })
            fixture.detectChanges();
            const linkToUserPage = fixture.nativeElement.querySelector(selector);
            linkToUserPage.click();
            tick();
            fixture.detectChanges();
            selector = '[data-testid="user-page"]';
            const page = appComponent.querySelector(selector);
            expect(page).toBeTruthy();
            expect(location.path()).toEqual('/user/1');
        }));
    });

    describe('Login', (): void => {

        let button: any;
        let httpTestingController: HttpTestingController;
        let loginPage: HTMLElement;
        let emailInput: HTMLInputElement;
        let passwordInput: HTMLInputElement;

        const setupForm = async (email = testUser.email): Promise<void> => {
            httpTestingController = TestBed.inject(HttpTestingController);
            loginPage = fixture.nativeElement as HTMLElement;
            await fixture.whenStable();
            emailInput = loginPage.querySelector(selectors.email.input) as HTMLInputElement;
            passwordInput = loginPage.querySelector(selectors.password.input) as HTMLInputElement;
            console.log();
            emailInput.value = email;
            emailInput.dispatchEvent(new Event('input'));
            emailInput.dispatchEvent(new Event('blur'));
            passwordInput.value = testUser.password;
            passwordInput.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            button = loginPage.querySelector('button');
        }

        it('Navigates to home after successful login', fakeAsync(async (): Promise<void> => {
            await router.navigate(['/login']);
            fixture.detectChanges();
            await setupForm();
            button.click();
            const request = httpTestingController.expectOne(() => true);
            request.flush({});
            fixture.detectChanges();
            tick();
            const page = appComponent.querySelector(selectors.homePage);
            expect(page).toBeTruthy();
        }));
    });
});
