"use strict";
/**
 * Gestionnaire de fenêtres Electron
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowManager = void 0;
var electron_1 = require("electron");
var path = require("path");
var window_configs_1 = require("../constants/window-configs");
var WindowManager = /** @class */ (function () {
    function WindowManager() {
        this.mainWindow = null;
        this.overlayWindow = null;
    }
    /**
     * Crée la fenêtre principale
     */
    WindowManager.prototype.createMainWindow = function () {
        var _this = this;
        this.mainWindow = new electron_1.BrowserWindow({
            width: window_configs_1.MAIN_WINDOW_CONFIG.width,
            height: window_configs_1.MAIN_WINDOW_CONFIG.height,
            title: window_configs_1.MAIN_WINDOW_CONFIG.title,
            backgroundColor: window_configs_1.MAIN_WINDOW_CONFIG.backgroundColor,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),
        });
        this.mainWindow.loadFile(path.join(__dirname, '..', '..', 'index.html'));
        // Ouvrir les DevTools en mode développement
        if (process.argv.includes('--dev')) {
            this.mainWindow.webContents.openDevTools();
        }
        this.mainWindow.on('closed', function () {
            _this.mainWindow = null;
            if (_this.overlayWindow) {
                _this.overlayWindow.close();
            }
        });
        return this.mainWindow;
    };
    /**
     * Crée ou focus la fenêtre overlay
     */
    WindowManager.prototype.createOverlayWindow = function () {
        var _this = this;
        if (this.overlayWindow) {
            this.overlayWindow.focus();
            return this.overlayWindow;
        }
        this.overlayWindow = new electron_1.BrowserWindow({
            width: window_configs_1.OVERLAY_WINDOW_CONFIG.width,
            height: window_configs_1.OVERLAY_WINDOW_CONFIG.height,
            x: window_configs_1.OVERLAY_POSITION.x,
            y: window_configs_1.OVERLAY_POSITION.y,
            title: window_configs_1.OVERLAY_WINDOW_CONFIG.title,
            backgroundColor: window_configs_1.OVERLAY_WINDOW_CONFIG.backgroundColor,
            frame: window_configs_1.OVERLAY_WINDOW_CONFIG.frame,
            alwaysOnTop: window_configs_1.OVERLAY_WINDOW_CONFIG.alwaysOnTop,
            skipTaskbar: window_configs_1.OVERLAY_WINDOW_CONFIG.skipTaskbar,
            resizable: window_configs_1.OVERLAY_WINDOW_CONFIG.resizable,
            opacity: window_configs_1.OVERLAY_WINDOW_CONFIG.opacity,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        this.overlayWindow.loadFile(path.join(__dirname, '..', '..', 'overlay.html'));
        this.overlayWindow.on('closed', function () {
            _this.overlayWindow = null;
        });
        return this.overlayWindow;
    };
    /**
     * Ferme la fenêtre overlay si elle existe
     */
    WindowManager.prototype.closeOverlayWindow = function () {
        if (this.overlayWindow) {
            this.overlayWindow.close();
        }
    };
    /**
     * Retourne la fenêtre principale
     */
    WindowManager.prototype.getMainWindow = function () {
        return this.mainWindow;
    };
    /**
     * Retourne la fenêtre overlay
     */
    WindowManager.prototype.getOverlayWindow = function () {
        return this.overlayWindow;
    };
    return WindowManager;
}());
exports.WindowManager = WindowManager;
