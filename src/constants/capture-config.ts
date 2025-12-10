import { CaptureConfig } from '../types';

export const DEFAULT_CAPTURE_CONFIG: CaptureConfig = {
  enabled: false,
  intervalMs: 500,
  targetWindowTitle: 'MEGABONK',
};

export const CAPTURE_SETTINGS_KEY = 'bonkdata_capture_config';

// Limites de l'intervalle de capture
export const MIN_INTERVAL_MS = 100;    // Minimum 100ms (10 fps)
export const MAX_INTERVAL_MS = 2000;   // Maximum 2s (0.5 fps)

// Région d'intérêt pour l'analyse (centre de l'écran où les items apparaissent)
export const ANALYSIS_ROI = {
  xPercent: 0.25,      // Commence à 25% depuis la gauche
  yPercent: 0.35,      // Commence à 35% depuis le haut
  widthPercent: 0.5,   // 50% de la largeur de l'écran
  heightPercent: 0.3,  // 30% de la hauteur de l'écran
};
