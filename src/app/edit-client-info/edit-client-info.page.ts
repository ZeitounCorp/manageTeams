// tslint:disable:radix
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { snapshotToArray } from 'src/modules/snapShottoArray';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-edit-client-info',
  templateUrl: './edit-client-info.page.html',
  styleUrls: ['./edit-client-info.page.scss']
})
export class EditClientInfoPage implements OnInit {
  id: string;
  pricingKey;
  Users = [];
  isChecked = false;
  yearIndex;
  passByAnotherFunc = false;
  year;
  statsDb = firebase.database().ref('stats');
  actualPricing;
  actualStatus;
  actualCurrency;
  currentUser;
  uid;
  cli;
  clientDB = firebase.database().ref('clients');
  pricingDb = firebase.database().ref('pricings');
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public alrtCtrl: AlertController
  ) {
    this.currentUser = firebase.auth().currentUser;
    this.uid = this.currentUser.uid;
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    firebase
      .database()
      .ref('pricings')
      .orderByChild('linkedClient')
      .equalTo(this.id)
      .on('child_added', snapshot => {
        this.pricingKey = snapshot.key;
      });
    this.clientDB.on('value', resp => {
      this.Users = [];
      this.Users = snapshotToArray(resp);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.Users.length; i++) {
        const u = this.Users[i];
        if (u.key === this.id) {
          this.cli = u;
          this.actualPricing = this.cli.pricing;
          this.actualStatus = this.cli.Status;
          this.actualCurrency = this.cli.currency;
          const keywords: [] = this.cli.Keywords.split(' ');
          this.cli.eachWord = keywords;
        }
      }
    });
    this.getYear();
  }

  getYear() {
    const yearActive = new Date().getFullYear();
    this.statsDb
      .orderByChild('currentYear')
      .equalTo(yearActive)
      .on('child_added', snapshot => {
        this.year = snapshot.val();
        this.yearIndex = snapshot.key;
      });
  }

  goBack() {
    this.router.navigateByUrl(`/view-client-profile/${this.id}`);
  }

  async modify(cli) {
    if (
      this.actualPricing &&
      this.actualCurrency &&
      this.isChecked &&
      this.cli.hasAPrice === false
    ) {
      const newPrice = this.pricingDb.push();
      newPrice.set({
        price: parseInt(this.actualPricing),
        currency: this.actualCurrency,
        status: this.actualStatus,
        linkedClient: this.cli.key,
        createdAt: Date(),
        updatedAt: Date(),
        createdBy: this.uid,
        _id: newPrice.key
      });
      // tslint:disable-next-line:max-line-length
    } else if (
      this.actualPricing &&
      this.actualCurrency &&
      this.cli.hasAPrice &&
      (this.actualPricing !== this.cli.pricing ||
        this.actualCurrency !== this.cli.currency)
    ) {
      const stat = firebase
        .database()
        .ref('pricings')
        .child(this.pricingKey);
      stat.update({
        price: parseInt(this.actualPricing),
        currency: this.actualCurrency,
        status: this.actualStatus,
        updatedAt: Date()
      });
      await this.getcurrentDayIncome(
        this.cli.currency,
        parseInt(this.actualPricing)
      );
      await this.getcurrentMonthIncome(
        this.cli.currency,
        parseInt(this.actualPricing)
      );
      await this.setSubMontlyAll(
        this.cli.currency,
        parseInt(this.actualPricing),
        this.actualStatus
      );
      this.passByAnotherFunc = true;
    } else if (this.actualStatus !== this.cli.Status && !this.cli.hasSigned && !this.passByAnotherFunc) {
      const stat = firebase
        .database()
        .ref('pricings')
        .child(this.pricingKey);
      stat.update({
        status: this.actualStatus,
        updatedAt: Date()
      });
      await this.statusChangedSubMontlyAll(
        this.cli.currency,
        parseInt(this.actualPricing),
        this.actualStatus
      );
    } else if (this.actualStatus === 'Perdu' || this.actualStatus === 'Résilié') {
      this.statusChangedLostSubMontlyAll(
        this.cli.currency,
        parseInt(this.actualPricing),
        this.actualStatus
      );
    }
    const edT = firebase
      .database()
      .ref('clients')
      .child(this.id);
    edT.update({
      Name: this.cli.Name,
      phoneNumber: this.cli.phoneNumber,
      phoneNumberSociety: this.cli.phoneNumberSociety,
      Fonction: this.cli.Fonction,
      updatedAt: Date(),
      Country: this.cli.Country,
      currency: this.actualCurrency || 'Non défini',
      signedDate: this.actualStatus === 'Signé' ? Date() : '',
      hasSigned: this.actualStatus === 'Signé' ? true : false,
      pricing: parseInt(this.actualPricing) || 0,
      Langue: this.cli.Langue,
      Keywords: this.cli.Keywords,
      Notes: this.cli.Notes,
      Status: this.actualStatus,
      hasAPrice: this.cli.pricing && this.cli.currency ? true : false,
      Company: this.cli.Company,
      Address: this.cli.Address
    });
    this.close();
  }
  async close() {
    const alert = await this.alrtCtrl.create({
      message: `Client modifié avec succés, vous le retrouverez sur le main Board`,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.router.navigateByUrl(`/view-client-profile/${this.id}`);
          }
        }
      ]
    });
    await alert.present();
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
        currentItemValue =
          snapshot.val().incomeILS !== 0
            ? snapshot.val().incomeILS - this.cli.pricing + Number(pricing)
            : 0 + Number(pricing);
      });
      statNIS.update({
        incomeILS: Number(currentItemValue)
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
        currentItemValue =
          snapshot.val().incomeEUR !== 0
            ? snapshot.val().incomeEUR - this.cli.pricing + Number(pricing)
            : 0 + Number(pricing);
      });
      statEUR.update({
        incomeEUR: Number(currentItemValue)
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
        currentItemValue =
          snapshot.val().incomeUSD !== 0
            ? snapshot.val().incomeUSD - this.cli.pricing + Number(pricing)
            : 0 + Number(pricing);
      });
      statUSD.update({
        incomeUSD: Number(currentItemValue)
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
        currentItemValue =
          snapshot.val().incomeILS !== 0
            ? snapshot.val().incomeILS - this.cli.pricing + Number(pricing)
            : 0 + Number(pricing);
      });
      statNIS.update({
        incomeILS: Number(currentItemValue)
      });
    } else if (currency === 'EUR') {
      const statEUR = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(currentMonth);
      await statEUR.on('value', snapshot => {
        currentItemValue =
          snapshot.val().incomeEUR !== 0
            ? snapshot.val().incomeEUR - this.cli.pricing + Number(pricing)
            : 0 + Number(pricing);
      });
      statEUR.update({
        incomeEUR: Number(currentItemValue)
      });
    } else if (currency === 'USD') {
      const statUSD = this.statsDb
        .child(this.yearIndex)
        .child('year')
        .child('0')
        .child('Months')
        .child(currentMonth);
      await statUSD.on('value', snapshot => {
        currentItemValue =
          snapshot.val().incomeUSD !== 0
            ? snapshot.val().incomeUSD - this.cli.pricing + Number(pricing)
            : 0 + Number(pricing);
      });
      statUSD.update({
        incomeUSD: Number(currentItemValue)
      });
    }
  }

  async getcurrentYearIncome(currency, pricing) {
    const currentMonth = new Date().getMonth().toLocaleString();
    const statY = this.statsDb.child(this.yearIndex);
    let currentItemValue = 0;
    const stat = this.statsDb
      .child(this.yearIndex)
      .child('year')
      .child('0')
      .child('Months');
    for (let i = Number(currentMonth); i < 12; i++) {
      if (currency === 'NIS') {
        stat.child(i.toString()).on('value', snapshot => {
          currentItemValue += snapshot.val().incomeILS;
          console.log(currentItemValue, snapshot.val().incomeILS);
        });
        statY.update({
           totalIncomeILS: Number(currentItemValue)
         });
      } else if (currency === 'EUR') {
        await stat.child(i.toString()).on('value', snapshot => {
          currentItemValue += snapshot.val().incomeEUR;
        });
        statY.update({
           totalIncomeILS: Number(currentItemValue)
         });
      } else if (currency === 'USD') {
        await stat.child(i.toString()).on('value', snapshot => {
          currentItemValue += snapshot.val().incomeUSD;
        });
        statY.update({
           totalIncomeILS: Number(currentItemValue)
         });
      }
    }
  }

  async setSubMontlyAll(currency, pricing, status) {
    const currentMonth = new Date().getMonth().toLocaleString();
    let currentItemValue = 0;
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
            currentItemValue =
              snapshot.val().incomeILS !== 0
                ? snapshot.val().incomeILS - this.cli.pricing + Number(pricing)
                : 0 + Number(pricing);
          });
          statNIS.update({
            incomeILS: Number(currentItemValue)
          });
        } else if (currency === 'EUR') {
          const statEUR = this.statsDb
            .child(this.yearIndex)
            .child('year')
            .child('0')
            .child('Months')
            .child(i.toString());
          await statEUR.on('value', snapshot => {
            currentItemValue =
              snapshot.val().incomeEUR !== 0
                ? snapshot.val().incomeEUR - this.cli.pricing + Number(pricing)
                : 0 + Number(pricing);
          });
          statEUR.update({
            incomeEUR: Number(currentItemValue)
          });
        } else if (currency === 'USD') {
          const statUSD = this.statsDb
            .child(this.yearIndex)
            .child('year')
            .child('0')
            .child('Months')
            .child(i.toString());
          await statUSD.on('value', snapshot => {
            currentItemValue =
              snapshot.val().incomeUSD !== 0
                ? snapshot.val().incomeUSD - this.cli.pricing + Number(pricing)
                : 0 + Number(pricing);
          });
          statUSD.update({
            incomeUSD: Number(currentItemValue)
          });
        }
      }
    }
    this.getcurrentYearIncome(this.cli.currency, parseInt(this.actualPricing));
  }

  async statusChangedSubMontlyAll(currency, pricing, status) {
    const currentMonth = new Date().getMonth().toLocaleString();
    let currentItemValue = 0;
    if (status === 'Signé') {
      for (let i = Number(currentMonth) + 1; i < 12; i++) {
        currentItemValue = 0;
        if (currency === 'NIS') {
          const statNIS = this.statsDb
            .child(this.yearIndex)
            .child('year')
            .child('0')
            .child('Months')
            .child(i.toString());
          await statNIS.on('value', snapshot => {
            currentItemValue =
              snapshot.val().incomeILS !== 0
                ? snapshot.val().incomeILS + Number(pricing)
                : 0 + Number(pricing);
          });
          statNIS.update({
            incomeILS: Number(currentItemValue)
          });
        } else if (currency === 'EUR') {
          const statEUR = this.statsDb
            .child(this.yearIndex)
            .child('year')
            .child('0')
            .child('Months')
            .child(i.toString());
          await statEUR.on('value', snapshot => {
            currentItemValue =
              snapshot.val().incomeEUR !== 0
                ? snapshot.val().incomeEUR + Number(pricing)
                : 0 + Number(pricing);
          });
          statEUR.update({
            incomeEUR: Number(currentItemValue)
          });
        } else if (currency === 'USD') {
          const statUSD = this.statsDb
            .child(this.yearIndex)
            .child('year')
            .child('0')
            .child('Months')
            .child(i.toString());
          await statUSD.on('value', snapshot => {
            currentItemValue =
              snapshot.val().incomeUSD !== 0
                ? snapshot.val().incomeUSD + Number(pricing)
                : 0 + Number(pricing);
          });
          statUSD.update({
            incomeUSD: Number(currentItemValue)
          });
        }
      }
      this.SetYearTotalIncome(currency);
    }
  }

  async SetYearTotalIncome(currency) {
    const currentMonth = new Date().getMonth().toLocaleString();
    const statY = this.statsDb.child(this.yearIndex);
    let currentItemValue = 0;
    const stat = this.statsDb
      .child(this.yearIndex)
      .child('year')
      .child('0')
      .child('Months');
    for (let i = Number(currentMonth); i < 12; i++) {
      if (currency === 'NIS') {
        stat.child(i.toString()).on('value', snapshot => {
          currentItemValue += snapshot.val().incomeILS;
          console.log(currentItemValue, snapshot.val().incomeILS);
        });
        statY.update({
           totalIncomeILS: Number(currentItemValue)
         });
      } else if (currency === 'EUR') {
        await stat.child(i.toString()).on('value', snapshot => {
          currentItemValue += snapshot.val().incomeEUR;
        });
        statY.update({
           totalIncomeILS: Number(currentItemValue)
         });
      } else if (currency === 'USD') {
        await stat.child(i.toString()).on('value', snapshot => {
          currentItemValue += snapshot.val().incomeUSD;
        });
        statY.update({
           totalIncomeILS: Number(currentItemValue)
         });
      }
    }
  }

  async statusChangedLostSubMontlyAll(currency, pricing, status) {
    const currentMonth = new Date().getMonth().toLocaleString();
    let currentItemValue = 0;
    let losses = 0;
    if (status === 'Perdu' || status === 'Résilié') {
      for (let i = Number(currentMonth) + 1; i < 12; i++) {
        console.log(i);
        if (currency === 'NIS') {
          console.log('a');
          const statNIS = this.statsDb
            .child(this.yearIndex)
            .child('year')
            .child('0')
            .child('Months')
            .child(i.toString());
          statNIS.on('value', snapshot => {
            currentItemValue =
              snapshot.val().incomeILS !== 0
                ? snapshot.val().incomeILS - Number(pricing)
                : 0;
            losses = 0;
            losses += snapshot.val().LostILS
              ? snapshot.val().LostILS + Number(pricing)
              : 0 + Number(pricing);
            console.log(losses, i);
          });
          statNIS.update({
            incomeILS: Number(currentItemValue),
            LostILS: Number(losses)
          });
        } else if (currency === 'EUR') {
          const statEUR = this.statsDb
            .child(this.yearIndex)
            .child('year')
            .child('0')
            .child('Months')
            .child(i.toString());
          statEUR.on('value', snapshot => {
            currentItemValue =
              snapshot.val().incomeEUR !== 0
                ? snapshot.val().incomeEUR - Number(pricing)
                : 0;
            losses = 0;
            losses += snapshot.val().LostEUR
              ? snapshot.val().LostEUR + Number(pricing)
              : 0 + Number(pricing);
          });
          statEUR.update({
            incomeEUR: Number(currentItemValue),
            LostEUR: Number(losses)
          });
        } else if (currency === 'USD') {
          const statUSD = this.statsDb
            .child(this.yearIndex)
            .child('year')
            .child('0')
            .child('Months')
            .child(i.toString());
          statUSD.on('value', snapshot => {
            currentItemValue =
              snapshot.val().incomeUSD !== 0
                ? snapshot.val().incomeUSD - Number(pricing)
                : 0;
            losses = 0;
            losses += snapshot.val().LostUSD
              ? snapshot.val().LostUSD + Number(pricing)
              : 0 + Number(pricing);
          });
          statUSD.update({
            incomeUSD: Number(currentItemValue),
            LostUSD: Number(losses)
          });
        }
      }
      this.SetYearTotalLost(currency);
    }
  }

  async SetYearTotalLost(currency) {
    const currentMonth = new Date().getMonth().toLocaleString();
    let currentItemValue = 0;
    let currentLost = 0;
    const statY = this.statsDb.child(this.yearIndex);
    const stat = this.statsDb
      .child(this.yearIndex)
      .child('year')
      .child('0')
      .child('Months');
    for (let i = Number(currentMonth) + 1; i < 12; i++) {
      if (currency === 'NIS') {
        await stat.child(i.toString()).on('value', snapshot => {
          currentItemValue += snapshot.val().incomeILS;
          snapshot.val().LostILS ? currentLost += snapshot.val().LostILS : currentLost += 0;
        });
      } else if (currency === 'EUR') {
        await stat.child(i.toString()).on('value', snapshot => {
          currentItemValue += snapshot.val().incomeEUR;
          snapshot.val().LostEUR ? currentLost += snapshot.val().LostEUR : currentLost += 0;
        });
      } else if (currency === 'USD') {
       await stat.child(i.toString()).on('value', snapshot => {
          currentItemValue += snapshot.val().incomeUSD;
          snapshot.val().LostUSD ? currentLost += snapshot.val().LostUSD : currentLost += 0;
        });
      }
    }
    statY.update({
      totalIncomeILS: Number(currentItemValue),
      totalLostILS: Number(currentLost)
    });
  }
}
