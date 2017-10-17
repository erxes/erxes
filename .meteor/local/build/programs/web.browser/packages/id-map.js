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
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var IdMap;

(function(){

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// packages/id-map/id-map.js                                                  //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
                                                                              //
IdMap = function (idStringify, idParse) {                                     // 1
  var self = this;                                                            // 2
  self._map = {};                                                             // 3
  self._idStringify = idStringify || JSON.stringify;                          // 4
  self._idParse = idParse || JSON.parse;                                      // 5
};                                                                            // 6
                                                                              // 7
// Some of these methods are designed to match methods on OrderedDict, since  // 8
// (eg) ObserveMultiplex and _CachingChangeObserver use them interchangeably.
// (Conceivably, this should be replaced with "UnorderedDict" with a specific
// set of methods that overlap between the two.)                              // 11
                                                                              // 12
_.extend(IdMap.prototype, {                                                   // 13
  get: function (id) {                                                        // 14
    var self = this;                                                          // 15
    var key = self._idStringify(id);                                          // 16
    return self._map[key];                                                    // 17
  },                                                                          // 18
  set: function (id, value) {                                                 // 19
    var self = this;                                                          // 20
    var key = self._idStringify(id);                                          // 21
    self._map[key] = value;                                                   // 22
  },                                                                          // 23
  remove: function (id) {                                                     // 24
    var self = this;                                                          // 25
    var key = self._idStringify(id);                                          // 26
    delete self._map[key];                                                    // 27
  },                                                                          // 28
  has: function (id) {                                                        // 29
    var self = this;                                                          // 30
    var key = self._idStringify(id);                                          // 31
    return _.has(self._map, key);                                             // 32
  },                                                                          // 33
  empty: function () {                                                        // 34
    var self = this;                                                          // 35
    return _.isEmpty(self._map);                                              // 36
  },                                                                          // 37
  clear: function () {                                                        // 38
    var self = this;                                                          // 39
    self._map = {};                                                           // 40
  },                                                                          // 41
  // Iterates over the items in the map. Return `false` to break the loop.    // 42
  forEach: function (iterator) {                                              // 43
    var self = this;                                                          // 44
    // don't use _.each, because we can't break out of it.                    // 45
    var keys = _.keys(self._map);                                             // 46
    for (var i = 0; i < keys.length; i++) {                                   // 47
      var breakIfFalse = iterator.call(null, self._map[keys[i]],              // 48
                                       self._idParse(keys[i]));               // 49
      if (breakIfFalse === false)                                             // 50
        return;                                                               // 51
    }                                                                         // 52
  },                                                                          // 53
  size: function () {                                                         // 54
    var self = this;                                                          // 55
    return _.size(self._map);                                                 // 56
  },                                                                          // 57
  setDefault: function (id, def) {                                            // 58
    var self = this;                                                          // 59
    var key = self._idStringify(id);                                          // 60
    if (_.has(self._map, key))                                                // 61
      return self._map[key];                                                  // 62
    self._map[key] = def;                                                     // 63
    return def;                                                               // 64
  },                                                                          // 65
  // Assumes that values are EJSON-cloneable, and that we don't need to clone
  // IDs (ie, that nobody is going to mutate an ObjectId).                    // 67
  clone: function () {                                                        // 68
    var self = this;                                                          // 69
    var clone = new IdMap(self._idStringify, self._idParse);                  // 70
    self.forEach(function (value, id) {                                       // 71
      clone.set(id, EJSON.clone(value));                                      // 72
    });                                                                       // 73
    return clone;                                                             // 74
  }                                                                           // 75
});                                                                           // 76
                                                                              // 77
                                                                              // 78
////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['id-map'] = {}, {
  IdMap: IdMap
});

})();
