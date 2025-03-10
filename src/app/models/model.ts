export class AuthPpe {
    ppe?: string;
    sid?: string;
}

export class CardAccountInfo {
    trnSrc!: string;
}

export class CardInquiryRequest {
    spName!: string;
    custPermId!: string;
    cardAccountInfo!: CardAccountInfo;
}

export class RequestBodyInquiry {
    cardInquiryRequest!: CardInquiryRequest;
    autentica!: AuthPpe;
}



export class debitCardStatus {
    statusCode!: string;
    statusDesc!: string;
    locId!: string;
}
export class cardModifyRequest {
    spName!: string;
    custPermId!: string;
    acctId!: string;
    debitCardStatus!: debitCardStatus;
}
export class RequestBodyModify {
    cardModifyRequest!: cardModifyRequest;
    autentica!: AuthPpe;
}
export class cardServiceStatus{
  rqUUID!: string;
  severity!: string;
  statusDescription!: string;
  statusCode!: string;
  serverStatusCode!: string ;
  serverStatusDesc!: string;
  serverDate!: string;
}


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

  /*
  Create an interface with this fields
  "id": 2,
        "name": "Spring User Group",
        "description": "Discuss Spring 5",
        "date": "2017-10-26T05:00:00.000+00:00",
        "time": "10:30:00",
        "location": "SpringLand"
  */
export interface IEvent {
    id?: number;
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
  }