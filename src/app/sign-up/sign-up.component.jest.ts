import { render, screen } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';

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

});