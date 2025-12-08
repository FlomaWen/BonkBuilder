/**
 * Gestion de l'interface utilisateur pour la création de builds
 */

import { BuildState, Character, Weapon, Tome, Build } from '../../types';
import { CHARACTERS, WEAPONS, TOMES } from '../../constants/game-data';
import { BuildService } from '../services/build-service';

export class BuildUI {
  private buildState: BuildState;
  private buildService: BuildService;

  // Éléments DOM
  private characterGrid: HTMLElement;
  private weaponGrid: HTMLElement;
  private tomeGrid: HTMLElement;
  private saveButton: HTMLElement;
  private resetButton: HTMLElement;
  private buildNameInput: HTMLInputElement;

  constructor() {
    this.buildState = {
      character: null,
      weapons: [],
      tomes: [],
    };

    this.buildService = new BuildService();

    // Récupération des éléments DOM
    this.characterGrid = document.getElementById('character-selection')!;
    this.weaponGrid = document.getElementById('weapon-selection')!;
    this.tomeGrid = document.getElementById('tome-selection')!;
    this.saveButton = document.getElementById('save-build-btn')!;
    this.resetButton = document.getElementById('reset-build-btn')!;
    this.buildNameInput = document.getElementById('build-name-input') as HTMLInputElement;

    this.initialize();
  }

  /**
   * Initialise l'interface
   */
  private initialize(): void {
    this.renderCharacters();
    this.renderWeapons();
    this.renderTomes();
    this.setupEventListeners();
    this.renderSavedBuilds();
  }

  /**
   * Configure les événements
   */
  private setupEventListeners(): void {
    this.saveButton.addEventListener('click', () => this.handleSaveBuild());
    this.resetButton.addEventListener('click', () => this.handleReset());
  }

  /**
   * Affiche les personnages
   */
  private renderCharacters(): void {
    this.characterGrid.innerHTML = '';
    CHARACTERS.forEach(character => {
      const card = this.createCharacterCard(character);
      this.characterGrid.appendChild(card);
    });
  }

  /**
   * Crée une carte de personnage
   */
  private createCharacterCard(character: Character): HTMLElement {
    const card = document.createElement('div');
    card.className = 'selection-card character-card';
    card.innerHTML = `
      <img src="${character.image}" alt="${character.name}">
      <div class="card-info">
        <strong>${character.name}</strong>
        <span class="default-weapon">${character.defaultWeapon}</span>
      </div>
    `;

    card.addEventListener('click', () => this.selectCharacter(character, card));
    return card;
  }

