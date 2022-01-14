import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs/internal/observable/throwError';
import { Observable } from 'rxjs';

import { AccountService } from '../services/account.service';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private accountService: AccountService
  ) { }

  getVendorOrders(): Observable<any> {
    let vendorId = this.accountService.getUserId();
    return this.http.get(`${environment.apiUrl}/vendororder/${vendorId}`);
  }

  // To get vendor orders based on status
  getOrdersByStatus(status: string): Observable<any> {
    let vendorId = this.accountService.getUserId();
    return this.http.get(`${environment.apiUrl}/${status}/${vendorId}`);
  }

  // To update order status of an order
  updateOrderStatus(payload) {
    let vendorId = this.accountService.getUserId();
    payload['vendorId'] = vendorId;

    return this.http.put(`${environment.apiUrl}/changeorderstatus`, payload);
  }

  createItem(payload: any) {
    let formData = new FormData();
    let key: any;
    let value: any;

    for ([key, value] of Object.entries(payload)) {
      if (key === 'subCategory') {
        value.forEach((val, index) => {
          console.log("val", val)
          formData.append(`subcategoryName[${index}]`, val);
        });
      } else if (key === 'customization') {
        // console.log('key : ' + key + ' value : ' + value);
        value.forEach((val, index) => {
          formData.append(`customization[${index}]`, JSON.stringify((val)))
        });
        // formData.append(key, value);
      }
      else {
        // console.log('key : ' + key + ' value : ' + value);
        formData.append(key, value);
      }
    }
    console.log("formdata", formData)
    const options = new HttpHeaders({ 'Content-Type': 'multipart/form-data; boundary=<calculated when request is sent>' });
    return this.http.post(`${environment.apiUrl}/additem`, formData, { headers: options });
  }

  updateItem(payload: any) {
    let formData = new FormData();
    let key: any;
    let value: any;

    for ([key, value] of Object.entries(payload)) {
      if (key === 'subCategory') {
        value.forEach((val, index) => {
          formData.append(`subcategoryName[${index}]`, val);
        });
      } else if (key === 'customization') {
        // console.log('key : ' + key + ' value : ' + value);
        value.forEach((val, index) => {
          formData.append(`customization[${index}]`, JSON.stringify((val)))
        });
        // formData.append(key, value);
      }
      else {
        formData.append(key, value);
      }
    }

    return this.http.put(`${environment.apiUrl}/updateitem`, formData);
  }

  // To change vendor status
  updateVendorStatus(payload: any) {
    return this.http.put(`${environment.apiUrl}/changestatusofvendor`, payload);
  }

  // To update vendor profile image
  updateVendorProfileImage(payload: any) {
    let formData = new FormData();
    let key: any;
    let value: any;

    for ([key, value] of Object.entries(payload)) {
      formData.append(key, value);
    }
    //console.log(formData);
    return this.http.put(
      `${environment.apiUrl}/vendorprofileimageupload`,
      formData
    );
  }

  getVendorItems(): Observable<any> {
    let vendorId = this.accountService.getUserId();
    return this.http
      .get(`${environment.apiUrl}/vendormenuitem/${vendorId}`);
    // .pipe(catchError((err) => this.handleError(err)));
  }

  gerVenodrMenuItemsBycategory(category: string, pageNo: number) {
    let vendorId = this.accountService.getUserId();
    let bodyJson = {
      vendorId: vendorId,
      category: category,
      pageNo: pageNo
    };
    const options = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post(`${environment.apiUrl}/vendorMenuItemByCategoryList/`, bodyJson, { headers: options });
  }

  getVendorItemsForAdmin(vendorId: string, pageNo: number): Observable<any> {
    return this.http
      .get(`${environment.apiUrl}/vendormenuitemList/${vendorId}/${pageNo}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  // To get the food item based on its id
  getItemByID(id) {
    return this.http.get(`${environment.apiUrl}/itemdetails/${id}`);
  }

  // To get the sub category for an item
  getItemSubCategoryByID(id) {
    return this.http.get(`${environment.apiUrl}/itemsubcategroy/${id}`);
  }

  // To get the vendor based on ID
  getVendorByID(id) {
    return this.http.get(`${environment.apiUrl}/vendordeatils/${id}`);
  }

  // To upload product in bulk
  uploadInBulk(payload) {
    let formData = new FormData();
    let key: any;
    let value: any;

    for ([key, value] of Object.entries(payload)) {
      formData.append(key, value);
    }

    return this.http.post(`${environment.apiUrl}/uploadinbulk`, formData);
  }

  deleteVendorItem(itemID: string) {
    return this.http.delete(`${environment.apiUrl}/deleteitem/${itemID}`, {
      responseType: 'text',
    });
  }

  // To get the vendor based on ID
  updateVendor(payload) {
    let formData = new FormData();
    let key: any;
    let value: any;

    for ([key, value] of Object.entries(payload)) {
      formData.append(key, value);
    }
    //console.log(payload);
    return this.http.put(`${environment.apiUrl}/updatevendor`, formData);
  }

  // To get all the states
  getAllStateDetails() {
    return this.http.get(`${environment.apiUrl}/states`);
  }

  // To get all the states
  getBestSellingVendor(): Observable<any> {
    let vendorId = this.accountService.getUserId();
    return this.http.get(`${environment.apiUrl}/vendorbestselling/${vendorId}/1`);
  }

  getVendorOrderDelivered(): Observable<any> {
    let vendorId = this.accountService.getUserId();
    return this.http.get(`${environment.apiUrl}/totaldeliveredorderbyVendor/${vendorId}`);
  }

  getVendorOrderCancelled(): Observable<any> {
    let vendorId = this.accountService.getUserId();
    return this.http.get(`${environment.apiUrl}/totalcancelledorderbyvendor/${vendorId}`);
  }


  getVendorRevenue(): Observable<any> {
    let vendorId = this.accountService.getUserId();
    return this.http.get(`${environment.apiUrl}/totalrevenuebyvendor/${vendorId}`);
  }

  createVendorInvoice(payload: any): Observable<any> {
    let vendorId = this.accountService.getUserId();
    payload.VendorVendorId = vendorId;
    const options = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${environment.apiUrl}/invoicebyvendor`, payload, { headers: options });
  }

  deliverOrder(orderId: string): Observable<any> {
    let vendorId = this.accountService.getUserId();
    const options = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${environment.apiUrl}/deliverorder`, { orderId, vendorId }, { headers: options });
  }


  handleError(errorObj: HttpErrorResponse): Observable<any> {
    console.log(errorObj);
    let errorMsg: any;
    if (typeof errorObj.error === 'string') {
      errorMsg = errorObj.error;
      this.toastr.error(errorObj.error, 'Error');
    } else if (typeof errorObj.error === 'object') {
      if ('errors' in errorObj.error) {
        errorMsg = errorObj.error.errors[0].message;
        this.toastr.error(errorMsg, 'Error');
      } else {
        errorMsg = errorObj.error.name;
        this.toastr.error(errorObj.error.name, 'Error');
      }
    } else {
      errorMsg = errorObj.message;
      this.toastr.error(errorObj.message, 'Error');
    }
    return throwError(errorMsg);
  }
}
