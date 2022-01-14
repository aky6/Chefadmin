import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder,FormGroup,Validators,AbstractControl,ValidatorFn } from '@angular/forms'

import { handleError } from '../../shared/helpers/error-handler';
import { AccountService } from '../../shared/services/account.service';
import { ComponentService } from '../../shared/services/component.service';
import { AdminService } from '../../shared/services/admin.service';

class ImageSnippet {
  constructor(public src: string, public file: File) {}
}

export interface user{
  userId : string,
  name : string,
  roles: string,
  desc : string,
  email : string,
  mobilenumber : number,
  imagePath : string,
  addressId : string,
  address : string,
  city : string,
  state : string,
  pincode : number,
  createdDt : Date
}

export interface Order {
  orderID: string;
  date: Date;
  products: any;
  buyerName: string;
  status: string;
  price: number;
  shippingCost: number;
  totalCost: number;
}

export interface OrderPage
{
  currPageNo : number,
  TotalItems : number,
  itemsPerPage : number
}

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss'],
})
export class CustomerDetailComponent implements OnInit {
  displayMenu: boolean;
  displayAbout: boolean;
  displayHistory: boolean;
  userId : string;
  userDetail : user;  
  selectedFile: ImageSnippet;
  isVendor : boolean;
  vendorImgUrl : string;
  profileForm : FormGroup;
  dataSource;
  displayedColumns = [
    'orderID',
    'date',
    'products',
    'buyerName',
    'status',
    'price',
    'shippingCost',
    'totalCost'
  ];
  orderData: Order[];
  OrderPageDetail : OrderPage;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('closeBtn') closeBtn: ElementRef;


