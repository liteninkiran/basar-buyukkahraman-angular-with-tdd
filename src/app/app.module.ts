import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { AppRouterModule } from './router/app-router.module';

@NgModule({
    declarations: [
        AppComponent,
        SignUpComponent,
        HomeComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        SharedModule,
        ReactiveFormsModule,
        AppRouterModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
