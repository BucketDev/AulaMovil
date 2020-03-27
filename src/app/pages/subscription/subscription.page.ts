import {Component, OnInit} from '@angular/core';
import {AlertController, LoadingController, NavController, ToastController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from '../../models/subscription.class';
import {AulaMovilUser} from '../../models/aula-movil-user.class';
import {UsersService} from '../../services/users.service';
import {StripeService} from '../../services/stripe.service';
import {Product} from '../../models/product.class';
import * as moment from 'moment';
import {Plan} from '../../models/plan.class';
import {formatCurrency, registerLocaleData} from '@angular/common';
import localeMx from '@angular/common/locales/es-MX';
registerLocaleData(localeMx, 'mx');

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.page.html',
  styleUrls: ['./subscription.page.scss'],
})
export class SubscriptionPage implements OnInit {

  subscriptions: Subscription[];
  products: Product[];

  constructor(private navController: NavController,
              private activatedRoute: ActivatedRoute,
              private toastController: ToastController,
              private usersService: UsersService,
              private stripeService: StripeService,
              private loadingController: LoadingController,
              private alertController: AlertController) {
  }

  ngOnInit() {
    this.loadingController.create({
      message: 'Cargando membresías...'
    }).then(async loading => {
      await loading.present();
      this.stripeService.findProducts().toPromise().then((products: Product[]) => {
        this.stripeService.findSubscriptions().toPromise().then((subscriptions: Subscription[]) => {
          this.subscriptions = subscriptions;
          this.products = products;
          loading.dismiss();
        });
      });
    });
  }

  showPaymentsPage = () => this.navController.navigateForward(['payments'], { relativeTo: this.activatedRoute });

  createSubscription = async (plan: Plan, product: Product) => {
    this.loadingController.create({
      message: 'Validando método de pago existente'
    }).then(loading => {
      loading.present();
      this.usersService.get().toPromise().then((document: AulaMovilUser) => {
        loading.dismiss();
        if (document.defaultPaymentId === undefined) {
          this.toastController.create({
            message: 'Selecciona un método de pago',
            duration: 3000
          }).then(toast => {
            toast.present();
          });
        } else {
          this.alertController.create({
            header: '¿Quieres realizar una compra?',
            message: `Al dar clic en <strong>Comprar</strong>, estas confirmando que quieres comprar <strong>${product.name}</strong> ` +
              `por la cantidad de ${formatCurrency(plan.amount / 100, 'mx', plan.currency.toUpperCase())}`,
            buttons: [{
              text: 'Cancelar',
              role: 'cancel'
            }, {
              text: 'Comprar',
              handler: () => {
                this.loadingController.create({
                  message: 'Generando subscripción...'
                }).then(loadingSub => {
                  loadingSub.present();
                  this.stripeService.createSubscription(plan).toPromise()
                    .then((subscription) => {
                      this.toastController.create({
                        message: `La subscripción a <strong>${product.name}</strong> ha sido generada exitosamente`,
                        color: 'success',
                        duration: 3000
                      }).then(toast => {
                        toast.present();
                        this.ngOnInit();
                      });
                    })
                    .catch((error) => {
                      console.log(error);
                      this.toastController.create({
                        message: 'Ocurrió un error al crear la subscripción, inténtalo mas tarde',
                        duration: 3000,
                        color: 'danger'
                      }).then(toast => {
                        toast.present();
                      });
                    }).finally(() => loadingSub.dismiss());
                });
              }
            }]
          }).then(alert => alert.present());
        }
      });
    });
  }

  getValidity = (product: Product) => {
    const subscription = this.subscriptions.find(storedSubscription => storedSubscription.productId === product.id);
    if (subscription !== undefined) {
      switch (subscription.status) {
        case 'incomplete':
        case 'past_due':
          return 'El pago de tu subscripción no fue efectuado';
        case 'active':
          return `del ${moment.unix(subscription.current_period_start).locale('es').format('DD MMM YYYY')} ` +
            `al ${moment.unix(subscription.current_period_end).locale('es').format('DD MMM YYYY')}`;
      }
    }
    return 'Obten tu subscripción';
  }

  getCanceledLabel = (product: Product) => {
    const subscription = this.subscriptions.find(storedSubscription => storedSubscription.productId === product.id);
    if (subscription !== undefined) {
      if (subscription.cancel_at_period_end) {
        return 'Cancelada al terminar el periodo';
      }
    }
    return '';
  }

  getColor = (product: Product) => {
    const subscription = this.subscriptions.find(storedSubscription => storedSubscription.productId === product.id);
    if (subscription !== undefined) {
      switch (subscription.status) {
        case 'incomplete':
        case 'past_due':
          return 'warning';
        case 'active':
          return 'success';
      }
    }
    return 'medium';
  }

  getIcon = (product: Product) => {
    const subscription = this.subscriptions.find(storedSubscription => storedSubscription.productId === product.id);
    if (subscription !== undefined) {
      switch (subscription.status) {
        case 'incomplete':
        case 'past_due':
          return 'alert-circle';
        case 'active':
          return 'checkmark-circle';
      }
    }
    return 'star';
  }

  alreadyHasSubscription = (product: Product) =>
    !!this.subscriptions.find(subscription => subscription.productId === product.id)

  showCancelSubscription = (product: Product) => {
    const subscription = this.subscriptions.find(storedSubscription => storedSubscription.productId === product.id);
    this.alertController.create({
      header: '¿Quieres cancelar la subscripción?',
      message: `Podrás disfrutar aún de <strong>${product.name}</strong> hasta el final del periodo, ` +
        `al finalizar no se cobrará otro periodo`,
      inputs: [{
        type: 'radio',
        name: 'cancel',
        value: false,
        checked: true,
        label: 'Al final del periodo'
      }, {
        type: 'radio',
        name: 'cancel',
        value: true,
        label: 'Inmediatamente'
      }],
      buttons: [{
        text: 'Cancelar Subscripción',
        cssClass: 'aula-movil-cancel',
        handler: (immediately: boolean) => {
          this.loadingController.create({
            message: 'Cancelando subscripción...'
          }).then(loading => {
            loading.present();
            if (immediately) {
              this.stripeService.cancelSubscription(subscription).toPromise().then((canceledSubscription: Subscription) => {
                loading.dismiss();
                this.subscriptionCanceled(canceledSubscription, product);
              });
            } else {
              this.stripeService.cancelSubscriptionAtPeriodEnd(subscription).toPromise().then((canceledSubscription: Subscription) => {
                loading.dismiss();
                this.subscriptionCanceled(canceledSubscription, product);
              });
            }
          });
        }
      }, {
        text: 'No cancelar',
        role: 'cancel'
      }]
    }).then(alert => alert.present());
  }

  subscriptionCanceled = (subscription: Subscription, product: Product) => {
    this.toastController.create({
      message: `La subscripción a <strong>${product.name}</strong> ha sido cancelada`,
      duration: 3000
    }).then(toast => {
      toast.present();
      this.ngOnInit();
    });
  }

}
