import { Component, OnInit } from '@angular/core';

//import Map from 'ol/Map';
import Map from 'ol/Map';
import View from 'ol/View';
import Polygon from 'ol/geom/Polygon';
import Feature from 'ol/Feature';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import * as olCoordinate from 'ol/coordinate';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Graticule from 'ol/layer/Graticule';
import TileGrid from 'ol/tilegrid/TileGrid';
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import TileDebug from 'ol/source/TileDebug';
import LinearRing from 'ol/geom/LinearRing';
import { fromExtent } from 'ol/geom/Polygon';
import Style from 'ol/style/Style';
import Seeder from '../classes/seeder'
import Jstshelper from '../classes/jstshelper';
import Utilities from '../classes/utilities';
import HeightCalculator from '../classes/height-calculator';
import GeometryOperator from '../classes/geometry-operator';
import { buffer, getCenter, boundingExtent } from 'ol/extent';
import OLCesium from 'ol-cesium';




// import BaseRaster from '../classes/raster';

@Component({
  selector: 'app-basemap',
  templateUrl: './basemap.component.html',
  styleUrls: ['./basemap.component.less']
})
export class BasemapComponent implements OnInit {

  private map: Map;

  protected zoom: number = 6;

  protected seedPoints: number = 5;

  protected maxSeedClass: number = 5;

  protected sizes: number[] = [30, 30];

  protected tileSizes: number[] = [256, 256];

  protected heights: number[] = [-5000, 10000];

  protected vectorGrid = new VectorLayer({
    source: new VectorSource({ useSpatialIndex: true, wrapX: false })
  });

  protected vectorGridHelper = new VectorLayer({
    source: new VectorSource({ useSpatialIndex: true, wrapX: false })
  });

  protected vectorDebugger = new VectorLayer({
    source: new VectorSource({ useSpatialIndex: true, wrapX: false })
  });

  protected tileGrid = TileGrid;

  private amountOfTiles: number = 0;

  protected maxGrowRate: number = 50;
  protected currentGrowRate: number = 0;
  protected testCount: number = 0;

  constructor() {
    (<any>window).Cesium = OLCesium;
    this.tileGrid = new TileGrid({
      extent: new OSM({}).getTileGrid().getExtent(),
      minZoom: new OSM({}).getTileGrid().getMinZoom(),
      origin: new OSM({}).getTileGrid().getOrigin(),
      resolutions: new OSM({}).getTileGrid().getResolutions(),
      sizes: this.sizes,
      tileSize: this.tileSizes
    })

  }

