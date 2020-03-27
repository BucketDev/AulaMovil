import {Time} from '@angular/common';
import {Plan} from './plan.class';

export class Product {
  id: string;
  active: boolean;
  created: Time;
  description: string;
  name: string;
  metadata: [{key: string, value: string}];
  plans: Plan[];
}
