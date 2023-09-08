import { HttpClientModule } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import { render, screen, waitFor } from "@testing-library/angular";
import { Observable, Subscriber } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { UserComponent } from "./user.component";
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { ProfileCardComponent } from "./profile-card/profile-card.component";

type RouteParams = {
    id: string,
}

let subscriber!: Subscriber<RouteParams>;

const testUser =  {
    id: 1,
    username: 'user1',
    email: 'user1@mail.com',
}

const setup = async (): Promise<void> => {
    const observable = new Observable<RouteParams>(sub => subscriber = sub);
    const moduleDef = {
        declarations: [
            AlertComponent,
            ProfileCardComponent,
        ],
        imports: [
            HttpClientModule,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: observable,
                },
            },
        ],
    }
    await render(UserComponent, moduleDef);
}

let counter = 0;

const url = '/api/1.0/users/:id';
const resolver = (req: any, res: any, ctx: any) => {
    counter += 1;
    const err = req.params['id'] === '2';
    const obj = err ? {} : testUser;
    const status = err ? 404 : 200;
    return res(ctx.status(status), ctx.json(obj));
}
const handler = rest.get(url, resolver);
const server = setupServer(handler);

beforeEach((): void => {
    counter = 0;
    server.resetHandlers();
});
beforeAll((): void => server.listen());
afterAll((): void => server.close());

describe('User Page', (): void => {

    it('Sends request to get user data', async (): Promise<void> => {
        await setup();
        subscriber.next({ id: testUser.id.toString() });
        await waitFor(() => expect(counter).toBe(1));
    });

    it('Displays user name on page when user is found', async (): Promise<void> => {
        await setup();
        subscriber.next({ id: testUser.id.toString() });
        const header = await screen.findByRole('heading', { name: testUser.username });
        expect(header).toBeInTheDocument();
    });

    it('Displays error when user not found', async (): Promise<void> => {
        await setup();
        subscriber.next({ id: '2' });
        const message = await screen.findByText('User not found');
        expect(message).toBeInTheDocument();
    });

    it('Displays spinner during user get request', async (): Promise<void> => {
        await setup();
        subscriber.next({ id: testUser.id.toString() });
        const spinner = await screen.findByRole('status');
        await screen.findByText(testUser.username);
        expect(spinner).not.toBeInTheDocument();
    });
})