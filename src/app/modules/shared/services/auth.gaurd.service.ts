import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGaurdService {
  constructor(private router: Router, private accountService: AccountService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const userObj = this.accountService.userValue;
    //console.log(userObj);

    if (userObj) {
      // authorised so return true
      if (state.url === '/home') {
        if (userObj.user.roles === 'vendor') {
          this.router.navigate(['/', 'vendor-dashboard']);
        }
      } else if (state.url === '/vendor-dashboard') {
        if (userObj.user.roles === 'admin') {
          this.router.navigate(['/', 'home']);
        }
      }
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
