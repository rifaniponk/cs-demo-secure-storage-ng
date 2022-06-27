import { Component, OnInit } from '@angular/core';
import { AuthenticationService, PreferencesService, SessionVaultService } from '@app/core';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string;
  password: string;
  errorMessage: string;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private preferences: PreferencesService,
    private sessionVault: SessionVaultService
  ) {}

  async signIn() {
    const res = await firstValueFrom(this.authentication.login(this.email, this.password));
    if (res) {
      await this.sessionVault.initializeUnlockMode();
      await this.sessionVault.setSession(res);
      await this.preferences.load();
      this.navController.navigateRoot(['/', 'tasting-notes']);
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
