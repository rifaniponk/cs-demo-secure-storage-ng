import { Component } from '@angular/core';
import { AuthenticationService, SessionVaultService } from '@app/core';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tasting-notes',
  templateUrl: 'tasting-notes.page.html',
  styleUrls: ['tasting-notes.page.scss'],
})
export class TastingNotesPage {
  prefersDarkMode: boolean;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private sessionVault: SessionVaultService
  ) {}

  async logout(): Promise<void> {
    await firstValueFrom(this.authentication.logout());
    await this.sessionVault.clearSession();
    this.navController.navigateRoot(['/', 'login']);
  }

  sync() {
    console.log('sync');
  }
}
