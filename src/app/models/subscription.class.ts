import {Plan} from './plan.class';

export class Subscription {
  id: string;
  'cancel_at': number;
  'cancel_at_period_end': boolean;
  created: number;
  'current_period_start': number;
  'current_period_end': number;
  'days_until_due': number;
  plan: Plan;
  'start_date': number;
  status: string;
  productId: string;
}
