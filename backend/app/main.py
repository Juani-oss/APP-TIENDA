from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import (
    auth,
    categorias,
    comentarios,
    configuracion,
    dashboard,
    marcas,
    productos,
    uploads,
)
from app.uploads import UPLOADS_DIR, UPLOADS_URL_PREFIX

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RomVal Store API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(categorias.router)
app.include_router(marcas.router)
app.include_router(comentarios.router)
app.include_router(dashboard.router)
app.include_router(configuracion.router)
app.include_router(uploads.router)

app.mount(UPLOADS_URL_PREFIX, StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}
