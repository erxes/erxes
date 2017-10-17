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

/* Package-scope variables */
var Tracker, Deps;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/tracker/tracker.js                                                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/////////////////////////////////////////////////////                                                                 // 1
// Package docs at http://docs.meteor.com/#tracker //                                                                 // 2
/////////////////////////////////////////////////////                                                                 // 3
                                                                                                                      // 4
/**                                                                                                                   // 5
 * @namespace Tracker                                                                                                 // 6
 * @summary The namespace for Tracker-related methods.                                                                // 7
 */                                                                                                                   // 8
Tracker = {};                                                                                                         // 9
                                                                                                                      // 10
// http://docs.meteor.com/#tracker_active                                                                             // 11
                                                                                                                      // 12
/**                                                                                                                   // 13
 * @summary True if there is a current computation, meaning that dependencies on reactive data sources will be tracked and potentially cause the current computation to be rerun.
 * @locus Client                                                                                                      // 15
 * @type {Boolean}                                                                                                    // 16
 */                                                                                                                   // 17
Tracker.active = false;                                                                                               // 18
                                                                                                                      // 19
// http://docs.meteor.com/#tracker_currentcomputation                                                                 // 20
                                                                                                                      // 21
/**                                                                                                                   // 22
 * @summary The current computation, or `null` if there isn't one.  The current computation is the [`Tracker.Computation`](#tracker_computation) object created by the innermost active call to `Tracker.autorun`, and it's the computation that gains dependencies when reactive data sources are accessed.
 * @locus Client                                                                                                      // 24
 * @type {Tracker.Computation}                                                                                        // 25
 */                                                                                                                   // 26
Tracker.currentComputation = null;                                                                                    // 27
                                                                                                                      // 28
var setCurrentComputation = function (c) {                                                                            // 29
  Tracker.currentComputation = c;                                                                                     // 30
  Tracker.active = !! c;                                                                                              // 31
};                                                                                                                    // 32
                                                                                                                      // 33
var _debugFunc = function () {                                                                                        // 34
  // We want this code to work without Meteor, and also without                                                       // 35
  // "console" (which is technically non-standard and may be missing                                                  // 36
  // on some browser we come across, like it was on IE 7).                                                            // 37
  //                                                                                                                  // 38
  // Lazy evaluation because `Meteor` does not exist right away.(??)                                                  // 39
  return (typeof Meteor !== "undefined" ? Meteor._debug :                                                             // 40
          ((typeof console !== "undefined") && console.error ?                                                        // 41
           function () { console.error.apply(console, arguments); } :                                                 // 42
           function () {}));                                                                                          // 43
};                                                                                                                    // 44
                                                                                                                      // 45
var _maybeSuppressMoreLogs = function (messagesLength) {                                                              // 46
  // Sometimes when running tests, we intentionally suppress logs on expected                                         // 47
  // printed errors. Since the current implementation of _throwOrLog can log                                          // 48
  // multiple separate log messages, suppress all of them if at least one suppress                                    // 49
  // is expected as we still want them to count as one.                                                               // 50
  if (typeof Meteor !== "undefined") {                                                                                // 51
    if (Meteor._suppressed_log_expected()) {                                                                          // 52
      Meteor._suppress_log(messagesLength - 1);                                                                       // 53
    }                                                                                                                 // 54
  }                                                                                                                   // 55
};                                                                                                                    // 56
                                                                                                                      // 57
var _throwOrLog = function (from, e) {                                                                                // 58
  if (throwFirstError) {                                                                                              // 59
    throw e;                                                                                                          // 60
  } else {                                                                                                            // 61
    var printArgs = ["Exception from Tracker " + from + " function:"];                                                // 62
    if (e.stack && e.message && e.name) {                                                                             // 63
      var idx = e.stack.indexOf(e.message);                                                                           // 64
      if (idx < 0 || idx > e.name.length + 2) { // check for "Error: "                                                // 65
        // message is not part of the stack                                                                           // 66
        var message = e.name + ": " + e.message;                                                                      // 67
        printArgs.push(message);                                                                                      // 68
      }                                                                                                               // 69
    }                                                                                                                 // 70
    printArgs.push(e.stack);                                                                                          // 71
    _maybeSuppressMoreLogs(printArgs.length);                                                                         // 72
                                                                                                                      // 73
    for (var i = 0; i < printArgs.length; i++) {                                                                      // 74
      _debugFunc()(printArgs[i]);                                                                                     // 75
    }                                                                                                                 // 76
  }                                                                                                                   // 77
};                                                                                                                    // 78
                                                                                                                      // 79
