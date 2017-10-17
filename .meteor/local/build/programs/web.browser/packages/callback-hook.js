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

/* Package-scope variables */
var Hook;

(function(){

////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// packages/callback-hook/hook.js                                                 //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
                                                                                  //
// XXX This pattern is under development. Do not add more callsites               // 1
// using this package for now. See:                                               // 2
// https://meteor.hackpad.com/Design-proposal-Hooks-YxvgEW06q6f                   // 3
//                                                                                // 4
// Encapsulates the pattern of registering callbacks on a hook.                   // 5
//                                                                                // 6
// The `each` method of the hook calls its iterator function argument             // 7
// with each registered callback.  This allows the hook to                        // 8
// conditionally decide not to call the callback (if, for example, the            // 9
// observed object has been closed or terminated).                                // 10
//                                                                                // 11
// By default, callbacks are bound with `Meteor.bindEnvironment`, so they will be
// called with the Meteor environment of the calling code that                    // 13
// registered the callback. Override by passing { bindEnvironment: false }        // 14
// to the constructor.                                                            // 15
//                                                                                // 16
// Registering a callback returns an object with a single `stop`                  // 17
// method which unregisters the callback.                                         // 18
//                                                                                // 19
// The code is careful to allow a callback to be safely unregistered              // 20
// while the callbacks are being iterated over.                                   // 21
//                                                                                // 22
// If the hook is configured with the `exceptionHandler` option, the              // 23
// handler will be called if a called callback throws an exception.               // 24
// By default (if the exception handler doesn't itself throw an                   // 25
// exception, or if the iterator function doesn't return a falsy value            // 26
// to terminate the calling of callbacks), the remaining callbacks                // 27
// will still be called.                                                          // 28
//                                                                                // 29
// Alternatively, the `debugPrintExceptions` option can be specified              // 30
// as string describing the callback.  On an exception the string and             // 31
// the exception will be printed to the console log with                          // 32
// `Meteor._debug`, and the exception otherwise ignored.                          // 33
//                                                                                // 34
// If an exception handler isn't specified, exceptions thrown in the              // 35
// callback will propagate up to the iterator function, and will                  // 36
// terminate calling the remaining callbacks if not caught.                       // 37
                                                                                  // 38
Hook = function (options) {                                                       // 39
  var self = this;                                                                // 40
  options = options || {};                                                        // 41
  self.nextCallbackId = 0;                                                        // 42
  self.callbacks = {};                                                            // 43
  // Whether to wrap callbacks with Meteor.bindEnvironment                        // 44
  self.bindEnvironment = true;                                                    // 45
  if (options.bindEnvironment === false)                                          // 46
    self.bindEnvironment = false;                                                 // 47
                                                                                  // 48
  if (options.exceptionHandler)                                                   // 49
    self.exceptionHandler = options.exceptionHandler;                             // 50
  else if (options.debugPrintExceptions) {                                        // 51
    if (! _.isString(options.debugPrintExceptions))                               // 52
      throw new Error("Hook option debugPrintExceptions should be a string");     // 53
    self.exceptionHandler = options.debugPrintExceptions;                         // 54
  }                                                                               // 55
};                                                                                // 56
                                                                                  // 57
_.extend(Hook.prototype, {                                                        // 58
  register: function (callback) {                                                 // 59
    var self = this;                                                              // 60
    var exceptionHandler =  self.exceptionHandler || function (exception) {       // 61
      // Note: this relies on the undocumented fact that if bindEnvironment's     // 62
      // onException throws, and you are invoking the callback either in the      // 63
      // browser or from within a Fiber in Node, the exception is propagated.     // 64
      throw exception;                                                            // 65
    };                                                                            // 66
                                                                                  // 67
    if (self.bindEnvironment) {                                                   // 68
      callback = Meteor.bindEnvironment(callback, exceptionHandler);              // 69
    } else {                                                                      // 70
      callback = dontBindEnvironment(callback, exceptionHandler);                 // 71
    }                                                                             // 72
                                                                                  // 73
    var id = self.nextCallbackId++;                                               // 74
    self.callbacks[id] = callback;                                                // 75
                                                                                  // 76
    return {                                                                      // 77
      stop: function () {                                                         // 78
        delete self.callbacks[id];                                                // 79
      }                                                                           // 80
    };                                                                            // 81
  },                                                                              // 82
                                                                                  // 83
  // For each registered callback, call the passed iterator function              // 84
  // with the callback.                                                           // 85
  //                                                                              // 86
  // The iterator function can choose whether or not to call the                  // 87
  // callback.  (For example, it might not call the callback if the               // 88
  // observed object has been closed or terminated).                              // 89
  //                                                                              // 90
  // The iteration is stopped if the iterator function returns a falsy            // 91
  // value or throws an exception.                                                // 92
  //                                                                              // 93
  each: function (iterator) {                                                     // 94
    var self = this;                                                              // 95
                                                                                  // 96
    // Invoking bindEnvironment'd callbacks outside of a Fiber in Node doesn't    // 97
    // run them to completion (and exceptions thrown from onException are not     // 98
    // propagated), so we need to be in a Fiber.                                  // 99
    Meteor._nodeCodeMustBeInFiber();                                              // 100
                                                                                  // 101
    var ids = _.keys(self.callbacks);                                             // 102
    for (var i = 0;  i < ids.length;  ++i) {                                      // 103
      var id = ids[i];                                                            // 104
      // check to see if the callback was removed during iteration                // 105
      if (_.has(self.callbacks, id)) {                                            // 106
        var callback = self.callbacks[id];                                        // 107
                                                                                  // 108
        if (! iterator(callback))                                                 // 109
          break;                                                                  // 110
      }                                                                           // 111
    }                                                                             // 112
  }                                                                               // 113
});                                                                               // 114
                                                                                  // 115
// Copied from Meteor.bindEnvironment and removed all the env stuff.              // 116
var dontBindEnvironment = function (func, onException, _this) {                   // 117
  if (!onException || typeof(onException) === 'string') {                         // 118
    var description = onException || "callback of async function";                // 119
    onException = function (error) {                                              // 120
      Meteor._debug(                                                              // 121
        "Exception in " + description + ":",                                      // 122
        error && error.stack || error                                             // 123
      );                                                                          // 124
    };                                                                            // 125
  }                                                                               // 126
                                                                                  // 127
  return function (/* arguments */) {                                             // 128
    var args = _.toArray(arguments);                                              // 129
                                                                                  // 130
    var runAndHandleExceptions = function () {                                    // 131
      try {                                                                       // 132
        var ret = func.apply(_this, args);                                        // 133
      } catch (e) {                                                               // 134
        onException(e);                                                           // 135
      }                                                                           // 136
      return ret;                                                                 // 137
    };                                                                            // 138
                                                                                  // 139
    return runAndHandleExceptions();                                              // 140
  };                                                                              // 141
};                                                                                // 142
                                                                                  // 143
////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['callback-hook'] = {}, {
  Hook: Hook
});

})();
