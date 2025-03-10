import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { WebApiService } from '../services/web-api.services';
import { IEvent } from '../models/model';
import { ModalService } from '../services/modal/modal.service';
import { ToastService } from '../services/modal/toast.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EventListComponent implements AfterViewInit {

  @ViewChild('modalNotification') modalNotification!: ElementRef;
  @ViewChild('simpleToast') toast!: ElementRef;
  description: string = 'Descripción del error: ';
  detail: string = 'Detalles: ';
  eventValue: any[] = [];
  rowTable: any[] = [];
  actionValue: number = 0;
  columnTable = [
    { colName: "", control: "id" },
    { colName: "Título del evento", control: "text" },
    { colName: "Fecha", control: "text" },
    { colName: "Hora", control: "text" },
    { colName: "Descripción", control: "text" },
    { colName: "Ubicación", control: "text" },
    { colName: "Editar evento", control: "ico-action" },
    { colName: "Elminar evento", control: "ico-action" },
  ];
  validDelete = ['ico-add-delete'];
  validEdit = ['ico-write-edit'];

  constructor(
    private readonly eventService: WebApiService,
    private readonly toastService: ToastService, 
    private readonly modalService: ModalService
  ){}

  ngAfterViewInit(): void {
    this.fetchAllEvents();
  }


  onRowSelected(event: any): void {
    this.eventValue = event.detail.data;
    if (this.validDelete.some((button: any) => event.detail.button.includes(button))) {
      console.log(event.detail.data);
      this.confirmAction(event, 'delete');
    } else if(this.validEdit.some((button: any) => event.detail.button.includes(button))){
      console.log(event.detail.data);
      this.confirmAction(event, 'edit');
    }
  }

  fetchAllEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (events: IEvent[]) => {
        this.rowTable = events && Array.isArray(events) ? events.map((event, index) => ({
          id: events[index].id,
          title: events[index].name,
          date: this.formatDate(events[index].date),
          time: events[index].time,
          description: events[index].description,
          location: events[index].location,
          editButton: "ico-write-edit",
          deleteButton: "ico-add-delete"
        })) 
        : [];
        console.log(events);
        console.log("1",events[0].id);
        console.log("2,",events[1].date);
      },
      error: (err) => {
        console.error('Ocurrio un error consultando los eventos: ',err);
        this.handleError(err);
      }
      
    });
  }

  confirmAction(event: any, action: string): void {
    if (action === 'delete') {
      this.modalService.openModal(
        '¿Estás seguro de eliminar el evento seleccionado?',
        'Esta acción no se puede deshacer',
        'warning',
        [{ id: '0', value: 'Borrar' }, { id: '1', value: 'cancelar' }]
      );
    } 
  }
  
  onDeleteConfirmed(id: number): void {
    this.eventService.deleteEvent(id).subscribe({
      next: (response) => {
        console.log(response);
        this.toastService.openToast(
          '¡Confirmado!',
          'El evento ha sido eliminado correctamente',
          'SUCCESS'
        );
        this.fetchAllEvents();
      },
      error: (err) => {
        console.error('Ocurrio un error eliminando el evento: ',err);
        this.toastService.openToast(
          'Error',
          'Ocurrió un error al intentar borrar el evento',
          'ERROR'
        );
      }
    });
  } 

  handleError(error: any) {
    if (error.error && typeof error.error === 'object') {
      this.description = this.description.concat(error.error.description);
      this.detail = this.detail.concat(error.error.detail);
    }
    this.modalService.openModal(
      'Ocurrió un error al procesar la petición',
      "\r\n • "+this.description + "\r\n • "+ this.detail,
      'error',
      [{ id: '0', value: 'Intentar de nuevo' }]
    );
  }

  modalButtonAction(actionType: any, eventValue: any){
    if (typeof this.modalNotification?.nativeElement?.openAlert === 'function') {
      if (actionType.detail.value === 'Intentar de nuevo') {
        this.modalNotification.nativeElement.handleCloseClick();
        this.reloadPage();
      } else if (actionType.detail.value === 'Borrar') {
        this.modalNotification.nativeElement.handleCloseClick();
        this.onDeleteConfirmed(eventValue.id);
        console.log(eventValue.id);
        console.log(eventValue.deleteButton);
      } else {
        this.modalNotification.nativeElement.handleCloseClick();
      }
    }
  }

  reloadPage() {
    window.location.reload();
  }

  formatDate(date: string): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  }

}
