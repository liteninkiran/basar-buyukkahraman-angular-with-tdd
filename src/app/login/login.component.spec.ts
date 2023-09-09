import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    const url = '/api/1.0/auth';
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
    }
    const testUser = {
        password: 'P4ssword',
        email: 'user1@mail.com',
    }

    beforeEach(async (): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [LoginComponent],
            imports: [
                SharedModule,
                HttpClientTestingModule,
                FormsModule,
                RouterTestingModule,
            ],
        }).compileComponents();
    });

    beforeEach((): void => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Layout', (): void => {

        it('Has Login header', (): void => {
            const loginPage: HTMLElement = fixture.nativeElement as HTMLElement;
            const h1: HTMLHeadingElement = loginPage.querySelector(selectors.h1) as HTMLHeadingElement;
            expect(h1.textContent).toBe('Login');
        });

        it('Has email input', (): void => {
            const loginPage: HTMLElement = fixture.nativeElement as HTMLElement;
            const label: HTMLLabelElement = loginPage.querySelector(selectors.email.label) as HTMLLabelElement;
            const input: HTMLInputElement = loginPage.querySelector(selectors.email.input) as HTMLInputElement;
            expect(input).toBeTruthy();
            expect(label).toBeTruthy();
            expect(label.textContent).toContain('Email');
        });

        it('Has password input', (): void => {
            const loginPage: HTMLElement = fixture.nativeElement as HTMLElement;
            const label: HTMLLabelElement = loginPage.querySelector(selectors.password.label) as HTMLLabelElement;
            const input: HTMLInputElement = loginPage.querySelector(selectors.password.input) as HTMLInputElement;
            expect(input).toBeTruthy();
            expect(label).toBeTruthy();
            expect(label.textContent).toContain('Password');
        });

        it('Has password type for password input', (): void => {
            const loginPage: HTMLElement = fixture.nativeElement as HTMLElement;
            const input: HTMLInputElement = loginPage.querySelector(selectors.password.input) as HTMLInputElement;
            expect(input.type).toBe('password');
        });

        it('Has Login button', (): void => {
            const loginPage: HTMLElement = fixture.nativeElement as HTMLElement;
            const button: HTMLButtonElement = loginPage.querySelector('button') as HTMLButtonElement;
            expect(button.textContent).toContain('Login');
        });

        it('Disables the button initially', (): void => {
            const loginPage: HTMLElement = fixture.nativeElement as HTMLElement;
            const button: HTMLButtonElement = loginPage.querySelector('button') as HTMLButtonElement;
            expect(button.disabled).toBeTruthy();
        });
    });

    describe('Interactions', (): void => {

        let button: any;
        let httpTestingController: HttpTestingController;
        let loginPage: HTMLElement;
        let emailInput: HTMLInputElement;
        let passwordInput: HTMLInputElement;

        const flushConfig = {
            body: { message: 'Incorrect Credentials' },
            opts: { status: 401, statusText: 'Unauthorised' },
        }

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

        it('Enables the button when all the fields have valid input', async (): Promise<void> => {
            await setupForm();
            expect(button?.disabled).toBeFalsy();
        });

        it('Does not enable button when fields are invalid', async (): Promise<void> => {
            await setupForm('a');
            expect(button?.disabled).toBeTruthy();
        });

        it('Sends email and password to backend after clicking the button', async (): Promise<void> => {
            await setupForm();
            fixture.detectChanges();
            button?.click();
            const req = httpTestingController.expectOne(url);
            const requestBody = req.request.body;
            expect(requestBody).toEqual(testUser);
        });

        it('Disables button when there is an ongoing API call', async (): Promise<void> => {
            await setupForm();
            button.click();
            fixture.detectChanges();
            button.click();
            httpTestingController.expectOne(url);
            expect(button.disabled).toBeTruthy();
        });

        it('Displays spinner after clicking the submit', async (): Promise<void> => {
            await setupForm();
            expect(loginPage.querySelector(selectors.status)).toBeFalsy();
            button.click();
            fixture.detectChanges();
            expect(loginPage.querySelector(selectors.status)).toBeTruthy();
        });

        it('Displays error after submit failure', async (): Promise<void> => {
            await setupForm();
            button.click();
            const req = httpTestingController.expectOne(url);
            req.flush(flushConfig.body, flushConfig.opts);
            fixture.detectChanges();
            const error: HTMLDivElement = loginPage.querySelector(selectors.alert) as HTMLDivElement;
            expect(error.textContent).toContain('Incorrect Credentials');
        });

        it('Hides spinner after sign up request fails', async (): Promise<void> => {
            await setupForm();
            button.click();
            const req = httpTestingController.expectOne(url);
            req.flush(flushConfig.body, flushConfig.opts);
            fixture.detectChanges();
            expect(loginPage.querySelector(selectors.status)).toBeFalsy();
        });

        it('Clears error after email field is changed', async (): Promise<void> => {
            await setupForm();
            button.click();
            const req = httpTestingController.expectOne(url);
            req.flush(flushConfig.body, flushConfig.opts);
            fixture.detectChanges();
            emailInput.value = 'valid@mail.com';
            emailInput.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            expect(loginPage.querySelector(selectors.alert)).toBeFalsy();
        });

        it('Clears error after password field is changed', async (): Promise<void> => {
            await setupForm();
            button.click();
            const req = httpTestingController.expectOne(url);
            req.flush(flushConfig.body, flushConfig.opts);
            fixture.detectChanges();
            passwordInput.value = 'P4ssword2';
            passwordInput.dispatchEvent(new Event('input'));
            fixture.detectChanges();
            expect(loginPage.querySelector(selectors.alert)).toBeFalsy();
        });
    });

    describe('Validation', (): void => {
        const testCases = [
            { field: 'email', value: '', error: 'Email is required' },
            { field: 'email', value: 'wrong-format', error: 'Invalid email address' },
            { field: 'password', value: '', error: 'Password is required' },
        ];

        testCases.forEach(({ field, value, error }): void => {
            it(`Displays ${error} when ${field} has '${value}'`, async (): Promise<void> => {
                await fixture.whenStable();
                const loginPage = fixture.nativeElement as HTMLElement;
                const validationSelector = `div[data-testid="${field}-validation"]`;
                const inputSelector = `input[id="${field}"]`;
                expect(loginPage.querySelector(validationSelector)).toBeNull();
                const input = loginPage.querySelector(inputSelector) as HTMLInputElement;
                input.value = value;
                input.dispatchEvent(new Event('input'));
                input.dispatchEvent(new Event('blur'));
                fixture.detectChanges();
                const validationElement = loginPage.querySelector(validationSelector);
                expect(validationElement?.textContent).toContain(error);
            })
        })
    })

});
