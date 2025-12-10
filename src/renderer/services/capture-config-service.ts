import { CaptureConfig } from '../../types';
import { DEFAULT_CAPTURE_CONFIG, CAPTURE_SETTINGS_KEY } from '../../constants/capture-config';

export class CaptureConfigService {
  /**
   * Récupère la configuration de capture depuis localStorage
   */
  getConfig(): CaptureConfig {
    try {
      const stored = localStorage.getItem(CAPTURE_SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la config de capture:', error);
    }

    return { ...DEFAULT_CAPTURE_CONFIG };
  }

  /**
   * Sauvegarde la configuration de capture dans localStorage
   */
  saveConfig(config: CaptureConfig): void {
    try {
      localStorage.setItem(CAPTURE_SETTINGS_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la config de capture:', error);
    }
  }

  /**
   * Réinitialise la configuration aux valeurs par défaut
   */
  resetToDefaults(): void {
    this.saveConfig({ ...DEFAULT_CAPTURE_CONFIG });
  }
}
