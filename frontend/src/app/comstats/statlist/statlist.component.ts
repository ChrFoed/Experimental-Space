import { Component, OnInit, Input } from '@angular/core';
import { DataService } from './../data.service';

export interface Players {
  Rank: number;
  User: string;
  name: string;
  pid: number;
  kader: Boolean;
  averagePoints: number;
  actualPoints: number;
  lastPoints: number;
  currentPoints: number;
  currentRating: number;
}


@Component({
  selector: 'app-statlist',
  templateUrl: './statlist.component.html',
  styleUrls: ['./statlist.component.less']
})
export class StatlistComponent implements OnInit {

  @Input() public season: string;
  @Input() public matchday: string;

  @Input() public players: Players[] = [];

  displayedColumns: string[] = ['Rank', 'User', 'name', 'kader', 'averagePoints', 'actualPoints', 'lastPoints', 'currentPoints', 'currentRating'];

  constructor(private data: DataService) {}


  ngOnInit() {
    this.data.getUsersPlayers(this.season, this.matchday).subscribe((players: any) => {
      this.players = players;
    })
  }

}
