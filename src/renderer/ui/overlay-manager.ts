/**
 * Gestionnaire de l'overlay
 */

import { ipcRenderer } from 'electron';

export class OverlayManager {
  private openButton: HTMLElement | null;
  private closeButton: HTMLElement | null;

  constructor() {
    this.openButton = document.getElementById('open-overlay-btn');
    this.closeButton = document.getElementById('close-overlay-btn');
    this.initialize();
  }

  /**
   * Initialise les événements
   */
  private initialize(): void {
    if (this.openButton) {
      this.openButton.addEventListener('click', () => this.openOverlay());
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.closeOverlay());
    }
  }

  private openOverlay(): void {
    ipcRenderer.send('open-overlay');
  }

  private closeOverlay(): void {
    ipcRenderer.send('close-overlay');
  }
}

