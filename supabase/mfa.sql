-- ============================================================
-- RomVal Store — exige 2FA (aal2) a nivel de base de datos
-- Corré esto en: Supabase Dashboard → SQL Editor → New query
-- ============================================================
--
-- Sin esto, activar 2FA en la pantalla de login sería solo cosmético:
-- cualquiera que tenga tu contraseña podría seguir leyendo/escribiendo
-- datos de admin llamando directo a la API de Supabase, sin pasar por el
-- login de la app. Con este cambio, is_admin() exige que la sesión haya
-- completado el segundo factor (aal2) — a menos que el usuario todavía no
-- tenga ningún factor de 2FA verificado, en cuyo caso alcanza con la
-- contraseña (aal1), para no bloquearte antes de activarlo.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'admin'
  )
  and (
    coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
    or not exists (
      select 1 from auth.mfa_factors
      where user_id = auth.uid() and status = 'verified'
    )
  );
$$;
