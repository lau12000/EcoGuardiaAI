import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet"

import "leaflet/dist/leaflet.css"

function CentrarMapa({ reportes }) {
  const mapa = useMap()

  if (reportes.length > 0) {
    const ultimoReporte = reportes[reportes.length - 1]

    if (
      ultimoReporte.latitud !== null &&
      ultimoReporte.longitud !== null
    ) {
      mapa.setView(
        [
          ultimoReporte.latitud,
          ultimoReporte.longitud
        ],
        15
      )
    }
  }

  return null
}

function Mapa({ reportes }) {

  const reportesConUbicacion = reportes.filter(
    (reporte) =>
      reporte.latitud !== null &&
      reporte.longitud !== null
  )

  return (
    <div>

      <h2>Mapa de reportes ambientales</h2>

      <p>
        En este mapa puedes consultar la ubicación
        de los reportes registrados.
      </p>

      <MapContainer
        center={[6.263, -75.565]}
        zoom={13}
        style={{
          height: "500px",
          width: "100%"
        }}
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CentrarMapa
          reportes={reportesConUbicacion}
        />

        {reportesConUbicacion.map((reporte) => (

          <Marker
            key={reporte.id}
            position={[
              reporte.latitud,
              reporte.longitud
            ]}
          >

            <Popup>

              <div>

                <h3>
                  📍 Reporte ambiental
                </h3>

                <p>
                  <strong>Tipo:</strong>{" "}
                  {reporte.tipo}
                </p>

                <p>
                  <strong>Descripción:</strong>{" "}
                  {reporte.descripcion}
                </p>

                <p>
                  <strong>Dirección:</strong>{" "}
                  {reporte.direccion}
                </p>

                <p>
                  <strong>Ciudad:</strong>{" "}
                  {reporte.ciudad}
                </p>

                <p>
                  <strong>Estado:</strong>{" "}
                  {reporte.estado}
                </p>

              </div>

            </Popup>

          </Marker>

        ))}

      </MapContainer>

    </div>
  )
}

export default Mapa