// tslint:disable:radix
import { Client } from "./../../models/clients";
import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import * as firebase from "firebase";
import { LoadingController, AlertController } from "@ionic/angular";
import { snapshotToArray } from "src/modules/snapShottoArray";
import { checkIfClientPhoneExist } from "src/modules/checkIfClientPhoneExist";
import { checkIfClientCompanyExist } from "src/modules/checkIfClientCompanyExist";

@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.page.html',
  styleUrls: ['./create-client.page.scss']
})
export class CreateClientPage implements OnInit {
  runner = {} as Client;
  currentUser;
  uid;
  yearIndex;
  year;
  statsDb = firebase.database().ref('stats');
  userIncharge;
  isChecked = false;
  Users = [];
  fileUrl: string;
  empty = true;
  usersDB = firebase.database().ref('users');
  pricingDb = firebase.database().ref('pricings');
  clientDB = firebase.database().ref('clients');
  keyWordsDB = firebase.database().ref('keywords');
  constructor(
    private router: Router,
    public loadingCtrl: LoadingController,
    public alrtCtrl: AlertController
  ) {
    this.currentUser = firebase.auth().currentUser;
    this.uid = this.currentUser.uid;
    this.usersDB.on('value', resp => {
      this.Users = [];
      this.Users = snapshotToArray(resp);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.Users.length; i++) {
        const u = this.Users[i];
        if (u.userID === this.uid) {
          this.userIncharge = u;
          // console.log(this.userIncharge);
        }
      }
    });
  }

  async getcurrentDayIncome(currency, pricing) {
    const currentMonth = new Date().getMonth().toLocaleString();
    const currentDay = (new Date().getDate() - 1).toLocaleString();
    let currentItemValue;
    if (currency === 'NIS') {
      const statNIS = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(currentMonth)
        .child('days')
        .child(currentDay);
      await statNIS.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statNIS.update({
        incomeILS: Number(currentItemValue.incomeILS) + Number(pricing)
      });
    } else if (currency === 'EUR') {
      const statEUR = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(currentMonth)
        .child('days')
        .child(currentDay);
      await statEUR.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statEUR.update({
        incomeEUR: Number(currentItemValue.incomeEUR) + Number(pricing)
      });
    } else if (currency === 'USD') {
      const statUSD = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(currentMonth)
        .child('days')
        .child(currentDay);
      await statUSD.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statUSD.update({
        incomeUSD: Number(currentItemValue.incomeUSD) + Number(pricing)
      });
    }
  }

  async getcurrentMonthIncome(currency, pricing) {
    const currentMonth = new Date().getMonth().toLocaleString();
    let currentItemValue;
    if (currency === 'NIS') {
      const statNIS = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(currentMonth);
      await statNIS.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statNIS.update({
        incomeILS: Number(currentItemValue.incomeILS) + Number(pricing)
      });
    } else if (currency === 'EUR') {
      const statEUR = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(currentMonth);
      await statEUR.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statEUR.update({
        incomeEUR: Number(currentItemValue.incomeEUR) + Number(pricing)
      });
    } else if (currency === 'USD') {
      const statUSD = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(currentMonth);
      await statUSD.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statUSD.update({
        incomeUSD: Number(currentItemValue.incomeUSD) + Number(pricing)
      });
    }
  }

  async getcurrentYearIncome(currency, pricing) {
    let currentItemValue;
    if (currency === 'NIS') {
      const statNIS = this.statsDb.child(this.yearIndex);
      await statNIS.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statNIS.update({
        totalIncomeILS: Number(currentItemValue.totalIncomeILS) + Number(pricing)
      });
    } else if (currency === 'EUR') {
      const statEUR = this.statsDb.child(this.yearIndex);
      await statEUR.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statEUR.update({
        totalIncomeEUR: Number(currentItemValue.totalIncomeEUR) + Number(pricing)
      });
    } else if (currency === 'USD') {
      const statUSD = this.statsDb.child(this.yearIndex);
      await statUSD.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statUSD.update({
        totalIncomeUSD: Number(currentItemValue.totalIncomeUSD) + Number(pricing)
      });
    }
  }

  async setSubMontlyAll(currency, pricing, status) {
    const currentMonth = new Date().getMonth().toLocaleString();
    const remainedMonths = 11 - new Date().getMonth();
    let currentItemValue;
    if (status === 'Signé') {
      for (let i = Number(currentMonth) + 1; i < 12; i++) {
         if (currency === 'NIS') {
      const statNIS = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(i.toString());
      await statNIS.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statNIS.update({
        incomeILS: Number(currentItemValue.incomeILS) + Number(pricing)
      });
    } else if (currency === 'EUR') {
      const statEUR = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(i.toString());
      await statEUR.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statEUR.update({
        incomeEUR: Number(currentItemValue.incomeEUR) + Number(pricing)
      });
    } else if (currency === 'USD') {
      const statUSD = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(i.toString());
      await statUSD.on('value', snapshot => {
        currentItemValue = snapshot.val();
        console.log(currentItemValue);
      });
      statUSD.update({
        incomeUSD: Number(currentItemValue.incomeUSD) + Number(pricing)
      });
    }
      }
    }
  }

  ngOnInit() {
    this.getYear();
  }

  goBack() {
    this.router.navigateByUrl('/tabs/tab1');
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
        .child('profilePicturesClients/' + almostUniqueFileName + file.name)
        .put(file);
      upload.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {
          console.log('Chargement…');
        },
        error => {
          console.log('Erreur de chargement ! : ' + error);
          reject();
        },
        () => {
          resolve(upload.snapshot.ref.getDownloadURL());
          console.log('Réussite');
        }
      );
    });
  }

  async create(runner: Client) {
    const userPhoneExist: boolean = await checkIfClientPhoneExist(
      this.runner.phoneNumber
    );
    const userCompanyExist: boolean = await checkIfClientCompanyExist(
      this.runner.Company
    );
    if (!userPhoneExist && !userCompanyExist) {
      const newData = this.clientDB.push();
      newData.set({
        phoneNumber: this.runner.phoneNumber,
        phoneNumberSociety: this.runner.phoneNumberSociety,
        Fonction: this.runner.Fonction,
        createdAt: Date(),
        updatedAt: Date(),
        profilePic: this.runner.profilePicture || 'NO PIC PROVIDED YET',
        runnerID: newData.key,
        userID: this.currentUser.uid,
        currency: this.runner.currency || 'Non défini',
        signedDate: this.runner.Status === 'Signé' ? Date() : '',
        pricing: parseInt(this.runner.pricing) || 0,
        hasSigned: this.runner.Status === 'Signé' ? true : false,
        Country: this.runner.Country,
        Langue: this.runner.Langue,
        Keywords: this.runner.Keywords,
        Notes: this.runner.Notes,
        Status: this.runner.Status,
        hasAPrice: this.runner.pricing && this.runner.currency ? true : false,
        Name: this.runner.fullName,
        Company: this.runner.Company,
        Address: this.runner.Address
      });
      const keywords: [] = this.runner.Keywords.split(' ');
      keywords.forEach(keyword => {
        const keysData = this.keyWordsDB.push();
        keysData.set({
          name: keyword,
          createdAt: Date(),
          updatedAt: Date(),
          createdBy: this.uid,
          keywordID: keysData.key
        });
      });
      if (this.runner.pricing && this.runner.currency) {
        const newPrice = this.pricingDb.push();
        newPrice.set({
          price: parseInt(this.runner.pricing),
          currency: this.runner.currency,
          status: this.runner.Status,
          linkedClient: newData.key,
          createdAt: Date(),
          updatedAt: Date(),
          createdBy: this.uid,
          _id: newPrice.key
        });
        this.getcurrentDayIncome(
          this.runner.currency,
          parseInt(this.runner.pricing)
        );
        this.getcurrentMonthIncome(
          this.runner.currency,
          parseInt(this.runner.pricing)
        );
        this.getcurrentYearIncome(
          this.runner.currency,
          parseInt(this.runner.pricing)
        );
        this.setSubMontlyAll(
          this.runner.currency,
          parseInt(this.runner.pricing),
          this.runner.Status
          );
      }
      // tslint:disable-next-line:radix
      const clientAddednb = parseInt(this.userIncharge.clientAdded || 0) + 1;
      const userData = firebase
        .database()
        .ref('users/')
        .child(this.userIncharge.runnerID);
      userData.update({
        clientAdded: clientAddednb,
        updatedAt: Date()
      });
      this.close();
    } else if (userPhoneExist && !userCompanyExist) {
      this.checkLoginAlert('N° de téléphone déjà utilisé');
    } else if (!userPhoneExist && userCompanyExist) {
      this.checkLoginAlert('Compagnie déjà existante');
    } else {
      this.checkLoginAlert(
        'N° de téléphone déjà utilisé et Compagnie déjà existante'
      );
    }
  }

  getYear() {
    const yearActive = new Date().getFullYear();
    this.statsDb
      .orderByChild('currentYear')
      .equalTo(yearActive)
      .on('child_added', snapshot => {
        this.year = snapshot.val();
        console.log(this.year);
        this.yearIndex = snapshot.key;
      });
  }

  async uploadPictureCheck() {
    const loading = await this.loadingCtrl.create({
      spinner: 'dots',
      message:
        "Veuillez attendre que l'image soit chargée, Cela peut prendre quelques instants",
      translucent: true
    });
    return await loading.present();
  }

  async close() {
    const alert = await this.alrtCtrl.create({
      message: `Client créé avec succés, vous le retrouverez sur le main Board`,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.router.navigateByUrl('/tabs/tab1');
          }
        }
      ]
    });
    await alert.present();
  }

  async checkLoginAlert(reason) {
    const alert = await this.alrtCtrl.create({
      message: `Oops !\nCe client existe déjà\nraison: ${reason}`,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }
}
