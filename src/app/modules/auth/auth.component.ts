import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AccountService } from '../shared/services/account.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  uname: string | null;
  pwd: string | null;
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: '',
    });
    this.uname = localStorage.getItem('username');
    this.pwd = localStorage.getItem('password');
    if (this.uname && this.pwd) {
      this.loginForm.patchValue({
        email: this.uname,
        password: this.pwd,
      });
    }
    this.accountService.setHeaderDisplayStatus(true);
  }

  ngOnInit(): void {}

  get formControl() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    } else {
      this.accountService
        .login(
          this.formControl.email.value || this.uname,
          this.formControl.password.value || this.pwd
        )
        .subscribe((response: any) => {
          if (this.formControl.rememberMe.value) {
            localStorage.setItem('username', this.formControl.email.value);
            localStorage.setItem('password', this.formControl.password.value);
          }

          this.accountService.user.subscribe((x) => {
            if (x) {
              if (x.user.roles === 'vendor') {
                this.router.navigate(['/', 'vendor-dashboard']);
              } else {
                this.router.navigate(['/', 'home']);
              }
            } else {
              this.router.navigate(['/', 'vendor-dashboard']);
            }
          });
        });
    }
  }
}
