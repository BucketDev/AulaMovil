import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {AngularFireFunctionsModule} from '@angular/fire/functions';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AboutModule} from './components/about/about.module';
import {DeactivateGuard} from './guards/deactivate.guard';

@NgModule({
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, 'aula-movil'),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    AboutModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DeactivateGuard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  declarations: [AppComponent],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
