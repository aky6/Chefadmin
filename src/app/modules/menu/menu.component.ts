import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VendorService } from '../shared/services/vendor.service';
import { ComponentService } from '../shared/services/component.service';
import { handleError } from '../shared/helpers/error-handler';

export interface Menu {
  id: number;
  imgUrl: string;
  price: string;
  description: string;
}

export interface GridPage
{
  currPageNo : number,
  TotalItems : number,
  itemsPerPage : number
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  foodMenus: Menu[];
  foodPage : GridPage;
  sugerAndSpicesMenus : Menu[];
  sugarAndSpicePage : GridPage;

  constructor(
    private componentService: ComponentService,
    private vendorService: VendorService,
    private router: Router
  ) {
    this.foodMenus = [];
    this.sugerAndSpicesMenus = [];
    this.foodPage = {
      currPageNo : 1,
      TotalItems : 0,
      itemsPerPage : 12
    };
    this.sugarAndSpicePage = {
      currPageNo : 1,
      TotalItems : 0,
      itemsPerPage : 12
    };
  }

  ngOnInit(): void {
    this.componentService.updateComponent('menu');
    this.getFoodMenuItems();
    this.getSugarAndSpicesMenuItems();
  }

  navigateToDetails(id: any) {
    //this.router.navigate(['/', 'vendor', 'product', id]);
    this.router.navigate(['/', 'vendor', 'product', id]);
  }

  //handle pagiantion for food tab
  foodPageEvents(event: any)
  {
    // console.log(event.pageIndex);
    // console.log(event.pageSize);
    if(event.pageIndex == this.foodPage.currPageNo && this.foodPage.currPageNo < Math.ceil(this.foodPage.TotalItems/this.foodPage.itemsPerPage))
    {
      this.foodPage.currPageNo += 1;
      this.getFoodMenuItems();
    }
    else if(event.pageIndex < this.foodPage.currPageNo && this.foodPage.currPageNo > 1)
    {
      this.foodPage.currPageNo -= 1;
      this.getFoodMenuItems();
    }
  }

  prevPage(category : string)
  {
    if(category == 'Food')
    {
      if(this.foodPage.currPageNo > 1)
      {
        this.foodPage.currPageNo -= 1;
        this.getFoodMenuItems();
      }
    }
    else if(category == 'Sugar & Spices')
    {
      if(this.sugarAndSpicePage.currPageNo > 1)
      {
        this.sugarAndSpicePage.currPageNo -= 1;
        this.getSugarAndSpicesMenuItems();
      }
    }
  }

  nextPage(category : string)
  {
    if(category == 'Food')
    {
      if(this.foodPage.currPageNo < Math.ceil(this.foodPage.TotalItems/this.foodPage.itemsPerPage))
      {
        this.foodPage.currPageNo += 1;
        this.getFoodMenuItems();
      }
    }
    else if(category == 'Sugar & Spices')
    {
      if(this.sugarAndSpicePage.currPageNo < Math.ceil(this.sugarAndSpicePage.TotalItems/this.sugarAndSpicePage.itemsPerPage))
      {
        this.sugarAndSpicePage.currPageNo += 1;
        this.getSugarAndSpicesMenuItems();
      }
    }
  }

  getFoodMenuItems() {
    this.vendorService.gerVenodrMenuItemsBycategory('Food',this.foodPage.currPageNo).subscribe((response: any) => {
      this.foodMenus = [];
      this.foodPage.TotalItems = response.count;
      if(response.rows && response.rows.length)
      {
        for (let item of response.rows) {
          let currItem: Menu = {
            id: item.itemId,
            imgUrl: item.imagePath,
            price: item.price,
            description: item.itemname,
          };
          this.foodMenus.push(currItem);
        }
      }
    },
    (err:any)=>{
      handleError(err);
    });
  }

  getSugarAndSpicesMenuItems() {
    this.vendorService.gerVenodrMenuItemsBycategory('Sugar & Spices',this.sugarAndSpicePage.currPageNo).subscribe((response: any) => {
      this.sugerAndSpicesMenus = [];
      this.sugarAndSpicePage.TotalItems = response.count;
      if(response.rows && response.rows.length)
      {
        for (let item of response.rows) {
          let currItem: Menu = {
            id: item.itemId,
            imgUrl: item.imagePath,
            price: item.price,
            description: item.itemname,
          };
          this.sugerAndSpicesMenus.push(currItem);
        }
      }
    },
    (err:any)=>{
      handleError(err);
    });
  }

  getVendorMenuItems() {
    this.vendorService.gerVenodrMenuItemsBycategory('Food',1).subscribe((response: any) => {
      if(response.rows && response.rows.length)
      {
        for (let item of response.rows) {
          let currItem: Menu = {
            id: item.itemId,
            imgUrl: item.imagePath,
            price: item.price,
            description: item.itemname,
          };
          this.foodMenus.push(currItem);
        }
      }
    });
    this.vendorService.gerVenodrMenuItemsBycategory('Sugar & Spices',1).subscribe((response: any) => {
      if(response.rows && response.rows.length)
      {
        for (let item of response.rows) {
          let currItem: Menu = {
            id: item.itemId,
            imgUrl: item.imagePath,
            price: item.price,
            description: item.itemname,
          };
          this.sugerAndSpicesMenus.push(currItem);
        }
      }
    });
  }
}
