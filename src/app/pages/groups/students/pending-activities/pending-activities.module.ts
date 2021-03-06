import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PendingActivitiesPageRoutingModule} from './pending-activities-routing.module';

import {PendingActivitiesPage} from './pending-activities.page';
import {SharedModule} from '../../../../components/shared/shared.module';
import {PipesModule} from '../../../../pipes/pipes.module';
import {BreadcrumbsModule} from '../../../../components/breadcrumbs/breadcrumbs.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PendingActivitiesPageRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    PipesModule,
    BreadcrumbsModule
  ],
  declarations: [PendingActivitiesPage]
})
export class PendingActivitiesPageModule {}
