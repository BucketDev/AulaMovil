import {Component, OnInit, ViewChild} from '@angular/core';
import {PaymentService} from '../../../services/payment.service';
import {IonRadioGroup, LoadingController, ModalController, ToastController} from '@ionic/angular';
import {ModalPaymentComponent} from '../../../components/modal-payment/modal-payment.component';
import {Payment} from '../../../models/payment.class';
import {UsersService} from '../../../services/users.service';
import {AulaMovilUser} from '../../../models/aula-movil-user.class';
import {StripeService} from '../../../services/stripe.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})
export class PaymentsPage implements OnInit {

  paymentMethods: Payment[];
  loading = false;
  @ViewChild(IonRadioGroup, {static: true}) paymentsRadioGroup: IonRadioGroup;

  constructor(private paymentService: PaymentService,
              private usersService: UsersService,
              private modalController: ModalController,
              private toastController: ToastController,
              private stripeService: StripeService,
              private loadingController: LoadingController) {
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
          this.loading = true;
          const payment = new Payment(data.data);
          this.stripeService.attachPaymentToCustomer(payment).toPromise().then(async (added: boolean) => {
            if (added) {
              this.paymentMethods.unshift(payment);
              this.toastController.create({
                message: `La tarjeta ${payment.lastFour} ha sido guardada exitosamente`,
                duration: 3000
              }).then(toast => {
                toast.present();
                this.selectPaymentMethod(payment);
              });
            } else {
              this.toastController.create({
                message: `Ocurrió un error al agregar la tarjeta ${payment.lastFour}, intentalo mas tarde`,
                duration: 3000,
                color: 'danger'
              }).then(toast => toast.present());
            }
          }).catch(console.error);
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
    this.paymentsRadioGroup.value = paymentId;
    this.usersService.setDefaultPayment(paymentId).then(() => this.loading = false);
  }

}
