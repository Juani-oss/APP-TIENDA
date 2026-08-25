import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Comentario } from '../../core/models/comentario.model';
import { Producto } from '../../core/models/producto.model';
import { ComentarioService } from '../../core/services/comentario.service';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { ProductoService } from '../../core/services/producto.service';
import { resolverImagenUrl } from '../../core/utils/imagen-url';
import { whatsappHref } from '../../core/utils/whatsapp';

@Component({
  selector: 'app-producto-detalle',
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.scss',
})
export class ProductoDetalle {
  private readonly productoService = inject(ProductoService);
  private readonly comentarioService = inject(ComentarioService);
  protected readonly configuracion = inject(ConfiguracionService);

  readonly id = input('');
  readonly productoIdNum = computed(() => Number(this.id()));

  protected readonly resolverImagenUrl = resolverImagenUrl;

  readonly producto = signal<Producto | null>(null);
  readonly comentarios = signal<Comentario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly imagenActual = signal<string | null>(null);

  /** % de descuento redondeado, o null si no hay precio original cargado. */
  readonly descuento = computed(() => {
    const p = this.producto();
    if (!p?.precio_original || p.precio_original <= p.precio) {
      return null;
    }
    return Math.round((1 - p.precio / p.precio_original) * 100);
  });

  /** Líneas de la dirección del casillero, listas para mostrar o copiar. */
  readonly direccionCasillero = computed(() => {
    const c = this.configuracion.config();
    if (!c) {
      return [];
    }
    const ciudadEstadoCp = [c.casillero_ciudad, c.casillero_estado, c.casillero_cp]
      .filter(Boolean)
      .join(', ');
    return [c.casillero_nombre, c.casillero_direccion_linea1, c.casillero_direccion_linea2, ciudadEstadoCp, 'Estados Unidos'].filter(
      (linea): linea is string => !!linea
    );
  });

  /** Portada + galería, sin duplicados, para la tira de miniaturas. */
  readonly galeria = computed(() => {
    const p = this.producto();
    if (!p) {
      return [];
    }
    const urls = [p.imagen_url, ...p.imagenes.map((img) => img.url)].filter(
      (url): url is string => !!url
    );
    return [...new Set(urls)];
  });

  readonly autor = signal('');
  readonly contenido = signal('');
  readonly calificacion = signal(5);
  readonly enviandoComentario = signal(false);
  readonly comentarioEnviado = signal(false);
  readonly linkCopiado = signal(false);
  readonly direccionCopiada = signal(false);

  constructor() {
    // effect() en vez de ngOnInit: si se navega de un producto a otro
    // mientras ya se está en esta ruta, Angular reutiliza la instancia y
    // solo cambia el :id — ngOnInit no volvería a correr, pero esto sí.
    effect(() => {
      const productoId = this.productoIdNum();

      this.cargando.set(true);
      this.error.set(null);
      this.producto.set(null);
      this.comentarios.set([]);

      this.productoService.obtener(productoId).subscribe({
        next: (producto) => {
          this.producto.set(producto);
          this.imagenActual.set(producto.imagen_url);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('Producto no encontrado.');
          this.cargando.set(false);
        },
      });

      this.comentarioService.listarPorProducto(productoId).subscribe({
        next: (comentarios) => this.comentarios.set(comentarios),
      });
    });
  }

  seleccionarImagen(url: string): void {
    this.imagenActual.set(url);
  }

  estrellas(calificacion: number): string {
    return '★'.repeat(calificacion) + '☆'.repeat(5 - calificacion);
  }

  whatsappHref(): string {
    const p = this.producto();
    if (!p) {
      return '';
    }
    const mensaje =
      `¡Hola! Quiero comprar este producto:\n` +
      `${p.nombre} - ${p.precio.toFixed(2)} USD\n` +
      `${window.location.href}`;
    return whatsappHref(mensaje);
  }

  whatsappHrefEnvio(): string {
    const p = this.producto();
    if (!p) {
      return '';
    }
    const mensaje =
      `¡Hola! Quiero cotizar el envío a Ecuador de este producto (lo compro en Amazon y lo mando al casillero):\n` +
      `${p.nombre}\n` +
      `${window.location.href}`;
    return whatsappHref(mensaje);
  }

  copiarDireccion(): void {
    navigator.clipboard.writeText(this.direccionCasillero().join('\n')).then(() => {
      this.direccionCopiada.set(true);
      setTimeout(() => this.direccionCopiada.set(false), 2000);
    });
  }

  compartir(): void {
    const p = this.producto();
    if (!p) {
      return;
    }
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({ title: p.nombre, text: `Mirá este producto: ${p.nombre}`, url }).catch(() => {
        // El usuario canceló el share nativo o no está soportado; no hacemos nada más.
      });
      return;
    }

    navigator.clipboard.writeText(url).then(() => {
      this.linkCopiado.set(true);
      setTimeout(() => this.linkCopiado.set(false), 2000);
    });
  }

  enviarComentario(): void {
    if (!this.autor().trim() || !this.contenido().trim()) {
      return;
    }

    this.enviandoComentario.set(true);
    this.comentarioService
      .crear(this.productoIdNum(), {
        autor: this.autor(),
        contenido: this.contenido(),
        calificacion: this.calificacion(),
      })
      .subscribe({
        next: (comentario) => {
          // Lo mostramos al instante en esta misma página, marcado como
          // pendiente: recién será visible para el resto tras aprobación.
          this.comentarios.update((actuales) => [comentario, ...actuales]);
          this.enviandoComentario.set(false);
          this.comentarioEnviado.set(true);
          this.autor.set('');
          this.contenido.set('');
          this.calificacion.set(5);
        },
        error: () => {
          this.enviandoComentario.set(false);
        },
      });
  }
}
