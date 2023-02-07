import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SyncService } from '@app/core';
import { createSyncServiceMock } from '@app/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { createNavControllerMock } from '@test/mocks';
import { LoginCardComponent } from './login-card/login-card.component';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginPage, LoginCardComponent],
      imports: [FormsModule, HttpClientTestingModule, IonicModule.forRoot()],
      providers: [
        { provide: NavController, useFactory: createNavControllerMock },
        { provide: SyncService, useFactory: createSyncServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the login card', () => {
    const card = fixture.debugElement.query(By.css('[data-testid="login-card"]'));
    expect(card).toBeTruthy();
  });

  describe('on successful login', () => {
    it('performs a sync', fakeAsync(() => {
      const sync = TestBed.inject(SyncService);
      const card = fixture.debugElement.query(By.css('[data-testid="login-card"]'));
      card.triggerEventHandler('loginSuccess');
      tick();
      expect(sync.execute).toHaveBeenCalledTimes(1);
    }));

    it('navigates to the main page', fakeAsync(() => {
      const nav = TestBed.inject(NavController);
      const card = fixture.debugElement.query(By.css('[data-testid="login-card"]'));
      card.triggerEventHandler('loginSuccess');
      tick();
      expect(nav.navigateRoot).toHaveBeenCalledTimes(1);
      expect(nav.navigateRoot).toHaveBeenCalledWith(['/', 'tasting-notes']);
    }));
  });
});
