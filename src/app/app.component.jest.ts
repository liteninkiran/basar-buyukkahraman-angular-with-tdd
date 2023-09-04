import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { routes } from './router/app-router.module';
import { SharedModule } from './shared/shared.module';
import { SignUpComponent } from './sign-up/sign-up.component';

const setup = async (path: string): Promise<void> => {
    const { navigate } = await render(AppComponent, {
        declarations: [HomeComponent, SignUpComponent],
        imports: [HttpClientModule, SharedModule, ReactiveFormsModule],
        routes: routes,
    });
    await navigate(path);
}

describe('Routing', (): void => {
    const name = `Displays $pageId when path is $path`;
    const table = [
        { path: '/', pageId: 'home-page' },
        { path: '/signup', pageId: 'sign-up-page' },
        { path: '/login', pageId: 'login-page' },
        { path: '/user/1', pageId: 'user-page' },
        { path: '/user/2', pageId: 'user-page' },
    ];

    it.each(table)(name, async ({ path, pageId }): Promise<void> => {
        await setup(path);
        const page = screen.queryByTestId(pageId);
        expect(page).toBeInTheDocument();
    });
});
