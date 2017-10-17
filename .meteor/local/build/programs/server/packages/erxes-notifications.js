(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var Counts = Package['tmeasday:publish-counts'].Counts;
var publishCount = Package['tmeasday:publish-counts'].publishCount;
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
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

var require = meteorInstall({"node_modules":{"meteor":{"erxes-notifications":{"server":{"main.js":["../notifications","./api","./methods","./publications",function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/erxes-notifications/server/main.js                                                               //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
module.export({                                                                                              // 1
  Notifications: function () {                                                                               // 1
    return Notifications;                                                                                    // 1
  },                                                                                                         // 1
  Configs: function () {                                                                                     // 1
    return Configs;                                                                                          // 1
  }                                                                                                          // 1
});                                                                                                          // 1
var Notifications = void 0,                                                                                  // 1
    Configs = void 0;                                                                                        // 1
module.importSync("../notifications", {                                                                      // 1
  Notifications: function (v) {                                                                              // 1
    Notifications = v;                                                                                       // 1
  },                                                                                                         // 1
  Configs: function (v) {                                                                                    // 1
    Configs = v;                                                                                             // 1
  }                                                                                                          // 1
}, 0);                                                                                                       // 1
module.importSync("./api");                                                                                  // 1
module.importSync("./methods");                                                                              // 1
module.importSync("./publications");                                                                         // 1
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"api.js":["meteor/meteor","meteor/check","meteor/underscore","../notifications",function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/erxes-notifications/server/api.js                                                                //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
var _this = this;                                                                                            //
                                                                                                             //
var Meteor = void 0;                                                                                         // 1
module.importSync("meteor/meteor", {                                                                         // 1
  Meteor: function (v) {                                                                                     // 1
    Meteor = v;                                                                                              // 1
  }                                                                                                          // 1
}, 0);                                                                                                       // 1
var check = void 0;                                                                                          // 1
module.importSync("meteor/check", {                                                                          // 1
  check: function (v) {                                                                                      // 1
    check = v;                                                                                               // 1
  }                                                                                                          // 1
}, 1);                                                                                                       // 1
                                                                                                             //
var _ = void 0;                                                                                              // 1
                                                                                                             //
module.importSync("meteor/underscore", {                                                                     // 1
  _: function (v) {                                                                                          // 1
    _ = v;                                                                                                   // 1
  }                                                                                                          // 1
}, 2);                                                                                                       // 1
var Notifications = void 0,                                                                                  // 1
    Configs = void 0;                                                                                        // 1
module.importSync("../notifications", {                                                                      // 1
  Notifications: function (v) {                                                                              // 1
    Notifications = v;                                                                                       // 1
  },                                                                                                         // 1
  Configs: function (v) {                                                                                    // 1
    Configs = v;                                                                                             // 1
  }                                                                                                          // 1
}, 3);                                                                                                       // 1
// will contain all type of notifications information then it will be filled dynamically                     // 7
Notifications.Modules = [];                                                                                  // 8
                                                                                                             //
Notifications.registerModule = function (module) {                                                           // 10
  var schema = {                                                                                             // 11
    name: String,                                                                                            // 12
    description: String,                                                                                     // 13
    types: [{                                                                                                // 15
      name: String,                                                                                          // 16
      text: String                                                                                           // 16
    }]                                                                                                       // 16
  };                                                                                                         // 11
  check(module, schema);                                                                                     // 20
                                                                                                             //
  var prevModule = _.find(Notifications.Modules, function (moduleInList) {                                   // 22
    return moduleInList.name === module.name;                                                                // 24
  }); // module name is already exists                                                                       // 24
                                                                                                             //
                                                                                                             //
  if (prevModule) {                                                                                          // 28
    throw new Meteor.Error(module.name + " notification module already exists");                             // 29
  } // notif type name is already exists                                                                     // 30
                                                                                                             //
                                                                                                             //
  var allNotifTypes = [];                                                                                    // 34
                                                                                                             //
  _.each(Notifications.Modules, function (moduleInList) {                                                    // 36
    allNotifTypes = _.union(allNotifTypes, moduleInList.types);                                              // 37
  });                                                                                                        // 38
                                                                                                             //
  var allNotifTypeNames = _.pluck(allNotifTypes, 'name');                                                    // 40
                                                                                                             //
  var typeNames = _.pluck(module.types, 'name'); // module.types and allNotifTypes must be nothing in common
                                                                                                             //
                                                                                                             //
  if (!_.isEmpty(_.intersection(allNotifTypeNames, typeNames))) {                                            // 44
    throw new Meteor.Error("Some items in " + typeNames.toString() + " are already exists");                 // 45
  }                                                                                                          // 48
                                                                                                             //
  Notifications.Modules.unshift(module);                                                                     // 50
};                                                                                                           // 51
                                                                                                             //
Notifications.create = function (_modifier) {                                                                // 54
  var modifier = _modifier;                                                                                  // 55
  check(modifier, Notifications.Schema); // Setting auto values                                              // 57
                                                                                                             //
  modifier.isRead = false;                                                                                   // 60
  modifier.createdUser = modifier.createdUser || _this.userId;                                               // 61
  modifier.date = new Date(); // if receiver is configured to get this notification                          // 62
                                                                                                             //
  var config = Configs.findOne({                                                                             // 65
    user: modifier.receiver,                                                                                 // 66
    notifType: modifier.notifType                                                                            // 67
  }); // receiver disabled this notification                                                                 // 65
                                                                                                             //
  if (config && !config.isAllowed) {                                                                         // 71
    return 'error';                                                                                          // 72
  }                                                                                                          // 73
                                                                                                             //
  Notifications.insert(modifier);                                                                            // 75
  return 'ok';                                                                                               // 77
};                                                                                                           // 78
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"methods.js":["meteor/meteor","meteor/check","../notifications",function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/erxes-notifications/server/methods.js                                                            //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
var _Meteor$methods;                                                                                         //
                                                                                                             //
var Meteor = void 0;                                                                                         // 1
module.importSync("meteor/meteor", {                                                                         // 1
  Meteor: function (v) {                                                                                     // 1
    Meteor = v;                                                                                              // 1
  }                                                                                                          // 1
}, 0);                                                                                                       // 1
var check = void 0;                                                                                          // 1
module.importSync("meteor/check", {                                                                          // 1
  check: function (v) {                                                                                      // 1
    check = v;                                                                                               // 1
  }                                                                                                          // 1
}, 1);                                                                                                       // 1
var Notifications = void 0,                                                                                  // 1
    Configs = void 0;                                                                                        // 1
module.importSync("../notifications", {                                                                      // 1
  Notifications: function (v) {                                                                              // 1
    Notifications = v;                                                                                       // 1
  },                                                                                                         // 1
  Configs: function (v) {                                                                                    // 1
    Configs = v;                                                                                             // 1
  }                                                                                                          // 1
}, 2);                                                                                                       // 1
Meteor.methods((_Meteor$methods = {}, _Meteor$methods['notifications.markAsRead'] = function (ids) {         // 6
  check(ids, [String]);                                                                                      // 8
  Notifications.update({                                                                                     // 10
    _id: {                                                                                                   // 11
      $in: ids                                                                                               // 11
    }                                                                                                        // 11
  }, {                                                                                                       // 11
    $set: {                                                                                                  // 12
      isRead: true                                                                                           // 12
    }                                                                                                        // 12
  }, {                                                                                                       // 12
    multi: true                                                                                              // 13
  });                                                                                                        // 13
}, _Meteor$methods['notifications.getModules'] = function () {                                               // 15
  return Notifications.Modules;                                                                              // 18
}, _Meteor$methods['notifications.saveConfig'] = function (notifType, isAllowed) {                           // 19
  check(notifType, String);                                                                                  // 22
  check(isAllowed, Boolean);                                                                                 // 23
  var selector = {                                                                                           // 25
    user: this.userId,                                                                                       // 25
    notifType: notifType                                                                                     // 25
  };                                                                                                         // 25
  var oldOne = Configs.findOne(selector); // if already inserted then update isAllowed field                 // 27
                                                                                                             //
  if (oldOne) {                                                                                              // 30
    Configs.update({                                                                                         // 31
      _id: oldOne._id                                                                                        // 31
    }, {                                                                                                     // 31
      $set: {                                                                                                // 31
        isAllowed: isAllowed                                                                                 // 31
      }                                                                                                      // 31
    }); // if it is first time then insert                                                                   // 31
  } else {                                                                                                   // 34
    selector.isAllowed = isAllowed;                                                                          // 35
    Configs.insert(selector);                                                                                // 36
  }                                                                                                          // 37
}, _Meteor$methods));                                                                                        // 38
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"publications.js":["meteor/meteor","meteor/check","meteor/tmeasday:publish-counts","../notifications",function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/erxes-notifications/server/publications.js                                                       //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
var Meteor = void 0;                                                                                         // 1
module.importSync("meteor/meteor", {                                                                         // 1
  Meteor: function (v) {                                                                                     // 1
    Meteor = v;                                                                                              // 1
  }                                                                                                          // 1
}, 0);                                                                                                       // 1
var Match = void 0,                                                                                          // 1
    check = void 0;                                                                                          // 1
module.importSync("meteor/check", {                                                                          // 1
  Match: function (v) {                                                                                      // 1
    Match = v;                                                                                               // 1
  },                                                                                                         // 1
  check: function (v) {                                                                                      // 1
    check = v;                                                                                               // 1
  }                                                                                                          // 1
}, 1);                                                                                                       // 1
var Counts = void 0;                                                                                         // 1
module.importSync("meteor/tmeasday:publish-counts", {                                                        // 1
  Counts: function (v) {                                                                                     // 1
    Counts = v;                                                                                              // 1
  }                                                                                                          // 1
}, 2);                                                                                                       // 1
var Notifications = void 0,                                                                                  // 1
    Configs = void 0;                                                                                        // 1
module.importSync("../notifications", {                                                                      // 1
  Notifications: function (v) {                                                                              // 1
    Notifications = v;                                                                                       // 1
  },                                                                                                         // 1
  Configs: function (v) {                                                                                    // 1
    Configs = v;                                                                                             // 1
  }                                                                                                          // 1
}, 3);                                                                                                       // 1
// latest notifications list                                                                                 // 10
Meteor.publish('notifications.latest', function () {                                                         // 11
  function notifs(params) {                                                                                  // 11
    check(params, {                                                                                          // 12
      limit: Match.Integer,                                                                                  // 13
      requireRead: Boolean,                                                                                  // 14
      title: Match.Optional(String)                                                                          // 15
    });                                                                                                      // 12
    var limit = params.limit,                                                                                // 11
        requireRead = params.requireRead,                                                                    // 11
        title = params.title;                                                                                // 11
    var filters = {                                                                                          // 20
      receiver: this.userId                                                                                  // 20
    };                                                                                                       // 20
    Counts.publish(this, 'notifications.list.count', Notifications.find(), {                                 // 22
      noReady: true                                                                                          // 26
    });                                                                                                      // 26
                                                                                                             //
    if (requireRead) {                                                                                       // 29
      filters.isRead = false;                                                                                // 30
    }                                                                                                        // 31
                                                                                                             //
    if (title) {                                                                                             // 33
      filters.title = title;                                                                                 // 34
    }                                                                                                        // 35
                                                                                                             //
    return Notifications.find(filters, {                                                                     // 37
      sort: {                                                                                                // 37
        date: -1                                                                                             // 37
      },                                                                                                     // 37
      limit: limit                                                                                           // 37
    });                                                                                                      // 37
  }                                                                                                          // 38
                                                                                                             //
  return notifs;                                                                                             // 11
}()); // unread count                                                                                        // 11
                                                                                                             //
Meteor.publish('notifications.unreadCount', function () {                                                    // 42
  function notifCount() {                                                                                    // 42
    var cursor = Notifications.find({                                                                        // 43
      receiver: this.userId,                                                                                 // 44
      isRead: false                                                                                          // 45
    });                                                                                                      // 43
    Counts.publish(this, 'ureadNotificationsCount', cursor);                                                 // 48
  }                                                                                                          // 49
                                                                                                             //
  return notifCount;                                                                                         // 42
}()); // notifications config                                                                                // 42
                                                                                                             //
Meteor.publish('notifications.configs', function () {                                                        // 53
  function notificationsConfig() {                                                                           // 53
    return Configs.find({                                                                                    // 54
      user: this.userId                                                                                      // 55
    });                                                                                                      // 54
  }                                                                                                          // 57
                                                                                                             //
  return notificationsConfig;                                                                                // 53
}());                                                                                                        // 53
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]},"notifications.js":["meteor/mongo","meteor/aldeed:simple-schema",function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/erxes-notifications/notifications.js                                                             //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
module.export({                                                                                              // 1
  Notifications: function () {                                                                               // 1
    return Notifications;                                                                                    // 1
  },                                                                                                         // 1
  Configs: function () {                                                                                     // 1
    return Configs;                                                                                          // 1
  }                                                                                                          // 1
});                                                                                                          // 1
var Mongo = void 0;                                                                                          // 1
module.importSync("meteor/mongo", {                                                                          // 1
  Mongo: function (v) {                                                                                      // 1
    Mongo = v;                                                                                               // 1
  }                                                                                                          // 1
}, 0);                                                                                                       // 1
var SimpleSchema = void 0;                                                                                   // 1
module.importSync("meteor/aldeed:simple-schema", {                                                           // 1
  SimpleSchema: function (v) {                                                                               // 1
    SimpleSchema = v;                                                                                        // 1
  }                                                                                                          // 1
}, 1);                                                                                                       // 1
var Notifications = new Mongo.Collection('notifications');                                                   // 6
var Configs = new Mongo.Collection('notifications_configs');                                                 // 7
// schemas                                                                                                   // 9
Notifications.Schema = new SimpleSchema({                                                                    // 10
  notifType: {                                                                                               // 11
    type: String,                                                                                            // 12
    optional: true                                                                                           // 13
  },                                                                                                         // 11
  title: {                                                                                                   // 16
    type: String                                                                                             // 17
  },                                                                                                         // 16
  link: {                                                                                                    // 20
    type: String,                                                                                            // 21
    optional: true                                                                                           // 22
  },                                                                                                         // 20
  content: {                                                                                                 // 25
    type: String                                                                                             // 26
  },                                                                                                         // 25
  createdUser: {                                                                                             // 29
    type: String,                                                                                            // 30
    optional: true                                                                                           // 31
  },                                                                                                         // 29
  receiver: {                                                                                                // 34
    type: String                                                                                             // 35
  }                                                                                                          // 34
});                                                                                                          // 10
var BaseExtra = new SimpleSchema({                                                                           // 40
  date: {                                                                                                    // 41
    type: 'date'                                                                                             // 42
  },                                                                                                         // 41
  isRead: {                                                                                                  // 45
    type: Boolean                                                                                            // 46
  }                                                                                                          // 45
});                                                                                                          // 40
Configs.Schema = new SimpleSchema({                                                                          // 51
  // to whom this config is related                                                                          // 52
  user: {                                                                                                    // 53
    type: String                                                                                             // 54
  },                                                                                                         // 53
  // which module's type it is. For example: indocuments                                                     // 57
  notifType: {                                                                                               // 58
    type: String                                                                                             // 59
  },                                                                                                         // 58
  isAllowed: {                                                                                               // 62
    type: Boolean                                                                                            // 63
  }                                                                                                          // 62
}); // attach schemas                                                                                        // 51
                                                                                                             //
Notifications.attachSchema(Notifications.Schema);                                                            // 69
Notifications.attachSchema(BaseExtra);                                                                       // 70
Configs.attachSchema(Configs.Schema);                                                                        // 71
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/erxes-notifications/server/main.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['erxes-notifications'] = exports;

})();

//# sourceMappingURL=erxes-notifications.js.map
