import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { Incidencia } from '../../models/incidencia.model';
import { IncidenciaService } from '../../services/incidencias.service';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner
} from '@ionic/angular';

import {
  addCircleOutline,
  alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.page.html',
  styleUrls: ['./incidencias.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonBadge,
    CommonModule,
    IonSpinner
  ]
})

export class IncidenciasPage implements OnInit {

  incidencias: Incidencia[] = [];
  paginaActual = 1;
  readonly limite = 5;

  cargando = false;
  hayMasIncidencias = true;
  mensajeError = '';

  constructor(
    private incidenciaService: IncidenciaService
  ) {
    addIcons({
      'add-circle-outline': addCircleOutline,
      'alert-circle-outline': alertCircleOutline
    });
  }

  ngOnInit(): void {
    this.cargarIncidencias();
  }


  cargarIncidencias(): void {
    if (this.cargando) return;

    this.cargando = true;
    this.mensajeError = '';

    this.incidenciaService.obtenerIncidencias(this.paginaActual, this.limite)
      .subscribe({
        next: (datos) => {
          console.log('Incidencias recibidas:', datos);

          if (!Array.isArray(datos)) {
            this.mensajeError = 'La respuesta de MockAPI no es una lista válida.';
            this.cargando = false;
            return;
          }

          // Evitar duplicados al cargar más páginas
          const existentes = new Set(
            this.incidencias.map((item) => item.id)
          );

          const nuevas = datos.filter(
            (item) => !item.id || !existentes.has(item.id)
          );

          this.incidencias = [...this.incidencias, ...nuevas];

          this.hayMasIncidencias = datos.length === this.limite;
          this.paginaActual++;

          this.cargando = false;
        },
        error: (error) => {
          console.error('Error de MockAPI:', error);
          this.mensajeError =
            'No se pudieron cargar las incidencias. Pulsa Reintentar.';
          this.cargando = false;
        }
      });
  }



  reintentar(): void {
    this.cargarIncidencias();
  }

  actualizarLista(event: any): void {
    this.incidencias = [];
    this.paginaActual = 1;
    this.hayMasIncidencias = true;
    this.mensajeError = '';

    this.incidenciaService
      .obtenerIncidencias(1, this.limite)
      .subscribe({
        next: (datos) => {
          this.incidencias = datos;
          this.hayMasIncidencias = datos.length === this.limite;
          this.paginaActual = 2;
          this.cargando = false;
          event.target.complete();
        },
        error: (error) => {
          console.error('Error al actualizar incidencias:', error);
          this.mensajeError = 'No se pudo actualizar la lista.';
          this.cargando = false;
          event.target.complete();
        }
      });
  }
}
