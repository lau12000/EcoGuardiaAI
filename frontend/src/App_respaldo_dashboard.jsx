import { useEffect, useState } from "react"
import Mapa from "./Mapa"
import "./App.css"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import Admin from "./Admin"
import MapaSeleccion from "./MapaSeleccion";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts"

function App() {

  const [reportes, setReportes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState("")
  const [error, setError] = useState("")
  const [historialIA, setHistorialIA] = useState([])
  const [errorHistorialIA, setErrorHistorialIA] = useState("")

  const [modoAdmin, setModoAdmin] = useState(
    sessionStorage.getItem("ecoAdminAutorizado") === "true"
  )
  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [transicionAdmin, setTransicionAdmin] = useState(null)

  const [usuarioAdmin, setUsuarioAdmin] = useState("")
  const [claveAdmin, setClaveAdmin] = useState("")
  const [errorLogin, setErrorLogin] = useState("")
  const navegar = useNavigate()

  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const [resultadosDireccion, setResultadosDireccion] = useState([]);
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);

  const [contacto, setContacto] = useState({
    nombre: "",
    telefono: "",
    correo: "",
  });



  const [formulario, setFormulario] = useState({
    usuario_id: 1,
    tipo: "",
    descripcion: "",
    ciudad: "",
    direccion: "",
    latitud: "",
    longitud: ""
  })
  const [foto, setFoto] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState("")
  const [clasificacionIA, setClasificacionIA] = useState(null)
  const [clasificandoIA, setClasificandoIA] = useState(false)
  const [errorIA, setErrorIA] = useState("")


  const datosPorTipo = [
    {
      tipo: "Residuos",
      cantidad: reportes.filter(
        (reporte) => reporte.tipo === "Acumulación de residuos"
      ).length
    },
    {
      tipo: "Inundación",
      cantidad: reportes.filter(
        (reporte) => reporte.tipo === "Inundación"
      ).length
    },
    {
      tipo: "Deslizamiento",
      cantidad: reportes.filter(
        (reporte) => reporte.tipo === "Deslizamiento"
      ).length
    },
    {
      tipo: "Contaminación",
      cantidad: reportes.filter(
        (reporte) => reporte.tipo === "Contaminación"
      ).length
    },
    {
      tipo: "Otro",
      cantidad: reportes.filter(
        (reporte) => reporte.tipo === "Otro"
      ).length
    }
  ]

  const datosPorEstado = [
    {
      estado: "Pendiente",
      cantidad: reportes.filter(
        (reporte) => reporte.estado === "Pendiente"
      ).length
    },
    {
      estado: "En revisión",
      cantidad: reportes.filter(
        (reporte) => reporte.estado === "En revisión"
      ).length
    },
    {
      estado: "Atendido",
      cantidad: reportes.filter(
        (reporte) => reporte.estado === "Atendido"
      ).length
    }
  ]

  const porcentajeAtendidos =
    reportes.length > 0
      ? Math.round(
        (reportes.filter(
          (reporte) => reporte.estado === "Atendido"
        ).length / reportes.length) * 100
      )
      : 0

  useEffect(() => {
    obtenerReportes()
    obtenerHistorialIA()
  }, [])

  async function obtenerReportes() {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/reportes/"
      )

      if (!respuesta.ok) {
        throw new Error("Error al consultar reportes")
      }

      const datos = await respuesta.json()

      setReportes(datos.reportes)

    } catch (error) {
      setError("No se pudieron cargar los reportes")
      console.error(error)

    } finally {
      setCargando(false)
    }
  }


  async function obtenerHistorialIA() {
    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/ia/historial"
      )

      if (!respuesta.ok) {
        throw new Error("No se pudo consultar el historial de IA.")
      }

      const datos = await respuesta.json()

      setHistorialIA(
        Array.isArray(datos.analisis) ? datos.analisis : []
      )
      setErrorHistorialIA("")
    } catch (error) {
      setErrorHistorialIA(error.message)
      console.error("Error al consultar historial IA:", error)
    }
  }


  async function actualizarEstado(reporteId, nuevoEstado) {
    setMensaje("")
    setError("")

    try {
      const parametros = new URLSearchParams()

      parametros.append("estado", nuevoEstado)

      const respuesta = await fetch(
        `http://127.0.0.1:8000/reportes/${reporteId}/estado?${parametros.toString()}`,
        {
          method: "PUT"
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo actualizar el estado"
        )
      }

      setMensaje("Estado actualizado correctamente.")

      await obtenerReportes()

    } catch (error) {
      setError("No se pudo actualizar el estado.")
      console.error(error)
    }

  }
  async function eliminarReporte(reporteId) {
    const confirmado = window.confirm(
      `¿Estás segura de que deseas eliminar el reporte #${reporteId}? Esta acción no se puede deshacer.`
    )

    if (!confirmado) return

    setMensaje("")
    setError("")

    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/reportes/${reporteId}`,
        { method: "DELETE" }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.detail || "No se pudo eliminar el reporte.")
      }

      setMensaje(`Reporte #${reporteId} eliminado correctamente.`)

      // Recarga los reportes para actualizar el panel, los contadores y el mapa.
      await obtenerReportes()
    } catch (error) {
      setError(error.message || "Ocurrió un error al eliminar el reporte.")
      console.error(error)
    }
  }
  function obtenerUbicacion() {
    setMensaje("")
    setError("")

    if (!navigator.geolocation) {
      setError(
        "El navegador no permite obtener la ubicación automáticamente."
      )
      return
    }

    setMensaje("Obteniendo ubicación...")

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const latitud = posicion.coords.latitude
        const longitud = posicion.coords.longitude

        setFormulario({
          ...formulario,
          latitud: latitud.toFixed(6),
          longitud: longitud.toFixed(6)
        })

        setMensaje("Ubicación obtenida correctamente.")
      },
      () => {
        setMensaje("")
        setError(
          "No fue posible obtener la ubicación. Verifica que hayas permitido el acceso a tu ubicación."
        )
      }
    )
  }



  async function buscarDireccion() {
    const direccion = formulario.direccion.trim();
    const ciudad = (formulario.ciudad || "Medellín").trim();

    setMensaje("");
    setError("");
    setResultadosDireccion([]);
    setUbicacionConfirmada(false);

    // Limpiar coordenadas anteriores para evitar usar otra ubicación.
    setFormulario((anterior) => ({
      ...anterior,
      latitud: "",
      longitud: ""
    }));

    if (direccion.length < 5) {
      setError("Escribe una dirección más completa antes de buscar.");
      return;
    }

    setBuscandoDireccion(true);

    try {
      const parametros = new URLSearchParams({
        direccion,
        ciudad
      });

      const respuesta = await fetch(
        `http://127.0.0.1:8000/geocodificar/?${parametros.toString()}`
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No fue posible buscar la dirección."
        );
      }

      if (!datos.encontrado || !datos.resultados?.length) {
        setError(
          datos.mensaje ||
          "No encontramos esa dirección. Intenta con una referencia más precisa."
        );
        return;
      }

      setResultadosDireccion(datos.resultados);
      setMensaje(datos.mensaje);
    } catch (error) {
      setError(error.message || "Error al consultar la dirección.");
    } finally {
      setBuscandoDireccion(false);
    }
  }

  function iniciarSesionAdmin(evento) {
    evento.preventDefault()

    setErrorLogin("")

    if (
      usuarioAdmin === "admin" &&
      claveAdmin === "ecoguardian2026"
    ) {
      // Ocultar el formulario de inicio de sesión
      setMostrarLogin(false)

      // Limpiar los campos de acceso
      setUsuarioAdmin("")
      setClaveAdmin("")

      sessionStorage.setItem("ecoAdminAutorizado", "true")

      // Mostrar la transición de entrada
      setTransicionAdmin("entrada")

      // Activar el modo administrador y abrir su panel.
      setTimeout(() => {
        setModoAdmin(true)
        setTransicionAdmin(null)
        window.location.href = "/admin"
      }, 1800)

    } else {
      setErrorLogin("Usuario o contraseña incorrectos.")
    }
  }

  function cerrarSesionAdmin() {
    setTransicionAdmin("salida");

    setTimeout(() => {
      sessionStorage.removeItem("ecoAdminAutorizado")
      setModoAdmin(false);
      setTransicionAdmin(null);
      setErrorLogin("");
      setMensaje("");
      setError("");
      navegar("/");
      setTransicionAdmin(null);
    }, 1800);
  }

  async function clasificarConIA() {
    const descripcion = formulario.descripcion.trim()

    if (descripcion.length < 5) {
      setErrorIA("Escribe una descripción de al menos 5 caracteres.")
      setClasificacionIA(null)
      return
    }

    setClasificandoIA(true)
    setErrorIA("")
    setClasificacionIA(null)

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/ia/clasificar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ descripcion }),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No fue posible clasificar el reporte."
        )
      }

      setClasificacionIA(datos)
    } catch (error) {
      setErrorIA(
        error.message || "No fue posible conectar con la IA."
      )
    } finally {
      setClasificandoIA(false)
    }
  }


  function manejarCambio(evento) {
    const { name, value } = evento.target

    if (name === "descripcion") {
      setClasificacionIA(null)
      setErrorIA("")
    }

    setFormulario({
      ...formulario,
      [name]: value
    })
  }


  async function registrarReporte(evento) {
    evento.preventDefault();

    setMensaje("");
    setError("");
    // No permitir guardar una ubicación sin confirmar.
    if (!ubicacionConfirmada) {
      setError(
        "Primero busca la dirección y selecciona el resultado correcto. Si usas tu ubicación actual, vuelve a obtenerla antes de registrar."
      );
      return;
    }
    const latitud = Number(formulario.latitud);
    const longitud = Number(formulario.longitud);

    if (
      formulario.latitud === "" ||
      formulario.longitud === "" ||
      !Number.isFinite(latitud) ||
      !Number.isFinite(longitud) ||
      latitud < -90 ||
      latitud > 90 ||
      longitud < -180 ||
      longitud > 180
    ) {
      setError(
        "Debes seleccionar una dirección de los resultados o usar tu ubicación actual antes de registrar el reporte."
      );
      return;
    }


    const parametros = new URLSearchParams()

    parametros.append("usuario_id", formulario.usuario_id)
    parametros.append("tipo", formulario.tipo)
    parametros.append("descripcion", formulario.descripcion)
    parametros.append("ciudad", formulario.ciudad)
    parametros.append("direccion", formulario.direccion)

    parametros.append("contacto_nombre", contacto.nombre.trim());
    parametros.append("contacto_telefono", contacto.telefono.trim());

    if (contacto.correo.trim()) {
      parametros.append("contacto_correo", contacto.correo.trim());
    }

    if (formulario.latitud !== "") {
      parametros.append("latitud", formulario.latitud)
    }

    if (formulario.longitud !== "") {
      parametros.append("longitud", formulario.longitud)
    }


    try {
      const datosFormulario = new FormData();

      if (foto) {
        datosFormulario.append("foto", foto);
      }

      const respuesta = await fetch(
        `http://127.0.0.1:8000/reportes/?${parametros.toString()}`,
        {
          method: "POST",
          body: datosFormulario
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error("No se pudo registrar el reporte")
      }

      setMensaje("Reporte registrado correctamente")

      setFormulario({
        usuario_id: 1,
        tipo: "",
        descripcion: "",
        ciudad: "",
        direccion: "",
        latitud: "",
        longitud: ""
      })

      setContacto({
        nombre: "",
        telefono: "",
        correo: "",
      });

      setFormularioAbierto(false);
      setResultadosDireccion([]);
      setUbicacionConfirmada(false);

      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }

      setFoto(null);
      setVistaPrevia("");

      const campoFoto = document.getElementById("foto-reporte");
      if (campoFoto) {
        campoFoto.value = "";
      }

      obtenerReportes();

    } catch (error) {
      setError("No se pudo registrar el reporte")
      console.error(error)
    }
  }

  return (
    <>
      {transicionAdmin === "entrada" && (
        <div className="transicion-admin entrada-admin">
          <div className="transicion-admin-contenido">
            <div className="escudo-admin">🛡️</div>

            <div className="linea-admin"></div>

            <h2>Acceso autorizado</h2>

            <p>Activando modo administrador...</p>
          </div>
        </div>
      )}

      {transicionAdmin === "salida" && (
        <div className="transicion-ciudadano">
          <div className="transicion-ciudadano-contenido">
            <div className="icono-ciudadano">🌿</div>

            <div className="circulo-ciudadano"></div>

            <h2>Sesión finalizada</h2>

            <p>Regresando al modo ciudadano...</p>

            <div className="barra-ciudadano">
              <div className="progreso-ciudadano"></div>
            </div>
          </div>
        </div>
      )}

      <Routes>

        <Route
          path="/admin"
          element={
            sessionStorage.getItem("ecoAdminAutorizado") === "true" ? (
              <Admin
                reportes={reportes}
                actualizarEstado={actualizarEstado}
                eliminarReporte={eliminarReporte}
                cerrarSesion={cerrarSesionAdmin}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/"
          element={
            <div>

              <header className="hero">

                <nav className="barra-navegacion">

                  <div className="marca">
                    <span className="marca-icono">🌱</span>
                    <span>EcoGuardianAI</span>
                  </div>

                  <div className="menu-principal">

                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById("inicio")
                          .scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Inicio
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById("registrar")
                          .scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Reportar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById("mapa")
                          .scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Mapa
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById("dashboard")
                          .scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Dashboard
                    </button>

                    {modoAdmin ? (
                      <button
                        type="button"
                        className="admin-activo-btn"
                        onClick={() => {
                          setTransicionAdmin("salida")

                          setTimeout(() => {
                            setModoAdmin(false)
                            setTransicionAdmin(null)
                            setErrorLogin("")
                            setMensaje("")
                            setError("")
                          }, 1800)
                        }}
                      >

                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setErrorLogin("")
                          setMostrarLogin(true)
                        }}
                      >
                        🔐 Administración
                      </button>
                    )}

                  </div>

                </nav>

                <div className="hero-contenido" id="inicio">

                  <div className="hero-texto">

                    <span className="etiqueta-hero">
                      GESTIÓN AMBIENTAL Y PREVENCIÓN DE RIESGOS
                    </span>

                    <h1>
                      Protejamos
                      <br />
                      nuestro territorio
                    </h1>

                    <p>
                      Reporta situaciones ambientales y riesgos de tu comunidad
                      de forma rápida, sencilla y con ubicación geográfica.
                    </p>

                    <div className="hero-acciones">

                      <button
                        type="button"
                        className="boton-principal"
                        onClick={() =>
                          document
                            .getElementById("registrar")
                            .scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        📍 Reportar una situación
                      </button>

                      <button
                        type="button"
                        className="boton-secundario"
                        onClick={() =>
                          document
                            .getElementById("mapa")
                            .scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        🗺️ Ver mapa de reportes
                      </button>

                    </div>

                  </div>

                  <div className="hero-panel">

                    <div className="hero-circulo">
                      🌱
                    </div>

                    <h2>
                      Tu reporte puede hacer la diferencia
                    </h2>

                    <p>
                      Identifica, registra y ayuda a visualizar las
                      situaciones que afectan nuestra comunidad.
                    </p>

                    <div className="hero-mini-datos">

                      <div>
                        <strong>♻️</strong>
                        <span>Residuos</span>
                      </div>

                      <div>
                        <strong>🌊</strong>
                        <span>Inundaciones</span>
                      </div>

                      <div>
                        <strong>⛰️</strong>
                        <span>Deslizamientos</span>
                      </div>

                    </div>

                  </div>

                </div>

              </header>

              <main>
                {mostrarLogin && (
                  <div className="login-overlay">

                    <div className="login-card">

                      <div className="login-icono">
                        🔐
                      </div>

                      <h2>Acceso administrativo</h2>

                      <p>
                        Ingresa tus credenciales para acceder a la
                        gestión de reportes.
                      </p>

                      <form onSubmit={iniciarSesionAdmin}>

                        <label>
                          Usuario
                        </label>

                        <input
                          type="text"
                          placeholder="Ingresa tu usuario"
                          value={usuarioAdmin}
                          onChange={(evento) =>
                            setUsuarioAdmin(evento.target.value)
                          }
                        />

                        <label>
                          Contraseña
                        </label>

                        <input
                          type="password"
                          placeholder="Ingresa tu contraseña"
                          value={claveAdmin}
                          onChange={(evento) =>
                            setClaveAdmin(evento.target.value)
                          }
                        />

                        {errorLogin && (
                          <p className="login-error">
                            {errorLogin}
                          </p>
                        )}

                        <div className="login-acciones">

                          <button
                            type="submit"
                            className="login-btn-ingresar"
                          >
                            Ingresar
                          </button>

                          <button
                            type="button"
                            className="login-btn-cancelar"
                            onClick={() => {
                              setMostrarLogin(false)
                              setErrorLogin("")
                            }}
                          >
                            Cancelar
                          </button>

                        </div>

                      </form>

                    </div>

                  </div>
                )}

                {/* CATEGORÍAS AMBIENTALES */}

                <section className="categorias-section">

                  <div className="categorias-encabezado">

                    <span className="etiqueta-seccion">
                      REPORTES AMBIENTALES
                    </span>

                    <h2>¿Qué quieres reportar?</h2>

                    <p>
                      Ayúdanos a identificar situaciones ambientales y riesgos
                      que puedan afectar a nuestra comunidad.
                    </p>

                  </div>

                  <div className="categorias-grid">

                    <div className="categoria-card">

                      <div className="categoria-icono">
                        ♻️
                      </div>

                      <h3>Residuos</h3>

                      <p>
                        Acumulación de residuos, puntos críticos o disposición
                        inadecuada de basura.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setFormulario({
                            ...formulario,
                            tipo: "Acumulación de residuos"
                          })

                          document
                            .getElementById("registrar")
                            .scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        Reportar →
                      </button>

                    </div>


                    <div className="categoria-card">

                      <div className="categoria-icono">
                        🌊
                      </div>

                      <h3>Inundaciones</h3>

                      <p>
                        Inundaciones, acumulación de agua o afectaciones
                        ocasionadas por lluvias.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setFormulario({
                            ...formulario,
                            tipo: "Inundación"
                          })

                          document
                            .getElementById("registrar")
                            .scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        Reportar →
                      </button>

                    </div>


                    <div className="categoria-card">

                      <div className="categoria-icono">
                        ⛰️
                      </div>

                      <h3>Deslizamientos</h3>

                      <p>
                        Movimientos de tierra, desprendimientos o zonas
                        con riesgo de deslizamiento.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setFormulario({
                            ...formulario,
                            tipo: "Deslizamiento"
                          })

                          document
                            .getElementById("registrar")
                            .scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        Reportar →
                      </button>

                    </div>


                    <div className="categoria-card">

                      <div className="categoria-icono">
                        🌱
                      </div>

                      <h3>Contaminación</h3>

                      <p>
                        Contaminación del aire, agua, suelo u otras
                        situaciones que afecten el entorno.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setFormulario({
                            ...formulario,
                            tipo: "Contaminación"
                          })

                          document
                            .getElementById("registrar")
                            .scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        Reportar →
                      </button>

                    </div>

                  </div>

                </section>


                {/* DASHBOARD */}

                <section id="dashboard" className="dashboard-section">

                  <div className="dashboard-encabezado">

                    <div>
                      <span className="etiqueta-seccion">
                        PRODUCTO DE DATOS
                      </span>

                      <h2>Panel ambiental</h2>

                      <p>
                        Consulta el estado de los reportes ambientales
                        registrados en la comunidad.
                      </p>
                    </div>

                  </div>


                  {/* INDICADORES PRINCIPALES */}

                  <div className="indicadores-grid">

                    <div className="indicador-card indicador-total">

                      <div className="indicador-icono">
                        📊
                      </div>

                      <div>
                        <span>Total de reportes</span>
                        <strong>{reportes.length}</strong>
                      </div>

                    </div>


                    <div className="indicador-card indicador-pendiente">

                      <div className="indicador-icono">
                        ⏳
                      </div>

                      <div>
                        <span>Pendientes</span>
                        <strong>
                          {
                            reportes.filter(
                              (reporte) =>
                                reporte.estado === "Pendiente"
                            ).length
                          }
                        </strong>
                      </div>

                    </div>


                    <div className="indicador-card indicador-revision">

                      <div className="indicador-icono">
                        🔎
                      </div>

                      <div>
                        <span>En revisión</span>
                        <strong>
                          {
                            reportes.filter(
                              (reporte) =>
                                reporte.estado === "En revisión"
                            ).length
                          }
                        </strong>
                      </div>

                    </div>


                    <div className="indicador-card indicador-atendido">

                      <div className="indicador-icono">
                        ✓
                      </div>

                      <div>
                        <span>Atendidos</span>
                        <strong>
                          {
                            reportes.filter(
                              (reporte) =>
                                reporte.estado === "Atendido"
                            ).length
                          }
                        </strong>
                      </div>

                    </div>

                  </div>


                  {/* GRÁFICOS */}

                  <div className="dashboard-graficos">


                    <div className="grafico-card">

                      <div className="grafico-encabezado">

                        <div>
                          <span>CLASIFICACIÓN</span>
                          <h3>Reportes por tipo</h3>
                        </div>

                      </div>

                      <BarChart
                        width={600}
                        height={320}
                        data={datosPorTipo}
                        layout="vertical"
                        margin={{
                          top: 20,
                          right: 30,
                          left: 120,
                          bottom: 20
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          type="number"
                          allowDecimals={false}
                        />

                        <YAxis
                          type="category"
                          dataKey="tipo"
                          width={120}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="cantidad"
                          fill="#2e7d32"
                        />

                      </BarChart>

                    </div>


                    <div className="grafico-card">

                      <div className="grafico-encabezado">

                        <div>
                          <span>SEGUIMIENTO</span>
                          <h3>Estado de los reportes</h3>
                        </div>

                      </div>

                      <BarChart
                        width={600}
                        height={320}
                        data={datosPorEstado}
                        layout="vertical"
                        margin={{
                          top: 20,
                          right: 30,
                          left: 120,
                          bottom: 20
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          type="number"
                          allowDecimals={false}
                        />

                        <YAxis
                          type="category"
                          dataKey="estado"
                          width={120}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="cantidad"
                          fill="#1976d2"
                        />

                      </BarChart>

                    </div>

                  </div>


                  {/* INDICADORES DE INTELIGENCIA ARTIFICIAL */}
                  <div className="indicadores-grid">
                    <div className="indicador-card">
                      <div className="indicador-icono">🤖</div>
                      <div>
                        <span>Análisis realizados por IA</span>
                        <strong>{historialIA.length}</strong>
                      </div>
                    </div>

                    <div className="indicador-card">
                      <div className="indicador-icono">♻️</div>
                      <div>
                        <span>Categoría residuos</span>
                        <strong>
                          {
                            historialIA.filter(
                              (item) => item.categoria_ia === "Residuos"
                            ).length
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="indicador-card">
                      <div className="indicador-icono">🌊</div>
                      <div>
                        <span>Categoría inundación</span>
                        <strong>
                          {
                            historialIA.filter(
                              (item) => item.categoria_ia === "Inundación"
                            ).length
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="indicador-card">
                      <div className="indicador-icono">⛰️</div>
                      <div>
                        <span>Categoría deslizamiento</span>
                        <strong>
                          {
                            historialIA.filter(
                              (item) => item.categoria_ia === "Deslizamiento"
                            ).length
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="indicador-card">
                      <div className="indicador-icono">🌱</div>
                      <div>
                        <span>Categoría contaminación</span>
                        <strong>
                          {
                            historialIA.filter(
                              (item) => item.categoria_ia === "Contaminación"
                            ).length
                          }
                        </strong>
                      </div>
                    </div>
                  </div>

                  {errorHistorialIA && (
                    <p role="alert">
                      No fue posible cargar los indicadores de IA: {errorHistorialIA}
                    </p>
                  )}

                  <p>
                    Los indicadores corresponden a análisis guardados. Un mismo reporte
                    puede tener varios análisis. Las categorías son sugerencias
                    experimentales, no riesgos confirmados.
                  </p>



                  {/* PORCENTAJE DE ATENCIÓN */}

                  <div className="atencion-panel">

                    <div className="atencion-texto">

                      <span>INDICADOR DE GESTIÓN</span>

                      <h3>
                        Nivel de atención de reportes
                      </h3>

                      <p>
                        Porcentaje de situaciones ambientales
                        que han sido atendidas.
                      </p>

                    </div>

                    <div className="atencion-valor">

                      <strong>
                        {porcentajeAtendidos}%
                      </strong>

                      <span>
                        atendidos
                      </span>

                    </div>

                  </div>


                  {/* RESUMEN */}

                  <div className="dashboard-resumen">

                    <div>
                      <span>Situaciones identificadas</span>
                      <strong>{reportes.length}</strong>
                    </div>

                    <div>
                      <span>Casos pendientes</span>
                      <strong>
                        {
                          reportes.filter(
                            (reporte) =>
                              reporte.estado === "Pendiente"
                          ).length
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Casos atendidos</span>
                      <strong>
                        {
                          reportes.filter(
                            (reporte) =>
                              reporte.estado === "Atendido"
                          ).length
                        }
                      </strong>
                    </div>

                  </div>

                </section>

                {/* REGISTRAR REPORTE */}

                <section id="registrar">

                  <h2>Registrar reporte ambiental</h2>

                  <button
                    type="button"
                    className="boton-desplegable"
                    onClick={() => setFormularioAbierto((anterior) => !anterior)}
                    aria-expanded={formularioAbierto}
                  >
                    {formularioAbierto
                      ? "− Cerrar formulario"
                      : "+ Registrar reporte ambiental"}
                  </button>

                  {formularioAbierto && (
                    <form onSubmit={registrarReporte}>

                      <div>
                        <label>Tipo de reporte</label>

                        <select
                          name="tipo"
                          value={formulario.tipo}
                          onChange={manejarCambio}
                          required
                        >
                          <option value="">
                            Seleccione una opción
                          </option>

                          <option value="Acumulación de residuos">
                            Acumulación de residuos
                          </option>

                          <option value="Inundación">
                            Inundación
                          </option>

                          <option value="Deslizamiento">
                            Deslizamiento
                          </option>

                          <option value="Contaminación">
                            Contaminación
                          </option>

                          <option value="Otro">
                            Otro
                          </option>
                        </select>
                      </div>

                      <div>
                        <label>Descripción</label>

                        <textarea
                          name="descripcion"
                          value={formulario.descripcion}
                          onChange={manejarCambio}
                          placeholder="Describa la situación ambiental"
                          required
                        />

                        <button
                          type="button"
                          onClick={clasificarConIA}
                          disabled={clasificandoIA}
                        >
                          {clasificandoIA
                            ? "Analizando descripción..."
                            : "🤖 Analizar con inteligencia artificial"}
                        </button>

                        {errorIA && (
                          <p role="alert">{errorIA}</p>
                        )}

                        {clasificacionIA && (
                          <div className="resultado-clasificacion-ia" aria-live="polite">
                            <h3>🤖 Análisis de EcoGuardianAI</h3>

                            <p>
                              <strong>Categoría sugerida:</strong>{" "}
                              {clasificacionIA.categoria_ia}
                            </p>

                            <p>
                              <strong>Confianza del modelo:</strong>{" "}
                              {(clasificacionIA.confianza_modelo * 100).toFixed(1)}%
                            </p>

                            <p>{clasificacionIA.advertencia}</p>

                            <p>
                              Esta sugerencia no reemplaza la evaluación humana
                              ni determina por sí sola la gravedad de un riesgo.
                            </p>
                          </div>
                        )}

                      </div>


                      <div className="campo-fotografia">
                        <label htmlFor="foto-reporte">
                          📸 Fotografía de evidencia (opcional)
                        </label>

                        <input
                          id="foto-reporte"
                          type="file"
                          accept="image/*"
                          onChange={(evento) => {
                            const archivo = evento.target.files[0]

                            if (!archivo) return

                            if (archivo.size > 5 * 1024 * 1024) {
                              setError("La fotografía no puede superar los 5 MB.")
                              evento.target.value = ""
                              setFoto(null)
                              setVistaPrevia("")
                              return
                            }

                            setError("")
                            setFoto(archivo)
                            setVistaPrevia(URL.createObjectURL(archivo))
                          }}
                        />

                        {vistaPrevia && (
                          <div className="vista-previa-foto">
                            <img
                              src={vistaPrevia}
                              alt="Vista previa de la evidencia ambiental"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                URL.revokeObjectURL(vistaPrevia)
                                setFoto(null)
                                setVistaPrevia("")
                              }}
                            >
                              Quitar fotografía
                            </button>
                          </div>
                        )}
                      </div>


                      <div>
                        <label>Ciudad</label>

                        <input
                          type="text"
                          name="ciudad"
                          value={formulario.ciudad}
                          onChange={manejarCambio}
                          placeholder="Ejemplo: Medellín"
                          required
                        />
                      </div>

                      <div>
                        <label>Dirección</label>

                        <input
                          type="text"
                          name="direccion"
                          value={formulario.direccion}
                          onChange={manejarCambio}
                          placeholder="Ejemplo: Calle 80, Manrique oriental, Medellín"
                          required
                        />

                        <button
                          type="button"
                          onClick={buscarDireccion}
                          disabled={buscandoDireccion}
                        >
                          {buscandoDireccion
                            ? "Buscando dirección..."
                            : "🔎 Buscar dirección en el mapa"}
                        </button>

                        {resultadosDireccion.length > 0 && (
                          <div className="resultados-direccion">
                            <p>Selecciona la ubicación correcta:</p>


                            {resultadosDireccion.map((resultado, indice) => (
                              <button
                                type="button"
                                key={`${resultado.latitud}-${resultado.longitud}-${indice}`}
                                onClick={() => {
                                  const latitud = Number(resultado.latitud);
                                  const longitud = Number(resultado.longitud);

                                  if (
                                    !Number.isFinite(latitud) ||
                                    !Number.isFinite(longitud) ||
                                    latitud < -90 ||
                                    latitud > 90 ||
                                    longitud < -180 ||
                                    longitud > 180
                                  ) {
                                    setError("La dirección no tiene coordenadas válidas.");
                                    return;
                                  }

                                  setFormulario((anterior) => ({
                                    ...anterior,
                                    direccion: anterior.direccion,
                                    latitud: String(latitud),
                                    longitud: String(longitud),
                                  }));

                                  setUbicacionConfirmada(true);
                                  setResultadosDireccion([]);
                                  setError("");
                                  setMensaje(
                                    `Ubicación seleccionada: ${latitud.toFixed(6)}, ${longitud.toFixed(6)}`
                                  );
                                }}
                              >
                                {resultado.direccion}
                              </button>
                            ))}

                          </div>
                        )}


                      </div>

                      <MapaSeleccion
                        latitud={formulario.latitud}
                        longitud={formulario.longitud}
                        onSeleccionar={(latitud, longitud) => {
                          setFormulario((anterior) => ({
                            ...anterior,
                            latitud: String(latitud),
                            longitud: String(longitud),
                          }));

                          setUbicacionConfirmada(
                            latitud !== "" && longitud !== ""
                          );

                          setError("");
                        }}
                      />


                      <div className="ubicacion-reporte">

                        <label>Ubicación del reporte</label>

                        <p className="ayuda-ubicacion">
                          No necesitas conocer la latitud ni la longitud.
                          Puedes obtener automáticamente tu ubicación.
                        </p>

                        <button
                          type="button"
                          className="boton-ubicacion"
                          onClick={obtenerUbicacion}
                        >
                          📍 Usar mi ubicación actual
                        </button>

                        {formulario.latitud && formulario.longitud && (
                          <p className="ubicacion-confirmada">
                            ✓ Ubicación registrada correctamente
                          </p>
                        )}

                      </div>

                      <div className="datos-contacto">
                        <h3>Datos de contacto</h3>

                        <p>
                          Podremos comunicarnos contigo si necesitamos
                          ampliar la información de tu reporte.
                        </p>

                        <label htmlFor="contacto-nombre">Nombre completo</label>
                        <input
                          id="contacto-nombre"
                          type="text"
                          value={contacto.nombre}
                          onChange={(e) =>
                            setContacto((anterior) => ({
                              ...anterior,
                              nombre: e.target.value,
                            }))
                          }
                          placeholder="Nombre y apellido"
                          autoComplete="name"
                          required
                        />

                        <label htmlFor="contacto-telefono">Teléfono</label>
                        <input
                          id="contacto-telefono"
                          type="tel"
                          value={contacto.telefono}
                          onChange={(e) =>
                            setContacto((anterior) => ({
                              ...anterior,
                              telefono: e.target.value,
                            }))
                          }
                          placeholder="Ejemplo: 3001234567"
                          autoComplete="tel"
                          required
                        />

                        <label htmlFor="contacto-correo">
                          Correo electrónico (opcional)
                        </label>
                        <input
                          id="contacto-correo"
                          type="email"
                          value={contacto.correo}
                          onChange={(e) =>
                            setContacto((anterior) => ({
                              ...anterior,
                              correo: e.target.value,
                            }))
                          }
                          placeholder="correo@ejemplo.com"
                          autoComplete="email"
                        />
                      </div>


                      <button type="submit">
                        Registrar reporte
                      </button>

                    </form>
                  )}

                  {mensaje && (
                    <p>{mensaje}</p>
                  )}

                  {error && (
                    <p>{error}</p>
                  )}

                </section>

                {/* MAPA DE REPORTES AMBIENTALES */}

                <section id="mapa" className="mapa-reportes-section">
                  <div className="mapa-reportes-encabezado">
                    <h2>Mapa de reportes ambientales</h2>
                    <p>
                      Consulta la ubicación de las situaciones ambientales
                      registradas por la comunidad.
                    </p>
                  </div>

                  <Mapa reportes={reportes} />
                </section>

                {/* REPORTES REGISTRADOS */}

                <section className="reportes-section">

                  <div className="reportes-encabezado">

                    <div>
                      <span className="etiqueta-seccion">
                        GESTIÓN DE REPORTES
                      </span>

                      <h2>Reportes registrados</h2>

                      <p>
                        Consulta y actualiza el estado de las situaciones
                        ambientales identificadas por la comunidad.
                      </p>
                    </div>

                    <div className="contador-reportes">
                      <strong>{reportes.length}</strong>
                      <span>reportes</span>
                    </div>

                  </div>


                  {cargando && (
                    <div className="estado-vacio">
                      <p>Cargando reportes...</p>
                    </div>
                  )}


                  {!cargando && reportes.length === 0 && (
                    <div className="estado-vacio">
                      <div className="estado-vacio-icono">
                        📋
                      </div>

                      <h3>No hay reportes registrados</h3>

                      <p>
                        Cuando se registre una situación ambiental,
                        aparecerá aquí.
                      </p>
                    </div>
                  )}


                  {!cargando && reportes.length > 0 && (

                    <div className="lista-reportes">

                      {reportes.map((reporte) => (

                        <article
                          key={reporte.id}
                          className="reporte-card"
                        >

                          <div className="reporte-card-superior">

                            <div>

                              <span className="reporte-numero">
                                REPORTE #{reporte.id}
                              </span>

                              <h3>
                                {reporte.tipo}
                              </h3>

                            </div>


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


                          <div className="reporte-descripcion">

                            <span>Descripción</span>

                            <p>
                              {reporte.descripcion}
                            </p>

                          </div>

                          {reporte.foto_url && (
                            <div className="reporte-foto-evidencia">
                              <span>Fotografía de evidencia</span>
                              <a
                                href={`http://127.0.0.1:8000${reporte.foto_url}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Ver fotografía completa"
                              >
                                <img
                                  src={`http://127.0.0.1:8000${reporte.foto_url}`}
                                  alt={`Evidencia del reporte ${reporte.id}`}
                                  loading="lazy"
                                />
                              </a>
                            </div>
                          )}

                          <div className="reporte-datos">

                            <div>

                              <span>📍 Ubicación</span>

                              <strong>
                                {reporte.direccion}
                              </strong>

                            </div>


                            <div>

                              <span>🏙️ Ciudad</span>

                              <strong>
                                {reporte.ciudad}
                              </strong>

                            </div>


                            <div>

                              <span>🌐 Coordenadas</span>

                              <strong>
                                {reporte.latitud !== null &&
                                  reporte.longitud !== null
                                  ? `${reporte.latitud}, ${reporte.longitud}`
                                  : "Sin ubicación"}
                              </strong>

                            </div>

                          </div>

                          <div className="reporte-estado-publico">

                            <span>
                              Estado actual del reporte
                            </span>

                            <p>
                              Este reporte se encuentra actualmente en estado:
                            </p>

                            <strong>
                              {reporte.estado}
                            </strong>

                          </div>

                        </article>

                      ))}

                    </div>

                  )}

                </section>

              </main>

            </div>
          }
        />

      </Routes>

    </>
  )
}

export default App
