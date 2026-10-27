import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
  IonButton, IonIcon, IonBadge, IonButtons, IonBackButton 
} from '@ionic/angular';
import { IncidenciaService } from '../../services/incidencias.service';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
    IonCardContent, IonButton, IonIcon, IonBadge, IonButtons, IonBackButton
  ]
})
export class SeguimientoPage implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  incidenciasLocales: any[] = [];

  ngOnInit() {
    this.cargarDatosLocales();
  }

  async cargarDatosLocales() {
    this.incidenciasLocales = await this.incidenciaService.obtenerSeguimientoLocal();
  }

  async quitarSeguimiento(codigo: string) {
    this.incidenciasLocales = await this.incidenciaService.eliminarSeguimientoLocal(codigo);
  }
}