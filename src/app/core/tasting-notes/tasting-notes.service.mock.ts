import { TastingNotesService } from './tasting-notes.service';

export const createTastingNotesServiceMock = () => {
  const mock = jasmine.createSpyObj<TastingNotesService>(
    'TastingNotesService',
    {
      loadDatabaseFromApi: Promise.resolve(),
      refresh: Promise.resolve(),
      remove: Promise.resolve(),
      save: Promise.resolve(null),
      find: Promise.resolve(undefined),
    },
    { data: [] }
  );

  return mock;
};
