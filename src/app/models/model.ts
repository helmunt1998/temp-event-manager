export interface IModalAlerts {
    id: string;
    class?: string;
    value: string;
}

export interface IToast {
    type?: string;
    message?: string;
    titleToast?: string;
    textLink?: string;
    textDesc?: string;
  }
export interface IEvent {
    id?: number;
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
  }