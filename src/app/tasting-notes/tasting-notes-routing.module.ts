import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TastingNotesPage } from './tasting-notes.page';

const routes: Routes = [
  {
    path: '',
    component: TastingNotesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TastingNotesPageRoutingModule {}
