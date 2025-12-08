
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

