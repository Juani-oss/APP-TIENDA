/**
 * Mapea el nombre/slug de una categoría (dato real y dinámico, gestionado
 * desde el admin) a un ícono del sprite (`icon-sprite.html`). Usa
 * coincidencia por palabra clave y cae a un ícono genérico si no reconoce
 * la categoría — así funciona con cualquier catálogo, no solo el de ejemplo.
 */
const REGLAS: Array<{ icono: string; claves: string[] }> = [
  { icono: 'i-chip', claves: ['electr', 'tecno', 'gadget', 'comput'] },
  { icono: 'i-hanger', claves: ['moda', 'ropa', 'vestim', 'indument'] },
  { icono: 'i-home', claves: ['hogar', 'casa', 'decor', 'mueble'] },
  { icono: 'i-sparkle', claves: ['bellez', 'cuidado', 'cosmet', 'skincare'] },
  { icono: 'i-shoe', claves: ['calzado', 'zapat', 'sneaker'] },
  { icono: 'i-dumbbell', claves: ['deport', 'fitness', 'gym'] },
  { icono: 'i-globe', claves: ['internacional', 'importad', 'global'] },
  { icono: 'i-gift', claves: ['curiosidad', 'regalo', 'novedad'] },
];

export function categoriaIcono(nombreOSlug: string): string {
  const texto = nombreOSlug.toLowerCase();
  const regla = REGLAS.find((r) => r.claves.some((clave) => texto.includes(clave)));
  return regla?.icono ?? 'i-tag';
}
