import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {HomePageRoutingModule} from './home-routing.module';

import {HomePage} from './home.page';
import {MenuModule} from '../../components/menu/menu.module';
import {PipesModule} from '../../pipes/pipes.module';
import {GroupCardModule} from '../../components/group-card/group-card.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    MenuModule,
    PipesModule,
    GroupCardModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
