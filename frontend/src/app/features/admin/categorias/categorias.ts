import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Categoria, CategoriaInput } from '../../../core/models/categoria.model';
import { CategoriaService } from '../../../core/services/categoria.service';

const VACIO: CategoriaInput = { nombre: '', slug: '', descripcion: '' };

@Component({
  selector: 'app-admin-categorias',
  imports: [FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss',
})
export class AdminCategorias implements OnInit {
  private readonly categoriaService = inject(CategoriaService);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly mostrarForm = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly form = signal<CategoriaInput>({ ...VACIO });
  readonly guardando = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las categorías.');
        this.cargando.set(false);
      },
    });
  }

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.form.set({ ...VACIO });
    this.mostrarForm.set(true);
  }

  editar(categoria: Categoria): void {
    this.editandoId.set(categoria.id);
    this.form.set({
      nombre: categoria.nombre,
      slug: categoria.slug,
      descripcion: categoria.descripcion ?? '',
    });
    this.mostrarForm.set(true);
  }

  cancelar(): void {
    this.mostrarForm.set(false);
  }

  actualizarCampo<K extends keyof CategoriaInput>(campo: K, valor: CategoriaInput[K]): void {
    this.form.update((actual) => ({ ...actual, [campo]: valor }));
  }

  autoSlug(): void {
    const actual = this.form();
    if (this.editandoId()) return;
    const slug = actual.nombre
      .toLowerCase()
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
    const request = id
      ? this.categoriaService.actualizar(id, datos)
      : this.categoriaService.crear(datos);

    request.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.cargar();
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar la categoría.');
      },
    });
  }

  eliminar(categoria: Categoria): void {
    if (!confirm(`¿Eliminar "${categoria.nombre}"? Esto puede fallar si tiene productos asociados.`)) {
      return;
    }
    this.categoriaService.eliminar(categoria.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo eliminar (¿tiene productos asociados?).'),
    });
  }
}
