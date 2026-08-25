import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'login',
        loadComponent: () => import('./features/login/login').then((m) => m.Login),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categoria/categoria-list/categoria-list').then(
            (m) => m.CategoriaList
          ),
      },
      {
        path: 'categorias/:id',
        loadComponent: () =>
          import('./features/categoria/categoria-productos/categoria-productos').then(
            (m) => m.CategoriaProductos
          ),
      },
      {
        path: 'marcas',
        loadComponent: () =>
          import('./features/marcas/marca-list/marca-list').then((m) => m.MarcaList),
      },
      {
        path: 'marcas/:id',
        loadComponent: () =>
          import('./features/marcas/marca-productos/marca-productos').then(
            (m) => m.MarcaProductos
          ),
      },
      {
        path: 'productos/:id',
        loadComponent: () =>
          import('./features/producto-detalle/producto-detalle').then((m) => m.ProductoDetalle),
      },
      {
        path: 'buscar',
        loadComponent: () => import('./features/buscar/buscar').then((m) => m.Buscar),
      },
      {
        path: 'carrito',
        loadComponent: () => import('./features/carrito/carrito').then((m) => m.Carrito),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/productos/productos').then((m) => m.AdminProductos),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/admin/categorias/categorias').then((m) => m.AdminCategorias),
      },
      {
        path: 'marcas',
        loadComponent: () =>
          import('./features/admin/marcas/marcas').then((m) => m.AdminMarcas),
      },
      {
        path: 'comentarios',
        loadComponent: () =>
          import('./features/admin/comentarios/comentarios').then((m) => m.AdminComentarios),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./features/admin/configuracion/configuracion').then(
            (m) => m.AdminConfiguracion
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/admin/usuarios/usuarios').then((m) => m.AdminUsuarios),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
