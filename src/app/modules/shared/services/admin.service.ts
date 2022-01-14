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
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private accountService: AccountService
  ) { }

    // To get the customer list for admin panel
    getUserListForAdmin(page : number) {
      return this.http.get(`${environment.apiUrl}/userList/${page}`);
    }

    // To get details of user to dipaly in customer details page
    getCustomerDetails(userId : string)
    {
      return this.http.get(`${environment.apiUrl}/userdetails/${userId}`);
    }

    // To get user address details to dispaly in detail page
    getCustomerAddressDetails(userId : string)
    {
      return this.http.get(`${environment.apiUrl}/useraddress/${userId}`);
    }

    getCustomerOrderDetails(userId : string, PageNo : number)
    {
      return this.http.get(`${environment.apiUrl}/userOrderList/${userId}/${PageNo}`);
    }

    updateCustomerDetails(persData: any,userId : string) {
      let updatedUserData = {
        userId : userId,
        firstname : persData.name,
        mobilenumber : persData.mobileno,
        desc : persData.desc
      };
      //console.log(JSON.stringify(updatedUserData));
      const options  = new HttpHeaders({'Content-Type':'application/json'});
      return this.http.put(`${environment.apiUrl}/updateuserdetails`, updatedUserData,{headers : options,responseType: 'text'});
    }

    addOrupdateProfileAddress(addressData: any, addressId : string,userId : string) {
      let updAddrData ={
        state : addressData.state,
        address : addressData.address,
        city : addressData.city,
        zip : addressData.pinCode,
        userId : userId,
        Id : addressId
      };
      const options  = new HttpHeaders({'Content-Type':'application/json'});
      if(addressId == null || addressId == undefined || addressId == '')
      {
        return this.http.post(`${environment.apiUrl}/addlocation`, updAddrData,{headers : options,responseType: 'text'});
      }
      else
      {
        return this.http.put(`${environment.apiUrl}/updateaddress`, updAddrData,{headers : options,responseType: 'text'});
      }
    }

    uploadCustomerProfileImage(payload : any)
    {
      let formData = new FormData();
      let key: any;
      let value: any;
      // console.log(payload);
      for ([key, value] of Object.entries(payload)) {
        // console.log('key : ' + key + ' value : ' + value);
        formData.append(key, value);
      }
      // console.log(formData);
      return this.http.put(
        `${environment.apiUrl}/userupdateprofileimage`,
        formData
      );
    }

    // To get the vendor list for admin panel
    getVendorListForAdmin(page : number)
    {
      return this.http.get(`${environment.apiUrl}/vendorList/${page}`);
    }

    getRecentOrdersForAdmin()
    {
      return this.http.get(`${environment.apiUrl}/recentorderList/1`);
    }

    getPendingOrdersForAdmin(page : number)
    {
      return this.http.get(`${environment.apiUrl}/pendingorderList/${page}`);
    }

    getHistoryOrdersForAdmin(page : number)
    {
      return this.http.get(`${environment.apiUrl}/historyorderList/${page}`);
    }
}
