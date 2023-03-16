import { Component, OnInit } from '@angular/core';
import { SessionVaultService, SyncService } from '@app/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  showUnlock: boolean;

  constructor(
    private navController: NavController,
    private sessionVault: SessionVaultService,
    private sync: SyncService
  ) {
    this.sessionVault.locked$.subscribe((locked) => {
      if (!locked) {
        this.onUnlock();
      }
    });
  }

  async ngOnInit() {
    this.showUnlock = await this.sessionVault.sessionIsLocked();
  }

  async onLoginSuccess(): Promise<void> {
    await this.sync.execute();
    this.navController.navigateRoot(['/', 'tasting-notes']);
  }

  onUnlock(): void {
    this.navController.navigateRoot(['/', 'tasting-notes']);
  }

  onVaultClear(): void {
    this.showUnlock = false;
  }
}
