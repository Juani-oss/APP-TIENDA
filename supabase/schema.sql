-- ============================================================
-- RomVal Store — esquema inicial para Supabase
-- Corré esto una sola vez en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ---------- Tablas ----------

create table if not exists public.categorias (
  id bigint generated always as identity primary key,
  nombre varchar(120) not null,
  slug varchar(140) not null unique,
  descripcion text,
  created_at timestamptz not null default now()
);

create table if not exists public.marcas (
  id bigint generated always as identity primary key,
  nombre varchar(120) not null,
  slug varchar(140) not null unique,
  logo_url varchar(500),
  descripcion text,
  created_at timestamptz not null default now()
);

create table if not exists public.productos (
  id bigint generated always as identity primary key,
  nombre varchar(200) not null,
  descripcion text,
  precio numeric(10, 2) not null check (precio > 0),
  stock integer not null default 0,
  imagen_url varchar(500),
  destacado boolean not null default false,
  activo boolean not null default true,
  es_afiliado boolean not null default false,
  enlace_afiliado varchar(1000),
  categoria_id bigint not null references public.categorias (id),
  marca_id bigint not null references public.marcas (id),
  created_at timestamptz not null default now()
);

create table if not exists public.producto_imagenes (
  id bigint generated always as identity primary key,
  producto_id bigint not null references public.productos (id) on delete cascade,
  url varchar(500) not null,
  orden integer not null default 0
);

create table if not exists public.producto_caracteristicas (
  id bigint generated always as identity primary key,
  producto_id bigint not null references public.productos (id) on delete cascade,
  clave varchar(120) not null,
  valor varchar(500) not null,
  orden integer not null default 0
);

create table if not exists public.comentarios (
  id bigint generated always as identity primary key,
  producto_id bigint not null references public.productos (id) on delete cascade,
  autor varchar(120) not null,
  contenido text not null,
  calificacion integer not null default 5 check (calificacion between 1 and 5),
  aprobado boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.configuracion (
  id int primary key default 1 check (id = 1), -- fila única, siempre id=1
  carrito_habilitado boolean not null default false,
  envio_casillero_habilitado boolean not null default false,
  casillero_nombre varchar(200),
  casillero_direccion_linea1 varchar(300),
  casillero_direccion_linea2 varchar(300),
  casillero_ciudad varchar(120),
  casillero_estado varchar(120),
  casillero_cp varchar(30),
  casillero_notas text,
  instagram_url varchar(500),
  facebook_url varchar(500),
  updated_at timestamptz not null default now()
);

-- Perfiles: reemplaza la tabla "usuarios" propia — se linkea 1 a 1 con
-- auth.users (Supabase Auth). Cualquier fila acá es un admin de la tienda.
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre varchar(120),
  rol varchar(20) not null default 'admin',
  created_at timestamptz not null default now()
);

insert into public.configuracion (id)
values (1)
on conflict (id) do nothing;

-- ---------- Funciones auxiliares ----------

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

create or replace function public.forzar_comentario_pendiente()
returns trigger
language plpgsql
as $$
begin
  new.aprobado := false;
  return new;
end;
$$;

drop trigger if exists comentarios_forzar_pendiente on public.comentarios;
create trigger comentarios_forzar_pendiente
  before insert on public.comentarios
  for each row execute function public.forzar_comentario_pendiente();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists configuracion_set_updated_at on public.configuracion;
create trigger configuracion_set_updated_at
  before update on public.configuracion
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------

alter table public.categorias enable row level security;
alter table public.marcas enable row level security;
alter table public.productos enable row level security;
alter table public.producto_imagenes enable row level security;
alter table public.producto_caracteristicas enable row level security;
alter table public.comentarios enable row level security;
alter table public.configuracion enable row level security;
alter table public.perfiles enable row level security;

-- Categorías: lectura pública, escritura solo admin.
create policy "categorias_select_publico" on public.categorias for select using (true);
create policy "categorias_write_admin" on public.categorias for all
  using (public.is_admin()) with check (public.is_admin());

-- Marcas: igual que categorías.
create policy "marcas_select_publico" on public.marcas for select using (true);
create policy "marcas_write_admin" on public.marcas for all
  using (public.is_admin()) with check (public.is_admin());

-- Productos: público ve solo los activos; admin ve todo.
create policy "productos_select_publico" on public.productos for select
  using (activo = true or public.is_admin());
create policy "productos_write_admin" on public.productos for all
  using (public.is_admin()) with check (public.is_admin());

-- Galería y características: heredan la visibilidad de su producto.
create policy "producto_imagenes_select_publico" on public.producto_imagenes for select using (true);
create policy "producto_imagenes_write_admin" on public.producto_imagenes for all
  using (public.is_admin()) with check (public.is_admin());

create policy "producto_caracteristicas_select_publico" on public.producto_caracteristicas for select using (true);
create policy "producto_caracteristicas_write_admin" on public.producto_caracteristicas for all
  using (public.is_admin()) with check (public.is_admin());

-- Comentarios: público ve solo aprobados; cualquiera puede dejar uno nuevo
-- (queda pendiente, forzado por trigger); solo admin modera/borra.
create policy "comentarios_select_aprobados_o_admin" on public.comentarios for select
  using (aprobado = true or public.is_admin());
create policy "comentarios_insert_publico" on public.comentarios for insert
  with check (true);
create policy "comentarios_update_admin" on public.comentarios for update
  using (public.is_admin()) with check (public.is_admin());
create policy "comentarios_delete_admin" on public.comentarios for delete
  using (public.is_admin());

-- Configuración: lectura pública (el sitio necesita saber si el carrito está
-- habilitado, la dirección del casillero, etc.), escritura solo admin.
create policy "configuracion_select_publico" on public.configuracion for select using (true);
create policy "configuracion_write_admin" on public.configuracion for all
  using (public.is_admin()) with check (public.is_admin());

-- Perfiles: cada quien ve el suyo; admin ve todos. Sin alta/baja desde la
-- app — los admins se agregan a mano desde el SQL Editor.
create policy "perfiles_select_propio_o_admin" on public.perfiles for select
  using (id = auth.uid() or public.is_admin());
