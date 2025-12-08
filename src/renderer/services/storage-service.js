"use strict";
/**
 * Service générique de stockage local
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
var StorageService = /** @class */ (function () {
    function StorageService() {
    }
    /**
     * Sauvegarde une valeur dans le localStorage
     */
    StorageService.set = function (key, value) {
        try {
            var serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
        }
        catch (error) {
            console.error("Erreur lors de la sauvegarde de ".concat(key, ":"), error);
        }
    };
    /**
     * Récupère une valeur du localStorage
     */
    StorageService.get = function (key, defaultValue) {
        try {
            var item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
            }
            return JSON.parse(item);
        }
        catch (error) {
            console.error("Erreur lors de la r\u00E9cup\u00E9ration de ".concat(key, ":"), error);
            return defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
        }
    };
    /**
     * Supprime une valeur du localStorage
     */
    StorageService.remove = function (key) {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error("Erreur lors de la suppression de ".concat(key, ":"), error);
        }
    };
    /**
     * Vide complètement le localStorage
     */
    StorageService.clear = function () {
        try {
            localStorage.clear();
        }
        catch (error) {
            console.error('Erreur lors du vidage du localStorage:', error);
        }
    };
    /**
     * Vérifie si une clé existe
     */
    StorageService.has = function (key) {
        return localStorage.getItem(key) !== null;
    };
    return StorageService;
}());
exports.StorageService = StorageService;
