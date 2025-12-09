import { EventEmitter } from 'events';
import { CaptureConfig, CaptureStatus, Build } from '../../types';
import { ScreenCaptureService } from './screen-capture-service';
import { OCRService } from './ocr-service';
import { ItemMatchingService } from './item-matching-service';
import { LevelUpDetectionService } from './level-up-detection-service';
import { SuggestionEngine } from './suggestion-engine';
import { CHARACTERS, WEAPONS, TOMES } from '../../constants/game-data';

export class GameCaptureOrchestrator extends EventEmitter {
  private screenCapture: ScreenCaptureService;
  private ocrService: OCRService;
  private itemMatcher: ItemMatchingService;
  private levelUpDetector: LevelUpDetectionService;
  private suggestionEngine: SuggestionEngine;
  private isInitialized: boolean = false;
  private activeBuild: Build | null = null;

  constructor() {
    super();
    this.screenCapture = new ScreenCaptureService();
    this.ocrService = new OCRService();
    this.itemMatcher = new ItemMatchingService({
      characters: CHARACTERS,
      weapons: WEAPONS,
      tomes: TOMES,
    });
    this.levelUpDetector = new LevelUpDetectionService();
    this.suggestionEngine = new SuggestionEngine();
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.ocrService.initialize();
      this.setupEventListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize GameCaptureOrchestrator:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners for screen capture
   */
  private setupEventListeners(): void {
    this.screenCapture.on('frame-captured', (frameBuffer: Buffer) => {
      this.processFrame(frameBuffer);
    });

    this.screenCapture.on('status-changed', (status: CaptureStatus) => {
      this.emit('status-changed', status);
    });
  }

  /**
   * Start game monitoring
   */
  async startMonitoring(config: CaptureConfig): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    await this.screenCapture.startCapture(config);
  }

  /**
   * Stop game monitoring
   */
  stopMonitoring(): void {
    this.screenCapture.stopCapture();
  }

  /**
   * Set active build (call this when build changes)
   */
  setActiveBuild(build: Build | null): void {
    this.activeBuild = build;
  }

  /**
   * Process captured frame (main pipeline)
   */
  private async processFrame(frameBuffer: Buffer): Promise<void> {
    try {
      // Step 1: OCR
      const ocrResults = await this.ocrService.processImage(frameBuffer);

      if (ocrResults.length === 0) {
        return; // No text detected
      }

      // Step 2: Match items
      const detectedItems = this.itemMatcher.matchItems(ocrResults);
      const matchedCount = detectedItems.filter(d => d.matchedItem !== null).length;

      if (matchedCount < 3) {
        return; // Not enough items for level-up screen
      }

      // Step 3: Check if level-up screen
      const isLevelUp = this.levelUpDetector.isLevelUpScreen(detectedItems);

      if (!isLevelUp) {
        return;
      }

      if (!this.levelUpDetector.shouldTrigger()) {
        return; // Debounced
      }

      // Step 4: Generate suggestions
      const suggestions = this.suggestionEngine.generateSuggestions(detectedItems, this.activeBuild);

      // Step 5: Emit event
      this.emit('level-up-detected', suggestions);
      this.levelUpDetector.recordDetection();
    } catch (error) {
      console.error('Error processing frame:', error);
    }
  }

  /**
   * Cleanup resources
   */
  async terminate(): Promise<void> {
    this.stopMonitoring();
    await this.ocrService.terminate();
    this.isInitialized = false;
  }
}
