import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginCardComponent } from './login-card/login-card.component';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';
import { UnlockCardComponent } from './unlock-card/unlock-card.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LoginPageRoutingModule],
  declarations: [LoginPage, LoginCardComponent, UnlockCardComponent],
})
export class LoginPageModule {}