// Takes a function `f`, and wraps it in a `Meteor._noYieldsAllowed`                                                  // 80
// block if we are running on the server. On the client, returns the                                                  // 81
// original function (since `Meteor._noYieldsAllowed` is a                                                            // 82
// no-op). This has the benefit of not adding an unnecessary stack                                                    // 83
// frame on the client.                                                                                               // 84
var withNoYieldsAllowed = function (f) {                                                                              // 85
  if ((typeof Meteor === 'undefined') || Meteor.isClient) {                                                           // 86
    return f;                                                                                                         // 87
  } else {                                                                                                            // 88
    return function () {                                                                                              // 89
      var args = arguments;                                                                                           // 90
      Meteor._noYieldsAllowed(function () {                                                                           // 91
        f.apply(null, args);                                                                                          // 92
      });                                                                                                             // 93
    };                                                                                                                // 94
  }                                                                                                                   // 95
};                                                                                                                    // 96
                                                                                                                      // 97
var nextId = 1;                                                                                                       // 98
// computations whose callbacks we should call at flush time                                                          // 99
var pendingComputations = [];                                                                                         // 100
// `true` if a Tracker.flush is scheduled, or if we are in Tracker.flush now                                          // 101
var willFlush = false;                                                                                                // 102
// `true` if we are in Tracker.flush now                                                                              // 103
var inFlush = false;                                                                                                  // 104
// `true` if we are computing a computation now, either first time                                                    // 105
// or recompute.  This matches Tracker.active unless we are inside                                                    // 106
// Tracker.nonreactive, which nullfies currentComputation even though                                                 // 107
// an enclosing computation may still be running.                                                                     // 108
var inCompute = false;                                                                                                // 109
// `true` if the `_throwFirstError` option was passed in to the call                                                  // 110
// to Tracker.flush that we are in. When set, throw rather than log the                                               // 111
// first error encountered while flushing. Before throwing the error,                                                 // 112
// finish flushing (from a finally block), logging any subsequent                                                     // 113
// errors.                                                                                                            // 114
var throwFirstError = false;                                                                                          // 115
                                                                                                                      // 116
var afterFlushCallbacks = [];                                                                                         // 117
                                                                                                                      // 118
var requireFlush = function () {                                                                                      // 119
  if (! willFlush) {                                                                                                  // 120
    // We want this code to work without Meteor, see debugFunc above                                                  // 121
    if (typeof Meteor !== "undefined")                                                                                // 122
      Meteor._setImmediate(Tracker._runFlush);                                                                        // 123
    else                                                                                                              // 124
      setTimeout(Tracker._runFlush, 0);                                                                               // 125
    willFlush = true;                                                                                                 // 126
  }                                                                                                                   // 127
};                                                                                                                    // 128
                                                                                                                      // 129
// Tracker.Computation constructor is visible but private                                                             // 130
// (throws an error if you try to call it)                                                                            // 131
var constructingComputation = false;                                                                                  // 132
                                                                                                                      // 133
//                                                                                                                    // 134
// http://docs.meteor.com/#tracker_computation                                                                        // 135
                                                                                                                      // 136
/**                                                                                                                   // 137
 * @summary A Computation object represents code that is repeatedly rerun                                             // 138
 * in response to                                                                                                     // 139
 * reactive data changes. Computations don't have return values; they just                                            // 140
 * perform actions, such as rerendering a template on the screen. Computations                                        // 141
 * are created using Tracker.autorun. Use stop to prevent further rerunning of a                                      // 142
 * computation.                                                                                                       // 143
 * @instancename computation                                                                                          // 144
 */                                                                                                                   // 145
