import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = environment.authApi;
  private readonly tokenKey = 'token';
  private readonly expiresInKey = 'expiresIn';
  private readonly authStatus = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private readonly http: HttpClient) { }

  loginUser(username: string, password: string): Observable<boolean> {
    return this.http.post<{ token: string; expiresIn: number }>(this.apiUrl, { username, password }).pipe(
      map(response => {
        if (response.token) {
          this.storeToken(response.token, response.expiresIn);
          this.authStatus.next(true);
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.authStatus.next(false);
        return of(false);
      })
    )
  }

  private storeToken(token: string, expiresIn: number): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.expiresInKey, (Date.now() + expiresIn * 1000).toString());
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const expiration = localStorage.getItem(this.expiresInKey);
    return expiration ? Date.now() < parseInt(expiration, 10) : false;
  }

  getAuthStatus(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

}
