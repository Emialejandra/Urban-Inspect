import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClimaService {
  private http = inject(HttpClient);
  private apiKey = '5f15c36057372f880700e58d2c8bd6a3'; 

  obtenerClima(lat: number, lon: number): Observable<any> {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`;

    return this.http.get(url).pipe(
      map((res: any) => {
        return {
          temperatura: res.main.temp,
          descripcion: res.weather[0].description,
          precipitacion: res.rain && res.rain['1h'] ? res.rain['1h'] : 0
        };
      }),
      catchError((error) => {
        console.error('Error al consultar la API de clima:', error);
        return of(null); 
      })
    );
  }
}