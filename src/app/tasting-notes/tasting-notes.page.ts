import { Component, OnInit } from '@angular/core';
import { AuthenticationService, PreferencesService, SessionVaultService, TastingNotesService } from '@app/core';
import { TastingNote } from '@app/models';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tasting-notes',
  templateUrl: 'tasting-notes.page.html',
  styleUrls: ['tasting-notes.page.scss'],
})
export class TastingNotesPage implements OnInit {
  notes: Array<TastingNote> = [];
  prefersDarkMode: boolean;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private preferences: PreferencesService,
    private sessionVault: SessionVaultService,
    private tastingNotes: TastingNotesService
  ) {}

  async ngOnInit(): Promise<void> {
    this.prefersDarkMode = this.preferences.prefersDarkMode;
    await this.tastingNotes.refresh();
    this.notes = [...this.tastingNotes.data];
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.authentication.logout());
    await this.sessionVault.clearSession();
    this.navController.navigateRoot(['/', 'login']);
  }

  sync() {
    console.log('sync');
  }

  setDarkMode() {
    this.preferences.setPrefersDarkMode(!this.prefersDarkMode);
  }

  async presentNoteEditor(note: TastingNote): Promise<void> {}
  async remove(note: TastingNote): Promise<void> {}
}
