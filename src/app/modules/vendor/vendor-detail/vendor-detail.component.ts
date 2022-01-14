import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ignoreElements } from 'rxjs/operators';
import { handleError } from '../../shared/helpers/error-handler';
import { User } from '../../shared/models/user';
import { AccountService } from '../../shared/services/account.service';
import { ComponentService } from '../../shared/services/component.service';
import { VendorService } from '../../shared/services/vendor.service';
import {} from 'googlemaps';

class ImageSnippet {
  constructor(public src: string, public file: File) {}
}

export interface Menu {
  id: number;
  itemname: string;
  imgUrl: string;
  price: string;
  description: string;
}

export interface Profile {
  name: string;
  role: string;
  email: string;
  mobile: string;
  flatAddress: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  description: string;
}

export interface MenuPage {
  currPageNo: number;
  TotalItems: number;
  itemsPerPage: number;
}

@Component({
  selector: 'app-vendor-detail',
  templateUrl: './vendor-detail.component.html',
  styleUrls: ['./vendor-detail.component.scss'],
})
export class VendorDetailComponent implements OnInit, AfterViewInit {
  displayMenu: boolean;
  displayAbout: boolean;
  displayHistory: boolean;
  profile: any;
  menus: Menu[];
  vendorId: string;
  form: FormGroup;
  isVendor: boolean;
  user: User;
  vendorImgUrl: string;
  selectedFile: ImageSnippet;
  menuPageDetail: MenuPage;
  allStates: any;
  placeId: string;
  mapEmbedUrl: string;

  @ViewChild('closeModal') closeModal: ElementRef;
  @ViewChild('deliveryLocation') deliveryInput: ElementRef | any;

  constructor(
    private componentService: ComponentService,
    private router: Router,
    private vendorService: VendorService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private toasterService: ToastrService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private hostElement: ElementRef
  ) {
    this.displayMenu = false;
    this.displayAbout = true;
    this.isVendor = true;

    this.menus = [];
    this.vendorId = '';
    this.placeId = '';
    this.mapEmbedUrl = '';

    this.form = this.fb.group({
      firstname: ['', []],
      mobileNumber: ['', []],
      email: ['', []],
      user_desc: ['', []],
      Address: ['', []],
      flatAddress:[''],
      city: ['', []],
      image: ['', []],
      zip: [''],
      state: [''],
      lat: ['', Validators.required],
      long: ['', Validators.required],
    });

    this.menuPageDetail = {
      currPageNo: 1,
      TotalItems: 0,
      itemsPerPage: 12,
    };

    this.vendorImgUrl = 'assets/images/img-placeholder.png';
    this.allStates = [];
  }

