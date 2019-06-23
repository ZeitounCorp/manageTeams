import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreateMyProfilePage } from './create-my-profile.page';

const routes: Routes = [
  {
    path: '',
    component: CreateMyProfilePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    CreateMyProfilePage
  ],
  entryComponents: [CreateMyProfilePage],
  declarations: [CreateMyProfilePage]
})
export class CreateMyProfilePageModule {}
