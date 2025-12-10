/**
 * Gestion de la barre de titre personnalisée pour l'overlay
 */

import { ipcRenderer } from 'electron';

export class OverlayTitleBar {
  private minimizeBtn: HTMLElement | null;
  private closeBtn: HTMLElement | null;

  constructor() {
    this.minimizeBtn = document.getElementById('minimize-btn');
    this.closeBtn = document.getElementById('close-btn');

    this.setupEventListeners();
  }

  /**
   * Configure les événements des boutons
   */
  private setupEventListeners(): void {
    // Bouton réduire
    if (this.minimizeBtn) {
      this.minimizeBtn.addEventListener('click', () => {
        this.minimize();
      });
    }

    // Bouton fermer
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.close();
      });
    }
  }

  /**
   * Réduit la fenêtre overlay
   */
  private minimize(): void {
    ipcRenderer.send('overlay-minimize');
  }

  /**
   * Ferme la fenêtre overlay
   */
  private close(): void {
    ipcRenderer.send('close-overlay');
  }
}

