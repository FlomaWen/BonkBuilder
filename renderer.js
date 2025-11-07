// Renderer process - Gestion de l'interface utilisateur

// ===== DATA STRUCTURES =====

// Personnages avec leurs armes par défaut
const CHARACTERS = [
    { id: 'siroofie', name: 'Sir Oofie', image: 'assets/characters/SirOofie.png', defaultWeapon: 'Sword', defaultWeaponId: 'sword' },
    { id: 'fox', name: 'Fox', image: 'assets/characters/Fox.png', defaultWeapon: 'Fire Staff', defaultWeaponId: 'firestaff' },
    { id: 'calcium', name: 'Calcium', image: 'assets/characters/Calcium_.png', defaultWeapon: 'Bone', defaultWeaponId: 'bone' },
    { id: 'cl4nk', name: 'CL4NK', image: 'assets/characters/CL4NK_.png', defaultWeapon: 'Revolver', defaultWeaponId: 'revolver' },
    { id: 'athena', name: 'Athena', image: 'assets/characters/Athena.png', defaultWeapon: 'Aegis', defaultWeaponId: 'aegis' },
    { id: 'ogre', name: 'Ogre', image: 'assets/characters/Ogre_.png', defaultWeapon: 'Axe', defaultWeaponId: 'axe' },
    { id: 'monke', name: 'Monke', image: 'assets/characters/Monke_.png', defaultWeapon: 'Banana', defaultWeaponId: 'banana' },
    { id: 'bush', name: 'Bush', image: 'assets/characters/Bush.png', defaultWeapon: 'Sniper Rifle', defaultWeaponId: 'sniperrifle' },
    { id: 'megachad', name: 'Megachad', image: 'assets/characters/Megachad_.png', defaultWeapon: 'Aura', defaultWeaponId: 'aura' },
    { id: 'robinette', name: 'Robinette', image: 'assets/characters/Robinette..png', defaultWeapon: 'Bow', defaultWeaponId: 'bow' },
    { id: 'tony', name: 'Tony McZoom', image: 'assets/characters/Tony_McZoom.png', defaultWeapon: 'Wireless Dagger', defaultWeaponId: 'wirelessdagger' },
    { id: 'birdo', name: 'Birdo', image: 'assets/characters/Birdo.png', defaultWeapon: 'Tornado', defaultWeaponId: 'tornado' },
    { id: 'noelle', name: 'Noelle', image: 'assets/characters/Noelle.png', defaultWeapon: 'Frost Walker', defaultWeaponId: 'frostwalker' },
    { id: 'amog', name: 'Amog', image: 'assets/characters/Amog.png', defaultWeapon: 'Poison Flask', defaultWeaponId: 'poisonflask' },
    { id: 'spaceman', name: 'Spaceman', image: 'assets/characters/Spaceman_Logo.png', defaultWeapon: 'Black Hole', defaultWeaponId: 'blackhole' },
    { id: 'bandit', name: 'Bandit', image: 'assets/characters/Bandit.png', defaultWeapon: 'Dexecutioner', defaultWeaponId: 'dexecutioner' },
    { id: 'ninja', name: 'Ninja', image: 'assets/characters/Ninja_.png', defaultWeapon: 'Katana', defaultWeaponId: 'katana' },
    { id: 'vlad', name: 'Vlad', image: 'assets/characters/Vlad_Logo.png', defaultWeapon: 'Blood Magic', defaultWeaponId: 'bloodmagic' },
    { id: 'sirchadwell', name: 'Sir Chadwell', image: 'assets/characters/Sir_CHadwell.png', defaultWeapon: 'Corrupted Sword', defaultWeaponId: 'corruptedsword' },
    { id: 'dicehead', name: 'Dicehead', image: 'assets/characters/Dicehead..png', defaultWeapon: 'Dice', defaultWeaponId: 'dice' }
];

