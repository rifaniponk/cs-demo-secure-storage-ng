import { TastingNotesService } from './tasting-notes.service';

export const createTastingNotesServiceMock = () => {
  const mock = jasmine.createSpyObj<TastingNotesService>(
    'TastingNotesService',
    {
      loadDatabaseFromApi: Promise.resolve(),
      refresh: Promise.resolve(),
      find: Promise.resolve(undefined),
    },
    { data: [] }
  );

  return mock;
};
