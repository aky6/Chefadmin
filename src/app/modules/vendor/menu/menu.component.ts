import { AfterViewInit, Component, OnInit, ViewChild  } from '@angular/core';
import { VendorService } from '../../shared/services/vendor.service';
import { ComponentService } from '../../shared/services/component.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { handleError } from '../../shared/helpers/error-handler';
import { AdminService } from '../../shared/services/admin.service';

export interface Item {
  ItemName: String;
  ItemQuantity: number;
  ItemPrice: number;
  ItemImageUrl: string;
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
export class MenuComponent implements OnInit, AfterViewInit {
  Orders: Order[];
  color: string;
  bgColor: string;
  displayedColumns = [
    'orderID',
    'date',
    'products',
    'buyerName',
    'status',
    'price',
    'shippingCost',
    'totalCost',
    'action',
  ];
  displayedHistoryColumns = [
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
  isVendor : boolean;
  pendingOrderData: Order[];
  historyOrderData: Order[];
  pendingPage : GridPage;
  historyPage : GridPage;
  dataSource;
  pendingDataSource;
  historyDataSource;
  selectedTabIndex: number;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private adminService : AdminService,
    private componentService: ComponentService,
    private vendorService: VendorService,
    private toasterService: ToastrService
  ) {
    this.Orders = [];
    this.color = 'accent';
    this.bgColor = 'primary';
    this.orderData = [];
    this.pendingOrderData = [];
    this.historyOrderData = [];
    this.pendingPage = {
      currPageNo : 1,
      TotalItems : 0,
      itemsPerPage : 5
    };
    this.historyPage = {
      currPageNo : 1,
      TotalItems : 0,
      itemsPerPage : 5
    };
    this.isVendor = true;
    this.dataSource = new MatTableDataSource([...this.orderData]);
    this.pendingDataSource = new MatTableDataSource([...this.pendingOrderData]);
    this.historyDataSource = new MatTableDataSource([...this.historyOrderData]);
    this.selectedTabIndex = 0;
  }

