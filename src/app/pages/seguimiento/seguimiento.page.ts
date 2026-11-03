
import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar, 
} from '@ionic/angular';

import { Incidencia } from '../../models/incidencia.model';
import { IncidenciaService } from '../../services/incidencias.service';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonTitle,
    IonToolbar
  ]
})
export class SeguimientoPage{

  private service = inject(IncidenciaService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  incidencias: Incidencia[] = [];
  cargando = false;

  ionViewWillEnter(): void {
    void this.cargarIncidencias();
  }

  //consultar incidencias guardadas localemnete 
  async cargarIncidencias(): Promise<void> {

    this.cargando =true;

    try {

      console.log('Cargando incidencias en seguimiento local...');

      this.incidencias =
        await this.service.obtenerSeguimientoLocal();

        console.log('Incidencias en seguimiento:', this.incidencias);

        console.log(
          'Total de incidencias:', this.incidencias.length
        );
    } catch (error) {

      console.error(
        'Error al cargar el seguimiento local:', error
      );

      this.incidencias =[];
    } finally {

      this.cargando = false;
      this.cdr.detectChanges();

      console.log('Carga de seguimiento finalizada.')
    }
  }
  
  //actualizar mediante el gestor de ionic 
  async actualizar(event: CustomEvent): Promise<void> {

    await this.cargarIncidencias();
    (event.target as HTMLIonRefresherElement).complete();
  }

  //abrir detalle de incidencia
  verDetalle(incidencia: Incidencia): void {
    if (!incidencia.id) {
      console.error('La incidencia no tiene un ID valido.');
      return;
    }

    void this.router.navigate([
      '/detalle-incidencia',
      incidencia.id
    ]);
  }

  //colores segun el estado 
  estadoColor(esatdo: string) : string {
    switch (esatdo?.toLowerCase()) {
      case 'resuelta':
      case 'resuelto':
        return 'success';

      case 'en proceso':
        return 'warning';

      default:
        return 'medium';
    }
  }

  //eliminar una incidencia del seguimiento 
  async eliminarSeguimiento(codigo: string): Promise<void> {

    try {

      this.incidencias=
        await this.service.eliminarSeguimientoLocal(codigo);

      this.cdr.detectChanges();

      console.log('Seguimiento eliminado: ', codigo);
    } catch (error) {

      console.error(
        'Error al eliminar el seguimiento local:', error
      );
    } 
  }
}
