import { PreferencesService } from './preferences.service';

export const createPreferencesServiceMock = () =>
  jasmine.createSpyObj<PreferencesService>('PreferencesService', {
    prefersDarkMode: Promise.resolve(false),
    setPrefersDarkMode: Promise.resolve(),
  });