// Liste des armes
const WEAPONS = [
    { id: 'aegis', name: 'Aegis', image: 'assets/weapons/Aegis_Icon.jpg' },
    { id: 'aura', name: 'Aura', image: 'assets/weapons/Aura_Icon.jpg' },
    { id: 'axe', name: 'Axe', image: 'assets/weapons/Axe_Icon.jpg' },
    { id: 'banana', name: 'Banana', image: 'assets/weapons/Banana_Icon.jpg' },
    { id: 'blackhole', name: 'Black Hole', image: 'assets/weapons/BlackHole.jpg' },
    { id: 'bloodmagic', name: 'Blood Magic', image: 'assets/weapons/Blood_Magic.jpg' },
    { id: 'bone', name: 'Bone', image: 'assets/weapons/Bone_Icon.jpg' },
    { id: 'bow', name: 'Bow', image: 'assets/weapons/Bow_Icon.jpg' },
    { id: 'chunker', name: 'Chunker', image: 'assets/weapons/Chunker_Icon.jpg' },
    { id: 'corruptedsword', name: 'Corrupted Sword', image: 'assets/weapons/Corrupted_Sword.jpg' },
    { id: 'dexecutioner', name: 'Dexecutioner', image: 'assets/weapons/Dexecutioner.jpg' },
    { id: 'dice', name: 'Dice', image: 'assets/weapons/Dice.jpg' },
    { id: 'dragonsbreath', name: "Dragon's Breath", image: 'assets/weapons/Dragon\'s_Breath.jpg' },
    { id: 'firestaff', name: 'Fire Staff', image: 'assets/weapons/Fire_Staff.jpg' },
    { id: 'firewalk', name: 'Firewalk', image: 'assets/weapons/Firewalk.jpg' },
    { id: 'frostwalker', name: 'Frost Walker', image: 'assets/weapons/Frost_walker.jpg' },
    { id: 'herosword', name: 'Hero Sword', image: 'assets/weapons/Hero_Sword_Icon.jpg' },
    { id: 'katana', name: 'Katana', image: 'assets/weapons/Katana.jpg' },
    { id: 'lightningstaff', name: 'Lightning Staff', image: 'assets/weapons/Lightning_Staff_Icon.jpg' },
    { id: 'mines', name: 'Mines', image: 'assets/weapons/Mines.jpg' },
    { id: 'poisonflask', name: 'Poison Flask', image: 'assets/weapons/Poison_Flask_Icon.jpg' },
    { id: 'revolver', name: 'Revolver', image: 'assets/weapons/Revolver_Icon.jpg' },
    { id: 'shotgun', name: 'Shotgun', image: 'assets/weapons/Shotgun.jpg' },
    { id: 'sluttyrocket', name: 'Slutty Rocket', image: 'assets/weapons/SluttyRocket.jpg' },
    { id: 'sniperrifle', name: 'Sniper Rifle', image: 'assets/weapons/Sniper_Rifle.jpg' },
    { id: 'spacenoodle', name: 'Space Noodle', image: 'assets/weapons/Space_Noodle.jpg' },
    { id: 'sword', name: 'Sword', image: 'assets/weapons/Sword_Icon.jpg' },
    { id: 'tornado', name: 'Tornado', image: 'assets/weapons/Tornado.jpg' },
    { id: 'wirelessdagger', name: 'Wireless Dagger', image: 'assets/weapons/Wireless_Dagger.jpg' }
];

// Liste des tomes
const TOMES = [
    { id: 'agility', name: 'Agility Tome', image: 'assets/tomes/Agility-Tome.png' },
    { id: 'armor', name: 'Armor Tome', image: 'assets/tomes/Armor-Tome.png' },
    { id: 'attraction', name: 'Attraction Tome', image: 'assets/tomes/Attraction-Tome.png' },
    { id: 'bloody', name: 'Bloody Tome', image: 'assets/tomes/Bloody-Tome.png' },
    { id: 'chaos', name: 'Chaos Tome', image: 'assets/tomes/Chaos_Tome.1.png' },
    { id: 'cooldown', name: 'Cooldown Tome', image: 'assets/tomes/Cooldown-Tome.png' },
    { id: 'cursed', name: 'Cursed Tome', image: 'assets/tomes/Cursed_Tome_Logo.png' },
    { id: 'damage', name: 'Damage Tome', image: 'assets/tomes/Damage-Tome.png' },
    { id: 'duration', name: 'Duration Tome', image: 'assets/tomes/Duration_Tome_Logo.png' },
    { id: 'evasion', name: 'Evasion Tome', image: 'assets/tomes/Evasion-Tome.png' },
    { id: 'gold', name: 'Gold Tome', image: 'assets/tomes/Gold-Tome.png' },
    { id: 'hp', name: 'HP Tome', image: 'assets/tomes/HP-Tome.png' },
    { id: 'knockback', name: 'Knockback Tome', image: 'assets/tomes/Knockback-Tome.png' },
    { id: 'luck', name: 'Luck Tome', image: 'assets/tomes/Luck-Tome.png' },
    { id: 'precision', name: 'Precision Tome', image: 'assets/tomes/Precision-Tome.png' },
    { id: 'projectile', name: 'Projectile Tome', image: 'assets/tomes/Projectile-Tome.png' },
    { id: 'quantity', name: 'Quantity Tome', image: 'assets/tomes/Quantity-Tome.png' },
    { id: 'regen', name: 'Regen Tome', image: 'assets/tomes/Regen-Tome.png' },
    { id: 'shield', name: 'Shield Tome', image: 'assets/tomes/Shield-Tome.png' },
    { id: 'silve', name: 'Silve Tome', image: 'assets/tomes/Silve-Tome.png' },
    { id: 'size', name: 'Size Tome', image: 'assets/tomes/Size-Tome.png' },
    { id: 'thorns', name: 'Thorns Tome', image: 'assets/tomes/Thorns_Tome_Logo.png' },
    { id: 'xp', name: 'XP Tome', image: 'assets/tomes/XP-Tome.png' }
];

