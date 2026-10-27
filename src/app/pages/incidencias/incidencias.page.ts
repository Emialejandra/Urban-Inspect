import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader,
  IonItem, IonLabel, IonButton, IonIcon, IonBadge, IonSpinner 
} from '@ionic/angular';
import { IncidenciaService } from '../../services/incidencias.service';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.page.html',
  styleUrls: ['./incidencias.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonList, IonListHeader, IonItem, IonLabel, 
    IonButton, IonIcon, IonBadge, IonSpinner
  ]
})
export class IncidenciasPage implements OnInit {
  private incidenciaService = inject(IncidenciaService);

  // Lista de incidencias
  incidencias: any[] = [];
  incidenciasLocales: any[] = [];

  // Variables de control de estado de carga y error
  cargando: boolean = false;
  mensajeError: string = '';
  hayMasIncidencias: boolean = false;

  ngOnInit() {
    this.cargarIncidencias();
    this.cargarSeguimientoLocal();
  }

  cargarIncidencias() {
    this.cargando = true;
    this.mensajeError = '';

    this.incidenciaService.obtenerIncidencias().subscribe({
      next: (data) => {
        this.incidencias = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar incidencias:', err);
        this.mensajeError = 'No se pudieron cargar las incidencias del servidor.';
        this.cargando = false;
      }
    });
  }

  reintentar() {
    this.cargarIncidencias();
  }

  // R1: Guardar localmente para seguimiento offline
  async agregarSeguimiento(incidencia: any) {
    await this.incidenciaService.guardarSeguimientoLocal(incidencia);
    await this.cargarSeguimientoLocal();
    alert('Incidencia guardada para seguimiento local.');
  }

  async cargarSeguimientoLocal() {
    this.incidenciasLocales = await this.incidenciaService.obtenerSeguimientoLocal();
  }
}