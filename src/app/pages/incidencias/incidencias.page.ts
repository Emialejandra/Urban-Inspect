
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  IonSpinner, IonSelect, IonSelectOption,
  IonText
} from '@ionic/angular';

import { IncidenciaService } from '../../services/incidencias.service';
import { finalize } from 'rxjs';

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
    IonSpinner, IonSelect, IonSelectOption,
    IonText, FormsModule
  ]
})
export class IncidenciasPage implements OnInit {

  private incidenciaService = inject(IncidenciaService);

  private cdr = inject(ChangeDetectorRef);
  
  constructor(private router: Router) { }

  incidencias: any[] = [];
  incidenciasLocales: any[] = [];

  cargando = false;
  mensajeError = '';
  hayMasIncidencias = false;

  ngOnInit(): void {
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
    console.log('Consultando incidencias en MockAPI...');

    this.cargando = true;
    this.mensajeError = '';

    this.incidenciaService.obtenerIncidencias()
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();

          console.log('Finalizó la consulta de incidencias.');
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Respuesta completa:', data);

          if (!Array.isArray(data)) {
            console.error('La respuesta no es un arreglo.');

            this.incidencias = [];
            this.mensajeError = 'Formato de respuesta incorrecto.';
            this.cdr.detectChanges();

            return;
          }

          // Asignar los registros recibidos
          this.incidencias = [...data];

          console.log('Primera incidencia:', this.incidencias[0]);
          console.log('Total asignado:', this.incidencias.length);
          console.log('Incidencias:', this.incidencias);

          // Actualizar la pantalla   
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error al cargar incidencias:', error);

          this.mensajeError =
            'No se pudieron cargar las incidencias. Comprueba tu conexión.';

          this.cdr.detectChanges();
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


  categoriaSeleccionada = 'Todas';

  get incidenciasFiltradas(): any[] {
    if (this.categoriaSeleccionada === 'Todas') {
      return this.incidencias;
    }

    return this.incidencias.filter((incidencia) => {
      const tipo = (incidencia.tipo || '').toLowerCase().trim();

      const categorias: { [key: string]: string[] } = {
        'Alumbrado': ['alumbrado', 'luminaria'],
        'Vías': ['vías', 'vias', 'bache', 'señalización', 'senalizacion'],
        'Basura': ['basura', 'limpieza'],
        'Agua': ['agua', 'alcantarillado'],
        'Espacios públicos': ['espacios públicos', 'espacios publicos'],
        'Otro': ['otro']
      };

      const palabras = categorias[this.categoriaSeleccionada] || [];

      return palabras.some(palabra => tipo.includes(palabra));
    });
  }

}
