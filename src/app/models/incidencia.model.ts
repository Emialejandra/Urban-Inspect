
export type EstadoIncidencia = 'pendiente' | 'en_proceso' | 'resuelta';

export type PrioridadIncidencia = 'baja' | 'media' | 'alta';

export interface Incidencia {
  id?: string;
  codigo: string;
  tipo: string;
  descripcion: string;
  direccion: string;
  sector: string;
  fecha: string | number;
  estado: EstadoIncidencia;
  prioridad: PrioridadIncidencia;
  fotografia: string;
  latitud?: number | null;
  longitud?: number | null;
  observacion?: string;
}
