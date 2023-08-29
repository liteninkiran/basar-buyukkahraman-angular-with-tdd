import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpComponent } from './sign-up.component';

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

    it('has Sign Up header', () => {
        const signUp: HTMLElement = fixture.nativeElement as HTMLElement;
        const h1: HTMLElement = signUp.querySelector('h1') as HTMLElement;
        expect(h1.textContent).toBe('Sign Up');
    })
});
