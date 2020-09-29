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
  @Input() public userData: any[];

  fetchInProgress: Boolean = false;

  ngOnInit() {
  }

  fetchData() {
    if(this.season && this.matchday && this.userId) {
      this.fetchInProgress = true;
      this.data.fetchData(this.userId, this.season, this.matchday).subscribe(async(userData: any) => {
        this.data.getUserPlayers(this.userId, this.season, this.matchday).subscribe((players: any) => {
          //this.players = players;
          console.log('finished1')
          console.log(players)
        })
        console.log('finished2')
      })
      console.log('finished3')
    }
  }

}
