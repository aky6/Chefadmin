import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorDetailRoutingModule } from './vendor-detail-routing.module';
import { VendorDetailComponent } from './vendor-detail.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [VendorDetailComponent],
  imports: [
    CommonModule,
    VendorDetailRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgCircleProgressModule.forRoot({
      radius: 60,
      space: -10,
      outerStrokeGradient: true,
      outerStrokeWidth: 10,
      outerStrokeColor: '#8280FD',
      outerStrokeGradientStopColor: '#53a9ff',
      innerStrokeColor: '#e7e8ea',
      innerStrokeWidth: 10,
      subtitleFontSize: '60',
      title: 'UI',
      animateTitle: false,
      animationDuration: 1000,
      showTitle: false,
      showUnits: false,
      showBackground: false,
      lazy: true,
    }),
  ],
})
export class VendorDetailModule {}
