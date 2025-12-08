/**
 * Gestionnaire des onglets de navigation
 */

export class TabManager {
  private tabs: NodeListOf<Element>;
  private tabContents: NodeListOf<Element>;

  constructor() {
    this.tabs = document.querySelectorAll('.tab-button');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.initialize();
  }

  /**
   * Initialise les événements des onglets
   */
  private initialize(): void {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        if (tabName) {
          this.switchTab(tabName);
        }
      });
    });
  }

  public switchTab(tabName: string): void {
    this.tabs.forEach(tab => tab.classList.remove('active'));
    this.tabContents.forEach(content => content.classList.remove('active'));

    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`${tabName}-tab`);

    if (selectedTab) {
      selectedTab.classList.add('active');
    }

    if (selectedContent) {
      selectedContent.classList.add('active');
    }
  }
}

