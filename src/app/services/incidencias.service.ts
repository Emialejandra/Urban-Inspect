
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Incidencia } from '../models/incidencia.model';

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {

  private readonly apiUrl =
    'https://6ae00c298e42963c8d5ec79b.mockapi.io/incidencias';

  constructor(private http: HttpClient) {}

  obtenerIncidencias(
    pagina = 1,
    limite = 5
  ): Observable<Incidencia[]> {

    const params = new HttpParams()
      .set('page', pagina)
      .set('limit', limite);

    return this.http.get<Incidencia[]>(this.apiUrl, { params });
  }

  obtenerPorId(id: string): Observable<Incidencia> {
    return this.http.get<Incidencia>(
      `${this.apiUrl}/${encodeURIComponent(id)}`
    );
  }

  crearIncidencia(
    incidencia: Omit<Incidencia, 'id'>
  ): Observable<Incidencia> {
    return this.http.post<Incidencia>(this.apiUrl, incidencia);
  }

  actualizarIncidencia(
    id: string,
    cambios: Partial<Incidencia>
  ): Observable<Incidencia> {
    return this.http.put<Incidencia>(
      `${this.apiUrl}/${encodeURIComponent(id)}`,
      cambios
    );
  }
}
