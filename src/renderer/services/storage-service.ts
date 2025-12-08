/**
 * Service générique de stockage local
 */

export class StorageService {
  /**
   * Sauvegarde une valeur dans le localStorage
   */
  public static set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
    }
  }

  /**
   * Récupère une valeur du localStorage
   */
  public static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${key}:`, error);
      return defaultValue ?? null;
    }
  }

  /**
   * Supprime une valeur du localStorage
   */
  public static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  }

  /**
   * Vide complètement le localStorage
   */
  public static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erreur lors du vidage du localStorage:', error);
    }
  }

  public static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

