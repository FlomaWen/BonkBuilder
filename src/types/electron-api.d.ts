/**
 * Types globaux pour l'API Electron exposée via preload
 */

import { Build, CaptureConfig, CaptureStatus, GameEvent } from '../types';

export interface ElectronAPI {
  window: {
    minimize: () => void;
    toggleMaximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
  };
  overlay: {
    open: () => void;
    close: () => void;
    minimize: () => void;
  };
  build: {
    setActive: (buildData: Build) => void;
    onActiveBuildUpdated: (callback: (build: Build | null) => void) => () => void;
    onOverlayReady: (callback: () => void) => () => void;
  };
  capture: {
    start: (config: CaptureConfig) => void;
    stop: () => void;
    getStatus: () => Promise<{ isActive: boolean }>;
    triggerTestLevelUp: () => void;
    onStatusChanged: (callback: (status: CaptureStatus) => void) => () => void;
  };
  game: {
    onEvent: (callback: (event: GameEvent) => void) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};

