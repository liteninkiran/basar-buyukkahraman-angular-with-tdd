import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpComponent } from './sign-up.component';

export interface IConfig {
    id: string;
    text: string;
};

describe('SignUpComponent', () => {
    let component: SignUpComponent;
    let fixture: ComponentFixture<SignUpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SignUpComponent]
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
            return signUp.querySelector(`input[id="${id}"]`) as HTMLInputElement;
        }

        const getLabelElement = (signUp: HTMLElement, id: string): HTMLLabelElement => {
            return signUp.querySelector(`label[for="${id}"]`) as HTMLLabelElement;
        }
    });

});
