import { snapshotToArray } from './../../modules/snapShottoArray';
import { CreateMyProfilePage } from "./../create-my-profile/create-my-profile.page";
import { Component } from "@angular/core";
import { LoadingController, AlertController } from "@ionic/angular";
import { Router } from "@angular/router";
import * as firebase from "firebase";

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  usersDB = firebase.database().ref('users');
  Types = 'Profil';
  myClients = [];
  currentUser = firebase.auth().currentUser;
  userIncharge;
  uid = this.currentUser.uid;
  Users = [];
  nbOfClients = 0;
  userExist: boolean;
  constructor(
    public loadingCtrl: LoadingController,
    private router: Router,
    public alertCtrl: AlertController
  ) {
    this.nbOfClients = 0;
    firebase
      .database()
      .ref('users')
      .on('value', resp => {
        this.Users = [];
        this.Users = snapshotToArray(resp);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.Users.length; i++) {
          const u = this.Users[i];
          if (u.userID === this.uid) {
            this.userIncharge = u;
          }
        }
      });
    firebase
      .database()
      .ref('clients')
      .orderByChild('userID')
      .equalTo(this.uid)
      .on('value', resp => {
        this.myClients = [];
        this.myClients = snapshotToArray(resp);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.myClients.length; i++) {
          this.nbOfClients++;
        }
      });
    this.Types = 'Profil';
  }

  signOut() {
    firebase.auth().signOut();
    this.router.navigateByUrl('/login');
  }

  segmentChanged(ev: any) {
    this.Types = ev.detail.value;
  }

  see(cli) {
    this.router.navigateByUrl(`/view-client-profile/${cli.runnerID}`);
  }
}
