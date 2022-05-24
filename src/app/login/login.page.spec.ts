import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AuthenticationService } from '@app/core';
import { createAuthenticationServiceMock } from '@app/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { createNavControllerMock } from '@test/mocks';
import { of } from 'rxjs';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [FormsModule, IonicModule.forRoot()],
      providers: [
        { provide: AuthenticationService, useFactory: createAuthenticationServiceMock },
        { provide: NavController, useFactory: createNavControllerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the title properly', () => {
    const title = fixture.debugElement.query(By.css('ion-title'));
    expect(title.nativeElement.textContent.trim()).toBe('Login');
  });

  describe('email input binding', () => {
    it('updates the component model when the input changes', () => {
      const input = fixture.nativeElement.querySelector('#email-input');
      setInputValue(input, 'test@test.com');
      expect(component.email).toEqual('test@test.com');
    });

    it('updates the input when the component model changes', fakeAsync(() => {
      component.email = 'testy@mctesterson.com';
      fixture.detectChanges();
      tick();
      const input = fixture.nativeElement.querySelector('#email-input');
      expect(input.value).toEqual('testy@mctesterson.com');
    }));
  });

  describe('password input binding', () => {
    it('updates the component model when the input changes', () => {
      const input = fixture.nativeElement.querySelector('#password-input');
      setInputValue(input, 'MyPas$Word');
      expect(component.password).toEqual('MyPas$Word');
    });

    it('updates the input when the component model changes', fakeAsync(() => {
      component.password = 'SomePassword';
      fixture.detectChanges();
      tick();
      const input = fixture.nativeElement.querySelector('#password-input');
      expect(input.value).toEqual('SomePassword');
    }));
  });

  describe('signin button', () => {
    let button: HTMLIonButtonElement;
    let email: HTMLIonInputElement;
    let password: HTMLIonInputElement;
    beforeEach(fakeAsync(() => {
      button = fixture.nativeElement.querySelector('ion-button');
      email = fixture.nativeElement.querySelector('#email-input');
      password = fixture.nativeElement.querySelector('#password-input');
      fixture.detectChanges();
      tick();
    }));

    it('starts disabled', () => {
      expect(button.disabled).toEqual(true);
    });

    it('is disabled with just an email address', () => {
      setInputValue(email, 'test@test.com');
      expect(button.disabled).toEqual(true);
    });

    it('is disabled with just a password', () => {
      setInputValue(password, 'ThisI$MyPassw0rd');
      expect(button.disabled).toEqual(true);
    });

    it('is enabled with both an email address and a password', () => {
      setInputValue(email, 'test@test.com');
      setInputValue(password, 'ThisI$MyPassw0rd');
      expect(button.disabled).toEqual(false);
    });

    it('is disabled when the email address is not a valid format', () => {
      setInputValue(email, 'testtest.com');
      setInputValue(password, 'ThisI$MyPassw0rd');
      expect(button.disabled).toEqual(true);
    });

    describe('on click', () => {
      let errorDiv: HTMLDivElement;
      beforeEach(fakeAsync(() => {
        errorDiv = fixture.nativeElement.querySelector('.error-message');
        setInputValue(email, 'test@test.com');
        setInputValue(password, 'ThisI$MyPassw0rd');
        tick();
      }));

      it('performs a login', () => {
        const auth = TestBed.inject(AuthenticationService);
        click(button);
        expect(auth.login).toHaveBeenCalledTimes(1);
        expect(auth.login).toHaveBeenCalledWith('test@test.com', 'ThisI$MyPassw0rd');
      });

      describe('when the login succeeds', () => {
        beforeEach(() => {
          const auth = TestBed.inject(AuthenticationService);
          (auth.login as jasmine.Spy).and.returnValue(
            of({
              token: '48499501093kf00399sg',
              user: {
                id: 42,
                firstName: 'Douglas',
                lastName: 'Adams',
                email: 'thank.you@forthefish.com',
              },
            })
          );
        });

        it('navigates to the home page when the login succeeds', fakeAsync(() => {
          const nav = TestBed.inject(NavController);
          click(button);
          tick();
          expect(nav.navigateRoot).toHaveBeenCalledTimes(1);
          expect(nav.navigateRoot).toHaveBeenCalledWith(['/', 'home']);
        }));
      });

      describe('when the login fails', () => {
        beforeEach(() => {
          const auth = TestBed.inject(AuthenticationService);
          (auth.login as jasmine.Spy).and.returnValue(of(undefined));
        });

        it('does not navigate', fakeAsync(() => {
          const nav = TestBed.inject(NavController);
          click(button);
          tick();
          expect(nav.navigateRoot).not.toHaveBeenCalled();
        }));

        it('displays a message if the login fails', fakeAsync(() => {
          click(button);
          tick();
          fixture.detectChanges();
          expect(errorDiv.textContent.trim()).toBe('Invalid email or password');
        }));
      });
    });
  });

  describe('error messages', () => {
    let errorDiv: HTMLDivElement;
    let email: HTMLIonInputElement;
    let password: HTMLIonInputElement;
    beforeEach(fakeAsync(() => {
      errorDiv = fixture.nativeElement.querySelector('.error-message');
      email = fixture.nativeElement.querySelector('#email-input');
      password = fixture.nativeElement.querySelector('#password-input');
      fixture.detectChanges();
      tick();
    }));

    it('starts with no error message', () => {
      expect(errorDiv.textContent).toEqual('');
    });

    it('displays an error message if the e-mail address is dirty and empty', () => {
      setInputValue(email, 'test@test.com');
      setInputValue(email, '');
      expect(errorDiv.textContent.trim()).toEqual('E-Mail Address is required');
    });

    it('displays an error message if the e-mail address has an invalid format', () => {
      setInputValue(email, 'testtest.com');
      expect(errorDiv.textContent.trim()).toEqual('E-Mail Address must have a valid format');
    });

    it('clears the error message when the e-mail address has a valid format', () => {
      setInputValue(email, 'test@test.com');
      expect(errorDiv.textContent.trim()).toEqual('');
    });

    it('displays an error message if the password is dirty and empty', () => {
      setInputValue(password, 'thisisapassword');
      setInputValue(password, '');
      expect(errorDiv.textContent.trim()).toEqual('Password is required');
    });
  });

  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  };

  const setInputValue = (input: HTMLIonInputElement, value: string) => {
    const event = new InputEvent('ionChange');
    input.value = value;
    input.dispatchEvent(event);
    fixture.detectChanges();
  };
});
