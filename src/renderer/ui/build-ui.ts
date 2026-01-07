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
    console.log('BuildUI: Initialisation...');

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

    console.log('BuildUI: Éléments DOM récupérés', {
      characterGrid: !!this.characterGrid,
      weaponGrid: !!this.weaponGrid,
      tomeGrid: !!this.tomeGrid,
      saveButton: !!this.saveButton,
      resetButton: !!this.resetButton,
      buildNameInput: !!this.buildNameInput
    });

    this.initialize();
    this.setupIPCListeners();

    console.log('BuildUI: Initialisé avec succès');
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
   * Configure les écouteurs IPC
   */
  private setupIPCListeners(): void {
    // Quand l'overlay est prêt, lui envoyer le build actif
    window.electronAPI.build.onOverlayReady(() => {
      const activeBuild = this.buildService.getActiveBuild();
      if (activeBuild) {
        window.electronAPI.build.setActive(activeBuild);
      }
    });
  }

  /**
   * Affiche les personnages
   */
  private renderCharacters(): void {
    console.log(`BuildUI: Rendu de ${CHARACTERS.length} personnages`);
    this.characterGrid.innerHTML = '';
    CHARACTERS.forEach(character => {
      const card = this.createCharacterCard(character);
      this.characterGrid.appendChild(card);
    });
    console.log('BuildUI: Personnages affichés');
  }

  /**
   * Crée une carte de personnage
   */
  private createCharacterCard(character: Character): HTMLElement {
    const card = document.createElement('div');
    card.className = 'selection-item character-card';
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
    console.log('BuildUI: Personnage sélectionné:', character.name);

    // Désélectionne tous les personnages
    document.querySelectorAll('.character-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Sélectionne le personnage cliqué
    cardElement.classList.add('selected');
    this.buildState.character = character;

    // Désélectionner l'arme par défaut si elle était dans les armes supplémentaires
    const defaultWeaponIndex = this.buildState.weapons.findIndex(w => w.id === character.defaultWeaponId);
    if (defaultWeaponIndex > -1) {
      this.buildState.weapons.splice(defaultWeaponIndex, 1);
      console.log('⚠️ Arme par défaut retirée des armes supplémentaires');
    }

    // Met à jour l'affichage
    this.updateCharacterInfo();
    this.updateWeaponCardsState();
    this.updateSaveButton();
  }

  /**
   * Met à jour l'état visuel des cartes d'armes (désactive l'arme par défaut)
   */
  private updateWeaponCardsState(): void {
    document.querySelectorAll('.weapon-card').forEach(card => {
      const weaponId = (card as HTMLElement).dataset.weaponId;

      // Réinitialiser l'état
      card.classList.remove('disabled', 'selected');

      // Si c'est l'arme par défaut du personnage, la désactiver
      if (this.buildState.character && weaponId === this.buildState.character.defaultWeaponId) {
        card.classList.add('disabled');
      } else {
        // Vérifier si l'arme est sélectionnée
        const isSelected = this.buildState.weapons.some(w => w.id === weaponId);
        if (isSelected) {
          card.classList.add('selected');
        }
      }
    });
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
    card.className = 'selection-item weapon-card';
    card.dataset.weaponId = weapon.id; // Ajouter l'ID pour pouvoir identifier la carte
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
    // Vérifier si cette arme est l'arme par défaut du personnage sélectionné
    if (this.buildState.character && weapon.id === this.buildState.character.defaultWeaponId) {
      console.log('⚠️ Impossible de sélectionner l\'arme par défaut du personnage');
      return;
    }

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
    card.className = 'selection-item tome-card';
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
    document.querySelectorAll('.selection-item').forEach(card => {
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
    const activeBuildId = this.buildService.getActiveBuildId();

    console.log('BuildUI: Rendu des builds sauvegardés:', {
      count: builds.length,
      activeBuildId
    });

    if (builds.length === 0) {
      container.innerHTML = '<p class="no-builds">Aucun build sauvegardé pour le moment.</p>';
      return;
    }

    container.innerHTML = builds.map(build => this.createBuildCard(build, build.id === activeBuildId)).join('');

    console.log('BuildUI: HTML généré, recherche des boutons...');

    // Ajoute les événements
    builds.forEach(build => {
      const isActive = build.id === activeBuildId;
      const deleteBtn = document.getElementById(`delete-${build.id}`);
      const activateBtn = document.getElementById(`activate-${build.id}`);

      console.log(`BuildUI: Configuration des boutons pour build ${build.id}:`, {
        isActive,
        deleteBtn: !!deleteBtn,
        activateBtn: !!activateBtn,
        activateBtnId: `activate-${build.id}`
      });

      if (deleteBtn) {
        console.log(`BuildUI: Ajout de l'événement click sur le bouton delete pour ${build.id}`);
        deleteBtn.addEventListener('click', () => this.deleteBuild(build.id));
      } else {
        console.error(`BuildUI: Bouton delete non trouvé pour ${build.id}`);
      }

      if (activateBtn) {
        console.log(`BuildUI: Ajout de l'événement click sur le bouton activate pour ${build.id}`);
        activateBtn.addEventListener('click', () => {
          console.log('BuildUI: ===== CLIC SUR ACTIVER =====');
          console.log('BuildUI: Clic sur le bouton activer pour:', build.id);
          this.activateBuild(build.id);
        });
      } else {
        if (!isActive) {
          console.error(`BuildUI: Bouton activate non trouvé pour ${build.id} (build non actif)`);
        } else {
          console.log(`BuildUI: Pas de bouton activate pour ${build.id} (build déjà actif)`);
        }
      }
    });
  }

  /**
   * Crée une carte de build sauvegardé
   */
  private createBuildCard(build: Build, isActive: boolean): string {
    const activeClass = isActive ? 'active-build' : '';
    const activeBadge = isActive ? '<span class="active-badge">✓ Actif</span>' : '';
    const activateButton = isActive
      ? ''
      : `<button id="activate-${build.id}" class="btn-activate">🎮 Activer pour l'overlay</button>`;

    console.log(`BuildUI: Création de la carte pour build ${build.id}:`, {
      isActive,
      hasActivateButton: !isActive
    });

    return `
      <div class="saved-build-card ${activeClass}">
        <div class="build-header">
          <h3>${build.name}</h3>
          ${activeBadge}
        </div>
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
        <div class="build-actions">
          ${activateButton}
          <button id="delete-${build.id}" class="btn-delete">🗑️ Supprimer</button>
        </div>
      </div>
    `;
  }

  /**
   * Active un build pour l'overlay
   */
  private activateBuild(buildId: string): void {
    console.log('BuildUI: Tentative d\'activation du build:', buildId);

    const success = this.buildService.setActiveBuild(buildId);
    console.log('BuildUI: setActiveBuild result:', success);

    if (success) {
      // Récupérer le build complet pour l'envoyer à l'overlay
      const build = this.buildService.getActiveBuild();
      console.log('BuildUI: Build récupéré:', build);

      if (build) {
        // Envoyer le build à l'overlay via IPC
        console.log('BuildUI: Envoi du build à l\'overlay via IPC');
        window.electronAPI.build.setActive(build);
      }

      // Déclencher l'événement pour mettre à jour l'onglet Overlay
      window.dispatchEvent(new Event('build-activated'));

      this.renderSavedBuilds();

      // Notification visuelle
      const notification = document.createElement('div');
      notification.className = 'notification success';
      notification.textContent = '✓ Build activé pour l\'overlay !';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

      console.log('BuildUI: Build activé avec succès !');
    } else {
      console.error('BuildUI: Échec de l\'activation du build');
    }
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