Tracker.Computation = function (f, parent, onError) {                                                                 // 146
  if (! constructingComputation)                                                                                      // 147
    throw new Error(                                                                                                  // 148
      "Tracker.Computation constructor is private; use Tracker.autorun");                                             // 149
  constructingComputation = false;                                                                                    // 150
                                                                                                                      // 151
  var self = this;                                                                                                    // 152
                                                                                                                      // 153
  // http://docs.meteor.com/#computation_stopped                                                                      // 154
                                                                                                                      // 155
  /**                                                                                                                 // 156
   * @summary True if this computation has been stopped.                                                              // 157
   * @locus Client                                                                                                    // 158
   * @memberOf Tracker.Computation                                                                                    // 159
   * @instance                                                                                                        // 160
   * @name  stopped                                                                                                   // 161
   */                                                                                                                 // 162
  self.stopped = false;                                                                                               // 163
                                                                                                                      // 164
  // http://docs.meteor.com/#computation_invalidated                                                                  // 165
                                                                                                                      // 166
  /**                                                                                                                 // 167
   * @summary True if this computation has been invalidated (and not yet rerun), or if it has been stopped.           // 168
   * @locus Client                                                                                                    // 169
   * @memberOf Tracker.Computation                                                                                    // 170
   * @instance                                                                                                        // 171
   * @name  invalidated                                                                                               // 172
   * @type {Boolean}                                                                                                  // 173
   */                                                                                                                 // 174
  self.invalidated = false;                                                                                           // 175
                                                                                                                      // 176
  // http://docs.meteor.com/#computation_firstrun                                                                     // 177
                                                                                                                      // 178
  /**                                                                                                                 // 179
   * @summary True during the initial run of the computation at the time `Tracker.autorun` is called, and false on subsequent reruns and at other times.
   * @locus Client                                                                                                    // 181
   * @memberOf Tracker.Computation                                                                                    // 182
   * @instance                                                                                                        // 183
   * @name  firstRun                                                                                                  // 184
   * @type {Boolean}                                                                                                  // 185
   */                                                                                                                 // 186
  self.firstRun = true;                                                                                               // 187
                                                                                                                      // 188
  self._id = nextId++;                                                                                                // 189
  self._onInvalidateCallbacks = [];                                                                                   // 190
  self._onStopCallbacks = [];                                                                                         // 191
  // the plan is at some point to use the parent relation                                                             // 192
  // to constrain the order that computations are processed                                                           // 193
  self._parent = parent;                                                                                              // 194
  self._func = f;                                                                                                     // 195
  self._onError = onError;                                                                                            // 196
  self._recomputing = false;                                                                                          // 197
                                                                                                                      // 198
  var errored = true;                                                                                                 // 199
  try {                                                                                                               // 200
    self._compute();                                                                                                  // 201
    errored = false;                                                                                                  // 202
  } finally {                                                                                                         // 203
    self.firstRun = false;                                                                                            // 204
    if (errored)                                                                                                      // 205
      self.stop();                                                                                                    // 206
  }                                                                                                                   // 207
};                                                                                                                    // 208
                                                                                                                      // 209
// http://docs.meteor.com/#computation_oninvalidate                                                                   // 210
                                                                                                                      // 211
/**                                                                                                                   // 212
 * @summary Registers `callback` to run when this computation is next invalidated, or runs it immediately if the computation is already invalidated.  The callback is run exactly once and not upon future invalidations unless `onInvalidate` is called again after the computation becomes valid again.
 * @locus Client                                                                                                      // 214
 * @param {Function} callback Function to be called on invalidation. Receives one argument, the computation that was invalidated.
 */                                                                                                                   // 216
Tracker.Computation.prototype.onInvalidate = function (f) {                                                           // 217
  var self = this;                                                                                                    // 218
                                                                                                                      // 219
  if (typeof f !== 'function')                                                                                        // 220
    throw new Error("onInvalidate requires a function");                                                              // 221
                                                                                                                      // 222
  if (self.invalidated) {                                                                                             // 223
    Tracker.nonreactive(function () {                                                                                 // 224
      withNoYieldsAllowed(f)(self);                                                                                   // 225
    });                                                                                                               // 226
  } else {                                                                                                            // 227
    self._onInvalidateCallbacks.push(f);                                                                              // 228
  }                                                                                                                   // 229
};                                                                                                                    // 230
                                                                                                                      // 231
/**                                                                                                                   // 232
 * @summary Registers `callback` to run when this computation is stopped, or runs it immediately if the computation is already stopped.  The callback is run after any `onInvalidate` callbacks.
 * @locus Client                                                                                                      // 234
 * @param {Function} callback Function to be called on stop. Receives one argument, the computation that was stopped.
 */                                                                                                                   // 236
