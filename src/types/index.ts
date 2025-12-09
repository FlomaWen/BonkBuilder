
export interface Character {
  id: string;
  name: string;
  image: string;
  defaultWeapon: string;
  defaultWeaponId: string;
}

export interface Weapon {
  id: string;
  name: string;
  image: string;
}

export interface Tome {
  id: string;
  name: string;
  image: string;
}

export interface Build {
  id: string;
  name: string;
  character: Character;
  weapons: Weapon[];
  tomes: Tome[];
  createdAt: Date;
}

export interface BuildState {
  character: Character | null;
  weapons: Weapon[];
  tomes: Tome[];
}

export interface WindowConfig {
  width: number;
  height: number;
  title: string;
  backgroundColor?: string;
  alwaysOnTop?: boolean;
  frame?: boolean;
  resizable?: boolean;
  skipTaskbar?: boolean;
  opacity?: number;
}

// Game capture configuration
export interface CaptureConfig {
  enabled: boolean;
  intervalMs: number;
  ocrConfidence: number;
  targetWindowTitle: string;
}

// OCR detection result
export interface OCRResult {
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

// Detected item from game
export interface DetectedItem {
  text: string;
  matchedItem: Character | Weapon | Tome | null;
  matchType: 'character' | 'weapon' | 'tome' | 'unknown';
  confidence: number;
}

// Level-up screen detection
export interface LevelUpDetection {
  isLevelUp: boolean;
  detectedItems: DetectedItem[];
  timestamp: Date;
}

// Suggestion for player
export interface ItemSuggestion {
  item: Character | Weapon | Tome;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  matchedText: string;
}

// Capture status events
export type CaptureStatus =
  | { status: 'idle' }
  | { status: 'searching'; message: string }
  | { status: 'capturing'; windowTitle: string }
  | { status: 'error'; error: string };

