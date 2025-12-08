# BonkBuilder

Application Electron avec TypeScript pour créer et gérer des builds pour le jeu Bonk.io.

## Installation

```bash
npm install
npm run build
npm start
```

## Commandes

```bash
npm run build        # Compiler TypeScript
npm run build:watch  # Compilation automatique
npm start           # Lancer l'application
npm run dev         # Mode développement
npm run clean       # Nettoyer dist/
```

## Structure

```
src/
├── main/           # Processus principal Electron
├── renderer/       # Interface utilisateur
│   ├── services/  # Logique métier
│   └── ui/        # Composants UI
├── types/         # Types TypeScript
└── constants/     # Données du jeu
```

## Fonctionnalités

- Créer des builds personnalisés (personnage + 3 armes + 4 tomes)
- Sauvegarder et gérer plusieurs builds
- Overlay en jeu pour afficher le build actif
- 20 personnages, 29 armes, 23 tomes disponibles