Tracker.Computation.prototype.onStop = function (f) {                                                                 // 237
  var self = this;                                                                                                    // 238
                                                                                                                      // 239
  if (typeof f !== 'function')                                                                                        // 240
    throw new Error("onStop requires a function");                                                                    // 241
                                                                                                                      // 242
  if (self.stopped) {                                                                                                 // 243
    Tracker.nonreactive(function () {                                                                                 // 244
      withNoYieldsAllowed(f)(self);                                                                                   // 245
    });                                                                                                               // 246
  } else {                                                                                                            // 247
    self._onStopCallbacks.push(f);                                                                                    // 248
  }                                                                                                                   // 249
};                                                                                                                    // 250
                                                                                                                      // 251
// http://docs.meteor.com/#computation_invalidate                                                                     // 252
                                                                                                                      // 253
/**                                                                                                                   // 254
 * @summary Invalidates this computation so that it will be rerun.                                                    // 255
 * @locus Client                                                                                                      // 256
 */                                                                                                                   // 257
Tracker.Computation.prototype.invalidate = function () {                                                              // 258
  var self = this;                                                                                                    // 259
  if (! self.invalidated) {                                                                                           // 260
    // if we're currently in _recompute(), don't enqueue                                                              // 261
    // ourselves, since we'll rerun immediately anyway.                                                               // 262
    if (! self._recomputing && ! self.stopped) {                                                                      // 263
      requireFlush();                                                                                                 // 264
      pendingComputations.push(this);                                                                                 // 265
    }                                                                                                                 // 266
                                                                                                                      // 267
    self.invalidated = true;                                                                                          // 268
                                                                                                                      // 269
    // callbacks can't add callbacks, because                                                                         // 270
    // self.invalidated === true.                                                                                     // 271
    for(var i = 0, f; f = self._onInvalidateCallbacks[i]; i++) {                                                      // 272
      Tracker.nonreactive(function () {                                                                               // 273
        withNoYieldsAllowed(f)(self);                                                                                 // 274
      });                                                                                                             // 275
    }                                                                                                                 // 276
    self._onInvalidateCallbacks = [];                                                                                 // 277
  }                                                                                                                   // 278
};                                                                                                                    // 279
                                                                                                                      // 280
// http://docs.meteor.com/#computation_stop                                                                           // 281
                                                                                                                      // 282
/**                                                                                                                   // 283
 * @summary Prevents this computation from rerunning.                                                                 // 284
 * @locus Client                                                                                                      // 285
 */                                                                                                                   // 286
Tracker.Computation.prototype.stop = function () {                                                                    // 287
  var self = this;                                                                                                    // 288
                                                                                                                      // 289
  if (! self.stopped) {                                                                                               // 290
    self.stopped = true;                                                                                              // 291
    self.invalidate();                                                                                                // 292
    for(var i = 0, f; f = self._onStopCallbacks[i]; i++) {                                                            // 293
      Tracker.nonreactive(function () {                                                                               // 294
        withNoYieldsAllowed(f)(self);                                                                                 // 295
      });                                                                                                             // 296
    }                                                                                                                 // 297
    self._onStopCallbacks = [];                                                                                       // 298
  }                                                                                                                   // 299
};                                                                                                                    // 300
                                                                                                                      // 301
Tracker.Computation.prototype._compute = function () {                                                                // 302
  var self = this;                                                                                                    // 303
  self.invalidated = false;                                                                                           // 304
                                                                                                                      // 305
  var previous = Tracker.currentComputation;                                                                          // 306
  setCurrentComputation(self);                                                                                        // 307
  var previousInCompute = inCompute;                                                                                  // 308
  inCompute = true;                                                                                                   // 309
  try {                                                                                                               // 310
    withNoYieldsAllowed(self._func)(self);                                                                            // 311
  } finally {                                                                                                         // 312
    setCurrentComputation(previous);                                                                                  // 313
    inCompute = previousInCompute;                                                                                    // 314
  }                                                                                                                   // 315
};                                                                                                                    // 316
                                                                                                                      // 317
Tracker.Computation.prototype._needsRecompute = function () {                                                         // 318
  var self = this;                                                                                                    // 319
  return self.invalidated && ! self.stopped;                                                                          // 320
};                                                                                                                    // 321
                                                                                                                      // 322
