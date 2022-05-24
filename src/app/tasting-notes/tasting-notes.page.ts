import { Component } from '@angular/core';
import { AuthenticationService } from '@app/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tasting-notes',
  templateUrl: 'tasting-notes.page.html',
  styleUrls: ['tasting-notes.page.scss'],
})
export class TastingNotesPage {
  prefersDarkMode: boolean;

  constructor(private authentication: AuthenticationService, private navController: NavController) {}

  async logout() {
    await this.authentication.logout();
    this.navController.navigateRoot(['/', 'login']);
  }

  sync() {
    console.log('sync');
  }
}
