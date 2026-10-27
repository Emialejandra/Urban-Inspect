import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, map } from 'rxjs';
import { Preferences } from '@capacitor/preferences'; // <--- Importar Capacitor Preferences

@Injectable({
    providedIn: 'root'
})
export class IncidenciaService {
    private http = inject(HttpClient);
    private apiUrl = 'https://678732c2c4ada42c916d2524.mockapi.io/api/v1/incidencias';

    // Métodos existentes para MockAPI...
    obtenerIncidencias(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    crearIncidencia(incidencia: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, incidencia);
    }

    // --- R1: MÉTODOS PARA SEGUIMIENTO LOCAL (OFFLINE) ---

    // Guardar una incidencia en el almacenamiento local del teléfono
    async guardarSeguimientoLocal(incidencia: any): Promise<void> {
        const actual = await this.obtenerSeguimientoLocal();
        // Evitar duplicados basados en el código
        const existe = actual.some((item: any) => item.codigo === incidencia.codigo);
        if (!existe) {
            actual.push(incidencia);
            await Preferences.set({
                key: 'urbaninspect_seguimiento',
                value: JSON.stringify(actual)
            });
        }
    }

    // Obtener la lista de incidencias guardadas localmente
    async obtenerSeguimientoLocal(): Promise<any[]> {
        const { value } = await Preferences.get({ key: 'urbaninspect_seguimiento' });
        return value ? JSON.parse(value) : [];
    }

    // Eliminar una incidencia del seguimiento local
    async eliminarSeguimientoLocal(codigo: string): Promise<any[]> {
        let actual = await this.obtenerSeguimientoLocal();
        actual = actual.filter((item: any) => item.codigo !== codigo);
        await Preferences.set({
            key: 'urbaninspect_seguimiento',
            value: JSON.stringify(actual)
        });
        return actual;
    }

    obtenerIncidenciaPorId(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    actualizarIncidencia(id: string, incidencia: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, incidencia);
    }
}