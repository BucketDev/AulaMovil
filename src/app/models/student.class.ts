import {firestore} from 'firebase/app';

export class Student {
  uid?: string;
  name: string;
  displayName: string;
  lastName: string;
  displayLastName: string;
  listNumber?: number;
  creationDate: Date | firestore.Timestamp;

  constructor(name: string, lastName: string) {
    this.displayName = name.trim().toLowerCase().split(' ')
      .map(subName => subName.charAt(0).toUpperCase() + subName.substring(1)).join(' ');
    this.name = name.trim().toLowerCase()
      .replace(/[áÁ]/g, 'a')
      .replace(/[éÉ]/g, 'e')
      .replace(/[íÍ]/g, 'i')
      .replace(/[óÓ]/g, 'o')
      .replace(/[úÚ]/g, 'u')
      .split(' ')
      .map(subName => subName.charAt(0).toUpperCase() + subName.substring(1)).join(' ');
    this.displayLastName = lastName.trim().split(' ')
      .map(subName => subName.charAt(0).toUpperCase() + subName.substring(1)).join(' ');
    this.lastName = lastName.trim().toLowerCase()
      .replace(/[áÁ]/g, 'a')
      .replace(/[éÉ]/g, 'e')
      .replace(/[íÍ]/g, 'i')
      .replace(/[óÓ]/g, 'o')
      .replace(/[úÚ]/g, 'u')
      .split(' ')
      .map(subName => subName.charAt(0).toUpperCase() + subName.substring(1)).join(' ');
    this.uid = null;
    this.creationDate = new Date();
  }

}
