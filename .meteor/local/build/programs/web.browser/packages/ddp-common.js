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
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Retry = Package.retry.Retry;

/* Package-scope variables */
var DDPCommon;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ddp-common/namespace.js                                                                  //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
/**                                                                                                  // 1
 * @namespace DDPCommon                                                                              // 2
 * @summary Namespace for DDPCommon-related methods/classes. Shared between                          // 3
 * `ddp-client` and `ddp-server`, where the ddp-client is the implementation                         // 4
 * of a ddp client for both client AND server; and the ddp server is the                             // 5
 * implementation of the livedata server and stream server. Common                                   // 6
 * functionality shared between both can be shared under this namespace                              // 7
 */                                                                                                  // 8
DDPCommon = {};                                                                                      // 9
                                                                                                     // 10
///////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ddp-common/heartbeat.js                                                                  //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
// Heartbeat options:                                                                                // 1
//   heartbeatInterval: interval to send pings, in milliseconds.                                     // 2
//   heartbeatTimeout: timeout to close the connection if a reply isn't                              // 3
//     received, in milliseconds.                                                                    // 4
//   sendPing: function to call to send a ping on the connection.                                    // 5
//   onTimeout: function to call to close the connection.                                            // 6
                                                                                                     // 7
DDPCommon.Heartbeat = function (options) {                                                           // 8
  var self = this;                                                                                   // 9
                                                                                                     // 10
  self.heartbeatInterval = options.heartbeatInterval;                                                // 11
  self.heartbeatTimeout = options.heartbeatTimeout;                                                  // 12
  self._sendPing = options.sendPing;                                                                 // 13
  self._onTimeout = options.onTimeout;                                                               // 14
  self._seenPacket = false;                                                                          // 15
                                                                                                     // 16
  self._heartbeatIntervalHandle = null;                                                              // 17
  self._heartbeatTimeoutHandle = null;                                                               // 18
};                                                                                                   // 19
                                                                                                     // 20
