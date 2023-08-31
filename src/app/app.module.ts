import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';

@NgModule({
    declarations: [
        AppComponent,
        SignUpComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        SharedModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
