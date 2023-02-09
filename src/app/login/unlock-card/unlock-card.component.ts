import { Component, EventEmitter, Output } from '@angular/core';
import { SessionVaultService } from '@app/core';

@Component({
  selector: 'app-unlock-card',
  templateUrl: './unlock-card.component.html',
  styleUrls: ['./unlock-card.component.scss'],
})
export class UnlockCardComponent {
  @Output() unlock = new EventEmitter<void>();
  @Output() vaultClear = new EventEmitter<void>();

  errorMessage: string;

  constructor(private sessionVault: SessionVaultService) {}

  async redoClicked() {
    await this.sessionVault.clearSession();
    this.vaultClear.emit();
  }

  async unlockClicked() {
    try {
      await this.sessionVault.getSession();
      this.unlock.emit();
    } catch (err) {
      this.errorMessage = 'Unlock failed';
    }
  }
}
