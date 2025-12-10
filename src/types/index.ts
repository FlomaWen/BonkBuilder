
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

// Capture d'écran et analyse
export interface CaptureConfig {
  enabled: boolean;
  intervalMs: number;
  targetWindowTitle: string;
}

export interface CaptureStatus {
  status: 'idle' | 'searching' | 'capturing' | 'error';
  message?: string;
  windowTitle?: string;
  error?: string;
}

export interface DetectedItem {
  itemId: string;
  type: 'character' | 'weapon' | 'tome';
  name: string;
  confidence: number;
  detectionTime: Date;
}

export interface GameEvent {
  timestamp: Date;
  type: 'level-up' | 'level-up-ended' | 'build-items-detected' | 'item-detected' | 'game-start' | 'game-end';
  data: any;
}

