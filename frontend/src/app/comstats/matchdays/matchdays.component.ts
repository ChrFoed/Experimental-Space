import {Component, OnInit, Input} from '@angular/core';

/**
 * @title Tab group where the tab content is loaded lazily (when activated)
 */
@Component({
  selector: 'app-matchdays',
  templateUrl: 'matchdays.component.html',
  styleUrls: ['matchdays.component.less'],
})
export class MatchdaysComponent {
  tabLoadTimes: Date[] = [];

  @Input() public matchDays : Object[]= [];


  ngOnInit() {}

  getTimeLoaded(index: number) {
    console.log(this.matchDays)
    if (!this.tabLoadTimes[index]) {
      this.tabLoadTimes[index] = new Date();
    }

    return this.tabLoadTimes[index];
  }
}
