import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, type OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IEvent } from '../models/model';
import { WebApiService } from '../services/web-api.services';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../services/modal/toast.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EventFormComponent implements OnInit {

  @ViewChild('editedToast') toast!: ElementRef;
  eventId: number | null = null;
  inputStatus: string = 'ENABLED';
  IEvent: IEvent = {
    id: 0,
    name: '',
    description: '',
    date: '',
    time: '',
    location: ''
  }
  constructor(
    private readonly form: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly toastService: ToastService, 
    private readonly eventService: WebApiService,
    private readonly router: Router) { }

  formDetail!: FormGroup;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.eventId = idParam !== null ? Number(idParam) : null;

    this.formDetail = this.form.group({
      eventName: ['', [Validators.required]],
      eventDate: ['', [Validators.required]],
      eventTime: ['', [Validators.required]],
      eventDescription: ['' ],
      eventLocation: ['', [Validators.required]]
    });
    
    if (this.eventId !== null) {
      this.eventService.getEventById(this.eventId).subscribe({
        next: (event: IEvent) => {
          this.IEvent = event;
          this.formDetail.patchValue({
            eventName: this.IEvent.name,
            eventDate: this.formatDate(this.IEvent.date),
            eventTime: this.IEvent.time,
            eventDescription: this.IEvent.description,
            eventLocation: this.IEvent.location
          });
        },
        error: (error: any) => {
          
          console.log("Ocurrio un error al traer el evento: ", error);
        }
      });
    }
  }

  // Formatea la fecha para mostrarla en el input el formato origen es yyyy-mm-ddT00:00:00+00:00, el formato destino es yyyy/mm/dd
  formatDate(date: string): string {
    const dateArr = date.split('-');
    return `${dateArr[0]}/${dateArr[1]}/${dateArr[2].split('T')[0]}`;
  }

  formatBackDate(date: string): string {
    const dateArr = date.split('/');
    return `${dateArr[0]}-${dateArr[1]}-${dateArr[2]}T00:00:00+00:00`;
  }

  onEdit(): void {
    if (this.formDetail.valid) {
      this.editEvent();
    }
  }

  editEvent(): void {
    this.IEvent = {
      name: this.formDetail.get('eventName')?.value,
      description: this.formDetail.get('eventDescription')?.value,
      date: this.formatBackDate(this.formDetail.get('eventDate')?.value),
      time: this.formDetail.get('eventTime')?.value,
      location: this.formDetail.get('eventLocation')?.value
    }
    if (this.eventId !== null) {
      this.eventService.updateEvent(this.eventId, this.IEvent).subscribe({
        next: (event: IEvent) => {
          console.log("Evento actualizado: ", event);
          this.toastService.openToast(
            '¡Confirmado!',
            'El evento ha sido editado correctamente',
            'SUCCESS'
          );
          this.inputStatus = 'DISABLED';
          setTimeout(() => {
            this.toast.nativeElement.close();
            this.router.navigate(['/fetch-events']);
          }, 5000);
        },
        error: (error: any) => {
          console.log("Ocurrio un error al actualizar el evento: ", error);
          this.toastService.openToast(
            'Error',
            'Ocurrió un error al intentar editar el evento',
            'ERROR'
          );
        }
      });
    }
    console.log(this.IEvent);
  }
}
