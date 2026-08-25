export interface Comentario {
  id: number;
  producto_id: number;
  autor: string;
  contenido: string;
  calificacion: number;
  aprobado: boolean;
  created_at: string;
}

export type ComentarioInput = Pick<Comentario, 'autor' | 'contenido' | 'calificacion'>;
