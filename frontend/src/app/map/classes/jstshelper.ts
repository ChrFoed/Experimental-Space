import { Component, OnInit, Input } from '@angular/core';
import { io } from 'jsts';
import { algorithm } from 'jsts';
import {
  LineString,
  LinearRing,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
  GeometryCollection
} from 'ol/geom';
//var parser = new jsts.io.OL3Parser();

class Jstshelper {
  protected accuracy: number = 0;
  protected parser  = new io.OL3Parser();

  constructor() {
    this.parser.inject(
      Point,
      LineString,
      LinearRing,
      Polygon,
      MultiPoint,
      MultiLineString,
      MultiPolygon,
      GeometryCollection
    );
  }

  mergeFeatures = (afeat, bfeat) => {
    let target = this.parser.read(afeat.getGeometry());
    afeat.setGeometry(this.parser.write(target.union(this.parser.read(bfeat.getGeometry()))))
    return afeat;
  }

  checkIntersection(point, area) {
    console.log(point);
    console.log(area);
  }

}

export default Jstshelper;
