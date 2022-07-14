import { Component, OnInit } from '@angular/core';
import {
  AuthenticationService,
  PreferencesService,
  SessionVaultService,
  SyncService,
  TastingNotesService,
  TeaCategoriesService,
} from '@app/core';
import { TastingNote } from '@app/models';
import { TastingNoteEditorComponent } from '@app/tasting-note-editor/tasting-note-editor.component';
import { ModalController, ModalOptions, NavController } from '@ionic/angular';
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
    private modalController: ModalController,
    private preferences: PreferencesService,
    private sessionVault: SessionVaultService,
    private sync: SyncService,
    private tastingNotes: TastingNotesService,
    private teaCategories: TeaCategoriesService
  ) {}

  async ngOnInit(): Promise<void> {
    this.prefersDarkMode = this.preferences.prefersDarkMode;
    this.teaCategories.refresh();
    await this.tastingNotes.refresh();
    this.notes = [...this.tastingNotes.data];
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.authentication.logout());
    await this.sessionVault.clearSession();
    this.navController.navigateRoot(['/', 'login']);
  }

  async presentNoteEditor(note: TastingNote): Promise<void> {
    let opt: ModalOptions = {
      component: TastingNoteEditorComponent,
      backdropDismiss: false,
    };
    if (note) {
      opt = { ...opt, componentProps: { note } };
    }

    const modal = await this.modalController.create(opt);
    modal.present();
    await modal.onDidDismiss();
    this.notes = [...this.tastingNotes.data];
  }

  async remove(note: TastingNote): Promise<void> {
    await this.tastingNotes.remove(note);
    this.notes = [...this.tastingNotes.data];
  }

  async performSync(): Promise<void> {
    await this.sync.execute();
    await this.tastingNotes.refresh();
    this.notes = [...this.tastingNotes.data];
  }

  setDarkMode() {
    this.preferences.setPrefersDarkMode(!this.prefersDarkMode);
  }
}
