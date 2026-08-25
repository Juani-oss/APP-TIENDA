import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

/**
 * Cliente único de Supabase, compartido por todos los servicios que migren
 * de FastAPI a Supabase (auth, base de datos, storage).
 */
@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );
}
