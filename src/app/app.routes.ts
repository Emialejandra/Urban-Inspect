import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'incidencias',
    pathMatch: 'full'
  },
  {
    path: 'incidencias',
    loadComponent: () => import('./pages/incidencias/incidencias.page').then(m => m.IncidenciasPage)
  },
  {
    path: 'registro-incidencia',
    loadComponent: () => import('./pages/registro-incidencia/registro-incidencia.page').then(m => m.RegistroIncidenciaPage)
  },
  {
    path: 'seguimiento',
    loadComponent: () => import('./pages/seguimiento/seguimiento.page').then(m => m.SeguimientoPage)
  },
  {
    path: 'detalle-incidencia/:id',
    loadComponent: () => import('./pages/detalle-incidencia/detalle-incidencia.page').then(m => m.DetalleIncidenciaPage)
  }
];