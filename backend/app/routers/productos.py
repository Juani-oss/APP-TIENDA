from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from app.database import get_db
from app.deps import require_admin
from app.models import Producto, ProductoCaracteristica, ProductoImagen
from app.schemas import ProductoConRelaciones, ProductoCreate, ProductoOut, ProductoUpdate

router = APIRouter(prefix="/api/productos", tags=["productos"])


def _con_relaciones(query):
    return query.options(
        joinedload(Producto.categoria),
        joinedload(Producto.marca),
        selectinload(Producto.imagenes),
        selectinload(Producto.caracteristicas),
    )


def _reemplazar_listas(db: Session, producto: Producto, payload: ProductoCreate) -> None:
    """Reemplaza imágenes y características por el set actual enviado desde el admin."""
    producto.imagenes = [
        ProductoImagen(url=img.url, orden=img.orden) for img in payload.imagenes
    ]
    producto.caracteristicas = [
        ProductoCaracteristica(clave=c.clave, valor=c.valor, orden=c.orden)
        for c in payload.caracteristicas
    ]


@router.get("", response_model=list[ProductoConRelaciones])
def listar_productos(
    categoria_id: int | None = None,
    marca_id: int | None = None,
    destacado: bool | None = None,
    activo: bool | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = _con_relaciones(db.query(Producto))
    if categoria_id is not None:
        query = query.filter(Producto.categoria_id == categoria_id)
    if marca_id is not None:
        query = query.filter(Producto.marca_id == marca_id)
    if destacado is not None:
        query = query.filter(Producto.destacado == destacado)
    if activo is not None:
        query = query.filter(Producto.activo == activo)
    if search:
        query = query.filter(Producto.nombre.ilike(f"%{search}%"))
    return query.order_by(Producto.created_at.desc()).all()


@router.get("/{producto_id}", response_model=ProductoConRelaciones)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = _con_relaciones(db.query(Producto)).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto


@router.post("", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
def crear_producto(
    payload: ProductoCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    datos = payload.model_dump(exclude={"imagenes", "caracteristicas"})
    producto = Producto(**datos)
    _reemplazar_listas(db, producto, payload)
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


@router.put("/{producto_id}", response_model=ProductoOut)
def actualizar_producto(
    producto_id: int,
    payload: ProductoUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    datos = payload.model_dump(exclude={"imagenes", "caracteristicas"})
    for field, value in datos.items():
        setattr(producto, field, value)
    _reemplazar_listas(db, producto, payload)
    db.commit()
    db.refresh(producto)
    return producto


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
