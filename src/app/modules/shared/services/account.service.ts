import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map, mapTo, tap } from 'rxjs/operators';
import { User } from './../models/user';
import { Tokens } from './../models/tokens';
import { environment } from '../../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;
  decodedToken: any;
  currentUser: string;
  private hideHeader: boolean;
  hideHeaderStatusChange: Subject<boolean> = new Subject<boolean>();
  jwtHelper = new JwtHelperService();
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    this.userSubject = new BehaviorSubject<User>(
      this.jwtHelper.decodeToken(localStorage.getItem(this.JWT_TOKEN))
    );
    this.user = this.userSubject.asObservable();
    this.hideHeader = false;
  }

  getHeaderDisplayStatus(): boolean {
    return this.hideHeader;
  }

  setHeaderDisplayStatus(isView: boolean) {
    this.hideHeader = isView;
    this.hideHeaderStatusChange.next(this.hideHeader);
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  private doLoginUser(tokens: Tokens) {
    this.storeTokens(tokens);
  }

  private storeTokens(tokens: Tokens) {
    localStorage.setItem(this.JWT_TOKEN, tokens.token);
    const decodedToken = this.jwtHelper.decodeToken(tokens.token);
    this.userSubject.next(decodedToken);
    const vendorId = decodedToken.user.vendorId;
    this.currentUser = decodedToken.user.firstname;
    localStorage.setItem('vendorId', vendorId);
  }

  getUserId() {
    return localStorage.getItem('vendorId');
  }

  login(email: string, password: string) {
    let cred = {
      email_Id: email,
      password: password,
    };

    return this.http.post<User>(`${environment.apiUrl}/cheflogin`, cred).pipe(
      tap((data: any) =>
        this.doLoginUser({ token: data.token, refreshToken: data.token })
      ),
      catchError((err) => this.handleError(err))
    );
  }

  logout() {
    // remove user from local storage and set current user to null
    this.currentUser = null;
    this.removeTokens();
    this.userSubject.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('vendorId');
  }

  private removeTokens() {
    localStorage.removeItem(this.JWT_TOKEN);
  }

  isLoggedIn() {
    return !!this.getJwtToken();
  }

  getJwtToken() {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  register(user: any, role: string) {
    // console.log(user);
    let newUser = {
      firstName: user.firstName,
      email_Id: user.email,
      mobileNumber: user.mobileNumber,
      password: user.password,
      zip: user.zip,
      state: user.state,
      city: user.city,
      roles: role,
      flatAddress: user.flatAddress,
      address: user.address,
      lat: user.lat,
      long: user.long,
      user_desc: user.desc
    };
    return this.http
      .post(`${environment.apiUrl}/chefSignUp`, newUser);
    // .pipe(catchError((err) => this.handleError(err)));
  }
  getcategory() {
    return this.http.get(`${environment.apiUrl}/allcategory`);
  }
  getcategorywithsubcategory() {
    return this.http.get(`${environment.apiUrl}/categorywithsubcategory`);
  }
  getsubcategory() {
    return this.http.get(`${environment.apiUrl}/allsubcategory`);
  }

  handleError(errorObj: HttpErrorResponse): Observable<any> {
    console.log(errorObj);
    let errorMsg: any;
    console.log(errorObj);
    if (typeof errorObj.error === 'string') {
      errorMsg = errorObj.error;
    } else if (typeof errorObj.error === 'object' && errorObj.error != null) {
      if ('errors' in errorObj.error) {
        errorMsg = errorObj.error.errors[0].message;
      } else {
        errorMsg = errorObj.error.name;
      }
    } else {
      errorMsg = errorObj.message;
    }
    this.toastr.error(errorMsg, 'Error');
    return throwError(errorMsg);
  }
  uploadtocloud(result) {
    let data = new FormData()
    let base64S = result
    console.log("base64S", base64S)
    data.append('file', `${base64S}`)
    data.append('upload_preset', "gafvc2am");
    // data.append("cloud_name", "scankar")
    data.append("api_key", "516923571449371");
    // data.append("resource_type", "image");
    console.log("data", data)



    const options = new HttpHeaders({
      'Content-Type': 'multipart/form-data'



    });
    let response = this.http.post('https://api.cloudinary.com/v1_1/scankar/auto/upload', data);
    console.log("response of upload", response)
    return response;
  }
}
