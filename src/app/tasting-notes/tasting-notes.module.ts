import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TastingNoteEditorModule } from '@app/tasting-note-editor/tasting-note-editor.module';
import { IonicModule } from '@ionic/angular';
import { TastingNotesPageRoutingModule } from './tasting-notes-routing.module';
import { TastingNotesPage } from './tasting-notes.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TastingNoteEditorModule, TastingNotesPageRoutingModule],
  declarations: [TastingNotesPage],
})
export class TastingNotesPageModule {}