  ngOnInit(): void {
    this.componentService.updateComponent('vendor');
    this.accountService.user.subscribe((x) => {
      this.user = x;
      if (this.user && this.user.user.roles === 'vendor') {
        this.isVendor = true;
      }
    });
    if (!this.isVendor) {
      this.vendorId = this.route.snapshot.paramMap.get('id');
    } else {
      this.vendorId = this.accountService.getUserId();
    }
    if (this.vendorId) {
      this.getVendorById();
    }
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

  ngAfterViewInit() {
    const options = {
      componentRestrictions: { country: 'IN' },
      fields: [
        'address_component',
        'formatted_address',
        'place_id',
        'geometry',
      ],
      radius: 8000,
      strictBounds: true,
      types: ['establishment'],
    } as google.maps.places.AutocompleteOptions;
    console.log(this.deliveryInput);
    const mapAutoComplete = new google.maps.places.Autocomplete(
      this.deliveryInput.nativeElement,
      options
    );

    mapAutoComplete.setFields(['address_component']);
    mapAutoComplete.addListener('place_changed', () => {
      const place = mapAutoComplete?.getPlace();
      console.log(place);
      console.log(place.geometry.location.toJSON());
      const position = place.geometry.location.toJSON();
      this.form.patchValue({
        lat: position.lat,
        long: position.lng,
      });
      this.formatMapData(place);
    });
  }

  // Get each component of the address from the place details,
  // and then fill-in the corresponding field on the form.
  formatMapData(place: any) {
    if (place && place.address_components) {
      let address = '';
      let city = '';
      let state = '';
      let pinCode = '';

      for (const component of place.address_components) {
        const addressType = component.types;
        console.log(addressType);
        if (
          addressType.indexOf('sublocality_level_2') !== -1 ||
          addressType.indexOf('sublocality_level_1') !== -1
        ) {
          address = address
            ? address + ', ' + component.long_name
            : component.long_name;
        } else if (addressType.indexOf('locality') !== -1) {
          city = component.long_name;
        } else if (addressType.indexOf('administrative_area_level_1') !== -1) {
          state = component.long_name;
        } else if (addressType.indexOf('postal_code') !== -1) {
          pinCode = component.long_name;
        }
      }

      this.form.patchValue({
        Address: place.formatted_address,
        city: city,
        state: this.retriveState(state),
        zip: pinCode,
      });
    }
  }

  //map state with the selected text
  retriveState(str: string) {
    const selectedState = this.allStates.filter((state) =>
      state.toLowerCase().includes(str.toLowerCase())
    );
    return selectedState[0];
  }

  get formControl() {
    return this.form.controls;
  }

  // To get current location
  getCurrentLocation() {
    const geocoder = new google.maps.Geocoder();
    let currentLocation: { lat; lng };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.form.patchValue({
          lat: currentLocation.lat,
          long: currentLocation.lng,
        });

        geocoder.geocode(
          { location: currentLocation },
          (
            results: google.maps.GeocoderResult[],
            status: google.maps.GeocoderStatus
          ) => {
            if (status === 'OK') {
              if (results[0]) {
                this.formatMapData(results[0]);
              } else {
                console.log('No results found');
              }
            } else {
              console.log('Geocoder failed due to: ' + status);
            }
          }
        );
      });
    }
  }

  // To get map place id
  getMapPlaceId() {
    const geocoder = new google.maps.Geocoder();

    const latitude = this.profile.lat;
    const longitude = this.profile.long;
    var latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

    geocoder.geocode({ location: latlng }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          this.placeId = results[0];
          this.mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAmIwWfWjDgzrIDhMmj21Xjn_DBxLmoC8w&q=${this.placeId.formatted_address}`;
          const iframe = document.querySelector('iframe');
          console.log(this.mapEmbedUrl);
          iframe.src = this.mapEmbedUrl;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

  // transform to secure url
  sanitizeUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.mapEmbedUrl);
  }

  toggleMenu() {
    this.displayMenu = true;
    this.displayAbout = false;
    this.getVendorMenuItems();
  }

  toggleAbout() {
    this.displayMenu = false;
    this.displayAbout = true;
  }

  navigateToDetails(id: any) {
    this.router.navigate(['/', 'vendor', 'product', id]);
  }

  loadPrevPage() {
    if (this.menuPageDetail.currPageNo > 1) {
      this.menuPageDetail.currPageNo -= 1;
      this.getVendorMenuItems();
    }
    return false;
  }

  loadNextPage() {
    if (
      this.menuPageDetail.currPageNo <
      Math.ceil(
        this.menuPageDetail.TotalItems / this.menuPageDetail.itemsPerPage
      )
    ) {
      this.menuPageDetail.currPageNo += 1;
      this.getVendorMenuItems();
    }
    return false;
  }

  getVendorMenuItems() {
    this.menus = [];
    if (this.isVendor) {
      this.vendorService.getVendorItems().subscribe((response: any) => {
        for (let item of response) {
          let currItem: Menu = {
            id: item.itemId,
            itemname: item.itemname,
            imgUrl: item.imagePath,
            price: item.price,
            description: item.itemname,
          };
          this.menus.push(currItem);
        }
      });
    } else {
      this.vendorService
        .getVendorItemsForAdmin(this.vendorId, this.menuPageDetail.currPageNo)
        .subscribe((response: any) => {
          this.menuPageDetail.TotalItems = response.count;
          this.menus = [];
          for (let item of response.rows) {
            let currItem: Menu = {
              id: item.itemId,
              itemname: item.itemname,
              imgUrl: item.imagePath,
              price: item.price,
              description: item.itemname,
            };
            this.menus.push(currItem);
          }
        });
    }
  }

  getVendorById() {
    this.vendorService.getVendorByID(this.vendorId).subscribe(
      (result) => {
        // console.log(result);
        this.profile = result;
        this.getMapPlaceId();
      },
      (err) => {
        if (err.status !== 200) {
          this.toasterService.error(handleError(err));
        }
      }
    );
  }

  // To edit the vendor
  editVendor() {
    this.form.reset();
    this.vendorService.getVendorByID(this.vendorId).subscribe(
      (result) => {
        this.profile = result;

        if (this.profile) {
          this.form.patchValue({
            image: this.profile.imagePath,
            firstname: this.profile.firstname,
            email: this.profile.email_Id,
            user_desc: this.profile.user_desc,
            flatAddress: this.profile.flatAddress,
            Address: this.profile.Address,
            city: this.profile.city,
            mobileNumber: this.profile.mobileNumber,
            zip: this.profile.zip,
            state: this.profile.state,
          });

          this.vendorImgUrl = this.profile.imagePath;
        }
      },
      (err) => {
        if (err.status !== 200) {
          this.toasterService.error(handleError(err));
        }
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

  // To update the vendor profile image
  updateProfile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new ImageSnippet(event.target.result, file);
      let vendorId = '';
      if (this.isVendor) {
        vendorId = this.accountService.getUserId();
      } else {
        vendorId = this.route.snapshot.paramMap.get('id');
      }
      const payload = {
        image: this.selectedFile.file,
        vendorId: vendorId,
      };

      this.vendorService.updateVendorProfileImage(payload).subscribe(
        (result) => {
          this.form.reset();
          this.vendorImgUrl = 'assets/images/img-placeholder.png';
          this.getVendorById();
          this.toasterService.success(
            'Profile updated successfully',
            'Success'
          );
        },
        (err) => {
          if (err.status === 200) {
            this.toasterService.success(
              'Profile updated successfully',
              'Success'
            );
            this.vendorImgUrl = 'assets/images/img-placeholder.png';
            this.getVendorById();
          } else {
            this.toasterService.error(handleError(err), 'Error');
          }
        }
      );
    });

    reader.readAsDataURL(file);
  }

  updateVendor() {
    let vendorId = '';
    if (this.isVendor) {
      vendorId = this.accountService.getUserId();
    } else {
      vendorId = this.route.snapshot.paramMap.get('id');
    }

    const payload = this.form.value;
    payload['vendorId'] = vendorId;
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
        this.getVendorById();
        this.closeModal.nativeElement.click();
      },
      (err) => {
        if (err.status === 200) {
          this.toasterService.success('Updated successfully', 'Success');
          this.form.reset();
          this.vendorImgUrl = 'assets/images/img-placeholder.png';
          this.getVendorById();
          this.closeModal.nativeElement.click();
        } else {
          this.toasterService.error(handleError(err), 'Error');
        }
      }
    );
  }
}
