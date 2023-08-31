import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpComponent } from './sign-up.component';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

export interface IConfig {
    id: string;
    text: string;
};

export interface IInputConfig {
    input: HTMLInputElement,
    setValue: string,
};

describe('SignUpComponent', () => {
    let component: SignUpComponent;
    let fixture: ComponentFixture<SignUpComponent>;

    beforeEach(async (): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [SignUpComponent],
            imports: [HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach((): void => {
        fixture = TestBed.createComponent(SignUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Layout', (): void => {
        it('has Sign Up header', (): void => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const h1: HTMLElement = signUp.querySelector('h1') as HTMLElement;
            expect(h1.textContent).toBe('Sign Up');
        });

        it('has username input', (): void => {
            elementCheck({ id: 'username', text: 'Username' });
        });

        it('has email input', (): void => {
            elementCheck({ id: 'email', text: 'Email' });
        });

        it('has password input', (): void => {
            elementCheck({ id: 'password', text: 'Password' });
        });

        it('has password type for password input', (): void => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const input: HTMLInputElement = getInputElement(signUp, 'password');
            expect(input.type).toBe('password');
        })

        it('has confirm password input', (): void => {
            elementCheck({ id: 'passwordConfirm', text: 'Confirm Password' });
        });

        it('has password type for confirm password input', (): void => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const input: HTMLInputElement = getInputElement(signUp, 'passwordConfirm');
            expect(input.type).toBe('password');
        })

        it('has Sign Up button', (): void => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const button: HTMLButtonElement = signUp.querySelector('button') as HTMLButtonElement;
            expect(button.textContent).toContain('Sign Up');
        })

        it('button is initially disabled', (): void => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const button: HTMLButtonElement = signUp.querySelector('button') as HTMLButtonElement;
            expect(button.disabled).toBeTruthy();
        })

        const elementCheck = (config: IConfig): void => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const input: HTMLInputElement = getInputElement(signUp, config.id);
            const label: HTMLLabelElement = getLabelElement(signUp, config.id);
            expect(input).toBeTruthy();
            expect(label).toBeTruthy();
            expect(label.textContent).toContain(config.text);
        }

        const getInputElement = (signUp: HTMLElement, id: string): HTMLInputElement => {
            return signUp.querySelector(`input[id='${id}']`) as HTMLInputElement;
        }

        const getLabelElement = (signUp: HTMLElement, id: string): HTMLLabelElement => {
            return signUp.querySelector(`label[for='${id}']`) as HTMLLabelElement;
        }
    });

    describe('Interactions', (): void => {
        // Sign-up details
        const url = '/api/1.0/users';
        const username = 'user1';
        const email = 'user1@mail.com';
        const password = 'P4ssword';
        const selectors = {
            username: 'input[id="username"]',
            email: 'input[id="email"]',
            password: 'input[id="password"]',
            confirmPassword: 'input[id="passwordConfirm"]',
            spinner: 'span[role="status"]',
        }

        // Common elements
        let button: HTMLButtonElement;
        let httpTestingController: HttpTestingController;
        let signUp: HTMLElement;
        let inputConfigs: IInputConfig[];

        // Run before each test
        const setupForm = (): void => {
            // Set testing controller
            httpTestingController = TestBed.inject(HttpTestingController);

            // Store elements 
            signUp = fixture.nativeElement as HTMLElement;
            button = signUp.querySelector('button') as HTMLButtonElement;

            // Store input elements
            inputConfigs = [
                { input: signUp.querySelector(selectors.username) as HTMLInputElement, setValue: username },
                { input: signUp.querySelector(selectors.email) as HTMLInputElement, setValue: email },
                { input: signUp.querySelector(selectors.password) as HTMLInputElement, setValue: password },
                { input: signUp.querySelector(selectors.confirmPassword) as HTMLInputElement, setValue: password },
            ];

            // Enter values & dispatch
            inputConfigs.map((config: IInputConfig) => {
                config.input.value = config.setValue;
                config.input.dispatchEvent(new Event('input'));
            });

            // Refresh component
            fixture.detectChanges();
        };

        const resetPasswordFields = (): void => {
            inputConfigs.map((config: IInputConfig) => {
                if (config.input.type === 'password') {
                    config.input.value = '';
                    config.input.dispatchEvent(new Event('input'));
                }
            });
            fixture.detectChanges();
        }

        const clickSignUp = (): void => {
            button.click();
            fixture.detectChanges();
        }

        it('Enables the button when the password and confirm password fields have same value', () => {
            // Setup the form with user inputs
            setupForm();

            // Expect button to be enabled
            expect(button.disabled).toBeFalsy();

            // Reset password fields
            resetPasswordFields();

            // Expect button to be disabled despite being the same value
            expect(button.disabled).toBeTruthy();
        });

        it('Sends username, email and password to backend after clicking the sign-up button', () => {
            // Setup the form with user inputs
            setupForm();

            // Sign up
            clickSignUp();

            // Expect only one API call to be made
            const req: TestRequest = httpTestingController.expectOne(url);

            // Store request
            const requestBody: any = req.request.body;
            const expectedBody = {
                username: username,
                password: password,
                email: email,
            }

            // Expect the request body to be as expected
            expect(requestBody).toEqual(expectedBody);
        });

        it('Disables button when there is an ongoing API call', () => {
            // Setup the form with user inputs
            setupForm();

            // Sign up
            clickSignUp();

            // Try and sign up again
            clickSignUp();

            // Expect only one API call to be made
            httpTestingController.expectOne(url);

            // Expect the button to be disabled
            expect(button.disabled).toBeTruthy();
        });

        it('Displays spinner after clicking the submit', () => {
            // Setup the form with user inputs
            setupForm();

            // Expect spinner to be hidden
            expect(signUp.querySelector(selectors.spinner)).toBeFalsy();

            // Sign up
            clickSignUp();

            // Expect spinner to be shown
            expect(signUp.querySelector(selectors.spinner)).toBeTruthy();
        });

    });

});
