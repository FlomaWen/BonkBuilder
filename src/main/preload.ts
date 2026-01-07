/**
 * Preload script pour Electron
 * Expose une API sécurisée au renderer via contextBridge
 */

import { contextBridge, ipcRenderer } from 'electron';
import { Build, CaptureConfig, CaptureStatus, GameEvent } from '../types';

// Définition de l'API exposée au renderer
const electronAPI = {
  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window-minimize'),
    toggleMaximize: () => ipcRenderer.send('window-toggle-maximize'),
    close: () => ipcRenderer.send('window-close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window-is-maximized'),
  },

  // Overlay controls
  overlay: {
    open: () => ipcRenderer.send('open-overlay'),
    close: () => ipcRenderer.send('close-overlay'),
    minimize: () => ipcRenderer.send('overlay-minimize'),
  },

  // Build management
  build: {
    setActive: (buildData: Build) => ipcRenderer.send('set-active-build', buildData),
    onActiveBuildUpdated: (callback: (build: Build | null) => void) => {
      const subscription = (_event: Electron.IpcRendererEvent, build: Build) => callback(build);
      ipcRenderer.on('active-build-updated', subscription);
      return () => ipcRenderer.removeListener('active-build-updated', subscription);
    },
    onOverlayReady: (callback: () => void) => {
      const subscription = () => callback();
      ipcRenderer.on('overlay-ready', subscription);
      return () => ipcRenderer.removeListener('overlay-ready', subscription);
    },
  },

  // Capture management
  capture: {
    start: (config: CaptureConfig) => ipcRenderer.send('start-capture', config),
    stop: () => ipcRenderer.send('stop-capture'),
    getStatus: (): Promise<{ isActive: boolean }> => ipcRenderer.invoke('get-capture-status'),
    triggerTestLevelUp: () => ipcRenderer.send('trigger-test-levelup'),
    onStatusChanged: (callback: (status: CaptureStatus) => void) => {
      const subscription = (_event: Electron.IpcRendererEvent, status: CaptureStatus) => callback(status);
      ipcRenderer.on('capture-status-changed', subscription);
      return () => ipcRenderer.removeListener('capture-status-changed', subscription);
    },
  },

  // Game events
  game: {
    onEvent: (callback: (event: GameEvent) => void) => {
      const subscription = (_event: Electron.IpcRendererEvent, gameEvent: GameEvent) => callback(gameEvent);
      ipcRenderer.on('game-event', subscription);
      return () => ipcRenderer.removeListener('game-event', subscription);
    },
  },
};

// Expose l'API au renderer de manière sécurisée
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type export pour TypeScript
export type ElectronAPI = typeof electronAPI;

