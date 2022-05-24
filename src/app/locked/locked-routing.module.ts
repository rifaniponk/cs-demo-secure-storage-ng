import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LockedPage } from './locked.page';

const routes: Routes = [
  {
    path: '',
    component: LockedPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LockedPageRoutingModule {}
