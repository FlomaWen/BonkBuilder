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
    this.registerWindowHandlers();
    this.registerOverlayHandlers();
    this.registerBuildHandlers();
    this.registerCaptureHandlers();
  }

  /**
   * Handlers pour les contrôles de la fenêtre
   */
  private registerWindowHandlers(): void {
    ipcMain.on('window-minimize', () => {
      const mainWindow = this.windowManager.getMainWindow();
      if (mainWindow) {
        mainWindow.minimize();
      }
    });

    ipcMain.on('window-toggle-maximize', () => {
      const mainWindow = this.windowManager.getMainWindow();
      if (mainWindow) {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
      }
    });

    ipcMain.on('window-close', () => {
      const mainWindow = this.windowManager.getMainWindow();
      if (mainWindow) {
        mainWindow.close();
      }
    });

    ipcMain.handle('window-is-maximized', () => {
      const mainWindow = this.windowManager.getMainWindow();
      return mainWindow ? mainWindow.isMaximized() : false;
    });
  }

  /**
   * Configure les écouteurs pour le GameCaptureOrchestrator
   */
  private setupGameCaptureListeners(): void {
    // Transmettre les changements de statut vers la fenêtre principale
    this.gameCaptureOrchestrator.on('status-changed', (status) => {
      const mainWindow = this.windowManager.getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('capture-status-changed', status);
      }
    });

    // Transmettre les événements du jeu vers la fenêtre principale et l'overlay
    this.gameCaptureOrchestrator.on('game-event', (event) => {
      const mainWindow = this.windowManager.getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('game-event', event);
      }

      // Transmettre également vers l'overlay
      const overlayWindow = this.windowManager.getOverlayWindow();
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('game-event', event);
      }
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

    ipcMain.on('overlay-minimize', () => {
      const overlayWindow = this.windowManager.getOverlayWindow();
      if (overlayWindow) {
        overlayWindow.minimize();
      }
    });
  }

  private registerBuildHandlers(): void {
    ipcMain.on('set-active-build', (_event, buildData) => {
      const overlayWindow = this.windowManager.getOverlayWindow();
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('active-build-updated', buildData);
      }

      // Mettre à jour le build actif dans le GameCaptureOrchestrator
      this.gameCaptureOrchestrator.setActiveBuild(buildData);
    });
  }

  /**
   * Handlers pour la capture d'écran
   */
  private registerCaptureHandlers(): void {
    // Démarrer la capture
    ipcMain.on('start-capture', async (_event, config: CaptureConfig) => {
      try {
        await this.gameCaptureOrchestrator.startMonitoring(config);
      } catch (error) {
        const mainWindow = this.windowManager.getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('capture-status-changed', {
            status: 'error',
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          });
        }
      }
    });

    // Arrêter la capture
    ipcMain.on('stop-capture', () => {
      this.gameCaptureOrchestrator.stopMonitoring();
    });

    // Récupérer le statut de la capture
    ipcMain.handle('get-capture-status', () => {
      return {
        isActive: this.gameCaptureOrchestrator.isActive(),
      };
    });

    // Handler pour tester le level-up manuellement (pour le debug)
    ipcMain.on('trigger-test-levelup', () => {
      console.log('🧪 Test de level-up déclenché manuellement');
      this.gameCaptureOrchestrator.triggerTestLevelUp();
    });
  }
}

