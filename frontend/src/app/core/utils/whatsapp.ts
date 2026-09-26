export const NUMERO_WHATSAPP_VENTAS = '593983483140';

export function whatsappHref(mensaje: string, numero: string = NUMERO_WHATSAPP_VENTAS): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
