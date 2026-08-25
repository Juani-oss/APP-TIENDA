from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(160), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(String(20), nullable=False, default="admin")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, nullable=False, index=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    productos: Mapped[list["Producto"]] = relationship(back_populates="categoria")


class Marca(Base):
    __tablename__ = "marcas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, nullable=False, index=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    productos: Mapped[list["Producto"]] = relationship(back_populates="marca")


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    precio: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    imagen_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    destacado: Mapped[bool] = mapped_column(Boolean, default=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    es_afiliado: Mapped[bool] = mapped_column(Boolean, default=False)
    enlace_afiliado: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categorias.id"), nullable=False)
    marca_id: Mapped[int] = mapped_column(ForeignKey("marcas.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    categoria: Mapped["Categoria"] = relationship(back_populates="productos")
    marca: Mapped["Marca"] = relationship(back_populates="productos")
    comentarios: Mapped[list["Comentario"]] = relationship(
        back_populates="producto", cascade="all, delete-orphan"
    )
    imagenes: Mapped[list["ProductoImagen"]] = relationship(
        back_populates="producto",
        cascade="all, delete-orphan",
        order_by="ProductoImagen.orden",
    )
    caracteristicas: Mapped[list["ProductoCaracteristica"]] = relationship(
        back_populates="producto",
        cascade="all, delete-orphan",
        order_by="ProductoCaracteristica.orden",
    )


class ProductoImagen(Base):
    """Fotos adicionales de la galería (imagen_url en Producto sigue siendo la portada)."""

    __tablename__ = "producto_imagenes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    producto_id: Mapped[int] = mapped_column(
        ForeignKey("productos.id", ondelete="CASCADE"), nullable=False
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    producto: Mapped["Producto"] = relationship(back_populates="imagenes")


class ProductoCaracteristica(Base):
    """Ficha técnica: pares clave/valor libres definidos por el admin (ej. 'Material': 'Algodón')."""

    __tablename__ = "producto_caracteristicas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    producto_id: Mapped[int] = mapped_column(
        ForeignKey("productos.id", ondelete="CASCADE"), nullable=False
    )
    clave: Mapped[str] = mapped_column(String(120), nullable=False)
    valor: Mapped[str] = mapped_column(String(500), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    producto: Mapped["Producto"] = relationship(back_populates="caracteristicas")


class Configuracion(Base):
    """Fila única (id=1) con interruptores globales de la tienda, editables desde el admin."""

    __tablename__ = "configuracion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    carrito_habilitado: Mapped[bool] = mapped_column(Boolean, default=False)

    # Casillero en EEUU: el cliente compra en Amazon y envía ahí; RomVal Store
    # cotiza el tramo EEUU→Ecuador aparte (más barato que el envío directo
    # internacional que cobra Amazon). Solo se muestra en la tienda si
    # envio_casillero_habilitado es true.
    envio_casillero_habilitado: Mapped[bool] = mapped_column(Boolean, default=False)
    casillero_nombre: Mapped[str | None] = mapped_column(String(200), nullable=True)
    casillero_direccion_linea1: Mapped[str | None] = mapped_column(String(300), nullable=True)
    casillero_direccion_linea2: Mapped[str | None] = mapped_column(String(300), nullable=True)
    casillero_ciudad: Mapped[str | None] = mapped_column(String(120), nullable=True)
    casillero_estado: Mapped[str | None] = mapped_column(String(120), nullable=True)
    casillero_cp: Mapped[str | None] = mapped_column(String(30), nullable=True)
    casillero_notas: Mapped[str | None] = mapped_column(Text, nullable=True)

    instagram_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    facebook_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Comentario(Base):
    __tablename__ = "comentarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    autor: Mapped[str] = mapped_column(String(120), nullable=False)
    contenido: Mapped[str] = mapped_column(Text, nullable=False)
    calificacion: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    aprobado: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    producto: Mapped["Producto"] = relationship(back_populates="comentarios")
