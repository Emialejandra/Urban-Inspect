
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner
} from '@ionic/angular';

import { IncidenciaService } from '../../services/incidencias.service';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.page.html',
  styleUrls: ['./incidencias.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonBadge,
    IonSpinner
  ]
})
export class IncidenciasPage implements OnInit {

  private incidenciaService = inject(IncidenciaService);

  constructor(private router: Router) { }

  incidencias: any[] = [];
  incidenciasLocales: any[] = [];

  cargando = false;
  mensajeError = '';
  hayMasIncidencias = false;

  ngOnInit(): void {
    this.cargarIncidencias();
    void this.cargarSeguimientoLocal();
  }

  ionViewWillEnter(): void {
    this.cargarIncidencias();
    void this.cargarSeguimientoLocal();
  }
  
  // Abrir el formulario de registro
  nuevaIncidencia(): void {
    void this.router.navigate(['/tabs/registro-incidencia']);
  }

  // Consultar incidencias en MockAPI
  cargarIncidencias(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.incidenciaService.obtenerIncidencias().subscribe({
      next: (data) => {
        this.incidencias = Array.isArray(data) ? data : [];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar incidencias:', error);

        this.mensajeError =
          'No se pudieron cargar las incidencias. Comprueba tu conexión e inténtalo de nuevo.';

        this.cargando = false;
      }
    });
  }

  // Volver a consultar el servidor
  reintentar(): void {
    this.cargarIncidencias();
  }

  // Guardar una incidencia para seguimiento local
  async agregarSeguimiento(incidencia: any): Promise<void> {
    try {
      await this.incidenciaService.guardarSeguimientoLocal(incidencia);
      await this.cargarSeguimientoLocal();

      alert('Incidencia guardada para seguimiento local.');
    } catch (error) {
      console.error('Error al guardar el seguimiento:', error);
      alert('No se pudo guardar el seguimiento local.');
    }
  }

  // Cargar registros locales
  async cargarSeguimientoLocal(): Promise<void> {
    try {
      this.incidenciasLocales =
        await this.incidenciaService.obtenerSeguimientoLocal();
    } catch (error) {
      console.error('Error al cargar el seguimiento local:', error);
      this.incidenciasLocales = [];
    }
  }
}
