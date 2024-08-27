import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { WEB_URL, SOL_DANCE_TOKEN_LOCAL_STORAGE} from '../../../constants';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from "../../../services/localStorage.service";
import { SeatService } from "../../../services/seat.service";

declare var bootstrap: any;

@Component({
  selector: "app-seats",
  templateUrl: "./seats.component.html",
  styleUrls: ['../../app.component.css'] 
})
export class SeatsComponent implements OnInit {

  @ViewChild('scrollContainer') scrollContainer: ElementRef | undefined;

  seatsConfig = [
    {label: "X", count: 32, middle: "11-24"},
    {label: "A", count: 35, middle: "12-24"},
    {label: "B", count: 37, middle: "12-26"},
    {label: "C", count: 39, middle: "13-27"},
    {label: "D", count: 39, middle: "13-27"},
    {label: "E", count: 41, middle: "14-28"},
    {label: "F", count: 41, middle: "14-28"},
    {label: "G", count: 43, middle: "15-29"},
    {label: "H", count: 43, middle: "15-29"},
    {label: "I", count: 39, middle: "13-27"},
    {label: "J", count: 45, middle: "16-30"},
    {label: "K", count: 45, middle: "16-30"},
    {label: "L", count: 45, middle: "16-30"},
    {label: "M", count: 45, middle: "16-30"},
    {label: "N", count: 45, middle: "16-30"},
    {label: "O", count: 45, middle: "16-30"},
    {label: "P", count: 43, middle: "15-29"},
    {label: "Q", count: 43, middle: "15-29"},
    {label: "R", count: 36, middle: "13-27"}]

  seatsAccessibility = [{label: "R", numbers: [1,2,11,12,13,14,15,16,24,25,26,27,28,29,38,39]}]

  seatsList :any[] = []
  seatsSelectedList :any[] = []
  availableUserSeats = 0
  
  loading :number = 0;
  loadingInterval :any;
  errorMessage:any = "";

  link:string = "";

  admin: boolean = false;

  seatModal: any;

  private seatModalShow: any;
  private saveSuccessModal: any;
  private errorMessageModal: any;

  constructor(private authService: AuthService, private route: ActivatedRoute, private localStorageService :LocalStorageService, private seatService :SeatService){}
  
  ngOnInit(): void {
    const token = this.route.snapshot?.queryParamMap?.get('t');
    if(token){
      this.localStorageService.setItem(SOL_DANCE_TOKEN_LOCAL_STORAGE, token);
    }
    this.authService.validateAuth();  
    this.seats()
    this.admin = this.authService.admin()
  }

  ngAfterViewInit() {
    this.centerScroll();
    this.initializeModal();
  }

  initializeModal(): void {
    const seatModalShowElement = document.getElementById('seatModalShow');
    if (seatModalShowElement) {
      this.seatModalShow = new bootstrap.Modal(seatModalShowElement);
    }

    const saveSuccessModalElement = document.getElementById('saveSuccessModal');
    if (saveSuccessModalElement) {
      this.saveSuccessModal = new bootstrap.Modal(saveSuccessModalElement);
    }

    const errorMessageModalElement = document.getElementById('errorMessageModal');
    if (errorMessageModalElement) {
      this.errorMessageModal = new bootstrap.Modal(errorMessageModalElement);
    }
  }

  seatsRowCountInit(seatsRow:any): number[] {
    let count = seatsRow.count
    let middleSplit = seatsRow.middle.split('-')
    let numbers = []
    for (let i = count; i > (middleSplit[1] as unknown as number); i--) {
      numbers.push(i);
    }
    return numbers;
  }

  seatsRowCountMiddle(seatsRow:any): number[] {
    let middleSplit = seatsRow.middle.split('-')
    let numbers = []
    for (let i = (middleSplit[1] as unknown as number); i >= (middleSplit[0] as unknown as number); i--) {
      numbers.push(i);
    }
    return numbers;
  }

