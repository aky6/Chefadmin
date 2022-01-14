import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvoiceComponent } from './invoice.component';

const routes: Routes = [{ path: '', component: InvoiceComponent }, { path: 'detail', loadChildren: () => import('./detail/detail.module').then(m => m.DetailModule) }, { path: 'new', loadChildren: () => import('./new/new.module').then(m => m.NewModule) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
