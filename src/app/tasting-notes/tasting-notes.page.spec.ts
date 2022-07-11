import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AuthenticationService, PreferencesService, SessionVaultService, TastingNotesService } from '@app/core';
import {
  createAuthenticationServiceMock,
  createPreferencesServiceMock,
  createSessionVaultServiceMock,
  createTastingNotesServiceMock,
} from '@app/core/testing';
import { TastingNote } from '@app/models';
import { IonicModule, NavController } from '@ionic/angular';
import { createNavControllerMock } from '@test/mocks';
import { click } from '@test/util';
import { of } from 'rxjs';
import { TastingNotesPage } from './tasting-notes.page';

describe('TastingNotesPage', () => {
  let component: TastingNotesPage;
  let fixture: ComponentFixture<TastingNotesPage>;
  let notes: Array<TastingNote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TastingNotesPage],
      imports: [FormsModule, IonicModule.forRoot()],
      providers: [
        { provide: AuthenticationService, useFactory: createAuthenticationServiceMock },
        { provide: NavController, useFactory: createNavControllerMock },
        { provide: PreferencesService, useFactory: createPreferencesServiceMock },
        { provide: SessionVaultService, useFactory: createSessionVaultServiceMock },
        { provide: TastingNotesService, useFactory: createTastingNotesServiceMock },
      ],
    }).compileComponents();

    initializeTestData();

    const preferences = TestBed.inject(PreferencesService);
    (preferences as any).prefersDarkMode = false;

    const tastingNotes = TestBed.inject(TastingNotesService);
    (Object.getOwnPropertyDescriptor(tastingNotes, 'data').get as jasmine.Spy).and.returnValue(notes);

    fixture = TestBed.createComponent(TastingNotesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('notes', () => {
    it('are refreshed when the page is loaded', () => {
      const tastingNotes = TestBed.inject(TastingNotesService);
      expect(tastingNotes.refresh).toHaveBeenCalledTimes(1);
    });

    it('displays the notes', () => {
      fixture.detectChanges();
      const items = fixture.debugElement.queryAll(By.css('ion-item'));
      expect(items.length).toEqual(notes.length);
      expect(items[0].nativeElement.textContent).toContain(notes[0].brand);
      expect(items[1].nativeElement.textContent).toContain(notes[1].brand);
      expect(items[2].nativeElement.textContent).toContain(notes[2].brand);
    });
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

  describe('dark mode toggle', () => {
    let toggle: HTMLIonToggleElement;
    beforeEach(() => {
      toggle = fixture.nativeElement.querySelector('[data-testid="dark-mode-toggle"]');
    });

    it('starts with the preferences defined value', () => {
      expect(component.prefersDarkMode).toBe(false);
    });

    it('toggle the preferences value on click', fakeAsync(() => {
      const preferences = TestBed.inject(PreferencesService);
      click(fixture, toggle);
      tick();
      expect(preferences.setPrefersDarkMode).toHaveBeenCalledTimes(1);
      expect(preferences.setPrefersDarkMode).toHaveBeenCalledWith(true);
    }));
  });

  const initializeTestData = () => {
    notes = [
      {
        id: 42,
        brand: 'Lipton',
        name: 'Green Tea',
        teaCategoryId: 3,
        rating: 3,
        notes: 'A basic green tea, very passable but nothing special',
      },
      {
        id: 314159,
        brand: 'Lipton',
        name: 'Yellow Label',
        teaCategoryId: 2,
        rating: 1,
        notes: 'Very acidic, even as dark teas go, OK for iced tea, horrible for any other application',
      },
      {
        id: 73,
        brand: 'Rishi',
        name: 'Puer Cake',
        teaCategoryId: 6,
        rating: 5,
        notes: 'Smooth and peaty, the king of puer teas',
      },
    ];
  };
});
