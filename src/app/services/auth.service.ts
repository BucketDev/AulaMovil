import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {User, auth} from 'firebase/app';
import {ReplaySubject} from 'rxjs';
import {Router} from '@angular/router';
import {StorageService} from './storage.service';
import {ModalController, Platform} from '@ionic/angular';
import {AboutComponent} from '../components/about/about.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: User;
  $userRetrieved = new ReplaySubject<boolean>(1);

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private storageService: StorageService,
              private modalController: ModalController,
              private platform: Platform) {
    afAuth.authState.subscribe(user => {
      this.user = user;
      if (user) {
        if (this.router.url.startsWith('/login')) {
          this.router.navigate(['/home']).then(() => this.$userRetrieved.next(true));
        } else {
          this.$userRetrieved.next(true);
        }
      } else {
        storageService.get('hideLandingPage')
          .then(async (hideLandingPage) => {
            router.navigateByUrl('login').then(() => {
              if (!hideLandingPage) {
                this.modalController.create({
                  component: AboutComponent
                }).then(async modal => {
                  await modal.present();
                  this.$userRetrieved.next(true);
                });
              } else {
                this.$userRetrieved.next(true);
              }
            });
          });
      }
    });
  }

  googleSignIn = async () => {
    if (this.platform.is('capacitor')) {
      // return Plugins.GoogleAuth.signIn()
      //   .then(googleUser => {
      //     const oAuthCredential = auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
      //     this.afAuth.signInWithCredential(oAuthCredential)
      //       .then((credential) => {
      //         console.log(credential.additionalUserInfo.isNewUser);
      //         if (credential.additionalUserInfo.isNewUser) {
      //           this.router.navigateByUrl('');
      //         }
      //       })
      //       .catch(console.error);
      //   })
      //   .catch(console.error);
    } else {
      const provider = new auth.GoogleAuthProvider().setCustomParameters({ prompt: 'select_account' });
      return this.afAuth.auth.signInWithPopup(provider)
        .then((credential) => {
          // console.log(credential.additionalUserInfo.isNewUser);
          // if (credential.additionalUserInfo.isNewUser) {
          //   this.router.navigateByUrl('');
          // }
        })
        .catch(console.error);
    }
  }

  emailSignUp = (email: string, password: string) => this.afAuth.auth.createUserWithEmailAndPassword(email, password);

  emailSignIn = (email: string, password: string) => this.afAuth.auth.signInWithEmailAndPassword(email, password);

  signOut = async () => {
    await this.storageService.remove('schoolYear');
    await this.storageService.remove('activeSubscriptionCheck');
    await this.afAuth.auth.signOut();
  }

}
