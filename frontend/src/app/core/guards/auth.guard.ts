import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Permite el acceso solo si hay un admin autenticado (sesión de Supabase Auth
 * con una fila correspondiente en public.perfiles).
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return auth.verificarSesion().pipe(map((ok) => ok || router.createUrlTree(['/login'])));
};