Tracker.Computation.prototype._recompute = function () {                                                              // 323
  var self = this;                                                                                                    // 324
                                                                                                                      // 325
  self._recomputing = true;                                                                                           // 326
  try {                                                                                                               // 327
    if (self._needsRecompute()) {                                                                                     // 328
      try {                                                                                                           // 329
        self._compute();                                                                                              // 330
      } catch (e) {                                                                                                   // 331
        if (self._onError) {                                                                                          // 332
          self._onError(e);                                                                                           // 333
        } else {                                                                                                      // 334
          _throwOrLog("recompute", e);                                                                                // 335
        }                                                                                                             // 336
      }                                                                                                               // 337
    }                                                                                                                 // 338
  } finally {                                                                                                         // 339
    self._recomputing = false;                                                                                        // 340
  }                                                                                                                   // 341
};                                                                                                                    // 342
                                                                                                                      // 343
/**                                                                                                                   // 344
 * @summary Process the reactive updates for this computation immediately                                             // 345
 * and ensure that the computation is rerun. The computation is rerun only                                            // 346
 * if it is invalidated.                                                                                              // 347
 * @locus Client                                                                                                      // 348
 */                                                                                                                   // 349
Tracker.Computation.prototype.flush = function () {                                                                   // 350
  var self = this;                                                                                                    // 351
                                                                                                                      // 352
  if (self._recomputing)                                                                                              // 353
    return;                                                                                                           // 354
                                                                                                                      // 355
  self._recompute();                                                                                                  // 356
};                                                                                                                    // 357
                                                                                                                      // 358
/**                                                                                                                   // 359
 * @summary Causes the function inside this computation to run and                                                    // 360
 * synchronously process all reactive updtes.                                                                         // 361
 * @locus Client                                                                                                      // 362
 */                                                                                                                   // 363
Tracker.Computation.prototype.run = function () {                                                                     // 364
  var self = this;                                                                                                    // 365
  self.invalidate();                                                                                                  // 366
  self.flush();                                                                                                       // 367
};                                                                                                                    // 368
                                                                                                                      // 369
//                                                                                                                    // 370
// http://docs.meteor.com/#tracker_dependency                                                                         // 371
                                                                                                                      // 372
/**                                                                                                                   // 373
 * @summary A Dependency represents an atomic unit of reactive data that a                                            // 374
 * computation might depend on. Reactive data sources such as Session or                                              // 375
 * Minimongo internally create different Dependency objects for different                                             // 376
 * pieces of data, each of which may be depended on by multiple computations.                                         // 377
 * When the data changes, the computations are invalidated.                                                           // 378
 * @class                                                                                                             // 379
 * @instanceName dependency                                                                                           // 380
 */                                                                                                                   // 381
Tracker.Dependency = function () {                                                                                    // 382
  this._dependentsById = {};                                                                                          // 383
};                                                                                                                    // 384
                                                                                                                      // 385
// http://docs.meteor.com/#dependency_depend                                                                          // 386
//                                                                                                                    // 387
// Adds `computation` to this set if it is not already                                                                // 388
// present.  Returns true if `computation` is a new member of the set.                                                // 389
// If no argument, defaults to currentComputation, or does nothing                                                    // 390
// if there is no currentComputation.                                                                                 // 391
                                                                                                                      // 392
/**                                                                                                                   // 393
 * @summary Declares that the current computation (or `fromComputation` if given) depends on `dependency`.  The computation will be invalidated the next time `dependency` changes.
                                                                                                                      // 395
If there is no current computation and `depend()` is called with no arguments, it does nothing and returns false.     // 396
                                                                                                                      // 397
Returns true if the computation is a new dependent of `dependency` rather than an existing one.                       // 398
 * @locus Client                                                                                                      // 399
 * @param {Tracker.Computation} [fromComputation] An optional computation declared to depend on `dependency` instead of the current computation.
 * @returns {Boolean}                                                                                                 // 401
 */                                                                                                                   // 402
Tracker.Dependency.prototype.depend = function (computation) {                                                        // 403
  if (! computation) {                                                                                                // 404
    if (! Tracker.active)                                                                                             // 405
      return false;                                                                                                   // 406
                                                                                                                      // 407
    computation = Tracker.currentComputation;                                                                         // 408
  }                                                                                                                   // 409
  var self = this;                                                                                                    // 410
  var id = computation._id;                                                                                           // 411
  if (! (id in self._dependentsById)) {                                                                               // 412
    self._dependentsById[id] = computation;                                                                           // 413
    computation.onInvalidate(function () {                                                                            // 414
      delete self._dependentsById[id];                                                                                // 415
    });                                                                                                               // 416
    return true;                                                                                                      // 417
  }                                                                                                                   // 418
  return false;                                                                                                       // 419
};                                                                                                                    // 420
                                                                                                                      // 421
