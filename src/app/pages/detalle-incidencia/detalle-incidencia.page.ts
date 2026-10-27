
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AlertController
} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IncidenciaService
} from '../../services/incidencias.service';
import { IonBackButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-detalle-incidencia',
  templateUrl: './detalle-incidencia.page.html',
  styleUrls: ['./detalle-incidencia.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonBackButton, IonButtons, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonChip, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar
  ]
})

export class DetalleIncidenciaPage implements OnInit {
  incidencia: Incidencia | null = null;
  cargando = false;

  constructor(
    private route: ActivatedRoute,
    private service: IncidenciaService,
    private alertController: AlertController
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      await this.mostrarError('No se especificó la incidencia.');
      return;
    }

    this.cargando = true;

    try {
      this.incidencia = await firstValueFrom(
        this.service.obtenerIncidenciaPorId(id)
      );
    } catch {
      await this.mostrarError('No se encontró la incidencia solicitada.');
    } finally {
      this.cargando = false;
    }
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
