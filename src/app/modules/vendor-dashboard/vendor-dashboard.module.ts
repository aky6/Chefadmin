import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorDashboardRoutingModule } from './vendor-dashboard-routing.module';
import { VendorDashboardComponent } from './vendor-dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  declarations: [VendorDashboardComponent],
  imports: [
    CommonModule,
    VendorDashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
  ],
})
export class VendorDashboardModule {}
