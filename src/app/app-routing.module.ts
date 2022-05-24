import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tasting-notes',
    loadChildren: () => import('./tasting-notes/tasting-notes.module').then((m) => m.TastingNotesPageModule),
  },
  {
    path: '',
    redirectTo: 'tasting-notes',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'locked',
    loadChildren: () => import('./locked/locked.module').then((m) => m.LockedPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
