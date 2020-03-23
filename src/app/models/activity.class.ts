import {Grade} from './grade.class';
import {ActivityStatus} from './activity-status.enum';
import {firestore} from 'firebase/app';

export class Activity {
  uid?: string;
  name?: string;
  position: number;
  grades: Grade[];
  dueDate: Date | firestore.Timestamp;
  creationDate: Date | firestore.Timestamp;
  status: ActivityStatus;

  constructor(name: string, dueDate: Date | firestore.Timestamp) {
    this.name = name;
    this.dueDate = dueDate;
    this.creationDate = new Date();
    this.grades = [];
    this.status = ActivityStatus.CREATED;
  }

}
