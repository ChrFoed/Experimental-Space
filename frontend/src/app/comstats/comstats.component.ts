import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-comstats',
  templateUrl: './comstats.component.html',
  styleUrls: ['./comstats.component.less']
})
export class ComstatsComponent implements OnInit {

  // Declare empty list of people
  matchInfo: any[] = [];

  matchDays: any[] = [];

  constructor(private data: DataService) { }

  // Angular 2 Life Cycle event when component has been initialized
  ngOnInit() {
    this.data.getMatchDays().subscribe((matchdays: any) => {
      this.matchDays = matchdays;
      console.log(this.matchDays)
    })
  }
}
