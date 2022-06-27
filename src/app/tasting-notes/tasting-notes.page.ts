import { Component, OnInit } from '@angular/core';
import { AuthenticationService, PreferencesService, SessionVaultService } from '@app/core';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tasting-notes',
  templateUrl: 'tasting-notes.page.html',
  styleUrls: ['tasting-notes.page.scss'],
})
export class TastingNotesPage implements OnInit {
  prefersDarkMode: boolean;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private preferences: PreferencesService,
    private sessionVault: SessionVaultService
  ) {}

  async ngOnInit(): Promise<void> {
    this.prefersDarkMode = this.preferences.prefersDarkMode;
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.authentication.logout());
    await this.sessionVault.clearSession();
    this.navController.navigateRoot(['/', 'login']);
  }

  sync() {
    console.log('sync');
  }

  setDarkMode() {
    this.preferences.setPrefersDarkMode(!this.prefersDarkMode);
  }
}
