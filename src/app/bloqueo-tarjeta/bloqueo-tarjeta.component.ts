import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, inject, Input, Output, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-bloqueo-tarjeta',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './bloqueo-tarjeta.component.html',
  styleUrl: './bloqueo-tarjeta.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BloqueoTarjetaComponent implements AfterViewInit {

  @ViewChild('bloquearSection') bloquearSection: ElementRef | undefined;

  @Input() tipoBloqueo: string | null = null;
  @Input() valorBloqueo: string | null = null;
  @Input() tarjetaSeleccionada: string | null = null;

  @Output() ocultarBotonTab= new EventEmitter<void>();
  @Output() habilitarBotonTab = new EventEmitter<void>();
  @Output() bloqueoConfirmado = new EventEmitter<{ tipoBloqueo: string | null, valorBloqueo: string | null }>();  
  @Output() iniciarLoader = new EventEmitter<boolean>();

  agregarDialogo: boolean = false;
  deshabilitarBoton: boolean = false;

  descripcion: string = '';

  options = [
    { value: 'V', text: 'Bloqueo temporal' },
    { value: 'C', text: 'Bloqueo definitivo' }
  ];

  ngAfterViewInit(): void {
    this.scrollToSection();
  }
  
  formBloquear = inject(FormBuilder)

  formularioBloquear: FormGroup = this.formBloquear.group({  });

  //Método que usa al pulsar el botón de la tabla
  onBloquear(): void {
    this.agregarDialogo = !this.agregarDialogo; 
    this.deshabilitarBoton = true;
    this.ocultarBotonTab.emit();
  }

  // Método para manejar el botón del alert de Warning
  cerrarModal() {
    this.agregarDialogo = false;
    this.deshabilitarBoton = false;
    this.habilitarBotonTab.emit();
  
    if (this.tipoBloqueo) {
      this.bloqueoConfirmado.emit({
        tipoBloqueo: this.tipoBloqueo,
        valorBloqueo: this.valorBloqueo 

      });
      console.log("bloqueoConfirmado:",this.tipoBloqueo);
      this.ocultarBotonTab.emit();
      this.iniciarLoader.emit(true);
    
    }
  }

  // Método para manejar el cierre del alert de Warning
  onCerrarAlerta() {
    this.deshabilitarBoton = false;
    this.agregarDialogo = !this.agregarDialogo;
    this.habilitarBotonTab.emit();
  }

  scrollToSection() {
    if (this.bloquearSection) {
      this.bloquearSection.nativeElement.scrollIntoView({ behavior: 'smooth', alignToTop: false });
    }
  }
}
