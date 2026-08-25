import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Marca } from '../../../core/models/marca.model';
import { MarcaService } from '../../../core/services/marca.service';
import { resolverImagenUrl } from '../../../core/utils/imagen-url';

@Component({
  selector: 'app-marca-list',
  imports: [RouterLink],
  templateUrl: './marca-list.html',
  styleUrl: './marca-list.scss',
})
export class MarcaList implements OnInit {
  private readonly marcaService = inject(MarcaService);

  protected readonly resolverImagenUrl = resolverImagenUrl;

  readonly marcas = signal<Marca[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.marcaService.listar().subscribe({
      next: (marcas) => {
        this.marcas.set(marcas);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
