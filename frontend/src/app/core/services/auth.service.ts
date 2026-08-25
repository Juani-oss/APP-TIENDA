import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, from, map, of, switchMap, throwError } from 'rxjs';

import { LoginRequest, Usuario } from '../models/usuario.model';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseClientService).client;

  private readonly currentUser = signal<Usuario | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.rol === 'admin');

  login(payload: LoginRequest): Observable<Usuario> {
    return from(
      this.supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error || !data.user) {
          return throwError(() => error ?? new Error('No se pudo iniciar sesión.'));
        }
        return this.cargarPerfil(data.user.id, data.user.email ?? payload.email);
      })
    );
  }

  /** Revisa si ya hay una sesión activa de Supabase (ej. al recargar la página). */
  verificarSesion(): Observable<boolean> {
    return from(this.supabase.auth.getSession()).pipe(
      switchMap(({ data }) => {
        const usuarioSesion = data.session?.user;
        if (!usuarioSesion) {
          return of(false);
        }
        return this.cargarPerfil(usuarioSesion.id, usuarioSesion.email ?? '').pipe(
          map(() => true),
          catchError(() => of(false))
        );
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    void this.supabase.auth.signOut();
  }

  /**
   * Solo hay "perfil" (fila en public.perfiles) para los admins de la tienda.
   * Si el login de Supabase Auth funcionó pero no hay perfil de admin, cierra
   * la sesión igual — no queremos dejar una sesión autenticada a medias
   * colgada en el navegador de alguien sin acceso.
   */
  private cargarPerfil(id: string, email: string): Observable<Usuario> {
    return from(
      this.supabase.from('perfiles').select('nombre, rol').eq('id', id).single()
    ).pipe(
      map(({ data, error }) => {
        if (error || !data || data['rol'] !== 'admin') {
          void this.supabase.auth.signOut();
          throw error ?? new Error('No tenés acceso de administrador.');
        }
        const usuario: Usuario = {
          id,
          nombre: data['nombre'] ?? email,
          email,
          rol: data['rol'],
        };
        this.currentUser.set(usuario);
        return usuario;
      })
    );
  }
}
