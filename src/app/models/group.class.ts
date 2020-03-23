import {firestore} from 'firebase/app';

export class Group {
  uid?: string;
  backgroundCover?: string;
  name: string;
  students: number;
  activities: number;
  schoolYear: string;
  creationDate: Date | firestore.Timestamp;

  constructor(name: string, schoolYear: string) {
    this.name = name.toUpperCase();
    this.backgroundCover = `assets/groupCovers/${Math.floor((Math.random() * 40) + 1)}.jpg`;
    this.schoolYear = schoolYear;
    this.creationDate = new Date();
    this.students = 0;
    this.activities = 0;
    this.uid = null;
  }

}