  constructor(private formBuilder : FormBuilder,
    private accountService : AccountService,
    private componentService: ComponentService,
    private adminService : AdminService,
    private toasterService: ToastrService,
    private route: ActivatedRoute) {
    this.displayMenu = false;
    this.displayAbout = true;
    this.displayHistory = false;
    this.userDetail = {} as user;
    this.OrderPageDetail = {
      currPageNo : 1,
      TotalItems : 0,
      itemsPerPage : 6
    };
    this.profileForm = new FormGroup({});
    this.orderData = [];
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isVendor = true;  
    this.vendorImgUrl = 'assets/images/img-placeholder.png';
    this.dataSource = new MatTableDataSource(this.orderData);
  }

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      name : '',
      email : '',
      desc : '',
      mobileno : '',
      address : '',
      city : '',
      state : '',
      pinCode : ''
    });
    this.componentService.updateComponent('customer');
    this.loadCustomerDetails(this.userId);
  }

  get profileFormControls() { return this.profileForm.controls; }

  // toggleMenu() {
  //   this.displayMenu = true;
  //   this.displayAbout = false;
  //   this.displayHistory = false;
  // }

  toggleAbout() {
    this.displayMenu = false;
    this.displayAbout = true;
    this.displayHistory = false;
  }

  toggleHistory() {
    this.displayMenu = false;
    this.displayAbout = false;
    this.displayHistory = true;
    if(this.displayHistory)
    {
      this.loadCustomerOrderDetails(this.userId, this.OrderPageDetail.currPageNo);
    }
  }

  loadCustomerDetails(userId : string)
  {
    // console.log(userId);
    this.adminService.getCustomerDetails(userId).subscribe(
      (resp:any)=>{
        this.userDetail.userId = resp.userId;
        this.userDetail.name = resp.firstname;
        this.userDetail.desc = resp.user_desc;
        this.userDetail.email = resp.email_Id;
        this.userDetail.roles = resp.roles;
        this.userDetail.mobilenumber = resp.mobileNumber;
        this.userDetail.imagePath = resp.imagePath;
        this.userDetail.createdDt = resp.created_at;
      },
      (err:any)=>{
        this.toasterService.error(handleError(err));
      }
    )
    this.loadCustomerAddressDetails(userId);
  }

  loadCustomerAddressDetails(userId : string) {
    this.adminService.getCustomerAddressDetails(userId).subscribe(
      (resp : any) => {
        //console.log(resp);
        if(resp != undefined && resp.length > 0)
        {
          this.userDetail.addressId = resp[0].Id;
          this.userDetail.address = resp[0].address;
          this.userDetail.city = resp[0].city;
          this.userDetail.state = resp[0].state;
          this.userDetail.pincode = resp[0].zip;
        }
      },
      (err) => {
        this.toasterService.error(handleError(err));
      }
    );
  }

  loadPrevPage()
  {
    if(this.OrderPageDetail.currPageNo > 1)
    {
      this.OrderPageDetail.currPageNo -= 1;
      this.loadCustomerOrderDetails(this.userId,this.OrderPageDetail.currPageNo);
    }
    return false;
  }

  loadNextPage()
  {
    if(this.OrderPageDetail.currPageNo < Math.ceil(this.OrderPageDetail.TotalItems/this.OrderPageDetail.itemsPerPage))
    {
      this.OrderPageDetail.currPageNo += 1;
      this.loadCustomerOrderDetails(this.userId,this.OrderPageDetail.currPageNo);
    }
    return false;
  }

  loadCustomerOrderDetails(userId : string, pageNo : number)
  {
    this.adminService.getCustomerOrderDetails(userId, pageNo).subscribe(
      (resp:any)=>{
        //console.log(resp);
        this.orderData = [];
        if (resp && resp.rows.length) {
          this.OrderPageDetail.TotalItems = resp.count;
          resp.rows.forEach((res) => {
            this.orderData.push({
              orderID: res.orderId,
              date: res.updated_at,
              products: JSON.parse(res.itemList)
                .filter((product) => product.Name)
                .map((product) => product.Name)
                .join(','),
              buyerName: res.buyername,
              status: res.orderStatus,
              price: 0,
              shippingCost: 0,
              totalCost: res.TotalPrice,
            });
          });
          this.dataSource = new MatTableDataSource(
            this.orderData
          );
          this.dataSource.sort = this.sort;
        }
      },
      (err:any)=>{
        this.toasterService.error(handleError(err));
      }
    );
  }

  updateProfileFormData()
  {
    this.selectedFile = null;
    this.adminService.getCustomerDetails(this.userId).subscribe(
      (resp:any)=>{
        //console.log(resp);
        let userDetails = resp;
        this.adminService.getCustomerAddressDetails(this.userId).subscribe(
          (resp : any) => {
            //console.log(resp);
            let userAddr = resp;
            this.profileForm.patchValue({
              name : userDetails.firstname,
              email : userDetails.email_Id,
              desc : userDetails.user_desc,
              mobileno : userDetails.mobileNumber,
              address : userAddr && userAddr.length > 0 ? userAddr[0].address : '',
              city : userAddr && userAddr.length > 0 ? userAddr[0].city : '',
              state : userAddr && userAddr.length > 0 ? userAddr[0].state : '',
              pinCode : userAddr && userAddr.length > 0 ? userAddr[0].zip : ''
            });
            this.userDetail.addressId = resp[0].Id;
          },
          (err) => {
            this.toasterService.error(handleError(err));
          }
        );
      },
      (err:any)=>{
        this.toasterService.error(handleError(err));
      }
    )
  }

    // To update the vendor profile image
  updateProfile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new ImageSnippet(event.target.result, file);
      const payload = {
        image: this.selectedFile.file,
        userId: this.userId,
      };

      this.adminService.uploadCustomerProfileImage(payload).subscribe(
        (result) => {
          this.toasterService.success(
            'Profile Image updated successfully',
            'Success'
          );
          this.profileForm.reset();
          this.loadCustomerDetails(this.userId);
        },
        (err) => {
            this.toasterService.error(handleError(err), 'Error');
        }
      );
    });

    reader.readAsDataURL(file);
  }

  updateFile(imageInput: any)
  {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new ImageSnippet(event.target.result, file);
      this.userDetail.imagePath = this.selectedFile.src.toString();
    });

    reader.readAsDataURL(file);
  }

  onSubmit()
  {
    if(this.profileForm.valid)
    {
      this.adminService.updateCustomerDetails(this.profileForm.value, this.userDetail.userId).subscribe(
        (resp:any)=>{
          //console.log(resp);
            this.adminService.addOrupdateProfileAddress(this.profileForm.value,this.userDetail.addressId,this.userDetail.userId).subscribe(
              (resp:any)=>{
                //console.log(resp);
                if(this.selectedFile != null)
                {
                  const payload = {
                    image: this.selectedFile.file,
                    userId: this.userId,
                  };
                  this.adminService.uploadCustomerProfileImage(payload).subscribe(
                    (result) => {
                      this.profileForm.reset();
                      this.loadCustomerDetails(this.userId);
                      this.closeBtn.nativeElement.click();
                      this.toasterService.success(
                        'Profile updated successfully',
                        'Success');
                    },
                    (err) => {
                        this.toasterService.error(handleError(err), 'Error');
                    });
                  }
                  else
                  {
                    this.profileForm.reset();
                    this.loadCustomerDetails(this.userId);
                    this.closeBtn.nativeElement.click();
                    this.toasterService.success(
                      'Profile updated successfully',
                      'Success');
                  }
                },
                  (err) => {
                      this.toasterService.error(handleError(err), 'Error');
                  }
                );
              },
              (err:any)=>{
                this.toasterService.error(handleError(err));
              }
            );
    }
    else
    {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
    return false;
  }
}
