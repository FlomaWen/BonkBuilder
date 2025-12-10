import { EventEmitter } from 'events';
import * as Tesseract from 'tesseract.js';

/**
 * Service de détection de level-up avec OCR
 */
export class LevelUpDetectionService extends EventEmitter {
  private isInitialized: boolean = false;
  private isProcessing: boolean = false;
  private lastDetectionTime: number = 0;
  private readonly DETECTION_COOLDOWN_MS = 2000; // 2 secondes entre chaque détection
  private frameCounter: number = 0;
  private readonly DEBUG_MODE = true; // Active le mode debug pour tester
  private worker: Tesseract.Worker | null = null;
  private readonly TARGET_TEXT = 'AMELIORATIONS PROPOSEES'; // Texte à détecter
  private readonly SIMILARITY_THRESHOLD = 0.65; // 65% de similarité minimum (plus tolérant)
  private isInLevelUp: boolean = false; // Indique si on est actuellement en level-up
  private consecutiveNonDetections: number = 0; // Compteur de frames sans détection
  private readonly NON_DETECTION_THRESHOLD = 1; // 1 frame sans détection avant de considérer que le level-up est terminé
  private activeBuildItems: string[] = []; // Noms des armes et tomes du build actif
  private readonly ITEM_SIMILARITY_THRESHOLD = 0.60; // 60% de similarité pour les items (plus tolérant)

  constructor() {
    super();
  }


  /**
   * Calcule la distance de Levenshtein entre deux chaînes
   */
  setActiveBuild(build: any): void {
    this.activeBuildItems = [];

    if (!build) return;

    // Ajouter les armes du build (en majuscules, sans espaces)
    if (build.weapons && Array.isArray(build.weapons)) {
      build.weapons.forEach((weapon: any) => {
        if (weapon.name) {
          this.activeBuildItems.push(weapon.name.toUpperCase().replace(/\s+/g, ''));
        }
      });
    }

    // Ajouter les tomes du build
    if (build.tomes && Array.isArray(build.tomes)) {
      build.tomes.forEach((tome: any) => {
        if (tome.name) {
          this.activeBuildItems.push(tome.name.toUpperCase().replace(/\s+/g, ''));
        }
      });
    }

    console.log('📋 Build actif configuré pour la détection:', this.activeBuildItems);
  }

  /**
   * Calcule la distance de Levenshtein entre deux chaînes
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // Initialiser la matrice
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Remplir la matrice
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // suppression
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Calcule la similarité entre deux chaînes (0 = différent, 1 = identique)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1.length === 0 && str2.length === 0) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;

    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  }

  /**
   * Cherche le texte cible dans le texte détecté avec un seuil de similarité
   */
  private findSimilarText(detectedText: string, targetText: string, threshold?: number): { found: boolean; similarity: number; match: string } {
    const similarityThreshold = threshold || this.SIMILARITY_THRESHOLD;
    const targetLength = targetText.length;
    let bestSimilarity = 0;
    let bestMatch = '';

    // Chercher dans toutes les sous-chaînes possibles du texte détecté
    for (let i = 0; i <= detectedText.length - targetLength + 5; i++) {
      for (let length = targetLength - 5; length <= targetLength + 5 && i + length <= detectedText.length; length++) {
        const substring = detectedText.substring(i, i + length);
        const similarity = this.calculateSimilarity(substring, targetText);

        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = substring;
        }
      }
    }

