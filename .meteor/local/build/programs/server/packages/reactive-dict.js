(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var EJSON = Package.ejson.EJSON;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var ReactiveDict;

var require = meteorInstall({"node_modules":{"meteor":{"reactive-dict":{"reactive-dict.js":["babel-runtime/helpers/typeof",function(require){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/reactive-dict/reactive-dict.js                                                                        //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                           //
                                                                                                                  //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                  //
                                                                                                                  //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                 //
                                                                                                                  //
// XXX come up with a serialization method which canonicalizes object key                                         // 1
// order, which would allow us to use objects as values for equals.                                               // 2
var stringify = function (value) {                                                                                // 3
  if (value === undefined) return 'undefined';                                                                    // 4
  return EJSON.stringify(value);                                                                                  // 6
};                                                                                                                // 7
                                                                                                                  //
var parse = function (serialized) {                                                                               // 8
  if (serialized === undefined || serialized === 'undefined') return undefined;                                   // 9
  return EJSON.parse(serialized);                                                                                 // 11
};                                                                                                                // 12
                                                                                                                  //
var changed = function (v) {                                                                                      // 14
  v && v.changed();                                                                                               // 15
}; // XXX COMPAT WITH 0.9.1 : accept migrationData instead of dictName                                            // 16
                                                                                                                  //
                                                                                                                  //
ReactiveDict = function (dictName) {                                                                              // 19
  // this.keys: key -> value                                                                                      // 20
  if (dictName) {                                                                                                 // 21
    if (typeof dictName === 'string') {                                                                           // 22
      // the normal case, argument is a string name.                                                              // 23
      // _registerDictForMigrate will throw an error on duplicate name.                                           // 24
      ReactiveDict._registerDictForMigrate(dictName, this);                                                       // 25
                                                                                                                  //
      this.keys = ReactiveDict._loadMigratedDict(dictName) || {};                                                 // 26
      this.name = dictName;                                                                                       // 27
    } else if ((typeof dictName === "undefined" ? "undefined" : (0, _typeof3.default)(dictName)) === 'object') {  // 28
      // back-compat case: dictName is actually migrationData                                                     // 29
      this.keys = dictName;                                                                                       // 30
    } else {                                                                                                      // 31
      throw new Error("Invalid ReactiveDict argument: " + dictName);                                              // 32
    }                                                                                                             // 33
  } else {                                                                                                        // 34
    // no name given; no migration will be performed                                                              // 35
    this.keys = {};                                                                                               // 36
  }                                                                                                               // 37
                                                                                                                  //
  this.allDeps = new Tracker.Dependency();                                                                        // 39
  this.keyDeps = {}; // key -> Dependency                                                                         // 40
                                                                                                                  //
  this.keyValueDeps = {}; // key -> Dependency                                                                    // 41
};                                                                                                                // 42
                                                                                                                  //
_.extend(ReactiveDict.prototype, {                                                                                // 44
  // set() began as a key/value method, but we are now overloading it                                             // 45
  // to take an object of key/value pairs, similar to backbone                                                    // 46
  // http://backbonejs.org/#Model-set                                                                             // 47
  set: function (keyOrObject, value) {                                                                            // 49
    var self = this;                                                                                              // 50
                                                                                                                  //
    if ((typeof keyOrObject === "undefined" ? "undefined" : (0, _typeof3.default)(keyOrObject)) === 'object' && value === undefined) {
      // Called as `dict.set({...})`                                                                              // 53
      self._setObject(keyOrObject);                                                                               // 54
                                                                                                                  //
      return;                                                                                                     // 55
    } // the input isn't an object, so it must be a key                                                           // 56
    // and we resume with the rest of the function                                                                // 58
                                                                                                                  //
                                                                                                                  //
    var key = keyOrObject;                                                                                        // 59
    value = stringify(value);                                                                                     // 61
                                                                                                                  //
    var keyExisted = _.has(self.keys, key);                                                                       // 63
                                                                                                                  //
    var oldSerializedValue = keyExisted ? self.keys[key] : 'undefined';                                           // 64
    var isNewValue = value !== oldSerializedValue;                                                                // 65
    self.keys[key] = value;                                                                                       // 67
                                                                                                                  //
    if (isNewValue || !keyExisted) {                                                                              // 69
      self.allDeps.changed();                                                                                     // 70
    }                                                                                                             // 71
                                                                                                                  //
    if (isNewValue) {                                                                                             // 73
      changed(self.keyDeps[key]);                                                                                 // 74
                                                                                                                  //
      if (self.keyValueDeps[key]) {                                                                               // 75
        changed(self.keyValueDeps[key][oldSerializedValue]);                                                      // 76
        changed(self.keyValueDeps[key][value]);                                                                   // 77
      }                                                                                                           // 78
    }                                                                                                             // 79
  },                                                                                                              // 80
  setDefault: function (keyOrObject, value) {                                                                     // 82
    var self = this;                                                                                              // 83
                                                                                                                  //
    if ((typeof keyOrObject === "undefined" ? "undefined" : (0, _typeof3.default)(keyOrObject)) === 'object' && value === undefined) {
      // Called as `dict.setDefault({...})`                                                                       // 86
      self._setDefaultObject(keyOrObject);                                                                        // 87
                                                                                                                  //
      return;                                                                                                     // 88
    } // the input isn't an object, so it must be a key                                                           // 89
    // and we resume with the rest of the function                                                                // 91
                                                                                                                  //
                                                                                                                  //
    var key = keyOrObject;                                                                                        // 92
                                                                                                                  //
    if (!_.has(self.keys, key)) {                                                                                 // 94
      self.set(key, value);                                                                                       // 95
    }                                                                                                             // 96
  },                                                                                                              // 97
  get: function (key) {                                                                                           // 99
    var self = this;                                                                                              // 100
                                                                                                                  //
    self._ensureKey(key);                                                                                         // 101
                                                                                                                  //
    self.keyDeps[key].depend();                                                                                   // 102
    return parse(self.keys[key]);                                                                                 // 103
  },                                                                                                              // 104
  equals: function (key, value) {                                                                                 // 106
    var self = this; // Mongo.ObjectID is in the 'mongo' package                                                  // 107
                                                                                                                  //
    var ObjectID = null;                                                                                          // 110
                                                                                                                  //
    if (Package.mongo) {                                                                                          // 111
      ObjectID = Package.mongo.Mongo.ObjectID;                                                                    // 112
    } // We don't allow objects (or arrays that might include objects) for                                        // 113
    // .equals, because JSON.stringify doesn't canonicalize object key                                            // 116
    // order. (We can make equals have the right return value by parsing the                                      // 117
    // current value and using EJSON.equals, but we won't have a canonical                                        // 118
    // element of keyValueDeps[key] to store the dependency.) You can still use                                   // 119
    // "EJSON.equals(reactiveDict.get(key), value)".                                                              // 120
    //                                                                                                            // 121
    // XXX we could allow arrays as long as we recursively check that there                                       // 122
    // are no objects                                                                                             // 123
                                                                                                                  //
                                                                                                                  //
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean' && typeof value !== 'undefined' && !(value instanceof Date) && !(ObjectID && value instanceof ObjectID) && value !== null) {
      throw new Error("ReactiveDict.equals: value must be scalar");                                               // 131
    }                                                                                                             // 132
                                                                                                                  //
    var serializedValue = stringify(value);                                                                       // 133
                                                                                                                  //
    if (Tracker.active) {                                                                                         // 135
      self._ensureKey(key);                                                                                       // 136
                                                                                                                  //
      if (!_.has(self.keyValueDeps[key], serializedValue)) self.keyValueDeps[key][serializedValue] = new Tracker.Dependency();
      var isNew = self.keyValueDeps[key][serializedValue].depend();                                               // 141
                                                                                                                  //
      if (isNew) {                                                                                                // 142
        Tracker.onInvalidate(function () {                                                                        // 143
          // clean up [key][serializedValue] if it's now empty, so we don't                                       // 144
          // use O(n) memory for n = values seen ever                                                             // 145
          if (!self.keyValueDeps[key][serializedValue].hasDependents()) delete self.keyValueDeps[key][serializedValue];
        });                                                                                                       // 148
      }                                                                                                           // 149
    }                                                                                                             // 150
                                                                                                                  //
    var oldValue = undefined;                                                                                     // 152
    if (_.has(self.keys, key)) oldValue = parse(self.keys[key]);                                                  // 153
    return EJSON.equals(oldValue, value);                                                                         // 154
  },                                                                                                              // 155
  all: function () {                                                                                              // 157
    this.allDeps.depend();                                                                                        // 158
    var ret = {};                                                                                                 // 159
                                                                                                                  //
    _.each(this.keys, function (value, key) {                                                                     // 160
      ret[key] = parse(value);                                                                                    // 161
    });                                                                                                           // 162
                                                                                                                  //
    return ret;                                                                                                   // 163
  },                                                                                                              // 164
  clear: function () {                                                                                            // 166
    var self = this;                                                                                              // 167
    var oldKeys = self.keys;                                                                                      // 169
    self.keys = {};                                                                                               // 170
    self.allDeps.changed();                                                                                       // 172
                                                                                                                  //
    _.each(oldKeys, function (value, key) {                                                                       // 174
      changed(self.keyDeps[key]);                                                                                 // 175
                                                                                                                  //
      if (self.keyValueDeps[key]) {                                                                               // 176
        changed(self.keyValueDeps[key][value]);                                                                   // 177
        changed(self.keyValueDeps[key]['undefined']);                                                             // 178
      }                                                                                                           // 179
    });                                                                                                           // 180
  },                                                                                                              // 182
  "delete": function (key) {                                                                                      // 184
    var self = this;                                                                                              // 185
    var didRemove = false;                                                                                        // 186
                                                                                                                  //
    if (_.has(self.keys, key)) {                                                                                  // 188
      var oldValue = self.keys[key];                                                                              // 189
      delete self.keys[key];                                                                                      // 190
      changed(self.keyDeps[key]);                                                                                 // 191
                                                                                                                  //
      if (self.keyValueDeps[key]) {                                                                               // 192
        changed(self.keyValueDeps[key][oldValue]);                                                                // 193
        changed(self.keyValueDeps[key]['undefined']);                                                             // 194
      }                                                                                                           // 195
                                                                                                                  //
      self.allDeps.changed();                                                                                     // 196
      didRemove = true;                                                                                           // 197
    }                                                                                                             // 198
                                                                                                                  //
    return didRemove;                                                                                             // 200
  },                                                                                                              // 201
  _setObject: function (object) {                                                                                 // 203
    var self = this;                                                                                              // 204
                                                                                                                  //
    _.each(object, function (value, key) {                                                                        // 206
      self.set(key, value);                                                                                       // 207
    });                                                                                                           // 208
  },                                                                                                              // 209
  _setDefaultObject: function (object) {                                                                          // 211
    var self = this;                                                                                              // 212
                                                                                                                  //
    _.each(object, function (value, key) {                                                                        // 214
      self.setDefault(key, value);                                                                                // 215
    });                                                                                                           // 216
  },                                                                                                              // 217
  _ensureKey: function (key) {                                                                                    // 219
    var self = this;                                                                                              // 220
                                                                                                                  //
    if (!(key in self.keyDeps)) {                                                                                 // 221
      self.keyDeps[key] = new Tracker.Dependency();                                                               // 222
      self.keyValueDeps[key] = {};                                                                                // 223
    }                                                                                                             // 224
  },                                                                                                              // 225
  // Get a JSON value that can be passed to the constructor to                                                    // 227
  // create a new ReactiveDict with the same contents as this one                                                 // 228
  _getMigrationData: function () {                                                                                // 229
    // XXX sanitize and make sure it's JSONible?                                                                  // 230
    return this.keys;                                                                                             // 231
  }                                                                                                               // 232
});                                                                                                               // 44
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"migration.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/reactive-dict/migration.js                                                                            //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
ReactiveDict._migratedDictData = {}; // name -> data                                                              // 1
                                                                                                                  //
ReactiveDict._dictsToMigrate = {}; // name -> ReactiveDict                                                        // 2
                                                                                                                  //
ReactiveDict._loadMigratedDict = function (dictName) {                                                            // 4
  if (_.has(ReactiveDict._migratedDictData, dictName)) return ReactiveDict._migratedDictData[dictName];           // 5
  return null;                                                                                                    // 8
};                                                                                                                // 9
                                                                                                                  //
ReactiveDict._registerDictForMigrate = function (dictName, dict) {                                                // 11
  if (_.has(ReactiveDict._dictsToMigrate, dictName)) throw new Error("Duplicate ReactiveDict name: " + dictName);
  ReactiveDict._dictsToMigrate[dictName] = dict;                                                                  // 15
};                                                                                                                // 16
                                                                                                                  //
if (Meteor.isClient && Package.reload) {                                                                          // 18
  // Put old migrated data into ReactiveDict._migratedDictData,                                                   // 19
  // where it can be accessed by ReactiveDict._loadMigratedDict.                                                  // 20
  var migrationData = Package.reload.Reload._migrationData('reactive-dict');                                      // 21
                                                                                                                  //
  if (migrationData && migrationData.dicts) ReactiveDict._migratedDictData = migrationData.dicts; // On migration, assemble the data from all the dicts that have been
  // registered.                                                                                                  // 26
                                                                                                                  //
  Package.reload.Reload._onMigrate('reactive-dict', function () {                                                 // 27
    var dictsToMigrate = ReactiveDict._dictsToMigrate;                                                            // 28
    var dataToMigrate = {};                                                                                       // 29
                                                                                                                  //
    for (var dictName in meteorBabelHelpers.sanitizeForInObject(dictsToMigrate)) {                                // 31
      dataToMigrate[dictName] = dictsToMigrate[dictName]._getMigrationData();                                     // 32
    }                                                                                                             // 31
                                                                                                                  //
    return [true, {                                                                                               // 34
      dicts: dataToMigrate                                                                                        // 34
    }];                                                                                                           // 34
  });                                                                                                             // 35
}                                                                                                                 // 36
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/reactive-dict/reactive-dict.js");
require("./node_modules/meteor/reactive-dict/migration.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['reactive-dict'] = {}, {
  ReactiveDict: ReactiveDict
});

})();

//# sourceMappingURL=reactive-dict.js.map
