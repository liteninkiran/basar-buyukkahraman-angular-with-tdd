// Angular
import { HttpClientModule } from '@angular/common/http';
import { RenderComponentOptions, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

// MSW
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Components
import { UserListItemComponent } from '../user-list-item/user-list-item.component';
import { UserListComponent } from './user-list.component';
import { getPage } from './test-helper';

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

const setup = async (): Promise<void> => {
    const options: RenderComponentOptions<UserListComponent> = {
        imports: [HttpClientModule],
        declarations: [UserListItemComponent],
    }
    await render(UserListComponent, options);
}

describe('User List', (): void => {

    it('Displays three users in a list', async (): Promise<void> => {
        await setup();
        await waitFor((): void => expect(screen.queryAllByText(/user/).length).toBe(3));
    });

    it('Displays next page button', async (): Promise<void> => {
        await setup();
        await screen.findByText('user1');
        expect(screen.queryByText('Next >')).toBeInTheDocument();
    });

    it('Displays next page after clicking next page button', async (): Promise<void> => {
        await setup();
        await screen.findByText('user1');
        await userEvent.click(screen.getByText('Next >'));
        const firstUserInPage2 = await screen.findByText('user4');
        expect(firstUserInPage2).toBeInTheDocument();
    });

    it('Does not display next page at last page', async (): Promise<void> => {
        await setup();
        await screen.findByText('user1'); await userEvent.click(screen.getByText('Next >'));
        await screen.findByText('user4'); await userEvent.click(screen.getByText('Next >'));
        await screen.findByText('user7');
        expect(screen.queryByText('Next >')).not.toBeInTheDocument();
    });

    it('Does not display previous page button at first page', async (): Promise<void> => {
        await setup();
        await screen.findByText('user1');
        expect(screen.queryByText('< Previous')).not.toBeInTheDocument();
    });

    it('Displays previous page button in page 2', async (): Promise<void> => {
        await setup();
        await screen.findByText('user1'); await userEvent.click(screen.getByText('Next >'));
        await screen.findByText('user4');
        expect(screen.queryByText('< Previous')).toBeInTheDocument();
    });

    it('Displays previous page after clicking previous page button', async (): Promise<void> => {
        await setup();
        await screen.findByText('user1'); await userEvent.click(screen.getByText('Next >'));
        await screen.findByText('user4'); await userEvent.click(screen.getByText('< Previous'));
        const firstUserInPage1 = await screen.findByText('user1');
        expect(firstUserInPage1).toBeInTheDocument();
    });

    it('Displays spinner during the API call', async () => {
        await setup();
        const spinner = screen.getByRole('status')
        await screen.findByText('user1');
        expect(spinner).not.toBeInTheDocument();
    });

});


/*



findBy
------
Returns a promise which resolves when a matching element is found. The promise 
is rejected if no elements match or if more than one match is found after a 
default timeout of 1000 ms. If you need to find more than one element, then use 
findAllBy.



getBy
-----
Returns the first matching node for a query, and throw an error if no elements 
match or if more than one match is found. If you need to find more than one 
element, then use getAllBy.



queryBy
-------
Returns the first matching node for a query, and return null if no elements match. 
This is useful for asserting an element that is not present. This throws if more 
than one match is found (use queryAllBy instead).


Docs:
-----
https://callstack.github.io/react-native-testing-library/docs/api-queries
https://testing-library.com/docs/queries/about

*/
