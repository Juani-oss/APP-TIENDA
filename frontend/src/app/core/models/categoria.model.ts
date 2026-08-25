export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  created_at: string;
}

export type CategoriaInput = Omit<Categoria, 'id' | 'created_at'>;
