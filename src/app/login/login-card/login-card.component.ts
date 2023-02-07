import { Component, EventEmitter, Output } from '@angular/core';
import { AuthenticationService, SessionVaultService } from '@app/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
})
export class LoginCardComponent {
  @Output() loginSuccess = new EventEmitter<void>();

  email: string;
  password: string;
  errorMessage: string;

  constructor(private authentication: AuthenticationService, private sessionVault: SessionVaultService) {}

  async signIn() {
    const res = await firstValueFrom(this.authentication.login(this.email, this.password));
    if (res) {
      await this.sessionVault.initializeUnlockMode();
      await this.sessionVault.setSession(res);
      this.loginSuccess.emit();
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
