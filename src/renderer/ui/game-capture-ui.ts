import { ipcRenderer } from 'electron';
import { CaptureStatus, CaptureConfig } from '../../types';
import { CaptureConfigService } from '../services/capture-config-service';

export class GameCaptureUI {
  private captureButton: HTMLButtonElement | null;
  private statusText: HTMLElement | null;
  private statusIcon: HTMLElement | null;
  private configService: CaptureConfigService;
  private isCapturing: boolean = false;

  // Settings inputs
  private intervalInput: HTMLInputElement | null;
  private confidenceInput: HTMLInputElement | null;
  private windowTitleInput: HTMLInputElement | null;
  private intervalDisplay: HTMLElement | null;
  private confidenceDisplay: HTMLElement | null;

  constructor() {
    this.configService = new CaptureConfigService();

    // Get DOM elements
    this.captureButton = document.getElementById('toggle-capture-btn') as HTMLButtonElement;
    this.statusText = document.getElementById('capture-status-text');
    this.statusIcon = document.querySelector('.capture-status .status-icon');

    // Settings inputs
    this.intervalInput = document.getElementById('capture-interval') as HTMLInputElement;
    this.confidenceInput = document.getElementById('ocr-confidence') as HTMLInputElement;
    this.windowTitleInput = document.getElementById('game-window-title') as HTMLInputElement;
    this.intervalDisplay = document.getElementById('interval-display');
    this.confidenceDisplay = document.getElementById('confidence-display');

    this.initialize();
  }

  /**
   * Initialize UI and event listeners
   */
  private initialize(): void {
    this.loadSettings();
    this.setupEventListeners();
    this.registerIPCListeners();
  }

  /**
   * Load settings from config service
   */
  private loadSettings(): void {
    const config = this.configService.getConfig();

    if (this.intervalInput) {
      this.intervalInput.value = config.intervalMs.toString();
      this.updateIntervalDisplay(config.intervalMs);
    }

    if (this.confidenceInput) {
      this.confidenceInput.value = (config.ocrConfidence * 100).toString();
      this.updateConfidenceDisplay(config.ocrConfidence);
    }

    if (this.windowTitleInput) {
      this.windowTitleInput.value = config.targetWindowTitle;
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Toggle capture button
    if (this.captureButton) {
      this.captureButton.addEventListener('click', () => this.toggleCapture());
    }

    // Settings inputs
    if (this.intervalInput) {
      this.intervalInput.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value);
        this.updateIntervalDisplay(value);
      });
    }

    if (this.confidenceInput) {
      this.confidenceInput.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value) / 100;
        this.updateConfidenceDisplay(value);
      });
    }
  }

  /**
   * Register IPC listeners
   */
  private registerIPCListeners(): void {
    ipcRenderer.on('game-capture-status', (_event, status: CaptureStatus) => {
      this.updateStatus(status);
    });
  }

  /**
   * Toggle capture on/off
   */
  private toggleCapture(): void {
    if (this.isCapturing) {
      this.stopCapture();
    } else {
      this.startCapture();
    }
  }

  /**
   * Start capture
   */
  private startCapture(): void {
    const config = this.getCurrentConfig();

    // Save config
    this.configService.saveConfig(config);

    // Send IPC to main process
    ipcRenderer.send('start-game-capture', config);

    this.isCapturing = true;
    this.updateButtonState();
  }

  /**
   * Stop capture
   */
  private stopCapture(): void {
    ipcRenderer.send('stop-game-capture');
    this.isCapturing = false;
    this.updateButtonState();
    this.updateStatus({ status: 'idle' });
  }

  /**
   * Get current configuration from UI
   */
  private getCurrentConfig(): CaptureConfig {
    return {
      enabled: true,
      intervalMs: parseInt(this.intervalInput?.value || '500'),
      ocrConfidence: parseInt(this.confidenceInput?.value || '60') / 100,
      targetWindowTitle: this.windowTitleInput?.value || 'MEGABONK',
    };
  }

  /**
   * Update button state
   */
  private updateButtonState(): void {
    if (!this.captureButton) return;

    if (this.isCapturing) {
      this.captureButton.textContent = '⏸️ Stop Tracking';
      this.captureButton.classList.add('active');
    } else {
      this.captureButton.textContent = '▶️ Start Tracking MEGABONK';
      this.captureButton.classList.remove('active');
    }
  }

  /**
   * Update status display
   */
  private updateStatus(status: CaptureStatus): void {
    if (!this.statusText || !this.statusIcon) return;

    switch (status.status) {
      case 'idle':
        this.statusIcon.textContent = '⚪';
        this.statusText.textContent = 'Ready to track';
        break;

      case 'searching':
        this.statusIcon.textContent = '🔍';
        this.statusText.textContent = status.message;
        break;

      case 'capturing':
        this.statusIcon.textContent = '🟢';
        this.statusText.textContent = `Monitoring ${status.windowTitle}`;
        break;

      case 'error':
        this.statusIcon.textContent = '🔴';
        this.statusText.textContent = `Error: ${status.error}`;
        this.isCapturing = false;
        this.updateButtonState();
        break;
    }
  }

  /**
   * Update interval display
   */
  private updateIntervalDisplay(value: number): void {
    if (this.intervalDisplay) {
      this.intervalDisplay.textContent = `${value}ms`;
    }
  }

  /**
   * Update confidence display
   */
  private updateConfidenceDisplay(value: number): void {
    if (this.confidenceDisplay) {
      this.confidenceDisplay.textContent = `${Math.round(value * 100)}%`;
    }
  }
}
