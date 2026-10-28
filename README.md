# UrbanInspect

Aplicación móvil académica para registrar y consultar incidencias de infraestructura urbana. El ciudadano puede describir problemas de su entorno, añadir una ubicación y consultar reportes disponibles en el servicio remoto.

> **Estado de esta documentación:** los estados R1–R10 se contrastaron con el código fuente presente en el repositorio. “Implementado” significa que la función descrita se observa en el código; no significa que se haya validado contra servicios externos ni en un dispositivo Android.

## Descripción general

UrbanInspect busca facilitar el reporte ciudadano de problemas urbanos y hacer visible la información de incidencias. La interfaz está desarrollada con Ionic y Angular, y Capacitor proporciona el proyecto Android.

## Objetivos

### Objetivo general

Desarrollar una aplicación móvil para registrar incidencias urbanas, consultar reportes y facilitar su seguimiento.

### Objetivos específicos

- Registrar reportes con categoría, descripción, dirección y coordenadas opcionales.
- Consultar los reportes publicados en MockAPI y abrir su detalle.
- Permitir guardar reportes en el dispositivo para consultarlos posteriormente.
- Preparar una aplicación Android mediante Capacitor.

## Funcionalidades disponibles

- **Inicio:** accesos al listado, al formulario y al seguimiento.
- **Incidencias:** consulta el recurso remoto, permite filtrar los reportes por categoría, guardar un reporte localmente y abrir su detalle. Muestra carga, error y lista vacía.
- **Nuevo reporte:** valida título, descripción, categoría y ubicación; permite solicitar coordenadas GPS y seleccionar una imagen, que se previsualiza y se intenta subir a Cloudinary antes de crear el reporte en MockAPI. Si falla la subida, el flujo intenta guardar el reporte sin fotografía.
- **Seguimiento:** consulta reportes del servidor y los añade a Preferences; si la consulta falla, carga los registros locales. El servicio también tiene métodos para añadir y eliminar entradas locales.
- **Detalle:** consulta una incidencia por su identificador y muestra sus datos. No incluye controles para modificar su estado.
- **Navegación:** pestañas inferiores para Inicio, Incidencias, Nuevo y Seguimiento; el detalle se abre como ruta independiente.

## Requisitos funcionales R1–R10

| Requisito | Descripción | Estado en el código |
|---|---|---|
| R1. Seguimiento local | Preferences guarda incidencias por código y el servicio puede eliminarlas localmente. La pantalla no ofrece desmarcar; además, al entrar puede copiar automáticamente reportes remotos al almacenamiento local. No se comprueba el comportamiento tras reiniciar la app. | **Parcial** |
| R2. Consulta de incidencias | Se consulta el recurso remoto y se muestran código, tipo, descripción, dirección, sector, fecha, estado y fotografía cuando existe. Hay estados de carga, error y lista vacía. | **Implementado en el código** |
| R3. Paginación remota | Existe una variable para indicar si hay más reportes, pero permanece desactivada y no se envían parámetros de página o límite. | **Pendiente** |
| R4. Meteorología | `ClimaService` consulta OpenWeather por coordenadas y transforma temperatura, descripción y lluvia de la última hora. No está conectado a una pantalla ni incluye advertencia por más de 5 mm o continuación ante fallo desde el flujo de registro. | **Parcial** |
| R5. Registro | El formulario valida los campos textuales y envía un `POST` a MockAPI. La prioridad se fija por defecto en media, no hay selector de prioridad y la fotografía es opcional. El título del formulario se guarda en `observacion`, no en un campo `titulo` del modelo. | **Parcial** |
| R6. Evidencia fotográfica | El formulario admite selección/captura desde el navegador del dispositivo, crea una vista previa y sube el archivo a Cloudinary. Si la subida falla, permite continuar sin fotografía. No usa el plugin Capacitor Camera ni implementa en el código un flujo propio de permisos. | **Parcial** |
| R7. Ubicación | El formulario puede solicitar coordenadas mediante Capacitor Geolocation y guardarlas. También acepta una dirección escrita, pero no valida coordenadas manuales ni limita el requisito de ubicación a baches. | **Parcial** |
| R8. Recuperación del formulario | No se encontró guardado automático de borradores ni diálogo para continuar o descartar un registro incompleto. | **Pendiente** |
| R9. Estados | El servicio contiene una operación `PUT` para actualizar incidencias, pero el detalle no presenta transiciones de estado, validación de observación para resolver ni invoca esa operación. | **Pendiente** |
| R10. Navegación y Android | Hay rutas para inicio, listado, registro, seguimiento y detalle, así como proyecto Android/Capacitor. El refresco consulta nuevamente el servicio al entrar; no se encontró evidencia de APK instalada o demostración en emulador. | **Parcial** |

