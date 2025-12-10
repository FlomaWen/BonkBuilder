
import { WindowConfig } from '../types';

export const MAIN_WINDOW_CONFIG: WindowConfig = {
  width: 1200,
  height: 800,
  title: 'BonkData',
  backgroundColor: '#1a1a2e',
  resizable: true,
  frame: true,
};

export const OVERLAY_WINDOW_CONFIG: WindowConfig = {
  width: 350,
  height: 600,
  title: 'BonkData - Overlay',
  backgroundColor: '#1a1a2e',
  alwaysOnTop: true,
  frame: false,
  resizable: true,
  skipTaskbar: false,
  opacity: 0.95,
};

export const OVERLAY_POSITION = {
  x: 20,
  y: 20,
};

