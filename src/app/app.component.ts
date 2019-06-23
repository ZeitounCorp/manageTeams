import { Component } from '@angular/core';

import { Platform, NavController, AlertController, LoadingController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FIREBASE_CONFIG } from 'firebase.credentials';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

const config = {
  apiKey: FIREBASE_CONFIG.apiKey,
  authDomain: FIREBASE_CONFIG.authDomain,
  databaseURL: FIREBASE_CONFIG.databaseURL,
  projectId: FIREBASE_CONFIG.projectId,
  storageBucket: FIREBASE_CONFIG.storageBucket,
  messagingSenderId: FIREBASE_CONFIG.messagingSenderId
};

@Component({
  selector: "app-root",
  templateUrl: "app.component.html"
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public navCtrl: NavController,
    private router: Router,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController
  ) {
    firebase.initializeApp(config);
    this.initializeApp();
  }

  async checkLoginAlert() {
    const alert = await this.alertCtrl.create({
      message:
        "Oops !\nIl se peut qu'il y ait eut une erreur.\nNous n'avons pas pu vous connecter automatiquement",
      buttons: [
        {
          text: "Ok",
          role: "cancel"
        }
      ]
    });
    await alert.present();
  }

  initializeApp() {
    this.logginCheck();
    this.platform.ready().then(() => {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.loadingCtrl.dismiss();
          this.router.navigateByUrl("");
          console.log(user);
        } else {
          this.loadingCtrl.dismiss();
          this.router.navigateByUrl("login");
          this.checkLoginAlert();
        }
      });
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  async logginCheck() {
    const loading = await this.loadingCtrl.create({
      spinner: "dots",
      message:
        "Veuillez attendre que l'on vous identifie, Cela peut prendre quelques instants",
      translucent: true
    });
    return await loading.present();
  }
}
