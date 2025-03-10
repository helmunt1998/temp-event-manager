import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators} from '@angular/forms';
import { TarjetaClienteComponent } from '../tarjeta-cliente/tarjeta-cliente.component';
import { BloqueoTarjetaComponent } from '../bloqueo-tarjeta/bloqueo-tarjeta.component';
import { SpAtAlert} from '@npm-bbta/bbog-dig-dt-sherpa-lib/dist/custom-elements/sp-at-alert';
import { SpMlLoader} from '@npm-bbta/bbog-dig-dt-sherpa-lib/dist/custom-elements/sp-ml-loader';
import { WebApiService } from '../services/web-api.services';
import { Subject, takeUntil } from 'rxjs';
import { RequestBodyInquiry, RequestBodyModify } from '../models/model';
import { ModalService } from '../services/modal/modal.service';

@Component({
  selector: 'app-consulta-cliente',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TarjetaClienteComponent, BloqueoTarjetaComponent],
  templateUrl: './consulta-cliente.component.html',
  styleUrl: './consulta-cliente.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ConsultaClienteComponent implements OnInit, AfterViewInit{

  private onDestroy$ = new Subject<void>();

  reqUID: string = 'reqUID: ';
  severity: string = 'Severidad: ';
  statusDescription: string = 'Descripción del error: ';
  statusCode: string = 'Código de estado: ';
  codigoDeEstado: string = 'Código de estado del servidor: ';
  serverStatusDesc: string = 'Descripción del estado del servidor: ';

  options = [
    { value: 'C', text: 'Cédula de ciudadanía' },
    { value: 'E', text: 'Cédula de Extranjería' },
    { value: 'T', text: 'Tarjeta de identidad' },
    { value: 'N', text: 'NIT Persona Juridica' },
    { value: 'L', text: 'NIT Persona Natural' },
    { value: 'P', text: 'Pasaporte' },
    { value: 'I', text: 'NIT de extranjeria' }
  ];

  columnTable = [
    { colName: "", control: "id" },
    { colName: "BIN de la tarjeta", control: "text" },
    { colName: "Estado", control: "tag" },
    { colName: "", control: "button" }
  ];

  actionSheetValues = [
    { icon: 'ico-password-denied', label: 'Bloqueo temporal', value: 'V', isChecked: false },
    { icon: 'ico-password-lock', label: 'Bloqueo definitivo', value: 'C', isChecked: false }
  ];

  formB = inject(FormBuilder)
  rowTable: any[] = [];
  seleccionarValor: string = '';
  inactivarBotCon: boolean = false;
  botonVolver: boolean = false;
  ocultarBotonTab: boolean = false;
  agregarComponenteCliente: boolean = false;
  agregarComponenteBloqueo: boolean = false;
  agregarModal: boolean = false;
  mostrarLoader: boolean = false;
  dropdownEstado: 'ENABLED' | 'DISABLED' = 'ENABLED';
  inputEstado: 'ENABLED' | 'DISABLED' = 'ENABLED';
  nombreCliente: string = '';
  cardId: { [key: number]: string } = {};
  tarjetaSeleccionada: string = ' ';
  idSeleccionado: any = null;
  seleccionBloqueo: string | null = null;
  seleccionValBloqueo: string | null = null;
  tipoDocumento: string = 'urn://gov.co/';

  @ViewChild('modalBloqueo') modalBloqueo!: ElementRef;
  @ViewChild('alertNoti') alertNoti!: SpAtAlert;
  @ViewChild('scrollCardInquiry') inquirySection!: TarjetaClienteComponent;
  @ViewChild('cargar') loader!: SpMlLoader;
  @ViewChild('modalNoti') modalStatus!: ElementRef;
  @ViewChild('scrollCardBlocking') scrollToBlock! : BloqueoTarjetaComponent;
  @Input() actionValue: number = 0;
  
  constructor(private modalService: ModalService, private apiService: WebApiService){}

  formularioConsulta: FormGroup = this.formB.group({
    tipoDocumento: ['', [Validators.required]],
    numeroDocumento: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10)]]
  });

  //Se genera un evento para traer el valor del Dropdown
  obtenerValorSel(event: any) {
    this.seleccionarValor = event.detail.value;
    this.formularioConsulta.get('tipoDocumento')?.setValue(this.seleccionarValor);
  }

  //Manejar la visualización del formulario al cambiar estado
  ngOnInit(): void {
      this.apiService.getAuth().pipe(takeUntil(this.onDestroy$)).subscribe();
      this.actualizarEstadoFormulario();
  }

  ngAfterViewInit() {
    
  }

  // Función que se puede utilizar para habilitar/deshabilitar controles del Dropdown e Input
  actualizarEstadoFormulario() {
    if (this.formularioConsulta.valid) {
      this.dropdownEstado = "DISABLED";
      this.inputEstado = "DISABLED";
    } else {
      this.dropdownEstado = "ENABLED";
      this.inputEstado = "ENABLED";
    }
  }
  
   // Método que realiza la consulta HTTP usando el servicio
  consultarTarjetas(): void {
    const spName = this.tipoDocumento +this.formularioConsulta.get('tipoDocumento')?.value;
    const custPermId = this.formularioConsulta.get('numeroDocumento')?.value;
    const trnSrc = "2";
    
    const requestBody: RequestBodyInquiry = {
      cardInquiryRequest: {
        spName: spName,
        custPermId: custPermId,
        cardAccountInfo: {
          trnSrc: trnSrc
        }
      },
      autentica: {
        ppe: localStorage.getItem('ppe')!,
        sid: localStorage.getItem('sid')!
      }
    };
    console.log("Body:", requestBody);

    this.apiService.getCardProductInquiry(requestBody).pipe(takeUntil(this.onDestroy$)).subscribe({
      next: (data) => {
        this.closeLoader();
        this.rowTable = data && Array.isArray(data) ? data.map((tarjeta, index) => ({
          id: index.toString(),
          Simple2: this.formatCardId(tarjeta.cardId, false),
          Estado1: {
          type: this.getEstadoText(tarjeta.cardStatus).colorState,
          text: this.getEstadoText(tarjeta.cardStatus).description
          },
          Boton3: this.getEstadoText(tarjeta.cardStatus).showButton
        })) 
        : [];
        data && Array.isArray(data) ? data.map((tarjeta, index) => {
          this.cardId[index] = tarjeta.cardId;
        }) : [];
        this.scrollToSection();
      },
      error: (error) => {   
        console.error('Error al consultar el cliente', error);
        this.handleError(error);
      }
    });
  }

  // Método para llamar al servicio y realizar la petición HTTP
  blockCard(requestBodyModify: RequestBodyModify): void {
    // Llamada al servicio de bloqueo
    this.apiService.modifyDebitCard(requestBodyModify).pipe(takeUntil(this.onDestroy$)).subscribe({
      next: (response) => {
        this.closeLoader();
        if (response && typeof response === 'object') {
          this.reqUID = this.reqUID.concat(response.rqUUID);
          this.severity = this.severity.concat(response.severity);
          this.statusDescription = this.statusDescription.concat(response.statusDescription);
          this.statusCode = this.statusCode.concat(response.statusCode);
          this.codigoDeEstado = this.codigoDeEstado.concat(response.serverStatusCode);
          this.serverStatusDesc = this.serverStatusDesc.concat(response.serverStatusDesc);
        }
        this.modalService.openModal(
          'Realizaste el bloqueo correctamente',
          this.formatModalText(),
          'success',
          [{ id: '0', value: 'Ver cambios' }]
        );
        this.actionValue = 2;
        this.agregarComponenteBloqueo = false;
        },
      error: (error) => {
          console.error('Error al bloquear la tarjeta:', error);
          this.handleError(error);
        }
      });
    }

  handleError(error: any) {
    this.closeLoader();
    if (error.error && typeof error.error === 'object') {
      this.reqUID = this.reqUID.concat(error.error.rqUUID);
      this.severity = this.severity.concat(error.error.severity);
      this.statusDescription = this.statusDescription.concat(error.error.statusDescription);
      this.statusCode = this.statusCode.concat(error.error.statusCode);
      this.codigoDeEstado = this.codigoDeEstado.concat(error.error.serverStatusCode);
      this.serverStatusDesc = this.serverStatusDesc.concat(error.error.serverStatusDesc);
    }
    this.modalService.openModal(
      'Ocurrió un error al procesar la petición',
      this.formatModalText(),
      'error',
      [{ id: '0', value: 'Intentar de nuevo' }]
    );
    this.actionValue = 1;
  }

  formatModalText(): string {
    return `
        • ${this.reqUID}
        • ${this.severity}
        • ${this.statusDescription}
        • ${this.statusCode}
        • ${this.codigoDeEstado}
        • ${this.serverStatusDesc} 
    `;
  }

  formatCardId(cardId: string, justEncrypted: boolean): string {
    const firstPart = cardId.substring(0, 4);
    const middlePart = cardId.substring(4, 6);
    const encryptedData = cardId.substring(6, cardId.length - 4);
    const lastPart = cardId.substring(cardId.length - 4);
    if (justEncrypted) {
      return encryptedData;
    }
    return `${firstPart} ${middlePart}** **** ${lastPart}`;
  }

  getEstadoText(estado: string): {description: string, colorState: string, showButton: string} {
    const estados: { [key: string]: {description: string, colorState: string, showButton: string} } = {
      'T': {description: 'Bloqueo preventivo', colorState: 'warning', showButton: 'Bloquear ≡'},
      'C': {description: 'Cancelación mal manejo', colorState: 'error', showButton: ' '},
      'F': {description: 'Fallecido', colorState: 'error', showButton: ' '},
      'R': {description: 'Robo/Extravio', colorState: 'error', showButton: ' '},
      'N': {description: 'Normal', colorState: 'success', showButton: 'Bloquear ≡'},
      'D': {description: 'Cancelación voluntaria', colorState: 'error', showButton: ' '},
      'E': {description: 'No reclamada', colorState: 'error', showButton: ' '},
      'P': {description: 'Preventivo', colorState: 'warning', showButton: 'Bloquear ≡'},
      'J': {description: 'No monetario', colorState: 'warning', showButton: 'Bloquear ≡'},
      'X': {description: 'Extravio', colorState: 'error', showButton: ' '},
      'V': {description: 'Bloqueo preventivo', colorState: 'warning', showButton: 'Bloquear ≡'},
      'Q': {description: 'Consulta svl', colorState: 'warning', showButton: 'Bloquear ≡'},
      'H': {description: 'Bloqueo preventivo', colorState: 'warning', showButton: 'Bloquear ≡'},
      'U': {description: 'Bloqueo fraude', colorState: 'error', showButton: ' '},
      'O': {description: 'Bloqueo preventivo', colorState: 'warning', showButton: 'Bloquear ≡'},
    };
  
    return estados[estado] || {description: 'Estado desconocido', colorState: 'info', showButton: ' '};
  }

  // Método que recibe el evento de selección de fila, abre y reinicia valores del modal
  onFilaSeleccionada(fila: any) {

    this.actionSheetValues = this.actionSheetValues.map(item => {
      return { ...item, isChecked: false };
    });

    this.idSeleccionado= fila.detail;
    this.tarjetaSeleccionada = fila.detail.data.Simple2;
    
    const validStates = ['Normal', 'Bloqueo preventivo', 'Preventivo', 'No monetario', 'Bloqueo preventivo svl', 'Consulta svl', 'Cancelación voluntaria'];
    if (validStates.includes(fila.detail.data.Estado1.text)) {
      this.seleccionBloqueo = fila;
      this.abrirModal();
    } else {
      console.log('No se puede bloquear, el estado no es "Activa"');
    }
  }

  //Método que permite abrir el modal al pulsar el botón 'Bloquear'
  abrirModal() {
    this.seleccionBloqueo = null;
    if (this.modalBloqueo && this.modalBloqueo.nativeElement) {
      const modalElement = this.modalBloqueo.nativeElement;
      if (modalElement.openActionSheet) {
        modalElement.openActionSheet().then(() => {
          console.log('Modal abierto correctamente');
        }).catch((error: any) => {
          console.error('Error al abrir el modal:', error);
        });
      } else {
        console.error('El método openActionSheet no está disponible en el elemento');
      }
    }
  }
  
  // Establece el tipo de bloqueo seleccionado
  onSeleccionarBloqueo(tipo : CustomEvent) {
    this.seleccionBloqueo = null;
    const tipoBloqueoSeleccionado = tipo.detail.label;
    const tipoBloqueoValue = tipo.detail.value;
    this.seleccionBloqueo = tipoBloqueoSeleccionado;
    this.seleccionValBloqueo = tipoBloqueoValue
    this.agregarComponenteBloqueo = true;
    if(this.scrollToBlock){
      this.scrollToSectionBloqueo();
    }
  }

  //Llama el submit del formulario para consultar
  onConsultar(): void {
    if (this.inactivarBotCon) return;
    
    this.inactivarBotCon = true; 

    if (this.formularioConsulta.valid) {
      this.actualizarEstadoFormulario();
      this.agregarComponenteCliente = true;
      this.abrirLoader();
      this.consultarTarjetas();
      this.botonVolver = true;
    }
  }

  // Método para recibir el evento de ocultar el botón
  onBloquear(): void {
    this.ocultarBotonTab = true;
    this.rowTable = this.rowTable.map(row => {
      return {
        ...row, // Copiamos las propiedades del objeto actual
        Boton3: " "
      };
    });
  }

  // Método para restaurar los botones al cerrar el modal de confirmación
  onCerrarModal(): void {
    this.ocultarBotonTab = false;
    this.rowTable = this.rowTable.map(row => {
      const debeMostrarBoton = row.Estado1.text === 'Normal' || row.Estado1.text === 'Bloqueo preventivo' ||
                               row.Estado1.text === 'Preventivo' || row.Estado1.text === 'No monetario' ||
                               row.Estado1.text === 'Bloqueo preventivo svl' || row.Estado1.text === 'Consulta svl' || row.Estado1.text === 'Bloqueo temporal';
      return Object.assign({}, row, {

        Boton3: debeMostrarBoton ? 'Bloquear ≡' : " "
      });
    });
  }

  // Método para manejar el cambio de estado cuando se confirma el bloqueo
  onBloqueoConfirmado(event: any): void {
    const tipoBloqueo = event.tipoBloqueo;
    const valorBloqueo = event.valorBloqueo;
    if (this.idSeleccionado && this.idSeleccionado.data) {
      const tipoTag = this.obtenerTipoTag(tipoBloqueo)
      
      this.rowTable = this.rowTable.map(row => {
        if (row.id === this.idSeleccionado.data.id) {
          const updatedRow = {
            ...row,
            Estado1: {
              ...row.Estado1,
              text: tipoBloqueo, 
              type: tipoTag  
              
            },
             Boton3: (tipoBloqueo === 'Activa' || tipoBloqueo === 'Bloqueo temporal') ? 'Bloquear ≡' : ' '
          };
          console.log('Fila actualizada:', updatedRow); 
        }
      });

      console.log('Estado de la tarjeta actualizado:', this.rowTable);

      // Llamar al servicio para bloquear la tarjeta con los parámetros
      let tipoDocumento = this.tipoDocumento +this.formularioConsulta.get('tipoDocumento')?.value;
      let numeroDocumento = this.formularioConsulta.get('numeroDocumento')?.value;
      let numerotarjeta = this.formatCardId(this.cardId[this.idSeleccionado.data.id], true); 
      let codigoEstado = valorBloqueo; 
      let descEstado = tipoBloqueo;  
      console.log("Body Bloqueo:", tipoDocumento, numeroDocumento, numerotarjeta,codigoEstado,descEstado)

      const requestBodyModify: RequestBodyModify = {
        cardModifyRequest: {
          spName: tipoDocumento,
          custPermId: numeroDocumento,
          acctId: numerotarjeta,
          debitCardStatus: {
            statusCode: codigoEstado,
            statusDesc: descEstado,
            locId: codigoEstado
          }
        },
        autentica: {
          ppe: localStorage.getItem('ppe')!,
          sid: localStorage.getItem('sid')!
        }
      };
      this.blockCard(requestBodyModify);
    }
  }

  // Método que determina el tipo del tag basado en el tipo de bloqueo
  obtenerTipoTag(tipoBloqueo: string): string {
    const tipoTagMap: { [key: string]: string } = {
      'Bloqueo temporal': 'warning',
      'Bloqueo definitivo': 'error',
      'Activa': 'success'
    };
    return tipoTagMap[tipoBloqueo] || '';
  }

  //Método para abrir el loader
  abrirLoader() {
    this.mostrarLoader = true;
    console.log("Iniciar Loader" + this.mostrarLoader);
    if (this.loader) {
      if (typeof this.loader.openLoader === 'function') {
        this.loader.openLoader()
          .catch((error: any) => {
            console.error('Error al abrir el loader', error);
          });
      }
    }
  }

  //Método para cerrar el loader
  closeLoader() {
    this.mostrarLoader = false;
    if (this.loader && this.loader.closeLoader) {
      this.loader.closeLoader()
        .catch((error: any) => {
          console.error('Error al cerrar el loader', error);
        });
    }
  }

  modalButtonAction(actionType: number){
    if (this.modalStatus && this.modalStatus.nativeElement && typeof this.modalStatus.nativeElement.openAlert === 'function') {
      if (actionType === 0) {
        this.modalStatus.nativeElement.handleCloseClick();
      } else if (actionType === 1) {
        this.modalStatus.nativeElement.handleCloseClick();
        this.reloadPage();
      } else if (actionType === 2){
        this.modalStatus.nativeElement.handleCloseClick();
        this.abrirLoader();
        this.consultarTarjetas();
      }
    }
  }

   // Método que se ejecuta cuando el hijo emite el evento de cerrar el componente
   onCerrarComponenteBloqueo() {
    this.agregarComponenteBloqueo = false;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  scrollToSection() {
    this.inquirySection.scrollToSectionInquiry();
  }

  scrollToSectionBloqueo(){
    this.scrollToBlock.scrollToSection();
  }

  reloadPage() {
    window.location.reload();
  }
}
