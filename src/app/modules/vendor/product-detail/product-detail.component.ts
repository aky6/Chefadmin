import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/modals/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { handleError } from '../../shared/helpers/error-handler';
import { VendorService } from '../../shared/services/vendor.service';
declare var $: any;

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  productId: string;
  product: any;
  subcategories: string;
  isvendor: boolean;
  subcat: string[]

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmdialog: MatDialog,
    private vendorService: VendorService,
    private toasterService: ToastrService
  ) {
    this.productId = '';
    this.product = {};
    this.subcategories = '';
    this.isvendor = true;
    this.subcat = Array()
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id');
      this.getItemDetail(this.productId);
    });
    this.isvendor = true;
  }

  navigateToEdit() {
    this.router.navigate(['/', 'edit-product', this.productId]);
  }

  getItemDetail(id) {
    this.vendorService.getItemByID(id).subscribe(
      (result: any) => {
        console.log("subcategories", result)
        this.product = result;
        this.product.ingredients = JSON.parse(result.ingredients);
        result.subcategories.forEach(element => {
          console.log(element)
          this.subcat.push(element['subcategoryName'])
          // this.subcat.push(element[])
        });
        console.log("this.subcat", this.subcat)
      },
      (err) => {
        console.log(err);
      }
    );
    this.getSubCategory(id);
  }

  getSubCategory(id) {
    this.vendorService.getItemSubCategoryByID(id).subscribe(
      (result: any) => {
        console.log("subcategories", result)
        if (result && 'rows' in result && result.rows) {
          this.subcategories = result.rows.map(
            (category) => category.subcategoryName

          );
          console.log("subcategories", this.subcategories)
        }
      },
      (err) => {
        this.toasterService.error(handleError(err));
      }
    );
  }

  deleteItem(itemID: any) {
    const confirmdialogRef = this.confirmdialog.open(
      ConfirmationDialogComponent,
      {
        data: {
          message: 'Are you sure !! you want to delete this item ?',
        },
      }
    );
    confirmdialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.vendorService.deleteVendorItem(itemID).subscribe(
          (result) => {
            this.toasterService.success(
              'Product deleted successfully!',
              'Success'
            );
            this.router.navigate(['vendor-menu']);
          },
          (err) => {
            handleError(err);
          }
        );
      }
    });
  }
}
