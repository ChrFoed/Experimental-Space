import { Component, OnInit, Input } from '@angular/core';
import { DataService } from './../data.service';


@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.less']
})
export class InfoComponent implements OnInit {

  constructor(private data: DataService) {}

  @Input() public season: string;
  @Input() public matchday: string;
  @Input() public userId: number;

  ngOnInit() {
  }

  fetchData() {
    console.log(this.season)
    console.log(this.matchday)
    console.log(this.userId)
    if(this.season && this.matchday && this.userId) {
      this.data.fetchData(this.userId, this.season, this.matchday).subscribe((matchday: any) => {
        console.log(this.matchday)
      })
    }
  }

}
