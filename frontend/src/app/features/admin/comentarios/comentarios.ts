import { Component, OnInit, inject, signal } from '@angular/core';

import { Comentario } from '../../../core/models/comentario.model';
import { ComentarioService } from '../../../core/services/comentario.service';

@Component({
  selector: 'app-admin-comentarios',
  imports: [],
  templateUrl: './comentarios.html',
  styleUrl: './comentarios.scss',
})
export class AdminComentarios implements OnInit {
  private readonly comentarioService = inject(ComentarioService);

  readonly comentarios = signal<Comentario[]>([]);
  readonly filtro = signal<'todos' | 'pendientes' | 'aprobados'>('pendientes');
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cambiarFiltro(filtro: 'todos' | 'pendientes' | 'aprobados'): void {
    this.filtro.set(filtro);
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    const aprobado =
      this.filtro() === 'pendientes' ? false : this.filtro() === 'aprobados' ? true : undefined;

    this.comentarioService.listarTodos(aprobado).subscribe({
      next: (comentarios) => {
        this.comentarios.set(comentarios);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los comentarios.');
        this.cargando.set(false);
      },
    });
  }

  aprobar(comentario: Comentario): void {
    this.comentarioService.aprobar(comentario.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo aprobar el comentario.'),
    });
  }

  eliminar(comentario: Comentario): void {
    if (!confirm('¿Eliminar este comentario?')) {
      return;
    }
    this.comentarioService.eliminar(comentario.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo eliminar el comentario.'),
    });
  }

  estrellas(calificacion: number): string {
    return '★'.repeat(calificacion) + '☆'.repeat(5 - calificacion);
  }
}
