import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Categoria } from '../../../core/models/categoria.model';
import { CategoriaService } from '../../../core/services/categoria.service';

@Component({
  selector: 'app-categoria-list',
  imports: [RouterLink],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.scss',
})
export class CategoriaList implements OnInit {
  private readonly categoriaService = inject(CategoriaService);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
