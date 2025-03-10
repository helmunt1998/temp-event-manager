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
    this.eventId = this.route.snapshot.paramMap.get('id');

    this.formDetail = this.form.group({
      eventName: ['', [Validators.required]],
      eventDate: ['', [Validators.required]],
      eventTime: ['', [Validators.required]],
      eventDescription: ['' ],
      eventLocation: ['', [Validators.required]]
    });
    
    this.eventService
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
