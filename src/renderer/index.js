"use strict";
/**
 * Point d'entrée du processus renderer
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tab_manager_1 = require("./ui/tab-manager");
var build_ui_1 = require("./ui/build-ui");
var overlay_manager_1 = require("./ui/overlay-manager");
var RendererApp = /** @class */ (function () {
    function RendererApp() {
        this.tabManager = new tab_manager_1.TabManager();
        this.buildUI = new build_ui_1.BuildUI();
        this.overlayManager = new overlay_manager_1.OverlayManager();
    }
    /**
     * Initialise l'application renderer
     */
    RendererApp.prototype.initialize = function () {
        console.log('BonkBuilder Renderer initialized');
        this.checkOverwolfSupport();
    };
    /**
     * Vérifie le support Overwolf
     */
    RendererApp.prototype.checkOverwolfSupport = function () {
        var statusElement = document.getElementById('overwolf-status');
        var statusText = document.getElementById('status-text');
        if (!statusElement || !statusText)
            return;
        // Pour l'instant, pas de vraie intégration Overwolf
        statusElement.classList.add('status-offline');
        statusText.textContent = 'Overwolf non détecté (Mode Electron)';
    };
    return RendererApp;
}());
// Démarre l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function () {
    var app = new RendererApp();
    app.initialize();
});