// http://docs.meteor.com/#dependency_changed                                                                         // 422
                                                                                                                      // 423
/**                                                                                                                   // 424
 * @summary Invalidate all dependent computations immediately and remove them as dependents.                          // 425
 * @locus Client                                                                                                      // 426
 */                                                                                                                   // 427
Tracker.Dependency.prototype.changed = function () {                                                                  // 428
  var self = this;                                                                                                    // 429
  for (var id in self._dependentsById)                                                                                // 430
    self._dependentsById[id].invalidate();                                                                            // 431
};                                                                                                                    // 432
                                                                                                                      // 433
// http://docs.meteor.com/#dependency_hasdependents                                                                   // 434
                                                                                                                      // 435
/**                                                                                                                   // 436
 * @summary True if this Dependency has one or more dependent Computations, which would be invalidated if this Dependency were to change.
 * @locus Client                                                                                                      // 438
 * @returns {Boolean}                                                                                                 // 439
 */                                                                                                                   // 440
Tracker.Dependency.prototype.hasDependents = function () {                                                            // 441
  var self = this;                                                                                                    // 442
  for(var id in self._dependentsById)                                                                                 // 443
    return true;                                                                                                      // 444
  return false;                                                                                                       // 445
};                                                                                                                    // 446
                                                                                                                      // 447
// http://docs.meteor.com/#tracker_flush                                                                              // 448
                                                                                                                      // 449
/**                                                                                                                   // 450
 * @summary Process all reactive updates immediately and ensure that all invalidated computations are rerun.          // 451
 * @locus Client                                                                                                      // 452
 */                                                                                                                   // 453
Tracker.flush = function (options) {                                                                                  // 454
  Tracker._runFlush({ finishSynchronously: true,                                                                      // 455
                      throwFirstError: options && options._throwFirstError });                                        // 456
};                                                                                                                    // 457
                                                                                                                      // 458
/**                                                                                                                   // 459
 * @summary True if we are computing a computation now, either first time or recompute.  This matches Tracker.active unless we are inside Tracker.nonreactive, which nullfies currentComputation even though an enclosing computation may still be running.
 * @locus Client                                                                                                      // 461
 * @returns {Boolean}                                                                                                 // 462
 */                                                                                                                   // 463
Tracker.inFlush = function () {                                                                                       // 464
  return inFlush;                                                                                                     // 465
}                                                                                                                     // 466
                                                                                                                      // 467
