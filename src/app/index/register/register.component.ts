import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { WEB_URL} from '../../../constants';
import { TicketService } from "../../../services/ticket.service";
import { v4 as uuidv4 } from 'uuid';

declare var bootstrap: any;

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ['../../app.component.css'] 
})
export class RegisterComponent implements OnInit {
  
  private modal: any;
  private saveSuccessModal: any;

  id? :any;
  
  userRegister = {
    user: "",
    name: "",
    phone: "",
    amountTickets: 0
  }

  loading :number = 0;
  loadingInterval :any;
  errorMessage:any = "";

  link:string = "";

  newTicketAmount:number = 0;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private ticketService: TicketService){}
  
  ngAfterViewInit(): void {
    this.initializeModal();
  }

  initializeModal(): void {
    const amountModalElement = document.getElementById('amountModal');
    if (amountModalElement) {
      this.modal = new bootstrap.Modal(amountModalElement);
    }

    const saveSuccessModalElement = document.getElementById('saveSuccessModal');
    if (saveSuccessModalElement) {
      this.saveSuccessModal = new bootstrap.Modal(saveSuccessModalElement);
    }
  }

  ngOnInit(): void {
    this.authService.validateAuth();  
    if(!this.authService.admin())
      this.router.navigate(['/']);
    this.id = this.route.snapshot.queryParams['id'];
    if(this.id){
      this.userById();
    }
  }

  async register(): Promise<void> {
    this.activeLoading()
    try{
      const userToRegister = {
        ...this.userRegister,
        user: uuidv4()
      }
      const result = await this.authService.register(userToRegister).toPromise();
      if(result?.token){
        this.link = WEB_URL + "/seats?t=" + result.token
      }
      this.id = result.id;
      this.cleanErrorMessage();
    }catch(error){
      this.errorMessage = error
    }finally{
      this.disableLoading();
      this.userById();
    } 
  }

  async update(): Promise<void> {
    this.activeLoading()
    try{
      await this.authService.update(this.id, this.userRegister).toPromise();
      this.saveSuccessModal.show();
      this.cleanErrorMessage();
    }catch(error){
      this.errorMessage = error
    }finally{
      this.disableLoading();
    } 
  }

  async generateLink(): Promise<void> {
    this.activeLoading()
    try{
      const result = await this.authService.generateNewLink(this.id).toPromise();
      if(result?.token){
        this.link = WEB_URL + "/seats?t=" + result.token
      }
      this.cleanErrorMessage();
    }catch(error){
      this.errorMessage = error
    }finally{
      this.disableLoading();
    } 
  }

  async updateAmount(): Promise<void> {
    this.activeLoading()
    try{
      await this.ticketService.updateAmount(this.id, this.newTicketAmount).toPromise();
      this.cleanErrorMessage();
      this.saveSuccessModal.show();
      this.disableLoading();
      this.userById();
    }catch(error){
      this.errorMessage = error
      this.disableLoading();
    } finally {
      this.modal.hide();
    }
  }

  closeModal() {
    this.saveSuccessModal.hide();
    this.modal.hide();
  }

  async userById(): Promise<void> {
    this.activeLoading()
    try{
      const result = await this.authService.usersById(this.id).toPromise();
      this.userRegister = {
        user: result.user,
        name: result.name,
        phone: result.phone,
        amountTickets: result.tickets.reduce((acc :any, r :any) => acc + r.amount, 0)
      }
      this.newTicketAmount = this.userRegister.amountTickets;
      this.cleanErrorMessage();
    }catch(error){
      this.errorMessage = error
    }finally{
      this.disableLoading();
    } 
  }

  newAmount() {
    this.newTicketAmount = this.userRegister.amountTickets;
    this.modal.show();
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

  cleanErrorMessage(): void{
    this.errorMessage = "";
  }

  copyToClipboard() {
    const textarea = document.createElement('textarea');
    textarea.value = this.link;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  shareLink(): void {
    if (navigator.share) {
      navigator.share({
        title: 'Compartilhar link',
        text: 'Espetáculo Realeza\n\nEscolha o(s) seu(s) assento(s)' +
        '\n\nÉ super simples, basta realizar a seleção do(s) assento(s) desejados e clicar em salvar, ' +
        'mas não se esqueça, se não "salvar" a sua escolha não será registrada. ' +
        'Após salvar você pode imprimir ou compartilhar a imagem com os detalhes dos assentos escolhidos.\n\n',
        url: this.link
      }).then(() => {
        console.log('Texto compartilhado com sucesso!');
      }).catch((error) => {
        console.error('Erro ao compartilhar:', error);
      });
    } else {
      alert('O compartilhamento não é suportado neste navegador.');
    }
  }
}
