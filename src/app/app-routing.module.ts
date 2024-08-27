import { NgModule, OnInit } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoginComponent } from "../app/auth/login/login.component";
import { IndexComponent } from "../app/index/index.component";
import { RegisterComponent } from "../app/index/register/register.component";
import { SeatsComponent } from "../app/index/seats/seats.component";
import { UsersComponent } from "../app/index/users/users.component";

const routes: Routes = [
  {
    path: "auth",
    component: LoginComponent,
    children: [
      { path: "login", component: LoginComponent },
      { path: "", redirectTo: "login", pathMatch: "full" },
    ],
  },
  { path: "register", component: RegisterComponent },
  { path: "seats", component: SeatsComponent },
  { path: "users", component: UsersComponent },
  { path: "", component: IndexComponent },
  { path: "**", redirectTo: "", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { 
}