_.extend(DDPCommon.Heartbeat.prototype, {                                                            // 21
  stop: function () {                                                                                // 22
    var self = this;                                                                                 // 23
    self._clearHeartbeatIntervalTimer();                                                             // 24
    self._clearHeartbeatTimeoutTimer();                                                              // 25
  },                                                                                                 // 26
                                                                                                     // 27
  start: function () {                                                                               // 28
    var self = this;                                                                                 // 29
    self.stop();                                                                                     // 30
    self._startHeartbeatIntervalTimer();                                                             // 31
  },                                                                                                 // 32
                                                                                                     // 33
  _startHeartbeatIntervalTimer: function () {                                                        // 34
    var self = this;                                                                                 // 35
    self._heartbeatIntervalHandle = Meteor.setInterval(                                              // 36
      _.bind(self._heartbeatIntervalFired, self),                                                    // 37
      self.heartbeatInterval                                                                         // 38
    );                                                                                               // 39
  },                                                                                                 // 40
                                                                                                     // 41
  _startHeartbeatTimeoutTimer: function () {                                                         // 42
    var self = this;                                                                                 // 43
    self._heartbeatTimeoutHandle = Meteor.setTimeout(                                                // 44
      _.bind(self._heartbeatTimeoutFired, self),                                                     // 45
      self.heartbeatTimeout                                                                          // 46
    );                                                                                               // 47
  },                                                                                                 // 48
                                                                                                     // 49
  _clearHeartbeatIntervalTimer: function () {                                                        // 50
    var self = this;                                                                                 // 51
    if (self._heartbeatIntervalHandle) {                                                             // 52
      Meteor.clearInterval(self._heartbeatIntervalHandle);                                           // 53
      self._heartbeatIntervalHandle = null;                                                          // 54
    }                                                                                                // 55
  },                                                                                                 // 56
                                                                                                     // 57
  _clearHeartbeatTimeoutTimer: function () {                                                         // 58
    var self = this;                                                                                 // 59
    if (self._heartbeatTimeoutHandle) {                                                              // 60
      Meteor.clearTimeout(self._heartbeatTimeoutHandle);                                             // 61
      self._heartbeatTimeoutHandle = null;                                                           // 62
    }                                                                                                // 63
  },                                                                                                 // 64
                                                                                                     // 65
  // The heartbeat interval timer is fired when we should send a ping.                               // 66
  _heartbeatIntervalFired: function () {                                                             // 67
    var self = this;                                                                                 // 68
    // don't send ping if we've seen a packet since we last checked,                                 // 69
    // *or* if we have already sent a ping and are awaiting a timeout.                               // 70
    // That shouldn't happen, but it's possible if                                                   // 71
    // `self.heartbeatInterval` is smaller than                                                      // 72
    // `self.heartbeatTimeout`.                                                                      // 73
    if (! self._seenPacket && ! self._heartbeatTimeoutHandle) {                                      // 74
      self._sendPing();                                                                              // 75
      // Set up timeout, in case a pong doesn't arrive in time.                                      // 76
      self._startHeartbeatTimeoutTimer();                                                            // 77
    }                                                                                                // 78
    self._seenPacket = false;                                                                        // 79
  },                                                                                                 // 80
                                                                                                     // 81
  // The heartbeat timeout timer is fired when we sent a ping, but we                                // 82
  // timed out waiting for the pong.                                                                 // 83
  _heartbeatTimeoutFired: function () {                                                              // 84
    var self = this;                                                                                 // 85
    self._heartbeatTimeoutHandle = null;                                                             // 86
    self._onTimeout();                                                                               // 87
  },                                                                                                 // 88
                                                                                                     // 89
  messageReceived: function () {                                                                     // 90
    var self = this;                                                                                 // 91
    // Tell periodic checkin that we have seen a packet, and thus it                                 // 92
    // does not need to send a ping this cycle.                                                      // 93
    self._seenPacket = true;                                                                         // 94
    // If we were waiting for a pong, we got it.                                                     // 95
    if (self._heartbeatTimeoutHandle) {                                                              // 96
      self._clearHeartbeatTimeoutTimer();                                                            // 97
    }                                                                                                // 98
  }                                                                                                  // 99
});                                                                                                  // 100
                                                                                                     // 101
///////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ddp-common/utils.js                                                                      //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
DDPCommon.SUPPORTED_DDP_VERSIONS = [ '1', 'pre2', 'pre1' ];                                          // 1
                                                                                                     // 2
DDPCommon.parseDDP = function (stringMessage) {                                                      // 3
  try {                                                                                              // 4
    var msg = JSON.parse(stringMessage);                                                             // 5
  } catch (e) {                                                                                      // 6
    Meteor._debug("Discarding message with invalid JSON", stringMessage);                            // 7
    return null;                                                                                     // 8
  }                                                                                                  // 9
  // DDP messages must be objects.                                                                   // 10
  if (msg === null || typeof msg !== 'object') {                                                     // 11
    Meteor._debug("Discarding non-object DDP message", stringMessage);                               // 12
    return null;                                                                                     // 13
  }                                                                                                  // 14
                                                                                                     // 15
  // massage msg to get it into "abstract ddp" rather than "wire ddp" format.                        // 16
                                                                                                     // 17
  // switch between "cleared" rep of unsetting fields and "undefined"                                // 18
  // rep of same                                                                                     // 19
  if (_.has(msg, 'cleared')) {                                                                       // 20
    if (!_.has(msg, 'fields'))                                                                       // 21
      msg.fields = {};                                                                               // 22
    _.each(msg.cleared, function (clearKey) {                                                        // 23
      msg.fields[clearKey] = undefined;                                                              // 24
    });                                                                                              // 25
    delete msg.cleared;                                                                              // 26
  }                                                                                                  // 27
                                                                                                     // 28
  _.each(['fields', 'params', 'result'], function (field) {                                          // 29
    if (_.has(msg, field))                                                                           // 30
      msg[field] = EJSON._adjustTypesFromJSONValue(msg[field]);                                      // 31
  });                                                                                                // 32
                                                                                                     // 33
  return msg;                                                                                        // 34
};                                                                                                   // 35
                                                                                                     // 36
