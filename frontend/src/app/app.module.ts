import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { ComstatsComponent } from './comstats/comstats.component';
import { ListComponent } from './comstats/list/list.component';
import { ListItemComponent } from './comstats/list-item/list-item.component';
import { MatTableModule, MatTabsModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { DataService } from './comstats/data.service';
import { MatchdaysComponent } from './comstats/matchdays/matchdays.component';
import { InfoComponent } from './comstats/info/info.component';
import { UsersComponent } from './comstats/users/users.component';

import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ComstatsComponent,
    ListComponent,
    ListItemComponent,
    MatchdaysComponent,
    InfoComponent,
    UsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatTableModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatMenuModule
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
