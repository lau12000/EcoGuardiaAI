
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapaSeleccion.css";

// Icono del marcador compatible con Vite.
const iconoMarcador = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: null,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CENTRO_MEDELLIN = [6.2442, -75.5812];

// Mueve el mapa cuando cambia la ubicación seleccionada.
function AjustarVista({ posicion }) {
  const mapa = useMap();

  useEffect(() => {
    if (posicion) {
      mapa.flyTo(posicion, 16, { duration: 0.7 });
    }
  }, [mapa, posicion]);

  return null;
}

// Permite seleccionar un punto haciendo clic.
function SeleccionPorClic({ alSeleccionar }) {
  useMapEvents({
    click(evento) {
      alSeleccionar(
        evento.latlng.lat,
        evento.latlng.lng
      );
    },
  });

  return null;
}

export default function MapaSeleccion({
  latitud = "",
  longitud = "",
  onSeleccionar,
}) {
  const lat =
    latitud === "" || latitud == null
      ? null
      : Number(latitud);

  const lng =
    longitud === "" || longitud == null
      ? null
      : Number(longitud);

  const coordenadasValidas =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  const [posicion, setPosicion] = useState(
    coordenadasValidas ? [lat, lng] : null
  );

  // Sincroniza el marcador con las coordenadas del formulario.
  useEffect(() => {
    setPosicion(
      coordenadasValidas ? [lat, lng] : null
    );
  }, [latitud, longitud]);

  function seleccionar(nuevaLatitud, nuevaLongitud) {
    const nuevaLat = Number(nuevaLatitud);
    const nuevaLng = Number(nuevaLongitud);

    if (
      !Number.isFinite(nuevaLat) ||
      !Number.isFinite(nuevaLng) ||
      nuevaLat < -90 ||
      nuevaLat > 90 ||
      nuevaLng < -180 ||
      nuevaLng > 180
    ) {
      return;
    }

    setPosicion([nuevaLat, nuevaLng]);

    if (typeof onSeleccionar === "function") {
      onSeleccionar(nuevaLat, nuevaLng);
    }
  }

  const centro = posicion || CENTRO_MEDELLIN;

  return (
    <section className="selector-mapa">
      <div className="selector-mapa-encabezado">
        <h3>📍 Selecciona la ubicación del reporte</h3>

        <p>
          Haz clic en el mapa o arrastra el marcador
          hasta el lugar correcto. Puedes acercar el
          mapa para ubicar mejor el punto.
        </p>
      </div>

      <MapContainer
        center={centro}
        zoom={posicion ? 16 : 12}
        scrollWheelZoom={true}
        className="mapa-seleccion"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AjustarVista posicion={posicion} />

        <SeleccionPorClic
          alSeleccionar={seleccionar}
        />

        {posicion && (
          <Marker
            position={posicion}
            icon={iconoMarcador}
            draggable={true}
            eventHandlers={{
              dragend(evento) {
                const punto =
                  evento.target.getLatLng();

                seleccionar(punto.lat, punto.lng);
              },
            }}
          />
        )}
      </MapContainer>

      <div className="selector-mapa-pie">
        {posicion ? (
          <>
            <p className="selector-mapa-coordenadas">
              <strong>Latitud:</strong>{" "}
              {posicion[0].toFixed(6)}
              {" · "}
              <strong>Longitud:</strong>{" "}
              {posicion[1].toFixed(6)}
            </p>

            <p className="selector-mapa-ayuda">
              Verifica que el marcador esté sobre el
              lugar del reporte antes de registrarlo.
            </p>

            <button
              type="button"
              className="selector-mapa-limpiar"
              onClick={() => {
                setPosicion(null);

                if (
                  typeof onSeleccionar === "function"
                ) {
                  onSeleccionar("", "");
                }
              }}
            >
              Quitar ubicación seleccionada
            </button>
          </>
        ) : (
          <p className="selector-mapa-ayuda">
            Aún no has seleccionado un punto. Haz clic
            en el mapa para elegirlo.
          </p>
        )}
      </div>
    </section>
  );
}
