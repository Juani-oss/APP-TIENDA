import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, from, map, of, switchMap, throwError } from 'rxjs';

import { LoginRequest, Usuario } from '../models/usuario.model';
import { SupabaseClientService } from './supabase-client.service';

export interface ResultadoLogin {
  /** Si es true, todavía falta el paso de verificarCodigoMfa() para terminar de loguearse. */
  requiereMfa: boolean;
  factorId?: string;
  usuario?: Usuario;
}

export interface FactorMfa {
  id: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseClientService).client;

  private readonly currentUser = signal<Usuario | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.rol === 'admin');

  login(payload: LoginRequest): Observable<ResultadoLogin> {
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
        const userId = data.user.id;
        const email = data.user.email ?? payload.email;

        return from(this.supabase.auth.mfa.getAuthenticatorAssuranceLevel()).pipe(
          switchMap(({ data: aal, error: aalError }) => {
            if (aalError) {
              return throwError(() => aalError);
            }
            if (aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
              // Tiene 2FA activado: falta el código antes de terminar de loguearse.
              return from(this.supabase.auth.mfa.listFactors()).pipe(
                map(({ data: factores, error: factoresError }) => {
                  const factor = factores?.totp?.[0];
                  if (factoresError || !factor) {
                    throw factoresError ?? new Error('No se encontró el factor de 2FA.');
                  }
                  return { requiereMfa: true, factorId: factor.id } satisfies ResultadoLogin;
                })
              );
            }
            return this.cargarPerfil(userId, email).pipe(
              map((usuario) => ({ requiereMfa: false, usuario }) satisfies ResultadoLogin)
            );
          })
        );
      })
    );
  }

  /** Segundo paso del login cuando login() devolvió requiereMfa: true. */
  verificarCodigoMfa(factorId: string, codigo: string): Observable<Usuario> {
    return from(this.supabase.auth.mfa.challengeAndVerify({ factorId, code: codigo })).pipe(
      switchMap(({ error }) => {
        if (error) {
          return throwError(() => error);
        }
        return from(this.supabase.auth.getUser()).pipe(
          switchMap(({ data, error: userError }) => {
            if (userError || !data.user) {
              return throwError(() => userError ?? new Error('No se pudo verificar el usuario.'));
            }
            return this.cargarPerfil(data.user.id, data.user.email ?? '');
          })
        );
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

  // ---------- 2FA: alta/baja del factor (se usa desde Configuración) ----------

  mfaListarFactores(): Observable<FactorMfa[]> {
    return from(this.supabase.auth.mfa.listFactors()).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return (data?.totp ?? []).map((f) => ({ id: f.id, status: f.status }));
      })
    );
  }

  mfaEnrollar(): Observable<{ factorId: string; qrCode: string; secret: string }> {
    return from(this.supabase.auth.mfa.enroll({ factorType: 'totp' })).pipe(
      map(({ data, error }) => {
        if (error || !data) {
          throw error ?? new Error('No se pudo iniciar la activación de 2FA.');
        }
        return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
      })
    );
  }

  mfaConfirmarEnrolamiento(factorId: string, codigo: string): Observable<void> {
    return from(this.supabase.auth.mfa.challengeAndVerify({ factorId, code: codigo })).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }

  mfaDesactivar(factorId: string): Observable<void> {
    return from(this.supabase.auth.mfa.unenroll({ factorId })).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
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
