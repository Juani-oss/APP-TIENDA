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

  enviar(): void {
    if (!this.email() || !this.password()) {
      this.error.set('Completá email y contraseña.');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.auth.login({ email: this.email(), password: this.password() }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('Email o contraseña incorrectos.');
      },
    });
  }
}
