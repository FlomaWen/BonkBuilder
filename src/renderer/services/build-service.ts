/**
 * Service de gestion des builds
 */

import { Build, BuildState } from '../../types';

export class BuildService {
  private static readonly STORAGE_KEY = 'bonk_saved_builds';

  /**
   * Sauvegarde un build
   */
  public saveBuild(state: BuildState, buildName: string): Build | null {
    if (!state.character) {
      return null;
    }

    const build: Build = {
      id: this.generateId(),
      name: buildName || `Build ${state.character.name}`,
      character: state.character,
      weapons: [...state.weapons],
      tomes: [...state.tomes],
      createdAt: new Date(),
    };

    const builds = this.getAllBuilds();
    builds.push(build);
    this.saveToStorage(builds);

    return build;
  }

  /**
   * Récupère tous les builds sauvegardés
   */
  public getAllBuilds(): Build[] {
    try {
      const stored = localStorage.getItem(BuildService.STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const builds = JSON.parse(stored);
      // Convertir les dates string en objets Date
      return builds.map((build: any) => ({
        ...build,
        createdAt: new Date(build.createdAt),
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des builds:', error);
      return [];
    }
  }

  /**
   * Supprime un build
   */
  public deleteBuild(buildId: string): boolean {
    const builds = this.getAllBuilds();
    const filteredBuilds = builds.filter(b => b.id !== buildId);

    if (filteredBuilds.length === builds.length) {
      return false; // Build non trouvé
    }

    this.saveToStorage(filteredBuilds);
    return true;
  }

  /**
   * Exporte un build en JSON
   */
  public exportBuild(build: Build): string {
    return JSON.stringify(build, null, 2);
  }

  /**
   * Importe un build depuis JSON
   */
  public importBuild(jsonString: string): Build | null {
    try {
      const build = JSON.parse(jsonString);
      if (!build.character || !build.weapons || !build.tomes) {
        return null;
      }
      return build;
    } catch (error) {
      console.error('Erreur lors de l\'import du build:', error);
      return null;
    }
  }

  private saveToStorage(builds: Build[]): void {
    localStorage.setItem(BuildService.STORAGE_KEY, JSON.stringify(builds));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

