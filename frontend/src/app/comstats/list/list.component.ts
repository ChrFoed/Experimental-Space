import { Component, OnInit, Input } from '@angular/core';
import { DataService } from './../data.service';

export interface Players {
  name: string;
  pid: number;
  kader: Boolean;
  averagePoints: number;
  actualPoints: number;
  lastPoints: number;
  currentPoints: number;
  currentRating: number;
}


/**
 * @title Basic use of `<table mat-table>`
 */

@Component({
  selector: 'app-list',
  styleUrls: ['./list.component.less'],
  templateUrl: './list.component.html',
})


export class ListComponent {

  @Input() public season: string;
  @Input() public matchday: string;
  @Input() public userId: number;

  @Input() public players: Players[] = [];

  playersNew: any[] = [];

  displayedColumns: string[] = ['name', 'kader', 'averagePoints', 'actualPoints', 'lastPoints', 'currentPoints', 'currentRating'];

  constructor(private data: DataService) {}


  ngOnInit() {
    this.data.getPlayers(this.userId, this.season, this.matchday).subscribe((players: any) => {
      this.players = players;
      console.log(this.players)
    })
  }
}
