import { render, screen, waitFor } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import { HttpClientModule } from '@angular/common/http';
import { SetupServerApi, setupServer } from 'msw/node';
import { Path, RestHandler, rest } from 'msw';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import userEvent from '@testing-library/user-event';

type UniqueEmailCheck = {
    email: string;
}

interface IRequestBody {
    username: string;
    password: string;
    email: string;
}

let requestBody: IRequestBody = {} as IRequestBody;
let counter = 0;

const nonUniqueEmail = 'not-unique@mail.com';
const signUpUrl: Path = '/api/1.0/users';
const emailUrl: Path = '/api/1.0/user/email';

// Setup
const setup = (async (): Promise<void> => {
    await render(SignUpComponent, {
        imports: [
            HttpClientModule,
            SharedModule,
            ReactiveFormsModule,
        ],
    });
});

// Sign Up Resolver
const signUpResolver = ((req: any, res: any, ctx: any) => {
    requestBody = req.body as IRequestBody;
    counter += 1;
    return requestBody.email === nonUniqueEmail
        ? res(ctx.status(400), ctx.json({}))
        : res(ctx.status(200), ctx.json({}));
});

// Email Resolver
const emailResolver = ((req: any, res: any, ctx: any) => {
    const body = req.body as UniqueEmailCheck
    return body.email === nonUniqueEmail
        ? res(ctx.status(200), ctx.json({}))
        : res(ctx.status(404), ctx.json({}));
});

// Server
const signupRequest: RestHandler = rest.post(signUpUrl, signUpResolver);
const emailRequest: RestHandler = rest.post(emailUrl, emailResolver);
const server: SetupServerApi = setupServer(signupRequest, emailRequest);

beforeEach((): void => { server.resetHandlers(); counter = 0; });
beforeAll((): void => server.listen());
afterAll((): void => server.close());

