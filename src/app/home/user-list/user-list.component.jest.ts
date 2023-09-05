import { HttpClientModule } from '@angular/common/http';
import { render, screen, waitFor } from '@testing-library/angular';
import { UserListComponent } from './user-list.component';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const data = {
    content: [
        { id: 1, username: 'user1', email: 'user1@mail.com' },
        { id: 2, username: 'user2', email: 'user2@mail.com' },
        { id: 3, username: 'user3', email: 'user3@mail.com' },
    ],
    page: 0,
    size: 3,
    totalPages: 6,
}
const url = '/api/1.0/users';
const resolver = (req: any, res: any, ctx: any) => res(ctx.status(200), ctx.json(data));
const handler = rest.get(url, resolver);
const server = setupServer(handler);

beforeAll(() => server.listen());
beforeEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('User List', (): void => {

    it('Displays three users in a list', async (): Promise<void> => {
        await render(UserListComponent, {
            imports: [HttpClientModule],
        });
        await waitFor((): void => expect(screen.queryAllByText(/user/).length).toBe(3));
    });

});
