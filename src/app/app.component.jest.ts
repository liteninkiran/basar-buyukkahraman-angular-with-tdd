// Angular
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { ActivateComponent } from './activate/activate.component';
import { UserListComponent } from './home/user-list/user-list.component';

// Modules
import { SharedModule } from './shared/shared.module';
import { routes } from './router/app-router.module';

// MSW
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { UserListItemComponent } from './home/user-list-item/user-list-item.component';

const data = {
    content: [ { id: 1, username: 'user1', email: 'user1@email.com' } ],
    page: 0,
    size: 3,
    totalPages: 1,
}
const tokenUrl = '/api/1.0/users/token/:token';
const userUrl = '/api/1.0/users';
const tokenResolver = (req: any, res: any, ctx: any) => res(ctx.status(200));
const userResolver = (req: any, res: any, ctx: any) => res(ctx.status(200), ctx.json(data));

const tokenHandler = rest.post(tokenUrl, tokenResolver);
const userHandler = rest.get(userUrl, userResolver);
const server = setupServer(tokenHandler, userHandler);

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
            UserListComponent,
            UserListItemComponent,
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

    // Displays correct pageId for each path
    it.each(config.routing.table)(config.routing.name, async ({ path, pageId }): Promise<void> => {
        await setup(path);
        const page = screen.queryByTestId(pageId);
        expect(page).toBeInTheDocument();
    });

    // Has link with correct title for each path
    it.each(config.link.table)(config.link.name, async ({ path, title }): Promise<void> => {
        await setup(path);
        const link = screen.queryByRole('link', { name: title });
        expect(link).toBeInTheDocument();
    });

    // Displays correct page after clicking each link
    it.each(config.navigation.table)(config.navigation.name, async ({ initialPath, clickingTo, visiblePage }): Promise<void> => {
        await setup(initialPath);
        const link = screen.getByRole('link', { name: clickingTo });
        await userEvent.click(link);
        const page = await screen.findByTestId(visiblePage);
        expect(page).toBeInTheDocument();
    });

    it('Navigates to the user page when clicking the username on user list', async (): Promise<void> => {
        await setup('/');
        const userListItem = await screen.findByText('user1');
        await userEvent.click(userListItem);
        const page = await screen.findByTestId('user-page');
        expect(page).toBeInTheDocument();
    });
});