  ngOnInit(): void {
    this.componentService.updateComponent('order');
    if(this.isVendor)
    {
      this.getOrderByStatus('recentorder');
    }
    else
    {
      this.getRecentOrdersForAdmin();
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.pendingDataSource.sort = this.sort;
    this.historyDataSource.sort = this.sort;
  }

  // To get order history
  getVendorOrders() {
    this.vendorService.getVendorOrders().subscribe(
      (response: any) => {
        this.historyOrderData = [];
        if (response && response.length) {
          response.forEach((res) => {
            this.historyOrderData.push({
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
        }
        this.historyDataSource.data = this.historyOrderData;
      },
      (err) => {
        this.toasterService.error(handleError(err));
      }
    );
  }

  // To get the order based on status
  getOrderByStatus(status: string) {
    this.vendorService.getOrdersByStatus(status).subscribe(
      (response: any) => {
        this.pendingOrderData = [];
        this.orderData = [];
        const orders: Order[] = [];

        if (response && response.length) {
          response.forEach((res) => {
            orders.push({
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
        }
        
        if (status === 'pending') {
          this.pendingOrderData = [...orders];
          this.pendingDataSource.data =   this.pendingOrderData;
        } else {
          this.orderData = [...orders];
          this.dataSource.data = this.orderData;
        }
      },
      (err) => {
        this.toasterService.error(handleError(err));
      }
    );
  }

  toShortFormat(date: string): string {
    let dt = new Date();
    let monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    let day = dt.getDate();

    let monthIndex = dt.getMonth();
    let monthName = monthNames[monthIndex];

    let year = dt.getFullYear();

    return `${day} ${monthName} ${year}`;
  }

  acceptedByChef() {
    console.log('accepted');
  }

  rejectedByChef() {
    console.log('rejected');
  }

  onTabChange(event) {
    this.selectedTabIndex = event.index;

    if (this.selectedTabIndex === 2) {
      if(this.isVendor)
      {
        this.getVendorOrders();
      }
      else
      {
        this.getHistoryOrdersForAdmin();
      }

    } else if (this.selectedTabIndex === 1) {
      if(this.isVendor)
      {
        this.getOrderByStatus('pending');
      }
      else
      {
        this.getPendingOrdersForAdmin();
      }
    } else {
      if(this.isVendor)
      {
        this.getOrderByStatus('recentorder');
      }
      else
      {
        this.getRecentOrdersForAdmin();
      }
    }
  }

  // To update order status
  updateOrderStaus(status: string, orderId: string) {
    const payload = {
      status: status,
      orderId: orderId,
    };
    this.vendorService.updateOrderStatus(payload).subscribe(
      (result) => {
        this.pendingOrderData = [];
        this.orderData = [];
        this.historyOrderData =[];
        if (this.selectedTabIndex === 1) {
          this.getOrderByStatus('pending');
        } else if (this.selectedTabIndex === 0) {
          this.getOrderByStatus('recentorder');
        } else {
          this.getVendorOrders();
        }
      },
      (err) => {
        if (err.status === 200) {
          if (this.selectedTabIndex === 1) {
            this.getOrderByStatus('pending');
          } else if (this.selectedTabIndex === 0) {
            this.getOrderByStatus('recentorder');
          } else {
            this.getVendorOrders();
          }
        } else {
          this.toasterService.error(handleError(err));
        }
      }
    );
  }

  generateVendorInvoice(orderData : Order)
  {
    let reqData = {
      orderId : orderData.orderID,
      invoice_date : new Date(),
      customerName : orderData.buyerName,
      amount : orderData.totalCost
    };
    this.vendorService.createVendorInvoice({reqData}).subscribe((resp : any)=>{

    },(err : any)=>{
      handleError(err);
    });
  }

  deliverorder(orderId : string)
  {
    this.vendorService.deliverOrder(orderId).subscribe((resp : any)=>{
      this.pendingOrderData = [];
      this.getOrderByStatus('pending');
      this.toasterService.success('delivery placed successfully','success');
    },(err : any)=>{
      handleError(err);
    });
  }

  getRecentOrdersForAdmin()
  {
    this.adminService.getRecentOrdersForAdmin().subscribe(
      (resp:any)=>{
        //console.log(resp);
        this.orderData = [];
        if (resp && resp.rows.length) {
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
        }
        this.dataSource = new MatTableDataSource([...this.orderData]);
        this.dataSource.sort = this.sort;
      },
      (err:any)=>{
        this.toasterService.error(handleError(err));
      }
    );
  }

  getHistoryOrdersForAdmin()
  {
    this.adminService.getHistoryOrdersForAdmin(this.historyPage.currPageNo).subscribe(
      (resp:any)=>{
        //console.log(resp);
        this.historyPage.TotalItems = resp.count;
        this.historyOrderData = [];
        if (resp && resp.rows.length) {
          resp.rows.forEach((res) => {
            this.historyOrderData.push({
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
        }
        this.historyDataSource = new MatTableDataSource([...this.historyOrderData]);
        this.historyDataSource.sort = this.sort;
      },
      (err:any)=>{
        this.toasterService.error(handleError(err));
      }
    );
  }

  getPendingOrdersForAdmin()
  {
    this.adminService.getPendingOrdersForAdmin(this.pendingPage.currPageNo).subscribe(
      (resp:any)=>{
        this.pendingPage.TotalItems = resp.count;
        //console.log(resp);
        this.pendingOrderData = [];
        if (resp && resp.rows.length > 0) {
          resp.rows.forEach((res) => {
            this.pendingOrderData.push({
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
        }
        this.pendingDataSource = new MatTableDataSource([...this.pendingOrderData]);
        this.pendingDataSource.sort = this.sort;
      },
      (err:any)=>{
        this.toasterService.error(handleError(err));
      }
    );
  }

  historyPageEvents(event: any)
  {
    // console.log(event.pageIndex);
    // console.log(event.pageSize);
    if(event.pageIndex == this.historyPage.currPageNo && this.historyPage.currPageNo < Math.ceil(this.historyPage.TotalItems/this.historyPage.itemsPerPage))
    {
      this.historyPage.currPageNo += 1;
      this.getHistoryOrdersForAdmin();
    }
    else if(event.pageIndex < this.historyPage.currPageNo && this.historyPage.currPageNo > 1)
    {
      this.historyPage.currPageNo -= 1;
      this.getHistoryOrdersForAdmin();
    }
  }

  pendingPageEvents(event : any)
  {
    // console.log(event.pageIndex);
    // console.log(event.pageSize);
    if(event.pageIndex == this.pendingPage.currPageNo && this.pendingPage.currPageNo < Math.ceil(this.pendingPage.TotalItems/this.pendingPage.itemsPerPage))
    {
      this.pendingPage.currPageNo += 1;
      this.getPendingOrdersForAdmin();
    }
    else if(event.pageIndex < this.pendingPage.currPageNo && this.pendingPage.currPageNo > 1)
    {
      this.pendingPage.currPageNo -= 1;
      this.getPendingOrdersForAdmin();
    }
  }
}
