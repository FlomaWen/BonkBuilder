/**
 * Point d'entrée du processus renderer
 */

import { TabManager } from './ui/tab-manager';
import { BuildUI } from './ui/build-ui';
import { OverlayManager } from './ui/overlay-manager';

class RendererApp {
  constructor() {
    // Initialisation des composants UI
    new TabManager();
    new BuildUI();
    new OverlayManager();
  }

  /**
   * Initialise application renderer
   */
  public initialize(): void {
    console.log('BonkBuilder Renderer initialized');
    this.checkOverwolfSupport();
  }

  /**
   * Vérifie le support Overwolf
   */
  private checkOverwolfSupport(): void {
    const statusElement = document.getElementById('overwolf-status');
    const statusText = document.getElementById('status-text');

    if (!statusElement || !statusText) return;

    statusElement.classList.add('status-offline');
    statusText.textContent = 'Overwolf non détecté (Mode Electron)';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new RendererApp();
  app.initialize();
});

