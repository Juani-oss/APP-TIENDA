import { Component, ElementRef, input, viewChild } from '@angular/core';

import { Producto } from '../../../core/models/producto.model';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-carousel',
  imports: [ProductCard],
  templateUrl: './product-carousel.html',
  styleUrl: './product-carousel.scss',
})
export class ProductCarousel {
  readonly productos = input.required<Producto[]>();

  private readonly track = viewChild.required<ElementRef<HTMLDivElement>>('track');

  scrollPrev(): void {
    this.desplazar(-1);
  }

  scrollNext(): void {
    this.desplazar(1);
  }

  private desplazar(direccion: 1 | -1): void {
    const el = this.track().nativeElement;
    const distancia = el.clientWidth * 0.8 * direccion;
    el.scrollBy({ left: distancia, behavior: 'smooth' });
  }
}
