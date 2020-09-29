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

  protected seedPoints: number = 10;

  protected maxSeedClass: numer = 5;

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
    return this.heigths[1] / this.maxSeedClass;
  }

  getHeight = (seedClass, maxheight) => {
    return this.getHeightSteep()
  }

  calculateHeights = () => {
    let self = this;
    let targets = this.features.filter(function(feature) { return feature.get('height') }).filter(function(feat) {
      return feat.get('height')['peak'] == true;
    })
    // let targets = this.features.filter(function(feature) { return feature.get('height')['peak'] == true })
    // console.log({targets})
    let iterations = 0
    while (this.features.filter(function(feature) { return feature.get('usage') != 'height' }).length > 0) {
      iterations = iterations + 1;
      if (iterations > 100) {
        console.log('hit')
        break;
      }
      for (let target of targets) {
        let bboxes = new GeometryOperator(new Feature({ geometry: fromExtent(buffer(target.getGeometry().getExtent(), 30)) }).getGeometry().getCoordinates()[0]).generateFeatures()
        for (let bbox of bboxes) {
          self.vSource.forEachFeatureInExtent(buffer(bbox.getGeometry().getExtent(), 30), function(tfeat) {
            console.log(target.get('height')['value'])
            console.log(tfeat.get('class'))
          })
        }
      }
    }
    //


    //   const orgFeatures = this.vectorGrid.getSource().getFeatures().filter(function(feat) {
    //     return feat.get('class') == seedClass;
    //   })
    //   if (seedClass > self.maxSeedClass) {
    //     break;
    //   }
    //   seedClass++;
    //   for (let ofeat of orgFeatures) {
    //
    //   }
  }

  getSeedCoordinates = () => {


  }

}





export default HeightCalculator;
