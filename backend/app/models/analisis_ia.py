
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func

from backend.app.database import Base


class AnalisisIADB(Base):
    __tablename__ = "analisis_ia"

    id = Column(Integer, primary_key=True, index=True)

    reporte_id = Column(
        Integer,
        nullable=True,
        index=True
    )

    descripcion = Column(Text, nullable=False)

    categoria_ia = Column(String, nullable=False)

    confianza_modelo = Column(Float, nullable=False)

    fecha_analisis = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    advertencia = Column(Text, nullable=True)
