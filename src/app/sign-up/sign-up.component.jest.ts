import { render, screen, waitFor } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import { HttpClientModule } from '@angular/common/http';
import { SetupServerApi, setupServer } from 'msw/node';
import { Path, RestHandler, rest } from 'msw';
import userEvent from '@testing-library/user-event';

let requestBody: IRequestBody = {} as IRequestBody;

const setup = async (): Promise<void> => {
    await render(SignUpComponent, {
        imports: [HttpClientModule],
    });
};
const url: Path = '/api/1.0/users';
const postRequest: RestHandler = rest.post(url, (req, res, context) => {
    requestBody = req.body as IRequestBody;
    return res(context.status(200), context.json({}));
});
const server: SetupServerApi = setupServer(postRequest);

beforeAll(() => server.listen());
afterAll(() => server.close());

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

            // Store sign-up details
            const username = 'user1';
            const email = 'user1@mail.com';
            const password = 'P4ssword';
            const expectedBody: IRequestBody = {
                username: username,
                password: password,
                email: email,
            };

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
            await waitFor(() => expect(requestBody).toEqual(expectedBody));
        });

    });
});
