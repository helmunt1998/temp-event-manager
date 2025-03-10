import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ToastService } from '../services/modal/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent implements OnInit {

  @ViewChild('modalToast') toast!: ElementRef;

  loginElements: any[] = [];
  loginForm!: FormGroup;
  loginTitle = 'Bienvenido al gestor de eventos BdB';
  loginSubtitle = 'Por favor, ingresa tus credenciales para continuar';

  constructor(
    private readonly authService: AuthService,
    private readonly toastService: ToastService, 
    private readonly router: Router, 
    private readonly form: FormBuilder
  ) {}

  ngOnInit(): void {
    this.setLoginElements();
    this.loginForm = this.form.group({
      username: ['', Validators.required], 
      password: ['', Validators.required] 
    });
  }
  private handleLoginSuccess(): void {
    this.router.navigate(['/fetch-events']);
  }

  private handleLoginFailure(): void {
    this.toastService.openToast(
      'Error',
      'Usuario o contraseña no válidos',
      'ERROR'
    );
  }

  login(event: any) {
    if (event?.detail) {
      const details = event.detail.reduce((acc: { [x: string]: any }, item: { name: string | number; value: any }) => {
        acc[item.name] = item.value;
        return acc;
      }, {} as { username: string; password: string });

      this.loginForm.setValue({
        username: details.username || '',
        password: details.password || '',
      });
    }

    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.loginUser(username, password).subscribe(success => {
        if (success) {
          this.handleLoginSuccess();
        } else {
          this.handleLoginFailure();
        }
      });
    }
  }

  setLoginElements() {
    this.loginElements = [
      {
        component: "sp-at-input",
        name: "username",
        props: {
          idEl: "username",
          name: "username",
          label: "Usuario",
          placeholder: "Ingresa tu nombre de usuario",
          type: "TEXT",
          status: "ENABLED",
          required: "true",
          message: "Usuario es requerido",
        }
      },
      {
        component: "sp-at-input",
        name: "password",
        props: {
          idEl: "password",
          name: "password",
          label: "Contraseña",
          placeholder: "Ingresa tu contraseña",
          type: "PASSWORD",
          status: "ENABLED",
          required: "true",
          message: "Contraseña es requerida",
        }
      }
    ];
  }
 }
