import { CaptureConfig } from '../../types';
import { DEFAULT_CAPTURE_CONFIG, CAPTURE_SETTINGS_KEY } from '../../constants/capture-config';

export class CaptureConfigService {
  /**
   * Get capture configuration from localStorage
   */
  getConfig(): CaptureConfig {
    try {
      const stored = localStorage.getItem(CAPTURE_SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading capture config:', error);
    }

    return { ...DEFAULT_CAPTURE_CONFIG };
  }

  /**
   * Save capture configuration to localStorage
   */
  saveConfig(config: CaptureConfig): void {
    try {
      localStorage.setItem(CAPTURE_SETTINGS_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving capture config:', error);
    }
  }
}
