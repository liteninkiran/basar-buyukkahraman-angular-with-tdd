import { render, screen } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import userEvent from '@testing-library/user-event';
import 'whatwg-fetch';

const setup = async () => {
    await render(SignUpComponent, {
        imports: [HttpClientTestingModule],
    });
};

interface IRequestBody {
    username: string;
    password: string;
    email: string;
};

describe('SignUpComponent', () => {

    describe('Layout', () => {

        it('has Sign Up header', async () => {
            await setup();
            const header = screen.getByRole('heading', { name: 'Sign Up' });
            expect(header).toBeInTheDocument();
        });

        it('has username input', async () => {
            await setup();
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
        });

        it('has email input', async () => {
            await setup();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
        });

        it('has password input', async () => {
            await setup();
            expect(screen.getByLabelText('Password')).toBeInTheDocument();
        });

        it('has password type for password input', async () => {
            await setup();
            const input = screen.getByLabelText('Password');
            expect(input).toHaveAttribute('type', 'password');
        });

        it('has password repeat input', async () => {
            await setup();
            expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        });

        it('has password type for password repeat input', async () => {
            await setup();
            const input = screen.getByLabelText('Confirm Password');
            expect(input).toHaveAttribute('type', 'password');
        });

        it('has Sign Up button', async () => {
            await setup();
            const button = screen.getByRole('button', { name: 'Sign Up' });
            expect(button).toBeInTheDocument();
        });

        it('button is initially disabled', async () => {
            await setup();
            const button = screen.getByRole('button', { name: 'Sign Up' });
            expect(button).toBeDisabled();
        });

    });

    describe('Interactions', () => {
        it('Enables the button when the password and confirm password fields have same value', async () => {
            await setup();

            // Get elements
            const password = 'P!ssword';
            const passwordInput = screen.getByLabelText('Password');
            const passwordRepeatInput = screen.getByLabelText('Confirm Password');
            const button = screen.getByRole('button', { name: 'Sign Up' });

            // Enter text in inputs
            await userEvent.type(passwordInput, password);
            await userEvent.type(passwordRepeatInput, password);
            expect(button).toBeEnabled();

            // Reset input text
            await userEvent.clear(passwordInput);
            await userEvent.clear(passwordRepeatInput);
            expect(button).toBeDisabled();
        });

        it('sends username, email and password to backend after clicking the button', async () => {
            await setup();
            let httpTestingController = TestBed.inject(HttpTestingController);

            // Store sign-up details
            const username = 'user1';
            const email = 'user1@mail.com';
            const password = 'P4ssword';

            // Get elements
            const usernameInput = screen.getByLabelText('Username');
            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Password');
            const confirmPasswordInput = screen.getByLabelText('Confirm Password');
            const button = screen.getByRole('button', { name: 'Sign Up' });

            // Enter values
            await userEvent.type(usernameInput, username);
            await userEvent.type(emailInput, email);
            await userEvent.type(passwordInput, password);
            await userEvent.type(confirmPasswordInput, password);

            // Sign up
            await userEvent.click(button);

            const req: TestRequest = httpTestingController.expectOne('/api/1.0/users');
            const requestBody: IRequestBody = req.request.body;
            const expectedBody: IRequestBody = {
                username: username,
                password: password,
                email: email,
            };

            expect(requestBody).toEqual(expectedBody);
        });

    });
});
