import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, type OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IEvent } from '../models/model';
import { WebApiService } from '../services/web-api.services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EventFormComponent implements OnInit {

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
    private readonly eventService: WebApiService) { }

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
      this.eventService.getEventById(this.eventId).subscribe((event: IEvent) => {
        this.IEvent = event;
        this.formDetail.patchValue({
          eventName: this.IEvent.name,
          eventDate: this.IEvent.date,
          eventTime: this.IEvent.time,
          eventDescription: this.IEvent.description,
          eventLocation: this.IEvent.location
        });
      }),
      (error: any) => {
        console.log("Ocurrio un error al traer el evento: ",error);
      }
    }
  }

  onEdit(): void {
    if (this.formDetail.valid) {
      this.createEvent();
    }
  }

  createEvent(): void {
    this.IEvent = {
      name: this.formDetail.get('eventName')?.value,
      description: this.formDetail.get('eventDescription')?.value,
      date: this.formDetail.get('eventDate')?.value,
      time: this.formDetail.get('eventTime')?.value,
      location: this.formDetail.get('eventLocation')?.value
    }
    console.log(this.IEvent);
  }
}
