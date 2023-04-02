import { Injectable } from '@angular/core';
import { Session } from '@app/models';
import { PinDialogComponent } from '@app/pin-dialog/pin-dialog.component';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ModalController, Platform } from '@ionic/angular';
import { concatMap, delay, filter, Observable, of, Subject } from 'rxjs';
import { VaultFactoryService } from '../vault-factory/vault-factory.service';
import { Device as CapDevice } from '@capacitor/device';

type UnlockMode = 'Device' | 'SessionPIN' | 'NeverLock';
@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private lockedSubject: Subject<boolean>;
  private biolockedSubject: Subject<boolean>;
  private pinVault: Vault | BrowserVault;
  private bioVault: Vault | BrowserVault;
  private vaultReady: Promise<void>;
  private bioVaultReady: Promise<void>;
  private isPasscodeModalOpening = false;
  private onPasscodeRequested$: Subject<boolean>;

  constructor(
    private modalController: ModalController,
    private platform: Platform,
    private vaultFactory: VaultFactoryService
  ) {
    this.lockedSubject = new Subject();
    this.biolockedSubject = new Subject();
    this.onPasscodeRequested$ = new Subject();
    this.handleOnPasscodeRequested();
  }

  get locked$(): Observable<boolean> {
    return this.lockedSubject.asObservable();
  }

  async isNativeDeviceSecurityEnabled(): Promise<boolean> {
    await this.initializeBioVault();
    if (!this.bioVault) {
      return false;
    }
    const isVaultEmpty = await this.bioVault.isEmpty();
    console.log('isVaultEmpty', isVaultEmpty);
    const isVaultLocked = await this.bioVault.isLocked();
    console.log('isVaultLocked', isVaultLocked);

    return !isVaultEmpty || isVaultLocked;
  }

  async initializeUnlockMode(): Promise<void> {
    if (this.platform.is('hybrid')) {
      await this.initialize();
      if (await Device.isSystemPasscodeSet()) {
      }
    }
  }

  async setSession(session: Session): Promise<void> {
    await this.initialize();
    return this.pinVault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    await this.initialize();
    return this.pinVault.getValue('session');
  }

  async clearSession(): Promise<void> {
    await this.initialize();
    return this.pinVault.clear();
  }

  async sessionIsLocked(): Promise<boolean> {
    await this.initialize();
    return !(await this.pinVault.isEmpty()) && (await this.pinVault.isLocked());
  }

  async unlockSession(): Promise<void> {
    await this.initialize();
    return this.pinVault.unlock();
  }

  async setPasscodeInBioVault(passcode: string): Promise<void> {
    if (!(await this.isNativeDeviceSecurityEnabled())) {
      return;
    }
    console.log('setPasscodeInBioVault', passcode);
    return this.bioVault.setValue('passcode', passcode);
  }

  async getPasscodeFromBioVault(): Promise<string> {
    if (!(await this.isNativeDeviceSecurityEnabled())) {
      return null;
    }
    return this.bioVault.getValue('passcode');
  }

  async enableNativeDeviceSecurity(): Promise<void> {
    await this.provision();
    await this.initializeBioVault();
    await this.bioVault.updateConfig({
      ...this.bioVault.config,
      type: VaultType.DeviceSecurity,
      deviceSecurityType: DeviceSecurityType.Both,
    });
    await this.bioVault.setValue('enabled', true);
  }

  async disableNativeDeviceSecurity(): Promise<void> {
    console.log('disableNativeDeviceSecurity');
    await this.initializeBioVault();
    await this.bioVault.clear();
    await this.bioVault.unlock();
    await this.bioVault.updateConfig({
      ...this.bioVault.config,
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
    });
  }

  private initialize() {
    if (!this.vaultReady) {
      this.vaultReady = new Promise(async (resolve) => {
        await this.platform.ready();

        this.pinVault = this.vaultFactory.create({
          key: 'io.ionic.auth-playground-ng',
          type: VaultType.CustomPasscode,
          deviceSecurityType: DeviceSecurityType.None,
          lockAfterBackgrounded: 2000,
          shouldClearVaultAfterTooManyFailedAttempts: false,
          customPasscodeInvalidUnlockAttempts: 5,
          unlockVaultOnLoad: true,
        });
        console.log('this.pinVault', this.pinVault);

        this.pinVault.onLock(() => this.lockedSubject.next(true));
        this.pinVault.onUnlock(() => this.lockedSubject.next(false));
        this.pinVault.onError((error) => {
          // console.error(error)
        });

        // please be aware that this event would be triggered multiple times during biometric prompt
        // this is an Ionic Identity Vault bug
        this.pinVault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) => {
          this.onPasscodeRequested$.next(isPasscodeSetRequest);
        });
        resolve();
      });
    }

    return this.vaultReady;
  }

  private handleOnPasscodeRequested() {
    this.onPasscodeRequested$
      .pipe(
        filter(() => !this.isPasscodeModalOpening),
        // handle concurrent value by adding delay. So we wont have duplicated modal
        concatMap((value) => of(value).pipe(delay(100)))
      )
      .subscribe(async (isPasscodeSetRequest) => {
        if (!(await this.pinVault.isLocked())) {
          return;
        }
        this.onPasscodeRequest(isPasscodeSetRequest);
        if (isPasscodeSetRequest) {
          this.disableNativeDeviceSecurity();
        }
      });
  }

  private async initializeBioVault() {
    if ((await this.isSupportNativeSecurity()) && !this.bioVaultReady) {
      console.log('initializeBioVault');
      this.bioVaultReady = new Promise(async (resolve) => {
        await this.platform.ready();

        this.bioVault = this.vaultFactory.create({
          key: 'bio.io.ionic.auth-playground-ng',
          type: VaultType.SecureStorage,
          lockAfterBackgrounded: 2000,
          shouldClearVaultAfterTooManyFailedAttempts: false,
          unlockVaultOnLoad: false,
        });
        console.log('this.bioVault', this.bioVault);

        this.bioVault.onLock(() => {
          console.log('bioVault onLock');
          this.biolockedSubject.next(true);
        });
        this.bioVault.onUnlock(() => {
          console.log('bioVault onUnlock');
          this.biolockedSubject.next(false);
        });
        this.bioVault.onError((error) => console.error(error));

        resolve();
      });
    }

    return this.bioVaultReady;
  }

  private async onPasscodeRequest(isPasscodeSetRequest: boolean): Promise<void> {
    console.log('onPasscodeRequest------------');
    if (this.isPasscodeModalOpening) {
      return;
    }
    this.isPasscodeModalOpening = true;
    await this.initialize();

    const dlg = await this.modalController.create({
      backdropDismiss: false,
      component: PinDialogComponent,
      componentProps: {
        setPasscodeMode: isPasscodeSetRequest,
      },
    });
    dlg.present();
    const { data } = await dlg.onDidDismiss();
    this.isPasscodeModalOpening = false;
    this.pinVault.setCustomPasscode(data || '');
    if (data) {
      this.setPasscodeInBioVault(data);
    }
  }

  // private async setUnlockMode(unlockMode: UnlockMode): Promise<void> {
  //   let type: VaultType;
  //   let deviceSecurityType: DeviceSecurityType;

  //   switch (unlockMode) {
  //     case 'Device':
  //       await this.provision();
  //       type = VaultType.DeviceSecurity;
  //       deviceSecurityType = DeviceSecurityType.Both;
  //       break;

  //     case 'SessionPIN':
  //       type = VaultType.CustomPasscode;
  //       deviceSecurityType = DeviceSecurityType.None;
  //       break;

  //     case 'NeverLock':
  //       type = VaultType.SecureStorage;
  //       deviceSecurityType = DeviceSecurityType.None;
  //       break;

  //     default:
  //       type = VaultType.SecureStorage;
  //       deviceSecurityType = DeviceSecurityType.None;
  //   }

  //   return this.pinVault.updateConfig({
  //     ...this.pinVault.config,
  //     type,
  //     deviceSecurityType,
  //   });
  // }

  private async provision(): Promise<void> {
    console.log('provision');
    // if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    console.log('BiometricPermissionState.Prompt');
    await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Authenticate to continue' });
    // }
  }

  private async isSupportNativeSecurity(): Promise<boolean> {
    const deviceInfo = await CapDevice.getInfo();
    const osVersion = Number(deviceInfo.osVersion.split('.')[0]);
    const isAndroid = deviceInfo.platform === 'android';
    const isIos = deviceInfo.platform === 'ios';

    return this.platform.is('hybrid') && ((isAndroid && osVersion >= 11) || isIos);
  }
}
