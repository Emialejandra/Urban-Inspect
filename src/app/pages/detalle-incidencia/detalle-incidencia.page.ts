
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AlertController,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonSpinner,
  IonTitle,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonButton
} from '@ionic/angular';

import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { IncidenciaService } from '../../services/incidencias.service';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-detalle-incidencia',
  templateUrl: './detalle-incidencia.page.html',
  styleUrls: ['./detalle-incidencia.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonContent,
    IonHeader,
    IonSpinner,
    IonTitle,
    IonToolbar,
    IonSelect,
    IonSelectOption,
    IonButton
  ]
})
export class DetalleIncidenciaPage {

  incidencia: Incidencia | null = null;

  cargando = false;
  cambiandoEstado = false;
  estadoSeleccionado = '';

  constructor(
    private route: ActivatedRoute,
    private service: IncidenciaService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) { }

  // Se ejecuta cada vez que se entra a la pantalla.
  ionViewWillEnter(): void {
    void this.cargarDetalle();
  }

  // Consultar una incidencia específica en MockAPI.
  async cargarDetalle(): Promise<void> {

    const id = this.route.snapshot.paramMap.get('id');

    console.log('ID recibido para consultar detalle:', id);

    if (!id) {
      this.incidencia = null;
      this.cargando = false;

      await this.mostrarError(
        'No se recibió el identificador de la incidencia.'
      );

      return;
    }

    this.cargando = true;
    this.incidencia = null;
    this.cdr.detectChanges();

    try {

      console.log('Consultando incidencia en MockAPI...');

      const actualizada = await firstValueFrom(
        this.service.obtenerIncidenciaPorId(id)
      );

      console.log('Respuesta de MockAPI:', actualizada);

      if (!actualizada || !actualizada.id) {
        throw new Error(
          'La API no devolvió una incidencia válida.'
        );
      }

      // Mostrar los datos recibidos.
      this.incidencia = actualizada;

      this.estadoSeleccionado =
        actualizada.estado || 'pendiente';

      console.log('Incidencia cargada correctamente:', this.incidencia);

      // IMPORTANTE:
      // No guardar automáticamente en seguimiento local.
      // Consultar un detalle no significa que el usuario
      // quiera agregar esa incidencia a Seguimiento.

    } catch (error) {

      console.error('Error al consultar el detalle:', error);

      // Intentar recuperar la incidencia desde el almacenamiento local.
      try {

        const locales =
          await this.service.obtenerSeguimientoLocal();

        const local = locales.find(item =>
          String(item.id) === String(id) ||
          String(item.codigo) === String(id)
        );

        if (local) {

          console.log('Incidencia recuperada desde almacenamiento local.');

          this.incidencia = local;

          this.estadoSeleccionado =
            local.estado || 'pendiente';

        } else {

          await this.mostrarError(
            'No se pudo cargar la incidencia desde el servidor. Comprueba tu conexión.'
          );

        }

      } catch (errorLocal) {

        console.error(
          'Error al consultar el almacenamiento local:',
          errorLocal
        );

        await this.mostrarError(
          'No se pudo recuperar la información de la incidencia.'
        );

      }

    } finally {

      this.cargando = false;
      this.cdr.detectChanges();

      console.log('Carga de detalle finalizada.');

    }
  }

  // Actualizar el estado de la incidencia.
  async cambiarEstado(nuevoEstado: string): Promise<void> {

    if (!this.incidencia || this.cambiandoEstado) {
      return;
    }

    const estadoAnterior =
      this.incidencia.estado || 'pendiente';

    if (nuevoEstado === estadoAnterior) {
      return;
    }

    const id = this.incidencia.id;

    if (id == null) {

      this.estadoSeleccionado = estadoAnterior;

      await this.mostrarError(
        'La incidencia no tiene un identificador válido.'
      );

      return;
    }

    this.cambiandoEstado = true;

    try {

      const actualizada = await firstValueFrom(
        this.service.actualizarIncidencia(
          String(id),
          { estado: nuevoEstado as Incidencia['estado'] }
        )
      );

      this.incidencia = {
        ...this.incidencia,
        ...actualizada,
        estado: nuevoEstado as Incidencia['estado']
      };

      this.estadoSeleccionado = nuevoEstado;

      // Actualizar únicamente si ya estaba guardada en seguimiento.
      const locales =
        await this.service.obtenerSeguimientoLocal();

      const estabaEnSeguimiento = locales.some(item =>
        String(item.id) === String(id) ||
        (
          this.incidencia?.codigo != null &&
          item.codigo === this.incidencia.codigo
        )
      );

      if (estabaEnSeguimiento) {
        await this.service.guardarSeguimientoLocal(
          this.incidencia
        );
      }

      await this.mostrarMensaje(
        'El estado de la incidencia se actualizó correctamente.'
      );

    } catch (error) {

      console.error('Error al actualizar el estado:', error);

      this.estadoSeleccionado = estadoAnterior;

      await this.mostrarError(
        'No se pudo actualizar el estado. Comprueba tu conexión e inténtalo nuevamente.'
      );

    } finally {

      this.cambiandoEstado = false;
      this.cdr.detectChanges();

    }
  }

  private async mostrarMensaje(mensaje: string): Promise<void> {

    const alerta = await this.alertController.create({
      header: 'Urban-Inspect',
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alerta.present();
  }

  private async mostrarError(mensaje: string): Promise<void> {

    const alerta = await this.alertController.create({
      header: 'Detalle de incidencia',
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alerta.present();
  }
}
