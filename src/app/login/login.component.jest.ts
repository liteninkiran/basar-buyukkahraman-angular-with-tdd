// Angular
import { render, screen, waitFor } from '@testing-library/angular';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import userEvent from '@testing-library/user-event';

// MSW
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Modules
import { SharedModule } from '../shared/shared.module';

// Components
import { LoginComponent } from './login.component';

let requestBody: any;
let counter = 0;

const url = '/api/1.0/auth';
const resolver = (req: any, res: any, ctx: any) => {
    requestBody = req.body;
    counter += 1;
    return (requestBody.email === 'failing-user@mail.com')
        ? res(ctx.status(401), ctx.json({ message: 'Incorrect Credentials' }))
        : res(ctx.status(200), ctx.json({}));
}
const handler = rest.post(url, resolver);
const server = setupServer(handler);
const testUser = {
    password: 'P4ssword',
    email: 'user1@mail.com',
}

beforeEach((): void => {
    counter = 0;
    server.resetHandlers();
});
beforeAll((): void => server.listen());
afterAll((): void => server.close());

const setup = async (): Promise<void> => {
    await render(LoginComponent, {
        imports: [
            HttpClientModule,
            SharedModule,
            FormsModule,
        ],
    });
};

describe('LoginComponent', (): void => {

    describe('Layout', (): void => {

        it('Has Login header', async (): Promise<void> => {
            await setup();
            const header = screen.getByRole('heading', { name: 'Login' });
            expect(header).toBeInTheDocument();
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

        it('Has Login button', async (): Promise<void> => {
            await setup();
            const button = screen.getByRole('button', { name: 'Login' });
            expect(button).toBeInTheDocument();
        });

        it('Disables the button initially', async (): Promise<void> => {
            await setup();
            const button = screen.getByRole('button', { name: 'Login' });
            expect(button).toBeDisabled();
        });

    });

    describe('Interactions', (): void => {

        let button: any;

        const setupForm = async (values?: { email: string }): Promise<void> => {
            await setup();
            const email = screen.getByLabelText('Email');
            const password = screen.getByLabelText('Password');
            await userEvent.type(email, values?.email || testUser.email);
            await userEvent.type(password, testUser.password);
            button = screen.getByRole('button', { name: 'Login' });
        };

        it('Enables the button when all the fields have valid input', async (): Promise<void> => {
            await setupForm();
            expect(button).toBeEnabled();
        });

        it('Sends email and password to backend after clicking the button', async (): Promise<void> => {
            await setupForm();
            await userEvent.click(button);
            await waitFor(() => expect(requestBody).toEqual(testUser));
        });

        it('Disables button when there is an ongoing api call', async (): Promise<void> => {
            await setupForm();
            await userEvent.click(button);
            await userEvent.click(button);
            await waitFor(() => expect(counter).toBe(1));
        });

        it('Displays spinner after clicking the submit', async (): Promise<void> => {
            await setupForm();
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
            await userEvent.click(button);
            expect(screen.queryByRole('status')).toBeInTheDocument();
        });

        it('Displays validation error coming from backend after submit failure', async (): Promise<void> => {
            await setupForm({ email: 'failing-user@mail.com' });
            await userEvent.click(button);
            const errorMessage = await screen.findByText('Incorrect Credentials');
            expect(errorMessage).toBeInTheDocument();
        });

        it('Hides spinner after Login request fails', async (): Promise<void> => {
            await setupForm({ email: 'failing-user@mail.com' });
            await userEvent.click(button);
            await screen.findByText('Incorrect Credentials');
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        it('Does not enable button when fields are invalid', async (): Promise<void> => {
            await setupForm({ email: 'a' });
            expect(button).toBeDisabled();
        });
    });

    describe('Validation', (): void => {

        const config = {
            name: `Displays '$message' when '$label' has the value '$inputValue'`,
            table: [
                { label: 'Email', inputValue: '{space}{backspace}', message: 'Email is required' },
                { label: 'Email', inputValue: 'wrong-format', message: 'Invalid email address' },
                { label: 'Password', inputValue: '{space}{backspace}', message: 'Password is required' },
            ],
        }
    
        it.each(config.table)(config.name, async ({ label, inputValue, message }): Promise<void> => {
            await setup();
            expect(screen.queryByText(message)).not.toBeInTheDocument();
            const input = screen.getByLabelText(label);
            await userEvent.type(input, inputValue);
            await userEvent.tab();
            const errorMessage = await screen.findByText(message);
            expect(errorMessage).toBeInTheDocument();
        });
    });

});
