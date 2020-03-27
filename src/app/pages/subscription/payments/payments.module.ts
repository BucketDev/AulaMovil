import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PaymentsPageRoutingModule} from './payments-routing.module';

import {PaymentsPage} from './payments.page';
import {ModalPaymentModule} from '../../../components/modal-payment/modal-payment.module';
import {SharedModule} from '../../../components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentsPageRoutingModule,
    ModalPaymentModule,
    SharedModule
  ],
  declarations: [PaymentsPage]
})
export class PaymentsPageModule {}
