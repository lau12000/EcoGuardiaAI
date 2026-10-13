
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.app.database import get_db
from backend.app.models.analisis_ia import AnalisisIADB
from backend.app.models.reporte import ReporteDB
from modeloIA.predecir import clasificar_reporte

router = APIRouter(
    prefix="/ia",
    tags=["Inteligencia Artificial"]
)


class SolicitudClasificacion(BaseModel):
    descripcion: str = Field(
        ...,
        min_length=5,
        max_length=5000,
        description="Descripción del reporte ambiental"
    )

    reporte_id: int | None = Field(
        default=None,
        gt=0,
        description="ID del reporte existente, si corresponde"
    )


@router.post("/clasificar")
def clasificar_reporte_api(
    solicitud: SolicitudClasificacion,
    db: Session = Depends(get_db)
):
    """Clasifica una descripción y guarda el resultado en SQLite."""

    if solicitud.reporte_id is not None:
        reporte = db.query(ReporteDB).filter(
            ReporteDB.id == solicitud.reporte_id
        ).first()

        if reporte is None:
            raise HTTPException(
                status_code=404,
                detail="No existe el reporte indicado."
            )

    try:
        resultado = clasificar_reporte(solicitud.descripcion)

        categoria = str(resultado["categoria_ia"])
        confianza = float(resultado["confianza_modelo"])
        advertencia = resultado["advertencia"]

        analisis = AnalisisIADB(
            reporte_id=solicitud.reporte_id,
            descripcion=solicitud.descripcion.strip(),
            categoria_ia=categoria,
            confianza_modelo=confianza,
            advertencia=advertencia
        )

        db.add(analisis)
        db.commit()
        db.refresh(analisis)

        return {
            "id_analisis": analisis.id,
            "reporte_id": analisis.reporte_id,
            "categoria_ia": categoria,
            "confianza_modelo": confianza,
            "fecha_analisis": analisis.fecha_analisis,
            "advertencia": advertencia
        }

    except FileNotFoundError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="No se encontró el modelo ambiental entrenado."
        )

    except (SQLAlchemyError, KeyError, TypeError, ValueError) as error:
        db.rollback()
        print(f"Error al guardar o ejecutar el análisis IA: {error}")
        raise HTTPException(
            status_code=500,
            detail="No fue posible completar y guardar el análisis."
        )

@router.get("/historial")
def obtener_historial_ia(
    db: Session = Depends(get_db)
):
    """Consulta el historial de análisis de inteligencia artificial."""

    try:
        analisis = (
            db.query(AnalisisIADB)
            .order_by(AnalisisIADB.id.desc())
            .all()
        )

        return {
            "total": len(analisis),
            "analisis": [
                {
                    "id_analisis": item.id,
                    "reporte_id": item.reporte_id,
                    "categoria_ia": item.categoria_ia,
                    "confianza_modelo": item.confianza_modelo,
                    "fecha_analisis": item.fecha_analisis,
                    "advertencia": item.advertencia,
                }
                for item in analisis
            ],
        }

    except SQLAlchemyError as error:
        print(f"Error al consultar el historial de IA: {error}")
        raise HTTPException(
            status_code=500,
            detail="No fue posible consultar el historial de IA."
        )
