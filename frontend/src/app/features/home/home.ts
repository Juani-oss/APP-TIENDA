import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { Marca } from '../../core/models/marca.model';
import { Producto } from '../../core/models/producto.model';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { MarcaService } from '../../core/services/marca.service';
import { ProductoService } from '../../core/services/producto.service';
import { BrandSlider } from '../../shared/components/brand-slider/brand-slider';
import { HeroCarousel } from '../../shared/components/hero-carousel/hero-carousel';
import { ProductosSeparados } from '../../shared/components/productos-separados/productos-separados';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

interface GrupoCategoria {
  categoriaId: number;
  nombre: string;
  productos: Producto[];
}

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
  readonly productos = signal<Producto[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  /** Un carrusel por categoría (Ropa, Belleza, Estuches Iphone...) en vez de mezclar todo en una sola fila. */
  readonly gruposPorCategoria = computed<GrupoCategoria[]>(() => {
    const mapa = new Map<number, GrupoCategoria>();
    for (const p of this.productos()) {
      const grupo = mapa.get(p.categoria_id);
      if (grupo) {
        grupo.productos.push(p);
      } else {
        mapa.set(p.categoria_id, { categoriaId: p.categoria_id, nombre: p.categoria.nombre, productos: [p] });
      }
    }
    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  ngOnInit(): void {
    // El navbar también la carga, pero no hay que depender de ese orden
    // para que el banner de promo aparezca.
    this.configuracion.cargar().subscribe();
    this.marcaService.listar().subscribe({ next: (m) => this.marcas.set(m) });

    this.productoService.listar({ activo: true }).subscribe({
      next: (productos) => {
        this.destacados.set(productos.filter((p) => p.destacado));
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos.');
        this.cargando.set(false);
      },
    });
  }
}
