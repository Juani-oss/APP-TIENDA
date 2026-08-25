import { Component, computed, effect, inject, input, signal } from '@angular/core';

import { Marca } from '../../../core/models/marca.model';
import { Producto } from '../../../core/models/producto.model';
import { MarcaService } from '../../../core/services/marca.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ProductosSeparados } from '../../../shared/components/productos-separados/productos-separados';

@Component({
  selector: 'app-marca-productos',
  imports: [ProductosSeparados],
  templateUrl: './marca-productos.html',
  styleUrl: './marca-productos.scss',
})
export class MarcaProductos {
  private readonly marcaService = inject(MarcaService);
  private readonly productoService = inject(ProductoService);

  readonly id = input('');
  readonly marcaIdNum = computed(() => Number(this.id()));

  readonly marca = signal<Marca | null>(null);
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    // effect() en vez de ngOnInit: al navegar de una marca a otra, Angular
    // reutiliza esta misma instancia (solo cambia el :id de la ruta), así
    // que el fetch tiene que reaccionar al id en vez de correr una sola vez.
    effect(() => {
      const marcaId = this.marcaIdNum();

      this.cargando.set(true);
      this.error.set(null);
      this.marca.set(null);
      this.productos.set([]);

      this.marcaService.obtener(marcaId).subscribe({
        next: (marca) => this.marca.set(marca),
        error: () => this.error.set('Marca no encontrada.'),
      });

      this.productoService.listar({ marca_id: marcaId, activo: true }).subscribe({
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
