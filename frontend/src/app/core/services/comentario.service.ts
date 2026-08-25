import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Comentario, ComentarioInput } from '../models/comentario.model';
import { supabaseObservable } from '../utils/supabase-query';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly tabla = 'comentarios';

  listarPorProducto(productoId: number): Observable<Comentario[]> {
    return supabaseObservable(
      this.supabase
        .from(this.tabla)
        .select('*')
        .eq('producto_id', productoId)
        .eq('aprobado', true)
        .order('created_at', { ascending: false })
    );
  }

  crear(productoId: number, payload: ComentarioInput): Observable<Comentario> {
    return supabaseObservable(
      this.supabase
        .from(this.tabla)
        .insert({ ...payload, producto_id: productoId })
        .select()
        .single()
    );
  }

  listarTodos(aprobado?: boolean): Observable<Comentario[]> {
    let query = this.supabase.from(this.tabla).select('*').order('created_at', { ascending: false });
    if (aprobado !== undefined) {
      query = query.eq('aprobado', aprobado);
    }
    return supabaseObservable(query);
  }

  aprobar(id: number): Observable<Comentario> {
    return supabaseObservable(
      this.supabase.from(this.tabla).update({ aprobado: true }).eq('id', id).select().single()
    );
  }

  eliminar(id: number): Observable<void> {
    return supabaseObservable(this.supabase.from(this.tabla).delete().eq('id', id));
  }
}
