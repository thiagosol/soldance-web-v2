import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class SeatService {
  constructor(private http: HttpClient){}

 
  seats(): Observable<any> {
    return this.http.get(`${API_URL}/seats`);
  }

  seatsUser(): Observable<any> {
    return this.http.get(`${API_URL}/seats/user`);
  }

  seatsSelected(ids:number[]): Observable<any> {
    return this.http.post(`${API_URL}/seats/selected`, {ids});
  }
}