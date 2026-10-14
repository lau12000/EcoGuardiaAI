
import { useEffect } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet"

import "leaflet/dist/leaflet.css"

import L from "leaflet"

import iconoMarcador from "leaflet/dist/images/marker-icon.png"
import iconoMarcador2x from "leaflet/dist/images/marker-icon-2x.png"
import sombraMarcador from "leaflet/dist/images/marker-shadow.png"

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconoMarcador2x,
  iconUrl: iconoMarcador,
  shadowUrl: sombraMarcador
})

const CENTRO_MANRIQUE = [6.263, -75.565]

function CentrarMapa({ reportes }) {
  const mapa = useMap()

  useEffect(() => {
    if (reportes.length === 0) {
      mapa.setView(CENTRO_MANRIQUE, 13)
      return
    }

    const posiciones = reportes.map((reporte) => [
      reporte.latitud,
      reporte.longitud
    ])

    if (posiciones.length === 1) {
      mapa.setView(posiciones[0], 15)
    } else {
      mapa.fitBounds(posiciones, { padding: [30, 30], maxZoom: 15 })
    }
  }, [mapa, reportes])

  return null
}

function Mapa({ reportes = [] }) {
  const reportesConUbicacion = reportes.filter(
    (reporte) =>
      Number.isFinite(Number(reporte.latitud)) &&
      Number.isFinite(Number(reporte.longitud)) &&
      reporte.latitud !== null &&
      reporte.longitud !== null &&
      Number(reporte.latitud) >= -90 &&
      Number(reporte.latitud) <= 90 &&
      Number(reporte.longitud) >= -180 &&
      Number(reporte.longitud) <= 180
  )

  const reportesSinUbicacion =
    reportes.length - reportesConUbicacion.length

  return (
    <section className="mapa-ambiental">
      <h2>Mapa de reportes ambientales</h2>

      <p>
        Consulta la ubicación de las situaciones ambientales
        registradas en Manrique y sus alrededores.
      </p>

      <div className="resumen-mapa" aria-live="polite">
        <p>
          <strong>{reportesConUbicacion.length}</strong>{" "}
          reportes con ubicación
        </p>

        <p>
          <strong>{reportesSinUbicacion}</strong>{" "}
          reportes sin ubicación
        </p>
      </div>

      <MapContainer
        center={CENTRO_MANRIQUE}
        zoom={13}
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px"
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CentrarMapa reportes={reportesConUbicacion} />

        {reportesConUbicacion.map((reporte) => (
          <Marker
            key={reporte.id}
            position={[
              Number(reporte.latitud),
              Number(reporte.longitud)
            ]}
          >
            <Popup>
              <div>
                <h3>Reporte ambiental #{reporte.id}</h3>

                <p>
                  <strong>Tipo:</strong> {reporte.tipo}
                </p>

                <p>
                  <strong>Descripción:</strong>{" "}
                  {reporte.descripcion}
                </p>

                <p>
                  <strong>Dirección:</strong> {reporte.direccion}
                </p>

                <p>
                  <strong>Ciudad:</strong> {reporte.ciudad}
                </p>

                <p>
                  <strong>Estado:</strong> {reporte.estado}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {reportesSinUbicacion > 0 && (
        <p className="aviso-mapa">
          Hay {reportesSinUbicacion} reporte(s) que no aparecen
          en el mapa porque no tienen coordenadas válidas.
        </p>
      )}
    </section>
  )
}

export default Mapa
