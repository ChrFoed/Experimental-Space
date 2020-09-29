import { Component, OnInit, Input } from '@angular/core';
import TileGrid from 'ol/tilegrid/TileGrid';
import { transform } from 'ol/proj';
import { sample } from 'simple-statistics'

class Seeder {
  @Input() grid: TileGrid;
  @Input() coverage: number;
  @Input() seedPoints: number;

  protected skew: number = 0.5

  constructor(grid, coverage, seeds) {
    console.log({ seeds })
    this.grid = grid;
    this.coverage = coverage;
    this.seedPoints = seeds;
  }

  seed = () => {
    console.log('seed')
  }

  getProperties = () => {
    console.log({
      'grid': this.grid,
      'seeds': this.seedPoints,
      'coverage': this.coverage
    })
  }

  randomByDistributionfunction = (min = 0, max = 1, skew = 1) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = this.randomByDistributionfunction(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
  }


  // v is the number of times random is summed and should be over >= 1
  // return a random number between 0-1 exclusive
  randomG = (v) => {
    let r = 0;
    for (let i = v; i > 0; i--) {
      r += Math.random();
    }
    return r / v;
  }

  getSeedCoordinates = () => {
    const coordinates = [];
    for (let i = 0; i < this.seedPoints * 100; i++) {
      let pair = [];
      //get Lat
      pair.push((Math.floor(Math.random() * 360) + 1) - 180);
      //get Lon
      pair.push((Math.floor(this.randomG(1) * 180) + 1) - 90);
      //pair.push(this.randomByDistributionfunction(0, 180, (Math.random() > 0.5 ? 0.5 : this.skew))-90);
      coordinates.push(transform(pair, 'EPSG:4326', 'EPSG:3857'))
    }
    return sample(coordinates, this.seedPoints, (function() { return Math.random() }));
  }

}




export default Seeder;
