import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { AccountService } from './modules/shared/services/account.service';
import { ComponentService } from './modules/shared/services/component.service';
import { User } from './modules/shared/models/user';
import { Router } from '@angular/router';
import { VendorService } from './modules/shared/services/vendor.service';
import { handleError } from './modules/shared/helpers/error-handler';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  currentComponent: string;
  user: User;
  headerSubscription: any;
  isVendor: boolean;
  userName: string;
  userEmail: string;
  available: boolean;
  profile: any;
  isMenuOpen: boolean;

  constructor(
    private componentService: ComponentService,
    private accountService: AccountService,
    private router: Router,
    private vendorService: VendorService,
    private toasterService: ToastrService
  ) {
    this.currentComponent = '';
    this.isVendor = true;
    this.userName = '';
    this.userEmail = '';
    this.available = false;
    this.isMenuOpen = false;
  }

  ngOnInit() {
    this.accountService.user.subscribe((x) => {
      this.user = x;
      //console.log(this.user);
      if (this.user && this.user.user.roles === 'vendor') {
        this.isVendor = true;
        this.getVendorById(this.user.user.vendorId);
      }
    });

    this.componentService.currentComponent.subscribe((componentName) => {
      setTimeout(() => {
        this.currentComponent = componentName;
      }, 10);
    });

    this.getVendorById();
  }

  ngAfterViewInit() {
    var body = $('body');

    $('.sidebar .sidebar-body')
      .find('ul li')
      .parents('.sidebar-body ul li')
      .addClass('has-sub-item');

    /* Submenu Opened */
    $('.sidebar .sidebar-body')
      .find('.has-sub-item > a')
      .on('click', function (event) {
        event.preventDefault();
        if (
          !body.hasClass('sidebar-folded') ||
          body.hasClass('open-sidebar-folded')
        ) {
          $(this).parent('.has-sub-item').toggleClass('sub-menu-opened');
          if ($(this).siblings('ul').hasClass('open')) {
            $(this).siblings('ul').removeClass('open').slideUp('200');
          } else {
            $(this).siblings('ul').addClass('open').slideDown('200');
          }
        }
      });

    /* If has class sub-menu-opened */
    function preloadFunc() {
      if (
        $('.sidebar .sidebar-body')
          .find('.has-sub-item')
          .hasClass('sub-menu-opened')
      ) {
        $('.sidebar .sidebar-body')
          .find('.sub-menu-opened a')
          .siblings('ul')
          .addClass('open')
          .show();
      }
    }
    // window.onpaint = preloadFunc();

    /* Open Sidebar */
    $('.header .header-toogle-menu, .offcanvas-overlay').on(
      'click',
      function () {
        body.toggleClass('sidebar-open');
        $('.offcanvas-overlay').toggleClass('active');
        //body.find(".sidebar-body .has-sub-item a").siblings('ul').removeClass('open').slideUp('fast');
      }
    );

    /* Holded Sidebar on Mouseenter */
    $(window).resize(function () {
      sidebar();
    });

    /* Sidebar function */
    function sidebar() {
      if ($(window).width() > 1023) {
        /* Remove siderbar-open */
        if (body.is('.sidebar-open')) {
          body.removeClass('sidebar-open');
        }

        /* Holded Sidebar on Mouseenter */
        $('.sidebar .sidebar-body').on('mouseenter', function () {
          body.addClass('open-sidebar-folded');
        });

        /* Holded Sidebar on Mouseleave */
        $('.sidebar .sidebar-body').on('mouseleave', function () {
          body.removeClass('open-sidebar-folded');
          if (body.hasClass('sidebar-folded')) {
            $('.sidebar')
              .find('.sidebar-body .has-sub-item a')
              .siblings('ul')
              .removeClass('open')
              .slideUp(0);
          }
        });

        /* Holded Sidebar */
        $('.sidebar .sidebar-toogle-pin').on('click', function () {
          body.toggleClass('sidebar-folded');
          body
            .find('.sidebar-body .has-sub-item a')
            .siblings('ul')
            .removeClass('open')
            .slideUp('fast');
        });
      } else {
        /* Remove sidebar-folded & open-sidebar-folded */
        if (body.is('.sidebar-folded, .open-sidebar-folded')) {
          body.removeClass('sidebar-folded open-sidebar-folded');
        }
      }
    }
    sidebar();
  }

  navigateToDashboard() {
    if (this.isVendor) {
      this.router.navigate(['/', 'vendor-dashboard']);
    } else {
      this.router.navigate(['/', 'home']);
    }
  }

  logOut() {
    this.accountService.logout();
  }

  navUserDetail() {
    const vendorId = this.accountService.getUserId();
    this.router.navigate(['/', 'vendor', 'detail', vendorId]);
  }

  // To update the availability of the vendor
  updateAvailability() {
    const payload = {
      status: this.available ? 'Active' : 'INActive',
      vendorId: this.accountService.getUserId(),
    };

    this.vendorService.updateVendorStatus(payload).subscribe(
      (result) => {
        this.toasterService.success('Status updated successfully', 'Success');
        this.getVendorById();
      },
      (err) => {
        if (err.status !== 200) {
          this.toasterService.error(handleError(err));
        } else {
          this.toasterService.success('Status updated successfully', 'Success');
          this.getVendorById();
        }
      }
    );
  }

  // To get vendor based on id
  getVendorById(id = '') {
    let vendorId = this.accountService.getUserId();
    vendorId = vendorId ? vendorId : id;
    if (vendorId) {
      this.vendorService.getVendorByID(vendorId).subscribe(
        (result: any) => {
          this.profile = result;
          if (result) {
            this.available = result.status === 'Active';
            this.userEmail = result.email_Id ? result.email_Id : '';
            this.userName = result.firstname ? result.firstname : '';
          }
        },
        (err) => {
          if (err.status !== 200) {
            this.toasterService.error(handleError(err));
          }
        }
      );
    }
  }
}
