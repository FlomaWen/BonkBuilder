/**
 * Service de gestion des builds
 */

import { Build, BuildState } from '../../types';

export class BuildService {
  private static readonly STORAGE_KEY = 'bonkdata_builds';
  private static readonly ACTIVE_BUILD_KEY = 'bonkdata_active_build';

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

    if (this.getActiveBuildId() === buildId) {
      this.clearActiveBuild();
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

  /**
   * Définit le build actif pour l'overlay
   */
  public setActiveBuild(buildId: string): boolean {
    console.log('BuildService: setActiveBuild appelé avec:', buildId);

    const builds = this.getAllBuilds();
    console.log('BuildService: Builds disponibles:', builds.map(b => ({ id: b.id, name: b.name })));

    const build = builds.find(b => b.id === buildId);
    console.log('BuildService: Build trouvé:', build);

    if (!build) {
      console.error('BuildService: Build non trouvé !');
      return false;
    }

    localStorage.setItem(BuildService.ACTIVE_BUILD_KEY, buildId);
    console.log('BuildService: Build activé dans localStorage:', buildId);
    return true;
  }

  /**
   * Récupère l'ID du build actif
   */
  public getActiveBuildId(): string | null {
    return localStorage.getItem(BuildService.ACTIVE_BUILD_KEY);
  }

  /**
   * Récupère le build actif complet
   */
  public getActiveBuild(): Build | null {
    const activeBuildId = this.getActiveBuildId();
    if (!activeBuildId) {
      return null;
    }

    const builds = this.getAllBuilds();
    return builds.find(b => b.id === activeBuildId) || null;
  }

  /**
   * Désactive le build actif
   */
  public clearActiveBuild(): void {
    localStorage.removeItem(BuildService.ACTIVE_BUILD_KEY);
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}

