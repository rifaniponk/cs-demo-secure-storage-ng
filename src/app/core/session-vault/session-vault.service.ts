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
import { Observable, Subject } from 'rxjs';
import { VaultFactoryService } from '../vault-factory/vault-factory.service';
import { Device as CapDevice } from '@capacitor/device';

type UnlockMode = 'Device' | 'SessionPIN' | 'NeverLock';
@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private lockedSubject: Subject<boolean>;
  private pinVault: Vault | BrowserVault;
  private bioVault: Vault;
  private vaultReady: Promise<void>;

  constructor(
    private modalController: ModalController,
    private platform: Platform,
    private vaultFactory: VaultFactoryService
  ) {
    this.lockedSubject = new Subject();
  }

  get locked$(): Observable<boolean> {
    return this.lockedSubject.asObservable();
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

        this.pinVault.onLock(() => this.lockedSubject.next(true));
        this.pinVault.onUnlock(() => this.lockedSubject.next(false));
        this.pinVault.onError((error) => console.error(error));

        this.pinVault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) =>
          this.onPasscodeRequest(isPasscodeSetRequest)
        );
        resolve();
      });
    }

    return this.vaultReady;
  }

  private async onPasscodeRequest(isPasscodeSetRequest: boolean): Promise<void> {
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
    this.pinVault.setCustomPasscode(data || '');
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
    if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Authenticate to continue' });
    }
  }

  private async isSupportNativeSecurity(): Promise<boolean> {
    const deviceInfo = await CapDevice.getInfo();
    const osVersion = Number(deviceInfo.osVersion.split('.')[0]);
    const isAndroid = deviceInfo.platform === 'android';
    const isIos = deviceInfo.platform === 'ios';

    return this.platform.is('hybrid') && ((isAndroid && osVersion >= 11) || isIos);
  }
}
