import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AssistanceReportRoutingModule} from './assistance-report-routing.module';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../../components/shared/shared.module';
import {StudentSelectionPage} from './student-selection/student-selection.page';
import {AssistanceCardPage} from './assistance-card/assistance-card.page';
import {BreadcrumbsModule} from '../../../components/breadcrumbs/breadcrumbs.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AssistanceReportRoutingModule,
    SharedModule,
    FormsModule,
    BreadcrumbsModule
  ],
  declarations: [
    StudentSelectionPage,
    AssistanceCardPage
  ]
})
export class AssistanceReportModule { }
