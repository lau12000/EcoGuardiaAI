\# 🌱 EcoGuardianAI



\### Plataforma inteligente para la gestión ambiental integral



\*\*Territorio de referencia:\*\* Comuna 3 – Manrique, Medellín, Antioquia, Colombia.



\## 1. Descripción del proyecto



EcoGuardianAI es una aplicación web orientada a la gestión de reportes ambientales, el seguimiento de situaciones identificadas por la comunidad y el análisis preliminar de problemáticas ambientales mediante inteligencia artificial.



La plataforma centraliza información sobre los reportes, facilita su administración y ofrece herramientas de visualización para apoyar el análisis de los datos disponibles.



El proyecto busca contribuir a una gestión ambiental más organizada mediante el uso de tecnologías de desarrollo web, procesamiento de texto, aprendizaje automático y visualización de información.



\## 2. Objetivo general



Desarrollar una plataforma web que integre la gestión de reportes ambientales, la visualización de información y la clasificación preliminar mediante inteligencia artificial, como apoyo a la identificación y el seguimiento de problemáticas ambientales en la Comuna 3 – Manrique.



\## 3. Objetivos específicos



\- Facilitar el registro y la consulta de reportes ambientales.

\- Implementar un sistema de clasificación preliminar de descripciones mediante inteligencia artificial.

\- Permitir la administración y el seguimiento de los reportes.

\- Visualizar indicadores y datos territoriales disponibles.

\- Conservar un historial de los análisis realizados por el modelo.

\- Facilitar la consulta y exportación de información para apoyar el análisis ambiental.

\- Promover la validación humana de los resultados generados por inteligencia artificial.



\## 4. Funcionalidades principales



\### 4.1. Reportes ambientales



\- Consulta de reportes registrados.

\- Visualización de descripciones y categorías.

\- Consulta de estados de atención.

\- Visualización de dirección, ciudad y coordenadas disponibles.

\- Consulta de fotografías de evidencia cuando existen.

\- Presentación de información de contacto registrada.



\### 4.2. Administración



\- Consulta y seguimiento de reportes.

\- Actualización del estado de los casos.

\- Eliminación de reportes.

\- Clasificación preliminar del riesgo mediante reglas de palabras clave.

\- Análisis de descripciones con inteligencia artificial.

\- Visualización de los resultados de clasificación.

\- Consulta de información relevante para la gestión ambiental.



\### 4.3. Inteligencia artificial



El sistema incorpora un modelo de aprendizaje automático que procesa descripciones de situaciones ambientales y sugiere una categoría.



La implementación utiliza técnicas de procesamiento de texto con TF-IDF y un clasificador de regresión logística.



Las categorías contempladas son:



\- Residuos.

\- Inundación.

\- Deslizamiento.

\- Contaminación.

\- Otro.



Los análisis pueden almacenarse en la tabla `analisis\_ia` de la base de datos y consultarse mediante el endpoint de historial.



La clasificación es experimental. La categoría sugerida y el valor de confianza deben interpretarse como información de apoyo, no como una evaluación definitiva del riesgo ambiental.



\### 4.4. Dashboard y visualización



La aplicación integra indicadores y componentes visuales para facilitar la interpretación de los reportes y de los análisis disponibles.



La información presentada depende de los registros existentes en la base de datos y de las respuestas de los servicios del backend.



\### 4.5. Exportación a Excel



La funcionalidad de exportación está diseñada para generar un archivo de consulta con las siguientes hojas:



1\. \*\*Reportes ambientales:\*\* información de los reportes registrados.

2\. \*\*Historial de IA:\*\* análisis realizados y categorías sugeridas.

3\. \*\*Resumen ejecutivo:\*\* indicadores generales calculados a partir de la información consultada.



La disponibilidad de esta función depende de que la implementación de exportación esté incorporada y funcionando en la versión ejecutada.



\## 5. Tecnologías utilizadas



| Componente | Tecnología |

|---|---|

| Interfaz web | React |

| Herramienta de desarrollo web | Vite |

| Lenguaje del frontend | JavaScript |

| Estilos | CSS |

| Backend | Python |

| API REST | FastAPI |

| Validación de datos | Pydantic |

| Acceso a datos | SQLAlchemy |

| Base de datos local | SQLite |

| Procesamiento de texto | TF-IDF |

| Clasificación automática | Scikit-learn |

| Persistencia del modelo | Joblib |

| Exportación a Excel | ExcelJS |



\## 6. Arquitectura general



EcoGuardianAI está compuesto por los siguientes módulos:



\*\*Frontend:\*\* interfaz web para consultar reportes, gestionar casos, visualizar resultados y solicitar análisis.



\*\*Backend:\*\* API encargada de recibir las solicitudes, gestionar la información y ejecutar los procesos de clasificación.



\*\*Módulo de inteligencia artificial:\*\* procesa las descripciones ambientales y genera categorías sugeridas.



\*\*Base de datos:\*\* almacena la información persistente de la aplicación, incluidos los reportes y los análisis de IA.



El flujo general consiste en enviar una solicitud desde el frontend, procesarla en el backend, consultar o almacenar los datos necesarios y devolver una respuesta para su visualización.



\## 7. Estructura del proyecto



La estructura principal puede variar según los archivos presentes en la versión final.



```text

EcoGuardianAI/

├── backend/

│   └── app/

│       ├── main.py

│       ├── database.py

│       ├── models/

│       │   ├── analisis\_ia.py

│       │   ├── reporte.py

│       │   └── usuario.py

│       └── routers/

├── frontend/

│   ├── src/

│   │   ├── App.jsx

│   │   ├── Admin.jsx

│   │   ├── App.css

│   │   ├── Mapa.jsx

│   │   └── MapaSeleccion.jsx

│   ├── package.json

│   └── vite.config.js

├── modeloIA/

├── database/

├── dataset/

├── ecoguardian.db

├── venv/

└── README.md

```



