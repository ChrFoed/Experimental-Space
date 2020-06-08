import { Component, OnInit, Input } from '@angular/core';
import { DataService } from './../data.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.less']
})
export class UsersComponent implements OnInit {

  constructor(private data: DataService) { }

  public users : Object[]= [];

  @Input() public season: string;
  @Input() public matchday: string;


  ngOnInit() {
    this.data.getUsers().subscribe((users: any) => {
      this.users = users;      
    })
  }

}
