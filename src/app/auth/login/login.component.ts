import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../services/auth.service";
import { SOL_DANCE_TOKEN_LOCAL_STORAGE} from '../../../constants';
import { LocalStorageService } from "../../../services/localStorage.service";
import { Router } from "@angular/router";


@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ['../../app.component.css'] 
})
export class LoginComponent implements OnInit {

  username :string = "";
  password :string = "";
  errorMessage:string = "";
  loading :number = 0;
  loadingInterval :any;

  constructor(private authService :AuthService, private localStorageService: LocalStorageService, private router: Router) {}

  ngOnInit(): void {}

  async login(): Promise<void> {
    this.activeLoading()
    try{
      this.localStorageService.removeItem(SOL_DANCE_TOKEN_LOCAL_STORAGE);
      const result = await this.authService.login(this.username, this.password).toPromise();
      if(result?.token){
        this.localStorageService.setItem(SOL_DANCE_TOKEN_LOCAL_STORAGE, result.token)
        this.router.navigate(['/']);
      }
    }catch(error){
      this.errorMessage = "Usuário ou senha inválidos"
    }finally{
      this.disableLoading();
    } 
  }

  cleanErrorMessage(): void{
    this.errorMessage = "";
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
}
