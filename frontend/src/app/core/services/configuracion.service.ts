import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, shareReplay, tap, throwError } from 'rxjs';

import { Configuracion } from '../models/configuracion.model';
import { supabaseObservable } from '../utils/supabase-query';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly tabla = 'configuracion';

  /**
   * Navbar y Home (entre otros) llaman cargar() cada uno por su lado sin
   * coordinarse. Sin este caché, cada uno dispara su propio pedido a
   * Supabase y se duplica la misma consulta en cada carga de página.
   */
  private cache$: Observable<Configuracion> | null = null;

  /** Estado global en memoria: lo consumen navbar, product-card y producto-detalle. */
  readonly config = signal<Configuracion | null>(null);
  readonly carritoHabilitado = computed(() => this.config()?.carrito_habilitado ?? false);
  readonly envioCasilleroHabilitado = computed(
    () => this.config()?.envio_casillero_habilitado ?? false
  );

  /** null si el banner está apagado o no tiene imagen cargada todavía. */
  readonly bannerPromo = computed(() => {
    const c = this.config();
    if (!c?.banner_promo_activo || !c.banner_promo_url) {
      return null;
    }
    return { url: c.banner_promo_url, enlace: c.banner_promo_enlace };
  });

  cargar(): Observable<Configuracion> {
    if (!this.cache$) {
      this.cache$ = supabaseObservable<Configuracion>(
        this.supabase.from(this.tabla).select('*').eq('id', 1).single()
      ).pipe(
        tap((c) => this.config.set(c)),
        shareReplay(1),
        catchError((error) => {
          // Si falló, no dejamos el error cacheado para siempre: el próximo
          // cargar() vuelve a intentar en vez de repetir el mismo error.
          this.cache$ = null;
          return throwError(() => error);
        })
      );
    }
    return this.cache$;
  }

  /** Actualiza solo los campos indicados; conserva el resto del estado actual. */
  actualizar(cambios: Partial<Configuracion>): Observable<Configuracion> {
    return supabaseObservable<Configuracion>(
      this.supabase.from(this.tabla).update(cambios).eq('id', 1).select().single()
    ).pipe(
      tap((c) => {
        this.config.set(c);
        // Ya tenemos el dato fresco a mano: lo guardamos como caché para que
        // el próximo cargar() no vuelva a pedirlo de nuevo a Supabase.
        this.cache$ = of(c);
      })
    );
  }
}
