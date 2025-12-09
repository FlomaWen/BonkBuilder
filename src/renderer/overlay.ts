
import { Build, ItemSuggestion } from '../types';
import { WEAPONS } from '../constants/game-data';
import { ipcRenderer } from 'electron';

class OverlayRenderer {
  private noBuildDiv: HTMLElement | null;
  private buildDisplay: HTMLElement | null;
  private suggestionPanel: HTMLElement | null;
  private suggestionTimeout: NodeJS.Timeout | null = null;

  constructor() {
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

    // Écouter les suggestions de level-up
    this.registerSuggestionListener();
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
   * Register listener for level-up suggestions
   */
  private registerSuggestionListener(): void {
    ipcRenderer.on('level-up-detected', (_event, suggestions: ItemSuggestion[]) => {
      this.displaySuggestions(suggestions);
    });
  }

  /**
   * Display suggestions in overlay
   */
  private displaySuggestions(suggestions: ItemSuggestion[]): void {
    if (!this.suggestionPanel) return;

    // Clear existing timeout
    if (this.suggestionTimeout) {
      clearTimeout(this.suggestionTimeout);
    }

    if (suggestions.length === 0) {
      this.suggestionPanel.style.display = 'none';
      return;
    }

    this.suggestionPanel.style.display = 'block';

    // Sort by priority (already sorted from engine, but double-check)
    const sorted = [...suggestions].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Render suggestions
    const html = sorted
      .map((suggestion, index) => {
        const priorityClass = `priority-${suggestion.priority}`;

        return `
        <div class="suggestion-item ${priorityClass}" style="animation-delay: ${index * 0.1}s">
          <div class="suggestion-rank">${index + 1}</div>
          <img src="${suggestion.item.image}" alt="${suggestion.item.name}" />
          <div class="suggestion-details">
            <div class="suggestion-name">${suggestion.item.name}</div>
            <div class="suggestion-reason">${suggestion.reason}</div>
          </div>
          <div class="suggestion-priority-badge">${suggestion.priority.toUpperCase()}</div>
        </div>
      `;
      })
      .join('');

    this.suggestionPanel.innerHTML = `
      <div class="suggestion-header">
        <h3>LEVEL UP!</h3>
        <p>Pick the best item:</p>
      </div>
      <div class="suggestion-list">${html}</div>
    `;

    // Auto-hide after 10 seconds
    this.suggestionTimeout = setTimeout(() => {
      if (this.suggestionPanel) {
        this.suggestionPanel.style.display = 'none';
      }
    }, 10000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OverlayRenderer();
});

