import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, type OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IEvent } from '../models/model';
import { WebApiService } from '../services/web-api.services';
import { ActivatedRoute, Router, Navigation } from '@angular/router';
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

  navigation: Navigation | null = null;
  currentMode: string = 'full-edit'
  @ViewChild('editedToast') toast!: ElementRef;
  buttonText: string = 'Editar';
  buttonActive: boolean = false;
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
    private readonly router: Router) { 
      const navigation = this.router.getCurrentNavigation();
      this.navigation = navigation;
    }

  formDetail!: FormGroup;

  ngOnInit(): void {
    if(this.navigation?.extras.state) {
      const modeForm = this.navigation.extras.state['mode'];
      if(modeForm === 'add-event'){
        this.buttonText = 'Agregar';
        this.currentMode = modeForm; 
      } else if(modeForm === 'only-view'){
        this.inputStatus = 'DISABLED';
        this.buttonText = 'Volver atrás';
        this.currentMode = modeForm;
      }
    }
    
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
          this.toastService.openToast(
            'Error',
            'Ocurrió un error al intentar traer el evento',
            'ERROR'
          );
          console.log("Ocurrio un error al traer el evento: ", error);
        }
      });
    }
  }

  formatDate(date: string): string {
    const dateArr = date.split('-');
    return `${dateArr[0]}/${dateArr[1]}/${dateArr[2].split('T')[0]}`;
  }

  formatBackDate(date: string): string {
    const dateArr = date.split('/');
    return `${dateArr[0]}-${dateArr[1]}-${dateArr[2]}T05:00:00+00:00`;
  }

  onEdit(): void {
    if (this.formDetail.valid) {
      if(this.currentMode === 'full-edit'){
        this.editEvent();
      } else if(this.currentMode === 'add-event'){
        this.addEvent();
      } else if(this.currentMode === 'only-view'){
        this.router.navigate(['/fetch-events']);
      }
    }
  }

  addEvent(): void {
    this.IEvent = {
      name: this.formDetail.get('eventName')?.value,
      description: this.formDetail.get('eventDescription')?.value,
      date: this.formatBackDate(this.formDetail.get('eventDate')?.value),
      time: this.formDetail.get('eventTime')?.value,
      location: this.formDetail.get('eventLocation')?.value
    }

    this.eventService.createEvent(this.IEvent).subscribe({
      next: (event: IEvent) => {
        console.log("Evento creado: ", event);
        this.toastService.openToast(
          '¡Confirmado!',
          'El evento ha sido creado correctamente',
          'SUCCESS'
        );
        this.inputStatus = 'DISABLED';
        this.buttonActive = true;
        setTimeout(() => {
          this.router.navigate(['/fetch-events']);
        }, 5000);
      },
      error: (error: any) => {
        console.log("Ocurrio un error al crear el evento: ", error);
        this.toastService.openToast(
          'Error',
          'Ocurrió un error al intentar crear el evento',
          'ERROR'
        );
      }
    });
    
    console.log(this.IEvent);
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
          this.buttonActive = true;
          setTimeout(() => {
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
