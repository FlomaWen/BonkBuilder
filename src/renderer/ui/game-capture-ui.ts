/**
 * Gestionnaire de l'interface de capture d'écran
 */

import { ipcRenderer } from 'electron';
import { CaptureConfigService } from '../services/capture-config-service';
import { CaptureStatus, GameEvent } from '../../types';
import { MIN_INTERVAL_MS, MAX_INTERVAL_MS } from '../../constants/capture-config';

export class GameCaptureUI {
  private configService: CaptureConfigService;
  private isCapturing: boolean = false;

  // Éléments DOM
  private captureButton: HTMLElement | null;
  private statusIcon: HTMLElement | null;
  private statusText: HTMLElement | null;
  private windowTitleInput: HTMLInputElement | null;
  private intervalInput: HTMLInputElement | null;
  private intervalDisplay: HTMLElement | null;

  constructor() {
    this.configService = new CaptureConfigService();

    // Récupérer les éléments DOM
    this.captureButton = document.getElementById('capture-button');
    this.statusIcon = document.getElementById('capture-status-icon');
    this.statusText = document.getElementById('capture-status-text');
    this.windowTitleInput = document.getElementById('window-title-input') as HTMLInputElement;
    this.intervalInput = document.getElementById('interval-input') as HTMLInputElement;
    this.intervalDisplay = document.getElementById('interval-display');

    this.initialize();
    this.setupTestButton();
  }

  /**
   * Initialise l'interface et les événements
   */
  private initialize(): void {
    // Charger la configuration sauvegardée
    const config = this.configService.getConfig();

    if (this.windowTitleInput) {
      this.windowTitleInput.value = config.targetWindowTitle;
    }

    if (this.intervalInput) {
      this.intervalInput.value = config.intervalMs.toString();
      this.updateIntervalDisplay(config.intervalMs);
    }

    // Événements des contrôles
    if (this.captureButton) {
      this.captureButton.addEventListener('click', () => this.toggleCapture());
    }

    if (this.intervalInput) {
      this.intervalInput.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value, 10);
        this.updateIntervalDisplay(value);
        this.saveConfig();
      });
    }

    if (this.windowTitleInput) {
      this.windowTitleInput.addEventListener('change', () => this.saveConfig());
    }

    // Écouter les mises à jour de statut depuis le main process
    ipcRenderer.on('capture-status-changed', (_event, status: CaptureStatus) => {
      this.updateStatus(status);
    });

    // Écouter les événements du jeu
    ipcRenderer.on('game-event', (_event, event: GameEvent) => {
      this.handleGameEvent(event);
    });
  }

  /**
   * Bascule l'état de la capture (start/stop)
   */
  private toggleCapture(): void {
    if (this.isCapturing) {
      this.stopCapture();
    } else {
      this.startCapture();
    }
  }

  /**
   * Démarre la capture
   */
  private startCapture(): void {
    const config = this.configService.getConfig();
    config.enabled = true;

    // Envoyer la commande au main process
    ipcRenderer.send('start-capture', config);

    this.isCapturing = true;
    this.updateCaptureButton();
  }

  /**
   * Arrête la capture
   */
  private stopCapture(): void {
    ipcRenderer.send('stop-capture');

    this.isCapturing = false;
    this.updateCaptureButton();
  }

  /**
   * Met à jour l'affichage du bouton de capture
   */
  private updateCaptureButton(): void {
    if (!this.captureButton) return;

    if (this.isCapturing) {
      this.captureButton.textContent = '⏹️ Arrêter la capture';
      this.captureButton.classList.add('active');
    } else {
      this.captureButton.textContent = '▶️ Démarrer la capture';
      this.captureButton.classList.remove('active');
    }
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
        statusMessage = status.message || 'Prêt à capturer';
        break;
      case 'searching':
        statusMessage = status.message || 'Recherche de la fenêtre...';
        break;
      case 'capturing':
        statusMessage = `En cours : ${status.windowTitle || 'Capture active'}`;
        break;
      case 'error':
        statusMessage = `Erreur : ${status.error || 'Erreur inconnue'}`;
        // Réinitialiser l'état de capture en cas d'erreur
        this.isCapturing = false;
        this.updateCaptureButton();
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

  /**
   * Met à jour l'affichage de l'intervalle
   */
  private updateIntervalDisplay(value: number): void {
    if (!this.intervalDisplay) return;

    this.intervalDisplay.textContent = `${value}ms`;
  }

  /**
   * Sauvegarde la configuration
   */
  private saveConfig(): void {
    if (!this.windowTitleInput || !this.intervalInput) return;

    const config = this.configService.getConfig();

    config.targetWindowTitle = this.windowTitleInput.value;
    config.intervalMs = Math.max(
      MIN_INTERVAL_MS,
      Math.min(MAX_INTERVAL_MS, parseInt(this.intervalInput.value, 10))
    );

    this.configService.saveConfig(config);
  }

  /**
   * Configure le bouton de test de level-up
   */
  private setupTestButton(): void {
    const testButton = document.getElementById('test-levelup-button');
    if (testButton) {
      testButton.addEventListener('click', () => {
        console.log('🧪 Envoi d\'un événement de test de level-up');
        ipcRenderer.send('trigger-test-levelup');
      });
    }
  }
}
