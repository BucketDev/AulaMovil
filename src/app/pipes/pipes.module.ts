import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PendingActivitiesPipe} from './pending-activities.pipe';
import {UriSanitizerPipe} from './uri-sanitizer.pipe';
import {SchoolYearPipe} from './school-year.pipe';
import { PlanIntervalPipe } from './plan-interval.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SchoolYearPipe,
    PendingActivitiesPipe,
    UriSanitizerPipe,
    PlanIntervalPipe
  ],
  exports: [
    SchoolYearPipe,
    PendingActivitiesPipe,
    UriSanitizerPipe,
    PlanIntervalPipe
  ]
})
export class PipesModule { }
