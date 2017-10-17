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
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;
var Random = Package.random.Random;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Factory;

var require = meteorInstall({"node_modules":{"meteor":{"dburles:factory":{"factory.js":["babel-runtime/helpers/classCallCheck",function(require){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/dburles_factory/factory.js                                                                        //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                       //
                                                                                                              //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                              //
                                                                                                              //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }             //
                                                                                                              //
/* global LocalCollection */ /* global Factory:true */var factories = {};                                     // 1
                                                                                                              //
Factory = function () {                                                                                       // 6
  function Factory(name, collection, attributes) {                                                            // 7
    (0, _classCallCheck3.default)(this, Factory);                                                             // 7
    this.name = name;                                                                                         // 8
    this.collection = collection;                                                                             // 9
    this.attributes = attributes;                                                                             // 10
    this.afterHooks = [];                                                                                     // 11
    this.sequence = 0;                                                                                        // 12
  }                                                                                                           // 13
                                                                                                              //
  Factory.prototype.after = function () {                                                                     // 6
    function after(fn) {                                                                                      // 6
      this.afterHooks.push(fn);                                                                               // 16
      return this;                                                                                            // 17
    }                                                                                                         // 18
                                                                                                              //
    return after;                                                                                             // 6
  }();                                                                                                        // 6
                                                                                                              //
  return Factory;                                                                                             // 6
}();                                                                                                          // 6
                                                                                                              //
Factory.define = function (name, collection, attributes) {                                                    // 21
  factories[name] = new Factory(name, collection, attributes);                                                // 22
  return factories[name];                                                                                     // 23
};                                                                                                            // 24
                                                                                                              //
Factory.get = function (name) {                                                                               // 26
  var factory = factories[name];                                                                              // 27
                                                                                                              //
  if (!factory) {                                                                                             // 28
    throw new Error("Factory: There is no factory named " + name);                                            // 29
  }                                                                                                           // 30
                                                                                                              //
  return factory;                                                                                             // 31
};                                                                                                            // 32
                                                                                                              //
Factory._build = function (name) {                                                                            // 34
  var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};                    // 34
  var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};                   // 34
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};                       // 34
  var factory = Factory.get(name);                                                                            // 35
  var result = {}; // "raw" attributes without functions evaluated, or dotted properties resolved             // 36
                                                                                                              //
  var extendedAttributes = _.extend({}, factory.attributes, attributes); // either create a new factory and return its _id
  // or return a 'fake' _id (since we're not inserting anything)                                              // 42
                                                                                                              //
                                                                                                              //
  var makeRelation = function (relName) {                                                                     // 43
    if (options.insert) {                                                                                     // 44
      return Factory.create(relName, {}, userOptions)._id;                                                    // 45
    }                                                                                                         // 46
                                                                                                              //
    if (options.tree) {                                                                                       // 47
      return Factory._build(relName, {}, userOptions, {                                                       // 48
        tree: true                                                                                            // 48
      });                                                                                                     // 48
    } // fake an id on build                                                                                  // 49
                                                                                                              //
                                                                                                              //
    return Random.id();                                                                                       // 51
  };                                                                                                          // 52
                                                                                                              //
  var getValue = function (value) {                                                                           // 54
    return value instanceof Factory ? makeRelation(value.name) : value;                                       // 55
  };                                                                                                          // 56
                                                                                                              //
  var getValueFromFunction = function (func) {                                                                // 58
    var api = {                                                                                               // 59
      sequence: function (fn) {                                                                               // 59
        return fn(factory.sequence);                                                                          // 59
      }                                                                                                       // 59
    };                                                                                                        // 59
    var fnRes = func.call(result, api, userOptions);                                                          // 60
    return getValue(fnRes);                                                                                   // 61
  };                                                                                                          // 62
                                                                                                              //
  factory.sequence += 1;                                                                                      // 64
                                                                                                              //
  var walk = function (record, object) {                                                                      // 66
    _.each(object, function (value, key) {                                                                    // 67
      var newValue = value; // is this a Factory instance?                                                    // 68
                                                                                                              //
      if (value instanceof Factory) {                                                                         // 70
        newValue = makeRelation(value.name);                                                                  // 71
      } else if (_.isArray(value)) {                                                                          // 72
        newValue = value.map(function (element) {                                                             // 73
          if (_.isFunction(element)) {                                                                        // 74
            return getValueFromFunction(element);                                                             // 75
          }                                                                                                   // 76
                                                                                                              //
          return getValue(element);                                                                           // 77
        });                                                                                                   // 78
      } else if (_.isFunction(value)) {                                                                       // 79
        newValue = getValueFromFunction(value); // if an object literal is passed in, traverse deeper into it
      } else if (Object.prototype.toString.call(value) === '[object Object]') {                               // 82
        record[key] = record[key] || {};                                                                      // 83
        return walk(record[key], value);                                                                      // 84
      }                                                                                                       // 85
                                                                                                              //
      var modifier = {                                                                                        // 87
        $set: {}                                                                                              // 87
      };                                                                                                      // 87
                                                                                                              //
      if (key !== '_id') {                                                                                    // 89
        modifier.$set[key] = newValue;                                                                        // 90
      }                                                                                                       // 91
                                                                                                              //
      LocalCollection._modify(record, modifier);                                                              // 93
    });                                                                                                       // 94
  };                                                                                                          // 95
                                                                                                              //
  walk(result, extendedAttributes);                                                                           // 97
                                                                                                              //
  if (!options.tree) {                                                                                        // 99
    result._id = extendedAttributes._id || Random.id();                                                       // 100
  }                                                                                                           // 101
                                                                                                              //
  return result;                                                                                              // 102
};                                                                                                            // 103
                                                                                                              //
Factory.build = function (name) {                                                                             // 105
  var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};                    // 105
  var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};                   // 105
  return Factory._build(name, attributes, userOptions);                                                       // 106
};                                                                                                            // 107
                                                                                                              //
Factory.tree = function (name, attributes) {                                                                  // 109
  var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};                   // 109
  return Factory._build(name, attributes, userOptions, {                                                      // 110
    tree: true                                                                                                // 110
  });                                                                                                         // 110
};                                                                                                            // 111
                                                                                                              //
Factory._create = function (name, doc) {                                                                      // 113
  var collection = Factory.get(name).collection;                                                              // 114
  var insertId = collection.insert(doc);                                                                      // 115
  var record = collection.findOne(insertId);                                                                  // 116
  return record;                                                                                              // 117
};                                                                                                            // 118
                                                                                                              //
Factory.create = function (name) {                                                                            // 120
  var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};                    // 120
  var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};                   // 120
                                                                                                              //
  var doc = Factory._build(name, attributes, userOptions, {                                                   // 121
    insert: true                                                                                              // 121
  });                                                                                                         // 121
                                                                                                              //
  var record = Factory._create(name, doc);                                                                    // 122
                                                                                                              //
  Factory.get(name).afterHooks.forEach(function (cb) {                                                        // 124
    return cb(record);                                                                                        // 124
  });                                                                                                         // 124
  return record;                                                                                              // 126
};                                                                                                            // 127
                                                                                                              //
Factory.extend = function (name) {                                                                            // 129
  var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};                    // 129
  return _.extend(_.clone(Factory.get(name).attributes), attributes);                                         // 130
};                                                                                                            // 131
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/dburles:factory/factory.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['dburles:factory'] = {}, {
  Factory: Factory
});

})();
