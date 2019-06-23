import { Router } from "@angular/router";
import { Component } from "@angular/core";
import * as firebase from "firebase";
import { snapshotToArray } from "src/modules/snapShottoArray";
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"]
})
export class Tab1Page {
  clientDB = firebase.database().ref("clients");
  Types = "Par Compagnie";
  filterActivated = false;
  Clients;
  constructor(
    private router: Router,
    public actionShtCtrlr: ActionSheetController
  ) {
    this.Types = "Par Compagnie";
    this.clientDB.on("value", resp => {
      this.Clients = [];
      this.Clients = snapshotToArray(resp);
      this.Clients.forEach(cli => {
        const keywords: [] = cli.Keywords.split(" ");
        cli.eachWord = keywords;
      });
    });
  }
  createClient() {
    this.router.navigateByUrl("/create-client");
  }

  see(cli) {
    this.router.navigateByUrl(`/view-client-profile/${cli.runnerID}`);
  }

  segmentChanged(ev: any) {
    this.Types = ev.detail.value;
  }

  getClientByComp(ev) {
    this.initializeClients();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() !== "") {
      this.Clients = this.Clients.filter(cli => {
        return cli.Company.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    }
  }
  getClientByHash(ev) {
    this.initializeClients();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() !== "") {
      this.Clients = this.Clients.filter(cli => {
        return cli.Keywords.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    }
  }

  initializeClients() {
    this.clientDB.on("value", resp => {
      this.Clients = [];
      this.Clients = snapshotToArray(resp);
      this.Clients.forEach(cli => {
        const keywords: [] = cli.Keywords.split(" ");
        cli.eachWord = keywords;
      });
    });
  }

  async filterSheet() {
    const actionSheet = await this.actionShtCtrlr.create({
      header: "Filtrer: ",
      buttons: [
        {
          text: "En Cours",
          cssClass: "goingOn",
          icon: "md-arrow-dropright-circle",
          handler: () => {
            this.initializeClients();
            this.Clients = this.Clients.filter(
              cli => cli.Status === "En Cours"
            );
            this.filterActivated = true;
          }
        },
        {
          text: "Signé",
          cssClass: "checked",
          icon: "md-thumbs-up",
          handler: () => {
            this.initializeClients();
            this.Clients = this.Clients.filter(cli => cli.Status === "Signé");
            this.filterActivated = true;
          }
        },
        {
          text: "Perdu",
          cssClass: "gone",
          icon: "md-thumbs-down",
          handler: () => {
            this.initializeClients();
            this.Clients = this.Clients.filter(cli => cli.Status === "Perdu");
            this.filterActivated = true;
          }
        },
         {
          text: "Résilié",
          cssClass: "letitgo",
          icon: "logo-snapchat",
          handler: () => {
            this.initializeClients();
            this.Clients = this.Clients.filter(cli => cli.Status === "Résilié");
            this.filterActivated = true;
          }
        },
        {
        text: 'Annuler',
        role: 'cancel',
        icon: 'close',
        }
      ]
    });
    await actionSheet.present();
  }

  reload() {
    this.initializeClients();
    this.filterActivated = false;
  }
}
