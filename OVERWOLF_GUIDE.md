# Guide d'intégration Overwolf

## Configuration actuelle

Votre application est maintenant configurée avec :
- ✅ **Electron.js** - Application desktop fonctionnelle
- ✅ **Interface moderne** - Design gaming avec animations
- ✅ **Manifest Overwolf** - Fichier de configuration pour Overwolf
- ✅ **Structure de base** - Prête pour le développement

## Pour tester avec Overwolf

### Option 1 : Mode Electron seul (Actuel)
```bash
npm start
```
L'application démarre en mode desktop Electron standard.

### Option 2 : Mode Overwolf complet

1. **Installer Overwolf Desktop**
   - Téléchargez depuis https://www.overwolf.com/
   - Installez et lancez Overwolf

2. **Activer le mode développeur**
   - Ouvrez Overwolf
   - Paramètres → Support → Development options
   - Activez "Developer mode"

3. **Charger l'application**
   - Dans Overwolf, ouvrez "Load unpacked extension"
   - Sélectionnez le dossier : `C:\Users\Florian\Desktop\devprojet\bonkData`
   - L'application apparaîtra dans la liste des apps Overwolf

## Structure des fichiers

```
bonkData/
├── main.js              # Point d'entrée Electron
├── index.html           # Interface principale
├── styles.css           # Styles de l'application
├── renderer.js          # Logique client
├── package.json         # Configuration npm
├── manifest.json        # Configuration Overwolf
└── README.md            # Documentation
```

## Prochaines étapes

### 1. Ajouter des événements de jeu
```javascript
// Exemple dans renderer.js
overwolf.games.events.setRequiredFeatures(['game_name'], (result) => {
  console.log('Features set:', result);
});
```

### 2. Créer des overlays in-game
Modifiez le manifest.json pour ajouter des fenêtres overlay :
```json
"in_game_window": {
  "file": "overlay.html",
  "in_game_only": true,
  "desktop_only": false
}
```

### 3. Utiliser l'API Overwolf
```javascript
// Obtenir les infos du jeu
overwolf.games.getRunningGameInfo((result) => {
  if (result.isRunning) {
    console.log('Jeu actif:', result.title);
  }
});
```

## APIs Overwolf disponibles

- `overwolf.games` - Information sur les jeux
- `overwolf.games.events` - Événements in-game
- `overwolf.windows` - Gestion des fenêtres
- `overwolf.settings` - Paramètres utilisateur
- `overwolf.streaming` - Streaming & capture
- `overwolf.benchmarking` - Performance

## Support

Pour plus d'informations :
- Documentation Overwolf : https://overwolf.github.io/
- Electron docs : https://www.electronjs.org/docs
- API Reference : https://overwolf.github.io/api/

## Ressources additionnelles

### Jeux supportés par Overwolf
Plus de 1500 jeux incluant :
- League of Legends
- Valorant
- CS:GO
- Fortnite
- Apex Legends
- Et bien d'autres...

### Communauté
- Discord Overwolf Developers
- Forum Overwolf
- GitHub Examples

---
**Note** : Cette application fonctionne actuellement en mode Electron. Pour une intégration complète Overwolf, suivez les étapes ci-dessus.

