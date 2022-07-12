import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TastingNoteEditorComponent } from './tasting-note-editor.component';
import { RatingModule } from '@app/rating/rating.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [TastingNoteEditorComponent],
  exports: [TastingNoteEditorComponent],
  imports: [CommonModule, FormsModule, IonicModule, RatingModule],
})
export class TastingNoteEditorModule {}
