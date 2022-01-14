import { Component, OnInit } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend,
} from 'ng-apexcharts';
import { handleError } from '../shared/helpers/error-handler';
import { ComponentService } from '../shared/services/component.service';
import { VendorService } from '../shared/services/vendor.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  colors: string[];
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-vendor-dashboard',
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.scss'],
})
export class VendorDashboardComponent implements OnInit {
  lineOption = {
    series: [
      {
        name: 'Series',
        data: [4, 3, 10, 9, 29, 19, 22],
      },
    ],
    chart: {
      height: 286,
      type: 'line',
      sparkline: {
        enabled: true,
      },
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    grid: {
      show: true,
      borderColor: '#f5f5f5',
      strokeDashArray: 0,
      position: 'back',
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        right: 5,
        left: 5,
      },
    },
    colors: ['#09D1DE'],
    xaxis: {
      type: 'datetime',
      categories: [
        '1/11/2020',
        '2/11/2020',
        '3/11/2020',
        '4/11/2020',
        '5/11/2020',
        '6/11/2020',
        '7/11/2020',
      ],
    },
    markers: {
      size: 4,
      colors: ['#FFA41B'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    fill: {
      type: 'solid',
    },
    yaxis: {
      tickAmount: 4,
      min: 0,
      max: 30,
    },
  };
  topSellingData = [];
  orderDelivered : number;
  orderCancelled : number;
  vendorRevenue : number;

  constructor(private componentService: ComponentService,
    private vendorService: VendorService) {}

  ngOnInit(): void {
    this.componentService.updateComponent('dashboard');
    this.getVendorOrderDelivered();
    this.getVendorBestSellingProducts();
    this.getVendorOrderCancelled();
    this.getVendorRevenue();
  }

  getVendorBestSellingProducts()
  {
    this.vendorService.getBestSellingVendor().subscribe((resp : any)=>{
    // console.log(resp);
      if(resp.rows && resp.rows.length > 0)
      {
        this.topSellingData = resp.rows.slice(0,4);
      }
    },
    (err)=>{
      handleError(err);
    }
    );
  }

  getVendorOrderDelivered()
  {
    this.vendorService.getVendorOrderDelivered().subscribe((resp:any)=>{
      // console.log(resp);
      this.orderDelivered = Number(resp);
    },
    (err)=>{
      handleError(err);
    });
  }

  getVendorOrderCancelled()
  {
    this.vendorService.getVendorOrderCancelled().subscribe((resp:any)=>{
      // console.log(resp);
      this.orderCancelled = Number(resp);
    },
    (err)=>{
      handleError(err);
    });
  }

  getVendorRevenue()
  {
    this.vendorService.getVendorRevenue().subscribe((resp:any)=>{
      // console.log(resp);
      this.vendorRevenue = Number(resp[0].total);
    },
    (err)=>{
      handleError(err);
    });
  }


}
