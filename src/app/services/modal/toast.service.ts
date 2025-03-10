import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toast!: any;

  public openToast(
    title: string = 'Title error',
    message: string = '',
    type: string = 'WARNING'
  ) {
    this.toast = document.querySelector('sp-at-toast');
    this.toast.titleToast = title;
    this.toast.textDesc = message;
    this.toast.type = type;
    this.toast!.show();
  }
}
