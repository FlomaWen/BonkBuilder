import { DetectedItem } from '../../types';

export class LevelUpDetectionService {
  private lastDetectionTime: Date | null = null;
  private debounceMs: number = 5000; // Don't trigger again within 5 seconds

  /**
   * Check if current frame is a level-up screen
   */
  isLevelUpScreen(detectedItems: DetectedItem[]): boolean {
    // Filter out items with low confidence
    const highConfidenceItems = detectedItems.filter(
      item => item.matchedItem !== null && item.confidence >= 0.7
    );

    // Level-up screen should have 3-4 items
    if (highConfidenceItems.length < 3 || highConfidenceItems.length > 4) {
      return false;
    }

    // Check that detected items are different (not same item multiple times)
    const uniqueIds = new Set(
      highConfidenceItems.map(item => item.matchedItem?.id).filter(Boolean)
    );

    return uniqueIds.size >= 3;
  }

  /**
   * Check if we should trigger (debounce)
   */
  shouldTrigger(): boolean {
    if (!this.lastDetectionTime) {
      return true;
    }

    const timeSinceLastDetection = Date.now() - this.lastDetectionTime.getTime();
    return timeSinceLastDetection >= this.debounceMs;
  }

  /**
   * Update last detection time
   */
  recordDetection(): void {
    this.lastDetectionTime = new Date();
  }

  /**
   * Reset detection state (call when no items detected for a while)
   */
  reset(): void {
    this.lastDetectionTime = null;
  }
}
