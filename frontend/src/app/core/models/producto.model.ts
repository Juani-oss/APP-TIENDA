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

export interface ProductoColor {
  id: number;
  nombre: string;
  color_hex: string | null;
  imagen_url: string | null;
  stock: number;
  orden: number;
}

export interface ProductoColorInput {
  nombre: string;
  color_hex: string | null;
  imagen_url: string | null;
  stock: number;
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
  colores: ProductoColor[];
}

export type ProductoInput = Omit<
  Producto,
  'id' | 'created_at' | 'categoria' | 'marca' | 'imagenes' | 'caracteristicas' | 'colores'
> & {
  imagenes: ProductoImagenInput[];
  caracteristicas: ProductoCaracteristicaInput[];
  colores: ProductoColorInput[];
};

export interface ProductoFiltros {
  categoria_id?: number;
  marca_id?: number;
  destacado?: boolean;
  activo?: boolean;
  search?: string;
}
