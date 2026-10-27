
export type EstadoIncidencia = 'pendiente' | 'en_proceso' | 'resuelta' | string;

export type PrioridadIncidencia = 'baja' | 'media' | 'alta';

export interface Incidencia {
  id?: string;
  codigo: string;
  tipo?: string;
  titulo?: string;
  descripcion: string;
  direccion?: string;
  ubicacion?: string;
  categoria?: string;
  sector?: string;
  fecha: string | number;
  estado: EstadoIncidencia;
  prioridad?: PrioridadIncidencia;
  fotografia: string;
  latitud?: number | null;
  longitud?: number | null;
  observacion?: string;
}
