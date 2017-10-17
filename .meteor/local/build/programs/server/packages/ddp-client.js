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
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Retry = Package.retry.Retry;
var IdMap = Package['id-map'].IdMap;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDPCommon = Package['ddp-common'].DDPCommon;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var toSockjsUrl, toWebsocketUrl, allConnections, DDP;

var require = meteorInstall({"node_modules":{"meteor":{"ddp-client":{"stream_client_nodejs.js":["babel-runtime/helpers/classCallCheck","./namespace.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/stream_client_nodejs.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                                //
                                                                                                                       //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                       //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
var DDP = void 0,                                                                                                      // 1
    LivedataTest = void 0;                                                                                             // 1
module.importSync("./namespace.js", {                                                                                  // 1
  DDP: function (v) {                                                                                                  // 1
    DDP = v;                                                                                                           // 1
  },                                                                                                                   // 1
  LivedataTest: function (v) {                                                                                         // 1
    LivedataTest = v;                                                                                                  // 1
  }                                                                                                                    // 1
}, 0);                                                                                                                 // 1
                                                                                                                       //
// @param endpoint {String} URL to Meteor app                                                                          // 3
//   "http://subdomain.meteor.com/" or "/" or                                                                          // 4
//   "ddp+sockjs://foo-**.meteor.com/sockjs"                                                                           // 5
//                                                                                                                     // 6
// We do some rewriting of the URL to eventually make it "ws://" or "wss://",                                          // 7
// whatever was passed in.  At the very least, what Meteor.absoluteUrl() returns                                       // 8
// us should work.                                                                                                     // 9
//                                                                                                                     // 10
// We don't do any heartbeating. (The logic that did this in sockjs was removed,                                       // 11
// because it used a built-in sockjs mechanism. We could do it with WebSocket                                          // 12
// ping frames or with DDP-level messages.)                                                                            // 13
LivedataTest.ClientStream = function () {                                                                              // 14
  function ClientStream(endpoint, options) {                                                                           // 15
    (0, _classCallCheck3.default)(this, ClientStream);                                                                 // 15
    var self = this;                                                                                                   // 16
    options = options || {};                                                                                           // 17
    self.options = Object.assign({                                                                                     // 19
      retry: true                                                                                                      // 20
    }, options);                                                                                                       // 19
    self.client = null; // created in _launchConnection                                                                // 23
                                                                                                                       //
    self.endpoint = endpoint;                                                                                          // 24
    self.headers = self.options.headers || {};                                                                         // 26
    self.npmFayeOptions = self.options.npmFayeOptions || {};                                                           // 27
                                                                                                                       //
    self._initCommon(self.options); //// Kickoff!                                                                      // 29
                                                                                                                       //
                                                                                                                       //
    self._launchConnection();                                                                                          // 32
  } // data is a utf8 string. Data sent while not connected is dropped on                                              // 33
  // the floor, and it is up the user of this API to retransmit lost                                                   // 36
  // messages on 'reset'                                                                                               // 37
                                                                                                                       //
                                                                                                                       //
  ClientStream.prototype.send = function () {                                                                          // 14
    function send(data) {                                                                                              // 14
      var self = this;                                                                                                 // 39
                                                                                                                       //
      if (self.currentStatus.connected) {                                                                              // 40
        self.client.send(data);                                                                                        // 41
      }                                                                                                                // 42
    }                                                                                                                  // 43
                                                                                                                       //
    return send;                                                                                                       // 14
  }(); // Changes where this connection points                                                                         // 14
                                                                                                                       //
                                                                                                                       //
  ClientStream.prototype._changeUrl = function () {                                                                    // 14
    function _changeUrl(url) {                                                                                         // 14
      var self = this;                                                                                                 // 47
      self.endpoint = url;                                                                                             // 48
    }                                                                                                                  // 49
                                                                                                                       //
    return _changeUrl;                                                                                                 // 14
  }();                                                                                                                 // 14
                                                                                                                       //
  ClientStream.prototype._onConnect = function () {                                                                    // 14
    function _onConnect(client) {                                                                                      // 14
      var self = this;                                                                                                 // 52
                                                                                                                       //
      if (client !== self.client) {                                                                                    // 54
        // This connection is not from the last call to _launchConnection.                                             // 55
        // But _launchConnection calls _cleanup which closes previous connections.                                     // 56
        // It's our belief that this stifles future 'open' events, but maybe                                           // 57
        // we are wrong?                                                                                               // 58
        throw new Error("Got open from inactive client " + !!self.client);                                             // 59
      }                                                                                                                // 60
                                                                                                                       //
      if (self._forcedToDisconnect) {                                                                                  // 62
        // We were asked to disconnect between trying to open the connection and                                       // 63
        // actually opening it. Let's just pretend this never happened.                                                // 64
        self.client.close();                                                                                           // 65
        self.client = null;                                                                                            // 66
        return;                                                                                                        // 67
      }                                                                                                                // 68
                                                                                                                       //
      if (self.currentStatus.connected) {                                                                              // 70
        // We already have a connection. It must have been the case that we                                            // 71
        // started two parallel connection attempts (because we wanted to                                              // 72
        // 'reconnect now' on a hanging connection and we had no way to cancel the                                     // 73
        // connection attempt.) But this shouldn't happen (similarly to the client                                     // 74
        // !== self.client check above).                                                                               // 75
        throw new Error("Two parallel connections?");                                                                  // 76
      }                                                                                                                // 77
                                                                                                                       //
      self._clearConnectionTimer(); // update status                                                                   // 79
                                                                                                                       //
                                                                                                                       //
      self.currentStatus.status = "connected";                                                                         // 82
      self.currentStatus.connected = true;                                                                             // 83
      self.currentStatus.retryCount = 0;                                                                               // 84
      self.statusChanged(); // fire resets. This must come after status change so that clients                         // 85
      // can call send from within a reset callback.                                                                   // 88
                                                                                                                       //
      _.each(self.eventCallbacks.reset, function (callback) {                                                          // 89
        callback();                                                                                                    // 89
      });                                                                                                              // 89
    }                                                                                                                  // 90
                                                                                                                       //
    return _onConnect;                                                                                                 // 14
  }();                                                                                                                 // 14
                                                                                                                       //
  ClientStream.prototype._cleanup = function () {                                                                      // 14
    function _cleanup(maybeError) {                                                                                    // 14
      var self = this;                                                                                                 // 93
                                                                                                                       //
      self._clearConnectionTimer();                                                                                    // 95
                                                                                                                       //
      if (self.client) {                                                                                               // 96
        var client = self.client;                                                                                      // 97
        self.client = null;                                                                                            // 98
        client.close();                                                                                                // 99
                                                                                                                       //
        _.each(self.eventCallbacks.disconnect, function (callback) {                                                   // 101
          callback(maybeError);                                                                                        // 102
        });                                                                                                            // 103
      }                                                                                                                // 104
    }                                                                                                                  // 105
                                                                                                                       //
    return _cleanup;                                                                                                   // 14
  }();                                                                                                                 // 14
                                                                                                                       //
  ClientStream.prototype._clearConnectionTimer = function () {                                                         // 14
    function _clearConnectionTimer() {                                                                                 // 14
      var self = this;                                                                                                 // 108
                                                                                                                       //
      if (self.connectionTimer) {                                                                                      // 110
        clearTimeout(self.connectionTimer);                                                                            // 111
        self.connectionTimer = null;                                                                                   // 112
      }                                                                                                                // 113
    }                                                                                                                  // 114
                                                                                                                       //
    return _clearConnectionTimer;                                                                                      // 14
  }();                                                                                                                 // 14
                                                                                                                       //
  ClientStream.prototype._getProxyUrl = function () {                                                                  // 14
    function _getProxyUrl(targetUrl) {                                                                                 // 14
      var self = this; // Similar to code in tools/http-helpers.js.                                                    // 117
                                                                                                                       //
      var proxy = process.env.HTTP_PROXY || process.env.http_proxy || null; // if we're going to a secure url, try the https_proxy env variable first.
                                                                                                                       //
      if (targetUrl.match(/^wss:/)) {                                                                                  // 121
        proxy = process.env.HTTPS_PROXY || process.env.https_proxy || proxy;                                           // 122
      }                                                                                                                // 123
                                                                                                                       //
      return proxy;                                                                                                    // 124
    }                                                                                                                  // 125
                                                                                                                       //
    return _getProxyUrl;                                                                                               // 14
  }();                                                                                                                 // 14
                                                                                                                       //
  ClientStream.prototype._launchConnection = function () {                                                             // 14
    function _launchConnection() {                                                                                     // 14
      var self = this;                                                                                                 // 128
                                                                                                                       //
      self._cleanup(); // cleanup the old socket, if there was one.                                                    // 129
      // Since server-to-server DDP is still an experimental feature, we only                                          // 131
      // require the module if we actually create a server-to-server                                                   // 132
      // connection.                                                                                                   // 133
                                                                                                                       //
                                                                                                                       //
      var FayeWebSocket = Npm.require('faye-websocket');                                                               // 134
                                                                                                                       //
      var deflate = Npm.require('permessage-deflate');                                                                 // 135
                                                                                                                       //
      var targetUrl = toWebsocketUrl(self.endpoint);                                                                   // 137
      var fayeOptions = {                                                                                              // 138
        headers: self.headers,                                                                                         // 139
        extensions: [deflate]                                                                                          // 140
      };                                                                                                               // 138
      fayeOptions = _.extend(fayeOptions, self.npmFayeOptions);                                                        // 142
                                                                                                                       //
      var proxyUrl = self._getProxyUrl(targetUrl);                                                                     // 143
                                                                                                                       //
      if (proxyUrl) {                                                                                                  // 144
        fayeOptions.proxy = {                                                                                          // 145
          origin: proxyUrl                                                                                             // 145
        };                                                                                                             // 145
      }                                                                                                                // 146
                                                                                                                       //
      ; // We would like to specify 'ddp' as the subprotocol here. The npm module we                                   // 146
      // used to use as a client would fail the handshake if we ask for a                                              // 149
      // subprotocol and the server doesn't send one back (and sockjs doesn't).                                        // 150
      // Faye doesn't have that behavior; it's unclear from reading RFC 6455 if                                        // 151
      // Faye is erroneous or not.  So for now, we don't specify protocols.                                            // 152
                                                                                                                       //
      var subprotocols = [];                                                                                           // 153
      var client = self.client = new FayeWebSocket.Client(targetUrl, subprotocols, fayeOptions);                       // 155
                                                                                                                       //
      self._clearConnectionTimer();                                                                                    // 158
                                                                                                                       //
      self.connectionTimer = Meteor.setTimeout(function () {                                                           // 159
        self._lostConnection(new DDP.ConnectionError("DDP connection timed out"));                                     // 161
      }, self.CONNECT_TIMEOUT);                                                                                        // 163
      self.client.on('open', Meteor.bindEnvironment(function () {                                                      // 166
        return self._onConnect(client);                                                                                // 167
      }, "stream connect callback"));                                                                                  // 168
                                                                                                                       //
      var clientOnIfCurrent = function (event, description, f) {                                                       // 170
        self.client.on(event, Meteor.bindEnvironment(function () {                                                     // 171
          // Ignore events from any connection we've already cleaned up.                                               // 172
          if (client !== self.client) return;                                                                          // 173
          f.apply(this, arguments);                                                                                    // 175
        }, description));                                                                                              // 176
      };                                                                                                               // 177
                                                                                                                       //
      clientOnIfCurrent('error', 'stream error callback', function (error) {                                           // 179
        if (!self.options._dontPrintErrors) Meteor._debug("stream error", error.message); // Faye's 'error' object is not a JS error (and among other things,
        // doesn't stringify well). Convert it to one.                                                                 // 184
                                                                                                                       //
        self._lostConnection(new DDP.ConnectionError(error.message));                                                  // 185
      });                                                                                                              // 186
      clientOnIfCurrent('close', 'stream close callback', function () {                                                // 189
        self._lostConnection();                                                                                        // 190
      });                                                                                                              // 191
      clientOnIfCurrent('message', 'stream message callback', function (message) {                                     // 194
        // Ignore binary frames, where message.data is a Buffer                                                        // 195
        if (typeof message.data !== "string") return;                                                                  // 196
                                                                                                                       //
        _.each(self.eventCallbacks.message, function (callback) {                                                      // 199
          callback(message.data);                                                                                      // 200
        });                                                                                                            // 201
      });                                                                                                              // 202
    }                                                                                                                  // 203
                                                                                                                       //
    return _launchConnection;                                                                                          // 14
  }();                                                                                                                 // 14
                                                                                                                       //
  return ClientStream;                                                                                                 // 14
}();                                                                                                                   // 14
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"stream_client_common.js":["./namespace.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/stream_client_common.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var DDP = void 0,                                                                                                      // 1
    LivedataTest = void 0;                                                                                             // 1
module.importSync("./namespace.js", {                                                                                  // 1
  DDP: function (v) {                                                                                                  // 1
    DDP = v;                                                                                                           // 1
  },                                                                                                                   // 1
  LivedataTest: function (v) {                                                                                         // 1
    LivedataTest = v;                                                                                                  // 1
  }                                                                                                                    // 1
}, 0);                                                                                                                 // 1
                                                                                                                       //
// XXX from Underscore.String (http://epeli.github.com/underscore.string/)                                             // 3
var startsWith = function (str, starts) {                                                                              // 4
  return str.length >= starts.length && str.substring(0, starts.length) === starts;                                    // 5
};                                                                                                                     // 7
                                                                                                                       //
var endsWith = function (str, ends) {                                                                                  // 8
  return str.length >= ends.length && str.substring(str.length - ends.length) === ends;                                // 9
}; // @param url {String} URL to Meteor app, eg:                                                                       // 11
//   "/" or "madewith.meteor.com" or "https://foo.meteor.com"                                                          // 14
//   or "ddp+sockjs://ddp--****-foo.meteor.com/sockjs"                                                                 // 15
// @returns {String} URL to the endpoint with the specific scheme and subPath, e.g.                                    // 16
// for scheme "http" and subPath "sockjs"                                                                              // 17
//   "http://subdomain.meteor.com/sockjs" or "/sockjs"                                                                 // 18
//   or "https://ddp--1234-foo.meteor.com/sockjs"                                                                      // 19
                                                                                                                       //
                                                                                                                       //
var translateUrl = function (url, newSchemeBase, subPath) {                                                            // 20
  if (!newSchemeBase) {                                                                                                // 21
    newSchemeBase = "http";                                                                                            // 22
  }                                                                                                                    // 23
                                                                                                                       //
  var ddpUrlMatch = url.match(/^ddp(i?)\+sockjs:\/\//);                                                                // 25
  var httpUrlMatch = url.match(/^http(s?):\/\//);                                                                      // 26
  var newScheme;                                                                                                       // 27
                                                                                                                       //
  if (ddpUrlMatch) {                                                                                                   // 28
    // Remove scheme and split off the host.                                                                           // 29
    var urlAfterDDP = url.substr(ddpUrlMatch[0].length);                                                               // 30
    newScheme = ddpUrlMatch[1] === "i" ? newSchemeBase : newSchemeBase + "s";                                          // 31
    var slashPos = urlAfterDDP.indexOf('/');                                                                           // 32
    var host = slashPos === -1 ? urlAfterDDP : urlAfterDDP.substr(0, slashPos);                                        // 33
    var rest = slashPos === -1 ? '' : urlAfterDDP.substr(slashPos); // In the host (ONLY!), change '*' characters into random digits. This
    // allows different stream connections to connect to different hostnames                                           // 38
    // and avoid browser per-hostname connection limits.                                                               // 39
                                                                                                                       //
    host = host.replace(/\*/g, function () {                                                                           // 40
      return Math.floor(Random.fraction() * 10);                                                                       // 41
    });                                                                                                                // 42
    return newScheme + '://' + host + rest;                                                                            // 44
  } else if (httpUrlMatch) {                                                                                           // 45
    newScheme = !httpUrlMatch[1] ? newSchemeBase : newSchemeBase + "s";                                                // 46
    var urlAfterHttp = url.substr(httpUrlMatch[0].length);                                                             // 47
    url = newScheme + "://" + urlAfterHttp;                                                                            // 48
  } // Prefix FQDNs but not relative URLs                                                                              // 49
                                                                                                                       //
                                                                                                                       //
  if (url.indexOf("://") === -1 && !startsWith(url, "/")) {                                                            // 52
    url = newSchemeBase + "://" + url;                                                                                 // 53
  } // XXX This is not what we should be doing: if I have a site                                                       // 54
  // deployed at "/foo", then DDP.connect("/") should actually connect                                                 // 57
  // to "/", not to "/foo". "/" is an absolute path. (Contrast: if                                                     // 58
  // deployed at "/foo", it would be reasonable for DDP.connect("bar")                                                 // 59
  // to connect to "/foo/bar").                                                                                        // 60
  //                                                                                                                   // 61
  // We should make this properly honor absolute paths rather than                                                     // 62
  // forcing the path to be relative to the site root. Simultaneously,                                                 // 63
  // we should set DDP_DEFAULT_CONNECTION_URL to include the site                                                      // 64
  // root. See also client_convenience.js #RationalizingRelativeDDPURLs                                                // 65
                                                                                                                       //
                                                                                                                       //
  url = Meteor._relativeToSiteRootUrl(url);                                                                            // 66
  if (endsWith(url, "/")) return url + subPath;else return url + "/" + subPath;                                        // 68
};                                                                                                                     // 72
                                                                                                                       //
toSockjsUrl = function (url) {                                                                                         // 74
  return translateUrl(url, "http", "sockjs");                                                                          // 75
};                                                                                                                     // 76
                                                                                                                       //
toWebsocketUrl = function (url) {                                                                                      // 78
  var ret = translateUrl(url, "ws", "websocket");                                                                      // 79
  return ret;                                                                                                          // 80
};                                                                                                                     // 81
                                                                                                                       //
LivedataTest.toSockjsUrl = toSockjsUrl;                                                                                // 83
                                                                                                                       //
_.extend(LivedataTest.ClientStream.prototype, {                                                                        // 86
  // Register for callbacks.                                                                                           // 88
  on: function (name, callback) {                                                                                      // 89
    var self = this;                                                                                                   // 90
    if (name !== 'message' && name !== 'reset' && name !== 'disconnect') throw new Error("unknown event type: " + name);
    if (!self.eventCallbacks[name]) self.eventCallbacks[name] = [];                                                    // 95
    self.eventCallbacks[name].push(callback);                                                                          // 97
  },                                                                                                                   // 98
  _initCommon: function (options) {                                                                                    // 101
    var self = this;                                                                                                   // 102
    options = options || {}; //// Constants                                                                            // 103
    // how long to wait until we declare the connection attempt                                                        // 107
    // failed.                                                                                                         // 108
                                                                                                                       //
    self.CONNECT_TIMEOUT = options.connectTimeoutMs || 10000;                                                          // 109
    self.eventCallbacks = {}; // name -> [callback]                                                                    // 111
                                                                                                                       //
    self._forcedToDisconnect = false; //// Reactive status                                                             // 113
                                                                                                                       //
    self.currentStatus = {                                                                                             // 116
      status: "connecting",                                                                                            // 117
      connected: false,                                                                                                // 118
      retryCount: 0                                                                                                    // 119
    };                                                                                                                 // 116
    self.statusListeners = typeof Tracker !== 'undefined' && new Tracker.Dependency();                                 // 123
                                                                                                                       //
    self.statusChanged = function () {                                                                                 // 124
      if (self.statusListeners) self.statusListeners.changed();                                                        // 125
    }; //// Retry logic                                                                                                // 127
                                                                                                                       //
                                                                                                                       //
    self._retry = new Retry();                                                                                         // 130
    self.connectionTimer = null;                                                                                       // 131
  },                                                                                                                   // 133
  // Trigger a reconnect.                                                                                              // 135
  reconnect: function (options) {                                                                                      // 136
    var self = this;                                                                                                   // 137
    options = options || {};                                                                                           // 138
                                                                                                                       //
    if (options.url) {                                                                                                 // 140
      self._changeUrl(options.url);                                                                                    // 141
    }                                                                                                                  // 142
                                                                                                                       //
    if (options._sockjsOptions) {                                                                                      // 144
      self.options._sockjsOptions = options._sockjsOptions;                                                            // 145
    }                                                                                                                  // 146
                                                                                                                       //
    if (self.currentStatus.connected) {                                                                                // 148
      if (options._force || options.url) {                                                                             // 149
        // force reconnect.                                                                                            // 150
        self._lostConnection(new DDP.ForcedReconnectError());                                                          // 151
      } // else, noop.                                                                                                 // 152
                                                                                                                       //
                                                                                                                       //
      return;                                                                                                          // 153
    } // if we're mid-connection, stop it.                                                                             // 154
                                                                                                                       //
                                                                                                                       //
    if (self.currentStatus.status === "connecting") {                                                                  // 157
      // Pretend it's a clean close.                                                                                   // 158
      self._lostConnection();                                                                                          // 159
    }                                                                                                                  // 160
                                                                                                                       //
    self._retry.clear();                                                                                               // 162
                                                                                                                       //
    self.currentStatus.retryCount -= 1; // don't count manual retries                                                  // 163
                                                                                                                       //
    self._retryNow();                                                                                                  // 164
  },                                                                                                                   // 165
  disconnect: function (options) {                                                                                     // 167
    var self = this;                                                                                                   // 168
    options = options || {}; // Failed is permanent. If we're failed, don't let people go back                         // 169
    // online by calling 'disconnect' then 'reconnect'.                                                                // 172
                                                                                                                       //
    if (self._forcedToDisconnect) return; // If _permanent is set, permanently disconnect a stream. Once a stream      // 173
    // is forced to disconnect, it can never reconnect. This is for                                                    // 177
    // error cases such as ddp version mismatch, where trying again                                                    // 178
    // won't fix the problem.                                                                                          // 179
                                                                                                                       //
    if (options._permanent) {                                                                                          // 180
      self._forcedToDisconnect = true;                                                                                 // 181
    }                                                                                                                  // 182
                                                                                                                       //
    self._cleanup();                                                                                                   // 184
                                                                                                                       //
    self._retry.clear();                                                                                               // 185
                                                                                                                       //
    self.currentStatus = {                                                                                             // 187
      status: options._permanent ? "failed" : "offline",                                                               // 188
      connected: false,                                                                                                // 189
      retryCount: 0                                                                                                    // 190
    };                                                                                                                 // 187
    if (options._permanent && options._error) self.currentStatus.reason = options._error;                              // 193
    self.statusChanged();                                                                                              // 196
  },                                                                                                                   // 197
  // maybeError is set unless it's a clean protocol-level close.                                                       // 199
  _lostConnection: function (maybeError) {                                                                             // 200
    var self = this;                                                                                                   // 201
                                                                                                                       //
    self._cleanup(maybeError);                                                                                         // 203
                                                                                                                       //
    self._retryLater(maybeError); // sets status. no need to do it here.                                               // 204
                                                                                                                       //
  },                                                                                                                   // 205
  // fired when we detect that we've gone online. try to reconnect                                                     // 207
  // immediately.                                                                                                      // 208
  _online: function () {                                                                                               // 209
    // if we've requested to be offline by disconnecting, don't reconnect.                                             // 210
    if (this.currentStatus.status != "offline") this.reconnect();                                                      // 211
  },                                                                                                                   // 213
  _retryLater: function (maybeError) {                                                                                 // 215
    var self = this;                                                                                                   // 216
    var timeout = 0;                                                                                                   // 218
                                                                                                                       //
    if (self.options.retry || maybeError && maybeError.errorType === "DDP.ForcedReconnectError") {                     // 219
      timeout = self._retry.retryLater(self.currentStatus.retryCount, _.bind(self._retryNow, self));                   // 221
      self.currentStatus.status = "waiting";                                                                           // 225
      self.currentStatus.retryTime = new Date().getTime() + timeout;                                                   // 226
    } else {                                                                                                           // 227
      self.currentStatus.status = "failed";                                                                            // 228
      delete self.currentStatus.retryTime;                                                                             // 229
    }                                                                                                                  // 230
                                                                                                                       //
    self.currentStatus.connected = false;                                                                              // 232
    self.statusChanged();                                                                                              // 233
  },                                                                                                                   // 234
  _retryNow: function () {                                                                                             // 236
    var self = this;                                                                                                   // 237
    if (self._forcedToDisconnect) return;                                                                              // 239
    self.currentStatus.retryCount += 1;                                                                                // 242
    self.currentStatus.status = "connecting";                                                                          // 243
    self.currentStatus.connected = false;                                                                              // 244
    delete self.currentStatus.retryTime;                                                                               // 245
    self.statusChanged();                                                                                              // 246
                                                                                                                       //
    self._launchConnection();                                                                                          // 248
  },                                                                                                                   // 249
  // Get current status. Reactive.                                                                                     // 252
  status: function () {                                                                                                // 253
    var self = this;                                                                                                   // 254
    if (self.statusListeners) self.statusListeners.depend();                                                           // 255
    return self.currentStatus;                                                                                         // 257
  }                                                                                                                    // 258
});                                                                                                                    // 86
                                                                                                                       //
DDP.ConnectionError = Meteor.makeErrorType("DDP.ConnectionError", function (message) {                                 // 261
  var self = this;                                                                                                     // 263
  self.message = message;                                                                                              // 264
});                                                                                                                    // 265
DDP.ForcedReconnectError = Meteor.makeErrorType("DDP.ForcedReconnectError", function () {});                           // 267
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"livedata_common.js":["./namespace.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/livedata_common.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var DDP = void 0,                                                                                                      // 1
    LivedataTest = void 0;                                                                                             // 1
module.importSync("./namespace.js", {                                                                                  // 1
  DDP: function (v) {                                                                                                  // 1
    DDP = v;                                                                                                           // 1
  },                                                                                                                   // 1
  LivedataTest: function (v) {                                                                                         // 1
    LivedataTest = v;                                                                                                  // 1
  }                                                                                                                    // 1
}, 0);                                                                                                                 // 1
LivedataTest.SUPPORTED_DDP_VERSIONS = DDPCommon.SUPPORTED_DDP_VERSIONS; // This is private but it's used in a few places. accounts-base uses
// it to get the current user. Meteor.setTimeout and friends clear                                                     // 6
// it. We can probably find a better way to factor this.                                                               // 7
                                                                                                                       //
DDP._CurrentInvocation = new Meteor.EnvironmentVariable();                                                             // 8
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"random_stream.js":["./namespace.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/random_stream.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var DDP = void 0;                                                                                                      // 1
module.importSync("./namespace.js", {                                                                                  // 1
  DDP: function (v) {                                                                                                  // 1
    DDP = v;                                                                                                           // 1
  }                                                                                                                    // 1
}, 0);                                                                                                                 // 1
                                                                                                                       //
// Returns the named sequence of pseudo-random values.                                                                 // 3
// The scope will be DDP._CurrentInvocation.get(), so the stream will produce                                          // 4
// consistent values for method calls on the client and server.                                                        // 5
DDP.randomStream = function (name) {                                                                                   // 6
  var scope = DDP._CurrentInvocation.get();                                                                            // 7
                                                                                                                       //
  return DDPCommon.RandomStream.get(scope, name);                                                                      // 8
};                                                                                                                     // 9
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"livedata_connection.js":["babel-runtime/helpers/typeof","./namespace.js","./id_map.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/livedata_connection.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                                //
                                                                                                                       //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                       //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
var DDP = void 0,                                                                                                      // 1
    LivedataTest = void 0;                                                                                             // 1
module.importSync("./namespace.js", {                                                                                  // 1
  DDP: function (v) {                                                                                                  // 1
    DDP = v;                                                                                                           // 1
  },                                                                                                                   // 1
  LivedataTest: function (v) {                                                                                         // 1
    LivedataTest = v;                                                                                                  // 1
  }                                                                                                                    // 1
}, 0);                                                                                                                 // 1
var MongoIDMap = void 0;                                                                                               // 1
module.importSync("./id_map.js", {                                                                                     // 1
  MongoIDMap: function (v) {                                                                                           // 1
    MongoIDMap = v;                                                                                                    // 1
  }                                                                                                                    // 1
}, 1);                                                                                                                 // 1
                                                                                                                       //
if (Meteor.isServer) {                                                                                                 // 4
  var path = Npm.require('path');                                                                                      // 5
                                                                                                                       //
  var Fiber = Npm.require('fibers');                                                                                   // 6
                                                                                                                       //
  var Future = Npm.require(path.join('fibers', 'future'));                                                             // 7
} // @param url {String|Object} URL to Meteor app,                                                                     // 8
//   or an object as a test hook (see code)                                                                            // 11
// Options:                                                                                                            // 12
//   reloadWithOutstanding: is it OK to reload if there are outstanding methods?                                       // 13
//   headers: extra headers to send on the websockets connection, for                                                  // 14
//     server-to-server DDP only                                                                                       // 15
//   _sockjsOptions: Specifies options to pass through to the sockjs client                                            // 16
//   onDDPNegotiationVersionFailure: callback when version negotiation fails.                                          // 17
//                                                                                                                     // 18
// XXX There should be a way to destroy a DDP connection, causing all                                                  // 19
// outstanding method calls to fail.                                                                                   // 20
//                                                                                                                     // 21
// XXX Our current way of handling failure and reconnection is great                                                   // 22
// for an app (where we want to tolerate being disconnected as an                                                      // 23
// expect state, and keep trying forever to reconnect) but cumbersome                                                  // 24
// for something like a command line tool that wants to make a                                                         // 25
// connection, call a method, and print an error if connection                                                         // 26
// fails. We should have better usability in the latter case (while                                                    // 27
// still transparently reconnecting if it's just a transient failure                                                   // 28
// or the server migrating us).                                                                                        // 29
                                                                                                                       //
                                                                                                                       //
var Connection = function (url, options) {                                                                             // 30
  var self = this;                                                                                                     // 31
  options = _.extend({                                                                                                 // 32
    onConnected: function () {},                                                                                       // 33
    onDDPVersionNegotiationFailure: function (description) {                                                           // 34
      Meteor._debug(description);                                                                                      // 35
    },                                                                                                                 // 36
    heartbeatInterval: 17500,                                                                                          // 37
    heartbeatTimeout: 15000,                                                                                           // 38
    npmFayeOptions: {},                                                                                                // 39
    // These options are only for testing.                                                                             // 40
    reloadWithOutstanding: false,                                                                                      // 41
    supportedDDPVersions: DDPCommon.SUPPORTED_DDP_VERSIONS,                                                            // 42
    retry: true,                                                                                                       // 43
    respondToPings: true,                                                                                              // 44
    // When updates are coming within this ms interval, batch them together.                                           // 45
    bufferedWritesInterval: 5,                                                                                         // 46
    // Flush buffers immediately if writes are happening continuously for more than this many ms.                      // 47
    bufferedWritesMaxAge: 500                                                                                          // 48
  }, options); // If set, called when we reconnect, queuing method calls _before_ the                                  // 32
  // existing outstanding ones. This is the only data member that is part of the                                       // 52
  // public API!                                                                                                       // 53
                                                                                                                       //
  self.onReconnect = null; // as a test hook, allow passing a stream instead of a url.                                 // 54
                                                                                                                       //
  if ((typeof url === "undefined" ? "undefined" : (0, _typeof3.default)(url)) === "object") {                          // 57
    self._stream = url;                                                                                                // 58
  } else {                                                                                                             // 59
    self._stream = new LivedataTest.ClientStream(url, {                                                                // 60
      retry: options.retry,                                                                                            // 61
      headers: options.headers,                                                                                        // 62
      _sockjsOptions: options._sockjsOptions,                                                                          // 63
      // Used to keep some tests quiet, or for other cases in which                                                    // 64
      // the right thing to do with connection errors is to silently                                                   // 65
      // fail (e.g. sending package usage stats). At some point we                                                     // 66
      // should have a real API for handling client-stream-level                                                       // 67
      // errors.                                                                                                       // 68
      _dontPrintErrors: options._dontPrintErrors,                                                                      // 69
      connectTimeoutMs: options.connectTimeoutMs,                                                                      // 70
      npmFayeOptions: options.npmFayeOptions                                                                           // 71
    });                                                                                                                // 60
  }                                                                                                                    // 73
                                                                                                                       //
  self._lastSessionId = null;                                                                                          // 75
  self._versionSuggestion = null; // The last proposed DDP version.                                                    // 76
                                                                                                                       //
  self._version = null; // The DDP version agreed on by client and server.                                             // 77
                                                                                                                       //
  self._stores = {}; // name -> object with methods                                                                    // 78
                                                                                                                       //
  self._methodHandlers = {}; // name -> func                                                                           // 79
                                                                                                                       //
  self._nextMethodId = 1;                                                                                              // 80
  self._supportedDDPVersions = options.supportedDDPVersions;                                                           // 81
  self._heartbeatInterval = options.heartbeatInterval;                                                                 // 83
  self._heartbeatTimeout = options.heartbeatTimeout; // Tracks methods which the user has tried to call but which have not yet
  // called their user callback (ie, they are waiting on their result or for all                                       // 87
  // of their writes to be written to the local cache). Map from method ID to                                          // 88
  // MethodInvoker object.                                                                                             // 89
                                                                                                                       //
  self._methodInvokers = {}; // Tracks methods which the user has called but whose result messages have not            // 90
  // arrived yet.                                                                                                      // 93
  //                                                                                                                   // 94
  // _outstandingMethodBlocks is an array of blocks of methods. Each block                                             // 95
  // represents a set of methods that can run at the same time. The first block                                        // 96
  // represents the methods which are currently in flight; subsequent blocks                                           // 97
  // must wait for previous blocks to be fully finished before they can be sent                                        // 98
  // to the server.                                                                                                    // 99
  //                                                                                                                   // 100
  // Each block is an object with the following fields:                                                                // 101
  // - methods: a list of MethodInvoker objects                                                                        // 102
  // - wait: a boolean; if true, this block had a single method invoked with                                           // 103
  //         the "wait" option                                                                                         // 104
  //                                                                                                                   // 105
  // There will never be adjacent blocks with wait=false, because the only thing                                       // 106
  // that makes methods need to be serialized is a wait method.                                                        // 107
  //                                                                                                                   // 108
  // Methods are removed from the first block when their "result" is                                                   // 109
  // received. The entire first block is only removed when all of the in-flight                                        // 110
  // methods have received their results (so the "methods" list is empty) *AND*                                        // 111
  // all of the data written by those methods are visible in the local cache. So                                       // 112
  // it is possible for the first block's methods list to be empty, if we are                                          // 113
  // still waiting for some objects to quiesce.                                                                        // 114
  //                                                                                                                   // 115
  // Example:                                                                                                          // 116
  //  _outstandingMethodBlocks = [                                                                                     // 117
  //    {wait: false, methods: []},                                                                                    // 118
  //    {wait: true, methods: [<MethodInvoker for 'login'>]},                                                          // 119
  //    {wait: false, methods: [<MethodInvoker for 'foo'>,                                                             // 120
  //                            <MethodInvoker for 'bar'>]}]                                                           // 121
  // This means that there were some methods which were sent to the server and                                         // 122
  // which have returned their results, but some of the data written by                                                // 123
  // the methods may not be visible in the local cache. Once all that data is                                          // 124
  // visible, we will send a 'login' method. Once the login method has returned                                        // 125
  // and all the data is visible (including re-running subs if userId changes),                                        // 126
  // we will send the 'foo' and 'bar' methods in parallel.                                                             // 127
                                                                                                                       //
  self._outstandingMethodBlocks = []; // method ID -> array of objects with keys 'collection' and 'id', listing        // 128
  // documents written by a given method's stub. keys are associated with                                              // 131
  // methods whose stub wrote at least one document, and whose data-done message                                       // 132
  // has not yet been received.                                                                                        // 133
                                                                                                                       //
  self._documentsWrittenByStub = {}; // collection -> IdMap of "server document" object. A "server document" has:      // 134
  // - "document": the version of the document according the                                                           // 136
  //   server (ie, the snapshot before a stub wrote it, amended by any changes                                         // 137
  //   received from the server)                                                                                       // 138
  //   It is undefined if we think the document does not exist                                                         // 139
  // - "writtenByStubs": a set of method IDs whose stubs wrote to the document                                         // 140
  //   whose "data done" messages have not yet been processed                                                          // 141
                                                                                                                       //
  self._serverDocuments = {}; // Array of callbacks to be called after the next update of the local                    // 142
  // cache. Used for:                                                                                                  // 145
  //  - Calling methodInvoker.dataVisible and sub ready callbacks after                                                // 146
  //    the relevant data is flushed.                                                                                  // 147
  //  - Invoking the callbacks of "half-finished" methods after reconnect                                              // 148
  //    quiescence. Specifically, methods whose result was received over the old                                       // 149
  //    connection (so we don't re-send it) but whose data had not been made                                           // 150
  //    visible.                                                                                                       // 151
                                                                                                                       //
  self._afterUpdateCallbacks = []; // In two contexts, we buffer all incoming data messages and then process them      // 152
  // all at once in a single update:                                                                                   // 155
  //   - During reconnect, we buffer all data messages until all subs that had                                         // 156
  //     been ready before reconnect are ready again, and all methods that are                                         // 157
  //     active have returned their "data done message"; then                                                          // 158
  //   - During the execution of a "wait" method, we buffer all data messages                                          // 159
  //     until the wait method gets its "data done" message. (If the wait method                                       // 160
  //     occurs during reconnect, it doesn't get any special handling.)                                                // 161
  // all data messages are processed in one update.                                                                    // 162
  //                                                                                                                   // 163
  // The following fields are used for this "quiescence" process.                                                      // 164
  // This buffers the messages that aren't being processed yet.                                                        // 166
                                                                                                                       //
  self._messagesBufferedUntilQuiescence = []; // Map from method ID -> true. Methods are removed from this when their  // 167
  // "data done" message is received, and we will not quiesce until it is                                              // 169
  // empty.                                                                                                            // 170
                                                                                                                       //
  self._methodsBlockingQuiescence = {}; // map from sub ID -> true for subs that were ready (ie, called the sub        // 171
  // ready callback) before reconnect but haven't become ready again yet                                               // 173
                                                                                                                       //
  self._subsBeingRevived = {}; // map from sub._id -> true                                                             // 174
  // if true, the next data update should reset all stores. (set during                                                // 175
  // reconnect.)                                                                                                       // 176
                                                                                                                       //
  self._resetStores = false; // name -> array of updates for (yet to be created) collections                           // 177
                                                                                                                       //
  self._updatesForUnknownStores = {}; // if we're blocking a migration, the retry func                                 // 180
                                                                                                                       //
  self._retryMigrate = null;                                                                                           // 182
  self.__flushBufferedWrites = Meteor.bindEnvironment(self._flushBufferedWrites, "flushing DDP buffered writes", self); // Collection name -> array of messages.
                                                                                                                       //
  self._bufferedWrites = {}; // When current buffer of updates must be flushed at, in ms timestamp.                    // 187
                                                                                                                       //
  self._bufferedWritesFlushAt = null; // Timeout handle for the next processing of all pending writes                  // 189
                                                                                                                       //
  self._bufferedWritesFlushHandle = null;                                                                              // 191
  self._bufferedWritesInterval = options.bufferedWritesInterval;                                                       // 193
  self._bufferedWritesMaxAge = options.bufferedWritesMaxAge; // metadata for subscriptions.  Map from sub ID to object with keys:
  //   - id                                                                                                            // 197
  //   - name                                                                                                          // 198
  //   - params                                                                                                        // 199
  //   - inactive (if true, will be cleaned up if not reused in re-run)                                                // 200
  //   - ready (has the 'ready' message been received?)                                                                // 201
  //   - readyCallback (an optional callback to call when ready)                                                       // 202
  //   - errorCallback (an optional callback to call if the sub terminates with                                        // 203
  //                    an error, XXX COMPAT WITH 1.0.3.1)                                                             // 204
  //   - stopCallback (an optional callback to call when the sub terminates                                            // 205
  //     for any reason, with an error argument if an error triggered the stop)                                        // 206
                                                                                                                       //
  self._subscriptions = {}; // Reactive userId.                                                                        // 207
                                                                                                                       //
  self._userId = null;                                                                                                 // 210
  self._userIdDeps = new Tracker.Dependency(); // Block auto-reload while we're waiting for method responses.          // 211
                                                                                                                       //
  if (Meteor.isClient && Package.reload && !options.reloadWithOutstanding) {                                           // 214
    Package.reload.Reload._onMigrate(function (retry) {                                                                // 215
      if (!self._readyToMigrate()) {                                                                                   // 216
        if (self._retryMigrate) throw new Error("Two migrations in progress?");                                        // 217
        self._retryMigrate = retry;                                                                                    // 219
        return false;                                                                                                  // 220
      } else {                                                                                                         // 221
        return [true];                                                                                                 // 222
      }                                                                                                                // 223
    });                                                                                                                // 224
  }                                                                                                                    // 225
                                                                                                                       //
  var onMessage = function (raw_msg) {                                                                                 // 227
    try {                                                                                                              // 228
      var msg = DDPCommon.parseDDP(raw_msg);                                                                           // 229
    } catch (e) {                                                                                                      // 230
      Meteor._debug("Exception while parsing DDP", e);                                                                 // 231
                                                                                                                       //
      return;                                                                                                          // 232
    } // Any message counts as receiving a pong, as it demonstrates that                                               // 233
    // the server is still alive.                                                                                      // 236
                                                                                                                       //
                                                                                                                       //
    if (self._heartbeat) {                                                                                             // 237
      self._heartbeat.messageReceived();                                                                               // 238
    }                                                                                                                  // 239
                                                                                                                       //
    if (msg === null || !msg.msg) {                                                                                    // 241
      // XXX COMPAT WITH 0.6.6. ignore the old welcome message for back                                                // 242
      // compat.  Remove this 'if' once the server stops sending welcome                                               // 243
      // messages (stream_server.js).                                                                                  // 244
      if (!(msg && msg.server_id)) Meteor._debug("discarding invalid livedata message", msg);                          // 245
      return;                                                                                                          // 247
    }                                                                                                                  // 248
                                                                                                                       //
    if (msg.msg === 'connected') {                                                                                     // 250
      self._version = self._versionSuggestion;                                                                         // 251
                                                                                                                       //
      self._livedata_connected(msg);                                                                                   // 252
                                                                                                                       //
      options.onConnected();                                                                                           // 253
    } else if (msg.msg === 'failed') {                                                                                 // 254
      if (_.contains(self._supportedDDPVersions, msg.version)) {                                                       // 256
        self._versionSuggestion = msg.version;                                                                         // 257
                                                                                                                       //
        self._stream.reconnect({                                                                                       // 258
          _force: true                                                                                                 // 258
        });                                                                                                            // 258
      } else {                                                                                                         // 259
        var description = "DDP version negotiation failed; server requested version " + msg.version;                   // 260
                                                                                                                       //
        self._stream.disconnect({                                                                                      // 262
          _permanent: true,                                                                                            // 262
          _error: description                                                                                          // 262
        });                                                                                                            // 262
                                                                                                                       //
        options.onDDPVersionNegotiationFailure(description);                                                           // 263
      }                                                                                                                // 264
    } else if (msg.msg === 'ping' && options.respondToPings) {                                                         // 265
      self._send({                                                                                                     // 267
        msg: "pong",                                                                                                   // 267
        id: msg.id                                                                                                     // 267
      });                                                                                                              // 267
    } else if (msg.msg === 'pong') {// noop, as we assume everything's a pong                                          // 268
    } else if (_.include(['added', 'changed', 'removed', 'ready', 'updated'], msg.msg)) self._livedata_data(msg);else if (msg.msg === 'nosub') self._livedata_nosub(msg);else if (msg.msg === 'result') self._livedata_result(msg);else if (msg.msg === 'error') self._livedata_error(msg);else Meteor._debug("discarding unknown livedata message type", msg);
  };                                                                                                                   // 282
                                                                                                                       //
  var onReset = function () {                                                                                          // 284
    // Send a connect message at the beginning of the stream.                                                          // 285
    // NOTE: reset is called even on the first connection, so this is                                                  // 286
    // the only place we send this message.                                                                            // 287
    var msg = {                                                                                                        // 288
      msg: 'connect'                                                                                                   // 288
    };                                                                                                                 // 288
    if (self._lastSessionId) msg.session = self._lastSessionId;                                                        // 289
    msg.version = self._versionSuggestion || self._supportedDDPVersions[0];                                            // 291
    self._versionSuggestion = msg.version;                                                                             // 292
    msg.support = self._supportedDDPVersions;                                                                          // 293
                                                                                                                       //
    self._send(msg); // Mark non-retry calls as failed. This has to be done early as getting these methods out of the  // 294
    // current block is pretty important to making sure that quiescence is properly calculated, as                     // 297
    // well as possibly moving on to another useful block.                                                             // 298
    // Only bother testing if there is an outstandingMethodBlock (there might not be, especially if                    // 300
    // we are connecting for the first time.                                                                           // 301
                                                                                                                       //
                                                                                                                       //
    if (self._outstandingMethodBlocks.length > 0) {                                                                    // 302
      // If there is an outstanding method block, we only care about the first one as that is the                      // 303
      // one that could have already sent messages with no response, that are not allowed to retry.                    // 304
      var currentMethodBlock = self._outstandingMethodBlocks[0].methods;                                               // 305
      self._outstandingMethodBlocks[0].methods = currentMethodBlock.filter(function (methodInvoker) {                  // 306
        // Methods with 'noRetry' option set are not allowed to re-send after                                          // 308
        // recovering dropped connection.                                                                              // 309
        if (methodInvoker.sentMessage && methodInvoker.noRetry) {                                                      // 310
          // Make sure that the method is told that it failed.                                                         // 311
          methodInvoker.receiveResult(new Meteor.Error('invocation-failed', 'Method invocation might have failed due to dropped connection. ' + 'Failing because `noRetry` option was passed to Meteor.apply.'));
        } // Only keep a method if it wasn't sent or it's allowed to retry.                                            // 315
        // This may leave the block empty, but we don't move on to the next                                            // 318
        // block until the callback has been delivered, in _outstandingMethodFinished.                                 // 319
                                                                                                                       //
                                                                                                                       //
        return !(methodInvoker.sentMessage && methodInvoker.noRetry);                                                  // 320
      });                                                                                                              // 321
    } // Now, to minimize setup latency, go ahead and blast out all of                                                 // 322
    // our pending methods ands subscriptions before we've even taken                                                  // 325
    // the necessary RTT to know if we successfully reconnected. (1)                                                   // 326
    // They're supposed to be idempotent, and where they are not,                                                      // 327
    // they can block retry in apply; (2) even if we did reconnect,                                                    // 328
    // we're not sure what messages might have gotten lost                                                             // 329
    // (in either direction) since we were disconnected (TCP being                                                     // 330
    // sloppy about that.)                                                                                             // 331
    // If the current block of methods all got their results (but didn't all get                                       // 333
    // their data visible), discard the empty block now.                                                               // 334
                                                                                                                       //
                                                                                                                       //
    if (!_.isEmpty(self._outstandingMethodBlocks) && _.isEmpty(self._outstandingMethodBlocks[0].methods)) {            // 335
      self._outstandingMethodBlocks.shift();                                                                           // 337
    } // Mark all messages as unsent, they have not yet been sent on this                                              // 338
    // connection.                                                                                                     // 341
                                                                                                                       //
                                                                                                                       //
    _.each(self._methodInvokers, function (m) {                                                                        // 342
      m.sentMessage = false;                                                                                           // 343
    }); // If an `onReconnect` handler is set, call it first. Go through                                               // 344
    // some hoops to ensure that methods that are called from within                                                   // 347
    // `onReconnect` get executed _before_ ones that were originally                                                   // 348
    // outstanding (since `onReconnect` is used to re-establish auth                                                   // 349
    // certificates)                                                                                                   // 350
                                                                                                                       //
                                                                                                                       //
    if (self.onReconnect) self._callOnReconnectAndSendAppropriateOutstandingMethods();else self._sendOutstandingMethods(); // add new subscriptions at the end. this way they take effect after
    // the handlers and we don't see flicker.                                                                          // 357
                                                                                                                       //
    _.each(self._subscriptions, function (sub, id) {                                                                   // 358
      self._send({                                                                                                     // 359
        msg: 'sub',                                                                                                    // 360
        id: id,                                                                                                        // 361
        name: sub.name,                                                                                                // 362
        params: sub.params                                                                                             // 363
      });                                                                                                              // 359
    });                                                                                                                // 365
  };                                                                                                                   // 366
                                                                                                                       //
  var onDisconnect = function () {                                                                                     // 368
    if (self._heartbeat) {                                                                                             // 369
      self._heartbeat.stop();                                                                                          // 370
                                                                                                                       //
      self._heartbeat = null;                                                                                          // 371
    }                                                                                                                  // 372
  };                                                                                                                   // 373
                                                                                                                       //
  if (Meteor.isServer) {                                                                                               // 375
    self._stream.on('message', Meteor.bindEnvironment(onMessage, "handling DDP message"));                             // 376
                                                                                                                       //
    self._stream.on('reset', Meteor.bindEnvironment(onReset, "handling DDP reset"));                                   // 377
                                                                                                                       //
    self._stream.on('disconnect', Meteor.bindEnvironment(onDisconnect, "handling DDP disconnect"));                    // 378
  } else {                                                                                                             // 379
    self._stream.on('message', onMessage);                                                                             // 380
                                                                                                                       //
    self._stream.on('reset', onReset);                                                                                 // 381
                                                                                                                       //
    self._stream.on('disconnect', onDisconnect);                                                                       // 382
  }                                                                                                                    // 383
}; // A MethodInvoker manages sending a method to the server and calling the user's                                    // 384
// callbacks. On construction, it registers itself in the connection's                                                 // 387
// _methodInvokers map; it removes itself once the method is fully finished and                                        // 388
// the callback is invoked. This occurs when it has both received a result,                                            // 389
// and the data written by it is fully visible.                                                                        // 390
                                                                                                                       //
                                                                                                                       //
var MethodInvoker = function (options) {                                                                               // 391
  var self = this; // Public (within this file) fields.                                                                // 392
                                                                                                                       //
  self.methodId = options.methodId;                                                                                    // 395
  self.sentMessage = false;                                                                                            // 396
  self._callback = options.callback;                                                                                   // 398
  self._connection = options.connection;                                                                               // 399
  self._message = options.message;                                                                                     // 400
                                                                                                                       //
  self._onResultReceived = options.onResultReceived || function () {};                                                 // 401
                                                                                                                       //
  self._wait = options.wait;                                                                                           // 402
  self.noRetry = options.noRetry;                                                                                      // 403
  self._methodResult = null;                                                                                           // 404
  self._dataVisible = false; // Register with the connection.                                                          // 405
                                                                                                                       //
  self._connection._methodInvokers[self.methodId] = self;                                                              // 408
};                                                                                                                     // 409
                                                                                                                       //
_.extend(MethodInvoker.prototype, {                                                                                    // 410
  // Sends the method message to the server. May be called additional times if                                         // 411
  // we lose the connection and reconnect before receiving a result.                                                   // 412
  sendMessage: function () {                                                                                           // 413
    var self = this; // This function is called before sending a method (including resending on                        // 414
    // reconnect). We should only (re)send methods where we don't already have a                                       // 416
    // result!                                                                                                         // 417
                                                                                                                       //
    if (self.gotResult()) throw new Error("sendingMethod is called on method with result"); // If we're re-sending it, it doesn't matter if data was written the first
    // time.                                                                                                           // 423
                                                                                                                       //
    self._dataVisible = false;                                                                                         // 424
    self.sentMessage = true; // If this is a wait method, make all data messages be buffered until it is               // 425
    // done.                                                                                                           // 428
                                                                                                                       //
    if (self._wait) self._connection._methodsBlockingQuiescence[self.methodId] = true; // Actually send the message.   // 429
                                                                                                                       //
    self._connection._send(self._message);                                                                             // 433
  },                                                                                                                   // 434
  // Invoke the callback, if we have both a result and know that all data has                                          // 435
  // been written to the local cache.                                                                                  // 436
  _maybeInvokeCallback: function () {                                                                                  // 437
    var self = this;                                                                                                   // 438
                                                                                                                       //
    if (self._methodResult && self._dataVisible) {                                                                     // 439
      // Call the callback. (This won't throw: the callback was wrapped with                                           // 440
      // bindEnvironment.)                                                                                             // 441
      self._callback(self._methodResult[0], self._methodResult[1]); // Forget about this method.                       // 442
                                                                                                                       //
                                                                                                                       //
      delete self._connection._methodInvokers[self.methodId]; // Let the connection know that this method is finished, so it can try to
      // move on to the next block of methods.                                                                         // 448
                                                                                                                       //
      self._connection._outstandingMethodFinished();                                                                   // 449
    }                                                                                                                  // 450
  },                                                                                                                   // 451
  // Call with the result of the method from the server. Only may be called                                            // 452
  // once; once it is called, you should not call sendMessage again.                                                   // 453
  // If the user provided an onResultReceived callback, call it immediately.                                           // 454
  // Then invoke the main callback if data is also visible.                                                            // 455
  receiveResult: function (err, result) {                                                                              // 456
    var self = this;                                                                                                   // 457
    if (self.gotResult()) throw new Error("Methods should only receive results once");                                 // 458
    self._methodResult = [err, result];                                                                                // 460
                                                                                                                       //
    self._onResultReceived(err, result);                                                                               // 461
                                                                                                                       //
    self._maybeInvokeCallback();                                                                                       // 462
  },                                                                                                                   // 463
  // Call this when all data written by the method is visible. This means that                                         // 464
  // the method has returns its "data is done" message *AND* all server                                                // 465
  // documents that are buffered at that time have been written to the local                                           // 466
  // cache. Invokes the main callback if the result has been received.                                                 // 467
  dataVisible: function () {                                                                                           // 468
    var self = this;                                                                                                   // 469
    self._dataVisible = true;                                                                                          // 470
                                                                                                                       //
    self._maybeInvokeCallback();                                                                                       // 471
  },                                                                                                                   // 472
  // True if receiveResult has been called.                                                                            // 473
  gotResult: function () {                                                                                             // 474
    var self = this;                                                                                                   // 475
    return !!self._methodResult;                                                                                       // 476
  }                                                                                                                    // 477
});                                                                                                                    // 410
                                                                                                                       //
_.extend(Connection.prototype, {                                                                                       // 480
  // 'name' is the name of the data on the wire that should go in the                                                  // 481
  // store. 'wrappedStore' should be an object with methods beginUpdate, update,                                       // 482
  // endUpdate, saveOriginals, retrieveOriginals. see Collection for an example.                                       // 483
  registerStore: function (name, wrappedStore) {                                                                       // 484
    var self = this;                                                                                                   // 485
    if (name in self._stores) return false; // Wrap the input object in an object which makes any store method not     // 487
    // implemented by 'store' into a no-op.                                                                            // 491
                                                                                                                       //
    var store = {};                                                                                                    // 492
                                                                                                                       //
    _.each(['update', 'beginUpdate', 'endUpdate', 'saveOriginals', 'retrieveOriginals', 'getDoc', '_getCollection'], function (method) {
      store[method] = function () {                                                                                    // 496
        return wrappedStore[method] ? wrappedStore[method].apply(wrappedStore, arguments) : undefined;                 // 497
      };                                                                                                               // 500
    });                                                                                                                // 501
                                                                                                                       //
    self._stores[name] = store;                                                                                        // 503
    var queued = self._updatesForUnknownStores[name];                                                                  // 505
                                                                                                                       //
    if (queued) {                                                                                                      // 506
      store.beginUpdate(queued.length, false);                                                                         // 507
                                                                                                                       //
      _.each(queued, function (msg) {                                                                                  // 508
        store.update(msg);                                                                                             // 509
      });                                                                                                              // 510
                                                                                                                       //
      store.endUpdate();                                                                                               // 511
      delete self._updatesForUnknownStores[name];                                                                      // 512
    }                                                                                                                  // 513
                                                                                                                       //
    return true;                                                                                                       // 515
  },                                                                                                                   // 516
  /**                                                                                                                  // 518
   * @memberOf Meteor                                                                                                  //
   * @importFromPackage meteor                                                                                         //
   * @summary Subscribe to a record set.  Returns a handle that provides                                               //
   * `stop()` and `ready()` methods.                                                                                   //
   * @locus Client                                                                                                     //
   * @param {String} name Name of the subscription.  Matches the name of the                                           //
   * server's `publish()` call.                                                                                        //
   * @param {EJSONable} [arg1,arg2...] Optional arguments passed to publisher                                          //
   * function on server.                                                                                               //
   * @param {Function|Object} [callbacks] Optional. May include `onStop`                                               //
   * and `onReady` callbacks. If there is an error, it is passed as an                                                 //
   * argument to `onStop`. If a function is passed instead of an object, it                                            //
   * is interpreted as an `onReady` callback.                                                                          //
   */subscribe: function (name /* .. [arguments] .. (callback|callbacks) */) {                                         //
    var self = this;                                                                                                   // 534
    var params = Array.prototype.slice.call(arguments, 1);                                                             // 536
    var callbacks = {};                                                                                                // 537
                                                                                                                       //
    if (params.length) {                                                                                               // 538
      var lastParam = params[params.length - 1];                                                                       // 539
                                                                                                                       //
      if (_.isFunction(lastParam)) {                                                                                   // 540
        callbacks.onReady = params.pop();                                                                              // 541
      } else if (lastParam && // XXX COMPAT WITH 1.0.3.1 onError used to exist, but now we use                         // 542
      // onStop with an error callback instead.                                                                        // 544
      _.any([lastParam.onReady, lastParam.onError, lastParam.onStop], _.isFunction)) {                                 // 545
        callbacks = params.pop();                                                                                      // 547
      }                                                                                                                // 548
    } // Is there an existing sub with the same name and param, run in an                                              // 549
    // invalidated Computation? This will happen if we are rerunning an                                                // 552
    // existing computation.                                                                                           // 553
    //                                                                                                                 // 554
    // For example, consider a rerun of:                                                                               // 555
    //                                                                                                                 // 556
    //     Tracker.autorun(function () {                                                                               // 557
    //       Meteor.subscribe("foo", Session.get("foo"));                                                              // 558
    //       Meteor.subscribe("bar", Session.get("bar"));                                                              // 559
    //     });                                                                                                         // 560
    //                                                                                                                 // 561
    // If "foo" has changed but "bar" has not, we will match the "bar"                                                 // 562
    // subcribe to an existing inactive subscription in order to not                                                   // 563
    // unsub and resub the subscription unnecessarily.                                                                 // 564
    //                                                                                                                 // 565
    // We only look for one such sub; if there are N apparently-identical subs                                         // 566
    // being invalidated, we will require N matching subscribe calls to keep                                           // 567
    // them all active.                                                                                                // 568
                                                                                                                       //
                                                                                                                       //
    var existing = _.find(self._subscriptions, function (sub) {                                                        // 569
      return sub.inactive && sub.name === name && EJSON.equals(sub.params, params);                                    // 570
    });                                                                                                                // 572
                                                                                                                       //
    var id;                                                                                                            // 574
                                                                                                                       //
    if (existing) {                                                                                                    // 575
      id = existing.id;                                                                                                // 576
      existing.inactive = false; // reactivate                                                                         // 577
                                                                                                                       //
      if (callbacks.onReady) {                                                                                         // 579
        // If the sub is not already ready, replace any ready callback with the                                        // 580
        // one provided now. (It's not really clear what users would expect for                                        // 581
        // an onReady callback inside an autorun; the semantics we provide is                                          // 582
        // that at the time the sub first becomes ready, we call the last                                              // 583
        // onReady callback provided, if any.)                                                                         // 584
        if (!existing.ready) existing.readyCallback = callbacks.onReady;                                               // 585
      } // XXX COMPAT WITH 1.0.3.1 we used to have onError but now we call                                             // 587
      // onStop with an optional error argument                                                                        // 590
                                                                                                                       //
                                                                                                                       //
      if (callbacks.onError) {                                                                                         // 591
        // Replace existing callback if any, so that errors aren't                                                     // 592
        // double-reported.                                                                                            // 593
        existing.errorCallback = callbacks.onError;                                                                    // 594
      }                                                                                                                // 595
                                                                                                                       //
      if (callbacks.onStop) {                                                                                          // 597
        existing.stopCallback = callbacks.onStop;                                                                      // 598
      }                                                                                                                // 599
    } else {                                                                                                           // 600
      // New sub! Generate an id, save it locally, and send message.                                                   // 601
      id = Random.id();                                                                                                // 602
      self._subscriptions[id] = {                                                                                      // 603
        id: id,                                                                                                        // 604
        name: name,                                                                                                    // 605
        params: EJSON.clone(params),                                                                                   // 606
        inactive: false,                                                                                               // 607
        ready: false,                                                                                                  // 608
        readyDeps: new Tracker.Dependency(),                                                                           // 609
        readyCallback: callbacks.onReady,                                                                              // 610
        // XXX COMPAT WITH 1.0.3.1 #errorCallback                                                                      // 611
        errorCallback: callbacks.onError,                                                                              // 612
        stopCallback: callbacks.onStop,                                                                                // 613
        connection: self,                                                                                              // 614
        remove: function () {                                                                                          // 615
          delete this.connection._subscriptions[this.id];                                                              // 616
          this.ready && this.readyDeps.changed();                                                                      // 617
        },                                                                                                             // 618
        stop: function () {                                                                                            // 619
          this.connection._send({                                                                                      // 620
            msg: 'unsub',                                                                                              // 620
            id: id                                                                                                     // 620
          });                                                                                                          // 620
                                                                                                                       //
          this.remove();                                                                                               // 621
                                                                                                                       //
          if (callbacks.onStop) {                                                                                      // 623
            callbacks.onStop();                                                                                        // 624
          }                                                                                                            // 625
        }                                                                                                              // 626
      };                                                                                                               // 603
                                                                                                                       //
      self._send({                                                                                                     // 628
        msg: 'sub',                                                                                                    // 628
        id: id,                                                                                                        // 628
        name: name,                                                                                                    // 628
        params: params                                                                                                 // 628
      });                                                                                                              // 628
    } // return a handle to the application.                                                                           // 629
                                                                                                                       //
                                                                                                                       //
    var handle = {                                                                                                     // 632
      stop: function () {                                                                                              // 633
        if (!_.has(self._subscriptions, id)) return;                                                                   // 634
                                                                                                                       //
        self._subscriptions[id].stop();                                                                                // 637
      },                                                                                                               // 638
      ready: function () {                                                                                             // 639
        // return false if we've unsubscribed.                                                                         // 640
        if (!_.has(self._subscriptions, id)) return false;                                                             // 641
        var record = self._subscriptions[id];                                                                          // 643
        record.readyDeps.depend();                                                                                     // 644
        return record.ready;                                                                                           // 645
      },                                                                                                               // 646
      subscriptionId: id                                                                                               // 647
    };                                                                                                                 // 632
                                                                                                                       //
    if (Tracker.active) {                                                                                              // 650
      // We're in a reactive computation, so we'd like to unsubscribe when the                                         // 651
      // computation is invalidated... but not if the rerun just re-subscribes                                         // 652
      // to the same subscription!  When a rerun happens, we use onInvalidate                                          // 653
      // as a change to mark the subscription "inactive" so that it can                                                // 654
      // be reused from the rerun.  If it isn't reused, it's killed from                                               // 655
      // an afterFlush.                                                                                                // 656
      Tracker.onInvalidate(function (c) {                                                                              // 657
        if (_.has(self._subscriptions, id)) self._subscriptions[id].inactive = true;                                   // 658
        Tracker.afterFlush(function () {                                                                               // 661
          if (_.has(self._subscriptions, id) && self._subscriptions[id].inactive) handle.stop();                       // 662
        });                                                                                                            // 665
      });                                                                                                              // 666
    }                                                                                                                  // 667
                                                                                                                       //
    return handle;                                                                                                     // 669
  },                                                                                                                   // 670
  // options:                                                                                                          // 672
  // - onLateError {Function(error)} called if an error was received after the ready event.                            // 673
  //     (errors received before ready cause an error to be thrown)                                                    // 674
  _subscribeAndWait: function (name, args, options) {                                                                  // 675
    var self = this;                                                                                                   // 676
    var f = new Future();                                                                                              // 677
    var ready = false;                                                                                                 // 678
    var handle;                                                                                                        // 679
    args = args || [];                                                                                                 // 680
    args.push({                                                                                                        // 681
      onReady: function () {                                                                                           // 682
        ready = true;                                                                                                  // 683
        f['return']();                                                                                                 // 684
      },                                                                                                               // 685
      onError: function (e) {                                                                                          // 686
        if (!ready) f['throw'](e);else options && options.onLateError && options.onLateError(e);                       // 687
      }                                                                                                                // 691
    });                                                                                                                // 681
    handle = self.subscribe.apply(self, [name].concat(args));                                                          // 694
    f.wait();                                                                                                          // 695
    return handle;                                                                                                     // 696
  },                                                                                                                   // 697
  methods: function (methods) {                                                                                        // 699
    var self = this;                                                                                                   // 700
                                                                                                                       //
    _.each(methods, function (func, name) {                                                                            // 701
      if (typeof func !== 'function') throw new Error("Method '" + name + "' must be a function");                     // 702
      if (self._methodHandlers[name]) throw new Error("A method named '" + name + "' is already defined");             // 704
      self._methodHandlers[name] = func;                                                                               // 706
    });                                                                                                                // 707
  },                                                                                                                   // 708
  /**                                                                                                                  // 710
   * @memberOf Meteor                                                                                                  //
   * @importFromPackage meteor                                                                                         //
   * @summary Invokes a method passing any number of arguments.                                                        //
   * @locus Anywhere                                                                                                   //
   * @param {String} name Name of method to invoke                                                                     //
   * @param {EJSONable} [arg1,arg2...] Optional method arguments                                                       //
   * @param {Function} [asyncCallback] Optional callback, which is called asynchronously with the error or result after the method is complete. If not provided, the method runs synchronously if possible (see below).
   */call: function (name /* .. [arguments] .. callback */) {                                                          //
    // if it's a function, the last argument is the result callback,                                                   // 720
    // not a parameter to the remote method.                                                                           // 721
    var args = Array.prototype.slice.call(arguments, 1);                                                               // 722
    if (args.length && typeof args[args.length - 1] === "function") var callback = args.pop();                         // 723
    return this.apply(name, args, callback);                                                                           // 725
  },                                                                                                                   // 726
  // @param options {Optional Object}                                                                                  // 728
  //   wait: Boolean - Should we wait to call this until all current methods                                           // 729
  //                   are fully finished, and block subsequent method calls                                           // 730
  //                   until this method is fully finished?                                                            // 731
  //                   (does not affect methods called from within this method)                                        // 732
  //   onResultReceived: Function - a callback to call as soon as the method                                           // 733
  //                                result is received. the data written by                                            // 734
  //                                the method may not yet be in the cache!                                            // 735
  //   returnStubValue: Boolean - If true then in cases where we would have                                            // 736
  //                              otherwise discarded the stub's return value                                          // 737
  //                              and returned undefined, instead we go ahead                                          // 738
  //                              and return it.  Specifically, this is any                                            // 739
  //                              time other than when (a) we are already                                              // 740
  //                              inside a stub or (b) we are in Node and no                                           // 741
  //                              callback was provided.  Currently we require                                         // 742
  //                              this flag to be explicitly passed to reduce                                          // 743
  //                              the likelihood that stub return values will                                          // 744
  //                              be confused with server return values; we                                            // 745
  //                              may improve this in future.                                                          // 746
  // @param callback {Optional Function}                                                                               // 747
  /**                                                                                                                  // 749
   * @memberOf Meteor                                                                                                  //
   * @importFromPackage meteor                                                                                         //
   * @summary Invoke a method passing an array of arguments.                                                           //
   * @locus Anywhere                                                                                                   //
   * @param {String} name Name of method to invoke                                                                     //
   * @param {EJSONable[]} args Method arguments                                                                        //
   * @param {Object} [options]                                                                                         //
   * @param {Boolean} options.wait (Client only) If true, don't send this method until all previous method calls have completed, and don't send any subsequent method calls until this one is completed.
   * @param {Function} options.onResultReceived (Client only) This callback is invoked with the error or result of the method (just like `asyncCallback`) as soon as the error or result is available. The local cache may not yet reflect the writes performed by the method.
   * @param {Boolean} options.noRetry (Client only) if true, don't send this method again on reload, simply call the callback an error with the error code 'invocation-failed'.
   * @param {Boolean} options.throwStubExceptions (Client only) If true, exceptions thrown by method stubs will be thrown instead of logged, and the method will not be invoked on the server.
   * @param {Function} [asyncCallback] Optional callback; same semantics as in [`Meteor.call`](#meteor_call).          //
   */apply: function (name, args, options, callback) {                                                                 //
    var self = this; // We were passed 3 arguments. They may be either (name, args, options)                           // 764
    // or (name, args, callback)                                                                                       // 767
                                                                                                                       //
    if (!callback && typeof options === 'function') {                                                                  // 768
      callback = options;                                                                                              // 769
      options = {};                                                                                                    // 770
    }                                                                                                                  // 771
                                                                                                                       //
    options = options || {};                                                                                           // 772
                                                                                                                       //
    if (callback) {                                                                                                    // 774
      // XXX would it be better form to do the binding in stream.on,                                                   // 775
      // or caller, instead of here?                                                                                   // 776
      // XXX improve error message (and how we report it)                                                              // 777
      callback = Meteor.bindEnvironment(callback, "delivering result of invoking '" + name + "'");                     // 778
    } // Keep our args safe from mutation (eg if we don't send the message for a                                       // 782
    // while because of a wait method).                                                                                // 785
                                                                                                                       //
                                                                                                                       //
    args = EJSON.clone(args); // Lazily allocate method ID once we know that it'll be needed.                          // 786
                                                                                                                       //
    var methodId = function () {                                                                                       // 789
      var id;                                                                                                          // 790
      return function () {                                                                                             // 791
        if (id === undefined) id = '' + self._nextMethodId++;                                                          // 792
        return id;                                                                                                     // 794
      };                                                                                                               // 795
    }();                                                                                                               // 796
                                                                                                                       //
    var enclosing = DDP._CurrentInvocation.get();                                                                      // 798
                                                                                                                       //
    var alreadyInSimulation = enclosing && enclosing.isSimulation; // Lazily generate a randomSeed, only if it is requested by the stub.
    // The random streams only have utility if they're used on both the client                                         // 802
    // and the server; if the client doesn't generate any 'random' values                                              // 803
    // then we don't expect the server to generate any either.                                                         // 804
    // Less commonly, the server may perform different actions from the client,                                        // 805
    // and may in fact generate values where the client did not, but we don't                                          // 806
    // have any client-side values to match, so even here we may as well just                                          // 807
    // use a random seed on the server.  In that case, we don't pass the                                               // 808
    // randomSeed to save bandwidth, and we don't even generate it to save a                                           // 809
    // bit of CPU and to avoid consuming entropy.                                                                      // 810
                                                                                                                       //
    var randomSeed = null;                                                                                             // 811
                                                                                                                       //
    var randomSeedGenerator = function () {                                                                            // 812
      if (randomSeed === null) {                                                                                       // 813
        randomSeed = DDPCommon.makeRpcSeed(enclosing, name);                                                           // 814
      }                                                                                                                // 815
                                                                                                                       //
      return randomSeed;                                                                                               // 816
    }; // Run the stub, if we have one. The stub is supposed to make some                                              // 817
    // temporary writes to the database to give the user a smooth experience                                           // 820
    // until the actual result of executing the method comes back from the                                             // 821
    // server (whereupon the temporary writes to the database will be reversed                                         // 822
    // during the beginUpdate/endUpdate process.)                                                                      // 823
    //                                                                                                                 // 824
    // Normally, we ignore the return value of the stub (even if it is an                                              // 825
    // exception), in favor of the real return value from the server. The                                              // 826
    // exception is if the *caller* is a stub. In that case, we're not going                                           // 827
    // to do a RPC, so we use the return value of the stub as our return                                               // 828
    // value.                                                                                                          // 829
                                                                                                                       //
                                                                                                                       //
    var stub = self._methodHandlers[name];                                                                             // 831
                                                                                                                       //
    if (stub) {                                                                                                        // 832
      var setUserId = function (userId) {                                                                              // 833
        self.setUserId(userId);                                                                                        // 834
      };                                                                                                               // 835
                                                                                                                       //
      var invocation = new DDPCommon.MethodInvocation({                                                                // 837
        isSimulation: true,                                                                                            // 838
        userId: self.userId(),                                                                                         // 839
        setUserId: setUserId,                                                                                          // 840
        randomSeed: function () {                                                                                      // 841
          return randomSeedGenerator();                                                                                // 841
        }                                                                                                              // 841
      });                                                                                                              // 837
      if (!alreadyInSimulation) self._saveOriginals();                                                                 // 844
                                                                                                                       //
      try {                                                                                                            // 847
        // Note that unlike in the corresponding server code, we never audit                                           // 848
        // that stubs check() their arguments.                                                                         // 849
        var stubReturnValue = DDP._CurrentInvocation.withValue(invocation, function () {                               // 850
          if (Meteor.isServer) {                                                                                       // 851
            // Because saveOriginals and retrieveOriginals aren't reentrant,                                           // 852
            // don't allow stubs to yield.                                                                             // 853
            return Meteor._noYieldsAllowed(function () {                                                               // 854
              // re-clone, so that the stub can't affect our caller's values                                           // 855
              return stub.apply(invocation, EJSON.clone(args));                                                        // 856
            });                                                                                                        // 857
          } else {                                                                                                     // 858
            return stub.apply(invocation, EJSON.clone(args));                                                          // 859
          }                                                                                                            // 860
        });                                                                                                            // 861
      } catch (e) {                                                                                                    // 862
        var exception = e;                                                                                             // 864
      }                                                                                                                // 865
                                                                                                                       //
      if (!alreadyInSimulation) self._retrieveAndStoreOriginals(methodId());                                           // 867
    } // If we're in a simulation, stop and return the result we have,                                                 // 869
    // rather than going on to do an RPC. If there was no stub,                                                        // 872
    // we'll end up returning undefined.                                                                               // 873
                                                                                                                       //
                                                                                                                       //
    if (alreadyInSimulation) {                                                                                         // 874
      if (callback) {                                                                                                  // 875
        callback(exception, stubReturnValue);                                                                          // 876
        return undefined;                                                                                              // 877
      }                                                                                                                // 878
                                                                                                                       //
      if (exception) throw exception;                                                                                  // 879
      return stubReturnValue;                                                                                          // 881
    } // If an exception occurred in a stub, and we're ignoring it                                                     // 882
    // because we're doing an RPC and want to use what the server                                                      // 885
    // returns instead, log it so the developer knows                                                                  // 886
    // (unless they explicitly ask to see the error).                                                                  // 887
    //                                                                                                                 // 888
    // Tests can set the 'expected' flag on an exception so it won't                                                   // 889
    // go to log.                                                                                                      // 890
                                                                                                                       //
                                                                                                                       //
    if (exception) {                                                                                                   // 891
      if (options.throwStubExceptions) {                                                                               // 892
        throw exception;                                                                                               // 893
      } else if (!exception.expected) {                                                                                // 894
        Meteor._debug("Exception while simulating the effect of invoking '" + name + "'", exception, exception.stack);
      }                                                                                                                // 897
    } // At this point we're definitely doing an RPC, and we're going to                                               // 898
    // return the value of the RPC to the caller.                                                                      // 902
    // If the caller didn't give a callback, decide what to do.                                                        // 904
                                                                                                                       //
                                                                                                                       //
    if (!callback) {                                                                                                   // 905
      if (Meteor.isClient) {                                                                                           // 906
        // On the client, we don't have fibers, so we can't block. The                                                 // 907
        // only thing we can do is to return undefined and discard the                                                 // 908
        // result of the RPC. If an error occurred then print the error                                                // 909
        // to the console.                                                                                             // 910
        callback = function (err) {                                                                                    // 911
          err && Meteor._debug("Error invoking Method '" + name + "':", err.message);                                  // 912
        };                                                                                                             // 914
      } else {                                                                                                         // 915
        // On the server, make the function synchronous. Throw on                                                      // 916
        // errors, return on success.                                                                                  // 917
        var future = new Future();                                                                                     // 918
        callback = future.resolver();                                                                                  // 919
      }                                                                                                                // 920
    } // Send the RPC. Note that on the client, it is important that the                                               // 921
    // stub have finished before we send the RPC, so that we know we have                                              // 923
    // a complete list of which local documents the stub wrote.                                                        // 924
                                                                                                                       //
                                                                                                                       //
    var message = {                                                                                                    // 925
      msg: 'method',                                                                                                   // 926
      method: name,                                                                                                    // 927
      params: args,                                                                                                    // 928
      id: methodId()                                                                                                   // 929
    }; // Send the randomSeed only if we used it                                                                       // 925
                                                                                                                       //
    if (randomSeed !== null) {                                                                                         // 933
      message.randomSeed = randomSeed;                                                                                 // 934
    }                                                                                                                  // 935
                                                                                                                       //
    var methodInvoker = new MethodInvoker({                                                                            // 937
      methodId: methodId(),                                                                                            // 938
      callback: callback,                                                                                              // 939
      connection: self,                                                                                                // 940
      onResultReceived: options.onResultReceived,                                                                      // 941
      wait: !!options.wait,                                                                                            // 942
      message: message,                                                                                                // 943
      noRetry: !!options.noRetry                                                                                       // 944
    });                                                                                                                // 937
                                                                                                                       //
    if (options.wait) {                                                                                                // 947
      // It's a wait method! Wait methods go in their own block.                                                       // 948
      self._outstandingMethodBlocks.push({                                                                             // 949
        wait: true,                                                                                                    // 950
        methods: [methodInvoker]                                                                                       // 950
      });                                                                                                              // 950
    } else {                                                                                                           // 951
      // Not a wait method. Start a new block if the previous block was a wait                                         // 952
      // block, and add it to the last block of methods.                                                               // 953
      if (_.isEmpty(self._outstandingMethodBlocks) || _.last(self._outstandingMethodBlocks).wait) self._outstandingMethodBlocks.push({
        wait: false,                                                                                                   // 956
        methods: []                                                                                                    // 956
      });                                                                                                              // 956
                                                                                                                       //
      _.last(self._outstandingMethodBlocks).methods.push(methodInvoker);                                               // 957
    } // If we added it to the first block, send it out now.                                                           // 958
                                                                                                                       //
                                                                                                                       //
    if (self._outstandingMethodBlocks.length === 1) methodInvoker.sendMessage(); // If we're using the default callback on the server,
    // block waiting for the result.                                                                                   // 965
                                                                                                                       //
    if (future) {                                                                                                      // 966
      return future.wait();                                                                                            // 967
    }                                                                                                                  // 968
                                                                                                                       //
    return options.returnStubValue ? stubReturnValue : undefined;                                                      // 969
  },                                                                                                                   // 970
  // Before calling a method stub, prepare all stores to track changes and allow                                       // 972
  // _retrieveAndStoreOriginals to get the original versions of changed                                                // 973
  // documents.                                                                                                        // 974
  _saveOriginals: function () {                                                                                        // 975
    var self = this;                                                                                                   // 976
    if (!self._waitingForQuiescence()) self._flushBufferedWrites();                                                    // 977
                                                                                                                       //
    _.each(self._stores, function (s) {                                                                                // 979
      s.saveOriginals();                                                                                               // 980
    });                                                                                                                // 981
  },                                                                                                                   // 982
  // Retrieves the original versions of all documents modified by the stub for                                         // 983
  // method 'methodId' from all stores and saves them to _serverDocuments (keyed                                       // 984
  // by document) and _documentsWrittenByStub (keyed by method ID).                                                    // 985
  _retrieveAndStoreOriginals: function (methodId) {                                                                    // 986
    var self = this;                                                                                                   // 987
    if (self._documentsWrittenByStub[methodId]) throw new Error("Duplicate methodId in _retrieveAndStoreOriginals");   // 988
    var docsWritten = [];                                                                                              // 991
                                                                                                                       //
    _.each(self._stores, function (s, collection) {                                                                    // 992
      var originals = s.retrieveOriginals(); // not all stores define retrieveOriginals                                // 993
                                                                                                                       //
      if (!originals) return;                                                                                          // 995
      originals.forEach(function (doc, id) {                                                                           // 997
        docsWritten.push({                                                                                             // 998
          collection: collection,                                                                                      // 998
          id: id                                                                                                       // 998
        });                                                                                                            // 998
        if (!_.has(self._serverDocuments, collection)) self._serverDocuments[collection] = new MongoIDMap();           // 999
                                                                                                                       //
        var serverDoc = self._serverDocuments[collection].setDefault(id, {});                                          // 1001
                                                                                                                       //
        if (serverDoc.writtenByStubs) {                                                                                // 1002
          // We're not the first stub to write this doc. Just add our method ID                                        // 1003
          // to the record.                                                                                            // 1004
          serverDoc.writtenByStubs[methodId] = true;                                                                   // 1005
        } else {                                                                                                       // 1006
          // First stub! Save the original value and our method ID.                                                    // 1007
          serverDoc.document = doc;                                                                                    // 1008
          serverDoc.flushCallbacks = [];                                                                               // 1009
          serverDoc.writtenByStubs = {};                                                                               // 1010
          serverDoc.writtenByStubs[methodId] = true;                                                                   // 1011
        }                                                                                                              // 1012
      });                                                                                                              // 1013
    });                                                                                                                // 1014
                                                                                                                       //
    if (!_.isEmpty(docsWritten)) {                                                                                     // 1015
      self._documentsWrittenByStub[methodId] = docsWritten;                                                            // 1016
    }                                                                                                                  // 1017
  },                                                                                                                   // 1018
  // This is very much a private function we use to make the tests                                                     // 1020
  // take up fewer server resources after they complete.                                                               // 1021
  _unsubscribeAll: function () {                                                                                       // 1022
    var self = this;                                                                                                   // 1023
                                                                                                                       //
    _.each(_.clone(self._subscriptions), function (sub, id) {                                                          // 1024
      // Avoid killing the autoupdate subscription so that developers                                                  // 1025
      // still get hot code pushes when writing tests.                                                                 // 1026
      //                                                                                                               // 1027
      // XXX it's a hack to encode knowledge about autoupdate here,                                                    // 1028
      // but it doesn't seem worth it yet to have a special API for                                                    // 1029
      // subscriptions to preserve after unit tests.                                                                   // 1030
      if (sub.name !== 'meteor_autoupdate_clientVersions') {                                                           // 1031
        self._subscriptions[id].stop();                                                                                // 1032
      }                                                                                                                // 1033
    });                                                                                                                // 1034
  },                                                                                                                   // 1035
  // Sends the DDP stringification of the given message object                                                         // 1037
  _send: function (obj) {                                                                                              // 1038
    var self = this;                                                                                                   // 1039
                                                                                                                       //
    self._stream.send(DDPCommon.stringifyDDP(obj));                                                                    // 1040
  },                                                                                                                   // 1041
  // We detected via DDP-level heartbeats that we've lost the                                                          // 1043
  // connection.  Unlike `disconnect` or `close`, a lost connection                                                    // 1044
  // will be automatically retried.                                                                                    // 1045
  _lostConnection: function (error) {                                                                                  // 1046
    var self = this;                                                                                                   // 1047
                                                                                                                       //
    self._stream._lostConnection(error);                                                                               // 1048
  },                                                                                                                   // 1049
  /**                                                                                                                  // 1051
   * @summary Get the current connection status. A reactive data source.                                               //
   * @locus Client                                                                                                     //
   * @memberOf Meteor                                                                                                  //
   * @importFromPackage meteor                                                                                         //
   */status: function () /*passthrough args*/{                                                                         //
    var self = this;                                                                                                   // 1058
    return self._stream.status.apply(self._stream, arguments);                                                         // 1059
  },                                                                                                                   // 1060
  /**                                                                                                                  // 1062
   * @summary Force an immediate reconnection attempt if the client is not connected to the server.                    //
   This method does nothing if the client is already connected.                                                        //
   * @locus Client                                                                                                     //
   * @memberOf Meteor                                                                                                  //
   * @importFromPackage meteor                                                                                         //
   */reconnect: function () /*passthrough args*/{                                                                      //
    var self = this;                                                                                                   // 1071
    return self._stream.reconnect.apply(self._stream, arguments);                                                      // 1072
  },                                                                                                                   // 1073
  /**                                                                                                                  // 1075
   * @summary Disconnect the client from the server.                                                                   //
   * @locus Client                                                                                                     //
   * @memberOf Meteor                                                                                                  //
   * @importFromPackage meteor                                                                                         //
   */disconnect: function () /*passthrough args*/{                                                                     //
    var self = this;                                                                                                   // 1082
    return self._stream.disconnect.apply(self._stream, arguments);                                                     // 1083
  },                                                                                                                   // 1084
  close: function () {                                                                                                 // 1086
    var self = this;                                                                                                   // 1087
    return self._stream.disconnect({                                                                                   // 1088
      _permanent: true                                                                                                 // 1088
    });                                                                                                                // 1088
  },                                                                                                                   // 1089
  ///                                                                                                                  // 1091
  /// Reactive user system                                                                                             // 1092
  ///                                                                                                                  // 1093
  userId: function () {                                                                                                // 1094
    var self = this;                                                                                                   // 1095
    if (self._userIdDeps) self._userIdDeps.depend();                                                                   // 1096
    return self._userId;                                                                                               // 1098
  },                                                                                                                   // 1099
  setUserId: function (userId) {                                                                                       // 1101
    var self = this; // Avoid invalidating dependents if setUserId is called with current value.                       // 1102
                                                                                                                       //
    if (self._userId === userId) return;                                                                               // 1104
    self._userId = userId;                                                                                             // 1106
    if (self._userIdDeps) self._userIdDeps.changed();                                                                  // 1107
  },                                                                                                                   // 1109
  // Returns true if we are in a state after reconnect of waiting for subs to be                                       // 1111
  // revived or early methods to finish their data, or we are waiting for a                                            // 1112
  // "wait" method to finish.                                                                                          // 1113
  _waitingForQuiescence: function () {                                                                                 // 1114
    var self = this;                                                                                                   // 1115
    return !_.isEmpty(self._subsBeingRevived) || !_.isEmpty(self._methodsBlockingQuiescence);                          // 1116
  },                                                                                                                   // 1118
  // Returns true if any method whose message has been sent to the server has                                          // 1120
  // not yet invoked its user callback.                                                                                // 1121
  _anyMethodsAreOutstanding: function () {                                                                             // 1122
    var self = this;                                                                                                   // 1123
    return _.any(_.pluck(self._methodInvokers, 'sentMessage'));                                                        // 1124
  },                                                                                                                   // 1125
  _livedata_connected: function (msg) {                                                                                // 1127
    var self = this;                                                                                                   // 1128
                                                                                                                       //
    if (self._version !== 'pre1' && self._heartbeatInterval !== 0) {                                                   // 1130
      self._heartbeat = new DDPCommon.Heartbeat({                                                                      // 1131
        heartbeatInterval: self._heartbeatInterval,                                                                    // 1132
        heartbeatTimeout: self._heartbeatTimeout,                                                                      // 1133
        onTimeout: function () {                                                                                       // 1134
          self._lostConnection(new DDP.ConnectionError("DDP heartbeat timed out"));                                    // 1135
        },                                                                                                             // 1137
        sendPing: function () {                                                                                        // 1138
          self._send({                                                                                                 // 1139
            msg: 'ping'                                                                                                // 1139
          });                                                                                                          // 1139
        }                                                                                                              // 1140
      });                                                                                                              // 1131
                                                                                                                       //
      self._heartbeat.start();                                                                                         // 1142
    } // If this is a reconnect, we'll have to reset all stores.                                                       // 1143
                                                                                                                       //
                                                                                                                       //
    if (self._lastSessionId) self._resetStores = true;                                                                 // 1146
                                                                                                                       //
    if (typeof msg.session === "string") {                                                                             // 1149
      var reconnectedToPreviousSession = self._lastSessionId === msg.session;                                          // 1150
      self._lastSessionId = msg.session;                                                                               // 1151
    }                                                                                                                  // 1152
                                                                                                                       //
    if (reconnectedToPreviousSession) {                                                                                // 1154
      // Successful reconnection -- pick up where we left off.  Note that right                                        // 1155
      // now, this never happens: the server never connects us to a previous                                           // 1156
      // session, because DDP doesn't provide enough data for the server to know                                       // 1157
      // what messages the client has processed. We need to improve DDP to make                                        // 1158
      // this possible, at which point we'll probably need more code here.                                             // 1159
      return;                                                                                                          // 1160
    } // Server doesn't have our data any more. Re-sync a new session.                                                 // 1161
    // Forget about messages we were buffering for unknown collections. They'll                                        // 1165
    // be resent if still relevant.                                                                                    // 1166
                                                                                                                       //
                                                                                                                       //
    self._updatesForUnknownStores = {};                                                                                // 1167
                                                                                                                       //
    if (self._resetStores) {                                                                                           // 1169
      // Forget about the effects of stubs. We'll be resetting all collections                                         // 1170
      // anyway.                                                                                                       // 1171
      self._documentsWrittenByStub = {};                                                                               // 1172
      self._serverDocuments = {};                                                                                      // 1173
    } // Clear _afterUpdateCallbacks.                                                                                  // 1174
                                                                                                                       //
                                                                                                                       //
    self._afterUpdateCallbacks = []; // Mark all named subscriptions which are ready (ie, we already called the        // 1177
    // ready callback) as needing to be revived.                                                                       // 1180
    // XXX We should also block reconnect quiescence until unnamed subscriptions                                       // 1181
    //     (eg, autopublish) are done re-publishing to avoid flicker!                                                  // 1182
                                                                                                                       //
    self._subsBeingRevived = {};                                                                                       // 1183
                                                                                                                       //
    _.each(self._subscriptions, function (sub, id) {                                                                   // 1184
      if (sub.ready) self._subsBeingRevived[id] = true;                                                                // 1185
    }); // Arrange for "half-finished" methods to have their callbacks run, and                                        // 1187
    // track methods that were sent on this connection so that we don't                                                // 1190
    // quiesce until they are all done.                                                                                // 1191
    //                                                                                                                 // 1192
    // Start by clearing _methodsBlockingQuiescence: methods sent before                                               // 1193
    // reconnect don't matter, and any "wait" methods sent on the new connection                                       // 1194
    // that we drop here will be restored by the loop below.                                                           // 1195
                                                                                                                       //
                                                                                                                       //
    self._methodsBlockingQuiescence = {};                                                                              // 1196
                                                                                                                       //
    if (self._resetStores) {                                                                                           // 1197
      _.each(self._methodInvokers, function (invoker) {                                                                // 1198
        if (invoker.gotResult()) {                                                                                     // 1199
          // This method already got its result, but it didn't call its callback                                       // 1200
          // because its data didn't become visible. We did not resend the                                             // 1201
          // method RPC. We'll call its callback when we get a full quiesce,                                           // 1202
          // since that's as close as we'll get to "data must be visible".                                             // 1203
          self._afterUpdateCallbacks.push(_.bind(invoker.dataVisible, invoker));                                       // 1204
        } else if (invoker.sentMessage) {                                                                              // 1205
          // This method has been sent on this connection (maybe as a resend                                           // 1206
          // from the last connection, maybe from onReconnect, maybe just very                                         // 1207
          // quickly before processing the connected message).                                                         // 1208
          //                                                                                                           // 1209
          // We don't need to do anything special to ensure its callbacks get                                          // 1210
          // called, but we'll count it as a method which is preventing                                                // 1211
          // reconnect quiescence. (eg, it might be a login method that was run                                        // 1212
          // from onReconnect, and we don't want to see flicker by seeing a                                            // 1213
          // logged-out state.)                                                                                        // 1214
          self._methodsBlockingQuiescence[invoker.methodId] = true;                                                    // 1215
        }                                                                                                              // 1216
      });                                                                                                              // 1217
    }                                                                                                                  // 1218
                                                                                                                       //
    self._messagesBufferedUntilQuiescence = []; // If we're not waiting on any methods or subs, we can reset the stores and
    // call the callbacks immediately.                                                                                 // 1223
                                                                                                                       //
    if (!self._waitingForQuiescence()) {                                                                               // 1224
      if (self._resetStores) {                                                                                         // 1225
        _.each(self._stores, function (s) {                                                                            // 1226
          s.beginUpdate(0, true);                                                                                      // 1227
          s.endUpdate();                                                                                               // 1228
        });                                                                                                            // 1229
                                                                                                                       //
        self._resetStores = false;                                                                                     // 1230
      }                                                                                                                // 1231
                                                                                                                       //
      self._runAfterUpdateCallbacks();                                                                                 // 1232
    }                                                                                                                  // 1233
  },                                                                                                                   // 1234
  _processOneDataMessage: function (msg, updates) {                                                                    // 1237
    var self = this; // Using underscore here so as not to need to capitalize.                                         // 1238
                                                                                                                       //
    self['_process_' + msg.msg](msg, updates);                                                                         // 1240
  },                                                                                                                   // 1241
  _livedata_data: function (msg) {                                                                                     // 1244
    var self = this;                                                                                                   // 1245
                                                                                                                       //
    if (self._waitingForQuiescence()) {                                                                                // 1247
      self._messagesBufferedUntilQuiescence.push(msg);                                                                 // 1248
                                                                                                                       //
      if (msg.msg === "nosub") delete self._subsBeingRevived[msg.id];                                                  // 1250
                                                                                                                       //
      _.each(msg.subs || [], function (subId) {                                                                        // 1253
        delete self._subsBeingRevived[subId];                                                                          // 1254
      });                                                                                                              // 1255
                                                                                                                       //
      _.each(msg.methods || [], function (methodId) {                                                                  // 1256
        delete self._methodsBlockingQuiescence[methodId];                                                              // 1257
      });                                                                                                              // 1258
                                                                                                                       //
      if (self._waitingForQuiescence()) return; // No methods or subs are blocking quiescence!                         // 1260
      // We'll now process and all of our buffered messages, reset all stores,                                         // 1264
      // and apply them all at once.                                                                                   // 1265
                                                                                                                       //
      _.each(self._messagesBufferedUntilQuiescence, function (bufferedMsg) {                                           // 1266
        self._processOneDataMessage(bufferedMsg, self._bufferedWrites);                                                // 1267
      });                                                                                                              // 1268
                                                                                                                       //
      self._messagesBufferedUntilQuiescence = [];                                                                      // 1269
    } else {                                                                                                           // 1270
      self._processOneDataMessage(msg, self._bufferedWrites);                                                          // 1271
    } // Immediately flush writes when:                                                                                // 1272
    //  1. Buffering is disabled. Or;                                                                                  // 1275
    //  2. any non-(added/changed/removed) message arrives.                                                            // 1276
                                                                                                                       //
                                                                                                                       //
    var standardWrite = _.include(['added', 'changed', 'removed'], msg.msg);                                           // 1277
                                                                                                                       //
    if (self._bufferedWritesInterval === 0 || !standardWrite) {                                                        // 1278
      self._flushBufferedWrites();                                                                                     // 1279
                                                                                                                       //
      return;                                                                                                          // 1280
    }                                                                                                                  // 1281
                                                                                                                       //
    if (self._bufferedWritesFlushAt === null) {                                                                        // 1283
      self._bufferedWritesFlushAt = new Date().valueOf() + self._bufferedWritesMaxAge;                                 // 1284
    } else if (self._bufferedWritesFlushAt < new Date().valueOf()) {                                                   // 1285
      self._flushBufferedWrites();                                                                                     // 1287
                                                                                                                       //
      return;                                                                                                          // 1288
    }                                                                                                                  // 1289
                                                                                                                       //
    if (self._bufferedWritesFlushHandle) {                                                                             // 1291
      clearTimeout(self._bufferedWritesFlushHandle);                                                                   // 1292
    }                                                                                                                  // 1293
                                                                                                                       //
    self._bufferedWritesFlushHandle = setTimeout(self.__flushBufferedWrites, self._bufferedWritesInterval);            // 1294
  },                                                                                                                   // 1296
  _flushBufferedWrites: function () {                                                                                  // 1298
    var self = this;                                                                                                   // 1299
                                                                                                                       //
    if (self._bufferedWritesFlushHandle) {                                                                             // 1300
      clearTimeout(self._bufferedWritesFlushHandle);                                                                   // 1301
      self._bufferedWritesFlushHandle = null;                                                                          // 1302
    }                                                                                                                  // 1303
                                                                                                                       //
    self._bufferedWritesFlushAt = null; // We need to clear the buffer before passing it to                            // 1305
    //  performWrites. As there's no guarantee that it                                                                 // 1307
    //  will exit cleanly.                                                                                             // 1308
                                                                                                                       //
    var writes = self._bufferedWrites;                                                                                 // 1309
    self._bufferedWrites = {};                                                                                         // 1310
                                                                                                                       //
    self._performWrites(writes);                                                                                       // 1311
  },                                                                                                                   // 1312
  _performWrites: function (updates) {                                                                                 // 1314
    var self = this;                                                                                                   // 1315
                                                                                                                       //
    if (self._resetStores || !_.isEmpty(updates)) {                                                                    // 1317
      // Begin a transactional update of each store.                                                                   // 1318
      _.each(self._stores, function (s, storeName) {                                                                   // 1319
        s.beginUpdate(_.has(updates, storeName) ? updates[storeName].length : 0, self._resetStores);                   // 1320
      });                                                                                                              // 1322
                                                                                                                       //
      self._resetStores = false;                                                                                       // 1323
                                                                                                                       //
      _.each(updates, function (updateMessages, storeName) {                                                           // 1325
        var store = self._stores[storeName];                                                                           // 1326
                                                                                                                       //
        if (store) {                                                                                                   // 1327
          _.each(updateMessages, function (updateMessage) {                                                            // 1328
            store.update(updateMessage);                                                                               // 1329
          });                                                                                                          // 1330
        } else {                                                                                                       // 1331
          // Nobody's listening for this data. Queue it up until                                                       // 1332
          // someone wants it.                                                                                         // 1333
          // XXX memory use will grow without bound if you forget to                                                   // 1334
          // create a collection or just don't care about it... going                                                  // 1335
          // to have to do something about that.                                                                       // 1336
          if (!_.has(self._updatesForUnknownStores, storeName)) self._updatesForUnknownStores[storeName] = [];         // 1337
          Array.prototype.push.apply(self._updatesForUnknownStores[storeName], updateMessages);                        // 1339
        }                                                                                                              // 1341
      }); // End update transaction.                                                                                   // 1342
                                                                                                                       //
                                                                                                                       //
      _.each(self._stores, function (s) {                                                                              // 1345
        s.endUpdate();                                                                                                 // 1345
      });                                                                                                              // 1345
    }                                                                                                                  // 1346
                                                                                                                       //
    self._runAfterUpdateCallbacks();                                                                                   // 1348
  },                                                                                                                   // 1349
  // Call any callbacks deferred with _runWhenAllServerDocsAreFlushed whose                                            // 1351
  // relevant docs have been flushed, as well as dataVisible callbacks at                                              // 1352
  // reconnect-quiescence time.                                                                                        // 1353
  _runAfterUpdateCallbacks: function () {                                                                              // 1354
    var self = this;                                                                                                   // 1355
    var callbacks = self._afterUpdateCallbacks;                                                                        // 1356
    self._afterUpdateCallbacks = [];                                                                                   // 1357
                                                                                                                       //
    _.each(callbacks, function (c) {                                                                                   // 1358
      c();                                                                                                             // 1359
    });                                                                                                                // 1360
  },                                                                                                                   // 1361
  _pushUpdate: function (updates, collection, msg) {                                                                   // 1363
    var self = this;                                                                                                   // 1364
                                                                                                                       //
    if (!_.has(updates, collection)) {                                                                                 // 1365
      updates[collection] = [];                                                                                        // 1366
    }                                                                                                                  // 1367
                                                                                                                       //
    updates[collection].push(msg);                                                                                     // 1368
  },                                                                                                                   // 1369
  _getServerDoc: function (collection, id) {                                                                           // 1371
    var self = this;                                                                                                   // 1372
    if (!_.has(self._serverDocuments, collection)) return null;                                                        // 1373
    var serverDocsForCollection = self._serverDocuments[collection];                                                   // 1375
    return serverDocsForCollection.get(id) || null;                                                                    // 1376
  },                                                                                                                   // 1377
  _process_added: function (msg, updates) {                                                                            // 1379
    var self = this;                                                                                                   // 1380
    var id = MongoID.idParse(msg.id);                                                                                  // 1381
                                                                                                                       //
    var serverDoc = self._getServerDoc(msg.collection, id);                                                            // 1382
                                                                                                                       //
    if (serverDoc) {                                                                                                   // 1383
      // Some outstanding stub wrote here.                                                                             // 1384
      var isExisting = serverDoc.document !== undefined;                                                               // 1385
      serverDoc.document = msg.fields || {};                                                                           // 1387
      serverDoc.document._id = id;                                                                                     // 1388
                                                                                                                       //
      if (self._resetStores) {                                                                                         // 1390
        // During reconnect the server is sending adds for existing ids.                                               // 1391
        // Always push an update so that document stays in the store after                                             // 1392
        // reset. Use current version of the document for this update, so                                              // 1393
        // that stub-written values are preserved.                                                                     // 1394
        var currentDoc = self._stores[msg.collection].getDoc(msg.id);                                                  // 1395
                                                                                                                       //
        if (currentDoc !== undefined) msg.fields = currentDoc;                                                         // 1396
                                                                                                                       //
        self._pushUpdate(updates, msg.collection, msg);                                                                // 1399
      } else if (isExisting) {                                                                                         // 1400
        throw new Error("Server sent add for existing id: " + msg.id);                                                 // 1401
      }                                                                                                                // 1402
    } else {                                                                                                           // 1403
      self._pushUpdate(updates, msg.collection, msg);                                                                  // 1404
    }                                                                                                                  // 1405
  },                                                                                                                   // 1406
  _process_changed: function (msg, updates) {                                                                          // 1408
    var self = this;                                                                                                   // 1409
                                                                                                                       //
    var serverDoc = self._getServerDoc(msg.collection, MongoID.idParse(msg.id));                                       // 1410
                                                                                                                       //
    if (serverDoc) {                                                                                                   // 1412
      if (serverDoc.document === undefined) throw new Error("Server sent changed for nonexisting id: " + msg.id);      // 1413
      DiffSequence.applyChanges(serverDoc.document, msg.fields);                                                       // 1415
    } else {                                                                                                           // 1416
      self._pushUpdate(updates, msg.collection, msg);                                                                  // 1417
    }                                                                                                                  // 1418
  },                                                                                                                   // 1419
  _process_removed: function (msg, updates) {                                                                          // 1421
    var self = this;                                                                                                   // 1422
                                                                                                                       //
    var serverDoc = self._getServerDoc(msg.collection, MongoID.idParse(msg.id));                                       // 1423
                                                                                                                       //
    if (serverDoc) {                                                                                                   // 1425
      // Some outstanding stub wrote here.                                                                             // 1426
      if (serverDoc.document === undefined) throw new Error("Server sent removed for nonexisting id:" + msg.id);       // 1427
      serverDoc.document = undefined;                                                                                  // 1429
    } else {                                                                                                           // 1430
      self._pushUpdate(updates, msg.collection, {                                                                      // 1431
        msg: 'removed',                                                                                                // 1432
        collection: msg.collection,                                                                                    // 1433
        id: msg.id                                                                                                     // 1434
      });                                                                                                              // 1431
    }                                                                                                                  // 1436
  },                                                                                                                   // 1437
  _process_updated: function (msg, updates) {                                                                          // 1439
    var self = this; // Process "method done" messages.                                                                // 1440
                                                                                                                       //
    _.each(msg.methods, function (methodId) {                                                                          // 1442
      _.each(self._documentsWrittenByStub[methodId], function (written) {                                              // 1443
        var serverDoc = self._getServerDoc(written.collection, written.id);                                            // 1444
                                                                                                                       //
        if (!serverDoc) throw new Error("Lost serverDoc for " + JSON.stringify(written));                              // 1445
        if (!serverDoc.writtenByStubs[methodId]) throw new Error("Doc " + JSON.stringify(written) + " not written by  method " + methodId);
        delete serverDoc.writtenByStubs[methodId];                                                                     // 1450
                                                                                                                       //
        if (_.isEmpty(serverDoc.writtenByStubs)) {                                                                     // 1451
          // All methods whose stubs wrote this method have completed! We can                                          // 1452
          // now copy the saved document to the database (reverting the stub's                                         // 1453
          // change if the server did not write to this object, or applying the                                        // 1454
          // server's writes if it did).                                                                               // 1455
          // This is a fake ddp 'replace' message.  It's just for talking                                              // 1457
          // between livedata connections and minimongo.  (We have to stringify                                        // 1458
          // the ID because it's supposed to look like a wire message.)                                                // 1459
          self._pushUpdate(updates, written.collection, {                                                              // 1460
            msg: 'replace',                                                                                            // 1461
            id: MongoID.idStringify(written.id),                                                                       // 1462
            replace: serverDoc.document                                                                                // 1463
          }); // Call all flush callbacks.                                                                             // 1460
                                                                                                                       //
                                                                                                                       //
          _.each(serverDoc.flushCallbacks, function (c) {                                                              // 1466
            c();                                                                                                       // 1467
          }); // Delete this completed serverDocument. Don't bother to GC empty                                        // 1468
          // IdMaps inside self._serverDocuments, since there probably aren't                                          // 1471
          // many collections and they'll be written repeatedly.                                                       // 1472
                                                                                                                       //
                                                                                                                       //
          self._serverDocuments[written.collection].remove(written.id);                                                // 1473
        }                                                                                                              // 1474
      });                                                                                                              // 1475
                                                                                                                       //
      delete self._documentsWrittenByStub[methodId]; // We want to call the data-written callback, but we can't do so until all
      // currently buffered messages are flushed.                                                                      // 1479
                                                                                                                       //
      var callbackInvoker = self._methodInvokers[methodId];                                                            // 1480
      if (!callbackInvoker) throw new Error("No callback invoker for method " + methodId);                             // 1481
                                                                                                                       //
      self._runWhenAllServerDocsAreFlushed(_.bind(callbackInvoker.dataVisible, callbackInvoker));                      // 1483
    });                                                                                                                // 1485
  },                                                                                                                   // 1486
  _process_ready: function (msg, updates) {                                                                            // 1488
    var self = this; // Process "sub ready" messages. "sub ready" messages don't take effect                           // 1489
    // until all current server documents have been flushed to the local                                               // 1491
    // database. We can use a write fence to implement this.                                                           // 1492
                                                                                                                       //
    _.each(msg.subs, function (subId) {                                                                                // 1493
      self._runWhenAllServerDocsAreFlushed(function () {                                                               // 1494
        var subRecord = self._subscriptions[subId]; // Did we already unsubscribe?                                     // 1495
                                                                                                                       //
        if (!subRecord) return; // Did we already receive a ready message? (Oops!)                                     // 1497
                                                                                                                       //
        if (subRecord.ready) return;                                                                                   // 1500
        subRecord.ready = true;                                                                                        // 1502
        subRecord.readyCallback && subRecord.readyCallback();                                                          // 1503
        subRecord.readyDeps.changed();                                                                                 // 1504
      });                                                                                                              // 1505
    });                                                                                                                // 1506
  },                                                                                                                   // 1507
  // Ensures that "f" will be called after all documents currently in                                                  // 1509
  // _serverDocuments have been written to the local cache. f will not be called                                       // 1510
  // if the connection is lost before then!                                                                            // 1511
  _runWhenAllServerDocsAreFlushed: function (f) {                                                                      // 1512
    var self = this;                                                                                                   // 1513
                                                                                                                       //
    var runFAfterUpdates = function () {                                                                               // 1514
      self._afterUpdateCallbacks.push(f);                                                                              // 1515
    };                                                                                                                 // 1516
                                                                                                                       //
    var unflushedServerDocCount = 0;                                                                                   // 1517
                                                                                                                       //
    var onServerDocFlush = function () {                                                                               // 1518
      --unflushedServerDocCount;                                                                                       // 1519
                                                                                                                       //
      if (unflushedServerDocCount === 0) {                                                                             // 1520
        // This was the last doc to flush! Arrange to run f after the updates                                          // 1521
        // have been applied.                                                                                          // 1522
        runFAfterUpdates();                                                                                            // 1523
      }                                                                                                                // 1524
    };                                                                                                                 // 1525
                                                                                                                       //
    _.each(self._serverDocuments, function (collectionDocs) {                                                          // 1526
      collectionDocs.forEach(function (serverDoc) {                                                                    // 1527
        var writtenByStubForAMethodWithSentMessage = _.any(serverDoc.writtenByStubs, function (dummy, methodId) {      // 1528
          var invoker = self._methodInvokers[methodId];                                                                // 1530
          return invoker && invoker.sentMessage;                                                                       // 1531
        });                                                                                                            // 1532
                                                                                                                       //
        if (writtenByStubForAMethodWithSentMessage) {                                                                  // 1533
          ++unflushedServerDocCount;                                                                                   // 1534
          serverDoc.flushCallbacks.push(onServerDocFlush);                                                             // 1535
        }                                                                                                              // 1536
      });                                                                                                              // 1537
    });                                                                                                                // 1538
                                                                                                                       //
    if (unflushedServerDocCount === 0) {                                                                               // 1539
      // There aren't any buffered docs --- we can call f as soon as the current                                       // 1540
      // round of updates is applied!                                                                                  // 1541
      runFAfterUpdates();                                                                                              // 1542
    }                                                                                                                  // 1543
  },                                                                                                                   // 1544
  _livedata_nosub: function (msg) {                                                                                    // 1546
    var self = this; // First pass it through _livedata_data, which only uses it to help get                           // 1547
    // towards quiescence.                                                                                             // 1550
                                                                                                                       //
    self._livedata_data(msg); // Do the rest of our processing immediately, with no                                    // 1551
    // buffering-until-quiescence.                                                                                     // 1554
    // we weren't subbed anyway, or we initiated the unsub.                                                            // 1556
                                                                                                                       //
                                                                                                                       //
    if (!_.has(self._subscriptions, msg.id)) return; // XXX COMPAT WITH 1.0.3.1 #errorCallback                         // 1557
                                                                                                                       //
    var errorCallback = self._subscriptions[msg.id].errorCallback;                                                     // 1561
    var stopCallback = self._subscriptions[msg.id].stopCallback;                                                       // 1562
                                                                                                                       //
    self._subscriptions[msg.id].remove();                                                                              // 1564
                                                                                                                       //
    var meteorErrorFromMsg = function (msgArg) {                                                                       // 1566
      return msgArg && msgArg.error && new Meteor.Error(msgArg.error.error, msgArg.error.reason, msgArg.error.details);
    }; // XXX COMPAT WITH 1.0.3.1 #errorCallback                                                                       // 1569
                                                                                                                       //
                                                                                                                       //
    if (errorCallback && msg.error) {                                                                                  // 1572
      errorCallback(meteorErrorFromMsg(msg));                                                                          // 1573
    }                                                                                                                  // 1574
                                                                                                                       //
    if (stopCallback) {                                                                                                // 1576
      stopCallback(meteorErrorFromMsg(msg));                                                                           // 1577
    }                                                                                                                  // 1578
  },                                                                                                                   // 1579
  _process_nosub: function () {// This is called as part of the "buffer until quiescence" process, but                 // 1581
    // nosub's effect is always immediate. It only goes in the buffer at all                                           // 1583
    // because it's possible for a nosub to be the thing that triggers                                                 // 1584
    // quiescence, if we were waiting for a sub to be revived and it dies                                              // 1585
    // instead.                                                                                                        // 1586
  },                                                                                                                   // 1587
  _livedata_result: function (msg) {                                                                                   // 1589
    // id, result or error. error has error (code), reason, details                                                    // 1590
    var self = this; // Lets make sure there are no buffered writes before returning result.                           // 1592
                                                                                                                       //
    if (!_.isEmpty(self._bufferedWrites)) {                                                                            // 1595
      self._flushBufferedWrites();                                                                                     // 1596
    } // find the outstanding request                                                                                  // 1597
    // should be O(1) in nearly all realistic use cases                                                                // 1600
                                                                                                                       //
                                                                                                                       //
    if (_.isEmpty(self._outstandingMethodBlocks)) {                                                                    // 1601
      Meteor._debug("Received method result but no methods outstanding");                                              // 1602
                                                                                                                       //
      return;                                                                                                          // 1603
    }                                                                                                                  // 1604
                                                                                                                       //
    var currentMethodBlock = self._outstandingMethodBlocks[0].methods;                                                 // 1605
    var m;                                                                                                             // 1606
                                                                                                                       //
    for (var i = 0; i < currentMethodBlock.length; i++) {                                                              // 1607
      m = currentMethodBlock[i];                                                                                       // 1608
      if (m.methodId === msg.id) break;                                                                                // 1609
    }                                                                                                                  // 1611
                                                                                                                       //
    if (!m) {                                                                                                          // 1613
      Meteor._debug("Can't match method response to original method call", msg);                                       // 1614
                                                                                                                       //
      return;                                                                                                          // 1615
    } // Remove from current method block. This may leave the block empty, but we                                      // 1616
    // don't move on to the next block until the callback has been delivered, in                                       // 1619
    // _outstandingMethodFinished.                                                                                     // 1620
                                                                                                                       //
                                                                                                                       //
    currentMethodBlock.splice(i, 1);                                                                                   // 1621
                                                                                                                       //
    if (_.has(msg, 'error')) {                                                                                         // 1623
      m.receiveResult(new Meteor.Error(msg.error.error, msg.error.reason, msg.error.details));                         // 1624
    } else {                                                                                                           // 1627
      // msg.result may be undefined if the method didn't return a                                                     // 1628
      // value                                                                                                         // 1629
      m.receiveResult(undefined, msg.result);                                                                          // 1630
    }                                                                                                                  // 1631
  },                                                                                                                   // 1632
  // Called by MethodInvoker after a method's callback is invoked.  If this was                                        // 1634
  // the last outstanding method in the current block, runs the next block. If                                         // 1635
  // there are no more methods, consider accepting a hot code push.                                                    // 1636
  _outstandingMethodFinished: function () {                                                                            // 1637
    var self = this;                                                                                                   // 1638
    if (self._anyMethodsAreOutstanding()) return; // No methods are outstanding. This should mean that the first block of
    // methods is empty. (Or it might not exist, if this was a method that                                             // 1643
    // half-finished before disconnect/reconnect.)                                                                     // 1644
                                                                                                                       //
    if (!_.isEmpty(self._outstandingMethodBlocks)) {                                                                   // 1645
      var firstBlock = self._outstandingMethodBlocks.shift();                                                          // 1646
                                                                                                                       //
      if (!_.isEmpty(firstBlock.methods)) throw new Error("No methods outstanding but nonempty block: " + JSON.stringify(firstBlock)); // Send the outstanding methods now in the first block.
                                                                                                                       //
      if (!_.isEmpty(self._outstandingMethodBlocks)) self._sendOutstandingMethods();                                   // 1652
    } // Maybe accept a hot code push.                                                                                 // 1654
                                                                                                                       //
                                                                                                                       //
    self._maybeMigrate();                                                                                              // 1657
  },                                                                                                                   // 1658
  // Sends messages for all the methods in the first block in                                                          // 1660
  // _outstandingMethodBlocks.                                                                                         // 1661
  _sendOutstandingMethods: function () {                                                                               // 1662
    var self = this;                                                                                                   // 1663
    if (_.isEmpty(self._outstandingMethodBlocks)) return;                                                              // 1664
                                                                                                                       //
    _.each(self._outstandingMethodBlocks[0].methods, function (m) {                                                    // 1666
      m.sendMessage();                                                                                                 // 1667
    });                                                                                                                // 1668
  },                                                                                                                   // 1669
  _livedata_error: function (msg) {                                                                                    // 1671
    Meteor._debug("Received error from server: ", msg.reason);                                                         // 1672
                                                                                                                       //
    if (msg.offendingMessage) Meteor._debug("For: ", msg.offendingMessage);                                            // 1673
  },                                                                                                                   // 1675
  _callOnReconnectAndSendAppropriateOutstandingMethods: function () {                                                  // 1677
    var self = this;                                                                                                   // 1678
    var oldOutstandingMethodBlocks = self._outstandingMethodBlocks;                                                    // 1679
    self._outstandingMethodBlocks = [];                                                                                // 1680
    self.onReconnect();                                                                                                // 1682
    if (_.isEmpty(oldOutstandingMethodBlocks)) return; // We have at least one block worth of old outstanding methods to try
    // again. First: did onReconnect actually send anything? If not, we just                                           // 1688
    // restore all outstanding methods and run the first block.                                                        // 1689
                                                                                                                       //
    if (_.isEmpty(self._outstandingMethodBlocks)) {                                                                    // 1690
      self._outstandingMethodBlocks = oldOutstandingMethodBlocks;                                                      // 1691
                                                                                                                       //
      self._sendOutstandingMethods();                                                                                  // 1692
                                                                                                                       //
      return;                                                                                                          // 1693
    } // OK, there are blocks on both sides. Special case: merge the last block of                                     // 1694
    // the reconnect methods with the first block of the original methods, if                                          // 1697
    // neither of them are "wait" blocks.                                                                              // 1698
                                                                                                                       //
                                                                                                                       //
    if (!_.last(self._outstandingMethodBlocks).wait && !oldOutstandingMethodBlocks[0].wait) {                          // 1699
      _.each(oldOutstandingMethodBlocks[0].methods, function (m) {                                                     // 1701
        _.last(self._outstandingMethodBlocks).methods.push(m); // If this "last block" is also the first block, send the message.
                                                                                                                       //
                                                                                                                       //
        if (self._outstandingMethodBlocks.length === 1) m.sendMessage();                                               // 1705
      });                                                                                                              // 1707
                                                                                                                       //
      oldOutstandingMethodBlocks.shift();                                                                              // 1709
    } // Now add the rest of the original blocks on.                                                                   // 1710
                                                                                                                       //
                                                                                                                       //
    _.each(oldOutstandingMethodBlocks, function (block) {                                                              // 1713
      self._outstandingMethodBlocks.push(block);                                                                       // 1714
    });                                                                                                                // 1715
  },                                                                                                                   // 1716
  // We can accept a hot code push if there are no methods in flight.                                                  // 1718
  _readyToMigrate: function () {                                                                                       // 1719
    var self = this;                                                                                                   // 1720
    return _.isEmpty(self._methodInvokers);                                                                            // 1721
  },                                                                                                                   // 1722
  // If we were blocking a migration, see if it's now possible to continue.                                            // 1724
  // Call whenever the set of outstanding/blocked methods shrinks.                                                     // 1725
  _maybeMigrate: function () {                                                                                         // 1726
    var self = this;                                                                                                   // 1727
                                                                                                                       //
    if (self._retryMigrate && self._readyToMigrate()) {                                                                // 1728
      self._retryMigrate();                                                                                            // 1729
                                                                                                                       //
      self._retryMigrate = null;                                                                                       // 1730
    }                                                                                                                  // 1731
  }                                                                                                                    // 1732
});                                                                                                                    // 480
                                                                                                                       //
LivedataTest.Connection = Connection; // @param url {String} URL to Meteor app,                                        // 1735
//     e.g.:                                                                                                           // 1738
//     "subdomain.meteor.com",                                                                                         // 1739
//     "http://subdomain.meteor.com",                                                                                  // 1740
//     "/",                                                                                                            // 1741
//     "ddp+sockjs://ddp--****-foo.meteor.com/sockjs"                                                                  // 1742
/**                                                                                                                    // 1744
 * @summary Connect to the server of a different Meteor application to subscribe to its document sets and invoke its remote methods.
 * @locus Anywhere                                                                                                     //
 * @param {String} url The URL of another Meteor application.                                                          //
 */                                                                                                                    //
                                                                                                                       //
DDP.connect = function (url, options) {                                                                                // 1749
  var ret = new Connection(url, options);                                                                              // 1750
  allConnections.push(ret); // hack. see below.                                                                        // 1751
                                                                                                                       //
  return ret;                                                                                                          // 1752
}; // Hack for `spiderable` package: a way to see if the page is done                                                  // 1753
// loading all the data it needs.                                                                                      // 1756
//                                                                                                                     // 1757
                                                                                                                       //
                                                                                                                       //
allConnections = [];                                                                                                   // 1758
                                                                                                                       //
DDP._allSubscriptionsReady = function () {                                                                             // 1759
  return _.all(allConnections, function (conn) {                                                                       // 1760
    return _.all(conn._subscriptions, function (sub) {                                                                 // 1761
      return sub.ready;                                                                                                // 1762
    });                                                                                                                // 1763
  });                                                                                                                  // 1764
};                                                                                                                     // 1765
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"namespace.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/namespace.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({                                                                                                        // 1
  DDP: function () {                                                                                                   // 1
    return DDP;                                                                                                        // 1
  },                                                                                                                   // 1
  LivedataTest: function () {                                                                                          // 1
    return LivedataTest;                                                                                               // 1
  }                                                                                                                    // 1
});                                                                                                                    // 1
var DDP = {};                                                                                                          // 5
var LivedataTest = {};                                                                                                 // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"id_map.js":["babel-runtime/helpers/classCallCheck","babel-runtime/helpers/possibleConstructorReturn","babel-runtime/helpers/inherits",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-client/id_map.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                                //
                                                                                                                       //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                       //
                                                                                                                       //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                          //
                                                                                                                       //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                                 //
                                                                                                                       //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                            //
                                                                                                                       //
var _inherits3 = _interopRequireDefault(_inherits2);                                                                   //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
module.export({                                                                                                        // 1
  MongoIDMap: function () {                                                                                            // 1
    return MongoIDMap;                                                                                                 // 1
  }                                                                                                                    // 1
});                                                                                                                    // 1
                                                                                                                       //
var MongoIDMap = function (_IdMap) {                                                                                   //
  (0, _inherits3.default)(MongoIDMap, _IdMap);                                                                         //
                                                                                                                       //
  function MongoIDMap() {                                                                                              // 2
    (0, _classCallCheck3.default)(this, MongoIDMap);                                                                   // 2
    return (0, _possibleConstructorReturn3.default)(this, _IdMap.call(this, MongoID.idStringify, MongoID.idParse));    // 2
  }                                                                                                                    // 7
                                                                                                                       //
  return MongoIDMap;                                                                                                   //
}(IdMap);                                                                                                              //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/ddp-client/stream_client_nodejs.js");
require("./node_modules/meteor/ddp-client/stream_client_common.js");
require("./node_modules/meteor/ddp-client/livedata_common.js");
require("./node_modules/meteor/ddp-client/random_stream.js");
require("./node_modules/meteor/ddp-client/livedata_connection.js");
var exports = require("./node_modules/meteor/ddp-client/namespace.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['ddp-client'] = exports, {
  DDP: DDP
});

})();

//# sourceMappingURL=ddp-client.js.map
