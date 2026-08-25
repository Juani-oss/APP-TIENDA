import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CrearAdminInput, Perfil } from '../../../core/models/perfil.model';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';

const VACIO: CrearAdminInput = { email: '', password: '', nombre: '' };

@Component({
  selector: 'app-admin-usuarios',
  imports: [FormsModule, DatePipe],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class AdminUsuarios implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  protected readonly auth = inject(AuthService);

  readonly admins = signal<Perfil[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly mostrarForm = signal(false);
  readonly form = signal<CrearAdminInput>({ ...VACIO });
  readonly guardando = signal(false);
  readonly creado = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.usuarioService.listarAdmins().subscribe({
      next: (admins) => {
        this.admins.set(admins);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de administradores.');
        this.cargando.set(false);
      },
    });
  }

  abrirNuevo(): void {
    this.form.set({ ...VACIO });
    this.creado.set(false);
    this.error.set(null);
    this.mostrarForm.set(true);
  }

  cancelar(): void {
    this.mostrarForm.set(false);
  }

  actualizarCampo<K extends keyof CrearAdminInput>(campo: K, valor: CrearAdminInput[K]): void {
    this.form.update((actual) => ({ ...actual, [campo]: valor }));
  }

  guardar(): void {
    const datos = this.form();
    if (!datos.email.trim() || !datos.nombre.trim()) {
      this.error.set('Completá el nombre y el email.');
      return;
    }
    if (datos.password.length < 8) {
      this.error.set('La contraseña tiene que tener al menos 8 caracteres.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    this.usuarioService.crearAdmin(datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.creado.set(true);
        this.mostrarForm.set(false);
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err?.message ?? 'No se pudo crear el usuario.');
      },
    });
  }
}
