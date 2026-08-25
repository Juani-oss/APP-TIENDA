import {
  Directive,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  input,
  inject,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const REDUCE_MOTION = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * Anima el elemento host (fade + desplazamiento) cuando entra en el viewport
 * al hacer scroll, usando GSAP ScrollTrigger.
 *
 * Uso: <div appScrollReveal>...</div>
 *      <div appScrollReveal from="left" [delay]="0.15">...</div>
 *      <div appScrollReveal [stagger]="true">  <!-- anima los hijos directos en cascada -->
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private trigger?: ScrollTrigger;
  private tween?: gsap.core.Tween;

  /** Dirección desde donde entra: 'up' (default), 'left', 'right' o 'fade' (sin desplazamiento). */
  readonly from = input<'up' | 'left' | 'right' | 'fade'>('up');
  /** Delay en segundos antes de arrancar la animación. */
  readonly delay = input(0);
  /** Duración en segundos. */
  readonly duration = input(0.7);
  /** Si es true, anima los hijos directos en cascada en vez del elemento entero. */
  readonly stagger = input(false);

  ngAfterViewInit(): void {
    const host = this.elementRef.nativeElement;
    const targets = this.stagger() ? Array.from(host.children) : host;

    if (REDUCE_MOTION) {
      gsap.set(targets, { opacity: 1, x: 0, y: 0 });
      return;
    }

    const offset = { up: { y: 32 }, left: { x: -32 }, right: { x: 32 }, fade: {} }[this.from()];

    this.tween = gsap.fromTo(
      targets,
      { opacity: 0, ...offset },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: this.duration(),
        delay: this.delay(),
        ease: 'power2.out',
        stagger: this.stagger() ? 0.12 : 0,
        scrollTrigger: {
          trigger: host,
          start: 'top 85%',
          once: true,
        },
      },
    );
    this.trigger = this.tween.scrollTrigger;
  }

  ngOnDestroy(): void {
    this.trigger?.kill();
    this.tween?.kill();
  }
}
