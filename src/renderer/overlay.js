"use strict";
/**
 * Script de overlay window
 */
Object.defineProperty(exports, "__esModule", { value: true });
var game_data_1 = require("../constants/game-data");
var OverlayRenderer = /** @class */ (function () {
    function OverlayRenderer() {
        this.noBuildDiv = document.getElementById('no-build-message');
        this.buildDisplay = document.getElementById('build-display');
        this.initialize();
    }
    OverlayRenderer.prototype.initialize = function () {
        var _this = this;
        this.loadActiveBuild();
        setInterval(function () { return _this.loadActiveBuild(); }, 5000);
    };
    OverlayRenderer.prototype.loadActiveBuild = function () {
        var activeBuildId = parseInt(localStorage.getItem('bonkdata_active_build') || '0');
        if (!activeBuildId) {
            this.showNoBuild();
            return;
        }
        var savedBuilds = JSON.parse(localStorage.getItem('bonkdata_builds') || '[]');
        var build = savedBuilds.find(function (b) { return b.id === activeBuildId.toString(); });
        if (!build) {
            this.showNoBuild();
            return;
        }
        this.displayBuild(build);
    };
    OverlayRenderer.prototype.showNoBuild = function () {
        if (this.noBuildDiv && this.buildDisplay) {
            this.noBuildDiv.style.display = 'block';
            this.buildDisplay.style.display = 'none';
        }
    };
    OverlayRenderer.prototype.displayBuild = function (build) {
        if (!this.noBuildDiv || !this.buildDisplay)
            return;
        this.noBuildDiv.style.display = 'none';
        this.buildDisplay.style.display = 'block';
        var titleEl = document.getElementById('build-title');
        if (titleEl) {
            titleEl.textContent = "\uD83C\uDFAE ".concat(build.name || build.character.name);
        }
        this.displayCharacter(build);
        this.displayWeapons(build);
        this.displayTomes(build);
    };
    OverlayRenderer.prototype.displayCharacter = function (build) {
        var characterDisplay = document.getElementById('character-display');
        if (!characterDisplay)
            return;
        characterDisplay.innerHTML = "\n      <div class=\"character-card\">\n        <img src=\"".concat(build.character.image, "\" alt=\"").concat(build.character.name, "\" />\n        <span class=\"character-name\">").concat(build.character.name, "</span>\n      </div>\n    ");
    };
    OverlayRenderer.prototype.displayWeapons = function (build) {
        var weaponsDisplay = document.getElementById('weapons-display');
        if (!weaponsDisplay)
            return;
        var defaultWeapon = game_data_1.WEAPONS.find(function (w) { return w.id === build.character.defaultWeaponId; });
        var weaponsHTML = '';
        if (defaultWeapon) {
            weaponsHTML += "\n        <div class=\"item-card default\">\n          <span class=\"item-number default\">\u2605</span>\n          <img src=\"".concat(defaultWeapon.image, "\" alt=\"").concat(defaultWeapon.name, "\" />\n          <span class=\"item-name\">").concat(defaultWeapon.name, "</span>\n        </div>\n      ");
        }
        build.weapons.forEach(function (weapon, index) {
            weaponsHTML += "\n        <div class=\"item-card\">\n          <span class=\"item-number\">".concat(index + 2, "</span>\n          <img src=\"").concat(weapon.image, "\" alt=\"").concat(weapon.name, "\" />\n          <span class=\"item-name\">").concat(weapon.name, "</span>\n        </div>\n      ");
        });
        weaponsDisplay.innerHTML = weaponsHTML;
    };
    OverlayRenderer.prototype.displayTomes = function (build) {
        var tomesDisplay = document.getElementById('tomes-display');
        if (!tomesDisplay)
            return;
        var tomesHTML = '';
        build.tomes.forEach(function (tome, index) {
            tomesHTML += "\n        <div class=\"item-card\">\n          <span class=\"item-number\">".concat(index + 1, "</span>\n          <img src=\"").concat(tome.image, "\" alt=\"").concat(tome.name, "\" />\n          <span class=\"item-name\">").concat(tome.name, "</span>\n        </div>\n      ");
        });
        tomesDisplay.innerHTML = tomesHTML;
    };
    return OverlayRenderer;
}());
document.addEventListener('DOMContentLoaded', function () {
    new OverlayRenderer();
});
