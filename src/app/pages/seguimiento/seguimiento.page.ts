
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonContent, IonHeader, IonIcon, IonRefresher, IonRefresherContent, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import {
  Incidencia,
  IncidenciaService
} from '../../services/incidencias.service';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle,
    IonCardTitle, IonChip, IonContent, IonHeader, IonIcon,
    IonRefresher, IonRefresherContent, IonSpinner, IonTitle, IonToolbar
  ]
})
export class SeguimientoPage implements OnInit {
  incidencias: Incidencia[] = [];
  cargando = false;

  constructor(
    private service: IncidenciaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.cargarIncidencias();
  }

  async cargarIncidencias(): Promise<void> {
    this.cargando = true;

    try {
      this.incidencias = await this.service.obtenerSeguimientoLocal();
    } finally {
      this.cargando = false;
    }
  }

  async actualizar(event: CustomEvent): Promise<void> {
    await this.cargarIncidencias();
    (event.target as HTMLIonRefresherElement).complete();
  }

  verDetalle(incidencia: Incidencia): void {
    if (!incidencia.id) {
      return;
    }

    this.router.navigate(['/detalle-incidencia', incidencia.id]);
  }

  estadoColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'resuelta':
      case 'resuelto':
        return 'success';
      case 'en proceso':
        return 'warning';
      default:
        return 'medium';
    }
  }
}
