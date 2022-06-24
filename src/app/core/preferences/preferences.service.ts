import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private keys = {
    prefersDarkMode: 'prefersDarkMode',
  };

  constructor(private storage: StorageService) {}

  async prefersDarkMode(): Promise<boolean> {
    return !!(await this.storage.get(this.keys.prefersDarkMode));
  }

  async setPrefersDarkMode(value: boolean): Promise<void> {
    await this.storage.set(this.keys.prefersDarkMode, value);
  }
}
