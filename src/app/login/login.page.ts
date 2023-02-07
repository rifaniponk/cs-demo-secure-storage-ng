import { Component } from '@angular/core';
import { SyncService } from '@app/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string;
  password: string;
  errorMessage: string;

  constructor(private navController: NavController, private sync: SyncService) {}

  async onLoginSuccess(): Promise<void> {
    await this.sync.execute();
    this.navController.navigateRoot(['/', 'tasting-notes']);
  }
}
