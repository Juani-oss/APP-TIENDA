from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.models import Configuracion
from app.schemas import ConfiguracionOut, ConfiguracionUpdate

router = APIRouter(prefix="/api/configuracion", tags=["configuracion"])


def _get_or_crear(db: Session) -> Configuracion:
    config = db.get(Configuracion, 1)
    if not config:
        config = Configuracion(id=1, carrito_habilitado=False)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@router.get("", response_model=ConfiguracionOut)
def obtener_configuracion(db: Session = Depends(get_db)):
    return _get_or_crear(db)


@router.put("", response_model=ConfiguracionOut)
def actualizar_configuracion(
    payload: ConfiguracionUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    config = _get_or_crear(db)
    for field, value in payload.model_dump().items():
        setattr(config, field, value)
    db.commit()
    db.refresh(config)
    return config
