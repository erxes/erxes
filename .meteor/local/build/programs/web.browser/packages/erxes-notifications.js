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
var Counts = Package['tmeasday:publish-counts'].Counts;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Collection2 = Package['aldeed:collection2-core'].Collection2;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var Mongo = Package.mongo.Mongo;

var require = meteorInstall({"node_modules":{"meteor":{"erxes-notifications":{"client":{"main.js":["../notifications",function(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/erxes-notifications/client/main.js                       //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
module.export({                                                      // 1
  Notifications: function () {                                       // 1
    return Notifications;                                            // 1
  },                                                                 // 1
  Configs: function () {                                             // 1
    return Configs;                                                  // 1
  }                                                                  // 1
});                                                                  // 1
var Notifications = void 0,                                          // 1
    Configs = void 0;                                                // 1
module.importSync("../notifications", {                              // 1
  Notifications: function (v) {                                      // 1
    Notifications = v;                                               // 1
  },                                                                 // 1
  Configs: function (v) {                                            // 1
    Configs = v;                                                     // 1
  }                                                                  // 1
}, 0);                                                               // 1
///////////////////////////////////////////////////////////////////////

}]},"notifications.js":["meteor/mongo","meteor/aldeed:simple-schema",function(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/erxes-notifications/notifications.js                     //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
module.export({                                                      // 1
  Notifications: function () {                                       // 1
    return Notifications;                                            // 1
  },                                                                 // 1
  Configs: function () {                                             // 1
    return Configs;                                                  // 1
  }                                                                  // 1
});                                                                  // 1
var Mongo = void 0;                                                  // 1
module.importSync("meteor/mongo", {                                  // 1
  Mongo: function (v) {                                              // 1
    Mongo = v;                                                       // 1
  }                                                                  // 1
}, 0);                                                               // 1
var SimpleSchema = void 0;                                           // 1
module.importSync("meteor/aldeed:simple-schema", {                   // 1
  SimpleSchema: function (v) {                                       // 1
    SimpleSchema = v;                                                // 1
  }                                                                  // 1
}, 1);                                                               // 1
var Notifications = new Mongo.Collection('notifications');           // 6
var Configs = new Mongo.Collection('notifications_configs');         // 7
// schemas                                                           // 9
Notifications.Schema = new SimpleSchema({                            // 10
  notifType: {                                                       // 11
    type: String,                                                    // 12
    optional: true                                                   // 13
  },                                                                 // 11
  title: {                                                           // 16
    type: String                                                     // 17
  },                                                                 // 16
  link: {                                                            // 20
    type: String,                                                    // 21
    optional: true                                                   // 22
  },                                                                 // 20
  content: {                                                         // 25
    type: String                                                     // 26
  },                                                                 // 25
  createdUser: {                                                     // 29
    type: String,                                                    // 30
    optional: true                                                   // 31
  },                                                                 // 29
  receiver: {                                                        // 34
    type: String                                                     // 35
  }                                                                  // 34
});                                                                  // 10
var BaseExtra = new SimpleSchema({                                   // 40
  date: {                                                            // 41
    type: 'date'                                                     // 42
  },                                                                 // 41
  isRead: {                                                          // 45
    type: Boolean                                                    // 46
  }                                                                  // 45
});                                                                  // 40
Configs.Schema = new SimpleSchema({                                  // 51
  // to whom this config is related                                  // 52
  user: {                                                            // 53
    type: String                                                     // 54
  },                                                                 // 53
  // which module's type it is. For example: indocuments             // 57
  notifType: {                                                       // 58
    type: String                                                     // 59
  },                                                                 // 58
  isAllowed: {                                                       // 62
    type: Boolean                                                    // 63
  }                                                                  // 62
}); // attach schemas                                                // 51
                                                                     //
Notifications.attachSchema(Notifications.Schema);                    // 69
Notifications.attachSchema(BaseExtra);                               // 70
Configs.attachSchema(Configs.Schema);                                // 71
///////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/erxes-notifications/client/main.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['erxes-notifications'] = exports;

})();
