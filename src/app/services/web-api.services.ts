import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEvent } from '../models/model';
import { Observable, catchError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebApiService {
  private readonly genApi: string = environment.apiMain;
  private readonly apiInquiry: string = environment.apiInquiry;

  constructor(private readonly http: HttpClient) { }

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

  createEvent(eventData: IEvent): Observable<any> {
    return this.http.post<IEvent>(this.genApi, eventData).pipe(
      catchError((e) => {
        throw e;
      })
    );;
  }

  updateEvent(id: number, eventData: IEvent): Observable<any> {
    return this.http.put<IEvent>(`${this.genApi}/${id}`, eventData).pipe(
      catchError((e) => {
        throw e;
      })
    );
  }

  deleteEvent(id: number): Observable<IEvent> {
    return this.http.delete<IEvent>(`${this.genApi}/${id}`);
  }
}
