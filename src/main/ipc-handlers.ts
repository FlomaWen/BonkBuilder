import { ipcMain } from 'electron';
import { WindowManager } from './window-manager';
import { GameCaptureOrchestrator } from './services/game-capture-orchestrator';
import { CaptureConfig } from '../types';

export class IpcHandlers {
  private gameCaptureOrchestrator: GameCaptureOrchestrator;

  constructor(private windowManager: WindowManager) {
    this.gameCaptureOrchestrator = new GameCaptureOrchestrator();
    this.setupGameCaptureListeners();
  }

  public registerHandlers(): void {
    this.registerOverlayHandlers();
    this.registerBuildHandlers();
    this.registerGameCaptureHandlers();
  }

  /**
   * Setup listeners from orchestrator to forward to windows
   */
  private setupGameCaptureListeners(): void {
    // Status updates → send to main window
    this.gameCaptureOrchestrator.on('status-changed', (status) => {
      this.sendToMainWindow('game-capture-status', status);
    });

    // Level-up detected → send to overlay window
    this.gameCaptureOrchestrator.on('level-up-detected', (suggestions) => {
      this.sendToOverlay('level-up-detected', suggestions);
    });
  }

  private registerOverlayHandlers(): void {
    ipcMain.on('open-overlay', () => {
      const overlayWindow = this.windowManager.createOverlayWindow();

      // Quand l'overlay est prêt, demander à la fenêtre principale d'envoyer le build actif
      overlayWindow.webContents.once('did-finish-load', () => {
        const mainWindow = this.windowManager.getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('overlay-ready');
        }
      });
    });

    ipcMain.on('close-overlay', () => {
      this.windowManager.closeOverlayWindow();
    });
  }

  private registerBuildHandlers(): void {
    ipcMain.on('set-active-build', (_event, buildData) => {
      const overlayWindow = this.windowManager.getOverlayWindow();
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('active-build-updated', buildData);
      }

      // Also update the orchestrator with the active build
      this.gameCaptureOrchestrator.setActiveBuild(buildData);
    });
  }

  private registerGameCaptureHandlers(): void {
    // Start game capture
    ipcMain.on('start-game-capture', async (_event, config: CaptureConfig) => {
      try {
        await this.gameCaptureOrchestrator.startMonitoring(config);
      } catch (error) {
        this.sendToMainWindow('game-capture-status', {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Stop game capture
    ipcMain.on('stop-game-capture', () => {
      this.gameCaptureOrchestrator.stopMonitoring();
    });
  }

  private sendToMainWindow(channel: string, data: any): void {
    const mainWindow = this.windowManager.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data);
    }
  }

  private sendToOverlay(channel: string, data: any): void {
    const overlayWindow = this.windowManager.getOverlayWindow();
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send(channel, data);
    }
  }
}

