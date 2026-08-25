import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';

import { SupabaseClientService } from './supabase-client.service';

export interface UploadResponse {
  url: string;
}

const BUCKET = 'productos';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly supabase = inject(SupabaseClientService).client;

  subirImagen(archivo: File): Observable<UploadResponse> {
    const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const ruta = `${crypto.randomUUID()}-${nombreLimpio}`;

    return from(
      this.supabase.storage.from(BUCKET).upload(ruta, archivo, {
        cacheControl: '3600',
        upsert: false,
      })
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) {
          throw error ?? new Error('No se pudo subir la imagen.');
        }
        const { data: urlData } = this.supabase.storage.from(BUCKET).getPublicUrl(data.path);
        return { url: urlData.publicUrl };
      })
    );
  }
}
