import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {


  API = 'http://localhost:4300/comstats';

  FETCHAPI = 'http://localhost:4400/crawler';


//comstats/players?uid=12280528&matchday=20&season=2020
  // Declare empty list of people
  matchInfo: any[] = [];

  matchDays: any[] = [];

  players: any[] = [];


  constructor(private http: HttpClient) {}

  getMatchDays() {
    return this.http.get<any>(`${this.API}/matchdays`);
  }

  getUsers() {
    return this.http.get<any>(`${this.API}/users`);
  }

  fetchData(uid, season, matchday) {
    console.log('here')
    return this.http.get<any>(`${this.FETCHAPI}/matchday?uid=${uid}&matchday=${matchday}&season=${season}&single=true`);
  }

  getPlayers(userid, season, matchday) {
    return this.http.get<any>(`${this.API}/players?uid=${userid}&matchday=${matchday}&season=${season}`);
  }
}
