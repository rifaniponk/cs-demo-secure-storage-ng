import { TastingNotesService } from './tasting-notes.service';

export const createTastingNotesApiServiceMock = () =>
  jasmine.createSpyObj<TastingNotesService>('TastingNotesService', {
    load: Promise.resolve(),
    refresh: Promise.resolve(),
    find: Promise.resolve(undefined),
  });
