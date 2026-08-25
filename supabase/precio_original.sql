-- Precio "de lista" opcional: si se carga y es mayor al precio actual, la
-- tienda muestra el precio tachado + el actual, como el descuento real de
-- Amazon (u otra tienda con oferta).
alter table public.productos
  add column if not exists precio_original numeric(10, 2);
