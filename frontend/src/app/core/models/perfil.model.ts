export interface Perfil {
  id: string;
  nombre: string | null;
  rol: string;
  created_at: string;
}

export interface CrearAdminInput {
  email: string;
  password: string;
  nombre: string;
}
