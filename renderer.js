// Renderer process - Gestion de l'interface utilisateur

// Affichage des versions
document.addEventListener('DOMContentLoaded', () => {
    // Versions de l'environnement
    document.getElementById('electron-version').textContent = process.versions.electron;
    document.getElementById('node-version').textContent = process.versions.node;
    document.getElementById('chrome-version').textContent = process.versions.chrome;

    // Vérification du support Overwolf
    checkOverwolfSupport();
});

function checkOverwolfSupport() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.getElementById('status-text');

    // Simulation de la vérification Overwolf
    // Dans une vraie application, vous utiliseriez l'API Overwolf ici
    setTimeout(() => {
        try {
            // Vérifier si Overwolf est disponible
            if (typeof overwolf !== 'undefined') {
                statusIndicator.classList.add('connected');
                statusText.textContent = '✓ Overwolf connecté';
            } else {
                // En mode développement Electron, Overwolf n'est pas disponible
                statusIndicator.classList.add('disconnected');
                statusText.textContent = '⚠ Mode développement Electron (Overwolf non disponible)';
            }
        } catch (error) {
            statusIndicator.classList.add('disconnected');
            statusText.textContent = '✗ Erreur de connexion Overwolf';
            console.error('Overwolf error:', error);
        }
    }, 1000);
}

// Log dans la console
console.log('🚀 BonkData Application démarrée');
console.log('📦 Electron version:', process.versions.electron);
console.log('🔧 Node version:', process.versions.node);
console.log('🌐 Chrome version:', process.versions.chrome);

