import { Injectable } from '@angular/core';
import { LocalStorageService } from './localStorage.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL, SOL_DANCE_TOKEN_LOCAL_STORAGE} from '../constants';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private localStorageService: LocalStorageService, private router: Router, private http: HttpClient){}

  validateAuth(): void {
    const solDanceToken = this.localStorageService.getItem(SOL_DANCE_TOKEN_LOCAL_STORAGE);
    if (!solDanceToken) {
      this.router.navigate(['/auth/login']);
    }
  }

  admin(): boolean {
    const solDanceToken = this.localStorageService.getItem(SOL_DANCE_TOKEN_LOCAL_STORAGE);
    if(!solDanceToken)
      return false
    
    const decodedToken = jwt_decode(solDanceToken) as any;
    return decodedToken?.sub == "admin";
  }

  login(username :string, password :string): Observable<any> {
    return this.http.post(`${API_URL}/users/login`, {username: username, password: password});
  }

  register(user :any): Observable<any> {
    return this.http.post(`${API_URL}/users/automatic-registration`, user);
  }

  logged(): Observable<any> {
    return this.http.get(`${API_URL}/users/logged`);
  }

  users(): Observable<any> {
    return this.http.get(`${API_URL}/users`);
  }

  usersById(id?:number): Observable<any> {
    return this.http.get(`${API_URL}/users/${id}`);
  }

  update(id? :number, user? :any): Observable<any> {
    return this.http.post(`${API_URL}/users/${id}/update`, user);
  }

  generateNewLink(id?:number): Observable<any> {
    return this.http.post(`${API_URL}/users/generate-new-token/user/${id}`, {});
  }

  updatePassword(password:string): Observable<any> {
    return this.http.post(`${API_URL}/users/password`, {password});
  }
}