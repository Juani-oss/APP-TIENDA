import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Producto } from '../../../core/models/producto.model';
import { resolverImagenUrl } from '../../../core/utils/imagen-url';

const INTERVALO_AUTOPLAY_MS = 5000;

@Component({
  selector: 'app-hero-carousel',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.scss',
})
export class HeroCarousel {
  /** Un producto destacado por diapositiva — así el carrusel gira con cualquier cantidad (incluso 2). */
  readonly productos = input<Producto[]>([]);

  readonly actual = signal(0);

  private readonly destroyRef = inject(DestroyRef);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected readonly resolverImagenUrl = resolverImagenUrl;

  constructor() {
    effect(() => {
      const total = this.productos().length;
      untracked(() => this.actual.set(0));
      this.reiniciarAutoplay(total);
    });

    this.destroyRef.onDestroy(() => this.detenerAutoplay());
  }

  irA(index: number): void {
    this.actual.set(index);
    this.reiniciarAutoplay(this.productos().length);
  }

  siguiente(): void {
    const total = this.productos().length;
    this.irA((this.actual() + 1) % total);
  }

  anterior(): void {
    const total = this.productos().length;
    this.irA((this.actual() - 1 + total) % total);
  }

  pausar(): void {
    this.detenerAutoplay();
  }

  reanudar(): void {
    this.reiniciarAutoplay(this.productos().length);
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
