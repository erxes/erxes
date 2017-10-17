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
var Random = Package.random.Random;

/* Package-scope variables */
var Retry;

(function(){

/////////////////////////////////////////////////////////////////////////////
//                                                                         //
// packages/retry/retry.js                                                 //
//                                                                         //
/////////////////////////////////////////////////////////////////////////////
                                                                           //
// Retry logic with an exponential backoff.                                // 1
//                                                                         // 2
// options:                                                                // 3
//  baseTimeout: time for initial reconnect attempt (ms).                  // 4
//  exponent: exponential factor to increase timeout each attempt.         // 5
//  maxTimeout: maximum time between retries (ms).                         // 6
//  minCount: how many times to reconnect "instantly".                     // 7
//  minTimeout: time to wait for the first `minCount` retries (ms).        // 8
//  fuzz: factor to randomize retry times by (to avoid retry storms).      // 9
                                                                           // 10
Retry = function (options) {                                               // 11
  var self = this;                                                         // 12
  _.extend(self, _.defaults(_.clone(options || {}), {                      // 13
    baseTimeout: 1000, // 1 second                                         // 14
    exponent: 2.2,                                                         // 15
    // The default is high-ish to ensure a server can recover from a       // 16
    // failure caused by load.                                             // 17
    maxTimeout: 5 * 60000, // 5 minutes                                    // 18
    minTimeout: 10,                                                        // 19
    minCount: 2,                                                           // 20
    fuzz: 0.5 // +- 25%                                                    // 21
  }));                                                                     // 22
  self.retryTimer = null;                                                  // 23
};                                                                         // 24
                                                                           // 25
_.extend(Retry.prototype, {                                                // 26
                                                                           // 27
  // Reset a pending retry, if any.                                        // 28
  clear: function () {                                                     // 29
    var self = this;                                                       // 30
    if (self.retryTimer)                                                   // 31
      clearTimeout(self.retryTimer);                                       // 32
    self.retryTimer = null;                                                // 33
  },                                                                       // 34
                                                                           // 35
  // Calculate how long to wait in milliseconds to retry, based on the     // 36
  // `count` of which retry this is.                                       // 37
  _timeout: function (count) {                                             // 38
    var self = this;                                                       // 39
                                                                           // 40
    if (count < self.minCount)                                             // 41
      return self.minTimeout;                                              // 42
                                                                           // 43
    var timeout = Math.min(                                                // 44
      self.maxTimeout,                                                     // 45
      self.baseTimeout * Math.pow(self.exponent, count));                  // 46
    // fuzz the timeout randomly, to avoid reconnect storms when a         // 47
    // server goes down.                                                   // 48
    timeout = timeout * ((Random.fraction() * self.fuzz) +                 // 49
                         (1 - self.fuzz/2));                               // 50
    return timeout;                                                        // 51
  },                                                                       // 52
                                                                           // 53
  // Call `fn` after a delay, based on the `count` of which retry this is.
  retryLater: function (count, fn) {                                       // 55
    var self = this;                                                       // 56
    var timeout = self._timeout(count);                                    // 57
    if (self.retryTimer)                                                   // 58
      clearTimeout(self.retryTimer);                                       // 59
    self.retryTimer = Meteor.setTimeout(fn, timeout);                      // 60
    return timeout;                                                        // 61
  }                                                                        // 62
                                                                           // 63
});                                                                        // 64
                                                                           // 65
/////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.retry = {}, {
  Retry: Retry
});

})();
