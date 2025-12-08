"use strict";
/**
 * Gestionnaire des onglets de navigation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabManager = void 0;
var TabManager = /** @class */ (function () {
    function TabManager() {
        this.tabs = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.initialize();
    }
    /**
     * Initialise les événements des onglets
     */
    TabManager.prototype.initialize = function () {
        var _this = this;
        this.tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var tabName = tab.getAttribute('data-tab');
                if (tabName) {
                    _this.switchTab(tabName);
                }
            });
        });
    };
    /**
     * Change l'onglet actif
     */
    TabManager.prototype.switchTab = function (tabName) {
        // Désactive tous les onglets
        this.tabs.forEach(function (tab) { return tab.classList.remove('active'); });
        this.tabContents.forEach(function (content) { return content.classList.remove('active'); });
        // Active l'onglet sélectionné
        var selectedTab = document.querySelector("[data-tab=\"".concat(tabName, "\"]"));
        var selectedContent = document.getElementById("".concat(tabName, "-tab"));
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
    };
    return TabManager;
}());
exports.TabManager = TabManager;
