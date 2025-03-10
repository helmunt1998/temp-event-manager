import { Injectable } from '@angular/core';
import { IModalAlerts } from '../../models/model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  modal!: any;

  public openModal(
    title: string = 'Title error',
    description: string = '',
    icon: string = 'warning',
    optionsButtons: IModalAlerts[] = [{ id: '0', value: 'Continuar' }]
  ) {
    this.modal = document.querySelector('sp-ml-modal');

    this.modal.titleModal = title;
    this.modal.subTitle = description;
    this.modal.icon = icon;
    this.modal.optionsButtons = optionsButtons;
    this.modal!.openAlert();
  }
}
