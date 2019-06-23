// tslint:disable:quotemark
import { Component, OnInit } from "@angular/core";
import { User } from "src/models/user";
import * as firebase from "firebase";
import { LoadingController, AlertController } from "@ionic/angular";
import { Router } from "@angular/router";
import { checkUserIfexist } from 'src/modules/checkIfExist';

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit {
  user = {} as User;
  usersDB = firebase.database().ref("users");
  constructor(
    public loadingCtrl: LoadingController,
    private router: Router,
    public alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  login(user: User) {
    this.loginCheckLoader();
    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then(
        async authData => {
          const currentUser = firebase.auth().currentUser;
          this.redirect(currentUser);
        },
        error => {
          this.checkLoginAlert();
        }
      );
  }

  async checkLoginAlert() {
    const alert = await this.alertCtrl.create({
      message:
        "Oops !\nIl se peut qu'il y ait eut une erreur.\nContactez votre administrateur pour la connexion",
      buttons: [
        {
          text: "Ok",
          role: "cancel"
        }
      ]
    });
    await alert.present();
  }

  async redirect(currentUser) {
    const userExist: boolean = await checkUserIfexist(currentUser.uid);
    console.log(userExist);
    if (userExist) {
      this.router.navigateByUrl("");
    } else {
      this.router.navigateByUrl("/create-my-profile");
    }
  }

  async loginCheckLoader() {
    const loading = await this.loadingCtrl.create({
      spinner: "dots",
      message: "Veuillez patienter le temps de la vérification...",
      duration: 1000,
      translucent: true
    });
    return await loading.present();
  }
}
