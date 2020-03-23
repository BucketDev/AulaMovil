import {Student} from './student.class';
import * as moment from 'moment';
import {firestore} from 'firebase/app';

export class Assistance {
  uid?: string;
  students: Student[];
  date: Date | firestore.Timestamp;
  creationDate: Date | firestore.Timestamp;

  constructor(date: Date) {
    this.uid = moment(date).format('YYYYMMDD');
    this.date = date;
    this.creationDate = new Date();
    this.students = [];
  }

}