DDPCommon.stringifyDDP = function (msg) {                                                            // 37
  var copy = EJSON.clone(msg);                                                                       // 38
  // swizzle 'changed' messages from 'fields undefined' rep to 'fields                               // 39
  // and cleared' rep                                                                                // 40
  if (_.has(msg, 'fields')) {                                                                        // 41
    var cleared = [];                                                                                // 42
    _.each(msg.fields, function (value, key) {                                                       // 43
      if (value === undefined) {                                                                     // 44
        cleared.push(key);                                                                           // 45
        delete copy.fields[key];                                                                     // 46
      }                                                                                              // 47
    });                                                                                              // 48
    if (!_.isEmpty(cleared))                                                                         // 49
      copy.cleared = cleared;                                                                        // 50
    if (_.isEmpty(copy.fields))                                                                      // 51
      delete copy.fields;                                                                            // 52
  }                                                                                                  // 53
  // adjust types to basic                                                                           // 54
  _.each(['fields', 'params', 'result'], function (field) {                                          // 55
    if (_.has(copy, field))                                                                          // 56
      copy[field] = EJSON._adjustTypesToJSONValue(copy[field]);                                      // 57
  });                                                                                                // 58
  if (msg.id && typeof msg.id !== 'string') {                                                        // 59
    throw new Error("Message id is not a string");                                                   // 60
  }                                                                                                  // 61
  return JSON.stringify(copy);                                                                       // 62
};                                                                                                   // 63
                                                                                                     // 64
                                                                                                     // 65
///////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ddp-common/method_invocation.js                                                          //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
// Instance name is this because it is usually referred to as this inside a                          // 1
// method definition                                                                                 // 2
/**                                                                                                  // 3
 * @summary The state for a single invocation of a method, referenced by this                        // 4
 * inside a method definition.                                                                       // 5
 * @param {Object} options                                                                           // 6
 * @instanceName this                                                                                // 7
 * @showInstanceName true                                                                            // 8
 */                                                                                                  // 9
DDPCommon.MethodInvocation = function (options) {                                                    // 10
  var self = this;                                                                                   // 11
                                                                                                     // 12
  // true if we're running not the actual method, but a stub (that is,                               // 13
  // if we're on a client (which may be a browser, or in the future a                                // 14
  // server connecting to another server) and presently running a                                    // 15
  // simulation of a server-side method for latency compensation                                     // 16
  // purposes). not currently true except in a client such as a browser,                             // 17
  // since there's usually no point in running stubs unless you have a                               // 18
  // zero-latency connection to the user.                                                            // 19
                                                                                                     // 20
  /**                                                                                                // 21
   * @summary Access inside a method invocation.  Boolean value, true if this invocation is a stub.  // 22
   * @locus Anywhere                                                                                 // 23
   * @name  isSimulation                                                                             // 24
   * @memberOf DDPCommon.MethodInvocation                                                            // 25
   * @instance                                                                                       // 26
   * @type {Boolean}                                                                                 // 27
   */                                                                                                // 28
  this.isSimulation = options.isSimulation;                                                          // 29
                                                                                                     // 30
  // call this function to allow other method invocations (from the                                  // 31
  // same client) to continue running without waiting for this one to                                // 32
  // complete.                                                                                       // 33
  this._unblock = options.unblock || function () {};                                                 // 34
  this._calledUnblock = false;                                                                       // 35
                                                                                                     // 36
  // current user id                                                                                 // 37
                                                                                                     // 38
  /**                                                                                                // 39
   * @summary The id of the user that made this method call, or `null` if no user was logged in.     // 40
   * @locus Anywhere                                                                                 // 41
   * @name  userId                                                                                   // 42
   * @memberOf DDPCommon.MethodInvocation                                                            // 43
   * @instance                                                                                       // 44
   */                                                                                                // 45
  this.userId = options.userId;                                                                      // 46
                                                                                                     // 47
  // sets current user id in all appropriate server contexts and                                     // 48
  // reruns subscriptions                                                                            // 49
  this._setUserId = options.setUserId || function () {};                                             // 50
                                                                                                     // 51
  // On the server, the connection this method call came in on.                                      // 52
                                                                                                     // 53
  /**                                                                                                // 54
   * @summary Access inside a method invocation. The [connection](#meteor_onconnection) that this method was received on. `null` if the method is not associated with a connection, eg. a server initiated method call. Calls to methods made from a server method which was in turn initiated from the client share the same `connection`.
   * @locus Server                                                                                   // 56
   * @name  connection                                                                               // 57
   * @memberOf DDPCommon.MethodInvocation                                                            // 58
   * @instance                                                                                       // 59
   */                                                                                                // 60
  this.connection = options.connection;                                                              // 61
                                                                                                     // 62
  // The seed for randomStream value generation                                                      // 63
  this.randomSeed = options.randomSeed;                                                              // 64
                                                                                                     // 65
  // This is set by RandomStream.get; and holds the random stream state                              // 66
  this.randomStream = null;                                                                          // 67
};                                                                                                   // 68
                                                                                                     // 69
