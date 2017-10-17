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
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Collection2 = Package['aldeed:collection2-core'].Collection2;
var Mongo = Package.mongo.Mongo;

var require = meteorInstall({"node_modules":{"meteor":{"erxes-notifier":{"client":{"main.js":["./collections","./schemas",function(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/erxes-notifier/client/main.js                            //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
var Collections = void 0;                                            // 1
module.importSync("./collections", {                                 // 1
  "default": function (v) {                                          // 1
    Collections = v;                                                 // 1
  }                                                                  // 1
}, 0);                                                               // 1
var Schemas = void 0;                                                // 1
module.importSync("./schemas", {                                     // 1
  "default": function (v) {                                          // 1
    Schemas = v;                                                     // 1
  }                                                                  // 1
}, 1);                                                               // 1
var Alert = {                                                        // 5
  Collections: Collections,                                          // 6
  Schemas: Schemas,                                                  // 7
  success: function (message) {                                      // 9
    this.alert(this.types.success, message);                         // 10
  },                                                                 // 11
  info: function (message) {                                         // 12
    this.alert(this.types.info, message);                            // 13
  },                                                                 // 14
  warning: function (message) {                                      // 15
    this.alert(this.types.warning, message);                         // 16
  },                                                                 // 17
  error: function (message) {                                        // 18
    this.alert(this.types.error, message);                           // 19
  },                                                                 // 20
  alert: function (type, message) {                                  // 22
    var typeString = this.types[type] || this.types.info;            // 23
    this.Collections.Alerts.insert({                                 // 25
      type: typeString,                                              // 25
      message: message                                               // 25
    });                                                              // 25
  },                                                                 // 26
  types: {                                                           // 28
    success: 'success',                                              // 29
    info: 'info',                                                    // 30
    warning: 'warning',                                              // 31
    error: 'error'                                                   // 32
  }                                                                  // 28
};                                                                   // 5
module.export("default", exports.default = Alert);                   // 1
///////////////////////////////////////////////////////////////////////

}],"collections.js":["meteor/mongo","./schemas",function(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/erxes-notifier/client/collections.js                     //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
var Mongo = void 0;                                                  // 1
module.importSync("meteor/mongo", {                                  // 1
  Mongo: function (v) {                                              // 1
    Mongo = v;                                                       // 1
  }                                                                  // 1
}, 0);                                                               // 1
var Schemas = void 0;                                                // 1
module.importSync("./schemas", {                                     // 1
  "default": function (v) {                                          // 1
    Schemas = v;                                                     // 1
  }                                                                  // 1
}, 1);                                                               // 1
var Alerts = new Mongo.Collection(null);                             // 5
Alerts.attachSchema(Schemas.Alerts);                                 // 6
var Collections = {                                                  // 8
  Alerts: Alerts                                                     // 8
};                                                                   // 8
module.export("default", exports.default = Collections);             // 1
///////////////////////////////////////////////////////////////////////

}],"schemas.js":["meteor/aldeed:simple-schema",function(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/erxes-notifier/client/schemas.js                         //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
var SimpleSchema = void 0;                                           // 1
module.importSync("meteor/aldeed:simple-schema", {                   // 1
  SimpleSchema: function (v) {                                       // 1
    SimpleSchema = v;                                                // 1
  }                                                                  // 1
}, 0);                                                               // 1
var Schemas = {                                                      // 4
  Alerts: new SimpleSchema({                                         // 5
    type: {                                                          // 6
      type: String                                                   // 7
    },                                                               // 6
    title: {                                                         // 9
      type: String,                                                  // 10
      optional: true                                                 // 11
    },                                                               // 9
    message: {                                                       // 13
      type: String,                                                  // 14
      optional: true                                                 // 15
    },                                                               // 13
    createdDate: {                                                   // 17
      type: Date,                                                    // 18
      autoValue: function () {                                       // 19
        return new Date();                                           // 20
      }                                                              // 21
    }                                                                // 17
  })                                                                 // 5
};                                                                   // 4
module.export("default", exports.default = Schemas);                 // 1
///////////////////////////////////////////////////////////////////////

}]}}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/erxes-notifier/client/main.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['erxes-notifier'] = exports;

})();