## Tecnologías utilizadas

Versiones resueltas en `package-lock.json`:

| Tecnología | Versión |
|---|---:|
| Angular | 22.2.3 |
| Ionic Angular | 9.0.9 |
| TypeScript | 6.0.3 |
| Capacitor Core / Android | 8.5.3 |
| Capacitor Geolocation | 8.2.4 |
| Capacitor Preferences | 8.0.1 |
| Capacitor Camera | 8.2.6 (instalado, no conectado al formulario) |
| Ionicons | 8.1.0 |
| RxJS | 7.8.2 |
| Gradle Wrapper | 8.14.3 |
| Android Gradle Plugin | 8.13.0 |

También se incluyen Capacitor App, Filesystem, Haptics, Keyboard, Splash Screen y Status Bar. No se observó uso directo de esos plugins en las páginas revisadas. Las versiones declaradas en `package.json` pueden usar rangos; las anteriores corresponden al lockfile de este checkout.

## Arquitectura y estructura

```text
src/
├── app/
│   ├── app.routes.ts             # rutas lazy y rutas de pestañas
│   ├── models/                   # interfaz de incidencia y tipos
│   ├── pages/                    # inicio, incidencias, registro, seguimiento, detalle y tabs
│   └── services/                 # API, clima, ubicación y almacenamiento local
├── environments/                # indicadores de entorno
├── assets/                       # recursos gráficos
├── global.scss
└── theme/variables.scss
android/                          # proyecto nativo Gradle para Android
```

Angular usa componentes standalone. `IncidenciaService` centraliza las solicitudes HTTP a MockAPI, la carga de imágenes y el seguimiento con Capacitor Preferences. También existe `AlmacenamientoLocal`, un envoltorio genérico de Preferences que no se utiliza en el flujo principal. `src/app/home/` y los servicios `clima.ts`/`incidencia.ts` son archivos adicionales; las rutas activas apuntan a las páginas de `src/app/pages/` y el modelo activo es `models/incidencia.model.ts`.

## Servicios y APIs externas

### MockAPI

La URL base configurada en `src/app/services/incidencias.service.ts` es `https://6ae00c298e42963c8d5ec79b.mockapi.io/incidencias`. El servicio usa este recurso para las siguientes operaciones:

| Operación | Método y ruta relativa | Uso observado |
|---|---|---|
| Listar | `GET /incidencias` | Cargar el listado completo. Tiene timeout de 10 segundos; no hay paginación. |
| Consultar detalle | `GET /incidencias/{id}` | Obtener el reporte seleccionado. |
| Crear | `POST /incidencias` | Guardar un reporte. |
| Actualizar | `PUT /incidencias/{id}` | Está disponible en el servicio, pero no se invoca desde la interfaz. |

La URL base está escrita directamente en el servicio. No se encontró operación remota de eliminación.

### Cloudinary

La subida usa el endpoint de imagen `https://api.cloudinary.com/v1_1/{cloudName}/image/upload` con un upload preset. La respuesta `secure_url` se guarda como fotografía de la incidencia. El nombre de nube y el preset están escritos en el servicio; no se incluyen sus valores aquí.

### OpenWeather

`ClimaService` consulta `https://api.openweathermap.org/data/2.5/weather` con latitud, longitud, unidades métricas e idioma español. Mapea temperatura, descripción y lluvia de la hora anterior (cero si la respuesta no trae lluvia). No se encontró una llamada a este servicio desde las páginas.

### GPS y persistencia

`Ubicacion` usa `@capacitor/geolocation` para obtener latitud y longitud. `IncidenciaService` almacena el JSON de seguimiento en Capacitor Preferences bajo la clave `urbaninspect_seguimiento`. `AlmacenamientoLocal` expone métodos genéricos `guardar`, `obtener` y `eliminar`, pero no participa en el flujo actual.

## Modelo de datos

`src/app/models/incidencia.model.ts` define estos campos:

| Campo | Tipo / uso |
|---|---|
| `id` | `string` opcional, identificador remoto. |
| `codigo` | `string`, código de la incidencia. |
| `tipo` | `string` opcional, usado como categoría en el formulario. |
| `titulo` | `string` opcional en la interfaz; el formulario actual no lo envía con este nombre. |
| `descripcion` | `string`. |
| `direccion`, `sector`, `ubicacion`, `categoria` | `string` opcionales para ubicación y clasificación. |
| `fecha` | `string \| number`. |
| `estado` | Estado como cadena; el formulario crea reportes con `pendiente`. |
| `prioridad` | `baja`, `media` o `alta`; el formulario usa `media` por defecto. |
| `fotografia` | `string`, URL o cadena vacía si no hay foto. |
| `latitud`, `longitud` | `number \| null` opcionales. |
| `observacion` | `string` opcional. El formulario coloca aquí el título escrito por el usuario. |

