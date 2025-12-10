/**
 * Gestionnaire de fenêtres Electron
 */

import { BrowserWindow } from 'electron';
import * as path from 'path';
import { MAIN_WINDOW_CONFIG, OVERLAY_WINDOW_CONFIG, OVERLAY_POSITION } from '../constants/window-configs';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private overlayWindow: BrowserWindow | null = null;

  /**
   * Crée la fenêtre principale
   */
  public createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow({
      width: MAIN_WINDOW_CONFIG.width,
      height: MAIN_WINDOW_CONFIG.height,
      title: MAIN_WINDOW_CONFIG.title,
      backgroundColor: MAIN_WINDOW_CONFIG.backgroundColor,
      frame: false, // Retirer la barre de titre Windows
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        partition: 'persist:bonkbuilder',
      },
      icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),
    });

    this.mainWindow.loadFile(path.join(__dirname, '..', '..', 'index.html'));

    // Ouvrir les DevTools en mode développement
    if (process.argv.includes('--dev')) {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      if (this.overlayWindow) {
        this.overlayWindow.close();
      }
    });

    return this.mainWindow;
  }

  /**
   * Crée ou focus la fenêtre overlay
   */
  public createOverlayWindow(): BrowserWindow {
    if (this.overlayWindow) {
      this.overlayWindow.focus();
      return this.overlayWindow;
    }

    this.overlayWindow = new BrowserWindow({
        titleBarStyle: 'hidden',
          width: OVERLAY_WINDOW_CONFIG.width,
          height: OVERLAY_WINDOW_CONFIG.height,
          x: OVERLAY_POSITION.x,
          y: OVERLAY_POSITION.y,
          title: OVERLAY_WINDOW_CONFIG.title,
          backgroundColor: OVERLAY_WINDOW_CONFIG.backgroundColor,
          frame: OVERLAY_WINDOW_CONFIG.frame,
          alwaysOnTop: OVERLAY_WINDOW_CONFIG.alwaysOnTop,
          skipTaskbar: OVERLAY_WINDOW_CONFIG.skipTaskbar,
          resizable: OVERLAY_WINDOW_CONFIG.resizable,
          opacity: OVERLAY_WINDOW_CONFIG.opacity,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            partition: 'persist:bonkbuilder',
          },
    });

    this.overlayWindow.loadFile(path.join(__dirname, '..', '..', 'overlay.html'));

    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null;
    });

    return this.overlayWindow;
  }

  /**
   * Ferme la fenêtre overlay si elle existe
   */
  public closeOverlayWindow(): void {
    if (this.overlayWindow) {
      this.overlayWindow.close();
    }
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public getOverlayWindow(): BrowserWindow | null {
    return this.overlayWindow;
  }
}

