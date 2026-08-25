import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Permite el acceso solo si hay un admin autenticado (sesión de Supabase Auth
 * con una fila en public.perfiles con rol='admin'). Chequea isAdmin de forma
 * explícita — no alcanza con "hay sesión" — así que si algún día se agrega
 * un rol no-admin en perfiles, esos usuarios no ven ni el shell del panel,
 * aunque las políticas de RLS ya les bloquean los datos igual.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return auth.isAdmin() || router.createUrlTree(['/login']);
  }

  return auth.verificarSesion().pipe(map(() => auth.isAdmin() || router.createUrlTree(['/login'])));
};
