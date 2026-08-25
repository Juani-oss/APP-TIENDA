import { Component, computed, effect, inject, input, signal } from '@angular/core';

import { Categoria } from '../../../core/models/categoria.model';
import { Producto } from '../../../core/models/producto.model';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ProductosSeparados } from '../../../shared/components/productos-separados/productos-separados';

@Component({
  selector: 'app-categoria-productos',
  imports: [ProductosSeparados],
  templateUrl: './categoria-productos.html',
  styleUrl: './categoria-productos.scss',
})
export class CategoriaProductos {
  private readonly categoriaService = inject(CategoriaService);
  private readonly productoService = inject(ProductoService);

  readonly id = input('');
  readonly categoriaIdNum = computed(() => Number(this.id()));

  readonly categoria = signal<Categoria | null>(null);
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    // effect() en vez de ngOnInit: si el usuario navega de una categoría a
    // otra (ej. desde la franja de categorías del navbar), Angular reutiliza
    // esta misma instancia del componente y solo cambia el :id de la ruta —
    // ngOnInit no se volvería a ejecutar, pero el effect sí reacciona.
    effect(() => {
      const categoriaId = this.categoriaIdNum();

      this.cargando.set(true);
      this.error.set(null);
      this.categoria.set(null);
      this.productos.set([]);

      this.categoriaService.obtener(categoriaId).subscribe({
        next: (categoria) => this.categoria.set(categoria),
        error: () => this.error.set('Categoría no encontrada.'),
      });

      this.productoService.listar({ categoria_id: categoriaId, activo: true }).subscribe({
        next: (productos) => {
          this.productos.set(productos);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los productos.');
          this.cargando.set(false);
        },
      });
    });
  }
}
