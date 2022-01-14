import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import { ComponentService } from '../shared/services/component.service';
import { AdminService } from '../shared/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { handleError } from '../shared/helpers/error-handler';

export interface user{
  userId : string,
  name : string,
  email : string,
  mobilenumber : number,
  imagePath : string,
  createdDt : Date
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})

export class CustomerComponent implements OnInit {
  currPage : number;
  totUsers : number;
  userList : user[];
  constructor(private router : Router,
    private componentService: ComponentService,
    private adminService : AdminService,
    private toasterService: ToastrService) {
    this.currPage = 1;
    this.totUsers =0;
    this.userList = [];
    this.loadUserGrid();
  }

  ngOnInit(): void {
    this.componentService.updateComponent('customer');
  }

  loadPrevPage()
  {
    if(this.currPage > 1)
    {
      this.currPage = this.currPage - 1;
      this. loadUserGrid();
    }
    return false;
  }

  loadNextPage()
  {
    if(this.currPage < Math.ceil(this.totUsers/5))
    {
      this.currPage = this.currPage + 1;
      this. loadUserGrid();
    }
    return false;
  }

  loadUserGrid()
  {
    this.adminService.getUserListForAdmin(this.currPage).subscribe(
      (resp:any)=>{
        this.totUsers = resp.count;
        this.userList = [];
        for(let user of resp.rows)
        {
          let currItem : user ={
            userId : user.userId,
            name : user.firstname,
            email : user.email_Id,
            mobilenumber : user.mobileNumber,
            imagePath : user.imagePath,
            createdDt : user.created_at
          };
          this.userList.push(currItem);
        }
      },
      (err : any) =>{
        this.toasterService.error(handleError(err));
      }
    );
  }

  showDetails(userId : string)
  {
    this.router.navigateByUrl(`/customer/detail/${userId}`);
  }
}
