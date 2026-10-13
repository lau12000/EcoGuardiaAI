from sqlalchemy import Column, Integer, String, Text, Float

from backend.app.database import Base


class ReporteDB(Base):
    __tablename__ = "reportes"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(Integer, nullable=True)

    tipo = Column(String, nullable=False)
    descripcion = Column(Text, nullable=False)
    ciudad = Column(String, nullable=False)
    direccion = Column(String, nullable=False)
    latitud = Column(Float, nullable=True)
    longitud = Column(Float, nullable=True)
    estado = Column(String, default="Pendiente", nullable=False)
    contacto_nombre = Column(String, nullable=True)
    contacto_telefono = Column(String, nullable=True)
    contacto_correo = Column(String, nullable=True)
    foto_url = Column(String, nullable=True)