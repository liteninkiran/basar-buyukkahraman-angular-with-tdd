import { HttpClientModule } from '@angular/common/http';
import { render, screen, waitFor } from '@testing-library/angular';
import { UserListComponent } from './user-list.component';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { getPage } from './user-list.component.spec';

const url = '/api/1.0/users';
const resolver = (req: any, res: any, ctx: any) => {
    let size = Number.parseInt(req.url.searchParams.get('size')!);
    let page = Number.parseInt(req.url.searchParams.get('page')!);
    if (Number.isNaN(size)) { size = 5; }
    if (Number.isNaN(page)) { page = 0; }
    return res(ctx.status(200), ctx.json(getPage(page, size)));
}
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
