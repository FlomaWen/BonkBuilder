"use strict";
/**
 * Service de gestion des builds
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildService = void 0;
var BuildService = /** @class */ (function () {
    function BuildService() {
    }
    /**
     * Sauvegarde un build
     */
    BuildService.prototype.saveBuild = function (state, buildName) {
        if (!state.character) {
            return null;
        }
        var build = {
            id: this.generateId(),
            name: buildName || "Build ".concat(state.character.name),
            character: state.character,
            weapons: __spreadArray([], state.weapons, true),
            tomes: __spreadArray([], state.tomes, true),
            createdAt: new Date(),
        };
        var builds = this.getAllBuilds();
        builds.push(build);
        this.saveToStorage(builds);
        return build;
    };
    /**
     * Récupère tous les builds sauvegardés
     */
    BuildService.prototype.getAllBuilds = function () {
        try {
            var stored = localStorage.getItem(BuildService.STORAGE_KEY);
            if (!stored) {
                return [];
            }
            var builds = JSON.parse(stored);
            // Convertir les dates string en objets Date
            return builds.map(function (build) { return (__assign(__assign({}, build), { createdAt: new Date(build.createdAt) })); });
        }
        catch (error) {
            console.error('Erreur lors du chargement des builds:', error);
            return [];
        }
    };
    /**
     * Supprime un build
     */
    BuildService.prototype.deleteBuild = function (buildId) {
        var builds = this.getAllBuilds();
        var filteredBuilds = builds.filter(function (b) { return b.id !== buildId; });
        if (filteredBuilds.length === builds.length) {
            return false; // Build non trouvé
        }
        this.saveToStorage(filteredBuilds);
        return true;
    };
    /**
     * Exporte un build en JSON
     */
    BuildService.prototype.exportBuild = function (build) {
        return JSON.stringify(build, null, 2);
    };
    /**
     * Importe un build depuis JSON
     */
    BuildService.prototype.importBuild = function (jsonString) {
        try {
            var build = JSON.parse(jsonString);
            // Validation basique
            if (!build.character || !build.weapons || !build.tomes) {
                return null;
            }
            return build;
        }
        catch (error) {
            console.error('Erreur lors de l\'import du build:', error);
            return null;
        }
    };
    /**
     * Sauvegarde les builds dans le localStorage
     */
    BuildService.prototype.saveToStorage = function (builds) {
        localStorage.setItem(BuildService.STORAGE_KEY, JSON.stringify(builds));
    };
    /**
     * Génère un ID unique
     */
    BuildService.prototype.generateId = function () {
        return "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
    };
    BuildService.STORAGE_KEY = 'bonk_saved_builds';
    return BuildService;
}());
exports.BuildService = BuildService;