  ngOnInit() {

    this.vectorGrid.setStyle(this.getStyle());
    this.vectorDebugger.setStyle(this.debugStyle());
    this.map = new Map({
      target: 'basemap',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        }),
        this.vectorGrid,
        //this.vectorGridHelper,
        //this.vectorDebugger
      ],
      view: new View({
        center: [0, 0],
        zoom: 0,
        multiWorld: false,
        showFullExtent: true,
      })
    });
    this.map.getView().setZoom(0)

    this.createVectorLayer(this.tileGrid, this.zoom);
    this.createLandMass();
    this.createOceans();
    this.calculateTerrain();
  }


  calculateTerrain = () => {
    const heightCalculator = new HeightCalculator(this.vectorGrid.getSource(), this.seedPoints, this.maxSeedClass, this.heights)
    heightCalculator.seedPeaks();
    heightCalculator.seedSinks();
    heightCalculator.calculateHeights();
  }

  createVectorLayer = (tileGrid, zoom) => {
    let self = this;
    let features = [];
    let seed = 0
    tileGrid.forEachTileCoord(tileGrid.getExtent(), Math.round(zoom), (function(tile) {
      let poly = fromExtent(tileGrid.getTileCoordExtent(tile))
      let polygonFeature = new Feature({ 'geometry': poly, 'usage': false, 'seedNumber': seed++ });
      features.push(polygonFeature);
    }));
    this.vectorGrid.getSource().addFeatures(features);
    this.vectorGrid.getSource().on('changefeature', function(feat) {
      self.currentGrowRate++;
    })
    this.amountOfTiles = this.vectorGrid.getSource().getFeatures().length;
    this.maxGrowRate = Math.round(this.amofeatureuntOfTiles * 0.6)
  }

  createOceans = () => {
    this.vectorGrid.getSource().forEachFeature(function(feat) {
      if (feat.get('usage') == false) {
        feat.set('usage', 'water', true)
      }
    })
  }


  createLandMass = () => {
    let self = this;
    const landSeeder = new Seeder(this.tileGrid, 60, this.seedPoints);
    const geomHelper = new Jstshelper();
    const utilities = new Utilities();
    let coordinates = landSeeder.getSeedCoordinates()
    for (let coordinate of coordinates) {
      let feature = this.vectorGrid.getSource().getFeaturesAtCoordinate(coordinate)[0];
      if (!feature) {
        continue;
      }
      feature.set('usage', 'origin', true)
      feature.set('class', 1, true)
      let afeatures = this.calculateHelperAxis(feature.clone(), landSeeder)
      let bfeatures = this.calculateHelperAxis(feature.clone(), landSeeder)
      this.vectorGridHelper.getSource().addFeatures([...afeatures, ...bfeatures])
      this.vectorGridHelper.getSource().forEachFeature(function(feature) {
        self.vectorGrid.getSource().forEachFeatureInExtent(feature.getGeometry().getExtent(), function(cellFeature) {
          if (feature.getGeometry().intersectsCoordinate(getCenter(cellFeature.getGeometry().getExtent()))) {
            cellFeature.set('usage', 'origin', true)
            cellFeature.set('class', 1, true)
          }
        });
      });
    }
    let seedClass = 1
    console.log('....startseedingprocess')
    while (this.maxGrowRate > this.currentGrowRate) {
      // console.log(`Max Grow Rate: ${this.maxGrowRate}`)
      // console.log(`Current Grow Rate: ${this.currentGrowRate}`)
      const orgFeatures = this.vectorGrid.getSource().getFeatures().filter(function(feat) {
        return feat.get('class') == seedClass;
      })
      if (seedClass > self.maxSeedClass) {
        break;
      }
      seedClass++;
      for (let ofeat of orgFeatures) {
        let self = this;
        let bgeometry = buffer(ofeat.getGeometry().getExtent(), 30)
        let nFeatures = this.vectorGrid.getSource().getFeaturesInExtent(bgeometry);
        let iterFeat = [ofeat]
        if (nFeatures.length < 9) {
          let a = new Feature({ geometry: fromExtent(bgeometry) });
          iterFeat = new GeometryOperator(new Feature({ geometry: fromExtent(bgeometry) }).getGeometry().getCoordinates()[0]).generateFeatures()
        }
        for (let ifeat of iterFeat) {
          this.vectorGrid.getSource().forEachFeatureInExtent(buffer(ifeat.getGeometry().getExtent(), 30), function(bfeat) {
            if (bfeat == ifeat) {
              //console.log(`feature ${bfeat.get('usage')} exist`)
            }
            //else if (bfeat.get('usage') != 'origin' && bfeat.get('usage') != 'land' && bfeat.get('used') != true) {
            else if (bfeat.get('usage') != 'origin' && bfeat.get('usage') != 'land' && bfeat.get('used') != true) {
              //console.log(`Current Probability ${utilities.clampNumber((1 - seedClass / 10), 0, 1)}`);
              if (Math.random() < utilities.clampNumber((1 - seedClass / 20), 0, 1)) {
                self.currentGrowRate++;
                bfeat.set('usage', 'land', false)
                bfeat.set('class', seedClass, true)
              } else {
                bfeat.set('used', true, true)
                bfeat.set('usage', 'water', true)
              }
            }
          })
        }
      }
    }
  }


  calculateHelperAxis = (feature, seeder) => {
    feature.getGeometry().scale(seeder.randomByDistributionfunction(1, this.amountOfTiles * 0.33 / (this.seedPoints * 4) / 20, 1), seeder.randomByDistributionfunction(this.amountOfTiles * 0.33 / (this.seedPoints * 4) / 20, this.amountOfTiles * 0.33 / this.seedPoints / 10, 1));
    console.log(feature.getGeometry().getExtent())
    feature.getGeometry().rotate((Math.random() * Math.PI * 2) * 100, [seeder.randomByDistributionfunction(feature.getGeometry().getExtent()[0], feature.getGeometry().getExtent()[2]), seeder.randomByDistributionfunction(feature.getGeometry().getExtent()[1], feature.getGeometry().getExtent()[3])]);
    return new GeometryOperator(feature.getGeometry().getCoordinates()[0]).generateFeatures()
  }


  debugStyle = () => {
    return function styleFunction(feature, resolution) {
      let style = new Style({
        stroke: new Stroke({
          color: '#E74C3C',
          width: 1,
        }),
        fill: new Fill({
          color: '#F9E79F'
        })
      })
      return style;
    }
  }

  heightStyle = () => {
    return function styleFunction(feature, resolution) {
      let value = target.get('height')['value'] ? target.get('height')['value'] : -1000;
      let colors = ['#dcfffc', '#c5e3be', '#e3ff00', '#ffcc78', '#fff8eb']
      let style = new Style({
        stroke: new Stroke({
          color: '#E74C3C',
          width: 0,
        }),
        fill: new Fill({
          color: '#F9E79F'
        })
      })
      return style;
    }
  }

  getStyle = () => {
    return function styleFunction(feature, resolution) {
      const landArray = ['darkred', '86592d', '#800000', '#A52A2A', '#A0522D', '#8B4513', '#D2691E', '#CD853F', '#DAA520', '#F4A460', '#D2B48C']
      // get the incomeLevel from the feature properties
      let style;
      switch (feature.get('usage')) {
        case false:
          style = new Style({
            stroke: new Stroke({
              color: '#319FD3',
              width: 1,
            })
          })
          break;
        case 'water':
          style = new Style({
            stroke: new Stroke({
              color: '#319FD3',
              width: 1,
            }),
            fill: new Fill({
              color: 'blue'
            })
          })
          break;
        case 'debug':
          style = new Style({
            stroke: new Stroke({
              color: '#319FD3',
              width: 1,
            }),
            fill: new Fill({
              color: 'yellow'
            })
          })
          break;
        case 'peak':
          style = new Style({
            stroke: new Stroke({
              color: 'red',
              width: 1,
            }),
            fill: new Fill({
              color: 'grey'
            })
          })
          break;
        case 'sink':
          style = new Style({
            stroke: new Stroke({
              color: 'red',
              width: 1,
            }),
            fill: new Fill({
              color: 'grey'
            })
          })
          break;
        case 'land':
          style = new Style({
            stroke: new Stroke({
              color: '#319FD3',
              width: 1,
            }),
            fill: new Fill({
              color: landArray[feature.get('class')] ? landArray[feature.get('class')] : 'white'
            })
          })
          break;
        case 'origin':
          style = new Style({
            stroke: new Stroke({
              color: '#319FD3',
              width: 1,
            }),
            fill: new Fill({
              color: 'black'
            })
          })
          break;
        default:
          style = new Style({
            stroke: new Stroke({
              color: '#319FD3',
              width: 1,
            }),
            fill: new Fill({
              color: 'white'
            })
          })
      }
      return style;
    }

  }

}
