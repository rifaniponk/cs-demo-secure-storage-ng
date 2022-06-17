import { StorageService } from './storage.service';

export const createStorageServiceMock = () => jasmine.createSpyObj<StorageService>('StorageService', {});
