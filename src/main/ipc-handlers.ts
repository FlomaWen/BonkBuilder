import { ipcMain } from 'electron';
import { WindowManager } from './window-manager';

export class IpcHandlers {
  constructor(private windowManager: WindowManager) {}

  public registerHandlers(): void {
    this.registerOverlayHandlers();
  }

  private registerOverlayHandlers(): void {
    ipcMain.on('open-overlay', () => {
      this.windowManager.createOverlayWindow();
    });

    ipcMain.on('close-overlay', () => {
      this.windowManager.closeOverlayWindow();
    });
  }
}

