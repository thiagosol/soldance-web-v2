import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LocalStorageService } from '../services/localStorage.service';
import { SOL_DANCE_TOKEN_LOCAL_STORAGE} from '../constants';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private localStorageService: LocalStorageService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const solDanceToken = this.localStorageService.getItem(SOL_DANCE_TOKEN_LOCAL_STORAGE);
        
        if (solDanceToken) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${solDanceToken}`,
                },
            });
        }
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
              let errorMessage = 'Ocorreu um erro desconhecido.';
              if (error?.error?.message) {
                errorMessage = `Erro: ${error.error.message}`;
              } else if (error.status === 401) {
                errorMessage = 'Não autorizado.';
              } else if (error.status === 403) {
                errorMessage = 'Permissão negada.';
              } else if (error.status === 404) {
                errorMessage = 'Recurso não encontrado.';
              }
              console.error(errorMessage);
              return throwError(errorMessage);
            })
          );
    }
}
