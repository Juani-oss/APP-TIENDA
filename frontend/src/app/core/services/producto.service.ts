import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';

import {
  Producto,
  ProductoCaracteristicaInput,
  ProductoFiltros,
  ProductoImagenInput,
  ProductoInput,
} from '../models/producto.model';
import { supabaseObservable } from '../utils/supabase-query';
import { SupabaseClientService } from './supabase-client.service';

const SELECT_CON_RELACIONES =
  '*, categoria:categorias(*), marca:marcas(*), imagenes:producto_imagenes(*), caracteristicas:producto_caracteristicas(*)';

/** PostgREST no garantiza el orden de las relaciones embebidas: se ordena acá. */
function ordenarListas(producto: Producto): Producto {
  return {
    ...producto,
    imagenes: [...producto.imagenes].sort((a, b) => a.orden - b.orden),
    caracteristicas: [...producto.caracteristicas].sort((a, b) => a.orden - b.orden),
  };
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly tabla = 'productos';

  listar(filtros: ProductoFiltros = {}): Observable<Producto[]> {
    let query = this.supabase.from(this.tabla).select(SELECT_CON_RELACIONES);

    if (filtros.categoria_id != null) {
      query = query.eq('categoria_id', filtros.categoria_id);
    }
    if (filtros.marca_id != null) {
      query = query.eq('marca_id', filtros.marca_id);
    }
    if (filtros.destacado != null) {
      query = query.eq('destacado', filtros.destacado);
    }
    if (filtros.activo != null) {
      query = query.eq('activo', filtros.activo);
    }
    if (filtros.search) {
      query = query.ilike('nombre', `%${filtros.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    return supabaseObservable<Producto[]>(query).pipe(
      map((productos) => productos.map(ordenarListas))
    );
  }

  obtener(id: number): Observable<Producto> {
    return supabaseObservable<Producto>(
      this.supabase.from(this.tabla).select(SELECT_CON_RELACIONES).eq('id', id).single()
    ).pipe(map(ordenarListas));
  }

  crear(payload: ProductoInput): Observable<Producto> {
    return from(this.crearAsync(payload));
  }

  actualizar(id: number, payload: ProductoInput): Observable<Producto> {
    return from(this.actualizarAsync(id, payload));
  }

  eliminar(id: number): Observable<void> {
    return supabaseObservable(this.supabase.from(this.tabla).delete().eq('id', id));
  }

  private async crearAsync(payload: ProductoInput): Promise<Producto> {
    const { imagenes, caracteristicas, ...datos } = payload;
    const { data: producto, error } = await this.supabase
      .from(this.tabla)
      .insert(datos)
      .select()
      .single();
    if (error || !producto) {
      throw error ?? new Error('No se pudo crear el producto.');
    }

    await this.reemplazarListas(producto['id'], imagenes, caracteristicas);
    return this.obtenerConRelacionesAsync(producto['id']);
  }

  private async actualizarAsync(id: number, payload: ProductoInput): Promise<Producto> {
    const { imagenes, caracteristicas, ...datos } = payload;
    const { error } = await this.supabase.from(this.tabla).update(datos).eq('id', id);
    if (error) {
      throw error;
    }

    await this.reemplazarListas(id, imagenes, caracteristicas);
    return this.obtenerConRelacionesAsync(id);
  }

  /** Igual que el backend de FastAPI: borra todas las filas hijas y las vuelve a insertar. */
  private async reemplazarListas(
    productoId: number,
    imagenes: ProductoImagenInput[],
    caracteristicas: ProductoCaracteristicaInput[]
  ): Promise<void> {
    const { error: errImgDel } = await this.supabase
      .from('producto_imagenes')
      .delete()
      .eq('producto_id', productoId);
    if (errImgDel) {
      throw errImgDel;
    }
    if (imagenes.length > 0) {
      const { error: errImgIns } = await this.supabase
        .from('producto_imagenes')
        .insert(imagenes.map((img) => ({ ...img, producto_id: productoId })));
      if (errImgIns) {
        throw errImgIns;
      }
    }

    const { error: errCarDel } = await this.supabase
      .from('producto_caracteristicas')
      .delete()
      .eq('producto_id', productoId);
    if (errCarDel) {
      throw errCarDel;
    }
    if (caracteristicas.length > 0) {
      const { error: errCarIns } = await this.supabase
        .from('producto_caracteristicas')
        .insert(caracteristicas.map((c) => ({ ...c, producto_id: productoId })));
      if (errCarIns) {
        throw errCarIns;
      }
    }
  }

  private async obtenerConRelacionesAsync(id: number): Promise<Producto> {
    const { data, error } = await this.supabase
      .from(this.tabla)
      .select(SELECT_CON_RELACIONES)
      .eq('id', id)
      .single();
    if (error || !data) {
      throw error ?? new Error('No se pudo cargar el producto.');
    }
    return ordenarListas(data as Producto);
  }
}
