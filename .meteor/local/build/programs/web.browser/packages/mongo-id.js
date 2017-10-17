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
var EJSON = Package.ejson.EJSON;
var IdMap = Package['id-map'].IdMap;
var Random = Package.random.Random;

/* Package-scope variables */
var MongoID;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                    //
// packages/mongo-id/id.js                                                                            //
//                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                      //
MongoID = {};                                                                                         // 1
                                                                                                      // 2
MongoID._looksLikeObjectID = function (str) {                                                         // 3
  return str.length === 24 && str.match(/^[0-9a-f]*$/);                                               // 4
};                                                                                                    // 5
                                                                                                      // 6
MongoID.ObjectID = function (hexString) {                                                             // 7
  //random-based impl of Mongo ObjectID                                                               // 8
  var self = this;                                                                                    // 9
  if (hexString) {                                                                                    // 10
    hexString = hexString.toLowerCase();                                                              // 11
    if (!MongoID._looksLikeObjectID(hexString)) {                                                     // 12
      throw new Error("Invalid hexadecimal string for creating an ObjectID");                         // 13
    }                                                                                                 // 14
    // meant to work with _.isEqual(), which relies on structural equality                            // 15
    self._str = hexString;                                                                            // 16
  } else {                                                                                            // 17
    self._str = Random.hexString(24);                                                                 // 18
  }                                                                                                   // 19
};                                                                                                    // 20
                                                                                                      // 21
MongoID.ObjectID.prototype.toString = function () {                                                   // 22
  var self = this;                                                                                    // 23
  return "ObjectID(\"" + self._str + "\")";                                                           // 24
};                                                                                                    // 25
                                                                                                      // 26
MongoID.ObjectID.prototype.equals = function (other) {                                                // 27
  var self = this;                                                                                    // 28
  return other instanceof MongoID.ObjectID &&                                                         // 29
    self.valueOf() === other.valueOf();                                                               // 30
};                                                                                                    // 31
                                                                                                      // 32
MongoID.ObjectID.prototype.clone = function () {                                                      // 33
  var self = this;                                                                                    // 34
  return new MongoID.ObjectID(self._str);                                                             // 35
};                                                                                                    // 36
                                                                                                      // 37
MongoID.ObjectID.prototype.typeName = function() {                                                    // 38
  return "oid";                                                                                       // 39
};                                                                                                    // 40
                                                                                                      // 41
MongoID.ObjectID.prototype.getTimestamp = function() {                                                // 42
  var self = this;                                                                                    // 43
  return parseInt(self._str.substr(0, 8), 16);                                                        // 44
};                                                                                                    // 45
                                                                                                      // 46
MongoID.ObjectID.prototype.valueOf =                                                                  // 47
    MongoID.ObjectID.prototype.toJSONValue =                                                          // 48
    MongoID.ObjectID.prototype.toHexString =                                                          // 49
    function () { return this._str; };                                                                // 50
                                                                                                      // 51
EJSON.addType("oid",  function (str) {                                                                // 52
  return new MongoID.ObjectID(str);                                                                   // 53
});                                                                                                   // 54
                                                                                                      // 55
MongoID.idStringify = function (id) {                                                                 // 56
  if (id instanceof MongoID.ObjectID) {                                                               // 57
    return id.valueOf();                                                                              // 58
  } else if (typeof id === 'string') {                                                                // 59
    if (id === "") {                                                                                  // 60
      return id;                                                                                      // 61
    } else if (id.substr(0, 1) === "-" || // escape previously dashed strings                         // 62
               id.substr(0, 1) === "~" || // escape escaped numbers, true, false                      // 63
               MongoID._looksLikeObjectID(id) || // escape object-id-form strings                     // 64
               id.substr(0, 1) === '{') { // escape object-form strings, for maybe implementing later
      return "-" + id;                                                                                // 66
    } else {                                                                                          // 67
      return id; // other strings go through unchanged.                                               // 68
    }                                                                                                 // 69
  } else if (id === undefined) {                                                                      // 70
    return '-';                                                                                       // 71
  } else if (typeof id === 'object' && id !== null) {                                                 // 72
    throw new Error("Meteor does not currently support objects other than ObjectID as ids");          // 73
  } else { // Numbers, true, false, null                                                              // 74
    return "~" + JSON.stringify(id);                                                                  // 75
  }                                                                                                   // 76
};                                                                                                    // 77
                                                                                                      // 78
                                                                                                      // 79
MongoID.idParse = function (id) {                                                                     // 80
  if (id === "") {                                                                                    // 81
    return id;                                                                                        // 82
  } else if (id === '-') {                                                                            // 83
    return undefined;                                                                                 // 84
  } else if (id.substr(0, 1) === '-') {                                                               // 85
    return id.substr(1);                                                                              // 86
  } else if (id.substr(0, 1) === '~') {                                                               // 87
    return JSON.parse(id.substr(1));                                                                  // 88
  } else if (MongoID._looksLikeObjectID(id)) {                                                        // 89
    return new MongoID.ObjectID(id);                                                                  // 90
  } else {                                                                                            // 91
    return id;                                                                                        // 92
  }                                                                                                   // 93
};                                                                                                    // 94
                                                                                                      // 95
                                                                                                      // 96
////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['mongo-id'] = {}, {
  MongoID: MongoID
});

})();
