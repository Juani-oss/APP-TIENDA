/** true si el texto es una URL http(s) válida, o está vacío (campo opcional). */
export function esUrlValida(valor: string | null | undefined): boolean {
  if (!valor || !valor.trim()) {
    return true;
  }
  try {
    const url = new URL(valor.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