## Requisitos previos

- Node.js compatible con Angular 22: `^22.22.3`, `^24.15.0` o `>=26.0.0`, según los metadatos de Angular instalados.
- npm 8 o superior; se recomienda utilizar la versión incluida con Node.js.
- Para Android: Android Studio, Android SDK 36 y JDK 17 o superior. El proyecto usa Android Gradle Plugin 8.13.0 y Gradle 8.14.3.
- No se requiere instalar Ionic CLI globalmente para los comandos de desarrollo descritos abajo; el proyecto ofrece `npm start`.

## Instalación y ejecución local

Desde la raíz del repositorio:

```bash
npm install
npm start
```

Abre la dirección local que Angular muestre en la terminal. El script `start` ejecuta `ng serve`. Para generar los archivos web:

```bash
npm run build
```

Angular escribe el bundle en `www`, que es el directorio configurado en `capacitor.config.ts`.

## Ejecución en Android

1. Instala JDK 17 o superior y Android Studio con Android SDK 36.
2. Instala las dependencias y genera el bundle web:

   ```bash
   npm install
   npm run build
   ```

3. Sincroniza los plugins y el bundle web con el proyecto nativo y abre Android Studio:

   ```bash
   npx cap sync android
   npx cap open android
   ```

4. Selecciona un emulador o dispositivo configurado en Android Studio y ejecuta la aplicación.

También se puede compilar desde PowerShell en la raíz del repositorio:

```powershell
npm run build
npx cap sync android
Set-Location android
.\gradlew.bat assembleDebug
```

La ruta de salida que configura Gradle para el APK debug es `android/app/build/outputs/apk/debug/app-debug.apk`. Para instalar desde la línea de comandos con un dispositivo conectado y depurado por USB, ejecuta `.gradlew.bat installDebug` desde `android/`. Estos comandos describen la configuración; no se afirma que se haya generado o instalado un APK.

El identificador Android configurado es `io.ionic.starter`; el nombre visible de la aplicación es `UrbanInspect`.

## Configuración de APIs y credenciales

No se encontraron variables de entorno ni claves en `src/environments/`; esos archivos solo declaran el indicador `production`. MockAPI, la configuración de Cloudinary y la clave de OpenWeather están definidas directamente en servicios fuente. **No publiques ni copies claves desde esos archivos al README.** Antes de publicar el repositorio, rota la clave de OpenWeather que ya está expuesta y mueve las credenciales a una configuración segura adecuada para el despliegue (preferiblemente un backend para secretos); el proyecto todavía no implementa ese mecanismo. El nombre de nube y el preset de subida también son configuración fija en el código.

Para que el registro funcione se requiere conectividad con MockAPI y Cloudinary; para la consulta meteorológica sería necesaria una clave válida de OpenWeather, pero esa función no está conectada a la interfaz. Las respuestas de servicios externos no se verificaron durante la elaboración de este documento.

## Flujo del usuario

1. La ruta raíz redirige a `/tabs/inicio`.
2. Desde Inicio se puede abrir el listado, el registro o el seguimiento mediante las pestañas inferiores.
3. Incidencias consulta `GET /incidencias`, permite filtrar por categoría y guardar reportes en seguimiento local.
4. Nuevo reporte valida los campos de texto, puede solicitar GPS y seleccionar una imagen. Intenta subirla y luego crea el reporte con `POST /incidencias`.
5. Seguimiento intenta consultar el servidor; al recibir la lista, guarda localmente cada registro. Si la petición falla, muestra lo recuperado de Preferences.
6. El enlace Detalle navega a `/detalle-incidencia/:id` y consulta el reporte remoto.

## Validaciones y errores

- El formulario exige título, descripción, categoría y ubicación.
- El archivo de imagen se valida por tipo de imagen y tamaño máximo de 10 MB; es opcional para registrar.
- La consulta del listado y la consulta/creación de reportes presentan mensajes de error o estado vacío; MockAPI para listado, detalle y creación tiene un timeout de 10 segundos según el servicio.
- La subida fallida de imagen muestra un aviso y permite continuar sin foto.
- Si falla la lectura remota en Seguimiento, intenta recuperar los registros de Preferences.
- No hay modo de creación offline, sincronización posterior, guardado de borradores ni actualización del estado desde el detalle.

