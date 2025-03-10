import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {

  const router = inject(Router);
  const authToken = inject(AuthService).getToken();
  if (authToken) {
    const newReq = req.clone({
      headers: req.headers.append('Authorization', `Bearer ${authToken}`),    
    });
    return next(newReq);
  } else{
    return next(req);
  }


  // return next(req).pipe(
  //   catchError((error: HttpErrorResponse) => {
  //     console.error('Error HTTP:', error);
  //     if (error.status === 401 || error.status === 404 ) {
  //       router.navigate(['/error', error.status]);
  //     } else if(error.status === 428) {
  //       let customMessage = 'An unexpected error occurred';
  //       let customDescription = 'Please contact the administrator';
  //       if (error.error && typeof error.error === 'object') {
  //         customMessage = error.error.funcionalMessage || customMessage;
  //         console.log('funcionalMessage: ', customMessage);
  //         customDescription = error.error.tecMessage || customDescription;
  //         console.log('tecMessage: ', customDescription);
  //       }
  //       router.navigate(['/error', error.status], { state: { funcionalMessage: customMessage } });
  //     }
  //     return throwError(() => error);
  //   })
  // );

}