describe('SignUpComponent', (): void => {

    describe('Layout', (): void => {

        it('Has Sign Up header', async (): Promise<void> => {
            await setup();
            const header = screen.getByRole('heading', { name: 'Sign Up' });
            expect(header).toBeInTheDocument();
        });

        it('Has username input', async (): Promise<void> => {
            await setup();
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
        });

        it('Has email input', async (): Promise<void> => {
            await setup();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
        });

        it('Has password input', async (): Promise<void> => {
            await setup();
            expect(screen.getByLabelText('Password')).toBeInTheDocument();
        });

        it('Has password type for password input', async (): Promise<void> => {
            await setup();
            const input = screen.getByLabelText('Password');
            expect(input).toHaveAttribute('type', 'password');
        });

        it('Has confirm password input', async (): Promise<void> => {
            await setup();
            expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        });

        it('Has password type for password repeat input', async (): Promise<void> => {
            await setup();
            const input = screen.getByLabelText('Confirm Password');
            expect(input).toHaveAttribute('type', 'password');
        });

        it('Has Sign Up button', async (): Promise<void> => {
            await setup();
            const button = screen.getByRole('button', { name: 'Sign Up' });
            expect(button).toBeInTheDocument();
        });

        it('Button is initially disabled', async (): Promise<void> => {
            await setup();
            const button = screen.getByRole('button', { name: 'Sign Up' });
            expect(button).toBeDisabled();
        });

    });

    describe('Interactions', (): void => {
        // Sign-up details
        const username = 'user1';
        const email = 'user1@mail.com';
        const password = 'P4ssword';
        const alertText = 'Please check your email to activate your account';

        let usernameInput: HTMLInputElement;
        let emailInput: HTMLInputElement;
        let passwordInput: HTMLInputElement;
        let confirmPasswordInput: HTMLInputElement;
        let button: HTMLButtonElement;

        const setupForm = async (values?: {email: string}): Promise<void> => {
            // Global setup
            await setup();

            // Store input elements
            usernameInput = screen.getByLabelText('Username');
            emailInput = screen.getByLabelText('Email');
            passwordInput = screen.getByLabelText('Password');
            confirmPasswordInput = screen.getByLabelText('Confirm Password');

            // Store button element
            button = screen.getByRole('button', { name: 'Sign Up' });

            // Enter sign-up details
            await userEvent.type(usernameInput, username);
            await userEvent.type(emailInput, values?.email || email);
            await userEvent.type(passwordInput, password);
            await userEvent.type(confirmPasswordInput, password);
        }

        it('Enables the button when all the fields have valid input', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Expect button to be enabled (because passwords match and have non-zero lengths)
            expect(button).toBeEnabled();

            // Reset input text
            await userEvent.clear(passwordInput);
            await userEvent.clear(confirmPasswordInput);

            // Expect button to be disabled (because passwords have zero lengths)
            expect(button).toBeDisabled();
        });

        it('Sends username, email and password to backend after clicking the button', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Sign up
            await userEvent.click(button);

            // Expect the request body to be as expected
            const expectedBody: IRequestBody = {
                username: username,
                password: password,
                email: email,
            };
            await waitFor(() => expect(requestBody).toEqual(expectedBody));
        });

        it('Disables button when there is an ongoing API call', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Sign up
            await userEvent.click(button);

            // Expect button to be disabled (because request has been submitted but response not yet received)
            expect(button).toBeDisabled();

            // Try and sign up again
            await userEvent.click(button);

            // Expect only one call to API
            await waitFor(() => expect(counter).toBe(1));
        });

        it('Displays spinner after clicking the submit button', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Expect spinner not to be shown
            expect(screen.queryByRole('status')).not.toBeInTheDocument();

            // Sign up
            await userEvent.click(button);

            // Expect spinner to be shown
            expect(screen.queryByRole('status')).toBeInTheDocument();
        });

        it('Displays account activation notification after successful sign up request', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Expect success alert not to be shown
            expect(screen.queryByText(alertText)).not.toBeInTheDocument();

            // Sign up
            await userEvent.click(button);

            // Expect success alert to be shown
            const text = await screen.findByText(alertText);
            expect(text).toBeInTheDocument();
        });

        it('Hides sign up form after successful sign up request', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm();

            // Find the sign-up form
            const form = screen.getByTestId('form-sign-up');

            // Expect the sign-up form to be shown
            expect(form).toBeInTheDocument();

            // Sign up
            await userEvent.click(button);

            // Find alert
            await screen.findByText(alertText);

            // Expect the sign-up form not to be shown
            expect(form).not.toBeInTheDocument();
        });

        it('Displays validation error coming from backend after submit failure', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm({email: nonUniqueEmail});

            // Sign up
            await userEvent.click(button);

            // Expect the email error message to be shown
            const errorMessage = await screen.findByText('Email in use');
            expect(errorMessage).toBeInTheDocument();
        });

        it('Hides spinner after sign up request fails', async (): Promise<void> => {
            // Setup the form with user inputs
            await setupForm({email: nonUniqueEmail});

            // Sign up
            await userEvent.click(button);

            // Wait for response
            await screen.findByText('Email in use');

            // Expect spinner to be hidden
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });
    });

    describe('Validation', (): void => {

        const name = `Displays the '$message' error when $label is '$inputValue'`;
        const table = [
            // Username
            { label: 'Username', inputValue: '{space}{backspace}', message: 'Username is required'                          },
            { label: 'Username', inputValue: '123'               , message: 'Username must be at least 4 characters long'   },

            // Email
            { label: 'Email', inputValue: '{space}{backspace}', message: 'Email is required'     },
            { label: 'Email', inputValue: 'invalid'           , message: 'Invalid email address' },
            { label: 'Email', inputValue: nonUniqueEmail      , message: 'Email in use'          },

            // Password
            { label: 'Password', inputValue: '{space}{backspace}', message: 'Password is required'                                                      },
            { label: 'Password', inputValue: 'password'          , message: 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'  },
            { label: 'Password', inputValue: 'passWORD'          , message: 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'  },
            { label: 'Password', inputValue: 'pass1234'          , message: 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'  },
            { label: 'Password', inputValue: 'PASS1234'          , message: 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'  },

            // Confirm Password
            {
                label: 'Confirm Password',
                inputValue: 'pass',
                message: 'Passwords do not match',
            },
        ];

        it.each(table)(name, async ({ label, inputValue, message }) => {
            // Setup component
            await setup();

            // Expect validation messages not to be shown
            expect(screen.queryByText(message)).not.toBeInTheDocument();

            // Enter some invalid data
            const input = screen.getByLabelText(label);
            await userEvent.type(input, inputValue);
            await userEvent.tab();

            // Expect correct validation message to be shown
            const errorMessage = await screen.findByText(message);
            expect(errorMessage).toBeInTheDocument();
        });

    });

});
