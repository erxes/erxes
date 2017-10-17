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

/* Package-scope variables */
var Base64;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/base64/base64.js                                                            //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
// Base 64 encoding                                                                     // 1
                                                                                        // 2
var BASE_64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                                                                                        // 4
var BASE_64_VALS = {};                                                                  // 5
                                                                                        // 6
for (var i = 0; i < BASE_64_CHARS.length; i++) {                                        // 7
  BASE_64_VALS[BASE_64_CHARS.charAt(i)] = i;                                            // 8
};                                                                                      // 9
                                                                                        // 10
Base64 = {};                                                                            // 11
                                                                                        // 12
Base64.encode = function (array) {                                                      // 13
                                                                                        // 14
  if (typeof array === "string") {                                                      // 15
    var str = array;                                                                    // 16
    array = Base64.newBinary(str.length);                                               // 17
    for (var i = 0; i < str.length; i++) {                                              // 18
      var ch = str.charCodeAt(i);                                                       // 19
      if (ch > 0xFF) {                                                                  // 20
        throw new Error(                                                                // 21
          "Not ascii. Base64.encode can only take ascii strings.");                     // 22
      }                                                                                 // 23
      array[i] = ch;                                                                    // 24
    }                                                                                   // 25
  }                                                                                     // 26
                                                                                        // 27
  var answer = [];                                                                      // 28
  var a = null;                                                                         // 29
  var b = null;                                                                         // 30
  var c = null;                                                                         // 31
  var d = null;                                                                         // 32
  for (var i = 0; i < array.length; i++) {                                              // 33
    switch (i % 3) {                                                                    // 34
    case 0:                                                                             // 35
      a = (array[i] >> 2) & 0x3F;                                                       // 36
      b = (array[i] & 0x03) << 4;                                                       // 37
      break;                                                                            // 38
    case 1:                                                                             // 39
      b = b | (array[i] >> 4) & 0xF;                                                    // 40
      c = (array[i] & 0xF) << 2;                                                        // 41
      break;                                                                            // 42
    case 2:                                                                             // 43
      c = c | (array[i] >> 6) & 0x03;                                                   // 44
      d = array[i] & 0x3F;                                                              // 45
      answer.push(getChar(a));                                                          // 46
      answer.push(getChar(b));                                                          // 47
      answer.push(getChar(c));                                                          // 48
      answer.push(getChar(d));                                                          // 49
      a = null;                                                                         // 50
      b = null;                                                                         // 51
      c = null;                                                                         // 52
      d = null;                                                                         // 53
      break;                                                                            // 54
    }                                                                                   // 55
  }                                                                                     // 56
  if (a != null) {                                                                      // 57
    answer.push(getChar(a));                                                            // 58
    answer.push(getChar(b));                                                            // 59
    if (c == null)                                                                      // 60
      answer.push('=');                                                                 // 61
    else                                                                                // 62
      answer.push(getChar(c));                                                          // 63
    if (d == null)                                                                      // 64
      answer.push('=');                                                                 // 65
  }                                                                                     // 66
  return answer.join("");                                                               // 67
};                                                                                      // 68
                                                                                        // 69
var getChar = function (val) {                                                          // 70
  return BASE_64_CHARS.charAt(val);                                                     // 71
};                                                                                      // 72
                                                                                        // 73
var getVal = function (ch) {                                                            // 74
  if (ch === '=') {                                                                     // 75
    return -1;                                                                          // 76
  }                                                                                     // 77
  return BASE_64_VALS[ch];                                                              // 78
};                                                                                      // 79
                                                                                        // 80
// XXX This is a weird place for this to live, but it's used both by                    // 81
// this package and 'ejson', and we can't put it in 'ejson' without                     // 82
// introducing a circular dependency. It should probably be in its own                  // 83
// package or as a helper in a package that both 'base64' and 'ejson'                   // 84
// use.                                                                                 // 85
Base64.newBinary = function (len) {                                                     // 86
  if (typeof Uint8Array === 'undefined' || typeof ArrayBuffer === 'undefined') {        // 87
    var ret = [];                                                                       // 88
    for (var i = 0; i < len; i++) {                                                     // 89
      ret.push(0);                                                                      // 90
    }                                                                                   // 91
    ret.$Uint8ArrayPolyfill = true;                                                     // 92
    return ret;                                                                         // 93
  }                                                                                     // 94
  return new Uint8Array(new ArrayBuffer(len));                                          // 95
};                                                                                      // 96
                                                                                        // 97
Base64.decode = function (str) {                                                        // 98
  var len = Math.floor((str.length*3)/4);                                               // 99
  if (str.charAt(str.length - 1) == '=') {                                              // 100
    len--;                                                                              // 101
    if (str.charAt(str.length - 2) == '=')                                              // 102
      len--;                                                                            // 103
  }                                                                                     // 104
  var arr = Base64.newBinary(len);                                                      // 105
                                                                                        // 106
  var one = null;                                                                       // 107
  var two = null;                                                                       // 108
  var three = null;                                                                     // 109
                                                                                        // 110
  var j = 0;                                                                            // 111
                                                                                        // 112
  for (var i = 0; i < str.length; i++) {                                                // 113
    var c = str.charAt(i);                                                              // 114
    var v = getVal(c);                                                                  // 115
    switch (i % 4) {                                                                    // 116
    case 0:                                                                             // 117
      if (v < 0)                                                                        // 118
        throw new Error('invalid base64 string');                                       // 119
      one = v << 2;                                                                     // 120
      break;                                                                            // 121
    case 1:                                                                             // 122
      if (v < 0)                                                                        // 123
        throw new Error('invalid base64 string');                                       // 124
      one = one | (v >> 4);                                                             // 125
      arr[j++] = one;                                                                   // 126
      two = (v & 0x0F) << 4;                                                            // 127
      break;                                                                            // 128
    case 2:                                                                             // 129
      if (v >= 0) {                                                                     // 130
        two = two | (v >> 2);                                                           // 131
        arr[j++] = two;                                                                 // 132
        three = (v & 0x03) << 6;                                                        // 133
      }                                                                                 // 134
      break;                                                                            // 135
    case 3:                                                                             // 136
      if (v >= 0) {                                                                     // 137
        arr[j++] = three | v;                                                           // 138
      }                                                                                 // 139
      break;                                                                            // 140
    }                                                                                   // 141
  }                                                                                     // 142
  return arr;                                                                           // 143
};                                                                                      // 144
                                                                                        // 145
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.base64 = {}, {
  Base64: Base64
});

})();
