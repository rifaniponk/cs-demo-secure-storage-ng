import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PreferencesService, SessionVaultService } from './core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private navController: NavController,
    private preferences: PreferencesService,
    private sessionVault: SessionVaultService
  ) {}

  async ngOnInit() {
    this.handlePreferencesChange();
    this.handleLocked();
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
