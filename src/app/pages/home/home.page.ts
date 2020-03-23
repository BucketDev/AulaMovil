import { Component } from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  message: string;

  constructor(private fireFunctions: AngularFireFunctions,
              private authService: AuthService) {}

  callFunction = () => {
    const callable = this.fireFunctions.functions.httpsCallable('helloWorld');
    callable({name: 'Rodrigo Loyola'}).then((data) => {
      this.message = data.data;
    });
  }

  signOut = () => this.authService.signOut();

}
