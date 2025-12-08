"use strict";
/**
 * Gestionnaire des communications IPC entre main et renderer
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcHandlers = void 0;
var electron_1 = require("electron");
var IpcHandlers = /** @class */ (function () {
    function IpcHandlers(windowManager) {
        this.windowManager = windowManager;
    }
    /**
     * Enregistre tous les handlers IPC
     */
    IpcHandlers.prototype.registerHandlers = function () {
        this.registerOverlayHandlers();
    };
    /**
     * Enregistre les handlers pour l'overlay
     */
    IpcHandlers.prototype.registerOverlayHandlers = function () {
        var _this = this;
        electron_1.ipcMain.on('open-overlay', function () {
            _this.windowManager.createOverlayWindow();
        });
        electron_1.ipcMain.on('close-overlay', function () {
            _this.windowManager.closeOverlayWindow();
        });
    };
    return IpcHandlers;
}());
exports.IpcHandlers = IpcHandlers;
