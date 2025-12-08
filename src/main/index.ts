/**
 * Point d'entrée principal de l'application Electron
 */

import { app, BrowserWindow } from 'electron';
import { WindowManager } from './window-manager';
import { IpcHandlers } from './ipc-handlers';

class BonkBuilderApp {
  private windowManager: WindowManager;
  private ipcHandlers: IpcHandlers;

  constructor() {
    this.windowManager = new WindowManager();
    this.ipcHandlers = new IpcHandlers(this.windowManager);
  }

  /**
   * Initialise l'application
   */
  public async initialize(): Promise<void> {
    await app.whenReady();

    // Crée la fenêtre principale
    this.windowManager.createMainWindow();

    // Enregistre les handlers IPC
    this.ipcHandlers.registerHandlers();

    // Gère la création de fenêtre sur macOS
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.windowManager.createMainWindow();
      }
    });

    // Gère la fermeture de l'application
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }
}

const bonkApp = new BonkBuilderApp();
bonkApp.initialize().catch(console.error);

