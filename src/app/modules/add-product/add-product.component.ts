import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { handleError } from '../shared/helpers/error-handler';
import { AccountService } from '../shared/services/account.service';
import { ComponentService } from '../shared/services/component.service';
import { VendorService } from '../shared/services/vendor.service';

class ImageSnippet {
  constructor(public src: string, public file: File) { }
}

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
})
export class AddProductComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  subCategories: any[];
  name: any[];
  categories: any[];
  imageUrl: any;
  isVendor: boolean;
  selectedFile: ImageSnippet;
  units: string[];
  fileInfo: string;
  fileToUpload: any;
  foodSubCategories: string[];
  sugarSubCategories: string[];
  cat: any;
  subcat: any;
  copySubcat: any;

  constructor(
    private componentService: ComponentService,
    private http: HttpClient,
    private fb: FormBuilder,
    private toasterService: ToastrService,
    private vendorService: VendorService,
    private accountService: AccountService,

    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({

      desc: ['', [Validators.required]],
      ingredients: [''],
      isVeg: ['', [Validators.required]],
      inStock: ['', [Validators.required]],
      category: ['', [Validators.required]],
      subCategory: ['', [Validators.required]],
      price: ['', [Validators.required]],
      unit: ['', [Validators.required]],
      image: [[],],
      quantity: ['', [Validators.required]],
      availableFrom: ['', [Validators.required]],
      availableTill: ['', [Validators.required]],
      cookingTime: ['', [Validators.required]],
      dateOfServing: ['', [Validators.required]],
      customization: this.fb.array([]),
    });

    this.subCategories = [
      'Breakfast',
      'Snacks',
      'North Indian',
      'South Indian',
      'Regional',
      'Oriental',
      'Continental',
      'Healthy',
      'Platter',
      'Desserts',
      'Beverages',
    ];
    this.name = [
      'Breakfast',
      'Snacks',
      'North Indian',
      'South Indian',
      'Regional',
      'Oriental',
      'Continental',
      'Healthy',
      'Platter',
      'Desserts',
      'Beverages',
    ];

    this.imageUrl = 'assets/images/img-placeholder.png';
    this.units = ['gm', 'kg', 'plate', 'ml', 'pcs', 'inches'];
    this.fileInfo = '';
    this.foodSubCategories = [
      'Breakfast',
      'Snacks',
      'North Indian',
      'South Indian',
      'Regional',
      'Oriental',
      'Continental',
      'Healthy',
      'Platter',
      'Desserts',
      'Beverages',
    ];

    this.sugarSubCategories = [
      'Bakery Items',
      'Chocolates ',
      'Savories',
      'Jams & Spreads',
      'Spices & Pickles',
    ];
    this.isVendor = true;
  }

  customization(): FormArray {
    return this.form.get("customization") as FormArray
  }
  newcustomization(): FormGroup {
    return this.fb.group({
      name: '',
      price: ''
    })
  }
  addcustomization() {
    this.subcat = this.copySubcat
    this.customization().push(this.newcustomization())
  }
  removecustomization(i: number) {
    this.customization().removeAt(i)
  }
  ngOnInit(): void {
    this.componentService.updateComponent('add-product');
    this.form.patchValue({
      category: 'Food',
    });
    console.log("ngOnInit of add product")
    this.accountService.getcategory().subscribe((e) => {
      console.log("e", e)
      this.cat = e
    })
    this.accountService.getsubcategory().subscribe((e) => {
      console.log("e of sub cat", e)
      this.subcat = e
      this.copySubcat = this.subcat
    })
  }

  // Handle file upload
  async uploadFile(imageInput: any) {
    let p = [];
    const file: File = imageInput.files;
    console.log("file", file)

    let l = imageInput.files.length
    if (l < 3) {
      this.toasterService.info('Please upload the 3 images', 'Message!');
      return
    }
    console.log("l", l);
    // const reader = new FileReader();
    for (let i = 0; i < l; i++) {
      let ac = this.accountService
      let reader = new FileReader();
      var promise = pFileReader(file[i])
      this.imageUrl = promise
      promise.then((result) => {

        ac.uploadtocloud((result)).subscribe((res) => {
          console.log("res", res);
          p.push(res["secure_url"])
          console.log("p", p)
          if (i == l - 1) {
            this.form.patchValue({
              image: p
            })
            console.log("this.form", this.form.value);
          }
        })


        // p.push(file[i])

      })

      // let pro = reader.addEventListener('load', (event: any) => {
      //   // this.selectedFile = new ImageSnippet(event.target.result, file[i]);
      //   this.imageUrl = this.selectedFile.src.toString();
      //   console.log("this.selectedFile.file[i]", this.selectedFile);


      //   // this.form.patchValue({
      //   //   image: this.selectedFile.file,
      //   // });
      // });




    }



    console.log("p", p)
    // /console.log(this.form)


    function pFileReader(file) {
      return new Promise((resolve, reject) => {
        var reader = new FileReader()

        reader.onload = function found() {
          resolve(reader.result)
        }
        reader.readAsDataURL(file)
      })
    }
  }

  onVegSelection() {
    this.form.patchValue({
      isVeg: 'Yes',
    });
  }

  onNonVegSelection() {
    this.form.patchValue({
      isVeg: 'No',
    });
  }

  onStockSelection() {
    this.form.patchValue({
      inStock: 'Yes',
    });
  }

  onOStockSelection() {
    this.form.patchValue({
      inStock: 'No',
    });
  }

  // To create a new product
  submitForm() {
    // console.log("productform vale", (this.form.value))
    let pd = []
    pd.push(JSON.stringify(this.form.value.category))
    console.log("p", pd);
    if (!this.form.value.image) {
      this.toasterService.info('Please upload the image', 'Message!');
      return;
    }
    if (this.form.invalid) {
      this.toasterService.info(
        'Please enter all the required details',
        'Message!'
      );
    } else {
      if (this.form.value.image.length < 3) {
        this.toasterService.info('Please upload the minimum 3 images', 'Message!');
        return;
      }
      let vendorId = '';
      if (this.isVendor) {
        vendorId = this.accountService.getUserId();
      } else {
        vendorId = this.route.snapshot.paramMap.get('id');
      }

      const payload = this.form.value;
      let p = this.form.value.image
      payload['vendorId'] = vendorId;
      payload.availableFrom = this.form.controls.availableFrom.value;
      payload.availableTill = this.form.controls.availableTill.value;
      payload.cat = pd
      // p.map((e) => {
      //   let i = 0
      //   payload.i = e
      //   i++
      // })
      console.log("payload", payload)
      // payload.availableTill = this.form.controls.availableTill.value.toLocaleTimeString();
      this.vendorService.createItem((payload)).subscribe(
        (result) => {
          this.toasterService.success('Product added successfully', 'Success');
          this.form.reset();
          this.imageUrl = 'assets/images/img-placeholder.png';
          this.router.navigate(['/', 'vendor-menu']);
        },
        (err) => {
          if (err.status === 200) {
            this.toasterService.success(
              'Product added successfully',
              'Success'
            );
            this.form.reset();
            this.imageUrl = 'assets/images/img-placeholder.png';
            this.router.navigate(['/', 'vendor-menu']);
          } else {
            this.toasterService.error(handleError(err), 'Error');
          }
        }
      );
    }
  }

  // To reset the form
  resetForm() {
    this.form.reset();
  }

  // To do bulk product upload
  uploadBulk() {
    let vendorId = '';
    if (this.isVendor) {
      vendorId = this.accountService.getUserId();
    } else {
      vendorId = this.route.snapshot.paramMap.get('id');
    }
    const payload = {
      file: this.fileToUpload,
      vendorId: vendorId,
    };
    this.vendorService.uploadInBulk(payload).subscribe(
      (result) => {
        this.router.navigate(['/', 'vendor-menu']);
      },
      (err) => {
        if (err.status === 200) {
          this.router.navigate(['/', 'vendor-menu']);
        } else {
          this.toasterService.error(handleError(err));
        }
      }
    );
  }

  // To handle file selection
  onFileSelect(input: HTMLInputElement): void {
    function formatBytes(bytes: number): string {
      const UNITS = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const factor = 1024;
      let index = 0;

      while (bytes >= factor) {
        bytes /= factor;
        index++;
      }

      return `${parseFloat(bytes.toFixed(2))} ${UNITS[index]}`;
    }

    const file: File = input.files[0];
    this.fileToUpload = file;
    this.fileInfo = `${file.name} (${formatBytes(file.size)})`;
  }

  // To handle subcategory updation upon selecting category
  onCategorySelection() {
    console.log("form value", this.form.value.category.Id);
    let categoryId = this.form.value.category.Id
    let filtersubcat = [];
    this.subcat.map((e) => {
      if (e.categoryId == categoryId) {
        filtersubcat.push(e)
      }
    })
    console.log("filtersubcat", filtersubcat);
    if (filtersubcat.length > 0) {
      this.subcat = filtersubcat
    } else {
      this.subcat = this.copySubcat
    }
    console.log("this.subcat", this.subcat);
  }
}
