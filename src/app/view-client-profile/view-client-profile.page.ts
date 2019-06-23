import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { snapshotToArray } from 'src/modules/snapShottoArray';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { getDate } from 'src/modules/getDate';
import { ActionSheetController, AlertController } from '@ionic/angular';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-view-client-profile',
  templateUrl: './view-client-profile.page.html',
  styleUrls: ['./view-client-profile.page.scss']
})
export class ViewClientProfilePage implements OnInit {
  id: string;
  Users = [];
  cli;
  pricingKey;
  pdfObj = null;
  userIncharge;
  clientDB = firebase.database().ref('clients');
  usersDB = firebase.database().ref('users');
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public alrtCtrl: AlertController,
    public actionShtCtrlr: ActionSheetController
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    const statId = firebase
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
          const keywords: [] = this.cli.Keywords.split(' ');
          this.cli.eachWord = keywords;
        }
      }
    });
    this.usersDB.on('value', resp => {
      this.Users = [];
      this.Users = snapshotToArray(resp);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.Users.length; i++) {
        const u = this.Users[i];
        if (u.userID === this.cli.userID) {
          this.userIncharge = u;
        }
      }
    });
  }

  goBack() {
    this.router.navigateByUrl('/tabs/tab1');
  }

  async edit() {
    const actionSheet = await this.actionShtCtrlr.create({
      header: 'Actions: ',
      buttons: [
        {
          text: 'Éditer',
          cssClass: 'goingOn',
          icon: 'md-create',
          handler: () => {
            this.router.navigateByUrl(`/edit-client-info/${this.id}`);
          }
        },
        {
          text: 'Supprimer',
          cssClass: 'gone',
          icon: 'md-trash',
          handler: () => {
            const rmP = firebase
              .database()
              .ref('clients')
              .child(this.id);
            const rmComp = firebase
              .database()
              .ref('deletedClients')
              .push();
            rmP.remove().then(success => {
              rmComp.set({
                ...this.cli,
                reference: rmComp.key,
                deletedAt: Date()
              });
            });
            // tslint:disable-next-line:max-line-length
            if (this.cli.hasAPrice && this.cli.pricing) {
              const updtStat = firebase
                .database()
                .ref('pricings')
                .child(this.pricingKey);
              updtStat.update({
                status: 'Perdu',
                refClientDeleted: rmComp.key,
                clientDeletedAt: Date(),
                updatedAt: Date()
              });
            }
            this.router.navigateByUrl('/tabs/tab1');
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

  checkActiveUser(cli) {
    if (cli.Status === 'En Cours') {
      return 'orange';
    } else if (cli.Status === 'Signé') {
      return 'green';
    } else if (cli.Status === 'Perdu') {
      return 'red';
    } else if (cli.Status === 'Résilié') {
      return 'brown';
    }
  }

  // TODOS add pdf printing
  printPdfC() {
    const date = getDate();

    const docDefinition = {
      pageOrientation: 'landscape',
      header: (currentPage, pageCount) => {
        return [
          {
            text: date,
            alignment: 'center',
            fontSize: 18
          },
          {
            text: currentPage.toString() + ' / ' + pageCount,
            alignment: 'right'
          }
        ];
      },
      info: {
        title: this.cli.Name + ' Contract',
        author: `${this.userIncharge.firstName} ${this.userIncharge.lastName}`,
        subject: 'Contrat',
        keywords: this.cli.Keywords
      },
      content: [
        {
          columns: [
            {
              width: 'auto',
              text: `Nom du client:\r${this.cli.Name}`,
              style: 'header'
            },
            {
              width: 'auto',
              text: `Nom de la Société:\r${this.cli.Company}`,
              style: 'header'
            },
            {
              width: 'auto',
              text: `Fonction:\r${this.cli.Fonction}`,
              style: 'header'
            }
          ],
          columnGap: 104
        },
        {
          columns: [
            {
              width: 'auto',
              text: `N° perso du client:\r${this.cli.phoneNumber}`,
              style: 'header'
            },
            {
              width: 'auto',
              text: `N° de la Société:\r${this.cli.phoneNumberSociety}`,
              style: 'header'
            },
            {
              width: 'auto',
              text: `Langue:\r${this.cli.Langue}`,
              style: 'header'
            }
          ],
          // optional space between columns
          columnGap: 104
        },
        { text: 'Commercial(e) associé(e)', style: 'subheader' },
        `${this.userIncharge.firstName} ${this.userIncharge.lastName}`,
        {
          text: "Informations de l'abonnement",
          style: 'subheader'
        },
        {
          style: 'tableExample',
          table: {
            body: [
              ['Status', 'Devise', 'Prix'],
              [
                `${this.cli.Status}`,
                `${this.cli.currency}`,
                `${this.cli.pricing}`
              ]
            ]
          }
        },
        { text: 'Keywords', style: 'subheader' },
        `${this.cli.Keywords}`,
        {
          text: 'Informations supplémentaires',
          style: 'subheader'
        },
        {
          style: 'tableExample',
          table: {
            body: [
              ['Pays', 'Adresse', 'Notes'],
              [
                `${this.cli.Country}`,
                `${this.cli.Address}`,
                `${this.cli.Notes}`
              ]
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      }
    };
    this.pdfObj = pdfMake.createPdf(docDefinition).print();
  }

  async getMore() {
    const actionSheet = await this.actionShtCtrlr.create({
      header: 'Générer: ',
      buttons: [
        {
          text: 'Devis',
          cssClass: 'goingOn',
          icon: 'md-paper',
          handler: () => {
            this.asap();
          }
        },
        {
          text: 'Facture',
          cssClass: 'checked',
          icon: 'ios-card',
          handler: () => {
            this.asap();
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

  async asap() {
    const alert = await this.alrtCtrl.create({
      message: `Cette option sera bientôt disponible`,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            console.log('Thanks');
          }
        }
      ]
    });
    await alert.present();
  }
}
