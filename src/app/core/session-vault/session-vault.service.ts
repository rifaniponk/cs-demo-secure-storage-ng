import { Injectable } from '@angular/core';
import { Session } from '@app/models';
import { PinDialogComponent } from '@app/pin-dialog/pin-dialog.component';
import { BrowserVault, Device, DeviceSecurityType, Vault, VaultType } from '@ionic-enterprise/identity-vault';
import { ModalController, Platform } from '@ionic/angular';
import { Subject } from 'rxjs';
import { VaultFactoryService } from '../vault-factory/vault-factory.service';

type UnlockMode = 'Device' | 'SystemPIN' | 'SessionPIN' | 'NeverLock';
@Injectable({
  providedIn: 'root',
})
export class SessionVaultService {
  private lockedSubject: Subject<boolean>;
  private vault: Vault | BrowserVault;
  private vaultReady: Promise<void>;

  constructor(
    private modalController: ModalController,
    private platform: Platform,
    private vaultFactory: VaultFactoryService
  ) {
    this.lockedSubject = new Subject();
  }

  async initializeUnlockMode() {
    if (this.platform.is('hybrid')) {
      await this.initialize();
      if (await Device.isSystemPasscodeSet()) {
        if (await Device.isBiometricsEnabled()) {
          this.setUnlockMode('Device');
        } else {
          this.setUnlockMode('SystemPIN');
        }
      } else {
        this.setUnlockMode('SessionPIN');
      }
    }
  }

  async setSession(session: Session): Promise<void> {
    await this.initialize();
    await this.vault.setValue('session', session);
  }

  async getSession(): Promise<Session | null> {
    await this.initialize();
    return this.vault.getValue('session');
  }

  async clearSession(): Promise<void> {
    await this.initialize();
    await this.vault.clear();
  }

  async canUnlock(): Promise<boolean> {
    await this.initialize();
    return !(await this.vault.isEmpty()) && (await this.vault.isLocked());
  }

  private initialize() {
    if (!this.vaultReady) {
      this.vaultReady = new Promise(async (resolve) => {
        await this.platform.ready();

        this.vault = this.vaultFactory.create({
          key: 'io.ionic.auth-playground-ng',
          type: VaultType.SecureStorage,
          lockAfterBackgrounded: 2000,
          shouldClearVaultAfterTooManyFailedAttempts: true,
          customPasscodeInvalidUnlockAttempts: 2,
          unlockVaultOnLoad: false,
        });

        this.vault.onLock(() => this.lockedSubject.next(true));
        this.vault.onUnlock(() => this.lockedSubject.next(false));

        this.vault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) =>
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
    this.vault.setCustomPasscode(data || '');
  }

  private async setUnlockMode(unlockMode: UnlockMode): Promise<void> {
    let type: VaultType;
    let deviceSecurityType: DeviceSecurityType;

    switch (unlockMode) {
      case 'Device':
        // await this.provision();
        type = VaultType.DeviceSecurity;
        deviceSecurityType = DeviceSecurityType.Both;
        break;

      case 'SystemPIN':
        type = VaultType.DeviceSecurity;
        deviceSecurityType = DeviceSecurityType.SystemPasscode;
        break;

      case 'SessionPIN':
        type = VaultType.CustomPasscode;
        deviceSecurityType = DeviceSecurityType.None;
        break;

      case 'NeverLock':
        type = VaultType.SecureStorage;
        deviceSecurityType = DeviceSecurityType.None;
        break;

      default:
        type = VaultType.SecureStorage;
        deviceSecurityType = DeviceSecurityType.None;
    }

    return this.vault.updateConfig({
      ...this.vault.config,
      type,
      deviceSecurityType,
    });
  }
}
