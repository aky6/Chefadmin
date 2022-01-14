import { Component, OnInit } from '@angular/core';
import { ComponentService } from '../../shared/services/component.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  constructor(private componentService: ComponentService) {}

  ngOnInit(): void {
    this.componentService.updateComponent('invoice');
  }
}
