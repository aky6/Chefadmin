import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { SharedComponent } from './shared.component';
import { AngularMaterialModule } from './angular-material.module';
import { ConfirmationDialogComponent } from './modals/confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [SharedComponent, ConfirmationDialogComponent],
  imports: [CommonModule, SharedRoutingModule, AngularMaterialModule],
})
export class SharedModule {}
