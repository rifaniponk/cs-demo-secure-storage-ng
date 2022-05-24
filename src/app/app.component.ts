import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SessionVaultService } from './core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private navController: NavController, private sessionVault: SessionVaultService) {}

  async ngOnInit() {
    this.sessionVault.locked$.subscribe((locked) => {
      if (locked) {
        this.navController.navigateRoot(['/', 'locked']);
      }
    });
  }
}
