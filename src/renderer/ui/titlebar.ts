/**
 * Gestion de la barre de titre personnalisée
 */

import { ipcRenderer } from 'electron';

export class TitleBar {
  private minimizeBtn: HTMLElement;
  private maximizeBtn: HTMLElement;
  private closeBtn: HTMLElement;

  constructor() {
    this.minimizeBtn = document.getElementById('minimize-btn')!;
    this.maximizeBtn = document.getElementById('maximize-btn')!;
    this.closeBtn = document.getElementById('close-btn')!;

    this.setupEventListeners();
  }

  /**
   * Configure les événements des boutons
   */
  private setupEventListeners(): void {
    // Bouton réduire
    this.minimizeBtn.addEventListener('click', () => {
      this.minimize();
    });

    // Bouton agrandir/restaurer
    this.maximizeBtn.addEventListener('click', () => {
      this.toggleMaximize();
    });

    // Bouton fermer
    this.closeBtn.addEventListener('click', () => {
      this.close();
    });

    // Écouter les changements d'état de la fenêtre
    window.addEventListener('resize', () => {
      this.updateMaximizeButton();
    });

    // Double-clic sur la barre de titre pour maximiser
    const dragRegion = document.querySelector('.titlebar-drag-region');
    if (dragRegion) {
      dragRegion.addEventListener('dblclick', () => {
        this.toggleMaximize();
      });
    }
  }

  /**
   * Réduit la fenêtre
   */
  private minimize(): void {
    ipcRenderer.send('window-minimize');
  }

  /**
   * Agrandit ou restaure la fenêtre
   */
  private toggleMaximize(): void {
    ipcRenderer.send('window-toggle-maximize');
  }

  /**
   * Ferme la fenêtre
   */
  private close(): void {
    ipcRenderer.send('window-close');
  }

  /**
   * Met à jour l'icône du bouton maximiser selon l'état de la fenêtre
   */
  private updateMaximizeButton(): void {
    // Demander l'état actuel de la fenêtre
    ipcRenderer.invoke('window-is-maximized').then((isMaximized: boolean) => {
      const svg = this.maximizeBtn.querySelector('svg');
      if (!svg) return;

      if (isMaximized) {
        // Icône "restaurer" (deux rectangles)
        svg.innerHTML = `
          <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <rect x="4" y="4" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
        `;
        this.maximizeBtn.title = 'Restaurer';
      } else {
        // Icône "maximiser" (un rectangle)
        svg.innerHTML = `
          <rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
        `;
        this.maximizeBtn.title = 'Agrandir';
      }
    });
  }
}

