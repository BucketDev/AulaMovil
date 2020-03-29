import { Injectable } from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {map} from 'rxjs/operators';
import {Product} from '../models/product.class';
import {AuthService} from './auth.service';
import {Payment} from '../models/payment.class';
import {Plan} from '../models/plan.class';
import {Subscription} from '../models/subscription.class';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  hasActiveSubscription: boolean;

  constructor(private afFunctions: AngularFireFunctions,
              private authService: AuthService) {
  }

  findProducts = () => this.afFunctions.httpsCallable('findStripeProducts')(null);

  findPaymentMethods = () => this.afFunctions.httpsCallable('findPaymentMethods')(null)
    .pipe(map((paymentMethods): Payment[] => paymentMethods.map((paymentMethod => new Payment(paymentMethod)))))

  attachPaymentToCustomer = (payment: Payment) =>
    this.afFunctions.httpsCallable('attachPaymentToCustomer')({payment})

  findSubscriptions = () => this.afFunctions.httpsCallable('findSubscriptions')(null);

  createSubscription = (plan: Plan) => this.afFunctions.httpsCallable('createSubscription')({plan});

  cancelSubscription = (subscription: Subscription) =>
    this.afFunctions.httpsCallable('cancelSubscription')({subscription})

  cancelSubscriptionAtPeriodEnd = (subscription: Subscription) =>
    this.afFunctions.httpsCallable('cancelSubscriptionAtPeriodEnd')({subscription})

  detachPaymentMethod = (payment: Payment) =>
    this.afFunctions.httpsCallable('detachPaymentMethod')({payment})

}
