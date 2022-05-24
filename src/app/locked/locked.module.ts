import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LockedPageRoutingModule } from './locked-routing.module';

import { LockedPage } from './locked.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LockedPageRoutingModule],
  declarations: [LockedPage],
})
export class LockedPageModule {}
