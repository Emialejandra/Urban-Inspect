import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
  IonLabel, IonButton, IonSelect, IonSelectOption, 
  IonTextarea, IonInput, IonImg, IonNote 
} from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { IncidenciaService } from '../../services/incidencias.service';
import { ClimaService } from '../../services/clima.service';

@Component({
  selector: 'app-registro-incidencia',
  templateUrl: './registro-incidencia.page.html',
  styleUrls: ['./registro-incidencia.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonItem, IonLabel, IonButton, 
    IonSelect, IonSelectOption, IonTextarea, IonInput, IonImg, IonNote
  ]
})
export class RegistroIncidenciaPage implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private climaService = inject(ClimaService);
  private router = inject(Router);

  // Campos del formulario
  tipo: string = '';
  descripcion: string = '';
  direccion: string = '';
  sector: string = '';
  prioridad: string = 'media';
  fotografia: string = '';
  
  // Datos de GPS y Clima
  latitud: number | null = null;
  longitud: number | null = null;
  climaActual: any = null;
  advertenciaLluvia: string = '';
  cargando: boolean = false;

  ngOnInit() {
    this.obtenerUbicacionGPS();
  }

  // R7: Obtener Ubicación GPS con Capacitor
  async obtenerUbicacionGPS() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.latitud = coordinates.coords.latitude;
      this.longitud = coordinates.coords.longitude;
      this.consultarClima();
    } catch (error) {
      console.error('Error obteniendo ubicación GPS:', error);
      this.latitud = -0.1807;
      this.longitud = -78.4678;
      this.consultarClima();
    }
  }

  // R6: Tomar foto con la Cámara de Capacitor
  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      if (image && image.dataUrl) {
        this.fotografia = image.dataUrl;
      }
    } catch (error) {
      console.error('Error al capturar la fotografía:', error);
    }
  }

  // R4: Consultar Clima con tolerancia a fallos
  consultarClima() {
    if (this.latitud && this.longitud) {
      // Nota: Asegúrate de usar el método exacto que tengas en tu clima.service.ts 
      // (si se llama obtenerClima o getClima). Aquí usamos climaService de forma genérica o el método común.
      const climaObservable = (this.climaService as any).obtenerClima 
        ? (this.climaService as any).obtenerClima(this.latitud, this.longitud) 
        : (this.climaService as any).getClimaActual(this.latitud, this.longitud);

      climaObservable.subscribe({
        next: (data: any) => {
          this.climaActual = {
            temperatura: Math.round(data.main.temp - 273.15),
            descripcion: data.weather[0].description,
            precipitacion: data.rain ? (data.rain['1h'] || 0) : 0
          };

          if (this.climaActual.precipitacion > 2) {
            this.advertenciaLluvia = '⚠️ Alerta meteorológica: Se registran precipitaciones fuertes en la zona.';
          } else {
            this.advertenciaLluvia = '';
          }
        },
        error: (err: any) => {
          console.warn('Advertencia: No se pudo conectar al servicio de clima (Tolerancia a fallos activada).', err);
          this.climaActual = null;
        }
      });
    }
  }

  // R5: Guardar Incidencia y enviarla a la MockAPI
  guardarIncidencia() {
    if (!this.tipo || !this.descripcion || !this.sector) {
      alert('Por favor complete los campos obligatorios (Tipo, Descripción y Sector).');
      return;
    }

    const nuevaIncidencia = {
      codigo: 'INC-' + Math.floor(1000 + Math.random() * 9000),
      tipo: this.tipo,
      descripcion: this.descripcion,
      direccion: this.direccion || 'No especificada',
      sector: this.sector,
      prioridad: this.prioridad,
      estado: 'pendiente',
      fecha: new Date().toISOString().split('T')[0],
      latitud: this.latitud,
      longitud: this.longitud,
      fotografia: this.fotografia,
      observacion: ''
    };

    this.cargando = true;
    this.incidenciaService.crearIncidencia(nuevaIncidencia).subscribe({
      next: () => {
        this.cargando = false;
        alert('¡Incidencia registrada con éxito!');
        this.router.navigate(['/incidencias']);
      },
      error: (err: any) => {
        this.cargando = false;
        console.error('Error al guardar la incidencia:', err);
        alert('Hubo un error al registrar la incidencia en el servidor.');
      }
    });
  }
}