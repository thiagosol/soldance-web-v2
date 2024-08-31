import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { AuthService } from "../../../services/auth.service";
import { SOL_DANCE_TOKEN_LOCAL_STORAGE} from '../../../constants';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from "../../../services/localStorage.service";
import { SeatService } from "../../../services/seat.service";


import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

declare var bootstrap: any;

@Component({
  selector: "app-seats",
  templateUrl: "./seats.component.html",
  styleUrls: ['../../app.component.css'] 
})
export class SeatsComponent implements OnInit {

  @ViewChild('scrollContainer') scrollContainer: ElementRef | undefined;

  receiptStrLoading = "Carregando...";
  receipt = {
    name: this.receiptStrLoading,
    ticketsAmount: 0,
    ticketsLeft: 0,
    tickets: this.receiptStrLoading
  }

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
  private loadingModal: any;

  constructor(private authService: AuthService, 
    private route: ActivatedRoute, 
    private localStorageService :LocalStorageService, 
    private seatService :SeatService){}
  
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

    const loadingModalElement = document.getElementById('loadingModal');
    if (loadingModalElement) {
      this.loadingModal = new bootstrap.Modal(loadingModalElement);
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
      const scrollOffset = (content.offsetWidth - container.offsetWidth) / 2;
      container.scrollLeft = scrollOffset;
    }
  }

  async generatePDFShare(type:any = "Share") {
    this.loadingModal.show()
    try{
      const resultSeatsUser = await this.seatService.seatsUser().toPromise();
      const resultUserLogged = await this.authService.logged().toPromise();

      const ticketsAmount = resultSeatsUser.available;
      const ticketsLeft = ticketsAmount - resultSeatsUser.seats.length;
      const tickets = resultSeatsUser.seats.length > 0 ? resultSeatsUser.seats.map((s:any) => s.identifier + "-" + s.number) .join(", ") : "Não escolhido(s)"

      this.receipt = {
        name: resultUserLogged.name,
        ticketsAmount: ticketsAmount,
        ticketsLeft: ticketsLeft,
        tickets: tickets
      }

      let conditionMet = false;
      let startTime = Date.now();
      const maxDuration = 5000;

      const intervalId = setInterval(() => {
        if (conditionMet || Date.now() - startTime > maxDuration) {
          this.loadingModal.hide()
          if(!conditionMet){
            this.addErrorMessage("Ocorreu um erro, tente novamente.")
          }
          clearInterval(intervalId);
        } else {
          try {
            const section = document.getElementById('receipt-section');
            if (!section) throw new Error("Receipt-section not found");;
            section.style.display = 'block';
            const canvasOptions = {
              scale: 2,
              width: section.offsetWidth,
              height: section.offsetHeight,
              useCORS: true,
            };

            conditionMet = !section.innerText.includes(this.receiptStrLoading)

            if(conditionMet){
              html2canvas(section, canvasOptions).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg')
  
                if(type == 'PDF') {
                  const imgWidth = section.offsetWidth;
                  const imgHeight = section.offsetHeight;
                  const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [imgWidth, imgHeight],
                  });
  
                  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                  pdf.save('assentos-espetaculo-realeza-soldance.pdf');
  
                } else {
                  fetch(imgData)
                  .then(res => res.blob())
                  .then(blob => {
                    const file = new File([blob], 'assentos-espetaculo-realeza-soldance.jpg', { type: 'image/jpeg' });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                      navigator.share({
                        title: 'Soldance - Realeza - Assentos escolhidos',
                        files: [file],
                      })
                      .then(() => console.log('Imagem compartilhada com sucesso!'))
                      .catch(error => console.error('Erro ao compartilhar a imagem:', error));
                    } else {
                      console.log('API Web Share não é suportada ou o compartilhamento de arquivos não é suportado.');
                    }
                  });
                }
                section.style.display = 'none';
              });
            }
          } catch (error) {
            this.loadingModal.hide()
            console.log(error)
            this.addErrorMessage("Ocorreu um erro, tente novamente.")
            clearInterval(intervalId);
          }
        }
      }, 200);
    }catch(error){
      console.log(error)
      this.loadingModal.hide()
      this.addErrorMessage("Ocorreu um erro, tente novamente.")
    } 
  }
  
}
