import { Component, OnInit } from '@angular/core';

//import Map from 'ol/Map';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import { fromExtent } from 'ol/geom/Polygon';
import { buffer, getCenter, boundingExtent } from 'ol/extent';
import { sample } from 'simple-statistics'
import Utilities from '../classes/utilities';
import GeometryOperator from '../classes/geometry-operator';



export class HeightCalculator {

  protected seedPoints: number = 1;

  protected maxSeedClass: number = 10;

  protected vSource: VectorSource;

  protected features: Feature[] = [];

  protected targets: number;

  protected heights: number[];

  constructor(source, seedPoints, seedClass, heights) {
    this.vSource = source;
    this.features = source.getFeatures();
    this.targets = seedPoints;
    this.maxSeedClass = seedClass;
    this.heights = heights;
  }

  seedPeaks = () => {
    let self = this;
    sample(this.features.filter(function(feature) { return feature.get('usage') == 'origin' }), this.seedPoints, (function() { return Math.random() })).forEach(function(peak) {
      peak.set('height', { 'value': new Utilities().randBetween(self.heights[1] - (self.heights[1] * 0.1), self.heights[1] + (self.heights[1] * 0.1)), 'peak': true }, false)
    })
  }

  seedSinks = () => {
    sample(this.features.filter(function(feature) { return feature.get('usage') == 'water' }), this.seedPoints, (function() { return Math.random() })).forEach(function(peak) {
      peak.set('height', 'sink', false);
    })
  }

  getHeightSteep = () => {
    return this.heights[1] / this.maxSeedClass;
  }

  getHeight = (seedClass, maxheight) => {
    return this.getHeightSteep()
  }

  getCurrentHeightInterval = (seedClass, value) => {
    return {
      'max': (this.heights[1] / this.maxSeedClass) * (this.maxSeedClass - seedClass - 1),
      'min': (this.heights[1] / this.maxSeedClass) * (this.maxSeedClass - seedClass)
    }
  }

  calculateHeights = () => {
    let self = this;
    let targets = this.features.filter(function(feature) { return feature.get('height') }).filter(function(feat) {
      return feat.get('height')['peak'] == true;
    })
    // let targets = this.features.filter(function(feature) { return feature.get('height')['peak'] == true })
    // console.log({targets})
    let iterations = 0
    let counter = 0
    const util = new Utilities()
    while (this.features.filter(function(feature) { return feature.get('height') == undefined }).length > 0) {
      iterations = iterations + 1;
      let tempTargets = []
      if (iterations > 1) {
        console.log('hit')
        break;
      }
      console.log(`Current targets; ${targets.length} in iteration: ${iterations}`)
      for (let target of targets) {
        let bboxes = new GeometryOperator(new Feature({ geometry: fromExtent(buffer(target.getGeometry().getExtent(), 30)) }).getGeometry().getCoordinates()[0]).generateFeatures()
        for (let bbox of bboxes) {
          self.vSource.forEachFeatureInExtent(buffer(bbox.getGeometry().getExtent(), 30), function(tfeat) {
            if (tfeat.get('height') == undefined) {
              let borders = self.getCurrentHeightInterval(tfeat.get('class'), target.get('height')['value'])
              tfeat.set('height', { 'value': util.randBetween(borders['min'], target.get('height')['value']), 'peak': false }, false)
              tempTargets.push(tfeat);
            }
          })
        }
      }
      targets = [];
      console.log(`Current temptargets; ${tempTargets.length} in iteration: ${iterations}`)
      targets = tempTargets;
    }
  }

  getSeedCoordinates = () => {


  }

}





export default HeightCalculator;
