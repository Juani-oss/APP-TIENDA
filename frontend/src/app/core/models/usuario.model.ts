export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'cliente';
}

export interface LoginRequest {
  email: string;
  password: string;
}
