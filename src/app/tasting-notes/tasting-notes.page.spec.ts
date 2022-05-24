import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AuthenticationService, SessionVaultService } from '@app/core';
import { createAuthenticationServiceMock, createSessionVaultServiceMock } from '@app/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { createNavControllerMock } from '@test/mocks';
import { click } from '@test/util';
import { of } from 'rxjs';
import { TastingNotesPage } from './tasting-notes.page';

describe('TastingNotesPage', () => {
  let component: TastingNotesPage;
  let fixture: ComponentFixture<TastingNotesPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TastingNotesPage],
      imports: [FormsModule, IonicModule.forRoot()],
      providers: [
        { provide: AuthenticationService, useFactory: createAuthenticationServiceMock },
        { provide: NavController, useFactory: createNavControllerMock },
        { provide: SessionVaultService, useFactory: createSessionVaultServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TastingNotesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('logout button', () => {
    let button: HTMLIonButtonElement;
    beforeEach(() => {
      const auth = TestBed.inject(AuthenticationService);
      (auth.logout as jasmine.Spy).and.returnValue(of(undefined));
      button = fixture.nativeElement.querySelector('[data-testid="logout-button"]');
    });

    it('performs a logout', fakeAsync(() => {
      const auth = TestBed.inject(AuthenticationService);
      click(fixture, button);
      tick();
      expect(auth.logout).toHaveBeenCalledTimes(1);
    }));

    it('clears the session vault', fakeAsync(() => {
      const vault = TestBed.inject(SessionVaultService);
      click(fixture, button);
      tick();
      expect(vault.clearSession).toHaveBeenCalledTimes(1);
    }));

    it('redirects to the login page', fakeAsync(() => {
      const nav = TestBed.inject(NavController);
      click(fixture, button);
      tick();
      expect(nav.navigateRoot).toHaveBeenCalledTimes(1);
      expect(nav.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
    }));
  });
});
