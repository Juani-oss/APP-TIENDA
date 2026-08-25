import { DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Producto } from '../../../core/models/producto.model';
import { resolverImagenUrl } from '../../../core/utils/imagen-url';

const INTERVALO_AUTOPLAY_MS = 5000;

export interface BannerPromo {
  url: string;
  enlace: string | null;
}

type Slide =
  | { tipo: 'producto'; producto: Producto }
  | { tipo: 'banner'; url: string; enlace: string | null };

@Component({
  selector: 'app-hero-carousel',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.scss',
})
export class HeroCarousel {
  /** Un producto destacado por diapositiva — así el carrusel gira con cualquier cantidad (incluso 2). */
  readonly productos = input<Producto[]>([]);
  /** Diapositiva de promoción opcional, cargada desde Configuración; va primera. */
  readonly bannerPromo = input<BannerPromo | null>(null);

  readonly actual = signal(0);

  /** El banner (si está activo) siempre es la primera diapositiva. */
  readonly slides = computed<Slide[]>(() => {
    const productoSlides: Slide[] = this.productos().map((producto) => ({
      tipo: 'producto' as const,
      producto,
    }));
    const banner = this.bannerPromo();
    return banner
      ? [{ tipo: 'banner' as const, url: banner.url, enlace: banner.enlace }, ...productoSlides]
      : productoSlides;
  });

  private readonly destroyRef = inject(DestroyRef);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly resolverImagenUrl = resolverImagenUrl;

  constructor() {
    effect(() => {
      const total = this.slides().length;
      untracked(() => this.actual.set(0));
      this.reiniciarAutoplay(total);
    });

    this.destroyRef.onDestroy(() => this.detenerAutoplay());
  }

  trackSlide(slide: Slide): number | string {
    return slide.tipo === 'banner' ? 'banner' : slide.producto.id;
  }

  irA(index: number): void {
    this.actual.set(index);
    this.reiniciarAutoplay(this.slides().length);
  }

  siguiente(): void {
    const total = this.slides().length;
    this.irA((this.actual() + 1) % total);
  }

  anterior(): void {
    const total = this.slides().length;
    this.irA((this.actual() - 1 + total) % total);
  }

  pausar(): void {
    this.detenerAutoplay();
  }

  reanudar(): void {
    this.reiniciarAutoplay(this.slides().length);
  }

  private reiniciarAutoplay(total: number): void {
    this.detenerAutoplay();
    if (total > 1) {
      this.intervalId = setInterval(() => {
        this.actual.update((i) => (i + 1) % total);
      }, INTERVALO_AUTOPLAY_MS);
    }
  }

  private detenerAutoplay(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
