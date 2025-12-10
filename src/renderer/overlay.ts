
import { Build, GameEvent } from '../types';
import { WEAPONS } from '../constants/game-data';
import { ipcRenderer } from 'electron';
import { OverlayTitleBar } from './ui/overlay-titlebar';

class OverlayRenderer {
  private noBuildDiv: HTMLElement | null;
  private buildDisplay: HTMLElement | null;
  private suggestionPanel: HTMLElement | null;

  constructor() {
    // Initialiser la barre de titre
    new OverlayTitleBar();

    this.noBuildDiv = document.getElementById('no-build-message');
    this.buildDisplay = document.getElementById('build-display');
    this.suggestionPanel = document.getElementById('suggestion-panel');
    this.initialize();
  }

  private initialize(): void {
    // Charger le build actif au démarrage depuis localStorage
    this.loadActiveBuild();

    // Écouter les mises à jour de build via IPC
    ipcRenderer.on('active-build-updated', (_event, build: Build) => {
      if (build) {
        this.displayBuild(build);
      } else {
        this.showNoBuild();
      }
    });

    // Écouter les événements du jeu
    ipcRenderer.on('game-event', (_event, event: GameEvent) => {
      this.handleGameEvent(event);
    });
  }

  private loadActiveBuild(): void {
    const activeBuildId = localStorage.getItem('bonkdata_active_build');

    if (!activeBuildId) {
      this.showNoBuild();
      return;
    }

    const savedBuildsStr = localStorage.getItem('bonkdata_builds');
    const savedBuilds: Build[] = JSON.parse(savedBuildsStr || '[]');
    const build = savedBuilds.find(b => b.id === activeBuildId);

    if (!build) {
      this.showNoBuild();
      return;
    }

    this.displayBuild(build);
  }

  private showNoBuild(): void {
    if (this.noBuildDiv && this.buildDisplay) {
      this.noBuildDiv.style.display = 'block';
      this.buildDisplay.style.display = 'none';
    }
  }

  private displayBuild(build: Build): void {
    if (!this.noBuildDiv || !this.buildDisplay) return;

    this.noBuildDiv.style.display = 'none';
    this.buildDisplay.style.display = 'block';

    const titleEl = document.getElementById('build-title');
    if (titleEl) {
      titleEl.textContent = `🎮 ${build.name || build.character.name}`;
    }

    this.displayCharacter(build);
    this.displayWeapons(build);
    this.displayTomes(build);
  }

  private displayCharacter(build: Build): void {
    const characterDisplay = document.getElementById('character-display');
    if (!characterDisplay) return;

    characterDisplay.innerHTML = `
      <div class="character-card">
        <img src="${build.character.image}" alt="${build.character.name}" />
        <span class="character-name">${build.character.name}</span>
      </div>
    `;
  }

  private displayWeapons(build: Build): void {
    const weaponsDisplay = document.getElementById('weapons-display');
    if (!weaponsDisplay) return;

    const defaultWeapon = WEAPONS.find(w => w.id === build.character.defaultWeaponId);
    let weaponsHTML = '';

    if (defaultWeapon) {
      weaponsHTML += `
        <div class="item-card default">
          <span class="item-number default">★</span>
          <img src="${defaultWeapon.image}" alt="${defaultWeapon.name}" />
          <span class="item-name">${defaultWeapon.name}</span>
        </div>
      `;
    }

    build.weapons.forEach((weapon, index) => {
      weaponsHTML += `
        <div class="item-card">
          <span class="item-number">${index + 2}</span>
          <img src="${weapon.image}" alt="${weapon.name}" />
          <span class="item-name">${weapon.name}</span>
        </div>
      `;
    });

    weaponsDisplay.innerHTML = weaponsHTML;
  }

  private displayTomes(build: Build): void {
    const tomesDisplay = document.getElementById('tomes-display');
    if (!tomesDisplay) return;

    let tomesHTML = '';

    build.tomes.forEach((tome, index) => {
      tomesHTML += `
        <div class="item-card">
          <span class="item-number">${index + 1}</span>
          <img src="${tome.image}" alt="${tome.name}" />
          <span class="item-name">${tome.name}</span>
        </div>
      `;
    });

    tomesDisplay.innerHTML = tomesHTML;
  }

  /**
   * Gère les événements du jeu
   */
  private handleGameEvent(event: GameEvent): void {
    console.log('Game event received:', event);

    if (event.type === 'level-up') {
      this.showLevelUpMessage();
    } else if (event.type === 'level-up-ended') {
      this.hideLevelUpMessage();
      this.clearHighlightedItems();
    } else if (event.type === 'build-items-detected') {
      this.highlightDetectedItems(event.data.items);
    }
  }

  /**
   * Affiche l'indicateur de level-up
   */
  private showLevelUpMessage(): void {
    if (!this.suggestionPanel) return;

    console.log('🎉 Affichage de l\'indicateur de level-up dans l\'overlay');

    // Afficher le panneau avec un style très visible
    this.suggestionPanel.style.display = 'block';
    this.suggestionPanel.innerHTML = `
      <div class="suggestion-header">
        <h3 style="font-size: 2rem; text-transform: uppercase; animation: pulse 1s infinite;">
          YOUHOU
        </h3>
        <p style="font-size: 1.2rem; margin-top: 10px;">
          Level-up détecté !
        </p>
      </div>
    `;
  }

  /**
   * Masque l'indicateur de level-up
   */
  private hideLevelUpMessage(): void {
    if (!this.suggestionPanel) return;

    console.log('✅ Masquage de l\'indicateur de level-up (texte disparu)');
    this.suggestionPanel.style.display = 'none';
  }

  /**
   * Met en surbrillance les items détectés sur l'écran
   */
  private highlightDetectedItems(detectedItems: string[]): void {
    console.log('🎯 Items à mettre en surbrillance:', detectedItems);

    // Nettoyer d'abord tous les highlights
    this.clearHighlightedItems();

    // Pour chaque item détecté, ajouter la classe de highlight
    detectedItems.forEach((itemName) => {
      // Chercher dans les armes
      const weaponsDisplay = document.getElementById('weapons-display');
      if (weaponsDisplay) {
        const itemCards = weaponsDisplay.querySelectorAll('.item-card');
        itemCards.forEach((card) => {
          const nameElement = card.querySelector('.item-name');
          if (nameElement) {
            const cardItemName = nameElement.textContent?.toUpperCase().replace(/\s+/g, '') || '';
            if (cardItemName === itemName) {
              card.classList.add('highlight-detected');
              console.log('✅ Arme mise en surbrillance:', nameElement.textContent);
            }
          }
        });
      }

      // Chercher dans les tomes
      const tomesDisplay = document.getElementById('tomes-display');
      if (tomesDisplay) {
        const itemCards = tomesDisplay.querySelectorAll('.item-card');
        itemCards.forEach((card) => {
          const nameElement = card.querySelector('.item-name');
          if (nameElement) {
            const cardItemName = nameElement.textContent?.toUpperCase().replace(/\s+/g, '') || '';
            if (cardItemName === itemName) {
              card.classList.add('highlight-detected');
              console.log('✅ Tome mis en surbrillance:', nameElement.textContent);
            }
          }
        });
      }
    });
  }

  /**
   * Retire la surbrillance de tous les items
   */
  private clearHighlightedItems(): void {
    const allItemCards = document.querySelectorAll('.item-card.highlight-detected');
    allItemCards.forEach((card) => {
      card.classList.remove('highlight-detected');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OverlayRenderer();
});

