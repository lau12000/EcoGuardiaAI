import { useEffect, useState } from "react"
import Mapa from "./Mapa"
import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Admin from "./Admin"
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

  const [modoAdmin, setModoAdmin] = useState(false)
  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [transicionAdmin, setTransicionAdmin] = useState(null)

  const [usuarioAdmin, setUsuarioAdmin] = useState("")
  const [claveAdmin, setClaveAdmin] = useState("")
  const [errorLogin, setErrorLogin] = useState("")

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

      // Mostrar la transición de entrada
      setTransicionAdmin("entrada")

      // Activar el modo administrador al terminar la animación
      setTimeout(() => {
        setModoAdmin(true)
        setTransicionAdmin(null)
      }, 1800)

    } else {
      setErrorLogin("Usuario o contraseña incorrectos.")
    }
  }


  function manejarCambio(evento) {
    const { name, value } = evento.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  async function registrarReporte(evento) {
    evento.preventDefault()

    setMensaje("")
    setError("")

    const parametros = new URLSearchParams()

    parametros.append("usuario_id", formulario.usuario_id)
    parametros.append("tipo", formulario.tipo)
    parametros.append("descripcion", formulario.descripcion)
    parametros.append("ciudad", formulario.ciudad)
    parametros.append("direccion", formulario.direccion)

    if (formulario.latitud !== "") {
      parametros.append("latitud", formulario.latitud)
    }

    if (formulario.longitud !== "") {
      parametros.append("longitud", formulario.longitud)
    }

    try {
      const respuesta = await fetch(
        `http://127.0.0.1:8000/reportes/?${parametros.toString()}`,
        {
          method: "POST"
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

      obtenerReportes()

    } catch (error) {
      setError("No se pudo registrar el reporte")
      console.error(error)
    }
  }

  return (
    <BrowserRouter>

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
            <Admin
              reportes={reportes}
              actualizarEstado={actualizarEstado}
            />
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
                        🛡️ Modo administrador · Cerrar sesión
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
                        placeholder="Ejemplo: Manrique oriental"
                        required
                      />
                    </div>

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

                    <button type="submit">
                      Registrar reporte
                    </button>

                  </form>

                  {mensaje && (
                    <p>{mensaje}</p>
                  )}

                  {error && (
                    <p>{error}</p>
                  )}

                </section>

                {/* MAPA */}

                <section id="mapa">
                  <Mapa reportes={reportes} />
                </section>
                {/* GESTIÓN ADMINISTRATIVA */}

                {modoAdmin && (
                  <section className="administracion-section">

                    <div className="administracion-encabezado">

                      <div>
                        <span className="etiqueta-seccion">
                          GESTIÓN ADMINISTRATIVA
                        </span>

                        <h2>Seguimiento de reportes</h2>

                        <p>
                          Espacio destinado a la gestión y seguimiento de las
                          situaciones ambientales reportadas por la comunidad.
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

                    </div>


                    {reportes.length === 0 ? (

                      <div className="administracion-vacia">

                        <div className="administracion-vacia-icono">
                          📋
                        </div>

                        <h3>No hay reportes para gestionar</h3>

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


                            <div className="administracion-descripcion">

                              <span>Situación reportada</span>

                              <p>
                                {reporte.descripcion}
                              </p>

                            </div>


                            <div className="administracion-datos">

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
                                value={reporte.estado}
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

                          </article>

                        ))}

                      </div>

                    )}

                  </section>

                )}

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

    </BrowserRouter>
  )
}

export default App
