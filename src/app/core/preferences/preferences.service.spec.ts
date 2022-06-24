import { TestBed } from '@angular/core/testing';
import { StorageService } from '../storage/storage.service';
import { createStorageServiceMock } from '../testing';
import { PreferencesService } from './preferences.service';

describe('PreferencesService', () => {
  let service: PreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useFactory: createStorageServiceMock }],
    });
    service = TestBed.inject(PreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('prefers dark mode', () => {
    it('returns the currently stored value if there is one', async () => {
      const storage = TestBed.inject(StorageService);
      (storage.get as jasmine.Spy).and.returnValue(Promise.resolve(false));
      expect(await service.prefersDarkMode()).toEqual(false);
      (storage.get as jasmine.Spy).and.returnValue(Promise.resolve(true));
      expect(await service.prefersDarkMode()).toEqual(true);
    });

    it('defaults to false', async () => {
      expect(await service.prefersDarkMode()).toEqual(false);
    });

    it('is stored by the KV storage service', async () => {
      const storage = TestBed.inject(StorageService);
      await service.setPrefersDarkMode(true);
      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith('prefersDarkMode', true);
    });
  });
});
