import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuRoutingModule } from './menu-routing.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MenuComponent } from './menu.component';



@NgModule({
  declarations: [MenuComponent],
  imports: [CommonModule, MenuRoutingModule, MatTabsModule],
})
export class MenuModule { }
