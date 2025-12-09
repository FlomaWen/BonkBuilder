import { createWorker, Worker } from 'tesseract.js';
import sharp from 'sharp';
import { OCRResult } from '../../types';

export class OCRService {
  private worker: Worker | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize Tesseract worker
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.worker = await createWorker('eng');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR initialization failed');
    }
  }

  /**
   * Process image and extract text
   */
  async processImage(imageBuffer: Buffer): Promise<OCRResult[]> {
    if (!this.isInitialized || !this.worker) {
      throw new Error('OCR service not initialized');
    }

    try {
      // Preprocess image
      const preprocessed = await this.preprocessImage(imageBuffer);

      // Perform OCR
      const result = await this.worker.recognize(preprocessed);

      // Filter and format results
      const ocrResults: OCRResult[] = [];

      // Get text and split into words
      const text = result.data.text;
      const confidence = result.data.confidence;

      if (text && text.trim().length > 0) {
        // Split text into words
        const words = text.split(/\s+/).filter(w => w.trim().length > 0);

        for (const word of words) {
          ocrResults.push({
            text: word.trim(),
            confidence: confidence / 100, // Convert to 0-1 range
            bbox: { x: 0, y: 0, width: 0, height: 0 }, // We don't have precise coordinates
          });
        }
      }

      return ocrResults;
    } catch (error) {
      console.error('OCR processing error:', error);
      return [];
    }
  }

  /**
   * Preprocess image for better OCR accuracy
   */
  private async preprocessImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .grayscale()
        .normalise()
        .sharpen()
        .toBuffer();
    } catch (error) {
      console.error('Image preprocessing error:', error);
      return buffer; // Return original on error
    }
  }

  /**
   * Cleanup resources
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}
