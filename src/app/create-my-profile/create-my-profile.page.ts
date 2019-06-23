import { LoadingController } from "@ionic/angular";
import { Component } from "@angular/core";
import * as firebase from "firebase";
import { Runner } from "src/models/runners";
import { Router } from '@angular/router';

@Component({
  selector: "app-create-my-profile",
  templateUrl: "./create-my-profile.page.html",
  styleUrls: ["./create-my-profile.page.scss"]
})
export class CreateMyProfilePage {
  currentUser;
  userEmail: string;
  preUsername: string;
  fileUrl: string;
  empty = true;
  runner = {} as Runner;
  usersDB = firebase.database().ref("users");
  constructor(
    private router: Router,
    public loadingCtrl: LoadingController
  ) {
    this.currentUser = firebase.auth().currentUser;
    if (this.currentUser) {
    this.userEmail = this.currentUser.email;
    this.preUsername = this.userEmail.substr(0, this.userEmail.indexOf("@"));
    }
  }

  onUploadFile(file: File) {
    this.uploadPictureCheck();
    this.uploadFile(file).then((url: string) => {
      this.fileUrl = url;
      this.empty = false;
      this.loadingCtrl.dismiss();
      this.runner.profilePicture = this.fileUrl;
    });
  }

  detectFiles(event) {
    this.onUploadFile(event.target.files[0]);
  }

  uploadFile(file: File) {
    return new Promise((resolve, reject) => {
      const almostUniqueFileName = Date.now().toString();
      const upload = firebase
        .storage()
        .ref()
        .child("profilePictures/" + almostUniqueFileName + file.name)
        .put(file);
      upload.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {
          console.log("Chargement…");
        },
        error => {
          console.log("Erreur de chargement ! : " + error);
          reject();
        },
        () => {
          resolve(upload.snapshot.ref.getDownloadURL());
          console.log("Réussite");
        }
      );
    });
  }

  create(runner: Runner) {
    const newData = this.usersDB.push();
    newData.set({
      firstName: this.runner.firstName,
      lastName: this.runner.lastName,
      identityNB: this.runner.id,
      createdAt: Date(),
      updatedAt: Date(),
      profilePic: this.runner.profilePicture || "NO PIC PROVIDED YET",
      runnerID: newData.key,
      userID: this.currentUser.uid,
      email: this.currentUser.email,
      username: this.preUsername
    });
    this.close();
  }

  async uploadPictureCheck() {
    const loading = await this.loadingCtrl.create({
      spinner: "dots",
      message:
        "Veuillez attendre que l'image soit chargée, Cela peut prendre quelques instants",
      translucent: true
    });
    return await loading.present();
  }

  close() {
    this.router.navigateByUrl('');
  }
}
