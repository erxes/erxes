//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Package-scope variables */
var exports, _;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/underscore/pre.js                                                                            //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
// Define an object named exports. This will cause underscore.js to put `_` as a                         // 1
// field on it, instead of in the global namespace.  See also post.js.                                   // 2
exports = {};                                                                                            // 3
                                                                                                         // 4
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/underscore/underscore.js                                                                     //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
//     Underscore.js 1.5.2                                                                               // 1
//     http://underscorejs.org                                                                           // 2
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors                // 3
//     Underscore may be freely distributed under the MIT license.                                       // 4
                                                                                                         // 5
(function() {                                                                                            // 6
                                                                                                         // 7
  // Baseline setup                                                                                      // 8
  // --------------                                                                                      // 9
                                                                                                         // 10
  // Establish the root object, `window` in the browser, or `exports` on the server.                     // 11
  var root = this;                                                                                       // 12
                                                                                                         // 13
  // Save the previous value of the `_` variable.                                                        // 14
  var previousUnderscore = root._;                                                                       // 15
                                                                                                         // 16
  // Establish the object that gets returned to break out of a loop iteration.                           // 17
  var breaker = {};                                                                                      // 18
                                                                                                         // 19
  // Save bytes in the minified (but not gzipped) version:                                               // 20
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;         // 21
                                                                                                         // 22
  // Create quick reference variables for speed access to core prototypes.                               // 23
  var                                                                                                    // 24
    push             = ArrayProto.push,                                                                  // 25
    slice            = ArrayProto.slice,                                                                 // 26
    concat           = ArrayProto.concat,                                                                // 27
    toString         = ObjProto.toString,                                                                // 28
    hasOwnProperty   = ObjProto.hasOwnProperty;                                                          // 29
                                                                                                         // 30
  // All **ECMAScript 5** native function implementations that we hope to use                            // 31
  // are declared here.                                                                                  // 32
  var                                                                                                    // 33
    nativeForEach      = ArrayProto.forEach,                                                             // 34
    nativeMap          = ArrayProto.map,                                                                 // 35
    nativeReduce       = ArrayProto.reduce,                                                              // 36
    nativeReduceRight  = ArrayProto.reduceRight,                                                         // 37
    nativeFilter       = ArrayProto.filter,                                                              // 38
    nativeEvery        = ArrayProto.every,                                                               // 39
    nativeSome         = ArrayProto.some,                                                                // 40
    nativeIndexOf      = ArrayProto.indexOf,                                                             // 41
    nativeLastIndexOf  = ArrayProto.lastIndexOf,                                                         // 42
    nativeIsArray      = Array.isArray,                                                                  // 43
    nativeKeys         = Object.keys,                                                                    // 44
    nativeBind         = FuncProto.bind;                                                                 // 45
                                                                                                         // 46
  // Create a safe reference to the Underscore object for use below.                                     // 47
  var _ = function(obj) {                                                                                // 48
    if (obj instanceof _) return obj;                                                                    // 49
    if (!(this instanceof _)) return new _(obj);                                                         // 50
    this._wrapped = obj;                                                                                 // 51
  };                                                                                                     // 52
                                                                                                         // 53
  // Export the Underscore object for **Node.js**, with                                                  // 54
  // backwards-compatibility for the old `require()` API. If we're in                                    // 55
  // the browser, add `_` as a global object via a string identifier,                                    // 56
  // for Closure Compiler "advanced" mode.                                                               // 57
  if (typeof exports !== 'undefined') {                                                                  // 58
    if (typeof module !== 'undefined' && module.exports) {                                               // 59
      exports = module.exports = _;                                                                      // 60
    }                                                                                                    // 61
    exports._ = _;                                                                                       // 62
  } else {                                                                                               // 63
    root._ = _;                                                                                          // 64
  }                                                                                                      // 65
                                                                                                         // 66
  // Current version.                                                                                    // 67
  _.VERSION = '1.5.2';                                                                                   // 68
                                                                                                         // 69
  // Collection Functions                                                                                // 70
  // --------------------                                                                                // 71
                                                                                                         // 72
  // METEOR CHANGE: Define _isArguments instead of depending on                                          // 73
  // _.isArguments which is defined using each. In looksLikeArray                                        // 74
  // (which each depends on), we then use _isArguments instead of                                        // 75
  // _.isArguments.                                                                                      // 76
  var _isArguments = function (obj) {                                                                    // 77
    return toString.call(obj) === '[object Arguments]';                                                  // 78
  };                                                                                                     // 79
  // Define a fallback version of the method in browsers (ahem, IE), where                               // 80
  // there isn't any inspectable "Arguments" type.                                                       // 81
  if (!_isArguments(arguments)) {                                                                        // 82
    _isArguments = function (obj) {                                                                      // 83
      return !!(obj && hasOwnProperty.call(obj, 'callee') && typeof obj.callee === 'function');          // 84
    };                                                                                                   // 85
  }                                                                                                      // 86
                                                                                                         // 87
  // METEOR CHANGE: _.each({length: 5}) should be treated like an object, not an                         // 88
  // array. This looksLikeArray function is introduced by Meteor, and replaces                           // 89
  // all instances of `obj.length === +obj.length`.                                                      // 90
  // https://github.com/meteor/meteor/issues/594                                                         // 91
  // https://github.com/jashkenas/underscore/issues/770                                                  // 92
  var looksLikeArray = function (obj) {                                                                  // 93
    return (obj.length === +obj.length                                                                   // 94
            // _.isArguments not yet necessarily defined here                                            // 95
            && (_isArguments(obj) || obj.constructor !== Object));                                       // 96
  };                                                                                                     // 97
                                                                                                         // 98
  // The cornerstone, an `each` implementation, aka `forEach`.                                           // 99
  // Handles objects with the built-in `forEach`, arrays, and raw objects.                               // 100
  // Delegates to **ECMAScript 5**'s native `forEach` if available.                                      // 101
  var each = _.each = _.forEach = function(obj, iterator, context) {                                     // 102
    if (obj == null) return;                                                                             // 103
    if (nativeForEach && obj.forEach === nativeForEach) {                                                // 104
      obj.forEach(iterator, context);                                                                    // 105
    } else if (looksLikeArray(obj)) {                                                                    // 106
      for (var i = 0, length = obj.length; i < length; i++) {                                            // 107
        if (iterator.call(context, obj[i], i, obj) === breaker) return;                                  // 108
      }                                                                                                  // 109
    } else {                                                                                             // 110
      var keys = _.keys(obj);                                                                            // 111
      for (var i = 0, length = keys.length; i < length; i++) {                                           // 112
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;                      // 113
      }                                                                                                  // 114
    }                                                                                                    // 115
  };                                                                                                     // 116
                                                                                                         // 117
  // Return the results of applying the iterator to each element.                                        // 118
  // Delegates to **ECMAScript 5**'s native `map` if available.                                          // 119
  _.map = _.collect = function(obj, iterator, context) {                                                 // 120
    var results = [];                                                                                    // 121
    if (obj == null) return results;                                                                     // 122
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);                           // 123
    each(obj, function(value, index, list) {                                                             // 124
      results.push(iterator.call(context, value, index, list));                                          // 125
    });                                                                                                  // 126
    return results;                                                                                      // 127
  };                                                                                                     // 128
                                                                                                         // 129
  var reduceError = 'Reduce of empty array with no initial value';                                       // 130
                                                                                                         // 131
  // **Reduce** builds up a single result from a list of values, aka `inject`,                           // 132
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.                           // 133
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {                               // 134
    var initial = arguments.length > 2;                                                                  // 135
    if (obj == null) obj = [];                                                                           // 136
    if (nativeReduce && obj.reduce === nativeReduce) {                                                   // 137
      if (context) iterator = _.bind(iterator, context);                                                 // 138
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);                                // 139
    }                                                                                                    // 140
    each(obj, function(value, index, list) {                                                             // 141
      if (!initial) {                                                                                    // 142
        memo = value;                                                                                    // 143
        initial = true;                                                                                  // 144
      } else {                                                                                           // 145
        memo = iterator.call(context, memo, value, index, list);                                         // 146
      }                                                                                                  // 147
    });                                                                                                  // 148
    if (!initial) throw new TypeError(reduceError);                                                      // 149
    return memo;                                                                                         // 150
  };                                                                                                     // 151
                                                                                                         // 152
  // The right-associative version of reduce, also known as `foldr`.                                     // 153
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.                                  // 154
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {                                     // 155
    var initial = arguments.length > 2;                                                                  // 156
    if (obj == null) obj = [];                                                                           // 157
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {                                    // 158
      if (context) iterator = _.bind(iterator, context);                                                 // 159
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);                      // 160
    }                                                                                                    // 161
    var length = obj.length;                                                                             // 162
    if (!looksLikeArray(obj)) {                                                                          // 163
      var keys = _.keys(obj);                                                                            // 164
      length = keys.length;                                                                              // 165
    }                                                                                                    // 166
    each(obj, function(value, index, list) {                                                             // 167
      index = keys ? keys[--length] : --length;                                                          // 168
      if (!initial) {                                                                                    // 169
        memo = obj[index];                                                                               // 170
        initial = true;                                                                                  // 171
      } else {                                                                                           // 172
        memo = iterator.call(context, memo, obj[index], index, list);                                    // 173
      }                                                                                                  // 174
    });                                                                                                  // 175
    if (!initial) throw new TypeError(reduceError);                                                      // 176
    return memo;                                                                                         // 177
  };                                                                                                     // 178
                                                                                                         // 179
  // Return the first value which passes a truth test. Aliased as `detect`.                              // 180
  _.find = _.detect = function(obj, iterator, context) {                                                 // 181
    var result;                                                                                          // 182
    any(obj, function(value, index, list) {                                                              // 183
      if (iterator.call(context, value, index, list)) {                                                  // 184
        result = value;                                                                                  // 185
        return true;                                                                                     // 186
      }                                                                                                  // 187
    });                                                                                                  // 188
    return result;                                                                                       // 189
  };                                                                                                     // 190
                                                                                                         // 191
  // Return all the elements that pass a truth test.                                                     // 192
  // Delegates to **ECMAScript 5**'s native `filter` if available.                                       // 193
  // Aliased as `select`.                                                                                // 194
  _.filter = _.select = function(obj, iterator, context) {                                               // 195
    var results = [];                                                                                    // 196
    if (obj == null) return results;                                                                     // 197
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);               // 198
    each(obj, function(value, index, list) {                                                             // 199
      if (iterator.call(context, value, index, list)) results.push(value);                               // 200
    });                                                                                                  // 201
    return results;                                                                                      // 202
  };                                                                                                     // 203
                                                                                                         // 204
  // Return all the elements for which a truth test fails.                                               // 205
  _.reject = function(obj, iterator, context) {                                                          // 206
    return _.filter(obj, function(value, index, list) {                                                  // 207
      return !iterator.call(context, value, index, list);                                                // 208
    }, context);                                                                                         // 209
  };                                                                                                     // 210
                                                                                                         // 211
  // Determine whether all of the elements match a truth test.                                           // 212
  // Delegates to **ECMAScript 5**'s native `every` if available.                                        // 213
  // Aliased as `all`.                                                                                   // 214
  _.every = _.all = function(obj, iterator, context) {                                                   // 215
    iterator || (iterator = _.identity);                                                                 // 216
    var result = true;                                                                                   // 217
    if (obj == null) return result;                                                                      // 218
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);                   // 219
    each(obj, function(value, index, list) {                                                             // 220
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;              // 221
    });                                                                                                  // 222
    return !!result;                                                                                     // 223
  };                                                                                                     // 224
                                                                                                         // 225
  // Determine if at least one element in the object matches a truth test.                               // 226
  // Delegates to **ECMAScript 5**'s native `some` if available.                                         // 227
  // Aliased as `any`.                                                                                   // 228
  var any = _.some = _.any = function(obj, iterator, context) {                                          // 229
    iterator || (iterator = _.identity);                                                                 // 230
    var result = false;                                                                                  // 231
    if (obj == null) return result;                                                                      // 232
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);                       // 233
    each(obj, function(value, index, list) {                                                             // 234
      if (result || (result = iterator.call(context, value, index, list))) return breaker;               // 235
    });                                                                                                  // 236
    return !!result;                                                                                     // 237
  };                                                                                                     // 238
                                                                                                         // 239
  // Determine if the array or object contains a given value (using `===`).                              // 240
  // Aliased as `include`.                                                                               // 241
  _.contains = _.include = function(obj, target) {                                                       // 242
    if (obj == null) return false;                                                                       // 243
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;                // 244
    return any(obj, function(value) {                                                                    // 245
      return value === target;                                                                           // 246
    });                                                                                                  // 247
  };                                                                                                     // 248
                                                                                                         // 249
  // Invoke a method (with arguments) on every item in a collection.                                     // 250
  _.invoke = function(obj, method) {                                                                     // 251
    var args = slice.call(arguments, 2);                                                                 // 252
    var isFunc = _.isFunction(method);                                                                   // 253
    return _.map(obj, function(value) {                                                                  // 254
      return (isFunc ? method : value[method]).apply(value, args);                                       // 255
    });                                                                                                  // 256
  };                                                                                                     // 257
                                                                                                         // 258
  // Convenience version of a common use case of `map`: fetching a property.                             // 259
  _.pluck = function(obj, key) {                                                                         // 260
    return _.map(obj, function(value){ return value[key]; });                                            // 261
  };                                                                                                     // 262
                                                                                                         // 263
  // Convenience version of a common use case of `filter`: selecting only objects                        // 264
  // containing specific `key:value` pairs.                                                              // 265
  _.where = function(obj, attrs, first) {                                                                // 266
    if (_.isEmpty(attrs)) return first ? void 0 : [];                                                    // 267
    return _[first ? 'find' : 'filter'](obj, function(value) {                                           // 268
      for (var key in attrs) {                                                                           // 269
        if (attrs[key] !== value[key]) return false;                                                     // 270
      }                                                                                                  // 271
      return true;                                                                                       // 272
    });                                                                                                  // 273
  };                                                                                                     // 274
                                                                                                         // 275
  // Convenience version of a common use case of `find`: getting the first object                        // 276
  // containing specific `key:value` pairs.                                                              // 277
  _.findWhere = function(obj, attrs) {                                                                   // 278
    return _.where(obj, attrs, true);                                                                    // 279
  };                                                                                                     // 280
                                                                                                         // 281
  // Return the maximum element or (element-based computation).                                          // 282
  // Can't optimize arrays of integers longer than 65,535 elements.                                      // 283
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)                               // 284
  _.max = function(obj, iterator, context) {                                                             // 285
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {                       // 286
      return Math.max.apply(Math, obj);                                                                  // 287
    }                                                                                                    // 288
    if (!iterator && _.isEmpty(obj)) return -Infinity;                                                   // 289
    var result = {computed : -Infinity, value: -Infinity};                                               // 290
    each(obj, function(value, index, list) {                                                             // 291
      var computed = iterator ? iterator.call(context, value, index, list) : value;                      // 292
      computed > result.computed && (result = {value : value, computed : computed});                     // 293
    });                                                                                                  // 294
    return result.value;                                                                                 // 295
  };                                                                                                     // 296
                                                                                                         // 297
  // Return the minimum element (or element-based computation).                                          // 298
  _.min = function(obj, iterator, context) {                                                             // 299
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {                       // 300
      return Math.min.apply(Math, obj);                                                                  // 301
    }                                                                                                    // 302
    if (!iterator && _.isEmpty(obj)) return Infinity;                                                    // 303
    var result = {computed : Infinity, value: Infinity};                                                 // 304
    each(obj, function(value, index, list) {                                                             // 305
      var computed = iterator ? iterator.call(context, value, index, list) : value;                      // 306
      computed < result.computed && (result = {value : value, computed : computed});                     // 307
    });                                                                                                  // 308
    return result.value;                                                                                 // 309
  };                                                                                                     // 310
                                                                                                         // 311
  // Shuffle an array, using the modern version of the                                                   // 312
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).                          // 313
  _.shuffle = function(obj) {                                                                            // 314
    var rand;                                                                                            // 315
    var index = 0;                                                                                       // 316
    var shuffled = [];                                                                                   // 317
    each(obj, function(value) {                                                                          // 318
      rand = _.random(index++);                                                                          // 319
      shuffled[index - 1] = shuffled[rand];                                                              // 320
      shuffled[rand] = value;                                                                            // 321
    });                                                                                                  // 322
    return shuffled;                                                                                     // 323
  };                                                                                                     // 324
                                                                                                         // 325
  // Sample **n** random values from an array.                                                           // 326
  // If **n** is not specified, returns a single random element from the array.                          // 327
  // The internal `guard` argument allows it to work with `map`.                                         // 328
  _.sample = function(obj, n, guard) {                                                                   // 329
    if (arguments.length < 2 || guard) {                                                                 // 330
      return obj[_.random(obj.length - 1)];                                                              // 331
    }                                                                                                    // 332
    return _.shuffle(obj).slice(0, Math.max(0, n));                                                      // 333
  };                                                                                                     // 334
                                                                                                         // 335
  // An internal function to generate lookup iterators.                                                  // 336
  var lookupIterator = function(value) {                                                                 // 337
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };                            // 338
  };                                                                                                     // 339
                                                                                                         // 340
  // Sort the object's values by a criterion produced by an iterator.                                    // 341
  _.sortBy = function(obj, value, context) {                                                             // 342
    var iterator = lookupIterator(value);                                                                // 343
    return _.pluck(_.map(obj, function(value, index, list) {                                             // 344
      return {                                                                                           // 345
        value: value,                                                                                    // 346
        index: index,                                                                                    // 347
        criteria: iterator.call(context, value, index, list)                                             // 348
      };                                                                                                 // 349
    }).sort(function(left, right) {                                                                      // 350
      var a = left.criteria;                                                                             // 351
      var b = right.criteria;                                                                            // 352
      if (a !== b) {                                                                                     // 353
        if (a > b || a === void 0) return 1;                                                             // 354
        if (a < b || b === void 0) return -1;                                                            // 355
      }                                                                                                  // 356
      return left.index - right.index;                                                                   // 357
    }), 'value');                                                                                        // 358
  };                                                                                                     // 359
                                                                                                         // 360
  // An internal function used for aggregate "group by" operations.                                      // 361
  var group = function(behavior) {                                                                       // 362
    return function(obj, value, context) {                                                               // 363
      var result = {};                                                                                   // 364
      var iterator = value == null ? _.identity : lookupIterator(value);                                 // 365
      each(obj, function(value, index) {                                                                 // 366
        var key = iterator.call(context, value, index, obj);                                             // 367
        behavior(result, key, value);                                                                    // 368
      });                                                                                                // 369
      return result;                                                                                     // 370
    };                                                                                                   // 371
  };                                                                                                     // 372
                                                                                                         // 373
  // Groups the object's values by a criterion. Pass either a string attribute                           // 374
  // to group by, or a function that returns the criterion.                                              // 375
  _.groupBy = group(function(result, key, value) {                                                       // 376
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);                                 // 377
  });                                                                                                    // 378
                                                                                                         // 379
  // Indexes the object's values by a criterion, similar to `groupBy`, but for                           // 380
  // when you know that your index values will be unique.                                                // 381
  _.indexBy = group(function(result, key, value) {                                                       // 382
    result[key] = value;                                                                                 // 383
  });                                                                                                    // 384
                                                                                                         // 385
  // Counts instances of an object that group by a certain criterion. Pass                               // 386
  // either a string attribute to count by, or a function that returns the                               // 387
  // criterion.                                                                                          // 388
  _.countBy = group(function(result, key) {                                                              // 389
    _.has(result, key) ? result[key]++ : result[key] = 1;                                                // 390
  });                                                                                                    // 391
                                                                                                         // 392
  // Use a comparator function to figure out the smallest index at which                                 // 393
  // an object should be inserted so as to maintain order. Uses binary search.                           // 394
  _.sortedIndex = function(array, obj, iterator, context) {                                              // 395
    iterator = iterator == null ? _.identity : lookupIterator(iterator);                                 // 396
    var value = iterator.call(context, obj);                                                             // 397
    var low = 0, high = array.length;                                                                    // 398
    while (low < high) {                                                                                 // 399
      var mid = (low + high) >>> 1;                                                                      // 400
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;                           // 401
    }                                                                                                    // 402
    return low;                                                                                          // 403
  };                                                                                                     // 404
                                                                                                         // 405
  // Safely create a real, live array from anything iterable.                                            // 406
  _.toArray = function(obj) {                                                                            // 407
    if (!obj) return [];                                                                                 // 408
    if (_.isArray(obj)) return slice.call(obj);                                                          // 409
    if (looksLikeArray(obj)) return _.map(obj, _.identity);                                              // 410
    return _.values(obj);                                                                                // 411
  };                                                                                                     // 412
                                                                                                         // 413
  // Return the number of elements in an object.                                                         // 414
  _.size = function(obj) {                                                                               // 415
    if (obj == null) return 0;                                                                           // 416
    return (looksLikeArray(obj)) ? obj.length : _.keys(obj).length;                                      // 417
  };                                                                                                     // 418
                                                                                                         // 419
  // Array Functions                                                                                     // 420
  // ---------------                                                                                     // 421
                                                                                                         // 422
  // Get the first element of an array. Passing **n** will return the first N                            // 423
  // values in the array. Aliased as `head` and `take`. The **guard** check                              // 424
  // allows it to work with `_.map`.                                                                     // 425
  _.first = _.head = _.take = function(array, n, guard) {                                                // 426
    if (array == null) return void 0;                                                                    // 427
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);                                    // 428
  };                                                                                                     // 429
                                                                                                         // 430
  // Returns everything but the last entry of the array. Especially useful on                            // 431
  // the arguments object. Passing **n** will return all the values in                                   // 432
  // the array, excluding the last N. The **guard** check allows it to work with                         // 433
  // `_.map`.                                                                                            // 434
  _.initial = function(array, n, guard) {                                                                // 435
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));                          // 436
  };                                                                                                     // 437
                                                                                                         // 438
  // Get the last element of an array. Passing **n** will return the last N                              // 439
  // values in the array. The **guard** check allows it to work with `_.map`.                            // 440
  _.last = function(array, n, guard) {                                                                   // 441
    if (array == null) return void 0;                                                                    // 442
    if ((n == null) || guard) {                                                                          // 443
      return array[array.length - 1];                                                                    // 444
    } else {                                                                                             // 445
      return slice.call(array, Math.max(array.length - n, 0));                                           // 446
    }                                                                                                    // 447
  };                                                                                                     // 448
                                                                                                         // 449
  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.                  // 450
  // Especially useful on the arguments object. Passing an **n** will return                             // 451
  // the rest N values in the array. The **guard**                                                       // 452
  // check allows it to work with `_.map`.                                                               // 453
  _.rest = _.tail = _.drop = function(array, n, guard) {                                                 // 454
    return slice.call(array, (n == null) || guard ? 1 : n);                                              // 455
  };                                                                                                     // 456
                                                                                                         // 457
  // Trim out all falsy values from an array.                                                            // 458
  _.compact = function(array) {                                                                          // 459
    return _.filter(array, _.identity);                                                                  // 460
  };                                                                                                     // 461
                                                                                                         // 462
  // Internal implementation of a recursive `flatten` function.                                          // 463
  var flatten = function(input, shallow, output) {                                                       // 464
    if (shallow && _.every(input, _.isArray)) {                                                          // 465
      return concat.apply(output, input);                                                                // 466
    }                                                                                                    // 467
    each(input, function(value) {                                                                        // 468
      if (_.isArray(value) || _.isArguments(value)) {                                                    // 469
        shallow ? push.apply(output, value) : flatten(value, shallow, output);                           // 470
      } else {                                                                                           // 471
        output.push(value);                                                                              // 472
      }                                                                                                  // 473
    });                                                                                                  // 474
    return output;                                                                                       // 475
  };                                                                                                     // 476
                                                                                                         // 477
  // Flatten out an array, either recursively (by default), or just one level.                           // 478
  _.flatten = function(array, shallow) {                                                                 // 479
    return flatten(array, shallow, []);                                                                  // 480
  };                                                                                                     // 481
                                                                                                         // 482
  // Return a version of the array that does not contain the specified value(s).                         // 483
  _.without = function(array) {                                                                          // 484
    return _.difference(array, slice.call(arguments, 1));                                                // 485
  };                                                                                                     // 486
                                                                                                         // 487
  // Produce a duplicate-free version of the array. If the array has already                             // 488
  // been sorted, you have the option of using a faster algorithm.                                       // 489
  // Aliased as `unique`.                                                                                // 490
  _.uniq = _.unique = function(array, isSorted, iterator, context) {                                     // 491
    if (_.isFunction(isSorted)) {                                                                        // 492
      context = iterator;                                                                                // 493
      iterator = isSorted;                                                                               // 494
      isSorted = false;                                                                                  // 495
    }                                                                                                    // 496
    var initial = iterator ? _.map(array, iterator, context) : array;                                    // 497
    var results = [];                                                                                    // 498
    var seen = [];                                                                                       // 499
    each(initial, function(value, index) {                                                               // 500
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {           // 501
        seen.push(value);                                                                                // 502
        results.push(array[index]);                                                                      // 503
      }                                                                                                  // 504
    });                                                                                                  // 505
    return results;                                                                                      // 506
  };                                                                                                     // 507
                                                                                                         // 508
  // Produce an array that contains the union: each distinct element from all of                         // 509
  // the passed-in arrays.                                                                               // 510
  _.union = function() {                                                                                 // 511
    return _.uniq(_.flatten(arguments, true));                                                           // 512
  };                                                                                                     // 513
                                                                                                         // 514
  // Produce an array that contains every item shared between all the                                    // 515
  // passed-in arrays.                                                                                   // 516
  _.intersection = function(array) {                                                                     // 517
    var rest = slice.call(arguments, 1);                                                                 // 518
    return _.filter(_.uniq(array), function(item) {                                                      // 519
      return _.every(rest, function(other) {                                                             // 520
        return _.indexOf(other, item) >= 0;                                                              // 521
      });                                                                                                // 522
    });                                                                                                  // 523
  };                                                                                                     // 524
                                                                                                         // 525
  // Take the difference between one array and a number of other arrays.                                 // 526
  // Only the elements present in just the first array will remain.                                      // 527
  _.difference = function(array) {                                                                       // 528
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));                                       // 529
    return _.filter(array, function(value){ return !_.contains(rest, value); });                         // 530
  };                                                                                                     // 531
                                                                                                         // 532
  // Zip together multiple lists into a single array -- elements that share                              // 533
  // an index go together.                                                                               // 534
  _.zip = function() {                                                                                   // 535
    var length = _.max(_.pluck(arguments, "length").concat(0));                                          // 536
    var results = new Array(length);                                                                     // 537
    for (var i = 0; i < length; i++) {                                                                   // 538
      results[i] = _.pluck(arguments, '' + i);                                                           // 539
    }                                                                                                    // 540
    return results;                                                                                      // 541
  };                                                                                                     // 542
                                                                                                         // 543
  // Converts lists into objects. Pass either a single array of `[key, value]`                           // 544
  // pairs, or two parallel arrays of the same length -- one of keys, and one of                         // 545
  // the corresponding values.                                                                           // 546
  _.object = function(list, values) {                                                                    // 547
    if (list == null) return {};                                                                         // 548
    var result = {};                                                                                     // 549
    for (var i = 0, length = list.length; i < length; i++) {                                             // 550
      if (values) {                                                                                      // 551
        result[list[i]] = values[i];                                                                     // 552
      } else {                                                                                           // 553
        result[list[i][0]] = list[i][1];                                                                 // 554
      }                                                                                                  // 555
    }                                                                                                    // 556
    return result;                                                                                       // 557
  };                                                                                                     // 558
                                                                                                         // 559
  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),                       // 560
  // we need this function. Return the position of the first occurrence of an                            // 561
  // item in an array, or -1 if the item is not included in the array.                                   // 562
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.                                      // 563
  // If the array is large and already in sort order, pass `true`                                        // 564
  // for **isSorted** to use binary search.                                                              // 565
  _.indexOf = function(array, item, isSorted) {                                                          // 566
    if (array == null) return -1;                                                                        // 567
    var i = 0, length = array.length;                                                                    // 568
    if (isSorted) {                                                                                      // 569
      if (typeof isSorted == 'number') {                                                                 // 570
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);                                  // 571
      } else {                                                                                           // 572
        i = _.sortedIndex(array, item);                                                                  // 573
        return array[i] === item ? i : -1;                                                               // 574
      }                                                                                                  // 575
    }                                                                                                    // 576
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);          // 577
    for (; i < length; i++) if (array[i] === item) return i;                                             // 578
    return -1;                                                                                           // 579
  };                                                                                                     // 580
                                                                                                         // 581
  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.                                  // 582
  _.lastIndexOf = function(array, item, from) {                                                          // 583
    if (array == null) return -1;                                                                        // 584
    var hasIndex = from != null;                                                                         // 585
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {                                  // 586
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);                         // 587
    }                                                                                                    // 588
    var i = (hasIndex ? from : array.length);                                                            // 589
    while (i--) if (array[i] === item) return i;                                                         // 590
    return -1;                                                                                           // 591
  };                                                                                                     // 592
                                                                                                         // 593
  // Generate an integer Array containing an arithmetic progression. A port of                           // 594
  // the native Python `range()` function. See                                                           // 595
  // [the Python documentation](http://docs.python.org/library/functions.html#range).                    // 596
  _.range = function(start, stop, step) {                                                                // 597
    if (arguments.length <= 1) {                                                                         // 598
      stop = start || 0;                                                                                 // 599
      start = 0;                                                                                         // 600
    }                                                                                                    // 601
    step = arguments[2] || 1;                                                                            // 602
                                                                                                         // 603
    var length = Math.max(Math.ceil((stop - start) / step), 0);                                          // 604
    var idx = 0;                                                                                         // 605
    var range = new Array(length);                                                                       // 606
                                                                                                         // 607
    while(idx < length) {                                                                                // 608
      range[idx++] = start;                                                                              // 609
      start += step;                                                                                     // 610
    }                                                                                                    // 611
                                                                                                         // 612
    return range;                                                                                        // 613
  };                                                                                                     // 614
                                                                                                         // 615
  // Function (ahem) Functions                                                                           // 616
  // ------------------                                                                                  // 617
                                                                                                         // 618
  // Reusable constructor function for prototype setting.                                                // 619
  var ctor = function(){};                                                                               // 620
                                                                                                         // 621
  // Create a function bound to a given object (assigning `this`, and arguments,                         // 622
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if                              // 623
  // available.                                                                                          // 624
  _.bind = function(func, context) {                                                                     // 625
    var args, bound;                                                                                     // 626
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;                                                        // 628
    args = slice.call(arguments, 2);                                                                     // 629
    return bound = function() {                                                                          // 630
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));      // 631
      ctor.prototype = func.prototype;                                                                   // 632
      var self = new ctor;                                                                               // 633
      ctor.prototype = null;                                                                             // 634
      var result = func.apply(self, args.concat(slice.call(arguments)));                                 // 635
      if (Object(result) === result) return result;                                                      // 636
      return self;                                                                                       // 637
    };                                                                                                   // 638
  };                                                                                                     // 639
                                                                                                         // 640
  // Partially apply a function by creating a version that has had some of its                           // 641
  // arguments pre-filled, without changing its dynamic `this` context.                                  // 642
  _.partial = function(func) {                                                                           // 643
    var args = slice.call(arguments, 1);                                                                 // 644
    return function() {                                                                                  // 645
      return func.apply(this, args.concat(slice.call(arguments)));                                       // 646
    };                                                                                                   // 647
  };                                                                                                     // 648
                                                                                                         // 649
  // Bind all of an object's methods to that object. Useful for ensuring that                            // 650
  // all callbacks defined on an object belong to it.                                                    // 651
  _.bindAll = function(obj) {                                                                            // 652
    var funcs = slice.call(arguments, 1);                                                                // 653
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");                    // 654
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });                                          // 655
    return obj;                                                                                          // 656
  };                                                                                                     // 657
                                                                                                         // 658
  // Memoize an expensive function by storing its results.                                               // 659
  _.memoize = function(func, hasher) {                                                                   // 660
    var memo = {};                                                                                       // 661
    hasher || (hasher = _.identity);                                                                     // 662
    return function() {                                                                                  // 663
      var key = hasher.apply(this, arguments);                                                           // 664
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));                   // 665
    };                                                                                                   // 666
  };                                                                                                     // 667
                                                                                                         // 668
  // Delays a function for the given number of milliseconds, and then calls                              // 669
  // it with the arguments supplied.                                                                     // 670
  _.delay = function(func, wait) {                                                                       // 671
    var args = slice.call(arguments, 2);                                                                 // 672
    return setTimeout(function(){ return func.apply(null, args); }, wait);                               // 673
  };                                                                                                     // 674
                                                                                                         // 675
  // Defers a function, scheduling it to run after the current call stack has                            // 676
  // cleared.                                                                                            // 677
  _.defer = function(func) {                                                                             // 678
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));                                 // 679
  };                                                                                                     // 680
                                                                                                         // 681
  // Returns a function, that, when invoked, will only be triggered at most once                         // 682
  // during a given window of time. Normally, the throttled function will run                            // 683
  // as much as it can, without ever going more than once per `wait` duration;                           // 684
  // but if you'd like to disable the execution on the leading edge, pass                                // 685
  // `{leading: false}`. To disable execution on the trailing edge, ditto.                               // 686
  _.throttle = function(func, wait, options) {                                                           // 687
    var context, args, result;                                                                           // 688
    var timeout = null;                                                                                  // 689
    var previous = 0;                                                                                    // 690
    options || (options = {});                                                                           // 691
    var later = function() {                                                                             // 692
      previous = options.leading === false ? 0 : new Date;                                               // 693
      timeout = null;                                                                                    // 694
      result = func.apply(context, args);                                                                // 695
    };                                                                                                   // 696
    return function() {                                                                                  // 697
      var now = new Date;                                                                                // 698
      if (!previous && options.leading === false) previous = now;                                        // 699
      var remaining = wait - (now - previous);                                                           // 700
      context = this;                                                                                    // 701
      args = arguments;                                                                                  // 702
      if (remaining <= 0) {                                                                              // 703
        clearTimeout(timeout);                                                                           // 704
        timeout = null;                                                                                  // 705
        previous = now;                                                                                  // 706
        result = func.apply(context, args);                                                              // 707
      } else if (!timeout && options.trailing !== false) {                                               // 708
        timeout = setTimeout(later, remaining);                                                          // 709
      }                                                                                                  // 710
      return result;                                                                                     // 711
    };                                                                                                   // 712
  };                                                                                                     // 713
                                                                                                         // 714
  // Returns a function, that, as long as it continues to be invoked, will not                           // 715
  // be triggered. The function will be called after it stops being called for                           // 716
  // N milliseconds. If `immediate` is passed, trigger the function on the                               // 717
  // leading edge, instead of the trailing.                                                              // 718
  _.debounce = function(func, wait, immediate) {                                                         // 719
    var timeout, args, context, timestamp, result;                                                       // 720
    return function() {                                                                                  // 721
      context = this;                                                                                    // 722
      args = arguments;                                                                                  // 723
      timestamp = new Date();                                                                            // 724
      var later = function() {                                                                           // 725
        var last = (new Date()) - timestamp;                                                             // 726
        if (last < wait) {                                                                               // 727
          timeout = setTimeout(later, wait - last);                                                      // 728
        } else {                                                                                         // 729
          timeout = null;                                                                                // 730
          if (!immediate) result = func.apply(context, args);                                            // 731
        }                                                                                                // 732
      };                                                                                                 // 733
      var callNow = immediate && !timeout;                                                               // 734
      if (!timeout) {                                                                                    // 735
        timeout = setTimeout(later, wait);                                                               // 736
      }                                                                                                  // 737
      if (callNow) result = func.apply(context, args);                                                   // 738
      return result;                                                                                     // 739
    };                                                                                                   // 740
  };                                                                                                     // 741
                                                                                                         // 742
  // Returns a function that will be executed at most one time, no matter how                            // 743
  // often you call it. Useful for lazy initialization.                                                  // 744
  _.once = function(func) {                                                                              // 745
    var ran = false, memo;                                                                               // 746
    return function() {                                                                                  // 747
      if (ran) return memo;                                                                              // 748
      ran = true;                                                                                        // 749
      memo = func.apply(this, arguments);                                                                // 750
      func = null;                                                                                       // 751
      return memo;                                                                                       // 752
    };                                                                                                   // 753
  };                                                                                                     // 754
                                                                                                         // 755
  // Returns the first function passed as an argument to the second,                                     // 756
  // allowing you to adjust arguments, run code before and after, and                                    // 757
  // conditionally execute the original function.                                                        // 758
  _.wrap = function(func, wrapper) {                                                                     // 759
    return function() {                                                                                  // 760
      var args = [func];                                                                                 // 761
      push.apply(args, arguments);                                                                       // 762
      return wrapper.apply(this, args);                                                                  // 763
    };                                                                                                   // 764
  };                                                                                                     // 765
                                                                                                         // 766
  // Returns a function that is the composition of a list of functions, each                             // 767
  // consuming the return value of the function that follows.                                            // 768
  _.compose = function() {                                                                               // 769
    var funcs = arguments;                                                                               // 770
    return function() {                                                                                  // 771
      var args = arguments;                                                                              // 772
      for (var i = funcs.length - 1; i >= 0; i--) {                                                      // 773
        args = [funcs[i].apply(this, args)];                                                             // 774
      }                                                                                                  // 775
      return args[0];                                                                                    // 776
    };                                                                                                   // 777
  };                                                                                                     // 778
                                                                                                         // 779
  // Returns a function that will only be executed after being called N times.                           // 780
  _.after = function(times, func) {                                                                      // 781
    return function() {                                                                                  // 782
      if (--times < 1) {                                                                                 // 783
        return func.apply(this, arguments);                                                              // 784
      }                                                                                                  // 785
    };                                                                                                   // 786
  };                                                                                                     // 787
                                                                                                         // 788
  // Object Functions                                                                                    // 789
  // ----------------                                                                                    // 790
                                                                                                         // 791
  // Retrieve the names of an object's properties.                                                       // 792
  // Delegates to **ECMAScript 5**'s native `Object.keys`                                                // 793
  _.keys = nativeKeys || function(obj) {                                                                 // 794
    if (obj !== Object(obj)) throw new TypeError('Invalid object');                                      // 795
    var keys = [];                                                                                       // 796
    for (var key in obj) if (_.has(obj, key)) keys.push(key);                                            // 797
    return keys;                                                                                         // 798
  };                                                                                                     // 799
                                                                                                         // 800
  // Retrieve the values of an object's properties.                                                      // 801
  _.values = function(obj) {                                                                             // 802
    var keys = _.keys(obj);                                                                              // 803
    var length = keys.length;                                                                            // 804
    var values = new Array(length);                                                                      // 805
    for (var i = 0; i < length; i++) {                                                                   // 806
      values[i] = obj[keys[i]];                                                                          // 807
    }                                                                                                    // 808
    return values;                                                                                       // 809
  };                                                                                                     // 810
                                                                                                         // 811
  // Convert an object into a list of `[key, value]` pairs.                                              // 812
  _.pairs = function(obj) {                                                                              // 813
    var keys = _.keys(obj);                                                                              // 814
    var length = keys.length;                                                                            // 815
    var pairs = new Array(length);                                                                       // 816
    for (var i = 0; i < length; i++) {                                                                   // 817
      pairs[i] = [keys[i], obj[keys[i]]];                                                                // 818
    }                                                                                                    // 819
    return pairs;                                                                                        // 820
  };                                                                                                     // 821
                                                                                                         // 822
  // Invert the keys and values of an object. The values must be serializable.                           // 823
  _.invert = function(obj) {                                                                             // 824
    var result = {};                                                                                     // 825
    var keys = _.keys(obj);                                                                              // 826
    for (var i = 0, length = keys.length; i < length; i++) {                                             // 827
      result[obj[keys[i]]] = keys[i];                                                                    // 828
    }                                                                                                    // 829
    return result;                                                                                       // 830
  };                                                                                                     // 831
                                                                                                         // 832
  // Return a sorted list of the function names available on the object.                                 // 833
  // Aliased as `methods`                                                                                // 834
  _.functions = _.methods = function(obj) {                                                              // 835
    var names = [];                                                                                      // 836
    for (var key in obj) {                                                                               // 837
      if (_.isFunction(obj[key])) names.push(key);                                                       // 838
    }                                                                                                    // 839
    return names.sort();                                                                                 // 840
  };                                                                                                     // 841
                                                                                                         // 842
  // Extend a given object with all the properties in passed-in object(s).                               // 843
  _.extend = function(obj) {                                                                             // 844
    each(slice.call(arguments, 1), function(source) {                                                    // 845
      if (source) {                                                                                      // 846
        for (var prop in source) {                                                                       // 847
          obj[prop] = source[prop];                                                                      // 848
        }                                                                                                // 849
      }                                                                                                  // 850
    });                                                                                                  // 851
    return obj;                                                                                          // 852
  };                                                                                                     // 853
                                                                                                         // 854
  // Return a copy of the object only containing the whitelisted properties.                             // 855
  _.pick = function(obj) {                                                                               // 856
    var copy = {};                                                                                       // 857
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));                                       // 858
    each(keys, function(key) {                                                                           // 859
      if (key in obj) copy[key] = obj[key];                                                              // 860
    });                                                                                                  // 861
    return copy;                                                                                         // 862
  };                                                                                                     // 863
                                                                                                         // 864
   // Return a copy of the object without the blacklisted properties.                                    // 865
  _.omit = function(obj) {                                                                               // 866
    var copy = {};                                                                                       // 867
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));                                       // 868
    for (var key in obj) {                                                                               // 869
      if (!_.contains(keys, key)) copy[key] = obj[key];                                                  // 870
    }                                                                                                    // 871
    return copy;                                                                                         // 872
  };                                                                                                     // 873
                                                                                                         // 874
  // Fill in a given object with default properties.                                                     // 875
  _.defaults = function(obj) {                                                                           // 876
    each(slice.call(arguments, 1), function(source) {                                                    // 877
      if (source) {                                                                                      // 878
        for (var prop in source) {                                                                       // 879
          if (obj[prop] === void 0) obj[prop] = source[prop];                                            // 880
        }                                                                                                // 881
      }                                                                                                  // 882
    });                                                                                                  // 883
    return obj;                                                                                          // 884
  };                                                                                                     // 885
                                                                                                         // 886
  // Create a (shallow-cloned) duplicate of an object.                                                   // 887
  _.clone = function(obj) {                                                                              // 888
    if (!_.isObject(obj)) return obj;                                                                    // 889
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);                                             // 890
  };                                                                                                     // 891
                                                                                                         // 892
  // Invokes interceptor with the obj, and then returns obj.                                             // 893
  // The primary purpose of this method is to "tap into" a method chain, in                              // 894
  // order to perform operations on intermediate results within the chain.                               // 895
  _.tap = function(obj, interceptor) {                                                                   // 896
    interceptor(obj);                                                                                    // 897
    return obj;                                                                                          // 898
  };                                                                                                     // 899
                                                                                                         // 900
  // Internal recursive comparison function for `isEqual`.                                               // 901
  var eq = function(a, b, aStack, bStack) {                                                              // 902
    // Identical objects are equal. `0 === -0`, but they aren't identical.                               // 903
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).           // 904
    if (a === b) return a !== 0 || 1 / a == 1 / b;                                                       // 905
    // A strict comparison is necessary because `null == undefined`.                                     // 906
    if (a == null || b == null) return a === b;                                                          // 907
    // Unwrap any wrapped objects.                                                                       // 908
    if (a instanceof _) a = a._wrapped;                                                                  // 909
    if (b instanceof _) b = b._wrapped;                                                                  // 910
    // Compare `[[Class]]` names.                                                                        // 911
    var className = toString.call(a);                                                                    // 912
    if (className != toString.call(b)) return false;                                                     // 913
    switch (className) {                                                                                 // 914
      // Strings, numbers, dates, and booleans are compared by value.                                    // 915
      case '[object String]':                                                                            // 916
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is             // 917
        // equivalent to `new String("5")`.                                                              // 918
        return a == String(b);                                                                           // 919
      case '[object Number]':                                                                            // 920
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for               // 921
        // other numeric values.                                                                         // 922
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);                                  // 923
      case '[object Date]':                                                                              // 924
      case '[object Boolean]':                                                                           // 925
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their            // 926
        // millisecond representations. Note that invalid dates with millisecond representations         // 927
        // of `NaN` are not equivalent.                                                                  // 928
        return +a == +b;                                                                                 // 929
      // RegExps are compared by their source patterns and flags.                                        // 930
      case '[object RegExp]':                                                                            // 931
        return a.source == b.source &&                                                                   // 932
               a.global == b.global &&                                                                   // 933
               a.multiline == b.multiline &&                                                             // 934
               a.ignoreCase == b.ignoreCase;                                                             // 935
    }                                                                                                    // 936
    if (typeof a != 'object' || typeof b != 'object') return false;                                      // 937
    // Assume equality for cyclic structures. The algorithm for detecting cyclic                         // 938
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.                       // 939
    var length = aStack.length;                                                                          // 940
    while (length--) {                                                                                   // 941
      // Linear search. Performance is inversely proportional to the number of                           // 942
      // unique nested structures.                                                                       // 943
      if (aStack[length] == a) return bStack[length] == b;                                               // 944
    }                                                                                                    // 945
    // Objects with different constructors are not equivalent, but `Object`s                             // 946
    // from different frames are.                                                                        // 947
    var aCtor = a.constructor, bCtor = b.constructor;                                                    // 948
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&                          // 949
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {                         // 950
      return false;                                                                                      // 951
    }                                                                                                    // 952
    // Add the first object to the stack of traversed objects.                                           // 953
    aStack.push(a);                                                                                      // 954
    bStack.push(b);                                                                                      // 955
    var size = 0, result = true;                                                                         // 956
    // Recursively compare objects and arrays.                                                           // 957
    if (className == '[object Array]') {                                                                 // 958
      // Compare array lengths to determine if a deep comparison is necessary.                           // 959
      size = a.length;                                                                                   // 960
      result = size == b.length;                                                                         // 961
      if (result) {                                                                                      // 962
        // Deep compare the contents, ignoring non-numeric properties.                                   // 963
        while (size--) {                                                                                 // 964
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;                                   // 965
        }                                                                                                // 966
      }                                                                                                  // 967
    } else {                                                                                             // 968
      // Deep compare objects.                                                                           // 969
      for (var key in a) {                                                                               // 970
        if (_.has(a, key)) {                                                                             // 971
          // Count the expected number of properties.                                                    // 972
          size++;                                                                                        // 973
          // Deep compare each member.                                                                   // 974
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;                    // 975
        }                                                                                                // 976
      }                                                                                                  // 977
      // Ensure that both objects contain the same number of properties.                                 // 978
      if (result) {                                                                                      // 979
        for (key in b) {                                                                                 // 980
          if (_.has(b, key) && !(size--)) break;                                                         // 981
        }                                                                                                // 982
        result = !size;                                                                                  // 983
      }                                                                                                  // 984
    }                                                                                                    // 985
    // Remove the first object from the stack of traversed objects.                                      // 986
    aStack.pop();                                                                                        // 987
    bStack.pop();                                                                                        // 988
    return result;                                                                                       // 989
  };                                                                                                     // 990
                                                                                                         // 991
  // Perform a deep comparison to check if two objects are equal.                                        // 992
  _.isEqual = function(a, b) {                                                                           // 993
    return eq(a, b, [], []);                                                                             // 994
  };                                                                                                     // 995
                                                                                                         // 996
  // Is a given array, string, or object empty?                                                          // 997
  // An "empty" object has no enumerable own-properties.                                                 // 998
  _.isEmpty = function(obj) {                                                                            // 999
    if (obj == null) return true;                                                                        // 1000
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;                                      // 1001
    for (var key in obj) if (_.has(obj, key)) return false;                                              // 1002
    return true;                                                                                         // 1003
  };                                                                                                     // 1004
                                                                                                         // 1005
  // Is a given value a DOM element?                                                                     // 1006
  _.isElement = function(obj) {                                                                          // 1007
    return !!(obj && obj.nodeType === 1);                                                                // 1008
  };                                                                                                     // 1009
                                                                                                         // 1010
  // Is a given value an array?                                                                          // 1011
  // Delegates to ECMA5's native Array.isArray                                                           // 1012
  _.isArray = nativeIsArray || function(obj) {                                                           // 1013
    return toString.call(obj) == '[object Array]';                                                       // 1014
  };                                                                                                     // 1015
                                                                                                         // 1016
  // Is a given variable an object?                                                                      // 1017
  _.isObject = function(obj) {                                                                           // 1018
    return obj === Object(obj);                                                                          // 1019
  };                                                                                                     // 1020
                                                                                                         // 1021
  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.             // 1022
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {                 // 1023
    _['is' + name] = function(obj) {                                                                     // 1024
      return toString.call(obj) == '[object ' + name + ']';                                              // 1025
    };                                                                                                   // 1026
  });                                                                                                    // 1027
                                                                                                         // 1028
  // Define a fallback version of the method in browsers (ahem, IE), where                               // 1029
  // there isn't any inspectable "Arguments" type.                                                       // 1030
  if (!_.isArguments(arguments)) {                                                                       // 1031
    _.isArguments = function(obj) {                                                                      // 1032
      return !!(obj && _.has(obj, 'callee'));                                                            // 1033
    };                                                                                                   // 1034
  }                                                                                                      // 1035
                                                                                                         // 1036
  // Optimize `isFunction` if appropriate.                                                               // 1037
  if (typeof (/./) !== 'function') {                                                                     // 1038
    _.isFunction = function(obj) {                                                                       // 1039
      return typeof obj === 'function';                                                                  // 1040
    };                                                                                                   // 1041
  }                                                                                                      // 1042
                                                                                                         // 1043
  // Is a given object a finite number?                                                                  // 1044
  _.isFinite = function(obj) {                                                                           // 1045
    return isFinite(obj) && !isNaN(parseFloat(obj));                                                     // 1046
  };                                                                                                     // 1047
                                                                                                         // 1048
  // Is the given value `NaN`? (NaN is the only number which does not equal itself).                     // 1049
  _.isNaN = function(obj) {                                                                              // 1050
    return _.isNumber(obj) && obj != +obj;                                                               // 1051
  };                                                                                                     // 1052
                                                                                                         // 1053
  // Is a given value a boolean?                                                                         // 1054
  _.isBoolean = function(obj) {                                                                          // 1055
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';                    // 1056
  };                                                                                                     // 1057
                                                                                                         // 1058
  // Is a given value equal to null?                                                                     // 1059
  _.isNull = function(obj) {                                                                             // 1060
    return obj === null;                                                                                 // 1061
  };                                                                                                     // 1062
                                                                                                         // 1063
  // Is a given variable undefined?                                                                      // 1064
  _.isUndefined = function(obj) {                                                                        // 1065
    return obj === void 0;                                                                               // 1066
  };                                                                                                     // 1067
                                                                                                         // 1068
  // Shortcut function for checking if an object has a given property directly                           // 1069
  // on itself (in other words, not on a prototype).                                                     // 1070
  _.has = function(obj, key) {                                                                           // 1071
    return hasOwnProperty.call(obj, key);                                                                // 1072
  };                                                                                                     // 1073
                                                                                                         // 1074
  // Utility Functions                                                                                   // 1075
  // -----------------                                                                                   // 1076
                                                                                                         // 1077
  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its                           // 1078
  // previous owner. Returns a reference to the Underscore object.                                       // 1079
  _.noConflict = function() {                                                                            // 1080
    root._ = previousUnderscore;                                                                         // 1081
    return this;                                                                                         // 1082
  };                                                                                                     // 1083
                                                                                                         // 1084
  // Keep the identity function around for default iterators.                                            // 1085
  _.identity = function(value) {                                                                         // 1086
    return value;                                                                                        // 1087
  };                                                                                                     // 1088
                                                                                                         // 1089
  // Run a function **n** times.                                                                         // 1090
  _.times = function(n, iterator, context) {                                                             // 1091
    var accum = Array(Math.max(0, n));                                                                   // 1092
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);                                    // 1093
    return accum;                                                                                        // 1094
  };                                                                                                     // 1095
                                                                                                         // 1096
  // Return a random integer between min and max (inclusive).                                            // 1097
  _.random = function(min, max) {                                                                        // 1098
    if (max == null) {                                                                                   // 1099
      max = min;                                                                                         // 1100
      min = 0;                                                                                           // 1101
    }                                                                                                    // 1102
    return min + Math.floor(Math.random() * (max - min + 1));                                            // 1103
  };                                                                                                     // 1104
                                                                                                         // 1105
  // List of HTML entities for escaping.                                                                 // 1106
  var entityMap = {                                                                                      // 1107
    escape: {                                                                                            // 1108
      '&': '&amp;',                                                                                      // 1109
      '<': '&lt;',                                                                                       // 1110
      '>': '&gt;',                                                                                       // 1111
      '"': '&quot;',                                                                                     // 1112
      "'": '&#x27;'                                                                                      // 1113
    }                                                                                                    // 1114
  };                                                                                                     // 1115
  entityMap.unescape = _.invert(entityMap.escape);                                                       // 1116
                                                                                                         // 1117
  // Regexes containing the keys and values listed immediately above.                                    // 1118
  var entityRegexes = {                                                                                  // 1119
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),                            // 1120
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')                          // 1121
  };                                                                                                     // 1122
                                                                                                         // 1123
  // Functions for escaping and unescaping strings to/from HTML interpolation.                           // 1124
  _.each(['escape', 'unescape'], function(method) {                                                      // 1125
    _[method] = function(string) {                                                                       // 1126
      if (string == null) return '';                                                                     // 1127
      return ('' + string).replace(entityRegexes[method], function(match) {                              // 1128
        return entityMap[method][match];                                                                 // 1129
      });                                                                                                // 1130
    };                                                                                                   // 1131
  });                                                                                                    // 1132
                                                                                                         // 1133
  // If the value of the named `property` is a function then invoke it with the                          // 1134
  // `object` as context; otherwise, return it.                                                          // 1135
  _.result = function(object, property) {                                                                // 1136
    if (object == null) return void 0;                                                                   // 1137
    var value = object[property];                                                                        // 1138
    return _.isFunction(value) ? value.call(object) : value;                                             // 1139
  };                                                                                                     // 1140
                                                                                                         // 1141
  // Add your own custom functions to the Underscore object.                                             // 1142
  _.mixin = function(obj) {                                                                              // 1143
    each(_.functions(obj), function(name) {                                                              // 1144
      var func = _[name] = obj[name];                                                                    // 1145
      _.prototype[name] = function() {                                                                   // 1146
        var args = [this._wrapped];                                                                      // 1147
        push.apply(args, arguments);                                                                     // 1148
        return result.call(this, func.apply(_, args));                                                   // 1149
      };                                                                                                 // 1150
    });                                                                                                  // 1151
  };                                                                                                     // 1152
                                                                                                         // 1153
  // Generate a unique integer id (unique within the entire client session).                             // 1154
  // Useful for temporary DOM ids.                                                                       // 1155
  var idCounter = 0;                                                                                     // 1156
  _.uniqueId = function(prefix) {                                                                        // 1157
    var id = ++idCounter + '';                                                                           // 1158
    return prefix ? prefix + id : id;                                                                    // 1159
  };                                                                                                     // 1160
                                                                                                         // 1161
  // By default, Underscore uses ERB-style template delimiters, change the                               // 1162
  // following template settings to use alternative delimiters.                                          // 1163
  _.templateSettings = {                                                                                 // 1164
    evaluate    : /<%([\s\S]+?)%>/g,                                                                     // 1165
    interpolate : /<%=([\s\S]+?)%>/g,                                                                    // 1166
    escape      : /<%-([\s\S]+?)%>/g                                                                     // 1167
  };                                                                                                     // 1168
                                                                                                         // 1169
  // When customizing `templateSettings`, if you don't want to define an                                 // 1170
  // interpolation, evaluation or escaping regex, we need one that is                                    // 1171
  // guaranteed not to match.                                                                            // 1172
  var noMatch = /(.)^/;                                                                                  // 1173
                                                                                                         // 1174
  // Certain characters need to be escaped so that they can be put into a                                // 1175
  // string literal.                                                                                     // 1176
  var escapes = {                                                                                        // 1177
    "'":      "'",                                                                                       // 1178
    '\\':     '\\',                                                                                      // 1179
    '\r':     'r',                                                                                       // 1180
    '\n':     'n',                                                                                       // 1181
    '\t':     't',                                                                                       // 1182
    '\u2028': 'u2028',                                                                                   // 1183
    '\u2029': 'u2029'                                                                                    // 1184
  };                                                                                                     // 1185
                                                                                                         // 1186
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;                                                          // 1187
                                                                                                         // 1188
  // JavaScript micro-templating, similar to John Resig's implementation.                                // 1189
  // Underscore templating handles arbitrary delimiters, preserves whitespace,                           // 1190
  // and correctly escapes quotes within interpolated code.                                              // 1191
  _.template = function(text, data, settings) {                                                          // 1192
    var render;                                                                                          // 1193
    settings = _.defaults({}, settings, _.templateSettings);                                             // 1194
                                                                                                         // 1195
    // Combine delimiters into one regular expression via alternation.                                   // 1196
    var matcher = new RegExp([                                                                           // 1197
      (settings.escape || noMatch).source,                                                               // 1198
      (settings.interpolate || noMatch).source,                                                          // 1199
      (settings.evaluate || noMatch).source                                                              // 1200
    ].join('|') + '|$', 'g');                                                                            // 1201
                                                                                                         // 1202
    // Compile the template source, escaping string literals appropriately.                              // 1203
    var index = 0;                                                                                       // 1204
    var source = "__p+='";                                                                               // 1205
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {                       // 1206
      source += text.slice(index, offset)                                                                // 1207
        .replace(escaper, function(match) { return '\\' + escapes[match]; });                            // 1208
                                                                                                         // 1209
      if (escape) {                                                                                      // 1210
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";                             // 1211
      }                                                                                                  // 1212
      if (interpolate) {                                                                                 // 1213
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";                                  // 1214
      }                                                                                                  // 1215
      if (evaluate) {                                                                                    // 1216
        source += "';\n" + evaluate + "\n__p+='";                                                        // 1217
      }                                                                                                  // 1218
      index = offset + match.length;                                                                     // 1219
      return match;                                                                                      // 1220
    });                                                                                                  // 1221
    source += "';\n";                                                                                    // 1222
                                                                                                         // 1223
    // If a variable is not specified, place data values in local scope.                                 // 1224
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';                                // 1225
                                                                                                         // 1226
    source = "var __t,__p='',__j=Array.prototype.join," +                                                // 1227
      "print=function(){__p+=__j.call(arguments,'');};\n" +                                              // 1228
      source + "return __p;\n";                                                                          // 1229
                                                                                                         // 1230
    try {                                                                                                // 1231
      render = new Function(settings.variable || 'obj', '_', source);                                    // 1232
    } catch (e) {                                                                                        // 1233
      e.source = source;                                                                                 // 1234
      throw e;                                                                                           // 1235
    }                                                                                                    // 1236
                                                                                                         // 1237
    if (data) return render(data, _);                                                                    // 1238
    var template = function(data) {                                                                      // 1239
      return render.call(this, data, _);                                                                 // 1240
    };                                                                                                   // 1241
                                                                                                         // 1242
    // Provide the compiled function source as a convenience for precompilation.                         // 1243
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';                // 1244
                                                                                                         // 1245
    return template;                                                                                     // 1246
  };                                                                                                     // 1247
                                                                                                         // 1248
  // Add a "chain" function, which will delegate to the wrapper.                                         // 1249
  _.chain = function(obj) {                                                                              // 1250
    return _(obj).chain();                                                                               // 1251
  };                                                                                                     // 1252
                                                                                                         // 1253
  // OOP                                                                                                 // 1254
  // ---------------                                                                                     // 1255
  // If Underscore is called as a function, it returns a wrapped object that                             // 1256
  // can be used OO-style. This wrapper holds altered versions of all the                                // 1257
  // underscore functions. Wrapped objects may be chained.                                               // 1258
                                                                                                         // 1259
  // Helper function to continue chaining intermediate results.                                          // 1260
  var result = function(obj) {                                                                           // 1261
    return this._chain ? _(obj).chain() : obj;                                                           // 1262
  };                                                                                                     // 1263
                                                                                                         // 1264
  // Add all of the Underscore functions to the wrapper object.                                          // 1265
  _.mixin(_);                                                                                            // 1266
                                                                                                         // 1267
  // Add all mutator Array functions to the wrapper.                                                     // 1268
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {                // 1269
    var method = ArrayProto[name];                                                                       // 1270
    _.prototype[name] = function() {                                                                     // 1271
      var obj = this._wrapped;                                                                           // 1272
      method.apply(obj, arguments);                                                                      // 1273
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];                      // 1274
      return result.call(this, obj);                                                                     // 1275
    };                                                                                                   // 1276
  });                                                                                                    // 1277
                                                                                                         // 1278
  // Add all accessor Array functions to the wrapper.                                                    // 1279
  each(['concat', 'join', 'slice'], function(name) {                                                     // 1280
    var method = ArrayProto[name];                                                                       // 1281
    _.prototype[name] = function() {                                                                     // 1282
      return result.call(this, method.apply(this._wrapped, arguments));                                  // 1283
    };                                                                                                   // 1284
  });                                                                                                    // 1285
                                                                                                         // 1286
  _.extend(_.prototype, {                                                                                // 1287
                                                                                                         // 1288
    // Start chaining a wrapped Underscore object.                                                       // 1289
    chain: function() {                                                                                  // 1290
      this._chain = true;                                                                                // 1291
      return this;                                                                                       // 1292
    },                                                                                                   // 1293
                                                                                                         // 1294
    // Extracts the result from a wrapped and chained object.                                            // 1295
    value: function() {                                                                                  // 1296
      return this._wrapped;                                                                              // 1297
    }                                                                                                    // 1298
                                                                                                         // 1299
  });                                                                                                    // 1300
                                                                                                         // 1301
}).call(this);                                                                                           // 1302
                                                                                                         // 1303
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/underscore/post.js                                                                           //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
// This exports object was created in pre.js.  Now copy the `_` object from it                           // 1
// into the package-scope variable `_`, which will get exported.                                         // 2
_ = exports._;                                                                                           // 3
                                                                                                         // 4
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.underscore = {}, {
  _: _
});

})();
