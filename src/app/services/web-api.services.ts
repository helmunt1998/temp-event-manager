import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthPpe, cardServiceStatus, IEvent, RequestBodyInquiry, RequestBodyModify } from '../models/model';
import { Observable, catchError, pipe } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebApiService {
  private readonly genApi: string = environment.apiMain;
  private authRoute: string = environment.authApi;
  private readonly apiInquiry: string = environment.apiInquiry;
  private apiModify: string = environment.apiModify;

  constructor(private http: HttpClient) { }

  getAuth(): Observable<AuthPpe> {
    let params = new HttpParams()
      .set('ppe', localStorage.getItem('ppe')!)
      .set('sid', localStorage.getItem('sid')!);
    const url = `${this.authRoute}`;
    return this.http.get<AuthPpe>(url, { params }).pipe(
      catchError((e) => {
        throw e;
      })
    );
  }

  getCardProductInquiry(requestBody: RequestBodyInquiry): Observable<RequestBodyInquiry> {
    const url = `${this.genApi}/${this.apiInquiry}`;
    return this.http.post<RequestBodyInquiry>(url, requestBody).pipe(
      catchError((e) => {
        throw e;
      })
    );
  }

  modifyDebitCard(requestBodyModify: RequestBodyModify): Observable<cardServiceStatus> {
    const url = `${this.genApi}/${this.apiModify}`;
    return this.http.post<cardServiceStatus>(url, requestBodyModify).pipe(
      catchError((e) => {
        throw e;
      })
    );
  }

  getEvents(): Observable<IEvent[]> {
    return this.http.get<IEvent[]>(this.apiInquiry).pipe(
      catchError((e) => {
        throw e;
      })
    );
  }

  getEventById(id: number): Observable<any> {
    return this.http.get<IEvent>(`${this.genApi}/${id}`);
  }

  createEvent(eventData: any): Observable<any> {
    return this.http.post<any>(this.apiInquiry, eventData);
  }

  updateEvent(id: number, eventData: any): Observable<any> {
    return this.http.put<any>(`${this.apiInquiry}/${id}`, eventData).pipe(
      catchError((e) => {
        throw e;
      })
    );
  }

  deleteEvent(id: number): Observable<IEvent> {
    return this.http.delete<IEvent>(`${this.genApi}/${id}`);
  }
}
