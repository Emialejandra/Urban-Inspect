import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
  IonButton, IonBadge, IonItem, IonLabel, 
  IonTextarea, IonSelect, IonSelectOption, IonButtons, IonBackButton 
} from '@ionic/angular';
import { IncidenciaService } from '../../services/incidencias.service';

@Component({
  selector: 'app-detalle-incidencia',
  templateUrl: './detalle-incidencia.page.html',
  styleUrls: ['./detalle-incidencia.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
    IonCardContent, IonButton, IonBadge, IonItem, IonLabel, 
    IonTextarea, IonSelect, IonSelectOption, IonButtons, IonBackButton
  ]
})
export class DetalleIncidenciaPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private incidenciaService = inject(IncidenciaService);

  incidenciaId: string = '';
  incidencia: any = null;
  
  // Campos para actualización (R9)
  nuevoEstado: 'pendiente' | 'en_proceso' | 'resuelta' = 'pendiente';
  observacion: string = '';

  ngOnInit() {
    this.incidenciaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.incidenciaId) {
      this.cargarDetalle();
    }
  }

  cargarDetalle() {
    this.incidenciaService.obtenerIncidenciaPorId(this.incidenciaId).subscribe({
      next: (data) => {
        this.incidencia = data;
        this.nuevoEstado = data.estado;
        this.observacion = data.observacion || '';
      },
      error: (err) => {
        console.error('Error al cargar detalle:', err);
        alert('No se pudo cargar la información de la incidencia.');
      }
    });
  }

  guardarCambios() {
    // R9: Validación estricta - Exigir observación si se marca como resuelta
    if (this.nuevoEstado === 'resuelta' && !this.observacion.trim()) {
      alert('Debe ingresar una observación técnica obligatoria para marcar la incidencia como resuelta.');
      return;
    }

    const incidenciaActualizada = {
      ...this.incidencia,
      estado: this.nuevoEstado,
      observacion: this.observacion
    };

    this.incidenciaService.actualizarIncidencia(this.incidenciaId, incidenciaActualizada).subscribe({
      next: () => {
        alert('Incidencia actualizada correctamente en el servidor.');
        this.router.navigate(['/incidencias']);
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        alert('Hubo un error al guardar los cambios.');
      }
    });
  }
}