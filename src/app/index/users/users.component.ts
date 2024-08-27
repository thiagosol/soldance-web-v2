import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { WEB_URL} from '../../../constants';

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ['../../app.component.css'] 
})
export class UsersComponent implements OnInit {

  users: any[] = []

  loading :number = 0;
  loadingInterval :any;

  link:string = "";

  constructor(private authService: AuthService, private router: Router){}
  
  ngOnInit(): void {
    this.authService.validateAuth();  
    if(!this.authService.admin())
      this.router.navigate(['/']);
    this.getUsers();
  }

  async getUsers(): Promise<void> {
    this.activeLoading()
    try{
      const result = await this.authService.users().toPromise() as any;
      this.users = result.map((r :any) => {
        const tickets = r.tickets.reduce((acc:any, r:any) => acc + r.amount, 0)
        const seats = r.seats.length > 0 ? r.seats.map((s:any) => s.identifier + "-" + s.number) .join(", ") : "Não escolhido(s)"
        return {...r, tickets, seats}
      });
      console.log(this.users);
    }catch(error){
      console.log(error)
    }finally{
      this.disableLoading();
    } 
  }

  activeLoading(): void {
    const loop = () => {
      this.loading = this.loading == 100 ? 1 : this.loading + 1
    }
    this.loadingInterval = setInterval(loop, 1);
  }

  disableLoading(): void{
    this.loading = 0;
    if(this.loadingInterval){
      clearInterval(this.loadingInterval)
    }
  }

  register(): void {
    this.router.navigate(['/register']);
  }

  edit(id:number): void {
    this.router.navigate(['/register'], {queryParams: { id }});
  }
}
