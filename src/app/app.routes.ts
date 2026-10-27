import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/inicio',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', loadComponent: () => import('./pages/inicio/inicio.page').then(m => m.InicioPage) },
      { path: 'incidencias', loadComponent: () => import('./pages/incidencias/incidencias.page').then(m => m.IncidenciasPage) },
      { path: 'registro-incidencia', loadComponent: () => import('./pages/registro-incidencia/registro-incidencia.page').then(m => m.RegistroIncidenciaPage) },
      { path: 'seguimiento', loadComponent: () => import('./pages/seguimiento/seguimiento.page').then(m => m.SeguimientoPage) }
    ]
  },
  { path: 'incidencias', redirectTo: 'tabs/incidencias', pathMatch: 'full' },
  {
    path: 'registro-incidencia', redirectTo: 'tabs/registro-incidencia', pathMatch: 'full'
  },
  { path: 'seguimiento', redirectTo: 'tabs/seguimiento', pathMatch: 'full' },
  {
    path: 'detalle-incidencia/:id',
    loadComponent: () => import('./pages/detalle-incidencia/detalle-incidencia.page').then(m => m.DetalleIncidenciaPage)
  },
  { path: '**', redirectTo: 'tabs/inicio' }
];
