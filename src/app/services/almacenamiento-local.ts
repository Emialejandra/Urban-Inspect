import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class AlmacenamientoLocal {
  async guardar<T>(clave: string, valor: T): Promise<void> {
    await Preferences.set({ key: clave, value: JSON.stringify(valor) });
  }

  async obtener<T>(clave: string, valorPorDefecto: T): Promise<T> {
    const { value } = await Preferences.get({ key: clave });
    if (value === null) return valorPorDefecto;

    try {
      return JSON.parse(value) as T;
    } catch {
      return valorPorDefecto;
    }
  }

  async eliminar(clave: string): Promise<void> {
    await Preferences.remove({ key: clave });
  }
}
