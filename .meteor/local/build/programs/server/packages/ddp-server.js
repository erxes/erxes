(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;
var Retry = Package.retry.Retry;
var MongoID = Package['mongo-id'].MongoID;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDPCommon = Package['ddp-common'].DDPCommon;
var DDP = Package['ddp-client'].DDP;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var Hook = Package['callback-hook'].Hook;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var StreamServer, DDPServer, Server;

var require = meteorInstall({"node_modules":{"meteor":{"ddp-server":{"stream_server.js":function(require){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-server/stream_server.js                                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var url = Npm.require('url'); // By default, we use the permessage-deflate extension with default                     // 1
// configuration. If $SERVER_WEBSOCKET_COMPRESSION is set, then it must be valid                                      // 4
// JSON. If it represents a falsey value, then we do not use permessage-deflate                                       // 5
// at all; otherwise, the JSON value is used as an argument to deflate's                                              // 6
// configure method; see                                                                                              // 7
// https://github.com/faye/permessage-deflate-node/blob/master/README.md                                              // 8
//                                                                                                                    // 9
// (We do this in an _.once instead of at startup, because we don't want to                                           // 10
// crash the tool during isopacket load if your JSON doesn't parse. This is only                                      // 11
// a problem because the tool has to load the DDP server code just in order to                                        // 12
// be a DDP client; see https://github.com/meteor/meteor/issues/3452 .)                                               // 13
                                                                                                                      //
                                                                                                                      //
var websocketExtensions = _.once(function () {                                                                        // 14
  var extensions = [];                                                                                                // 15
  var websocketCompressionConfig = process.env.SERVER_WEBSOCKET_COMPRESSION ? JSON.parse(process.env.SERVER_WEBSOCKET_COMPRESSION) : {};
                                                                                                                      //
  if (websocketCompressionConfig) {                                                                                   // 19
    extensions.push(Npm.require('permessage-deflate').configure(websocketCompressionConfig));                         // 20
  }                                                                                                                   // 23
                                                                                                                      //
  return extensions;                                                                                                  // 25
});                                                                                                                   // 26
                                                                                                                      //
var pathPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || "";                                                // 28
                                                                                                                      //
StreamServer = function () {                                                                                          // 30
  var self = this;                                                                                                    // 31
  self.registration_callbacks = [];                                                                                   // 32
  self.open_sockets = []; // Because we are installing directly onto WebApp.httpServer instead of using               // 33
  // WebApp.app, we have to process the path prefix ourselves.                                                        // 36
                                                                                                                      //
  self.prefix = pathPrefix + '/sockjs';                                                                               // 37
  RoutePolicy.declare(self.prefix + '/', 'network'); // set up sockjs                                                 // 38
                                                                                                                      //
  var sockjs = Npm.require('sockjs');                                                                                 // 41
                                                                                                                      //
  var serverOptions = {                                                                                               // 42
    prefix: self.prefix,                                                                                              // 43
    log: function () {},                                                                                              // 44
    // this is the default, but we code it explicitly because we depend                                               // 45
    // on it in stream_client:HEARTBEAT_TIMEOUT                                                                       // 46
    heartbeat_delay: 45000,                                                                                           // 47
    // The default disconnect_delay is 5 seconds, but if the server ends up CPU                                       // 48
    // bound for that much time, SockJS might not notice that the user has                                            // 49
    // reconnected because the timer (of disconnect_delay ms) can fire before                                         // 50
    // SockJS processes the new connection. Eventually we'll fix this by not                                          // 51
    // combining CPU-heavy processing with SockJS termination (eg a proxy which                                       // 52
    // converts to Unix sockets) but for now, raise the delay.                                                        // 53
    disconnect_delay: 60 * 1000,                                                                                      // 54
    // Set the USE_JSESSIONID environment variable to enable setting the                                              // 55
    // JSESSIONID cookie. This is useful for setting up proxies with                                                  // 56
    // session affinity.                                                                                              // 57
    jsessionid: !!process.env.USE_JSESSIONID                                                                          // 58
  }; // If you know your server environment (eg, proxies) will prevent websockets                                     // 42
  // from ever working, set $DISABLE_WEBSOCKETS and SockJS clients (ie,                                               // 62
  // browsers) will not waste time attempting to use them.                                                            // 63
  // (Your server will still have a /websocket endpoint.)                                                             // 64
                                                                                                                      //
  if (process.env.DISABLE_WEBSOCKETS) {                                                                               // 65
    serverOptions.websocket = false;                                                                                  // 66
  } else {                                                                                                            // 67
    serverOptions.faye_server_options = {                                                                             // 68
      extensions: websocketExtensions()                                                                               // 69
    };                                                                                                                // 68
  }                                                                                                                   // 71
                                                                                                                      //
  self.server = sockjs.createServer(serverOptions); // Install the sockjs handlers, but we want to keep around our own particular
  // request handler that adjusts idle timeouts while we have an outstanding                                          // 76
  // request.  This compensates for the fact that sockjs removes all listeners                                        // 77
  // for "request" to add its own.                                                                                    // 78
                                                                                                                      //
  WebApp.httpServer.removeListener('request', WebApp._timeoutAdjustmentRequestCallback);                              // 79
  self.server.installHandlers(WebApp.httpServer);                                                                     // 81
  WebApp.httpServer.addListener('request', WebApp._timeoutAdjustmentRequestCallback); // Support the /websocket endpoint
                                                                                                                      //
  self._redirectWebsocketEndpoint();                                                                                  // 86
                                                                                                                      //
  self.server.on('connection', function (socket) {                                                                    // 88
    // We want to make sure that if a client connects to us and does the initial                                      // 89
    // Websocket handshake but never gets to the DDP handshake, that we                                               // 90
    // eventually kill the socket.  Once the DDP handshake happens, DDP                                               // 91
    // heartbeating will work. And before the Websocket handshake, the timeouts                                       // 92
    // we set at the server level in webapp_server.js will work. But                                                  // 93
    // faye-websocket calls setTimeout(0) on any socket it takes over, so there                                       // 94
    // is an "in between" state where this doesn't happen.  We work around this                                       // 95
    // by explicitly setting the socket timeout to a relatively large time here,                                      // 96
    // and setting it back to zero when we set up the heartbeat in                                                    // 97
    // livedata_server.js.                                                                                            // 98
    socket.setWebsocketTimeout = function (timeout) {                                                                 // 99
      if ((socket.protocol === 'websocket' || socket.protocol === 'websocket-raw') && socket._session.recv) {         // 100
        socket._session.recv.connection.setTimeout(timeout);                                                          // 103
      }                                                                                                               // 104
    };                                                                                                                // 105
                                                                                                                      //
    socket.setWebsocketTimeout(45 * 1000);                                                                            // 106
                                                                                                                      //
    socket.send = function (data) {                                                                                   // 108
      socket.write(data);                                                                                             // 109
    };                                                                                                                // 110
                                                                                                                      //
    socket.on('close', function () {                                                                                  // 111
      self.open_sockets = _.without(self.open_sockets, socket);                                                       // 112
    });                                                                                                               // 113
    self.open_sockets.push(socket); // XXX COMPAT WITH 0.6.6. Send the old style welcome message, which               // 114
    // will force old clients to reload. Remove this once we're not                                                   // 117
    // concerned about people upgrading from a pre-0.7.0 release. Also,                                               // 118
    // remove the clause in the client that ignores the welcome message                                               // 119
    // (livedata_connection.js)                                                                                       // 120
                                                                                                                      //
    socket.send(JSON.stringify({                                                                                      // 121
      server_id: "0"                                                                                                  // 121
    })); // call all our callbacks when we get a new socket. they will do the                                         // 121
    // work of setting up handlers and such for specific messages.                                                    // 124
                                                                                                                      //
    _.each(self.registration_callbacks, function (callback) {                                                         // 125
      callback(socket);                                                                                               // 126
    });                                                                                                               // 127
  });                                                                                                                 // 128
};                                                                                                                    // 130
                                                                                                                      //
_.extend(StreamServer.prototype, {                                                                                    // 132
  // call my callback when a new socket connects.                                                                     // 133
  // also call it for all current connections.                                                                        // 134
  register: function (callback) {                                                                                     // 135
    var self = this;                                                                                                  // 136
    self.registration_callbacks.push(callback);                                                                       // 137
                                                                                                                      //
    _.each(self.all_sockets(), function (socket) {                                                                    // 138
      callback(socket);                                                                                               // 139
    });                                                                                                               // 140
  },                                                                                                                  // 141
  // get a list of all sockets                                                                                        // 143
  all_sockets: function () {                                                                                          // 144
    var self = this;                                                                                                  // 145
    return _.values(self.open_sockets);                                                                               // 146
  },                                                                                                                  // 147
  // Redirect /websocket to /sockjs/websocket in order to not expose                                                  // 149
  // sockjs to clients that want to use raw websockets                                                                // 150
  _redirectWebsocketEndpoint: function () {                                                                           // 151
    var self = this; // Unfortunately we can't use a connect middleware here since                                    // 152
    // sockjs installs itself prior to all existing listeners                                                         // 154
    // (meaning prior to any connect middlewares) so we need to take                                                  // 155
    // an approach similar to overshadowListeners in                                                                  // 156
    // https://github.com/sockjs/sockjs-node/blob/cf820c55af6a9953e16558555a31decea554f70e/src/utils.coffee           // 157
                                                                                                                      //
    _.each(['request', 'upgrade'], function (event) {                                                                 // 158
      var httpServer = WebApp.httpServer;                                                                             // 159
      var oldHttpServerListeners = httpServer.listeners(event).slice(0);                                              // 160
      httpServer.removeAllListeners(event); // request and upgrade have different arguments passed but                // 161
      // we only care about the first one which is always request                                                     // 164
                                                                                                                      //
      var newListener = function (request /*, moreArguments */) {                                                     // 165
        // Store arguments for use within the closure below                                                           // 166
        var args = arguments; // Rewrite /websocket and /websocket/ urls to /sockjs/websocket while                   // 167
        // preserving query string.                                                                                   // 170
                                                                                                                      //
        var parsedUrl = url.parse(request.url);                                                                       // 171
                                                                                                                      //
        if (parsedUrl.pathname === pathPrefix + '/websocket' || parsedUrl.pathname === pathPrefix + '/websocket/') {  // 172
          parsedUrl.pathname = self.prefix + '/websocket';                                                            // 174
          request.url = url.format(parsedUrl);                                                                        // 175
        }                                                                                                             // 176
                                                                                                                      //
        _.each(oldHttpServerListeners, function (oldListener) {                                                       // 177
          oldListener.apply(httpServer, args);                                                                        // 178
        });                                                                                                           // 179
      };                                                                                                              // 180
                                                                                                                      //
      httpServer.addListener(event, newListener);                                                                     // 181
    });                                                                                                               // 182
  }                                                                                                                   // 183
});                                                                                                                   // 132
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"livedata_server.js":["babel-runtime/helpers/typeof",function(require){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-server/livedata_server.js                                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                               //
                                                                                                                      //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                      //
                                                                                                                      //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                     //
                                                                                                                      //
DDPServer = {};                                                                                                       // 1
                                                                                                                      //
var Fiber = Npm.require('fibers'); // This file contains classes:                                                     // 3
// * Session - The server's connection to a single DDP client                                                         // 6
// * Subscription - A single subscription for a single client                                                         // 7
// * Server - An entire server that may talk to > 1 client. A DDP endpoint.                                           // 8
//                                                                                                                    // 9
// Session and Subscription are file scope. For now, until we freeze                                                  // 10
// the interface, Server is package scope (in the future it should be                                                 // 11
// exported.)                                                                                                         // 12
// Represents a single document in a SessionCollectionView                                                            // 14
                                                                                                                      //
                                                                                                                      //
var SessionDocumentView = function () {                                                                               // 15
  var self = this;                                                                                                    // 16
  self.existsIn = {}; // set of subscriptionHandle                                                                    // 17
                                                                                                                      //
  self.dataByKey = {}; // key-> [ {subscriptionHandle, value} by precedence]                                          // 18
};                                                                                                                    // 19
                                                                                                                      //
DDPServer._SessionDocumentView = SessionDocumentView;                                                                 // 21
                                                                                                                      //
_.extend(SessionDocumentView.prototype, {                                                                             // 24
  getFields: function () {                                                                                            // 26
    var self = this;                                                                                                  // 27
    var ret = {};                                                                                                     // 28
                                                                                                                      //
    _.each(self.dataByKey, function (precedenceList, key) {                                                           // 29
      ret[key] = precedenceList[0].value;                                                                             // 30
    });                                                                                                               // 31
                                                                                                                      //
    return ret;                                                                                                       // 32
  },                                                                                                                  // 33
  clearField: function (subscriptionHandle, key, changeCollector) {                                                   // 35
    var self = this; // Publish API ignores _id if present in fields                                                  // 36
                                                                                                                      //
    if (key === "_id") return;                                                                                        // 38
    var precedenceList = self.dataByKey[key]; // It's okay to clear fields that didn't exist. No need to throw        // 40
    // an error.                                                                                                      // 43
                                                                                                                      //
    if (!precedenceList) return;                                                                                      // 44
    var removedValue = undefined;                                                                                     // 47
                                                                                                                      //
    for (var i = 0; i < precedenceList.length; i++) {                                                                 // 48
      var precedence = precedenceList[i];                                                                             // 49
                                                                                                                      //
      if (precedence.subscriptionHandle === subscriptionHandle) {                                                     // 50
        // The view's value can only change if this subscription is the one that                                      // 51
        // used to have precedence.                                                                                   // 52
        if (i === 0) removedValue = precedence.value;                                                                 // 53
        precedenceList.splice(i, 1);                                                                                  // 55
        break;                                                                                                        // 56
      }                                                                                                               // 57
    }                                                                                                                 // 58
                                                                                                                      //
    if (_.isEmpty(precedenceList)) {                                                                                  // 59
      delete self.dataByKey[key];                                                                                     // 60
      changeCollector[key] = undefined;                                                                               // 61
    } else if (removedValue !== undefined && !EJSON.equals(removedValue, precedenceList[0].value)) {                  // 62
      changeCollector[key] = precedenceList[0].value;                                                                 // 64
    }                                                                                                                 // 65
  },                                                                                                                  // 66
  changeField: function (subscriptionHandle, key, value, changeCollector, isAdd) {                                    // 68
    var self = this; // Publish API ignores _id if present in fields                                                  // 70
                                                                                                                      //
    if (key === "_id") return; // Don't share state with the data passed in by the user.                              // 72
                                                                                                                      //
    value = EJSON.clone(value);                                                                                       // 76
                                                                                                                      //
    if (!_.has(self.dataByKey, key)) {                                                                                // 78
      self.dataByKey[key] = [{                                                                                        // 79
        subscriptionHandle: subscriptionHandle,                                                                       // 79
        value: value                                                                                                  // 80
      }];                                                                                                             // 79
      changeCollector[key] = value;                                                                                   // 81
      return;                                                                                                         // 82
    }                                                                                                                 // 83
                                                                                                                      //
    var precedenceList = self.dataByKey[key];                                                                         // 84
    var elt;                                                                                                          // 85
                                                                                                                      //
    if (!isAdd) {                                                                                                     // 86
      elt = _.find(precedenceList, function (precedence) {                                                            // 87
        return precedence.subscriptionHandle === subscriptionHandle;                                                  // 88
      });                                                                                                             // 89
    }                                                                                                                 // 90
                                                                                                                      //
    if (elt) {                                                                                                        // 92
      if (elt === precedenceList[0] && !EJSON.equals(value, elt.value)) {                                             // 93
        // this subscription is changing the value of this field.                                                     // 94
        changeCollector[key] = value;                                                                                 // 95
      }                                                                                                               // 96
                                                                                                                      //
      elt.value = value;                                                                                              // 97
    } else {                                                                                                          // 98
      // this subscription is newly caring about this field                                                           // 99
      precedenceList.push({                                                                                           // 100
        subscriptionHandle: subscriptionHandle,                                                                       // 100
        value: value                                                                                                  // 100
      });                                                                                                             // 100
    }                                                                                                                 // 101
  }                                                                                                                   // 103
}); /**                                                                                                               // 24
     * Represents a client's view of a single collection                                                              //
     * @param {String} collectionName Name of the collection it represents                                            //
     * @param {Object.<String, Function>} sessionCallbacks The callbacks for added, changed, removed                  //
     * @class SessionCollectionView                                                                                   //
     */                                                                                                               //
                                                                                                                      //
var SessionCollectionView = function (collectionName, sessionCallbacks) {                                             // 112
  var self = this;                                                                                                    // 113
  self.collectionName = collectionName;                                                                               // 114
  self.documents = {};                                                                                                // 115
  self.callbacks = sessionCallbacks;                                                                                  // 116
};                                                                                                                    // 117
                                                                                                                      //
DDPServer._SessionCollectionView = SessionCollectionView;                                                             // 119
                                                                                                                      //
_.extend(SessionCollectionView.prototype, {                                                                           // 122
  isEmpty: function () {                                                                                              // 124
    var self = this;                                                                                                  // 125
    return _.isEmpty(self.documents);                                                                                 // 126
  },                                                                                                                  // 127
  diff: function (previous) {                                                                                         // 129
    var self = this;                                                                                                  // 130
    DiffSequence.diffObjects(previous.documents, self.documents, {                                                    // 131
      both: _.bind(self.diffDocument, self),                                                                          // 132
      rightOnly: function (id, nowDV) {                                                                               // 134
        self.callbacks.added(self.collectionName, id, nowDV.getFields());                                             // 135
      },                                                                                                              // 136
      leftOnly: function (id, prevDV) {                                                                               // 138
        self.callbacks.removed(self.collectionName, id);                                                              // 139
      }                                                                                                               // 140
    });                                                                                                               // 131
  },                                                                                                                  // 142
  diffDocument: function (id, prevDV, nowDV) {                                                                        // 144
    var self = this;                                                                                                  // 145
    var fields = {};                                                                                                  // 146
    DiffSequence.diffObjects(prevDV.getFields(), nowDV.getFields(), {                                                 // 147
      both: function (key, prev, now) {                                                                               // 148
        if (!EJSON.equals(prev, now)) fields[key] = now;                                                              // 149
      },                                                                                                              // 151
      rightOnly: function (key, now) {                                                                                // 152
        fields[key] = now;                                                                                            // 153
      },                                                                                                              // 154
      leftOnly: function (key, prev) {                                                                                // 155
        fields[key] = undefined;                                                                                      // 156
      }                                                                                                               // 157
    });                                                                                                               // 147
    self.callbacks.changed(self.collectionName, id, fields);                                                          // 159
  },                                                                                                                  // 160
  added: function (subscriptionHandle, id, fields) {                                                                  // 162
    var self = this;                                                                                                  // 163
    var docView = self.documents[id];                                                                                 // 164
    var added = false;                                                                                                // 165
                                                                                                                      //
    if (!docView) {                                                                                                   // 166
      added = true;                                                                                                   // 167
      docView = new SessionDocumentView();                                                                            // 168
      self.documents[id] = docView;                                                                                   // 169
    }                                                                                                                 // 170
                                                                                                                      //
    docView.existsIn[subscriptionHandle] = true;                                                                      // 171
    var changeCollector = {};                                                                                         // 172
                                                                                                                      //
    _.each(fields, function (value, key) {                                                                            // 173
      docView.changeField(subscriptionHandle, key, value, changeCollector, true);                                     // 174
    });                                                                                                               // 176
                                                                                                                      //
    if (added) self.callbacks.added(self.collectionName, id, changeCollector);else self.callbacks.changed(self.collectionName, id, changeCollector);
  },                                                                                                                  // 181
  changed: function (subscriptionHandle, id, changed) {                                                               // 183
    var self = this;                                                                                                  // 184
    var changedResult = {};                                                                                           // 185
    var docView = self.documents[id];                                                                                 // 186
    if (!docView) throw new Error("Could not find element with id " + id + " to change");                             // 187
                                                                                                                      //
    _.each(changed, function (value, key) {                                                                           // 189
      if (value === undefined) docView.clearField(subscriptionHandle, key, changedResult);else docView.changeField(subscriptionHandle, key, value, changedResult);
    });                                                                                                               // 194
                                                                                                                      //
    self.callbacks.changed(self.collectionName, id, changedResult);                                                   // 195
  },                                                                                                                  // 196
  removed: function (subscriptionHandle, id) {                                                                        // 198
    var self = this;                                                                                                  // 199
    var docView = self.documents[id];                                                                                 // 200
                                                                                                                      //
    if (!docView) {                                                                                                   // 201
      var err = new Error("Removed nonexistent document " + id);                                                      // 202
      throw err;                                                                                                      // 203
    }                                                                                                                 // 204
                                                                                                                      //
    delete docView.existsIn[subscriptionHandle];                                                                      // 205
                                                                                                                      //
    if (_.isEmpty(docView.existsIn)) {                                                                                // 206
      // it is gone from everyone                                                                                     // 207
      self.callbacks.removed(self.collectionName, id);                                                                // 208
      delete self.documents[id];                                                                                      // 209
    } else {                                                                                                          // 210
      var changed = {}; // remove this subscription from every precedence list                                        // 211
      // and record the changes                                                                                       // 213
                                                                                                                      //
      _.each(docView.dataByKey, function (precedenceList, key) {                                                      // 214
        docView.clearField(subscriptionHandle, key, changed);                                                         // 215
      });                                                                                                             // 216
                                                                                                                      //
      self.callbacks.changed(self.collectionName, id, changed);                                                       // 218
    }                                                                                                                 // 219
  }                                                                                                                   // 220
}); /******************************************************************************/ /* Session                                                                    */ /******************************************************************************/
                                                                                                                      //
var Session = function (server, version, socket, options) {                                                           // 227
  var self = this;                                                                                                    // 228
  self.id = Random.id();                                                                                              // 229
  self.server = server;                                                                                               // 231
  self.version = version;                                                                                             // 232
  self.initialized = false;                                                                                           // 234
  self.socket = socket; // set to null when the session is destroyed. multiple places below                           // 235
  // use this to determine if the session is alive or not.                                                            // 238
                                                                                                                      //
  self.inQueue = new Meteor._DoubleEndedQueue();                                                                      // 239
  self.blocked = false;                                                                                               // 241
  self.workerRunning = false; // Sub objects for active subscriptions                                                 // 242
                                                                                                                      //
  self._namedSubs = {};                                                                                               // 245
  self._universalSubs = [];                                                                                           // 246
  self.userId = null;                                                                                                 // 248
  self.collectionViews = {}; // Set this to false to not send messages when collectionViews are                       // 250
  // modified. This is done when rerunning subs in _setUserId and those messages                                      // 253
  // are calculated via a diff instead.                                                                               // 254
                                                                                                                      //
  self._isSending = true; // If this is true, don't start a newly-created universal publisher on this                 // 255
  // session. The session will take care of starting it when appropriate.                                             // 258
                                                                                                                      //
  self._dontStartNewUniversalSubs = false; // when we are rerunning subscriptions, any ready messages                 // 259
  // we want to buffer up for when we are done rerunning subscriptions                                                // 262
                                                                                                                      //
  self._pendingReady = []; // List of callbacks to call when this connection is closed.                               // 263
                                                                                                                      //
  self._closeCallbacks = []; // XXX HACK: If a sockjs connection, save off the URL. This is                           // 266
  // temporary and will go away in the near future.                                                                   // 270
                                                                                                                      //
  self._socketUrl = socket.url; // Allow tests to disable responding to pings.                                        // 271
                                                                                                                      //
  self._respondToPings = options.respondToPings; // This object is the public interface to the session. In the public
  // API, it is called the `connection` object.  Internally we call it                                                // 277
  // a `connectionHandle` to avoid ambiguity.                                                                         // 278
                                                                                                                      //
  self.connectionHandle = {                                                                                           // 279
    id: self.id,                                                                                                      // 280
    close: function () {                                                                                              // 281
      self.close();                                                                                                   // 282
    },                                                                                                                // 283
    onClose: function (fn) {                                                                                          // 284
      var cb = Meteor.bindEnvironment(fn, "connection onClose callback");                                             // 285
                                                                                                                      //
      if (self.inQueue) {                                                                                             // 286
        self._closeCallbacks.push(cb);                                                                                // 287
      } else {                                                                                                        // 288
        // if we're already closed, call the callback.                                                                // 289
        Meteor.defer(cb);                                                                                             // 290
      }                                                                                                               // 291
    },                                                                                                                // 292
    clientAddress: self._clientAddress(),                                                                             // 293
    httpHeaders: self.socket.headers                                                                                  // 294
  };                                                                                                                  // 279
  self.send({                                                                                                         // 297
    msg: 'connected',                                                                                                 // 297
    session: self.id                                                                                                  // 297
  }); // On initial connect, spin up all the universal publishers.                                                    // 297
                                                                                                                      //
  Fiber(function () {                                                                                                 // 300
    self.startUniversalSubs();                                                                                        // 301
  }).run();                                                                                                           // 302
                                                                                                                      //
  if (version !== 'pre1' && options.heartbeatInterval !== 0) {                                                        // 304
    // We no longer need the low level timeout because we have heartbeating.                                          // 305
    socket.setWebsocketTimeout(0);                                                                                    // 306
    self.heartbeat = new DDPCommon.Heartbeat({                                                                        // 308
      heartbeatInterval: options.heartbeatInterval,                                                                   // 309
      heartbeatTimeout: options.heartbeatTimeout,                                                                     // 310
      onTimeout: function () {                                                                                        // 311
        self.close();                                                                                                 // 312
      },                                                                                                              // 313
      sendPing: function () {                                                                                         // 314
        self.send({                                                                                                   // 315
          msg: 'ping'                                                                                                 // 315
        });                                                                                                           // 315
      }                                                                                                               // 316
    });                                                                                                               // 308
    self.heartbeat.start();                                                                                           // 318
  }                                                                                                                   // 319
                                                                                                                      //
  Package.facts && Package.facts.Facts.incrementServerFact("livedata", "sessions", 1);                                // 321
};                                                                                                                    // 323
                                                                                                                      //
_.extend(Session.prototype, {                                                                                         // 325
  sendReady: function (subscriptionIds) {                                                                             // 327
    var self = this;                                                                                                  // 328
    if (self._isSending) self.send({                                                                                  // 329
      msg: "ready",                                                                                                   // 330
      subs: subscriptionIds                                                                                           // 330
    });else {                                                                                                         // 330
      _.each(subscriptionIds, function (subscriptionId) {                                                             // 332
        self._pendingReady.push(subscriptionId);                                                                      // 333
      });                                                                                                             // 334
    }                                                                                                                 // 335
  },                                                                                                                  // 336
  sendAdded: function (collectionName, id, fields) {                                                                  // 338
    var self = this;                                                                                                  // 339
    if (self._isSending) self.send({                                                                                  // 340
      msg: "added",                                                                                                   // 341
      collection: collectionName,                                                                                     // 341
      id: id,                                                                                                         // 341
      fields: fields                                                                                                  // 341
    });                                                                                                               // 341
  },                                                                                                                  // 342
  sendChanged: function (collectionName, id, fields) {                                                                // 344
    var self = this;                                                                                                  // 345
    if (_.isEmpty(fields)) return;                                                                                    // 346
                                                                                                                      //
    if (self._isSending) {                                                                                            // 349
      self.send({                                                                                                     // 350
        msg: "changed",                                                                                               // 351
        collection: collectionName,                                                                                   // 352
        id: id,                                                                                                       // 353
        fields: fields                                                                                                // 354
      });                                                                                                             // 350
    }                                                                                                                 // 356
  },                                                                                                                  // 357
  sendRemoved: function (collectionName, id) {                                                                        // 359
    var self = this;                                                                                                  // 360
    if (self._isSending) self.send({                                                                                  // 361
      msg: "removed",                                                                                                 // 362
      collection: collectionName,                                                                                     // 362
      id: id                                                                                                          // 362
    });                                                                                                               // 362
  },                                                                                                                  // 363
  getSendCallbacks: function () {                                                                                     // 365
    var self = this;                                                                                                  // 366
    return {                                                                                                          // 367
      added: _.bind(self.sendAdded, self),                                                                            // 368
      changed: _.bind(self.sendChanged, self),                                                                        // 369
      removed: _.bind(self.sendRemoved, self)                                                                         // 370
    };                                                                                                                // 367
  },                                                                                                                  // 372
  getCollectionView: function (collectionName) {                                                                      // 374
    var self = this;                                                                                                  // 375
                                                                                                                      //
    if (_.has(self.collectionViews, collectionName)) {                                                                // 376
      return self.collectionViews[collectionName];                                                                    // 377
    }                                                                                                                 // 378
                                                                                                                      //
    var ret = new SessionCollectionView(collectionName, self.getSendCallbacks());                                     // 379
    self.collectionViews[collectionName] = ret;                                                                       // 381
    return ret;                                                                                                       // 382
  },                                                                                                                  // 383
  added: function (subscriptionHandle, collectionName, id, fields) {                                                  // 385
    var self = this;                                                                                                  // 386
    var view = self.getCollectionView(collectionName);                                                                // 387
    view.added(subscriptionHandle, id, fields);                                                                       // 388
  },                                                                                                                  // 389
  removed: function (subscriptionHandle, collectionName, id) {                                                        // 391
    var self = this;                                                                                                  // 392
    var view = self.getCollectionView(collectionName);                                                                // 393
    view.removed(subscriptionHandle, id);                                                                             // 394
                                                                                                                      //
    if (view.isEmpty()) {                                                                                             // 395
      delete self.collectionViews[collectionName];                                                                    // 396
    }                                                                                                                 // 397
  },                                                                                                                  // 398
  changed: function (subscriptionHandle, collectionName, id, fields) {                                                // 400
    var self = this;                                                                                                  // 401
    var view = self.getCollectionView(collectionName);                                                                // 402
    view.changed(subscriptionHandle, id, fields);                                                                     // 403
  },                                                                                                                  // 404
  startUniversalSubs: function () {                                                                                   // 406
    var self = this; // Make a shallow copy of the set of universal handlers and start them. If                       // 407
    // additional universal publishers start while we're running them (due to                                         // 409
    // yielding), they will run separately as part of Server.publish.                                                 // 410
                                                                                                                      //
    var handlers = _.clone(self.server.universal_publish_handlers);                                                   // 411
                                                                                                                      //
    _.each(handlers, function (handler) {                                                                             // 412
      self._startSubscription(handler);                                                                               // 413
    });                                                                                                               // 414
  },                                                                                                                  // 415
  // Destroy this session and unregister it at the server.                                                            // 417
  close: function () {                                                                                                // 418
    var self = this; // Destroy this session, even if it's not registered at the                                      // 419
    // server. Stop all processing and tear everything down. If a socket                                              // 422
    // was attached, close it.                                                                                        // 423
    // Already destroyed.                                                                                             // 425
                                                                                                                      //
    if (!self.inQueue) return; // Drop the merge box data immediately.                                                // 426
                                                                                                                      //
    self.inQueue = null;                                                                                              // 430
    self.collectionViews = {};                                                                                        // 431
                                                                                                                      //
    if (self.heartbeat) {                                                                                             // 433
      self.heartbeat.stop();                                                                                          // 434
      self.heartbeat = null;                                                                                          // 435
    }                                                                                                                 // 436
                                                                                                                      //
    if (self.socket) {                                                                                                // 438
      self.socket.close();                                                                                            // 439
      self.socket._meteorSession = null;                                                                              // 440
    }                                                                                                                 // 441
                                                                                                                      //
    Package.facts && Package.facts.Facts.incrementServerFact("livedata", "sessions", -1);                             // 443
    Meteor.defer(function () {                                                                                        // 446
      // stop callbacks can yield, so we defer this on close.                                                         // 447
      // sub._isDeactivated() detects that we set inQueue to null and                                                 // 448
      // treats it as semi-deactivated (it will ignore incoming callbacks, etc).                                      // 449
      self._deactivateAllSubscriptions(); // Defer calling the close callbacks, so that the caller closing            // 450
      // the session isn't waiting for all the callbacks to complete.                                                 // 453
                                                                                                                      //
                                                                                                                      //
      _.each(self._closeCallbacks, function (callback) {                                                              // 454
        callback();                                                                                                   // 455
      });                                                                                                             // 456
    }); // Unregister the session.                                                                                    // 457
                                                                                                                      //
    self.server._removeSession(self);                                                                                 // 460
  },                                                                                                                  // 461
  // Send a message (doing nothing if no socket is connected right now.)                                              // 463
  // It should be a JSON object (it will be stringified.)                                                             // 464
  send: function (msg) {                                                                                              // 465
    var self = this;                                                                                                  // 466
                                                                                                                      //
    if (self.socket) {                                                                                                // 467
      if (Meteor._printSentDDP) Meteor._debug("Sent DDP", DDPCommon.stringifyDDP(msg));                               // 468
      self.socket.send(DDPCommon.stringifyDDP(msg));                                                                  // 470
    }                                                                                                                 // 471
  },                                                                                                                  // 472
  // Send a connection error.                                                                                         // 474
  sendError: function (reason, offendingMessage) {                                                                    // 475
    var self = this;                                                                                                  // 476
    var msg = {                                                                                                       // 477
      msg: 'error',                                                                                                   // 477
      reason: reason                                                                                                  // 477
    };                                                                                                                // 477
    if (offendingMessage) msg.offendingMessage = offendingMessage;                                                    // 478
    self.send(msg);                                                                                                   // 480
  },                                                                                                                  // 481
  // Process 'msg' as an incoming message. (But as a guard against                                                    // 483
  // race conditions during reconnection, ignore the message if                                                       // 484
  // 'socket' is not the currently connected socket.)                                                                 // 485
  //                                                                                                                  // 486
  // We run the messages from the client one at a time, in the order                                                  // 487
  // given by the client. The message handler is passed an idempotent                                                 // 488
  // function 'unblock' which it may call to allow other messages to                                                  // 489
  // begin running in parallel in another fiber (for example, a method                                                // 490
  // that wants to yield.) Otherwise, it is automatically unblocked                                                   // 491
  // when it returns.                                                                                                 // 492
  //                                                                                                                  // 493
  // Actually, we don't have to 'totally order' the messages in this                                                  // 494
  // way, but it's the easiest thing that's correct. (unsub needs to                                                  // 495
  // be ordered against sub, methods need to be ordered against each                                                  // 496
  // other.)                                                                                                          // 497
  processMessage: function (msg_in) {                                                                                 // 498
    var self = this;                                                                                                  // 499
    if (!self.inQueue) // we have been destroyed.                                                                     // 500
      return; // Respond to ping and pong messages immediately without queuing.                                       // 501
    // If the negotiated DDP version is "pre1" which didn't support                                                   // 504
    // pings, preserve the "pre1" behavior of responding with a "bad                                                  // 505
    // request" for the unknown messages.                                                                             // 506
    //                                                                                                                // 507
    // Fibers are needed because heartbeat uses Meteor.setTimeout, which                                              // 508
    // needs a Fiber. We could actually use regular setTimeout and avoid                                              // 509
    // these new fibers, but it is easier to just make everything use                                                 // 510
    // Meteor.setTimeout and not think too hard.                                                                      // 511
    //                                                                                                                // 512
    // Any message counts as receiving a pong, as it demonstrates that                                                // 513
    // the client is still alive.                                                                                     // 514
                                                                                                                      //
    if (self.heartbeat) {                                                                                             // 515
      Fiber(function () {                                                                                             // 516
        self.heartbeat.messageReceived();                                                                             // 517
      }).run();                                                                                                       // 518
    }                                                                                                                 // 519
                                                                                                                      //
    if (self.version !== 'pre1' && msg_in.msg === 'ping') {                                                           // 521
      if (self._respondToPings) self.send({                                                                           // 522
        msg: "pong",                                                                                                  // 523
        id: msg_in.id                                                                                                 // 523
      });                                                                                                             // 523
      return;                                                                                                         // 524
    }                                                                                                                 // 525
                                                                                                                      //
    if (self.version !== 'pre1' && msg_in.msg === 'pong') {                                                           // 526
      // Since everything is a pong, nothing to do                                                                    // 527
      return;                                                                                                         // 528
    }                                                                                                                 // 529
                                                                                                                      //
    self.inQueue.push(msg_in);                                                                                        // 531
    if (self.workerRunning) return;                                                                                   // 532
    self.workerRunning = true;                                                                                        // 534
                                                                                                                      //
    var processNext = function () {                                                                                   // 536
      var msg = self.inQueue && self.inQueue.shift();                                                                 // 537
                                                                                                                      //
      if (!msg) {                                                                                                     // 538
        self.workerRunning = false;                                                                                   // 539
        return;                                                                                                       // 540
      }                                                                                                               // 541
                                                                                                                      //
      Fiber(function () {                                                                                             // 543
        var blocked = true;                                                                                           // 544
                                                                                                                      //
        var unblock = function () {                                                                                   // 546
          if (!blocked) return; // idempotent                                                                         // 547
                                                                                                                      //
          blocked = false;                                                                                            // 549
          processNext();                                                                                              // 550
        };                                                                                                            // 551
                                                                                                                      //
        self.server.onMessageHook.each(function (callback) {                                                          // 553
          callback(msg, self);                                                                                        // 554
          return true;                                                                                                // 555
        });                                                                                                           // 556
        if (_.has(self.protocol_handlers, msg.msg)) self.protocol_handlers[msg.msg].call(self, msg, unblock);else self.sendError('Bad request', msg);
        unblock(); // in case the handler didn't already do it                                                        // 562
      }).run();                                                                                                       // 563
    };                                                                                                                // 564
                                                                                                                      //
    processNext();                                                                                                    // 566
  },                                                                                                                  // 567
  protocol_handlers: {                                                                                                // 569
    sub: function (msg) {                                                                                             // 570
      var self = this; // reject malformed messages                                                                   // 571
                                                                                                                      //
      if (typeof msg.id !== "string" || typeof msg.name !== "string" || 'params' in msg && !(msg.params instanceof Array)) {
        self.sendError("Malformed subscription", msg);                                                                // 577
        return;                                                                                                       // 578
      }                                                                                                               // 579
                                                                                                                      //
      if (!self.server.publish_handlers[msg.name]) {                                                                  // 581
        self.send({                                                                                                   // 582
          msg: 'nosub',                                                                                               // 583
          id: msg.id,                                                                                                 // 583
          error: new Meteor.Error(404, "Subscription '" + msg.name + "' not found")                                   // 584
        });                                                                                                           // 582
        return;                                                                                                       // 585
      }                                                                                                               // 586
                                                                                                                      //
      if (_.has(self._namedSubs, msg.id)) // subs are idempotent, or rather, they are ignored if a sub                // 588
        // with that id already exists. this is important during                                                      // 590
        // reconnect.                                                                                                 // 591
        return; // XXX It'd be much better if we had generic hooks where any package can                              // 592
      // hook into subscription handling, but in the mean while we special case                                       // 595
      // ddp-rate-limiter package. This is also done for weak requirements to                                         // 596
      // add the ddp-rate-limiter package in case we don't have Accounts. A                                           // 597
      // user trying to use the ddp-rate-limiter must explicitly require it.                                          // 598
                                                                                                                      //
      if (Package['ddp-rate-limiter']) {                                                                              // 599
        var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;                                              // 600
        var rateLimiterInput = {                                                                                      // 601
          userId: self.userId,                                                                                        // 602
          clientAddress: self.connectionHandle.clientAddress,                                                         // 603
          type: "subscription",                                                                                       // 604
          name: msg.name,                                                                                             // 605
          connectionId: self.id                                                                                       // 606
        };                                                                                                            // 601
                                                                                                                      //
        DDPRateLimiter._increment(rateLimiterInput);                                                                  // 609
                                                                                                                      //
        var rateLimitResult = DDPRateLimiter._check(rateLimiterInput);                                                // 610
                                                                                                                      //
        if (!rateLimitResult.allowed) {                                                                               // 611
          self.send({                                                                                                 // 612
            msg: 'nosub',                                                                                             // 613
            id: msg.id,                                                                                               // 613
            error: new Meteor.Error('too-many-requests', DDPRateLimiter.getErrorMessage(rateLimitResult), {           // 614
              timeToReset: rateLimitResult.timeToReset                                                                // 617
            })                                                                                                        // 617
          });                                                                                                         // 612
          return;                                                                                                     // 619
        }                                                                                                             // 620
      }                                                                                                               // 621
                                                                                                                      //
      var handler = self.server.publish_handlers[msg.name];                                                           // 623
                                                                                                                      //
      self._startSubscription(handler, msg.id, msg.params, msg.name);                                                 // 625
    },                                                                                                                // 627
    unsub: function (msg) {                                                                                           // 629
      var self = this;                                                                                                // 630
                                                                                                                      //
      self._stopSubscription(msg.id);                                                                                 // 632
    },                                                                                                                // 633
    method: function (msg, unblock) {                                                                                 // 635
      var self = this; // reject malformed messages                                                                   // 636
      // For now, we silently ignore unknown attributes,                                                              // 639
      // for forwards compatibility.                                                                                  // 640
                                                                                                                      //
      if (typeof msg.id !== "string" || typeof msg.method !== "string" || 'params' in msg && !(msg.params instanceof Array) || 'randomSeed' in msg && typeof msg.randomSeed !== "string") {
        self.sendError("Malformed method invocation", msg);                                                           // 645
        return;                                                                                                       // 646
      }                                                                                                               // 647
                                                                                                                      //
      var randomSeed = msg.randomSeed || null; // set up to mark the method as satisfied once all observers           // 649
      // (and subscriptions) have reacted to any writes that were                                                     // 652
      // done.                                                                                                        // 653
                                                                                                                      //
      var fence = new DDPServer._WriteFence();                                                                        // 654
      fence.onAllCommitted(function () {                                                                              // 655
        // Retire the fence so that future writes are allowed.                                                        // 656
        // This means that callbacks like timers are free to use                                                      // 657
        // the fence, and if they fire before it's armed (for                                                         // 658
        // example, because the method waits for them) their                                                          // 659
        // writes will be included in the fence.                                                                      // 660
        fence.retire();                                                                                               // 661
        self.send({                                                                                                   // 662
          msg: 'updated',                                                                                             // 663
          methods: [msg.id]                                                                                           // 663
        });                                                                                                           // 662
      }); // find the handler                                                                                         // 664
                                                                                                                      //
      var handler = self.server.method_handlers[msg.method];                                                          // 667
                                                                                                                      //
      if (!handler) {                                                                                                 // 668
        self.send({                                                                                                   // 669
          msg: 'result',                                                                                              // 670
          id: msg.id,                                                                                                 // 670
          error: new Meteor.Error(404, "Method '" + msg.method + "' not found")                                       // 671
        });                                                                                                           // 669
        fence.arm();                                                                                                  // 672
        return;                                                                                                       // 673
      }                                                                                                               // 674
                                                                                                                      //
      var setUserId = function (userId) {                                                                             // 676
        self._setUserId(userId);                                                                                      // 677
      };                                                                                                              // 678
                                                                                                                      //
      var invocation = new DDPCommon.MethodInvocation({                                                               // 680
        isSimulation: false,                                                                                          // 681
        userId: self.userId,                                                                                          // 682
        setUserId: setUserId,                                                                                         // 683
        unblock: unblock,                                                                                             // 684
        connection: self.connectionHandle,                                                                            // 685
        randomSeed: randomSeed                                                                                        // 686
      });                                                                                                             // 680
      var promise = new Promise(function (resolve, reject) {                                                          // 689
        // XXX It'd be better if we could hook into method handlers better but                                        // 690
        // for now, we need to check if the ddp-rate-limiter exists since we                                          // 691
        // have a weak requirement for the ddp-rate-limiter package to be added                                       // 692
        // to our application.                                                                                        // 693
        if (Package['ddp-rate-limiter']) {                                                                            // 694
          var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;                                            // 695
          var rateLimiterInput = {                                                                                    // 696
            userId: self.userId,                                                                                      // 697
            clientAddress: self.connectionHandle.clientAddress,                                                       // 698
            type: "method",                                                                                           // 699
            name: msg.method,                                                                                         // 700
            connectionId: self.id                                                                                     // 701
          };                                                                                                          // 696
                                                                                                                      //
          DDPRateLimiter._increment(rateLimiterInput);                                                                // 703
                                                                                                                      //
          var rateLimitResult = DDPRateLimiter._check(rateLimiterInput);                                              // 704
                                                                                                                      //
          if (!rateLimitResult.allowed) {                                                                             // 705
            reject(new Meteor.Error("too-many-requests", DDPRateLimiter.getErrorMessage(rateLimitResult), {           // 706
              timeToReset: rateLimitResult.timeToReset                                                                // 709
            }));                                                                                                      // 709
            return;                                                                                                   // 711
          }                                                                                                           // 712
        }                                                                                                             // 713
                                                                                                                      //
        resolve(DDPServer._CurrentWriteFence.withValue(fence, function () {                                           // 715
          return DDP._CurrentInvocation.withValue(invocation, function () {                                           // 717
            return maybeAuditArgumentChecks(handler, invocation, msg.params, "call to '" + msg.method + "'");         // 719
          });                                                                                                         // 719
        }));                                                                                                          // 717
      });                                                                                                             // 725
                                                                                                                      //
      function finish() {                                                                                             // 727
        fence.arm();                                                                                                  // 728
        unblock();                                                                                                    // 729
      }                                                                                                               // 730
                                                                                                                      //
      var payload = {                                                                                                 // 732
        msg: "result",                                                                                                // 733
        id: msg.id                                                                                                    // 734
      };                                                                                                              // 732
      promise.then(function (result) {                                                                                // 737
        finish();                                                                                                     // 738
                                                                                                                      //
        if (result !== undefined) {                                                                                   // 739
          payload.result = result;                                                                                    // 740
        }                                                                                                             // 741
                                                                                                                      //
        self.send(payload);                                                                                           // 742
      }, function (exception) {                                                                                       // 743
        finish();                                                                                                     // 744
        payload.error = wrapInternalException(exception, "while invoking method '" + msg.method + "'");               // 745
        self.send(payload);                                                                                           // 749
      });                                                                                                             // 750
    }                                                                                                                 // 751
  },                                                                                                                  // 569
  _eachSub: function (f) {                                                                                            // 754
    var self = this;                                                                                                  // 755
                                                                                                                      //
    _.each(self._namedSubs, f);                                                                                       // 756
                                                                                                                      //
    _.each(self._universalSubs, f);                                                                                   // 757
  },                                                                                                                  // 758
  _diffCollectionViews: function (beforeCVs) {                                                                        // 760
    var self = this;                                                                                                  // 761
    DiffSequence.diffObjects(beforeCVs, self.collectionViews, {                                                       // 762
      both: function (collectionName, leftValue, rightValue) {                                                        // 763
        rightValue.diff(leftValue);                                                                                   // 764
      },                                                                                                              // 765
      rightOnly: function (collectionName, rightValue) {                                                              // 766
        _.each(rightValue.documents, function (docView, id) {                                                         // 767
          self.sendAdded(collectionName, id, docView.getFields());                                                    // 768
        });                                                                                                           // 769
      },                                                                                                              // 770
      leftOnly: function (collectionName, leftValue) {                                                                // 771
        _.each(leftValue.documents, function (doc, id) {                                                              // 772
          self.sendRemoved(collectionName, id);                                                                       // 773
        });                                                                                                           // 774
      }                                                                                                               // 775
    });                                                                                                               // 762
  },                                                                                                                  // 777
  // Sets the current user id in all appropriate contexts and reruns                                                  // 779
  // all subscriptions                                                                                                // 780
  _setUserId: function (userId) {                                                                                     // 781
    var self = this;                                                                                                  // 782
    if (userId !== null && typeof userId !== "string") throw new Error("setUserId must be called on string or null, not " + (typeof userId === "undefined" ? "undefined" : (0, _typeof3.default)(userId))); // Prevent newly-created universal subscriptions from being added to our
    // session; they will be found below when we call startUniversalSubs.                                             // 789
    //                                                                                                                // 790
    // (We don't have to worry about named subscriptions, because we only add                                         // 791
    // them when we process a 'sub' message. We are currently processing a                                            // 792
    // 'method' message, and the method did not unblock, because it is illegal                                        // 793
    // to call setUserId after unblock. Thus we cannot be concurrently adding a                                       // 794
    // new named subscription.)                                                                                       // 795
                                                                                                                      //
    self._dontStartNewUniversalSubs = true; // Prevent current subs from updating our collectionViews and call their  // 796
    // stop callbacks. This may yield.                                                                                // 799
                                                                                                                      //
    self._eachSub(function (sub) {                                                                                    // 800
      sub._deactivate();                                                                                              // 801
    }); // All subs should now be deactivated. Stop sending messages to the client,                                   // 802
    // save the state of the published collections, reset to an empty view, and                                       // 805
    // update the userId.                                                                                             // 806
                                                                                                                      //
                                                                                                                      //
    self._isSending = false;                                                                                          // 807
    var beforeCVs = self.collectionViews;                                                                             // 808
    self.collectionViews = {};                                                                                        // 809
    self.userId = userId; // Save the old named subs, and reset to having no subscriptions.                           // 810
                                                                                                                      //
    var oldNamedSubs = self._namedSubs;                                                                               // 813
    self._namedSubs = {};                                                                                             // 814
    self._universalSubs = [];                                                                                         // 815
                                                                                                                      //
    _.each(oldNamedSubs, function (sub, subscriptionId) {                                                             // 817
      self._namedSubs[subscriptionId] = sub._recreate(); // nb: if the handler throws or calls this.error(), it will in fact
      // immediately send its 'nosub'. This is OK, though.                                                            // 820
                                                                                                                      //
      self._namedSubs[subscriptionId]._runHandler();                                                                  // 821
    }); // Allow newly-created universal subs to be started on our connection in                                      // 822
    // parallel with the ones we're spinning up here, and spin up universal                                           // 825
    // subs.                                                                                                          // 826
                                                                                                                      //
                                                                                                                      //
    self._dontStartNewUniversalSubs = false;                                                                          // 827
    self.startUniversalSubs(); // Start sending messages again, beginning with the diff from the previous             // 828
    // state of the world to the current state. No yields are allowed during                                          // 831
    // this diff, so that other changes cannot interleave.                                                            // 832
                                                                                                                      //
    Meteor._noYieldsAllowed(function () {                                                                             // 833
      self._isSending = true;                                                                                         // 834
                                                                                                                      //
      self._diffCollectionViews(beforeCVs);                                                                           // 835
                                                                                                                      //
      if (!_.isEmpty(self._pendingReady)) {                                                                           // 836
        self.sendReady(self._pendingReady);                                                                           // 837
        self._pendingReady = [];                                                                                      // 838
      }                                                                                                               // 839
    });                                                                                                               // 840
  },                                                                                                                  // 841
  _startSubscription: function (handler, subId, params, name) {                                                       // 843
    var self = this;                                                                                                  // 844
    var sub = new Subscription(self, handler, subId, params, name);                                                   // 846
    if (subId) self._namedSubs[subId] = sub;else self._universalSubs.push(sub);                                       // 848
                                                                                                                      //
    sub._runHandler();                                                                                                // 853
  },                                                                                                                  // 854
  // tear down specified subscription                                                                                 // 856
  _stopSubscription: function (subId, error) {                                                                        // 857
    var self = this;                                                                                                  // 858
    var subName = null;                                                                                               // 860
                                                                                                                      //
    if (subId && self._namedSubs[subId]) {                                                                            // 862
      subName = self._namedSubs[subId]._name;                                                                         // 863
                                                                                                                      //
      self._namedSubs[subId]._removeAllDocuments();                                                                   // 864
                                                                                                                      //
      self._namedSubs[subId]._deactivate();                                                                           // 865
                                                                                                                      //
      delete self._namedSubs[subId];                                                                                  // 866
    }                                                                                                                 // 867
                                                                                                                      //
    var response = {                                                                                                  // 869
      msg: 'nosub',                                                                                                   // 869
      id: subId                                                                                                       // 869
    };                                                                                                                // 869
                                                                                                                      //
    if (error) {                                                                                                      // 871
      response.error = wrapInternalException(error, subName ? "from sub " + subName + " id " + subId : "from sub id " + subId);
    }                                                                                                                 // 876
                                                                                                                      //
    self.send(response);                                                                                              // 878
  },                                                                                                                  // 879
  // tear down all subscriptions. Note that this does NOT send removed or nosub                                       // 881
  // messages, since we assume the client is gone.                                                                    // 882
  _deactivateAllSubscriptions: function () {                                                                          // 883
    var self = this;                                                                                                  // 884
                                                                                                                      //
    _.each(self._namedSubs, function (sub, id) {                                                                      // 886
      sub._deactivate();                                                                                              // 887
    });                                                                                                               // 888
                                                                                                                      //
    self._namedSubs = {};                                                                                             // 889
                                                                                                                      //
    _.each(self._universalSubs, function (sub) {                                                                      // 891
      sub._deactivate();                                                                                              // 892
    });                                                                                                               // 893
                                                                                                                      //
    self._universalSubs = [];                                                                                         // 894
  },                                                                                                                  // 895
  // Determine the remote client's IP address, based on the                                                           // 897
  // HTTP_FORWARDED_COUNT environment variable representing how many                                                  // 898
  // proxies the server is behind.                                                                                    // 899
  _clientAddress: function () {                                                                                       // 900
    var self = this; // For the reported client address for a connection to be correct,                               // 901
    // the developer must set the HTTP_FORWARDED_COUNT environment                                                    // 904
    // variable to an integer representing the number of hops they                                                    // 905
    // expect in the `x-forwarded-for` header. E.g., set to "1" if the                                                // 906
    // server is behind one proxy.                                                                                    // 907
    //                                                                                                                // 908
    // This could be computed once at startup instead of every time.                                                  // 909
                                                                                                                      //
    var httpForwardedCount = parseInt(process.env['HTTP_FORWARDED_COUNT']) || 0;                                      // 910
    if (httpForwardedCount === 0) return self.socket.remoteAddress;                                                   // 912
    var forwardedFor = self.socket.headers["x-forwarded-for"];                                                        // 915
    if (!_.isString(forwardedFor)) return null;                                                                       // 916
    forwardedFor = forwardedFor.trim().split(/\s*,\s*/); // Typically the first value in the `x-forwarded-for` header is
    // the original IP address of the client connecting to the first                                                  // 921
    // proxy.  However, the end user can easily spoof the header, in                                                  // 922
    // which case the first value(s) will be the fake IP address from                                                 // 923
    // the user pretending to be a proxy reporting the original IP                                                    // 924
    // address value.  By counting HTTP_FORWARDED_COUNT back from the                                                 // 925
    // end of the list, we ensure that we get the IP address being                                                    // 926
    // reported by *our* first proxy.                                                                                 // 927
                                                                                                                      //
    if (httpForwardedCount < 0 || httpForwardedCount > forwardedFor.length) return null;                              // 929
    return forwardedFor[forwardedFor.length - httpForwardedCount];                                                    // 932
  }                                                                                                                   // 933
}); /******************************************************************************/ /* Subscription                                                               */ /******************************************************************************/ // ctor for a sub handle: the input to each publish function
// Instance name is this because it's usually referred to as this inside a                                            // 942
// publish                                                                                                            // 943
/**                                                                                                                   // 944
 * @summary The server's side of a subscription                                                                       //
 * @class Subscription                                                                                                //
 * @instanceName this                                                                                                 //
 * @showInstanceName true                                                                                             //
 */                                                                                                                   //
                                                                                                                      //
var Subscription = function (session, handler, subscriptionId, params, name) {                                        // 950
  var self = this;                                                                                                    // 952
  self._session = session; // type is Session                                                                         // 953
  /**                                                                                                                 // 955
   * @summary Access inside the publish function. The incoming [connection](#meteor_onconnection) for this subscription.
   * @locus Server                                                                                                    //
   * @name  connection                                                                                                //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   */                                                                                                                 //
  self.connection = session.connectionHandle; // public API object                                                    // 962
                                                                                                                      //
  self._handler = handler; // my subscription ID (generated by client, undefined for universal subs).                 // 964
                                                                                                                      //
  self._subscriptionId = subscriptionId; // undefined for universal subs                                              // 967
                                                                                                                      //
  self._name = name;                                                                                                  // 969
  self._params = params || []; // Only named subscriptions have IDs, but we need some sort of string                  // 971
  // internally to keep track of all subscriptions inside                                                             // 974
  // SessionDocumentViews. We use this subscriptionHandle for that.                                                   // 975
                                                                                                                      //
  if (self._subscriptionId) {                                                                                         // 976
    self._subscriptionHandle = 'N' + self._subscriptionId;                                                            // 977
  } else {                                                                                                            // 978
    self._subscriptionHandle = 'U' + Random.id();                                                                     // 979
  } // has _deactivate been called?                                                                                   // 980
                                                                                                                      //
                                                                                                                      //
  self._deactivated = false; // stop callbacks to g/c this sub.  called w/ zero arguments.                            // 983
                                                                                                                      //
  self._stopCallbacks = []; // the set of (collection, documentid) that this subscription has                         // 986
  // an opinion about                                                                                                 // 989
                                                                                                                      //
  self._documents = {}; // remember if we are ready.                                                                  // 990
                                                                                                                      //
  self._ready = false; // Part of the public API: the user of this sub.                                               // 993
  /**                                                                                                                 // 997
   * @summary Access inside the publish function. The id of the logged-in user, or `null` if no user is logged in.    //
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @name  userId                                                                                                    //
   * @instance                                                                                                        //
   */                                                                                                                 //
  self.userId = session.userId; // For now, the id filter is going to default to                                      // 1004
  // the to/from DDP methods on MongoID, to                                                                           // 1007
  // specifically deal with mongo/minimongo ObjectIds.                                                                // 1008
  // Later, you will be able to make this be "raw"                                                                    // 1010
  // if you want to publish a collection that you know                                                                // 1011
  // just has strings for keys and no funny business, to                                                              // 1012
  // a ddp consumer that isn't minimongo                                                                              // 1013
                                                                                                                      //
  self._idFilter = {                                                                                                  // 1015
    idStringify: MongoID.idStringify,                                                                                 // 1016
    idParse: MongoID.idParse                                                                                          // 1017
  };                                                                                                                  // 1015
  Package.facts && Package.facts.Facts.incrementServerFact("livedata", "subscriptions", 1);                           // 1020
};                                                                                                                    // 1022
                                                                                                                      //
_.extend(Subscription.prototype, {                                                                                    // 1024
  _runHandler: function () {                                                                                          // 1025
    // XXX should we unblock() here? Either before running the publish                                                // 1026
    // function, or before running _publishCursor.                                                                    // 1027
    //                                                                                                                // 1028
    // Right now, each publish function blocks all future publishes and                                               // 1029
    // methods waiting on data from Mongo (or whatever else the function                                              // 1030
    // blocks on). This probably slows page load in common cases.                                                     // 1031
    var self = this;                                                                                                  // 1033
                                                                                                                      //
    try {                                                                                                             // 1034
      var res = maybeAuditArgumentChecks(self._handler, self, EJSON.clone(self._params), // It's OK that this would look weird for universal subscriptions,
      // because they have no arguments so there can never be an                                                      // 1038
      // audit-argument-checks failure.                                                                               // 1039
      "publisher '" + self._name + "'");                                                                              // 1040
    } catch (e) {                                                                                                     // 1041
      self.error(e);                                                                                                  // 1042
      return;                                                                                                         // 1043
    } // Did the handler call this.error or this.stop?                                                                // 1044
                                                                                                                      //
                                                                                                                      //
    if (self._isDeactivated()) return;                                                                                // 1047
                                                                                                                      //
    self._publishHandlerResult(res);                                                                                  // 1050
  },                                                                                                                  // 1051
  _publishHandlerResult: function (res) {                                                                             // 1053
    // SPECIAL CASE: Instead of writing their own callbacks that invoke                                               // 1054
    // this.added/changed/ready/etc, the user can just return a collection                                            // 1055
    // cursor or array of cursors from the publish function; we call their                                            // 1056
    // _publishCursor method which starts observing the cursor and publishes the                                      // 1057
    // results. Note that _publishCursor does NOT call ready().                                                       // 1058
    //                                                                                                                // 1059
    // XXX This uses an undocumented interface which only the Mongo cursor                                            // 1060
    // interface publishes. Should we make this interface public and encourage                                        // 1061
    // users to implement it themselves? Arguably, it's unnecessary; users can                                        // 1062
    // already write their own functions like                                                                         // 1063
    //   var publishMyReactiveThingy = function (name, handler) {                                                     // 1064
    //     Meteor.publish(name, function () {                                                                         // 1065
    //       var reactiveThingy = handler();                                                                          // 1066
    //       reactiveThingy.publishMe();                                                                              // 1067
    //     });                                                                                                        // 1068
    //   };                                                                                                           // 1069
    var self = this;                                                                                                  // 1071
                                                                                                                      //
    var isCursor = function (c) {                                                                                     // 1072
      return c && c._publishCursor;                                                                                   // 1073
    };                                                                                                                // 1074
                                                                                                                      //
    if (isCursor(res)) {                                                                                              // 1075
      try {                                                                                                           // 1076
        res._publishCursor(self);                                                                                     // 1077
      } catch (e) {                                                                                                   // 1078
        self.error(e);                                                                                                // 1079
        return;                                                                                                       // 1080
      } // _publishCursor only returns after the initial added callbacks have run.                                    // 1081
      // mark subscription as ready.                                                                                  // 1083
                                                                                                                      //
                                                                                                                      //
      self.ready();                                                                                                   // 1084
    } else if (_.isArray(res)) {                                                                                      // 1085
      // check all the elements are cursors                                                                           // 1086
      if (!_.all(res, isCursor)) {                                                                                    // 1087
        self.error(new Error("Publish function returned an array of non-Cursors"));                                   // 1088
        return;                                                                                                       // 1089
      } // find duplicate collection names                                                                            // 1090
      // XXX we should support overlapping cursors, but that would require the                                        // 1092
      // merge box to allow overlap within a subscription                                                             // 1093
                                                                                                                      //
                                                                                                                      //
      var collectionNames = {};                                                                                       // 1094
                                                                                                                      //
      for (var i = 0; i < res.length; ++i) {                                                                          // 1095
        var collectionName = res[i]._getCollectionName();                                                             // 1096
                                                                                                                      //
        if (_.has(collectionNames, collectionName)) {                                                                 // 1097
          self.error(new Error("Publish function returned multiple cursors for collection " + collectionName));       // 1098
          return;                                                                                                     // 1101
        }                                                                                                             // 1102
                                                                                                                      //
        collectionNames[collectionName] = true;                                                                       // 1103
      }                                                                                                               // 1104
                                                                                                                      //
      ;                                                                                                               // 1104
                                                                                                                      //
      try {                                                                                                           // 1106
        _.each(res, function (cur) {                                                                                  // 1107
          cur._publishCursor(self);                                                                                   // 1108
        });                                                                                                           // 1109
      } catch (e) {                                                                                                   // 1110
        self.error(e);                                                                                                // 1111
        return;                                                                                                       // 1112
      }                                                                                                               // 1113
                                                                                                                      //
      self.ready();                                                                                                   // 1114
    } else if (res) {                                                                                                 // 1115
      // truthy values other than cursors or arrays are probably a                                                    // 1116
      // user mistake (possible returning a Mongo document via, say,                                                  // 1117
      // `coll.findOne()`).                                                                                           // 1118
      self.error(new Error("Publish function can only return a Cursor or " + "an array of Cursors"));                 // 1119
    }                                                                                                                 // 1121
  },                                                                                                                  // 1122
  // This calls all stop callbacks and prevents the handler from updating any                                         // 1124
  // SessionCollectionViews further. It's used when the user unsubscribes or                                          // 1125
  // disconnects, as well as during setUserId re-runs. It does *NOT* send                                             // 1126
  // removed messages for the published objects; if that is necessary, call                                           // 1127
  // _removeAllDocuments first.                                                                                       // 1128
  _deactivate: function () {                                                                                          // 1129
    var self = this;                                                                                                  // 1130
    if (self._deactivated) return;                                                                                    // 1131
    self._deactivated = true;                                                                                         // 1133
                                                                                                                      //
    self._callStopCallbacks();                                                                                        // 1134
                                                                                                                      //
    Package.facts && Package.facts.Facts.incrementServerFact("livedata", "subscriptions", -1);                        // 1135
  },                                                                                                                  // 1137
  _callStopCallbacks: function () {                                                                                   // 1139
    var self = this; // tell listeners, so they can clean up                                                          // 1140
                                                                                                                      //
    var callbacks = self._stopCallbacks;                                                                              // 1142
    self._stopCallbacks = [];                                                                                         // 1143
                                                                                                                      //
    _.each(callbacks, function (callback) {                                                                           // 1144
      callback();                                                                                                     // 1145
    });                                                                                                               // 1146
  },                                                                                                                  // 1147
  // Send remove messages for every document.                                                                         // 1149
  _removeAllDocuments: function () {                                                                                  // 1150
    var self = this;                                                                                                  // 1151
                                                                                                                      //
    Meteor._noYieldsAllowed(function () {                                                                             // 1152
      _.each(self._documents, function (collectionDocs, collectionName) {                                             // 1153
        // Iterate over _.keys instead of the dictionary itself, since we'll be                                       // 1154
        // mutating it.                                                                                               // 1155
        _.each(_.keys(collectionDocs), function (strId) {                                                             // 1156
          self.removed(collectionName, self._idFilter.idParse(strId));                                                // 1157
        });                                                                                                           // 1158
      });                                                                                                             // 1159
    });                                                                                                               // 1160
  },                                                                                                                  // 1161
  // Returns a new Subscription for the same session with the same                                                    // 1163
  // initial creation parameters. This isn't a clone: it doesn't have                                                 // 1164
  // the same _documents cache, stopped state or callbacks; may have a                                                // 1165
  // different _subscriptionHandle, and gets its userId from the                                                      // 1166
  // session, not from this object.                                                                                   // 1167
  _recreate: function () {                                                                                            // 1168
    var self = this;                                                                                                  // 1169
    return new Subscription(self._session, self._handler, self._subscriptionId, self._params, self._name);            // 1170
  },                                                                                                                  // 1173
  /**                                                                                                                 // 1175
   * @summary Call inside the publish function.  Stops this client's subscription, triggering a call on the client to the `onStop` callback passed to [`Meteor.subscribe`](#meteor_subscribe), if any. If `error` is not a [`Meteor.Error`](#meteor_error), it will be [sanitized](#meteor_error).
   * @locus Server                                                                                                    //
   * @param {Error} error The error to pass to the client.                                                            //
   * @instance                                                                                                        //
   * @memberOf Subscription                                                                                           //
   */error: function (error) {                                                                                        //
    var self = this;                                                                                                  // 1183
    if (self._isDeactivated()) return;                                                                                // 1184
                                                                                                                      //
    self._session._stopSubscription(self._subscriptionId, error);                                                     // 1186
  },                                                                                                                  // 1187
  // Note that while our DDP client will notice that you've called stop() on the                                      // 1189
  // server (and clean up its _subscriptions table) we don't actually provide a                                       // 1190
  // mechanism for an app to notice this (the subscribe onError callback only                                         // 1191
  // triggers if there is an error).                                                                                  // 1192
  /**                                                                                                                 // 1194
   * @summary Call inside the publish function.  Stops this client's subscription and invokes the client's `onStop` callback with no error.
   * @locus Server                                                                                                    //
   * @instance                                                                                                        //
   * @memberOf Subscription                                                                                           //
   */stop: function () {                                                                                              //
    var self = this;                                                                                                  // 1201
    if (self._isDeactivated()) return;                                                                                // 1202
                                                                                                                      //
    self._session._stopSubscription(self._subscriptionId);                                                            // 1204
  },                                                                                                                  // 1205
  /**                                                                                                                 // 1207
   * @summary Call inside the publish function.  Registers a callback function to run when the subscription is stopped.
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   * @param {Function} func The callback function                                                                     //
   */onStop: function (callback) {                                                                                    //
    var self = this;                                                                                                  // 1215
    if (self._isDeactivated()) callback();else self._stopCallbacks.push(callback);                                    // 1216
  },                                                                                                                  // 1220
  // This returns true if the sub has been deactivated, *OR* if the session was                                       // 1222
  // destroyed but the deferred call to _deactivateAllSubscriptions hasn't                                            // 1223
  // happened yet.                                                                                                    // 1224
  _isDeactivated: function () {                                                                                       // 1225
    var self = this;                                                                                                  // 1226
    return self._deactivated || self._session.inQueue === null;                                                       // 1227
  },                                                                                                                  // 1228
  /**                                                                                                                 // 1230
   * @summary Call inside the publish function.  Informs the subscriber that a document has been added to the record set.
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   * @param {String} collection The name of the collection that contains the new document.                            //
   * @param {String} id The new document's ID.                                                                        //
   * @param {Object} fields The fields in the new document.  If `_id` is present it is ignored.                       //
   */added: function (collectionName, id, fields) {                                                                   //
    var self = this;                                                                                                  // 1240
    if (self._isDeactivated()) return;                                                                                // 1241
    id = self._idFilter.idStringify(id);                                                                              // 1243
    Meteor._ensure(self._documents, collectionName)[id] = true;                                                       // 1244
                                                                                                                      //
    self._session.added(self._subscriptionHandle, collectionName, id, fields);                                        // 1245
  },                                                                                                                  // 1246
  /**                                                                                                                 // 1248
   * @summary Call inside the publish function.  Informs the subscriber that a document in the record set has been modified.
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   * @param {String} collection The name of the collection that contains the changed document.                        //
   * @param {String} id The changed document's ID.                                                                    //
   * @param {Object} fields The fields in the document that have changed, together with their new values.  If a field is not present in `fields` it was left unchanged; if it is present in `fields` and has a value of `undefined` it was removed from the document.  If `_id` is present it is ignored.
   */changed: function (collectionName, id, fields) {                                                                 //
    var self = this;                                                                                                  // 1258
    if (self._isDeactivated()) return;                                                                                // 1259
    id = self._idFilter.idStringify(id);                                                                              // 1261
                                                                                                                      //
    self._session.changed(self._subscriptionHandle, collectionName, id, fields);                                      // 1262
  },                                                                                                                  // 1263
  /**                                                                                                                 // 1265
   * @summary Call inside the publish function.  Informs the subscriber that a document has been removed from the record set.
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   * @param {String} collection The name of the collection that the document has been removed from.                   //
   * @param {String} id The ID of the document that has been removed.                                                 //
   */removed: function (collectionName, id) {                                                                         //
    var self = this;                                                                                                  // 1274
    if (self._isDeactivated()) return;                                                                                // 1275
    id = self._idFilter.idStringify(id); // We don't bother to delete sets of things in a collection if the           // 1277
    // collection is empty.  It could break _removeAllDocuments.                                                      // 1279
                                                                                                                      //
    delete self._documents[collectionName][id];                                                                       // 1280
                                                                                                                      //
    self._session.removed(self._subscriptionHandle, collectionName, id);                                              // 1281
  },                                                                                                                  // 1282
  /**                                                                                                                 // 1284
   * @summary Call inside the publish function.  Informs the subscriber that an initial, complete snapshot of the record set has been sent.  This will trigger a call on the client to the `onReady` callback passed to  [`Meteor.subscribe`](#meteor_subscribe), if any.
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   */ready: function () {                                                                                             //
    var self = this;                                                                                                  // 1291
    if (self._isDeactivated()) return;                                                                                // 1292
    if (!self._subscriptionId) return; // unnecessary but ignored for universal sub                                   // 1294
                                                                                                                      //
    if (!self._ready) {                                                                                               // 1296
      self._session.sendReady([self._subscriptionId]);                                                                // 1297
                                                                                                                      //
      self._ready = true;                                                                                             // 1298
    }                                                                                                                 // 1299
  }                                                                                                                   // 1300
}); /******************************************************************************/ /* Server                                                                     */ /******************************************************************************/
                                                                                                                      //
Server = function (options) {                                                                                         // 1307
  var self = this; // The default heartbeat interval is 30 seconds on the server and 35                               // 1308
  // seconds on the client.  Since the client doesn't need to send a                                                  // 1311
  // ping as long as it is receiving pings, this means that pings                                                     // 1312
  // normally go from the server to the client.                                                                       // 1313
  //                                                                                                                  // 1314
  // Note: Troposphere depends on the ability to mutate                                                               // 1315
  // Meteor.server.options.heartbeatTimeout! This is a hack, but it's life.                                           // 1316
                                                                                                                      //
  self.options = _.defaults(options || {}, {                                                                          // 1317
    heartbeatInterval: 15000,                                                                                         // 1318
    heartbeatTimeout: 15000,                                                                                          // 1319
    // For testing, allow responding to pings to be disabled.                                                         // 1320
    respondToPings: true                                                                                              // 1321
  }); // Map of callbacks to call when a new connection comes in to the                                               // 1317
  // server and completes DDP version negotiation. Use an object instead                                              // 1325
  // of an array so we can safely remove one from the list while                                                      // 1326
  // iterating over it.                                                                                               // 1327
                                                                                                                      //
  self.onConnectionHook = new Hook({                                                                                  // 1328
    debugPrintExceptions: "onConnection callback"                                                                     // 1329
  }); // Map of callbacks to call when a new message comes in.                                                        // 1328
                                                                                                                      //
  self.onMessageHook = new Hook({                                                                                     // 1333
    debugPrintExceptions: "onMessage callback"                                                                        // 1334
  });                                                                                                                 // 1333
  self.publish_handlers = {};                                                                                         // 1337
  self.universal_publish_handlers = [];                                                                               // 1338
  self.method_handlers = {};                                                                                          // 1340
  self.sessions = {}; // map from id to session                                                                       // 1342
                                                                                                                      //
  self.stream_server = new StreamServer();                                                                            // 1344
  self.stream_server.register(function (socket) {                                                                     // 1346
    // socket implements the SockJSConnection interface                                                               // 1347
    socket._meteorSession = null;                                                                                     // 1348
                                                                                                                      //
    var sendError = function (reason, offendingMessage) {                                                             // 1350
      var msg = {                                                                                                     // 1351
        msg: 'error',                                                                                                 // 1351
        reason: reason                                                                                                // 1351
      };                                                                                                              // 1351
      if (offendingMessage) msg.offendingMessage = offendingMessage;                                                  // 1352
      socket.send(DDPCommon.stringifyDDP(msg));                                                                       // 1354
    };                                                                                                                // 1355
                                                                                                                      //
    socket.on('data', function (raw_msg) {                                                                            // 1357
      if (Meteor._printReceivedDDP) {                                                                                 // 1358
        Meteor._debug("Received DDP", raw_msg);                                                                       // 1359
      }                                                                                                               // 1360
                                                                                                                      //
      try {                                                                                                           // 1361
        try {                                                                                                         // 1362
          var msg = DDPCommon.parseDDP(raw_msg);                                                                      // 1363
        } catch (err) {                                                                                               // 1364
          sendError('Parse error');                                                                                   // 1365
          return;                                                                                                     // 1366
        }                                                                                                             // 1367
                                                                                                                      //
        if (msg === null || !msg.msg) {                                                                               // 1368
          sendError('Bad request', msg);                                                                              // 1369
          return;                                                                                                     // 1370
        }                                                                                                             // 1371
                                                                                                                      //
        if (msg.msg === 'connect') {                                                                                  // 1373
          if (socket._meteorSession) {                                                                                // 1374
            sendError("Already connected", msg);                                                                      // 1375
            return;                                                                                                   // 1376
          }                                                                                                           // 1377
                                                                                                                      //
          Fiber(function () {                                                                                         // 1378
            self._handleConnect(socket, msg);                                                                         // 1379
          }).run();                                                                                                   // 1380
          return;                                                                                                     // 1381
        }                                                                                                             // 1382
                                                                                                                      //
        if (!socket._meteorSession) {                                                                                 // 1384
          sendError('Must connect first', msg);                                                                       // 1385
          return;                                                                                                     // 1386
        }                                                                                                             // 1387
                                                                                                                      //
        socket._meteorSession.processMessage(msg);                                                                    // 1388
      } catch (e) {                                                                                                   // 1389
        // XXX print stack nicely                                                                                     // 1390
        Meteor._debug("Internal exception while processing message", msg, e.message, e.stack);                        // 1391
      }                                                                                                               // 1393
    });                                                                                                               // 1394
    socket.on('close', function () {                                                                                  // 1396
      if (socket._meteorSession) {                                                                                    // 1397
        Fiber(function () {                                                                                           // 1398
          socket._meteorSession.close();                                                                              // 1399
        }).run();                                                                                                     // 1400
      }                                                                                                               // 1401
    });                                                                                                               // 1402
  });                                                                                                                 // 1403
};                                                                                                                    // 1404
                                                                                                                      //
_.extend(Server.prototype, {                                                                                          // 1406
  /**                                                                                                                 // 1408
   * @summary Register a callback to be called when a new DDP connection is made to the server.                       //
   * @locus Server                                                                                                    //
   * @param {function} callback The function to call when a new DDP connection is established.                        //
   * @memberOf Meteor                                                                                                 //
   * @importFromPackage meteor                                                                                        //
   */onConnection: function (fn) {                                                                                    //
    var self = this;                                                                                                  // 1416
    return self.onConnectionHook.register(fn);                                                                        // 1417
  },                                                                                                                  // 1418
  /**                                                                                                                 // 1420
   * @summary Register a callback to be called when a new DDP message is received.                                    //
   * @locus Server                                                                                                    //
   * @param {function} callback The function to call when a new DDP message is received.                              //
   * @memberOf Meteor                                                                                                 //
   * @importFromPackage meteor                                                                                        //
   */onMessage: function (fn) {                                                                                       //
    var self = this;                                                                                                  // 1428
    return self.onMessageHook.register(fn);                                                                           // 1429
  },                                                                                                                  // 1430
  _handleConnect: function (socket, msg) {                                                                            // 1432
    var self = this; // The connect message must specify a version and an array of supported                          // 1433
    // versions, and it must claim to support what it is proposing.                                                   // 1436
                                                                                                                      //
    if (!(typeof msg.version === 'string' && _.isArray(msg.support) && _.all(msg.support, _.isString) && _.contains(msg.support, msg.version))) {
      socket.send(DDPCommon.stringifyDDP({                                                                            // 1441
        msg: 'failed',                                                                                                // 1441
        version: DDPCommon.SUPPORTED_DDP_VERSIONS[0]                                                                  // 1442
      }));                                                                                                            // 1441
      socket.close();                                                                                                 // 1443
      return;                                                                                                         // 1444
    } // In the future, handle session resumption: something like:                                                    // 1445
    //  socket._meteorSession = self.sessions[msg.session]                                                            // 1448
                                                                                                                      //
                                                                                                                      //
    var version = calculateVersion(msg.support, DDPCommon.SUPPORTED_DDP_VERSIONS);                                    // 1449
                                                                                                                      //
    if (msg.version !== version) {                                                                                    // 1451
      // The best version to use (according to the client's stated preferences)                                       // 1452
      // is not the one the client is trying to use. Inform them about the best                                       // 1453
      // version to use.                                                                                              // 1454
      socket.send(DDPCommon.stringifyDDP({                                                                            // 1455
        msg: 'failed',                                                                                                // 1455
        version: version                                                                                              // 1455
      }));                                                                                                            // 1455
      socket.close();                                                                                                 // 1456
      return;                                                                                                         // 1457
    } // Yay, version matches! Create a new session.                                                                  // 1458
    // Note: Troposphere depends on the ability to mutate                                                             // 1461
    // Meteor.server.options.heartbeatTimeout! This is a hack, but it's life.                                         // 1462
                                                                                                                      //
                                                                                                                      //
    socket._meteorSession = new Session(self, version, socket, self.options);                                         // 1463
    self.sessions[socket._meteorSession.id] = socket._meteorSession;                                                  // 1464
    self.onConnectionHook.each(function (callback) {                                                                  // 1465
      if (socket._meteorSession) callback(socket._meteorSession.connectionHandle);                                    // 1466
      return true;                                                                                                    // 1468
    });                                                                                                               // 1469
  },                                                                                                                  // 1470
  /**                                                                                                                 // 1471
   * Register a publish handler function.                                                                             //
   *                                                                                                                  //
   * @param name {String} identifier for query                                                                        //
   * @param handler {Function} publish handler                                                                        //
   * @param options {Object}                                                                                          //
   *                                                                                                                  //
   * Server will call handler function on each new subscription,                                                      //
   * either when receiving DDP sub message for a named subscription, or on                                            //
   * DDP connect for a universal subscription.                                                                        //
   *                                                                                                                  //
   * If name is null, this will be a subscription that is                                                             //
   * automatically established and permanently on for all connected                                                   //
   * client, instead of a subscription that can be turned on and off                                                  //
   * with subscribe().                                                                                                //
   *                                                                                                                  //
   * options to contain:                                                                                              //
   *  - (mostly internal) is_auto: true if generated automatically                                                    //
   *    from an autopublish hook. this is for cosmetic purposes only                                                  //
   *    (it lets us determine whether to print a warning suggesting                                                   //
   *    that you turn off autopublish.)                                                                               //
   */ /**                                                                                                             //
       * @summary Publish a record set.                                                                               //
       * @memberOf Meteor                                                                                             //
       * @importFromPackage meteor                                                                                    //
       * @locus Server                                                                                                //
       * @param {String|Object} name If String, name of the record set.  If Object, publications Dictionary of publish functions by name.  If `null`, the set has no name, and the record set is automatically sent to all connected clients.
       * @param {Function} func Function called on the server each time a client subscribes.  Inside the function, `this` is the publish handler object, described below.  If the client passed arguments to `subscribe`, the function is called with the same arguments.
       */publish: function (name, handler, options) {                                                                 //
    var self = this;                                                                                                  // 1503
                                                                                                                      //
    if (!_.isObject(name)) {                                                                                          // 1505
      options = options || {};                                                                                        // 1506
                                                                                                                      //
      if (name && name in self.publish_handlers) {                                                                    // 1508
        Meteor._debug("Ignoring duplicate publish named '" + name + "'");                                             // 1509
                                                                                                                      //
        return;                                                                                                       // 1510
      }                                                                                                               // 1511
                                                                                                                      //
      if (Package.autopublish && !options.is_auto) {                                                                  // 1513
        // They have autopublish on, yet they're trying to manually                                                   // 1514
        // picking stuff to publish. They probably should turn off                                                    // 1515
        // autopublish. (This check isn't perfect -- if you create a                                                  // 1516
        // publish before you turn on autopublish, it won't catch                                                     // 1517
        // it. But this will definitely handle the simple case where                                                  // 1518
        // you've added the autopublish package to your app, and are                                                  // 1519
        // calling publish from your app code.)                                                                       // 1520
        if (!self.warned_about_autopublish) {                                                                         // 1521
          self.warned_about_autopublish = true;                                                                       // 1522
                                                                                                                      //
          Meteor._debug("** You've set up some data subscriptions with Meteor.publish(), but\n" + "** you still have autopublish turned on. Because autopublish is still\n" + "** on, your Meteor.publish() calls won't have much effect. All data\n" + "** will still be sent to all clients.\n" + "**\n" + "** Turn off autopublish by removing the autopublish package:\n" + "**\n" + "**   $ meteor remove autopublish\n" + "**\n" + "** .. and make sure you have Meteor.publish() and Meteor.subscribe() calls\n" + "** for each collection that you want clients to see.\n");
        }                                                                                                             // 1535
      }                                                                                                               // 1536
                                                                                                                      //
      if (name) self.publish_handlers[name] = handler;else {                                                          // 1538
        self.universal_publish_handlers.push(handler); // Spin up the new publisher on any existing session too. Run each
        // session's subscription in a new Fiber, so that there's no change for                                       // 1543
        // self.sessions to change while we're running this loop.                                                     // 1544
                                                                                                                      //
        _.each(self.sessions, function (session) {                                                                    // 1545
          if (!session._dontStartNewUniversalSubs) {                                                                  // 1546
            Fiber(function () {                                                                                       // 1547
              session._startSubscription(handler);                                                                    // 1548
            }).run();                                                                                                 // 1549
          }                                                                                                           // 1550
        });                                                                                                           // 1551
      }                                                                                                               // 1552
    } else {                                                                                                          // 1553
      _.each(name, function (value, key) {                                                                            // 1555
        self.publish(key, value, {});                                                                                 // 1556
      });                                                                                                             // 1557
    }                                                                                                                 // 1558
  },                                                                                                                  // 1559
  _removeSession: function (session) {                                                                                // 1561
    var self = this;                                                                                                  // 1562
                                                                                                                      //
    if (self.sessions[session.id]) {                                                                                  // 1563
      delete self.sessions[session.id];                                                                               // 1564
    }                                                                                                                 // 1565
  },                                                                                                                  // 1566
  /**                                                                                                                 // 1568
   * @summary Defines functions that can be invoked over the network by clients.                                      //
   * @locus Anywhere                                                                                                  //
   * @param {Object} methods Dictionary whose keys are method names and values are functions.                         //
   * @memberOf Meteor                                                                                                 //
   * @importFromPackage meteor                                                                                        //
   */methods: function (methods) {                                                                                    //
    var self = this;                                                                                                  // 1576
                                                                                                                      //
    _.each(methods, function (func, name) {                                                                           // 1577
      if (typeof func !== 'function') throw new Error("Method '" + name + "' must be a function");                    // 1578
      if (self.method_handlers[name]) throw new Error("A method named '" + name + "' is already defined");            // 1580
      self.method_handlers[name] = func;                                                                              // 1582
    });                                                                                                               // 1583
  },                                                                                                                  // 1584
  call: function (name) {                                                                                             // 1586
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {         // 1586
      args[_key - 1] = arguments[_key];                                                                               // 1586
    }                                                                                                                 // 1586
                                                                                                                      //
    if (args.length && typeof args[args.length - 1] === "function") {                                                 // 1587
      // If it's a function, the last argument is the result callback, not                                            // 1588
      // a parameter to the remote method.                                                                            // 1589
      var callback = args.pop();                                                                                      // 1590
    }                                                                                                                 // 1591
                                                                                                                      //
    return this.apply(name, args, callback);                                                                          // 1593
  },                                                                                                                  // 1594
  // A version of the call method that always returns a Promise.                                                      // 1596
  callAsync: function (name) {                                                                                        // 1597
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {  // 1597
      args[_key2 - 1] = arguments[_key2];                                                                             // 1597
    }                                                                                                                 // 1597
                                                                                                                      //
    return this.applyAsync(name, args);                                                                               // 1598
  },                                                                                                                  // 1599
  apply: function (name, args, options, callback) {                                                                   // 1601
    // We were passed 3 arguments. They may be either (name, args, options)                                           // 1602
    // or (name, args, callback)                                                                                      // 1603
    if (!callback && typeof options === 'function') {                                                                 // 1604
      callback = options;                                                                                             // 1605
      options = {};                                                                                                   // 1606
    } else {                                                                                                          // 1607
      options = options || {};                                                                                        // 1608
    }                                                                                                                 // 1609
                                                                                                                      //
    var promise = this.applyAsync(name, args, options); // Return the result in whichever way the caller asked for it. Note that we
    // do NOT block on the write fence in an analogous way to how the client                                          // 1614
    // blocks on the relevant data being visible, so you are NOT guaranteed that                                      // 1615
    // cursor observe callbacks have fired when your callback is invoked. (We                                         // 1616
    // can change this if there's a real use case.)                                                                   // 1617
                                                                                                                      //
    if (callback) {                                                                                                   // 1618
      promise.then(function (result) {                                                                                // 1619
        return callback(undefined, result);                                                                           // 1620
      }, function (exception) {                                                                                       // 1620
        return callback(exception);                                                                                   // 1621
      });                                                                                                             // 1621
    } else {                                                                                                          // 1623
      return promise.await();                                                                                         // 1624
    }                                                                                                                 // 1625
  },                                                                                                                  // 1626
  // @param options {Optional Object}                                                                                 // 1628
  applyAsync: function (name, args, options) {                                                                        // 1629
    // Run the handler                                                                                                // 1630
    var handler = this.method_handlers[name];                                                                         // 1631
                                                                                                                      //
    if (!handler) {                                                                                                   // 1632
      return Promise.reject(new Meteor.Error(404, "Method '" + name + "' not found"));                                // 1633
    } // If this is a method call from within another method, get the                                                 // 1636
    // user state from the outer method, otherwise don't allow                                                        // 1639
    // setUserId to be called                                                                                         // 1640
                                                                                                                      //
                                                                                                                      //
    var userId = null;                                                                                                // 1641
                                                                                                                      //
    var setUserId = function () {                                                                                     // 1642
      throw new Error("Can't call setUserId on a server initiated method call");                                      // 1643
    };                                                                                                                // 1644
                                                                                                                      //
    var connection = null;                                                                                            // 1645
                                                                                                                      //
    var currentInvocation = DDP._CurrentInvocation.get();                                                             // 1646
                                                                                                                      //
    if (currentInvocation) {                                                                                          // 1647
      userId = currentInvocation.userId;                                                                              // 1648
                                                                                                                      //
      setUserId = function (userId) {                                                                                 // 1649
        currentInvocation.setUserId(userId);                                                                          // 1650
      };                                                                                                              // 1651
                                                                                                                      //
      connection = currentInvocation.connection;                                                                      // 1652
    }                                                                                                                 // 1653
                                                                                                                      //
    var invocation = new DDPCommon.MethodInvocation({                                                                 // 1655
      isSimulation: false,                                                                                            // 1656
      userId: userId,                                                                                                 // 1657
      setUserId: setUserId,                                                                                           // 1658
      connection: connection,                                                                                         // 1659
      randomSeed: DDPCommon.makeRpcSeed(currentInvocation, name)                                                      // 1660
    });                                                                                                               // 1655
    return new Promise(function (resolve) {                                                                           // 1663
      return resolve(DDP._CurrentInvocation.withValue(invocation, function () {                                       // 1663
        return maybeAuditArgumentChecks(handler, invocation, EJSON.clone(args), "internal call to '" + name + "'");   // 1666
      }));                                                                                                            // 1666
    }).then(EJSON.clone);                                                                                             // 1663
  },                                                                                                                  // 1672
  _urlForSession: function (sessionId) {                                                                              // 1674
    var self = this;                                                                                                  // 1675
    var session = self.sessions[sessionId];                                                                           // 1676
    if (session) return session._socketUrl;else return null;                                                          // 1677
  }                                                                                                                   // 1681
});                                                                                                                   // 1406
                                                                                                                      //
var calculateVersion = function (clientSupportedVersions, serverSupportedVersions) {                                  // 1684
  var correctVersion = _.find(clientSupportedVersions, function (version) {                                           // 1686
    return _.contains(serverSupportedVersions, version);                                                              // 1687
  });                                                                                                                 // 1688
                                                                                                                      //
  if (!correctVersion) {                                                                                              // 1689
    correctVersion = serverSupportedVersions[0];                                                                      // 1690
  }                                                                                                                   // 1691
                                                                                                                      //
  return correctVersion;                                                                                              // 1692
};                                                                                                                    // 1693
                                                                                                                      //
DDPServer._calculateVersion = calculateVersion; // "blind" exceptions other than those that were deliberately thrown to signal
// errors to the client                                                                                               // 1699
                                                                                                                      //
var wrapInternalException = function (exception, context) {                                                           // 1700
  if (!exception || exception instanceof Meteor.Error) return exception; // tests can set the 'expected' flag on an exception so it won't go to the
  // server log                                                                                                       // 1705
                                                                                                                      //
  if (!exception.expected) {                                                                                          // 1706
    Meteor._debug("Exception " + context, exception.stack);                                                           // 1707
                                                                                                                      //
    if (exception.sanitizedError) {                                                                                   // 1708
      Meteor._debug("Sanitized and reported to the client as:", exception.sanitizedError.message);                    // 1709
                                                                                                                      //
      Meteor._debug();                                                                                                // 1710
    }                                                                                                                 // 1711
  } // Did the error contain more details that could have been useful if caught in                                    // 1712
  // server code (or if thrown from non-client-originated code), but also                                             // 1715
  // provided a "sanitized" version with more context than 500 Internal server                                        // 1716
  // error? Use that.                                                                                                 // 1717
                                                                                                                      //
                                                                                                                      //
  if (exception.sanitizedError) {                                                                                     // 1718
    if (exception.sanitizedError instanceof Meteor.Error) return exception.sanitizedError;                            // 1719
                                                                                                                      //
    Meteor._debug("Exception " + context + " provides a sanitizedError that " + "is not a Meteor.Error; ignoring");   // 1721
  }                                                                                                                   // 1723
                                                                                                                      //
  return new Meteor.Error(500, "Internal server error");                                                              // 1725
}; // Audit argument checks, if the audit-argument-checks package exists (it is a                                     // 1726
// weak dependency of this package).                                                                                  // 1730
                                                                                                                      //
                                                                                                                      //
var maybeAuditArgumentChecks = function (f, context, args, description) {                                             // 1731
  args = args || [];                                                                                                  // 1732
                                                                                                                      //
  if (Package['audit-argument-checks']) {                                                                             // 1733
    return Match._failIfArgumentsAreNotAllChecked(f, context, args, description);                                     // 1734
  }                                                                                                                   // 1736
                                                                                                                      //
  return f.apply(context, args);                                                                                      // 1737
};                                                                                                                    // 1738
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"writefence.js":function(require){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-server/writefence.js                                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var path = Npm.require('path');                                                                                       // 1
                                                                                                                      //
var Future = Npm.require(path.join('fibers', 'future')); // A write fence collects a group of writes, and provides a callback
// when all of the writes are fully committed and propagated (all                                                     // 5
// observers have been notified of the write and acknowledged it.)                                                    // 6
//                                                                                                                    // 7
                                                                                                                      //
                                                                                                                      //
DDPServer._WriteFence = function () {                                                                                 // 8
  var self = this;                                                                                                    // 9
  self.armed = false;                                                                                                 // 11
  self.fired = false;                                                                                                 // 12
  self.retired = false;                                                                                               // 13
  self.outstanding_writes = 0;                                                                                        // 14
  self.before_fire_callbacks = [];                                                                                    // 15
  self.completion_callbacks = [];                                                                                     // 16
}; // The current write fence. When there is a current write fence, code                                              // 17
// that writes to databases should register their writes with it using                                                // 20
// beginWrite().                                                                                                      // 21
//                                                                                                                    // 22
                                                                                                                      //
                                                                                                                      //
DDPServer._CurrentWriteFence = new Meteor.EnvironmentVariable();                                                      // 23
                                                                                                                      //
_.extend(DDPServer._WriteFence.prototype, {                                                                           // 25
  // Start tracking a write, and return an object to represent it. The                                                // 26
  // object has a single method, committed(). This method should be                                                   // 27
  // called when the write is fully committed and propagated. You can                                                 // 28
  // continue to add writes to the WriteFence up until it is triggered                                                // 29
  // (calls its callbacks because all writes have committed.)                                                         // 30
  beginWrite: function () {                                                                                           // 31
    var self = this;                                                                                                  // 32
    if (self.retired) return {                                                                                        // 34
      committed: function () {}                                                                                       // 35
    };                                                                                                                // 35
    if (self.fired) throw new Error("fence has already activated -- too late to add writes");                         // 37
    self.outstanding_writes++;                                                                                        // 40
    var committed = false;                                                                                            // 41
    return {                                                                                                          // 42
      committed: function () {                                                                                        // 43
        if (committed) throw new Error("committed called twice on the same write");                                   // 44
        committed = true;                                                                                             // 46
        self.outstanding_writes--;                                                                                    // 47
                                                                                                                      //
        self._maybeFire();                                                                                            // 48
      }                                                                                                               // 49
    };                                                                                                                // 42
  },                                                                                                                  // 51
  // Arm the fence. Once the fence is armed, and there are no more                                                    // 53
  // uncommitted writes, it will activate.                                                                            // 54
  arm: function () {                                                                                                  // 55
    var self = this;                                                                                                  // 56
    if (self === DDPServer._CurrentWriteFence.get()) throw Error("Can't arm the current fence");                      // 57
    self.armed = true;                                                                                                // 59
                                                                                                                      //
    self._maybeFire();                                                                                                // 60
  },                                                                                                                  // 61
  // Register a function to be called once before firing the fence.                                                   // 63
  // Callback function can add new writes to the fence, in which case                                                 // 64
  // it won't fire until those writes are done as well.                                                               // 65
  onBeforeFire: function (func) {                                                                                     // 66
    var self = this;                                                                                                  // 67
    if (self.fired) throw new Error("fence has already activated -- too late to " + "add a callback");                // 68
    self.before_fire_callbacks.push(func);                                                                            // 71
  },                                                                                                                  // 72
  // Register a function to be called when the fence fires.                                                           // 74
  onAllCommitted: function (func) {                                                                                   // 75
    var self = this;                                                                                                  // 76
    if (self.fired) throw new Error("fence has already activated -- too late to " + "add a callback");                // 77
    self.completion_callbacks.push(func);                                                                             // 80
  },                                                                                                                  // 81
  // Convenience function. Arms the fence, then blocks until it fires.                                                // 83
  armAndWait: function () {                                                                                           // 84
    var self = this;                                                                                                  // 85
    var future = new Future();                                                                                        // 86
    self.onAllCommitted(function () {                                                                                 // 87
      future['return']();                                                                                             // 88
    });                                                                                                               // 89
    self.arm();                                                                                                       // 90
    future.wait();                                                                                                    // 91
  },                                                                                                                  // 92
  _maybeFire: function () {                                                                                           // 94
    var self = this;                                                                                                  // 95
    if (self.fired) throw new Error("write fence already activated?");                                                // 96
                                                                                                                      //
    if (self.armed && !self.outstanding_writes) {                                                                     // 98
      var invokeCallback = function (func) {                                                                          // 98
        try {                                                                                                         // 100
          func(self);                                                                                                 // 101
        } catch (err) {                                                                                               // 102
          Meteor._debug("exception in write fence callback:", err);                                                   // 103
        }                                                                                                             // 104
      };                                                                                                              // 105
                                                                                                                      //
      self.outstanding_writes++;                                                                                      // 107
                                                                                                                      //
      while (self.before_fire_callbacks.length > 0) {                                                                 // 108
        var callbacks = self.before_fire_callbacks;                                                                   // 109
        self.before_fire_callbacks = [];                                                                              // 110
                                                                                                                      //
        _.each(callbacks, invokeCallback);                                                                            // 111
      }                                                                                                               // 112
                                                                                                                      //
      self.outstanding_writes--;                                                                                      // 113
                                                                                                                      //
      if (!self.outstanding_writes) {                                                                                 // 115
        self.fired = true;                                                                                            // 116
        var callbacks = self.completion_callbacks;                                                                    // 117
        self.completion_callbacks = [];                                                                               // 118
                                                                                                                      //
        _.each(callbacks, invokeCallback);                                                                            // 119
      }                                                                                                               // 120
    }                                                                                                                 // 121
  },                                                                                                                  // 122
  // Deactivate this fence so that adding more writes has no effect.                                                  // 124
  // The fence must have already fired.                                                                               // 125
  retire: function () {                                                                                               // 126
    var self = this;                                                                                                  // 127
    if (!self.fired) throw new Error("Can't retire a fence that hasn't fired.");                                      // 128
    self.retired = true;                                                                                              // 130
  }                                                                                                                   // 131
});                                                                                                                   // 25
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"crossbar.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-server/crossbar.js                                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// A "crossbar" is a class that provides structured notification registration.                                        // 1
// See _match for the definition of how a notification matches a trigger.                                             // 2
// All notifications and triggers must have a string key named 'collection'.                                          // 3
DDPServer._Crossbar = function (options) {                                                                            // 5
  var self = this;                                                                                                    // 6
  options = options || {};                                                                                            // 7
  self.nextId = 1; // map from collection name (string) -> listener id -> object. each object has                     // 9
  // keys 'trigger', 'callback'.  As a hack, the empty string means "no                                               // 11
  // collection".                                                                                                     // 12
                                                                                                                      //
  self.listenersByCollection = {};                                                                                    // 13
  self.factPackage = options.factPackage || "livedata";                                                               // 14
  self.factName = options.factName || null;                                                                           // 15
};                                                                                                                    // 16
                                                                                                                      //
_.extend(DDPServer._Crossbar.prototype, {                                                                             // 18
  // msg is a trigger or a notification                                                                               // 19
  _collectionForMessage: function (msg) {                                                                             // 20
    var self = this;                                                                                                  // 21
                                                                                                                      //
    if (!_.has(msg, 'collection')) {                                                                                  // 22
      return '';                                                                                                      // 23
    } else if (typeof msg.collection === 'string') {                                                                  // 24
      if (msg.collection === '') throw Error("Message has empty collection!");                                        // 25
      return msg.collection;                                                                                          // 27
    } else {                                                                                                          // 28
      throw Error("Message has non-string collection!");                                                              // 29
    }                                                                                                                 // 30
  },                                                                                                                  // 31
  // Listen for notification that match 'trigger'. A notification                                                     // 33
  // matches if it has the key-value pairs in trigger as a                                                            // 34
  // subset. When a notification matches, call 'callback', passing                                                    // 35
  // the actual notification.                                                                                         // 36
  //                                                                                                                  // 37
  // Returns a listen handle, which is an object with a method                                                        // 38
  // stop(). Call stop() to stop listening.                                                                           // 39
  //                                                                                                                  // 40
  // XXX It should be legal to call fire() from inside a listen()                                                     // 41
  // callback?                                                                                                        // 42
  listen: function (trigger, callback) {                                                                              // 43
    var self = this;                                                                                                  // 44
    var id = self.nextId++;                                                                                           // 45
                                                                                                                      //
    var collection = self._collectionForMessage(trigger);                                                             // 47
                                                                                                                      //
    var record = {                                                                                                    // 48
      trigger: EJSON.clone(trigger),                                                                                  // 48
      callback: callback                                                                                              // 48
    };                                                                                                                // 48
                                                                                                                      //
    if (!_.has(self.listenersByCollection, collection)) {                                                             // 49
      self.listenersByCollection[collection] = {};                                                                    // 50
    }                                                                                                                 // 51
                                                                                                                      //
    self.listenersByCollection[collection][id] = record;                                                              // 52
                                                                                                                      //
    if (self.factName && Package.facts) {                                                                             // 54
      Package.facts.Facts.incrementServerFact(self.factPackage, self.factName, 1);                                    // 55
    }                                                                                                                 // 57
                                                                                                                      //
    return {                                                                                                          // 59
      stop: function () {                                                                                             // 60
        if (self.factName && Package.facts) {                                                                         // 61
          Package.facts.Facts.incrementServerFact(self.factPackage, self.factName, -1);                               // 62
        }                                                                                                             // 64
                                                                                                                      //
        delete self.listenersByCollection[collection][id];                                                            // 65
                                                                                                                      //
        if (_.isEmpty(self.listenersByCollection[collection])) {                                                      // 66
          delete self.listenersByCollection[collection];                                                              // 67
        }                                                                                                             // 68
      }                                                                                                               // 69
    };                                                                                                                // 59
  },                                                                                                                  // 71
  // Fire the provided 'notification' (an object whose attribute                                                      // 73
  // values are all JSON-compatibile) -- inform all matching listeners                                                // 74
  // (registered with listen()).                                                                                      // 75
  //                                                                                                                  // 76
  // If fire() is called inside a write fence, then each of the                                                       // 77
  // listener callbacks will be called inside the write fence as well.                                                // 78
  //                                                                                                                  // 79
  // The listeners may be invoked in parallel, rather than serially.                                                  // 80
  fire: function (notification) {                                                                                     // 81
    var self = this;                                                                                                  // 82
                                                                                                                      //
    var collection = self._collectionForMessage(notification);                                                        // 84
                                                                                                                      //
    if (!_.has(self.listenersByCollection, collection)) {                                                             // 86
      return;                                                                                                         // 87
    }                                                                                                                 // 88
                                                                                                                      //
    var listenersForCollection = self.listenersByCollection[collection];                                              // 90
    var callbackIds = [];                                                                                             // 91
                                                                                                                      //
    _.each(listenersForCollection, function (l, id) {                                                                 // 92
      if (self._matches(notification, l.trigger)) {                                                                   // 93
        callbackIds.push(id);                                                                                         // 94
      }                                                                                                               // 95
    }); // Listener callbacks can yield, so we need to first find all the ones that                                   // 96
    // match in a single iteration over self.listenersByCollection (which can't                                       // 99
    // be mutated during this iteration), and then invoke the matching                                                // 100
    // callbacks, checking before each call to ensure they haven't stopped.                                           // 101
    // Note that we don't have to check that                                                                          // 102
    // self.listenersByCollection[collection] still === listenersForCollection,                                       // 103
    // because the only way that stops being true is if listenersForCollection                                        // 104
    // first gets reduced down to the empty object (and then never gets                                               // 105
    // increased again).                                                                                              // 106
                                                                                                                      //
                                                                                                                      //
    _.each(callbackIds, function (id) {                                                                               // 107
      if (_.has(listenersForCollection, id)) {                                                                        // 108
        listenersForCollection[id].callback(notification);                                                            // 109
      }                                                                                                               // 110
    });                                                                                                               // 111
  },                                                                                                                  // 112
  // A notification matches a trigger if all keys that exist in both are equal.                                       // 114
  //                                                                                                                  // 115
  // Examples:                                                                                                        // 116
  //  N:{collection: "C"} matches T:{collection: "C"}                                                                 // 117
  //    (a non-targeted write to a collection matches a                                                               // 118
  //     non-targeted query)                                                                                          // 119
  //  N:{collection: "C", id: "X"} matches T:{collection: "C"}                                                        // 120
  //    (a targeted write to a collection matches a non-targeted query)                                               // 121
  //  N:{collection: "C"} matches T:{collection: "C", id: "X"}                                                        // 122
  //    (a non-targeted write to a collection matches a                                                               // 123
  //     targeted query)                                                                                              // 124
  //  N:{collection: "C", id: "X"} matches T:{collection: "C", id: "X"}                                               // 125
  //    (a targeted write to a collection matches a targeted query targeted                                           // 126
  //     at the same document)                                                                                        // 127
  //  N:{collection: "C", id: "X"} does not match T:{collection: "C", id: "Y"}                                        // 128
  //    (a targeted write to a collection does not match a targeted query                                             // 129
  //     targeted at a different document)                                                                            // 130
  _matches: function (notification, trigger) {                                                                        // 131
    // Most notifications that use the crossbar have a string `collection` and                                        // 132
    // maybe an `id` that is a string or ObjectID. We're already dividing up                                          // 133
    // triggers by collection, but let's fast-track "nope, different ID" (and                                         // 134
    // avoid the overly generic EJSON.equals). This makes a noticeable                                                // 135
    // performance difference; see https://github.com/meteor/meteor/pull/3697                                         // 136
    if (typeof notification.id === 'string' && typeof trigger.id === 'string' && notification.id !== trigger.id) {    // 137
      return false;                                                                                                   // 140
    }                                                                                                                 // 141
                                                                                                                      //
    if (notification.id instanceof MongoID.ObjectID && trigger.id instanceof MongoID.ObjectID && !notification.id.equals(trigger.id)) {
      return false;                                                                                                   // 145
    }                                                                                                                 // 146
                                                                                                                      //
    return _.all(trigger, function (triggerValue, key) {                                                              // 148
      return !_.has(notification, key) || EJSON.equals(triggerValue, notification[key]);                              // 149
    });                                                                                                               // 151
  }                                                                                                                   // 152
}); // The "invalidation crossbar" is a specific instance used by the DDP server to                                   // 18
// implement write fence notifications. Listener callbacks on this crossbar                                           // 156
// should call beginWrite on the current write fence before they return, if they                                      // 157
// want to delay the write fence from firing (ie, the DDP method-data-updated                                         // 158
// message from being sent).                                                                                          // 159
                                                                                                                      //
                                                                                                                      //
DDPServer._InvalidationCrossbar = new DDPServer._Crossbar({                                                           // 160
  factName: "invalidation-crossbar-listeners"                                                                         // 161
});                                                                                                                   // 160
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"server_convenience.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-server/server_convenience.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
if (process.env.DDP_DEFAULT_CONNECTION_URL) {                                                                         // 1
  __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = process.env.DDP_DEFAULT_CONNECTION_URL;                      // 2
}                                                                                                                     // 4
                                                                                                                      //
Meteor.server = new Server();                                                                                         // 6
                                                                                                                      //
Meteor.refresh = function (notification) {                                                                            // 8
  DDPServer._InvalidationCrossbar.fire(notification);                                                                 // 9
}; // Proxy the public methods of Meteor.server so they can                                                           // 10
// be called directly on Meteor.                                                                                      // 13
                                                                                                                      //
                                                                                                                      //
_.each(['publish', 'methods', 'call', 'apply', 'onConnection', 'onMessage'], function (name) {                        // 14
  Meteor[name] = _.bind(Meteor.server[name], Meteor.server);                                                          // 16
}); // Meteor.server used to be called Meteor.default_server. Provide                                                 // 17
// backcompat as a courtesy even though it was never documented.                                                      // 20
// XXX COMPAT WITH 0.6.4                                                                                              // 21
                                                                                                                      //
                                                                                                                      //
Meteor.default_server = Meteor.server;                                                                                // 22
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/ddp-server/stream_server.js");
require("./node_modules/meteor/ddp-server/livedata_server.js");
require("./node_modules/meteor/ddp-server/writefence.js");
require("./node_modules/meteor/ddp-server/crossbar.js");
require("./node_modules/meteor/ddp-server/server_convenience.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['ddp-server'] = {}, {
  DDPServer: DDPServer
});

})();

//# sourceMappingURL=ddp-server.js.map
