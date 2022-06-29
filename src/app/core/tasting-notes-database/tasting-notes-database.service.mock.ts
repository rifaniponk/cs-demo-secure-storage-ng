import { TastingNotesDatabaseService } from './tasting-notes-database.service';

export const createTastingNotesDatabaseServiceMock = () =>
  jasmine.createSpyObj<TastingNotesDatabaseService>('TastingNotesDatabaseService', {
    getAll: Promise.resolve([]),
    save: Promise.resolve(null),
    remove: Promise.resolve(),
    reset: Promise.resolve(),
    trim: Promise.resolve(),
    upsert: Promise.resolve(),
  });
