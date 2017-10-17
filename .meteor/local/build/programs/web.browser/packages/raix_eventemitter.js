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
var EventEmitter;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/raix_eventemitter/packages/raix_eventemitter.js          //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
(function () {                                                       // 1
                                                                     // 2
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/raix:eventemitter/eventemitter.client.js                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/* global EventEmitter: true */                                                                                       // 1
EventEmitter = function(options) {                                                                                    // 2
  var self = this;                                                                                                    // 3
  // Check that the user uses "new" keyword for api consistency                                                       // 4
  if (! (self instanceof EventEmitter)) {                                                                             // 5
    throw new Error('use "new" to construct an EventEmitter');                                                        // 6
  }                                                                                                                   // 7
                                                                                                                      // 8
  options = options || {};                                                                                            // 9
                                                                                                                      // 10
  // Hidden scope                                                                                                     // 11
  self._eventEmitter = {                                                                                              // 12
    onListeners: {},                                                                                                  // 13
    onceListeners: {},                                                                                                // 14
    maxListeners: options.maxListeners || 10                                                                          // 15
  };                                                                                                                  // 16
};                                                                                                                    // 17
                                                                                                                      // 18
var _checkListenerLimit = function(eventName, listenerCount) {                                                        // 19
  var self = this;                                                                                                    // 20
  // Check if we are to send a warning                                                                                // 21
  if (self._eventEmitter.maxListeners && listenerCount > self._eventEmitter.maxListeners) {                           // 22
    // Return string                                                                                                  // 23
    return 'warning: possible EventEmitter memory leak detected. ' +                                                  // 24
        listenerCount + ' listeners added on event "' + eventName +                                                   // 25
        '". Use emitter.setMaxListeners() to increase limit. (' +                                                     // 26
        self._eventEmitter.maxListeners + ')';                                                                        // 27
                                                                                                                      // 28
  }                                                                                                                   // 29
};                                                                                                                    // 30
                                                                                                                      // 31
// By default EventEmitters will print a warning if more than 10 listeners are                                        // 32
// added for a particular event. This is a useful default which helps finding                                         // 33
// memory leaks. Obviously not all Emitters should be limited to 10. This function                                    // 34
// allows that to be increased. Set to zero for unlimited.                                                            // 35
EventEmitter.prototype.setMaxListeners = function(n) {                                                                // 36
  this._eventEmitter.maxListeners = n;                                                                                // 37
};                                                                                                                    // 38
                                                                                                                      // 39
var _addToList = function(list, eventName, listener) {                                                                // 40
  // Check that we have a container for the event, Create listener array                                              // 41
  if (typeof list[eventName] === 'undefined') {                                                                       // 42
    list[eventName] = [];                                                                                             // 43
  }                                                                                                                   // 44
                                                                                                                      // 45
  // Make sure the listener is not in there already?                                                                  // 46
  // We have to comment this to be compliant with node.js                                                             // 47
  // list[eventName] = _.without(list[eventName], listener);                                                          // 48
                                                                                                                      // 49
  // Add the listener and Check the limit                                                                             // 50
  return _checkListenerLimit.apply(this, [eventName, list[eventName].push(listener)]);                                // 51
};                                                                                                                    // 52
                                                                                                                      // 53
// Adds a listener to the end of the listeners array for the specified event.                                         // 54
// server.on('connection', function (stream) {                                                                        // 55
//   console.log('someone connected!');                                                                               // 56
// });                                                                                                                // 57
// Returns emitter, so calls can be chained.                                                                          // 58
EventEmitter.prototype.on = function(eventName, listener) {                                                           // 59
  var warn = _addToList.apply(this, [this._eventEmitter.onListeners, eventName, listener]);                           // 60
                                                                                                                      // 61
  // Warn if needed                                                                                                   // 62
  if (warn) {                                                                                                         // 63
    console.warn((new Error(warn)).stack);                                                                            // 64
  }                                                                                                                   // 65
                                                                                                                      // 66
  // Return the emitter                                                                                               // 67
  return this;                                                                                                        // 68
};                                                                                                                    // 69
                                                                                                                      // 70
// Adds a one time listener for the event. This listener is invoked                                                   // 71
// only the next time the event is fired, after which it is removed.                                                  // 72
EventEmitter.prototype.once = function(eventName, listener) {                                                         // 73
  var warn = _addToList.apply(this, [this._eventEmitter.onceListeners, eventName, listener]);                         // 74
                                                                                                                      // 75
  // Warn if needed                                                                                                   // 76
  if (warn) {                                                                                                         // 77
    console.warn((new Error(warn)).stack);                                                                            // 78
  }                                                                                                                   // 79
                                                                                                                      // 80
  // Return the emitter                                                                                               // 81
  return this;                                                                                                        // 82
};                                                                                                                    // 83
                                                                                                                      // 84
var _runCallbacks = function(listenerArray, args) {                                                                   // 85
  var self = this;                                                                                                    // 86
  // count of listeners triggered                                                                                     // 87
  var count = 0;                                                                                                      // 88
  // Check if we have anything to work with                                                                           // 89
  if (typeof listenerArray !== 'undefined') {                                                                         // 90
    // Try to iterate over the listeners                                                                              // 91
    _.each(listenerArray, function(listener) {                                                                        // 92
      // Count listener calls                                                                                         // 93
      count++;                                                                                                        // 94
      // Send the job to the eventloop                                                                                // 95
      listener.apply(self, args);                                                                                     // 96
    });                                                                                                               // 97
  }                                                                                                                   // 98
                                                                                                                      // 99
  // Return the count                                                                                                 // 100
  return count;                                                                                                       // 101
};                                                                                                                    // 102
                                                                                                                      // 103
// emitter.emit(event, [arg1], [arg2], [...])#                                                                        // 104
// Execute each of the listeners in order with the supplied arguments.                                                // 105
EventEmitter.prototype.emit = function(eventName /* arguments */) {                                                   // 106
  var self = this;                                                                                                    // 107
  // make argument list to pass on to listeners                                                                       // 108
  var args = _.rest(arguments);                                                                                       // 109
                                                                                                                      // 110
  // Count listeners triggered                                                                                        // 111
  var count = 0;                                                                                                      // 112
                                                                                                                      // 113
  // Swap once list                                                                                                   // 114
  var onceList = self._eventEmitter.onceListeners[eventName];                                                         // 115
                                                                                                                      // 116
  // Empty the once list                                                                                              // 117
  self._eventEmitter.onceListeners[eventName] = [];                                                                   // 118
                                                                                                                      // 119
  // Trigger on listeners                                                                                             // 120
  count += _runCallbacks.call(self, self._eventEmitter.onListeners[eventName], args);                                 // 121
                                                                                                                      // 122
  // Trigger once listeners                                                                                           // 123
  count += _runCallbacks.call(self, onceList, args);                                                                  // 124
                                                                                                                      // 125
  // Returns true if event had listeners, false otherwise.                                                            // 126
  return (count > 0);                                                                                                 // 127
};                                                                                                                    // 128
                                                                                                                      // 129
// XXX: When removing a listener in node js it only removes one - not all.                                            // 130
var _withoutOne = function(list, obj) {                                                                               // 131
  var found = false;                                                                                                  // 132
  var result = [];                                                                                                    // 133
                                                                                                                      // 134
  // Iterate over listeners                                                                                           // 135
  for (var i = 0; i < list.length; i++) {                                                                             // 136
    // Check if we found one...                                                                                       // 137
    if (!found && list[i] === obj) {                                                                                  // 138
      found = true;                                                                                                   // 139
    } else {                                                                                                          // 140
      result.push(list[i]);                                                                                           // 141
    }                                                                                                                 // 142
  }                                                                                                                   // 143
                                                                                                                      // 144
  // return the new array                                                                                             // 145
  return result;                                                                                                      // 146
};                                                                                                                    // 147
                                                                                                                      // 148
// Removes all listeners, or those of the specified event. It's not a                                                 // 149
// good idea to remove listeners that were added elsewhere in the code,                                               // 150
// especially when it's on an emitter that you didn't create (e.g. sockets                                            // 151
// or file streams).                                                                                                  // 152
// Returns emitter, so calls can be chained.                                                                          // 153
EventEmitter.prototype.off = function(eventName, listener) {                                                          // 154
  var self = this;                                                                                                    // 155
  if (eventName) {                                                                                                    // 156
    if (typeof listener === 'function') {                                                                             // 157
      // its a bit more tricky - we have to iterate over the arrays and only                                          // 158
      // clone listeners not equal to                                                                                 // 159
      if (typeof self._eventEmitter.onListeners[eventName] !== 'undefined') {                                         // 160
        self._eventEmitter.onListeners[eventName] = _withoutOne(self._eventEmitter.onListeners[eventName], listener); // 161
                                                                                                                      // 162
      }                                                                                                               // 163
      if (typeof self._eventEmitter.onceListeners[eventName] !== 'undefined') {                                       // 164
        self._eventEmitter.onceListeners[eventName] = _withoutOne(self._eventEmitter.onceListeners[eventName], listener);
                                                                                                                      // 166
      }                                                                                                               // 167
    } else {                                                                                                          // 168
      // Remove all listeners for eventName                                                                           // 169
      self._eventEmitter.onListeners[eventName] = [];                                                                 // 170
      self._eventEmitter.onceListeners[eventName] = [];                                                               // 171
    }                                                                                                                 // 172
                                                                                                                      // 173
  } else {                                                                                                            // 174
    // Remove all listeners                                                                                           // 175
    self._eventEmitter.onListeners = {};                                                                              // 176
    self._eventEmitter.onceListeners = {};                                                                            // 177
  }                                                                                                                   // 178
};                                                                                                                    // 179
                                                                                                                      // 180
// Add api helpers                                                                                                    // 181
EventEmitter.prototype.addListener = EventEmitter.prototype.on;                                                       // 182
EventEmitter.prototype.removeListener = EventEmitter.prototype.off;                                                   // 183
EventEmitter.prototype.removeAllListeners = EventEmitter.prototype.off;                                               // 184
                                                                                                                      // 185
// Add jquery like helpers                                                                                            // 186
EventEmitter.prototype.one = EventEmitter.prototype.once;                                                             // 187
EventEmitter.prototype.trigger = EventEmitter.prototype.emit;                                                         // 188
                                                                                                                      // 189
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 199
}).call(this);                                                       // 200
                                                                     // 201
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['raix:eventemitter'] = {}, {
  EventEmitter: EventEmitter
});

})();
