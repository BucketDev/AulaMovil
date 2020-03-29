import {Component, OnInit, ViewChild} from '@angular/core';
import {PaymentService} from '../../../services/payment.service';
import {AlertController, IonRadioGroup, LoadingController, ModalController, ToastController} from '@ionic/angular';
import {ModalPaymentComponent} from '../../../components/modal-payment/modal-payment.component';
import {Payment} from '../../../models/payment.class';
import {UsersService} from '../../../services/users.service';
import {AulaMovilUser} from '../../../models/aula-movil-user.class';
import {StripeService} from '../../../services/stripe.service';
import {Router} from '@angular/router';
import {Subscription} from '../../../models/subscription.class';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})
export class PaymentsPage implements OnInit {

  paymentMethods: Payment[];
  loading: boolean;
  hasSubscription: boolean;
  @ViewChild(IonRadioGroup, {static: true}) paymentsRadioGroup: IonRadioGroup;

  constructor(private paymentService: PaymentService,
              private usersService: UsersService,
              private modalController: ModalController,
              private toastController: ToastController,
              private stripeService: StripeService,
              private loadingController: LoadingController,
              private alertController: AlertController,
              private router: Router) {
    if (router.getCurrentNavigation() && router.getCurrentNavigation().extras) {
      this.hasSubscription = router.getCurrentNavigation().extras.state.hasSubscription;
    }
    loadingController.create({
      message: 'Cargando tarjetas...'
    }).then(async loading => {
      await loading.present();
      this.stripeService.findPaymentMethods().subscribe(async (paymentMethods: Payment[]) => {
        this.usersService.get().toPromise().then((document: AulaMovilUser) => {
          this.paymentMethods = paymentMethods;
          this.paymentsRadioGroup.value = document.defaultPaymentId;
          loading.dismiss();
        });
      });
    });
  }

  ngOnInit() { }

  showAddPayment = async () => {
    const modal = await this.modalController.create({
      component: ModalPaymentComponent
    });
    await modal.present();
    modal.onDidDismiss()
      .then(async (data) => {
        if (data.data) {
          this.loadingController.create({
            message: 'Guardando tarjeta...'
          }).then(loading => {
            loading.present();
            const payment = new Payment(data.data);
            this.stripeService.attachPaymentToCustomer(payment).toPromise().then(async (added: boolean) => {
              await loading.dismiss();
              if (added) {
                this.paymentMethods.unshift(payment);
                this.toastController.create({
                  message: `La tarjeta ${payment.lastFour} ha sido guardada exitosamente`,
                  duration: 3000
                }).then(toast => toast.present());
              } else {
                this.toastController.create({
                  message: `Ocurrió un error al agregar la tarjeta ${payment.lastFour}, intentalo mas tarde`,
                  duration: 3000,
                  color: 'danger'
                }).then(toast => toast.present());
              }
            }).catch(console.error);
          });
        }
      });
  }

  getBrand = (brand: string) => {
    if (brand === 'visa') {
      return 'https://img.icons8.com/color/48/visa';
    } else if (brand === 'mastercard') {
      return 'https://img.icons8.com/color/48/mastercard';
    } else if (brand === 'amex') {
      return 'https://img.icons8.com/color/48/amex';
    } else  {
      return 'https://img.icons8.com/color/48/bank-card-front-side';
    }
  }

  selectPaymentMethod = async (payment: CustomEvent | Payment) => {
    this.loading = true;
    let paymentId;
    if (payment instanceof Payment) {
      paymentId = payment.id;
    } else {
      paymentId = payment.detail.value;
    }
    this.usersService.setDefaultPayment(paymentId).then(() => this.loading = false);
  }

  showDeletePaymentMethod = (payment: Payment) => {
    if (this.paymentMethods.length > 1 || !this.hasSubscription) {
      this.alertController.create({
        header: '¿Estás seguro que deseas eliminar esta tarjeta?',
        message: `Si das clic en eliminar, el método de pago con terminación ${payment.lastFour} no podrá ser utilizado nuevamente`,
        buttons: [{
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Eliminar',
          cssClass: 'aula-movil-cancel',
          handler: () => {
            this.loadingController.create({
              message: 'Eliminando tarjeta...'
            }).then(loading => {
              loading.present();
              this.stripeService.detachPaymentMethod(payment).toPromise().then((removedPaymentMethod: Payment) => {
                loading.dismiss();
                this.paymentMethods = this.paymentMethods.filter(paymentMethod => paymentMethod.id !== removedPaymentMethod.id);
                this.toastController.create({
                  message: `La tarjeta terminación ${payment.lastFour} ha sido removida exitosamente`,
                  duration: 3000
                }).then(toast => {
                  toast.present();
                  if (this.paymentsRadioGroup.value === payment.id) {
                    this.paymentsRadioGroup.value = this.paymentMethods[0].id;
                  }
                });
              });
            });
          }
        }]
      }).then(alert => alert.present());
    } else {
      this.toastController.create({
        message: 'No puedes eliminar tu único método de pago porque tienes una subscripción activa',
        duration: 3000
      }).then(toast => toast.present());
    }
  }

}
