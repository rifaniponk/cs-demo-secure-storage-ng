import { TastingNotesService } from './tasting-notes.service';

export const createTastingNotesServiceMock = () =>
  jasmine.createSpyObj<TastingNotesService>('TastingNotesService', {
    loadDatabaseFromApi: Promise.resolve(),
    refresh: Promise.resolve(),
    find: Promise.resolve(undefined),
  });
