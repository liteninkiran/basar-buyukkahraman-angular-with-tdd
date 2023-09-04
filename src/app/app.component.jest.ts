import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { routes } from './router/app-router.module';
import { SharedModule } from './shared/shared.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { ActivateComponent } from './activate/activate.component';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import userEvent from '@testing-library/user-event';

const url = '/api/1.0/users/token/:token';
const requestHandler = rest.post(url, (req, res, ctx) => res(ctx.status(200)));
const server = setupServer(requestHandler);

beforeEach((): void => server.resetHandlers());
beforeAll((): void => server.listen());
afterAll((): void => server.close());

const setup = async (path: string): Promise<void> => {
    const { navigate } = await render(AppComponent, {
        declarations: [
            HomeComponent,
            SignUpComponent,
            UserComponent,
            LoginComponent,
            ActivateComponent,
        ],
        imports: [
            HttpClientModule,
            SharedModule,
            ReactiveFormsModule,
        ],
        routes: routes,
    });
    await navigate(path);
}

describe('Routing', (): void => {
    const config = {
        routing: {
            name: `Displays '$pageId' when path is '$path'`,
            table: [
                { path: '/', pageId: 'home-page' },
                { path: '/signup', pageId: 'sign-up-page' },
                { path: '/login', pageId: 'login-page' },
                { path: '/user/1', pageId: 'user-page' },
                { path: '/user/2', pageId: 'user-page' },
                { path: '/activate/123', pageId: 'activation-page' },
                { path: '/activate/456', pageId: 'activation-page' },
            ],
        },
        link: {
            name: `Has link with title '$title' to '$path'`,
            table: [
                { path: '/', title: 'Home' },
                { path: '/signup', title: 'Sign Up' },
                { path: '/login', title: 'Login' },
            ],
        },
        navigation: {
            name: `Displays '$visiblePage' after clicking '$clickingTo' link`,
            table: [
                { initialPath: '/', clickingTo: 'Sign Up', visiblePage: 'sign-up-page' },
                { initialPath: '/signup', clickingTo: 'Home', visiblePage: 'home-page' },
                { initialPath: '/', clickingTo: 'Login', visiblePage: 'login-page' },
                ],
        },
    }

    // Displays '$pageId' when path is '$path'
    it.each(config.routing.table)(config.routing.name, async ({ path, pageId }): Promise<void> => {
        await setup(path);
        const page = screen.queryByTestId(pageId);
        expect(page).toBeInTheDocument();
    });

    // Has link with title '$title' to '$path'
    it.each(config.link.table)(config.link.name, async ({ path, title }): Promise<void> => {
        await setup(path);
        const link = screen.queryByRole('link', { name: title });
        expect(link).toBeInTheDocument();
    });

    // Displays '$visiblePage' after clicking '$clickingTo' link
    it.each(config.navigation.table)(config.navigation.name, async ({ initialPath, clickingTo, visiblePage }): Promise<void> => {
        await setup(initialPath);
        const link = screen.getByRole('link', { name: clickingTo });
        await userEvent.click(link);
        const page = await screen.findByTestId(visiblePage);
        expect(page).toBeInTheDocument();
    });
});
