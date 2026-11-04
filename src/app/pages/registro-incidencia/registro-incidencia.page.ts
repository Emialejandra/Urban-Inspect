import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlmacenamientoLocal } from '../../services/almacenamiento-local';

import { addIcons } from 'ionicons';

import {
  partlySunnyOutline, locationOutline, navigateOutline, checkmarkCircleOutline, sunny, cloudDownloadOutline, informationCircleOutline, thermometerOutline, cloudOutline, rainyOutline, warningOutline } from 'ionicons/icons';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  AlertController
} from '@ionic/angular';

import { firstValueFrom } from 'rxjs';

import {
  Incidencia,
  PrioridadIncidencia
} from '../../models/incidencia.model';

import { ClimaService } from '../../services/clima.service';
import { IncidenciaService } from '../../services/incidencias.service';
import { Ubicacion } from '../../services/ubicacion';

@Component({
  selector: 'app-registro-incidencia',
  templateUrl: './registro-incidencia.page.html',
  styleUrls: ['./registro-incidencia.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTextarea,
    IonTitle,
    IonToolbar
  ]
})

export class RegistroIncidenciaPage implements OnInit, OnDestroy {

  titulo = '';
  descripcion = '';
  categoria = '';
  ubicacion = '';
  prioridad: PrioridadIncidencia = 'media';

  archivo: File | null = null;
  vistaPrevia: string | null = null;

  coordenadas: {
    latitud: number;
    longitud: number;
  } | null = null;

  // Coordenadas ingresadas manualmente
  latitudManual = '';
  longitudManual = '';

  guardando = false;

  private registrarIconos(): void {
    addIcons({
      'partly-sunny-outline': partlySunnyOutline,

    });
  }

  private readonly claveBorrador = 'urbaninspect_borrador';
  private cargandoBorrador = false;
  private temporizadorBorrador:
    ReturnType<typeof setTimeout> | undefined;

  // Información meteorológica
  clima: {
    temperatura: number;
    descripcion: string;
    precipitacion: number;
  } | null = null;

  consultandoClima = false;
  climaConsultado = false;
  obteniendoUbicacion = false;

  constructor(
    private incidenciaService: IncidenciaService,
    private ubicacionService: Ubicacion,
    private alertController: AlertController,
    private router: Router,
    private climaService: ClimaService,
    private almacenamiento: AlmacenamientoLocal
  ) {
      addIcons({locationOutline,navigateOutline,checkmarkCircleOutline,partlySunnyOutline,cloudDownloadOutline,informationCircleOutline,thermometerOutline,cloudOutline,rainyOutline,warningOutline,sunny}); }

  // Seleccionar fotografía
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      void this.mostrarAlerta(
        'Archivo inválido',
        'Selecciona una fotografía válida.'
      );
      input.value = '';
      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {
      void this.mostrarAlerta(
        'Imagen demasiado grande',
        'Selecciona una fotografía de máximo 10 MB.'
      );
      input.value = '';
      return;
    }

    if (this.vistaPrevia) {
      URL.revokeObjectURL(this.vistaPrevia);
    }

