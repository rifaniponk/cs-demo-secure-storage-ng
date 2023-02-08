import { Component, EventEmitter, Output } from '@angular/core';
import { SessionVaultService } from '@app/core';

@Component({
  selector: 'app-unlock-card',
  templateUrl: './unlock-card.component.html',
  styleUrls: ['./unlock-card.component.scss'],
})
export class UnlockCardComponent {
  @Output() unlocked = new EventEmitter<void>();
  @Output() vaultCleared = new EventEmitter<void>();

  errorMessage: string;

  constructor(private sessionVault: SessionVaultService) {}

  async redoClicked() {
    await this.sessionVault.clearSession();
    this.vaultCleared.emit();
  }

  async unlockClicked() {
    try {
      await this.sessionVault.getSession();
      this.unlocked.emit();
    } catch (err) {
      this.errorMessage = 'Unlock failed';
    }
  }
}
