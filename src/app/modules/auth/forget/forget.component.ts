import { Component, OnInit } from '@angular/core';

import { AccountService } from '../../shared/services/account.service'

@Component({
  selector: 'app-forget',
  templateUrl: './forget.component.html',
  styleUrls: ['./forget.component.scss']
})
export class ForgetComponent implements OnInit {

  constructor(private accountService : AccountService) { 
    this.accountService.setHeaderDisplayStatus(true);
  }

  ngOnInit(): void {
  }

}