    return {
      found: bestSimilarity >= similarityThreshold,
      similarity: bestSimilarity,
      match: bestMatch,
    };
  }

  /**
   * Génère des variations de noms pour améliorer la détection
   * Ex: "TOME D'XP" -> ["TOMEDXP", "TOMED'XP", "TOME XP", "TOMEXP"]
   */
  private generateNameVariations(name: string): string[] {
    const variations: string[] = [name];

    // Sans espaces
    variations.push(name.replace(/\s+/g, ''));

    // Sans apostrophes
    variations.push(name.replace(/'/g, ''));
    variations.push(name.replace(/'/g, '').replace(/\s+/g, ''));

    // Avec espace au lieu d'apostrophe
    variations.push(name.replace(/'/g, ' '));

    // Sans "DE" / "D'" dans les noms composés
    if (name.includes('DE ') || name.includes('D\'')) {
      const withoutDe = name.replace(/D[E']?\s*/g, '');
      variations.push(withoutDe);
      variations.push(withoutDe.replace(/\s+/g, ''));
    }

    return [...new Set(variations)]; // Enlever les doublons
  }

  /**
   * Détecte les items du build actif dans le texte OCR
   */
  private detectBuildItems(detectedText: string, detectedTextNoSpaces: string): string[] {
    const detectedItems: string[] = [];
    const alreadyDetected = new Set<string>();

    for (const itemName of this.activeBuildItems) {
      if (alreadyDetected.has(itemName)) continue;

      // Générer toutes les variations du nom
      const variations = this.generateNameVariations(itemName);

      let bestSimilarity = 0;
      let bestMatch = '';
      let bestVariation = '';

      // Essayer toutes les variations
      for (const variation of variations) {
        // Essayer dans le texte sans espaces
        const result1 = this.findSimilarText(detectedTextNoSpaces, variation.replace(/\s+/g, ''), this.ITEM_SIMILARITY_THRESHOLD);

        // Essayer dans le texte avec espaces
        const result2 = this.findSimilarText(detectedText, variation, this.ITEM_SIMILARITY_THRESHOLD);

        if (result1.similarity > bestSimilarity) {
          bestSimilarity = result1.similarity;
          bestMatch = result1.match;
          bestVariation = variation;
        }

        if (result2.similarity > bestSimilarity) {
          bestSimilarity = result2.similarity;
          bestMatch = result2.match;
          bestVariation = variation;
        }
      }

      if (bestSimilarity >= this.ITEM_SIMILARITY_THRESHOLD) {
        detectedItems.push(itemName);
        alreadyDetected.add(itemName);

        if (this.DEBUG_MODE) {
          console.log(`✅ Item détecté: ${itemName} (${(bestSimilarity * 100).toFixed(1)}% - variation: "${bestVariation}" - match: "${bestMatch}")`);
        }
      }
    }

    return detectedItems;
  }


  /**
   * Initialise le service avec Tesseract.js
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initialisation du service de détection de level-up avec OCR...');

      // Créer un worker Tesseract avec la langue française
      this.worker = await Tesseract.createWorker('fra', 1, {
        logger: (info) => {
          if (info.status === 'recognizing text' && this.DEBUG_MODE) {
            console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        },
      });

      // Configurer le worker pour améliorer la détection du texte blanc
      await this.worker.setParameters({
        // Autoriser les lettres françaises, chiffres et quelques caractères spéciaux
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸàâäçéèêëîïôöùûüÿ\' -',
        // Mode AUTO pour détecter automatiquement la mise en page
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        // Améliorer la précision avec LSTM
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
        // Activer la correction du dictionnaire pour le français
        tessedit_enable_dict_correction: '1',
        tessedit_enable_bigram_correction: '1',
        // Ne pas inverser ici, on le fait dans le prétraitement
        tessedit_do_invert: '0',
      });

      this.isInitialized = true;
      console.log('✅ Service de détection de level-up initialisé avec OCR');

      if (this.DEBUG_MODE) {
        console.log('⚠️ Mode DEBUG activé - Appuyez sur F8 dans le jeu pour simuler un level-up');
        console.log(`📝 Recherche du texte: "${this.TARGET_TEXT}"`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service:', error);
      throw error;
    }
  }

  /**
   * Termine le service et libère les ressources
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
    console.log('Service de détection de level-up terminé');
  }



  /**
   * Extrait la zone centrale de l'image où se trouvent les améliorations
   * Zone: 740x750px au centre de l'écran 1920x1200
   */
  private async extractCenterRegion(imageBase64: string): Promise<string> {
    try {
      const sharp = require('sharp');

      // Décoder l'image base64
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Dimensions de la zone à extraire
      const cropWidth = 740;
      const cropHeight = 750;

      // Calculer la position pour centrer le crop (1920x1200)
      const screenWidth = 1920;
      const screenHeight = 1200;
      const left = Math.floor((screenWidth - cropWidth) / 2); // ~590px
      const top = Math.floor((screenHeight - cropHeight) / 2); // ~225px

      // Extraire la zone et optimiser pour le texte blanc
      const processedBuffer = await sharp(imageBuffer)
        .extract({ left, top, width: cropWidth, height: cropHeight })
        // Redimensionner à 200% pour améliorer la précision de l'OCR
        .resize(cropWidth * 2, cropHeight * 2, {
          kernel: sharp.kernel.lanczos3,
          fit: 'fill',
        })
        .greyscale() // Convertir en niveaux de gris
        // Augmenter fortement le contraste
        .normalise({ lower: 1, upper: 99 })
        .linear(1.5, -(128 * 0.5)) // Augmenter le contraste avec linear
        // Appliquer un seuil pour isoler le texte blanc
        .threshold(140, { greyscale: true })
        .negate() // Inverser (texte blanc devient noir sur fond blanc)
        // Appliquer un léger flou pour nettoyer le bruit
        .median(2)
        .toBuffer();

      // Reconvertir en base64
      return `data:image/png;base64,${processedBuffer.toString('base64')}`;
    } catch (error) {
      console.warn('⚠️ Impossible d\'extraire la région centrale, utilisation de l\'image complète:', error);
      return imageBase64; // Retourner l'image originale en cas d'erreur
    }
  }

  /**
   * Analyse une frame pour détecter le level-up avec OCR
   */
  async analyzeFrame(frameData: {
    buffer: Buffer;
    width: number;
    height: number;
    timestamp: Date;
  }): Promise<boolean> {
    if (!this.isInitialized || !this.worker) {
      return false;
    }

    // Éviter de traiter plusieurs frames simultanément
    if (this.isProcessing) {
      return false;
    }

    this.isProcessing = true;

    try {
      this.frameCounter++;

      // Si on n'est pas en level-up, appliquer le cooldown
      const now = Date.now();
      if (!this.isInLevelUp && now - this.lastDetectionTime < this.DETECTION_COOLDOWN_MS) {
        return false;
      }

      // Fréquence d'analyse : 1 frame sur 3 si pas en level-up, 1 sur 2 si en level-up (très réactif)
      const analyzeFrequency = this.isInLevelUp ? 2 : 3;
      if (this.frameCounter % analyzeFrequency !== 0) {
        return false;
      }

      // Convertir le buffer en image base64
      const imageBase64 = `data:image/png;base64,${frameData.buffer.toString('base64')}`;

      // Extraire uniquement la zone centrale pour améliorer la vitesse et la précision
      const croppedImage = await this.extractCenterRegion(imageBase64);

      // Analyser l'image avec Tesseract - configuré pour texte blanc
      const { data } = await this.worker.recognize(croppedImage);

      // Nettoyer le texte détecté : enlever les sauts de ligne et normaliser
      let detectedText = data.text
        .replace(/[\r\n]+/g, ' ') // Remplacer les sauts de ligne par des espaces
        .replace(/\s+/g, ' ')      // Normaliser les espaces multiples
        .trim()
        .toUpperCase();

      // Log pour debug (afficher le texte brut et nettoyé)
      if (this.DEBUG_MODE) {
        console.log('🔍 Texte détecté (brut):', data.text.substring(0, 150));
        console.log('🔍 Texte détecté (nettoyé):', detectedText.substring(0, 150));
      }

      // Version sans espaces pour la comparaison
      const detectedTextNoSpaces = detectedText.replace(/\s+/g, '');

      // Vérifier si le texte recherché est présent avec détection floue
      const targetSimple = this.TARGET_TEXT.replace(/\s+/g, '');
      const targetWithSpaces = this.TARGET_TEXT;

      // Méthode 1: Recherche exacte (pour les cas parfaits)
      const exactMatch =
        detectedTextNoSpaces.includes(targetSimple) ||
        detectedTextNoSpaces.includes('AMELIORATIONSPROPOSEES') ||
        detectedText.includes(targetWithSpaces) ||
        detectedText.includes('AMELIORATIONS PROPOSEES');

      // Méthode 2: Recherche avec similarité sur le texte sans espaces
      const similarityResult1 = this.findSimilarText(detectedTextNoSpaces, targetSimple);

      // Méthode 3: Recherche avec similarité sur le texte avec espaces
      const similarityResult2 = this.findSimilarText(detectedText, targetWithSpaces);

      // Prendre le meilleur résultat
      const similarityResult = similarityResult1.similarity > similarityResult2.similarity
        ? similarityResult1
        : similarityResult2;

      const isLevelUp = exactMatch || similarityResult.found;

      if (isLevelUp) {
        // Texte détecté
        this.consecutiveNonDetections = 0;

        if (!this.isInLevelUp) {
          // Nouveau level-up détecté
          console.log('🎉 Level-up détecté !');
          console.log('  - Texte détecté:', detectedText.substring(0, 100));
          console.log('  - Similarité:', (similarityResult.similarity * 100).toFixed(1) + '%');
          console.log('  - Meilleure correspondance:', similarityResult.match);

          this.isInLevelUp = true;
          this.lastDetectionTime = now;

          // Émettre l'événement de détection
          this.emit('level-up-detected', {
            timestamp: frameData.timestamp,
            detectedText: detectedText,
            similarity: similarityResult.similarity,
            match: similarityResult.match,
          });
        }

        // Détecter les items du build dans les améliorations proposées
        const detectedItems = this.detectBuildItems(detectedText, detectedTextNoSpaces);

        if (detectedItems.length > 0) {
          // Émettre un événement avec les items détectés
          this.emit('build-items-detected', {
            timestamp: frameData.timestamp,
            items: detectedItems,
          });
        }

        return true;
      } else {
        // Texte non détecté
        if (this.isInLevelUp) {
          this.consecutiveNonDetections++;

          if (this.DEBUG_MODE) {
            console.log(`⏳ Level-up non détecté (${this.consecutiveNonDetections}/${this.NON_DETECTION_THRESHOLD})`);
          }

          if (this.consecutiveNonDetections >= this.NON_DETECTION_THRESHOLD) {
            // Le texte a disparu, le level-up est terminé
            console.log('✅ Level-up terminé (texte disparu)');
            this.isInLevelUp = false;
            this.consecutiveNonDetections = 0;

            // Émettre l'événement de fin de level-up
            this.emit('level-up-ended', {
              timestamp: frameData.timestamp,
            });
          }
        }

        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse OCR:', error);
      return false;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Déclenche manuellement une détection de level-up (pour les tests)
   */
  public triggerManualDetection(): void {
    const now = Date.now();
    if (now - this.lastDetectionTime < this.DETECTION_COOLDOWN_MS) {
      console.log('⚠️ Cooldown actif, attendez quelques secondes');
      return;
    }

    console.log('🎉 Level-up déclenché manuellement !');
    this.lastDetectionTime = now;
    this.emit('level-up-detected', {
      timestamp: new Date(),
      detectedText: 'AMELIORATIONPROPOSEES',
    });
  }

  /**
   * Retourne l'état d'initialisation du service
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}
