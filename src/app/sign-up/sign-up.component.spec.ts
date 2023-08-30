import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpComponent } from './sign-up.component';

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

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SignUpComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SignUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Layout', () => {
        it('has Sign Up header', () => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const h1: HTMLElement = signUp.querySelector('h1') as HTMLElement;
            expect(h1.textContent).toBe('Sign Up');
        });

        it('has username input', () => {
            elementCheck({ id: 'username', text: 'Username' });
        });

        it('has email input', () => {
            elementCheck({ id: 'email', text: 'Email' });
        });

        it('has password input', () => {
            elementCheck({ id: 'password', text: 'Password' });
        });

        it('has password type for password input', () => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const input: HTMLInputElement = getInputElement(signUp, 'password');
            expect(input.type).toBe('password');
        })

        it('has confirm password input', () => {
            elementCheck({ id: 'passwordConfirm', text: 'Confirm Password' });
        });

        it('has password type for confirm password input', () => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const input: HTMLInputElement = getInputElement(signUp, 'passwordConfirm');
            expect(input.type).toBe('password');
        })

        it('has Sign Up button', () => {
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const button: HTMLButtonElement = signUp.querySelector('button') as HTMLButtonElement;
            expect(button.textContent).toContain('Sign Up');
        })

        it('button is initially disabled', () => {
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

    describe('Interactions', () => {
        it('Enables the button when the password and confirm password fields have same value', () => {
            // Store things
            const password = 'P!ssword';
            const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
            const passwordInput: HTMLInputElement = signUp.querySelector('input[id="password"]') as HTMLInputElement;
            const confirmPasswordInput: HTMLInputElement = signUp.querySelector('input[id="passwordConfirm"]') as HTMLInputElement;
            const button: HTMLButtonElement = signUp.querySelector('button') as HTMLButtonElement;

            // Set password fields to same value
            passwordInput.value = password;
            confirmPasswordInput.value = password;

            // Dispatch events & detect changes
            passwordInput.dispatchEvent(new Event('input'));
            confirmPasswordInput.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            // Expect button to be enabled
            expect(button.disabled).toBeFalsy();

            // Change password fields back to empty string
            passwordInput.value = '';
            confirmPasswordInput.value = '';

            // Dispatch events & detect changes
            passwordInput.dispatchEvent(new Event('input'));
            confirmPasswordInput.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            // Expect button to be disabled despite being the same value
            expect(button.disabled).toBeTruthy();
        });

        it('Sends username, email and password to backend after clicking the sign-up button', () => {
            const spy = spyOn(window, 'fetch');

            // Store sign-up details
            const username = 'user1';
            const email = 'user1@mail.com';
            const password = 'P4ssword';

            // Get elements
            const signUp = fixture.nativeElement as HTMLElement;
            const inputConfigs: IInputConfig[] = [
                { input: signUp.querySelector('input[id="username"]') as HTMLInputElement, setValue: username },
                { input: signUp.querySelector('input[id="email"]') as HTMLInputElement, setValue: email },
                { input: signUp.querySelector('input[id="password"]') as HTMLInputElement, setValue: password },
                { input: signUp.querySelector('input[id="passwordConfirm"]') as HTMLInputElement, setValue: password },
            ];
            const button: HTMLButtonElement = signUp.querySelector('button') as HTMLButtonElement;

            // Enter values & dispatch
            inputConfigs.map((config: IInputConfig) => {
                config.input.value = config.setValue;
                config.input.dispatchEvent(new Event('input'));
            });

            fixture.detectChanges();

            // Sign up
            button.click();

            const args = spy.calls.allArgs()[0];
            const secondParam = args[1] as RequestInit;
            const body = {
                username: username,
                password: password,
                email: email,
            };

            expect(secondParam.body).toEqual(JSON.stringify(body));
        });

    });

});
