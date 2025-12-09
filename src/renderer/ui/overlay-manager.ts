/**
 * Gestionnaire de l'overlay
 */

import { ipcRenderer } from 'electron';
import { BuildService } from '../services/build-service';

export class OverlayManager {
  private openButton: HTMLElement | null;
  private closeButton: HTMLElement | null;
  private noBuildDiv: HTMLElement | null;
  private activeBuildDisplay: HTMLElement | null;
  private buildService: BuildService;

  constructor() {
    this.openButton = document.getElementById('open-overlay-window');
    this.closeButton = document.getElementById('close-overlay-btn');
    this.noBuildDiv = document.getElementById('no-active-build');
    this.activeBuildDisplay = document.getElementById('active-build-display');
    this.buildService = new BuildService();
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

    // Afficher le build actif si disponible
    this.updateActiveBuildDisplay();

    // Écouter les changements de build actif
    window.addEventListener('build-activated', () => {
      this.updateActiveBuildDisplay();
    });
  }

  private updateActiveBuildDisplay(): void {
    const activeBuild = this.buildService.getActiveBuild();

    if (!activeBuild) {
      if (this.noBuildDiv) this.noBuildDiv.style.display = 'block';
      if (this.activeBuildDisplay) this.activeBuildDisplay.style.display = 'none';
    } else {
      if (this.noBuildDiv) this.noBuildDiv.style.display = 'none';
      if (this.activeBuildDisplay) {
        this.activeBuildDisplay.style.display = 'block';
        this.activeBuildDisplay.innerHTML = `
          <h3>✅ Build actif : ${activeBuild.name}</h3>
          <div style="display: flex; gap: 20px; margin-top: 20px;">
            <div>
              <h4>Personnage</h4>
              <img src="${activeBuild.character.image}" alt="${activeBuild.character.name}" style="width: 80px; height: 80px; object-fit: contain;">
              <p>${activeBuild.character.name}</p>
            </div>
            <div>
              <h4>Armes (${activeBuild.weapons.length})</h4>
              <div style="display: flex; gap: 10px;">
                ${activeBuild.weapons.map(w => `<img src="${w.image}" alt="${w.name}" style="width: 50px; height: 50px; object-fit: contain;" title="${w.name}">`).join('')}
              </div>
            </div>
            <div>
              <h4>Tomes (${activeBuild.tomes.length})</h4>
              <div style="display: flex; gap: 10px;">
                ${activeBuild.tomes.map(t => `<img src="${t.image}" alt="${t.name}" style="width: 50px; height: 50px; object-fit: contain;" title="${t.name}">`).join('')}
              </div>
            </div>
          </div>
        `;
      }
    }
  }

  private openOverlay(): void {
    ipcRenderer.send('open-overlay');
  }

  private closeOverlay(): void {
    ipcRenderer.send('close-overlay');
  }
}

