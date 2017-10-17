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
var OrderedDict;

(function(){

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// packages/ordered-dict/ordered_dict.js                                         //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
// This file defines an ordered dictionary abstraction that is useful for        // 1
// maintaining a dataset backed by observeChanges.  It supports ordering items   // 2
// by specifying the item they now come before.                                  // 3
                                                                                 // 4
// The implementation is a dictionary that contains nodes of a doubly-linked     // 5
// list as its values.                                                           // 6
                                                                                 // 7
// constructs a new element struct                                               // 8
// next and prev are whole elements, not keys.                                   // 9
var element = function (key, value, next, prev) {                                // 10
  return {                                                                       // 11
    key: key,                                                                    // 12
    value: value,                                                                // 13
    next: next,                                                                  // 14
    prev: prev                                                                   // 15
  };                                                                             // 16
};                                                                               // 17
OrderedDict = function (/* ... */) {                                             // 18
  var self = this;                                                               // 19
  self._dict = {};                                                               // 20
  self._first = null;                                                            // 21
  self._last = null;                                                             // 22
  self._size = 0;                                                                // 23
  var args = _.toArray(arguments);                                               // 24
  self._stringify = function (x) { return x; };                                  // 25
  if (typeof args[0] === 'function')                                             // 26
    self._stringify = args.shift();                                              // 27
  _.each(args, function (kv) {                                                   // 28
    self.putBefore(kv[0], kv[1], null);                                          // 29
  });                                                                            // 30
};                                                                               // 31
                                                                                 // 32
_.extend(OrderedDict.prototype, {                                                // 33
  // the "prefix keys with a space" thing comes from here                        // 34
  // https://github.com/documentcloud/underscore/issues/376#issuecomment-2815649
  _k: function (key) { return " " + this._stringify(key); },                     // 36
                                                                                 // 37
  empty: function () {                                                           // 38
    var self = this;                                                             // 39
    return !self._first;                                                         // 40
  },                                                                             // 41
  size: function () {                                                            // 42
    var self = this;                                                             // 43
    return self._size;                                                           // 44
  },                                                                             // 45
  _linkEltIn: function (elt) {                                                   // 46
    var self = this;                                                             // 47
    if (!elt.next) {                                                             // 48
      elt.prev = self._last;                                                     // 49
      if (self._last)                                                            // 50
        self._last.next = elt;                                                   // 51
      self._last = elt;                                                          // 52
    } else {                                                                     // 53
      elt.prev = elt.next.prev;                                                  // 54
      elt.next.prev = elt;                                                       // 55
      if (elt.prev)                                                              // 56
        elt.prev.next = elt;                                                     // 57
    }                                                                            // 58
    if (self._first === null || self._first === elt.next)                        // 59
      self._first = elt;                                                         // 60
  },                                                                             // 61
  _linkEltOut: function (elt) {                                                  // 62
    var self = this;                                                             // 63
    if (elt.next)                                                                // 64
      elt.next.prev = elt.prev;                                                  // 65
    if (elt.prev)                                                                // 66
      elt.prev.next = elt.next;                                                  // 67
    if (elt === self._last)                                                      // 68
      self._last = elt.prev;                                                     // 69
    if (elt === self._first)                                                     // 70
      self._first = elt.next;                                                    // 71
  },                                                                             // 72
  putBefore: function (key, item, before) {                                      // 73
    var self = this;                                                             // 74
    if (self._dict[self._k(key)])                                                // 75
      throw new Error("Item " + key + " already present in OrderedDict");        // 76
    var elt = before ?                                                           // 77
          element(key, item, self._dict[self._k(before)]) :                      // 78
          element(key, item, null);                                              // 79
    if (elt.next === undefined)                                                  // 80
      throw new Error("could not find item to put this one before");             // 81
    self._linkEltIn(elt);                                                        // 82
    self._dict[self._k(key)] = elt;                                              // 83
    self._size++;                                                                // 84
  },                                                                             // 85
  append: function (key, item) {                                                 // 86
    var self = this;                                                             // 87
    self.putBefore(key, item, null);                                             // 88
  },                                                                             // 89
  remove: function (key) {                                                       // 90
    var self = this;                                                             // 91
    var elt = self._dict[self._k(key)];                                          // 92
    if (elt === undefined)                                                       // 93
      throw new Error("Item " + key + " not present in OrderedDict");            // 94
    self._linkEltOut(elt);                                                       // 95
    self._size--;                                                                // 96
    delete self._dict[self._k(key)];                                             // 97
    return elt.value;                                                            // 98
  },                                                                             // 99
  get: function (key) {                                                          // 100
    var self = this;                                                             // 101
    if (self.has(key))                                                           // 102
        return self._dict[self._k(key)].value;                                   // 103
    return undefined;                                                            // 104
  },                                                                             // 105
  has: function (key) {                                                          // 106
    var self = this;                                                             // 107
    return _.has(self._dict, self._k(key));                                      // 108
  },                                                                             // 109
  // Iterate through the items in this dictionary in order, calling              // 110
  // iter(value, key, index) on each one.                                        // 111
                                                                                 // 112
  // Stops whenever iter returns OrderedDict.BREAK, or after the last element.   // 113
  forEach: function (iter) {                                                     // 114
    var self = this;                                                             // 115
    var i = 0;                                                                   // 116
    var elt = self._first;                                                       // 117
    while (elt !== null) {                                                       // 118
      var b = iter(elt.value, elt.key, i);                                       // 119
      if (b === OrderedDict.BREAK)                                               // 120
        return;                                                                  // 121
      elt = elt.next;                                                            // 122
      i++;                                                                       // 123
    }                                                                            // 124
  },                                                                             // 125
  first: function () {                                                           // 126
    var self = this;                                                             // 127
    if (self.empty())                                                            // 128
      return undefined;                                                          // 129
    return self._first.key;                                                      // 130
  },                                                                             // 131
  firstValue: function () {                                                      // 132
    var self = this;                                                             // 133
    if (self.empty())                                                            // 134
      return undefined;                                                          // 135
    return self._first.value;                                                    // 136
  },                                                                             // 137
  last: function () {                                                            // 138
    var self = this;                                                             // 139
    if (self.empty())                                                            // 140
      return undefined;                                                          // 141
    return self._last.key;                                                       // 142
  },                                                                             // 143
  lastValue: function () {                                                       // 144
    var self = this;                                                             // 145
    if (self.empty())                                                            // 146
      return undefined;                                                          // 147
    return self._last.value;                                                     // 148
  },                                                                             // 149
  prev: function (key) {                                                         // 150
    var self = this;                                                             // 151
    if (self.has(key)) {                                                         // 152
      var elt = self._dict[self._k(key)];                                        // 153
      if (elt.prev)                                                              // 154
        return elt.prev.key;                                                     // 155
    }                                                                            // 156
    return null;                                                                 // 157
  },                                                                             // 158
  next: function (key) {                                                         // 159
    var self = this;                                                             // 160
    if (self.has(key)) {                                                         // 161
      var elt = self._dict[self._k(key)];                                        // 162
      if (elt.next)                                                              // 163
        return elt.next.key;                                                     // 164
    }                                                                            // 165
    return null;                                                                 // 166
  },                                                                             // 167
  moveBefore: function (key, before) {                                           // 168
    var self = this;                                                             // 169
    var elt = self._dict[self._k(key)];                                          // 170
    var eltBefore = before ? self._dict[self._k(before)] : null;                 // 171
    if (elt === undefined)                                                       // 172
      throw new Error("Item to move is not present");                            // 173
    if (eltBefore === undefined) {                                               // 174
      throw new Error("Could not find element to move this one before");         // 175
    }                                                                            // 176
    if (eltBefore === elt.next) // no moving necessary                           // 177
      return;                                                                    // 178
    // remove from its old place                                                 // 179
    self._linkEltOut(elt);                                                       // 180
    // patch into its new place                                                  // 181
    elt.next = eltBefore;                                                        // 182
    self._linkEltIn(elt);                                                        // 183
  },                                                                             // 184
  // Linear, sadly.                                                              // 185
  indexOf: function (key) {                                                      // 186
    var self = this;                                                             // 187
    var ret = null;                                                              // 188
    self.forEach(function (v, k, i) {                                            // 189
      if (self._k(k) === self._k(key)) {                                         // 190
        ret = i;                                                                 // 191
        return OrderedDict.BREAK;                                                // 192
      }                                                                          // 193
      return undefined;                                                          // 194
    });                                                                          // 195
    return ret;                                                                  // 196
  },                                                                             // 197
  _checkRep: function () {                                                       // 198
    var self = this;                                                             // 199
    _.each(self._dict, function (k, v) {                                         // 200
      if (v.next === v)                                                          // 201
        throw new Error("Next is a loop");                                       // 202
      if (v.prev === v)                                                          // 203
        throw new Error("Prev is a loop");                                       // 204
    });                                                                          // 205
  }                                                                              // 206
                                                                                 // 207
});                                                                              // 208
OrderedDict.BREAK = {"break": true};                                             // 209
                                                                                 // 210
///////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['ordered-dict'] = {}, {
  OrderedDict: OrderedDict
});

})();
