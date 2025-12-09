import { distance } from 'fuzzball';
import { Character, Weapon, Tome, OCRResult, DetectedItem } from '../../types';

export class ItemMatchingService {
  private characters: Character[];
  private weapons: Weapon[];
  private tomes: Tome[];

  constructor(gameData: { characters: Character[]; weapons: Weapon[]; tomes: Tome[] }) {
    this.characters = gameData.characters;
    this.weapons = gameData.weapons;
    this.tomes = gameData.tomes;
  }

  /**
   * Match OCR results to game items
   */
  matchItems(ocrResults: OCRResult[]): DetectedItem[] {
    const detectedItems: DetectedItem[] = [];

    // Combine consecutive words that might be part of same item name
    const combinedTexts = this.combineTexts(ocrResults);

    for (const text of combinedTexts) {
      const detected = this.fuzzyMatch(text);
      if (detected) {
        detectedItems.push(detected);
      }
    }

    // Remove duplicates (same item detected multiple times)
    return this.removeDuplicates(detectedItems);
  }

  /**
   * Combine consecutive OCR results that might form item names
   */
  private combineTexts(ocrResults: OCRResult[]): string[] {
    const texts: string[] = [];

    // Single words
    for (const result of ocrResults) {
      texts.push(result.text);
    }

    // Two-word combinations
    for (let i = 0; i < ocrResults.length - 1; i++) {
      texts.push(`${ocrResults[i].text} ${ocrResults[i + 1].text}`);
    }

    // Three-word combinations
    for (let i = 0; i < ocrResults.length - 2; i++) {
      texts.push(`${ocrResults[i].text} ${ocrResults[i + 1].text} ${ocrResults[i + 2].text}`);
    }

    return texts;
  }

  /**
   * Fuzzy match single text string to item
   */
  private fuzzyMatch(text: string): DetectedItem | null {
    const normalizedText = this.normalizeText(text);

    let bestMatch: DetectedItem | null = null;
    let bestScore = 0;

    // Try matching against characters
    for (const character of this.characters) {
      const score = this.calculateSimilarity(normalizedText, this.normalizeText(character.name));
      if (score > bestScore && score >= 80) {
        bestScore = score;
        bestMatch = {
          text,
          matchedItem: character,
          matchType: 'character',
          confidence: score / 100,
        };
      }
    }

    // Try matching against weapons
    for (const weapon of this.weapons) {
      const score = this.calculateSimilarity(normalizedText, this.normalizeText(weapon.name));
      if (score > bestScore && score >= 80) {
        bestScore = score;
        bestMatch = {
          text,
          matchedItem: weapon,
          matchType: 'weapon',
          confidence: score / 100,
        };
      }
    }

    // Try matching against tomes
    for (const tome of this.tomes) {
      const score = this.calculateSimilarity(normalizedText, this.normalizeText(tome.name));
      if (score > bestScore && score >= 80) {
        bestScore = score;
        bestMatch = {
          text,
          matchedItem: tome,
          matchType: 'tome',
          confidence: score / 100,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Normalize text for better matching
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(a: string, b: string): number {
    return distance(a, b);
  }

  /**
   * Remove duplicate detections (same item detected multiple times)
   */
  private removeDuplicates(items: DetectedItem[]): DetectedItem[] {
    const seen = new Set<string>();
    const unique: DetectedItem[] = [];

    for (const item of items) {
      if (item.matchedItem) {
        const key = `${item.matchType}-${item.matchedItem.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      }
    }

    return unique;
  }
}
