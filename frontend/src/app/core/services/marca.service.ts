import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Marca, MarcaInput } from '../models/marca.model';
import { supabaseObservable } from '../utils/supabase-query';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly tabla = 'marcas';

  listar(): Observable<Marca[]> {
    return supabaseObservable(this.supabase.from(this.tabla).select('*').order('nombre'));
  }

  obtener(id: number): Observable<Marca> {
    return supabaseObservable(this.supabase.from(this.tabla).select('*').eq('id', id).single());
  }

  crear(payload: MarcaInput): Observable<Marca> {
    return supabaseObservable(this.supabase.from(this.tabla).insert(payload).select().single());
  }

  actualizar(id: number, payload: MarcaInput): Observable<Marca> {
    return supabaseObservable(
      this.supabase.from(this.tabla).update(payload).eq('id', id).select().single()
    );
  }

  eliminar(id: number): Observable<void> {
    return supabaseObservable(this.supabase.from(this.tabla).delete().eq('id', id));
  }
}
