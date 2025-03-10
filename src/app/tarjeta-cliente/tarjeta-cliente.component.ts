import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tarjeta-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-cliente.component.html',
  styleUrl: './tarjeta-cliente.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TarjetaClienteComponent implements AfterViewInit {

  @ViewChild('tarjetaClienteSection') tarjetaClienteSection!: ElementRef;
  
  @Input() nombre: string = '';
  @Input() columnTable: any[] = [];
  @Input() rowTable: any[] = [];
  @Output() bloquearTarjCli = new EventEmitter<any>();
  @Output() tarjetaSeleccionada = new EventEmitter<any>();
  @Input() ocultarBotonTab: boolean = false;

  // Método que emite el evento al componente padre cuando se hace clic en el botón 'Bloquear >'
  onBloquearClick(tarjCliente: any): void {
    this.bloquearTarjCli.emit(tarjCliente);
  }

  // Método que maneja la selección de fila
  onFilaSeleccionada(fila: any): void {
    this.tarjetaSeleccionada.emit(fila);
  }

  //Método que para ocultar botón de tabla al hacer un bloqueo
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ocultarBotonTab'] && this.ocultarBotonTab) {
      this.rowTable.forEach(row => {
        row.Boton3 = " ";
      });
    }
  }

  ngAfterViewInit(): void {
  }

   scrollToSectionInquiry() {
     this.tarjetaClienteSection.nativeElement.scrollIntoView({ behavior: 'smooth', alignToTop: false, block: 'end' });
  }
}
