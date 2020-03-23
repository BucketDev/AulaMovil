import { Component } from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  message: string;

  constructor(private fireFunctions: AngularFireFunctions) {}

  callFunction = () => {
    const callable = this.fireFunctions.functions.httpsCallable('helloWorld');
    callable({name: 'Rodrigo Loyola'}).then((data) => {
      this.message = data.data;
    });
  }

}
