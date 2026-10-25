
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import iconoMarcador from "leaflet/dist/images/marker-icon.png";
import iconoMarcador2x from "leaflet/dist/images/marker-icon-2x.png";
import sombraMarcador from "leaflet/dist/images/marker-shadow.png";

const API_URL = "https://ecoguardia-api.onrender.com";
const CENTRO_MANRIQUE = [6.263, -75.565];

const iconoAmbiental = L.icon({
  iconUrl: iconoMarcador,
  iconRetinaUrl: iconoMarcador2x,
  shadowUrl: sombraMarcador,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function obtenerPosicion(reporte) {
  if (
    reporte.latitud === null ||
    reporte.latitud === undefined ||
    reporte.latitud === "" ||
    reporte.longitud === null ||
    reporte.longitud === undefined ||
    reporte.longitud === ""
  ) {
    return null;
  }

  const lat = Number(reporte.latitud);
  const lng = Number(reporte.longitud);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return [lat, lng];
}

function CentrarMapa({ reportes }) {
  const mapa = useMap();

  useEffect(() => {
    if (reportes.length === 0) {
      mapa.setView(CENTRO_MANRIQUE, 13);
      return;
    }

    const posiciones = reportes
      .map(obtenerPosicion)
      .filter(Boolean);

    if (posiciones.length === 0) {
      mapa.setView(CENTRO_MANRIQUE, 13);
    } else if (posiciones.length === 1) {
      mapa.setView(posiciones[0], 15);
    } else {
      mapa.fitBounds(posiciones, {
        padding: [30, 30],
        maxZoom: 15,
      });
    }
  }, [mapa, reportes]);

  return null;
}

function obtenerUrlFoto(fotoUrl) {
  if (!fotoUrl) return null;

  if (/^https?:\/\//i.test(fotoUrl)) {
    return fotoUrl;
  }

  return `${API_URL}/${fotoUrl.replace(/^\/+/, "")}`;
}

export default function Mapa({ reportes = [] }) {
  const reportesConUbicacion = reportes.filter(
    (reporte) => obtenerPosicion(reporte) !== null
  );

  const reportesSinUbicacion =
    reportes.length - reportesConUbicacion.length;

  return (
    <section className="mapa-ambiental">
      <h2>Mapa de reportes ambientales</h2>

      <p>
        Consulta las ubicaciones de las situaciones ambientales
        registradas en Manrique y sus alrededores.
      </p>

      <div className="resumen-mapa">
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
        scrollWheelZoom
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CentrarMapa reportes={reportesConUbicacion} />

        {reportesConUbicacion.map((reporte) => {
          const posicion = obtenerPosicion(reporte);
          const fotoUrl = obtenerUrlFoto(reporte.foto_url);

          return (
            <Marker
              key={reporte.id}
              position={posicion}
              icon={iconoAmbiental}
            >
              <Popup>
                <div style={{ maxWidth: "260px" }}>
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

                  {fotoUrl && (
                    <a
                      href={fotoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={fotoUrl}
                        alt={`Evidencia del reporte ${reporte.id}`}
                        loading="lazy"
                        style={{
                          width: "100%",
                          maxHeight: "180px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                        onError={(evento) => {
                          evento.currentTarget.style.display = "none";
                        }}
                      />
                      <span>Ver fotografía completa</span>
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {reportesSinUbicacion > 0 && (
        <p className="aviso-mapa">
          {reportesSinUbicacion} reporte(s) no tienen coordenadas
          válidas y no pueden mostrar un pin.
        </p>
      )}
    </section>
  );
}
