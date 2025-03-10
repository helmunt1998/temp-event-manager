import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Navigation, Router } from '@angular/router';

@Component({
  selector: 'app-error-ruta',
  standalone: true,
  imports: [],
  templateUrl: './error-ruta.component.html',
  styleUrl: './error-ruta.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ErrorRutaComponent implements OnInit{

  navigation: Navigation | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {
    const navigation = this.router.getCurrentNavigation();
    this.navigation = navigation;
  }
  
  errTitle: string = '';
  errDesc: string = '';
  typeImg: string = '';
  customMessage?: string;
  customDescription?: string;

  private readonly ERRORMAP: { [key: string]: { title: string; desc: string; img: string } } = {
    404: {
      title: 'Página no encontrada',
      desc: 'La página que buscas no existe.',
      img: '404-error'
    },
    401: {
      title: 'No autorizado',
      desc: 'No tienes permiso para acceder a esta página.',
      img: 'identity-error'
    },
    428: {
      title: 'Ocurrió un error técnico. La descrición del error es: ',
      desc: 'Por favor, inténtalo de nuevo más tarde.',
      img: 'connection-error'
    },
    default: {
      title: 'Error desconocido',
      desc: 'Lo sentimos, ocurrió un error inesperado.',
      img: 'user-error'
    }
  };

  ngOnInit(): void {
    const statusCode = this.route.snapshot.paramMap.get('statusCode') || 'default';
    const errorText = this.ERRORMAP[statusCode] || this.ERRORMAP['default'];
    this.errTitle = errorText.title;
    this.errDesc = errorText.desc;
    this.typeImg = errorText.img;
    
    if (statusCode === '428') {
      if (this.navigation?.extras.state) {
        this.customMessage = this.navigation.extras.state['funcionalMessage'] || this.errDesc;
      }else {
        console.log('No state found in navigation extras.');
      }
      this.errDesc = this.customMessage || errorText.desc;
    }
  }

}
