import { Component, OnInit, inject, signal } from '@angular/core';

import { Marca } from '../../core/models/marca.model';
import { Producto } from '../../core/models/producto.model';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { MarcaService } from '../../core/services/marca.service';
import { ProductoService } from '../../core/services/producto.service';
import { BrandSlider } from '../../shared/components/brand-slider/brand-slider';
import { HeroCarousel } from '../../shared/components/hero-carousel/hero-carousel';
import { ProductosSeparados } from '../../shared/components/productos-separados/productos-separados';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-home',
  imports: [ProductosSeparados, BrandSlider, HeroCarousel, ScrollRevealDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly marcaService = inject(MarcaService);
  protected readonly configuracion = inject(ConfiguracionService);

  readonly destacados = signal<Producto[]>([]);
  readonly novedades = signal<Producto[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    // El navbar también la carga, pero no hay que depender de ese orden
    // para que el banner de promo aparezca.
    this.configuracion.cargar().subscribe();
    this.marcaService.listar().subscribe({ next: (m) => this.marcas.set(m) });

    this.productoService.listar({ activo: true }).subscribe({
      next: (productos) => {
        this.destacados.set(productos.filter((p) => p.destacado));
        this.novedades.set(productos.slice(0, 8));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos.');
        this.cargando.set(false);
      },
    });
  }
}