    this.archivo = archivo;
    this.vistaPrevia = URL.createObjectURL(archivo);
  }

  // Obtener ubicación mediante GPS
  async usarMiUbicacion(): Promise<void> {

    if (this.obteniendoUbicacion) {
      return;
    }

    this.obteniendoUbicacion = true;

    try {
      this.coordenadas =
        await this.ubicacionService.obtenerCoordenadas();

      this.latitudManual =
        this.coordenadas.latitud.toString();

      this.longitudManual =
        this.coordenadas.longitud.toString();

      if (!this.ubicacion.trim()) {
        this.ubicacion =
          `${this.coordenadas.latitud.toFixed(5)}, ` +
          `${this.coordenadas.longitud.toFixed(5)}`;
      }

      this.clima = null;
      this.climaConsultado = false;

    } catch (error) {

      console.error('Error al obtener la ubicación:', error);

      this.coordenadas = null;
      this.latitudManual = '';
      this.longitudManual = '';
      this.clima = null;
      this.climaConsultado = false;

      await this.mostrarAlerta(
        'Ubicación no disponible',
        'No se pudo obtener tu ubicación. Comprueba los permisos del GPS. También puedes ingresar las coordenadas manualmente.'
      );

    } finally {
      this.obteniendoUbicacion = false;
    }

    this.guardarBorradorAutomatico();
  }

  // Validar coordenadas manuales
  actualizarCoordenadasManuales(): void {

    const latitud = Number(this.latitudManual);
    const longitud = Number(this.longitudManual);

    if (
      this.latitudManual.trim() === '' ||
      this.longitudManual.trim() === '' ||
      !Number.isFinite(latitud) ||
      !Number.isFinite(longitud) ||
      latitud < -90 ||
      latitud > 90 ||
      longitud < -180 ||
      longitud > 180
    ) {
      this.coordenadas = null;
    } else {
      this.coordenadas = {
        latitud,
        longitud
      };
    }

    this.clima = null;
    this.climaConsultado = false;

    this.guardarBorradorAutomatico();
  }

  // Consultar clima independientemente del GPS
  async consultarClima(): Promise<void> {

    if (!this.coordenadas) {

      this.clima = null;
      this.climaConsultado = false;

      await this.mostrarAlerta(
        'Coordenadas necesarias',
        'Obtén tu ubicación con GPS o ingresa una latitud y longitud válidas antes de consultar el clima.'
      );

      return;
    }

    this.consultandoClima = true;
    this.climaConsultado = false;
    this.clima = null;

    try {

      const resultado = await firstValueFrom(
        this.climaService.obtenerClima(
          this.coordenadas.latitud,
          this.coordenadas.longitud
        )
      );

      if (
        resultado &&
        Number.isFinite(resultado.temperatura) &&
        Number.isFinite(resultado.precipitacion) &&
        typeof resultado.descripcion === 'string'
      ) {
        this.clima = resultado;
      }

    } catch (error) {

      console.error('Error al consultar el clima:', error);

      this.clima = null;

    } finally {

      this.consultandoClima = false;
      this.climaConsultado = true;
    }
  }

  // Registrar incidencia
  async registrarIncidencia(): Promise<void> {

    if (this.guardando) {
      return;
    }

    if (
      !this.titulo.trim() ||
      !this.descripcion.trim() ||
      !this.categoria ||
      !this.ubicacion.trim()
    ) {
      await this.mostrarAlerta(
        'Campos obligatorios',
        'Completa el título, la descripción, la categoría y la ubicación.'
      );
      return;
    }

    // Validar coordenadas manuales antes de guardar
    if (
      this.latitudManual.trim() ||
      this.longitudManual.trim()
    ) {

      const latitud = Number(this.latitudManual);
      const longitud = Number(this.longitudManual);

      if (
        this.latitudManual.trim() === '' ||
        this.longitudManual.trim() === '' ||
        !Number.isFinite(latitud) ||
        !Number.isFinite(longitud) ||
        latitud < -90 ||
        latitud > 90 ||
        longitud < -180 ||
        longitud > 180
      ) {

        await this.mostrarAlerta(
          'Coordenadas inválidas',
          'Ingresa una latitud entre -90 y 90 y una longitud entre -180 y 180. También puedes dejar ambos campos vacíos.'
        );

        return;
      }

      this.coordenadas = {
        latitud,
        longitud
      };
    }

    // El clima es opcional y no bloquea el registro
    this.guardando = true;

    try {

      let urlFotografia = '';

      // Subir fotografía a Cloudinary
      if (this.archivo) {

        try {

          urlFotografia =
            await this.incidenciaService.subirFotografia(
              this.archivo
            );

        } catch (error) {

          console.error('Error al subir la fotografía:', error);

          await this.mostrarAlerta(
            'Aviso',
            'No se pudo subir la fotografía. Se intentará guardar la incidencia sin ella.'
          );
        }
      }

      const incidencia: Incidencia = {

        codigo: `INC-${Date.now().toString().slice(-8)}`,

        tipo: this.categoria,

        descripcion: this.descripcion.trim(),

        direccion: this.ubicacion.trim(),

        sector: this.ubicacion.trim(),

        fecha: new Date().toISOString(),

        estado: 'pendiente',

        prioridad: this.prioridad,

        fotografia: urlFotografia,

        latitud: this.coordenadas?.latitud ?? null,

        longitud: this.coordenadas?.longitud ?? null,

        observacion: this.titulo.trim()
      };

      // Guardar incidencia en MockAPI
      const guardada = await firstValueFrom(
        this.incidenciaService.crearIncidencia(incidencia)
      );

      if (!guardada) {
        throw new Error(
          'La API no devolvió la incidencia guardada.'
        );
      }

      // Guardar en seguimiento local
      await this.incidenciaService.guardarSeguimientoLocal(
        guardada
      );

      // Eliminar borrador después de guardar correctamente
      await this.almacenamiento.eliminar(
        this.claveBorrador
      );

      await this.mostrarAlerta(
        'Incidencia registrada',
        'La incidencia se guardó correctamente.'
      );

      this.limpiarFormulario();

      await this.router.navigate([
        '/tabs/seguimiento'
      ]);

    } catch (error: any) {

      console.error(
        'Error al registrar la incidencia:',
        error
      );

      await this.mostrarAlerta(
        'Error al registrar',
        error?.error?.message ||
        error?.message ||
        'No se pudo guardar la incidencia. Comprueba la conexión con MockAPI.'
      );

    } finally {

      this.guardando = false;
    }
  }

  // Limpiar formulario después de registrar
  private limpiarFormulario(): void {

    if (this.vistaPrevia) {
      URL.revokeObjectURL(this.vistaPrevia);
    }

    this.titulo = '';
    this.descripcion = '';
    this.categoria = '';
    this.ubicacion = '';
    this.prioridad = 'media';

    this.archivo = null;
    this.vistaPrevia = null;

    this.coordenadas = null;
    this.latitudManual = '';
    this.longitudManual = '';

    this.clima = null;
    this.consultandoClima = false;
    this.climaConsultado = false;
    this.obteniendoUbicacion = false;
  }

  // Mostrar alertas
  private async mostrarAlerta(
    encabezado: string,
    mensaje: string
  ): Promise<void> {

    const alerta = await this.alertController.create({
      header: encabezado,
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alerta.present();
  }

  // Recuperar borrador
  async ngOnInit(): Promise<void> {

    this.cargandoBorrador = true;

    try {

      const borrador = await this.almacenamiento.obtener<{
        titulo: string;
        descripcion: string;
        categoria: string;
        ubicacion: string;
        prioridad: PrioridadIncidencia;

        coordenadas: {
          latitud: number;
          longitud: number;
        } | null;

        latitudManual?: string;
        longitudManual?: string;

      } | null>(
        this.claveBorrador,
        null
      );

      if (borrador) {

        this.titulo = borrador.titulo ?? '';
        this.descripcion = borrador.descripcion ?? '';
        this.categoria = borrador.categoria ?? '';
        this.ubicacion = borrador.ubicacion ?? '';
        this.prioridad = borrador.prioridad ?? 'media';

        this.coordenadas = borrador.coordenadas ?? null;

        this.latitudManual =
          borrador.latitudManual ??
          (this.coordenadas
            ? String(this.coordenadas.latitud)
            : '');

        this.longitudManual =
          borrador.longitudManual ??
          (this.coordenadas
            ? String(this.coordenadas.longitud)
            : '');
      }

    } catch (error) {

      console.error(
        'Error al recuperar el borrador:',
        error
      );

    } finally {

      this.cargandoBorrador = false;
    }
  }

  // Guardar datos al salir del formulario
  ngOnDestroy(): void {

    if (this.temporizadorBorrador) {
      clearTimeout(this.temporizadorBorrador);
    }

    if (this.tieneDatosFormulario()) {
      void this.guardarBorrador();
    }
  }

  // Guardado automático con pequeño retraso
  guardarBorradorAutomatico(): void {

    if (this.cargandoBorrador || this.guardando) {
      return;
    }

    if (this.temporizadorBorrador) {
      clearTimeout(this.temporizadorBorrador);
    }

    this.temporizadorBorrador = setTimeout(() => {
      void this.guardarBorrador();
    }, 400);
  }

  private tieneDatosFormulario(): boolean {

    return !!(
      this.titulo.trim() ||
      this.descripcion.trim() ||
      this.categoria ||
      this.ubicacion.trim() ||
      this.coordenadas ||
      this.latitudManual.trim() ||
      this.longitudManual.trim()
    );
  }

  // Persistir borrador local
  private async guardarBorrador(): Promise<void> {

    if (this.cargandoBorrador || this.guardando) {
      return;
    }

    if (!this.tieneDatosFormulario()) {

      await this.almacenamiento.eliminar(
        this.claveBorrador
      );

      return;
    }

    await this.almacenamiento.guardar(
      this.claveBorrador,
      {
        titulo: this.titulo,
        descripcion: this.descripcion,
        categoria: this.categoria,
        ubicacion: this.ubicacion,
        prioridad: this.prioridad,
        coordenadas: this.coordenadas,
        latitudManual: this.latitudManual,
        longitudManual: this.longitudManual
      }
    );
  }

}
