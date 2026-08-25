import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Producto } from '../../../core/models/producto.model';
import { CarritoDemoService } from '../../../core/services/carrito-demo.service';
import { ConfiguracionService } from '../../../core/services/configuracion.service';
import { categoriaIcono } from '../../../core/utils/categoria-icono';
import { resolverImagenUrl } from '../../../core/utils/imagen-url';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly producto = input.required<Producto>();

  protected readonly configuracion = inject(ConfiguracionService);
  private readonly carritoDemo = inject(CarritoDemoService);
  private readonly router = inject(Router);

  protected readonly resolverImagenUrl = resolverImagenUrl;
  protected readonly categoriaIcono = categoriaIcono;

  /** % de descuento redondeado, o null si no hay precio original cargado. */
  protected readonly descuento = computed(() => {
    const { precio, precio_original } = this.producto();
    if (!precio_original || precio_original <= precio) {
      return null;
    }
    return Math.round((1 - precio / precio_original) * 100);
  });

  /** El botón vive dentro de la tarjeta clicable: frena la navegación al detalle. */
  irAlCarrito(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.carritoDemo.agregar();
    this.router.navigate(['/carrito']);
  }
}
