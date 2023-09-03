import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { routes } from './router/app-router.module';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                SignUpComponent,
                HomeComponent,
            ],
            imports: [
                RouterTestingModule.withRoutes(routes),
                HttpClientTestingModule,
                SharedModule,
                ReactiveFormsModule,
            ],
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        router = TestBed.inject(Router);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Routing', (): void => {
        const selectors = {
            homePage: '[data-testid="home-page"]',
            signUpPage: '[data-testid="sign-up-page"]',
        }
        it(`Displays home page at '/'`, async () => {
            await router.navigate(['/']);
            fixture.detectChanges();
            const page = fixture.nativeElement.querySelector(selectors.homePage);
            expect(page).toBeTruthy();
        })
        it(`Displays sign-up page at '/signup'`, async () => {
            await router.navigate(['/signup']);
            fixture.detectChanges();
            const page = fixture.nativeElement.querySelector(selectors.signUpPage);
            expect(page).toBeTruthy();
        })
    })
});
