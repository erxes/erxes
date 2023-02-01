(function(){
    var w3cColors = {
      aliceblue: '#f0f8ff',
      antiquewhite: '#faebd7',
      aqua: '#00ffff',
      aquamarine: '#7fffd4',
      azure: '#f0ffff',
      beige: '#f5f5dc',
      bisque: '#ffe4c4',
      black: '#000000',
      blanchedalmond: '#ffebcd',
      blue: '#0000ff',
      blueviolet: '#8a2be2',
      brown: '#a52a2a',
      burlywood: '#deb887',
      cadetblue: '#5f9ea0',
      chartreuse: '#7fff00',
      chocolate: '#d2691e',
      coral: '#ff7f50',
      cornflowerblue: '#6495ed',
      cornsilk: '#fff8dc',
      crimson: '#dc143c',
      cyan: '#00ffff',
      darkblue: '#00008b',
      darkcyan: '#008b8b',
      darkgoldenrod: '#b8860b',
      darkgray: '#a9a9a9',
      darkgrey: '#a9a9a9',
      darkgreen: '#006400',
      darkkhaki: '#bdb76b',
      darkmagenta: '#8b008b',
      darkolivegreen: '#556b2f',
      darkorange: '#ff8c00',
      darkorchid: '#9932cc',
      darkred: '#8b0000',
      darksalmon: '#e9967a',
      darkseagreen: '#8fbc8f',
      darkslateblue: '#483d8b',
      darkslategray: '#2f4f4f',
      darkslategrey: '#2f4f4f',
      darkturquoise: '#00ced1',
      darkviolet: '#9400d3',
      deeppink: '#ff1493',
      deepskyblue: '#00bfff',
      dimgray: '#696969',
      dimgrey: '#696969',
      dodgerblue: '#1e90ff',
      firebrick: '#b22222',
      floralwhite: '#fffaf0',
      forestgreen: '#228b22',
      fuchsia: '#ff00ff',
      gainsboro: '#dcdcdc',
      ghostwhite: '#f8f8ff',
      gold: '#ffd700',
      goldenrod: '#daa520',
      gray: '#808080',
      grey: '#808080',
      green: '#008000',
      greenyellow: '#adff2f',
      honeydew: '#f0fff0',
      hotpink: '#ff69b4',
      indianred: '#cd5c5c',
      indigo: '#4b0082',
      ivory: '#fffff0',
      khaki: '#f0e68c',
      lavender: '#e6e6fa',
      lavenderblush: '#fff0f5',
      lawngreen: '#7cfc00',
      lemonchiffon: '#fffacd',
      lightblue: '#add8e6',
      lightcoral: '#f08080',
      lightcyan: '#e0ffff',
      lightgoldenrodyellow: '#fafad2',
      lightgray: '#d3d3d3',
      lightgrey: '#d3d3d3',
      lightgreen: '#90ee90',
      lightpink: '#ffb6c1',
      lightsalmon: '#ffa07a',
      lightseagreen: '#20b2aa',
      lightskyblue: '#87cefa',
      lightslategray: '#778899',
      lightslategrey: '#778899',
      lightsteelblue: '#b0c4de',
      lightyellow: '#ffffe0',
      lime: '#00ff00',
      limegreen: '#32cd32',
      linen: '#faf0e6',
      magenta: '#ff00ff',
      maroon: '#800000',
      mediumaquamarine: '#66cdaa',
      mediumblue: '#0000cd',
      mediumorchid: '#ba55d3',
      mediumpurple: '#9370db',
      mediumseagreen: '#3cb371',
      mediumslateblue: '#7b68ee',
      mediumspringgreen: '#00fa9a',
      mediumturquoise: '#48d1cc',
      mediumvioletred: '#c71585',
      midnightblue: '#191970',
      mintcream: '#f5fffa',
      mistyrose: '#ffe4e1',
      moccasin: '#ffe4b5',
      navajowhite: '#ffdead',
      navy: '#000080',
      oldlace: '#fdf5e6',
      olive: '#808000',
      olivedrab: '#6b8e23',
      orange: '#ffa500',
      orangered: '#ff4500',
      orchid: '#da70d6',
      palegoldenrod: '#eee8aa',
      palegreen: '#98fb98',
      paleturquoise: '#afeeee',
      palevioletred: '#db7093',
      papayawhip: '#ffefd5',
      peachpuff: '#ffdab9',
      peru: '#cd853f',
      pink: '#ffc0cb',
      plum: '#dda0dd',
      powderblue: '#b0e0e6',
      purple: '#800080',
      rebeccapurple: '#663399',
      red: '#ff0000',
      rosybrown: '#bc8f8f',
      royalblue: '#4169e1',
      saddlebrown: '#8b4513',
      salmon: '#fa8072',
      sandybrown: '#f4a460',
      seagreen: '#2e8b57',
      seashell: '#fff5ee',
      sienna: '#a0522d',
      silver: '#c0c0c0',
      skyblue: '#87ceeb',
      slateblue: '#6a5acd',
      slategray: '#708090',
      slategrey: '#708090',
      snow: '#fffafa',
      springgreen: '#00ff7f',
      steelblue: '#4682b4',
      tan: '#d2b48c',
      teal: '#008080',
      thistle: '#d8bfd8',
      tomato: '#ff6347',
      turquoise: '#40e0d0',
      violet: '#ee82ee',
      wheat: '#f5deb3',
      white: '#ffffff',
      whitesmoke: '#f5f5f5',
      yellow: '#ffff00',
      yellowgreen: '#9acd32'
    };
    
    function hue2rgb(p, q, t) {
      if (t<0) t += 1;
      if (t>1) t -= 1;
      if (t<1/6) return p + (q - p)*6*t;
      if (t<1/2) return q;
      if (t<2/3) return p + (q - p)*(2/3 - t)*6;
      return p;
    }
    
    function clamp(v, max) {
      if (v === undefined) {
        return;
      }
      return Math.min(max, Math.max(0, v || 0));
    }

    function hexToRgbA(hex){
      var c;
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
          c= hex.substring(1).split('');
          if(c.length== 3){
              c= [c[0], c[0], c[1], c[1], c[2], c[2]];
          }
          c= '0x'+c.join('');
          return [(c>>16)&255, (c>>8)&255, c&255, 0.8];
      }
      throw new Error('Bad Hex');
  }
    
    //*****************************************************************************
    
    /**
     * @param str, object can be in any of these: 'red', '#0099ff', 'rgb(64, 128, 255)', 'rgba(64, 128, 255, 0.5)', { r:0.2, g:0.3, b:0.9, a:1 }
     */
    var Qolor = function(r, g, b, a) {
      this.r = clamp(r, 1);
      this.g = clamp(g, 1);
      this.b = clamp(b, 1);
      this.a = clamp(a, 1) || 1;
    };
    
    /**
     * @param str, object can be in any of these: 'red', '#0099ff', 'rgb(64, 128, 255)', 'rgba(64, 128, 255, 0.5)'
     */
    Qolor.parse = function(str) {
      if (typeof str === 'string') {
        str = str.toLowerCase();
        str = w3cColors[str] || str;

        var m;
    
        if ((m = str.match(/^#?(\w{2})(\w{2})(\w{2})$/))) {
          return new Qolor(parseInt(m[1], 16)/255, parseInt(m[2], 16)/255, parseInt(m[3], 16)/255);
        }
    
        if ((m = str.match(/^#?(\w)(\w)(\w)$/))) {
          return new Qolor(parseInt(m[1]+m[1], 16)/255, parseInt(m[2]+m[2], 16)/255, parseInt(m[3]+m[3], 16)/255);
        }
    
        if ((m = str.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)(\D+([\d.]+))?\)/))) {
          return new Qolor(
            parseFloat(m[1])/255,
            parseFloat(m[2])/255,
            parseFloat(m[3])/255,
            m[4] ? parseFloat(m[5]) : 1
          );
        }
      }
    
      return new Qolor();
    };
    
    Qolor.fromHSL = function(h, s, l, a) {
      var qolor = new Qolor().fromHSL(h, s, l);
      qolor.a = a === undefined ? 1 : a;
      return qolor;
    };
    
    //*****************************************************************************
    
    Qolor.prototype = {
    
      isValid: function() {
        return this.r !== undefined && this.g !== undefined && this.b !== undefined;
      },
    
      toHSL: function() {
        if (!this.isValid()) {
          return;
        }
    
        var
          max = Math.max(this.r, this.g, this.b),
          min = Math.min(this.r, this.g, this.b),
          h, s, l = (max + min)/2,
          d = max - min;
    
        if (!d) {
          h = s = 0; // achromatic
        } else {
          s = l>0.5 ? d/(2 - max - min) : d/(max + min);
          switch (max) {
            case this.r:
              h = (this.g - this.b)/d + (this.g<this.b ? 6 : 0);
              break;
            case this.g:
              h = (this.b - this.r)/d + 2;
              break;
            case this.b:
              h = (this.r - this.g)/d + 4;
              break;
          }
          h *= 60;
        }
    
        return { h: h, s: s, l: l };
      },
    
      fromHSL: function(h, s, l) {
        // h = clamp(h, 360),
        // s = clamp(s, 1),
        // l = clamp(l, 1),
    
        // achromatic
        if (s === 0) {
          this.r = this.g = this.b = l;
          return this;
        }
    
        var
          q = l<0.5 ? l*(1 + s) : l + s - l*s,
          p = 2*l - q;
    
        h /= 360;
    
        this.r = hue2rgb(p, q, h + 1/3);
        this.g = hue2rgb(p, q, h);
        this.b = hue2rgb(p, q, h - 1/3);
    
        return this;
      },
    
      toString: function() {
        if (!this.isValid()) {
          return;
        }
    
        if (this.a === 1) {
          return '#' + ((1<<24) + (Math.round(this.r*255)<<16) + (Math.round(this.g*255)<<8) + Math.round(this.b*255)).toString(16).slice(1, 7);
        }
        return 'rgba(' + [Math.round(this.r*255), Math.round(this.g*255), Math.round(this.b*255), this.a.toFixed(2)].join(',') + ')';
      },
    
      toArray: function() {
        if (!this.isValid) {
          return;
        }
        
        return [this.r, this.g, this.b];
      },
    
      hue: function(h) {
        var hsl = this.toHSL();
        return this.fromHSL(hsl.h+h, hsl.s, hsl.l);
      },
    
      saturation: function(s) {
        var hsl = this.toHSL();
        return this.fromHSL(hsl.h, hsl.s*s, hsl.l);
      },
    
      lightness: function(l) {
        var hsl = this.toHSL();
        return this.fromHSL(hsl.h, hsl.s, hsl.l*l);
      },
    
      clone: function() {
        return new Qolor(this.r, this.g, this.b, this.a);
      }
    };
    
    /*
     (c) 2011-2015, Vladimir Agafonkin
     SunCalc is a JavaScript library for calculating sun position and light phases.
     https://github.com/mourner/suncalc
    */
    
    var suncalc = (function () {
      'use strict';
    
    // shortcuts for easier to read formulas
    
      var PI = Math.PI,
        sin = Math.sin,
        cos = Math.cos,
        tan = Math.tan,
        asin = Math.asin,
        atan = Math.atan2,
        rad = PI/180;
    
    // sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas
    
    
    // date/time constants and conversions
    
      var dayMs = 1000*60*60*24,
        J1970 = 2440588,
        J2000 = 2451545;
    
      function toJulian(date) {
        return date.valueOf()/dayMs - 0.5 + J1970;
      }
    
      function toDays(date) {
        return toJulian(date) - J2000;
      }
    
    
    // general calculations for position
    
      var e = rad*23.4397; // obliquity of the Earth
    
      function rightAscension(l, b) {
        return atan(sin(l)*cos(e) - tan(b)*sin(e), cos(l));
      }
    
      function declination(l, b) {
        return asin(sin(b)*cos(e) + cos(b)*sin(e)*sin(l));
      }
    
      function azimuth(H, phi, dec) {
        return atan(sin(H), cos(H)*sin(phi) - tan(dec)*cos(phi));
      }
    
      function altitude(H, phi, dec) {
        return asin(sin(phi)*sin(dec) + cos(phi)*cos(dec)*cos(H));
      }
    
      function siderealTime(d, lw) {
        return rad*(280.16 + 360.9856235*d) - lw;
      }
    
    
    // general sun calculations
    
      function solarMeanAnomaly(d) {
        return rad*(357.5291 + 0.98560028*d);
      }
    
      function eclipticLongitude(M) {
    
        var C = rad*(1.9148*sin(M) + 0.02*sin(2*M) + 0.0003*sin(3*M)), // equation of center
          P = rad*102.9372; // perihelion of the Earth
    
        return M + C + P + PI;
      }
    
      function sunCoords(d) {
    
        var M = solarMeanAnomaly(d),
          L = eclipticLongitude(M);
    
        return {
          dec: declination(L, 0),
          ra: rightAscension(L, 0)
        };
      }
    
    // calculates sun position for a given date and latitude/longitude
    
      return function(date, lat, lng) {
    
        var lw = rad* -lng,
          phi = rad*lat,
          d = toDays(date),
    
          c = sunCoords(d),
          H = siderealTime(d, lw) - c.ra;
    
        return {
          azimuth: azimuth(H, phi, c.dec),
          altitude: altitude(H, phi, c.dec)
        };
      };
    
    }());
    
    
    /******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId]) {
    /******/ 			return installedModules[moduleId].exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
    /******/ 			i: moduleId,
    /******/ 			l: false,
    /******/ 			exports: {}
    /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.l = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
    /******/ 		if(!__webpack_require__.o(exports, name)) {
    /******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
    /******/ 		}
    /******/ 	};
    /******/
    /******/ 	// define __esModule on exports
    /******/ 	__webpack_require__.r = function(exports) {
    /******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    /******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    /******/ 		}
    /******/ 		Object.defineProperty(exports, '__esModule', { value: true });
    /******/ 	};
    /******/
    /******/ 	// create a fake namespace object
    /******/ 	// mode & 1: value is a module id, require it
    /******/ 	// mode & 2: merge all properties of value into the ns
    /******/ 	// mode & 4: return value when already ns object
    /******/ 	// mode & 8|1: behave like require
    /******/ 	__webpack_require__.t = function(value, mode) {
    /******/ 		if(mode & 1) value = __webpack_require__(value);
    /******/ 		if(mode & 8) return value;
    /******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    /******/ 		var ns = Object.create(null);
    /******/ 		__webpack_require__.r(ns);
    /******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    /******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
    /******/ 		return ns;
    /******/ 	};
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function(module) {
    /******/ 		var getter = module && module.__esModule ?
    /******/ 			function getDefault() { return module['default']; } :
    /******/ 			function getModuleExports() { return module; };
    /******/ 		__webpack_require__.d(getter, 'a', getter);
    /******/ 		return getter;
    /******/ 	};
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";
    /******/
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = "./src/icons/triangulateSVG.js");
    /******/ })
    /************************************************************************/
    /******/ ({
    
    /***/ "./node_modules/abs-svg-path/index.js":
    /*!********************************************!*\
      !*** ./node_modules/abs-svg-path/index.js ***!
      \********************************************/
    /*! no static exports found */
    /***/ (function(module, exports) {
    
    eval("\nmodule.exports = absolutize\n\n/**\n * redefine `path` with absolute coordinates\n *\n * @param {Array} path\n * @return {Array}\n */\n\nfunction absolutize(path){\n\tvar startX = 0\n\tvar startY = 0\n\tvar x = 0\n\tvar y = 0\n\n\treturn path.map(function(seg){\n\t\tseg = seg.slice()\n\t\tvar type = seg[0]\n\t\tvar command = type.toUpperCase()\n\n\t\t// is relative\n\t\tif (type != command) {\n\t\t\tseg[0] = command\n\t\t\tswitch (type) {\n\t\t\t\tcase 'a':\n\t\t\t\t\tseg[6] += x\n\t\t\t\t\tseg[7] += y\n\t\t\t\t\tbreak\n\t\t\t\tcase 'v':\n\t\t\t\t\tseg[1] += y\n\t\t\t\t\tbreak\n\t\t\t\tcase 'h':\n\t\t\t\t\tseg[1] += x\n\t\t\t\t\tbreak\n\t\t\t\tdefault:\n\t\t\t\t\tfor (var i = 1; i < seg.length;) {\n\t\t\t\t\t\tseg[i++] += x\n\t\t\t\t\t\tseg[i++] += y\n\t\t\t\t\t}\n\t\t\t}\n\t\t}\n\n\t\t// update cursor state\n\t\tswitch (command) {\n\t\t\tcase 'Z':\n\t\t\t\tx = startX\n\t\t\t\ty = startY\n\t\t\t\tbreak\n\t\t\tcase 'H':\n\t\t\t\tx = seg[1]\n\t\t\t\tbreak\n\t\t\tcase 'V':\n\t\t\t\ty = seg[1]\n\t\t\t\tbreak\n\t\t\tcase 'M':\n\t\t\t\tx = startX = seg[1]\n\t\t\t\ty = startY = seg[2]\n\t\t\t\tbreak\n\t\t\tdefault:\n\t\t\t\tx = seg[seg.length - 2]\n\t\t\t\ty = seg[seg.length - 1]\n\t\t}\n\n\t\treturn seg\n\t})\n}\n\n\n//# sourceURL=webpack:///./node_modules/abs-svg-path/index.js?");
    
    /***/ }),
    
    /***/ "./node_modules/adaptive-bezier-curve/function.js":
    /*!********************************************************!*\
      !*** ./node_modules/adaptive-bezier-curve/function.js ***!
      \********************************************************/
    /*! no static exports found */
    /***/ (function(module, exports) {
    
    eval("function clone(point) { //TODO: use gl-vec2 for this\n    return [point[0], point[1]]\n}\n\nfunction vec2(x, y) {\n    return [x, y]\n}\n\nmodule.exports = function createBezierBuilder(opt) {\n    opt = opt||{}\n\n    var RECURSION_LIMIT = typeof opt.recursion === 'number' ? opt.recursion : 8\n    var FLT_EPSILON = typeof opt.epsilon === 'number' ? opt.epsilon : 1.19209290e-7\n    var PATH_DISTANCE_EPSILON = typeof opt.pathEpsilon === 'number' ? opt.pathEpsilon : 1.0\n\n    var curve_angle_tolerance_epsilon = typeof opt.angleEpsilon === 'number' ? opt.angleEpsilon : 0.01\n    var m_angle_tolerance = opt.angleTolerance || 0\n    var m_cusp_limit = opt.cuspLimit || 0\n\n    return function bezierCurve(start, c1, c2, end, scale, points) {\n        if (!points)\n            points = []\n\n        scale = typeof scale === 'number' ? scale : 1.0\n        var distanceTolerance = PATH_DISTANCE_EPSILON / scale\n        distanceTolerance *= distanceTolerance\n        begin(start, c1, c2, end, points, distanceTolerance)\n        return points\n    }\n\n\n    ////// Based on:\n    ////// https://github.com/pelson/antigrain/blob/master/agg-2.4/src/agg_curves.cpp\n\n    function begin(start, c1, c2, end, points, distanceTolerance) {\n        points.push(clone(start))\n        var x1 = start[0],\n            y1 = start[1],\n            x2 = c1[0],\n            y2 = c1[1],\n            x3 = c2[0],\n            y3 = c2[1],\n            x4 = end[0],\n            y4 = end[1]\n        recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, 0)\n        points.push(clone(end))\n    }\n\n    function recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, level) {\n        if(level > RECURSION_LIMIT) \n            return\n\n        var pi = Math.PI\n\n        // Calculate all the mid-points of the line segments\n        //----------------------\n        var x12   = (x1 + x2) / 2\n        var y12   = (y1 + y2) / 2\n        var x23   = (x2 + x3) / 2\n        var y23   = (y2 + y3) / 2\n        var x34   = (x3 + x4) / 2\n        var y34   = (y3 + y4) / 2\n        var x123  = (x12 + x23) / 2\n        var y123  = (y12 + y23) / 2\n        var x234  = (x23 + x34) / 2\n        var y234  = (y23 + y34) / 2\n        var x1234 = (x123 + x234) / 2\n        var y1234 = (y123 + y234) / 2\n\n        if(level > 0) { // Enforce subdivision first time\n            // Try to approximate the full cubic curve by a single straight line\n            //------------------\n            var dx = x4-x1\n            var dy = y4-y1\n\n            var d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx)\n            var d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx)\n\n            var da1, da2\n\n            if(d2 > FLT_EPSILON && d3 > FLT_EPSILON) {\n                // Regular care\n                //-----------------\n                if((d2 + d3)*(d2 + d3) <= distanceTolerance * (dx*dx + dy*dy)) {\n                    // If the curvature doesn't exceed the distanceTolerance value\n                    // we tend to finish subdivisions.\n                    //----------------------\n                    if(m_angle_tolerance < curve_angle_tolerance_epsilon) {\n                        points.push(vec2(x1234, y1234))\n                        return\n                    }\n\n                    // Angle & Cusp Condition\n                    //----------------------\n                    var a23 = Math.atan2(y3 - y2, x3 - x2)\n                    da1 = Math.abs(a23 - Math.atan2(y2 - y1, x2 - x1))\n                    da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - a23)\n                    if(da1 >= pi) da1 = 2*pi - da1\n                    if(da2 >= pi) da2 = 2*pi - da2\n\n                    if(da1 + da2 < m_angle_tolerance) {\n                        // Finally we can stop the recursion\n                        //----------------------\n                        points.push(vec2(x1234, y1234))\n                        return\n                    }\n\n                    if(m_cusp_limit !== 0.0) {\n                        if(da1 > m_cusp_limit) {\n                            points.push(vec2(x2, y2))\n                            return\n                        }\n\n                        if(da2 > m_cusp_limit) {\n                            points.push(vec2(x3, y3))\n                            return\n                        }\n                    }\n                }\n            }\n            else {\n                if(d2 > FLT_EPSILON) {\n                    // p1,p3,p4 are collinear, p2 is considerable\n                    //----------------------\n                    if(d2 * d2 <= distanceTolerance * (dx*dx + dy*dy)) {\n                        if(m_angle_tolerance < curve_angle_tolerance_epsilon) {\n                            points.push(vec2(x1234, y1234))\n                            return\n                        }\n\n                        // Angle Condition\n                        //----------------------\n                        da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1))\n                        if(da1 >= pi) da1 = 2*pi - da1\n\n                        if(da1 < m_angle_tolerance) {\n                            points.push(vec2(x2, y2))\n                            points.push(vec2(x3, y3))\n                            return\n                        }\n\n                        if(m_cusp_limit !== 0.0) {\n                            if(da1 > m_cusp_limit) {\n                                points.push(vec2(x2, y2))\n                                return\n                            }\n                        }\n                    }\n                }\n                else if(d3 > FLT_EPSILON) {\n                    // p1,p2,p4 are collinear, p3 is considerable\n                    //----------------------\n                    if(d3 * d3 <= distanceTolerance * (dx*dx + dy*dy)) {\n                        if(m_angle_tolerance < curve_angle_tolerance_epsilon) {\n                            points.push(vec2(x1234, y1234))\n                            return\n                        }\n\n                        // Angle Condition\n                        //----------------------\n                        da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2))\n                        if(da1 >= pi) da1 = 2*pi - da1\n\n                        if(da1 < m_angle_tolerance) {\n                            points.push(vec2(x2, y2))\n                            points.push(vec2(x3, y3))\n                            return\n                        }\n\n                        if(m_cusp_limit !== 0.0) {\n                            if(da1 > m_cusp_limit)\n                            {\n                                points.push(vec2(x3, y3))\n                                return\n                            }\n                        }\n                    }\n                }\n                else {\n                    // Collinear case\n                    //-----------------\n                    dx = x1234 - (x1 + x4) / 2\n                    dy = y1234 - (y1 + y4) / 2\n                    if(dx*dx + dy*dy <= distanceTolerance) {\n                        points.push(vec2(x1234, y1234))\n                        return\n                    }\n                }\n            }\n        }\n\n        // Continue subdivision\n        //----------------------\n        recursive(x1, y1, x12, y12, x123, y123, x1234, y1234, points, distanceTolerance, level + 1) \n        recursive(x1234, y1234, x234, y234, x34, y34, x4, y4, points, distanceTolerance, level + 1) \n    }\n}\n\n\n//# sourceURL=webpack:///./node_modules/adaptive-bezier-curve/function.js?");
    
    /***/ }),
    
    /***/ "./node_modules/adaptive-bezier-curve/index.js":
    /*!*****************************************************!*\
      !*** ./node_modules/adaptive-bezier-curve/index.js ***!
      \*****************************************************/
    /*! no static exports found */
    /***/ (function(module, exports, __webpack_require__) {
    
    eval("module.exports = __webpack_require__(/*! ./function */ \"./node_modules/adaptive-bezier-curve/function.js\")()\n\n//# sourceURL=webpack:///./node_modules/adaptive-bezier-curve/index.js?");
    
    /***/ }),
    
    /***/ "./node_modules/normalize-svg-path/index.js":
    /*!**************************************************!*\
      !*** ./node_modules/normalize-svg-path/index.js ***!
      \**************************************************/
    /*! no static exports found */
    /***/ (function(module, exports) {
    
    eval("\nvar PI = Math.PI\nvar _120 = radians(120)\n\nmodule.exports = normalize\n\n/**\n * describe `path` in terms of cubic bézier \n * curves and move commands\n *\n * @param {Array} path\n * @return {Array}\n */\n\nfunction normalize(path){\n\t// init state\n\tvar prev\n\tvar result = []\n\tvar bezierX = 0\n\tvar bezierY = 0\n\tvar startX = 0\n\tvar startY = 0\n\tvar quadX = null\n\tvar quadY = null\n\tvar x = 0\n\tvar y = 0\n\n\tfor (var i = 0, len = path.length; i < len; i++) {\n\t\tvar seg = path[i]\n\t\tvar command = seg[0]\n\t\tswitch (command) {\n\t\t\tcase 'M':\n\t\t\t\tstartX = seg[1]\n\t\t\t\tstartY = seg[2]\n\t\t\t\tbreak\n\t\t\tcase 'A':\n\t\t\t\tseg = arc(x, y,seg[1],seg[2],radians(seg[3]),seg[4],seg[5],seg[6],seg[7])\n\t\t\t\t// split multi part\n\t\t\t\tseg.unshift('C')\n\t\t\t\tif (seg.length > 7) {\n\t\t\t\t\tresult.push(seg.splice(0, 7))\n\t\t\t\t\tseg.unshift('C')\n\t\t\t\t}\n\t\t\t\tbreak\n\t\t\tcase 'S':\n\t\t\t\t// default control point\n\t\t\t\tvar cx = x\n\t\t\t\tvar cy = y\n\t\t\t\tif (prev == 'C' || prev == 'S') {\n\t\t\t\t\tcx += cx - bezierX // reflect the previous command's control\n\t\t\t\t\tcy += cy - bezierY // point relative to the current point\n\t\t\t\t}\n\t\t\t\tseg = ['C', cx, cy, seg[1], seg[2], seg[3], seg[4]]\n\t\t\t\tbreak\n\t\t\tcase 'T':\n\t\t\t\tif (prev == 'Q' || prev == 'T') {\n\t\t\t\t\tquadX = x * 2 - quadX // as with 'S' reflect previous control point\n\t\t\t\t\tquadY = y * 2 - quadY\n\t\t\t\t} else {\n\t\t\t\t\tquadX = x\n\t\t\t\t\tquadY = y\n\t\t\t\t}\n\t\t\t\tseg = quadratic(x, y, quadX, quadY, seg[1], seg[2])\n\t\t\t\tbreak\n\t\t\tcase 'Q':\n\t\t\t\tquadX = seg[1]\n\t\t\t\tquadY = seg[2]\n\t\t\t\tseg = quadratic(x, y, seg[1], seg[2], seg[3], seg[4])\n\t\t\t\tbreak\n\t\t\tcase 'L':\n\t\t\t\tseg = line(x, y, seg[1], seg[2])\n\t\t\t\tbreak\n\t\t\tcase 'H':\n\t\t\t\tseg = line(x, y, seg[1], y)\n\t\t\t\tbreak\n\t\t\tcase 'V':\n\t\t\t\tseg = line(x, y, x, seg[1])\n\t\t\t\tbreak\n\t\t\tcase 'Z':\n\t\t\t\tseg = line(x, y, startX, startY)\n\t\t\t\tbreak\n\t\t}\n\n\t\t// update state\n\t\tprev = command\n\t\tx = seg[seg.length - 2]\n\t\ty = seg[seg.length - 1]\n\t\tif (seg.length > 4) {\n\t\t\tbezierX = seg[seg.length - 4]\n\t\t\tbezierY = seg[seg.length - 3]\n\t\t} else {\n\t\t\tbezierX = x\n\t\t\tbezierY = y\n\t\t}\n\t\tresult.push(seg)\n\t}\n\n\treturn result\n}\n\nfunction line(x1, y1, x2, y2){\n\treturn ['C', x1, y1, x2, y2, x2, y2]\n}\n\nfunction quadratic(x1, y1, cx, cy, x2, y2){\n\treturn [\n\t\t'C',\n\t\tx1/3 + (2/3) * cx,\n\t\ty1/3 + (2/3) * cy,\n\t\tx2/3 + (2/3) * cx,\n\t\ty2/3 + (2/3) * cy,\n\t\tx2,\n\t\ty2\n\t]\n}\n\n// This function is ripped from \n// github.com/DmitryBaranovskiy/raphael/blob/4d97d4/raphael.js#L2216-L2304 \n// which references w3.org/TR/SVG11/implnote.html#ArcImplementationNotes\n// TODO: make it human readable\n\nfunction arc(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {\n\tif (!recursive) {\n\t\tvar xy = rotate(x1, y1, -angle)\n\t\tx1 = xy.x\n\t\ty1 = xy.y\n\t\txy = rotate(x2, y2, -angle)\n\t\tx2 = xy.x\n\t\ty2 = xy.y\n\t\tvar x = (x1 - x2) / 2\n\t\tvar y = (y1 - y2) / 2\n\t\tvar h = (x * x) / (rx * rx) + (y * y) / (ry * ry)\n\t\tif (h > 1) {\n\t\t\th = Math.sqrt(h)\n\t\t\trx = h * rx\n\t\t\try = h * ry\n\t\t}\n\t\tvar rx2 = rx * rx\n\t\tvar ry2 = ry * ry\n\t\tvar k = (large_arc_flag == sweep_flag ? -1 : 1)\n\t\t\t* Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x)))\n\t\tif (k == Infinity) k = 1 // neutralize\n\t\tvar cx = k * rx * y / ry + (x1 + x2) / 2\n\t\tvar cy = k * -ry * x / rx + (y1 + y2) / 2\n\t\tvar f1 = Math.asin(((y1 - cy) / ry).toFixed(9))\n\t\tvar f2 = Math.asin(((y2 - cy) / ry).toFixed(9))\n\n\t\tf1 = x1 < cx ? PI - f1 : f1\n\t\tf2 = x2 < cx ? PI - f2 : f2\n\t\tif (f1 < 0) f1 = PI * 2 + f1\n\t\tif (f2 < 0) f2 = PI * 2 + f2\n\t\tif (sweep_flag && f1 > f2) f1 = f1 - PI * 2\n\t\tif (!sweep_flag && f2 > f1) f2 = f2 - PI * 2\n\t} else {\n\t\tf1 = recursive[0]\n\t\tf2 = recursive[1]\n\t\tcx = recursive[2]\n\t\tcy = recursive[3]\n\t}\n\t// greater than 120 degrees requires multiple segments\n\tif (Math.abs(f2 - f1) > _120) {\n\t\tvar f2old = f2\n\t\tvar x2old = x2\n\t\tvar y2old = y2\n\t\tf2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1)\n\t\tx2 = cx + rx * Math.cos(f2)\n\t\ty2 = cy + ry * Math.sin(f2)\n\t\tvar res = arc(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy])\n\t}\n\tvar t = Math.tan((f2 - f1) / 4)\n\tvar hx = 4 / 3 * rx * t\n\tvar hy = 4 / 3 * ry * t\n\tvar curve = [\n\t\t2 * x1 - (x1 + hx * Math.sin(f1)),\n\t\t2 * y1 - (y1 - hy * Math.cos(f1)),\n\t\tx2 + hx * Math.sin(f2),\n\t\ty2 - hy * Math.cos(f2),\n\t\tx2,\n\t\ty2\n\t]\n\tif (recursive) return curve\n\tif (res) curve = curve.concat(res)\n\tfor (var i = 0; i < curve.length;) {\n\t\tvar rot = rotate(curve[i], curve[i+1], angle)\n\t\tcurve[i++] = rot.x\n\t\tcurve[i++] = rot.y\n\t}\n\treturn curve\n}\n\nfunction rotate(x, y, rad){\n\treturn {\n\t\tx: x * Math.cos(rad) - y * Math.sin(rad),\n\t\ty: x * Math.sin(rad) + y * Math.cos(rad)\n\t}\n}\n\nfunction radians(degress){\n\treturn degress * (PI / 180)\n}\n\n\n//# sourceURL=webpack:///./node_modules/normalize-svg-path/index.js?");
    
    /***/ }),
    
    /***/ "./node_modules/parse-svg-path/index.js":
    /*!**********************************************!*\
      !*** ./node_modules/parse-svg-path/index.js ***!
      \**********************************************/
    /*! no static exports found */
    /***/ (function(module, exports) {
    
    eval("\nmodule.exports = parse\n\n/**\n * expected argument lengths\n * @type {Object}\n */\n\nvar length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0}\n\n/**\n * segment pattern\n * @type {RegExp}\n */\n\nvar segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig\n\n/**\n * parse an svg path data string. Generates an Array\n * of commands where each command is an Array of the\n * form `[command, arg1, arg2, ...]`\n *\n * @param {String} path\n * @return {Array}\n */\n\nfunction parse(path) {\n\tvar data = []\n\tpath.replace(segment, function(_, command, args){\n\t\tvar type = command.toLowerCase()\n\t\targs = parseValues(args)\n\n\t\t// overloaded moveTo\n\t\tif (type == 'm' && args.length > 2) {\n\t\t\tdata.push([command].concat(args.splice(0, 2)))\n\t\t\ttype = 'l'\n\t\t\tcommand = command == 'm' ? 'l' : 'L'\n\t\t}\n\n\t\twhile (true) {\n\t\t\tif (args.length == length[type]) {\n\t\t\t\targs.unshift(command)\n\t\t\t\treturn data.push(args)\n\t\t\t}\n\t\t\tif (args.length < length[type]) throw new Error('malformed path data')\n\t\t\tdata.push([command].concat(args.splice(0, length[type])))\n\t\t}\n\t})\n\treturn data\n}\n\nvar number = /-?[0-9]*\\.?[0-9]+(?:e[-+]?\\d+)?/ig\n\nfunction parseValues(args) {\n\tvar numbers = args.match(number)\n\treturn numbers ? numbers.map(Number) : []\n}\n\n\n//# sourceURL=webpack:///./node_modules/parse-svg-path/index.js?");
    
    /***/ }),
    
    /***/ "./node_modules/svg-path-contours/index.js":
    /*!*************************************************!*\
      !*** ./node_modules/svg-path-contours/index.js ***!
      \*************************************************/
    /*! no static exports found */
    /***/ (function(module, exports, __webpack_require__) {
    
    eval("var bezier = __webpack_require__(/*! adaptive-bezier-curve */ \"./node_modules/adaptive-bezier-curve/index.js\")\nvar abs = __webpack_require__(/*! abs-svg-path */ \"./node_modules/abs-svg-path/index.js\")\nvar norm = __webpack_require__(/*! normalize-svg-path */ \"./node_modules/normalize-svg-path/index.js\")\nvar copy = __webpack_require__(/*! vec2-copy */ \"./node_modules/vec2-copy/index.js\")\n\nfunction set(out, x, y) {\n    out[0] = x\n    out[1] = y\n    return out\n}\n\nvar tmp1 = [0,0],\n    tmp2 = [0,0],\n    tmp3 = [0,0]\n\nfunction bezierTo(points, scale, start, seg) {\n    bezier(start, \n        set(tmp1, seg[1], seg[2]), \n        set(tmp2, seg[3], seg[4]),\n        set(tmp3, seg[5], seg[6]), scale, points)\n}\n\nmodule.exports = function contours(svg, scale) {\n    var paths = []\n\n    var points = []\n    var pen = [0, 0]\n    norm(abs(svg)).forEach(function(segment, i, self) {\n        if (segment[0] === 'M') {\n            copy(pen, segment.slice(1))\n            if (points.length>0) {\n                paths.push(points)\n                points = []\n            }\n        } else if (segment[0] === 'C') {\n            bezierTo(points, scale, pen, segment)\n            set(pen, segment[5], segment[6])\n        } else {\n            throw new Error('illegal type in SVG: '+segment[0])\n        }\n    })\n    if (points.length>0)\n        paths.push(points)\n    return paths\n}\n\n//# sourceURL=webpack:///./node_modules/svg-path-contours/index.js?");
    
    /***/ }),
    
    /***/ "./node_modules/vec2-copy/index.js":
    /*!*****************************************!*\
      !*** ./node_modules/vec2-copy/index.js ***!
      \*****************************************/
    /*! no static exports found */
    /***/ (function(module, exports) {
    
    eval("module.exports = function vec2Copy(out, a) {\n    out[0] = a[0]\n    out[1] = a[1]\n    return out\n}\n\n//# sourceURL=webpack:///./node_modules/vec2-copy/index.js?");
    
    /***/ }),
    
    /***/ "./src/icons/triangulateSVG.js":
    /*!*************************************!*\
      !*** ./src/icons/triangulateSVG.js ***!
      \*************************************/
    /*! no static exports found */
    /***/ (function(module, exports, __webpack_require__) {
    
    eval("// webpack src/icons/triangulateSVG.js -o lib/triangulateSVG.js --mode development\n\nconst parseSVGPath = __webpack_require__(/*! parse-svg-path */ \"./node_modules/parse-svg-path/index.js\");\nconst getPathContours = __webpack_require__(/*! svg-path-contours */ \"./node_modules/svg-path-contours/index.js\");\n\n// TODO\n// rectangles, circles\n// colors from geometry\n// scale\n// simplify\n// ignore fill:none\n// <rect x=\"7.256\" y=\"17.315\" fill=\"none\" width=\"57.489\" height=\"35.508\"/>\n// <rect x=\"7.256\" y=\"49.216\" fill=\"#F07D00\" width=\"56.363\" height=\"3.607\"/>\n// <polygon fill=\"#003C64\" stroke=\"#003C64\" stroke-miterlimit=\"10\" points=\"18.465,18.011 12.628,29.15 12.628,18.011 7.256,18.011 7.256,42.903 12.628,42.903 12.628,29.867 18.789,42.903 24.84,42.903 17.75,29.365 24.195,18.011\"/>\n// <circle cx=\"25\" cy=\"75\" r=\"20\" stroke=\"red\" fill=\"transparent\" stroke-width=\"5\"/>\n// <ellipse cx=\"75\" cy=\"75\" rx=\"20\" ry=\"5\" stroke=\"red\" fill=\"transparent\" stroke-width=\"5\"/>\n\nfunction SVGtoPolygons (svg) {\n  const res = [];\n\n  let rx = /<path[^/]+d=\"([^\"]+)\"/g;\n  let match;\n  do {\n    match = rx.exec(svg);\n    if (match) {\n      const path = parseSVGPath(match[1]);\n      const contours = getPathContours(path);\n      res.push(contours);\n    }\n  } while (match);\n\n  rx = /<polygon[^/]+points=\"([^\"]+)\"/g;\n  do {\n    match = rx.exec(svg);\n    if (match) {\n      const points = match[1]\n        .split(/\\s+/g)\n        .map(point => {\n          const p = point.split(',');\n          return [\n            parseFloat(p[0]),\n            parseFloat(p[1]),\n          ];\n        });\n      res.push([points]);\n    }\n  } while (match);\n\n  return res;\n}\n\nfunction getOffsetAndScale (polygons) {\n  let\n    minX = Infinity, maxX = -Infinity,\n    minY = Infinity, maxY = -Infinity;\n\n  polygons.forEach(poly => {\n    poly.forEach(ring => {\n      ring.forEach(point => {\n        minX = Math.min(minX, point[0]);\n        maxX = Math.max(maxX, point[0]);\n        minY = Math.min(minY, point[1]);\n        maxY = Math.max(maxY, point[1]);\n      });\n    });\n  });\n\n  return { offset: [minX, minY], scale: Math.max(maxX-minX, maxY-minY) };\n}\n\nwindow.triangulateSVG = function (svg) { // window... exposes it in webpack\n  const polygons = SVGtoPolygons(svg);\n\n  const { offset, scale } = getOffsetAndScale(polygons);\n\n  const res = [];\n\n  polygons.forEach(poly => {\n    const\n      vertices = [],\n      ringIndex = [];\n\n    let r = 0;\n    poly.forEach((ring, i) => {\n      ring.forEach(point => {\n        vertices.push(...point);\n      });\n\n      if (i) {\n        r += poly[i - 1].length;\n        ringIndex.push(r);\n      }\n    });\n\n    const triangles = earcut(vertices, ringIndex);\n    for (let t = 0; t < triangles.length-2; t+=3) {\n      const i1 = triangles[t  ];\n      const i2 = triangles[t+1];\n      const i3 = triangles[t+2];\n\n      const a = [ (vertices[i1*2]-offset[0])/scale, (vertices[i1*2+1]-offset[1])/scale ];\n      const b = [ (vertices[i2*2]-offset[0])/scale, (vertices[i2*2+1]-offset[1])/scale ];\n      const c = [ (vertices[i3*2]-offset[0])/scale, (vertices[i3*2+1]-offset[1])/scale ];\n\n      res.push([a, b, c]);\n    }\n  });\n\n  return res;\n};\n\n\n//# sourceURL=webpack:///./src/icons/triangulateSVG.js?");
    
    /***/ })
    
    /******/ });
    
    var earcut = (function() {
    
      function earcut(data, holeIndices, dim) {
    
        dim = dim || 2;
    
        var hasHoles = holeIndices && holeIndices.length,
          outerLen = hasHoles ? holeIndices[0]*dim : data.length,
          outerNode = linkedList(data, 0, outerLen, dim, true),
          triangles = [];
    
        if (!outerNode) return triangles;
    
        var minX, minY, maxX, maxY, x, y, size;
    
        if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
    
        // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
        if (data.length>80*dim) {
          minX = maxX = data[0];
          minY = maxY = data[1];
    
          for (var i = dim; i<outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x<minX) minX = x;
            if (y<minY) minY = y;
            if (x>maxX) maxX = x;
            if (y>maxY) maxY = y;
          }
    
          // minX, minY and size are later used to transform coords into integers for z-order calculation
          size = Math.max(maxX - minX, maxY - minY);
        }
    
        earcutLinked(outerNode, triangles, dim, minX, minY, size);
    
        return triangles;
      }
    
    // create a circular doubly linked list from polygon points in the specified winding order
      function linkedList(data, start, end, dim, clockwise) {
        var i, last;
    
        if (clockwise === (signedArea(data, start, end, dim)>0)) {
          for (i = start; i<end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
        } else {
          for (i = end - dim; i>=start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
        }
    
        if (last && equals(last, last.next)) {
          removeNode(last);
          last = last.next;
        }
    
        return last;
      }
    
    // eliminate colinear or duplicate points
      function filterPoints(start, end) {
        if (!start) return start;
        if (!end) end = start;
    
        var p = start,
          again;
        do {
          again = false;
    
          if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) return null;
            again = true;
    
          } else {
            p = p.next;
          }
        } while (again || p !== end);
    
        return end;
      }
    
    // main ear slicing loop which triangulates a polygon (given as a linked list)
      function earcutLinked(ear, triangles, dim, minX, minY, size, pass) {
        if (!ear) return;
    
        // interlink polygon nodes in z-order
        if (!pass && size) indexCurve(ear, minX, minY, size);
    
        var stop = ear,
          prev, next;
    
        // iterate through ears, slicing them one by one
        while (ear.prev !== ear.next) {
          prev = ear.prev;
          next = ear.next;
    
          if (size ? isEarHashed(ear, minX, minY, size) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i/dim);
            triangles.push(ear.i/dim);
            triangles.push(next.i/dim);
    
            removeNode(ear);
    
            // skipping the next vertice leads to less sliver triangles
            ear = next.next;
            stop = next.next;
    
            continue;
          }
    
          ear = next;
    
          // if we looped through the whole remaining polygon and can't find any more ears
          if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
              earcutLinked(filterPoints(ear), triangles, dim, minX, minY, size, 1);
    
              // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
              ear = cureLocalIntersections(ear, triangles, dim);
              earcutLinked(ear, triangles, dim, minX, minY, size, 2);
    
              // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
              splitEarcut(ear, triangles, dim, minX, minY, size);
            }
    
            break;
          }
        }
      }
    
    // check whether a polygon node forms a valid ear with adjacent nodes
      function isEar(ear) {
        var a = ear.prev,
          b = ear,
          c = ear.next;
    
        if (area(a, b, c)>=0) return false; // reflex, can't be an ear
    
        // now make sure we don't have other points inside the potential ear
        var p = ear.next.next;
    
        while (p !== ear.prev) {
          if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next)>=0) return false;
          p = p.next;
        }
    
        return true;
      }
    
      function isEarHashed(ear, minX, minY, size) {
        var a = ear.prev,
          b = ear,
          c = ear.next;
    
        if (area(a, b, c)>=0) return false; // reflex, can't be an ear
    
        // triangle bbox; min & max are calculated like this for speed
        var minTX = a.x<b.x ? (a.x<c.x ? a.x : c.x) : (b.x<c.x ? b.x : c.x),
          minTY = a.y<b.y ? (a.y<c.y ? a.y : c.y) : (b.y<c.y ? b.y : c.y),
          maxTX = a.x>b.x ? (a.x>c.x ? a.x : c.x) : (b.x>c.x ? b.x : c.x),
          maxTY = a.y>b.y ? (a.y>c.y ? a.y : c.y) : (b.y>c.y ? b.y : c.y);
    
        // z-order range for the current triangle bbox;
        var minZ = zOrder(minTX, minTY, minX, minY, size),
          maxZ = zOrder(maxTX, maxTY, minX, minY, size);
    
        // first look for points inside the triangle in increasing z-order
        var p = ear.nextZ;
    
        while (p && p.z<=maxZ) {
          if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next)>=0) return false;
          p = p.nextZ;
        }
    
        // then look for points in decreasing z-order
        p = ear.prevZ;
    
        while (p && p.z>=minZ) {
          if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next)>=0) return false;
          p = p.prevZ;
        }
    
        return true;
      }
    
    // go through all polygon nodes and cure small local self-intersections
      function cureLocalIntersections(start, triangles, dim) {
        var p = start;
        do {
          var a = p.prev,
            b = p.next.next;
    
          if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
    
            triangles.push(a.i/dim);
            triangles.push(p.i/dim);
            triangles.push(b.i/dim);
    
            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);
    
            p = start = b;
          }
          p = p.next;
        } while (p !== start);
    
        return p;
      }
    
    // try splitting polygon into two and triangulate them independently
      function splitEarcut(start, triangles, dim, minX, minY, size) {
        // look for a valid diagonal that divides the polygon into two
        var a = start;
        do {
          var b = a.next.next;
          while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
              // split the polygon in two by the diagonal
              var c = splitPolygon(a, b);
    
              // filter colinear points around the cuts
              a = filterPoints(a, a.next);
              c = filterPoints(c, c.next);
    
              // run earcut on each half
              earcutLinked(a, triangles, dim, minX, minY, size);
              earcutLinked(c, triangles, dim, minX, minY, size);
              return;
            }
            b = b.next;
          }
          a = a.next;
        } while (a !== start);
      }
    
    // link every hole into the outer loop, producing a single-ring polygon without holes
      function eliminateHoles(data, holeIndices, outerNode, dim) {
        var queue = [],
          i, len, start, end, list;
    
        for (i = 0, len = holeIndices.length; i<len; i++) {
          start = holeIndices[i]*dim;
          end = i<len - 1 ? holeIndices[i + 1]*dim : data.length;
          list = linkedList(data, start, end, dim, false);
          if (list === list.next) list.steiner = true;
          queue.push(getLeftmost(list));
        }
    
        queue.sort(compareX);
    
        // process holes from left to right
        for (i = 0; i<queue.length; i++) {
          eliminateHole(queue[i], outerNode);
          outerNode = filterPoints(outerNode, outerNode.next);
        }
    
        return outerNode;
      }
    
      function compareX(a, b) {
        return a.x - b.x;
      }
    
    // find a bridge between vertices that connects hole with an outer ring and and link it
      function eliminateHole(hole, outerNode) {
        outerNode = findHoleBridge(hole, outerNode);
        if (outerNode) {
          var b = splitPolygon(outerNode, hole);
          filterPoints(b, b.next);
        }
      }
    
    // David Eberly's algorithm for finding a bridge between hole and outer polygon
      function findHoleBridge(hole, outerNode) {
        var p = outerNode,
          hx = hole.x,
          hy = hole.y,
          qx = -Infinity,
          m;
    
        // find a segment intersected by a ray from the hole's leftmost point to the left;
        // segment's endpoint with lesser x will be potential connection point
        do {
          if (hy<=p.y && hy>=p.next.y) {
            var x = p.x + (hy - p.y)*(p.next.x - p.x)/(p.next.y - p.y);
            if (x<=hx && x>qx) {
              qx = x;
              if (x === hx) {
                if (hy === p.y) return p;
                if (hy === p.next.y) return p.next;
              }
              m = p.x<p.next.x ? p : p.next;
            }
          }
          p = p.next;
        } while (p !== outerNode);
    
        if (!m) return null;
    
        if (hx === qx) return m.prev; // hole touches outer segment; pick lower endpoint
    
        // look for points inside the triangle of hole point, segment intersection and endpoint;
        // if there are no points found, we have a valid connection;
        // otherwise choose the point of the minimum angle with the ray as connection point
    
        var stop = m,
          mx = m.x,
          my = m.y,
          tanMin = Infinity,
          tan;
    
        p = m.next;
    
        while (p !== stop) {
          if (hx>=p.x && p.x>=mx &&
            pointInTriangle(hy<my ? hx : qx, hy, mx, my, hy<my ? qx : hx, hy, p.x, p.y)) {
    
            tan = Math.abs(hy - p.y)/(hx - p.x); // tangential
    
            if ((tan<tanMin || (tan === tanMin && p.x>m.x)) && locallyInside(p, hole)) {
              m = p;
              tanMin = tan;
            }
          }
    
          p = p.next;
        }
    
        return m;
      }
    
    // interlink polygon nodes in z-order
      function indexCurve(start, minX, minY, size) {
        var p = start;
        do {
          if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, size);
          p.prevZ = p.prev;
          p.nextZ = p.next;
          p = p.next;
        } while (p !== start);
    
        p.prevZ.nextZ = null;
        p.prevZ = null;
    
        sortLinked(p);
      }
    
    // Simon Tatham's linked list merge sort algorithm
    // http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
      function sortLinked(list) {
        var i, p, q, e, tail, numMerges, pSize, qSize,
          inSize = 1;
    
        do {
          p = list;
          list = null;
          tail = null;
          numMerges = 0;
    
          while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i<inSize; i++) {
              pSize++;
              q = q.nextZ;
              if (!q) break;
            }
    
            qSize = inSize;
    
            while (pSize>0 || (qSize>0 && q)) {
    
              if (pSize === 0) {
                e = q;
                q = q.nextZ;
                qSize--;
              } else if (qSize === 0 || !q) {
                e = p;
                p = p.nextZ;
                pSize--;
              } else if (p.z<=q.z) {
                e = p;
                p = p.nextZ;
                pSize--;
              } else {
                e = q;
                q = q.nextZ;
                qSize--;
              }
    
              if (tail) tail.nextZ = e;
              else list = e;
    
              e.prevZ = tail;
              tail = e;
            }
    
            p = q;
          }
    
          tail.nextZ = null;
          inSize *= 2;
    
        } while (numMerges>1);
    
        return list;
      }
    
    // z-order of a point given coords and size of the data bounding box
      function zOrder(x, y, minX, minY, size) {
        // coords are transformed into non-negative 15-bit integer range
        x = 32767*(x - minX)/size;
        y = 32767*(y - minY)/size;
    
        x = (x | (x<<8)) & 0x00FF00FF;
        x = (x | (x<<4)) & 0x0F0F0F0F;
        x = (x | (x<<2)) & 0x33333333;
        x = (x | (x<<1)) & 0x55555555;
    
        y = (y | (y<<8)) & 0x00FF00FF;
        y = (y | (y<<4)) & 0x0F0F0F0F;
        y = (y | (y<<2)) & 0x33333333;
        y = (y | (y<<1)) & 0x55555555;
    
        return x | (y<<1);
      }
    
    // find the leftmost node of a polygon ring
      function getLeftmost(start) {
        var p = start,
          leftmost = start;
        do {
          if (p.x<leftmost.x) leftmost = p;
          p = p.next;
        } while (p !== start);
    
        return leftmost;
      }
    
    // check if a point lies within a convex triangle
      function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
        return (cx - px)*(ay - py) - (ax - px)*(cy - py)>=0 &&
          (ax - px)*(by - py) - (bx - px)*(ay - py)>=0 &&
          (bx - px)*(cy - py) - (cx - px)*(by - py)>=0;
      }
    
    // check if a diagonal between two polygon nodes is valid (lies in polygon interior)
      function isValidDiagonal(a, b) {
        return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
          locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b);
      }
    
    // signed area of a triangle
      function area(p, q, r) {
        return (q.y - p.y)*(r.x - q.x) - (q.x - p.x)*(r.y - q.y);
      }
    
    // check if two points are equal
      function equals(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
      }
    
    // check if two segments intersect
      function intersects(p1, q1, p2, q2) {
        if ((equals(p1, q1) && equals(p2, q2)) ||
          (equals(p1, q2) && equals(p2, q1))) return true;
        return area(p1, q1, p2)>0 !== area(p1, q1, q2)>0 &&
          area(p2, q2, p1)>0 !== area(p2, q2, q1)>0;
      }
    
    // check if a polygon diagonal intersects any polygon segments
      function intersectsPolygon(a, b) {
        var p = a;
        do {
          if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
            intersects(p, p.next, a, b)) return true;
          p = p.next;
        } while (p !== a);
    
        return false;
      }
    
    // check if a polygon diagonal is locally inside the polygon
      function locallyInside(a, b) {
        return area(a.prev, a, a.next)<0 ?
        area(a, b, a.next)>=0 && area(a, a.prev, b)>=0 :
        area(a, b, a.prev)<0 || area(a, a.next, b)<0;
      }
    
    // check if the middle point of a polygon diagonal is inside the polygon
      function middleInside(a, b) {
        var p = a,
          inside = false,
          px = (a.x + b.x)/2,
          py = (a.y + b.y)/2;
        do {
          if (((p.y>py) !== (p.next.y>py)) && (px<(p.next.x - p.x)*(py - p.y)/(p.next.y - p.y) + p.x))
            inside = !inside;
          p = p.next;
        } while (p !== a);
    
        return inside;
      }
    
    // link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
    // if one belongs to the outer ring and another to a hole, it merges it into a single ring
      function splitPolygon(a, b) {
        var a2 = new Node(a.i, a.x, a.y),
          b2 = new Node(b.i, b.x, b.y),
          an = a.next,
          bp = b.prev;
    
        a.next = b;
        b.prev = a;
    
        a2.next = an;
        an.prev = a2;
    
        b2.next = a2;
        a2.prev = b2;
    
        bp.next = b2;
        b2.prev = bp;
    
        return b2;
      }
    
    // create a node and optionally link it with previous one (in a circular doubly linked list)
      function insertNode(i, x, y, last) {
        var p = new Node(i, x, y);
    
        if (!last) {
          p.prev = p;
          p.next = p;
    
        } else {
          p.next = last.next;
          p.prev = last;
          last.next.prev = p;
          last.next = p;
        }
        return p;
      }
    
      function removeNode(p) {
        p.next.prev = p.prev;
        p.prev.next = p.next;
    
        if (p.prevZ) p.prevZ.nextZ = p.nextZ;
        if (p.nextZ) p.nextZ.prevZ = p.prevZ;
      }
    
      function Node(i, x, y) {
        // vertice index in coordinates array
        this.i = i;
    
        // vertex coordinates
        this.x = x;
        this.y = y;
    
        // previous and next vertice nodes in a polygon ring
        this.prev = null;
        this.next = null;
    
        // z-order curve value
        this.z = null;
    
        // previous and next nodes in z-order
        this.prevZ = null;
        this.nextZ = null;
    
        // indicates whether this is a steiner point
        this.steiner = false;
      }
    
    // return a percentage difference between the polygon area and its triangulation area;
    // used to verify correctness of triangulation
      earcut.deviation = function(data, holeIndices, dim, triangles) {
        var hasHoles = holeIndices && holeIndices.length;
        var outerLen = hasHoles ? holeIndices[0]*dim : data.length;
        var i, len;
    
        var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
        if (hasHoles) {
          for (i = 0, len = holeIndices.length; i<len; i++) {
            var start = holeIndices[i]*dim;
            var end = i<len - 1 ? holeIndices[i + 1]*dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
          }
        }
    
        var trianglesArea = 0;
        for (i = 0, len = triangles.length; i < len; i += 3) {
          var a = triangles[i]*dim;
          var b = triangles[i + 1]*dim;
          var c = triangles[i + 2]*dim;
          trianglesArea += Math.abs(
            (data[a] - data[c])*(data[b + 1] - data[a + 1]) -
            (data[a] - data[b])*(data[c + 1] - data[a + 1]));
        }
    
        return polygonArea === 0 && trianglesArea === 0 ? 0 :
          Math.abs((trianglesArea - polygonArea)/polygonArea);
      };
    
      function signedArea(data, start, end, dim) {
        var sum = 0;
        for (var i = start, j = end - dim; i<end; i += dim) {
          sum += (data[j] - data[i])*(data[i + 1] + data[j + 1]);
          j = i;
        }
        return sum;
      }
    
    // turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
      earcut.flatten = function(data) {
        var dim = data[0][0].length,
          result = { vertices: [], holes: [], dimensions: dim },
          holeIndex = 0;
    
        for (var i = 0; i<data.length; i++) {
          for (var j = 0; j<data[i].length; j++) {
            for (var d = 0; d<dim; d++) result.vertices.push(data[i][j][d]);
          }
          if (i>0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
          }
        }
        return result;
      };
    
      return earcut;
    
    }(this));
    
    const shaders = {};
    
    shaders['picking'] = {"name":"picking","vs":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec3 aPickingColor;\nattribute float aZScale;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform float uFogDistance;\nuniform float uFade;\nuniform float uIndex;\nvarying vec4 vColor;\nvoid main() {\nfloat f = clamp(uFade*aZScale, 0.0, 1.0);\nif (f == 0.0) {\ngl_Position = vec4(0.0, 0.0, 0.0, 0.0);\nvColor = vec4(0.0, 0.0, 0.0, 0.0);\n} else {\nvec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\ngl_Position = uMatrix * pos;\nvec4 mPosition = vec4(uModelMatrix * pos);\nfloat distance = length(mPosition);\nif (distance > uFogDistance) {\nvColor = vec4(0.0, 0.0, 0.0, 0.0);\n} else {\nvColor = vec4(clamp(uIndex, 0.0, 1.0), aPickingColor.g, aPickingColor.b, 1.0);\n}\n}\n}\n","fs":"#ifdef GL_ES\nprecision mediump float;\n#endif\nvarying vec4 vColor;\nvoid main() {\ngl_FragColor = vColor;\n}\n"};
    
    shaders['buildings'] = {"name":"buildings","vs":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nattribute vec3 aNormal;\nattribute vec3 aColor;\nattribute float aHeight;\nattribute vec4 aTintColor;\nattribute float aZScale;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform mat3 uNormalTransform;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nuniform float uFade;\nvarying vec3 vColor;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nconst float gradientStrength = 0.4;\nvoid main() {\nfloat f = clamp(uFade*aZScale, 0.0, 1.0);\nif (f == 0.0) {\ngl_Position = vec4(0.0, 0.0, 0.0, 0.0);\nvColor = vec3(0.0, 0.0, 0.0);\n} else {\nvec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\ngl_Position = uMatrix * pos;\nvec3 color = aColor;\n// tint ***********************************************\nif (aTintColor.a > 0.0) {\ncolor = mix(aColor, aTintColor.rgb, 0.5);\n}\n//*** light intensity, defined by light direction on surface ****************\nvec3 transformedNormal = aNormal * uNormalTransform;\nfloat lightIntensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;\ncolor = color + uLightColor * lightIntensity;\nvTexCoord = aTexCoord;\n//*** vertical shading ******************************************************\nfloat verticalShading = clamp(gradientStrength - ((pos.z*gradientStrength) / (aHeight * f)), 0.0, gradientStrength);\n//***************************************************************************\nvColor = color-verticalShading;\nvec4 worldPos = uModelMatrix * pos;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n}\n}\n","fs":"#ifdef GL_ES\nprecision mediump float;\n#endif\nvarying vec3 vColor;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nuniform vec3 uFogColor;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nuniform sampler2D uWallTexIndex;\nvoid main() {\n\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\nfogIntensity = clamp(fogIntensity, 0.0, 1.0);\ngl_FragColor = vec4(vColor * texture2D(uWallTexIndex, vTexCoord).rgb, 1.0-fogIntensity);\n}\n"};
    
    shaders['buildings_with_shadows'] = {"name":"buildings_with_shadows","vs":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nattribute vec3 aColor;\nattribute vec2 aTexCoord;\nattribute float aHeight;\nattribute vec4 aTintColor;\nattribute float aZScale;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform mat4 uSunMatrix;\nuniform mat3 uNormalTransform;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nuniform float uFade;\nvarying vec3 vColor;\nvarying vec2 vTexCoord;\nvarying vec3 vNormal;\nvarying vec3 vSunRelPosition;\nvarying float verticalDistanceToLowerEdge;\nfloat gradientStrength = 0.4;\nvoid main() {\nfloat f = clamp(uFade*aZScale, 0.0, 1.0);\nif (f == 0.0) {\ngl_Position = vec4(0.0, 0.0, 0.0, 0.0);\nvColor = vec3(0.0, 0.0, 0.0);\n} else {\nvec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\ngl_Position = uMatrix * pos;\nvec3 color = aColor;\n// tint ***********************************************\nif (aTintColor.a > 0.0) {\ncolor = mix(aColor, aTintColor.rgb, 0.5);\n}\n//*** light intensity, defined by light direction on surface ****************\nvNormal = aNormal;\nvTexCoord = aTexCoord;\n//vec3 transformedNormal = aNormal * uNormalTransform;\n//float lightIntensity = max( dot(aNormal, uLightDirection), 0.0) / 1.5;\n//color = color + uLightColor * lightIntensity;\n//*** vertical shading ******************************************************\nfloat verticalShading = clamp(gradientStrength - ((pos.z*gradientStrength) / (aHeight * f)), 0.0, gradientStrength);\n//***************************************************************************\nvColor = color-verticalShading;\nvec4 worldPos = uModelMatrix * pos;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n// *** shadow mapping ********\nvec4 sunRelPosition = uSunMatrix * pos;\nvSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;\n}\n}\n","fs":"\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nvarying vec2 vTexCoord;\nvarying vec3 vColor;\nvarying vec3 vNormal;\nvarying vec3 vSunRelPosition;\nvarying float verticalDistanceToLowerEdge;\nuniform vec3 uFogColor;\nuniform vec2 uShadowTexDimensions;\nuniform sampler2D uShadowTexIndex;\nuniform sampler2D uWallTexIndex;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nuniform float uShadowStrength;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nfloat isSeenBySun(const vec2 sunViewNDC, const float depth, const float bias) {\nif ( clamp( sunViewNDC, 0.0, 1.0) != sunViewNDC) //not inside sun's viewport\nreturn 1.0;\n\nfloat depthFromTexture = texture2D( uShadowTexIndex, sunViewNDC.xy).x;\n\n//compare depth values not in reciprocal but in linear depth\nreturn step(1.0/depthFromTexture, 1.0/depth + bias);\n}\nvoid main() {\nvec3 normal = normalize(vNormal); //may degenerate during per-pixel interpolation\nfloat diffuse = dot(uLightDirection, normal);\ndiffuse = max(diffuse, 0.0);\n// reduce shadow strength with:\n// - lowering sun positions, to be consistent with the shadows on the basemap (there,\n// shadows are faded out with lowering sun positions to hide shadow artifacts caused\n// when sun direction and map surface are almost perpendicular\n// - large angles between the sun direction and the surface normal, to hide shadow\n// artifacts that occur when surface normal and sun direction are almost perpendicular\nfloat shadowStrength = pow( max( min(\ndot(uLightDirection, vec3(0.0, 0.0, 1.0)),\ndot(uLightDirection, normal)\n), 0.0), 1.5);\nif (diffuse > 0.0 && shadowStrength > 0.0) {\n// note: the diffuse term is also the cosine between the surface normal and the\n// light direction\nfloat bias = clamp(0.0007*tan(acos(diffuse)), 0.0, 0.01);\nvec2 pos = fract( vSunRelPosition.xy * uShadowTexDimensions);\n\nvec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;\nfloat tlVal = isSeenBySun( tl, vSunRelPosition.z, bias);\nfloat trVal = isSeenBySun( tl + vec2(1.0, 0.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat blVal = isSeenBySun( tl + vec2(0.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat brVal = isSeenBySun( tl + vec2(1.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat occludedBySun = mix(\nmix(tlVal, trVal, pos.x),\nmix(blVal, brVal, pos.x),\npos.y);\ndiffuse *= 1.0 - (shadowStrength * (1.0 - occludedBySun));\n}\nvec3 color = vColor* texture2D( uWallTexIndex, vTexCoord.st).rgb +\n(diffuse/1.5) * uLightColor;\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\nfogIntensity = clamp(fogIntensity, 0.0, 1.0);\n//gl_FragColor = vec4( mix(color, uFogColor, fogIntensity), 1.0);\ngl_FragColor = vec4( color, 1.0-fogIntensity);\n}\n"};
    
    shaders['markers_simple'] = {"name":"markers_simple","vs":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nuniform mat4 uProjMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uModelMatrix;\nuniform vec3 uColor;\nvarying vec3 vColor;\n// TODO: fog distance handling is missing here\nvoid main() {\nmat4 modelView = uViewMatrix * uModelMatrix;\nmodelView[0][0] = 1.0;\nmodelView[0][1] = 0.0;\nmodelView[0][2] = 0.0;\nmodelView[1][0] = 0.0;\nmodelView[1][1] = 1.0;\nmodelView[1][2] = 0.0;\nmodelView[2][0] = 0.0;\nmodelView[2][1] = 0.0;\nmodelView[2][2] = 1.0;\nmat4 mvp = uProjMatrix * modelView;\nfloat reciprScaleOnscreen = 0.02;\nfloat w = (mvp * vec4(0,0,0,1)).w;\nw *= reciprScaleOnscreen;\nvec4 pos = vec4((aPosition.x * w), (aPosition.y * w) , aPosition.z * w, 1);\ngl_Position = mvp * pos;\nvColor = uColor;\n}\n","fs":"#ifdef GL_ES\nprecision mediump float;\n#endif\nvarying vec3 vColor;\nvoid main() {\ngl_FragColor = vec4(vColor, 1.0);\n}\n"};
    
    shaders['markers'] = {"name":"markers","vs":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nuniform mat4 uProjMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uModelMatrix;\nuniform vec3 uColor;\nuniform mat4 uSunMatrix;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nvarying vec3 vColor;\nvarying vec3 vNormal;\nvarying vec3 vSunRelPosition;\nvarying float verticalDistanceToLowerEdge;\n// TODO: fog distance handling is missing here\nvoid main() {\nmat4 modelView = uViewMatrix * uModelMatrix;\nmodelView[0][0] = 1.0;\nmodelView[0][1] = 0.0;\nmodelView[0][2] = 0.0;\nmodelView[1][0] = 0.0;\nmodelView[1][1] = 1.0;\nmodelView[1][2] = 0.0;\nmodelView[2][0] = 0.0;\nmodelView[2][1] = 0.0;\nmodelView[2][2] = 1.0;\nmat4 mvp = uProjMatrix * modelView;\nfloat reciprScaleOnscreen = 0.02;\nfloat w = (mvp * vec4(0,0,0,1)).w;\nw *= reciprScaleOnscreen;\nvec4 pos = vec4((aPosition.x * w), (aPosition.y * w) , aPosition.z * w, 1);\ngl_Position = mvp * pos;\nvColor = uColor;\nvec4 worldPos = uModelMatrix * pos;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n// *** shadow mapping ********\nvec4 sunRelPosition = uSunMatrix * pos;\nvSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;\n}\n","fs":"#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nvarying vec3 vColor;\nvarying vec3 vNormal;\nvarying vec3 vSunRelPosition;\nvarying float verticalDistanceToLowerEdge;\nuniform vec3 uFogColor;\nuniform vec2 uShadowTexDimensions;\nuniform sampler2D uShadowTexIndex;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nuniform float uShadowStrength;\nuniform vec3 uLightDirection;\nuniform vec3 uLightColor;\nfloat isSeenBySun(const vec2 sunViewNDC, const float depth, const float bias) {\nif ( clamp( sunViewNDC, 0.0, 1.0) != sunViewNDC) // not inside sun's viewport\nreturn 1.0;\n\nfloat depthFromTexture = texture2D( uShadowTexIndex, sunViewNDC.xy).x;\n\n// compare depth values not in reciprocal but in linear depth\nreturn step(1.0/depthFromTexture, 1.0/depth + bias);\n}\nvoid main() {\nvec3 normal = normalize(vec3(0.0, -1.0, 0.0)); //may degenerate during per-pixel interpolation\nfloat diffuse = dot(uLightDirection, normal);\ndiffuse = max(diffuse, 0.0);\n// reduce shadow strength with:\n// - lowering sun positions, to be consistent with the shadows on the basemap (there,\n// shadows are faded out with lowering sun positions to hide shadow artifacts caused\n// when sun direction and map surface are almost perpendicular\n// - large angles between the sun direction and the surface normal, to hide shadow\n// artifacts that occur when surface normal and sun direction are almost perpendicular\nfloat shadowStrength = pow( max( min(\ndot(uLightDirection, vec3(0.0, 0.0, 1.0)),\ndot(uLightDirection, normal)\n), 0.0), 1.5);\nif (diffuse > 0.0 && shadowStrength > 0.0) {\n// note: the diffuse term is also the cosine between the surface normal and the\n// light direction\nfloat bias = clamp(0.0007*tan(acos(diffuse)), 0.0, 0.01);\nvec2 pos = fract( vSunRelPosition.xy * uShadowTexDimensions);\n\nvec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;\nfloat tlVal = isSeenBySun( tl, vSunRelPosition.z, bias);\nfloat trVal = isSeenBySun( tl + vec2(1.0, 0.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat blVal = isSeenBySun( tl + vec2(0.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat brVal = isSeenBySun( tl + vec2(1.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat occludedBySun = mix(\nmix(tlVal, trVal, pos.x),\nmix(blVal, brVal, pos.x),\npos.y);\ndiffuse *= 1.0 - (shadowStrength * (1.0 - occludedBySun));\n}\nvec3 color = vColor + (diffuse/1.5) * uLightColor;\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\nfogIntensity = clamp(fogIntensity, 0.0, 1.0);\ngl_FragColor = vec4( color, 1.0-fogIntensity);\n}\n"};
    
    shaders['markers_picking'] = {"name":"markers_picking","vs":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nuniform vec3 uPickingColor;\nuniform mat4 uProjMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uModelMatrix;\nuniform float uFogDistance;\nuniform float uIndex;\nvarying vec3 vColor;\nvoid main() {\nmat4 modelView = uViewMatrix * uModelMatrix;\nmodelView[0][0] = 1.0;\nmodelView[0][1] = 0.0;\nmodelView[0][2] = 0.0;\nmodelView[1][0] = 0.0;\nmodelView[1][1] = 1.0;\nmodelView[1][2] = 0.0;\nmodelView[2][0] = 0.0;\nmodelView[2][1] = 0.0;\nmodelView[2][2] = 1.0;\nmat4 mvp = uProjMatrix * modelView;\nfloat reciprScaleOnscreen = 0.02;\nfloat w = (mvp * vec4(0,0,0,1)).w;\nw *= reciprScaleOnscreen;\nvec4 pos = vec4((aPosition.x * w), (aPosition.y * w) , aPosition.z * w, 1);\ngl_Position = mvp * pos;\n// vec4 pos = aPosition.x;\n// gl_Position = uMatrix * pos;\nvec4 mPosition = vec4(uModelMatrix * pos);\nfloat distance = length(mPosition);\nif (distance > uFogDistance) {\nvColor = vec3(0.0, 0.0, 0.0);\n} else {\nvColor = vec3(clamp(uIndex, 0.0, 1.0), uPickingColor.g, uPickingColor.b);\n}\n}\n","fs":"#ifdef GL_ES\nprecision mediump float;\n#endif\nvarying vec3 vColor;\nvoid main() {\ngl_FragColor = vec4(vColor, 1.0);\n}\n"};
    
    shaders['basemap'] = {"name":"basemap","vs":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uViewMatrix;\nuniform mat4 uModelMatrix;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nvoid main() {\ngl_Position = uViewMatrix * aPosition;\nvTexCoord = aTexCoord;\nvec4 worldPos = uModelMatrix * aPosition;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n}\n","fs":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec3 uFogColor;\nvarying vec2 vTexCoord;\nvarying float verticalDistanceToLowerEdge;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nvoid main() {\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\nfogIntensity = clamp(fogIntensity, 0.0, 1.0);\ngl_FragColor = vec4(texture2D(uTexIndex, vec2(vTexCoord.x, 1.0-vTexCoord.y)).rgb, 1.0-fogIntensity);\n}\n"};
    
    shaders['basemap_with_shadows'] = {"name":"basemap_with_shadows","vs":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\nattribute vec3 aPosition;\nattribute vec3 aNormal;\nuniform mat4 uModelMatrix;\nuniform mat4 uMatrix;\nuniform mat4 uSunMatrix;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\n//varying vec2 vTexCoord;\nvarying vec3 vSunRelPosition;\nvarying vec3 vNormal;\nvarying float verticalDistanceToLowerEdge;\nvoid main() {\nvec4 pos = vec4(aPosition.xyz, 1.0);\ngl_Position = uMatrix * pos;\nvec4 sunRelPosition = uSunMatrix * pos;\nvSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;\nvNormal = aNormal;\nvec4 worldPos = uModelMatrix * pos;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n}\n","fs":"\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n/* This shader computes the diffuse brightness of the map layer. It does *not*\n* render the map texture itself, but is instead intended to be blended on top\n* of an already rendered map.\n* Note: this shader is not (and does not attempt to) be physically correct.\n* It is intented to be a blend between a useful illustration of cast\n* shadows and a mitigation of shadow casting artifacts occuring at\n* low angles on incidence.\n* Map brightness is only affected by shadows, not by light direction.\n* Shadows are darkest when light comes from straight above (and thus\n* shadows can be computed reliably) and become less and less visible\n* with the light source close to horizon (where moiré and offset\n* artifacts would otherwise be visible).\n*/\n//uniform sampler2D uTexIndex;\nuniform sampler2D uShadowTexIndex;\nuniform vec3 uFogColor;\nuniform vec3 uDirToSun;\nuniform vec2 uShadowTexDimensions;\nuniform float uShadowStrength;\nvarying vec2 vTexCoord;\nvarying vec3 vSunRelPosition;\nvarying vec3 vNormal;\nvarying float verticalDistanceToLowerEdge;\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nfloat isSeenBySun( const vec2 sunViewNDC, const float depth, const float bias) {\nif ( clamp( sunViewNDC, 0.0, 1.0) != sunViewNDC) //not inside sun's viewport\nreturn 1.0;\n\nfloat depthFromTexture = texture2D( uShadowTexIndex, sunViewNDC.xy).x;\n\n//compare depth values not in reciprocal but in linear depth\nreturn step(1.0/depthFromTexture, 1.0/depth + bias);\n}\nvoid main() {\n//vec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;\n//gl_FragColor = vec4(vec3(texture2D( uShadowTexIndex, tl).x), 1.0);\n//return;\nfloat diffuse = dot(uDirToSun, normalize(vNormal));\ndiffuse = max(diffuse, 0.0);\n\nfloat shadowStrength = uShadowStrength * pow(diffuse, 1.5);\nif (diffuse > 0.0) {\n// note: the diffuse term is also the cosine between the surface normal and the\n// light direction\nfloat bias = clamp(0.0007*tan(acos(diffuse)), 0.0, 0.01);\n\nvec2 pos = fract( vSunRelPosition.xy * uShadowTexDimensions);\n\nvec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;\nfloat tlVal = isSeenBySun( tl, vSunRelPosition.z, bias);\nfloat trVal = isSeenBySun( tl + vec2(1.0, 0.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat blVal = isSeenBySun( tl + vec2(0.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\nfloat brVal = isSeenBySun( tl + vec2(1.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);\ndiffuse = mix( mix(tlVal, trVal, pos.x),\nmix(blVal, brVal, pos.x),\npos.y);\n}\ndiffuse = mix(1.0, diffuse, shadowStrength);\n\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\nfogIntensity = clamp(fogIntensity, 0.0, 1.0);\nfloat darkness = (1.0 - diffuse);\ndarkness *= (1.0 - fogIntensity);\ngl_FragColor = vec4(vec3(1.0 - darkness), 1.0);\n}\n"};
    
    shaders['texture'] = {"name":"texture","vs":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nuniform mat4 uMatrix;\nvarying vec2 vTexCoord;\nvoid main() {\ngl_Position = uMatrix * aPosition;\nvTexCoord = aTexCoord;\n}\n","fs":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nvarying vec2 vTexCoord;\nvoid main() {\ngl_FragColor = vec4(texture2D(uTexIndex, vTexCoord.st).rgb, 1.0);\n}\n"};
    
    shaders['depth_normal'] = {"name":"depth_normal","vs":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec3 aNormal;\nattribute float aZScale;\nuniform mat4 uMatrix;\nuniform mat4 uModelMatrix;\nuniform mat3 uNormalMatrix;\nuniform vec2 uViewDirOnMap;\nuniform vec2 uLowerEdgePoint;\nuniform float uFade;\nvarying float verticalDistanceToLowerEdge;\nvarying vec3 vNormal;\nvoid main() {\nfloat f = clamp(uFade*aZScale, 0.0, 1.0);\nif (f == 0.0) {\ngl_Position = vec4(0.0, 0.0, 0.0, 0.0);\nverticalDistanceToLowerEdge = 0.0;\n} else {\nvec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);\ngl_Position = uMatrix * pos;\nvNormal = uNormalMatrix * aNormal;\nvec4 worldPos = uModelMatrix * pos;\nvec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;\nverticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);\n}\n}\n","fs":"\n#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform float uFogDistance;\nuniform float uFogBlurDistance;\nvarying float verticalDistanceToLowerEdge;\nvarying vec3 vNormal;\nvoid main() {\nfloat fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;\ngl_FragColor = vec4(normalize(vNormal) / 2.0 + 0.5, clamp(fogIntensity, 0.0, 1.0));\n}\n"};
    
    shaders['ambient_from_depth'] = {"name":"ambient_from_depth","vs":"precision highp float; //is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\nvoid main() {\ngl_Position = aPosition;\nvTexCoord = aTexCoord;\n}\n","fs":"#ifdef GL_FRAGMENT_PRECISION_HIGH\n// we need high precision for the depth values\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nuniform sampler2D uDepthTexIndex;\nuniform sampler2D uFogTexIndex;\nuniform vec2 uInverseTexSize; //in 1/pixels, e.g. 1/512 if the texture is 512px wide\nuniform float uEffectStrength;\nuniform float uNearPlane;\nuniform float uFarPlane;\nvarying vec2 vTexCoord;\n/* Retrieves the depth value 'offset' pixels away from 'pos' from texture 'uDepthTexIndex'. */\nfloat getDepth(vec2 pos, ivec2 offset)\n{\nfloat z = texture2D(uDepthTexIndex, pos + float(offset) * uInverseTexSize).x;\nreturn (2.0 * uNearPlane) / (uFarPlane + uNearPlane - z * (uFarPlane - uNearPlane)); // linearize depth\n}\n/* getOcclusionFactor() determines a heuristic factor (from [0..1]) for how\n* much the fragment at 'pos' with depth 'depthHere'is occluded by the\n* fragment that is (dx, dy) texels away from it.\n*/\nfloat getOcclusionFactor(float depthHere, vec2 pos, ivec2 offset) {\nfloat depthThere = getDepth(pos, offset);\n/* if the fragment at (dx, dy) has no depth (i.e. there was nothing rendered there),\n* then 'here' is not occluded (result 1.0) */\nif (depthThere == 0.0)\nreturn 1.0;\n/* if the fragment at (dx, dy) is further away from the viewer than 'here', then\n* 'here is not occluded' */\nif (depthHere < depthThere )\nreturn 1.0;\nfloat relDepthDiff = depthThere / depthHere;\nfloat depthDiff = abs(depthThere - depthHere) * uFarPlane;\n/* if the fragment at (dx, dy) is closer to the viewer than 'here', then it occludes\n* 'here'. The occlusion is the higher the bigger the depth difference between the two\n* locations is.\n* However, if the depth difference is too high, we assume that 'there' lies in a\n* completely different depth region of the scene than 'here' and thus cannot occlude\n* 'here'. This last assumption gets rid of very dark artifacts around tall buildings.\n*/\nreturn depthDiff < 50.0 ? mix(0.99, 1.0, 1.0 - clamp(depthDiff, 0.0, 1.0)) : 1.0;\n}\n/* This shader approximates the ambient occlusion in screen space (SSAO).\n* It is based on the assumption that a pixel will be occluded by neighboring\n* pixels iff. those have a depth value closer to the camera than the original\n* pixel itself (the function getOcclusionFactor() computes this occlusion\n* by a single other pixel).\n*\n* A naive approach would sample all pixels within a given distance. For an\n* interesting-looking effect, the sampling area needs to be at least 9 pixels\n* wide (-/+ 4), requiring 81 texture lookups per pixel for ambient occlusion.\n* This overburdens many GPUs.\n* To make the ambient occlusion computation faster, we do not consider all\n* texels in the sampling area, but only 16. This causes some sampling artifacts\n* that are later removed by blurring the ambient occlusion texture (this is\n* done in a separate shader).\n*/\nvoid main() {\nfloat depthHere = getDepth(vTexCoord, ivec2(0, 0));\nfloat fogIntensity = texture2D(uFogTexIndex, vTexCoord).w;\nif (depthHere == 0.0)\n{\n\t//there was nothing rendered 'here' --> it can't be occluded\ngl_FragColor = vec4(1.0);\nreturn;\n}\nfloat occlusionFactor = 1.0;\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-1, 0));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+1, 0));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, -1));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, +1));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-2, -2));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+2, +2));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+2, -2));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-2, +2));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-4, 0));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+4, 0));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, -4));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2( 0, +4));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-4, -4));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+4, +4));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(+4, -4));\nocclusionFactor *= getOcclusionFactor(depthHere, vTexCoord, ivec2(-4, +4));\nocclusionFactor = pow(occlusionFactor, 4.0) + 55.0/255.0; // empirical bias determined to let SSAO have no effect on the map plane\nocclusionFactor = 1.0 - ((1.0 - occlusionFactor) * uEffectStrength * (1.0-fogIntensity));\ngl_FragColor = vec4(vec3(occlusionFactor), 1.0);\n}\n"};
    
    shaders['flat_color'] = {"name":"flat_color","vs":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nuniform mat4 uMatrix;\nvoid main() {\ngl_Position = uMatrix * aPosition;\n}\n","fs":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform vec4 uColor;\nvoid main() {\ngl_FragColor = uColor;\n}\n"};
    
    shaders['horizon'] = {"name":"horizon","vs":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\n#define halfPi 1.57079632679\nattribute vec4 aPosition;\nuniform mat4 uMatrix;\nuniform float uAbsoluteHeight;\nvarying vec2 vTexCoord;\nvarying float vRelativeHeight;\nvoid main() {\ngl_Position = uMatrix * aPosition;\nvRelativeHeight = aPosition.z / uAbsoluteHeight;\n}\n","fs":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform vec3 uFogColor;\nvarying float vRelativeHeight;\nvoid main() {\nfloat blendFactor = min(100.0 * vRelativeHeight, 1.0);\nvec4 skyColor = vec4(0.9, 0.85, 1.0, 1.0);\ngl_FragColor = mix(vec4(uFogColor, 1.0), skyColor, blendFactor);\n}\n"};
    
    shaders['blur'] = {"name":"blur","vs":"precision highp float; // is default in vertex shaders anyway, using highp fixes #49\nattribute vec4 aPosition;\nattribute vec2 aTexCoord;\nvarying vec2 vTexCoord;\nvoid main() {\ngl_Position = aPosition;\nvTexCoord = aTexCoord;\n}\n","fs":"#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D uTexIndex;\nuniform vec2 uInverseTexSize; // as 1/n pixels, e.g. 1/512 if the texture is 512px wide\nvarying vec2 vTexCoord;\n// Retrieves the texel color 'offset' pixels away from 'pos' from texture 'uTexIndex'.\nvec4 getTexel(vec2 pos, vec2 offset) {\nreturn texture2D(uTexIndex, pos + offset * uInverseTexSize);\n}\nvoid main() {\nvec4 center = texture2D(uTexIndex, vTexCoord);\nvec4 nonDiagonalNeighbors = getTexel(vTexCoord, vec2(-1.0, 0.0)) +\ngetTexel(vTexCoord, vec2(+1.0, 0.0)) +\ngetTexel(vTexCoord, vec2( 0.0, -1.0)) +\ngetTexel(vTexCoord, vec2( 0.0, +1.0));\nvec4 diagonalNeighbors = getTexel(vTexCoord, vec2(-1.0, -1.0)) +\ngetTexel(vTexCoord, vec2(+1.0, +1.0)) +\ngetTexel(vTexCoord, vec2(-1.0, +1.0)) +\ngetTexel(vTexCoord, vec2(+1.0, -1.0));\n\n// approximate Gaussian blur (mean 0.0, stdev 1.0)\ngl_FragColor = 0.2/1.0 * center +\n0.5/4.0 * nonDiagonalNeighbors +\n0.3/4.0 * diagonalNeighbors;\n}\n"};
    
    
    const workers = {};
    
    workers['feature'] = 'class Request{static load(e,t){const r=new XMLHttpRequest,n=setTimeout(e=>{4!==r.readyState&&(r.abort(),t("status"))},1e4);return r.onreadystatechange=(()=>{4===r.readyState&&(clearTimeout(n),!r.status||r.status<200||r.status>299?t("status"):t(null,r))}),r.open("GET",e),r.send(null),{abort:()=>{r.abort()}}}static getText(e,t){return this.load(e,(e,r)=>{e?t(e):void 0!==r.responseText?t(null,r.responseText):t("content")})}static getXML(e,t){return this.load(e,(e,r)=>{e?t(e):void 0!==r.responseXML?t(null,r.responseXML):t("content")})}static getJSON(e,t){return this.load(e,(r,n)=>{if(r)return void t(r);if(!n.responseText)return void t("content");let o;try{o=JSON.parse(n.responseText),t(null,o)}catch(r){console.warn(`Could not parse JSON from ${e}\\n${r.message}`),t("content")}})}}var w3cColors={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgrey:"#a9a9a9",darkgreen:"#006400",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",grey:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"};function hue2rgb(e,t,r){return r<0&&(r+=1),r>1&&(r-=1),r<1/6?e+6*(t-e)*r:r<.5?t:r<2/3?e+(t-e)*(2/3-r)*6:e}function clamp(e,t){if(void 0!==e)return Math.min(t,Math.max(0,e||0))}var Qolor=function(e,t,r,n){this.r=clamp(e,1),this.g=clamp(t,1),this.b=clamp(r,1),this.a=clamp(n,1)||1};Qolor.parse=function(e){if("string"==typeof e){var t;if(e=e.toLowerCase(),t=(e=w3cColors[e]||e).match(/^#?(\\w{2})(\\w{2})(\\w{2})$/))return new Qolor(parseInt(t[1],16)/255,parseInt(t[2],16)/255,parseInt(t[3],16)/255);if(t=e.match(/^#?(\\w)(\\w)(\\w)$/))return new Qolor(parseInt(t[1]+t[1],16)/255,parseInt(t[2]+t[2],16)/255,parseInt(t[3]+t[3],16)/255);if(t=e.match(/rgba?\\((\\d+)\\D+(\\d+)\\D+(\\d+)(\\D+([\\d.]+))?\\)/))return new Qolor(parseFloat(t[1])/255,parseFloat(t[2])/255,parseFloat(t[3])/255,t[4]?parseFloat(t[5]):1)}return new Qolor},Qolor.fromHSL=function(e,t,r,n){var o=(new Qolor).fromHSL(e,t,r);return o.a=void 0===n?1:n,o},Qolor.prototype={isValid:function(){return void 0!==this.r&&void 0!==this.g&&void 0!==this.b},toHSL:function(){if(this.isValid()){var e,t,r=Math.max(this.r,this.g,this.b),n=Math.min(this.r,this.g,this.b),o=(r+n)/2,a=r-n;if(a){switch(t=o>.5?a/(2-r-n):a/(r+n),r){case this.r:e=(this.g-this.b)/a+(this.g<this.b?6:0);break;case this.g:e=(this.b-this.r)/a+2;break;case this.b:e=(this.r-this.g)/a+4}e*=60}else e=t=0;return{h:e,s:t,l:o}}},fromHSL:function(e,t,r){if(0===t)return this.r=this.g=this.b=r,this;var n=r<.5?r*(1+t):r+t-r*t,o=2*r-n;return e/=360,this.r=hue2rgb(o,n,e+1/3),this.g=hue2rgb(o,n,e),this.b=hue2rgb(o,n,e-1/3),this},toString:function(){if(this.isValid())return 1===this.a?"#"+((1<<24)+(Math.round(255*this.r)<<16)+(Math.round(255*this.g)<<8)+Math.round(255*this.b)).toString(16).slice(1,7):"rgba("+[Math.round(255*this.r),Math.round(255*this.g),Math.round(255*this.b),this.a.toFixed(2)].join(",")+")"},toArray:function(){if(this.isValid)return[this.r,this.g,this.b]},hue:function(e){var t=this.toHSL();return this.fromHSL(t.h+e,t.s,t.l)},saturation:function(e){var t=this.toHSL();return this.fromHSL(t.h,t.s*e,t.l)},lightness:function(e){var t=this.toHSL();return this.fromHSL(t.h,t.s,t.l*e)},clone:function(){return new Qolor(this.r,this.g,this.b,this.a)}};class OBJ{constructor(e,t,r){this.flipYZ=r,this.materialIndex={},this.vertexIndex=[],t&&this.readMTL(t),this.meshes=[],this.readOBJ(e)}readMTL(e){const t=e.split(/[\\r\\n]/g);let r,n=[];t.forEach(e=>{const t=e.trim().split(/\\s+/);switch(t[0]){case"newmtl":r&&(this.materialIndex[r]=n),r=t[1],n=[];break;case"Kd":n=[parseFloat(t[1]),parseFloat(t[2]),parseFloat(t[3])]}}),r&&(this.materialIndex[r]=n),e=null}readOBJ(e){let t,r,n=[];e.split(/[\\r\\n]/g).forEach(e=>{const o=e.trim().split(/\\s+/);switch(o[0]){case"g":case"o":this.storeMesh(t,r,n),t=o[1],n=[];break;case"usemtl":this.storeMesh(t,r,n),this.materialIndex[o[1]]&&(r=this.materialIndex[o[1]]),n=[];break;case"v":this.flipYZ?this.vertexIndex.push([parseFloat(o[1]),parseFloat(o[3]),parseFloat(o[2])]):this.vertexIndex.push([parseFloat(o[1]),parseFloat(o[2]),parseFloat(o[3])]);break;case"f":n.push([parseFloat(o[1])-1,parseFloat(o[2])-1,parseFloat(o[3])-1])}}),this.storeMesh(t,r,n)}storeMesh(e,t,r){if(r.length){const n=this.createGeometry(r);this.meshes.push({vertices:n.vertices,normals:n.normals,texCoords:n.texCoords,height:n.height,color:t,id:e})}}sub(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]}len(e){return Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2])}unit(e){const t=this.len(e);return[e[0]/t,e[1]/t,e[2]/t]}normal(e,t,r){const n=this.sub(e,t),o=this.sub(t,r);return this.unit([n[1]*o[2]-n[2]*o[1],n[2]*o[0]-n[0]*o[2],n[0]*o[1]-n[1]*o[0]])}createGeometry(e){const t=[],r=[],n=[];let o=-1/0;return e.forEach(e=>{const a=this.vertexIndex[e[0]],i=this.vertexIndex[e[1]],s=this.vertexIndex[e[2]],l=this.normal(a,i,s);t.push(a[0],a[2],a[1],i[0],i[2],i[1],s[0],s[2],s[1]),r.push(l[0],l[1],l[2],l[0],l[1],l[2],l[0],l[1],l[2]),n.push(0,0,0,0,0,0),o=Math.max(o,a[1],i[1],s[1])}),{vertices:t,normals:r,texCoords:n,height:o}}}OBJ.parse=function(e,t,r){return new OBJ(e,t,r).meshes};var earcut=function(){function e(e,o,a){a=a||2;var i,s,c,h,d,p,g,x=o&&o.length,v=x?o[0]*a:e.length,m=t(e,0,v,a,!0),y=[];if(!m)return y;if(x&&(m=function(e,n,o,a){var i,s,c,h,d,p=[];for(i=0,s=n.length;i<s;i++)c=n[i]*a,h=i<s-1?n[i+1]*a:e.length,(d=t(e,c,h,a,!1))===d.next&&(d.steiner=!0),p.push(u(d));for(p.sort(l),i=0;i<p.length;i++)f(p[i],o),o=r(o,o.next);return o}(e,o,m,a)),e.length>80*a){i=c=e[0],s=h=e[1];for(var b=a;b<v;b+=a)(d=e[b])<i&&(i=d),(p=e[b+1])<s&&(s=p),d>c&&(c=d),p>h&&(h=p);g=Math.max(c-i,h-s)}return n(m,y,a,i,s,g),y}function t(e,t,r,n,o){var a,i;if(o===w(e,t,r,n)>0)for(a=t;a<r;a+=n)i=y(a,e[a],e[a+1],i);else for(a=r-n;a>=t;a-=n)i=y(a,e[a],e[a+1],i);return i&&g(i,i.next)&&(b(i),i=i.next),i}function r(e,t){if(!e)return e;t||(t=e);var r,n=e;do{if(r=!1,n.steiner||!g(n,n.next)&&0!==p(n.prev,n,n.next))n=n.next;else{if(b(n),(n=t=n.prev)===n.next)return null;r=!0}}while(r||n!==t);return t}function n(e,t,l,f,u,h,d){if(e){!d&&h&&function(e,t,r,n){var o=e;do{null===o.z&&(o.z=c(o.x,o.y,t,r,n)),o.prevZ=o.prev,o.nextZ=o.next,o=o.next}while(o!==e);o.prevZ.nextZ=null,o.prevZ=null,function(e){var t,r,n,o,a,i,s,l,f=1;do{for(r=e,e=null,a=null,i=0;r;){for(i++,n=r,s=0,t=0;t<f&&(s++,n=n.nextZ);t++);for(l=f;s>0||l>0&&n;)0===s?(o=n,n=n.nextZ,l--):0!==l&&n?r.z<=n.z?(o=r,r=r.nextZ,s--):(o=n,n=n.nextZ,l--):(o=r,r=r.nextZ,s--),a?a.nextZ=o:e=o,o.prevZ=a,a=o;r=n}a.nextZ=null,f*=2}while(i>1)}(o)}(e,f,u,h);for(var p,g,x=e;e.prev!==e.next;)if(p=e.prev,g=e.next,h?a(e,f,u,h):o(e))t.push(p.i/l),t.push(e.i/l),t.push(g.i/l),b(e),e=g.next,x=g.next;else if((e=g)===x){d?1===d?n(e=i(e,t,l),t,l,f,u,h,2):2===d&&s(e,t,l,f,u,h):n(r(e),t,l,f,u,h,1);break}}}function o(e){var t=e.prev,r=e,n=e.next;if(p(t,r,n)>=0)return!1;for(var o=e.next.next;o!==e.prev;){if(h(t.x,t.y,r.x,r.y,n.x,n.y,o.x,o.y)&&p(o.prev,o,o.next)>=0)return!1;o=o.next}return!0}function a(e,t,r,n){var o=e.prev,a=e,i=e.next;if(p(o,a,i)>=0)return!1;for(var s=o.x<a.x?o.x<i.x?o.x:i.x:a.x<i.x?a.x:i.x,l=o.y<a.y?o.y<i.y?o.y:i.y:a.y<i.y?a.y:i.y,f=o.x>a.x?o.x>i.x?o.x:i.x:a.x>i.x?a.x:i.x,u=o.y>a.y?o.y>i.y?o.y:i.y:a.y>i.y?a.y:i.y,d=c(s,l,t,r,n),g=c(f,u,t,r,n),x=e.nextZ;x&&x.z<=g;){if(x!==e.prev&&x!==e.next&&h(o.x,o.y,a.x,a.y,i.x,i.y,x.x,x.y)&&p(x.prev,x,x.next)>=0)return!1;x=x.nextZ}for(x=e.prevZ;x&&x.z>=d;){if(x!==e.prev&&x!==e.next&&h(o.x,o.y,a.x,a.y,i.x,i.y,x.x,x.y)&&p(x.prev,x,x.next)>=0)return!1;x=x.prevZ}return!0}function i(e,t,r){var n=e;do{var o=n.prev,a=n.next.next;!g(o,a)&&x(o,n,n.next,a)&&v(o,a)&&v(a,o)&&(t.push(o.i/r),t.push(n.i/r),t.push(a.i/r),b(n),b(n.next),n=e=a),n=n.next}while(n!==e);return n}function s(e,t,o,a,i,s){var l=e;do{for(var f=l.next.next;f!==l.prev;){if(l.i!==f.i&&d(l,f)){var c=m(l,f);return l=r(l,l.next),c=r(c,c.next),n(l,t,o,a,i,s),void n(c,t,o,a,i,s)}f=f.next}l=l.next}while(l!==e)}function l(e,t){return e.x-t.x}function f(e,t){if(t=function(e,t){var r,n=t,o=e.x,a=e.y,i=-1/0;do{if(a<=n.y&&a>=n.next.y){var s=n.x+(a-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(s<=o&&s>i){if(i=s,s===o){if(a===n.y)return n;if(a===n.next.y)return n.next}r=n.x<n.next.x?n:n.next}}n=n.next}while(n!==t);if(!r)return null;if(o===i)return r.prev;var l,f=r,c=r.x,u=r.y,d=1/0;n=r.next;for(;n!==f;)o>=n.x&&n.x>=c&&h(a<u?o:i,a,c,u,a<u?i:o,a,n.x,n.y)&&((l=Math.abs(a-n.y)/(o-n.x))<d||l===d&&n.x>r.x)&&v(n,e)&&(r=n,d=l),n=n.next;return r}(e,t)){var n=m(t,e);r(n,n.next)}}function c(e,t,r,n,o){return(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=32767*(e-r)/o)|e<<8))|e<<4))|e<<2))|e<<1))|(t=1431655765&((t=858993459&((t=252645135&((t=16711935&((t=32767*(t-n)/o)|t<<8))|t<<4))|t<<2))|t<<1))<<1}function u(e){var t=e,r=e;do{t.x<r.x&&(r=t),t=t.next}while(t!==e);return r}function h(e,t,r,n,o,a,i,s){return(o-i)*(t-s)-(e-i)*(a-s)>=0&&(e-i)*(n-s)-(r-i)*(t-s)>=0&&(r-i)*(a-s)-(o-i)*(n-s)>=0}function d(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!function(e,t){var r=e;do{if(r.i!==e.i&&r.next.i!==e.i&&r.i!==t.i&&r.next.i!==t.i&&x(r,r.next,e,t))return!0;r=r.next}while(r!==e);return!1}(e,t)&&v(e,t)&&v(t,e)&&function(e,t){var r=e,n=!1,o=(e.x+t.x)/2,a=(e.y+t.y)/2;do{r.y>a!=r.next.y>a&&o<(r.next.x-r.x)*(a-r.y)/(r.next.y-r.y)+r.x&&(n=!n),r=r.next}while(r!==e);return n}(e,t)}function p(e,t,r){return(t.y-e.y)*(r.x-t.x)-(t.x-e.x)*(r.y-t.y)}function g(e,t){return e.x===t.x&&e.y===t.y}function x(e,t,r,n){return!!(g(e,t)&&g(r,n)||g(e,n)&&g(r,t))||p(e,t,r)>0!=p(e,t,n)>0&&p(r,n,e)>0!=p(r,n,t)>0}function v(e,t){return p(e.prev,e,e.next)<0?p(e,t,e.next)>=0&&p(e,e.prev,t)>=0:p(e,t,e.prev)<0||p(e,e.next,t)<0}function m(e,t){var r=new M(e.i,e.x,e.y),n=new M(t.i,t.x,t.y),o=e.next,a=t.prev;return e.next=t,t.prev=e,r.next=o,o.prev=r,n.next=r,r.prev=n,a.next=n,n.prev=a,n}function y(e,t,r,n){var o=new M(e,t,r);return n?(o.next=n.next,o.prev=n,n.next.prev=o,n.next=o):(o.prev=o,o.next=o),o}function b(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function M(e,t,r){this.i=e,this.x=t,this.y=r,this.prev=null,this.next=null,this.z=null,this.prevZ=null,this.nextZ=null,this.steiner=!1}function w(e,t,r,n){for(var o=0,a=t,i=r-n;a<r;a+=n)o+=(e[i]-e[a])*(e[a+1]+e[i+1]),i=a;return o}return e.deviation=function(e,t,r,n){var o,a,i=t&&t.length,s=i?t[0]*r:e.length,l=Math.abs(w(e,0,s,r));if(i)for(o=0,a=t.length;o<a;o++){var f=t[o]*r,c=o<a-1?t[o+1]*r:e.length;l-=Math.abs(w(e,f,c,r))}var u=0;for(o=0,a=n.length;o<a;o+=3){var h=n[o]*r,d=n[o+1]*r,p=n[o+2]*r;u+=Math.abs((e[h]-e[p])*(e[d+1]-e[h+1])-(e[h]-e[d])*(e[p+1]-e[h+1]))}return 0===l&&0===u?0:Math.abs((u-l)/l)},e.flatten=function(e){for(var t=e[0][0].length,r={vertices:[],holes:[],dimensions:t},n=0,o=0;o<e.length;o++){for(var a=0;a<e[o].length;a++)for(var i=0;i<t;i++)r.vertices.push(e[o][a][i]);o>0&&(n+=e[o-1].length,r.holes.push(n))}return r},e}();const triangulate=function(){const e=10,t=[.8627450980392157,.8235294117647058,.7843137254901961],r=3,n={brick:"#cc7755",bronze:"#ffeecc",canvas:"#fff8f0",concrete:"#999999",copper:"#a0e0d0",glass:"#e8f8f8",gold:"#ffcc00",plants:"#009933",metal:"#aaaaaa",panel:"#fff8f0",plaster:"#999999",roof_tiles:"#f08060",silver:"#cccccc",slate:"#666666",stone:"#996666",tar_paper:"#333333",wood:"#deb887"},o={asphalt:"tar_paper",bitumen:"tar_paper",block:"stone",bricks:"brick",glas:"glass",glassfront:"glass",grass:"plants",masonry:"stone",granite:"stone",panels:"panel",paving_stones:"stone",plastered:"plaster",rooftiles:"roof_tiles",roofingfelt:"tar_paper",sandstone:"stone",sheet:"canvas",sheets:"canvas",shingle:"tar_paper",shingles:"tar_paper",slates:"slate",steel:"metal",tar:"tar_paper",tent:"canvas",thatch:"plants",tile:"roof_tiles",tiles:"roof_tiles"},a=.5,i=6378137*Math.PI/180;function s(e){return"string"!=typeof e?null:"#"===(e=e.toLowerCase())[0]?e:n[o[e]||e]||null}function l(e,r){r=r||0;let n,o=Qolor.parse(e);return[(n=o.isValid()?o.saturation(.7).toArray():t)[0]+r,n[1]+r,n[2]+r]}return function(t,n,o,f,c){const u=[i*Math.cos(o[1]/180*Math.PI),i];(function(e){switch(e.type){case"MultiPolygon":return e.coordinates;case"Polygon":return[e.coordinates];default:return[]}})(n.geometry).map(i=>{const h=function(e,t,r){return e.map((e,n)=>(0===n!==function(e){return 0<e.reduce((e,t,r,n)=>e+(r<n.length-1?(n[r+1][0]-t[0])*(n[r+1][1]+t[1]):0),0)}(e)&&e.reverse(),e.map(function(e){return[(e[0]-t[0])*r[0],-(e[1]-t[1])*r[1]]})))}(i,o,u);!function(t,n,o,i,f){const c=function(t,n){const o={};switch(o.center=[n.minX+(n.maxX-n.minX)/2,n.minY+(n.maxY-n.minY)/2],o.radius=(n.maxX-n.minX)/2,o.roofHeight=t.roofHeight||(t.roofLevels?t.roofLevels*r:0),t.roofShape){case"cone":case"pyramid":case"dome":case"onion":o.roofHeight=o.roofHeight||1*o.radius;break;case"gabled":case"hipped":case"half-hipped":case"skillion":case"gambrel":case"mansard":case"round":o.roofHeight=o.roofHeight||1*r;break;case"flat":o.roofHeight=0;break;default:o.roofHeight=0}let a;if(o.wallZ=t.minHeight||(t.minLevel?t.minLevel*r:0),void 0!==t.height)a=t.height,o.roofHeight=Math.min(o.roofHeight,a),o.roofZ=a-o.roofHeight,o.wallHeight=a-o.roofHeight-o.wallZ;else if(void 0!==t.levels)a=t.levels*r,o.roofZ=a,o.wallHeight=a-o.wallZ;else{switch(t.shape){case"cone":case"dome":case"pyramid":a=2*o.radius,o.roofHeight=0;break;case"sphere":a=4*o.radius,o.roofHeight=0;break;case"none":a=0;break;default:a=e}o.roofZ=a,o.wallHeight=a-o.wallZ}return o}(n,function(e){let t=1/0,r=1/0,n=-1/0,o=-1/0;for(let a=0;a<e.length;a++)t=Math.min(t,e[a][0]),r=Math.min(r,e[a][1]),n=Math.max(n,e[a][0]),o=Math.max(o,e[a][1]);return{minX:t,minY:r,maxX:n,maxY:o}}(o[0])),u=l(i||n.wallColor||n.color||s(n.material),f),h=l(i||n.roofColor||s(n.roofMaterial),f);switch(n.shape){case"cone":return void split.cylinder(t,c.center,c.radius,0,c.wallHeight,c.wallZ,u);case"dome":return void split.dome(t,c.center,c.radius,c.wallHeight,c.wallZ,u);case"pyramid":return void split.pyramid(t,o,c.center,c.wallHeight,c.wallZ,u);case"sphere":return void split.sphere(t,c.center,c.radius,c.wallHeight,c.wallZ,u)}switch(createRoof(t,n,o,c,h,u),n.shape){case"none":return;case"cylinder":return void split.cylinder(t,c.center,c.radius,c.radius,c.wallHeight,c.wallZ,u);default:let e=.2,r=.4;"glass"!==n.material&&(e=0,r=0,n.levels&&(r=parseFloat(n.levels)-parseFloat(n.minLevel||0)<<0)),split.extrusion(t,o,c.wallHeight,c.wallZ,u,[0,a,e/c.wallHeight,r/c.wallHeight])}}(t,n.properties,h,f,c)})}}();var createRoof;function roundPoint(e,t){return[Math.round(e[0]*t)/t,Math.round(e[1]*t)/t]}function pointOnSegment(e,t){return e=roundPoint(e,1e6),t[0]=roundPoint(t[0],1e6),t[1]=roundPoint(t[1],1e6),e[0]>=Math.min(t[0][0],t[1][0])&&e[0]<=Math.max(t[1][0],t[0][0])&&e[1]>=Math.min(t[0][1],t[1][1])&&e[1]<=Math.max(t[1][1],t[0][1])}function getVectorSegmentIntersection(e,t,r){var n,o,a,i,s,l=r[0],f=[r[1][0]-r[0][0],r[1][1]-r[0][1]];if(0!==t[0]||0!==f[0]){if(0!==t[0]&&(a=t[1]/t[0],n=e[1]-a*e[0]),0!==f[0]&&(i=f[1]/f[0],o=l[1]-i*l[0]),0===t[0]&&pointOnSegment(s=[e[0],i*e[0]+o],r))return s;if(0===f[0]&&pointOnSegment(s=[l[0],a*l[0]+n],r))return s;if(a!==i){var c=(o-n)/(a-i);return pointOnSegment(s=[c,a*c+n],r)?s:void 0}}}function getDistanceToLine(e,t){var r=t[0],n=t[1];if(r[0]!==n[0]||r[1]!==n[1]){var o=(n[1]-r[1])/(n[0]-r[0]),a=r[1]-o*r[0];if(0===o)return Math.abs(a-e[1]);if(o===1/0)return Math.abs(r[0]-e[0]);var i=-1/o,s=(e[1]-i*e[0]-a)/(o-i),l=o*s+a,f=e[0]-s,c=e[1]-l;return Math.sqrt(f*f+c*c)}}!function(){function e(e,t,r){const n=((e-90)/180-.5)*Math.PI;return function(e,t,r){for(var n,o=[],a=0;a<r.length-1;a++)if(void 0!==(n=getVectorSegmentIntersection(e,t,[r[a],r[a+1]]))){if(2===o.length)return;a++,r.splice(a,0,n),o.push(a)}if(!(o.length<2))return{index:o,roof:r}}(t,[Math.cos(n),Math.sin(n)],r)}function t(t,n,o,a,i,s,l){if(0,o.length>1||void 0===n.roofDirection)return r(t,n,o,i,s);const f=e(n.roofDirection,i.center,o[0]);if(!f)return r(t,n,o,i,s);const c=f.index;let u=f.roof;{const e=function(e,t){const r=[e[t[0]],e[t[1]]];return e.map(e=>getDistanceToLine(e,r))}(u,f.index),r=Math.max(...e);let n=(u=u.map((t,n)=>[t[0],t[1],(1-e[n]/r)*i.roofHeight])).slice(c[0],c[1]+1);split.polygon(t,[n],i.roofZ,s),n=(n=u.slice(c[1],u.length-1)).concat(u.slice(0,c[0]+1)),split.polygon(t,[n],i.roofZ,s);for(let e=0;e<u.length-1;e++)0===u[e][2]&&0===u[e+1][2]||split.quad(t,[u[e][0],u[e][1],i.roofZ+u[e][2]],[u[e][0],u[e][1],i.roofZ],[u[e+1][0],u[e+1][1],i.roofZ],[u[e+1][0],u[e+1][1],i.roofZ+u[e+1][2]],l)}}function r(e,t,r,n,o){"cylinder"===t.shape?split.circle(e,n.center,n.radius,n.roofZ,o):split.polygon(e,r,n.roofZ,o)}createRoof=function(e,n,o,a,i,s){switch(n.roofShape){case"cone":return function(e,t,r,n){split.polygon(e,t,r.roofZ,n),split.cylinder(e,r.center,r.radius,0,r.roofHeight,r.roofZ,n)}(e,o,a,i);case"dome":return function(e,t,r,n){split.polygon(e,t,r.roofZ,n),split.dome(e,r.center,r.radius,r.roofHeight,r.roofZ,n)}(e,o,a,i);case"pyramid":return function(e,t,r,n,o){"cylinder"===t.shape?split.cylinder(e,n.center,n.radius,0,n.roofHeight,n.roofZ,o):split.pyramid(e,r,n.center,n.roofHeight,n.roofZ,o)}(e,n,o,a,i);case"skillion":return function(e,t,n,o,a,i){if(void 0===t.roofDirection)return r(e,t,n,o,a);var s,l,f=t.roofDirection/180*Math.PI,c=1/0,u=-1/0;n[0].forEach(function(e){var t=e[1]*Math.cos(-f)+e[0]*Math.sin(-f);t<c&&(c=t,s=e),t>u&&(u=t,l=e)});var h=n[0],d=[Math.cos(f),Math.sin(f)],p=[s,[s[0]+d[0],s[1]+d[1]]],g=getDistanceToLine(l,p);n.forEach(function(e){e.forEach(function(e){var t=getDistanceToLine(e,p);e[2]=t/g*o.roofHeight})}),split.polygon(e,[h],o.roofZ,a),n.forEach(function(t){for(var r=0;r<t.length-1;r++)0===t[r][2]&&0===t[r+1][2]||split.quad(e,[t[r][0],t[r][1],o.roofZ+t[r][2]],[t[r][0],t[r][1],o.roofZ],[t[r+1][0],t[r+1][1],o.roofZ],[t[r+1][0],t[r+1][1],o.roofZ+t[r+1][2]],i)})}(e,n,o,a,i,s);case"gabled":case"hipped":case"half-hipped":case"gambrel":case"mansard":return t(e,n,o,0,a,i,s);case"round":return function(e,t,n,o,a,i){if(n.length>1||void 0===t.roofDirection)return r(e,t,n,o,a);return r(e,t,n,o,a)}(e,n,o,a,i);case"onion":return function(e,t,r,n){split.polygon(e,t,r.roofZ,n);for(var o,a,i=[{rScale:.8,hScale:0},{rScale:.9,hScale:.18},{rScale:.9,hScale:.35},{rScale:.8,hScale:.47},{rScale:.6,hScale:.59},{rScale:.5,hScale:.65},{rScale:.2,hScale:.82},{rScale:0,hScale:1}],s=0,l=i.length-1;s<l;s++)o=r.roofHeight*i[s].hScale,a=r.roofHeight*i[s+1].hScale,split.cylinder(e,r.center,r.radius*i[s].rScale,r.radius*i[s+1].rScale,a-o,r.roofZ+o,n)}(e,o,a,i);case"flat":default:return r(e,n,o,a,i)}}}();const split={NUM_Y_SEGMENTS:24,NUM_X_SEGMENTS:32,quad:(e,t,r,n,o,a)=>{split.triangle(e,t,r,n,a),split.triangle(e,n,o,t,a)},triangle:(e,t,r,n,o)=>{const a=vec3.normal(t,r,n);e.vertices.push(...t,...n,...r),e.normals.push(...a,...a,...a),e.colors.push(...o,...o,...o),e.texCoords.push(0,0,0,0,0,0)},circle:(e,t,r,n,o)=>{let a,i;n=n||0;for(let s=0;s<split.NUM_X_SEGMENTS;s++)a=s/split.NUM_X_SEGMENTS,i=(s+1)/split.NUM_X_SEGMENTS,split.triangle(e,[t[0]+r*Math.sin(a*Math.PI*2),t[1]+r*Math.cos(a*Math.PI*2),n],[t[0],t[1],n],[t[0]+r*Math.sin(i*Math.PI*2),t[1]+r*Math.cos(i*Math.PI*2),n],o)},polygon:(e,t,r,n)=>{r=r||0;const o=[],a=[];let i=0;t.forEach((e,n)=>{e.forEach(e=>{o.push(e[0],e[1],r+(e[2]||0))}),n&&(i+=t[n-1].length,a.push(i))});const s=earcut(o,a,3);for(let t=0;t<s.length-2;t+=3){const r=3*s[t],a=3*s[t+1],i=3*s[t+2];split.triangle(e,[o[r],o[r+1],o[r+2]],[o[a],o[a+1],o[a+2]],[o[i],o[i+1],o[i+2]],n)}},cube:(e,t,r,n,o,a,i,s)=>{const l=[o=o||0,a=a||0,i=i||0],f=[o+t,a,i],c=[o+t,a+r,i],u=[o,a+r,i],h=[o,a,i+n],d=[o+t,a,i+n],p=[o+t,a+r,i+n],g=[o,a+r,i+n];split.quad(e,f,l,u,c,s),split.quad(e,h,d,p,g,s),split.quad(e,l,f,d,h,s),split.quad(e,f,c,p,d,s),split.quad(e,c,u,g,p,s),split.quad(e,u,l,h,g,s)},cylinder:(e,t,r,n,o,a,i)=>{a=a||0;const s=split.NUM_X_SEGMENTS,l=2*Math.PI;let f,c,u,h,d,p;for(let g=0;g<s;g++)f=g/s*l,c=(g+1)/s*l,u=Math.sin(f),h=Math.cos(f),d=Math.sin(c),p=Math.cos(c),split.triangle(e,[t[0]+r*u,t[1]+r*h,a],[t[0]+n*d,t[1]+n*p,a+o],[t[0]+r*d,t[1]+r*p,a],i),0!==n&&split.triangle(e,[t[0]+n*u,t[1]+n*h,a+o],[t[0]+n*d,t[1]+n*p,a+o],[t[0]+r*u,t[1]+r*h,a],i)},dome:(e,t,r,n,o,a,i)=>{o=o||0;const s=split.NUM_Y_SEGMENTS/2,l=Math.PI/2,f=i?0:-l;let c,u,h,d,p,g,x,v,m,y;for(let i=0;i<s;i++)c=i/s*l+f,u=(i+1)/s*l+f,h=Math.cos(c),d=Math.sin(c),x=h*r,v=(p=Math.cos(u))*r,m=((g=Math.sin(u))-d)*n,y=o-g*n,split.cylinder(e,t,v,x,m,y,a)},sphere:(e,t,r,n,o,a)=>{o=o||0;let i=0;return i+=split.dome(e,t,r,n/2,o+n/2,a,!0),i+=split.dome(e,t,r,n/2,o+n/2,a)},pyramid:(e,t,r,n,o,a)=>{o=o||0;for(let i=0,s=(t=t[0]).length-1;i<s;i++)split.triangle(e,[t[i][0],t[i][1],o],[t[i+1][0],t[i+1][1],o],[r[0],r[1],o+n],a)},extrusion:(e,t,r,n,o,a)=>{n=n||0;let i,s,l,f,c,u,h,d,p,g,x,v,m=a[2]*r,y=a[3]*r;t.forEach(t=>{for(x=0,v=t.length-1;x<v;x++)i=t[x],s=t[x+1],l=vec2.len(vec2.sub(i,s)),f=[i[0],i[1],n],c=[s[0],s[1],n],u=[s[0],s[1],n+r],h=[i[0],i[1],n+r],d=vec3.normal(f,c,u),[].push.apply(e.vertices,[].concat(f,u,c,f,h,u)),[].push.apply(e.normals,[].concat(d,d,d,d,d,d)),[].push.apply(e.colors,[].concat(o,o,o,o,o,o)),p=a[0]*l<<0,g=a[1]*l<<0,e.texCoords.push(p,y,g,m,g,y,p,y,p,m,g,m)})}},vec3={len:e=>Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2]),sub:(e,t)=>[e[0]-t[0],e[1]-t[1],e[2]-t[2]],unit:e=>{const t=vec3.len(e);return[e[0]/t,e[1]/t,e[2]/t]},normal:(e,t,r)=>{const n=vec3.sub(e,t),o=vec3.sub(t,r);return vec3.unit([n[1]*o[2]-n[2]*o[1],n[2]*o[0]-n[0]*o[2],n[0]*o[1]-n[1]*o[0]])}},vec2={len:e=>Math.sqrt(e[0]*e[0]+e[1]*e[1]),add:(e,t)=>[e[0]+t[0],e[1]+t[1]],sub:(e,t)=>[e[0]-t[0],e[1]-t[1]],dot:(e,t)=>e[1]*t[0]-e[0]*t[1],scale:(e,t)=>[e[0]*t,e[1]*t],equals:(e,t)=>e[0]===t[0]&&e[1]===t[1]};function getGeoJSONBounds(e){const t=e.type,r=e.coordinates,n=[1/0,1/0],o=[-1/0,-1/0];return"Polygon"===t&&r.length?(r[0].forEach(e=>{e[0]<n[0]&&(n[0]=e[0]),e[1]<n[1]&&(n[1]=e[1]),e[0]>o[0]&&(o[0]=e[0]),e[1]>o[1]&&(o[1]=e[1])}),{min:n,max:o}):"MultiPolygon"===t?(r.forEach(e=>{e[0]&&e[0].forEach(e=>{e[0]<n[0]&&(n[0]=e[0]),e[1]<n[1]&&(n[1]=e[1]),e[0]>o[0]&&(o[0]=e[0]),e[1]>o[1]&&(o[1]=e[1])})}),{min:n,max:o}):void 0}function getOBJBounds(e){const t=[1/0,1/0],r=[-1/0,-1/0];for(let n=0;n<e.length;n+=3)e[n]<t[0]&&(t[0]=e[0]),e[n+1]<t[1]&&(t[1]=e[n+1]),e[0]>r[0]&&(r[0]=e[0]),e[n+1]>r[1]&&(r[1]=e[n+1]);return t[0]*=METERS_PER_DEGREE_LATITUDE*Math.cos(t[1]/180*Math.PI),t[1]*=METERS_PER_DEGREE_LATITUDE,r[0]*=METERS_PER_DEGREE_LATITUDE*Math.cos(r[1]/180*Math.PI),r[1]*=METERS_PER_DEGREE_LATITUDE,{min:t,max:r}}const METERS_PER_DEGREE_LATITUDE=6378137*Math.PI/180;function getOrigin(e){const t=e.coordinates;switch(e.type){case"Point":return t;case"MultiPoint":case"LineString":return t[0];case"MultiLineString":case"Polygon":return t[0][0];case"MultiPolygon":return t[0][0][0]}}function getPickingColor(e){return[0,(255&++e)/255,(e>>8&255)/255]}function postResult(e,t,r){const n={items:e,position:t,vertices:new Float32Array(r.vertices),normals:new Float32Array(r.normals),colors:new Float32Array(r.colors),texCoords:new Float32Array(r.texCoords),heights:new Float32Array(r.heights),pickingColors:new Float32Array(r.pickingColors)};postMessage(n,[n.vertices.buffer,n.normals.buffer,n.colors.buffer,n.texCoords.buffer,n.heights.buffer,n.pickingColors.buffer])}function loadGeoJSON(e,t={}){"object"==typeof e?(postMessage("load"),processGeoJSON(e,t)):Request.getJSON(e,(e,r)=>{e?postMessage("error"):(postMessage("load"),processGeoJSON(r,t))})}function processGeoJSON(e,t){if(!e||!e.features.length)return void postMessage("error");const r={vertices:[],normals:[],colors:[],texCoords:[],heights:[],pickingColors:[]},n=[],o=getOrigin(e.features[0].geometry),a={latitude:o[1],longitude:o[0]};e.features.forEach((e,a)=>{const i=e.properties,s=t.id||e.id,l=getPickingColor(a);let f=r.vertices.length;triangulate(r,e,o),f=(r.vertices.length-f)/3;for(let e=0;e<f;e++)r.heights.push(i.height),r.pickingColors.push(...l);i.bounds=getGeoJSONBounds(e.geometry),n.push({id:s,properties:i,vertexCount:f})}),postResult(n,a,r)}function loadOBJ(e,t={}){Request.getText(e,(r,n)=>{if(r)return void postMessage("error");let o=n.match(/^mtllib\\s+(.*)$/m);o?Request.getText(e.replace(/[^\\/]+$/,"")+o[1],(e,r)=>{e?postMessage("error"):(postMessage("load"),processOBJ(n,r,t))}):(postMessage("load"),processOBJ(n,null,t))})}function processOBJ(e,t,r={}){const n={vertices:[],normals:[],colors:[],texCoords:[],heights:[],pickingColors:[]},o=[],a=Qolor.parse(r.color).toArray(),i=r.position;OBJ.parse(e,t,r.flipYZ).forEach((e,t)=>{n.vertices.push(...e.vertices),n.normals.push(...e.normals),n.texCoords.push(...e.texCoords);const i=r.id||e.id,s={},l=(i/2%2?-1:1)*(i%2?.03:.06),f=a||e.color||DEFAULT_COLOR,c=e.vertices.length/3,u=getPickingColor(t);for(let t=0;t<c;t++)n.colors.push(f[0]+l,f[1]+l,f[2]+l),n.heights.push(e.height),n.pickingColors.push(...u);s.height=e.height,s.color=e.color,s.bounds=getOBJBounds(e.vertices),o.push({id:i,properties:s,vertexCount:c})}),postResult(o,i,n)}onmessage=function(e){const t=e.data;"GeoJSON"===t.type&&loadGeoJSON(t.url,t.options),"OBJ"===t.type&&loadOBJ(t.url,t.options)};';
    
    
    
    class GLX {
    
      constructor(canvas, fastMode) {
        let GL;
    
        const canvasOptions = {
          antialias: !fastMode,
          depth: true,
          premultipliedAlpha: false
        };
    
        try {
          GL = canvas.getContext('webgl', canvasOptions);
        } catch (ex) {}
    
        if (!GL) {
          try {
            GL = canvas.getContext('experimental-webgl', canvasOptions);
          } catch (ex) {}
        }
    
        if (!GL) {
          throw new Error('GL not supported');
        }
    
        canvas.addEventListener('webglcontextlost', e => {
          console.warn('context lost');
        });
    
        canvas.addEventListener('webglcontextrestored', e => {
          console.warn('context restored');
        });
    
        GL.viewport(0, 0, canvas.width, canvas.height);
        GL.cullFace(GL.BACK);
        GL.enable(GL.CULL_FACE);
        GL.enable(GL.DEPTH_TEST);
        GL.clearColor(0.5, 0.5, 0.5, 1);
    
        if (!fastMode) { // TODO OSMB4 always activate but use dynamically
          GL.anisotropyExtension = GL.getExtension('EXT_texture_filter_anisotropic');
          if (GL.anisotropyExtension) {
            GL.anisotropyExtension.maxAnisotropyLevel = GL.getParameter(GL.anisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
          }
          GL.depthTextureExtension = GL.getExtension('WEBGL_depth_texture');
        }
    
        this.GL = GL;
      }
    
      destroy () {
        const ext = this.GL.getExtension('WEBGL_lose_context');
        ext.loseContext();
        this.GL = null;
      }
    }
    
    GLX.Buffer = class {
    
      constructor (itemSize, data) {
        this.id = GL.createBuffer();
        this.itemSize = itemSize;
        this.numItems = data.length / itemSize;
        GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
        GL.bufferData(GL.ARRAY_BUFFER, data, GL.STATIC_DRAW);
        data = null; // gc
      }
    
      // DEPRECATED
      enable () {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
      }
    
      use () {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.id);
      }
    
      destroy () {
        GL.deleteBuffer(this.id);
        this.id = null;
      }
    };
    
    
    GLX.Framebuffer = class {
    
      constructor(width, height, useDepthTexture) {
        if (useDepthTexture && !GL.depthTextureExtension) {
          throw new Error('GL: Depth textures are not supported');
        }
    
        this.useDepthTexture = !!useDepthTexture;
        this.setSize(width, height);
      }
    
      setSize(width, height) {
        if (!this.frameBuffer) {
          this.frameBuffer = GL.createFramebuffer();
        } else if (width === this.width && height === this.height) { // already has the right size
          return;
        }
    
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);
    
        this.width  = width;
        this.height = height;
        
        if (this.depthRenderBuffer) {
          GL.deleteRenderbuffer(this.depthRenderBuffer);
          this.depthRenderBuffer = null;
        } 
        
        if (this.depthTexture) {
          this.depthTexture.destroy();
          this.depthTexture = null;
        }
        
        if (this.useDepthTexture) {
          this.depthTexture = new GLX.texture.Image(); // GL.createTexture();
          this.depthTexture.enable(0);
          GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
          GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
          // CLAMP_TO_EDGE is required for NPOT textures
          GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
          GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
          GL.texImage2D(GL.TEXTURE_2D, 0, GL.DEPTH_STENCIL, width, height, 0, GL.DEPTH_STENCIL, GL.depthTextureExtension.UNSIGNED_INT_24_8_WEBGL, null);
          GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.TEXTURE_2D, this.depthTexture.id, 0);
        } else {
          this.depthRenderBuffer = GL.createRenderbuffer();
          GL.bindRenderbuffer(GL.RENDERBUFFER, this.depthRenderBuffer);
          GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, width, height);
          GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.depthRenderBuffer);
        }
    
        if (this.renderTexture) {
          this.renderTexture.destroy();
        }
    
        this.renderTexture = new GLX.texture.Data(GL, width, height);
        GL.bindTexture(GL.TEXTURE_2D, this.renderTexture.id);
    
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE); //necessary for NPOT textures
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.renderTexture.id, 0);
    
        if (GL.checkFramebufferStatus(GL.FRAMEBUFFER) !== GL.FRAMEBUFFER_COMPLETE) {
          throw new Error('Combination of framebuffer attachments doesn\'t work');
        }
    
        GL.bindRenderbuffer(GL.RENDERBUFFER, null);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
      }
    
      enable() {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.frameBuffer);
    
        if (!this.useDepthTexture) {
          GL.bindRenderbuffer(GL.RENDERBUFFER, this.depthRenderBuffer);
        }
      }
    
      disable() {
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        if (!this.useDepthTexture) {
          GL.bindRenderbuffer(GL.RENDERBUFFER, null);
        }
      }
    
      getPixel(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
          return;
        }
        const imageData = new Uint8Array(4);
        GL.readPixels(x, y, 1, 1, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
        return imageData;
      }
    
      getData() {
        const imageData = new Uint8Array(this.width*this.height*4);
        GL.readPixels(0, 0, this.width, this.height, GL.RGBA, GL.UNSIGNED_BYTE, imageData);
        return imageData;
      }
    
      destroy() {
        if (this.renderTexture) {
          this.renderTexture.destroy();
        }
        
        if (this.depthTexture) {
          this.depthTexture.destroy();
        }
      }
    };
    
    GLX.Shader = class {
    
      constructor (config) {
        this.name = config.source.name || '';
        this.id = GL.createProgram();
    
        this.compile(GL.VERTEX_SHADER, config.source.vs);
        this.compile(GL.FRAGMENT_SHADER, config.source.fs);
    
        GL.linkProgram(this.id);
    
        if (!GL.getProgramParameter(this.id, GL.LINK_STATUS)) {
          throw new Error(GL.getProgramParameter(this.id, GL.VALIDATE_STATUS) + '\n' + GL.getError());
        }
    
        GL.useProgram(this.id);
    
        this.attributes = {};
        (config.attributes || []).forEach(item => {
          this.locateAttribute(item);
        });
    
        this.uniforms = {};
        (config.uniforms || []).forEach(item => {
          this.locateUniform(item);
        });
      }
    
      locateAttribute (name) {
        const loc = GL.getAttribLocation(this.id, name);
        if (loc < 0) {
          throw new Error(`unable to locate attribute "${name}" in shader "${this.name}"`);
        }
        this.attributes[name] = loc;
      }
    
      locateUniform (name) {
        const loc = GL.getUniformLocation(this.id, name);
        if (!loc) {
          throw new Error(`unable to locate uniform "${name}" in shader "${this.name}"`);
        }
        this.uniforms[name] = loc;
      }
    
      compile (type, src) {
        const shader = GL.createShader(type);
        GL.shaderSource(shader, src);
        GL.compileShader(shader);
    
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
          throw new Error(GL.getShaderInfoLog(shader));
        }
    
        GL.attachShader(this.id, shader);
      }
    
      enable () {
        GL.useProgram(this.id);
        for (let name in this.attributes) {
          GL.enableVertexAttribArray(this.attributes[name]);
        }
      }
    
      disable () {
        if (this.attributes) {
          for (let name in this.attributes) {
            GL.disableVertexAttribArray(this.attributes[name]);
          }
        }
      }
    
      setBuffer (name, buffer) {
        if (this.attributes[name] === undefined) {
          throw new Error(`attempt to bind buffer to invalid attribute "${name}" in shader "${this.name}"`);
        }
        buffer.enable();
        GL.vertexAttribPointer(this.attributes[name], buffer.itemSize, GL.FLOAT, false, 0, 0);
      }
    
      setParam (name, type, value) {
        if (this.uniforms[name] === undefined) {
          throw new Error(`attempt to bind to invalid uniform "${name}" in shader "${this.name}"`);
        }
        GL['uniform' + type](this.uniforms[name], value);
      }
    
      setMatrix (name, type, value) {
        if (this.uniforms[name] === undefined) {
          throw new Error(`attempt to bind to invalid uniform "${name}" in shader "${this.name}"`);
        }
        GL['uniformMatrix' + type](this.uniforms[name], false, value);
      }
    
      setTexture (uniform, textureUnit, glxTexture) {
        glxTexture.enable(textureUnit);
        this.setParam(uniform, '1i', textureUnit);
      }
    
      destroy () {
        this.disable();
        this.id = null;
      }
    };
    
    
    function rad (a) {
      return a * Math.PI/180;
    }
    
    function multiply (res, a, b) {
      const
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15],
    
        b00 = b[0],
        b01 = b[1],
        b02 = b[2],
        b03 = b[3],
        b10 = b[4],
        b11 = b[5],
        b12 = b[6],
        b13 = b[7],
        b20 = b[8],
        b21 = b[9],
        b22 = b[10],
        b23 = b[11],
        b30 = b[12],
        b31 = b[13],
        b32 = b[14],
        b33 = b[15];
    
      res[ 0] = a00*b00 + a01*b10 + a02*b20 + a03*b30;
      res[ 1] = a00*b01 + a01*b11 + a02*b21 + a03*b31;
      res[ 2] = a00*b02 + a01*b12 + a02*b22 + a03*b32;
      res[ 3] = a00*b03 + a01*b13 + a02*b23 + a03*b33;
    
      res[ 4] = a10*b00 + a11*b10 + a12*b20 + a13*b30;
      res[ 5] = a10*b01 + a11*b11 + a12*b21 + a13*b31;
      res[ 6] = a10*b02 + a11*b12 + a12*b22 + a13*b32;
      res[ 7] = a10*b03 + a11*b13 + a12*b23 + a13*b33;
    
      res[ 8] = a20*b00 + a21*b10 + a22*b20 + a23*b30;
      res[ 9] = a20*b01 + a21*b11 + a22*b21 + a23*b31;
      res[10] = a20*b02 + a21*b12 + a22*b22 + a23*b32;
      res[11] = a20*b03 + a21*b13 + a22*b23 + a23*b33;
    
      res[12] = a30*b00 + a31*b10 + a32*b20 + a33*b30;
      res[13] = a30*b01 + a31*b11 + a32*b21 + a33*b31;
      res[14] = a30*b02 + a31*b12 + a32*b22 + a33*b32;
      res[15] = a30*b03 + a31*b13 + a32*b23 + a33*b33;
    }
    
    //*****************************************************************************
    
    GLX.Matrix = class {
    
      constructor (data) {
        this.data = new Float32Array(data ? data : [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        ]);
      }
    
      multiply (m) {
        multiply(this.data, this.data, m.data);
        return this;
      }
    
      translateTo (x, y, z) {
        this.data[12] = x;
        this.data[13] = y;
        this.data[14] = z;
        return this;
      }
    
      translateBy (x, y, z) {
        multiply(this.data, this.data, [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          x, y, z, 1
        ]);
        return this;
      }
    
      rotateX (angle) {
        const a = rad(angle), c = Math.cos(a), s = Math.sin(a);
        multiply(this.data, this.data, [
          1, 0, 0, 0,
          0, c, s, 0,
          0, -s, c, 0,
          0, 0, 0, 1
        ]);
        return this;
      }
    
      rotateY (angle) {
        const a = rad(angle), c = Math.cos(a), s = Math.sin(a);
        multiply(this.data, this.data, [
          c, 0, -s, 0,
          0, 1, 0, 0,
          s, 0, c, 0,
          0, 0, 0, 1
        ]);
        return this;
      }
    
      rotateZ (angle) {
        const a = rad(angle), c = Math.cos(a), s = Math.sin(a);
        multiply(this.data, this.data, [
          c, -s, 0, 0,
          s, c, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        ]);
        return this;
      }
    
      scale (x, y, z) {
        multiply(this.data, this.data, [
          x, 0, 0, 0,
          0, y, 0, 0,
          0, 0, z, 0,
          0, 0, 0, 1
        ]);
        return this;
      }
    };
    
    GLX.Matrix.multiply = (a, b) => {
      const res = new Float32Array(16);
      multiply(res, a.data, b.data);
      return res;
    };
    
    // returns a perspective projection matrix with a field-of-view of 'fov'
    // degrees, an width/height aspect ratio of 'aspect', the near plane at 'near'
    // and the far plane at 'far'
    GLX.Matrix.Perspective = class extends GLX.Matrix {
      constructor (fov, aspect, near, far) {
        const
          f = 1 / Math.tan(fov * (Math.PI / 180) / 2),
          nf = 1 / (near - far);
    
        super([
          f / aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (far + near) * nf, -1,
          0, 0, (2 * far * near) * nf, 0
        ]);
      }
    };
    
    // returns a perspective projection matrix with the near plane at 'near',
    // the far plane at 'far' and the view rectangle on the near plane bounded
    // by 'left', 'right', 'top', 'bottom'
    GLX.Matrix.Frustum = class extends GLX.Matrix {
      constructor (left, right, top, bottom, near, far) {
        const rl = 1 / (right - left),
          tb = 1 / (top - bottom),
          nf = 1 / (near - far);
    
        super([
          (near * 2) * rl, 0, 0, 0,
          0, (near * 2) * tb, 0, 0,
          (right + left) * rl, (top + bottom) * tb, (far + near) * nf, -1,
          0, 0, (far * near * 2) * nf, 0
        ]);
      }
    };
    
    // based on http://www.songho.ca/opengl/gl_projectionmatrix.html
    GLX.Matrix.Ortho = class extends GLX.Matrix {
      constructor (left, right, top, bottom, near, far) {
        super([
          2 / (right - left), 0, 0, 0,
          0, 2 / (top - bottom), 0, 0,
          0, 0, -2 / (far - near), 0,
          -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
        ]);
      }
    };
    
    GLX.Matrix.invert3 = a => {
      const
        a00 = a[0], a01 = a[1], a02 = a[2],
        a04 = a[4], a05 = a[5], a06 = a[6],
        a08 = a[8], a09 = a[9], a10 = a[10],
    
        l =  a10 * a05 - a06 * a09,
        o = -a10 * a04 + a06 * a08,
        m =  a09 * a04 - a05 * a08;
    
      let det = a00*l + a01*o + a02*m;
    
      if (!det) {
        return null;
      }
    
      det = 1.0/det;
    
      return [
        l                    * det,
        (-a10*a01 + a02*a09) * det,
        ( a06*a01 - a02*a05) * det,
        o                    * det,
        ( a10*a00 - a02*a08) * det,
        (-a06*a00 + a02*a04) * det,
        m                    * det,
        (-a09*a00 + a01*a08) * det,
        ( a05*a00 - a01*a04) * det
      ];
    };
    
    GLX.Matrix.transpose3 = a => {
      return new Float32Array([
        a[0], a[3], a[6],
        a[1], a[4], a[7],
        a[2], a[5], a[8]
      ]);
    };
    
    GLX.Matrix.transpose = a => {
      return new Float32Array([
        a[0], a[4],  a[8], a[12],
        a[1], a[5],  a[9], a[13],
        a[2], a[6], a[10], a[14],
        a[3], a[7], a[11], a[15]
      ]);
    };
    
    // GLX.Matrix.transform = (x, y, z, m) => {
    //   const X = x*m[0] + y*m[4] + z*m[8]  + m[12];
    //   const Y = x*m[1] + y*m[5] + z*m[9]  + m[13];
    //   const Z = x*m[2] + y*m[6] + z*m[10] + m[14];
    //   const W = x*m[3] + y*m[7] + z*m[11] + m[15];
    //   return {
    //     x: (X/W +1) / 2,
    //     y: (Y/W +1) / 2
    //   };
    // };
    
    GLX.Matrix.transform = m => {
      const X = m[12];
      const Y = m[13];
      const Z = m[14];
      const W = m[15];
      return {
        x: (X/W + 1) / 2,
        y: (Y/W + 1) / 2,
        z: (Z/W + 1) / 2
      };
    };
    
    GLX.Matrix.invert = a => {
      const
        res = new Float32Array(16),
    
        a00 = a[ 0], a01 = a[ 1], a02 = a[ 2], a03 = a[ 3],
        a10 = a[ 4], a11 = a[ 5], a12 = a[ 6], a13 = a[ 7],
        a20 = a[ 8], a21 = a[ 9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
    
        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;
    
      // Calculate the determinant
      let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    
      if (!det) {
        return;
      }
    
      det = 1 / det;
    
      res[ 0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      res[ 1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      res[ 2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      res[ 3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    
      res[ 4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      res[ 5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      res[ 6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      res[ 7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    
      res[ 8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      res[ 9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      res[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      res[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    
      res[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      res[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      res[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      res[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    
      return res;
    };
    
    GLX.Matrix.identity = () => {
      return new GLX.Matrix([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    };
    
    
    GLX.texture = {};
    
    
    GLX.texture.Image = class {
      constructor () {
        this.id = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.id);
    
    //GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    //GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    
        GL.bindTexture(GL.TEXTURE_2D, null);
      }
    
      clamp (image, maxSize) {
        if (image.width <= maxSize && image.height <= maxSize) {
          return image;
        }
    
        let w = maxSize, h = maxSize;
        const ratio = image.width/image.height;
        // TODO: if other dimension doesn't fit to POT after resize, there is still trouble
        if (ratio < 1) {
          w = Math.round(h*ratio);
        } else {
          h = Math.round(w/ratio);
        }
    
        const canvas = document.createElement('CANVAS');
        canvas.width  = w;
        canvas.height = h;
    
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas;
      }
    
      load (url, callback) {
        const image = new Image();
        image.crossOrigin = '*';
        image.onload = e => {
          this.set(image);
          if (callback) {
            callback(image);
          }
        };
        image.onerror = e => {
          if (callback) {
            callback();
          }
        };
        image.src = url;
      }
    
      color (color) {
        GL.bindTexture(GL.TEXTURE_2D, this.id);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 1, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, new Uint8Array([color[0]*255, color[1]*255, color[2]*255, (color[3] === undefined ? 1 : color[3])*255]));
        GL.bindTexture(GL.TEXTURE_2D, null);
      }
    
      set (image) {
        if (!this.id) {
          // texture had been destroyed
          return;
        }
    
        image = this.clamp(image, GL.getParameter(GL.MAX_TEXTURE_SIZE));
    
        GL.bindTexture(GL.TEXTURE_2D, this.id);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
        GL.generateMipmap(GL.TEXTURE_2D);
    
        if (GL.anisotropyExtension) { // TODO OSMB4 use this dynamically
          GL.texParameterf(GL.TEXTURE_2D, GL.anisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT, GL.anisotropyExtension.maxAnisotropyLevel);
        }
    
        GL.bindTexture(GL.TEXTURE_2D, null);
      }
    
      enable (index) {
        if (!this.id) {
          return;
        }
        GL.activeTexture(GL.TEXTURE0 + (index || 0));
        GL.bindTexture(GL.TEXTURE_2D, this.id);
      }
    
      destroy () {
        GL.bindTexture(GL.TEXTURE_2D, null);
        GL.deleteTexture(this.id);
        this.id = null;
      }
    };
    
    
    GLX.texture.Data = class {
    
      constructor(GL, width, height, data) {
        this.id = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.id);
    
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    
        let bytes = null;
        if (data) {
          const length = width*height*4;
          bytes = new Uint8Array(length);
          bytes.set(data.subarray(0, length));
        }
    
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, bytes);
        GL.bindTexture(GL.TEXTURE_2D, null);
    
        this.GL = GL;
      }
    
      enable(index) {
        this.GL.activeTexture(this.GL.TEXTURE0 + (index || 0));
        this.GL.bindTexture(this.GL.TEXTURE_2D, this.id);
      }
    
      destroy() {
        this.GL.bindTexture(this.GL.TEXTURE_2D, null);
        this.GL.deleteTexture(this.id);
        this.id = null;
      }
    };
    
    
    // TODO URGENT solve conflict between item existing and item is ready to use
    
    class Collection {
    
      constructor () {
        this.items = [];
      }
    
      add (item) {
        this.items.push(item);
      }
    
      remove (item) {
        this.items = this.items.filter(i => (i !== item));
      }
    
      forEach (fn) {
        this.items.forEach(fn);
      }
    
      destroy () {
        this.forEach(item => item.destroy());
        this.items = [];
      }
    }
    
    
    class WorkerPool {
    
      constructor (path, num) {
        this.items = [];
        for (let i = 0; i < num; i++) {
          this.items[i] = new WorkerWrapper(path);
        }
      }
    
      get (callback) {
        // console.log(this.items.map(item => {
        //   return item.busy ? '▪' : '▫';
        // }).join(''));
    
        for (let i = 0; i < this.items.length; i++) {
          if (!this.items[i].busy) {
            this.items[i].busy = true;
            callback(this.items[i]);
            return;
          }
        }
    
        setTimeout(() => {
          this.get(callback);
        }, 50);
      }
    
      destroy () {
        this.items.forEach(item => item.destroy());
        this.items = [];
      }
    }
    
    
    
    class WorkerWrapper {
    
      constructor (path) {
        this.busy = false;
        this.thread = new Worker(path);
      }
    
      postMessage (message) {
        this.thread.postMessage(message);
      }
    
      onMessage (callback) {
        this.thread.onmessage = function (e) {
          callback(e.data);
        };
      }
    
      free () {
        this.thread.onmessage = function (e) {};
        this.busy = false;
      }
    
      destroy () {
        this.thread.close();
      }
    }
    
    
    // TODO URGENT Solve conflict between item existing and item is ready to use.
    
    class IconCollection extends Collection {
    
      get (url, callback) {
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].url === url) {
            callback(null, this.items[i]);
            return;
          }
        }
    
        const icon = new Icon(url);
        icon.load(callback);
        // this.add(icon); // already done by icon itself
      }
    }
    
    class Icon {
    
      constructor (url = Icon.defaultURL) {
        this.type = 'svg';
        this.url = url;
      }
    
      load (callback) {
        if (this.url === Icon.defaultURL) {
          this.onLoad (DEFAULT_ICON, callback);
          return;
        }
    
        Request.getText(this.url, (err, svg) => {
          if (err) {
            callback(err);
            return;
          }
          this.onLoad (svg, callback);
        });
      }
    
      onLoad (svg, callback) {
        const vertices = [];
        triangulateSVG(svg).forEach(triangle => {
          const a = [triangle[0][0], triangle[0][1], 0];
          const b = [triangle[1][0], triangle[1][1], 0];
          const c = [triangle[2][0], triangle[2][1], 0];
    
          vertices.push(...a, ...b, ...c);
        });
    
        this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
        APP.icons.add(this);
    
        callback(null, this);
      }
    
      destroy () {
        APP.icons.remove(this);
        this.vertexBuffer && this.vertexBuffer.destroy();
      }
    }
    
    Icon.defaultURL = 'default_icon';
    
    
    // TODO: handle multiple markers
    // A: cluster them into 'tiles' that give close reference point and allow simpler visibility tests or
    // B: handle them as individual objects
    // TODO: idea: attach marker to building: adopts its height & visibility
    // TODO: vertical shading
    
    class Marker {
    
      // TODO color
    
      constructor (position, data = null, options = {}) {
        this.data = data;

        const col = options.color ? hexToRgbA(options.color) : [0,0,0,0]
    
        const anchor = options.anchor; // TODO
        const scale = options.scale || 1; // TODO

        this.color = col
        // this.color = options.color

        this.metersPerLon = METERS_PER_DEGREE_LATITUDE * Math.cos(position.latitude / 180 * Math.PI);
    
        this.longitude = position.longitude;
        this.latitude = position.latitude;
        this.altitude = (position.altitude || 0);
    
        this.matrix = new GLX.Matrix();
        this.matrix.scale(scale, scale, scale); // TODO currently ignored by shader?
    
        if (!options.url) {
          APP.icons.get(Icon.defaultURL, (err, icon) => {
            if (!err) {
              this.icon = icon;
              APP.markers.add(this);
            }
          });
          return;
        }
    
        APP.icons.get(options.url, (err, icon) => {
          if (!err) {
            this.icon = icon;
            APP.markers.add(this);
          }
        });
      }
    
      // const halfSize = this.size / 2;
    
      // const anchorsCoordPool = {
      //   center: [halfSize, halfSize, halfSize, halfSize],
      //   top: [0, halfSize, this.size, halfSize],
      //   bottom: [this.size, halfSize, 0, halfSize],
      //   left: [halfSize, 0, halfSize, this.size],
      //   right: [halfSize, this.size, halfSize, 0],
      //   top_left: [0, 0, this.size, this.size],
      //   top_right: [0, this.size, this.size, 0],
      //   bottom_left: [this.size, -this.size, 0, 0],
      //   bottom_right: [this.size, this.size, 0, 0]
      // };
      //
      // const anchorCoord = anchorsCoordPool[this.anchor] || anchorsCoordPool.center;
      //
      // const vertices = [
      //   -anchorCoord[1], -anchorCoord[0], 0, // upper left
      //    anchorCoord[3], -anchorCoord[0], 0, // upper right
      //   -anchorCoord[1],  anchorCoord[2], 0, // bottom left
      //    anchorCoord[3],  anchorCoord[2], 0, // bottom right
      //   -anchorCoord[1],  anchorCoord[2], 0, // bottom left
      //    anchorCoord[3], -anchorCoord[0], 0  // upper right
      // ];
    
      getMatrix () {
        this.matrix.translateTo(
          (this.longitude - APP.position.longitude) * this.metersPerLon,
          (APP.position.latitude-this.latitude) * METERS_PER_DEGREE_LATITUDE,
          this.altitude
        );
    
        return this.matrix;
      }
    
      destroy () {
        APP.markers.remove(this);
      }
    }
    
    Marker.defaultColor = '#ffcc00';
    
    /*
     * NOTE: OSMBuildings cannot use a single global world coordinate system.
     *       The numerical accuracy required for such a system would be about
     *       32bits to represent world-wide geometry faithfully within a few
     *       centimeters of accuracy. Most computations in OSMBuildings, however,
     *       are performed on a GPU where only IEEE floats with 23bits of accuracy
     *       (plus 8 bits of range) are available.
     *       Instead, OSMBuildings' coordinate system has a reference point
     *       (APP.position) at the viewport center, and all world positions are
     *       expressed as distances in meters from that reference point. The
     *       reference point itself shifts with map panning so that all world
     *       positions relevant to the part of the world curently rendered on-screen
     *       can accurately be represented within the limited accuracy of IEEE floats.
     */
    
    let APP, GL;
    
    /**
     * User defined function that will be called when an event is fired
     * @callback eventCallback
     * @param {String} type Event type
     * @param {any} [payload] Payload of any type
     */
    
    /**
     * User defined function that will be called on each feature, for modification before rendering
     * @callback selectorCallback
     * @param {String} id The feature's id
     * @param {Object} feature The feature
     */
    
    /**
     * @class OSMBuildings
     */
    
    class OSMBuildings {
    
      /**
       * @constructor
       * @param {Object} [options] OSMBuildings options
       * @param {String} options.container A DOM Element or its id to append the viewer to
       * @param {Number} [options.minZoom=14.5] Global minimum allowed zoom
       * @param {Number} [options.maxZoom=20] Global maximum allowed zoom
       * @param {Object} [options.bounds] A bounding box to restrict the map to
       * @param {Boolean} [options.state=false] Store the map state in the URL
       * @param {Boolean} [options.disabled=false] Disable user input
       * @param {String} [options.attribution] An attribution string
       * @param {Number} [options.zoom=minZoom..maxZoom] Initial zoom, default is middle between global minZoom and maxZoom
       * @param {Number} [options.rotation=0] Initial rotation
       * @param {Number} [options.tilt=0] Initial tilt
       * @param {Object} [options.position] Initial position
       * @param {Number} [options.position.latitude=52.520000] position latitude
       * @param {Number} [options.position.longitude=13.410000] Position longitude
       * @param {String} [options.baseURL='.'] DEPRECATED For locating assets. This is relative to calling html page
       * @param {Boolean} [options.showBackfaces=false] DEPRECATED Render front and backsides of polygons. false increases performance, true might be needed for bad geometries
       * @param {String} [options.fogColor='#e8e0d8'] Color to be used for sky gradients, distance fog and color benath the map
       * @param {String} [options.highlightColor='#f08000'] DEPRECATED Default color for highlighting features
       * @param {Array} [options.effects] DEPRECATED Which effects to enable. The only effect at the moment is 'shadows'
       * @param {String} [options.backgroundColor] DEPRECATED Overall background color
       * @param {Boolean} [options.fastMode=false] Enables faster rendering at cost of image quality.
       * @param {Object} [options.style] Sets the default building style
       * @param {String} [options.style.color='rgb(220, 210, 200)'] Sets the default building color
       */
      constructor (options = {}) {
        APP = this; // refers to current instance. Should make other globals obsolete.
    
        if (options.style) {
          if (options.style.color || options.style.wallColor) {
            DEFAULT_COLOR = Qolor.parse(options.style.color || options.style.wallColor).toArray();
          }
        }
    
        this.view = new View();
        this.view.fogColor = Qolor.parse(options.fogColor || FOG_COLOR).toArray();
    
        this.attribution = options.attribution || OSMBuildings.ATTRIBUTION;
    
        this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), MIN_ZOOM);
        this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), MAX_ZOOM);
        if (this.maxZoom < this.minZoom) {
          this.minZoom = MIN_ZOOM;
          this.maxZoom = MAX_ZOOM;
        }
    
        this.bounds = options.bounds;
    
        this.position = options.position || { latitude: 52.520000, longitude: 13.410000 };
        this.zoom = options.zoom || (this.minZoom + (this.maxZoom - this.minZoom) / 2);
        this.rotation = options.rotation || 0;
        this.tilt = options.tilt || 0;
    
        const numProc = Math.min(window.navigator.hardwareConcurrency || 2, 4);
    
        const blob = new Blob([workers.feature], { type: 'application/javascript' });
        this.workers = new WorkerPool(URL.createObjectURL(blob), numProc * 4);
    
        //*** create container ********************************
    
        this.domNode = options.container;
        if (typeof this.domNode === 'string') {
          this.domNode = document.getElementById(options.container);
        }
    
        this.container = document.createElement('DIV');
        this.container.className = 'osmb';
        if (this.domNode.offsetHeight === 0) {
          this.domNode.style.height = '100%';
          console.warn('Container height should be set. Now defaults to 100%.');
        }
        this.domNode.appendChild(this.container);
    
        //*** create canvas ***********************************

        this.canvas = document.createElement('CANVAS');
        this.canvas.className = 'osmb-viewport';
    
        // const devicePixelRatio = window.devicePixelRatio || 1;
        const devicePixelRatio = 1; // this also affects building height and zoom
    
        this.canvas.width = this.width = this.domNode.offsetWidth*devicePixelRatio;
        this.canvas.height = this.height = this.domNode.offsetHeight*devicePixelRatio;
        
        this.container.appendChild(this.canvas);
    
        this.glx = new GLX(this.canvas, options.fastMode);
        GL = this.glx.GL;
    
        this.features = new FeatureCollection();
        this.icons = new IconCollection();
        this.markers = new Collection();
    
        this.events = new Events(this.canvas);
        if (options.disabled) {
          this.setDisabled(true);
        }
    
        this._getStateFromUrl();
        if (options.state) {
          this._setStateToUrl();
          this.events.on('change', e => {
            this._setStateToUrl();
          });
        }
    
        this._attribution = document.createElement('DIV');
        this._attribution.className = 'osmb-attribution';
        this.container.appendChild(this._attribution);
        this._updateAttribution();
    
        this.setDate(new Date());
        this.view.start();
    
        this.emit('load', this);
      }
    
      /**
       * DEPRECATED
       */
      appendTo () {}
    
        /**
       * Adds an event listener
       * @param {String} type Event type to listen for
       * @param {eventCallback} fn Callback function
       */
      on (type, fn) {
        this.events.on(type, fn);
      }
    
      /**
       * Removes an event listener
       * @param {String} type Event type to listen for
       * @param {eventCallback} [fn] If callback is given, only remove that particular listener
       */
      off (type, fn) {
        this.events.off(type, fn);
      }
    
      /**
       * Triggers a specific event
       * @param {String} event Event type to listen for
       * @param {} [payload] Any kind of payload
       */
      emit (type, payload) {
        this.events.emit(type, payload);
      }
    
      /**
       * Set date for shadow calculations
       * @param {Date} date
       */
      setDate (date) {
        View.Sun.setDate(typeof date === 'string' ? new Date(date) : date);
      }
    
      /**
       * Gets 2d screen position from a 3d point
       * @param {Number} latitude Latitude of the point
       * @param {Number} longitude Longitude of the point
       * @param {Number} altitude Altitude of the point
       * @return {Object} Screen position in pixels { x, y }
       */
      project (latitude, longitude, altitude) {
        const worldPos = [(longitude - this.position.longitude) * METERS_PER_DEGREE_LONGITUDE, -(latitude - this.position.latitude) * METERS_PER_DEGREE_LATITUDE, altitude];
    
        // takes current cam pos into account.
        let posNDC = transformVec3(this.view.viewProjMatrix.data, worldPos);
        posNDC = mul3scalar(add3(posNDC, [1, 1, 1]), 1 / 2); // from [-1..1] to [0..1]
    
        return {
          x: posNDC[0] * this.width,
          y: (1 - posNDC[1]) * this.height,
          z: posNDC[2]
        };
      }
    
      /**
       * Turns a screen point (x, y) into a geographic position (latitude/longitude/altitude=0).
       * Returns 'undefined' if point would be invisible or lies above horizon.
       * @param {Number} x X position on screen
       * @param {Number} y Y position om screen
       * @return {Object} Geographic position { latitude, longitude }
       */
      unproject (x, y) {
        const inverseViewMatrix = GLX.Matrix.invert(this.view.viewProjMatrix.data);
        // convert window/viewport coordinates to NDC [0..1]. Note that the browser
        // screen coordinates are y-down, while the WebGL NDC coordinates are y-up,
        // so we have to invert the y value here
    
        let posNDC = [x / this.width, 1 - y / this.height];
        posNDC = add2(mul2scalar(posNDC, 2.0), [-1, -1, -1]); // [0..1] to [-1..1];
    
        const worldPos = getIntersectionWithXYPlane(posNDC[0], posNDC[1], inverseViewMatrix);
        if (worldPos === undefined) {
          return;
        }
    
        return {
          longitude: this.position.longitude + worldPos[0] / METERS_PER_DEGREE_LONGITUDE,
          latitude: this.position.latitude - worldPos[1] / METERS_PER_DEGREE_LATITUDE
        };
      }
    
      /**
       * Removes a feature, layer or marker from the map.
       */
      remove (item) {
        if (item.destroy) {
          item.destroy();
        }
      }
    
      /**
       * Adds an 3d object (OBJ format) file to the map.
       * <em>Important</em> objects with exactly the same url are cached and only loaded once.
       * @example
       * osmb.addOBJ(`${location.protocol}//${location.hostname}/${location.pathname}/Fernsehturm.obj`, { latitude:52.52000, longitude:13.41000 }, { id:'Fernsehturm', scale:1, color:'#ff0000', altitude:0, rotation:51 });
       *
       * @param {String} url Absolute URL to OBJ file
       * @param {Object} position Where to render the object
       * @param {Number} position.latitude Position latitude for the object
       * @param {Number} position.longitude Position longitude for the object
       * @param {Object} [options] Options for rendering the object
       * @param {Number} [options.scale=1] Scale the model by this value before rendering
       * @param {Number} [options.rotation=0] Rotate the model by this much before rendering
       * @param {Number} [options.altitude=0] The height above ground to place the model at
       * @param {String} [options.id] An identifier for the object. This is used for getting info about the object later
       * @param {String} [options.color] A color to apply to the model
       * @param {Boolean} [options.swapYZ] Swap y and z coordinates. Use this if your model is standing upright on one side
       * @return {Object} The added object
       */
      addOBJ (url, position, options = {}) {
        options.position = position;
        return new Feature('OBJ', url, options);
      }
    
      /**
       * Adds a GeoJSON object to the map.
       * @param {String} url Absolute URL to GeoJSON file or a JavaScript Object representing a GeoJSON FeatureCollection
       * @param {Object} [options] Options to apply to the GeoJSON being rendered
       * @param {Number} [options.scale=1] Scale the model by this value before rendering
       * @param {Number} [options.rotation=0] Rotate the model by this much before rendering
       * @param {Number} [options.altitude=0] The height above ground to place the model at
       * @param {String} [options.id] An identifier for the object. This is used for getting info about the object later
       * @param {String} [options.color] A color to apply to the model
       * @param {Number} [options.minZoom=14.5] Minimum zoom level to show this feature, defaults to and limited by global minZoom
       * @param {Number} [options.maxZoom=maxZoom] Maximum zoom level to show this feature, defaults to and limited by global maxZoom
       * @param {Boolean} [options.fadeIn=true] DEPRECATED Fade GeoJSON features; if `false`, then display immediately
       * @return {Object} The added object
       */
      addGeoJSON (url, options) {
        return new Feature('GeoJSON', url, options);
      }
    
      // TODO: allow more data layers later on
      /**
       * Adds a GeoJSON tile layer to the map.
       * This is for continuous building coverage.
       * @param {String} [url=https://{s}.data.osmbuildings.org/0.2/{k}/tile/{z}/{x}/{y}.json] url The URL of the GeoJSON tile server
       * @param {Object} [options]
       * @param {Number} [options.fixedZoom=15] Tiles are fetched for this zoom level only. Other zoom levels are scaled up/down to this value
       * @param {Number} [options.minZoom=14.5] Minimum zoom level to show features from this layer. Defaults to and limited by global minZoom.
       * @param {Number} [options.maxZoom=maxZoom] Maximum zoom level to show features from this layer. Defaults to and limited by global maxZoom.
       * @return {Object} The added layer object
       */
      addGeoJSONTiles (url, options = {}) {
        options.fixedZoom = options.fixedZoom || 15;
        this.dataGrid = new Grid(url, GeoJSONTile, options, 2);
        return this.dataGrid;
      }
    
      /**
       * Adds a 2d base map source. This renders below the buildings.
       * @param {String} url The URL of the map server. This could be from Mapbox or other tile servers
       * @return {Object} The added layer object
       */
      addMapTiles (url) {
        this.basemapGrid = new Grid(url, BitmapTile, {}, 4);
        return this.basemapGrid;
      }
    
      /**
       * This replaces any previous highlighting.
       * @example
       * osmb.highlight(building => {
       *   if (building.properties.height > 200) return 'red';
       *   if (building.properties.height > 100) return 'green';
       * });
       * @param callback {Function} A function that does user defined filtering and highlights by returning a color. Can be falsy in order to reset highlighting.
       */
      highlight (tintCallback) {
        return this.features.setTintCallback(tintCallback || (() => false));
      }
    
      /**
       * This replaces any previous show/hide rule.
       * @example
       * osmb.hide(building => {
       *   if (building.properties.height < 100) return true;
       *   if (building.id == "B05417") return true;
       * });
       * @param callback {Function} A function that does user defined filtering and hides if return value is true
       */
      hide (zScaleCallback) {
        this.features.setZScaleCallback(zScaleCallback);
      }
    
      /**
       * DEPRECATED
       */
      show () {}
    
      /**
       * DEPRECATED
       */
      getTarget () {}
    
      /**
       * DEPRECATED
       */
      screenshot () {}
    
      /**
       * @private
       */
      _updateAttribution () {
        const attribution = [];
        if (this.attribution) {
          attribution.push(this.attribution);
        }
        // this.layers.forEach(layer => {
        //   if (layer.attribution) {
        //     attribution.push(layer.attribution);
        //   }
        // });
        this._attribution.innerHTML = attribution.join(' · ');
      }
    
      /**
       * @private
       */
      _getStateFromUrl () {
        const
          query = location.search,
          state = {};
    
        if (query) {
          query.substring(1).replace(/(?:^|&)([^&=]*)=?([^&]*)/g, ($0, $1, $2) => {
            if ($1) {
              state[$1] = $2;
            }
          });
        }
    
        this.setPosition((state.lat !== undefined && state.lon !== undefined) ? {
          latitude: parseFloat(state.lat),
          longitude: parseFloat(state.lon)
        } : this.position);
    
        this.setZoom(state.zoom !== undefined ? parseFloat(state.zoom) : this.zoom);
        this.setRotation(state.rotation !== undefined ? parseFloat(state.rotation) : this.rotation);
        this.setTilt(state.tilt !== undefined ? parseFloat(state.tilt) : this.tilt);
      }
    
      /**
       * @private
       */
      _setStateToUrl () {
        if (!history.replaceState || this.stateDebounce) {
          return;
        }
    
        this.stateDebounce = setTimeout(() => {
          this.stateDebounce = null;
          const params = [];
          params.push('lat=' + this.position.latitude.toFixed(6));
          params.push('lon=' + this.position.longitude.toFixed(6));
          params.push('zoom=' + this.zoom.toFixed(1));
          params.push('tilt=' + this.tilt.toFixed(1));
          params.push('rotation=' + this.rotation.toFixed(1));
          history.replaceState({}, '', '?' + params.join('&'));
        }, 1000);
      }
    
      /**
       * Disables map interaction
       * @param {Boolean} flag
       */
      setDisabled (flag) {
        this.events.isDisabled = !!flag;
      }
    
      /**
       * Checks for map interaction disabled
       * @return {Boolean} flag
       */
      isDisabled () {
        return !!this.events.isDisabled;
      }
    
      /**
       * Returns geographical bounds of the current view
       * - since the bounds are always axis-aligned they will contain areas that are
       *   not currently visible if the current view is not also axis-aligned.
       * - The bounds only contain the map area that OSMBuildings considers for rendering.
       *   OSMBuildings has a rendering distance of about 3.5km, so the bounds will
       *   never extend beyond that, even if the horizon is visible (in which case the
       *   bounds would mathematically be infinite).
       * - the bounds only consider ground level. For example, buildings whose top
       *   is seen at the lower edge of the screen, but whose footprint is outside
       * - The bounds only consider ground level. For example, buildings whose top
       *   is seen at the lower edge of the screen, but whose footprint is outside
       *   of the current view below the lower edge do not contribute to the bounds.
       *   so their top may be visible and they may still be out of bounds.
       * @return {Array} Bounding coordinates in unspecific order [{ latitude, longitude }, ...]
       */
      getBounds () {
        const viewQuad = this.view.getViewQuad();
        return viewQuad.map(point => getPositionFromLocal(point));
      }
    
      /**
       * Set zoom level
       * @emits OSMBuildings#zoom
       * @emits OSMBuildings#change
       * @param {Number} zoom The new zoom level
       */
      setZoom (zoom, e) {
        zoom = Math.max(zoom, this.minZoom);
        zoom = Math.min(zoom, this.maxZoom);
    
        if (this.zoom !== zoom) {
          this.zoom = zoom;
    
          /* if a screen position was given for which the geographic position displayed
           * should not change under the zoom */
          if (e) {
            // FIXME: add code; this needs to take the current camera (rotation and
            //        perspective) into account
            // NOTE:  the old code (comment out below) only works for north-up
            //        non-perspective views
            /*
             const dx = this.container.offsetWidth/2  - e.clientX;
             const dy = this.container.offsetHeight/2 - e.clientY;
             this.center.x -= dx;
             this.center.y -= dy;
             this.center.x *= ratio;
             this.center.y *= ratio;
             this.center.x += dx;
             this.center.y += dy;*/
          }
    
          this.events.emit('zoom', { zoom: zoom });
          this.events.emit('change');
        }
      }
    
      /**
       * Get current zoom level
       * @return {Number} zoom level
       */
      getZoom () {
        return this.zoom;
      }
    
      /**
       * Set map's geographic position
       * @param {Object} pos The new position
       * @param {Number} pos.latitude
       * @param {Number} pos.longitude
       * @emits OSMBuildings#change
       */
      setPosition (pos) {
        // if (isNaN(lat) || isNaN(lon)) {
        //   return;
        // }
        // { latitude: clamp(lat, -90, 90), longitude: clamp(lon, -180, 180) };
    
        this.position = pos;
    
        METERS_PER_DEGREE_LONGITUDE = METERS_PER_DEGREE_LATITUDE * Math.cos(this.position.latitude / 180 * Math.PI);
    
        this.events.emit('change');
      }
    
      /**
       * Get map's current geographic position
       * @return {Object} Geographic position { latitude, longitude }
       */
      getPosition () {
        return this.position;
      }
    
      /**
       * Set map view's size in pixels
       * @public
       * @param {Object} size DEPRECATED
       * @param {Integer} size.width DEPRECATED
       * @param {Integer} size.height DEPRECATED
       * @param {Integer} width
       * @param {Integer} height
       * @emits OSMBuildings#resize
       */
      setSize (width, height) {
        if (width !== this.width || height !== this.height) {
          this.width = width;
          this.height = height;
          this.events.emit('resize', { width: this.width, height: this.height });
        }
      }
    
      /**
       * Get map's current view size in pixels
       * @return {Object} View size { width, height }
       */
      getSize () {
        return { width: this.width, height: this.height };
      }
    
      /**
       * Set map's rotation
       * @param {Number} rotation The new rotation angle in degrees
       * @emits OSMBuildings#rotate
       * @emits OSMBuildings#change
       */
      setRotation (rotation) {
        rotation = rotation % 360;
        if (this.rotation !== rotation) {
          this.rotation = rotation;
          this.events.emit('rotate', { rotation: rotation });
          this.events.emit('change');
        }
      }
    
      /**
       * Get map's current rotation
       * @return {Number} Rotation in degrees
       */
      getRotation () {
        return this.rotation;
      }
    
      /**
       * Set map's tilt
       * @param {Number} tilt The new tilt in degree
       * @emits OSMBuildings#tilt
       * @emits OSMBuildings#change
       */
      setTilt (tilt) {
        tilt = clamp(tilt, 0, MAX_TILT);
        if (this.tilt !== tilt) {
          this.tilt = tilt;
          this.events.emit('tilt', { tilt: tilt });
          this.events.emit('change');
        }
      }
    
      /**
       * Get map's current tilt
       * @return {Number} Tilt in degrees
       */
      getTilt () {
        return this.tilt;
      }
    
      /**
       * Adds a marker to the map in 3d space.
       * @param {Object} position geographic position including altitude
       * @param {Number} position.latitude latitude
       * @param {Number} position.longitude longitude
       * @param {Number} [position.altitude=0] altitude in meters
       * @param {Object} [data] custom data properties to attach to the marker, i.e. an id
       * @param {Object} [options] additional options
       * @param {String} [options.url] url to an SVG file to use as custom marker. Currently only path properties are supported. Overlapping path's may create strange results.
       * @param {String} [options.color] color which whole marker will be tinted
       * @return {Object} Marker
       */
      addMarker (position, data, options) {
       return new Marker(position, data, options);
      }
    
      /**
       * Destroys the map
       */
      destroy () {
        this.view.destroy();
    
        // this.basemapGrid.destroy();
        // this.dataGrid.destroy();
    
        this.events.destroy();
    
        this.glx.destroy();
        this.canvas.parentNode.removeChild(this.canvas);
    
        this.features.destroy();
        this.markers.destroy();
    
        this.domNode.innerHTML = '';
      }
    
      // destroyWorker () {
      //   this._worker.terminate();
      // }
    }
    
    
    /**
     * Fired when a 3d object has been loaded
     * @event OSMBuildings#loadfeature
     */
    
    /**
     * Fired when map has been zoomed
     * @event OSMBuildings#zoom
     */
    
    /**
     * Fired when map view has been rotated
     * @event OSMBuildings#rotate
     */
    
    /**
     * Fired when map view has been tilted
     * @event OSMBuildings#tilt
     */
    
    /**
     * Fired when map view has been changed, i.e. zoom, pan, tilt, rotation
     * @event OSMBuildings#change
     */
    
    /**
     * Fired when map container has been resized
     * @event OSMBuildings#resize
     */
    
    /**
     * Fired when map container has been double clicked/tapped
     * @event OSMBuildings#doubleclick
     */
    
    /**
     * Fired when map container has been clicked/tapped
     * @event OSMBuildings#pointerdown
     */
    
    /**
     * Fired when mouse/finger has been moved
     * @event OSMBuildings#pointermove
     */
    
    /**
     * Fired when mouse button/finger been lifted
     * @event OSMBuildings#pointerup
     */
    
    /**
     * Fired when gesture has been performed on the map
     * @event OSMBuildings#gesture
     */
    
    /**
     * DEPRECATED Fired when data loading starts
     * @event OSMBuildings#busy
     */
    
    /**
     * DEPRECATED Fired when data loading ends
     * @event OSMBuildings#idle
     */
    
    /**
     * (String) OSMBuildings version
     * @static
     */
    OSMBuildings.VERSION = null;
    
    /**
     * (String) OSMBuildings attribution
     * @static
     */
    OSMBuildings.ATTRIBUTION = '<a href="https://osmbuildings.org/">© OSM Buildings</a>';
    
    
    //*****************************************************************************
    
    if (typeof define === 'function') {
      define([], OSMBuildings);
    } else if (typeof module === 'object') {
      module.exports = OSMBuildings;
    } else {
      window.OSMBuildings = OSMBuildings;
    }
    
    
    /**
     * @private
     */
    function add2 (a, b) {
      return [a[0] + b[0], a[1] + b[1]];
    }
    
    /**
     * @private
     */
    function mul2scalar (a, f) {
      return [a[0] * f, a[1] * f];
    }
    
    /**
     * @private
     */
    function getEventXY (e) {
      const el = e.target;
      const box = el.getBoundingClientRect();
      return { x: e.x - box.left, y: e.y - box.top };
    }
    
    /**
     * @private
     */
    function addListener (target, type, fn) {
      target.addEventListener(type, fn, false);
    }
    
    
    class Events {
    
      /**
       * @param container {HTMLElement} DOM element for local pointer events.
       */
      constructor (container) {
        this.listeners = {};
        this.isDisabled = false;
    
        this.prevX = 0;
        this.prevY = 0;
        this.startZoom = 0;
        this.prevRotation = 0;
        this.prevTilt = 0;
        this.startDist = 0;
        this.startAngle = 0;
        this.button = null;
    
        this.addAllListeners(container);
      }
    
      addAllListeners (container) {
        const doc = window.document;
    
        if ('ontouchstart' in window) {
          addListener(container, 'touchstart', e => {
            this.onTouchStart(e);
          });
    
          addListener(doc, 'touchmove', e => {
            this.onTouchMoveDocument(e);
          });
          addListener(container, 'touchmove', e => {
            this.onTouchMove(e);
          });
          addListener(doc, 'touchend', e => {
            this.onTouchEndDocument(e);
          });
          addListener(doc, 'gesturechange', e => {
            this.onGestureChangeDocument(e);
          });
        } else {
          addListener(container, 'mousedown', e => {
            this.onMouseDown(e);
          });
          addListener(doc, 'mousemove', e => {
            this.onMouseMoveDocument(e);
          });
          addListener(container, 'mousemove', e => {
            this.onMouseMove(e);
          });
          addListener(doc, 'mouseup', e => {
            this.onMouseUpDocument(e);
          });
          addListener(container, 'mouseup', e => {
            this.onMouseUp(e);
          });
          addListener(container, 'dblclick', e => {
            this.onDoubleClick(e);
          });
          addListener(container, 'mousewheel', e => {
            this.onMouseWheel(e);
          });
          addListener(container, 'DOMMouseScroll', e => {
            this.onMouseWheel(e);
          });
          addListener(container, 'contextmenu', e => {
            this.onContextMenu(e);
          });
        }
    
        let resizeTimer;
        addListener(window, 'resize', e => {
          if (resizeTimer) {
            return;
          }
          resizeTimer = setTimeout(() => {
            resizeTimer = null;
            APP.setSize(APP.container.offsetWidth, APP.container.offsetHeight);
          }, 250);
        });
      }
    
      cancelEvent (e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        //if (e.stopPropagation) {
        //  e.stopPropagation();
        //}
        e.returnValue = false;
      }
    
      onDoubleClick (e) {
        APP.view.speedUp();
        this.cancelEvent(e);
    
        const pos = getEventXY(e);
        // this.emit('doubleclick', { x: pos.x, y: pos.y });
    
        APP.view.Picking.getTarget(pos.x, pos.y, target => {
          console.log('target ======= ',target)
          this.emit('doubleclick', { features: target.features, marker: target.marker });
        });

        // if (!this.isDisabled) {
          // APP.setZoom(APP.zoom + 1, e);
        // }
      }
    
      onMouseDown (e) {
        APP.view.speedUp();
        this.cancelEvent(e);
    
        this.startZoom = APP.zoom;
        this.prevRotation = APP.rotation;
        this.prevTilt = APP.tilt;
    
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        this.isClick = true;
    
        if (((e.buttons === 1 || e.button === 0) && e.altKey) || e.buttons === 2 || e.button === 2) {
          this.button = 2;
        } else if (e.buttons === 1 || e.button === 0) {
          this.button = 0;
        }
    
        const pos = getEventXY(e);
        this.emit('pointerdown', { x: pos.x, y: pos.y, button: this.button });
      }
    
      onMouseMoveDocument (e) {
        // detect if it is really a move after some tolerance
        if (this.isClick) {
          const
            dx = e.clientX-this.prevX,
            dy = e.clientY-this.prevY;
          this.isClick = (dx*dx+dy*dy < 15);
        }
    
        if (this.button === 0) {
          APP.view.speedUp(); // do it here because no button means the event is not related to us
          this.moveMap(e);
        } else if (this.button === 2) {
          APP.view.speedUp(); // do it here because no button means the event is not related to us
          this.rotateMap(e);
        }
    
        this.prevX = e.clientX;
        this.prevY = e.clientY;
      }
    
      onMouseMove (e) {
        const pos = getEventXY(e);
        this.emit('pointermove', pos);
      }
    
      onMouseUpDocument (e) {
        if (this.button === 0) {
          this.moveMap(e);
          this.button = null;
        } else if (this.button === 2) {
          this.rotateMap(e);
          this.button = null;
        }
      }
    
      onMouseUp (e) {
        if (this.isClick) {
          const pos = getEventXY(e);
          APP.view.Picking.getTarget(pos.x, pos.y, target => {
            this.emit('pointerup', { features: target.features, marker: target.marker });
          });
        }
      }
    
      onMouseWheel (e) {
        APP.view.speedUp();
        this.cancelEvent(e);
    
        let delta = 0;
        if (e.wheelDeltaY) {
          delta = e.wheelDeltaY;
        } else if (e.wheelDelta) {
          delta = e.wheelDelta;
        } else if (e.detail) {
          delta = -e.detail;
        }
    
        if (!this.isDisabled) {
          const adjust = 0.2 * (delta > 0 ? 1 : delta < 0 ? -1 : 0);
          APP.setZoom(APP.zoom + adjust, e);
        }
      }
    
      onContextMenu (e) {
        this.cancelEvent(e);
      }
    
      //***************************************************************************
    
      moveMap (e) {
        if (this.isDisabled) {
          return;
        }
    
        // FIXME: make movement exact
        // the constant 0.86 was chosen experimentally for the map movement to be
        // "pinned" to the cursor movement when the map is shown top-down
    
        const
          scale = 0.86 * Math.pow(2, -APP.zoom),
          lonScale = 1 / Math.cos(APP.position.latitude / 180 * Math.PI),
          dx = e.clientX - this.prevX,
          dy = e.clientY - this.prevY,
          angle = APP.rotation * Math.PI / 180,
          vRight = [Math.cos(angle), Math.sin(angle)],
          vForward = [Math.cos(angle - Math.PI / 2), Math.sin(angle - Math.PI / 2)],
          dir = add2(mul2scalar(vRight, dx), mul2scalar(vForward, -dy));
    
        const newPosition = {
          longitude: APP.position.longitude - dir[0] * scale * lonScale,
          latitude: APP.position.latitude + dir[1] * scale
        };
    
        APP.setPosition(newPosition);
        this.emit('move', newPosition);
      }
    
      rotateMap (e) {
        if (this.isDisabled) {
          return;
        }
    
        this.prevRotation += (e.clientX - this.prevX) * (360 / window.innerWidth);
        this.prevTilt -= (e.clientY - this.prevY) * (360 / window.innerHeight);
        APP.setRotation(this.prevRotation);
        APP.setTilt(this.prevTilt);
      }
    
      emitGestureChange (e) {
        const
          t1 = e.touches[0],
          t2 = e.touches[1],
          dx = t1.clientX - t2.clientX,
          dy = t1.clientY - t2.clientY,
          dist = dx * dx + dy * dy,
          angle = Math.atan2(dy, dx);
    
        this.onGestureChangeDocument({ rotation: ((angle - this.startAngle) * (180 / Math.PI)) % 360, scale: Math.sqrt(dist / this.startDist) });
      }
    
      //***************************************************************************
    
      onTouchStart (e) {
        APP.view.speedUp();
        this.cancelEvent(e);
    
        this.button = 0;
        this.isClick = true;
    
        const t1 = e.touches[0];
    
        // gesture polyfill adapted from https://raw.githubusercontent.com/seznam/JAK/master/lib/polyfills/gesturechange.js
        // MIT License
        if (e.touches.length === 2 && !('ongesturechange' in window)) {
          const t2 = e.touches[1];
          const dx = t1.clientX - t2.clientX;
          const dy = t1.clientY - t2.clientY;
          this.startDist = dx * dx + dy * dy;
          this.startAngle = Math.atan2(dy, dx);
        }
    
        this.startZoom = APP.zoom;
        this.prevRotation = APP.rotation;
        this.prevTilt = APP.tilt;
    
        this.prevX = t1.clientX;
        this.prevY = t1.clientY;
    
        this.emit('pointerdown', { x: e.x, y: e.y, button: 0 });
      }
    
      onTouchMoveDocument (e) {
        if (this.button === null) {
          return;
        }
    
        APP.view.speedUp();
    
        const t1 = e.touches[0];
    
        // detect if it is really a move after some tolerance
        if (this.isClick) {
          const
            dx = t1.clientX-this.prevX,
            dy = t1.clientY-this.prevY;
          this.isClick = (dx*dx+dy*dy < 15);
        }
        
        if (e.touches.length > 1) {
          APP.setTilt(this.prevTilt + (this.prevY - t1.clientY) * (360 / window.innerHeight));
          this.prevTilt = APP.tilt;
          if (!('ongesturechange' in window)) {
            this.emitGestureChange(e);
          }
        } else {
          this.moveMap(t1);
        }
        
        this.prevX = t1.clientX;
        this.prevY = t1.clientY;
      }
    
      onTouchMove (e) {
        if (e.touches.length === 1) {
          const pos = getEventXY(e.touches[0]);
          this.emit('pointermove', { x: pos.x, y: pos.y, button: 0 });
        }
      }
    
      onTouchEndDocument (e) {
        if (this.button === null) {
          return;
        }
    
        const t1 = e.touches[0];
    
        if (e.touches.length === 0) {
          this.button = null;
    
          if (!this.isClick) {
            this.emit('pointerup', {});
          } else {
            if (e.x === undefined) {
              e.x = this.prevX <<0;
            }
            if (e.y === undefined) {
              e.y = this.prevY <<0;
            }
            const pos = getEventXY(e);
            APP.view.Picking.getTarget(pos.x, pos.y, target => {
              this.emit('pointerup', { features: target.features, marker: target.marker });
            });
          }
        } else if (e.touches.length === 1) {
          // There is one touch currently on the surface => gesture ended. Prepare for continued single touch move
          this.prevX = t1.clientX;
          this.prevY = t1.clientY;
        }
      }
    
      onGestureChangeDocument (e) {
        if (this.button === null) {
          return;
        }
    
        APP.view.speedUp();
        this.cancelEvent(e);
    
        if (!this.isDisabled) {
          APP.setZoom(this.startZoom + (e.scale - 1));
          APP.setRotation(this.prevRotation - e.rotation);
        }
    
        this.emit('gesture', e);
      }
    
      //***************************************************************************
    
      on (type, fn) {
        (this.listeners[type] || (this.listeners[type] = [])).push(fn);
      }
    
      off (type, fn) {
        this.listeners[type] = (this.listeners[type] || []).filter(item => item !== fn);
      }
    
      emit (type, payload) {
        if (this.listeners[type] === undefined) {
          return;
        }
    
        setTimeout(() => {
          this.listeners[type].forEach(listener => listener(payload));
        }, 0);
      }
    
      destroy() {
        // TODO: remove all DOM listeners
        this.listeners = {};
      }
    }
    
    
    const
      // MIN_ZOOM = 11,
      MIN_ZOOM = 15,
      MAX_ZOOM = 22,
    
      // MAX_TILT = 75;
      MAX_TILT = 45;
    
    
    const TILE_SIZE = 256;
    
    const DEFAULT_HEIGHT = 10;
    
    const MAX_USED_ZOOM_LEVEL = 25;
    let DEFAULT_COLOR = Qolor.parse('rgb(220, 210, 200)').toArray();
    
    // #E8E0D8 is the background color of the current OSMBuildings map layer,
    // and thus a good fog color to blend map tiles and buildings close to horizon into
    const FOG_COLOR = '#e8e0d8';
    //const FOG_COLOR = '#f0f8ff';
    const BACKGROUND_COLOR = '#efe8e0';
    
    const document = window.document;
    
    const EARTH_RADIUS_IN_METERS = 6378137;
    const EARTH_CIRCUMFERENCE_IN_METERS = EARTH_RADIUS_IN_METERS * Math.PI * 2;
    const METERS_PER_DEGREE_LATITUDE = EARTH_CIRCUMFERENCE_IN_METERS / 360;
    let METERS_PER_DEGREE_LONGITUDE = METERS_PER_DEGREE_LATITUDE; // variable
    
    /* For shadow mapping, the camera rendering the scene as seen by the sun has
     * to cover everything that's also visible to the user. For this to work
     * reliably, we have to make assumptions on how high (in [m]) the buildings
     * can become.
     * Note: using a lower-than-accurate value will lead to buildings parts at the
     * edge of the viewport to have incorrect shadows. Using a higher-than-necessary
     * value will lead to an unnecessarily large view area and thus to poor shadow
     * resolution. */
    const SHADOW_MAP_MAX_BUILDING_HEIGHT = 100;
    
    /* for shadow mapping, the scene needs to be rendered into a depth map as seen
     * by the light source. This rendering can have arbitrary dimensions -
     * they need not be related to the visible viewport size in any way. The higher
     * the resolution (width and height) for this depth map the smaller are
     * the visual artifacts introduced by shadow mapping. But increasing the
     * shadow depth map size impacts rendering performance */
    const SHADOW_DEPTH_MAP_SIZE = 2048;
    
    // building wall texture as a data url
    const BUILDING_TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAQMAAACQp+OdAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwCCAUQLpaUSQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAGUExURebm5v///zFES9kAAAAcSURBVCjPY/gPBQyUMh4wAAH/KAPCoFaoDnYGAAKtZsamTRFlAAAAAElFTkSuQmCC';
    
    // TODO: automate
    const DEFAULT_ICON = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="512px" height="512px" viewBox="0 0 512 512"><path d="M256,0C167.641,0,96,71.625,96,160c0,24.75,5.625,48.219,15.672,69.125C112.234,230.313,256,512,256,512l142.594-279.375C409.719,210.844,416,186.156,416,160C416,71.625,344.375,0,256,0z M256,256c-53.016,0-96-43-96-96s42.984-96,96-96c53,0,96,43,96,96S309,256,256,256z"/></svg>';
    
    
    class Request {
    
      static load (url, callback) {
        const req = new XMLHttpRequest();
    
        const timer = setTimeout(t => {
          if (req.readyState !== 4) {
            req.abort();
            callback('status');
          }
        }, 10000);
    
        req.onreadystatechange = () => {
          if (req.readyState !== 4) {
            return;
          }
    
          clearTimeout(timer);
    
          if (!req.status || req.status < 200 || req.status > 299) {
            callback('status');
            return;
          }
    
          callback(null, req);
        };
    
        req.open('GET', url);
        req.send(null);
    
        return {
          abort: () => {
            req.abort();
          }
        };
      }
    
      static getText (url, callback) {
        return this.load(url, (err, res) => {
          if (err) {
            callback(err);
            return;
          }
          if (res.responseText !== undefined) {
            callback(null, res.responseText);
          } else {
            callback('content');
          }
        });
      }
    
      static getXML (url, callback) {
        return this.load(url, (err, res) => {
          if (err) {
            callback(err);
            return;
          }
          if (res.responseXML !== undefined) {
            callback(null, res.responseXML);
          } else {
            callback('content');
          }
        });
      }
    
      static getJSON (url, callback) {
        return this.load(url, (err, res) => {
          if (err) {
            callback(err);
            return;
          }
          if (!res.responseText) {
            callback('content');
            return;
          }
    
          let json;
          try {
            json = JSON.parse(res.responseText);
            callback(null, json);
          } catch (ex) {
            console.warn(`Could not parse JSON from ${url}\n${ex.message}`);
            callback('content');
          }
        });
      }
    }
    
    
    function pattern(str, param) {
      return str.replace(/\{(\w+)\}/g, (tag, key) => param[key] || tag);
    }
    
    function substituteZCoordinate(points, zValue) {
      return points.map(point => [...point, zValue]);
    }
    
    function clamp(value, min, max) {
      return Math.min(max, Math.max(value, min));
    }
    
    
    class Grid {
    
      constructor (source, tileClass, options = {}, maxThreads = 2) {
        this.source = source;
        this.tileClass = tileClass;
    
        this.tiles = {};
        this.buffer = 1;
    
        this.fixedZoom = options.fixedZoom;
    
        this.bounds = options.bounds || { w: -180, s: -90, e: 180, n: 90 };
        this.minZoom = Math.max(parseFloat(options.minZoom || APP.minZoom), APP.minZoom);
        this.maxZoom = Math.min(parseFloat(options.maxZoom || APP.maxZoom), APP.maxZoom);
    
        if (this.maxZoom < this.minZoom) {
          this.minZoom = APP.minZoom;
          this.maxZoom = APP.maxZoom;
        }
    
        this.queue = [];
        // TODO: should be more flexible, also connected to # of webworkers, could increase when idle
        for (let i = 0; i < maxThreads; i++) {
          this.queueNext();
        }
    
        this.update();
      }
    
      getURL (x, y, z) {
        const s = 'abcd'[(x + y) % 4];
        return pattern(this.source, { s: s, x: x, y: y, z: z });
      }
    
      getClosestTiles (tileList, referencePoint) {
        return tileList;
    
        // tileList.sort((a, b) => {
        //   // tile coordinates correspond to the tile's upper left corner, but for
        //   // the distance computation we should rather use their center; hence the 0.5 offsets
        //   const distA = Math.pow(a[0] + 0.5 - referencePoint[0], 2.0) + Math.pow(a[1] + 0.5 - referencePoint[1], 2.0);
        //   const distB = Math.pow(b[0] + 0.5 - referencePoint[0], 2.0) + Math.pow(b[1] + 0.5 - referencePoint[1], 2.0);
        //   return distA > distB;
        // });
        //
        // // remove duplicates
        // let prevX, prevY;
        // return tileList.filter(tile => {
        //   if (tile[0] === prevX && tile[1] === prevY) {
        //     return false;
        //   }
        //   prevX = tile[0];
        //   prevY = tile[1];
        //   return true;
        // });
      }
    
      /* Returns a set of tiles based on 'tiles' (at zoom level 'zoom'),
       * but with those tiles recursively replaced by their respective parent tile
       * (tile from zoom level 'zoom'-1 that contains 'tile') for which said parent
       * tile covers less than 'pixelAreaThreshold' pixels on screen based on the
       * current view-projection matrix.
       *
       * The returned tile set is duplicate-free even if there were duplicates in
       * 'tiles' and even if multiple tiles from 'tiles' got replaced by the same parent.
       */
      mergeTiles (tiles, zoom, pixelAreaThreshold) {
        const
          parentTiles = {},
          tileSet = {},
          tileList = [];
    
        // if there is no parent zoom level
        let key;
        if (zoom === 0 || zoom <= this.minZoom) {
          for (key in tiles) {
            tiles[key][2] = zoom;
          }
          return tiles;
        }
    
        for (key in tiles) {
          const tile = tiles[key];
    
          const parentX = (tile[0] << 0) / 2;
          const parentY = (tile[1] << 0) / 2;
    
          if (parentTiles[[parentX, parentY]] === undefined) { //parent tile screen size unknown
            const numParentScreenPixels = getTileSizeOnScreen(parentX, parentY, zoom - 1, APP.view.viewProjMatrix);
            parentTiles[[parentX, parentY]] = (numParentScreenPixels < pixelAreaThreshold);
          }
    
          if (!parentTiles[[parentX, parentY]]) { //won't be replaced by a parent tile -->keep
            if (tileSet[[tile[0], tile[1]]] === undefined) {  //remove duplicates
              tileSet[[tile[0], tile[1]]] = true;
              tileList.push([tile[0], tile[1], zoom]);
            }
          }
        }
    
        let parentTileList = [];
    
        for (key in parentTiles) {
          if (parentTiles[key]) {
            const parentTile = key.split(',');
            parentTileList.push([parseInt(parentTile[0]), parseInt(parentTile[1]), zoom - 1]);
          }
        }
    
        if (parentTileList.length > 0) {
          parentTileList = this.mergeTiles(parentTileList, zoom - 1, pixelAreaThreshold);
        }
    
        return tileList.concat(parentTileList);
      }
    
      getDistance (a, b) {
        const dx = a[0] - b[0], dy = a[1] - b[1];
        return dx * dx + dy * dy;
      }
    
      // getAnglePoint (point, angle, distance) {
      //   let rad = angle * Math.PI / 180;
      //   return [distance * Math.cos(rad) + point[0], distance * Math.sin(rad) + point[1]];
      // }
      //
      // // inspired by polygon.js (https://github.com/tmpvar/polygon.js/blob/master/polygon.js
      // pointInPolygon (point, polygon) {
      //   let
      //     res = false,
      //     curr, prev;
      //   for (let i = 1; i < polygon.length; i++) {
      //     curr = polygon[i];
      //     prev = polygon[i - 1];
      //
      //     ((prev[1] <= point[1] && point[1] < curr[1]) || (curr[1] <= point[1] && point[1] < prev[1]))
      //     && (point[0] < (curr[0] - prev[0]) * (point[1] - prev[1]) / (curr[1] - prev[1]) + prev[0])
      //     && (res = !res);
      //   }
      //   return res;
      // }
    
      update () {
        if (APP.zoom < this.minZoom || APP.zoom > this.maxZoom) {
          return;
        }
    
        const zoom = Math.round(this.fixedZoom || APP.zoom);
        // TODO: respect bounds
        // min = project(this.bounds.s, this.bounds.w, 1<<zoom),
        // max = project(this.bounds.n, this.bounds.e, 1<<zoom),
        // bounds = {
        //   zoom: zoom,
        //   minX: min.x <<0,
        //   minY: min.y <<0,
        //   maxX: max.x <<0,
        //   maxY: max.y <<0
        // };
    
        let
          viewQuad = APP.view.getViewQuad(APP.view.viewProjMatrix.data),
          center = project([APP.position.longitude, APP.position.latitude], 1<< zoom);
    
        for (let i = 0; i < 4; i++) {
          viewQuad[i] = getTilePositionFromLocal(viewQuad[i], zoom);
        }
    
        let tiles = rasterConvexQuad(viewQuad);
        tiles = this.fixedZoom ? this.getClosestTiles(tiles, center) : this.mergeTiles(tiles, zoom, 0.5 * TILE_SIZE * TILE_SIZE);
    
        const visibleTiles = {};
        tiles.forEach(pos => {
          if (pos[2] === undefined) {
            pos[2] = zoom;
          }
          visibleTiles[pos.join(',')] = true;
        });
    
        this.visibleTiles = visibleTiles; // TODO: remove from this. Currently needed for basemap renderer collecting items
    
        //*****************************************************
        //*****************************************************
    
        for (let key in visibleTiles) {
          const
            pos = key.split(','),
            x = parseInt(pos[0]),
            y = parseInt(pos[1]),
            zoom = parseInt(pos[2]);
    
          // TODO: check why some other zoom levels are loaded!
    
          if (this.tiles[key]) {
            continue;
          }
    
          // create tile if it doesn't exist
          this.tiles[key] = new this.tileClass(x, y, zoom);
          this.queue.push(this.tiles[key]);
        }
    
        this.purge(visibleTiles);
    
        // update all distances
        this.queue.forEach(tile => {
          tile.distance = this.getDistance([tile.x, tile.y], center);
        });
    
        this.queue.sort((a, b) => {
          return b.distance - a.distance;
        });
    
        this.updateTimer = setTimeout(() => {
          this.update();
        }, 100);
      }
    
      queueNext () {
        if (!this.queue.length) {
          this.queueTimer = setTimeout(this.queueNext.bind(this), 200);
          return;
        }
    
        const tile = this.queue.pop();
    
        tile.load(this.getURL(tile.x, tile.y, tile.zoom), () => {
          this.queueNext();
        });
      }
    
      purge (visibleTiles) {
        const zoom = Math.round(APP.zoom);
    
        for (let key in this.tiles) {
          let tile = this.tiles[key];
    
          // tile is visible: keep
          if (visibleTiles[key]) {
            continue;
          }
    
          // tile is not visible and due to fixedZoom there are no alternate zoom levels: drop
          if (this.fixedZoom) {
            this.tiles[key].destroy();
            delete this.tiles[key];
            continue;
          }
    
          // tile's parent would be visible: keep
          if (tile.zoom === zoom+1) {
            let parentKey = [tile.x/2<<0, tile.y/2<<0, zoom].join(',');
            if (visibleTiles[parentKey]) {
              continue;
            }
          }
    
          // any of tile's children would be visible: keep
          if (tile.zoom === zoom-1) {
            if (
              visibleTiles[[tile.x*2,     tile.y*2,     zoom].join(',')] ||
              visibleTiles[[tile.x*2 + 1, tile.y*2,     zoom].join(',')] ||
              visibleTiles[[tile.x*2,     tile.y*2 + 1, zoom].join(',')] ||
              visibleTiles[[tile.x*2 + 1, tile.y*2 + 1, zoom].join(',')]) {
              continue;
            }
          }
    
          // drop anything else
          delete this.tiles[key];
        }
    
        // remove dead tiles from queue
        this.queue = this.queue.filter(tile => !!tile);
      }
    
      destroy () {
        for (let key in this.tiles) {
          this.tiles[key].destroy();
        }
        this.tiles = {};
        this.queue = [];
    
        clearTimeout(this.updateTimer);
        clearTimeout(this.queueTimer);
      }
    }
    
    class Tile {
    
      constructor (x, y, zoom) {
        this.x = x;
        this.y = y;
        this.zoom = zoom;
        this.key = [x, y, zoom].join(',');
    
        this.distance = Infinity;
      }
    
      // parent () {
      //   return {
      //     x: this.x / 2,
      //     y: this.y / 2,
      //     z: this.zoom - 1
      //   };
      // }
    
      // children () {
      //   return [
      //     { x: this.x * 2,     y: this.y * 2,     z: this.zoom + 1 },
      //     { x: this.x * 2 + 1, y: this.y * 2,     z: this.zoom + 1 },
      //     { x: this.x * 2,     y: this.y * 2 + 1, z: this.zoom + 1 },
      //     { x: this.x * 2 + 1, y: this.y * 2 + 1, z: this.zoom + 1 }
      //   ];
      // }
    
      load () {}
    
      destroy () {}
    }
    
    class BitmapTile extends Tile {
    
      constructor (x, y, zoom) {
        super(x, y, zoom);
    
        this.latitude = tile2lat(y, zoom);
        this.longitude = tile2lon(x, zoom);
    
        // note: due to Mercator projection the tile width in meters is equal to tile height in meters.
        const size = getTileSizeInMeters(this.latitude, zoom);
    
        const vertices = [
          size, size, 0,
          size, 0, 0,
          0, size, 0,
          0, 0, 0
        ];
    
        const texCoords = [
          1, 0,
          1, 1,
          0, 0,
          0, 1
        ];
    
        this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
        this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));
      }
    
      load (url, callback) {
        this.texture = new GLX.texture.Image();
        this.texture.load(url, image => {
          if (image) {
    
            /* Whole texture will be mapped to fit the tile exactly. So
             * don't attempt to wrap around the texture coordinates. */
            GL.bindTexture(GL.TEXTURE_2D, this.texture.id);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    
            this.isReady = true;
          }
    
          if (callback) {
            callback();
          }
        });
      }
    
      destroy () {
        this.vertexBuffer.destroy();
        this.texCoordBuffer.destroy();
    
        if (this.texture) {
          this.texture.destroy();
        }
      }
    }
    
    
    class GeoJSONTile extends Tile {
    
      constructor(x, y, zoom, options) {
        super(x, y, zoom);
        this.options = options;
      }
    
      load (url, callback) {
        this.content = new Feature('GeoJSON', url, this.options, callback);
      }
    
      destroy () {
        if (this.content) {
          this.content.destroy();
        }
      }
    }
    
    
    // TODO: collision check
    
    class FeatureCollection extends Collection {
    
      constructor () {
        super();
        this.tintCallback = () => {};
        this.zScaleCallback = () => {};
      }
    
      setTintCallback (tintCallback) {
        this.tintCallback = tintCallback;
        this.forEach(item => {
          item.applyTintAndZScale();
        });
      }
    
      setZScaleCallback (zScaleCallback) {
        this.zScaleCallback = zScaleCallback;
        this.forEach(item => {
          item.applyTintAndZScale();
        });
      }
    }
    
    
    class Feature {
    
      constructor (type, url, options = {}, callback = function () {}) {
        this.type = type;
        this.options = options;
        this.callback = callback;
    
        this.id = options.id;
        this.color = options.color;
        this.altitude = options.altitude || 0;
        this.matrix = new GLX.Matrix();
        this.scale(options.scale || 1);
        this.rotate(options.rotation || 0);
    
        this.minZoom = Math.max(parseFloat(options.minZoom || MIN_ZOOM), APP.minZoom);
        this.maxZoom = Math.min(parseFloat(options.maxZoom || MAX_ZOOM), APP.maxZoom);
    
        if (this.maxZoom < this.minZoom) {
          this.minZoom = MIN_ZOOM;
          this.maxZoom = MAX_ZOOM;
        }
    
        this.load(url);
      }
    
      load (url) {
        // TODO: perhaps have some workers attached to collection and just ask for them
        APP.workers.get(worker => {
          worker.onMessage(res => {
            if (res === 'error') {
              this.callback();
              worker.free();
              return;
            }
    
            if (res === 'load') {
              this.callback();
              return;
            }
    
            this.onLoad(res);
            worker.free();
          });
    
          worker.postMessage({ type: this.type, url: url, options: this.options });
        });
      }
    
      onLoad (res) {
        this.longitude = res.position.longitude;
        this.latitude = res.position.latitude;
        this.metersPerLon = METERS_PER_DEGREE_LATITUDE * Math.cos(this.latitude / 180 * Math.PI);
    
        //****** init buffers *********************************
    
        // this cascade ralaxes rendering a lot when new tile data arrives
        // TODO: destroy properly, even while this cascade might run -> make each step abortable
        this.vertexBuffer = new GLX.Buffer(3, res.vertices);
        this.timer = setTimeout(() => {
          this.normalBuffer = new GLX.Buffer(3, res.normals);
          this.timer = setTimeout(() => {
            this.colorBuffer = new GLX.Buffer(3, res.colors);
            this.timer = setTimeout(() => {
              this.texCoordBuffer = new GLX.Buffer(2, res.texCoords);
              this.timer = setTimeout(() => {
                this.heightBuffer = new GLX.Buffer(1, res.heights);
                this.timer = setTimeout(() => {
                  this.pickingBuffer = new GLX.Buffer(3, res.pickingColors);
                  this.timer = setTimeout(() => {
                    this.items = res.items;
                    this.applyTintAndZScale();
                    APP.features.add(this);
                    this.fade = 0;
                  }, 20);
                }, 20);
              }, 20);
            }, 20);
          }, 20);
        }, 20);
      }
    
      translateBy (x = 0, y = 0, z = 0) {
        this.matrix.translateBy(x, y, z);
      }
    
      scale (scaling) {
        this.matrix.scale(scaling, scaling, scaling);
      }
    
      rotate (angle) {
        this.matrix.rotateZ(-angle);
      }
    
      getMatrix () {
        this.matrix.translateTo(
          (this.longitude - APP.position.longitude) * this.metersPerLon,
          (APP.position.latitude-this.latitude) * METERS_PER_DEGREE_LATITUDE,
          this.altitude
        );
        return this.matrix;
      }
    
      getFade () {
        if (this.fade >= 1) {
          return 1;
        }
    
        APP.view.speedUp();
    
        const fade = this.fade;
        this.fade += 1 / (1 * 60); // (duration * fps)
    
        return fade;
      }


    
      applyTintAndZScale () {
        const tintColors = [];
        const tintCallback = APP.features.tintCallback;
        const zScales = [];
        const zScaleCallback = APP.features.zScaleCallback;
    
        this.items.forEach(item => {
          const f = { id: item.id, properties: item.properties }; // perhaps pass center/bbox as well
          const tintColor = tintCallback(f);

          const col = tintColor ? hexToRgbA(tintColor) : [0,0,0,0]

          const hideFlag = zScaleCallback(f);

          for (let i = 0; i < item.vertexCount; i++) {
            tintColors.push(...col);
            zScales.push(hideFlag ? 0 : 1);
          }
        });
    
        // perhaps mix colors in JS and transfer just one color buffer
        this.tintBuffer = new GLX.Buffer(4, new Float32Array(tintColors));
        this.zScaleBuffer = new GLX.Buffer(1, new Float32Array(zScales));
      }
    
      destroy () {
        APP.features.remove(this);
    
        // if (this.request) {
        //   this.request.abort(); // TODO: signal to workers
        // }
    
        clearTimeout(this.timer);
    
        this.vertexBuffer && this.vertexBuffer.destroy();
        this.normalBuffer && this.normalBuffer.destroy();
        this.colorBuffer && this.colorBuffer.destroy();
        this.texCoordBuffer && this.texCoordBuffer.destroy();
        this.heightBuffer && this.heightBuffer.destroy();
        this.pickingBuffer && this.pickingBuffer.destroy();
        this.tintBuffer && this.tintBuffer.destroy();
        this.zScaleBuffer && this.zScaleBuffer.destroy();
    
        this.items = [];
      }
    }
    
    
    /* A 'MapPlane' object is a rectangular mesh in the X/Y plane (Z=0) that is
     * guaranteed to cover all of the area of that plane that is inside the skydome.
     *
     * A 'MapPlane' is untextured and featureless. Its intended use is as a stand-in
     * for a 'BaseMap' in situations where either using the actual BaseMap would be
     * inefficient (e.g. when the BaseMap would be rendered without a texture) or
     * no BaseMap is present (e.g. if OSMBuildings is used as an overlay to Leaflet
     * or MapBoxGL). This mostly applies to creating depth and normal textures of the
     * scene, not to the actual shaded scene rendering.
     */
    
    class MapPlane {
    
      constructor () {
        this.size = 5000;
    
        this.minZoom = APP.minZoom;
        this.maxZoom = APP.maxZoom;
    
        this.matrix = new GLX.Matrix();
    
        this.createGeometry();
      }
    
      createGeometry () {
        const
          NUM_SEGMENTS = 50,
          segmentSize = 2*this.size / NUM_SEGMENTS,
          normal = [0, 0, 1],
          quadNormals = [...normal, ...normal, ...normal, ...normal, ...normal, ...normal],
          vertices = [],
          normals = [],
          zScale = [];
    
        for (let x = 0; x < NUM_SEGMENTS; x++) {
          for (let y = 0; y < NUM_SEGMENTS; y++) {
            const
              baseX = -this.size + x * segmentSize,
              baseY = -this.size + y * segmentSize;
    
            vertices.push(
              baseX, baseY, 0,
              baseX + segmentSize, baseY + segmentSize, 0,
              baseX + segmentSize, baseY, 0,
    
              baseX, baseY, 0,
              baseX, baseY + segmentSize, 0,
              baseX + segmentSize, baseY + segmentSize, 0);
    
            normals.push(...quadNormals);
    
            // vertices.push(
            //   baseX, baseY, 0,
            //   baseX + segmentSize, baseY, 0,
            //   baseX + segmentSize, baseY + segmentSize, 0,
            //
            //   baseX, baseY, 0,
            //   baseX + segmentSize, baseY + segmentSize, 0,
            //   baseX, baseY + segmentSize, 0);
            //
            // normals.push(...quadNormals);
    
            zScale.push(1, 1, 1, 1, 1, 1);
          }
        }
    
        this.vertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
        this.normalBuffer = new GLX.Buffer(3, new Float32Array(normals));
        this.zScaleBuffer = new GLX.Buffer(1, new Float32Array(zScale));
      }
    
      getFade () {
        return 1;
      }
    
      getMatrix () {
        // const scale = Math.pow(2, APP.zoom - 16);
        // this.matrix.scale(scale, scale, scale);
        return this.matrix;
      }
    
      destroy () {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
      }
    }
    
    
    function assert(condition, message) {
      if (!condition) {
        throw message;
      }
    }
    
    /* Returns the distance of point 'p' from line 'line1'->'line2'.
     * based on http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
     */
     /*
    function getDistancePointLine2( line1, line2, p) {
    
      //v: a unit-length vector perpendicular to the line;
      const v = norm2( [ line2[1] - line1[1], line1[0] - line2[0] ] );
      const r = sub2( line1, p);
      return Math.abs(dot2(v, r));
    } */
    
    /*  given a pixel's (integer) position through which the line 'segmentStart' ->
     *  'segmentEnd' passes, this method returns the one neighboring pixel of 
     *  'currentPixel' that would be traversed next if the line is followed in 
     *  the direction from 'segmentStart' to 'segmentEnd' (even if the next point
     *  would lie beyond 'segmentEnd'. )
     */
    function getNextPixel(segmentStart, segmentEnd, currentPixel) {
      const vInc = [segmentStart[0] < segmentEnd[0] ? 1 : -1,
                  segmentStart[1] < segmentEnd[1] ? 1 : -1];
             
      const nextX = currentPixel[0] + (segmentStart[0] < segmentEnd[0] ?  +1 : 0);
      const nextY = currentPixel[1] + (segmentStart[1] < segmentEnd[1] ?  +1 : 0);
      
      // position of the edge to the next pixel on the line 'segmentStart'->'segmentEnd'
      const alphaX = (nextX - segmentStart[0])/ (segmentEnd[0] - segmentStart[0]);
      const alphaY = (nextY - segmentStart[1])/ (segmentEnd[1] - segmentStart[1]);
      
      // neither value is valid
      if ((alphaX <= 0.0 || alphaX > 1.0) && (alphaY <= 0.0 || alphaY > 1.0)) {
        return [undefined, undefined];
      }
        
      if (alphaX <= 0.0 || alphaX > 1.0) { // only alphaY is valid
        return [currentPixel[0], currentPixel[1] + vInc[1]];
      }
    
      if (alphaY <= 0.0 || alphaY > 1.0) { // only alphaX is valid
        return [currentPixel[0] + vInc[0], currentPixel[1]];
      }
        
      return alphaX < alphaY ? [currentPixel[0]+vInc[0], currentPixel[1]] :
                               [currentPixel[0],         currentPixel[1] + vInc[1]];
    }
    
    /* returns all pixels that are at least partially covered by the triangle
     * p1-p2-p3. 
     * Note: the returned array of pixels *will* contain duplicates that may need 
     * to be removed.
     */
    function rasterTriangle(p1, p2, p3) {
      const points = [p1, p2, p3];
      points.sort((p, q) => {
        return p[1] < q[1];
      });
      p1 = points[0];
      p2 = points[1];
      p3 = points[2];
      
      if (p1[1] == p2[1])
        return rasterFlatTriangle( p1, p2, p3);
        
      if (p2[1] == p3[1])
        return rasterFlatTriangle( p2, p3, p1);
    
      const alpha = (p2[1] - p1[1]) / (p3[1] - p1[1]);
      //point on the line p1->p3 with the same y-value as p2
      const p4 = [p1[0] + alpha*(p3[0]-p1[0]), p2[1]];
      
      /*  P3
       *   |\
       *   | \
       *  P4--P2
       *   | /
       *   |/
       *   P1
       * */
      return rasterFlatTriangle(p4, p2, p1).concat(rasterFlatTriangle(p4, p2, p3));
    }
    
    /* Returns all pixels that are at least partially covered by the triangle
     * flat0-flat1-other, where the points flat0 and flat1 need to have the
     * same y-value. This method is used internally for rasterTriangle(), which
     * splits a general triangle into two flat triangles, and calls this method
     * for both parts.
     * Note: the returned array of pixels will contain duplicates.
     *
     * other
     *  | \_
     *  |   \_
     *  |     \_
     * f0/f1--f1/f0  
     */
    function rasterFlatTriangle( flat0, flat1, other ) {
    
      //console.log("RFT:\n%s\n%s\n%s", String(flat0), String(flat1), String(other));
      const points = [];
      assert(flat0[1] === flat1[1], 'not a flat triangle');
      assert(other[1] !== flat0[1], 'not a triangle');
      assert(flat0[0] !== flat1[0], 'not a triangle');
    
      if (flat0[0] > flat1[0]) //guarantees that flat0 is always left of flat1
      {
        const tmp = flat0;
        flat0 = flat1;
        flat1 = tmp;
      }
    
      let leftRasterPos = [other[0] <<0, other[1] <<0];
      let rightRasterPos = leftRasterPos.slice(0);
      points.push(leftRasterPos.slice(0));
      const yDir = other[1] < flat0[1] ? +1 : -1;
      const yStart = leftRasterPos[1];
      const yBeyond= (flat0[1] <<0) + yDir;
      let prevLeftRasterPos;
      let prevRightRasterPos;
    
      for (let y = yStart; (y*yDir) < (yBeyond*yDir); y+= yDir) {
        do {
          points.push( leftRasterPos.slice(0));
          prevLeftRasterPos = leftRasterPos;
          leftRasterPos = getNextPixel(other, flat0, leftRasterPos);
        } while (leftRasterPos[1]*yDir <= y*yDir);
        leftRasterPos = prevLeftRasterPos;
        
        do {
          points.push( rightRasterPos.slice(0));
          prevRightRasterPos = rightRasterPos;
          rightRasterPos = getNextPixel(other, flat1, rightRasterPos);
        } while (rightRasterPos[1]*yDir <= y*yDir);
        rightRasterPos = prevRightRasterPos;
        
        for (let x = leftRasterPos[0]; x <= rightRasterPos[0]; x++) {
          points.push([x, y]);
        }
      }
      
      return points;
    }
    
    /* Returns an array of all pixels that are at least partially covered by the
     * convex quadrilateral 'quad'. If the passed quadrilateral is not convex,
     * then the return value of this method is undefined.
     */
    function rasterConvexQuad(quad) {
      assert(quad.length == 4, 'Error: Quadrilateral with more or less than four vertices');
      const res1 = rasterTriangle(quad[0], quad[1], quad[2]);
      const res2 = rasterTriangle(quad[0], quad[2], quad[3]);
      return res1.concat(res2);
    }
    
    // computes the normal vector of the triangle a-b-c
    function normal(a, b, c) {
      const d1 = sub3(a, b);
      const d2 = sub3(b, c);
      // normalized cross product of d1 and d2.
      return norm3([ d1[1]*d2[2] - d1[2]*d2[1],
                     d1[2]*d2[0] - d1[0]*d2[2],
                     d1[0]*d2[1] - d1[1]*d2[0] ]);
    }
    
    
    
    /**
     * returns the quadrilateral part of the XY plane that is currently visible on
     * screen. The quad is returned in tile coordinates for tile zoom level
     * 'tileZoomLevel', and thus can directly be used to determine which basemap
     * and geometry tiles need to be loaded.
     * Note: if the horizon is level (as should usually be the case for 
     * OSMBuildings) then said quad is also a trapezoid.
     */
    function getViewQuad(viewProjectionMatrix, maxFarEdgeDistance, viewDirOnMap) {
      // maxFarEdgeDistance: maximum distance from the map center at which geometry is still visible
    
      const inverseViewMatrix = GLX.Matrix.invert(viewProjectionMatrix);
    
      let
        vBottomLeft  = getIntersectionWithXYPlane(-1, -1, inverseViewMatrix),
        vBottomRight = getIntersectionWithXYPlane( 1, -1, inverseViewMatrix),
        vTopRight    = getIntersectionWithXYPlane( 1,  1, inverseViewMatrix),
        vTopLeft     = getIntersectionWithXYPlane(-1,  1, inverseViewMatrix);
    
      // If even the lower edge of the screen does not intersect with the map plane,
      // then the map plane is not visible at all. We won't attempt to create a view rectangle.
    
      if (!vBottomLeft || !vBottomRight) {
        return;
      }
    
      let
        vLeftDir, vRightDir, vLeftPoint, vRightPoint,
        f;
    
      // The lower screen edge intersects map plane, but the upper one does not.
      // Usually happens when the camera is close to parallel to the ground
      // so that the upper screen edge lies above the horizon. This is not a bug
      // and can legitimately happen. But from a theoretical standpoint, this means
      // that the view 'trapezoid' stretches infinitely toward the horizon. Since this
      // is not useful we manually limit that area.
    
      if (!vTopLeft || !vTopRight) {
        // point on the left screen edge with the same y-value as the map center*/
        vLeftPoint = getIntersectionWithXYPlane(-1, -0.9, inverseViewMatrix);
        vLeftDir = norm2(sub2(vLeftPoint, vBottomLeft));
        f = dot2(vLeftDir, viewDirOnMap);
        vTopLeft = add2( vBottomLeft, mul2scalar(vLeftDir, maxFarEdgeDistance/f));
        
        vRightPoint = getIntersectionWithXYPlane( 1, -0.9, inverseViewMatrix);
        vRightDir = norm2(sub2(vRightPoint, vBottomRight));
        f = dot2(vRightDir, viewDirOnMap);
        vTopRight = add2( vBottomRight, mul2scalar(vRightDir, maxFarEdgeDistance/f));
      }
    
      // If vTopLeft is further than maxFarEdgeDistance away vertically from the lower edge, move it closer.
      if (dot2(viewDirOnMap, sub2(vTopLeft, vBottomLeft)) > maxFarEdgeDistance) {
        vLeftDir = norm2(sub2(vTopLeft, vBottomLeft));
        f = dot2(vLeftDir, viewDirOnMap);
        vTopLeft = add2(vBottomLeft, mul2scalar(vLeftDir, maxFarEdgeDistance/f));
      }
    
      // Same for vTopRight
      if (dot2(viewDirOnMap, sub2(vTopRight, vBottomRight)) > maxFarEdgeDistance) {
        vRightDir = norm2(sub2(vTopRight, vBottomRight));
        f = dot2(vRightDir, viewDirOnMap);
        vTopRight = add2(vBottomRight, mul2scalar(vRightDir, maxFarEdgeDistance/f));
      }
     
      return [vBottomLeft, vBottomRight, vTopRight, vTopLeft];
    }
    
    
    /* Returns an orthographic projection matrix whose view rectangle contains all
     * points of 'points' when watched from the position given by targetViewMatrix.
     * The depth range of the returned matrix is [near, far].
     * The 'points' are given as euclidean coordinates in [m] distance to the 
     * current reference point (APP.position). 
     */
    function getCoveringOrthoProjection(points, targetViewMatrix, near, far, height) {
      const p = transformVec3(targetViewMatrix.data, points[0]);
      let left   = p[0];
      let right  = p[0];
      let top    = p[1];
      let bottom = p[1];
    
      points.forEach(point => {
        const p = transformVec3(targetViewMatrix.data, point);
        left   = Math.min( left,  p[0]);
        right  = Math.max( right, p[0]);
        top    = Math.max( top,   p[1]);
        bottom = Math.min( bottom,p[1]);
      });
    
      return new GLX.Matrix.Ortho(left, right, top, bottom, near, far);
    }
    
    /* transforms the 3D vector 'v' according to the transformation matrix 'm'.
     * Internally, the vector 'v' is interpreted as a 4D vector
     * (v[0], v[1], v[2], 1.0) in homogenous coordinates. The transformation is
     * performed on that vector, yielding a 4D homogenous result vector. That
     * vector is then converted back to a 3D Euler coordinates by dividing
     * its first three components each by its fourth component */
    function transformVec3(m, v) {
      const x = v[0]*m[0] + v[1]*m[4] + v[2]*m[8]  + m[12];
      const y = v[0]*m[1] + v[1]*m[5] + v[2]*m[9]  + m[13];
      const z = v[0]*m[2] + v[1]*m[6] + v[2]*m[10] + m[14];
      const w = v[0]*m[3] + v[1]*m[7] + v[2]*m[11] + m[15];
      return [x/w, y/w, z/w]; //convert homogenous to Euler coordinates
    }
    
    /* returns the point (in OSMBuildings' local coordinates) on the XY plane (z==0)
     * that would be drawn at viewport position (screenNdcX, screenNdcY).
     * That viewport position is given in normalized device coordinates, i.e.
     * x==-1.0 is the left screen edge, x==+1.0 is the right one, y==-1.0 is the lower
     * screen edge and y==+1.0 is the upper one.
     */
    function getIntersectionWithXYPlane(screenNdcX, screenNdcY, inverseTransform) {
      const v1 = transformVec3(inverseTransform, [screenNdcX, screenNdcY, 0]);
      const v2 = transformVec3(inverseTransform, [screenNdcX, screenNdcY, 1]);
    
      // direction vector from v1 to v2
      const vDir = sub3(v2, v1);
    
      if (vDir[2] >= 0) // ray would not intersect with the plane
      {
        return;
      }
      /* ray equation for all world-space points 'p' lying on the screen-space NDC position
       * (screenNdcX, screenNdcY) is:  p = v1 + λ*vDirNorm
       * For the intersection with the xy-plane (-> z=0) holds: v1[2] + λ*vDirNorm[2] = p[2] = 0.0.
       * Rearranged, this reads:   */
      const lambda = -v1[2]/vDir[2];
      const pos = add3( v1, mul3scalar(vDir, lambda));
    
      return [pos[0], pos[1]];  // z==0 
    }
    
    /* Returns: the number of screen pixels that would be covered by the tile 
     *          tileZoom/tileX/tileY *if* the screen would not end at the viewport
     *          edges. The intended use of this method is to return a measure of 
     *          how detailed the tile should be rendered.
     * Note: This method does not clip the tile to the viewport. So the number
     *       returned will be larger than the number of screen pixels covered iff.
     *       the tile intersects with a viewport edge. 
     */
    function getTileSizeOnScreen(tileX, tileY, tileZoom, viewProjMatrix) {
      const tileLon = tile2lon(tileX, tileZoom);
      const tileLat = tile2lat(tileY, tileZoom);
      
      const modelMatrix = new GLX.Matrix();
      modelMatrix.translateBy(
        (tileLon - APP.position.longitude) * METERS_PER_DEGREE_LONGITUDE,
        (APP.position.latitude - tileLat) * METERS_PER_DEGREE_LATITUDE,
        0
      );
    
      const size = getTileSizeInMeters( APP.position.latitude, tileZoom);
      
      const mvpMatrix = GLX.Matrix.multiply(modelMatrix, viewProjMatrix);
      const tl = transformVec3(mvpMatrix, [0   , 0   , 0]);
      const tr = transformVec3(mvpMatrix, [size, 0   , 0]);
      const bl = transformVec3(mvpMatrix, [0   , size, 0]);
      const br = transformVec3(mvpMatrix, [size, size, 0]);
      const res = [tl, tr, bl, br].map(vert => {
        // transformation from NDC [-1..1] to viewport [0.. width/height] coordinates
        vert[0] = (vert[0] + 1.0) / 2.0 * APP.width;
        vert[1] = (vert[1] + 1.0) / 2.0 * APP.height;
        return vert;
      });
      
      return getConvexQuadArea(res);
    }
    
    function getTriangleArea(p1, p2, p3) {
      //triangle edge lengths
      const a = len2(sub2( p1, p2));
      const b = len2(sub2( p1, p3));
      const c = len2(sub2( p2, p3));
      
      //Heron's formula
      const s = 0.5 * (a+b+c);
      return Math.sqrt( s * (s-a) * (s-b) * (s-c));
    }
    
    function getConvexQuadArea(quad) {
      return getTriangleArea( quad[0], quad[1], quad[2]) + 
             getTriangleArea( quad[0], quad[2], quad[3]);
    }
    
    function getTileSizeInMeters( latitude, zoom) {
      return EARTH_CIRCUMFERENCE_IN_METERS * Math.cos(latitude / 180 * Math.PI) / 
             Math.pow(2, zoom);
    }
    
    function getPositionFromLocal(localXY) {
      return {
        longitude: APP.position.longitude + localXY[0] / METERS_PER_DEGREE_LONGITUDE,
        latitude: APP.position.latitude - localXY[1] / METERS_PER_DEGREE_LATITUDE
      };
    }
    
    function getTilePositionFromLocal(localXY, zoom) {
      const pos = getPositionFromLocal(localXY);
      return project([pos.longitude,  pos.latitude], 1<<zoom);
    }
    
    function project(point, scale = 1) {
      return [
        (point[0]/360 + 0.5) * scale,
        (1-Math.log(Math.tan(point[1] * Math.PI / 180) + 1 / Math.cos(point[1] * Math.PI/180)) / Math.PI)/2 * scale
      ];
    }
    
    function tile2lon(x, z) {
      return (x/Math.pow(2,z)*360-180);
    }
    
    function tile2lat(y, z) {
      const n = Math.PI-2*Math.PI*y/Math.pow(2,z);
      return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
    }
    
    function len2(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1]);}
    function dot2(a,b) { return a[0]*b[0] + a[1]*b[1];}
    function sub2(a,b) { return [a[0]-b[0], a[1]-b[1]];}
    function add2(a,b) { return [a[0]+b[0], a[1]+b[1]];}
    function mul2scalar(a,f) { return [a[0]*f, a[1]*f];}
    function norm2(a)  { const l = len2(a); return [a[0]/l, a[1]/l]; }
    
    function dot3(a,b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];}
    function sub3(a,b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];}
    function add3(a,b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];}
    function add3scalar(a,f) { return [a[0]+f, a[1]+f, a[2]+f];}
    function mul3scalar(a,f) { return [a[0]*f, a[1]*f, a[2]*f];}
    function len3(a)   { return Math.sqrt( a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);}
    function squaredLength(a) { return a[0]*a[0] + a[1]*a[1] + a[2]*a[2];}
    function norm3(a)  { const l = len3(a); return [a[0]/l, a[1]/l, a[2]/l]; }
    function dist3(a,b){ return len3(sub3(a,b));}
    function equal3(a, b) { return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];}
    
    
    class View {
    
      getViewQuad () {
        return getViewQuad(this.viewProjMatrix.data,  (this.fogDistance + this.fogBlurDistance), this.viewDirOnMap);
      }
    
      start () {
        this.shadowsEnabled = true;
    
        // disable effects if they rely on WebGL extensions
        // that the current hardware does not support
        if (!GL.depthTextureExtension) {
          console.warn('Shadows are disabled because your GPU does not support WEBGL_depth_texture');
          this.shadowsEnabled = false;
        }
    
        this.setupViewport();
    
        GL.cullFace(GL.BACK);
        GL.enable(GL.CULL_FACE);
        GL.enable(GL.DEPTH_TEST);
    
        this.Picking = new View.Picking(); // renders only on demand
        this.Horizon = new View.Horizon();
        this.Buildings = new View.Buildings();
        // if (this.shadowsEnabled) {
        //   this.Markers = new View.Markers();
        // } else {
          this.Markers = new View.MarkersSimple();
        // }
        this.Basemap = new View.Basemap();
    
        this.Overlay = new View.Overlay();
        this.ambientMap = new View.AmbientMap();
        this.blurredAmbientMap = new View.Blur();
        this.MapShadows = new View.MapShadows();
        if (this.shadowsEnabled) {
          this.cameraGBuffer = new View.DepthNormal();
          this.sunGBuffer = new View.DepthNormal();
        }
    
        this.speedUp();
    
        this.renderFrame();
      }
    
      renderFrame () {
        if (APP.zoom >= APP.minZoom && APP.zoom <= APP.maxZoom) {
          requestAnimationFrame(() => {
    
            this.setupViewport();
            GL.clearColor(this.fogColor[0], this.fogColor[1], this.fogColor[2], 0.0);
            GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    
            const viewSize = [APP.width, APP.height];
    
            if (!this.shadowsEnabled) {
              this.Buildings.render();
              this.Markers.render();
    
              GL.enable(GL.BLEND);
    
              GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
              GL.disable(GL.DEPTH_TEST);
              this.Horizon.render();
              GL.disable(GL.BLEND);
              GL.enable(GL.DEPTH_TEST);
    
              this.Basemap.render();
            } else {
              const viewTrapezoid = this.getViewQuad();
    
              View.Sun.updateView(viewTrapezoid);
              this.Horizon.updateGeometry(viewTrapezoid);
    
              this.cameraGBuffer.render(this.viewMatrix, this.projMatrix, viewSize, true);
              this.sunGBuffer.render(View.Sun.viewMatrix, View.Sun.projMatrix, [SHADOW_DEPTH_MAP_SIZE, SHADOW_DEPTH_MAP_SIZE]);
              this.ambientMap.render(this.cameraGBuffer.framebuffer.depthTexture, this.cameraGBuffer.framebuffer.renderTexture, viewSize, 2.0);
              this.blurredAmbientMap.render(this.ambientMap.framebuffer.renderTexture, viewSize);
              this.Buildings.render(this.sunGBuffer.framebuffer);
              this.Markers.render(this.sunGBuffer.framebuffer);
              this.Basemap.render();
    
              GL.enable(GL.BLEND);
    
              // multiply DEST_COLOR by SRC_COLOR, keep SRC alpha
              // this applies the shadow and SSAO effects (which selectively darken the scene)
              // while keeping the alpha channel (that corresponds to how much the
              // geometry should be blurred into the background in the next step) intact
              GL.blendFuncSeparate(GL.ZERO, GL.SRC_COLOR, GL.ZERO, GL.ONE);
    
              this.MapShadows.render(this.sunGBuffer.framebuffer, 0.5);
              this.Overlay.render(this.blurredAmbientMap.framebuffer.renderTexture, viewSize);
    
              // linear interpolation between the colors of the current framebuffer
              // ( =building geometries) and of the sky. The interpolation factor
              // is the geometry alpha value, which contains the 'foggyness' of each pixel
              // the alpha interpolation functions is set to GL.ONE for both operands
              // to ensure that the alpha channel will become 1.0 for each pixel after this
              // operation, and thus the whole canvas is not rendered partially transparently
              // over its background.
              GL.blendFuncSeparate(GL.ONE_MINUS_DST_ALPHA, GL.DST_ALPHA, GL.ONE, GL.ONE);
    
    
              GL.disable(GL.DEPTH_TEST);
              this.Horizon.render();
              GL.enable(GL.DEPTH_TEST);
    
              GL.disable(GL.BLEND);
    
              // this.hudRect.render( this.sunGBuffer.getFogNormalTexture(), config );
            }
    
            // APP.markers.updateMarkerView();
    
            if (this.isFast) {
              this.renderFrame();
              // setTimeout(() => {
              //   this.renderFrame();
              // }, 5);
            } else {
              setTimeout(() => {
                this.renderFrame();
              }, 250);
            }
    
          }); // end requestAnimationFrame()
        }
      }
    
      // initialize view and projection matrix, fog distance, etc.
      setupViewport () {
        if (GL.canvas.width !== APP.width) {
          GL.canvas.width = APP.width;
        }
        if (GL.canvas.height !== APP.height) {
          GL.canvas.height = APP.height;
        }
    
        const
          scale = 1.3567 * Math.pow(2, APP.zoom - 17),
          width = APP.width,
          height = APP.height,
          refHeight = 1024,
          refVFOV = 45;
    
        GL.viewport(0, 0, width, height);
    
        this.viewMatrix = new GLX.Matrix()
          .rotateZ(APP.rotation)
          .rotateX(APP.tilt)
          .translateBy(0, 8 / scale, 0) // corrective offset to match Leaflet's coordinate system (value was determined empirically)
          .translateBy(0, 0, -1220 / scale); //move away to simulate zoom; -1220 scales APP tiles to ~256px
    
        this.viewDirOnMap = [Math.sin(APP.rotation / 180 * Math.PI), -Math.cos(APP.rotation / 180 * Math.PI)];
    
        // First, we need to determine the field-of-view so that our map scale does
        // not change when the viewport size changes. The map scale is given by the
        // 'refFOV' (e.g. 45°) at a WebGL viewport height of 'refHeight' pixels.
        // Since our viewport will not usually be 1024 pixels high, we'll need to
        // find the FOV that corresponds to our viewport height.
        // The half viewport height and half FOV form a leg and the opposite angle
        // of a right triangle (see sketch below). Since the relation between the
        // two is non-linear, we cannot simply scale the reference FOV by the ratio
        // of reference height to actual height to get the desired FOV.
        // But be can use the reference height and reference FOV to determine the
        // virtual distance to the camera and then use that virtual distance to
        // compute the FOV corresponding to the actual height.
        //
        //                   ____/|
        //              ____/     |
        //         ____/          | refHeight/2
        //    ____/  \            |
        //   /refFOV/2|           |
        //  ----------------------|
        //     "virtual distance"
        const virtualDistance = refHeight / (2 * Math.tan((refVFOV / 2) / 180 * Math.PI));
        const verticalFOV = 2 * Math.atan((height / 2.0) / virtualDistance) / Math.PI * 180;
    
        // OSMBuildings' perspective camera is ... special: The reference point for
        // camera movement, rotation and zoom is at the screen center (as usual).
        // But the center of projection is not at the screen center as well but at
        // the bottom center of the screen. This projection was chosen for artistic
        // reasons so that when the map is seen from straight above, vertical building
        // walls would not be seen to face towards the screen center but would
        // uniformly face downward on the screen.
    
        // To achieve this projection, we need to
        // 1. shift the whole geometry up half a screen (so that the desired
        //    center of projection aligns with the view center) *in world coordinates*.
        // 2. perform the actual perspective projection (and flip the y coordinate for
        //    internal reasons).
        // 3. shift the geometry back down half a screen now *in screen coordinates*
    
        this.nearPlane = 1;
        this.farPlane = 30000;
    
        this.projMatrix = new GLX.Matrix()
          .translateTo(0, -height / (2 * scale), 0) // 0, APP y offset to neutralize camera y offset,
          .scale(1, -1, 1) // flip Y
          .multiply(new GLX.Matrix.Perspective(verticalFOV, width / height, this.nearPlane, this.farPlane))
          .translateBy(0, -1, 0); // camera y offset
    
        this.viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(this.viewMatrix, this.projMatrix));
    
        // need to store this as a reference point to determine fog distance
        this.lowerLeftOnMap = getIntersectionWithXYPlane(-1, -1, GLX.Matrix.invert(this.viewProjMatrix.data));
        if (this.lowerLeftOnMap === undefined) {
          return;
        }
    
        // const lowerLeftDistanceToCenter = len2(this.lowerLeftOnMap);
    
        // fogDistance: closest distance at which the fog affects the geometry
        // this.fogDistance = Math.max(5000, lowerLeftDistanceToCenter);
    
        this.fogDistance = 5000;
    
        // fogBlurDistance: closest distance *beyond* fogDistance at which everything is completely enclosed in fog.
        this.fogBlurDistance = 10000;
      }
    
      speedUp () {
        this.isFast = true;
        // console.log('FAST');
        clearTimeout(this.speedTimer);
        this.speedTimer = setTimeout(() => {
          this.isFast = false;
          // console.log('SLOW');
        }, 1000);
      }
    
      destroy () {
        this.Picking.destroy();
        this.Horizon.destroy();
        this.Buildings.destroy();
        this.Markers.destroy();
        this.Basemap.destroy();
        this.MapShadows.destroy();
    
        if (this.cameraGBuffer) {
          this.cameraGBuffer.destroy();
        }
    
        if (this.sunGBuffer) {
          this.sunGBuffer.destroy();
        }
    
        this.ambientMap.destroy();
        this.blurredAmbientMap.destroy();
    
        clearTimeout(this.speedTimer);
      }
    }
    
    // TODO: perhaps render only clicked area
    // TODO: no picking if too far, too small (zoom levels)
    
    View.Picking = class {
    
      constructor () {
        this.featuresShader = new GLX.Shader({
          source: shaders.picking,
          attributes: ['aPosition', 'aPickingColor', 'aZScale'],
          uniforms: [
            'uModelMatrix',
            'uMatrix',
            'uFogDistance',
            'uFade',
            'uIndex'
          ]
        });
    
        this.markersShader = new GLX.Shader({
          source: shaders.markers_picking,
          attributes: ['aPosition'],
          uniforms: [
            'uPickingColor',
            'uModelMatrix',
            'uProjMatrix',
            'uViewMatrix',
            'uFogDistance',
            'uIndex'
          ]
        });
    
        this.size = [512, 512];
        this.framebuffer = new GLX.Framebuffer(this.size[0], this.size[1]);
      }
    
      renderFeatures () {
        const shader = this.featuresShader;
    
        shader.enable();
    
        shader.setParam('uFogDistance', '1f', APP.view.fogDistance);
    
        const renderedFeatures = [];
        APP.features.forEach(item => {
          if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
            return;
          }
    
          let modelMatrix = item.getMatrix();
          if (!modelMatrix) {
            return;
          }
    
          renderedFeatures.push(item.items);
    
          shader.setParam('uFade', '1f', item.getFade());
          shader.setParam('uIndex', '1f', renderedFeatures.length / 256);
    
          shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
          shader.setMatrix('uMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, APP.view.viewProjMatrix));
    
          shader.setBuffer('aPosition', item.vertexBuffer);
          shader.setBuffer('aPickingColor', item.pickingBuffer);
          shader.setBuffer('aZScale', item.zScaleBuffer);
    
          GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
        });
    
        shader.disable();
    
        return renderedFeatures;
      }
    
      renderMarkers (renderedFeaturesLength) {
        const shader = this.markersShader;
    
        shader.enable();
    
        shader.setParam('uFogDistance', '1f', APP.view.fogDistance);
    
        const renderedMarkers = [];
        APP.markers.forEach((item, i) => {
          let modelMatrix = item.getMatrix();
    
          renderedMarkers.push(item);
    
          shader.setParam('uIndex', '1f', (renderedFeaturesLength+1) / 256);
    
          shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
          shader.setMatrix('uViewMatrix', '4fv', APP.view.viewMatrix.data);
          shader.setMatrix('uProjMatrix', '4fv', APP.view.projMatrix.data);
    
          shader.setBuffer('aPosition', item.icon.vertexBuffer);
    
          // TODO: do this in Marker, early
          i++;
          const pickingColor = [0, (i & 0xff) / 255, ((i >> 8) & 0xff) / 255];
    
          shader.setParam('uPickingColor', '3fv', pickingColor);
    
          GL.drawArrays(GL.TRIANGLES, 0, item.icon.vertexBuffer.numItems);
        });
    
        shader.disable();
    
        return renderedMarkers;
      }
    
      findFeatures (renderedFeatures, i, f) {
        if (!renderedFeatures[i] || !renderedFeatures[i][f]) {
          return;
        }
    
        const feature = renderedFeatures[i][f];
        // callback({ id: feature.id, properties: feature.properties });
    
        // find related items (across tiles)
        const res = [];
        const id = feature.properties.building || feature.id;
        APP.features.forEach(item => { // all tiles...
          item.items.forEach(feature => { // ...and their features
            if ((feature.id === id || feature.properties.building === id) && !res.some(f => f.id === feature.id)) {
              res.push({id: feature.id, properties: feature.properties});
            }
          });
        });
    
        return res;
      }
    
      getTarget (x, y, callback) {
        requestAnimationFrame(() => {
          const res = {};
    
          GL.viewport(0, 0, this.size[0], this.size[1]);
    
          this.framebuffer.enable();
    
          GL.clearColor(0, 0, 0, 1);
          GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    
          const renderedFeatures = this.renderFeatures();
          const renderedMarkers = this.renderMarkers(renderedFeatures.length);
    
          GL.viewport(0, 0, APP.width, APP.height);
    
          const
            X = x / APP.width * this.size[0] << 0,
            Y = y / APP.height * this.size[1] << 0;
    
          const imgData = this.framebuffer.getPixel(X, this.size[1] - 1 - Y);
          this.framebuffer.disable();
    
          if (imgData) {
            const
              i = imgData[0] - 1,
              f = (imgData[1] | (imgData[2] << 8)) - 1;
    
            res.features = this.findFeatures(renderedFeatures, i, f);
            res.marker = (renderedMarkers[f] && renderedMarkers[f].data);
          }
    
          callback(res);
        }); // end requestAnimationFrame()
      }
    
      destroy () {
        this.featuresShader.destroy();
        this.markersShader.destroy();
        this.framebuffer.destroy();
      }
    };
    
    View.Sun = class {
    
      static setDate (date) {
        const pos = suncalc(date, APP.position.latitude, APP.position.longitude);
    
        this.direction = [
          -Math.sin(pos.azimuth) * Math.cos(pos.altitude),
           Math.cos(pos.azimuth) * Math.cos(pos.altitude),
                                   Math.sin(pos.altitude)
        ];
    
        const rotationInDeg = pos.azimuth / (Math.PI/180);
        const tiltInDeg     = 90 - pos.altitude / (Math.PI/180);
    
        this.viewMatrix = new GLX.Matrix()
          .rotateZ(rotationInDeg)
          .rotateX(tiltInDeg)
          .translateTo(0, 0, -5000)
          .scale(1, -1, 1); // flip Y
      }
      
      static updateView (coveredGroundVertices) {
        // TODO: could parts be pre-calculated?
        this.projMatrix = getCoveringOrthoProjection(
          substituteZCoordinate(coveredGroundVertices, 0.0).concat(substituteZCoordinate(coveredGroundVertices, SHADOW_MAP_MAX_BUILDING_HEIGHT)),
          this.viewMatrix,
          1000,
          7500
        );
    
        this.viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(this.viewMatrix, this.projMatrix));
      }
    };
    
    
    View.Buildings = class {
    
      constructor () {
        this.shader = !APP.view.shadowsEnabled ?
          new GLX.Shader({
            source: shaders.buildings,
            attributes: ['aPosition', 'aTexCoord', 'aColor', 'aNormal', 'aHeight', 'aTintColor', 'aZScale'],
            uniforms: [
              'uModelMatrix',
              'uViewDirOnMap',
              'uMatrix',
              'uNormalTransform',
              'uLightColor',
              'uLightDirection',
              'uLowerEdgePoint',
              'uFogDistance',
              'uFogBlurDistance',
              'uFade',
              'uWallTexIndex'
            ]
          }) : new GLX.Shader({
          source: shaders.buildings_with_shadows,
          attributes: ['aPosition', 'aTexCoord', 'aColor', 'aNormal', 'aHeight', 'aTintColor', 'aZScale'],
          uniforms: [
            'uFogDistance',
            'uFogBlurDistance',
            'uLightColor',
            'uLightDirection',
            'uLowerEdgePoint',
            'uMatrix',
            'uModelMatrix',
            'uSunMatrix',
            'uShadowTexIndex',
            'uShadowTexDimensions',
            'uFade',
            'uViewDirOnMap',
            'uWallTexIndex'
          ]
        });
    
        this.wallTexture = new GLX.texture.Image();
        this.wallTexture.color([1,1,1]);
        this.wallTexture.load(BUILDING_TEXTURE);
      }
    
      render (depthFramebuffer) {
        const shader = this.shader;
        shader.enable();
    
        // if (this.showBackfaces) {
        //   GL.disable(GL.CULL_FACE);
        // }
    
        shader.setParam('uFogDistance',     '1f',  APP.view.fogDistance);
        shader.setParam('uFogBlurDistance', '1f',  APP.view.fogBlurDistance);
        shader.setParam('uLightColor',      '3fv', [0.5, 0.5, 0.5]);
        shader.setParam('uLightDirection',  '3fv', View.Sun.direction);
        shader.setParam('uLowerEdgePoint',  '2fv', APP.view.lowerLeftOnMap);
        shader.setParam('uViewDirOnMap',    '2fv', APP.view.viewDirOnMap);
    
        if (!APP.view.shadowsEnabled) {
          const matrix3 = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
          ]);
    
          shader.setMatrix('uNormalTransform', '3fv', matrix3);
        }
    
        shader.setTexture('uWallTexIndex', 0, this.wallTexture);
    
        if (depthFramebuffer) {
          shader.setParam('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height]);
          shader.setTexture('uShadowTexIndex', 1, depthFramebuffer.depthTexture);
        }
    
        APP.features.forEach(item => {
          // no visibility check needed, Grid.purge() is taking care
          // TODO: but not for individual features
    
          if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
            return;
          }
    
          const modelMatrix = item.getMatrix();
    
          if (!modelMatrix) {
            return;
          }
    
          shader.setParam('uFade', '1f', item.getFade());
    
          shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
          shader.setMatrix('uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, APP.view.viewProjMatrix));
    
          if (APP.view.shadowsEnabled) {
            shader.setMatrix('uSunMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, View.Sun.viewProjMatrix));
          }
    
          shader.setBuffer('aPosition', item.vertexBuffer);
          shader.setBuffer('aTexCoord', item.texCoordBuffer);
          shader.setBuffer('aNormal', item.normalBuffer);
          shader.setBuffer('aColor', item.colorBuffer);
          shader.setBuffer('aHeight', item.heightBuffer);
          shader.setBuffer('aTintColor', item.tintBuffer);
          shader.setBuffer('aZScale', item.zScaleBuffer);
    
          GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
        });
    
    
        // if (this.showBackfaces) {
        //   GL.enable(GL.CULL_FACE);
        // }
    
        shader.disable();
      }
    
      destroy () {}
    };
    
    View.Markers = class {
    
      constructor () {
    
        this.shader = new GLX.Shader({
          source: shaders.markers,
          attributes: ['aPosition'],
          uniforms: [
            'uFogDistance',
            'uFogBlurDistance',
            'uLightColor',
            'uLightDirection',
            'uLowerEdgePoint',
            'uModelMatrix',
            'uSunMatrix',
            'uShadowTexIndex',
            'uShadowTexDimensions',
            'uViewDirOnMap',
            'uProjMatrix',
            'uViewMatrix',
            'uColor'
          ]
        });
      }
    
      render (depthFramebuffer) {
        const shader = this.shader;
    
        shader.enable();
    
        shader.setParam('uFogDistance',     '1f',  APP.view.fogDistance);
        shader.setParam('uFogBlurDistance', '1f',  APP.view.fogBlurDistance);
        shader.setParam('uLightColor',      '3fv', [0.5, 0.5, 0.5]);
        shader.setParam('uLightDirection',  '3fv', View.Sun.direction);
        shader.setParam('uLowerEdgePoint',  '2fv', APP.view.lowerLeftOnMap);
        shader.setParam('uViewDirOnMap',    '2fv', APP.view.viewDirOnMap);
        shader.setParam('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height]);
    
        shader.setTexture('uShadowTexIndex', 1, depthFramebuffer.depthTexture);
    
        shader.setMatrix('uViewMatrix', '4fv', APP.view.viewMatrix.data);
        shader.setMatrix('uProjMatrix', '4fv', APP.view.projMatrix.data);
    
        APP.markers.forEach(item => {
          const modelMatrix = item.getMatrix();
    
          shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
          shader.setMatrix('uSunMatrix',   '4fv', GLX.Matrix.multiply(modelMatrix, View.Sun.viewProjMatrix));
    
          shader.setBuffer('aPosition', item.icon.vertexBuffer);
    
          // shader.setParam('uColor', '3fv', );
          shader.setParam('uColor', '3fv', item.color)
    
          GL.drawArrays(GL.TRIANGLES, 0, item.icon.vertexBuffer.numItems);
        });
    
        shader.disable();
      }
    
      destroy () {
        this.shader.destroy();
      }
    };
    
    
    View.MarkersSimple = class {
    
      constructor () {
        this.shader = new GLX.Shader({
          source: shaders.markers_simple,
          attributes: ['aPosition'],
          uniforms: [
            'uProjMatrix',
            'uViewMatrix',
            'uModelMatrix',
            'uColor'
          ]
        });
      }
    
      render () {
        const shader = this.shader;
    
        shader.enable();
        shader.setMatrix('uViewMatrix', '4fv', APP.view.viewMatrix.data);
        shader.setMatrix('uProjMatrix', '4fv', APP.view.projMatrix.data);
    
        APP.markers.forEach(item => {
          shader.setMatrix('uModelMatrix', '4fv', item.getMatrix().data);
          shader.setBuffer('aPosition', item.icon.vertexBuffer);
          // shader.setParam('uColor', '3fv', item.color);
          shader.setParam('uColor', '3fv', [204, 0, 0])
    
          GL.drawArrays(GL.TRIANGLES, 0, item.icon.vertexBuffer.numItems);
        });
    
        shader.disable();
      }
    
      destroy () {
        this.shader.destroy();
      }
    };
    
    
    /**
     * This renders shadow for the map layer. It only renders the shadow,
     * not the map itself. Result is used as a blended overlay
     * so that the map can be rendered independently from the shadows cast on it.
     */
    // TODO: independence is not required anymore. could be combined with Basemap?
    
    View.MapShadows = class {
    
      constructor () {
        this.shader = new GLX.Shader({
          source: shaders.basemap_with_shadows,
          attributes: ['aPosition', 'aNormal'],
          uniforms: [
            'uModelMatrix',
            'uViewDirOnMap',
            'uMatrix',
            'uDirToSun',
            'uLowerEdgePoint',
            'uFogDistance',
            'uFogBlurDistance',
            'uShadowTexDimensions', 
            'uShadowStrength',
            'uShadowTexIndex',
            'uSunMatrix',
          ]
        });
        
        this.mapPlane = new MapPlane();
      }
    
      render (depthFramebuffer, shadowStrength) {
        const item = this.mapPlane;
        if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
          return;
        }
    
        const shader = this.shader;
    
        shader.enable();
    
        GL.disable(GL.CULL_FACE);
    
        shader.setParam('uDirToSun', '3fv', View.Sun.direction);
        shader.setParam('uViewDirOnMap', '2fv',   APP.view.viewDirOnMap);
        shader.setParam('uLowerEdgePoint', '2fv', APP.view.lowerLeftOnMap);
        shader.setParam('uFogDistance', '1f', APP.view.fogDistance);
        shader.setParam('uFogBlurDistance', '1f', APP.view.fogBlurDistance);
        shader.setParam('uShadowTexDimensions', '2fv', [depthFramebuffer.width, depthFramebuffer.height] );
        shader.setParam('uShadowStrength', '1f', shadowStrength);
    
        shader.setTexture('uShadowTexIndex', 0, depthFramebuffer.depthTexture);
    
        let modelMatrix;
        if (!(modelMatrix = item.getMatrix())) {
          return;
        }
    
        shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
        shader.setMatrix('uMatrix',      '4fv', GLX.Matrix.multiply(modelMatrix, APP.view.viewProjMatrix));
        shader.setMatrix('uSunMatrix',   '4fv', GLX.Matrix.multiply(modelMatrix, View.Sun.viewProjMatrix));
    
        shader.setBuffer('aPosition', item.vertexBuffer);
        shader.setBuffer('aNormal', item.normalBuffer);
    
        GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    
        shader.disable();
      }
    
      destroy () {
        this.mapPlane.destroy();
      }
    };
    
    View.Basemap = class {
    
      constructor () {
        this.shader = new GLX.Shader({
          source: shaders.basemap,
          attributes: ['aPosition', 'aTexCoord'],
          uniforms: ['uViewMatrix', 'uModelMatrix', 'uTexIndex', 'uFogDistance', 'uFogBlurDistance', 'uLowerEdgePoint', 'uViewDirOnMap']
        });
      }
    
      render () {
        const layer = APP.basemapGrid;
    
        if (!layer) {
          return;
        }
    
        if (APP.zoom < layer.minZoom || APP.zoom > layer.maxZoom) {
          return;
        }
    
        const shader = this.shader;
    
        shader.enable();
    
        shader.setParam('uFogDistance',     '1f',  APP.view.fogDistance);
        shader.setParam('uFogBlurDistance', '1f',  APP.view.fogBlurDistance);
        shader.setParam('uLowerEdgePoint',  '2fv', APP.view.lowerLeftOnMap);
        shader.setParam('uViewDirOnMap',    '2fv', APP.view.viewDirOnMap);
    
        const zoom = Math.round(APP.zoom);
    
        let tile;
        for (let key in layer.visibleTiles) { // TODO: do not refer to layer.visibleTiles
          tile = layer.tiles[key];
    
          if (tile && tile.isReady) {
            this.renderTile(tile);
            continue;
          }
    
          const parentKey = [tile.x/2<<0, tile.y/2<<0, zoom-1].join(',');
          if (layer.tiles[parentKey] && layer.tiles[parentKey].isReady) {
            // TODO: there will be overlap with adjacent tiles or parents of adjacent tiles!
            this.renderTile(layer.tiles[parentKey]);
            continue;
          }
    
          const children = [
            [tile.x*2,   tile.y*2,   tile.zoom+1].join(','),
            [tile.x*2+1, tile.y*2,   tile.zoom+1].join(','),
            [tile.x*2,   tile.y*2+1, tile.zoom+1].join(','),
            [tile.x*2+1, tile.y*2+1, tile.zoom+1].join(',')
          ];
    
          for (let i = 0; i < 4; i++) {
            if (layer.tiles[ children[i] ] && layer.tiles[ children[i] ].isReady) {
              this.renderTile(layer.tiles[ children[i] ]);
            }
          }
        }
    
        shader.disable();
      }
    
      renderTile (tile) {
        const shader = this.shader;
    
        const modelMatrix = new GLX.Matrix();
    
        modelMatrix.translateBy(
          (tile.longitude - APP.position.longitude) * METERS_PER_DEGREE_LONGITUDE,
          (-tile.latitude + APP.position.latitude) * METERS_PER_DEGREE_LATITUDE,
          0
        );
    
        GL.enable(GL.POLYGON_OFFSET_FILL);
        GL.polygonOffset(MAX_USED_ZOOM_LEVEL - tile.zoom, MAX_USED_ZOOM_LEVEL - tile.zoom);
    
        shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
        shader.setMatrix('uViewMatrix',  '4fv', GLX.Matrix.multiply(modelMatrix, APP.view.viewProjMatrix));
    
        shader.setBuffer('aPosition', tile.vertexBuffer);
        shader.setBuffer('aTexCoord', tile.texCoordBuffer);
        shader.setTexture('uTexIndex', 0, tile.texture);
    
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, tile.vertexBuffer.numItems);
        GL.disable(GL.POLYGON_OFFSET_FILL);
      }
    
      destroy () {}
    };
    
    // HudRect renders a textured rectangle to the top-right quarter of the viewport.
    // The intended use is visualize render-to-texture effects during development.
    
    View.HudRect = class {
    
      constructor () {
        this.shader = new GLX.Shader({
          source: shaders.texture,
          attributes: ['aPosition', 'aTexCoord'],
          uniforms: [ 'uMatrix', 'uTexIndex']
        });
    
        const geometry = this.createGeometry();
        this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(geometry.vertices));
        this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(geometry.texCoords));
      }
    
      createGeometry () {
        const
          vertices = [],
          texCoords= [];
    
        vertices.push(0, 0, 1E-5,
                      1, 0, 1E-5,
                      1, 1, 1E-5);
        
        vertices.push(0, 0, 1E-5,
                      1, 1, 1E-5,
                      0, 1, 1E-5);
    
        texCoords.push(0.5,0.5,
                       1.0,0.5,
                       1.0,1.0);
    
        texCoords.push(0.5,0.5,
                       1.0,1.0,
                       0.5,1.0);
    
        return { vertices: vertices , texCoords: texCoords };
      }
    
      render (texture) {
        const shader = this.shader;
    
        shader.enable();
        
        GL.uniformMatrix4fv(shader.uniforms.uMatrix, false, GLX.Matrix.identity().data);
        this.vertexBuffer.enable();
    
        GL.vertexAttribPointer(shader.attributes.aPosition, this.vertexBuffer.itemSize, GL.FLOAT, false, 0, 0);
    
        this.texCoordBuffer.enable();
        GL.vertexAttribPointer(shader.attributes.aTexCoord, this.texCoordBuffer.itemSize, GL.FLOAT, false, 0, 0);
    
        texture.enable(0);
        GL.uniform1i(shader.uniforms.uTexIndex, 0);
    
        GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);
    
        shader.disable();
      }
    
      destroy () {
        this.shader.destroy();
        this.vertexBuffer.destroy();
        this.texCoordBuffer.destroy();
      }
    };
    
    // Renders the depth buffer and normals into textures.
    // Depth is stored as a 24bit depth texture using the WEBGL_depth_texture extension,
    // and normals are stored as the 'rgb' and 'a' of a shared 32bit texture.
    // Note that there is no dedicated shader to create the depth texture. Rather,
    // the depth buffer used by the GPU in depth testing while rendering the normals
    // to a dedicated texture.
    
    View.DepthNormal = class {
    
      constructor () {
        this.shader = new GLX.Shader({
          source: shaders.depth_normal,
          attributes: ['aPosition', 'aNormal', 'aZScale'],
          uniforms: ['uMatrix', 'uModelMatrix', 'uNormalMatrix', 'uFade', 'uFogDistance', 'uFogBlurDistance', 'uViewDirOnMap', 'uLowerEdgePoint']
        });
    
        this.framebuffer = new GLX.Framebuffer(128, 128, /*depthTexture=*/true); // dummy sizes, will be resized dynamically
        this.mapPlane = new MapPlane();
      }
    
      render (viewMatrix, projMatrix, framebufferSize) {
        const
          shader = this.shader,
          framebuffer = this.framebuffer,
          viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(viewMatrix, projMatrix));
    
        framebuffer.setSize(framebufferSize[0], framebufferSize[1]);
    
        shader.enable();
        framebuffer.enable();
    
        GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);
    
        GL.clearColor(0.0, 0.0, 0.0, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    
        shader.setParam('uViewDirOnMap', '2fv', APP.view.viewDirOnMap);
        shader.setParam('uLowerEdgePoint', '2fv', APP.view.lowerLeftOnMap);
        shader.setParam('uFogDistance', '1f', APP.view.fogDistance);
        shader.setParam('uFogBlurDistance', '1f', APP.view.fogBlurDistance);
    
        // render all data items, but also a dummy map plane
        // Note: SSAO on the map plane has been disabled temporarily TODO: check
    
        const features = APP.features.items.concat([this.mapPlane]);
    
        features.forEach(item => {
          if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
            return;
          }
    
          const modelMatrix = item.getMatrix();
    
          if (!modelMatrix) {
            return;
          }
    
          shader.setParam('uFade', '1f', item.getFade());
    
          shader.setMatrix('uMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, viewProjMatrix));
          shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
          shader.setMatrix('uNormalMatrix', '3fv', GLX.Matrix.transpose3(GLX.Matrix.invert3(GLX.Matrix.multiply(modelMatrix, viewMatrix))));
    
          shader.setBuffer('aPosition', item.vertexBuffer);
          shader.setBuffer('aNormal', item.normalBuffer);
          shader.setBuffer('aZScale', item.zScaleBuffer);
    
          GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
        });
    
        shader.disable();
        framebuffer.disable();
    
        GL.viewport(0, 0, APP.width, APP.height);
      }
    
      destroy () {
        this.shader.destroy();
        this.framebuffer.destroy();
        this.mapPlane.destroy();
      }
    };
    
    
    View.AmbientMap = class {
    
      constructor () {
        this.shader = new GLX.Shader({
          source: shaders.ambient_from_depth,
          attributes: ['aPosition', 'aTexCoord'],
          uniforms: ['uInverseTexSize', 'uNearPlane', 'uFarPlane', 'uDepthTexIndex', 'uFogTexIndex', 'uEffectStrength']
        });
    
        this.framebuffer = new GLX.Framebuffer(128, 128); // size will be set dynamically
        
        this.vertexBuffer = new GLX.Buffer(3, new Float32Array([
          -1, -1, 1E-5,
           1, -1, 1E-5,
           1,  1, 1E-5,
          -1, -1, 1E-5,
           1,  1, 1E-5,
          -1,  1, 1E-5
        ]));
           
        this.texCoordBuffer = new GLX.Buffer(2, new Float32Array([
          0,0,
          1,0,
          1,1,
          0,0,
          1,1,
          0,1
        ]));
      }
    
      render (depthTexture, fogTexture, framebufferSize, effectStrength) {
        const
          shader = this.shader,
          framebuffer = this.framebuffer;
    
        if (effectStrength === undefined) {
          effectStrength = 1.0;
        }
    
        framebuffer.setSize(framebufferSize[0], framebufferSize[1]);
    
        GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);
    
        shader.enable();
        framebuffer.enable();
    
        GL.clearColor(1.0, 0.0, 0.0, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    
        shader.setParam('uInverseTexSize', '2fv', [1/framebufferSize[0], 1/framebufferSize[1]]);
        shader.setParam('uEffectStrength', '1f',  effectStrength);
        shader.setParam('uNearPlane',      '1f',  APP.view.nearPlane);
        shader.setParam('uFarPlane',       '1f',  APP.view.farPlane);
    
        shader.setBuffer('aPosition', this.vertexBuffer);
        shader.setBuffer('aTexCoord', this.texCoordBuffer);
    
        shader.setTexture('uDepthTexIndex', 0, depthTexture);
        shader.setTexture('uFogTexIndex',   1, fogTexture);
    
        GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);
    
        shader.disable();
        framebuffer.disable();
    
        GL.viewport(0, 0, APP.width, APP.height);
      }
    
      destroy () {
        this.shader.destroy();
        this.framebuffer.destroy();
        this.vertexBuffer.destroy();
        this.texCoordBuffer.destroy();
      }
    };
    
    /**
     * 'Overlay' renders part of a texture over the whole viewport.
     *  The intended use is for compositing of screen-space effects.
     */
    
    View.Overlay = class {
    
      constructor () {
        const geometry = this.createGeometry();
        this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(geometry.vertices));
        this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(geometry.texCoords));
    
        this.shader = new GLX.Shader({
          source: shaders.texture,
          attributes: ['aPosition', 'aTexCoord'],
          uniforms: ['uMatrix', 'uTexIndex']
        });
      }
    
      createGeometry () {
        const
          vertices = [],
          texCoords= [];
    
        vertices.push(-1,-1, 1E-5,
                       1,-1, 1E-5,
                       1, 1, 1E-5);
        
        vertices.push(-1,-1, 1E-5,
                       1, 1, 1E-5,
                      -1, 1, 1E-5);
    
        texCoords.push(0.0,0.0,
                       1.0,0.0,
                       1.0,1.0);
    
        texCoords.push(0.0,0.0,
                       1.0,1.0,
                       0.0,1.0);
    
        return { vertices: vertices , texCoords: texCoords };
      }
    
      render (texture) {
    
        const shader = this.shader;
    
        shader.enable();
    
        // we are rendering an *overlay*, which is supposed to be rendered on top of the
        // scene no matter what its actual depth is.
        GL.disable(GL.DEPTH_TEST);
        
        shader.setMatrix('uMatrix', '4fv', GLX.Matrix.identity().data);
    
        shader.setBuffer('aPosition', this.vertexBuffer);
        shader.setBuffer('aTexCoord', this.texCoordBuffer);
    
        shader.setTexture('uTexIndex', 0, texture);
    
        GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);
    
        GL.enable(GL.DEPTH_TEST);
    
        shader.disable();
      }
    
      destroy () {
        this.vertexBuffer.destroy();
        this.texCoordBuffer.destroy();
        this.shader.destroy();
      }
    };
    
    
    View.Horizon = class {
    
      constructor () {
        this.HORIZON_HEIGHT = 2000;
    
        this.skyShader = new GLX.Shader({
          source: shaders.horizon,
          attributes: ['aPosition'],
          uniforms: ['uAbsoluteHeight', 'uMatrix', 'uFogColor']
        });
    
        this.v1 = this.v2 = this.v3 = this.v4 = [false, false, false];
        this.updateGeometry([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    
        this.floorShader = new GLX.Shader({
          source: shaders.flat_color,
          attributes: ['aPosition'],
          uniforms: ['uColor', 'uMatrix']
        });
      }
    
      updateGeometry (viewTrapezoid) {
        let
          v1 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 0.0],
          v2 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 0.0],
          v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], this.HORIZON_HEIGHT],
          v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], this.HORIZON_HEIGHT];
    
        if (
          equal3(v1, this.v1) &&
          equal3(v2, this.v2) &&
          equal3(v3, this.v3) &&
          equal3(v4, this.v4)) {
          return; //still up-to-date
        }
    
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.v4 = v4;
    
        if (this.skyVertexBuffer) {
          this.skyVertexBuffer.destroy();
        }
    
        const vertices = [...v1, ...v2, ...v3, ...v1, ...v3, ...v4];
        this.skyVertexBuffer = new GLX.Buffer(3, new Float32Array(vertices));
    
        v1 = [viewTrapezoid[0][0], viewTrapezoid[0][1], 1];
        v2 = [viewTrapezoid[1][0], viewTrapezoid[1][1], 1];
        v3 = [viewTrapezoid[2][0], viewTrapezoid[2][1], 1];
        v4 = [viewTrapezoid[3][0], viewTrapezoid[3][1], 1];
    
        if (this.floorVertexBuffer) {
          this.floorVertexBuffer.destroy();
        }
    
        this.floorVertexBuffer = new GLX.Buffer(3, new Float32Array([...v1, ...v2, ...v3, ...v4]));
      }
    
      render () {
        const
          skyShader = this.skyShader,
          floorShader = this.floorShader,
          fogColor = APP.view.fogColor;
    
        skyShader.enable();
    
        skyShader.setParam('uFogColor', '3fv', fogColor);
        skyShader.setParam('uAbsoluteHeight', '1f', this.HORIZON_HEIGHT * 10.0);
        skyShader.setMatrix('uMatrix', '4fv', APP.view.viewProjMatrix.data);
        skyShader.setBuffer('aPosition', this.skyVertexBuffer);
    
        GL.drawArrays(GL.TRIANGLES, 0, this.skyVertexBuffer.numItems);
        
        skyShader.disable();
    
        
        floorShader.enable();
    
        floorShader.setParam('uColor', '4fv', [...fogColor, 1.0]);
        floorShader.setMatrix('uMatrix', '4fv', APP.view.viewProjMatrix.data);
        floorShader.setBuffer('aPosition', this.floorVertexBuffer);
    
        GL.drawArrays(GL.TRIANGLE_FAN, 0, this.floorVertexBuffer.numItems);
    
        floorShader.disable();
      }
    
      destroy () {
        this.skyVertexBuffer.destroy();
        this.skyShader.destroy();
    
        this.floorVertexBuffer.destroy();
        this.floorShader.destroy();
      }
    };
    View.Blur = class {
    
      constructor () {
        this.shader = new GLX.Shader({
          source: shaders.blur,
          attributes: ['aPosition', 'aTexCoord'],
          uniforms: ['uInverseTexSize', 'uTexIndex']
        });
    
        this.framebuffer = new GLX.Framebuffer(128, 128); // dummy value, size will be set dynamically
    
        this.vertexBuffer = new GLX.Buffer(3, new Float32Array([
          -1, -1, 1E-5,
          1, -1, 1E-5,
          1, 1, 1E-5,
          -1, -1, 1E-5,
          1, 1, 1E-5,
          -1, 1, 1E-5
        ]));
    
        this.texCoordBuffer = new GLX.Buffer(2, new Float32Array([
          0, 0,
          1, 0,
          1, 1,
          0, 0,
          1, 1,
          0, 1
        ]));
      }
    
      render (texture, size) {
        this.framebuffer.setSize(size[0], size[1]);
        GL.viewport(0, 0, size[0], size[1]);
    
        this.shader.enable();
        this.framebuffer.enable();
    
        GL.clearColor(1, 0, 0, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    
        this.shader.setParam('uInverseTexSize', '2fv', [1 / this.framebuffer.width, 1 / this.framebuffer.height]);
    
        this.shader.setBuffer('aPosition', this.vertexBuffer);
        this.shader.setBuffer('aTexCoord', this.texCoordBuffer);
    
        this.shader.setTexture('uTexIndex', 0, texture);
    
        GL.drawArrays(GL.TRIANGLES, 0, this.vertexBuffer.numItems);
    
        this.shader.disable();
        this.framebuffer.disable();
    
        GL.viewport(0, 0, APP.width, APP.height);
      }
    
      destroy () {
        console.log('destroy called')

        this.shader.destroy();
        this.framebuffer.destroy();
        this.vertexBuffer.destroy();
        this.texCoordBuffer.destroy();
      }
    };
    OSMBuildings.VERSION = '4.1.1';
    }());