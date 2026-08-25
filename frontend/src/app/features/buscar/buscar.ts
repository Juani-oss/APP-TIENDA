import { Component, effect, inject, input, signal } from '@angular/core';

import { Producto } from '../../core/models/producto.model';
import { ProductoService } from '../../core/services/producto.service';
import { ProductosSeparados } from '../../shared/components/productos-separados/productos-separados';

@Component({
  selector: 'app-buscar',
  imports: [ProductosSeparados],
  templateUrl: './buscar.html',
  styleUrl: './buscar.scss',
})
export class Buscar {
  private readonly productoService = inject(ProductoService);

  readonly q = input('');

  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const termino = this.q();
      this.cargando.set(true);
      this.error.set(null);

      this.productoService.listar({ search: termino, activo: true }).subscribe({
        next: (productos) => {
          this.productos.set(productos);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo completar la búsqueda.');
          this.cargando.set(false);
        },
      });
    });
  }
}
