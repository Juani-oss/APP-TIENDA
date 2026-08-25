import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Categoria } from '../../../core/models/categoria.model';
import { Marca } from '../../../core/models/marca.model';
import { Producto, ProductoInput } from '../../../core/models/producto.model';
import { CategoriaService } from '../../../core/services/categoria.service';
import { MarcaService } from '../../../core/services/marca.service';
import { ProductoService } from '../../../core/services/producto.service';
import { UploadService } from '../../../core/services/upload.service';
import { resolverImagenUrl } from '../../../core/utils/imagen-url';
import { esUrlValida } from '../../../core/utils/validar-url';

const VACIO: ProductoInput = {
  nombre: '',
  descripcion: '',
  precio: 0,
  precio_original: null,
  stock: 0,
  imagen_url: '',
  destacado: false,
  activo: true,
  es_afiliado: false,
  enlace_afiliado: '',
  categoria_id: 0,
  marca_id: 0,
  imagenes: [],
  caracteristicas: [],
};

@Component({
  selector: 'app-admin-productos',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
})
export class AdminProductos implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly marcaService = inject(MarcaService);
  private readonly uploadService = inject(UploadService);

  protected readonly resolverImagenUrl = resolverImagenUrl;

  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly mostrarForm = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly form = signal<ProductoInput>(estructuraVacia());
  readonly guardando = signal(false);
  readonly subiendoImagen = signal(false);
  readonly subiendoImagenGaleria = signal(false);

  ngOnInit(): void {
    this.cargarTodo();
  }

  private cargarTodo(): void {
    this.cargando.set(true);
    this.productoService.listar().subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos.');
        this.cargando.set(false);
      },
    });
    this.categoriaService.listar().subscribe({ next: (c) => this.categorias.set(c) });
    this.marcaService.listar().subscribe({ next: (m) => this.marcas.set(m) });
  }

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.form.set(estructuraVacia());
    this.mostrarForm.set(true);
  }

  editar(producto: Producto): void {
    this.editandoId.set(producto.id);
    this.form.set({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precio: producto.precio,
      precio_original: producto.precio_original,
      stock: producto.stock,
      imagen_url: producto.imagen_url ?? '',
      destacado: producto.destacado,
      activo: producto.activo,
      es_afiliado: producto.es_afiliado,
      enlace_afiliado: producto.enlace_afiliado ?? '',
      categoria_id: producto.categoria_id,
      marca_id: producto.marca_id,
      imagenes: producto.imagenes
        .slice()
        .sort((a, b) => a.orden - b.orden)
        .map((img) => ({ url: img.url, orden: img.orden })),
      caracteristicas: producto.caracteristicas
        .slice()
        .sort((a, b) => a.orden - b.orden)
        .map((c) => ({ clave: c.clave, valor: c.valor, orden: c.orden })),
    });
    this.mostrarForm.set(true);
  }

  cancelar(): void {
    this.mostrarForm.set(false);
    this.editandoId.set(null);
  }

  actualizarCampo<K extends keyof ProductoInput>(campo: K, valor: ProductoInput[K]): void {
    this.form.update((actual) => ({ ...actual, [campo]: valor }));
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = ''; // permite volver a elegir el mismo archivo si hace falta
    if (!archivo) {
      return;
    }

    this.subiendoImagen.set(true);
    this.error.set(null);

    this.uploadService.subirImagen(archivo).subscribe({
      next: (res) => {
        this.actualizarCampo('imagen_url', res.url);
        this.subiendoImagen.set(false);
      },
      error: () => {
        this.error.set('No se pudo subir la imagen (formato o tamaño no permitido, máx. 5MB).');
        this.subiendoImagen.set(false);
      },
    });
  }

  // ---------- Galería de fotos adicionales ----------

  agregarFotoGaleria(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) {
      return;
    }

    this.subiendoImagenGaleria.set(true);
    this.error.set(null);

    this.uploadService.subirImagen(archivo).subscribe({
      next: (res) => {
        this.form.update((actual) => ({
          ...actual,
          imagenes: [...actual.imagenes, { url: res.url, orden: actual.imagenes.length }],
        }));
        this.subiendoImagenGaleria.set(false);
      },
      error: () => {
        this.error.set('No se pudo subir la foto (formato o tamaño no permitido, máx. 5MB).');
        this.subiendoImagenGaleria.set(false);
      },
    });
  }

  quitarFotoGaleria(index: number): void {
    this.form.update((actual) => ({
      ...actual,
      imagenes: actual.imagenes.filter((_, i) => i !== index).map((img, i) => ({ ...img, orden: i })),
    }));
  }

  moverFotoGaleria(index: number, direccion: -1 | 1): void {
    this.form.update((actual) => {
      const destino = index + direccion;
      if (destino < 0 || destino >= actual.imagenes.length) {
        return actual;
      }
      const imagenes = actual.imagenes.slice();
      [imagenes[index], imagenes[destino]] = [imagenes[destino], imagenes[index]];
      return { ...actual, imagenes: imagenes.map((img, i) => ({ ...img, orden: i })) };
    });
  }

  // ---------- Características (ficha técnica) ----------

  agregarCaracteristica(): void {
    this.form.update((actual) => ({
      ...actual,
      caracteristicas: [
        ...actual.caracteristicas,
        { clave: '', valor: '', orden: actual.caracteristicas.length },
      ],
    }));
  }

  actualizarCaracteristica(index: number, campo: 'clave' | 'valor', valor: string): void {
    this.form.update((actual) => ({
      ...actual,
      caracteristicas: actual.caracteristicas.map((c, i) =>
        i === index ? { ...c, [campo]: valor } : c
      ),
    }));
  }

  quitarCaracteristica(index: number): void {
    this.form.update((actual) => ({
      ...actual,
      caracteristicas: actual.caracteristicas.filter((_, i) => i !== index),
    }));
  }

  guardar(): void {
    const datos = this.form();
    if (!datos.nombre.trim() || !datos.categoria_id || !datos.marca_id || datos.precio <= 0) {
      this.error.set('Completá nombre, categoría, marca y un precio válido.');
      return;
    }
    if (datos.es_afiliado && !datos.enlace_afiliado?.trim()) {
      this.error.set('Los productos de afiliado necesitan el link de Amazon (con tu tag).');
      return;
    }
    if (datos.es_afiliado && !esUrlValida(datos.enlace_afiliado)) {
      this.error.set('El link de afiliado no es una URL válida (tiene que empezar con http:// o https://).');
      return;
    }
    if (datos.imagenes.some((img) => !esUrlValida(img.url))) {
      this.error.set('Alguna foto de la galería quedó con una URL inválida.');
      return;
    }
    if (datos.caracteristicas.some((c) => !c.clave.trim() || !c.valor.trim())) {
      this.error.set('Completá o quitá las características vacías.');
      return;
    }
    if (datos.precio_original != null && datos.precio_original <= datos.precio) {
      this.error.set('El precio original tiene que ser mayor al precio actual (si no, no es un descuento).');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    const id = this.editandoId();
    const request = id
      ? this.productoService.actualizar(id, datos)
      : this.productoService.crear(datos);

    request.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.cargarTodo();
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar el producto.');
      },
    });
  }

  eliminar(producto: Producto): void {
    if (!confirm(`¿Eliminar "${producto.nombre}"?`)) {
      return;
    }
    this.productoService.eliminar(producto.id).subscribe({
      next: () => this.cargarTodo(),
      error: () => this.error.set('No se pudo eliminar el producto.'),
    });
  }
}

function estructuraVacia(): ProductoInput {
  return { ...VACIO, imagenes: [], caracteristicas: [] };
}
