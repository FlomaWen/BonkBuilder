import { EventEmitter } from 'events';
import { ScreenCaptureService } from './screen-capture-service';
import { LevelUpDetectionService } from './level-up-detection-service';
import { CaptureConfig, CaptureStatus, Build, GameEvent } from '../../types';

export class GameCaptureOrchestrator extends EventEmitter {
  private screenCaptureService: ScreenCaptureService;
  private levelUpDetectionService: LevelUpDetectionService;
  private _activeBuild: Build | null = null;
  private isMonitoring: boolean = false;

  constructor() {
    super();
    this.screenCaptureService = new ScreenCaptureService();
    this.levelUpDetectionService = new LevelUpDetectionService();
    this.setupListeners();
  }

  /**
   * Configure les écouteurs d'événements
   */
  private setupListeners(): void {
    // Transmettre les changements de statut
    this.screenCaptureService.on('status-changed', (status: CaptureStatus) => {
      this.emit('status-changed', status);
    });

    // Traiter les frames capturées
    this.screenCaptureService.on('frame-captured', (frameData: any) => {
      this.processFrame(frameData);
    });

    // Écouter les détections de level-up
    this.levelUpDetectionService.on('level-up-detected', (data: any) => {
      this.handleLevelUpDetected(data);
    });

    // Écouter la fin du level-up
    this.levelUpDetectionService.on('level-up-ended', (data: any) => {
      this.handleLevelUpEnded(data);
    });

    // Écouter les détections d'items du build
    this.levelUpDetectionService.on('build-items-detected', (data: any) => {
      this.handleBuildItemsDetected(data);
    });
  }

  /**
   * Démarre la surveillance du jeu
   */
  async startMonitoring(config: CaptureConfig): Promise<void> {
    if (this.isMonitoring) {
      console.warn('La surveillance est déjà en cours');
      return;
    }

    // Initialiser le service de détection de level-up
    try {
      await this.levelUpDetectionService.initialize();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service de level-up:', error);
      // On continue quand même, la détection de level-up n'est pas critique
    }

    const success = await this.screenCaptureService.startCapture(config);

    if (success) {
      this.isMonitoring = true;
      console.log('Surveillance du jeu démarrée');
    } else {
      throw new Error('Impossible de démarrer la capture d\'écran');
    }
  }

  /**
   * Arrête la surveillance du jeu
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.screenCaptureService.stopCapture();

    // Terminer le service de détection de level-up
    this.levelUpDetectionService.terminate().catch((error) => {
      console.error('Erreur lors de la terminaison du service de level-up:', error);
    });

    this.isMonitoring = false;
    console.log('Surveillance du jeu arrêtée');
  }

  /**
   * Définit le build actif pour l'analyse
   */
  setActiveBuild(build: Build | null): void {
    this._activeBuild = build;
    console.log('Build actif mis à jour:', build?.name || 'aucun');

    // Transmettre le build au service de détection de level-up
    this.levelUpDetectionService.setActiveBuild(build);
  }

  /**
   * Traite une frame capturée
   */
  private processFrame(frameData: {
    buffer: Buffer;
    width: number;
    height: number;
    timestamp: Date;
  }): void {
    // Analyser la frame pour détecter un level-up
    if (this.levelUpDetectionService.isReady()) {
      this.levelUpDetectionService.analyzeFrame(frameData).catch((error) => {
        console.error('Erreur lors de l\'analyse de la frame:', error);
      });
    }

    // Pour le moment, on émet simplement un événement avec les infos de la frame
    // Dans le futur, on pourra ajouter de l'analyse d'image ici
    const event: GameEvent = {
      timestamp: frameData.timestamp,
      type: 'item-detected',
      data: {
        frameSize: {
          width: frameData.width,
          height: frameData.height,
        },
        captureTime: frameData.timestamp,
        activeBuild: this._activeBuild?.name || null,
      },
    };

    this.emit('game-event', event);

    // Pour le debug : log toutes les 10 frames
    if (Math.random() < 0.1) {
      console.log(
        `Frame capturée: ${frameData.width}x${frameData.height} (${(frameData.buffer.length / 1024).toFixed(2)} KB)`,
        this._activeBuild ? `Build: ${this._activeBuild.name}` : 'Aucun build actif'
      );
    }
  }

  /**
   * Gère la détection d'un level-up
   */
  private handleLevelUpDetected(data: { timestamp: Date; detectedText: string }): void {
    console.log('Level-up détecté à', data.timestamp);

    const event: GameEvent = {
      timestamp: data.timestamp,
      type: 'level-up',
      data: {
        detectedText: data.detectedText,
        activeBuild: this._activeBuild?.name || null,
      },
    };

    this.emit('game-event', event);
  }

  /**
   * Gère la fin d'un level-up (texte disparu)
   */
  private handleLevelUpEnded(data: { timestamp: Date }): void {
    console.log('Level-up terminé à', data.timestamp);

    const event: GameEvent = {
      timestamp: data.timestamp,
      type: 'level-up-ended',
      data: {
        activeBuild: this._activeBuild?.name || null,
      },
    };

    this.emit('game-event', event);
  }

  /**
   * Gère la détection d'items du build dans les améliorations proposées
   */
  private handleBuildItemsDetected(data: { timestamp: Date; items: string[] }): void {
    console.log('Items du build détectés:', data.items);

    const event: GameEvent = {
      timestamp: data.timestamp,
      type: 'build-items-detected',
      data: {
        items: data.items,
        activeBuild: this._activeBuild?.name || null,
      },
    };

    this.emit('game-event', event);
  }

  /**
   * Vérifie si la surveillance est active
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Déclenche un level-up de test (pour le debug)
   */
  triggerTestLevelUp(): void {
    console.log('🧪 Simulation de level-up de test');
    this.handleLevelUpDetected({
      timestamp: new Date(),
      detectedText: 'AMELIORATIONSPROPOSEES (TEST)',
    });
  }
}
