import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { Configuracion } from '../models/configuracion.model';
import { supabaseObservable } from '../utils/supabase-query';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly tabla = 'configuracion';

  /** Estado global en memoria: lo consumen navbar, product-card y producto-detalle. */
  readonly config = signal<Configuracion | null>(null);
  readonly carritoHabilitado = computed(() => this.config()?.carrito_habilitado ?? false);
  readonly envioCasilleroHabilitado = computed(
    () => this.config()?.envio_casillero_habilitado ?? false
  );

  cargar(): Observable<Configuracion> {
    return supabaseObservable<Configuracion>(
      this.supabase.from(this.tabla).select('*').eq('id', 1).single()
    ).pipe(tap((c) => this.config.set(c)));
  }

  /** Actualiza solo los campos indicados; conserva el resto del estado actual. */
  actualizar(cambios: Partial<Configuracion>): Observable<Configuracion> {
    return supabaseObservable<Configuracion>(
      this.supabase.from(this.tabla).update(cambios).eq('id', 1).select().single()
    ).pipe(tap((c) => this.config.set(c)));
  }
}
