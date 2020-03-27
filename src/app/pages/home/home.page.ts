import {Component, ViewChild} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {SchoolYear} from '../../models/school-year.class';
import {
  ActionSheetController,
  AlertController,
  IonInput,
  LoadingController,
  ModalController,
  NavController,
  PickerController,
  ToastController
} from '@ionic/angular';
import {StorageService} from '../../services/storage.service';
import * as moment from 'moment';
import {Group} from '../../models/group.class';
import {GroupsService} from '../../services/groups.service';
import {Observable, Subscription} from 'rxjs';
import {DeactivatableComponent} from '../../interfaces/deactivable-component.interface';
import {StripeService} from '../../services/stripe.service';

const formatCheckedSubscription = 'YYYY-MM-DD';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements DeactivatableComponent {

  groups: Group[];
  filteredGroups: Group[];
  schoolYear: SchoolYear;
  hasActiveSubscription: boolean;
  groupLoading = false;
  loading = true;
  @ViewChild(IonInput, {static: true}) schoolYearSelect: IonInput;

  constructor(public authService: AuthService,
              private pickerController: PickerController,
              private alertController: AlertController,
              private toastController: ToastController,
              private storageService: StorageService,
              private groupsService: GroupsService,
              private actionSheetController: ActionSheetController,
              private navController: NavController,
              private loadingController: LoadingController,
              private modalController: ModalController,
              public stripeService: StripeService) { }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.modalController.getTop()
      .then((top: HTMLElement | undefined) => {
        if (top) {
          this.modalController.dismiss();
        }
        return top === undefined;
      });
  }

  ionViewWillEnter() {
    this.loading = true;
    this.storageService.get('activeSubscriptionCheck')
      .then((activeSubscription: {checked: string, subscriptions: Subscription[]}) => {
        if (activeSubscription === null) {
          this.stripeService.findSubscriptions().toPromise().then(this.obtainedSubscriptions);
        } else {
          if (moment().format(formatCheckedSubscription) === activeSubscription.checked) {
            this.obtainedSubscriptions(activeSubscription.subscriptions);
          }
        }
    });
  }

  obtainedSubscriptions = (subscriptions: Subscription[]) => {
    this.loading = false;
    const hasActiveSubscription = subscriptions ? subscriptions.length > 0 : false;
    this.stripeService.hasActiveSubscription = hasActiveSubscription;
    if (hasActiveSubscription) {
      this.selectSchoolYear();
      this.storageService.set('activeSubscriptionCheck', {
        checked: moment().format(formatCheckedSubscription), subscriptions
      });
    } else {
      this.storageService.set('activeSubscriptionCheck', {
        checked: moment().format(formatCheckedSubscription), subscriptions: null
      });
    }
  }

  selectSchoolYear = () => {
    this.storageService.get('schoolYear')
      .then(async (schoolYear: any) => {
        if (schoolYear) {
          this.schoolYear = schoolYear;
          this.schoolYearSelect.value = schoolYear.name;
          this.findGroups();
        } else {
          this.schoolYear = null;
          this.schoolYearSelect.value = '';
        }
      });
  }

  showAddSchoolYear = async () => {
    const options = [];
    for (let i = -2; i < 10; i++) {
      const date = moment().add(i, 'years');
      const schoolYear = new SchoolYear(date.toDate());
      options.push({
        value: schoolYear,
        text: schoolYear.name
      });
    }
    const picker = await this.pickerController.create({
      columns: [{
        name: 'schoolYear',
        options
      }],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Seleccionar',
        handler: (value) => {
          this.schoolYear = value.schoolYear.value;
          this.schoolYearSelect.value = this.schoolYear.name;
          this.storageService.set('schoolYear', this.schoolYear);
          this.findGroups();
        }
      }]
    });
    await picker.present();
  }

  findGroups = () => {
    this.groupLoading = true;
    this.groups = [];
    this.groupsService.findAllBySchoolYearUid(this.schoolYear.uid)
      .subscribe(groups => {
        this.groups = groups;
        this.filteredGroups = groups;
        this.groupLoading = false;
      });
  }

  showAddGroup = () => {
    this.alertController.create({
      header: 'Agregar Grupo',
      subHeader: 'Elige un nombre para tu grupo',
      inputs: [{
        type: 'text',
        name: 'groupName',
        placeholder: 'Nombre del grupo'
      }],
      buttons: [{
        role: 'cancel',
        text: 'Cancelar'
      }, {
        text: 'Agregar',
        handler: (value) => {
          const group: Group = new Group(value.groupName, this.schoolYear.uid);
          this.groupLoading = true;
          this.groupsService.save(group)
            .then(() => {
              this.toastController.create({
                message: `El grupo ${group.name} ha sido creado exitosamente`,
                duration: 3000
              }).then(toast => toast.present());
            });
        }
      }]
    }).then(alert => alert.present());
  }

  showEditGroup = (group: Group) => {
    this.alertController.create({
      header: 'Editar Grupo',
      subHeader: 'Elige un nombre para tu grupo',
      inputs: [{
        type: 'text',
        name: 'groupName',
        placeholder: 'Nombre del grupo',
        value: group.name
      }],
      buttons: [{
        role: 'cancel',
        text: 'Cancelar'
      }, {
        text: 'Guardar',
        handler: (value) => {
          group.name = value.groupName.toUpperCase();
          this.groupsService.update(group)
            .then(() => {
              this.toastController.create({
                message: `El grupo ${group.name} ha sido guardado exitosamente`,
                duration: 3000
              }).then(toast => toast.present());
            });
        }
      }]
    }).then(alert => alert.present());
  }

  showDeleteGroup = (group: Group) => {
    this.alertController.create({
      header: 'Eliminar Grupo',
      subHeader: group.name,
      message: 'Al eliminar el grupo se eliminaran los alumnos, asistencias y actividades registradas',
      buttons: [{
        role: 'cancel',
        text: 'Cancelar'
      }, {
        text: 'Eliminar',
        handler: () => {
          this.loadingController.create({ message: 'Eliminando...' })
            .then(async (load) => {
              await load.present();
              this.groupsService.delete(group.uid).then(async () => {
                await load.dismiss();
                this.toastController.create({
                  message: `El grupo ${group.name} fue eliminado exitosamente`,
                  duration: 3000
                }).then(toast => toast.present());
              });
            });
        }
      }]
    }).then(alert => alert.present());
  }

  showGroupAction = (group: Group) => {
    this.actionSheetController.create({
      header: `Grupo ${group.name}`,
      buttons: [{
        text: 'Alumnos',
        icon: 'person',
        handler: () => {
          this.navController.navigateForward(['/group', group.uid, 'students']);
        }
      }, {
        text: 'Asistencia',
        icon: 'checkmark-circle',
        handler: () => {
          this.navController.navigateForward(['/group', group.uid, 'assistance']);
        }
      }, {
        text: 'Actividades',
        icon: 'bookmarks',
        handler: () => {
          this.navController.navigateForward(['/group', group.uid, 'activities']);
        }
      }, {
        text: 'Reporte de Asistencias',
        icon: 'checkmark-done-circle',
        handler: () => {
          this.navController.navigateForward(['/group', group.uid, 'assistance-report']);
        }
      }, {
        text: 'Reporte de Actividades',
        icon: 'school',
        handler: () => {
          this.navController.navigateForward(['/group', group.uid, 'activities-report']);
        }
      }, {
        text: 'Cancelar',
        role: 'cancel',
        icon: 'close',
        handler: () => { }
      }]
    }).then(actionSheet => actionSheet.present());
  }

  showSubscriptionPage = () => this.navController.navigateForward(['/subscription']);

  filterGroups = (event: CustomEvent) => {
    const filterValue: string = event.detail.value.toLowerCase();
    if (filterValue.length > 0) {
      this.groups = this.filteredGroups.filter(group => filterValue.split(' ').every(filter =>
        group.name.toLowerCase().indexOf(filter) >= 0 ));
    } else {
      this.groups = [...this.filteredGroups];
    }
  }

}