// ===== BUILD STATE =====
let currentBuild = {
    character: null,
    weapons: [],
    tomes: []
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeBuildsPage();
    checkOverwolfSupport();
    loadSavedBuilds();
});

// ===== TAB NAVIGATION =====
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// ===== BUILDS PAGE =====
function initializeBuildsPage() {
    populateCharacters();
    populateWeapons();
    populateTomes();

    // Event listeners for buttons
    document.getElementById('save-build-btn').addEventListener('click', saveBuild);
    document.getElementById('reset-build-btn').addEventListener('click', resetBuild);
}

function populateCharacters() {
    const container = document.getElementById('character-selection');
    container.innerHTML = '';

    CHARACTERS.forEach(character => {
        const item = createSelectionItem(character, 'character');
        container.appendChild(item);
    });
}

function populateWeapons() {
    const container = document.getElementById('weapon-selection');
    container.innerHTML = '';

    WEAPONS.forEach(weapon => {
        const item = createSelectionItem(weapon, 'weapon');
        container.appendChild(item);
    });
}

function populateTomes() {
    const container = document.getElementById('tome-selection');
    container.innerHTML = '';

    TOMES.forEach(tome => {
        const item = createSelectionItem(tome, 'tome');
        container.appendChild(item);
    });
}

function createSelectionItem(data, type) {
    const div = document.createElement('div');
    div.className = 'selection-item';
    div.dataset.id = data.id;
    div.dataset.type = type;

    const img = document.createElement('img');
    img.src = data.image;
    img.alt = data.name;
    img.onerror = () => {
        img.style.display = 'none';
        div.innerHTML += `<span style="color: #fff; font-size: 0.8rem; text-align: center;">${data.name}</span>`;
    };

    const nameLabel = document.createElement('div');
    nameLabel.className = 'item-name';
    nameLabel.textContent = data.name;

    div.appendChild(img);
    div.appendChild(nameLabel);

    div.addEventListener('click', () => handleSelection(data, type, div));

    return div;
}

function handleSelection(data, type, element) {
    if (type === 'character') {
        document.querySelectorAll('[data-type="character"]').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');

        currentBuild.character = data;
        document.getElementById('character-name').textContent = data.name;
        document.getElementById('character-weapon').textContent = data.defaultWeapon;

        // Retirer l'arme par défaut du nouveau personnage si elle est dans les armes sélectionnées
        if (currentBuild.weapons.includes(data.defaultWeaponId)) {
            currentBuild.weapons = currentBuild.weapons.filter(w => w !== data.defaultWeaponId);
            document.getElementById('weapon-count').textContent = `${currentBuild.weapons.length}/3`;
        }

        // Mettre à jour l'affichage des armes pour désactiver/activer les bonnes armes
        updateWeaponsDisplay();

    } else if (type === 'weapon') {
        // Vérifier si cette arme est l'arme par défaut du personnage sélectionné
        if (currentBuild.character && data.id === currentBuild.character.defaultWeaponId) {
            return;
        }

        if (currentBuild.weapons.includes(data.id)) {
            // Deselect
            currentBuild.weapons = currentBuild.weapons.filter(w => w !== data.id);
            element.classList.remove('selected');
        } else if (currentBuild.weapons.length < 3) {
            // Select
            currentBuild.weapons.push(data.id);
            element.classList.add('selected');
        }
        document.getElementById('weapon-count').textContent = `${currentBuild.weapons.length}/3`;

    } else if (type === 'tome') {
        if (currentBuild.tomes.includes(data.id)) {
            // Deselect
            currentBuild.tomes = currentBuild.tomes.filter(t => t !== data.id);
            element.classList.remove('selected');
        } else if (currentBuild.tomes.length < 4) {
            // Select
            currentBuild.tomes.push(data.id);
            element.classList.add('selected');
        }
        document.getElementById('tome-count').textContent = `${currentBuild.tomes.length}/4`;
    }

    updateSaveButtonState();
}

