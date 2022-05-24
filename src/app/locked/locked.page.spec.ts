import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SessionVaultService } from '@app/core';
import { createSessionVaultServiceMock } from '@app/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { createNavControllerMock } from '@test/mocks';
import { click } from '@test/util';

import { LockedPage } from './locked.page';

describe('LockedPage', () => {
  let component: LockedPage;
  let fixture: ComponentFixture<LockedPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LockedPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useFactory: createNavControllerMock },
        { provide: SessionVaultService, useFactory: createSessionVaultServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LockedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('unlock', () => {
    let button: HTMLElement;
    beforeEach(() => {
      button = fixture.nativeElement.querySelector('[data-testid="unlock"]');
    });

    it('should be present', () => {
      expect(button).toBeTruthy();
    });

    describe('on click', () => {
      it('unlocks the session vault', fakeAsync(() => {
        const sessionVault = TestBed.inject(SessionVaultService);
        click(fixture, button);
        tick();
        expect(sessionVault.unlockSession).toHaveBeenCalledTimes(1);
      }));

      describe('on successful unlock', () => {
        it('navigates to the main route', fakeAsync(() => {
          const navController = TestBed.inject(NavController);
          click(fixture, button);
          tick();
          expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'tasting-notes']);
        }));
      });

      describe('unlock failure', () => {
        beforeEach(() => {
          const sessionVault = TestBed.inject(SessionVaultService);
          (sessionVault.unlockSession as jasmine.Spy).and.throwError('Unlock failed');
        });

        it('does not navigate', fakeAsync(() => {
          const navController = TestBed.inject(NavController);
          click(fixture, button);
          tick();
          expect(navController.navigateRoot).not.toHaveBeenCalled();
        }));

        it('displays a message', fakeAsync(() => {
          const errorMsg = fixture.debugElement.query(By.css('.error-message'));
          click(fixture, button);
          tick();
          expect(errorMsg.nativeElement.textContent).toContain('Could not unlock session');
        }));
      });
    });
  });

  describe('login again', () => {
    let button: HTMLIonButtonElement;
    beforeEach(() => {
      button = fixture.nativeElement.querySelector('[data-testid="login-again"]');
    });

    it('should be present', () => {
      expect(button).toBeTruthy();
    });
  });
});
