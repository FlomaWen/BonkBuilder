import { desktopCapturer, DesktopCapturerSource } from 'electron';
import { EventEmitter } from 'events';
import { CaptureConfig, CaptureStatus } from '../../types';

export class ScreenCaptureService extends EventEmitter {
  private captureInterval: NodeJS.Timeout | null = null;
  private config: CaptureConfig | null = null;
  private isCapturing: boolean = false;
  private gameWindow: DesktopCapturerSource | null = null;

  /**
   * Start capturing
   */
  async startCapture(config: CaptureConfig): Promise<boolean> {
    if (this.isCapturing) {
      return true;
    }

    this.config = config;
    this.isCapturing = true;

    // Try to find the game window
    this.emitStatus({ status: 'searching', message: 'Looking for game window...' });

    const found = await this.findGameWindow();
    if (!found) {
      this.emitStatus({
        status: 'error',
        error: `Game window "${config.targetWindowTitle}" not found. Make sure the game is running.`,
      });
      this.isCapturing = false;
      return false;
    }

    // Start capture loop
    this.captureInterval = setInterval(() => {
      this.captureFrame();
    }, config.intervalMs);

    this.emitStatus({
      status: 'capturing',
      windowTitle: this.gameWindow?.name || config.targetWindowTitle,
    });

    return true;
  }

  /**
   * Stop capturing
   */
  stopCapture(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    this.isCapturing = false;
    this.gameWindow = null;
    this.emitStatus({ status: 'idle' });
  }

  /**
   * Find game window
   */
  private async findGameWindow(): Promise<boolean> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 1920, height: 1080 },
        fetchWindowIcons: false,
      });

      // Find window by title (case-insensitive, partial match)
      const targetTitle = this.config?.targetWindowTitle.toLowerCase() || 'megabonk';
      this.gameWindow =
        sources.find(source => source.name.toLowerCase().includes(targetTitle)) || null;

      return this.gameWindow !== null;
    } catch (error) {
      console.error('Error finding game window:', error);
      return false;
    }
  }

  /**
   * Capture single frame
   */
  private async captureFrame(): Promise<void> {
    if (!this.gameWindow) {
      // Try to re-find the window
      const found = await this.findGameWindow();
      if (!found) {
        return;
      }
    }

    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 1920, height: 1080 },
        fetchWindowIcons: false,
      });

      // Re-find the window (it might have changed ID)
      const targetTitle = this.config?.targetWindowTitle.toLowerCase() || 'megabonk';
      const currentWindow = sources.find(source => source.name.toLowerCase().includes(targetTitle));

      if (!currentWindow) {
        this.emitStatus({
          status: 'error',
          error: 'Game window lost. Make sure the game is still running.',
        });
        return;
      }

      // Get thumbnail and convert to buffer
      const thumbnail = currentWindow.thumbnail;

      // Check if thumbnail is empty
      if (thumbnail.isEmpty()) {
        console.warn('Thumbnail is empty, skipping frame');
        return;
      }

      const imageBuffer = thumbnail.toPNG();

      // Check if buffer is valid
      if (!imageBuffer || imageBuffer.length === 0) {
        console.warn('Image buffer is empty, skipping frame');
        return;
      }

      // For OCR, we don't need to extract ROI - use full image
      // This avoids issues with small images
      this.emit('frame-captured', imageBuffer);
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  }

  /**
   * Emit status change
   */
  private emitStatus(status: CaptureStatus): void {
    this.emit('status-changed', status);
  }
}
