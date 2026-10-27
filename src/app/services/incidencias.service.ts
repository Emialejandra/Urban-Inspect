
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import {
  Incidencia,
  EstadoIncidencia
} from '../models/incidencia.model';

export type { Incidencia } from '../models/incidencia.model';

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {
  private http = inject(HttpClient);

  private apiUrl =
    'https://6ae00c298e42963c8d5ec79b.mockapi.io/incidencias';

  private cloudName = 'dbuttvfar';
  private uploadPreset = 'Urban-Inspect';

  async subirFotografia(archivo: File): Promise<string> {
    if (!archivo.type.startsWith('image/')) {
      throw new Error('Selecciona una imagen válida.');
    }

    const formulario = new FormData();
    formulario.append('file', archivo);
    formulario.append('upload_preset', this.uploadPreset);

    const respuesta = await firstValueFrom(
      this.http.post<{ secure_url: string }>(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        formulario
      )
    );

    if (!respuesta?.secure_url) {
      throw new Error('No se pudo obtener la URL de la fotografía.');
    }

    return respuesta.secure_url;
  }

  obtenerIncidencias(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.apiUrl);
  }

  obtenerIncidenciaPorId(id: string): Observable<Incidencia> {
    return this.http.get<Incidencia>(`${this.apiUrl}/${id}`);
  }

  crearIncidencia(incidencia: Incidencia): Observable<Incidencia> {
    return this.http.post<Incidencia>(this.apiUrl, incidencia);
  }

  actualizarIncidencia(
    id: string,
    incidencia: Partial<Incidencia>
  ): Observable<Incidencia> {
    return this.http.put<Incidencia>(
      `${this.apiUrl}/${id}`,
      incidencia
    );
  }

  async guardarSeguimientoLocal(incidencia: Incidencia): Promise<void> {
    const actual = await this.obtenerSeguimientoLocal();
    const existe = actual.some(item => item.codigo === incidencia.codigo);

    if (!existe) {
      actual.push(incidencia);
      await Preferences.set({
        key: 'urbaninspect_seguimiento',
        value: JSON.stringify(actual)
      });
    }
  }

  async obtenerSeguimientoLocal(): Promise<Incidencia[]> {
    const { value } = await Preferences.get({
      key: 'urbaninspect_seguimiento'
    });

    if (!value) return [];

    try {
      return JSON.parse(value) as Incidencia[];
    } catch {
      return [];
    }
  }

  async eliminarSeguimientoLocal(codigo: string): Promise<Incidencia[]> {
    const actual = await this.obtenerSeguimientoLocal();
    const filtradas = actual.filter(item => item.codigo !== codigo);

    await Preferences.set({
      key: 'urbaninspect_seguimiento',
      value: JSON.stringify(filtradas)
    });

    return filtradas;
  }
}
