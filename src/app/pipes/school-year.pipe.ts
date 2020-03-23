import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'schoolYear'
})
export class SchoolYearPipe implements PipeTransform {

  transform(schoolYear: string): any {
    if (schoolYear === null) {
      return null;
    } else {
      if (schoolYear.length === 8) {
        const schoolYearArr = schoolYear.split('');
        const startYear = schoolYearArr.splice(0, 4).join('');
        const endYear = schoolYearArr.splice(0, 4).join('');
        return `Cíclo Escolar ${startYear}-${endYear}`;
      }
    }
    return schoolYear;
  }

}
