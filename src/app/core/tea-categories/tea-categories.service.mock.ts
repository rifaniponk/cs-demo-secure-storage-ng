import { TeaCategoriesService } from './tea-categories.service';

export const createTeaCategoriesApiServiceMock = () =>
  jasmine.createSpyObj<TeaCategoriesService>('TeaCategoriesService', {
    load: Promise.resolve(),
    refresh: Promise.resolve(),
    find: Promise.resolve(undefined),
  });
