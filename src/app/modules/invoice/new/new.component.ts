import { Component, OnInit } from '@angular/core';
import { ComponentService } from '../../shared/services/component.service';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss'],
})
export class NewComponent implements OnInit {
  constructor(private componentService: ComponentService) {}

  ngOnInit(): void {
    this.componentService.updateComponent('invoice');
  }
}
