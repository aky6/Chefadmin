import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AccountService } from '../../shared/services/account.service';
import { VendorService } from '../../shared/services/vendor.service';
import { handleError } from '../../shared/helpers/error-handler';
import {} from 'googlemaps';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, AfterViewInit {
  submitted: boolean;
  signUpForm: FormGroup;
  allStates: any;
  @ViewChild('deliveryLocation') deliveryInput: ElementRef | any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private accountService: AccountService,
    private vendorService: VendorService
  ) {
    this.signUpForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      userName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      state: [''],
      zip: [''],
      city: [''],
      flatAddress: ['',Validators.required],
      address: ['', [Validators.required]],
      mobileNumber: [''],
      lat: ['', Validators.required],
      long: ['', Validators.required],
      desc: [''],
    });
    this.accountService.setHeaderDisplayStatus(true);
    this.allStates = [];
    this.submitted = false;
  }

  ngOnInit(): void {
    this.vendorService.getAllStateDetails().subscribe(
      (result: any) => {
        if (result && result.length) {
          this.allStates = [...result];
        }
      },
      (err) => {
        this.toastr.error(handleError(err));
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
      this.signUpForm.patchValue({
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

      this.signUpForm.patchValue({
        address: place.formatted_address,
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
    return this.signUpForm.controls;
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
        this.signUpForm.patchValue({
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

  onSubmit() {
    if (this.signUpForm.invalid) {
      Object.keys(this.signUpForm.controls).forEach((key) => {
        this.signUpForm.get(key)?.markAsTouched();
      });
    } else if (
      this.formControl.password!.value !=
      this.formControl.confirmPassword!.value
    ) {
      this.formControl.confirmPassword!.setErrors({ incorrect: true });
    } else {
      this.accountService.register(this.signUpForm.value, 'Vendor').subscribe(
        (response: any) => {
          this.toastr.success('Registration successful', 'Success!');
          this.router.navigateByUrl('/auth');
        },
        (err) => {
          if (err.status === 200) {
            this.toastr.success('Registration successful', 'Success!');
            this.router.navigateByUrl('/auth');
          }
          handleError(err);
        }
      );
    }
  }
}
