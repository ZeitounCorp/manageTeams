import {
  Component,
  ViewChild,
  OnInit,
  ElementRef,
  OnChanges
} from '@angular/core';
import {
  ActionSheetController,
  LoadingController,
  AlertController
} from '@ionic/angular';
import { Chart } from 'chart.js';
import * as firebase from 'firebase';
import { snapshotToArray } from 'src/modules/snapShottoArray';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnChanges {
  date = new Date();
  currency = 'ILS ₪';
  showGraph = false;

  @ViewChild('monthlyCanvas') monthlyCanvas: ElementRef;
  @ViewChild('dailyCanvas') dailyCanvas: ElementRef;
  @ViewChild('yearlyCanvas') yearlyCanvas: ElementRef;
  @ViewChild('ratioCanvas') ratioCanvas: ElementRef;

  location = window.location;
  barChart: any = null;
  Clients;
  yearIndex;
  currentDispD;
  clientDB = firebase.database().ref('clients');
  statsDb = firebase.database().ref('stats');
  totalIncomeEUR = 0;
  totalIncomeILS = 0;
  totalIncomeUSD = 0;
  totalLostUSD = 0;
  totalLostEUR = 0;
  totalLostILS = 0;
  currentDisplayMonth;
  actualYear;
  monthBg = [];
  monthOutlineBg = [];
  yearBg = [];
  yearOutlineBg = [];
  currentDisplayYear;
  currentDisplayDay = new Date().getDay() - 1;
  actualMonth = new Date().getMonth();
  startDisplay = false;
  monthsLabels = [];
  daysLabels = [];
  earningsDaysILS = [];
  earningsDaysEUR = [];
  earningsDaysUSD = [];
  hoursLabels = [];
  earningsMonthsILS = [];
  earningsMonthsUSD = [];
  earningsMonthsEUR = [];
  daylyEarningILS = 0;
  ratioClients = [];
  numberOfClients = 0;
  numberOfLost = 0;
  numberOfGone = 0;
  daylyEarningUSD = 0;
  daylyEarningEUR = 0;
  constructor(
    public actionShtCtrlr: ActionSheetController,
    public alertController: AlertController,
    public loadingCtrl: LoadingController
  ) {
    this.currency = 'ILS';
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  ngOnInit() {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    this.actualYear = null;
    this.monthBg = [];
    this.monthOutlineBg = [];
    this.yearBg = [];
    this.yearOutlineBg = [];
    this.monthsLabels = [];
    this.daysLabels = [];
    this.earningsDaysILS = [];
    this.earningsDaysEUR = [];
    this.earningsDaysUSD = [];
    this.hoursLabels = [];
    this.earningsMonthsILS = [];
    this.earningsMonthsUSD = [];
    this.earningsMonthsEUR = [];
    this.ratioClients = [];
    const dayName = new Date();
    const yearActive = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate() - 1;
    this.currentDispD = dayName.toLocaleDateString('fr-FR', options);
    this.clientDB.on('value', async snapshot => {
      this.Clients = [];
      this.Clients = await snapshotToArray(snapshot);
      this.showGraph = this.Clients.length > 0 ? true : false;
    });
    this.clientDB
      .orderByChild('Status')
      .equalTo('Signé')
      .on('value', snapshot => {
        let clients = [];
        clients = snapshotToArray(snapshot);
        this.numberOfClients = clients.length;
        this.ratioClients.push(this.numberOfClients);
      });
    this.clientDB
      .orderByChild('Status')
      .equalTo('Perdu')
      .on('value', snapshot => {
        let clients = [];
        clients = snapshotToArray(snapshot);
        this.numberOfLost = clients.length;
        this.ratioClients.push(this.numberOfLost);
      });
    this.clientDB
      .orderByChild('Status')
      .equalTo('Résilié')
      .on('value', snapshot => {
        let clients = [];
        clients = snapshotToArray(snapshot);
        this.numberOfGone = clients.length;
        this.ratioClients.push(this.numberOfGone);
      });
    this.statsDb
      .orderByChild('currentYear')
      .equalTo(yearActive)
      .on('child_added', snapshot => {
        this.actualYear = snapshot.val().year[0];
        this.currentDisplayMonth = this.actualYear.Months[currentMonth].month;
        this.currentDisplayYear = this.actualYear.tYear;
        this.actualYear.Months.forEach(mths => {
          this.monthsLabels.push(mths.month);
          this.earningsMonthsILS.push(mths.incomeILS);
          this.earningsMonthsUSD.push(mths.incomeUSD);
          this.earningsMonthsEUR.push(mths.incomeEUR);
        });
        this.actualYear.Months[this.actualMonth].days.forEach(day => {
          this.daysLabels.push(day.day);
          this.earningsDaysILS.push(day.incomeILS);
          this.earningsDaysUSD.push(day.incomeUSD);
          this.earningsDaysEUR.push(day.incomeEUR);
        });
        this.daylyEarningILS = this.actualYear.Months[this.actualMonth].days[
          currentDay
        ].incomeILS;
        this.daylyEarningEUR = this.actualYear.Months[this.actualMonth].days[
          currentDay
        ].incomeEUR;
        this.daylyEarningUSD = this.actualYear.Months[this.actualMonth].days[
          currentDay
        ].incomeUSD;
        this.totalIncomeEUR = snapshot.val().totalIncomeEUR || 0;
        this.totalIncomeILS = snapshot.val().totalIncomeILS || 0;
        this.totalIncomeUSD = snapshot.val().totalIncomeUSD || 0;
        this.totalLostEUR = snapshot.val().totalLostEUR || 0;
        this.totalLostILS = snapshot.val().totalLostILS || 0;
        this.totalLostUSD = snapshot.val().totalLostUSD || 0;
        this.drawDailyEars();
        this.drawAllMonthChart(this.currency);
        this.drawMonthChart(this.currency);
        this.drawRatioCanvas();
        console.log(this.monthsLabels);
        console.log(this.actualYear);
        // console.log(
        //   this.totalIncomeEUR,
        //   this.totalIncomeILS,
        //   this.totalIncomeUSD,
        //   this.totalLostEUR,
        //   this.totalLostILS,
        //   this.totalLostUSD
        // );
        this.yearIndex = snapshot.key;
      });
  }

  generateYearColors() {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.monthsLabels.length; i++) {
      const x = Math.floor(Math.random() * Math.floor(255));
      const y = Math.floor(Math.random() * Math.floor(255));
      const z = Math.floor(Math.random() * Math.floor(255));
      const color = `rgba(${x}, ${y}, ${z}, 0.2)`;
      const lineColor = `rgba(${x}, ${y}, ${z}, 1)`;
      this.yearBg.push(color);
      this.yearOutlineBg.push(lineColor);
    }
  }

  generateMonthColors() {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.daysLabels.length; i++) {
      const x = Math.floor(Math.random() * Math.floor(255));
      const y = Math.floor(Math.random() * Math.floor(255));
      const z = Math.floor(Math.random() * Math.floor(255));
      const color = `rgba(${x}, ${y}, ${z}, 0.2)`;
      const lineColor = `rgba(${x}, ${y}, ${z}, 1)`;
      this.monthBg.push(color);
      this.monthOutlineBg.push(lineColor);
    }
  }

  async getTimeFilter() {
    const actionSheet = await this.actionShtCtrlr.create({
      header: 'Stats pour: ',
      buttons: [
        {
          text: 'ILS',
          cssClass: 'filterTimeDay',
          icon: 'logo-euro',
          handler: () => {
            this.currency = 'ILS';
            this.barChart = null;
            this.ngOnInit();
          }
        },
        {
          text: 'USD',
          cssClass: 'filterTimeMonth',
          icon: 'logo-euro',
          handler: () => {
            const month = new Date().getMonth();
            this.currentDisplayMonth = this.actualYear.Months[month].month;
            this.currency = 'USD';
            this.barChart = null;
            this.ngOnInit();
          }
        },
        {
          text: 'EUR',
          cssClass: 'filterTimeYear',
          icon: 'logo-euro',
          handler: () => {
            this.currentDisplayYear = this.actualYear.tYear;
            this.currency = 'EUR';
            this.barChart = null;
            this.ngOnInit();
          }
        },
        {
          text: 'Annuler',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });
    await actionSheet.present();
  }

  async drawDailyEars() {
    console.log(this.daylyEarningILS);
    const dayLab = [];
    const dayEarning = [];
    await dayLab.push('ILS', 'USD', 'EUR');
    await dayEarning.push(
      this.daylyEarningILS,
      this.daylyEarningUSD,
      this.daylyEarningEUR
    );
    this.barChart = new Chart(this.dailyCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: dayLab,
        datasets: [
          {
            label: `Incomes`,
            data: dayEarning,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)'
            ],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
          }
        ]
      }
    });
  }

  async drawAllMonthChart(currency) {
    await this.generateYearColors();
    this.barChart = new Chart(this.yearlyCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.monthsLabels,
        datasets: [
          {
            label: `Incomes in ${this.currency}`,
            data:
              currency === 'ILS'
                ? this.earningsMonthsILS
                : currency === 'USD'
                ? this.earningsMonthsUSD
                : this.earningsMonthsEUR,
            backgroundColor: this.yearBg,
            borderColor: this.yearOutlineBg,
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    });
  }

  async drawMonthChart(currency) {
    await this.generateMonthColors();
    this.barChart = new Chart(this.monthlyCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.daysLabels,
        datasets: [
          {
            label: `Incomes in ${this.currency}`,
            data:
              currency === 'ILS'
                ? this.earningsDaysILS
                : currency === 'USD'
                ? this.earningsDaysUSD
                : this.earningsDaysEUR,
            backgroundColor: this.monthBg,
            borderColor: this.monthOutlineBg,
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    });
  }

  async drawRatioCanvas() {
    this.barChart = await new Chart(this.ratioCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Signé', 'Perdu', 'Résilié'],
        datasets: [
          {
            label: `Clients`,
            data: this.ratioClients,
            backgroundColor: [
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(255, 125, 86, 0.2)'
            ],
            hoverBackgroundColor: [
              '#36A2EB',
              '#FFCE56',
              'rgba(255, 125, 86, 1)'
            ]
          }
        ]
      }
    });
  }

  async showCurrencyList() {
    const alert = await this.alertController.create({
      header: 'Choix: ',
      inputs: [
        {
          name: 'ILS',
          type: 'radio',
          label: 'ILS',
          value: 'ILS ₪',
          checked: this.currency === 'ILS ₪' ? true : false
        },

        {
          name: 'USD',
          type: 'radio',
          label: 'USD',
          value: 'USD $',
          checked: this.currency === 'USD $' ? true : false
        },

        {
          name: 'EUR',
          type: 'radio',
          label: 'EUR',
          value: 'EUR €',
          checked: this.currency === 'EUR €' ? true : false
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
        {
          text: 'Ok',
          handler: data => {
            console.log(data);
            this.currency = data;
          }
        }
      ]
    });

    await alert.present();
  }
}
