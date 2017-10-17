//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;

/* Package-scope variables */
var GeoJSON;

var require = meteorInstall({"node_modules":{"meteor":{"geojson-utils":{"main.js":["./geojson-utils.js",function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/geojson-utils/main.js                                                                          //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
exports.GeoJSON = require("./geojson-utils.js");                                                           // 1
                                                                                                           // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"geojson-utils.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/geojson-utils/geojson-utils.js                                                                 //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
(function () {                                                                                             // 1
  var gju = {};                                                                                            // 2
                                                                                                           // 3
  // Export the geojson object for **CommonJS**                                                            // 4
  if (typeof module !== 'undefined' && module.exports) {                                                   // 5
    module.exports = gju;                                                                                  // 6
  }                                                                                                        // 7
                                                                                                           // 8
  // adapted from http://www.kevlindev.com/gui/math/intersection/Intersection.js                           // 9
  gju.lineStringsIntersect = function (l1, l2) {                                                           // 10
    var intersects = [];                                                                                   // 11
    for (var i = 0; i <= l1.coordinates.length - 2; ++i) {                                                 // 12
      for (var j = 0; j <= l2.coordinates.length - 2; ++j) {                                               // 13
        var a1 = {                                                                                         // 14
          x: l1.coordinates[i][1],                                                                         // 15
          y: l1.coordinates[i][0]                                                                          // 16
        },                                                                                                 // 17
          a2 = {                                                                                           // 18
            x: l1.coordinates[i + 1][1],                                                                   // 19
            y: l1.coordinates[i + 1][0]                                                                    // 20
          },                                                                                               // 21
          b1 = {                                                                                           // 22
            x: l2.coordinates[j][1],                                                                       // 23
            y: l2.coordinates[j][0]                                                                        // 24
          },                                                                                               // 25
          b2 = {                                                                                           // 26
            x: l2.coordinates[j + 1][1],                                                                   // 27
            y: l2.coordinates[j + 1][0]                                                                    // 28
          },                                                                                               // 29
          ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),                            // 30
          ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),                            // 31
          u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);                             // 32
        if (u_b != 0) {                                                                                    // 33
          var ua = ua_t / u_b,                                                                             // 34
            ub = ub_t / u_b;                                                                               // 35
          if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {                                                  // 36
            intersects.push({                                                                              // 37
              'type': 'Point',                                                                             // 38
              'coordinates': [a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)]                        // 39
            });                                                                                            // 40
          }                                                                                                // 41
        }                                                                                                  // 42
      }                                                                                                    // 43
    }                                                                                                      // 44
    if (intersects.length == 0) intersects = false;                                                        // 45
    return intersects;                                                                                     // 46
  }                                                                                                        // 47
                                                                                                           // 48
  // Bounding Box                                                                                          // 49
                                                                                                           // 50
  function boundingBoxAroundPolyCoords (coords) {                                                          // 51
    var xAll = [], yAll = []                                                                               // 52
                                                                                                           // 53
    for (var i = 0; i < coords[0].length; i++) {                                                           // 54
      xAll.push(coords[0][i][1])                                                                           // 55
      yAll.push(coords[0][i][0])                                                                           // 56
    }                                                                                                      // 57
                                                                                                           // 58
    xAll = xAll.sort(function (a,b) { return a - b })                                                      // 59
    yAll = yAll.sort(function (a,b) { return a - b })                                                      // 60
                                                                                                           // 61
    return [ [xAll[0], yAll[0]], [xAll[xAll.length - 1], yAll[yAll.length - 1]] ]                          // 62
  }                                                                                                        // 63
                                                                                                           // 64
  gju.pointInBoundingBox = function (point, bounds) {                                                      // 65
    return !(point.coordinates[1] < bounds[0][0] || point.coordinates[1] > bounds[1][0] || point.coordinates[0] < bounds[0][1] || point.coordinates[0] > bounds[1][1]) 
  }                                                                                                        // 67
                                                                                                           // 68
  // Point in Polygon                                                                                      // 69
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html#Listing the Vertices           // 70
                                                                                                           // 71
  function pnpoly (x,y,coords) {                                                                           // 72
    var vert = [ [0,0] ]                                                                                   // 73
                                                                                                           // 74
    for (var i = 0; i < coords.length; i++) {                                                              // 75
      for (var j = 0; j < coords[i].length; j++) {                                                         // 76
        vert.push(coords[i][j])                                                                            // 77
      }                                                                                                    // 78
      vert.push([0,0])                                                                                     // 79
    }                                                                                                      // 80
                                                                                                           // 81
    var inside = false                                                                                     // 82
    for (var i = 0, j = vert.length - 1; i < vert.length; j = i++) {                                       // 83
      if (((vert[i][0] > y) != (vert[j][0] > y)) && (x < (vert[j][1] - vert[i][1]) * (y - vert[i][0]) / (vert[j][0] - vert[i][0]) + vert[i][1])) inside = !inside
    }                                                                                                      // 85
                                                                                                           // 86
    return inside                                                                                          // 87
  }                                                                                                        // 88
                                                                                                           // 89
  gju.pointInPolygon = function (p, poly) {                                                                // 90
    var coords = (poly.type == "Polygon") ? [ poly.coordinates ] : poly.coordinates                        // 91
                                                                                                           // 92
    var insideBox = false                                                                                  // 93
    for (var i = 0; i < coords.length; i++) {                                                              // 94
      if (gju.pointInBoundingBox(p, boundingBoxAroundPolyCoords(coords[i]))) insideBox = true              // 95
    }                                                                                                      // 96
    if (!insideBox) return false                                                                           // 97
                                                                                                           // 98
    var insidePoly = false                                                                                 // 99
    for (var i = 0; i < coords.length; i++) {                                                              // 100
      if (pnpoly(p.coordinates[1], p.coordinates[0], coords[i])) insidePoly = true                         // 101
    }                                                                                                      // 102
                                                                                                           // 103
    return insidePoly                                                                                      // 104
  }                                                                                                        // 105
                                                                                                           // 106
  gju.numberToRadius = function (number) {                                                                 // 107
    return number * Math.PI / 180;                                                                         // 108
  }                                                                                                        // 109
                                                                                                           // 110
  gju.numberToDegree = function (number) {                                                                 // 111
    return number * 180 / Math.PI;                                                                         // 112
  }                                                                                                        // 113
                                                                                                           // 114
  // written with help from @tautologe                                                                     // 115
  gju.drawCircle = function (radiusInMeters, centerPoint, steps) {                                         // 116
    var center = [centerPoint.coordinates[1], centerPoint.coordinates[0]],                                 // 117
      dist = (radiusInMeters / 1000) / 6371,                                                               // 118
      // convert meters to radiant                                                                         // 119
      radCenter = [gju.numberToRadius(center[0]), gju.numberToRadius(center[1])],                          // 120
      steps = steps || 15,                                                                                 // 121
      // 15 sided circle                                                                                   // 122
      poly = [[center[0], center[1]]];                                                                     // 123
    for (var i = 0; i < steps; i++) {                                                                      // 124
      var brng = 2 * Math.PI * i / steps;                                                                  // 125
      var lat = Math.asin(Math.sin(radCenter[0]) * Math.cos(dist)                                          // 126
              + Math.cos(radCenter[0]) * Math.sin(dist) * Math.cos(brng));                                 // 127
      var lng = radCenter[1] + Math.atan2(Math.sin(brng) * Math.sin(dist) * Math.cos(radCenter[0]),        // 128
                                          Math.cos(dist) - Math.sin(radCenter[0]) * Math.sin(lat));        // 129
      poly[i] = [];                                                                                        // 130
      poly[i][1] = gju.numberToDegree(lat);                                                                // 131
      poly[i][0] = gju.numberToDegree(lng);                                                                // 132
    }                                                                                                      // 133
    return {                                                                                               // 134
      "type": "Polygon",                                                                                   // 135
      "coordinates": [poly]                                                                                // 136
    };                                                                                                     // 137
  }                                                                                                        // 138
                                                                                                           // 139
  // assumes rectangle starts at lower left point                                                          // 140
  gju.rectangleCentroid = function (rectangle) {                                                           // 141
    var bbox = rectangle.coordinates[0];                                                                   // 142
    var xmin = bbox[0][0],                                                                                 // 143
      ymin = bbox[0][1],                                                                                   // 144
      xmax = bbox[2][0],                                                                                   // 145
      ymax = bbox[2][1];                                                                                   // 146
    var xwidth = xmax - xmin;                                                                              // 147
    var ywidth = ymax - ymin;                                                                              // 148
    return {                                                                                               // 149
      'type': 'Point',                                                                                     // 150
      'coordinates': [xmin + xwidth / 2, ymin + ywidth / 2]                                                // 151
    };                                                                                                     // 152
  }                                                                                                        // 153
                                                                                                           // 154
  // from http://www.movable-type.co.uk/scripts/latlong.html                                               // 155
  gju.pointDistance = function (pt1, pt2) {                                                                // 156
    var lon1 = pt1.coordinates[0],                                                                         // 157
      lat1 = pt1.coordinates[1],                                                                           // 158
      lon2 = pt2.coordinates[0],                                                                           // 159
      lat2 = pt2.coordinates[1],                                                                           // 160
      dLat = gju.numberToRadius(lat2 - lat1),                                                              // 161
      dLon = gju.numberToRadius(lon2 - lon1),                                                              // 162
      a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(gju.numberToRadius(lat1))                             // 163
        * Math.cos(gju.numberToRadius(lat2)) * Math.pow(Math.sin(dLon / 2), 2),                            // 164
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));                                                  // 165
    // Earth radius is 6371 km                                                                             // 166
    return (6371 * c) * 1000; // returns meters                                                            // 167
  },                                                                                                       // 168
                                                                                                           // 169
  // checks if geometry lies entirely within a circle                                                      // 170
  // works with Point, LineString, Polygon                                                                 // 171
  gju.geometryWithinRadius = function (geometry, center, radius) {                                         // 172
    if (geometry.type == 'Point') {                                                                        // 173
      return gju.pointDistance(geometry, center) <= radius;                                                // 174
    } else if (geometry.type == 'LineString' || geometry.type == 'Polygon') {                              // 175
      var point = {};                                                                                      // 176
      var coordinates;                                                                                     // 177
      if (geometry.type == 'Polygon') {                                                                    // 178
        // it's enough to check the exterior ring of the Polygon                                           // 179
        coordinates = geometry.coordinates[0];                                                             // 180
      } else {                                                                                             // 181
        coordinates = geometry.coordinates;                                                                // 182
      }                                                                                                    // 183
      for (var i in coordinates) {                                                                         // 184
        point.coordinates = coordinates[i];                                                                // 185
        if (gju.pointDistance(point, center) > radius) {                                                   // 186
          return false;                                                                                    // 187
        }                                                                                                  // 188
      }                                                                                                    // 189
    }                                                                                                      // 190
    return true;                                                                                           // 191
  }                                                                                                        // 192
                                                                                                           // 193
  // adapted from http://paulbourke.net/geometry/polyarea/javascript.txt                                   // 194
  gju.area = function (polygon) {                                                                          // 195
    var area = 0;                                                                                          // 196
    // TODO: polygon holes at coordinates[1]                                                               // 197
    var points = polygon.coordinates[0];                                                                   // 198
    var j = points.length - 1;                                                                             // 199
    var p1, p2;                                                                                            // 200
                                                                                                           // 201
    for (var i = 0; i < points.length; j = i++) {                                                          // 202
      var p1 = {                                                                                           // 203
        x: points[i][1],                                                                                   // 204
        y: points[i][0]                                                                                    // 205
      };                                                                                                   // 206
      var p2 = {                                                                                           // 207
        x: points[j][1],                                                                                   // 208
        y: points[j][0]                                                                                    // 209
      };                                                                                                   // 210
      area += p1.x * p2.y;                                                                                 // 211
      area -= p1.y * p2.x;                                                                                 // 212
    }                                                                                                      // 213
                                                                                                           // 214
    area /= 2;                                                                                             // 215
    return area;                                                                                           // 216
  },                                                                                                       // 217
                                                                                                           // 218
  // adapted from http://paulbourke.net/geometry/polyarea/javascript.txt                                   // 219
  gju.centroid = function (polygon) {                                                                      // 220
    var f, x = 0,                                                                                          // 221
      y = 0;                                                                                               // 222
    // TODO: polygon holes at coordinates[1]                                                               // 223
    var points = polygon.coordinates[0];                                                                   // 224
    var j = points.length - 1;                                                                             // 225
    var p1, p2;                                                                                            // 226
                                                                                                           // 227
    for (var i = 0; i < points.length; j = i++) {                                                          // 228
      var p1 = {                                                                                           // 229
        x: points[i][1],                                                                                   // 230
        y: points[i][0]                                                                                    // 231
      };                                                                                                   // 232
      var p2 = {                                                                                           // 233
        x: points[j][1],                                                                                   // 234
        y: points[j][0]                                                                                    // 235
      };                                                                                                   // 236
      f = p1.x * p2.y - p2.x * p1.y;                                                                       // 237
      x += (p1.x + p2.x) * f;                                                                              // 238
      y += (p1.y + p2.y) * f;                                                                              // 239
    }                                                                                                      // 240
                                                                                                           // 241
    f = gju.area(polygon) * 6;                                                                             // 242
    return {                                                                                               // 243
      'type': 'Point',                                                                                     // 244
      'coordinates': [y / f, x / f]                                                                        // 245
    };                                                                                                     // 246
  },                                                                                                       // 247
                                                                                                           // 248
  gju.simplify = function (source, kink) { /* source[] array of geojson points */                          // 249
    /* kink	in metres, kinks above this depth kept  */                                                     // 250
    /* kink depth is the height of the triangle abc where a-b and b-c are two consecutive line segments */
    kink = kink || 20;                                                                                     // 252
    source = source.map(function (o) {                                                                     // 253
      return {                                                                                             // 254
        lng: o.coordinates[0],                                                                             // 255
        lat: o.coordinates[1]                                                                              // 256
      }                                                                                                    // 257
    });                                                                                                    // 258
                                                                                                           // 259
    var n_source, n_stack, n_dest, start, end, i, sig;                                                     // 260
    var dev_sqr, max_dev_sqr, band_sqr;                                                                    // 261
    var x12, y12, d12, x13, y13, d13, x23, y23, d23;                                                       // 262
    var F = (Math.PI / 180.0) * 0.5;                                                                       // 263
    var index = new Array(); /* aray of indexes of source points to include in the reduced line */         // 264
    var sig_start = new Array(); /* indices of start & end of working section */                           // 265
    var sig_end = new Array();                                                                             // 266
                                                                                                           // 267
    /* check for simple cases */                                                                           // 268
                                                                                                           // 269
    if (source.length < 3) return (source); /* one or two points */                                        // 270
                                                                                                           // 271
    /* more complex case. initialize stack */                                                              // 272
                                                                                                           // 273
    n_source = source.length;                                                                              // 274
    band_sqr = kink * 360.0 / (2.0 * Math.PI * 6378137.0); /* Now in degrees */                            // 275
    band_sqr *= band_sqr;                                                                                  // 276
    n_dest = 0;                                                                                            // 277
    sig_start[0] = 0;                                                                                      // 278
    sig_end[0] = n_source - 1;                                                                             // 279
    n_stack = 1;                                                                                           // 280
                                                                                                           // 281
    /* while the stack is not empty  ... */                                                                // 282
    while (n_stack > 0) {                                                                                  // 283
                                                                                                           // 284
      /* ... pop the top-most entries off the stacks */                                                    // 285
                                                                                                           // 286
      start = sig_start[n_stack - 1];                                                                      // 287
      end = sig_end[n_stack - 1];                                                                          // 288
      n_stack--;                                                                                           // 289
                                                                                                           // 290
      if ((end - start) > 1) { /* any intermediate points ? */                                             // 291
                                                                                                           // 292
        /* ... yes, so find most deviant intermediate point to                                             // 293
        either side of line joining start & end points */                                                  // 294
                                                                                                           // 295
        x12 = (source[end].lng() - source[start].lng());                                                   // 296
        y12 = (source[end].lat() - source[start].lat());                                                   // 297
        if (Math.abs(x12) > 180.0) x12 = 360.0 - Math.abs(x12);                                            // 298
        x12 *= Math.cos(F * (source[end].lat() + source[start].lat())); /* use avg lat to reduce lng */    // 299
        d12 = (x12 * x12) + (y12 * y12);                                                                   // 300
                                                                                                           // 301
        for (i = start + 1, sig = start, max_dev_sqr = -1.0; i < end; i++) {                               // 302
                                                                                                           // 303
          x13 = source[i].lng() - source[start].lng();                                                     // 304
          y13 = source[i].lat() - source[start].lat();                                                     // 305
          if (Math.abs(x13) > 180.0) x13 = 360.0 - Math.abs(x13);                                          // 306
          x13 *= Math.cos(F * (source[i].lat() + source[start].lat()));                                    // 307
          d13 = (x13 * x13) + (y13 * y13);                                                                 // 308
                                                                                                           // 309
          x23 = source[i].lng() - source[end].lng();                                                       // 310
          y23 = source[i].lat() - source[end].lat();                                                       // 311
          if (Math.abs(x23) > 180.0) x23 = 360.0 - Math.abs(x23);                                          // 312
          x23 *= Math.cos(F * (source[i].lat() + source[end].lat()));                                      // 313
          d23 = (x23 * x23) + (y23 * y23);                                                                 // 314
                                                                                                           // 315
          if (d13 >= (d12 + d23)) dev_sqr = d23;                                                           // 316
          else if (d23 >= (d12 + d13)) dev_sqr = d13;                                                      // 317
          else dev_sqr = (x13 * y12 - y13 * x12) * (x13 * y12 - y13 * x12) / d12; // solve triangle        // 318
          if (dev_sqr > max_dev_sqr) {                                                                     // 319
            sig = i;                                                                                       // 320
            max_dev_sqr = dev_sqr;                                                                         // 321
          }                                                                                                // 322
        }                                                                                                  // 323
                                                                                                           // 324
        if (max_dev_sqr < band_sqr) { /* is there a sig. intermediate point ? */                           // 325
          /* ... no, so transfer current start point */                                                    // 326
          index[n_dest] = start;                                                                           // 327
          n_dest++;                                                                                        // 328
        } else { /* ... yes, so push two sub-sections on stack for further processing */                   // 329
          n_stack++;                                                                                       // 330
          sig_start[n_stack - 1] = sig;                                                                    // 331
          sig_end[n_stack - 1] = end;                                                                      // 332
          n_stack++;                                                                                       // 333
          sig_start[n_stack - 1] = start;                                                                  // 334
          sig_end[n_stack - 1] = sig;                                                                      // 335
        }                                                                                                  // 336
      } else { /* ... no intermediate points, so transfer current start point */                           // 337
        index[n_dest] = start;                                                                             // 338
        n_dest++;                                                                                          // 339
      }                                                                                                    // 340
    }                                                                                                      // 341
                                                                                                           // 342
    /* transfer last point */                                                                              // 343
    index[n_dest] = n_source - 1;                                                                          // 344
    n_dest++;                                                                                              // 345
                                                                                                           // 346
    /* make return array */                                                                                // 347
    var r = new Array();                                                                                   // 348
    for (var i = 0; i < n_dest; i++)                                                                       // 349
      r.push(source[index[i]]);                                                                            // 350
                                                                                                           // 351
    return r.map(function (o) {                                                                            // 352
      return {                                                                                             // 353
        type: "Point",                                                                                     // 354
        coordinates: [o.lng, o.lat]                                                                        // 355
      }                                                                                                    // 356
    });                                                                                                    // 357
  }                                                                                                        // 358
                                                                                                           // 359
  // http://www.movable-type.co.uk/scripts/latlong.html#destPoint                                          // 360
  gju.destinationPoint = function (pt, brng, dist) {                                                       // 361
    dist = dist/6371;  // convert dist to angular distance in radians                                      // 362
    brng = gju.numberToRadius(brng);                                                                       // 363
                                                                                                           // 364
    var lat1 = gju.numberToRadius(pt.coordinates[0]);                                                      // 365
    var lon1 = gju.numberToRadius(pt.coordinates[1]);                                                      // 366
                                                                                                           // 367
    var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dist) +                                                  // 368
                          Math.cos(lat1)*Math.sin(dist)*Math.cos(brng) );                                  // 369
    var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(dist)*Math.cos(lat1),                             // 370
                                 Math.cos(dist)-Math.sin(lat1)*Math.sin(lat2));                            // 371
    lon2 = (lon2+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º                          // 372
                                                                                                           // 373
    return {                                                                                               // 374
      'type': 'Point',                                                                                     // 375
      'coordinates': [gju.numberToDegree(lat2), gju.numberToDegree(lon2)]                                  // 376
    };                                                                                                     // 377
  };                                                                                                       // 378
                                                                                                           // 379
})();                                                                                                      // 380
                                                                                                           // 381
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/geojson-utils/main.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['geojson-utils'] = exports, {
  GeoJSON: GeoJSON
});

})();
