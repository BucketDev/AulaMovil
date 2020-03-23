import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule) },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule) },
  { path: 'group', loadChildren: () => import('./pages/groups/group.module').then(m => m.GroupModule) },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule) },
  { path: 'subscription', loadChildren: () => import('./pages/subscription/subscription.module').then(m => m.SubscriptionModule) },
  { path: 'help', loadChildren: () => import('./pages/help/help.module').then( m => m.HelpPageModule) },
  { path: 'transfer', loadChildren: () => import('./pages/transfer/transfer.module').then( m => m.TransferPageModule) },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
