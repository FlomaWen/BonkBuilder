"use strict";
/**
 * Gestionnaire de l'overlay
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayManager = void 0;
var electron_1 = require("electron");
var OverlayManager = /** @class */ (function () {
    function OverlayManager() {
        this.openButton = document.getElementById('open-overlay-btn');
        this.closeButton = document.getElementById('close-overlay-btn');
        this.initialize();
    }
    /**
     * Initialise les événements
     */
    OverlayManager.prototype.initialize = function () {
        var _this = this;
        if (this.openButton) {
            this.openButton.addEventListener('click', function () { return _this.openOverlay(); });
        }
        if (this.closeButton) {
            this.closeButton.addEventListener('click', function () { return _this.closeOverlay(); });
        }
    };
    /**
     * Ouvre l'overlay
     */
    OverlayManager.prototype.openOverlay = function () {
        electron_1.ipcRenderer.send('open-overlay');
    };
    /**
     * Ferme l'overlay
     */
    OverlayManager.prototype.closeOverlay = function () {
        electron_1.ipcRenderer.send('close-overlay');
    };
    return OverlayManager;
}());
exports.OverlayManager = OverlayManager;