\## 8. Requisitos previos



Para ejecutar el proyecto en un entorno local se requiere:



\- Python instalado.

\- Node.js y npm.

\- Las dependencias necesarias del backend y del frontend.

\- La base de datos SQLite configurada.

\- Los archivos del modelo de inteligencia artificial requeridos por el backend.



\## 9. Instalación y ejecución



\### 9.1. Abrir la carpeta del proyecto



En PowerShell:



```powershell

cd C:\\Users\\laura\\OneDrive\\Escritorio\\EcoGuardianAI

```



\### 9.2. Activar el entorno virtual



Si el entorno ya existe:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Si el proyecto dispone de un archivo `requirements.txt`, instalar las dependencias del backend con:



```powershell

pip install -r requirements.txt

```



\### 9.3. Ejecutar el backend



Desde la raíz del proyecto:



```powershell

.\\venv\\Scripts\\python.exe -m uvicorn backend.app.main:app --reload

```



La API estará disponible normalmente en:



`http://127.0.0.1:8000`



La documentación interactiva de la API estará disponible en:



`http://127.0.0.1:8000/docs`



\### 9.4. Instalar dependencias del frontend



Abre una segunda terminal:



```powershell

cd C:\\Users\\laura\\OneDrive\\Escritorio\\EcoGuardianAI\\frontend

npm install

```



\### 9.5. Ejecutar el frontend



```powershell

npm run dev

```



Vite mostrará la dirección local de la aplicación, normalmente:



`http://localhost:5173/`



Ambos servidores deben permanecer activos mientras se utiliza la aplicación.



\### 9.6. Comprobar la compilación



Para comprobar el frontend:



```powershell

npm run build

```



La compilación debe terminar sin errores.



\## 10. Endpoints principales



| Método | Endpoint | Descripción |

|---|---|---|

| POST | `/ia/clasificar` | Solicita la clasificación de una descripción ambiental. |

| GET | `/ia/historial` | Consulta el historial de análisis de IA. |

| GET | `/reportes/` | Consulta los reportes ambientales. |



Los demás endpoints pueden consultarse en la documentación interactiva de FastAPI.



\## 11. Base de datos



La aplicación utiliza SQLite mediante SQLAlchemy.



La configuración identificada en el proyecto establece la siguiente URL:



```python

DATABASE\_URL = "sqlite:///./ecoguardian.db"

```



Las tablas incluyen modelos para reportes ambientales, análisis de inteligencia artificial y usuarios.



La ruta relativa de SQLite depende del directorio desde el que se inicia el backend. Por ello, se recomienda ejecutar el comando de inicio desde la raíz del proyecto.



\## 12. Pruebas y validación



Para verificar el funcionamiento de la plataforma se recomienda comprobar:



\- Inicio del backend y del frontend.

\- Acceso a la documentación de la API.

\- Consulta y gestión de reportes.

\- Clasificación de descripciones mediante IA.

\- Registro y consulta del historial de análisis.

\- Actualización de indicadores.

\- Visualización de ubicaciones disponibles.

\- Exportación del archivo Excel, si está habilitada.

\- Compilación del frontend para detectar errores.



Las pruebas funcionales permiten verificar que las operaciones básicas respondan correctamente. No sustituyen una evaluación estadística formal del modelo de inteligencia artificial.



\## 13. Limitaciones



\- La clasificación de IA es experimental y puede producir resultados incorrectos.

\- La confianza del modelo no representa una probabilidad de acierto validada.

\- La calidad de las predicciones depende de los datos de entrenamiento y de las descripciones proporcionadas.

\- Los indicadores dependen de los registros existentes.

\- La visualización geográfica requiere información de ubicación suficiente.

\- La exportación depende de que los endpoints y la funcionalidad correspondiente estén operativos.

\- El entorno local está destinado al desarrollo y las pruebas; un despliegue público requiere medidas adicionales de seguridad, autenticación, protección de datos y configuración de servicios.



\## 14. Mejoras futuras



\- Ampliar y validar los datos de entrenamiento.

\- Evaluar el modelo mediante precisión, recall, F1-score y matriz de confusión.

\- Mejorar los mecanismos de autenticación y autorización.

\- Incorporar filtros y análisis temporales.

\- Optimizar las visualizaciones y el rendimiento del frontend.

\- Fortalecer la trazabilidad de los cambios de estado.

\- Preparar un despliegue seguro para un entorno de producción.



\## 15. Impacto esperado



EcoGuardianAI busca facilitar la organización de la información ambiental mediante herramientas de registro, consulta, seguimiento y clasificación preliminar.



Su propósito es apoyar la identificación de patrones y la gestión de los casos reportados, proporcionando información útil para la comunidad y los responsables de la atención ambiental.



El impacto deberá evaluarse a partir de pruebas con usuarios, calidad de los datos y resultados obtenidos durante su utilización.



\## 16. Contexto del proyecto



\*\*Nombre:\*\* EcoGuardianAI  

\*\*Área:\*\* gestión ambiental e inteligencia artificial.  

\*\*Territorio de referencia:\*\* Comuna 3 – Manrique, Medellín, Colombia.  

\*\*Tipo de solución:\*\* plataforma web con API y módulo de clasificación automática.



\## 17. Licencia y uso



Este proyecto se presenta con fines académicos y de demostración. Las condiciones de distribución, modificación y reutilización deben ser definidas por la persona autora o el equipo responsable.



\---



\*\*EcoGuardianAI — Tecnología e inteligencia artificial al servicio de la gestión ambiental comunitaria.\*\*

