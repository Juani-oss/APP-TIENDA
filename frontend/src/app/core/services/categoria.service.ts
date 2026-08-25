import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Categoria, CategoriaInput } from '../models/categoria.model';
import { supabaseObservable } from '../utils/supabase-query';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly tabla = 'categorias';

  listar(): Observable<Categoria[]> {
    return supabaseObservable(this.supabase.from(this.tabla).select('*').order('nombre'));
  }

  obtener(id: number): Observable<Categoria> {
    return supabaseObservable(this.supabase.from(this.tabla).select('*').eq('id', id).single());
  }

  crear(payload: CategoriaInput): Observable<Categoria> {
    return supabaseObservable(this.supabase.from(this.tabla).insert(payload).select().single());
  }

  actualizar(id: number, payload: CategoriaInput): Observable<Categoria> {
    return supabaseObservable(
      this.supabase.from(this.tabla).update(payload).eq('id', id).select().single()
    );
  }

  eliminar(id: number): Observable<void> {
    return supabaseObservable(this.supabase.from(this.tabla).delete().eq('id', id));
  }
}
