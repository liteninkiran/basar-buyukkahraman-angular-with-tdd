import { render, screen, waitFor } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import userEvent from '@testing-library/user-event';
import 'whatwg-fetch';

describe('SignUpComponent', () => {

    describe('Layout', () => {

        it('has Sign Up header', async () => {
            await render(SignUpComponent);
            const header = screen.getByRole('heading', { name: 'Sign Up' });
            expect(header).toBeInTheDocument();
        });

        it('has username input', async () => {
            await render(SignUpComponent);
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
        });

        it('has email input', async () => {
            await render(SignUpComponent);
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
        });

        it('has password input', async () => {
            await render(SignUpComponent);
            expect(screen.getByLabelText('Password')).toBeInTheDocument();
        });

        it('has password type for password input', async () => {
            await render(SignUpComponent);
            const input = screen.getByLabelText('Password');
            expect(input).toHaveAttribute('type', 'password');
        });

        it('has password repeat input', async () => {
            await render(SignUpComponent);
            expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        });

        it('has password type for password repeat input', async () => {
            await render(SignUpComponent);
            const input = screen.getByLabelText('Confirm Password');
            expect(input).toHaveAttribute('type', 'password');
        });

        it('has Sign Up button', async () => {
            await render(SignUpComponent);
            const button = screen.getByRole('button', { name: 'Sign Up' });
            expect(button).toBeInTheDocument();
        });

        it('button is initially disabled', async () => {
            await render(SignUpComponent);
            const button = screen.getByRole('button', { name: 'Sign Up' });
            expect(button).toBeDisabled();
        });

    });

    describe('Interactions', () => {
        it('Enables the button when the password and confirm password fields have same value', async () => {
            // Render the component
            await render(SignUpComponent);

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
            const spy = jest.spyOn(window, 'fetch');
            await render(SignUpComponent);

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

            const args = spy.mock.calls[0];
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
