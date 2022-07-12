import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PreferencesService, SessionVaultService, TeaCategoriesService } from './core';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private navController: NavController,
    private preferences: PreferencesService,
    private sessionVault: SessionVaultService,
    private teaCategories: TeaCategoriesService
  ) {}

  async ngOnInit() {
    this.handlePreferencesChange();
    this.handleLocked();
    await this.teaCategories.refresh();
  }

  private handlePreferencesChange() {
    this.preferences.preferencesChanged$.subscribe(() => {
      document.body.classList.toggle('dark', this.preferences.prefersDarkMode);
    });
  }

  private async handleLocked() {
    this.sessionVault.locked$.subscribe((locked) => {
      if (locked) {
        this.navController.navigateRoot(['/', 'locked']);
      }
    });
  }
}
