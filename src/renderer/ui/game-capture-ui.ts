/**
 * Gestionnaire de l'interface de capture d'écran
 */

import { CaptureStatus, GameEvent } from '../../types';

export class GameCaptureUI {
  // Éléments DOM
  private statusIcon: HTMLElement | null;
  private statusText: HTMLElement | null;

  constructor() {
    // Récupérer les éléments DOM (juste le statut)
    this.statusIcon = document.getElementById('capture-status-icon');
    this.statusText = document.getElementById('capture-status-text');

    this.initialize();
  }

  /**
   * Initialise l'interface et les événements
   */
  private initialize(): void {
    // Écouter les mises à jour de statut depuis le main process
    window.electronAPI.capture.onStatusChanged((status: CaptureStatus) => {
      this.updateStatus(status);
    });

    // Écouter les événements du jeu
    window.electronAPI.game.onEvent((event: GameEvent) => {
      this.handleGameEvent(event);
    });
  }

  /**
   * Met à jour le statut de capture
   */
  private updateStatus(status: CaptureStatus): void {
    if (!this.statusIcon || !this.statusText) return;

    // Mettre à jour l'icône
    this.statusIcon.className = 'status-icon ' + status.status;

    // Mettre à jour le texte
    let statusMessage = '';
    switch (status.status) {
      case 'idle':
        statusMessage = 'La capture démarrera à l\'ouverture de l\'overlay';
        break;
      case 'searching':
        statusMessage = status.message || 'Recherche de la fenêtre...';
        break;
      case 'capturing':
        statusMessage = `En cours : ${status.windowTitle || 'Capture active'}`;
        break;
      case 'error':
        statusMessage = `Erreur : ${status.error || 'Erreur inconnue'}`;
        break;
    }

    this.statusText.textContent = statusMessage;
  }

  /**
   * Gère les événements du jeu
   */
  private handleGameEvent(event: GameEvent): void {
    // Pour le moment, on log juste les événements
    console.log('Événement du jeu:', event);

    // Dans le futur, on pourra afficher des notifications, mettre à jour l'overlay, etc.
  }
}