## Pruebas y casos de verificación

El proyecto configura `npm test` mediante el builder de pruebas Angular/Vitest. Los archivos `*.spec.ts` encontrados contienen principalmente comprobaciones de creación de componentes o servicios; no se encontró cobertura automatizada de los flujos R1–R10. No se ejecutaron pruebas como parte de la redacción de este README.

Lista sugerida de verificación manual basada en la práctica:

| Caso | Comprobación esperada | Situación observada |
|---|---|---|
| Seguimiento tras reiniciar | Conservar solo códigos seleccionados y permitir desmarcarlos sin cambiar la API. | Persistencia existe; desmarcado en interfaz y separación estricta del listado remoto faltan. |
| Listado remoto | Mostrar campos, imagen, lista vacía y error de red. | La pantalla implementa estos estados. |
| Paginación | Cargar grupos pequeños y detenerse al final. | No implementada. |
| Clima real | Mostrar temperatura, lluvia y condición; alertar si supera 5 mm y continuar si falla. | Servicio presente; pantalla y regla de precipitación faltan. |
| Prioridad y fotografía | Aplicar reglas de prioridad y exigir imagen cuando corresponda. | Prioridad fija en media; imagen opcional. |
| GPS / bache | Solicitar GPS y aceptar coordenadas manuales válidas cuando no haya señal. | GPS presente; entrada y validación manual de coordenadas faltan. |
| Cancelar captura | Conservar el resto del formulario al cancelar la selección de imagen. | La selección vacía retorna sin limpiar los otros campos; validar en Android real. |
| Borrador | Al reabrir, ofrecer continuar o descartar un formulario incompleto. | No implementado. |
| Transiciones de estado | Aplicar transiciones permitidas, pedir observación al resolver y persistir en API. | No hay controles de actualización en la interfaz. |
| Android | Instalar y demostrar la app en dispositivo/emulador. | Proyecto nativo presente; evidencia de APK o demostración no encontrada. |

## Capturas de pantalla y evidencias

No se encontraron capturas de pantallas o videos demostrativos en el repositorio. Los recursos PNG existentes son iconos o splash screens de Android, no evidencias de las pantallas. Añadir cuando estén disponibles, por ejemplo:

- `docs/evidencias/inicio.png`
- `docs/evidencias/incidencias.png`
- `docs/evidencias/registro.png`
- `docs/evidencias/seguimiento.png`
- `docs/evidencias/detalle.png`
- `docs/evidencias/android-emulador.png`

## Compilación APK

Para generar un APK debug, consulta los pasos de [Ejecución en Android](#ejecución-en-android). Con la configuración Gradle presente, el artefacto esperado es `android/app/build/outputs/apk/debug/app-debug.apk`. La existencia de esa ruta depende de que la compilación haya terminado correctamente; no hay un APK versionado en el repositorio.

## Limitaciones conocidas y trabajo pendiente

- R1: seguimiento local mezcla los registros que la pantalla recibe del servidor y no ofrece quitar un seguimiento desde la interfaz.
- R3: no hay paginación remota implementada.
- R4: clima no está conectado a una pantalla y falta la advertencia por lluvia.
- R5–R7: faltan selección de prioridad, reglas de foto obligatoria y coordenadas manuales validadas; el título del formulario se serializa como observación.
- R8: no hay recuperación de borradores.
- R9: la actualización de estado existe únicamente como método de servicio, sin flujo de usuario.
- R10: existe proyecto Android, pero no se encontró evidencia de instalación o demostración.
- La clave meteorológica está escrita en el servicio y expuesta en el repositorio; debe rotarse antes de publicar.
- El identificador de Android conserva el valor genérico `io.ionic.starter`.

## Decisiones técnicas

- **Ionic Angular** aporta componentes de interfaz adaptados a móvil y navegación por rutas.
- **Angular standalone** permite cargar las páginas como componentes lazy sin un módulo de aplicación tradicional.
- **Capacitor** integra el frontend web con Android y permite usar Geolocation y Preferences.
- **MockAPI** sirve como backend remoto de práctica para consultar, crear y actualizar incidencias.
- **Cloudinary** aloja imágenes y entrega una URL que se almacena en el reporte.
- **Preferences** guarda los seguimientos en el almacenamiento del dispositivo.
- **OpenWeather** está integrado en un servicio aislado para consultar condiciones por coordenadas, aunque falta conectarlo al flujo visible.

## Autoría y contexto académico

- **Estudiante:** [Completar]
- **Asignatura:** Desarrollo de Aplicaciones Móviles
- **Institución:** ESFOT — Escuela Politécnica Nacional
- **Fecha:** [Completar]
