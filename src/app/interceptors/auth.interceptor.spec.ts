import { HttpErrorResponse } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { TestBed } from "@angular/core/testing";

describe('AuthInterceptor', () => {  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useValue: authInterceptor, multi: true },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(authInterceptor).toBeTruthy();
  });

  it('should navigate to /log-out on 401 error', () => {
    httpClient.get('/test').subscribe(
      () => fail('should have failed with 401 error'),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(localStorage.getItem('error')).toBe('401');
        expect(router.navigate).toHaveBeenCalledWith(['/log-out']);
      }
    );

    const req = httpMock.expectOne('/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should not navigate on non-401 error', () => {
    httpClient.get('/test').subscribe(
      () => fail('should have failed with 500 error'),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(localStorage.getItem('error')).toBeNull();
        expect(router.navigate).not.toHaveBeenCalled();
      }
    );

    const req = httpMock.expectOne('/test');
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });
  });
});
