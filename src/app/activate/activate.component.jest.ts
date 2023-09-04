import { HttpClientModule } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import { render, screen, waitFor } from "@testing-library/angular";
import { Observable, Subscriber } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { ActivateComponent } from "./activate.component";
import { setupServer } from 'msw/node';
import { rest } from 'msw';

type RouteParams = {
    id: string,
}

let subscriber!: Subscriber<RouteParams>;

const setup = async () => {
    const observable = new Observable<RouteParams>(sub => subscriber = sub);
    await render(ActivateComponent, {
        declarations: [AlertComponent],
        imports: [HttpClientModule],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: observable,
                },
            },
        ],
    });
}

let counter = 0;

const url = '/api/1.0/users/token/:token';
const requestHandler = rest.post(url, (req, res, ctx) => {
    counter += 1;
    return req.params['token'] === '456'
        ? res(ctx.status(400), ctx.json({}))
        : res(ctx.status(200));
});
const server = setupServer(requestHandler);

beforeEach((): void => {
    counter = 0;
    server.resetHandlers();
});
beforeAll((): void => server.listen());
afterAll((): void => server.close());

describe('Account Activation Page', (): void => {

    it('Sends account activation request', async (): Promise<void> => {
        await setup();
        subscriber.next({ id: '123' });
        await waitFor(() => expect(counter).toBe(1));
    });

    it('Displays activation success message when token is valid', async (): Promise<void> => {
        await setup();
        subscriber.next({ id: '123' });
        const message = await screen.findByText('Account is activated');
        expect(message).toBeInTheDocument();
    });

    it('Displays activation failure message when token is invalid', async (): Promise<void> => {
        await setup();
        subscriber.next({ id: '456' });
        const message = await screen.findByText('Activation failure');
        expect(message).toBeInTheDocument();
    });
})