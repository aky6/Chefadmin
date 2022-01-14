import { Component, OnInit } from '@angular/core';
import { ComponentService } from '../shared/services/component.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent implements OnInit {
  constructor(private componentService: ComponentService) {}

  ngOnInit(): void {
    this.componentService.updateComponent('invoice');
  }
}
