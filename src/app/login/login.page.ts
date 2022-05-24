import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@app/core';
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

  constructor(private authentication: AuthenticationService, private navController: NavController) {}

  async signIn() {
    const res = await this.authentication.login(this.email, this.password).toPromise();
    if (res) {
      this.navController.navigateRoot(['/', 'tasting-notes']);
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
