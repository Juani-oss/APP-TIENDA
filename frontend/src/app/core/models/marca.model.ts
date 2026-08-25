export interface Marca {
  id: number;
  nombre: string;
  slug: string;
  logo_url: string | null;
  descripcion: string | null;
  created_at: string;
}

export type MarcaInput = Omit<Marca, 'id' | 'created_at'>;
