import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  /** Si no es null, estamos en el segundo paso: pedir el código de la app autenticadora. */
  readonly factorIdMfa = signal<string | null>(null);
  readonly codigoMfa = signal('');

  enviar(): void {
    if (!this.email() || !this.password()) {
      this.error.set('Completá email y contraseña.');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.auth.login({ email: this.email(), password: this.password() }).subscribe({
      next: (resultado) => {
        this.cargando.set(false);
        if (resultado.requiereMfa && resultado.factorId) {
          this.factorIdMfa.set(resultado.factorId);
          return;
        }
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('Email o contraseña incorrectos.');
      },
    });
  }

  enviarCodigoMfa(): void {
    const factorId = this.factorIdMfa();
    if (!factorId || this.codigoMfa().trim().length !== 6) {
      this.error.set('Ingresá el código de 6 dígitos de tu app autenticadora.');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.auth.verificarCodigoMfa(factorId, this.codigoMfa().trim()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.cargando.set(false);
        this.codigoMfa.set('');
        this.error.set('Código incorrecto. Probá de nuevo.');
      },
    });
  }

  volverAPassword(): void {
    this.factorIdMfa.set(null);
    this.codigoMfa.set('');
    this.error.set(null);
  }
}
