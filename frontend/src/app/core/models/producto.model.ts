import { Categoria } from './categoria.model';
import { Marca } from './marca.model';

export interface ProductoImagen {
  id: number;
  url: string;
  orden: number;
}

export interface ProductoImagenInput {
  url: string;
  orden: number;
}

export interface ProductoCaracteristica {
  id: number;
  clave: string;
  valor: string;
  orden: number;
}

export interface ProductoCaracteristicaInput {
  clave: string;
  valor: string;
  orden: number;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  precio_original: number | null;
  stock: number;
  imagen_url: string | null;
  destacado: boolean;
  activo: boolean;
  es_afiliado: boolean;
  enlace_afiliado: string | null;
  categoria_id: number;
  marca_id: number;
  created_at: string;
  categoria: Categoria;
  marca: Marca;
  imagenes: ProductoImagen[];
  caracteristicas: ProductoCaracteristica[];
}

export type ProductoInput = Omit<
  Producto,
  'id' | 'created_at' | 'categoria' | 'marca' | 'imagenes' | 'caracteristicas'
> & {
  imagenes: ProductoImagenInput[];
  caracteristicas: ProductoCaracteristicaInput[];
};

export interface ProductoFiltros {
  categoria_id?: number;
  marca_id?: number;
  destacado?: boolean;
  activo?: boolean;
  search?: string;
}
