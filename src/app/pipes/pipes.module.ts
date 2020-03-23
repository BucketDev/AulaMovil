import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PendingActivitiesPipe} from './pending-activities.pipe';
import {UriSanitizerPipe} from './uri-sanitizer.pipe';
import {SchoolYearPipe} from './school-year.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SchoolYearPipe,
    PendingActivitiesPipe,
    UriSanitizerPipe
  ],
  exports: [
    SchoolYearPipe,
    PendingActivitiesPipe,
    UriSanitizerPipe
  ]
})
export class PipesModule { }