_.extend(DDPCommon.MethodInvocation.prototype, {                                                     // 70
  /**                                                                                                // 71
   * @summary Call inside a method invocation.  Allow subsequent method from this client to begin running in a new fiber.
   * @locus Server                                                                                   // 73
   * @memberOf DDPCommon.MethodInvocation                                                            // 74
   * @instance                                                                                       // 75
   */                                                                                                // 76
  unblock: function () {                                                                             // 77
    var self = this;                                                                                 // 78
    self._calledUnblock = true;                                                                      // 79
    self._unblock();                                                                                 // 80
  },                                                                                                 // 81
                                                                                                     // 82
  /**                                                                                                // 83
   * @summary Set the logged in user.                                                                // 84
   * @locus Server                                                                                   // 85
   * @memberOf DDPCommon.MethodInvocation                                                            // 86
   * @instance                                                                                       // 87
   * @param {String | null} userId The value that should be returned by `userId` on this connection.
   */                                                                                                // 89
  setUserId: function(userId) {                                                                      // 90
    var self = this;                                                                                 // 91
    if (self._calledUnblock)                                                                         // 92
      throw new Error("Can't call setUserId in a method after calling unblock");                     // 93
    self.userId = userId;                                                                            // 94
    self._setUserId(userId);                                                                         // 95
  }                                                                                                  // 96
});                                                                                                  // 97
                                                                                                     // 98
///////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/ddp-common/random_stream.js                                                              //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
// RandomStream allows for generation of pseudo-random values, from a seed.                          // 1
//                                                                                                   // 2
// We use this for consistent 'random' numbers across the client and server.                         // 3
// We want to generate probably-unique IDs on the client, and we ideally want                        // 4
// the server to generate the same IDs when it executes the method.                                  // 5
//                                                                                                   // 6
// For generated values to be the same, we must seed ourselves the same way,                         // 7
// and we must keep track of the current state of our pseudo-random generators.                      // 8
// We call this state the scope. By default, we use the current DDP method                           // 9
// invocation as our scope.  DDP now allows the client to specify a randomSeed.                      // 10
// If a randomSeed is provided it will be used to seed our random sequences.                         // 11
// In this way, client and server method calls will generate the same values.                        // 12
//                                                                                                   // 13
// We expose multiple named streams; each stream is independent                                      // 14
// and is seeded differently (but predictably from the name).                                        // 15
// By using multiple streams, we support reordering of requests,                                     // 16
// as long as they occur on different streams.                                                       // 17
//                                                                                                   // 18
// @param options {Optional Object}                                                                  // 19
//   seed: Array or value - Seed value(s) for the generator.                                         // 20
//                          If an array, will be used as-is                                          // 21
//                          If a value, will be converted to a single-value array                    // 22
//                          If omitted, a random array will be used as the seed.                     // 23
DDPCommon.RandomStream = function (options) {                                                        // 24
  var self = this;                                                                                   // 25
                                                                                                     // 26
  this.seed = [].concat(options.seed || randomToken());                                              // 27
                                                                                                     // 28
  this.sequences = {};                                                                               // 29
};                                                                                                   // 30
                                                                                                     // 31
