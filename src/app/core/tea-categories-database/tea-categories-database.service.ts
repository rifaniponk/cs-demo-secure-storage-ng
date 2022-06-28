/* eslint-disable @typescript-eslint/quotes */
import { Injectable } from '@angular/core';
import { TastingNote } from '@app/models';
import { DatabaseService } from '../database/database.service';
import { SessionVaultService } from '../session-vault/session-vault.service';

@Injectable({
  providedIn: 'root',
})
export class TeaCategoriesDatabaseService {
  constructor(private database: DatabaseService, private vault: SessionVaultService) {}

  async getAll(includeDeleted = false): Promise<Array<TastingNote>> {
    const notes: Array<TastingNote> = [];
    const handle = await this.database.getHandle();
    if (handle) {
      const { user } = await this.vault.getSession();
      const predicate = includeDeleted
        ? 'userId = ? ORDER BY name'
        : "coalesce(syncStatus, '') != 'DELETE' AND userId = ? ORDER BY brand, name";
      await handle.transaction((tx) =>
        tx.executeSql(
          `SELECT id, name, brand, notes, rating, teaCategoryId, syncStatus FROM TastingNotes WHERE ${predicate}`,
          [user.id],
          // tslint:disable-next-line:variable-name
          (_t: any, r: any) => {
            for (let i = 0; i < r.rows.length; i++) {
              notes.push(r.rows.item(i));
            }
          }
        )
      );
    }
    return notes;
  }

  async reset(): Promise<void> {
    const handle = await this.database.getHandle();
    if (handle) {
      const { user } = await this.vault.getSession();
      await handle.transaction((tx) => {
        tx.executeSql(
          "UPDATE TastingNotes SET syncStatus = null WHERE syncStatus = 'UPDATE' AND userId = ?",
          [user.id],
          () => {}
        );
        tx.executeSql(
          "DELETE FROM TastingNotes WHERE syncStatus in ('DELETE', 'INSERT') AND userId = ?",
          [user.id],
          () => {}
        );
      });
    }
  }

  async remove(note: TastingNote): Promise<void> {
    const handle = await this.database.getHandle();
    if (handle) {
      const { user } = await this.vault.getSession();
      await handle.transaction((tx) => {
        tx.executeSql(
          "UPDATE TastingNotes SET syncStatus = 'DELETE' WHERE userId = ? AND id = ?",
          [user.id, note.id],
          () => {}
        );
      });
    }
  }

  async trim(idsToKeep: Array<number>): Promise<void> {
    const handle = await this.database.getHandle();
    if (handle) {
      const { user } = await this.vault.getSession();
      await handle.transaction((tx) => {
        tx.executeSql(
          `DELETE FROM TastingNotes WHERE userId = ? AND id not in (${this.params(idsToKeep.length)})`,
          [user.id, ...idsToKeep],
          () => {}
        );
      });
    }
  }

  async save(note: TastingNote): Promise<TastingNote> {
    return (note.id ? await this.update(note) : await this.add(note)) || note;
  }

  async upsert(note: TastingNote): Promise<void> {
    const handle = await this.database.getHandle();
    if (handle) {
      const { user } = await this.vault.getSession();
      await handle.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO TastingNotes (id, name, brand, notes, rating, teaCategoryId, userId) VALUES (?, ?, ?, ?, ?, ?, ?)' +
            ' ON CONFLICT(id) DO' +
            ' UPDATE SET name = ?, brand = ?, notes = ?, rating = ?, teaCategoryId = ?' +
            ' WHERE syncStatus is NULL AND userId = ? AND id = ?',
          [
            note.id,
            note.name,
            note.brand,
            note.notes,
            note.rating,
            note.teaCategoryId,
            user.id,
            note.name,
            note.brand,
            note.notes,
            note.rating,
            note.teaCategoryId,
            user.id,
            note.id,
          ],
          () => {}
        );
      });
    }
  }

  async add(note: TastingNote): Promise<TastingNote | undefined> {
    const handle = await this.database.getHandle();
    if (handle) {
      const { user } = await this.vault.getSession();
      await handle.transaction((tx) => {
        tx.executeSql(
          'SELECT COALESCE(MAX(id), 0) + 1 AS newId FROM TastingNotes',
          [],
          // tslint:disable-next-line:variable-name
          (_t: any, r: any) => {
            note.id = r.rows.item(0).newId;
            tx.executeSql(
              'INSERT INTO TastingNotes (id, name, brand, notes, rating, teaCategoryId, userId, syncStatus)' +
                " VALUES (?, ?, ?, ?, ?, ?, ?, 'INSERT')",
              [note.id, note.name, note.brand, note.notes, note.rating, note.teaCategoryId, user.id],
              () => {}
            );
          }
        );
      });
      return note;
    }
  }

  async update(note: TastingNote): Promise<TastingNote | undefined> {
    const handle = await this.database.getHandle();
    if (handle) {
      const { user } = await this.vault.getSession();
      await handle.transaction((tx) => {
        tx.executeSql(
          'UPDATE TastingNotes SET name = ?, brand = ?, notes = ?, rating = ?, teaCategoryId = ?,' +
            " syncStatus = CASE syncStatus WHEN 'INSERT' THEN 'INSERT' else 'UPDATE' end" +
            ' WHERE userId = ? AND id = ?',
          [note.name, note.brand, note.notes, note.rating, note.teaCategoryId, user.id, note.id],
          () => {}
        );
      });
      return note;
    }
  }

  private params(length: number): string {
    let str = '';
    for (let i = 0; i < length; i++) {
      str += `${i ? ', ' : ''}?`;
    }
    return str;
  }
}
