import { Injectable, signal } from '@angular/core';

/**
 * Contador del ícono de carrito en el navbar. No hay carrito real todavía
 * (ver ConfiguracionService.carritoHabilitado): esto solo refleja clics
 * reales en "Agregar al Carrito" durante la sesión, no inventa cantidades.
 */
@Injectable({ providedIn: 'root' })
export class CarritoDemoService {
  readonly cantidad = signal(0);

  agregar(): void {
    this.cantidad.update((n) => n + 1);
  }
}
