
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
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
  IonToolbar
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
export class RegistroIncidenciaPage {
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

  guardando = false;

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
    private climaService: ClimaService
  ) {}

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

  async usarMiUbicacion(): Promise<void> {
    if (this.obteniendoUbicacion) {
      return;
    }

    this.obteniendoUbicacion = true;

    try {
      this.coordenadas =
        await this.ubicacionService.obtenerCoordenadas();

      if (!this.ubicacion.trim()) {
        this.ubicacion =
          `${this.coordenadas.latitud.toFixed(5)}, ` +
          `${this.coordenadas.longitud.toFixed(5)}`;
      }

      await this.consultarClima();
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);

      this.coordenadas = null;
      this.clima = null;
      this.climaConsultado = false;

      await this.mostrarAlerta(
        'Ubicación no disponible',
        'No se pudo obtener tu ubicación. Comprueba los permisos del GPS. Puedes continuar con el registro si tienes una dirección válida.'
      );
    } finally {
      this.obteniendoUbicacion = false;
    }
  }

  async consultarClima(): Promise<void> {
    if (!this.coordenadas) {
      this.clima = null;
      this.climaConsultado = false;
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

    // Consultar el clima si hay coordenadas y todavía no se ha intentado.
    if (this.coordenadas && !this.climaConsultado) {
      await this.consultarClima();
    }

    // El clima no bloquea el registro si falla o no hay GPS.
    if (!this.clima) {
      await this.mostrarAlerta(
        'Información meteorológica',
        'No se dispone de información meteorológica válida. La incidencia podrá registrarse igualmente.'
      );
    }

    this.guardando = true;

    try {
      let urlFotografia = '';

      if (this.archivo) {
        try {
          urlFotografia =
            await this.incidenciaService.subirFotografia(this.archivo);
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

      // Guardar en MockAPI.
      const guardada = await firstValueFrom(
        this.incidenciaService.crearIncidencia(incidencia)
      );

      if (!guardada) {
        throw new Error('La API no devolvió la incidencia guardada.');
      }

      // Guardar también en el seguimiento local.
      await this.incidenciaService.guardarSeguimientoLocal(guardada);

      await this.mostrarAlerta(
        'Incidencia registrada',
        'La incidencia se guardó correctamente.'
      );

      this.limpiarFormulario();

      await this.router.navigate(['/tabs/seguimiento']);
    } catch (error: any) {
      console.error('Error al registrar la incidencia:', error);

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

    this.clima = null;
    this.consultandoClima = false;
    this.climaConsultado = false;
    this.obteniendoUbicacion = false;
  }

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
}
