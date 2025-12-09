import { Build, DetectedItem, ItemSuggestion, Character, Weapon, Tome } from '../../types';

export class SuggestionEngine {
  /**
   * Generate suggestions based on active build
   */
  generateSuggestions(detectedItems: DetectedItem[], activeBuild: Build | null): ItemSuggestion[] {
    const suggestions: ItemSuggestion[] = [];

    for (const detected of detectedItems) {
      if (!detected.matchedItem) {
        continue;
      }

      const { priority, reason } = this.calculatePriority(
        detected.matchedItem,
        detected.matchType,
        activeBuild
      );

      suggestions.push({
        item: detected.matchedItem,
        priority,
        reason,
        matchedText: detected.text,
      });
    }

    // Sort by priority: high -> medium -> low
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Calculate priority for an item
   */
  private calculatePriority(
    item: Character | Weapon | Tome,
    itemType: 'character' | 'weapon' | 'tome' | 'unknown',
    activeBuild: Build | null
  ): { priority: 'high' | 'medium' | 'low'; reason: string } {
    // If no active build, all items are medium priority
    if (!activeBuild) {
      return {
        priority: 'medium',
        reason: 'Consider for your build',
      };
    }

    // Characters are not usually in build selection screens
    if (itemType === 'character') {
      return {
        priority: 'low',
        reason: 'Character detected',
      };
    }

    // Check if item is in the build
    if (itemType === 'weapon') {
      const isInBuild = activeBuild.weapons.some(w => w.id === item.id);
      if (isInBuild) {
        return {
          priority: 'high',
          reason: 'In your build!',
        };
      }

      // Check if there's a slot available
      if (activeBuild.weapons.length < 3) {
        return {
          priority: 'medium',
          reason: 'Can add to your build',
        };
      }

      return {
        priority: 'low',
        reason: 'Not in your current build',
      };
    }

    if (itemType === 'tome') {
      const isInBuild = activeBuild.tomes.some(t => t.id === item.id);
      if (isInBuild) {
        return {
          priority: 'high',
          reason: 'In your build!',
        };
      }

      // Check if there's a slot available
      if (activeBuild.tomes.length < 4) {
        return {
          priority: 'medium',
          reason: 'Can add to your build',
        };
      }

      return {
        priority: 'low',
        reason: 'Not in your current build',
      };
    }

    // Unknown type
    return {
      priority: 'low',
      reason: 'Unknown item type',
    };
  }
}