  /**
   * Sélectionne un personnage
   */
  private selectCharacter(character: Character, cardElement: HTMLElement): void {
    // Désélectionne tous les personnages
    document.querySelectorAll('.character-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Sélectionne le personnage cliqué
    cardElement.classList.add('selected');
    this.buildState.character = character;

    // Met à jour l'affichage
    this.updateCharacterInfo();
    this.updateSaveButton();
  }

  /**
   * Affiche les armes
   */
  private renderWeapons(): void {
    this.weaponGrid.innerHTML = '';
    WEAPONS.forEach(weapon => {
      const card = this.createWeaponCard(weapon);
      this.weaponGrid.appendChild(card);
    });
  }

  /**
   * Crée une carte d'arme
   */
  private createWeaponCard(weapon: Weapon): HTMLElement {
    const card = document.createElement('div');
    card.className = 'selection-card weapon-card';
    card.innerHTML = `
      <img src="${weapon.image}" alt="${weapon.name}">
      <div class="card-info">
        <strong>${weapon.name}</strong>
      </div>
    `;

    card.addEventListener('click', () => this.toggleWeapon(weapon, card));
    return card;
  }

  /**
   * Sélectionne/désélectionne une arme
   */
  private toggleWeapon(weapon: Weapon, cardElement: HTMLElement): void {
    const index = this.buildState.weapons.findIndex(w => w.id === weapon.id);

    if (index > -1) {
      // Désélectionner
      this.buildState.weapons.splice(index, 1);
      cardElement.classList.remove('selected');
    } else {
      // Sélectionner (max 3)
      if (this.buildState.weapons.length < 3) {
        this.buildState.weapons.push(weapon);
        cardElement.classList.add('selected');
      }
    }

    this.updateWeaponCount();
    this.updateSaveButton();
  }

  /**
   * Affiche les tomes
   */
  private renderTomes(): void {
    this.tomeGrid.innerHTML = '';
    TOMES.forEach(tome => {
      const card = this.createTomeCard(tome);
      this.tomeGrid.appendChild(card);
    });
  }

  /**
   * Crée une carte de tome
   */
  private createTomeCard(tome: Tome): HTMLElement {
    const card = document.createElement('div');
    card.className = 'selection-card tome-card';
    card.innerHTML = `
      <img src="${tome.image}" alt="${tome.name}">
      <div class="card-info">
        <strong>${tome.name}</strong>
      </div>
    `;

    card.addEventListener('click', () => this.toggleTome(tome, card));
    return card;
  }

  /**
   * Sélectionne/désélectionne un tome
   */
  private toggleTome(tome: Tome, cardElement: HTMLElement): void {
    const index = this.buildState.tomes.findIndex(t => t.id === tome.id);

    if (index > -1) {
      // Désélectionner
      this.buildState.tomes.splice(index, 1);
      cardElement.classList.remove('selected');
    } else {
      // Sélectionner (max 4)
      if (this.buildState.tomes.length < 4) {
        this.buildState.tomes.push(tome);
        cardElement.classList.add('selected');
      }
    }

    this.updateTomeCount();
    this.updateSaveButton();
  }

  /**
   * Met à jour l'affichage des infos du personnage
   */
  private updateCharacterInfo(): void {
    const nameEl = document.getElementById('character-name');
    const weaponEl = document.getElementById('character-weapon');

    if (nameEl && weaponEl && this.buildState.character) {
      nameEl.textContent = this.buildState.character.name;
      weaponEl.textContent = this.buildState.character.defaultWeapon;
    }
  }

  /**
   * Met à jour le compteur d'armes
   */
  private updateWeaponCount(): void {
    const countEl = document.getElementById('weapon-count');
    if (countEl) {
      countEl.textContent = `${this.buildState.weapons.length}/3`;
    }
  }

  /**
   * Met à jour le compteur de tomes
   */
  private updateTomeCount(): void {
    const countEl = document.getElementById('tome-count');
    if (countEl) {
      countEl.textContent = `${this.buildState.tomes.length}/4`;
    }
  }

  /**
   * Met à jour l'état du bouton de sauvegarde
   */
  private updateSaveButton(): void {
    const isValid = this.buildState.character !== null &&
                   this.buildState.weapons.length === 3 &&
                   this.buildState.tomes.length === 4;

    this.saveButton.toggleAttribute('disabled', !isValid);
  }

  /**
   * Gère la sauvegarde du build
   */
  private handleSaveBuild(): void {
    const buildName = this.buildNameInput.value.trim();
    const build = this.buildService.saveBuild(this.buildState, buildName);

    if (build) {
      alert(`Build "${build.name}" sauvegardé avec succès !`);
      this.handleReset();
      this.renderSavedBuilds();
    }
  }

  /**
   * Réinitialise le formulaire
   */
  private handleReset(): void {
    this.buildState = {
      character: null,
      weapons: [],
      tomes: [],
    };

    this.buildNameInput.value = '';

    // Désélectionne tous les éléments
    document.querySelectorAll('.selection-card').forEach(card => {
      card.classList.remove('selected');
    });

    this.updateCharacterInfo();
    this.updateWeaponCount();
    this.updateTomeCount();
    this.updateSaveButton();
  }

  /**
   * Affiche les builds sauvegardés
   */
  private renderSavedBuilds(): void {
    const container = document.getElementById('saved-builds-list');
    if (!container) return;

    const builds = this.buildService.getAllBuilds();

    if (builds.length === 0) {
      container.innerHTML = '<p class="no-builds">Aucun build sauvegardé pour le moment.</p>';
      return;
    }

    container.innerHTML = builds.map(build => this.createBuildCard(build)).join('');

    // Ajoute les événements de suppression
    builds.forEach(build => {
      const deleteBtn = document.getElementById(`delete-${build.id}`);
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.deleteBuild(build.id));
      }
    });
  }

  /**
   * Crée une carte de build sauvegardé
   */
  private createBuildCard(build: Build): string {
    return `
      <div class="saved-build-card">
        <h3>${build.name}</h3>
        <div class="build-details">
          <div class="build-character">
            <img src="${build.character.image}" alt="${build.character.name}">
            <span>${build.character.name}</span>
          </div>
          <div class="build-items">
            <div class="build-weapons">
              ${build.weapons.map(w => `<img src="${w.image}" alt="${w.name}" title="${w.name}">`).join('')}
            </div>
            <div class="build-tomes">
              ${build.tomes.map(t => `<img src="${t.image}" alt="${t.name}" title="${t.name}">`).join('')}
            </div>
          </div>
        </div>
        <button id="delete-${build.id}" class="btn-delete">Supprimer</button>
      </div>
    `;
  }

  /**
   * Supprime un build
   */
  private deleteBuild(buildId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce build ?')) {
      this.buildService.deleteBuild(buildId);
      this.renderSavedBuilds();
    }
  }
}

