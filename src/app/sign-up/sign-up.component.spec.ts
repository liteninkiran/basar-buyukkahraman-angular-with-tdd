import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpComponent } from './sign-up.component';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

interface IConfig {
    id: string;
    text: string;
};

interface IInputConfig {
    input: HTMLInputElement,
    setValue: string,
};

interface ITestCase {
    field: string,
    value: string,
    error: string,
};

describe('SignUpComponent', () => {
    let component: SignUpComponent;
    let fixture: ComponentFixture<SignUpComponent>;

    beforeEach(async (): Promise<void> => {
        await TestBed.configureTestingModule({
            declarations: [
                SignUpComponent,
            ],
            imports: [
                HttpClientTestingModule,
                SharedModule,
                ReactiveFormsModule,
            ],
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
            elementCheck({ id: 'confirmPassword', text: 'Confirm Password' });
        });

        it('has password type for confirm password input', (): void => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const input: HTMLInputElement = getInputElement(signUp, 'confirmPassword');
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
            confirmPassword: 'input[id="confirmPassword"]',
            spinner: 'span[role="status"]',
            alert: '.alert-success',
            form: 'div[data-testid="form-sign-up"]',
        }

        // Common elements
        let button: HTMLButtonElement;
        let httpTestingController: HttpTestingController;
        let signUp: HTMLElement;
        let inputConfigs: IInputConfig[];

        // Run before each test
        const setupForm = async (): Promise<void> => {
            // Set testing controller
            httpTestingController = TestBed.inject(HttpTestingController);

            // Store elements 
            signUp = fixture.nativeElement as HTMLElement;
            button = signUp.querySelector('button') as HTMLButtonElement;

            await fixture.whenStable();

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
                config.input.dispatchEvent(new Event('blur'));
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

        const makeAndResolveRequest = (): void => {
            const req: TestRequest = httpTestingController.expectOne(url);
            req.flush({});
            fixture.detectChanges();
        }

        it('Enables the button when all the fields have valid input', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Expect button to be enabled
            expect(button.disabled).toBeFalsy();

            // Reset password fields
            resetPasswordFields();

            // Expect button to be disabled despite being the same value
            expect(button.disabled).toBeTruthy();
        });

        it('Sends username, email and password to backend after clicking the sign-up button', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();
            fixture.detectChanges();

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

        it('Disables button when there is an ongoing API call', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Sign up
            clickSignUp();

            // Try and sign up again
            clickSignUp();

            // Expect only one API call to be made
            httpTestingController.expectOne(url);

            // Expect the button to be disabled
            expect(button.disabled).toBeTruthy();
        });

        it('Displays spinner after clicking the submit button', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Expect spinner to be hidden
            expect(signUp.querySelector(selectors.spinner)).toBeFalsy();

            // Sign up
            clickSignUp();

            // Expect spinner to be shown
            expect(signUp.querySelector(selectors.spinner)).toBeTruthy();
        });

        it('Displays account activation notification after successful sign up request', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Expect success alert not to be shown
            expect(signUp.querySelector(selectors.alert)).toBeFalsy();

            // Sign up
            clickSignUp();

            // Make and resolve request
            makeAndResolveRequest();

            // Expect success alert to be shown
            const message: HTMLElement = signUp.querySelector(selectors.alert) as HTMLElement;
            expect(message.textContent).toContain('Please check your email to activate your account');
        });

        it('Hides sign up form after successful sign up request', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Expect the sign-up form to be shown
            expect(signUp.querySelector(selectors.form)).toBeTruthy();

            // Sign up
            clickSignUp();

            // Make and resolve request
            makeAndResolveRequest();

            // Expect the sign-up form not to be shown
            expect(signUp.querySelector(selectors.form)).toBeFalsy();
        });

        it('Displays validation error coming from backend after submit failure', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Sign up
            button.click();

            // Store request
            const req = httpTestingController.expectOne(url);

            // Generate back-end response
            const body = { validationErrors: { email: 'Email in use' } }
            const options = { status: 400, statusText: 'Bad Request' }

            // Resolve request
            req.flush(body, options);
            fixture.detectChanges();

            // Expect validation error to be shown
            const validationElement = signUp.querySelector(`div[data-testid="email-validation"]`);
            expect(validationElement?.textContent).toContain('Email in use');
        });

        it('Hides spinner after sign up request fails', async () => {
            await setupForm();
            button.click();
            const req = httpTestingController.expectOne(url);
            req.flush({
                validationErrors: { email: 'Email in use' }
            }, {
                status: 400,
                statusText: 'Bad Request'
            });
            fixture.detectChanges();
            expect(signUp.querySelector('span[role="status"]')).toBeFalsy();
        });

    });

    describe('Validation', (): void => {

        const testCases: ITestCase[] = [
            // Username
            { field: 'username', value: '', error: 'Username is required' },
            { field: 'username', value: '123', error: 'Username must be at least 4 characters long' },

            // Email
            { field: 'email', value: '', error: 'Email is required' },
            { field: 'email', value: 'invalid', error: 'Invalid email address' },

            // Password
            { field: 'password', value: '', error: 'Password is required' },
            { field: 'password', value: 'password', error: 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number' },
            { field: 'password', value: 'passWORD', error: 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number' },
            { field: 'password', value: 'pass1234', error: 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number' },
            { field: 'password', value: 'PASS1234', error: 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number' },

            // Confirm Password
            {
                field: 'confirmPassword',
                value: 'pass',
                error: 'Passwords do not match',
            },
        ];

        testCases.forEach(({ field, value, error }): void => {
            const testDescription = `Displays the '${error}' error when ${field} is '${value}'`;
            const validationSelector = `div[data-testid="${field}-validation"]`;
            const inputSelector = `input[id="${field}"]`;

            it(testDescription, (): void => {
                // Store elements
                const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
                const input: HTMLInputElement = signUp.querySelector(inputSelector) as HTMLInputElement;

                // Expect validation messages not to be shown
                expect(signUp.querySelector(validationSelector)).toBeNull();

                // Enter some invalid data
                input.value = value;
                input.dispatchEvent(new Event('input'));
                input.dispatchEvent(new Event('blur'));
                fixture.detectChanges();

                // Store validation element
                const validationElement: HTMLDivElement = signUp.querySelector(validationSelector) as HTMLDivElement;

                // Expect correct validation message to be shown
                expect(validationElement.textContent).toContain(error);
            });
        });

        it(`Displays the 'Email in use' error when email is not unique`, (): void => {
            let httpTestingController = TestBed.inject(HttpTestingController);
            const signUp = fixture.nativeElement as HTMLElement;
            expect(signUp.querySelector(`div[data-testid="email-validation"]`)).toBeNull();
            const input = signUp.querySelector(`input[id="email"]`) as HTMLInputElement;
            input.value = 'non-unique-email@mail.com';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new Event('blur'));
            const request = httpTestingController.expectOne(({ url, method, body }) => {
                if (url === '/api/1.0/user/email' && method === 'POST') {
                    return body.email === "non-unique-email@mail.com"
                }
                return false;
            })
            request.flush({});
            fixture.detectChanges();
            const validationElement = signUp.querySelector(`div[data-testid="email-validation"]`);
            expect(validationElement?.textContent).toContain('Email in use');
        });
    });
});
