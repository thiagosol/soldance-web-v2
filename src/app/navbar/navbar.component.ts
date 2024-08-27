import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html" 
})
export class NavbarComponent implements OnInit {

  canRegister :boolean = false;

  constructor(private authService: AuthService, private router: Router){}
  
  ngOnInit(): void {
    this.authService.validateAuth();  
    this.canRegister = this.authService.admin();
  }

  users(): void {
    if(this.canRegister)
      this.router.navigate(['/users']);
  }

  register(): void {
    if(this.canRegister)
      this.router.navigate(['/register']);
  }

  seats(): void {
    this.router.navigate(['/seats']);
  }
}
