import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';

import { DashboardStats } from '../models/dashboard.model';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly supabase = inject(SupabaseClientService).client;

  obtenerStats(): Observable<DashboardStats> {
    return from(this.obtenerStatsAsync());
  }

  private async obtenerStatsAsync(): Promise<DashboardStats> {
    const [productos, categorias, marcas, sinStock, pendientes] = await Promise.all([
      this.supabase.from('productos').select('*', { count: 'exact', head: true }),
      this.supabase.from('categorias').select('*', { count: 'exact', head: true }),
      this.supabase.from('marcas').select('*', { count: 'exact', head: true }),
      this.supabase.from('productos').select('*', { count: 'exact', head: true }).eq('stock', 0),
      this.supabase
        .from('comentarios')
        .select('*', { count: 'exact', head: true })
        .eq('aprobado', false),
    ]);

    for (const resultado of [productos, categorias, marcas, sinStock, pendientes]) {
      if (resultado.error) {
        throw resultado.error;
      }
    }

    return {
      total_productos: productos.count ?? 0,
      total_categorias: categorias.count ?? 0,
      total_marcas: marcas.count ?? 0,
      productos_sin_stock: sinStock.count ?? 0,
      comentarios_pendientes: pendientes.count ?? 0,
    };
  }
}
