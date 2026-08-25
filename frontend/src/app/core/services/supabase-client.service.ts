import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';
import { CookieStorage } from '../utils/cookie-storage';

/**
 * Cliente único de Supabase, compartido por todos los servicios que migren
 * de FastAPI a Supabase (auth, base de datos, storage).
 *
 * La sesión se guarda en cookies (SameSite=Strict) en vez de localStorage —
 * ver CookieStorage para el detalle de qué protege esto y qué no.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey, {
    auth: {
      storage: new CookieStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