// Run all pending computations and afterFlush callbacks.  If we were not called                                      // 468
// directly via Tracker.flush, this may return before they're all done to allow                                       // 469
// the event loop to run a little before continuing.                                                                  // 470
Tracker._runFlush = function (options) {                                                                              // 471
  // XXX What part of the comment below is still true? (We no longer                                                  // 472
  // have Spark)                                                                                                      // 473
  //                                                                                                                  // 474
  // Nested flush could plausibly happen if, say, a flush causes                                                      // 475
  // DOM mutation, which causes a "blur" event, which runs an                                                         // 476
  // app event handler that calls Tracker.flush.  At the moment                                                       // 477
  // Spark blocks event handlers during DOM mutation anyway,                                                          // 478
  // because the LiveRange tree isn't valid.  And we don't have                                                       // 479
  // any useful notion of a nested flush.                                                                             // 480
  //                                                                                                                  // 481
  // https://app.asana.com/0/159908330244/385138233856                                                                // 482
  if (Tracker.inFlush())                                                                                              // 483
    throw new Error("Can't call Tracker.flush while flushing");                                                       // 484
                                                                                                                      // 485
  if (inCompute)                                                                                                      // 486
    throw new Error("Can't flush inside Tracker.autorun");                                                            // 487
                                                                                                                      // 488
  options = options || {};                                                                                            // 489
                                                                                                                      // 490
  inFlush = true;                                                                                                     // 491
  willFlush = true;                                                                                                   // 492
  throwFirstError = !! options.throwFirstError;                                                                       // 493
                                                                                                                      // 494
  var recomputedCount = 0;                                                                                            // 495
  var finishedTry = false;                                                                                            // 496
  try {                                                                                                               // 497
    while (pendingComputations.length ||                                                                              // 498
           afterFlushCallbacks.length) {                                                                              // 499
                                                                                                                      // 500
      // recompute all pending computations                                                                           // 501
      while (pendingComputations.length) {                                                                            // 502
        var comp = pendingComputations.shift();                                                                       // 503
        comp._recompute();                                                                                            // 504
        if (comp._needsRecompute()) {                                                                                 // 505
          pendingComputations.unshift(comp);                                                                          // 506
        }                                                                                                             // 507
                                                                                                                      // 508
        if (! options.finishSynchronously && ++recomputedCount > 1000) {                                              // 509
          finishedTry = true;                                                                                         // 510
          return;                                                                                                     // 511
        }                                                                                                             // 512
      }                                                                                                               // 513
                                                                                                                      // 514
      if (afterFlushCallbacks.length) {                                                                               // 515
        // call one afterFlush callback, which may                                                                    // 516
        // invalidate more computations                                                                               // 517
        var func = afterFlushCallbacks.shift();                                                                       // 518
        try {                                                                                                         // 519
          func();                                                                                                     // 520
        } catch (e) {                                                                                                 // 521
          _throwOrLog("afterFlush", e);                                                                               // 522
        }                                                                                                             // 523
      }                                                                                                               // 524
    }                                                                                                                 // 525
    finishedTry = true;                                                                                               // 526
  } finally {                                                                                                         // 527
    if (! finishedTry) {                                                                                              // 528
      // we're erroring due to throwFirstError being true.                                                            // 529
      inFlush = false; // needed before calling `Tracker.flush()` again                                               // 530
      // finish flushing                                                                                              // 531
      Tracker._runFlush({                                                                                             // 532
        finishSynchronously: options.finishSynchronously,                                                             // 533
        throwFirstError: false                                                                                        // 534
      });                                                                                                             // 535
    }                                                                                                                 // 536
    willFlush = false;                                                                                                // 537
    inFlush = false;                                                                                                  // 538
    if (pendingComputations.length || afterFlushCallbacks.length) {                                                   // 539
      // We're yielding because we ran a bunch of computations and we aren't                                          // 540
      // required to finish synchronously, so we'd like to give the event loop a                                      // 541
      // chance. We should flush again soon.                                                                          // 542
      if (options.finishSynchronously) {                                                                              // 543
        throw new Error("still have more to do?");  // shouldn't happen                                               // 544
      }                                                                                                               // 545
      setTimeout(requireFlush, 10);                                                                                   // 546
    }                                                                                                                 // 547
  }                                                                                                                   // 548
};                                                                                                                    // 549
                                                                                                                      // 550
// http://docs.meteor.com/#tracker_autorun                                                                            // 551
//                                                                                                                    // 552
// Run f(). Record its dependencies. Rerun it whenever the                                                            // 553
// dependencies change.                                                                                               // 554
//                                                                                                                    // 555
// Returns a new Computation, which is also passed to f.                                                              // 556
//                                                                                                                    // 557
// Links the computation to the current computation                                                                   // 558
// so that it is stopped if the current computation is invalidated.                                                   // 559
                                                                                                                      // 560
/**                                                                                                                   // 561
 * @callback Tracker.ComputationFunction                                                                              // 562
 * @param {Tracker.Computation}                                                                                       // 563
 */                                                                                                                   // 564
/**                                                                                                                   // 565
 * @summary Run a function now and rerun it later whenever its dependencies                                           // 566
 * change. Returns a Computation object that can be used to stop or observe the                                       // 567
 * rerunning.                                                                                                         // 568
 * @locus Client                                                                                                      // 569
 * @param {Tracker.ComputationFunction} runFunc The function to run. It receives                                      // 570
 * one argument: the Computation object that will be returned.                                                        // 571
 * @param {Object} [options]                                                                                          // 572
 * @param {Function} options.onError Optional. The function to run when an error                                      // 573
 * happens in the Computation. The only argument it receives is the Error                                             // 574
 * thrown. Defaults to the error being logged to the console.                                                         // 575
 * @returns {Tracker.Computation}                                                                                     // 576
 */                                                                                                                   // 577
Tracker.autorun = function (f, options) {                                                                             // 578
  if (typeof f !== 'function')                                                                                        // 579
    throw new Error('Tracker.autorun requires a function argument');                                                  // 580
                                                                                                                      // 581
  options = options || {};                                                                                            // 582
                                                                                                                      // 583
  constructingComputation = true;                                                                                     // 584
  var c = new Tracker.Computation(                                                                                    // 585
    f, Tracker.currentComputation, options.onError);                                                                  // 586
                                                                                                                      // 587
  if (Tracker.active)                                                                                                 // 588
    Tracker.onInvalidate(function () {                                                                                // 589
      c.stop();                                                                                                       // 590
    });                                                                                                               // 591
                                                                                                                      // 592
  return c;                                                                                                           // 593
};                                                                                                                    // 594
                                                                                                                      // 595
