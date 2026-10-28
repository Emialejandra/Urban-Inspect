
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, timeout } from 'rxjs';
import { Incidencia } from '../models/incidencia.model';
import { AlmacenamientoLocal } from './almacenamiento-local';

@Injectable({ providedIn: 'root' })
export class IncidenciaService {
    private http = inject(HttpClient);
    private almacenamiento = inject(AlmacenamientoLocal);

    private apiUrl =
        'https://6ae00c298e42963c8d5ec79b.mockapi.io/incidencias';

    private cloudName = 'dbuttvfar';
    private uploadPreset = 'Urban-Inspect';

    private readonly claveSeguimiento = 'urbaninspect_seguimiento';

    async subirFotografia(archivo: File): Promise<string> {
        const formulario = new FormData();
        formulario.append('file', archivo);
        formulario.append('upload_preset', this.uploadPreset);

        const respuesta = await firstValueFrom(
            this.http.post<{ secure_url: string }>(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
                formulario
            )
        );

        return respuesta.secure_url;
    }

    obtenerIncidencias(): Observable<Incidencia[]> {
        return this.http.get<Incidencia[]>(this.apiUrl).pipe(
            timeout(10000)
        );
    }

    obtenerIncidenciaPorId(id: string): Observable<Incidencia> {
        return this.http
            .get<Incidencia>(`${this.apiUrl}/${id}`)
            .pipe(timeout(6000));
    }

    crearIncidencia(incidencia: Incidencia): Observable<Incidencia> {
        return this.http
            .post<Incidencia>(this.apiUrl, incidencia)
            .pipe(timeout(10000));
    }

    actualizarIncidencia(
        id: string,
        incidencia: Partial<Incidencia>
    ): Observable<Incidencia> {
        return this.http
            .put<Incidencia>(`${this.apiUrl}/${id}`, incidencia)
            .pipe(timeout(10000));
    }

    async guardarSeguimientoLocal(
        incidencia: Incidencia
    ): Promise<void> {
        const actual = await this.obtenerSeguimientoLocal();

        const indice = actual.findIndex(item =>
            (
                incidencia.id != null &&
                String(item.id) === String(incidencia.id)
            ) ||
            (
                incidencia.codigo != null &&
                item.codigo === incidencia.codigo
            )
        );

        if (indice !== -1) {
            actual[indice] = {
                ...actual[indice],
                ...incidencia
            };
        } else {
            actual.push(incidencia);
        }

        await this.almacenamiento.guardar(
            this.claveSeguimiento,
            actual
        );
    }

    async obtenerSeguimientoLocal(): Promise<Incidencia[]> {
        return this.almacenamiento.obtener<Incidencia[]>(
            this.claveSeguimiento,
            []
        );
    }

    async eliminarSeguimientoLocal(
        codigo: string
    ): Promise<Incidencia[]> {
        const actual = await this.obtenerSeguimientoLocal();

        const filtradas = actual.filter(
            item => item.codigo !== codigo
        );

        await this.almacenamiento.guardar(
            this.claveSeguimiento,
            filtradas
        );

        return filtradas;
    }
}
