import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VendorService } from '../shared/services/vendor.service';
import { ComponentService } from '../shared/services/component.service';
import { handleError } from '../shared/helpers/error-handler';
import { AccountService } from '../shared/services/account.service';
import { MatTabChangeEvent } from '@angular/material/tabs';


export interface Menu {
  id: number;
  imgUrl: string;
  price: string;
  description: string;
}

export interface GridPage {
  currPageNo: number,
  TotalItems: number,
  itemsPerPage: number
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  foodMenus: Menu[];
  foodPage: GridPage;
  sugerAndSpicesMenus: Menu[];
  sugarAndSpicePage: GridPage;
  cat: any;
  defcat: any
  curentcat: any

  constructor(
    private componentService: ComponentService,
    private vendorService: VendorService,
    private router: Router,
    private accountService: AccountService,
  ) {
    this.foodMenus = [];
    this.sugerAndSpicesMenus = [];
    this.foodPage = {
      currPageNo: 1,
      TotalItems: 0,
      itemsPerPage: 12
    };
    this.sugarAndSpicePage = {
      currPageNo: 1,
      TotalItems: 0,
      itemsPerPage: 12
    };
  }

  ngOnInit(): void {
    this.componentService.updateComponent('menu');


    this.accountService.getcategorywithsubcategory().subscribe((e) => {
      console.log("e", e)
      this.cat = e
      this.defcat = e[0]['categoryName']
      console.log("this.defcat", this.defcat)
      this.getFoodMenuItems(this.defcat);
      // this.cat.map((l) => {
      //   
      // })

      this.getSugarAndSpicesMenuItems();
    })

  }

  navigateToDetails(id: any) {
    //this.router.navigate(['/', 'vendor', 'product', id]);
    this.router.navigate(['/', 'vendor', 'product', id]);
  }

  //handle pagiantion for food tab
  foodPageEvents(event: any, category) {
    // console.log(event.pageIndex);
    // console.log(event.pageSize);
    if (event.pageIndex == this.foodPage.currPageNo && this.foodPage.currPageNo < Math.ceil(this.foodPage.TotalItems / this.foodPage.itemsPerPage)) {
      this.foodPage.currPageNo += 1;
      this.getFoodMenuItems(category);
    }
    else if (event.pageIndex < this.foodPage.currPageNo && this.foodPage.currPageNo > 1) {
      this.foodPage.currPageNo -= 1;
      this.getFoodMenuItems(category);
    }
  }

  prevPage(category: string) {

    if (this.foodPage.currPageNo > 1) {
      this.foodPage.currPageNo -= 1;
      this.getFoodMenuItems(category);
    }

    else if (category == 'Sugar & Spices') {
      if (this.sugarAndSpicePage.currPageNo > 1) {
        this.sugarAndSpicePage.currPageNo -= 1;
        this.getSugarAndSpicesMenuItems();
      }
    }
  }

  nextPage(category: string) {

    if (this.foodPage.currPageNo < Math.ceil(this.foodPage.TotalItems / this.foodPage.itemsPerPage)) {
      this.foodPage.currPageNo += 1;
      this.getFoodMenuItems(category);
    }

    else if (category == 'Sugar & Spices') {
      if (this.sugarAndSpicePage.currPageNo < Math.ceil(this.sugarAndSpicePage.TotalItems / this.sugarAndSpicePage.itemsPerPage)) {
        this.sugarAndSpicePage.currPageNo += 1;
        this.getSugarAndSpicesMenuItems();
      }
    }
  }

  getFoodMenuItems(category) {
    console.log("called ")
    this.vendorService.gerVenodrMenuItemsBycategory(category, this.foodPage.currPageNo).subscribe((response: any) => {
      this.foodMenus = [];
      console.log("called foodMenus", this.foodMenus)
      console.log("called response", response);
      console.log("category", category)
      this.foodPage.TotalItems = response.count;
      if (response.rows && response.rows.length) {
        for (let item of response.rows) {
          let currItem: Menu = {
            id: item.itemId,
            imgUrl: item.images[0]['imagePath'],
            price: item.price,
            description: item.itemname,
          };
          this.foodMenus.push(currItem);
          console.log("category", category)
          console.log("foddMenus", this.foodMenus)
        }
      }
    },
      (err: any) => {
        handleError(err);
      });
  }

  getSugarAndSpicesMenuItems() {
    this.vendorService.gerVenodrMenuItemsBycategory('Sugar & Spices', this.sugarAndSpicePage.currPageNo).subscribe((response: any) => {
      this.sugerAndSpicesMenus = [];
      this.sugarAndSpicePage.TotalItems = response.count;
      if (response.rows && response.rows.length) {
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
      (err: any) => {
        handleError(err);
      });
  }

  getVendorMenuItems() {
    this.vendorService.gerVenodrMenuItemsBycategory('Food', 1).subscribe((response: any) => {
      if (response.rows && response.rows.length) {
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
    this.vendorService.gerVenodrMenuItemsBycategory('Sugar & Spices', 1).subscribe((response: any) => {
      if (response.rows && response.rows.length) {
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
  tabChanged(tabChangeEvent: any): void {
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('index => ', tabChangeEvent.index);
  }
  onTabClick(event) {
    console.log("event", event);
    console.log(event.tab.textLabel);
    this.curentcat = event.tab.textLabel
    this.getFoodMenuItems(event.tab.textLabel)
  }
}