// http://docs.meteor.com/#tracker_nonreactive                                                                        // 596
//                                                                                                                    // 597
// Run `f` with no current computation, returning the return value                                                    // 598
// of `f`.  Used to turn off reactivity for the duration of `f`,                                                      // 599
// so that reactive data sources accessed by `f` will not result in any                                               // 600
// computations being invalidated.                                                                                    // 601
                                                                                                                      // 602
/**                                                                                                                   // 603
 * @summary Run a function without tracking dependencies.                                                             // 604
 * @locus Client                                                                                                      // 605
 * @param {Function} func A function to call immediately.                                                             // 606
 */                                                                                                                   // 607
Tracker.nonreactive = function (f) {                                                                                  // 608
  var previous = Tracker.currentComputation;                                                                          // 609
  setCurrentComputation(null);                                                                                        // 610
  try {                                                                                                               // 611
    return f();                                                                                                       // 612
  } finally {                                                                                                         // 613
    setCurrentComputation(previous);                                                                                  // 614
  }                                                                                                                   // 615
};                                                                                                                    // 616
                                                                                                                      // 617
// http://docs.meteor.com/#tracker_oninvalidate                                                                       // 618
                                                                                                                      // 619
/**                                                                                                                   // 620
 * @summary Registers a new [`onInvalidate`](#computation_oninvalidate) callback on the current computation (which must exist), to be called immediately when the current computation is invalidated or stopped.
 * @locus Client                                                                                                      // 622
 * @param {Function} callback A callback function that will be invoked as `func(c)`, where `c` is the computation on which the callback is registered.
 */                                                                                                                   // 624
Tracker.onInvalidate = function (f) {                                                                                 // 625
  if (! Tracker.active)                                                                                               // 626
    throw new Error("Tracker.onInvalidate requires a currentComputation");                                            // 627
                                                                                                                      // 628
  Tracker.currentComputation.onInvalidate(f);                                                                         // 629
};                                                                                                                    // 630
                                                                                                                      // 631
// http://docs.meteor.com/#tracker_afterflush                                                                         // 632
                                                                                                                      // 633
/**                                                                                                                   // 634
 * @summary Schedules a function to be called during the next flush, or later in the current flush if one is in progress, after all invalidated computations have been rerun.  The function will be run once and not on subsequent flushes unless `afterFlush` is called again.
 * @locus Client                                                                                                      // 636
 * @param {Function} callback A function to call at flush time.                                                       // 637
 */                                                                                                                   // 638
Tracker.afterFlush = function (f) {                                                                                   // 639
  afterFlushCallbacks.push(f);                                                                                        // 640
  requireFlush();                                                                                                     // 641
};                                                                                                                    // 642
                                                                                                                      // 643
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/tracker/deprecated.js                                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// Deprecated functions.                                                                                              // 1
                                                                                                                      // 2
// These functions used to be on the Meteor object (and worked slightly                                               // 3
// differently).                                                                                                      // 4
// XXX COMPAT WITH 0.5.7                                                                                              // 5
Meteor.flush = Tracker.flush;                                                                                         // 6
Meteor.autorun = Tracker.autorun;                                                                                     // 7
                                                                                                                      // 8
// We used to require a special "autosubscribe" call to reactively subscribe to                                       // 9
// things. Now, it works with autorun.                                                                                // 10
// XXX COMPAT WITH 0.5.4                                                                                              // 11
Meteor.autosubscribe = Tracker.autorun;                                                                               // 12
                                                                                                                      // 13
// This Tracker API briefly existed in 0.5.8 and 0.5.9                                                                // 14
// XXX COMPAT WITH 0.5.9                                                                                              // 15
Tracker.depend = function (d) {                                                                                       // 16
  return d.depend();                                                                                                  // 17
};                                                                                                                    // 18
                                                                                                                      // 19
Deps = Tracker;                                                                                                       // 20
                                                                                                                      // 21
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.tracker = {}, {
  Tracker: Tracker,
  Deps: Deps
});

})();
