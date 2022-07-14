import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { NavController } from '@ionic/angular';
import { createNavControllerMock } from '@test/mocks';

import { AppComponent } from './app.component';
import { PreferencesService, SessionVaultService } from './core';
import { createPreferencesServiceMock, createSessionVaultServiceMock } from './core/testing';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: NavController, useFactory: createNavControllerMock },
        { provide: PreferencesService, useFactory: createPreferencesServiceMock },
        { provide: SessionVaultService, useFactory: createSessionVaultServiceMock },
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
