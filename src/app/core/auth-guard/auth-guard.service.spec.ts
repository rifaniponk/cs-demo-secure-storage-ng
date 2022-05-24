import { TestBed, inject } from '@angular/core/testing';
import { NavController, Platform } from '@ionic/angular';

import { AuthGuardService } from './auth-guard.service';
import { SessionVaultService } from '@app/core';
import { createSessionVaultServiceMock } from '@app/core/testing';
import { createNavControllerMock, createPlatformMock } from '@test/mocks';

describe('AuthGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        {
          provide: SessionVaultService,
          useFactory: createSessionVaultServiceMock,
        },
        { provide: NavController, useFactory: createNavControllerMock },
        { provide: Platform, useFactory: createPlatformMock },
      ],
    });

    // The application is meant to run only on a mobile device.
    // Some checks are disabled on web to allow development on desktop.
    const platform = TestBed.inject(Platform);
    (platform.is as jasmine.Spy).withArgs('hybrid').and.returnValue(true);
  });

  it('exists', inject([AuthGuardService], (guard: AuthGuardService) => {
    expect(guard).toBeTruthy();
  }));

  describe('canActivate', () => {
    let guard: AuthGuardService;
    let sessionVaultService: SessionVaultService;
    beforeEach(() => {
      guard = TestBed.inject(AuthGuardService);
      sessionVaultService = TestBed.inject(SessionVaultService);
    });

    describe('when the vault is locked', () => {
      beforeEach(() => {
        (sessionVaultService.getSession as jasmine.Spy).and.returnValue(
          Promise.resolve({
            user: {
              id: 123,
              email: 'test@test.com',
              firstName: 'Test',
              lastName: 'User',
            },
            token: 'some-user-token',
          })
        );
        (sessionVaultService.sessionIsLocked as jasmine.Spy).and.returnValue(Promise.resolve(true));
      });

      it('resolves to false', async () => {
        expect(await guard.canActivate()).toEqual(false);
      });

      it('navigates to locked', async () => {
        const navController = TestBed.inject(NavController);
        await guard.canActivate();
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'locked']);
      });
    });

    describe('when an unlocked session exists', () => {
      beforeEach(() => {
        (sessionVaultService.getSession as jasmine.Spy).and.returnValue(
          Promise.resolve({
            user: {
              id: 123,
              email: 'test@test.com',
              firstName: 'Test',
              lastName: 'User',
            },
            token: 'some-user-token',
          })
        );
        (sessionVaultService.sessionIsLocked as jasmine.Spy).and.returnValue(Promise.resolve(false));
      });

      it('resolves to true', async () => {
        expect(await guard.canActivate()).toEqual(true);
      });

      it('does not navigate', async () => {
        const navController = TestBed.inject(NavController);
        await guard.canActivate();
        expect(navController.navigateRoot).not.toHaveBeenCalled();
      });
    });

    describe('when the user is not authenticated', () => {
      beforeEach(() => {
        (sessionVaultService.getSession as jasmine.Spy).and.returnValue(Promise.resolve(null));
        (sessionVaultService.sessionIsLocked as jasmine.Spy).and.returnValue(Promise.resolve(false));
      });

      it('resolves to false', async () => {
        expect(await guard.canActivate()).toEqual(false);
      });

      it('navigates to login', async () => {
        const navController = TestBed.inject(NavController);
        await guard.canActivate();
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
      });
    });
  });
});
