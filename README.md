# UrbanInspect

Aplicación móvil académica de la práctica **UrbanInspect: Inspección de infraestructura urbana**, de la asignatura Desarrollo de Aplicaciones Móviles de la ESFOT — Escuela Politécnica Nacional. La práctica aborda el registro, consulta y seguimiento de incidencias de infraestructura urbana desde Android.

**Estudiante:** [Completar]  
**Fecha:** [Completar]  
**Paralelo:** [Completar]  
**Repositorio GitHub:** [Agregar enlace]

## Tecnologías y dependencias

Versiones resueltas en `package-lock.json`:

| Paquete | Versión |
|---|---:|
| Angular | 22.2.3 |
| Ionic Angular | 9.0.9 |
| TypeScript | 6.0.3 |
| Capacitor Core / Android | 8.5.3 |
| Capacitor Geolocation | 8.2.4 |
| Capacitor Preferences | 8.0.1 |
| Capacitor Camera | 8.2.6 |
| RxJS | 7.8.2 |
| Ionicons | 8.1.0 |
| Gradle Wrapper | 8.14.3 |
| Android Gradle Plugin | 8.13.0 |

El proyecto también declara Capacitor App, Filesystem, Haptics, Keyboard, Splash Screen y Status Bar, además de Angular CLI/build, Ionic Angular Toolkit, ESLint y Vitest para desarrollo. Capacitor Camera está instalado, aunque el formulario actual selecciona imágenes mediante un campo de archivo del navegador.

## Requisitos para ejecutar

- Node.js compatible con Angular 22: `^22.22.3`, `^24.15.0` o `>=26.0.0`.
- npm 8 o superior.
- Para Android: Android Studio, Android SDK 36 y JDK 17 o superior.

## Instalación y ejecución web

Desde la raíz del repositorio:

```bash
npm install
npm start
```

`npm start` ejecuta `ng serve`. Para generar el bundle web en `www`:

```bash
npm run build
```

## Ejecución y APK Android

Después de instalar las dependencias y generar el bundle web:

```bash
npx cap sync android
npx cap open android
```

En Android Studio, selecciona un dispositivo o emulador y ejecuta la aplicación. También se puede compilar el APK debug desde PowerShell:

```powershell
npm run build
npx cap sync android
Set-Location android
.\gradlew.bat assembleDebug
```

El APK debug se genera en `android/app/build/outputs/apk/debug/app-debug.apk`. Para instalarlo con un dispositivo conectado, ejecuta `.gradlew.bat installDebug` desde la carpeta `android`. El identificador Android configurado es `io.ionic.starter` y el nombre de la aplicación es `UrbanInspect`.

La práctica requiere demostrar la aplicación instalada en un teléfono Android o emulador. Este README no certifica que se haya compilado ni instalado un APK.

## Servicios externos y credenciales

- **MockAPI:** servicio REST simulado para el recurso de incidencias. La aplicación consulta `GET /incidencias`, consulta el detalle mediante `GET /incidencias/{id}`, crea con `POST /incidencias` y dispone de un método `PUT /incidencias/{id}`.
- **OpenWeather:** `ClimaService` consulta el endpoint `/data/2.5/weather` con coordenadas, unidades métricas e idioma español. La pantalla todavía no consume este servicio.
- **Cloudinary:** el formulario intenta subir fotografías al endpoint `/v1_1/{cloudName}/image/upload` y guarda la URL devuelta.

No se incluyen claves ni contraseñas en este archivo. La configuración de los servicios está actualmente escrita en archivos fuente; no se encontró configuración mediante variables de entorno. Antes de publicar el repositorio, rota la clave meteorológica que está expuesta en el código y evita versionar credenciales reales.

## Decisiones técnicas

- **Ionic y Angular standalone** organizan la interfaz móvil en páginas independientes y cargadas mediante rutas.
- **Capacitor** permite compilar la aplicación web para Android y acceder a Geolocation y Preferences.
- **MockAPI** simula el servicio REST de incidencias solicitado por la práctica.
- **Cloudinary** proporciona URLs accesibles para las fotografías, en lugar de enviar rutas temporales del dispositivo a la API.
- **Preferences** persiste datos locales de seguimiento entre ejecuciones de la aplicación.

## Referencia académica

Prueba I — Práctica UrbanInspect, asignatura Desarrollo de Aplicaciones Móviles, ESFOT — Escuela Politécnica Nacional.
Emilia Tana 
Apps móviles GR-1
