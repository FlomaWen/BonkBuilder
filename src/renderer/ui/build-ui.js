"use strict";
/**
 * Gestion de l'interface utilisateur pour la création de builds
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildUI = void 0;
var game_data_1 = require("../../constants/game-data");
var build_service_1 = require("../services/build-service");
var BuildUI = /** @class */ (function () {
    function BuildUI() {
        this.buildState = {
            character: null,
            weapons: [],
            tomes: [],
        };
        this.buildService = new build_service_1.BuildService();
        // Récupération des éléments DOM
        this.characterGrid = document.getElementById('character-selection');
        this.weaponGrid = document.getElementById('weapon-selection');
        this.tomeGrid = document.getElementById('tome-selection');
        this.saveButton = document.getElementById('save-build-btn');
        this.resetButton = document.getElementById('reset-build-btn');
        this.buildNameInput = document.getElementById('build-name-input');
        this.initialize();
    }
    /**
     * Initialise l'interface
     */
    BuildUI.prototype.initialize = function () {
        this.renderCharacters();
        this.renderWeapons();
        this.renderTomes();
        this.setupEventListeners();
        this.renderSavedBuilds();
    };
    /**
     * Configure les événements
     */
    BuildUI.prototype.setupEventListeners = function () {
        var _this = this;
        this.saveButton.addEventListener('click', function () { return _this.handleSaveBuild(); });
        this.resetButton.addEventListener('click', function () { return _this.handleReset(); });
    };
    /**
     * Affiche les personnages
     */
    BuildUI.prototype.renderCharacters = function () {
        var _this = this;
        this.characterGrid.innerHTML = '';
        game_data_1.CHARACTERS.forEach(function (character) {
            var card = _this.createCharacterCard(character);
            _this.characterGrid.appendChild(card);
        });
    };
    /**
     * Crée une carte de personnage
     */
    BuildUI.prototype.createCharacterCard = function (character) {
        var _this = this;
        var card = document.createElement('div');
        card.className = 'selection-card character-card';
        card.innerHTML = "\n      <img src=\"".concat(character.image, "\" alt=\"").concat(character.name, "\">\n      <div class=\"card-info\">\n        <strong>").concat(character.name, "</strong>\n        <span class=\"default-weapon\">").concat(character.defaultWeapon, "</span>\n      </div>\n    ");
        card.addEventListener('click', function () { return _this.selectCharacter(character, card); });
        return card;
    };
    /**
     * Sélectionne un personnage
     */
    BuildUI.prototype.selectCharacter = function (character, cardElement) {
        // Désélectionne tous les personnages
        document.querySelectorAll('.character-card').forEach(function (card) {
            card.classList.remove('selected');
        });
        // Sélectionne le personnage cliqué
        cardElement.classList.add('selected');
        this.buildState.character = character;
        // Met à jour l'affichage
        this.updateCharacterInfo();
        this.updateSaveButton();
    };
    /**
     * Affiche les armes
     */
    BuildUI.prototype.renderWeapons = function () {
        var _this = this;
        this.weaponGrid.innerHTML = '';
        game_data_1.WEAPONS.forEach(function (weapon) {
            var card = _this.createWeaponCard(weapon);
            _this.weaponGrid.appendChild(card);
        });
    };
    /**
     * Crée une carte d'arme
     */
    BuildUI.prototype.createWeaponCard = function (weapon) {
        var _this = this;
        var card = document.createElement('div');
        card.className = 'selection-card weapon-card';
        card.innerHTML = "\n      <img src=\"".concat(weapon.image, "\" alt=\"").concat(weapon.name, "\">\n      <div class=\"card-info\">\n        <strong>").concat(weapon.name, "</strong>\n      </div>\n    ");
        card.addEventListener('click', function () { return _this.toggleWeapon(weapon, card); });
        return card;
    };
    /**
     * Sélectionne/désélectionne une arme
     */
    BuildUI.prototype.toggleWeapon = function (weapon, cardElement) {
        var index = this.buildState.weapons.findIndex(function (w) { return w.id === weapon.id; });
        if (index > -1) {
            // Désélectionner
            this.buildState.weapons.splice(index, 1);
            cardElement.classList.remove('selected');
        }
        else {
            // Sélectionner (max 3)
            if (this.buildState.weapons.length < 3) {
                this.buildState.weapons.push(weapon);
                cardElement.classList.add('selected');
            }
        }
        this.updateWeaponCount();
        this.updateSaveButton();
    };
    /**
     * Affiche les tomes
     */
    BuildUI.prototype.renderTomes = function () {
        var _this = this;
        this.tomeGrid.innerHTML = '';
        game_data_1.TOMES.forEach(function (tome) {
            var card = _this.createTomeCard(tome);
            _this.tomeGrid.appendChild(card);
        });
    };
    /**
     * Crée une carte de tome
     */
    BuildUI.prototype.createTomeCard = function (tome) {
        var _this = this;
        var card = document.createElement('div');
        card.className = 'selection-card tome-card';
        card.innerHTML = "\n      <img src=\"".concat(tome.image, "\" alt=\"").concat(tome.name, "\">\n      <div class=\"card-info\">\n        <strong>").concat(tome.name, "</strong>\n      </div>\n    ");
        card.addEventListener('click', function () { return _this.toggleTome(tome, card); });
        return card;
    };
    /**
     * Sélectionne/désélectionne un tome
     */
    BuildUI.prototype.toggleTome = function (tome, cardElement) {
        var index = this.buildState.tomes.findIndex(function (t) { return t.id === tome.id; });
        if (index > -1) {
            // Désélectionner
            this.buildState.tomes.splice(index, 1);
            cardElement.classList.remove('selected');
        }
        else {
            // Sélectionner (max 4)
            if (this.buildState.tomes.length < 4) {
                this.buildState.tomes.push(tome);
                cardElement.classList.add('selected');
            }
        }
        this.updateTomeCount();
        this.updateSaveButton();
    };
    /**
     * Met à jour l'affichage des infos du personnage
     */
    BuildUI.prototype.updateCharacterInfo = function () {
        var nameEl = document.getElementById('character-name');
        var weaponEl = document.getElementById('character-weapon');
        if (nameEl && weaponEl && this.buildState.character) {
            nameEl.textContent = this.buildState.character.name;
            weaponEl.textContent = this.buildState.character.defaultWeapon;
        }
    };
    /**
     * Met à jour le compteur d'armes
     */
    BuildUI.prototype.updateWeaponCount = function () {
        var countEl = document.getElementById('weapon-count');
        if (countEl) {
            countEl.textContent = "".concat(this.buildState.weapons.length, "/3");
        }
    };
    /**
     * Met à jour le compteur de tomes
     */
    BuildUI.prototype.updateTomeCount = function () {
        var countEl = document.getElementById('tome-count');
        if (countEl) {
            countEl.textContent = "".concat(this.buildState.tomes.length, "/4");
        }
    };
    /**
     * Met à jour l'état du bouton de sauvegarde
     */
    BuildUI.prototype.updateSaveButton = function () {
        var isValid = this.buildState.character !== null &&
            this.buildState.weapons.length === 3 &&
            this.buildState.tomes.length === 4;
        this.saveButton.toggleAttribute('disabled', !isValid);
    };
    /**
     * Gère la sauvegarde du build
     */
    BuildUI.prototype.handleSaveBuild = function () {
        var buildName = this.buildNameInput.value.trim();
        var build = this.buildService.saveBuild(this.buildState, buildName);
        if (build) {
            alert("Build \"".concat(build.name, "\" sauvegard\u00E9 avec succ\u00E8s !"));
            this.handleReset();
            this.renderSavedBuilds();
        }
    };
    /**
     * Réinitialise le formulaire
     */
    BuildUI.prototype.handleReset = function () {
        this.buildState = {
            character: null,
            weapons: [],
            tomes: [],
        };
        this.buildNameInput.value = '';
        // Désélectionne tous les éléments
        document.querySelectorAll('.selection-card').forEach(function (card) {
            card.classList.remove('selected');
        });
        this.updateCharacterInfo();
        this.updateWeaponCount();
        this.updateTomeCount();
        this.updateSaveButton();
    };
    /**
     * Affiche les builds sauvegardés
     */
    BuildUI.prototype.renderSavedBuilds = function () {
        var _this = this;
        var container = document.getElementById('saved-builds-list');
        if (!container)
            return;
        var builds = this.buildService.getAllBuilds();
        if (builds.length === 0) {
            container.innerHTML = '<p class="no-builds">Aucun build sauvegardé pour le moment.</p>';
            return;
        }
        container.innerHTML = builds.map(function (build) { return _this.createBuildCard(build); }).join('');
        // Ajoute les événements de suppression
        builds.forEach(function (build) {
            var deleteBtn = document.getElementById("delete-".concat(build.id));
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function () { return _this.deleteBuild(build.id); });
            }
        });
    };
    /**
     * Crée une carte de build sauvegardé
     */
    BuildUI.prototype.createBuildCard = function (build) {
        return "\n      <div class=\"saved-build-card\">\n        <h3>".concat(build.name, "</h3>\n        <div class=\"build-details\">\n          <div class=\"build-character\">\n            <img src=\"").concat(build.character.image, "\" alt=\"").concat(build.character.name, "\">\n            <span>").concat(build.character.name, "</span>\n          </div>\n          <div class=\"build-items\">\n            <div class=\"build-weapons\">\n              ").concat(build.weapons.map(function (w) { return "<img src=\"".concat(w.image, "\" alt=\"").concat(w.name, "\" title=\"").concat(w.name, "\">"); }).join(''), "\n            </div>\n            <div class=\"build-tomes\">\n              ").concat(build.tomes.map(function (t) { return "<img src=\"".concat(t.image, "\" alt=\"").concat(t.name, "\" title=\"").concat(t.name, "\">"); }).join(''), "\n            </div>\n          </div>\n        </div>\n        <button id=\"delete-").concat(build.id, "\" class=\"btn-delete\">Supprimer</button>\n      </div>\n    ");
    };
    /**
     * Supprime un build
     */
    BuildUI.prototype.deleteBuild = function (buildId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce build ?')) {
            this.buildService.deleteBuild(buildId);
            this.renderSavedBuilds();
        }
    };
    return BuildUI;
}());
exports.BuildUI = BuildUI;
