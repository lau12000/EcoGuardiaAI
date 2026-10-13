import { useState } from "react";
import ExcelJS from "exceljs";

function Admin({
  reportes = [],
  actualizarEstado,
  eliminarReporte,
  cerrarSesion
}) {
  const [resultadosIA, setResultadosIA] = useState({});
  const [cargandoIA, setCargandoIA] = useState({});
  const [erroresIA, setErroresIA] = useState({});


  async function exportarBaseDatosExcel() {
    try {
      const libro = new ExcelJS.Workbook();

      libro.creator = "EcoGuardianAI";
      libro.subject = "Base de datos de gestión ambiental";
      libro.title = "Reporte integral EcoGuardianAI";
      libro.created = new Date();

      const fecha = new Date().toLocaleDateString("es-CO");

      // Consultar el historial completo de análisis de IA.
      const respuestaIA = await fetch(
        "https://ecoguardia-api.onrender.com/ia/historial"
      );

      if (!respuestaIA.ok) {
        throw new Error("No se pudo consultar el historial de IA.");
      }

      const datosIA = await respuestaIA.json();
      const historialIA = Array.isArray(datosIA.analisis)
        ? datosIA.analisis
        : [];

      // Hoja 1: reportes ambientales.
      const hojaReportes = libro.addWorksheet("Reportes ambientales");

      hojaReportes.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Tipo", key: "tipo", width: 22 },
        { header: "Descripción", key: "descripcion", width: 48 },
        { header: "Estado", key: "estado", width: 18 },
        { header: "Dirección", key: "direccion", width: 30 },
        { header: "Ciudad", key: "ciudad", width: 20 },
        { header: "Latitud", key: "latitud", width: 15 },
        { header: "Longitud", key: "longitud", width: 15 },
        { header: "Nombre contacto", key: "contacto_nombre", width: 25 },
        { header: "Teléfono", key: "contacto_telefono", width: 18 },
        { header: "Correo", key: "contacto_correo", width: 30 },
        { header: "Fotografía", key: "foto_url", width: 35 },
      ];

      reportes.forEach((reporte) => {
        hojaReportes.addRow({
          id: reporte.id,
          tipo: reporte.tipo || "",
          descripcion: reporte.descripcion || "",
          estado: reporte.estado || "Pendiente",
          direccion: reporte.direccion || "",
          ciudad: reporte.ciudad || "",
          latitud: reporte.latitud ?? "",
          longitud: reporte.longitud ?? "",
          contacto_nombre: reporte.contacto_nombre || "",
          contacto_telefono: reporte.contacto_telefono || "",
          contacto_correo: reporte.contacto_correo || "",
          foto_url: reporte.foto_url || "",
        });
      });

      // Hoja 2: historial de inteligencia artificial.
      const hojaIA = libro.addWorksheet("Historial de IA");

      hojaIA.columns = [
        { header: "ID análisis", key: "id_analisis", width: 15 },
        { header: "ID reporte", key: "reporte_id", width: 15 },
        { header: "Categoría IA", key: "categoria_ia", width: 24 },
        { header: "Confianza del modelo", key: "confianza_modelo", width: 23 },
        { header: "Fecha de análisis", key: "fecha_analisis", width: 25 },
      ];

      historialIA.forEach((analisis) => {
        hojaIA.addRow({
          id_analisis: analisis.id_analisis ?? analisis.id ?? "",
          reporte_id: analisis.reporte_id ?? "",
          categoria_ia: analisis.categoria_ia || "",
          confianza_modelo:
            typeof analisis.confianza_modelo === "number"
              ? analisis.confianza_modelo
              : "",
          fecha_analisis: analisis.fecha_analisis || "",
        });
      });

      hojaIA.getColumn("confianza_modelo").numFmt = "0.00%";

      // Estilo profesional para los encabezados.
      [hojaReportes, hojaIA].forEach((hoja) => {
        hoja.views = [{ state: "frozen", ySplit: 1 }];
        hoja.autoFilter = {
          from: { row: 1, column: 1 },
          to: {
            row: 1,
            column: hoja.columnCount,
          },
        };

        const encabezado = hoja.getRow(1);
        encabezado.height = 32;

        encabezado.eachCell((celda) => {
          celda.font = {
            bold: true,
            color: { argb: "FFFFFFFF" },
            size: 11,
          };
          celda.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF176B52" },
          };
          celda.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };
          celda.border = {
            bottom: {
              style: "medium",
              color: { argb: "FF0E4D3B" },
            },
          };
        });

        hoja.eachRow((fila, numero) => {
          if (numero > 1) {
            fila.alignment = {
              vertical: "top",
              wrapText: true,
            };

            if (numero % 2 === 0) {
              fila.eachCell((celda) => {
                celda.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFF0F7F4" },
                };
              });
            }
          }
        });
      });

      // Hoja 3: resumen ejecutivo.
      const resumen = libro.addWorksheet("Resumen ejecutivo");

      resumen.columns = [
        { header: "Indicador", key: "indicador", width: 38 },
        { header: "Resultado", key: "resultado", width: 28 },
      ];

      resumen.addRows([
        { indicador: "Proyecto", resultado: "EcoGuardianAI" },
        { indicador: "Fecha de generación", resultado: fecha },
        { indicador: "Total de reportes registrados", resultado: reportes.length },
        {
          indicador: "Reportes pendientes",
          resultado: reportes.filter(
            (reporte) => (reporte.estado || "Pendiente") === "Pendiente"
          ).length,
        },
        {
          indicador: "Reportes en revisión",
          resultado: reportes.filter(
            (reporte) => reporte.estado === "En revisión"
          ).length,
        },
        {
          indicador: "Reportes atendidos",
          resultado: reportes.filter(
            (reporte) => reporte.estado === "Atendido"
          ).length,
        },
        { indicador: "Total de análisis de IA registrados", resultado: historialIA.length },
        {
          indicador: "Nota metodológica",
          resultado:
            "La clasificación de IA es experimental y requiere validación humana.",
        },
      ]);

      resumen.views = [{ state: "frozen", ySplit: 1 }];

      resumen.getRow(1).height = 32;
      resumen.getRow(1).eachCell((celda) => {
        celda.font = {
          bold: true,
          color: { argb: "FFFFFFFF" },
          size: 12,
        };
        celda.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF176B52" },
        };
        celda.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
      });

      resumen.eachRow((fila, numero) => {
        fila.alignment = { vertical: "top", wrapText: true };
        if (numero > 1 && numero % 2 === 0) {
          fila.eachCell((celda) => {
            celda.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF0F7F4" },
            };
          });
        }
      });

      // Descargar el archivo en el equipo.
      const archivo = await libro.xlsx.writeBuffer();
      const blob = new Blob([archivo], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `EcoGuardianAI_Reporte_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert(
        error.message ||
        "No fue posible generar el Excel. Verifica que el servidor esté activo."
      );
    }
  }

  // Clasifica el riesgo de manera preliminar según el tipo y la descripción.
  function clasificarRiesgo(reporte) {
    const texto = `${reporte.tipo || ""} ${reporte.descripcion || ""}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const palabrasRiesgoAlto = [
      "inundacion",
      "deslizamiento",
      "derrumbe",
      "incendio",
      "derrame toxico",
      "contaminacion peligrosa"
    ];

    const palabrasRiesgoMedio = [
      "residuos",
      "basura",
      "contaminacion",
      "tala",
      "alcantarilla",
      "aguas residuales"
    ];

    if (
      palabrasRiesgoAlto.some((palabra) =>
        texto.includes(palabra)
      )
    ) {
      return {
        nivel: "Alto",
        clase: "riesgo-alto",
        icono: "🔴",
        prioridad: 3
      };
    }

    if (
      palabrasRiesgoMedio.some((palabra) =>
        texto.includes(palabra)
      )
    ) {
      return {
        nivel: "Medio",
        clase: "riesgo-medio",
        icono: "🟠",
        prioridad: 2
      };
    }

    return {
      nivel: "Bajo",
      clase: "riesgo-bajo",
      icono: "🟢",
      prioridad: 1
    };
  }

  async function analizarReporteIA(reporte) {
    setCargandoIA((anterior) => ({
      ...anterior,
      [reporte.id]: true,
    }));

    setErroresIA((anterior) => ({
      ...anterior,
      [reporte.id]: "",
    }));

    setResultadosIA((anterior) => {
      const nuevos = { ...anterior };
      delete nuevos[reporte.id];
      return nuevos;
    });

    try {
      const respuesta = await fetch(
        "https://ecoguardia-api.onrender.com/ia/clasificar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            descripcion: reporte.descripcion || "",
            reporte_id: reporte.id,
          }),

        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          typeof datos.detail === "string"
            ? datos.detail
            : "No fue posible analizar el reporte."
        );
      }

      setResultadosIA((anterior) => ({
        ...anterior,
        [reporte.id]: datos,
      }));
    } catch (error) {
      setErroresIA((anterior) => ({
        ...anterior,
        [reporte.id]:
          error.message || "Error al conectar con la IA.",
      }));
    } finally {
      setCargandoIA((anterior) => ({
        ...anterior,
        [reporte.id]: false,
      }));
    }
  }

  return (
    <section className="administracion-section">

      <div className="administracion-encabezado">

        <div>
          <span className="etiqueta-seccion">
            GESTIÓN ADMINISTRATIVA
          </span>

          <h2>
            Seguimiento de reportes
          </h2>

          <p>
            Espacio destinado a la gestión y seguimiento
            de las situaciones ambientales reportadas
            por la comunidad.
          </p>
        </div>

        <div className="administracion-indicador">
          <strong>
            {reportes.filter(
              (reporte) => reporte.estado !== "Atendido"
            ).length}
          </strong>

          <span>
            casos en seguimiento
          </span>
        </div>

        <button
          type="button"
          className="boton-cerrar-sesion"
          onClick={cerrarSesion}
        >
          🚪 Cerrar sesión
        </button>

                <button
          type="button"
          onClick={exportarBaseDatosExcel}
        >
          📊 Exportar base de datos a Excel
        </button>

      </div>

      {reportes.length === 0 ? (

        <div className="administracion-vacia">

          <div className="administracion-vacia-icono">
            📋
          </div>

          <h3>
            No hay reportes para gestionar
          </h3>

          <p>
            Los reportes realizados por la comunidad
            aparecerán aquí para su seguimiento.
          </p>

        </div>

      ) : (

        <div className="administracion-lista">

          {reportes.map((reporte) => (

            <article
              key={reporte.id}
              className="administracion-card"
            >

              <div className="administracion-card-superior">

                <div>
                  <span className="reporte-numero">
                    REPORTE #{reporte.id}
                  </span>

                  <h3>
                    {reporte.tipo}
                  </h3>
                </div>

                <span
                  className="riesgo-badge"
                  title="Clasificación preliminar automática; requiere validación humana"
                >
                  {clasificarRiesgo(reporte).icono} Riesgo{" "}
                  {clasificarRiesgo(reporte).nivel}
                </span>

                <span
                  className={`estado-badge ${reporte.estado === "Pendiente"
                    ? "estado-pendiente"
                    : reporte.estado === "En revisión"
                      ? "estado-revision"
                      : "estado-atendido"
                    }`}
                >
                  {reporte.estado === "Pendiente" && "🟡"}
                  {reporte.estado === "En revisión" && "🔵"}
                  {reporte.estado === "Atendido" && "🟢"}
                  {" "}
                  {reporte.estado}

                </span>

              </div>

              <div className="administracion-ia">
                <h4>🤖 Análisis con inteligencia artificial</h4>

                <button
                  type="button"
                  onClick={() => analizarReporteIA(reporte)}
                  disabled={
                    cargandoIA[reporte.id] ||
                    !(reporte.descripcion || "").trim()
                  }
                >
                  {cargandoIA[reporte.id]
                    ? "Analizando..."
                    : "Analizar reporte con IA"}
                </button>

                {erroresIA[reporte.id] && (
                  <p role="alert">{erroresIA[reporte.id]}</p>
                )}

                {resultadosIA[reporte.id] && (
                  <div aria-live="polite">
                    <p>
                      <strong>Categoría sugerida:</strong>{" "}
                      {resultadosIA[reporte.id].categoria_ia}
                    </p>

                    <p>
                      <strong>Confianza del modelo:</strong>{" "}
                      {(
                        resultadosIA[reporte.id].confianza_modelo * 100
                      ).toFixed(1)}%
                    </p>

                    <p>
                      {resultadosIA[reporte.id].advertencia}
                    </p>

                    <small>
                      Resultado experimental. No determina por sí solo
                      la gravedad ni la prioridad real del riesgo.
                    </small>
                  </div>
                )}
              </div>


              <div className="administracion-descripcion">

                <span>
                  Situación reportada
                </span>

                <p>
                  {reporte.descripcion}
                </p>

              </div>

              {reporte.foto_url && (
                <div className="reporte-foto-evidencia">
                  <span>Fotografía de evidencia</span>
                  <a
                    href={`https://ecoguardia-api.onrender.com${reporte.foto_url}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Ver fotografía completa"
                  >
                    <img
                      src={`https://ecoguardia-api.onrender.com${reporte.foto_url}`}
                      alt={`Evidencia del reporte ${reporte.id}`}
                      loading="lazy"
                    />
                  </a>
                </div>
              )}

              <div className="administracion-datos">

                <div>
                  <span>
                    📍 Ubicación
                  </span>

                  <strong>
                    {reporte.direccion || "Sin dirección"}
                  </strong>
                </div>

                <div>
                  <span>
                    🏙️ Ciudad
                  </span>

                  <strong>
                    {reporte.ciudad || "Sin ciudad"}
                  </strong>
                </div>

                <div>
                  <span>
                    🌐 Coordenadas
                  </span>

                  <strong>
                    {reporte.latitud != null &&
                      reporte.longitud != null
                      ? `${reporte.latitud}, ${reporte.longitud}`
                      : "Sin ubicación"}
                  </strong>
                </div>

              </div>


              <div className="administracion-contacto">
                <h4>📞 Datos de contacto</h4>

                {reporte.contacto_nombre ||
                  reporte.contacto_telefono ||
                  reporte.contacto_correo ? (
                  <div className="contacto-grid">
                    <div>
                      <span>Nombre completo</span>
                      <strong>
                        {reporte.contacto_nombre || "No registrado"}
                      </strong>
                    </div>

                    <div>
                      <span>Teléfono</span>
                      {reporte.contacto_telefono ? (
                        <a href={`tel:${reporte.contacto_telefono}`}>
                          {reporte.contacto_telefono}
                        </a>
                      ) : (
                        <strong>No registrado</strong>
                      )}
                    </div>

                    <div>
                      <span>Correo electrónico</span>
                      {reporte.contacto_correo ? (
                        <a href={`mailto:${reporte.contacto_correo}`}>
                          {reporte.contacto_correo}
                        </a>
                      ) : (
                        <strong>No registrado</strong>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="contacto-sin-datos">
                    Este reporte no tiene datos de contacto registrados.
                  </p>
                )}
              </div>


              <div className="administracion-acciones">

                <div>
                  <label>
                    Actualizar estado
                  </label>

                  <p>
                    Selecciona el estado actual del proceso
                    de atención del reporte.
                  </p>
                </div>

                <select
                  value={reporte.estado || "Pendiente"}
                  onChange={(evento) =>
                    actualizarEstado(
                      reporte.id,
                      evento.target.value
                    )
                  }
                >
                  <option value="Pendiente">
                    🟡 Pendiente
                  </option>

                  <option value="En revisión">
                    🔵 En revisión
                  </option>

                  <option value="Atendido">
                    🟢 Atendido
                  </option>
                </select>

              </div>

              {/* BOTÓN PARA ELIMINAR EL REPORTE */}
              <div className="administracion-acciones">

                <button
                  type="button"
                  className="boton-eliminar-reporte"
                  onClick={() => eliminarReporte(reporte.id)}
                >
                  🗑️ Eliminar reporte
                </button>

              </div>

            </article>

          ))}

        </div>

      )}

    </section>
  )
}

export default Admin
