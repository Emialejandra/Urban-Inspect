
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'incidencias',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage)
  },
  {
    path: 'incidencias',
    loadComponent: () => import('./pages/incidencias/incidencias.page').then((m) => m.IncidenciasPage)
  },
  {
    path: 'seguimiento',
    loadComponent: () => import('./pages/seguimiento/seguimiento.page').then((m) => m.SeguimientoPage)
  },
  {
    path: 'detalle-incidencia',
    loadComponent: () => import('./pages/detalle-incidencia/detalle-incidencia.page').then((m) => m.DetalleIncidenciaPage)
  },
  {
    path: 'registro-incidencia',
    loadComponent: () => import('./pages/registro-incidencia/registro-incidencia.page').then((m) => m.RegistroIncidenciaPage)
  },
];
