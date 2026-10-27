import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

@Injectable({ providedIn: 'root' })
export class Ubicacion {
  async obtenerCoordenadas(): Promise<Coordenadas> {
    const posicion = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude
    };
  }
}