function updateWeaponsDisplay() {
    const weaponElements = document.querySelectorAll('[data-type="weapon"]');

    weaponElements.forEach(element => {
        const weaponId = element.dataset.id;

        // Réinitialiser l'état
        element.classList.remove('disabled', 'selected');

        // Si un personnage est sélectionné et que c'est son arme par défaut, désactiver
        if (currentBuild.character && weaponId === currentBuild.character.defaultWeaponId) {
            element.classList.add('disabled');
            element.style.opacity = '0.3';
            element.style.cursor = 'not-allowed';
            element.title = `Arme par défaut de ${currentBuild.character.name}`;
        } else {
            element.style.opacity = '';
            element.style.cursor = '';
            element.title = '';

            // Réafficher les armes sélectionnées
            if (currentBuild.weapons.includes(weaponId)) {
                element.classList.add('selected');
            }
        }
    });
}

function updateSaveButtonState() {
    const saveBtn = document.getElementById('save-build-btn');
    const isComplete = currentBuild.character &&
                      currentBuild.weapons.length === 3 &&
                      currentBuild.tomes.length === 4;

    saveBtn.disabled = !isComplete;
}

function saveBuild() {
    if (!currentBuild.character || currentBuild.weapons.length !== 3 || currentBuild.tomes.length !== 4) {
        alert('Veuillez compléter toutes les sélections avant de sauvegarder.');
        return;
    }

    // Get saved builds from localStorage
    let savedBuilds = JSON.parse(localStorage.getItem('bonkdata_builds') || '[]');

    // Get build name from input or generate automatic name
    const buildNameInput = document.getElementById('build-name-input');
    let buildName = buildNameInput.value.trim();

    if (!buildName) {
        // Generate automatic name: "CharacterName - build X"
        const characterBuilds = savedBuilds.filter(b => b.character.id === currentBuild.character.id);
        const buildNumber = characterBuilds.length + 1;
        buildName = `${currentBuild.character.name} - build ${buildNumber}`;
    }

    // Create build object with timestamp
    const buildToSave = {
        id: Date.now(),
        name: buildName,
        character: currentBuild.character,
        weapons: currentBuild.weapons.map(id => WEAPONS.find(w => w.id === id)),
        tomes: currentBuild.tomes.map(id => TOMES.find(t => t.id === id)),
        createdAt: new Date().toISOString()
    };

    savedBuilds.push(buildToSave);
    localStorage.setItem('bonkdata_builds', JSON.stringify(savedBuilds));

    alert(`✅ Build "${buildName}" sauvegardé avec succès !`);
    resetBuild();
    loadSavedBuilds();
}

function resetBuild() {
    currentBuild = {
        character: null,
        weapons: [],
        tomes: []
    };

    // Clear all selections
    document.querySelectorAll('.selection-item').forEach(el => {
        el.classList.remove('selected', 'disabled');
        el.style.opacity = '';
        el.style.cursor = '';
        el.title = '';
    });

    // Reset UI
    document.getElementById('character-name').textContent = 'Aucun';
    document.getElementById('character-weapon').textContent = '-';
    document.getElementById('weapon-count').textContent = '0/3';
    document.getElementById('tome-count').textContent = '0/4';
    document.getElementById('build-name-input').value = '';

    updateSaveButtonState();
}

function loadSavedBuilds() {
    const container = document.getElementById('saved-builds-list');
    const savedBuilds = JSON.parse(localStorage.getItem('bonkdata_builds') || '[]');

    if (savedBuilds.length === 0) {
        container.innerHTML = '<p class="no-builds">Aucun build sauvegardé pour le moment.</p>';
        return;
    }

    container.innerHTML = '';

    savedBuilds.reverse().forEach(build => {
        const card = createBuildCard(build);
        container.appendChild(card);
    });
}