  seatsRowCountEnd(seatsRow:any): number[] {
    let middleSplit = seatsRow.middle.split('-')
    let numbers = []
    for (let i = (middleSplit[0] as unknown as number) - 1; i >= 1; i--) {
      numbers.push(i);
    }
    return numbers;
  }

  validSeat(identifier: string, seat: number): any {
    let selected = this.seatsSelectedList?.some(seatItem => seatItem.identifier == identifier && seatItem.number == seat)
    let available = this.seatsList?.some(seatItem => seatItem.identifier == identifier && seatItem.number == seat && seatItem.isAvailable)
    let accessibility = this.seatsAccessibility?.some(a => a.label == identifier && a.numbers.includes(seat))
    return {'sc-seat-available': !selected && available, 'sc-seat-reserved': !selected && !available, 'sc-seat-selected': selected, 'div-accessibility': accessibility}
  }

  closeModal() {
    this.seatModalShow.hide();
    this.seatModal = undefined;
    this.saveSuccessModal.hide();
    this.errorMessageModal.hide();
    this.cleanErrorMessage();
  }

  selectSeat(identifier: string, seat: number): void {
    if(this.admin){
      this.seatModal = this.seatsList?.find(seatItem => seatItem.identifier == identifier && seatItem.number == seat && !seatItem.isAvailable);
      if(this.seatModal){
        this.seatModalShow.show();
        return;
      }
    }
    let selected = this.seatsSelectedList?.find(seatItem => seatItem.identifier == identifier && seatItem.number == seat)
    let seatSelected = this.seatsList?.find(seatItem => seatItem.identifier == identifier && seatItem.number == seat && seatItem.isAvailable)
    if(selected){
      this.seatsSelectedList.splice(this.seatsSelectedList.indexOf(selected), 1);
    }else if(seatSelected) {
      if(this.availableUserSeats && this.availableUserSeats > 0 && this.availableUserSeats > this.seatsSelectedList?.length){
        this.seatsSelectedList.push(seatSelected);
      }else{
        this.addErrorMessage("Limite de assentos atingido");
      }
    }
  }

  async seats(): Promise<void> {
    this.activeLoading()
    try{
      const resultSeatsUser = await this.seatService.seatsUser().toPromise();
      this.availableUserSeats = resultSeatsUser.available;
      const resultSeats = await this.seatService.seats().toPromise()
      this.seatsList = resultSeats.map((s:any) => {return {...s, isAvailable: s.isAvailable || resultSeatsUser.seats.some((su:any) => su.id == s.id)}});
      this.seatsSelectedList = resultSeatsUser.seats.map((s:any) => {return {...s, isAvailable: true}});
    }catch(error){
      this.addErrorMessage(error)
    }finally{
      this.disableLoading();
    } 
  }

  async salvar(): Promise<void> {
    this.activeLoading()
    try{
      await this.seatService.seatsSelected(this.seatsSelectedList.map(seat => seat.id)).toPromise();
      this.saveSuccessModal.show();
      this.cleanErrorMessage();
    }catch(error){
      this.addErrorMessage(error);
    }finally{
      this.disableLoading();
      this.seats();
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

  addErrorMessage(errorMessage:any): void{
    this.errorMessage = errorMessage;
    this.errorMessageModal.show();
  }

  cleanErrorMessage(): void{
    this.errorMessageModal.hide();
    this.errorMessage = "";
  }

  centerScroll() {
    const container: HTMLElement = this.scrollContainer?.nativeElement;
    const content: HTMLElement | null = container.querySelector('.sc-front');
    
    if (container && content) {
      // Calcule a diferença entre a largura do contêiner e do conteúdo
      const scrollOffset = (content.offsetWidth - container.offsetWidth) / 2;
      
      // Defina a posição inicial do scroll para que o conteúdo seja centralizado
      container.scrollLeft = scrollOffset;
    }
  }
}
