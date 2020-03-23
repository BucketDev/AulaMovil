import {firestore} from 'firebase/app';

export class Grade {
  uid?: string;
  studentUid: string;
  score: number;
  creationDate: Date | firestore.Timestamp;

  constructor(studentUid: string, score: number) {
    this.studentUid = studentUid;
    this.score = score;
    this.creationDate = new Date();
  }

}