function createBuildCard(build) {
    const card = document.createElement('div');
    card.className = 'saved-build-card';

    // Vérifier si c'est le build actif
    const activeBuildId = parseInt(localStorage.getItem('bonkdata_active_build'));
    const isActiveBuild = build.id === activeBuildId;

    const date = new Date(build.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Gérer les anciens builds qui n'ont pas de propriété "name"
    const buildName = build.name || `${build.character.name} - build`;

    // Trouver l'arme par défaut dans la liste des armes
    const defaultWeaponData = WEAPONS.find(w => w.id === build.character.defaultWeaponId);

    card.innerHTML = `
        <h4>🎮 ${buildName}</h4>
        <p style="color: #888; font-size: 0.85rem; margin-bottom: 15px;">${date}</p>
        
        <div class="build-preview">
            <!-- Character Section -->
            <div class="build-preview-section">
                <span class="build-preview-label">👤 Personnage</span>
                <div class="build-icons-container">
                    <div class="build-icon-item" title="${build.character.name}">
                        <img src="${build.character.image}" alt="${build.character.name}" />
                        <span class="build-icon-name">${build.character.name}</span>
                    </div>
                </div>
            </div>

            <!-- All Weapons Section (Default + Additional) -->
            <div class="build-preview-section">
                <span class="build-preview-label">⚔️ Armes</span>
                <div class="build-icons-container">
                    <!-- Default Weapon -->
                    ${defaultWeaponData ? `
                        <div class="build-icon-item default-weapon" title="${defaultWeaponData.name} (Par défaut)">
                            <img src="${defaultWeaponData.image}" alt="${defaultWeaponData.name}" />
                            <span class="default-badge">★</span>
                        </div>
                    ` : ''}
                    <!-- Additional Weapons -->
                    ${build.weapons.map(weapon => `
                        <div class="build-icon-item" title="${weapon.name}">
                            <img src="${weapon.image}" alt="${weapon.name}" />
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Tomes Section -->
            <div class="build-preview-section">
                <span class="build-preview-label">📚 Tomes</span>
                <div class="build-icons-container">
                    ${build.tomes.map(tome => `
                        <div class="build-icon-item" title="${tome.name}">
                            <img src="${tome.image}" alt="${tome.name}" />
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div class="build-card-actions">
            <button class="btn-small btn-activate" onclick="activateBuild(${build.id})" ${isActiveBuild ? 'disabled' : ''}>
                ${isActiveBuild ? '✓ Actif' : '▶️ Activer'}
            </button>
            <button class="btn-small btn-delete" onclick="deleteBuild(${build.id})">🗑️ Supprimer</button>
        </div>
    `;

    if (isActiveBuild) {
        card.classList.add('active-build');
    }

    return card;
}

function activateBuild(buildId) {
    // Sauvegarder l'ID du build actif
    localStorage.setItem('bonkdata_active_build', buildId);

    // Recharger l'affichage des builds
    loadSavedBuilds();

    // Notification
    const build = JSON.parse(localStorage.getItem('bonkdata_builds') || '[]').find(b => b.id === buildId);
    if (build) {
        alert(`✅ Build "${build.name || build.character.name}" activé !\n\n🎮 L'overlay de jeu affichera maintenant ce build.`);
    }
}

function deleteBuild(buildId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce build ?')) {
        return;
    }

    let savedBuilds = JSON.parse(localStorage.getItem('bonkdata_builds') || '[]');
    savedBuilds = savedBuilds.filter(b => b.id !== buildId);
    localStorage.setItem('bonkdata_builds', JSON.stringify(savedBuilds));

    loadSavedBuilds();
}

// Make deleteBuild and activateBuild available globally
window.deleteBuild = deleteBuild;
window.activateBuild = activateBuild;

// ===== OVERWOLF STATUS =====
function checkOverwolfSupport() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.getElementById('status-text');

    try {
        if (typeof overwolf !== 'undefined' && overwolf.extensions) {
            overwolf.extensions.current.getManifest((result) => {
                if (result.success) {
                    statusIndicator.classList.add('connected');
                    statusText.textContent = '✓ Overwolf connecté - ' + (result.meta?.name || result.name || 'BonkData');
                    console.log('✓ Overwolf API disponible:', result);
                } else {
                    statusIndicator.classList.add('disconnected');
                    statusText.textContent = '⚠ Overwolf détecté mais erreur';
                }
            });
        } else {
            statusIndicator.classList.add('disconnected');
            statusText.textContent = '⚠ Mode développement Electron (Overwolf non disponible)';
        }
    } catch (error) {
        statusIndicator.classList.add('disconnected');
        statusText.textContent = '✗ Erreur de connexion Overwolf';
        console.error('Overwolf error:', error);
    }
}

// ===== CONSOLE LOGS =====
console.log('🚀 BonkData Application démarrée');
if (typeof overwolf !== 'undefined') {
    console.log('✓ Overwolf API disponible');
    console.log('📦 Overwolf object:', overwolf);
} else if (typeof process !== 'undefined' && process.versions) {
    console.log('📦 Electron version:', process.versions.electron);
    console.log('🔧 Node version:', process.versions.node);
    console.log('🌐 Chrome version:', process.versions.chrome);
}

