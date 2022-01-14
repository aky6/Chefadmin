import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGaurdService } from './modules/shared/services/auth.gaurd.service';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGaurdService],
  },
  {
    path: 'vendor',
    loadChildren: () =>
      import('./modules/vendor/vendor.module').then((m) => m.VendorModule),
    canActivate: [AuthGaurdService],
  },
  {
    path: 'shared',
    loadChildren: () =>
      import('./modules/shared/shared.module').then((m) => m.SharedModule),
  },
  {
    path: 'customer',
    loadChildren: () =>
      import('./modules/customer/customer.module').then(
        (m) => m.CustomerModule
      ),
    canActivate: [AuthGaurdService],
  },
  {
    path: 'invoice',
    loadChildren: () =>
      import('./modules/invoice/invoice.module').then((m) => m.InvoiceModule),
    canActivate: [AuthGaurdService],
  },
  {
    path: 'vendor-dashboard',
    loadChildren: () =>
      import('./modules/vendor-dashboard/vendor-dashboard.module').then(
        (m) => m.VendorDashboardModule
      ),
    canActivate: [AuthGaurdService],
  },
  {
    path: 'vendor-menu',
    loadChildren: () =>
      import('./modules/menu/menu.module').then((m) => m.MenuModule),
    canActivate: [AuthGaurdService],
  },
  {
    path: 'add-product',
    loadChildren: () =>
      import('./modules/add-product/add-product.module').then(
        (m) => m.AddProductModule
      ),
    canActivate: [AuthGaurdService],
  },
  {
    path: 'edit-product/:id',
    loadChildren: () =>
      import('./modules/edit-product/edit-product.module').then(
        (m) => m.EditProductModule
      ),
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
