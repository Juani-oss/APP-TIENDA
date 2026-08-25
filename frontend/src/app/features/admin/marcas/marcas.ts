import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Marca, MarcaInput } from '../../../core/models/marca.model';
import { MarcaService } from '../../../core/services/marca.service';
import { UploadService } from '../../../core/services/upload.service';
import { resolverImagenUrl } from '../../../core/utils/imagen-url';

const VACIO: MarcaInput = { nombre: '', slug: '', logo_url: '', descripcion: '' };

@Component({
  selector: 'app-admin-marcas',
  imports: [FormsModule],
  templateUrl: './marcas.html',
  styleUrl: './marcas.scss',
})
export class AdminMarcas implements OnInit {
  private readonly marcaService = inject(MarcaService);
  private readonly uploadService = inject(UploadService);

  protected readonly resolverImagenUrl = resolverImagenUrl;

  readonly marcas = signal<Marca[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly mostrarForm = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly form = signal<MarcaInput>({ ...VACIO });
  readonly guardando = signal(false);
  readonly subiendoImagen = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.marcaService.listar().subscribe({
      next: (marcas) => {
        this.marcas.set(marcas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las marcas.');
        this.cargando.set(false);
      },
    });
  }

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.form.set({ ...VACIO });
    this.mostrarForm.set(true);
  }

  editar(marca: Marca): void {
    this.editandoId.set(marca.id);
    this.form.set({
      nombre: marca.nombre,
      slug: marca.slug,
      logo_url: marca.logo_url ?? '',
      descripcion: marca.descripcion ?? '',
    });
    this.mostrarForm.set(true);
  }

  cancelar(): void {
    this.mostrarForm.set(false);
  }

  actualizarCampo<K extends keyof MarcaInput>(campo: K, valor: MarcaInput[K]): void {
    this.form.update((actual) => ({ ...actual, [campo]: valor }));
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) {
      return;
    }

    this.subiendoImagen.set(true);
    this.error.set(null);

    this.uploadService.subirImagen(archivo).subscribe({
      next: (res) => {
        this.actualizarCampo('logo_url', res.url);
        this.subiendoImagen.set(false);
      },
      error: () => {
        this.error.set('No se pudo subir el logo (formato o tamaño no permitido, máx. 5MB).');
        this.subiendoImagen.set(false);
      },
    });
  }

  autoSlug(): void {
    if (this.editandoId()) return;
    const slug = this.form()
      .nombre.toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.actualizarCampo('slug', slug);
  }

  guardar(): void {
    const datos = this.form();
    if (!datos.nombre.trim() || !datos.slug.trim()) {
      this.error.set('Completá nombre y slug.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    const id = this.editandoId();
    const request = id ? this.marcaService.actualizar(id, datos) : this.marcaService.crear(datos);

    request.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.cargar();
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar la marca.');
      },
    });
  }

  eliminar(marca: Marca): void {
    if (!confirm(`¿Eliminar "${marca.nombre}"? Esto puede fallar si tiene productos asociados.`)) {
      return;
    }
    this.marcaService.eliminar(marca.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo eliminar (¿tiene productos asociados?).'),
    });
  }
}
