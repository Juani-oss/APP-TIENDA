-- Colores/variantes de un producto (ej: un mismo estuche de iPhone en varios
-- colores). Cada color tiene su propio stock y, opcionalmente, su propia foto
-- — así se puede saber si se agotó un color puntual sin afectar a los demás.
create table if not exists public.producto_colores (
  id bigint generated always as identity primary key,
  producto_id bigint not null references public.productos (id) on delete cascade,
  nombre varchar(60) not null,
  color_hex varchar(9),
  imagen_url varchar(500),
  stock integer not null default 0,
  orden integer not null default 0
);

alter table public.producto_colores enable row level security;

-- Mismo patrón que producto_imagenes/producto_caracteristicas: hereda la
-- visibilidad pública, solo el admin escribe.
create policy "producto_colores_select_publico" on public.producto_colores for select using (true);
create policy "producto_colores_write_admin" on public.producto_colores for all
  using (public.is_admin()) with check (public.is_admin());
