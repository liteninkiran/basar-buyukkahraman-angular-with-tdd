import { render, screen, waitFor } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import { HttpClientModule } from '@angular/common/http';
import { SetupServerApi, setupServer } from 'msw/node';
import { DefaultRequestBody, MockedResponse, Path, PathParams, ResponseComposition, ResponseResolver, RestContext, RestHandler, RestRequest, rest } from 'msw';
import userEvent from '@testing-library/user-event';

interface IRequestBody {
    username: string;
    password: string;
    email: string;
}

let requestBody: IRequestBody = {} as IRequestBody;
let counter = 0;

const setup = async (): Promise<void> => {
    await render(SignUpComponent, {
        imports: [HttpClientModule],
    });
}
const url: Path = '/api/1.0/users';
const resolver: ResponseResolver<
    RestRequest<DefaultRequestBody, PathParams>,
    RestContext,
    DefaultRequestBody
> = (
    req: RestRequest<DefaultRequestBody, PathParams>,
    res: ResponseComposition<DefaultRequestBody>,
    ctx: RestContext
): MockedResponse<DefaultRequestBody> | Promise<MockedResponse<DefaultRequestBody>> => {
        requestBody = req.body as IRequestBody;
        counter += 1;
        return res(ctx.status(200), ctx.json({}));
    }
const postRequest: RestHandler = rest.post(url, resolver);
const server: SetupServerApi = setupServer(postRequest);

beforeEach((): void => { counter = 0; });
beforeAll((): void => server.listen());
afterAll((): void => server.close());

describe('SignUpComponent', (): void => {

    describe('Layout', (): void => {

        it('has Sign Up header', async (): Promise<void> => {
            await setup();
            const header = screen.getByRole('heading', { name: 'Sign Up' });
            expect(header).toBeInTheDocument();
        });

        it('has username input', async (): Promise<void> => {
            await setup();
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
        });

        it('has email input', async (): Promise<void> => {
            await setup();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
        });

        it('has password input', async (): Promise<void> => {
            await setup();
            expect(screen.getByLabelText('Password')).toBeInTheDocument();
        });

        it('has password type for password input', async (): Promise<void> => {
            await setup();
            const input = screen.getByLabelText('Password');
            expect(input).toHaveAttribute('type', 'password');
        });

        it('has confirm password input', async (): Promise<void> => {
            await setup();
            expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        });

        it('has password type for password repeat input', async (): Promise<void> => {
            await setup();
            const input = screen.getByLabelText('Confirm Password');
            expect(input).toHaveAttribute('type', 'password');
        });

        it('has Sign Up button', async (): Promise<void> => {
            await setup();
            const button = screen.getByRole('button', { name: 'Sign Up' });
            expect(button).toBeInTheDocument();
        });

        it('button is initially disabled', async (): Promise<void> => {
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

        const setupForm = async () => {
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
            await userEvent.type(emailInput, email);
            await userEvent.type(passwordInput, password);
            await userEvent.type(confirmPasswordInput, password);
        }

        it('Enables the button when the password and confirm password fields have same value', async (): Promise<void> => {
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

    });
});
