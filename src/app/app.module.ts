// Modules
import { NgModule } from '@angular/core';
import { SharedModule } from './shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AppRouterModule } from './router/app-router.module';
import { ActivateComponent } from './activate/activate.component';
import { UserListComponent } from './home/user-list/user-list.component';
import { ProfileCardComponent } from './user/profile-card/profile-card.component';
import { UserListItemComponent } from './home/user-list-item/user-list-item.component';

@NgModule({
    declarations: [
        AppComponent,
        SignUpComponent,
        HomeComponent,
        LoginComponent,
        UserComponent,
        ActivateComponent,
        UserListComponent,
        UserListItemComponent,
        ProfileCardComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        SharedModule,
        ReactiveFormsModule,
        AppRouterModule,
        FormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
