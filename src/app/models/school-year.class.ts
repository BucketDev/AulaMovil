import * as moment from 'moment';
import {firestore} from 'firebase/app';

export class SchoolYear {
  uid?: string;
  name: string;
  creationDate: Date | firestore.Timestamp;

  constructor(start: Date) {
    const startYear = moment(start).format('YYYY');
    const endYear = moment(start).add(1, 'years').format('YYYY');
    this.uid = `${startYear}${endYear}`;
    this.name = `${startYear}-${endYear}`;
    this.creationDate = new Date();
  }

}
