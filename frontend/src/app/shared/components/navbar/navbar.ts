import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { Categoria } from '../../../core/models/categoria.model';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoDemoService } from '../../../core/services/carrito-demo.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ConfiguracionService } from '../../../core/services/configuracion.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly categoriaService = inject(CategoriaService);
  protected readonly configuracion = inject(ConfiguracionService);
  protected readonly carritoDemo = inject(CarritoDemoService);
  private readonly router = inject(Router);

  readonly categorias = signal<Categoria[]>([]);
  readonly categoriasAbiertas = signal(false);
  query = '';
  categoriaBusqueda = '';

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({ next: (c) => this.categorias.set(c) });
    this.configuracion.cargar().subscribe();
  }

  toggleCategorias(event: Event): void {
    event.stopPropagation();
    this.categoriasAbiertas.update((abierto) => !abierto);
  }

  cerrarCategorias(): void {
    this.categoriasAbiertas.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.categoriasAbiertas.set(false);
  }

  buscar(): void {
    const termino = this.query.trim();
    if (!termino) {
      return;
    }
    const queryParams: Record<string, string> = { q: termino };
    if (this.categoriaBusqueda) {
      queryParams['categoria'] = this.categoriaBusqueda;
    }
    this.router.navigate(['/buscar'], { queryParams });
  }
}
