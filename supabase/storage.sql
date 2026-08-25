-- ============================================================
-- RomVal Store — bucket de Storage para fotos de productos
-- Corré esto en: Supabase Dashboard → SQL Editor → New query
-- (después de haber corrido schema.sql)
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  5242880, -- 5 MB, igual que el límite que tenía FastAPI
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Lectura pública (para mostrar las fotos en la tienda sin login).
create policy "productos_bucket_select_publico" on storage.objects for select
  using (bucket_id = 'productos');

-- Solo el admin puede subir, reemplazar o borrar fotos.
create policy "productos_bucket_insert_admin" on storage.objects for insert
  with check (bucket_id = 'productos' and public.is_admin());

create policy "productos_bucket_update_admin" on storage.objects for update
  using (bucket_id = 'productos' and public.is_admin());

create policy "productos_bucket_delete_admin" on storage.objects for delete
  using (bucket_id = 'productos' and public.is_admin());
