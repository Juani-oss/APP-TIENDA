from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.models import Marca
from app.schemas import MarcaCreate, MarcaOut, MarcaUpdate

router = APIRouter(prefix="/api/marcas", tags=["marcas"])


@router.get("", response_model=list[MarcaOut])
def listar_marcas(db: Session = Depends(get_db)):
    return db.query(Marca).order_by(Marca.nombre).all()


@router.get("/{marca_id}", response_model=MarcaOut)
def obtener_marca(marca_id: int, db: Session = Depends(get_db)):
    marca = db.get(Marca, marca_id)
    if not marca:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marca no encontrada")
    return marca


@router.post("", response_model=MarcaOut, status_code=status.HTTP_201_CREATED)
def crear_marca(
    payload: MarcaCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    if db.query(Marca).filter(Marca.slug == payload.slug).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug ya existe")
    marca = Marca(**payload.model_dump())
    db.add(marca)
    db.commit()
    db.refresh(marca)
    return marca


@router.put("/{marca_id}", response_model=MarcaOut)
def actualizar_marca(
    marca_id: int,
    payload: MarcaUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    marca = db.get(Marca, marca_id)
    if not marca:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marca no encontrada")
    for field, value in payload.model_dump().items():
        setattr(marca, field, value)
    db.commit()
    db.refresh(marca)
    return marca


@router.delete("/{marca_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_marca(
    marca_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    marca = db.get(Marca, marca_id)
    if not marca:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marca no encontrada")
    db.delete(marca)
    db.commit()
