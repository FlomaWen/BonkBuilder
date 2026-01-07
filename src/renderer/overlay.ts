/**
 * Script de l'overlay - Affiche le build actif et les suggestions de level-up
 */

// Initialiser l'API Electron
import './services/electron-api';
import { Build, GameEvent, Character, Weapon, Tome } from '../types';

class OverlayApp {
  private buildDisplay: HTMLElement | null;
  private noBuildMessage: HTMLElement | null;
  private characterDisplay: HTMLElement | null;
  private weaponsDisplay: HTMLElement | null;
  private tomesDisplay: HTMLElement | null;
  private buildTitle: HTMLElement | null;
  private suggestionPanel: HTMLElement | null;
  private currentBuild: Build | null = null;

  constructor() {
    this.buildDisplay = document.getElementById('build-display');
    this.noBuildMessage = document.getElementById('no-build-message');
    this.characterDisplay = document.getElementById('character-display');
    this.weaponsDisplay = document.getElementById('weapons-display');
    this.tomesDisplay = document.getElementById('tomes-display');
    this.buildTitle = document.getElementById('build-title');
    this.suggestionPanel = document.getElementById('suggestion-panel');

    this.initialize();
  }

  private initialize(): void {
    // Configurer les boutons de la titlebar
    this.setupTitlebar();

    // Écouter les mises à jour du build actif
    window.electronAPI.build.onActiveBuildUpdated((build: Build | null) => {
      console.log('Overlay: Build reçu:', build);
      this.updateBuildDisplay(build);
    });

    // Écouter les événements du jeu
    window.electronAPI.game.onEvent((event: GameEvent) => {
      this.handleGameEvent(event);
    });

    // Afficher le message "aucun build" par défaut
    this.showNoBuild();

    console.log('Overlay initialisé et en attente du build...');
  }

  private setupTitlebar(): void {
    const minimizeBtn = document.getElementById('minimize-btn');
    const closeBtn = document.getElementById('close-btn');

    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        window.electronAPI.overlay.minimize();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        window.electronAPI.overlay.close();
      });
    }
  }

  private updateBuildDisplay(build: Build | null): void {
    this.currentBuild = build;

    if (!build) {
      this.showNoBuild();
      return;
    }

    this.showBuild(build);
  }

  private showNoBuild(): void {
    if (this.noBuildMessage) this.noBuildMessage.style.display = 'block';
    if (this.buildDisplay) this.buildDisplay.style.display = 'none';
    if (this.buildTitle) this.buildTitle.textContent = '🎮 BonkData Overlay';
  }

  private showBuild(build: Build): void {
    if (this.noBuildMessage) this.noBuildMessage.style.display = 'none';
    if (this.buildDisplay) this.buildDisplay.style.display = 'block';
    if (this.buildTitle) this.buildTitle.textContent = `🎮 ${build.name}`;

    // Afficher le personnage
    if (this.characterDisplay && build.character) {
      this.characterDisplay.innerHTML = this.renderCharacter(build.character);
    }

    // Afficher les armes
    if (this.weaponsDisplay) {
      this.weaponsDisplay.innerHTML = build.weapons.map(w => this.renderWeapon(w)).join('');
    }

    // Afficher les tomes
    if (this.tomesDisplay) {
      this.tomesDisplay.innerHTML = build.tomes.map(t => this.renderTome(t)).join('');
    }
  }

  private renderCharacter(character: Character): string {
    return `
      <div class="character-card">
        <img src="${character.image}" alt="${character.name}" class="character-image" onerror="this.style.display='none'">
        <div class="character-info">
          <span class="character-name">${character.name}</span>
          <span class="default-weapon">${character.defaultWeapon}</span>
        </div>
      </div>
    `;
  }

  private renderWeapon(weapon: Weapon): string {
    return `
      <div class="item-card weapon-card" data-item-id="${weapon.id}">
        <img src="${weapon.image}" alt="${weapon.name}" class="item-image" onerror="this.style.display='none'">
        <span class="item-name">${weapon.name}</span>
      </div>
    `;
  }

  private renderTome(tome: Tome): string {
    return `
      <div class="item-card tome-card" data-item-id="${tome.id}">
        <img src="${tome.image}" alt="${tome.name}" class="item-image" onerror="this.style.display='none'">
        <span class="item-name">${tome.name}</span>
      </div>
    `;
  }

  private handleGameEvent(event: GameEvent): void {
    console.log('Overlay: Game event reçu:', event);

    switch (event.type) {
      case 'level-up':
        this.handleLevelUp(event.data);
        break;
      case 'level-up-ended':
        this.handleLevelUpEnd();
        break;
      case 'item-detected':
        this.highlightDetectedItems(event.data?.detectedItems || []);
        break;
      default:
        console.log('Overlay: Événement non géré:', event.type);
    }
  }

  private handleLevelUp(data: any): void {
    if (this.suggestionPanel) {
      this.suggestionPanel.style.display = 'block';
      this.suggestionPanel.innerHTML = `
        <div class="level-up-indicator">
          <span class="pulse">⬆️</span>
          <span>LEVEL UP!</span>
        </div>
      `;
    }

    // Mettre en surbrillance les items détectés
    if (data?.detectedItems) {
      this.highlightDetectedItems(data.detectedItems);
    }
  }

  private handleLevelUpEnd(): void {
    if (this.suggestionPanel) {
      this.suggestionPanel.style.display = 'none';
      this.suggestionPanel.innerHTML = '';
    }

    // Retirer les surbrillances
    this.clearHighlights();
  }

  private highlightDetectedItems(detectedItems: string[]): void {
    // Retirer les anciennes surbrillances
    this.clearHighlights();

    if (!this.currentBuild) return;

    // Normaliser les noms détectés
    const normalizedDetected = detectedItems.map(item =>
      item.toUpperCase().replace(/['\s-]/g, '')
    );

    // Chercher et highlighter les armes correspondantes
    const weaponCards = document.querySelectorAll('.weapon-card');
    weaponCards.forEach(card => {
      const nameEl = card.querySelector('.item-name');
      if (nameEl) {
        const itemName = nameEl.textContent?.toUpperCase().replace(/['\s-]/g, '') || '';
        if (normalizedDetected.some(d => d.includes(itemName) || itemName.includes(d))) {
          card.classList.add('highlighted', 'blink');
        }
      }
    });

    // Chercher et highlighter les tomes correspondants
    const tomeCards = document.querySelectorAll('.tome-card');
    tomeCards.forEach(card => {
      const nameEl = card.querySelector('.item-name');
      if (nameEl) {
        const itemName = nameEl.textContent?.toUpperCase().replace(/['\s-]/g, '') || '';
        if (normalizedDetected.some(d => d.includes(itemName) || itemName.includes(d))) {
          card.classList.add('highlighted', 'blink');
        }
      }
    });
  }

  private clearHighlights(): void {
    document.querySelectorAll('.highlighted').forEach(el => {
      el.classList.remove('highlighted', 'blink');
    });
  }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  new OverlayApp();
});

