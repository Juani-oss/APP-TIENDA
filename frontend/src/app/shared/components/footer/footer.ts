import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Categoria } from '../../../core/models/categoria.model';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ConfiguracionService } from '../../../core/services/configuracion.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  protected readonly configuracion = inject(ConfiguracionService);

  protected readonly anio = new Date().getFullYear();
  readonly categorias = signal<Categoria[]>([]);

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({ next: (c) => this.categorias.set(c.slice(0, 5)) });
  }
}
