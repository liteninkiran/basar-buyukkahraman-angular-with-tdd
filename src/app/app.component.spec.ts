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
        username: 'user1',
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
        userPage: '[data-testid="user-page"]',
        links: {
            login: 'a[title="Login"]',
            signUp: 'a[title="Sign Up"]',
            myProfile: 'a[title="My Profile"]',
        },
        userListItem: '.list-group-item',
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
            await router.navigate(['/']);
            fixture.detectChanges();
            const request = httpTestingController.expectOne(() => true);
            request.flush({
                content: [ { id: 1, username: testUser.username, email: testUser.email } ],
                page: 0,
                size: 3,
                totalPages: 1,
            })
            fixture.detectChanges();
            const linkToUserPage = fixture.nativeElement.querySelector(selectors.userListItem);
            linkToUserPage.click();
            tick();
            fixture.detectChanges();
            const page = appComponent.querySelector(selectors.userPage);
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

        const setupLogin = fakeAsync(async (): Promise<void> => {
            httpTestingController = TestBed.inject(HttpTestingController);

            // Navigate to login page
            await router.navigate(['/login']);
            fixture.detectChanges();

            // Wait for login form to be ready
            loginPage = fixture.nativeElement as HTMLElement;
            await fixture.whenStable();

            // Enter email
            emailInput = loginPage.querySelector(selectors.email.input) as HTMLInputElement;
            emailInput.value = testUser.email;
            emailInput.dispatchEvent(new Event('input'));
            emailInput.dispatchEvent(new Event('blur'));

            // Enter password
            passwordInput = loginPage.querySelector(selectors.password.input) as HTMLInputElement;
            passwordInput.value = testUser.password;
            passwordInput.dispatchEvent(new Event('input'));

            // Update UI
            fixture.detectChanges();

            // Click the submit button to login
            button = loginPage.querySelector('button');
            button.click();

            // Store the request
            const request = httpTestingController.expectOne(() => true);

            // Resolve request
            request.flush({
                id: 1,
                username: testUser.username,
                email: testUser.email,
            });

            // Update UI
            fixture.detectChanges();

            // Simulate the asynchronous passage of time for the timer in the fakeAsync zone
            tick();
        });

        it('Navigates to home after successful login', async (): Promise<void> => {
            await setupLogin();
            const page = appComponent.querySelector(selectors.homePage);
            expect(page).toBeTruthy();
        });

        it('Hides login/sign-up links from navbar after successful login', async (): Promise<void> => {
            await setupLogin();
            const loginLink: HTMLAnchorElement = appComponent.querySelector(selectors.links.login) as HTMLAnchorElement;
            const signUpLink: HTMLAnchorElement = appComponent.querySelector(selectors.links.signUp) as HTMLAnchorElement;
            expect(loginLink).toBeFalsy();
            expect(signUpLink).toBeFalsy();
        });

        it('Displays my-profile link in navbar after successful login', async (): Promise<void> => {
            await setupLogin();
            const profileLink: HTMLAnchorElement = appComponent.querySelector(selectors.links.myProfile) as HTMLAnchorElement;
            expect(profileLink).toBeTruthy();
        });

        it('Displays user-page with logged-in user ID in URL after clicking my-profile link on navbar', async (): Promise<void> => {
            await setupLogin();
            const profileLink: HTMLAnchorElement = appComponent.querySelector(selectors.links.myProfile) as HTMLAnchorElement;
            await profileLink.click();
            const page = appComponent.querySelector(selectors.userPage);
            expect(page).toBeTruthy();
            expect(location.path()).toEqual('/user/1');
        });
    });
});
