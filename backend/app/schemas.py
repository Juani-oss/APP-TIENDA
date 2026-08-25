from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    email: EmailStr
    rol: str


# ---------- Categoria ----------
class CategoriaBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    slug: str = Field(min_length=1, max_length=140)
    descripcion: str | None = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(CategoriaBase):
    pass


class CategoriaOut(CategoriaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# ---------- Marca ----------
class MarcaBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    slug: str = Field(min_length=1, max_length=140)
    logo_url: str | None = None
    descripcion: str | None = None


class MarcaCreate(MarcaBase):
    pass


class MarcaUpdate(MarcaBase):
    pass


class MarcaOut(MarcaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# ---------- Producto ----------
class ProductoImagenInput(BaseModel):
    url: str = Field(min_length=1, max_length=500)
    orden: int = 0


class ProductoImagenOut(ProductoImagenInput):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ProductoCaracteristicaInput(BaseModel):
    clave: str = Field(min_length=1, max_length=120)
    valor: str = Field(min_length=1, max_length=500)
    orden: int = 0


class ProductoCaracteristicaOut(ProductoCaracteristicaInput):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ProductoBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=200)
    descripcion: str | None = None
    precio: float = Field(gt=0)
    stock: int = Field(ge=0, default=0)
    imagen_url: str | None = None
    destacado: bool = False
    activo: bool = True
    es_afiliado: bool = False
    enlace_afiliado: str | None = Field(default=None, max_length=1000)
    categoria_id: int
    marca_id: int


class ProductoCreate(ProductoBase):
    imagenes: list[ProductoImagenInput] = []
    caracteristicas: list[ProductoCaracteristicaInput] = []


class ProductoUpdate(ProductoCreate):
    pass


class ProductoOut(ProductoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    imagenes: list[ProductoImagenOut] = []
    caracteristicas: list[ProductoCaracteristicaOut] = []


class ProductoConRelaciones(ProductoOut):
    categoria: CategoriaOut
    marca: MarcaOut


# ---------- Comentario ----------
class ComentarioBase(BaseModel):
    autor: str = Field(min_length=1, max_length=120)
    contenido: str = Field(min_length=1)
    calificacion: int = Field(ge=1, le=5, default=5)


class ComentarioCreate(ComentarioBase):
    pass


class ComentarioOut(ComentarioBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    producto_id: int
    aprobado: bool
    created_at: datetime


# ---------- Dashboard ----------
class DashboardStats(BaseModel):
    total_productos: int
    total_categorias: int
    total_marcas: int
    productos_sin_stock: int
    comentarios_pendientes: int


# ---------- Configuracion ----------
class ConfiguracionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    carrito_habilitado: bool
    envio_casillero_habilitado: bool
    casillero_nombre: str | None
    casillero_direccion_linea1: str | None
    casillero_direccion_linea2: str | None
    casillero_ciudad: str | None
    casillero_estado: str | None
    casillero_cp: str | None
    casillero_notas: str | None
    instagram_url: str | None
    facebook_url: str | None


class ConfiguracionUpdate(BaseModel):
    carrito_habilitado: bool = False
    envio_casillero_habilitado: bool = False
    casillero_nombre: str | None = Field(default=None, max_length=200)
    casillero_direccion_linea1: str | None = Field(default=None, max_length=300)
    casillero_direccion_linea2: str | None = Field(default=None, max_length=300)
    casillero_ciudad: str | None = Field(default=None, max_length=120)
    casillero_estado: str | None = Field(default=None, max_length=120)
    casillero_cp: str | None = Field(default=None, max_length=30)
    casillero_notas: str | None = None
    instagram_url: str | None = Field(default=None, max_length=500)
    facebook_url: str | None = Field(default=None, max_length=500)
