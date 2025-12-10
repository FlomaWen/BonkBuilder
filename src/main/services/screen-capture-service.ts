import { desktopCapturer, DesktopCapturerSource } from 'electron';
import { EventEmitter } from 'events';
import { CaptureConfig, CaptureStatus } from '../../types';

export class ScreenCaptureService extends EventEmitter {
  private captureInterval: NodeJS.Timeout | null = null;
  private currentWindow: DesktopCapturerSource | null = null;
  private config: CaptureConfig | null = null;

  /**
   * Démarre la capture d'écran
   */
  async startCapture(config: CaptureConfig): Promise<boolean> {
    this.config = config;

    // Trouver la fenêtre du jeu
    this.emitStatus({ status: 'searching', message: `Recherche de la fenêtre "${config.targetWindowTitle}"...` });

    this.currentWindow = await this.findGameWindow(config.targetWindowTitle);

    if (!this.currentWindow) {
      this.emitStatus({
        status: 'error',
        error: `Fenêtre "${config.targetWindowTitle}" introuvable. Assurez-vous que le jeu est lancé.`
      });
      return false;
    }

    this.emitStatus({
      status: 'capturing',
      windowTitle: this.currentWindow.name,
      message: `Capture en cours de "${this.currentWindow.name}"`
    });

    // Démarrer la capture périodique
    this.captureInterval = setInterval(() => {
      this.captureFrame();
    }, config.intervalMs);

    // Capturer immédiatement la première frame
    this.captureFrame();

    return true;
  }

  /**
   * Arrête la capture d'écran
   */
  stopCapture(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    this.currentWindow = null;
    this.config = null;

    this.emitStatus({ status: 'idle', message: 'Capture arrêtée' });
  }

  /**
   * Trouve la fenêtre du jeu par son titre
   */
  private async findGameWindow(title: string): Promise<DesktopCapturerSource | null> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 1920, height: 1080 },
      });

      // Recherche case-insensitive et correspondance partielle
      const targetLower = title.toLowerCase();
      const found = sources.find(source =>
        source.name.toLowerCase().includes(targetLower)
      );

      return found || null;
    } catch (error) {
      console.error('Erreur lors de la recherche de fenêtre:', error);
      return null;
    }
  }

  /**
   * Capture une frame de la fenêtre actuelle
   */
  private async captureFrame(): Promise<void> {
    if (!this.config || !this.currentWindow) {
      return;
    }

    try {
      // Re-capturer les sources pour obtenir la dernière frame
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 1920, height: 1080 },
      });

      const window = sources.find(s => s.id === this.currentWindow!.id);

      if (!window) {
        // La fenêtre a été fermée, essayer de la retrouver
        console.warn('Fenêtre perdue, tentative de récupération...');
        const newWindow = await this.findGameWindow(this.config.targetWindowTitle);

        if (newWindow) {
          this.currentWindow = newWindow;
          this.emitStatus({
            status: 'capturing',
            windowTitle: newWindow.name,
            message: `Fenêtre retrouvée : "${newWindow.name}"`
          });
        } else {
          this.emitStatus({
            status: 'error',
            error: 'Fenêtre perdue et impossible à retrouver'
          });
          this.stopCapture();
        }
        return;
      }

      // Convertir le thumbnail en buffer PNG
      const thumbnail = window.thumbnail;
      const pngBuffer = thumbnail.toPNG();

      // Émettre la frame capturée
      this.emit('frame-captured', {
        buffer: pngBuffer,
        width: thumbnail.getSize().width,
        height: thumbnail.getSize().height,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Erreur lors de la capture de frame:', error);
      this.emitStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur de capture'
      });
    }
  }

  /**
   * Émet un changement de statut
   */
  private emitStatus(status: CaptureStatus): void {
    this.emit('status-changed', status);
  }
}
