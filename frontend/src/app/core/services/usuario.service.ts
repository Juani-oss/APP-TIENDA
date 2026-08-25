import { Injectable, inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';

import { CrearAdminInput, Perfil } from '../models/perfil.model';
import { supabaseObservable } from '../utils/supabase-query';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly supabase = inject(SupabaseClientService).client;

  listarAdmins(): Observable<Perfil[]> {
    return supabaseObservable(
      this.supabase.from('perfiles').select('*').order('created_at', { ascending: true })
    );
  }

  /** Crea un admin nuevo vía la función de servidor de Netlify (necesita service_role). */
  crearAdmin(payload: CrearAdminInput): Observable<{ id: string; email: string; nombre: string }> {
    return from(this.supabase.auth.getSession()).pipe(
      switchMap(({ data }) => {
        const token = data.session?.access_token;
        if (!token) {
          throw new Error('No hay sesión activa.');
        }
        return from(
          fetch('/.netlify/functions/crear-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }).then(async (res) => {
            const cuerpo = await res.json();
            if (!res.ok) {
              throw new Error(cuerpo.error ?? 'No se pudo crear el usuario.');
            }
            return cuerpo;
          })
        );
      })
    );
  }
}
