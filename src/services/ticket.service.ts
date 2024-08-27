import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  constructor(private http: HttpClient){}

 
  updateAmount(userId?:number, amount?:number): Observable<any> {
    return this.http.post(`${API_URL}/tickets/user/${userId}/updateAmount/${amount}`, {});
  }

}