import { environment } from '../../../environments/environment';

/**
 * Las imágenes subidas se guardan en el backend y se devuelven como ruta
 * relativa (p. ej. "/api/uploads/files/xxx.jpg"). Si además el usuario pegó
 * una URL externa completa, se respeta tal cual.
 */
export function resolverImagenUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const origen = environment.apiUrl.replace(/\/api\/?$/, '');
  return `${origen}${url}`;
}