// Returns a random string of sufficient length for a random seed.                                   // 32
// This is a placeholder function; a similar function is planned                                     // 33
// for Random itself; when that is added we should remove this function,                             // 34
// and call Random's randomToken instead.                                                            // 35
function randomToken() {                                                                             // 36
  return Random.hexString(20);                                                                       // 37
};                                                                                                   // 38
                                                                                                     // 39
// Returns the random stream with the specified name, in the specified                               // 40
// scope. If a scope is passed, then we use that to seed a (not                                      // 41
// cryptographically secure) PRNG using the fast Alea algorithm.  If                                 // 42
// scope is null (or otherwise falsey) then we use a generated seed.                                 // 43
//                                                                                                   // 44
// However, scope will normally be the current DDP method invocation,                                // 45
// so we'll use the stream with the specified name, and we should get                                // 46
// consistent values on the client and server sides of a method call.                                // 47
DDPCommon.RandomStream.get = function (scope, name) {                                                // 48
  if (!name) {                                                                                       // 49
    name = "default";                                                                                // 50
  }                                                                                                  // 51
  if (!scope) {                                                                                      // 52
    // There was no scope passed in; the sequence won't actually be                                  // 53
    // reproducible. but make it fast (and not cryptographically                                     // 54
    // secure) anyways, so that the behavior is similar to what you'd                                // 55
    // get by passing in a scope.                                                                    // 56
    return Random.insecure;                                                                          // 57
  }                                                                                                  // 58
  var randomStream = scope.randomStream;                                                             // 59
  if (!randomStream) {                                                                               // 60
    scope.randomStream = randomStream = new DDPCommon.RandomStream({                                 // 61
      seed: scope.randomSeed                                                                         // 62
    });                                                                                              // 63
  }                                                                                                  // 64
  return randomStream._sequence(name);                                                               // 65
};                                                                                                   // 66
                                                                                                     // 67
                                                                                                     // 68
// Creates a randomSeed for passing to a method call.                                                // 69
// Note that we take enclosing as an argument,                                                       // 70
// though we expect it to be DDP._CurrentInvocation.get()                                            // 71
// However, we often evaluate makeRpcSeed lazily, and thus the relevant                              // 72
// invocation may not be the one currently in scope.                                                 // 73
// If enclosing is null, we'll use Random and values won't be repeatable.                            // 74
DDPCommon.makeRpcSeed = function (enclosing, methodName) {                                           // 75
  var stream = DDPCommon.RandomStream.get(enclosing, '/rpc/' + methodName);                          // 76
  return stream.hexString(20);                                                                       // 77
};                                                                                                   // 78
                                                                                                     // 79
_.extend(DDPCommon.RandomStream.prototype, {                                                         // 80
  // Get a random sequence with the specified name, creating it if does not exist.                   // 81
  // New sequences are seeded with the seed concatenated with the name.                              // 82
  // By passing a seed into Random.create, we use the Alea generator.                                // 83
  _sequence: function (name) {                                                                       // 84
    var self = this;                                                                                 // 85
                                                                                                     // 86
    var sequence = self.sequences[name] || null;                                                     // 87
    if (sequence === null) {                                                                         // 88
      var sequenceSeed = self.seed.concat(name);                                                     // 89
      for (var i = 0; i < sequenceSeed.length; i++) {                                                // 90
        if (_.isFunction(sequenceSeed[i])) {                                                         // 91
          sequenceSeed[i] = sequenceSeed[i]();                                                       // 92
        }                                                                                            // 93
      }                                                                                              // 94
      self.sequences[name] = sequence = Random.createWithSeeds.apply(null, sequenceSeed);            // 95
    }                                                                                                // 96
    return sequence;                                                                                 // 97
  }                                                                                                  // 98
});                                                                                                  // 99
                                                                                                     // 100
///////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['ddp-common'] = {}, {
  DDPCommon: DDPCommon
});

})();
