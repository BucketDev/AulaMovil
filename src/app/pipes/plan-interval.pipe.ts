import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'planInterval'
})
export class PlanIntervalPipe implements PipeTransform {

  transform(interval: string, intervalCount: number): any {
    let message = '';
    switch (interval) {
      case 'month':
        message += `por ${intervalCount} ${intervalCount === 1 ? 'mes' : 'meses'}`;
        break;
      case 'week':
        message += `por ${intervalCount} ${intervalCount === 1 ? 'semana' : 'semanas'}`;
        break;
      case 'day':
        message += `por ${intervalCount} ${intervalCount === 1 ? 'día' : 'días'}`;
        break;
      case 'year':
        message += `por ${intervalCount} ${intervalCount === 1 ? 'año' : 'años'}`;
        break;
      default:
        message += `por ${intervalCount} ${interval}`;
    }
    return message;
  }

}
