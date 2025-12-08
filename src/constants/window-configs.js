"use strict";
/**
 * Configurations des fenêtres Electron
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OVERLAY_POSITION = exports.OVERLAY_WINDOW_CONFIG = exports.MAIN_WINDOW_CONFIG = void 0;
exports.MAIN_WINDOW_CONFIG = {
    width: 1200,
    height: 800,
    title: 'BonkData',
    backgroundColor: '#1a1a2e',
    resizable: true,
    frame: true,
};
exports.OVERLAY_WINDOW_CONFIG = {
    width: 350,
    height: 600,
    title: 'BonkData - Overlay',
    backgroundColor: '#1a1a2e',
    alwaysOnTop: true,
    frame: true,
    resizable: true,
    skipTaskbar: false,
    opacity: 0.95,
};
exports.OVERLAY_POSITION = {
    x: 20,
    y: 20,
};
