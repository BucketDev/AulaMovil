import {Component, Input, OnInit} from '@angular/core';
import {BreadcrumbType} from '../../models/breadcrumb-type.enum';
import {Student} from '../../models/student.class';
import {Group} from '../../models/group.class';
import {GroupsService} from '../../services/groups.service';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnInit {

  @Input() breadcrumbType: BreadcrumbType;
  @Input() student: Student;
  @Input() loading = false;

  constructor(private groupsService: GroupsService) { }

  ngOnInit() {}

  getLabel = () => {
    switch (this.breadcrumbType) {
      case BreadcrumbType.GROUP:
        return this.groupsService.group.name;
      case BreadcrumbType.STUDENT:
        return `${this.student.displayName} ${this.student.displayLastName}`;
    }
  }

  getNoteText = () => {
    switch (this.breadcrumbType) {
      case BreadcrumbType.GROUP:
        return 'Grupo';
      case BreadcrumbType.STUDENT:
        return 'Alumno';
    }
  }

  getIcon = () => {
    switch (this.breadcrumbType) {
      case BreadcrumbType.GROUP:
        return 'people-circle';
      case BreadcrumbType.STUDENT:
        return 'person';
    }
  }

}
