import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { handleError } from '../shared/helpers/error-handler';
import { AdminService } from '../shared/services/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComponentService } from '../shared/services/component.service';
import { VendorService } from '../shared/services/vendor.service';

class ImageSnippet {
  constructor(public src: string, public file: File) {}
}

export interface vendor {
  vendorId: string;
  name: string;
  email: string;
  role: string;
  mobilenumber: number;
  status: string;
  imagePath: string;
  createdDt: Date;
}

export interface vendorpage {
  currPage: number;
  totItems: number;
  itemsPerPage: number;
}

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss'],
})
export class VendorComponent implements OnInit {
  vendorList: vendor[];
  vendorPageDet: vendorpage;
  form: FormGroup;
  currVendorId: string;
  vendorImgUrl: string;
  selectedFile: ImageSnippet;
  allStates: any;
  @ViewChild('closeModal') closeModal: ElementRef;

  constructor(
    private toasterService: ToastrService,
    private componentService: ComponentService,
    private adminService: AdminService,
    private vendorService: VendorService,
    private fb: FormBuilder
  ) {
    this.vendorList = [];
    this.vendorPageDet = {
      currPage: 1,
      totItems: 0,
      itemsPerPage: 5,
    };
    this.form = this.fb.group({
      firstname: ['', []],
      mobileNumber: ['', []],
      email: ['', []],
      user_desc: ['', []],
      Address: ['', []],
      city: ['', []],
      image: ['', []],
      zip: [''],
      state: [''],
    });
    this.vendorImgUrl = '';
    this.currVendorId = '';
    this.allStates = [];
  }

  ngOnInit(): void {
    this.loadVendorGrid();
    this.componentService.updateComponent('vendor');
    this.vendorService.getAllStateDetails().subscribe(
      (result: any) => {
        if (result && result.length) {
          this.allStates = [...result];
        }
      },
      (err) => {
        this.toasterService.error(handleError(err));
      }
    );
  }

  get profileFormControls() {
    return this.form.controls;
  }

  loadPrevPage() {
    if (this.vendorPageDet.currPage > 1) {
      this.vendorPageDet.currPage -= 1;
      this.loadVendorGrid();
    }
    return false;
  }

  loadNextPage() {
    if (
      this.vendorPageDet.currPage <
      Math.ceil(this.vendorPageDet.totItems / this.vendorPageDet.itemsPerPage)
    ) {
      this.vendorPageDet.currPage += 1;
      this.loadVendorGrid();
    }
    return false;
  }

  loadVendorGrid() {
    this.adminService
      .getVendorListForAdmin(this.vendorPageDet.currPage)
      .subscribe(
        (resp: any) => {
          //console.log(resp);
          this.vendorPageDet.totItems = resp.count;
          this.vendorList = [];
          for (let vendor of resp.rows) {
            let currItem: vendor = {
              vendorId: vendor.vendorId,
              name: vendor.firstname,
              role: 'vendor',
              email: vendor.email_Id,
              status: vendor.status,
              mobilenumber: vendor.mobileNumber,
              imagePath: vendor.imagePath,
              createdDt: vendor.created_at,
            };
            this.vendorList.push(currItem);
          }
        },
        (err: any) => {
          this.toasterService.error(handleError(err));
        }
      );
  }

  changeVendorStatus(status: string, vendorId: string) {
    this.vendorService.updateVendorStatus({ status, vendorId }).subscribe(
      (resp: any) => {
        this.loadVendorGrid();
      },
      (err: any) => {
        this.toasterService.error(handleError(err));
      }
    );
  }

  uploadFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new ImageSnippet(event.target.result, file);
      this.vendorImgUrl = this.selectedFile.src.toString();
      this.form.patchValue({
        image: this.selectedFile.file,
      });
    });

    reader.readAsDataURL(file);
  }

  // To edit the vendor
  editVendor(vendor: any) {
    this.form.reset();
    this.vendorService.getVendorByID(vendor.vendorId).subscribe(
      (result: any) => {
        // console.log(result);
        this.form.patchValue({
          image: result.imagePath,
          firstname: result.firstname,
          email: result.email_Id,
          user_desc: result.user_desc,
          Address: result.Address,
          city: result.city,
          mobileNumber: result.mobileNumber,
          zip: result.zip,
          state: result.state,
        });
        this.currVendorId = result.vendorId;
        // this.vendorImgUrl = result.imagePath;
      },
      (err) => {
        if (err.status !== 200) {
          this.toasterService.error(handleError(err));
        }
      }
    );
  }

  // updateProfile(imageInput: any) {
  //   const file: File = imageInput.files[0];
  //   const reader = new FileReader();

  //   reader.addEventListener('load', (event: any) => {
  //     this.selectedFile = new ImageSnippet(event.target.result, file);
  //     let vendorId = '';
  //     const payload = {
  //       image: this.selectedFile.file,
  //       vendorId: vendorId,
  //     };

  //     this.vendorService.updateVendorProfileImage(payload).subscribe(
  //       (result) => {
  //         this.toasterService.success(
  //           'Profile updated successfully',
  //           'Success'
  //         );
  //         this.form.reset();
  //         this.vendorImgUrl = 'assets/images/img-placeholder.png';
  //         this.loadVendorGrid();
  //       },
  //       (err) => {
  //         if (err.status === 200) {
  //           this.toasterService.success(
  //             'Profile updated successfully',
  //             'Success'
  //           );
  //           this.vendorImgUrl = 'assets/images/img-placeholder.png';
  //           this.loadVendorGrid();
  //         } else {
  //           this.toasterService.error(handleError(err), 'Error');
  //         }
  //       }
  //     );
  //   });

  //   reader.readAsDataURL(file);
  // }

  updateVendor() {
    const payload = this.form.value;
    payload['vendorId'] = this.currVendorId;
    let key: any;
    let value: any;

    for ([key, value] of Object.entries(payload)) {
      if (key === 'image') {
        if (typeof value === 'string') {
          delete payload[key];
        }
      } else {
        if (!value) {
          payload[key] = '';
        }
      }
    }

    this.vendorService.updateVendor(payload).subscribe(
      (result) => {
        this.toasterService.success('Updated successfully', 'Success');
        this.form.reset();
        this.vendorImgUrl = 'assets/images/img-placeholder.png';
        this.loadVendorGrid();
        this.closeModal.nativeElement.click();
      },
      (err) => {
        if (err.status === 200) {
          this.toasterService.success('Updated successfully', 'Success');
          this.form.reset();
          this.vendorImgUrl = 'assets/images/img-placeholder.png';
          this.loadVendorGrid();
          this.closeModal.nativeElement.click();
        } else {
          this.toasterService.error(handleError(err), 'Error');
        }
      }
    );
  }
}
