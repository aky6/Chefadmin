import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VendorDetailComponent } from './vendor-detail.component';

const routes: Routes = [{ path: ':id', component: VendorDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorDetailRoutingModule { }
