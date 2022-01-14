import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class HttpInterceptorService {
  public jwtHelper = new JwtHelperService();
  public token: string;

  constructor(private accountService: AccountService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.token = this.accountService.getJwtToken();
    // console.log('Token : ' + JSON.stringify(this.token));
    // add content-type
    req = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.token,
      },
    });

    return next.handle(req);
  }
}
