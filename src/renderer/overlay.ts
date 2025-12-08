
import { Build } from '../types';
import { WEAPONS } from '../constants/game-data';

class OverlayRenderer {
  private noBuildDiv: HTMLElement | null;
  private buildDisplay: HTMLElement | null;

  constructor() {
    this.noBuildDiv = document.getElementById('no-build-message');
    this.buildDisplay = document.getElementById('build-display');
    this.initialize();
  }

  private initialize(): void {
    this.loadActiveBuild();
    setInterval(() => this.loadActiveBuild(), 5000);
  }

  private loadActiveBuild(): void {
    const activeBuildId = parseInt(localStorage.getItem('bonkdata_active_build') || '0');

    if (!activeBuildId) {
      this.showNoBuild();
      return;
    }

    const savedBuilds: Build[] = JSON.parse(localStorage.getItem('bonkdata_builds') || '[]');
    const build = savedBuilds.find(b => b.id === activeBuildId.toString());

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
}

document.addEventListener('DOMContentLoaded', () => {
  new OverlayRenderer();
});

