import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.less']
})
export class ListItemComponent implements OnInit {

  @Input() public player :Object = {};

  constructor() { }

  ngOnInit() {
    console.log(this.player)
  }

}
