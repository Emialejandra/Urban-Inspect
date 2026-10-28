
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class DetalleIncidenciaPage implements OnInit {
  incidencia: Incidencia | null = null;
  cargando = false;
  cambiandoEstado = false;

  estadoSeleccionado = '';

  constructor(
    private route: ActivatedRoute,
    private service: IncidenciaService,
    private alertController: AlertController
  ) { }


  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      await this.mostrarError('No se especificó la incidencia.');
      return;
    }

    this.cargando = true;

    try {
      // 1. Mostrar primero los datos guardados localmente.
      const locales = await this.service.obtenerSeguimientoLocal();

      const local = locales.find(item =>
        String(item.id) === String(id) ||
        String(item.codigo) === String(id)
      );

      if (local) {
        this.incidencia = local;
        this.cargando = false;
      }

      // 2. Consultar la API para obtener los datos más recientes.
      try {
        const actualizada = await firstValueFrom(
          this.service.obtenerIncidenciaPorId(id)
        );

        this.incidencia = actualizada;
        await this.service.guardarSeguimientoLocal(actualizada);
      } catch (error) {
        console.error('No se pudo actualizar desde MockAPI:', error);

        // Si hay datos locales, mantenemos visible el detalle.
        if (!this.incidencia) {
          await this.mostrarError(
            'No se pudo cargar la incidencia. Comprueba tu conexión e inténtalo nuevamente.'
          );
        }
      }
    } catch (error) {
      console.error('Error al cargar la incidencia:', error);

      if (!this.incidencia) {
        await this.mostrarError('No se pudo cargar el detalle.');
      }
    } finally {
      this.cargando = false;
    }
  }


  async cambiarEstado(nuevoEstado: string): Promise<void> {
    if (!this.incidencia || this.cambiandoEstado) {
      return;
    }

    const estadoAnterior = this.incidencia.estado || 'pendiente';

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
          { estado: nuevoEstado }
        )
      );

      this.incidencia = {
        ...this.incidencia,
        ...actualizada,
        estado: nuevoEstado
      };

      this.estadoSeleccionado = nuevoEstado;

      await this.service.guardarSeguimientoLocal(
        this.incidencia
      );

      await this.mostrarMensaje(
        'El estado de la incidencia se actualizó correctamente.'
      );

    } catch (error) {
      this.estadoSeleccionado = estadoAnterior;

      await this.mostrarError(
        'No se pudo actualizar el estado. Comprueba tu conexión e inténtalo nuevamente.'
      );
    } finally {
      this.cambiandoEstado = false;
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
