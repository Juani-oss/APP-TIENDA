import { Component, computed, input } from '@angular/core';

import { Producto } from '../../../core/models/producto.model';
import { ProductCard } from '../product-card/product-card';
import { ProductCarousel } from '../product-carousel/product-carousel';

/**
 * Separa una lista de productos en dos bloques: catálogo propio y
 * recomendados de afiliados (Amazon). Nunca los mezcla en la misma grilla.
 */
@Component({
  selector: 'app-productos-separados',
  imports: [ProductCard, ProductCarousel],
  templateUrl: './productos-separados.html',
  styleUrl: './productos-separados.scss',
})
export class ProductosSeparados {
  readonly productos = input<Producto[]>([]);
  readonly layout = input<'grid' | 'carousel'>('grid');
  readonly tituloPropio = input('Nuestro catálogo');

  readonly propios = computed(() => this.productos().filter((p) => !p.es_afiliado));
  readonly afiliados = computed(() => this.productos().filter((p) => p.es_afiliado));
}
