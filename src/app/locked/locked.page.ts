import { Component, OnInit } from '@angular/core';
import { PreferencesService, SessionVaultService } from '@app/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-locked',
  templateUrl: './locked.page.html',
  styleUrls: ['./locked.page.scss'],
})
export class LockedPage {
  errorMessage: string;

  constructor(
    private navController: NavController,
    private preferences: PreferencesService,
    private sessionVault: SessionVaultService
  ) {}

  async unlock() {
    try {
      await this.sessionVault.unlockSession();
      await this.preferences.load();
      this.navController.navigateRoot(['/', 'tasting-notes']);
    } catch (err) {
      this.errorMessage = 'Could not unlock session';
    }
  }

  goToLogin() {
    console.log('Go to Login');
  }
}
