import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: "", loadChildren: "./tabs/tabs.module#TabsPageModule" },
  { path: "login", loadChildren: "./login/login.module#LoginPageModule" },
  { path: "create-my-profile", loadChildren: "./create-my-profile/create-my-profile.module#CreateMyProfilePageModule" },
  { path: 'create-client', loadChildren: './create-client/create-client.module#CreateClientPageModule' },
  { path: 'view-client-profile/:id', loadChildren: './view-client-profile/view-client-profile.module#ViewClientProfilePageModule' },
  { path: 'edit-client-info/:id', loadChildren: './edit-client-info/edit-client-info.module#EditClientInfoPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
