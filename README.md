# RomVal Store

E-commerce full-stack: Angular 21 (frontend) + FastAPI (backend) + PostgreSQL, dockerizado.

## Estructura

```
app_tienda/
├── frontend/          Angular 21 (standalone, signals, @if/@for)
│   └── src/app/
│       ├── core/       models, services, guards, interceptors
│       ├── layout/      public-layout, admin-layout
│       ├── shared/      componentes reutilizables (navbar, footer, product-card)
│       └── features/    home, login, categoria, marcas, producto-detalle, admin/*
├── backend/           FastAPI + SQLAlchemy + JWT
│   └── app/
│       ├── models.py, schemas.py, auth.py, deps.py
│       └── routers/     auth, productos, categorias, marcas, comentarios, dashboard
├── db/
│   └── init.sql        esquema + datos de ejemplo
├── docker-compose.yml
└── README.md
```

## Levantar todo con Docker

```bash
docker compose up -d --build
```

- Frontend: http://localhost:8080
- API: http://localhost:8000 (docs interactivos en http://localhost:8000/docs)
- Postgres: localhost:5432 (tienda_user / tienda_pass / tienda_db)

El frontend, servido por nginx, proxea `/api/*` hacia el contenedor `api`, así que en producción no hace falta CORS entre ambos.

## Usuario admin de prueba

```
email:    admin@tienda.com
password: admin123
```

Entrá por http://localhost:8080/login y accedés al panel en `/admin`.

## Desarrollo local (sin Docker)

**Backend**
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
# necesita un Postgres corriendo; podés usar solo el servicio db:
#   docker compose up -d db
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm start   # http://localhost:4200, apunta a http://localhost:8000/api (ver src/environments/environment.ts)
```

## Modelo de datos

- **Categoria** / **Marca**: catálogos con slug único.
- **Producto**: pertenece a una categoría y una marca; `destacado`/`activo` controlan visibilidad.
- **Comentario**: reseñas de productos, quedan `aprobado=false` hasta que un admin las modera.
- **Usuario**: solo rol `admin` por ahora (login para el panel).

## Estado actual

Validado end-to-end con `docker compose up`: login, CRUD de productos/categorías/marcas, moderación de comentarios y el build de producción de Angular, todo probado contra los tres contenedores corriendo.

### Pendiente / ideas para seguir
- Carga de imágenes (hoy `imagen_url` es un campo de texto libre).
- Registro de usuarios "cliente" (hoy el login es solo para admin).
- Tests automatizados (backend con pytest, frontend con vitest/karma).
- CI y despliegue.
