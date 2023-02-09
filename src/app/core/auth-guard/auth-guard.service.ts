import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { SessionVaultService } from '../session-vault/session-vault.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private navController: NavController,
    private platform: Platform,
    private sessionVault: SessionVaultService
  ) {}

  async canActivate(): Promise<boolean> {
    if (this.platform.is('hybrid') && (await this.sessionVault.sessionIsLocked())) {
      this.navController.navigateRoot(['/', 'login']);
      return false;
    }

    if (!(await this.sessionVault.getSession())) {
      this.navController.navigateRoot(['/', 'login']);
      return false;
    }

    return true;
  }
}
