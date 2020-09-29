import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { transform, transformExtent } from 'ol/proj';
import BboxClip from '@turf/bbox-clip'
import Turf from 'turf/turf';
import Rewind from '@turf/rewind'
import Utilities from './utilities';
import { getGeom, getCoords } from '@turf/invariant';

class GeometryOperator {

  /*
  xmin: -PI * 6378137,
 ymin: -PI * 6378137,
 xmax:  PI * 6378137,
 ymax:  PI * 6378137
 */

  private maxBounds: number[] = [
    -Math.PI * 6378137,
    -Math.PI * 6378137,
    Math.PI * 6378137,
    Math.PI * 6378137
  ]

  protected coordinates: any[] = []
  protected features: Feature[] = []

  constructor(featureCoordinates) {
    this.coordinates = featureCoordinates;
  }

  boundsGenerator = (orientation) => {
    let bbox;
    let transformedBBox = transformExtent(this.maxBounds, 'EPSG:3857', 'EPSG:4326')
    switch (orientation) {
      case 'left':
        bbox = [transformedBBox[0] * 2, transformedBBox[1], transformedBBox[0], transformedBBox[3]]
        break;
      case 'right':
        bbox = [transformedBBox[3], transformedBBox[1], transformedBBox[2] * 2, transformedBBox[3]]
        break;
      case 'upper':
        bbox = [transformedBBox[0], transformedBBox[3], transformedBBox[2], transformedBBox[3] * 2]
        break;
      case 'lower':
        bbox = [transformedBBox[0], transformedBBox[1] * 2, transformedBBox[2], transformedBBox[1]]
        break;
      default:
        bbox = transformedBBox

    }
    return bbox.map(function(each_element) {
      return Number(each_element.toFixed(0));
    });
  }

  translateCoordinates = (orientation, coordinates) => {
    switch (orientation) {
      case 'left':
        coordinates.map(function(pair) {
          pair[0] = new Utilities().clampNumber(pair[0] + 360, -180, 180);
        })

        break;
      case 'right':
        coordinates.map(function(pair) {
          pair[0] = new Utilities().clampNumber(pair[0] - 360, -180, 180);
        })
        break;
      case 'upper':
        coordinates.map(function(pair) {
          pair[1] = new Utilities().clampNumber(pair[1] - 180, -90, 90);
        })
        break;
      case 'lower':
        coordinates.map(function(pair) {
          pair[1] = new Utilities().clampNumber(pair[1] + 180, -90, 90);
        })
        break;
    }
    return coordinates.map(function(each_element) {
      return [Number(each_element[0].toFixed(0)), Number(each_element[1].toFixed(0))];
    });
  }

  fitBounds = () => {
    let mBounds = this.maxBounds;
    this.coordinates.forEach(function(coord) {
      if (coord[0] < mBounds[0]) {
        coord[0] = mBounds[0];
      } else if (coord[0] > mBounds[2]) {
        coord[0] = mBounds[2];
      }
      if (coord[1] < mBounds[1]) {
        coord[1] = mBounds[1];
      } else if (coord[1] > mBounds[3]) {
        coord[1] = mBounds[3];
      }
    });
    return [this.coordinates];
  }

  checkBounds = () => {
    let mBounds = this.maxBounds;
    let valid = true;
    this.coordinates.forEach(function(coord) {
      if (coord[0] < mBounds[0] || coord[0] > mBounds[2]) {
        valid = false;
      }
      if (coord[1] < mBounds[1] || coord[1] > mBounds[3]) {
        valid = false;
      }
    });
    return valid;
  }

  transformCoordinates = (from, to, coordinates) => {
    let transformedCoordinates = [];
    coordinates.forEach(function(coord) {
      transformedCoordinates.push(transform(coord, from, to))
    })
    return transformedCoordinates;
  }

  translateGeometries = (orientation, feature) => {
    switch (orientation) {
      case 'left':
        feature.getGeometry().translate(this.maxBounds[2]*2,0)
        break;
      case 'right':
        feature.getGeometry().translate(this.maxBounds[0]*2, 0)
        break;
      case 'upper':
        feature.getGeometry().translate(0, this.maxBounds[1]*2)
        break;
      case 'lower':
        feature.getGeometry().translate(0, this.maxBounds[3]*2)
        break;
    }
    return feature;
  }

  generateFeatures = () => {
    let features = []
    if (this.checkBounds() == true) {
      return [new Feature({ geometry: new Polygon([this.coordinates]) })]
    }
    let clipped = {};
    let coordinates = this.transformCoordinates('EPSG:3857', 'EPSG:4326', this.coordinates);
    clipped['left'] = BboxClip(Turf.polygon([coordinates]), this.boundsGenerator('left'));
    clipped['right'] = BboxClip(Turf.polygon([coordinates]), this.boundsGenerator('right'));
    clipped['upper'] = BboxClip(Turf.polygon([coordinates]), this.boundsGenerator('upper'));
    clipped['lower'] = BboxClip(Turf.polygon([coordinates]), this.boundsGenerator('lower'));
    clipped['middle'] = BboxClip(Turf.polygon([coordinates]), this.boundsGenerator('middle'));
    for (let [key, value] of Object.entries(clipped)) {
      let geometry = value['geometry'];
      let fcoords = geometry['coordinates']
      if (fcoords.length > 0) {
        features.push(this.translateGeometries(key, new Feature({ geometry: new Polygon([this.transformCoordinates('EPSG:4326', 'EPSG:3857', fcoords[0])]) })))
      }
    }
    return features;
  }

  wrapCoords = () => {
    let mBounds = this.maxBounds;
    this.coordinates.forEach(function(coord) {
      if (coord[0] < mBounds[0]) {
        coord[0] = coord[0] + mBounds[2];
      } else if (coord[0] > mBounds[2]) {
        coord[0] = coord[0] + mBounds[0];
      }
      if (coord[1] < mBounds[1]) {
        coord[1] = coord[1] + mBounds[3];
      } else if (coord[1] > mBounds[3]) {
        coord[1] = coord[1] + mBounds[1];
      }
    });
    return [this.coordinates];
  }
}


export default GeometryOperator;
