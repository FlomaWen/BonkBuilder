import { CaptureConfig } from '../types';

export const DEFAULT_CAPTURE_CONFIG: CaptureConfig = {
  enabled: false,
  intervalMs: 500,
  ocrConfidence: 0.6,
  targetWindowTitle: 'MEGABONK',
};

export const CAPTURE_SETTINGS_KEY = 'bonkdata_capture_config';

// Region of interest for OCR (center of screen where items appear)
export const OCR_ROI = {
  xPercent: 0.25, // Start at 25% from left
  yPercent: 0.35, // Start at 35% from top
  widthPercent: 0.5, // 50% of screen width
  heightPercent: 0.3, // 30% of screen height
};
