
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController} from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { IonButton, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular';
import {
  Incidencia,
  IncidenciaService
} from '../../services/incidencias.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ubicacion } from '../../services/ubicacion';
@Component({
  selector: 'app-registro-incidencia',
  templateUrl: './registro-incidencia.page.html',
  styleUrls: ['./registro-incidencia.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonSelect,
    IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar
  ]
})
export class RegistroIncidenciaPage {
  titulo = '';
  descripcion = '';
  categoria = '';
  ubicacion = '';

  archivo: File | null = null;
  vistaPrevia: string | null = null;
  coordenadas: { latitud: number; longitud: number } | null = null;

  guardando = false;

  constructor(
    private incidenciaService: IncidenciaService,
    private ubicacionService: Ubicacion,
    private alertController: AlertController,
    private router: Router
  ) { }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.mostrarAlerta('Archivo inválido', 'Selecciona una fotografía.');
      input.value = '';
      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {
      this.mostrarAlerta(
        'Imagen demasiado grande',
        'Selecciona una fotografía de máximo 10 MB.'
      );
      input.value = '';
      return;
    }

    this.archivo = archivo;
    this.vistaPrevia = URL.createObjectURL(archivo);
  }

  async usarMiUbicacion(): Promise<void> {
    try {
      this.coordenadas = await this.ubicacionService.obtenerCoordenadas();
      if (!this.ubicacion.trim()) {
        this.ubicacion = `${this.coordenadas.latitud.toFixed(5)}, ${this.coordenadas.longitud.toFixed(5)}`;
      }
    } catch {
      await this.mostrarAlerta(
        'Ubicación no disponible',
        'Activa el GPS y permite el acceso a la ubicación para volver a intentarlo.'
      );
    }
  }

  async registrarIncidencia(): Promise<void> {
    if (
      !this.titulo.trim() ||
      !this.descripcion.trim() ||
      !this.categoria ||
      !this.ubicacion.trim()
    ) {
      await this.mostrarAlerta(
        'Campos obligatorios',
        'Completa todos los campos del formulario.'
      );
      return;
    }

    if (!this.archivo) {
      await this.mostrarAlerta(
        'Fotografía requerida',
        'Selecciona una fotografía de la incidencia.'
      );
      return;
    }

    this.guardando = true;

    try {
      // 1. Subir la fotografía a Cloudinary.
      const urlFotografia =
        await this.incidenciaService.subirFotografia(this.archivo);

      // 2. Preparar los datos de la incidencia.
      const incidencia: Incidencia = {
        codigo: 'INC-' + Date.now().toString().slice(-8),
        tipo: this.categoria,
        titulo: this.titulo.trim(),
        descripcion: this.descripcion.trim(),
        categoria: this.categoria,
        direccion: this.ubicacion.trim(),
        ubicacion: this.ubicacion.trim(),
        sector: this.ubicacion.trim(),
        fotografia: urlFotografia,
        estado: 'Pendiente',
        fecha: new Date().toISOString(),
        prioridad: 'media',
        latitud: this.coordenadas?.latitud ?? null,
        longitud: this.coordenadas?.longitud ?? null
      };

      // 3. Guardar los datos en MockAPI.
      const guardada = await firstValueFrom(
        this.incidenciaService.crearIncidencia(incidencia)
      );

      // 4. Añadirla al seguimiento local.
      await this.incidenciaService.guardarSeguimientoLocal(guardada);

      await this.mostrarAlerta(
        'Incidencia registrada',
        'La fotografía se subió y la incidencia se guardó correctamente.'
      );

      this.limpiarFormulario();

      // Navegar al seguimiento.
      await this.router.navigate(['/seguimiento']);

    } catch (error: any) {
      const mensaje =
        error?.error?.error?.message ||
        error?.error?.message ||
        error?.message ||
        'No se pudo registrar la incidencia.';

      await this.mostrarAlerta('Error al registrar', mensaje);
    } finally {
      this.guardando = false;
    }
  }

  private limpiarFormulario(): void {
    this.titulo = '';
    this.descripcion = '';
    this.categoria = '';
    this.ubicacion = '';
    this.archivo = null;
    this.vistaPrevia = null;
    this.coordenadas = null;
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
