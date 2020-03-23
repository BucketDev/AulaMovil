import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {AuthService} from './services/auth.service';
import {FileSharer} from '@byteowls/capacitor-filesharer';
import {registerWebPlugin} from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  loading = true;

  constructor(private platform: Platform,
              private splashScreen: SplashScreen,
              private statusBar: StatusBar,
              private authService: AuthService) {
    this.authService.$userRetrieved.subscribe(() => this.loading = false);
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      registerWebPlugin(FileSharer);
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
