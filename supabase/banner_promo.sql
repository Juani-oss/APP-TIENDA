-- Banner promocional opcional que aparece como una diapositiva más dentro
-- del carrusel "Productos Importados de Tendencia" del home. Se administra
-- 100% desde el panel admin (Configuración): imagen, a dónde enlaza, y un
-- interruptor para activarlo/desactivarlo sin borrar la imagen cargada.
alter table public.configuracion
  add column if not exists banner_promo_activo boolean not null default false,
  add column if not exists banner_promo_url text,
  add column if not exists banner_promo_enlace text;
