/**
 * Adaptador de storage para la sesión de Supabase Auth usando cookies en vez
 * de localStorage.
 *
 * Importante — esto NO es una cookie httpOnly: una SPA estática (sin
 * servidor propio) no puede setear httpOnly desde el navegador, esas solo
 * las pone un servidor en la respuesta HTTP. Cualquier cookie escrita acá
 * desde JS es igual de legible para un script malicioso que localStorage —
 * no es protección real contra robo de token por XSS. Lo que sí suma:
 * SameSite=Strict (protege contra CSRF) y una vida útil explícita.
 */
export class CookieStorage {
  private readonly maxAgeSegundos = 60 * 60 * 24 * 7; // 7 días

  getItem(key: string): string | null {
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + key.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  setItem(key: string, value: string): void {
    // Las cookies tienen un límite de ~4KB. La sesión de Supabase (access +
    // refresh token + datos de usuario) normalmente entra bien holgada,
    // pero si algún día crece (ej. mucho user_metadata) esto avisa en vez
    // de fallar en silencio.
    if (value.length > 3800) {
      console.warn(
        `[CookieStorage] El valor para "${key}" mide ${value.length} caracteres, cerca del límite de ~4KB de una cookie. Podría truncarse en algunos navegadores.`
      );
    }
    const seguro = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${this.maxAgeSegundos}; SameSite=Strict${seguro}`;
  }

  removeItem(key: string): void {
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Strict`;
  }
}
