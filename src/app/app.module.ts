import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { LocalStorageService } from "../services/localStorage.service";
import { AuthService } from "../services/auth.service";
import { TicketService } from "../services/ticket.service";
import { SeatService } from "../services/seat.service";
import { TokenInterceptor } from "../interceptors/token.interceptor";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from "../app/auth/login/login.component";
import { IndexComponent } from "../app/index/index.component";
import { SeatsComponent } from "../app/index/seats/seats.component";
import { UsersComponent } from "../app/index/users/users.component";
import { RegisterComponent } from "../app/index/register/register.component";
import { NavbarComponent } from "../app/navbar/navbar.component";

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    IndexComponent,
    RegisterComponent,
    SeatsComponent,
    UsersComponent
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [LocalStorageService, AuthService, SeatService, TicketService, {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true,
  }],
  bootstrap: [AppComponent],
})
export class AppModule {}
