(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var html, chai, __coffeescriptShare, assert, expect, should;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/practicalmeteor_chai/packages/practicalmeteor_chai.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/practicalmeteor:chai/chai-2.1.0.js                                                                    //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
                                                                                                                  // 1
;(function(){                                                                                                     // 2
                                                                                                                  // 3
/**                                                                                                               // 4
 * Require the module at `name`.                                                                                  // 5
 *                                                                                                                // 6
 * @param {String} name                                                                                           // 7
 * @return {Object} exports                                                                                       // 8
 * @api public                                                                                                    // 9
 */                                                                                                               // 10
                                                                                                                  // 11
function require(name) {                                                                                          // 12
  var module = require.modules[name];                                                                             // 13
  if (!module) throw new Error('failed to require "' + name + '"');                                               // 14
                                                                                                                  // 15
  if (!('exports' in module) && typeof module.definition === 'function') {                                        // 16
    module.client = module.component = true;                                                                      // 17
    module.definition.call(this, module.exports = {}, module);                                                    // 18
    delete module.definition;                                                                                     // 19
  }                                                                                                               // 20
                                                                                                                  // 21
  return module.exports;                                                                                          // 22
}                                                                                                                 // 23
                                                                                                                  // 24
/**                                                                                                               // 25
 * Meta info, accessible in the global scope unless you use AMD option.                                           // 26
 */                                                                                                               // 27
                                                                                                                  // 28
require.loader = 'component';                                                                                     // 29
                                                                                                                  // 30
/**                                                                                                               // 31
 * Internal helper object, contains a sorting function for semantiv versioning                                    // 32
 */                                                                                                               // 33
require.helper = {};                                                                                              // 34
require.helper.semVerSort = function(a, b) {                                                                      // 35
  var aArray = a.version.split('.');                                                                              // 36
  var bArray = b.version.split('.');                                                                              // 37
  for (var i=0; i<aArray.length; ++i) {                                                                           // 38
    var aInt = parseInt(aArray[i], 10);                                                                           // 39
    var bInt = parseInt(bArray[i], 10);                                                                           // 40
    if (aInt === bInt) {                                                                                          // 41
      var aLex = aArray[i].substr((""+aInt).length);                                                              // 42
      var bLex = bArray[i].substr((""+bInt).length);                                                              // 43
      if (aLex === '' && bLex !== '') return 1;                                                                   // 44
      if (aLex !== '' && bLex === '') return -1;                                                                  // 45
      if (aLex !== '' && bLex !== '') return aLex > bLex ? 1 : -1;                                                // 46
      continue;                                                                                                   // 47
    } else if (aInt > bInt) {                                                                                     // 48
      return 1;                                                                                                   // 49
    } else {                                                                                                      // 50
      return -1;                                                                                                  // 51
    }                                                                                                             // 52
  }                                                                                                               // 53
  return 0;                                                                                                       // 54
}                                                                                                                 // 55
                                                                                                                  // 56
/**                                                                                                               // 57
 * Find and require a module which name starts with the provided name.                                            // 58
 * If multiple modules exists, the highest semver is used.                                                        // 59
 * This function can only be used for remote dependencies.                                                        // 60
                                                                                                                  // 61
 * @param {String} name - module name: `user~repo`                                                                // 62
 * @param {Boolean} returnPath - returns the canonical require path if true,                                      // 63
 *                               otherwise it returns the epxorted module                                         // 64
 */                                                                                                               // 65
require.latest = function (name, returnPath) {                                                                    // 66
  function showError(name) {                                                                                      // 67
    throw new Error('failed to find latest module of "' + name + '"');                                            // 68
  }                                                                                                               // 69
  // only remotes with semvers, ignore local files conataining a '/'                                              // 70
  var versionRegexp = /(.*)~(.*)@v?(\d+\.\d+\.\d+[^\/]*)$/;                                                       // 71
  var remoteRegexp = /(.*)~(.*)/;                                                                                 // 72
  if (!remoteRegexp.test(name)) showError(name);                                                                  // 73
  var moduleNames = Object.keys(require.modules);                                                                 // 74
  var semVerCandidates = [];                                                                                      // 75
  var otherCandidates = []; // for instance: name of the git branch                                               // 76
  for (var i=0; i<moduleNames.length; i++) {                                                                      // 77
    var moduleName = moduleNames[i];                                                                              // 78
    if (new RegExp(name + '@').test(moduleName)) {                                                                // 79
        var version = moduleName.substr(name.length+1);                                                           // 80
        var semVerMatch = versionRegexp.exec(moduleName);                                                         // 81
        if (semVerMatch != null) {                                                                                // 82
          semVerCandidates.push({version: version, name: moduleName});                                            // 83
        } else {                                                                                                  // 84
          otherCandidates.push({version: version, name: moduleName});                                             // 85
        }                                                                                                         // 86
    }                                                                                                             // 87
  }                                                                                                               // 88
  if (semVerCandidates.concat(otherCandidates).length === 0) {                                                    // 89
    showError(name);                                                                                              // 90
  }                                                                                                               // 91
  if (semVerCandidates.length > 0) {                                                                              // 92
    var module = semVerCandidates.sort(require.helper.semVerSort).pop().name;                                     // 93
    if (returnPath === true) {                                                                                    // 94
      return module;                                                                                              // 95
    }                                                                                                             // 96
    return require(module);                                                                                       // 97
  }                                                                                                               // 98
  // if the build contains more than one branch of the same module                                                // 99
  // you should not use this funciton                                                                             // 100
  var module = otherCandidates.sort(function(a, b) {return a.name > b.name})[0].name;                             // 101
  if (returnPath === true) {                                                                                      // 102
    return module;                                                                                                // 103
  }                                                                                                               // 104
  return require(module);                                                                                         // 105
}                                                                                                                 // 106
                                                                                                                  // 107
/**                                                                                                               // 108
 * Registered modules.                                                                                            // 109
 */                                                                                                               // 110
                                                                                                                  // 111
require.modules = {};                                                                                             // 112
                                                                                                                  // 113
/**                                                                                                               // 114
 * Register module at `name` with callback `definition`.                                                          // 115
 *                                                                                                                // 116
 * @param {String} name                                                                                           // 117
 * @param {Function} definition                                                                                   // 118
 * @api private                                                                                                   // 119
 */                                                                                                               // 120
                                                                                                                  // 121
require.register = function (name, definition) {                                                                  // 122
  require.modules[name] = {                                                                                       // 123
    definition: definition                                                                                        // 124
  };                                                                                                              // 125
};                                                                                                                // 126
                                                                                                                  // 127
/**                                                                                                               // 128
 * Define a module's exports immediately with `exports`.                                                          // 129
 *                                                                                                                // 130
 * @param {String} name                                                                                           // 131
 * @param {Generic} exports                                                                                       // 132
 * @api private                                                                                                   // 133
 */                                                                                                               // 134
                                                                                                                  // 135
require.define = function (name, exports) {                                                                       // 136
  require.modules[name] = {                                                                                       // 137
    exports: exports                                                                                              // 138
  };                                                                                                              // 139
};                                                                                                                // 140
require.register("chaijs~assertion-error@1.0.0", function (exports, module) {                                     // 141
/*!                                                                                                               // 142
 * assertion-error                                                                                                // 143
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>                                                               // 144
 * MIT Licensed                                                                                                   // 145
 */                                                                                                               // 146
                                                                                                                  // 147
/*!                                                                                                               // 148
 * Return a function that will copy properties from                                                               // 149
 * one object to another excluding any originally                                                                 // 150
 * listed. Returned function will create a new `{}`.                                                              // 151
 *                                                                                                                // 152
 * @param {String} excluded properties ...                                                                        // 153
 * @return {Function}                                                                                             // 154
 */                                                                                                               // 155
                                                                                                                  // 156
function exclude () {                                                                                             // 157
  var excludes = [].slice.call(arguments);                                                                        // 158
                                                                                                                  // 159
  function excludeProps (res, obj) {                                                                              // 160
    Object.keys(obj).forEach(function (key) {                                                                     // 161
      if (!~excludes.indexOf(key)) res[key] = obj[key];                                                           // 162
    });                                                                                                           // 163
  }                                                                                                               // 164
                                                                                                                  // 165
  return function extendExclude () {                                                                              // 166
    var args = [].slice.call(arguments)                                                                           // 167
      , i = 0                                                                                                     // 168
      , res = {};                                                                                                 // 169
                                                                                                                  // 170
    for (; i < args.length; i++) {                                                                                // 171
      excludeProps(res, args[i]);                                                                                 // 172
    }                                                                                                             // 173
                                                                                                                  // 174
    return res;                                                                                                   // 175
  };                                                                                                              // 176
};                                                                                                                // 177
                                                                                                                  // 178
/*!                                                                                                               // 179
 * Primary Exports                                                                                                // 180
 */                                                                                                               // 181
                                                                                                                  // 182
module.exports = AssertionError;                                                                                  // 183
                                                                                                                  // 184
/**                                                                                                               // 185
 * ### AssertionError                                                                                             // 186
 *                                                                                                                // 187
 * An extension of the JavaScript `Error` constructor for                                                         // 188
 * assertion and validation scenarios.                                                                            // 189
 *                                                                                                                // 190
 * @param {String} message                                                                                        // 191
 * @param {Object} properties to include (optional)                                                               // 192
 * @param {callee} start stack function (optional)                                                                // 193
 */                                                                                                               // 194
                                                                                                                  // 195
function AssertionError (message, _props, ssf) {                                                                  // 196
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')                                       // 197
    , props = extend(_props || {});                                                                               // 198
                                                                                                                  // 199
  // default values                                                                                               // 200
  this.message = message || 'Unspecified AssertionError';                                                         // 201
  this.showDiff = false;                                                                                          // 202
                                                                                                                  // 203
  // copy from properties                                                                                         // 204
  for (var key in props) {                                                                                        // 205
    this[key] = props[key];                                                                                       // 206
  }                                                                                                               // 207
                                                                                                                  // 208
  // capture stack trace                                                                                          // 209
  ssf = ssf || arguments.callee;                                                                                  // 210
  if (ssf && Error.captureStackTrace) {                                                                           // 211
    Error.captureStackTrace(this, ssf);                                                                           // 212
  }                                                                                                               // 213
}                                                                                                                 // 214
                                                                                                                  // 215
/*!                                                                                                               // 216
 * Inherit from Error.prototype                                                                                   // 217
 */                                                                                                               // 218
                                                                                                                  // 219
AssertionError.prototype = Object.create(Error.prototype);                                                        // 220
                                                                                                                  // 221
/*!                                                                                                               // 222
 * Statically set name                                                                                            // 223
 */                                                                                                               // 224
                                                                                                                  // 225
AssertionError.prototype.name = 'AssertionError';                                                                 // 226
                                                                                                                  // 227
/*!                                                                                                               // 228
 * Ensure correct constructor                                                                                     // 229
 */                                                                                                               // 230
                                                                                                                  // 231
AssertionError.prototype.constructor = AssertionError;                                                            // 232
                                                                                                                  // 233
/**                                                                                                               // 234
 * Allow errors to be converted to JSON for static transfer.                                                      // 235
 *                                                                                                                // 236
 * @param {Boolean} include stack (default: `true`)                                                               // 237
 * @return {Object} object that can be `JSON.stringify`                                                           // 238
 */                                                                                                               // 239
                                                                                                                  // 240
AssertionError.prototype.toJSON = function (stack) {                                                              // 241
  var extend = exclude('constructor', 'toJSON', 'stack')                                                          // 242
    , props = extend({ name: this.name }, this);                                                                  // 243
                                                                                                                  // 244
  // include stack if exists and not turned off                                                                   // 245
  if (false !== stack && this.stack) {                                                                            // 246
    props.stack = this.stack;                                                                                     // 247
  }                                                                                                               // 248
                                                                                                                  // 249
  return props;                                                                                                   // 250
};                                                                                                                // 251
                                                                                                                  // 252
});                                                                                                               // 253
                                                                                                                  // 254
require.register("chaijs~type-detect@0.1.1", function (exports, module) {                                         // 255
/*!                                                                                                               // 256
 * type-detect                                                                                                    // 257
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>                                                         // 258
 * MIT Licensed                                                                                                   // 259
 */                                                                                                               // 260
                                                                                                                  // 261
/*!                                                                                                               // 262
 * Primary Exports                                                                                                // 263
 */                                                                                                               // 264
                                                                                                                  // 265
var exports = module.exports = getType;                                                                           // 266
                                                                                                                  // 267
/*!                                                                                                               // 268
 * Detectable javascript natives                                                                                  // 269
 */                                                                                                               // 270
                                                                                                                  // 271
var natives = {                                                                                                   // 272
    '[object Array]': 'array'                                                                                     // 273
  , '[object RegExp]': 'regexp'                                                                                   // 274
  , '[object Function]': 'function'                                                                               // 275
  , '[object Arguments]': 'arguments'                                                                             // 276
  , '[object Date]': 'date'                                                                                       // 277
};                                                                                                                // 278
                                                                                                                  // 279
/**                                                                                                               // 280
 * ### typeOf (obj)                                                                                               // 281
 *                                                                                                                // 282
 * Use several different techniques to determine                                                                  // 283
 * the type of object being tested.                                                                               // 284
 *                                                                                                                // 285
 *                                                                                                                // 286
 * @param {Mixed} object                                                                                          // 287
 * @return {String} object type                                                                                   // 288
 * @api public                                                                                                    // 289
 */                                                                                                               // 290
                                                                                                                  // 291
function getType (obj) {                                                                                          // 292
  var str = Object.prototype.toString.call(obj);                                                                  // 293
  if (natives[str]) return natives[str];                                                                          // 294
  if (obj === null) return 'null';                                                                                // 295
  if (obj === undefined) return 'undefined';                                                                      // 296
  if (obj === Object(obj)) return 'object';                                                                       // 297
  return typeof obj;                                                                                              // 298
}                                                                                                                 // 299
                                                                                                                  // 300
exports.Library = Library;                                                                                        // 301
                                                                                                                  // 302
/**                                                                                                               // 303
 * ### Library                                                                                                    // 304
 *                                                                                                                // 305
 * Create a repository for custom type detection.                                                                 // 306
 *                                                                                                                // 307
 * ```js                                                                                                          // 308
 * var lib = new type.Library;                                                                                    // 309
 * ```                                                                                                            // 310
 *                                                                                                                // 311
 */                                                                                                               // 312
                                                                                                                  // 313
function Library () {                                                                                             // 314
  this.tests = {};                                                                                                // 315
}                                                                                                                 // 316
                                                                                                                  // 317
/**                                                                                                               // 318
 * #### .of (obj)                                                                                                 // 319
 *                                                                                                                // 320
 * Expose replacement `typeof` detection to the library.                                                          // 321
 *                                                                                                                // 322
 * ```js                                                                                                          // 323
 * if ('string' === lib.of('hello world')) {                                                                      // 324
 *   // ...                                                                                                       // 325
 * }                                                                                                              // 326
 * ```                                                                                                            // 327
 *                                                                                                                // 328
 * @param {Mixed} object to test                                                                                  // 329
 * @return {String} type                                                                                          // 330
 */                                                                                                               // 331
                                                                                                                  // 332
Library.prototype.of = getType;                                                                                   // 333
                                                                                                                  // 334
/**                                                                                                               // 335
 * #### .define (type, test)                                                                                      // 336
 *                                                                                                                // 337
 * Add a test to for the `.test()` assertion.                                                                     // 338
 *                                                                                                                // 339
 * Can be defined as a regular expression:                                                                        // 340
 *                                                                                                                // 341
 * ```js                                                                                                          // 342
 * lib.define('int', /^[0-9]+$/);                                                                                 // 343
 * ```                                                                                                            // 344
 *                                                                                                                // 345
 * ... or as a function:                                                                                          // 346
 *                                                                                                                // 347
 * ```js                                                                                                          // 348
 * lib.define('bln', function (obj) {                                                                             // 349
 *   if ('boolean' === lib.of(obj)) return true;                                                                  // 350
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];                                                           // 351
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();                                                       // 352
 *   return !! ~blns.indexOf(obj);                                                                                // 353
 * });                                                                                                            // 354
 * ```                                                                                                            // 355
 *                                                                                                                // 356
 * @param {String} type                                                                                           // 357
 * @param {RegExp|Function} test                                                                                  // 358
 * @api public                                                                                                    // 359
 */                                                                                                               // 360
                                                                                                                  // 361
Library.prototype.define = function (type, test) {                                                                // 362
  if (arguments.length === 1) return this.tests[type];                                                            // 363
  this.tests[type] = test;                                                                                        // 364
  return this;                                                                                                    // 365
};                                                                                                                // 366
                                                                                                                  // 367
/**                                                                                                               // 368
 * #### .test (obj, test)                                                                                         // 369
 *                                                                                                                // 370
 * Assert that an object is of type. Will first                                                                   // 371
 * check natives, and if that does not pass it will                                                               // 372
 * use the user defined custom tests.                                                                             // 373
 *                                                                                                                // 374
 * ```js                                                                                                          // 375
 * assert(lib.test('1', 'int'));                                                                                  // 376
 * assert(lib.test('yes', 'bln'));                                                                                // 377
 * ```                                                                                                            // 378
 *                                                                                                                // 379
 * @param {Mixed} object                                                                                          // 380
 * @param {String} type                                                                                           // 381
 * @return {Boolean} result                                                                                       // 382
 * @api public                                                                                                    // 383
 */                                                                                                               // 384
                                                                                                                  // 385
Library.prototype.test = function (obj, type) {                                                                   // 386
  if (type === getType(obj)) return true;                                                                         // 387
  var test = this.tests[type];                                                                                    // 388
                                                                                                                  // 389
  if (test && 'regexp' === getType(test)) {                                                                       // 390
    return test.test(obj);                                                                                        // 391
  } else if (test && 'function' === getType(test)) {                                                              // 392
    return test(obj);                                                                                             // 393
  } else {                                                                                                        // 394
    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');                                 // 395
  }                                                                                                               // 396
};                                                                                                                // 397
                                                                                                                  // 398
});                                                                                                               // 399
                                                                                                                  // 400
require.register("chaijs~deep-eql@0.1.3", function (exports, module) {                                            // 401
/*!                                                                                                               // 402
 * deep-eql                                                                                                       // 403
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>                                                         // 404
 * MIT Licensed                                                                                                   // 405
 */                                                                                                               // 406
                                                                                                                  // 407
/*!                                                                                                               // 408
 * Module dependencies                                                                                            // 409
 */                                                                                                               // 410
                                                                                                                  // 411
var type = require('chaijs~type-detect@0.1.1');                                                                   // 412
                                                                                                                  // 413
/*!                                                                                                               // 414
 * Buffer.isBuffer browser shim                                                                                   // 415
 */                                                                                                               // 416
                                                                                                                  // 417
var Buffer;                                                                                                       // 418
try { Buffer = require('buffer').Buffer; }                                                                        // 419
catch(ex) {                                                                                                       // 420
  Buffer = {};                                                                                                    // 421
  Buffer.isBuffer = function() { return false; }                                                                  // 422
}                                                                                                                 // 423
                                                                                                                  // 424
/*!                                                                                                               // 425
 * Primary Export                                                                                                 // 426
 */                                                                                                               // 427
                                                                                                                  // 428
module.exports = deepEqual;                                                                                       // 429
                                                                                                                  // 430
/**                                                                                                               // 431
 * Assert super-strict (egal) equality between                                                                    // 432
 * two objects of any type.                                                                                       // 433
 *                                                                                                                // 434
 * @param {Mixed} a                                                                                               // 435
 * @param {Mixed} b                                                                                               // 436
 * @param {Array} memoised (optional)                                                                             // 437
 * @return {Boolean} equal match                                                                                  // 438
 */                                                                                                               // 439
                                                                                                                  // 440
function deepEqual(a, b, m) {                                                                                     // 441
  if (sameValue(a, b)) {                                                                                          // 442
    return true;                                                                                                  // 443
  } else if ('date' === type(a)) {                                                                                // 444
    return dateEqual(a, b);                                                                                       // 445
  } else if ('regexp' === type(a)) {                                                                              // 446
    return regexpEqual(a, b);                                                                                     // 447
  } else if (Buffer.isBuffer(a)) {                                                                                // 448
    return bufferEqual(a, b);                                                                                     // 449
  } else if ('arguments' === type(a)) {                                                                           // 450
    return argumentsEqual(a, b, m);                                                                               // 451
  } else if (!typeEqual(a, b)) {                                                                                  // 452
    return false;                                                                                                 // 453
  } else if (('object' !== type(a) && 'object' !== type(b))                                                       // 454
  && ('array' !== type(a) && 'array' !== type(b))) {                                                              // 455
    return sameValue(a, b);                                                                                       // 456
  } else {                                                                                                        // 457
    return objectEqual(a, b, m);                                                                                  // 458
  }                                                                                                               // 459
}                                                                                                                 // 460
                                                                                                                  // 461
/*!                                                                                                               // 462
 * Strict (egal) equality test. Ensures that NaN always                                                           // 463
 * equals NaN and `-0` does not equal `+0`.                                                                       // 464
 *                                                                                                                // 465
 * @param {Mixed} a                                                                                               // 466
 * @param {Mixed} b                                                                                               // 467
 * @return {Boolean} equal match                                                                                  // 468
 */                                                                                                               // 469
                                                                                                                  // 470
function sameValue(a, b) {                                                                                        // 471
  if (a === b) return a !== 0 || 1 / a === 1 / b;                                                                 // 472
  return a !== a && b !== b;                                                                                      // 473
}                                                                                                                 // 474
                                                                                                                  // 475
/*!                                                                                                               // 476
 * Compare the types of two given objects and                                                                     // 477
 * return if they are equal. Note that an Array                                                                   // 478
 * has a type of `array` (not `object`) and arguments                                                             // 479
 * have a type of `arguments` (not `array`/`object`).                                                             // 480
 *                                                                                                                // 481
 * @param {Mixed} a                                                                                               // 482
 * @param {Mixed} b                                                                                               // 483
 * @return {Boolean} result                                                                                       // 484
 */                                                                                                               // 485
                                                                                                                  // 486
function typeEqual(a, b) {                                                                                        // 487
  return type(a) === type(b);                                                                                     // 488
}                                                                                                                 // 489
                                                                                                                  // 490
/*!                                                                                                               // 491
 * Compare two Date objects by asserting that                                                                     // 492
 * the time values are equal using `saveValue`.                                                                   // 493
 *                                                                                                                // 494
 * @param {Date} a                                                                                                // 495
 * @param {Date} b                                                                                                // 496
 * @return {Boolean} result                                                                                       // 497
 */                                                                                                               // 498
                                                                                                                  // 499
function dateEqual(a, b) {                                                                                        // 500
  if ('date' !== type(b)) return false;                                                                           // 501
  return sameValue(a.getTime(), b.getTime());                                                                     // 502
}                                                                                                                 // 503
                                                                                                                  // 504
/*!                                                                                                               // 505
 * Compare two regular expressions by converting them                                                             // 506
 * to string and checking for `sameValue`.                                                                        // 507
 *                                                                                                                // 508
 * @param {RegExp} a                                                                                              // 509
 * @param {RegExp} b                                                                                              // 510
 * @return {Boolean} result                                                                                       // 511
 */                                                                                                               // 512
                                                                                                                  // 513
function regexpEqual(a, b) {                                                                                      // 514
  if ('regexp' !== type(b)) return false;                                                                         // 515
  return sameValue(a.toString(), b.toString());                                                                   // 516
}                                                                                                                 // 517
                                                                                                                  // 518
/*!                                                                                                               // 519
 * Assert deep equality of two `arguments` objects.                                                               // 520
 * Unfortunately, these must be sliced to arrays                                                                  // 521
 * prior to test to ensure no bad behavior.                                                                       // 522
 *                                                                                                                // 523
 * @param {Arguments} a                                                                                           // 524
 * @param {Arguments} b                                                                                           // 525
 * @param {Array} memoize (optional)                                                                              // 526
 * @return {Boolean} result                                                                                       // 527
 */                                                                                                               // 528
                                                                                                                  // 529
function argumentsEqual(a, b, m) {                                                                                // 530
  if ('arguments' !== type(b)) return false;                                                                      // 531
  a = [].slice.call(a);                                                                                           // 532
  b = [].slice.call(b);                                                                                           // 533
  return deepEqual(a, b, m);                                                                                      // 534
}                                                                                                                 // 535
                                                                                                                  // 536
/*!                                                                                                               // 537
 * Get enumerable properties of a given object.                                                                   // 538
 *                                                                                                                // 539
 * @param {Object} a                                                                                              // 540
 * @return {Array} property names                                                                                 // 541
 */                                                                                                               // 542
                                                                                                                  // 543
function enumerable(a) {                                                                                          // 544
  var res = [];                                                                                                   // 545
  for (var key in a) res.push(key);                                                                               // 546
  return res;                                                                                                     // 547
}                                                                                                                 // 548
                                                                                                                  // 549
/*!                                                                                                               // 550
 * Simple equality for flat iterable objects                                                                      // 551
 * such as Arrays or Node.js buffers.                                                                             // 552
 *                                                                                                                // 553
 * @param {Iterable} a                                                                                            // 554
 * @param {Iterable} b                                                                                            // 555
 * @return {Boolean} result                                                                                       // 556
 */                                                                                                               // 557
                                                                                                                  // 558
function iterableEqual(a, b) {                                                                                    // 559
  if (a.length !==  b.length) return false;                                                                       // 560
                                                                                                                  // 561
  var i = 0;                                                                                                      // 562
  var match = true;                                                                                               // 563
                                                                                                                  // 564
  for (; i < a.length; i++) {                                                                                     // 565
    if (a[i] !== b[i]) {                                                                                          // 566
      match = false;                                                                                              // 567
      break;                                                                                                      // 568
    }                                                                                                             // 569
  }                                                                                                               // 570
                                                                                                                  // 571
  return match;                                                                                                   // 572
}                                                                                                                 // 573
                                                                                                                  // 574
/*!                                                                                                               // 575
 * Extension to `iterableEqual` specifically                                                                      // 576
 * for Node.js Buffers.                                                                                           // 577
 *                                                                                                                // 578
 * @param {Buffer} a                                                                                              // 579
 * @param {Mixed} b                                                                                               // 580
 * @return {Boolean} result                                                                                       // 581
 */                                                                                                               // 582
                                                                                                                  // 583
function bufferEqual(a, b) {                                                                                      // 584
  if (!Buffer.isBuffer(b)) return false;                                                                          // 585
  return iterableEqual(a, b);                                                                                     // 586
}                                                                                                                 // 587
                                                                                                                  // 588
/*!                                                                                                               // 589
 * Block for `objectEqual` ensuring non-existing                                                                  // 590
 * values don't get in.                                                                                           // 591
 *                                                                                                                // 592
 * @param {Mixed} object                                                                                          // 593
 * @return {Boolean} result                                                                                       // 594
 */                                                                                                               // 595
                                                                                                                  // 596
function isValue(a) {                                                                                             // 597
  return a !== null && a !== undefined;                                                                           // 598
}                                                                                                                 // 599
                                                                                                                  // 600
/*!                                                                                                               // 601
 * Recursively check the equality of two objects.                                                                 // 602
 * Once basic sameness has been established it will                                                               // 603
 * defer to `deepEqual` for each enumerable key                                                                   // 604
 * in the object.                                                                                                 // 605
 *                                                                                                                // 606
 * @param {Mixed} a                                                                                               // 607
 * @param {Mixed} b                                                                                               // 608
 * @return {Boolean} result                                                                                       // 609
 */                                                                                                               // 610
                                                                                                                  // 611
function objectEqual(a, b, m) {                                                                                   // 612
  if (!isValue(a) || !isValue(b)) {                                                                               // 613
    return false;                                                                                                 // 614
  }                                                                                                               // 615
                                                                                                                  // 616
  if (a.prototype !== b.prototype) {                                                                              // 617
    return false;                                                                                                 // 618
  }                                                                                                               // 619
                                                                                                                  // 620
  var i;                                                                                                          // 621
  if (m) {                                                                                                        // 622
    for (i = 0; i < m.length; i++) {                                                                              // 623
      if ((m[i][0] === a && m[i][1] === b)                                                                        // 624
      ||  (m[i][0] === b && m[i][1] === a)) {                                                                     // 625
        return true;                                                                                              // 626
      }                                                                                                           // 627
    }                                                                                                             // 628
  } else {                                                                                                        // 629
    m = [];                                                                                                       // 630
  }                                                                                                               // 631
                                                                                                                  // 632
  try {                                                                                                           // 633
    var ka = enumerable(a);                                                                                       // 634
    var kb = enumerable(b);                                                                                       // 635
  } catch (ex) {                                                                                                  // 636
    return false;                                                                                                 // 637
  }                                                                                                               // 638
                                                                                                                  // 639
  ka.sort();                                                                                                      // 640
  kb.sort();                                                                                                      // 641
                                                                                                                  // 642
  if (!iterableEqual(ka, kb)) {                                                                                   // 643
    return false;                                                                                                 // 644
  }                                                                                                               // 645
                                                                                                                  // 646
  m.push([ a, b ]);                                                                                               // 647
                                                                                                                  // 648
  var key;                                                                                                        // 649
  for (i = ka.length - 1; i >= 0; i--) {                                                                          // 650
    key = ka[i];                                                                                                  // 651
    if (!deepEqual(a[key], b[key], m)) {                                                                          // 652
      return false;                                                                                               // 653
    }                                                                                                             // 654
  }                                                                                                               // 655
                                                                                                                  // 656
  return true;                                                                                                    // 657
}                                                                                                                 // 658
                                                                                                                  // 659
});                                                                                                               // 660
                                                                                                                  // 661
require.register("chai", function (exports, module) {                                                             // 662
module.exports = require('chai/lib/chai.js');                                                                     // 663
                                                                                                                  // 664
});                                                                                                               // 665
                                                                                                                  // 666
require.register("chai/lib/chai.js", function (exports, module) {                                                 // 667
/*!                                                                                                               // 668
 * chai                                                                                                           // 669
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 670
 * MIT Licensed                                                                                                   // 671
 */                                                                                                               // 672
                                                                                                                  // 673
var used = []                                                                                                     // 674
  , exports = module.exports = {};                                                                                // 675
                                                                                                                  // 676
/*!                                                                                                               // 677
 * Chai version                                                                                                   // 678
 */                                                                                                               // 679
                                                                                                                  // 680
exports.version = '2.1.0';                                                                                        // 681
                                                                                                                  // 682
/*!                                                                                                               // 683
 * Assertion Error                                                                                                // 684
 */                                                                                                               // 685
                                                                                                                  // 686
exports.AssertionError = require('chaijs~assertion-error@1.0.0');                                                 // 687
                                                                                                                  // 688
/*!                                                                                                               // 689
 * Utils for plugins (not exported)                                                                               // 690
 */                                                                                                               // 691
                                                                                                                  // 692
var util = require('chai/lib/chai/utils/index.js');                                                               // 693
                                                                                                                  // 694
/**                                                                                                               // 695
 * # .use(function)                                                                                               // 696
 *                                                                                                                // 697
 * Provides a way to extend the internals of Chai                                                                 // 698
 *                                                                                                                // 699
 * @param {Function}                                                                                              // 700
 * @returns {this} for chaining                                                                                   // 701
 * @api public                                                                                                    // 702
 */                                                                                                               // 703
                                                                                                                  // 704
exports.use = function (fn) {                                                                                     // 705
  if (!~used.indexOf(fn)) {                                                                                       // 706
    fn(this, util);                                                                                               // 707
    used.push(fn);                                                                                                // 708
  }                                                                                                               // 709
                                                                                                                  // 710
  return this;                                                                                                    // 711
};                                                                                                                // 712
                                                                                                                  // 713
/*!                                                                                                               // 714
 * Utility Functions                                                                                              // 715
 */                                                                                                               // 716
                                                                                                                  // 717
exports.util = util;                                                                                              // 718
                                                                                                                  // 719
/*!                                                                                                               // 720
 * Configuration                                                                                                  // 721
 */                                                                                                               // 722
                                                                                                                  // 723
var config = require('chai/lib/chai/config.js');                                                                  // 724
exports.config = config;                                                                                          // 725
                                                                                                                  // 726
/*!                                                                                                               // 727
 * Primary `Assertion` prototype                                                                                  // 728
 */                                                                                                               // 729
                                                                                                                  // 730
var assertion = require('chai/lib/chai/assertion.js');                                                            // 731
exports.use(assertion);                                                                                           // 732
                                                                                                                  // 733
/*!                                                                                                               // 734
 * Core Assertions                                                                                                // 735
 */                                                                                                               // 736
                                                                                                                  // 737
var core = require('chai/lib/chai/core/assertions.js');                                                           // 738
exports.use(core);                                                                                                // 739
                                                                                                                  // 740
/*!                                                                                                               // 741
 * Expect interface                                                                                               // 742
 */                                                                                                               // 743
                                                                                                                  // 744
var expect = require('chai/lib/chai/interface/expect.js');                                                        // 745
exports.use(expect);                                                                                              // 746
                                                                                                                  // 747
/*!                                                                                                               // 748
 * Should interface                                                                                               // 749
 */                                                                                                               // 750
                                                                                                                  // 751
var should = require('chai/lib/chai/interface/should.js');                                                        // 752
exports.use(should);                                                                                              // 753
                                                                                                                  // 754
/*!                                                                                                               // 755
 * Assert interface                                                                                               // 756
 */                                                                                                               // 757
                                                                                                                  // 758
var assert = require('chai/lib/chai/interface/assert.js');                                                        // 759
exports.use(assert);                                                                                              // 760
                                                                                                                  // 761
});                                                                                                               // 762
                                                                                                                  // 763
require.register("chai/lib/chai/assertion.js", function (exports, module) {                                       // 764
/*!                                                                                                               // 765
 * chai                                                                                                           // 766
 * http://chaijs.com                                                                                              // 767
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 768
 * MIT Licensed                                                                                                   // 769
 */                                                                                                               // 770
                                                                                                                  // 771
var config = require('chai/lib/chai/config.js');                                                                  // 772
                                                                                                                  // 773
module.exports = function (_chai, util) {                                                                         // 774
  /*!                                                                                                             // 775
   * Module dependencies.                                                                                         // 776
   */                                                                                                             // 777
                                                                                                                  // 778
  var AssertionError = _chai.AssertionError                                                                       // 779
    , flag = util.flag;                                                                                           // 780
                                                                                                                  // 781
  /*!                                                                                                             // 782
   * Module export.                                                                                               // 783
   */                                                                                                             // 784
                                                                                                                  // 785
  _chai.Assertion = Assertion;                                                                                    // 786
                                                                                                                  // 787
  /*!                                                                                                             // 788
   * Assertion Constructor                                                                                        // 789
   *                                                                                                              // 790
   * Creates object for chaining.                                                                                 // 791
   *                                                                                                              // 792
   * @api private                                                                                                 // 793
   */                                                                                                             // 794
                                                                                                                  // 795
  function Assertion (obj, msg, stack) {                                                                          // 796
    flag(this, 'ssfi', stack || arguments.callee);                                                                // 797
    flag(this, 'object', obj);                                                                                    // 798
    flag(this, 'message', msg);                                                                                   // 799
  }                                                                                                               // 800
                                                                                                                  // 801
  Object.defineProperty(Assertion, 'includeStack', {                                                              // 802
    get: function() {                                                                                             // 803
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');                // 804
      return config.includeStack;                                                                                 // 805
    },                                                                                                            // 806
    set: function(value) {                                                                                        // 807
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');                // 808
      config.includeStack = value;                                                                                // 809
    }                                                                                                             // 810
  });                                                                                                             // 811
                                                                                                                  // 812
  Object.defineProperty(Assertion, 'showDiff', {                                                                  // 813
    get: function() {                                                                                             // 814
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');                        // 815
      return config.showDiff;                                                                                     // 816
    },                                                                                                            // 817
    set: function(value) {                                                                                        // 818
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');                        // 819
      config.showDiff = value;                                                                                    // 820
    }                                                                                                             // 821
  });                                                                                                             // 822
                                                                                                                  // 823
  Assertion.addProperty = function (name, fn) {                                                                   // 824
    util.addProperty(this.prototype, name, fn);                                                                   // 825
  };                                                                                                              // 826
                                                                                                                  // 827
  Assertion.addMethod = function (name, fn) {                                                                     // 828
    util.addMethod(this.prototype, name, fn);                                                                     // 829
  };                                                                                                              // 830
                                                                                                                  // 831
  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {                                          // 832
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);                                          // 833
  };                                                                                                              // 834
                                                                                                                  // 835
  Assertion.overwriteProperty = function (name, fn) {                                                             // 836
    util.overwriteProperty(this.prototype, name, fn);                                                             // 837
  };                                                                                                              // 838
                                                                                                                  // 839
  Assertion.overwriteMethod = function (name, fn) {                                                               // 840
    util.overwriteMethod(this.prototype, name, fn);                                                               // 841
  };                                                                                                              // 842
                                                                                                                  // 843
  Assertion.overwriteChainableMethod = function (name, fn, chainingBehavior) {                                    // 844
    util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);                                    // 845
  };                                                                                                              // 846
                                                                                                                  // 847
  /*!                                                                                                             // 848
   * ### .assert(expression, message, negateMessage, expected, actual)                                            // 849
   *                                                                                                              // 850
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.     // 851
   *                                                                                                              // 852
   * @name assert                                                                                                 // 853
   * @param {Philosophical} expression to be tested                                                               // 854
   * @param {String or Function} message or function that returns message to display if fails                     // 855
   * @param {String or Function} negatedMessage or function that returns negatedMessage to display if negated expression fails
   * @param {Mixed} expected value (remember to check for negation)                                               // 857
   * @param {Mixed} actual (optional) will default to `this.obj`                                                  // 858
   * @api private                                                                                                 // 859
   */                                                                                                             // 860
                                                                                                                  // 861
  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {                     // 862
    var ok = util.test(this, arguments);                                                                          // 863
    if (true !== showDiff) showDiff = false;                                                                      // 864
    if (true !== config.showDiff) showDiff = false;                                                               // 865
                                                                                                                  // 866
    if (!ok) {                                                                                                    // 867
      var msg = util.getMessage(this, arguments)                                                                  // 868
        , actual = util.getActual(this, arguments);                                                               // 869
      throw new AssertionError(msg, {                                                                             // 870
          actual: actual                                                                                          // 871
        , expected: expected                                                                                      // 872
        , showDiff: showDiff                                                                                      // 873
      }, (config.includeStack) ? this.assert : flag(this, 'ssfi'));                                               // 874
    }                                                                                                             // 875
  };                                                                                                              // 876
                                                                                                                  // 877
  /*!                                                                                                             // 878
   * ### ._obj                                                                                                    // 879
   *                                                                                                              // 880
   * Quick reference to stored `actual` value for plugin developers.                                              // 881
   *                                                                                                              // 882
   * @api private                                                                                                 // 883
   */                                                                                                             // 884
                                                                                                                  // 885
  Object.defineProperty(Assertion.prototype, '_obj',                                                              // 886
    { get: function () {                                                                                          // 887
        return flag(this, 'object');                                                                              // 888
      }                                                                                                           // 889
    , set: function (val) {                                                                                       // 890
        flag(this, 'object', val);                                                                                // 891
      }                                                                                                           // 892
  });                                                                                                             // 893
};                                                                                                                // 894
                                                                                                                  // 895
});                                                                                                               // 896
                                                                                                                  // 897
require.register("chai/lib/chai/config.js", function (exports, module) {                                          // 898
module.exports = {                                                                                                // 899
                                                                                                                  // 900
  /**                                                                                                             // 901
   * ### config.includeStack                                                                                      // 902
   *                                                                                                              // 903
   * User configurable property, influences whether stack trace                                                   // 904
   * is included in Assertion error message. Default of false                                                     // 905
   * suppresses stack trace in the error message.                                                                 // 906
   *                                                                                                              // 907
   *     chai.config.includeStack = true;  // enable stack on error                                               // 908
   *                                                                                                              // 909
   * @param {Boolean}                                                                                             // 910
   * @api public                                                                                                  // 911
   */                                                                                                             // 912
                                                                                                                  // 913
   includeStack: false,                                                                                           // 914
                                                                                                                  // 915
  /**                                                                                                             // 916
   * ### config.showDiff                                                                                          // 917
   *                                                                                                              // 918
   * User configurable property, influences whether or not                                                        // 919
   * the `showDiff` flag should be included in the thrown                                                         // 920
   * AssertionErrors. `false` will always be `false`; `true`                                                      // 921
   * will be true when the assertion has requested a diff                                                         // 922
   * be shown.                                                                                                    // 923
   *                                                                                                              // 924
   * @param {Boolean}                                                                                             // 925
   * @api public                                                                                                  // 926
   */                                                                                                             // 927
                                                                                                                  // 928
  showDiff: true,                                                                                                 // 929
                                                                                                                  // 930
  /**                                                                                                             // 931
   * ### config.truncateThreshold                                                                                 // 932
   *                                                                                                              // 933
   * User configurable property, sets length threshold for actual and                                             // 934
   * expected values in assertion errors. If this threshold is exceeded,                                          // 935
   * the value is truncated.                                                                                      // 936
   *                                                                                                              // 937
   * Set it to zero if you want to disable truncating altogether.                                                 // 938
   *                                                                                                              // 939
   *     chai.config.truncateThreshold = 0;  // disable truncating                                                // 940
   *                                                                                                              // 941
   * @param {Number}                                                                                              // 942
   * @api public                                                                                                  // 943
   */                                                                                                             // 944
                                                                                                                  // 945
  truncateThreshold: 40                                                                                           // 946
                                                                                                                  // 947
};                                                                                                                // 948
                                                                                                                  // 949
});                                                                                                               // 950
                                                                                                                  // 951
require.register("chai/lib/chai/core/assertions.js", function (exports, module) {                                 // 952
/*!                                                                                                               // 953
 * chai                                                                                                           // 954
 * http://chaijs.com                                                                                              // 955
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 956
 * MIT Licensed                                                                                                   // 957
 */                                                                                                               // 958
                                                                                                                  // 959
module.exports = function (chai, _) {                                                                             // 960
  var Assertion = chai.Assertion                                                                                  // 961
    , toString = Object.prototype.toString                                                                        // 962
    , flag = _.flag;                                                                                              // 963
                                                                                                                  // 964
  /**                                                                                                             // 965
   * ### Language Chains                                                                                          // 966
   *                                                                                                              // 967
   * The following are provided as chainable getters to                                                           // 968
   * improve the readability of your assertions. They                                                             // 969
   * do not provide testing capabilities unless they                                                              // 970
   * have been overwritten by a plugin.                                                                           // 971
   *                                                                                                              // 972
   * **Chains**                                                                                                   // 973
   *                                                                                                              // 974
   * - to                                                                                                         // 975
   * - be                                                                                                         // 976
   * - been                                                                                                       // 977
   * - is                                                                                                         // 978
   * - that                                                                                                       // 979
   * - which                                                                                                      // 980
   * - and                                                                                                        // 981
   * - has                                                                                                        // 982
   * - have                                                                                                       // 983
   * - with                                                                                                       // 984
   * - at                                                                                                         // 985
   * - of                                                                                                         // 986
   * - same                                                                                                       // 987
   *                                                                                                              // 988
   * @name language chains                                                                                        // 989
   * @api public                                                                                                  // 990
   */                                                                                                             // 991
                                                                                                                  // 992
  [ 'to', 'be', 'been'                                                                                            // 993
  , 'is', 'and', 'has', 'have'                                                                                    // 994
  , 'with', 'that', 'which', 'at'                                                                                 // 995
  , 'of', 'same' ].forEach(function (chain) {                                                                     // 996
    Assertion.addProperty(chain, function () {                                                                    // 997
      return this;                                                                                                // 998
    });                                                                                                           // 999
  });                                                                                                             // 1000
                                                                                                                  // 1001
  /**                                                                                                             // 1002
   * ### .not                                                                                                     // 1003
   *                                                                                                              // 1004
   * Negates any of assertions following in the chain.                                                            // 1005
   *                                                                                                              // 1006
   *     expect(foo).to.not.equal('bar');                                                                         // 1007
   *     expect(goodFn).to.not.throw(Error);                                                                      // 1008
   *     expect({ foo: 'baz' }).to.have.property('foo')                                                           // 1009
   *       .and.not.equal('bar');                                                                                 // 1010
   *                                                                                                              // 1011
   * @name not                                                                                                    // 1012
   * @api public                                                                                                  // 1013
   */                                                                                                             // 1014
                                                                                                                  // 1015
  Assertion.addProperty('not', function () {                                                                      // 1016
    flag(this, 'negate', true);                                                                                   // 1017
  });                                                                                                             // 1018
                                                                                                                  // 1019
  /**                                                                                                             // 1020
   * ### .deep                                                                                                    // 1021
   *                                                                                                              // 1022
   * Sets the `deep` flag, later used by the `equal` and                                                          // 1023
   * `property` assertions.                                                                                       // 1024
   *                                                                                                              // 1025
   *     expect(foo).to.deep.equal({ bar: 'baz' });                                                               // 1026
   *     expect({ foo: { bar: { baz: 'quux' } } })                                                                // 1027
   *       .to.have.deep.property('foo.bar.baz', 'quux');                                                         // 1028
   *                                                                                                              // 1029
   * @name deep                                                                                                   // 1030
   * @api public                                                                                                  // 1031
   */                                                                                                             // 1032
                                                                                                                  // 1033
  Assertion.addProperty('deep', function () {                                                                     // 1034
    flag(this, 'deep', true);                                                                                     // 1035
  });                                                                                                             // 1036
                                                                                                                  // 1037
  /**                                                                                                             // 1038
   * ### .any                                                                                                     // 1039
   *                                                                                                              // 1040
   * Sets the `any` flag, (opposite of the `all` flag)                                                            // 1041
   * later used in the `keys` assertion.                                                                          // 1042
   *                                                                                                              // 1043
   *     expect(foo).to.have.any.keys('bar', 'baz');                                                              // 1044
   *                                                                                                              // 1045
   * @name any                                                                                                    // 1046
   * @api public                                                                                                  // 1047
   */                                                                                                             // 1048
                                                                                                                  // 1049
  Assertion.addProperty('any', function () {                                                                      // 1050
    flag(this, 'any', true);                                                                                      // 1051
    flag(this, 'all', false)                                                                                      // 1052
  });                                                                                                             // 1053
                                                                                                                  // 1054
                                                                                                                  // 1055
  /**                                                                                                             // 1056
   * ### .all                                                                                                     // 1057
   *                                                                                                              // 1058
   * Sets the `all` flag (opposite of the `any` flag)                                                             // 1059
   * later used by the `keys` assertion.                                                                          // 1060
   *                                                                                                              // 1061
   *     expect(foo).to.have.all.keys('bar', 'baz');                                                              // 1062
   *                                                                                                              // 1063
   * @name all                                                                                                    // 1064
   * @api public                                                                                                  // 1065
   */                                                                                                             // 1066
                                                                                                                  // 1067
  Assertion.addProperty('all', function () {                                                                      // 1068
    flag(this, 'all', true);                                                                                      // 1069
    flag(this, 'any', false);                                                                                     // 1070
  });                                                                                                             // 1071
                                                                                                                  // 1072
  /**                                                                                                             // 1073
   * ### .a(type)                                                                                                 // 1074
   *                                                                                                              // 1075
   * The `a` and `an` assertions are aliases that can be                                                          // 1076
   * used either as language chains or to assert a value's                                                        // 1077
   * type.                                                                                                        // 1078
   *                                                                                                              // 1079
   *     // typeof                                                                                                // 1080
   *     expect('test').to.be.a('string');                                                                        // 1081
   *     expect({ foo: 'bar' }).to.be.an('object');                                                               // 1082
   *     expect(null).to.be.a('null');                                                                            // 1083
   *     expect(undefined).to.be.an('undefined');                                                                 // 1084
   *                                                                                                              // 1085
   *     // language chain                                                                                        // 1086
   *     expect(foo).to.be.an.instanceof(Foo);                                                                    // 1087
   *                                                                                                              // 1088
   * @name a                                                                                                      // 1089
   * @alias an                                                                                                    // 1090
   * @param {String} type                                                                                         // 1091
   * @param {String} message _optional_                                                                           // 1092
   * @api public                                                                                                  // 1093
   */                                                                                                             // 1094
                                                                                                                  // 1095
  function an (type, msg) {                                                                                       // 1096
    if (msg) flag(this, 'message', msg);                                                                          // 1097
    type = type.toLowerCase();                                                                                    // 1098
    var obj = flag(this, 'object')                                                                                // 1099
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';                            // 1100
                                                                                                                  // 1101
    this.assert(                                                                                                  // 1102
        type === _.type(obj)                                                                                      // 1103
      , 'expected #{this} to be ' + article + type                                                                // 1104
      , 'expected #{this} not to be ' + article + type                                                            // 1105
    );                                                                                                            // 1106
  }                                                                                                               // 1107
                                                                                                                  // 1108
  Assertion.addChainableMethod('an', an);                                                                         // 1109
  Assertion.addChainableMethod('a', an);                                                                          // 1110
                                                                                                                  // 1111
  /**                                                                                                             // 1112
   * ### .include(value)                                                                                          // 1113
   *                                                                                                              // 1114
   * The `include` and `contain` assertions can be used as either property                                        // 1115
   * based language chains or as methods to assert the inclusion of an object                                     // 1116
   * in an array or a substring in a string. When used as language chains,                                        // 1117
   * they toggle the `contains` flag for the `keys` assertion.                                                    // 1118
   *                                                                                                              // 1119
   *     expect([1,2,3]).to.include(2);                                                                           // 1120
   *     expect('foobar').to.contain('foo');                                                                      // 1121
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');                                        // 1122
   *                                                                                                              // 1123
   * @name include                                                                                                // 1124
   * @alias contain                                                                                               // 1125
   * @alias includes                                                                                              // 1126
   * @alias contains                                                                                              // 1127
   * @param {Object|String|Number} obj                                                                            // 1128
   * @param {String} message _optional_                                                                           // 1129
   * @api public                                                                                                  // 1130
   */                                                                                                             // 1131
                                                                                                                  // 1132
  function includeChainingBehavior () {                                                                           // 1133
    flag(this, 'contains', true);                                                                                 // 1134
  }                                                                                                               // 1135
                                                                                                                  // 1136
  function include (val, msg) {                                                                                   // 1137
    if (msg) flag(this, 'message', msg);                                                                          // 1138
    var obj = flag(this, 'object');                                                                               // 1139
    var expected = false;                                                                                         // 1140
    if (_.type(obj) === 'array' && _.type(val) === 'object') {                                                    // 1141
      for (var i in obj) {                                                                                        // 1142
        if (_.eql(obj[i], val)) {                                                                                 // 1143
          expected = true;                                                                                        // 1144
          break;                                                                                                  // 1145
        }                                                                                                         // 1146
      }                                                                                                           // 1147
    } else if (_.type(val) === 'object') {                                                                        // 1148
      if (!flag(this, 'negate')) {                                                                                // 1149
        for (var k in val) new Assertion(obj).property(k, val[k]);                                                // 1150
        return;                                                                                                   // 1151
      }                                                                                                           // 1152
      var subset = {};                                                                                            // 1153
      for (var k in val) subset[k] = obj[k];                                                                      // 1154
      expected = _.eql(subset, val);                                                                              // 1155
    } else {                                                                                                      // 1156
      expected = obj && ~obj.indexOf(val);                                                                        // 1157
    }                                                                                                             // 1158
    this.assert(                                                                                                  // 1159
        expected                                                                                                  // 1160
      , 'expected #{this} to include ' + _.inspect(val)                                                           // 1161
      , 'expected #{this} to not include ' + _.inspect(val));                                                     // 1162
  }                                                                                                               // 1163
                                                                                                                  // 1164
  Assertion.addChainableMethod('include', include, includeChainingBehavior);                                      // 1165
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);                                      // 1166
  Assertion.addChainableMethod('contains', include, includeChainingBehavior);                                     // 1167
  Assertion.addChainableMethod('includes', include, includeChainingBehavior);                                     // 1168
                                                                                                                  // 1169
  /**                                                                                                             // 1170
   * ### .ok                                                                                                      // 1171
   *                                                                                                              // 1172
   * Asserts that the target is truthy.                                                                           // 1173
   *                                                                                                              // 1174
   *     expect('everthing').to.be.ok;                                                                            // 1175
   *     expect(1).to.be.ok;                                                                                      // 1176
   *     expect(false).to.not.be.ok;                                                                              // 1177
   *     expect(undefined).to.not.be.ok;                                                                          // 1178
   *     expect(null).to.not.be.ok;                                                                               // 1179
   *                                                                                                              // 1180
   * @name ok                                                                                                     // 1181
   * @api public                                                                                                  // 1182
   */                                                                                                             // 1183
                                                                                                                  // 1184
  Assertion.addProperty('ok', function () {                                                                       // 1185
    this.assert(                                                                                                  // 1186
        flag(this, 'object')                                                                                      // 1187
      , 'expected #{this} to be truthy'                                                                           // 1188
      , 'expected #{this} to be falsy');                                                                          // 1189
  });                                                                                                             // 1190
                                                                                                                  // 1191
  /**                                                                                                             // 1192
   * ### .true                                                                                                    // 1193
   *                                                                                                              // 1194
   * Asserts that the target is `true`.                                                                           // 1195
   *                                                                                                              // 1196
   *     expect(true).to.be.true;                                                                                 // 1197
   *     expect(1).to.not.be.true;                                                                                // 1198
   *                                                                                                              // 1199
   * @name true                                                                                                   // 1200
   * @api public                                                                                                  // 1201
   */                                                                                                             // 1202
                                                                                                                  // 1203
  Assertion.addProperty('true', function () {                                                                     // 1204
    this.assert(                                                                                                  // 1205
        true === flag(this, 'object')                                                                             // 1206
      , 'expected #{this} to be true'                                                                             // 1207
      , 'expected #{this} to be false'                                                                            // 1208
      , this.negate ? false : true                                                                                // 1209
    );                                                                                                            // 1210
  });                                                                                                             // 1211
                                                                                                                  // 1212
  /**                                                                                                             // 1213
   * ### .false                                                                                                   // 1214
   *                                                                                                              // 1215
   * Asserts that the target is `false`.                                                                          // 1216
   *                                                                                                              // 1217
   *     expect(false).to.be.false;                                                                               // 1218
   *     expect(0).to.not.be.false;                                                                               // 1219
   *                                                                                                              // 1220
   * @name false                                                                                                  // 1221
   * @api public                                                                                                  // 1222
   */                                                                                                             // 1223
                                                                                                                  // 1224
  Assertion.addProperty('false', function () {                                                                    // 1225
    this.assert(                                                                                                  // 1226
        false === flag(this, 'object')                                                                            // 1227
      , 'expected #{this} to be false'                                                                            // 1228
      , 'expected #{this} to be true'                                                                             // 1229
      , this.negate ? true : false                                                                                // 1230
    );                                                                                                            // 1231
  });                                                                                                             // 1232
                                                                                                                  // 1233
  /**                                                                                                             // 1234
   * ### .null                                                                                                    // 1235
   *                                                                                                              // 1236
   * Asserts that the target is `null`.                                                                           // 1237
   *                                                                                                              // 1238
   *     expect(null).to.be.null;                                                                                 // 1239
   *     expect(undefined).not.to.be.null;                                                                        // 1240
   *                                                                                                              // 1241
   * @name null                                                                                                   // 1242
   * @api public                                                                                                  // 1243
   */                                                                                                             // 1244
                                                                                                                  // 1245
  Assertion.addProperty('null', function () {                                                                     // 1246
    this.assert(                                                                                                  // 1247
        null === flag(this, 'object')                                                                             // 1248
      , 'expected #{this} to be null'                                                                             // 1249
      , 'expected #{this} not to be null'                                                                         // 1250
    );                                                                                                            // 1251
  });                                                                                                             // 1252
                                                                                                                  // 1253
  /**                                                                                                             // 1254
   * ### .undefined                                                                                               // 1255
   *                                                                                                              // 1256
   * Asserts that the target is `undefined`.                                                                      // 1257
   *                                                                                                              // 1258
   *     expect(undefined).to.be.undefined;                                                                       // 1259
   *     expect(null).to.not.be.undefined;                                                                        // 1260
   *                                                                                                              // 1261
   * @name undefined                                                                                              // 1262
   * @api public                                                                                                  // 1263
   */                                                                                                             // 1264
                                                                                                                  // 1265
  Assertion.addProperty('undefined', function () {                                                                // 1266
    this.assert(                                                                                                  // 1267
        undefined === flag(this, 'object')                                                                        // 1268
      , 'expected #{this} to be undefined'                                                                        // 1269
      , 'expected #{this} not to be undefined'                                                                    // 1270
    );                                                                                                            // 1271
  });                                                                                                             // 1272
                                                                                                                  // 1273
  /**                                                                                                             // 1274
   * ### .exist                                                                                                   // 1275
   *                                                                                                              // 1276
   * Asserts that the target is neither `null` nor `undefined`.                                                   // 1277
   *                                                                                                              // 1278
   *     var foo = 'hi'                                                                                           // 1279
   *       , bar = null                                                                                           // 1280
   *       , baz;                                                                                                 // 1281
   *                                                                                                              // 1282
   *     expect(foo).to.exist;                                                                                    // 1283
   *     expect(bar).to.not.exist;                                                                                // 1284
   *     expect(baz).to.not.exist;                                                                                // 1285
   *                                                                                                              // 1286
   * @name exist                                                                                                  // 1287
   * @api public                                                                                                  // 1288
   */                                                                                                             // 1289
                                                                                                                  // 1290
  Assertion.addProperty('exist', function () {                                                                    // 1291
    this.assert(                                                                                                  // 1292
        null != flag(this, 'object')                                                                              // 1293
      , 'expected #{this} to exist'                                                                               // 1294
      , 'expected #{this} to not exist'                                                                           // 1295
    );                                                                                                            // 1296
  });                                                                                                             // 1297
                                                                                                                  // 1298
                                                                                                                  // 1299
  /**                                                                                                             // 1300
   * ### .empty                                                                                                   // 1301
   *                                                                                                              // 1302
   * Asserts that the target's length is `0`. For arrays, it checks                                               // 1303
   * the `length` property. For objects, it gets the count of                                                     // 1304
   * enumerable keys.                                                                                             // 1305
   *                                                                                                              // 1306
   *     expect([]).to.be.empty;                                                                                  // 1307
   *     expect('').to.be.empty;                                                                                  // 1308
   *     expect({}).to.be.empty;                                                                                  // 1309
   *                                                                                                              // 1310
   * @name empty                                                                                                  // 1311
   * @api public                                                                                                  // 1312
   */                                                                                                             // 1313
                                                                                                                  // 1314
  Assertion.addProperty('empty', function () {                                                                    // 1315
    var obj = flag(this, 'object')                                                                                // 1316
      , expected = obj;                                                                                           // 1317
                                                                                                                  // 1318
    if (Array.isArray(obj) || 'string' === typeof object) {                                                       // 1319
      expected = obj.length;                                                                                      // 1320
    } else if (typeof obj === 'object') {                                                                         // 1321
      expected = Object.keys(obj).length;                                                                         // 1322
    }                                                                                                             // 1323
                                                                                                                  // 1324
    this.assert(                                                                                                  // 1325
        !expected                                                                                                 // 1326
      , 'expected #{this} to be empty'                                                                            // 1327
      , 'expected #{this} not to be empty'                                                                        // 1328
    );                                                                                                            // 1329
  });                                                                                                             // 1330
                                                                                                                  // 1331
  /**                                                                                                             // 1332
   * ### .arguments                                                                                               // 1333
   *                                                                                                              // 1334
   * Asserts that the target is an arguments object.                                                              // 1335
   *                                                                                                              // 1336
   *     function test () {                                                                                       // 1337
   *       expect(arguments).to.be.arguments;                                                                     // 1338
   *     }                                                                                                        // 1339
   *                                                                                                              // 1340
   * @name arguments                                                                                              // 1341
   * @alias Arguments                                                                                             // 1342
   * @api public                                                                                                  // 1343
   */                                                                                                             // 1344
                                                                                                                  // 1345
  function checkArguments () {                                                                                    // 1346
    var obj = flag(this, 'object')                                                                                // 1347
      , type = Object.prototype.toString.call(obj);                                                               // 1348
    this.assert(                                                                                                  // 1349
        '[object Arguments]' === type                                                                             // 1350
      , 'expected #{this} to be arguments but got ' + type                                                        // 1351
      , 'expected #{this} to not be arguments'                                                                    // 1352
    );                                                                                                            // 1353
  }                                                                                                               // 1354
                                                                                                                  // 1355
  Assertion.addProperty('arguments', checkArguments);                                                             // 1356
  Assertion.addProperty('Arguments', checkArguments);                                                             // 1357
                                                                                                                  // 1358
  /**                                                                                                             // 1359
   * ### .equal(value)                                                                                            // 1360
   *                                                                                                              // 1361
   * Asserts that the target is strictly equal (`===`) to `value`.                                                // 1362
   * Alternately, if the `deep` flag is set, asserts that                                                         // 1363
   * the target is deeply equal to `value`.                                                                       // 1364
   *                                                                                                              // 1365
   *     expect('hello').to.equal('hello');                                                                       // 1366
   *     expect(42).to.equal(42);                                                                                 // 1367
   *     expect(1).to.not.equal(true);                                                                            // 1368
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });                                                     // 1369
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });                                                    // 1370
   *                                                                                                              // 1371
   * @name equal                                                                                                  // 1372
   * @alias equals                                                                                                // 1373
   * @alias eq                                                                                                    // 1374
   * @alias deep.equal                                                                                            // 1375
   * @param {Mixed} value                                                                                         // 1376
   * @param {String} message _optional_                                                                           // 1377
   * @api public                                                                                                  // 1378
   */                                                                                                             // 1379
                                                                                                                  // 1380
  function assertEqual (val, msg) {                                                                               // 1381
    if (msg) flag(this, 'message', msg);                                                                          // 1382
    var obj = flag(this, 'object');                                                                               // 1383
    if (flag(this, 'deep')) {                                                                                     // 1384
      return this.eql(val);                                                                                       // 1385
    } else {                                                                                                      // 1386
      this.assert(                                                                                                // 1387
          val === obj                                                                                             // 1388
        , 'expected #{this} to equal #{exp}'                                                                      // 1389
        , 'expected #{this} to not equal #{exp}'                                                                  // 1390
        , val                                                                                                     // 1391
        , this._obj                                                                                               // 1392
        , true                                                                                                    // 1393
      );                                                                                                          // 1394
    }                                                                                                             // 1395
  }                                                                                                               // 1396
                                                                                                                  // 1397
  Assertion.addMethod('equal', assertEqual);                                                                      // 1398
  Assertion.addMethod('equals', assertEqual);                                                                     // 1399
  Assertion.addMethod('eq', assertEqual);                                                                         // 1400
                                                                                                                  // 1401
  /**                                                                                                             // 1402
   * ### .eql(value)                                                                                              // 1403
   *                                                                                                              // 1404
   * Asserts that the target is deeply equal to `value`.                                                          // 1405
   *                                                                                                              // 1406
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });                                                           // 1407
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);                                                                 // 1408
   *                                                                                                              // 1409
   * @name eql                                                                                                    // 1410
   * @alias eqls                                                                                                  // 1411
   * @param {Mixed} value                                                                                         // 1412
   * @param {String} message _optional_                                                                           // 1413
   * @api public                                                                                                  // 1414
   */                                                                                                             // 1415
                                                                                                                  // 1416
  function assertEql(obj, msg) {                                                                                  // 1417
    if (msg) flag(this, 'message', msg);                                                                          // 1418
    this.assert(                                                                                                  // 1419
        _.eql(obj, flag(this, 'object'))                                                                          // 1420
      , 'expected #{this} to deeply equal #{exp}'                                                                 // 1421
      , 'expected #{this} to not deeply equal #{exp}'                                                             // 1422
      , obj                                                                                                       // 1423
      , this._obj                                                                                                 // 1424
      , true                                                                                                      // 1425
    );                                                                                                            // 1426
  }                                                                                                               // 1427
                                                                                                                  // 1428
  Assertion.addMethod('eql', assertEql);                                                                          // 1429
  Assertion.addMethod('eqls', assertEql);                                                                         // 1430
                                                                                                                  // 1431
  /**                                                                                                             // 1432
   * ### .above(value)                                                                                            // 1433
   *                                                                                                              // 1434
   * Asserts that the target is greater than `value`.                                                             // 1435
   *                                                                                                              // 1436
   *     expect(10).to.be.above(5);                                                                               // 1437
   *                                                                                                              // 1438
   * Can also be used in conjunction with `length` to                                                             // 1439
   * assert a minimum length. The benefit being a                                                                 // 1440
   * more informative error message than if the length                                                            // 1441
   * was supplied directly.                                                                                       // 1442
   *                                                                                                              // 1443
   *     expect('foo').to.have.length.above(2);                                                                   // 1444
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);                                                             // 1445
   *                                                                                                              // 1446
   * @name above                                                                                                  // 1447
   * @alias gt                                                                                                    // 1448
   * @alias greaterThan                                                                                           // 1449
   * @param {Number} value                                                                                        // 1450
   * @param {String} message _optional_                                                                           // 1451
   * @api public                                                                                                  // 1452
   */                                                                                                             // 1453
                                                                                                                  // 1454
  function assertAbove (n, msg) {                                                                                 // 1455
    if (msg) flag(this, 'message', msg);                                                                          // 1456
    var obj = flag(this, 'object');                                                                               // 1457
    if (flag(this, 'doLength')) {                                                                                 // 1458
      new Assertion(obj, msg).to.have.property('length');                                                         // 1459
      var len = obj.length;                                                                                       // 1460
      this.assert(                                                                                                // 1461
          len > n                                                                                                 // 1462
        , 'expected #{this} to have a length above #{exp} but got #{act}'                                         // 1463
        , 'expected #{this} to not have a length above #{exp}'                                                    // 1464
        , n                                                                                                       // 1465
        , len                                                                                                     // 1466
      );                                                                                                          // 1467
    } else {                                                                                                      // 1468
      this.assert(                                                                                                // 1469
          obj > n                                                                                                 // 1470
        , 'expected #{this} to be above ' + n                                                                     // 1471
        , 'expected #{this} to be at most ' + n                                                                   // 1472
      );                                                                                                          // 1473
    }                                                                                                             // 1474
  }                                                                                                               // 1475
                                                                                                                  // 1476
  Assertion.addMethod('above', assertAbove);                                                                      // 1477
  Assertion.addMethod('gt', assertAbove);                                                                         // 1478
  Assertion.addMethod('greaterThan', assertAbove);                                                                // 1479
                                                                                                                  // 1480
  /**                                                                                                             // 1481
   * ### .least(value)                                                                                            // 1482
   *                                                                                                              // 1483
   * Asserts that the target is greater than or equal to `value`.                                                 // 1484
   *                                                                                                              // 1485
   *     expect(10).to.be.at.least(10);                                                                           // 1486
   *                                                                                                              // 1487
   * Can also be used in conjunction with `length` to                                                             // 1488
   * assert a minimum length. The benefit being a                                                                 // 1489
   * more informative error message than if the length                                                            // 1490
   * was supplied directly.                                                                                       // 1491
   *                                                                                                              // 1492
   *     expect('foo').to.have.length.of.at.least(2);                                                             // 1493
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);                                                       // 1494
   *                                                                                                              // 1495
   * @name least                                                                                                  // 1496
   * @alias gte                                                                                                   // 1497
   * @param {Number} value                                                                                        // 1498
   * @param {String} message _optional_                                                                           // 1499
   * @api public                                                                                                  // 1500
   */                                                                                                             // 1501
                                                                                                                  // 1502
  function assertLeast (n, msg) {                                                                                 // 1503
    if (msg) flag(this, 'message', msg);                                                                          // 1504
    var obj = flag(this, 'object');                                                                               // 1505
    if (flag(this, 'doLength')) {                                                                                 // 1506
      new Assertion(obj, msg).to.have.property('length');                                                         // 1507
      var len = obj.length;                                                                                       // 1508
      this.assert(                                                                                                // 1509
          len >= n                                                                                                // 1510
        , 'expected #{this} to have a length at least #{exp} but got #{act}'                                      // 1511
        , 'expected #{this} to have a length below #{exp}'                                                        // 1512
        , n                                                                                                       // 1513
        , len                                                                                                     // 1514
      );                                                                                                          // 1515
    } else {                                                                                                      // 1516
      this.assert(                                                                                                // 1517
          obj >= n                                                                                                // 1518
        , 'expected #{this} to be at least ' + n                                                                  // 1519
        , 'expected #{this} to be below ' + n                                                                     // 1520
      );                                                                                                          // 1521
    }                                                                                                             // 1522
  }                                                                                                               // 1523
                                                                                                                  // 1524
  Assertion.addMethod('least', assertLeast);                                                                      // 1525
  Assertion.addMethod('gte', assertLeast);                                                                        // 1526
                                                                                                                  // 1527
  /**                                                                                                             // 1528
   * ### .below(value)                                                                                            // 1529
   *                                                                                                              // 1530
   * Asserts that the target is less than `value`.                                                                // 1531
   *                                                                                                              // 1532
   *     expect(5).to.be.below(10);                                                                               // 1533
   *                                                                                                              // 1534
   * Can also be used in conjunction with `length` to                                                             // 1535
   * assert a maximum length. The benefit being a                                                                 // 1536
   * more informative error message than if the length                                                            // 1537
   * was supplied directly.                                                                                       // 1538
   *                                                                                                              // 1539
   *     expect('foo').to.have.length.below(4);                                                                   // 1540
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);                                                             // 1541
   *                                                                                                              // 1542
   * @name below                                                                                                  // 1543
   * @alias lt                                                                                                    // 1544
   * @alias lessThan                                                                                              // 1545
   * @param {Number} value                                                                                        // 1546
   * @param {String} message _optional_                                                                           // 1547
   * @api public                                                                                                  // 1548
   */                                                                                                             // 1549
                                                                                                                  // 1550
  function assertBelow (n, msg) {                                                                                 // 1551
    if (msg) flag(this, 'message', msg);                                                                          // 1552
    var obj = flag(this, 'object');                                                                               // 1553
    if (flag(this, 'doLength')) {                                                                                 // 1554
      new Assertion(obj, msg).to.have.property('length');                                                         // 1555
      var len = obj.length;                                                                                       // 1556
      this.assert(                                                                                                // 1557
          len < n                                                                                                 // 1558
        , 'expected #{this} to have a length below #{exp} but got #{act}'                                         // 1559
        , 'expected #{this} to not have a length below #{exp}'                                                    // 1560
        , n                                                                                                       // 1561
        , len                                                                                                     // 1562
      );                                                                                                          // 1563
    } else {                                                                                                      // 1564
      this.assert(                                                                                                // 1565
          obj < n                                                                                                 // 1566
        , 'expected #{this} to be below ' + n                                                                     // 1567
        , 'expected #{this} to be at least ' + n                                                                  // 1568
      );                                                                                                          // 1569
    }                                                                                                             // 1570
  }                                                                                                               // 1571
                                                                                                                  // 1572
  Assertion.addMethod('below', assertBelow);                                                                      // 1573
  Assertion.addMethod('lt', assertBelow);                                                                         // 1574
  Assertion.addMethod('lessThan', assertBelow);                                                                   // 1575
                                                                                                                  // 1576
  /**                                                                                                             // 1577
   * ### .most(value)                                                                                             // 1578
   *                                                                                                              // 1579
   * Asserts that the target is less than or equal to `value`.                                                    // 1580
   *                                                                                                              // 1581
   *     expect(5).to.be.at.most(5);                                                                              // 1582
   *                                                                                                              // 1583
   * Can also be used in conjunction with `length` to                                                             // 1584
   * assert a maximum length. The benefit being a                                                                 // 1585
   * more informative error message than if the length                                                            // 1586
   * was supplied directly.                                                                                       // 1587
   *                                                                                                              // 1588
   *     expect('foo').to.have.length.of.at.most(4);                                                              // 1589
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);                                                        // 1590
   *                                                                                                              // 1591
   * @name most                                                                                                   // 1592
   * @alias lte                                                                                                   // 1593
   * @param {Number} value                                                                                        // 1594
   * @param {String} message _optional_                                                                           // 1595
   * @api public                                                                                                  // 1596
   */                                                                                                             // 1597
                                                                                                                  // 1598
  function assertMost (n, msg) {                                                                                  // 1599
    if (msg) flag(this, 'message', msg);                                                                          // 1600
    var obj = flag(this, 'object');                                                                               // 1601
    if (flag(this, 'doLength')) {                                                                                 // 1602
      new Assertion(obj, msg).to.have.property('length');                                                         // 1603
      var len = obj.length;                                                                                       // 1604
      this.assert(                                                                                                // 1605
          len <= n                                                                                                // 1606
        , 'expected #{this} to have a length at most #{exp} but got #{act}'                                       // 1607
        , 'expected #{this} to have a length above #{exp}'                                                        // 1608
        , n                                                                                                       // 1609
        , len                                                                                                     // 1610
      );                                                                                                          // 1611
    } else {                                                                                                      // 1612
      this.assert(                                                                                                // 1613
          obj <= n                                                                                                // 1614
        , 'expected #{this} to be at most ' + n                                                                   // 1615
        , 'expected #{this} to be above ' + n                                                                     // 1616
      );                                                                                                          // 1617
    }                                                                                                             // 1618
  }                                                                                                               // 1619
                                                                                                                  // 1620
  Assertion.addMethod('most', assertMost);                                                                        // 1621
  Assertion.addMethod('lte', assertMost);                                                                         // 1622
                                                                                                                  // 1623
  /**                                                                                                             // 1624
   * ### .within(start, finish)                                                                                   // 1625
   *                                                                                                              // 1626
   * Asserts that the target is within a range.                                                                   // 1627
   *                                                                                                              // 1628
   *     expect(7).to.be.within(5,10);                                                                            // 1629
   *                                                                                                              // 1630
   * Can also be used in conjunction with `length` to                                                             // 1631
   * assert a length range. The benefit being a                                                                   // 1632
   * more informative error message than if the length                                                            // 1633
   * was supplied directly.                                                                                       // 1634
   *                                                                                                              // 1635
   *     expect('foo').to.have.length.within(2,4);                                                                // 1636
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);                                                          // 1637
   *                                                                                                              // 1638
   * @name within                                                                                                 // 1639
   * @param {Number} start lowerbound inclusive                                                                   // 1640
   * @param {Number} finish upperbound inclusive                                                                  // 1641
   * @param {String} message _optional_                                                                           // 1642
   * @api public                                                                                                  // 1643
   */                                                                                                             // 1644
                                                                                                                  // 1645
  Assertion.addMethod('within', function (start, finish, msg) {                                                   // 1646
    if (msg) flag(this, 'message', msg);                                                                          // 1647
    var obj = flag(this, 'object')                                                                                // 1648
      , range = start + '..' + finish;                                                                            // 1649
    if (flag(this, 'doLength')) {                                                                                 // 1650
      new Assertion(obj, msg).to.have.property('length');                                                         // 1651
      var len = obj.length;                                                                                       // 1652
      this.assert(                                                                                                // 1653
          len >= start && len <= finish                                                                           // 1654
        , 'expected #{this} to have a length within ' + range                                                     // 1655
        , 'expected #{this} to not have a length within ' + range                                                 // 1656
      );                                                                                                          // 1657
    } else {                                                                                                      // 1658
      this.assert(                                                                                                // 1659
          obj >= start && obj <= finish                                                                           // 1660
        , 'expected #{this} to be within ' + range                                                                // 1661
        , 'expected #{this} to not be within ' + range                                                            // 1662
      );                                                                                                          // 1663
    }                                                                                                             // 1664
  });                                                                                                             // 1665
                                                                                                                  // 1666
  /**                                                                                                             // 1667
   * ### .instanceof(constructor)                                                                                 // 1668
   *                                                                                                              // 1669
   * Asserts that the target is an instance of `constructor`.                                                     // 1670
   *                                                                                                              // 1671
   *     var Tea = function (name) { this.name = name; }                                                          // 1672
   *       , Chai = new Tea('chai');                                                                              // 1673
   *                                                                                                              // 1674
   *     expect(Chai).to.be.an.instanceof(Tea);                                                                   // 1675
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);                                                             // 1676
   *                                                                                                              // 1677
   * @name instanceof                                                                                             // 1678
   * @param {Constructor} constructor                                                                             // 1679
   * @param {String} message _optional_                                                                           // 1680
   * @alias instanceOf                                                                                            // 1681
   * @api public                                                                                                  // 1682
   */                                                                                                             // 1683
                                                                                                                  // 1684
  function assertInstanceOf (constructor, msg) {                                                                  // 1685
    if (msg) flag(this, 'message', msg);                                                                          // 1686
    var name = _.getName(constructor);                                                                            // 1687
    this.assert(                                                                                                  // 1688
        flag(this, 'object') instanceof constructor                                                               // 1689
      , 'expected #{this} to be an instance of ' + name                                                           // 1690
      , 'expected #{this} to not be an instance of ' + name                                                       // 1691
    );                                                                                                            // 1692
  };                                                                                                              // 1693
                                                                                                                  // 1694
  Assertion.addMethod('instanceof', assertInstanceOf);                                                            // 1695
  Assertion.addMethod('instanceOf', assertInstanceOf);                                                            // 1696
                                                                                                                  // 1697
  /**                                                                                                             // 1698
   * ### .property(name, [value])                                                                                 // 1699
   *                                                                                                              // 1700
   * Asserts that the target has a property `name`, optionally asserting that                                     // 1701
   * the value of that property is strictly equal to  `value`.                                                    // 1702
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep                                    // 1703
   * references into objects and arrays.                                                                          // 1704
   *                                                                                                              // 1705
   *     // simple referencing                                                                                    // 1706
   *     var obj = { foo: 'bar' };                                                                                // 1707
   *     expect(obj).to.have.property('foo');                                                                     // 1708
   *     expect(obj).to.have.property('foo', 'bar');                                                              // 1709
   *                                                                                                              // 1710
   *     // deep referencing                                                                                      // 1711
   *     var deepObj = {                                                                                          // 1712
   *         green: { tea: 'matcha' }                                                                             // 1713
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]                                                       // 1714
   *     };                                                                                                       // 1715
                                                                                                                  // 1716
   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');                                            // 1717
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');                                              // 1718
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');                                         // 1719
   *                                                                                                              // 1720
   * You can also use an array as the starting point of a `deep.property`                                         // 1721
   * assertion, or traverse nested arrays.                                                                        // 1722
   *                                                                                                              // 1723
   *     var arr = [                                                                                              // 1724
   *         [ 'chai', 'matcha', 'konacha' ]                                                                      // 1725
   *       , [ { tea: 'chai' }                                                                                    // 1726
   *         , { tea: 'matcha' }                                                                                  // 1727
   *         , { tea: 'konacha' } ]                                                                               // 1728
   *     ];                                                                                                       // 1729
   *                                                                                                              // 1730
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');                                                   // 1731
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');                                              // 1732
   *                                                                                                              // 1733
   * Furthermore, `property` changes the subject of the assertion                                                 // 1734
   * to be the value of that property from the original object. This                                              // 1735
   * permits for further chainable assertions on that property.                                                   // 1736
   *                                                                                                              // 1737
   *     expect(obj).to.have.property('foo')                                                                      // 1738
   *       .that.is.a('string');                                                                                  // 1739
   *     expect(deepObj).to.have.property('green')                                                                // 1740
   *       .that.is.an('object')                                                                                  // 1741
   *       .that.deep.equals({ tea: 'matcha' });                                                                  // 1742
   *     expect(deepObj).to.have.property('teas')                                                                 // 1743
   *       .that.is.an('array')                                                                                   // 1744
   *       .with.deep.property('[2]')                                                                             // 1745
   *         .that.deep.equals({ tea: 'konacha' });                                                               // 1746
   *                                                                                                              // 1747
   * @name property                                                                                               // 1748
   * @alias deep.property                                                                                         // 1749
   * @param {String} name                                                                                         // 1750
   * @param {Mixed} value (optional)                                                                              // 1751
   * @param {String} message _optional_                                                                           // 1752
   * @returns value of property for chaining                                                                      // 1753
   * @api public                                                                                                  // 1754
   */                                                                                                             // 1755
                                                                                                                  // 1756
  Assertion.addMethod('property', function (name, val, msg) {                                                     // 1757
    if (msg) flag(this, 'message', msg);                                                                          // 1758
                                                                                                                  // 1759
    var isDeep = !!flag(this, 'deep')                                                                             // 1760
      , descriptor = isDeep ? 'deep property ' : 'property '                                                      // 1761
      , negate = flag(this, 'negate')                                                                             // 1762
      , obj = flag(this, 'object')                                                                                // 1763
      , pathInfo = isDeep ? _.getPathInfo(name, obj) : null                                                       // 1764
      , hasProperty = isDeep                                                                                      // 1765
        ? pathInfo.exists                                                                                         // 1766
        : _.hasProperty(name, obj)                                                                                // 1767
      , value = isDeep                                                                                            // 1768
        ? pathInfo.value                                                                                          // 1769
        : obj[name];                                                                                              // 1770
                                                                                                                  // 1771
    if (negate && undefined !== val) {                                                                            // 1772
      if (undefined === value) {                                                                                  // 1773
        msg = (msg != null) ? msg + ': ' : '';                                                                    // 1774
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));                        // 1775
      }                                                                                                           // 1776
    } else {                                                                                                      // 1777
      this.assert(                                                                                                // 1778
          hasProperty                                                                                             // 1779
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)                                            // 1780
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));                                        // 1781
    }                                                                                                             // 1782
                                                                                                                  // 1783
    if (undefined !== val) {                                                                                      // 1784
      this.assert(                                                                                                // 1785
          val === value                                                                                           // 1786
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'             // 1787
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'                         // 1788
        , val                                                                                                     // 1789
        , value                                                                                                   // 1790
      );                                                                                                          // 1791
    }                                                                                                             // 1792
                                                                                                                  // 1793
    flag(this, 'object', value);                                                                                  // 1794
  });                                                                                                             // 1795
                                                                                                                  // 1796
                                                                                                                  // 1797
  /**                                                                                                             // 1798
   * ### .ownProperty(name)                                                                                       // 1799
   *                                                                                                              // 1800
   * Asserts that the target has an own property `name`.                                                          // 1801
   *                                                                                                              // 1802
   *     expect('test').to.have.ownProperty('length');                                                            // 1803
   *                                                                                                              // 1804
   * @name ownProperty                                                                                            // 1805
   * @alias haveOwnProperty                                                                                       // 1806
   * @param {String} name                                                                                         // 1807
   * @param {String} message _optional_                                                                           // 1808
   * @api public                                                                                                  // 1809
   */                                                                                                             // 1810
                                                                                                                  // 1811
  function assertOwnProperty (name, msg) {                                                                        // 1812
    if (msg) flag(this, 'message', msg);                                                                          // 1813
    var obj = flag(this, 'object');                                                                               // 1814
    this.assert(                                                                                                  // 1815
        obj.hasOwnProperty(name)                                                                                  // 1816
      , 'expected #{this} to have own property ' + _.inspect(name)                                                // 1817
      , 'expected #{this} to not have own property ' + _.inspect(name)                                            // 1818
    );                                                                                                            // 1819
  }                                                                                                               // 1820
                                                                                                                  // 1821
  Assertion.addMethod('ownProperty', assertOwnProperty);                                                          // 1822
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);                                                      // 1823
                                                                                                                  // 1824
  /**                                                                                                             // 1825
   * ### .length(value)                                                                                           // 1826
   *                                                                                                              // 1827
   * Asserts that the target's `length` property has                                                              // 1828
   * the expected value.                                                                                          // 1829
   *                                                                                                              // 1830
   *     expect([ 1, 2, 3]).to.have.length(3);                                                                    // 1831
   *     expect('foobar').to.have.length(6);                                                                      // 1832
   *                                                                                                              // 1833
   * Can also be used as a chain precursor to a value                                                             // 1834
   * comparison for the length property.                                                                          // 1835
   *                                                                                                              // 1836
   *     expect('foo').to.have.length.above(2);                                                                   // 1837
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);                                                             // 1838
   *     expect('foo').to.have.length.below(4);                                                                   // 1839
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);                                                             // 1840
   *     expect('foo').to.have.length.within(2,4);                                                                // 1841
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);                                                          // 1842
   *                                                                                                              // 1843
   * @name length                                                                                                 // 1844
   * @alias lengthOf                                                                                              // 1845
   * @param {Number} length                                                                                       // 1846
   * @param {String} message _optional_                                                                           // 1847
   * @api public                                                                                                  // 1848
   */                                                                                                             // 1849
                                                                                                                  // 1850
  function assertLengthChain () {                                                                                 // 1851
    flag(this, 'doLength', true);                                                                                 // 1852
  }                                                                                                               // 1853
                                                                                                                  // 1854
  function assertLength (n, msg) {                                                                                // 1855
    if (msg) flag(this, 'message', msg);                                                                          // 1856
    var obj = flag(this, 'object');                                                                               // 1857
    new Assertion(obj, msg).to.have.property('length');                                                           // 1858
    var len = obj.length;                                                                                         // 1859
                                                                                                                  // 1860
    this.assert(                                                                                                  // 1861
        len == n                                                                                                  // 1862
      , 'expected #{this} to have a length of #{exp} but got #{act}'                                              // 1863
      , 'expected #{this} to not have a length of #{act}'                                                         // 1864
      , n                                                                                                         // 1865
      , len                                                                                                       // 1866
    );                                                                                                            // 1867
  }                                                                                                               // 1868
                                                                                                                  // 1869
  Assertion.addChainableMethod('length', assertLength, assertLengthChain);                                        // 1870
  Assertion.addMethod('lengthOf', assertLength);                                                                  // 1871
                                                                                                                  // 1872
  /**                                                                                                             // 1873
   * ### .match(regexp)                                                                                           // 1874
   *                                                                                                              // 1875
   * Asserts that the target matches a regular expression.                                                        // 1876
   *                                                                                                              // 1877
   *     expect('foobar').to.match(/^foo/);                                                                       // 1878
   *                                                                                                              // 1879
   * @name match                                                                                                  // 1880
   * @param {RegExp} RegularExpression                                                                            // 1881
   * @param {String} message _optional_                                                                           // 1882
   * @api public                                                                                                  // 1883
   */                                                                                                             // 1884
                                                                                                                  // 1885
  Assertion.addMethod('match', function (re, msg) {                                                               // 1886
    if (msg) flag(this, 'message', msg);                                                                          // 1887
    var obj = flag(this, 'object');                                                                               // 1888
    this.assert(                                                                                                  // 1889
        re.exec(obj)                                                                                              // 1890
      , 'expected #{this} to match ' + re                                                                         // 1891
      , 'expected #{this} not to match ' + re                                                                     // 1892
    );                                                                                                            // 1893
  });                                                                                                             // 1894
                                                                                                                  // 1895
  /**                                                                                                             // 1896
   * ### .string(string)                                                                                          // 1897
   *                                                                                                              // 1898
   * Asserts that the string target contains another string.                                                      // 1899
   *                                                                                                              // 1900
   *     expect('foobar').to.have.string('bar');                                                                  // 1901
   *                                                                                                              // 1902
   * @name string                                                                                                 // 1903
   * @param {String} string                                                                                       // 1904
   * @param {String} message _optional_                                                                           // 1905
   * @api public                                                                                                  // 1906
   */                                                                                                             // 1907
                                                                                                                  // 1908
  Assertion.addMethod('string', function (str, msg) {                                                             // 1909
    if (msg) flag(this, 'message', msg);                                                                          // 1910
    var obj = flag(this, 'object');                                                                               // 1911
    new Assertion(obj, msg).is.a('string');                                                                       // 1912
                                                                                                                  // 1913
    this.assert(                                                                                                  // 1914
        ~obj.indexOf(str)                                                                                         // 1915
      , 'expected #{this} to contain ' + _.inspect(str)                                                           // 1916
      , 'expected #{this} to not contain ' + _.inspect(str)                                                       // 1917
    );                                                                                                            // 1918
  });                                                                                                             // 1919
                                                                                                                  // 1920
                                                                                                                  // 1921
  /**                                                                                                             // 1922
   * ### .keys(key1, [key2], [...])                                                                               // 1923
   *                                                                                                              // 1924
   * Asserts that the target contains any or all of the passed-in keys.                                           // 1925
   * Use in combination with `any`, `all`, `contains`, or `have` will affect                                      // 1926
   * what will pass.                                                                                              // 1927
   *                                                                                                              // 1928
   * When used in conjunction with `any`, at least one key that is passed                                         // 1929
   * in must exist in the target object. This is regardless whether or not                                        // 1930
   * the `have` or `contain` qualifiers are used. Note, either `any` or `all`                                     // 1931
   * should be used in the assertion. If neither are used, the assertion is                                       // 1932
   * defaulted to `all`.                                                                                          // 1933
   *                                                                                                              // 1934
   * When both `all` and `contain` are used, the target object must have at                                       // 1935
   * least all of the passed-in keys but may have more keys not listed.                                           // 1936
   *                                                                                                              // 1937
   * When both `all` and `have` are used, the target object must both contain                                     // 1938
   * all of the passed-in keys AND the number of keys in the target object must                                   // 1939
   * match the number of keys passed in (in other words, a target object must                                     // 1940
   * have all and only all of the passed-in keys).                                                                // 1941
   *                                                                                                              // 1942
   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo', 'baz');                                               // 1943
   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo');                                                      // 1944
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys('bar', 'baz');                                            // 1945
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys(['foo']);                                                 // 1946
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys({'foo': 6});                                              // 1947
   *     expect({ foo: 1, bar: 2 }).to.have.all.keys(['bar', 'foo']);                                             // 1948
   *     expect({ foo: 1, bar: 2 }).to.have.all.keys({'bar': 6, 'foo', 7});                                       // 1949
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys(['bar', 'foo']);                                  // 1950
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys([{'bar': 6}}]);                                   // 1951
   *                                                                                                              // 1952
   *                                                                                                              // 1953
   * @name keys                                                                                                   // 1954
   * @alias key                                                                                                   // 1955
   * @param {String...|Array|Object} keys                                                                         // 1956
   * @api public                                                                                                  // 1957
   */                                                                                                             // 1958
                                                                                                                  // 1959
  function assertKeys (keys) {                                                                                    // 1960
    var obj = flag(this, 'object')                                                                                // 1961
      , str                                                                                                       // 1962
      , ok = true                                                                                                 // 1963
      , mixedArgsMsg = 'keys must be given single argument of Array|Object|String, or multiple String arguments'; // 1964
                                                                                                                  // 1965
    switch (_.type(keys)) {                                                                                       // 1966
      case "array":                                                                                               // 1967
        if (arguments.length > 1) throw (new Error(mixedArgsMsg));                                                // 1968
        break;                                                                                                    // 1969
      case "object":                                                                                              // 1970
        if (arguments.length > 1) throw (new Error(mixedArgsMsg));                                                // 1971
        keys = Object.keys(keys);                                                                                 // 1972
        break;                                                                                                    // 1973
      default:                                                                                                    // 1974
        keys = Array.prototype.slice.call(arguments);                                                             // 1975
    }                                                                                                             // 1976
                                                                                                                  // 1977
    if (!keys.length) throw new Error('keys required');                                                           // 1978
                                                                                                                  // 1979
    var actual = Object.keys(obj)                                                                                 // 1980
      , expected = keys                                                                                           // 1981
      , len = keys.length                                                                                         // 1982
      , any = flag(this, 'any')                                                                                   // 1983
      , all = flag(this, 'all');                                                                                  // 1984
                                                                                                                  // 1985
    if (!any && !all) {                                                                                           // 1986
      all = true;                                                                                                 // 1987
    }                                                                                                             // 1988
                                                                                                                  // 1989
    // Has any                                                                                                    // 1990
    if (any) {                                                                                                    // 1991
      var intersection = expected.filter(function(key) {                                                          // 1992
        return ~actual.indexOf(key);                                                                              // 1993
      });                                                                                                         // 1994
      ok = intersection.length > 0;                                                                               // 1995
    }                                                                                                             // 1996
                                                                                                                  // 1997
    // Has all                                                                                                    // 1998
    if (all) {                                                                                                    // 1999
      ok = keys.every(function(key){                                                                              // 2000
        return ~actual.indexOf(key);                                                                              // 2001
      });                                                                                                         // 2002
      if (!flag(this, 'negate') && !flag(this, 'contains')) {                                                     // 2003
        ok = ok && keys.length == actual.length;                                                                  // 2004
      }                                                                                                           // 2005
    }                                                                                                             // 2006
                                                                                                                  // 2007
    // Key string                                                                                                 // 2008
    if (len > 1) {                                                                                                // 2009
      keys = keys.map(function(key){                                                                              // 2010
        return _.inspect(key);                                                                                    // 2011
      });                                                                                                         // 2012
      var last = keys.pop();                                                                                      // 2013
      if (all) {                                                                                                  // 2014
        str = keys.join(', ') + ', and ' + last;                                                                  // 2015
      }                                                                                                           // 2016
      if (any) {                                                                                                  // 2017
        str = keys.join(', ') + ', or ' + last;                                                                   // 2018
      }                                                                                                           // 2019
    } else {                                                                                                      // 2020
      str = _.inspect(keys[0]);                                                                                   // 2021
    }                                                                                                             // 2022
                                                                                                                  // 2023
    // Form                                                                                                       // 2024
    str = (len > 1 ? 'keys ' : 'key ') + str;                                                                     // 2025
                                                                                                                  // 2026
    // Have / include                                                                                             // 2027
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;                                                  // 2028
                                                                                                                  // 2029
    // Assertion                                                                                                  // 2030
    this.assert(                                                                                                  // 2031
        ok                                                                                                        // 2032
      , 'expected #{this} to ' + str                                                                              // 2033
      , 'expected #{this} to not ' + str                                                                          // 2034
      , expected.slice(0).sort()                                                                                  // 2035
      , actual.sort()                                                                                             // 2036
      , true                                                                                                      // 2037
    );                                                                                                            // 2038
  }                                                                                                               // 2039
                                                                                                                  // 2040
  Assertion.addMethod('keys', assertKeys);                                                                        // 2041
  Assertion.addMethod('key', assertKeys);                                                                         // 2042
                                                                                                                  // 2043
  /**                                                                                                             // 2044
   * ### .throw(constructor)                                                                                      // 2045
   *                                                                                                              // 2046
   * Asserts that the function target will throw a specific error, or specific type of error                      // 2047
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test                        // 2048
   * for the error's message.                                                                                     // 2049
   *                                                                                                              // 2050
   *     var err = new ReferenceError('This is a bad function.');                                                 // 2051
   *     var fn = function () { throw err; }                                                                      // 2052
   *     expect(fn).to.throw(ReferenceError);                                                                     // 2053
   *     expect(fn).to.throw(Error);                                                                              // 2054
   *     expect(fn).to.throw(/bad function/);                                                                     // 2055
   *     expect(fn).to.not.throw('good function');                                                                // 2056
   *     expect(fn).to.throw(ReferenceError, /bad function/);                                                     // 2057
   *     expect(fn).to.throw(err);                                                                                // 2058
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));                                                // 2059
   *                                                                                                              // 2060
   * Please note that when a throw expectation is negated, it will check each                                     // 2061
   * parameter independently, starting with error constructor type. The appropriate way                           // 2062
   * to check for the existence of a type of error but for a message that does not match                          // 2063
   * is to use `and`.                                                                                             // 2064
   *                                                                                                              // 2065
   *     expect(fn).to.throw(ReferenceError)                                                                      // 2066
   *        .and.not.throw(/good function/);                                                                      // 2067
   *                                                                                                              // 2068
   * @name throw                                                                                                  // 2069
   * @alias throws                                                                                                // 2070
   * @alias Throw                                                                                                 // 2071
   * @param {ErrorConstructor} constructor                                                                        // 2072
   * @param {String|RegExp} expected error message                                                                // 2073
   * @param {String} message _optional_                                                                           // 2074
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types                  // 2075
   * @returns error for chaining (null if no error)                                                               // 2076
   * @api public                                                                                                  // 2077
   */                                                                                                             // 2078
                                                                                                                  // 2079
  function assertThrows (constructor, errMsg, msg) {                                                              // 2080
    if (msg) flag(this, 'message', msg);                                                                          // 2081
    var obj = flag(this, 'object');                                                                               // 2082
    new Assertion(obj, msg).is.a('function');                                                                     // 2083
                                                                                                                  // 2084
    var thrown = false                                                                                            // 2085
      , desiredError = null                                                                                       // 2086
      , name = null                                                                                               // 2087
      , thrownError = null;                                                                                       // 2088
                                                                                                                  // 2089
    if (arguments.length === 0) {                                                                                 // 2090
      errMsg = null;                                                                                              // 2091
      constructor = null;                                                                                         // 2092
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {               // 2093
      errMsg = constructor;                                                                                       // 2094
      constructor = null;                                                                                         // 2095
    } else if (constructor && constructor instanceof Error) {                                                     // 2096
      desiredError = constructor;                                                                                 // 2097
      constructor = null;                                                                                         // 2098
      errMsg = null;                                                                                              // 2099
    } else if (typeof constructor === 'function') {                                                               // 2100
      name = constructor.prototype.name || constructor.name;                                                      // 2101
      if (name === 'Error' && constructor !== Error) {                                                            // 2102
        name = (new constructor()).name;                                                                          // 2103
      }                                                                                                           // 2104
    } else {                                                                                                      // 2105
      constructor = null;                                                                                         // 2106
    }                                                                                                             // 2107
                                                                                                                  // 2108
    try {                                                                                                         // 2109
      obj();                                                                                                      // 2110
    } catch (err) {                                                                                               // 2111
      // first, check desired error                                                                               // 2112
      if (desiredError) {                                                                                         // 2113
        this.assert(                                                                                              // 2114
            err === desiredError                                                                                  // 2115
          , 'expected #{this} to throw #{exp} but #{act} was thrown'                                              // 2116
          , 'expected #{this} to not throw #{exp}'                                                                // 2117
          , (desiredError instanceof Error ? desiredError.toString() : desiredError)                              // 2118
          , (err instanceof Error ? err.toString() : err)                                                         // 2119
        );                                                                                                        // 2120
                                                                                                                  // 2121
        flag(this, 'object', err);                                                                                // 2122
        return this;                                                                                              // 2123
      }                                                                                                           // 2124
                                                                                                                  // 2125
      // next, check constructor                                                                                  // 2126
      if (constructor) {                                                                                          // 2127
        this.assert(                                                                                              // 2128
            err instanceof constructor                                                                            // 2129
          , 'expected #{this} to throw #{exp} but #{act} was thrown'                                              // 2130
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'                                          // 2131
          , name                                                                                                  // 2132
          , (err instanceof Error ? err.toString() : err)                                                         // 2133
        );                                                                                                        // 2134
                                                                                                                  // 2135
        if (!errMsg) {                                                                                            // 2136
          flag(this, 'object', err);                                                                              // 2137
          return this;                                                                                            // 2138
        }                                                                                                         // 2139
      }                                                                                                           // 2140
                                                                                                                  // 2141
      // next, check message                                                                                      // 2142
      var message = 'object' === _.type(err) && "message" in err                                                  // 2143
        ? err.message                                                                                             // 2144
        : '' + err;                                                                                               // 2145
                                                                                                                  // 2146
      if ((message != null) && errMsg && errMsg instanceof RegExp) {                                              // 2147
        this.assert(                                                                                              // 2148
            errMsg.exec(message)                                                                                  // 2149
          , 'expected #{this} to throw error matching #{exp} but got #{act}'                                      // 2150
          , 'expected #{this} to throw error not matching #{exp}'                                                 // 2151
          , errMsg                                                                                                // 2152
          , message                                                                                               // 2153
        );                                                                                                        // 2154
                                                                                                                  // 2155
        flag(this, 'object', err);                                                                                // 2156
        return this;                                                                                              // 2157
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {                                     // 2158
        this.assert(                                                                                              // 2159
            ~message.indexOf(errMsg)                                                                              // 2160
          , 'expected #{this} to throw error including #{exp} but got #{act}'                                     // 2161
          , 'expected #{this} to throw error not including #{act}'                                                // 2162
          , errMsg                                                                                                // 2163
          , message                                                                                               // 2164
        );                                                                                                        // 2165
                                                                                                                  // 2166
        flag(this, 'object', err);                                                                                // 2167
        return this;                                                                                              // 2168
      } else {                                                                                                    // 2169
        thrown = true;                                                                                            // 2170
        thrownError = err;                                                                                        // 2171
      }                                                                                                           // 2172
    }                                                                                                             // 2173
                                                                                                                  // 2174
    var actuallyGot = ''                                                                                          // 2175
      , expectedThrown = name !== null                                                                            // 2176
        ? name                                                                                                    // 2177
        : desiredError                                                                                            // 2178
          ? '#{exp}' //_.inspect(desiredError)                                                                    // 2179
          : 'an error';                                                                                           // 2180
                                                                                                                  // 2181
    if (thrown) {                                                                                                 // 2182
      actuallyGot = ' but #{act} was thrown'                                                                      // 2183
    }                                                                                                             // 2184
                                                                                                                  // 2185
    this.assert(                                                                                                  // 2186
        thrown === true                                                                                           // 2187
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot                                               // 2188
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot                                           // 2189
      , (desiredError instanceof Error ? desiredError.toString() : desiredError)                                  // 2190
      , (thrownError instanceof Error ? thrownError.toString() : thrownError)                                     // 2191
    );                                                                                                            // 2192
                                                                                                                  // 2193
    flag(this, 'object', thrownError);                                                                            // 2194
  };                                                                                                              // 2195
                                                                                                                  // 2196
  Assertion.addMethod('throw', assertThrows);                                                                     // 2197
  Assertion.addMethod('throws', assertThrows);                                                                    // 2198
  Assertion.addMethod('Throw', assertThrows);                                                                     // 2199
                                                                                                                  // 2200
  /**                                                                                                             // 2201
   * ### .respondTo(method)                                                                                       // 2202
   *                                                                                                              // 2203
   * Asserts that the object or class target will respond to a method.                                            // 2204
   *                                                                                                              // 2205
   *     Klass.prototype.bar = function(){};                                                                      // 2206
   *     expect(Klass).to.respondTo('bar');                                                                       // 2207
   *     expect(obj).to.respondTo('bar');                                                                         // 2208
   *                                                                                                              // 2209
   * To check if a constructor will respond to a static function,                                                 // 2210
   * set the `itself` flag.                                                                                       // 2211
   *                                                                                                              // 2212
   *     Klass.baz = function(){};                                                                                // 2213
   *     expect(Klass).itself.to.respondTo('baz');                                                                // 2214
   *                                                                                                              // 2215
   * @name respondTo                                                                                              // 2216
   * @param {String} method                                                                                       // 2217
   * @param {String} message _optional_                                                                           // 2218
   * @api public                                                                                                  // 2219
   */                                                                                                             // 2220
                                                                                                                  // 2221
  Assertion.addMethod('respondTo', function (method, msg) {                                                       // 2222
    if (msg) flag(this, 'message', msg);                                                                          // 2223
    var obj = flag(this, 'object')                                                                                // 2224
      , itself = flag(this, 'itself')                                                                             // 2225
      , context = ('function' === _.type(obj) && !itself)                                                         // 2226
        ? obj.prototype[method]                                                                                   // 2227
        : obj[method];                                                                                            // 2228
                                                                                                                  // 2229
    this.assert(                                                                                                  // 2230
        'function' === typeof context                                                                             // 2231
      , 'expected #{this} to respond to ' + _.inspect(method)                                                     // 2232
      , 'expected #{this} to not respond to ' + _.inspect(method)                                                 // 2233
    );                                                                                                            // 2234
  });                                                                                                             // 2235
                                                                                                                  // 2236
  /**                                                                                                             // 2237
   * ### .itself                                                                                                  // 2238
   *                                                                                                              // 2239
   * Sets the `itself` flag, later used by the `respondTo` assertion.                                             // 2240
   *                                                                                                              // 2241
   *     function Foo() {}                                                                                        // 2242
   *     Foo.bar = function() {}                                                                                  // 2243
   *     Foo.prototype.baz = function() {}                                                                        // 2244
   *                                                                                                              // 2245
   *     expect(Foo).itself.to.respondTo('bar');                                                                  // 2246
   *     expect(Foo).itself.not.to.respondTo('baz');                                                              // 2247
   *                                                                                                              // 2248
   * @name itself                                                                                                 // 2249
   * @api public                                                                                                  // 2250
   */                                                                                                             // 2251
                                                                                                                  // 2252
  Assertion.addProperty('itself', function () {                                                                   // 2253
    flag(this, 'itself', true);                                                                                   // 2254
  });                                                                                                             // 2255
                                                                                                                  // 2256
  /**                                                                                                             // 2257
   * ### .satisfy(method)                                                                                         // 2258
   *                                                                                                              // 2259
   * Asserts that the target passes a given truth test.                                                           // 2260
   *                                                                                                              // 2261
   *     expect(1).to.satisfy(function(num) { return num > 0; });                                                 // 2262
   *                                                                                                              // 2263
   * @name satisfy                                                                                                // 2264
   * @param {Function} matcher                                                                                    // 2265
   * @param {String} message _optional_                                                                           // 2266
   * @api public                                                                                                  // 2267
   */                                                                                                             // 2268
                                                                                                                  // 2269
  Assertion.addMethod('satisfy', function (matcher, msg) {                                                        // 2270
    if (msg) flag(this, 'message', msg);                                                                          // 2271
    var obj = flag(this, 'object');                                                                               // 2272
    var result = matcher(obj);                                                                                    // 2273
    this.assert(                                                                                                  // 2274
        result                                                                                                    // 2275
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)                                                    // 2276
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)                                                 // 2277
      , this.negate ? false : true                                                                                // 2278
      , result                                                                                                    // 2279
    );                                                                                                            // 2280
  });                                                                                                             // 2281
                                                                                                                  // 2282
  /**                                                                                                             // 2283
   * ### .closeTo(expected, delta)                                                                                // 2284
   *                                                                                                              // 2285
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.                                  // 2286
   *                                                                                                              // 2287
   *     expect(1.5).to.be.closeTo(1, 0.5);                                                                       // 2288
   *                                                                                                              // 2289
   * @name closeTo                                                                                                // 2290
   * @param {Number} expected                                                                                     // 2291
   * @param {Number} delta                                                                                        // 2292
   * @param {String} message _optional_                                                                           // 2293
   * @api public                                                                                                  // 2294
   */                                                                                                             // 2295
                                                                                                                  // 2296
  Assertion.addMethod('closeTo', function (expected, delta, msg) {                                                // 2297
    if (msg) flag(this, 'message', msg);                                                                          // 2298
    var obj = flag(this, 'object');                                                                               // 2299
                                                                                                                  // 2300
    new Assertion(obj, msg).is.a('number');                                                                       // 2301
    if (_.type(expected) !== 'number' || _.type(delta) !== 'number') {                                            // 2302
      throw new Error('the arguments to closeTo must be numbers');                                                // 2303
    }                                                                                                             // 2304
                                                                                                                  // 2305
    this.assert(                                                                                                  // 2306
        Math.abs(obj - expected) <= delta                                                                         // 2307
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta                                           // 2308
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta                                       // 2309
    );                                                                                                            // 2310
  });                                                                                                             // 2311
                                                                                                                  // 2312
  function isSubsetOf(subset, superset, cmp) {                                                                    // 2313
    return subset.every(function(elem) {                                                                          // 2314
      if (!cmp) return superset.indexOf(elem) !== -1;                                                             // 2315
                                                                                                                  // 2316
      return superset.some(function(elem2) {                                                                      // 2317
        return cmp(elem, elem2);                                                                                  // 2318
      });                                                                                                         // 2319
    })                                                                                                            // 2320
  }                                                                                                               // 2321
                                                                                                                  // 2322
  /**                                                                                                             // 2323
   * ### .members(set)                                                                                            // 2324
   *                                                                                                              // 2325
   * Asserts that the target is a superset of `set`,                                                              // 2326
   * or that the target and `set` have the same strictly-equal (===) members.                                     // 2327
   * Alternately, if the `deep` flag is set, set members are compared for deep                                    // 2328
   * equality.                                                                                                    // 2329
   *                                                                                                              // 2330
   *     expect([1, 2, 3]).to.include.members([3, 2]);                                                            // 2331
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);                                                     // 2332
   *                                                                                                              // 2333
   *     expect([4, 2]).to.have.members([2, 4]);                                                                  // 2334
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);                                                           // 2335
   *                                                                                                              // 2336
   *     expect([{ id: 1 }]).to.deep.include.members([{ id: 1 }]);                                                // 2337
   *                                                                                                              // 2338
   * @name members                                                                                                // 2339
   * @param {Array} set                                                                                           // 2340
   * @param {String} message _optional_                                                                           // 2341
   * @api public                                                                                                  // 2342
   */                                                                                                             // 2343
                                                                                                                  // 2344
  Assertion.addMethod('members', function (subset, msg) {                                                         // 2345
    if (msg) flag(this, 'message', msg);                                                                          // 2346
    var obj = flag(this, 'object');                                                                               // 2347
                                                                                                                  // 2348
    new Assertion(obj).to.be.an('array');                                                                         // 2349
    new Assertion(subset).to.be.an('array');                                                                      // 2350
                                                                                                                  // 2351
    var cmp = flag(this, 'deep') ? _.eql : undefined;                                                             // 2352
                                                                                                                  // 2353
    if (flag(this, 'contains')) {                                                                                 // 2354
      return this.assert(                                                                                         // 2355
          isSubsetOf(subset, obj, cmp)                                                                            // 2356
        , 'expected #{this} to be a superset of #{act}'                                                           // 2357
        , 'expected #{this} to not be a superset of #{act}'                                                       // 2358
        , obj                                                                                                     // 2359
        , subset                                                                                                  // 2360
      );                                                                                                          // 2361
    }                                                                                                             // 2362
                                                                                                                  // 2363
    this.assert(                                                                                                  // 2364
        isSubsetOf(obj, subset, cmp) && isSubsetOf(subset, obj, cmp)                                              // 2365
        , 'expected #{this} to have the same members as #{act}'                                                   // 2366
        , 'expected #{this} to not have the same members as #{act}'                                               // 2367
        , obj                                                                                                     // 2368
        , subset                                                                                                  // 2369
    );                                                                                                            // 2370
  });                                                                                                             // 2371
                                                                                                                  // 2372
  /**                                                                                                             // 2373
   * ### .change(function)                                                                                        // 2374
   *                                                                                                              // 2375
   * Asserts that a function changes an object property                                                           // 2376
   *                                                                                                              // 2377
   *     var obj = { val: 10 };                                                                                   // 2378
   *     var fn = function() { obj.val += 3 };                                                                    // 2379
   *     var noChangeFn = function() { return 'foo' + 'bar'; }                                                    // 2380
   *     expect(fn).to.change(obj, 'val');                                                                        // 2381
   *     expect(noChangFn).to.not.change(obj, 'val')                                                              // 2382
   *                                                                                                              // 2383
   * @name change                                                                                                 // 2384
   * @alias changes                                                                                               // 2385
   * @alias Change                                                                                                // 2386
   * @param {String} object                                                                                       // 2387
   * @param {String} property name                                                                                // 2388
   * @param {String} message _optional_                                                                           // 2389
   * @api public                                                                                                  // 2390
   */                                                                                                             // 2391
                                                                                                                  // 2392
  function assertChanges (object, prop, msg) {                                                                    // 2393
    if (msg) flag(this, 'message', msg);                                                                          // 2394
    var fn = flag(this, 'object');                                                                                // 2395
    new Assertion(object, msg).to.have.property(prop);                                                            // 2396
    new Assertion(fn).is.a('function');                                                                           // 2397
                                                                                                                  // 2398
    var initial = object[prop];                                                                                   // 2399
    fn();                                                                                                         // 2400
                                                                                                                  // 2401
    this.assert(                                                                                                  // 2402
      initial !== object[prop]                                                                                    // 2403
      , 'expected .' + prop + ' to change'                                                                        // 2404
      , 'expected .' + prop + ' to not change'                                                                    // 2405
    );                                                                                                            // 2406
  }                                                                                                               // 2407
                                                                                                                  // 2408
  Assertion.addChainableMethod('change', assertChanges);                                                          // 2409
  Assertion.addChainableMethod('changes', assertChanges);                                                         // 2410
                                                                                                                  // 2411
  /**                                                                                                             // 2412
   * ### .increase(function)                                                                                      // 2413
   *                                                                                                              // 2414
   * Asserts that a function increases an object property                                                         // 2415
   *                                                                                                              // 2416
   *     var obj = { val: 10 };                                                                                   // 2417
   *     var fn = function() { obj.val = 15 };                                                                    // 2418
   *     expect(fn).to.increase(obj, 'val');                                                                      // 2419
   *                                                                                                              // 2420
   * @name increase                                                                                               // 2421
   * @alias increases                                                                                             // 2422
   * @alias Increase                                                                                              // 2423
   * @param {String} object                                                                                       // 2424
   * @param {String} property name                                                                                // 2425
   * @param {String} message _optional_                                                                           // 2426
   * @api public                                                                                                  // 2427
   */                                                                                                             // 2428
                                                                                                                  // 2429
  function assertIncreases (object, prop, msg) {                                                                  // 2430
    if (msg) flag(this, 'message', msg);                                                                          // 2431
    var fn = flag(this, 'object');                                                                                // 2432
    new Assertion(object, msg).to.have.property(prop);                                                            // 2433
    new Assertion(fn).is.a('function');                                                                           // 2434
                                                                                                                  // 2435
    var initial = object[prop];                                                                                   // 2436
    fn();                                                                                                         // 2437
                                                                                                                  // 2438
    this.assert(                                                                                                  // 2439
      object[prop] - initial > 0                                                                                  // 2440
      , 'expected .' + prop + ' to increase'                                                                      // 2441
      , 'expected .' + prop + ' to not increase'                                                                  // 2442
    );                                                                                                            // 2443
  }                                                                                                               // 2444
                                                                                                                  // 2445
  Assertion.addChainableMethod('increase', assertIncreases);                                                      // 2446
  Assertion.addChainableMethod('increases', assertIncreases);                                                     // 2447
                                                                                                                  // 2448
  /**                                                                                                             // 2449
   * ### .decrease(function)                                                                                      // 2450
   *                                                                                                              // 2451
   * Asserts that a function decreases an object property                                                         // 2452
   *                                                                                                              // 2453
   *     var obj = { val: 10 };                                                                                   // 2454
   *     var fn = function() { obj.val = 5 };                                                                     // 2455
   *     expect(fn).to.decrease(obj, 'val');                                                                      // 2456
   *                                                                                                              // 2457
   * @name decrease                                                                                               // 2458
   * @alias decreases                                                                                             // 2459
   * @alias Decrease                                                                                              // 2460
   * @param {String} object                                                                                       // 2461
   * @param {String} property name                                                                                // 2462
   * @param {String} message _optional_                                                                           // 2463
   * @api public                                                                                                  // 2464
   */                                                                                                             // 2465
                                                                                                                  // 2466
  function assertDecreases (object, prop, msg) {                                                                  // 2467
    if (msg) flag(this, 'message', msg);                                                                          // 2468
    var fn = flag(this, 'object');                                                                                // 2469
    new Assertion(object, msg).to.have.property(prop);                                                            // 2470
    new Assertion(fn).is.a('function');                                                                           // 2471
                                                                                                                  // 2472
    var initial = object[prop];                                                                                   // 2473
    fn();                                                                                                         // 2474
                                                                                                                  // 2475
    this.assert(                                                                                                  // 2476
      object[prop] - initial < 0                                                                                  // 2477
      , 'expected .' + prop + ' to decrease'                                                                      // 2478
      , 'expected .' + prop + ' to not decrease'                                                                  // 2479
    );                                                                                                            // 2480
  }                                                                                                               // 2481
                                                                                                                  // 2482
  Assertion.addChainableMethod('decrease', assertDecreases);                                                      // 2483
  Assertion.addChainableMethod('decreases', assertDecreases);                                                     // 2484
                                                                                                                  // 2485
};                                                                                                                // 2486
                                                                                                                  // 2487
});                                                                                                               // 2488
                                                                                                                  // 2489
require.register("chai/lib/chai/interface/assert.js", function (exports, module) {                                // 2490
/*!                                                                                                               // 2491
 * chai                                                                                                           // 2492
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 2493
 * MIT Licensed                                                                                                   // 2494
 */                                                                                                               // 2495
                                                                                                                  // 2496
                                                                                                                  // 2497
module.exports = function (chai, util) {                                                                          // 2498
                                                                                                                  // 2499
  /*!                                                                                                             // 2500
   * Chai dependencies.                                                                                           // 2501
   */                                                                                                             // 2502
                                                                                                                  // 2503
  var Assertion = chai.Assertion                                                                                  // 2504
    , flag = util.flag;                                                                                           // 2505
                                                                                                                  // 2506
  /*!                                                                                                             // 2507
   * Module export.                                                                                               // 2508
   */                                                                                                             // 2509
                                                                                                                  // 2510
  /**                                                                                                             // 2511
   * ### assert(expression, message)                                                                              // 2512
   *                                                                                                              // 2513
   * Write your own test expressions.                                                                             // 2514
   *                                                                                                              // 2515
   *     assert('foo' !== 'bar', 'foo is not bar');                                                               // 2516
   *     assert(Array.isArray([]), 'empty arrays are arrays');                                                    // 2517
   *                                                                                                              // 2518
   * @param {Mixed} expression to test for truthiness                                                             // 2519
   * @param {String} message to display on error                                                                  // 2520
   * @name assert                                                                                                 // 2521
   * @api public                                                                                                  // 2522
   */                                                                                                             // 2523
                                                                                                                  // 2524
  var assert = chai.assert = function (express, errmsg) {                                                         // 2525
    var test = new Assertion(null, null, chai.assert);                                                            // 2526
    test.assert(                                                                                                  // 2527
        express                                                                                                   // 2528
      , errmsg                                                                                                    // 2529
      , '[ negation message unavailable ]'                                                                        // 2530
    );                                                                                                            // 2531
  };                                                                                                              // 2532
                                                                                                                  // 2533
  /**                                                                                                             // 2534
   * ### .fail(actual, expected, [message], [operator])                                                           // 2535
   *                                                                                                              // 2536
   * Throw a failure. Node.js `assert` module-compatible.                                                         // 2537
   *                                                                                                              // 2538
   * @name fail                                                                                                   // 2539
   * @param {Mixed} actual                                                                                        // 2540
   * @param {Mixed} expected                                                                                      // 2541
   * @param {String} message                                                                                      // 2542
   * @param {String} operator                                                                                     // 2543
   * @api public                                                                                                  // 2544
   */                                                                                                             // 2545
                                                                                                                  // 2546
  assert.fail = function (actual, expected, message, operator) {                                                  // 2547
    message = message || 'assert.fail()';                                                                         // 2548
    throw new chai.AssertionError(message, {                                                                      // 2549
        actual: actual                                                                                            // 2550
      , expected: expected                                                                                        // 2551
      , operator: operator                                                                                        // 2552
    }, assert.fail);                                                                                              // 2553
  };                                                                                                              // 2554
                                                                                                                  // 2555
  /**                                                                                                             // 2556
   * ### .ok(object, [message])                                                                                   // 2557
   *                                                                                                              // 2558
   * Asserts that `object` is truthy.                                                                             // 2559
   *                                                                                                              // 2560
   *     assert.ok('everything', 'everything is ok');                                                             // 2561
   *     assert.ok(false, 'this will fail');                                                                      // 2562
   *                                                                                                              // 2563
   * @name ok                                                                                                     // 2564
   * @param {Mixed} object to test                                                                                // 2565
   * @param {String} message                                                                                      // 2566
   * @api public                                                                                                  // 2567
   */                                                                                                             // 2568
                                                                                                                  // 2569
  assert.ok = function (val, msg) {                                                                               // 2570
    new Assertion(val, msg).is.ok;                                                                                // 2571
  };                                                                                                              // 2572
                                                                                                                  // 2573
  /**                                                                                                             // 2574
   * ### .notOk(object, [message])                                                                                // 2575
   *                                                                                                              // 2576
   * Asserts that `object` is falsy.                                                                              // 2577
   *                                                                                                              // 2578
   *     assert.notOk('everything', 'this will fail');                                                            // 2579
   *     assert.notOk(false, 'this will pass');                                                                   // 2580
   *                                                                                                              // 2581
   * @name notOk                                                                                                  // 2582
   * @param {Mixed} object to test                                                                                // 2583
   * @param {String} message                                                                                      // 2584
   * @api public                                                                                                  // 2585
   */                                                                                                             // 2586
                                                                                                                  // 2587
  assert.notOk = function (val, msg) {                                                                            // 2588
    new Assertion(val, msg).is.not.ok;                                                                            // 2589
  };                                                                                                              // 2590
                                                                                                                  // 2591
  /**                                                                                                             // 2592
   * ### .equal(actual, expected, [message])                                                                      // 2593
   *                                                                                                              // 2594
   * Asserts non-strict equality (`==`) of `actual` and `expected`.                                               // 2595
   *                                                                                                              // 2596
   *     assert.equal(3, '3', '== coerces values to strings');                                                    // 2597
   *                                                                                                              // 2598
   * @name equal                                                                                                  // 2599
   * @param {Mixed} actual                                                                                        // 2600
   * @param {Mixed} expected                                                                                      // 2601
   * @param {String} message                                                                                      // 2602
   * @api public                                                                                                  // 2603
   */                                                                                                             // 2604
                                                                                                                  // 2605
  assert.equal = function (act, exp, msg) {                                                                       // 2606
    var test = new Assertion(act, msg, assert.equal);                                                             // 2607
                                                                                                                  // 2608
    test.assert(                                                                                                  // 2609
        exp == flag(test, 'object')                                                                               // 2610
      , 'expected #{this} to equal #{exp}'                                                                        // 2611
      , 'expected #{this} to not equal #{act}'                                                                    // 2612
      , exp                                                                                                       // 2613
      , act                                                                                                       // 2614
    );                                                                                                            // 2615
  };                                                                                                              // 2616
                                                                                                                  // 2617
  /**                                                                                                             // 2618
   * ### .notEqual(actual, expected, [message])                                                                   // 2619
   *                                                                                                              // 2620
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.                                             // 2621
   *                                                                                                              // 2622
   *     assert.notEqual(3, 4, 'these numbers are not equal');                                                    // 2623
   *                                                                                                              // 2624
   * @name notEqual                                                                                               // 2625
   * @param {Mixed} actual                                                                                        // 2626
   * @param {Mixed} expected                                                                                      // 2627
   * @param {String} message                                                                                      // 2628
   * @api public                                                                                                  // 2629
   */                                                                                                             // 2630
                                                                                                                  // 2631
  assert.notEqual = function (act, exp, msg) {                                                                    // 2632
    var test = new Assertion(act, msg, assert.notEqual);                                                          // 2633
                                                                                                                  // 2634
    test.assert(                                                                                                  // 2635
        exp != flag(test, 'object')                                                                               // 2636
      , 'expected #{this} to not equal #{exp}'                                                                    // 2637
      , 'expected #{this} to equal #{act}'                                                                        // 2638
      , exp                                                                                                       // 2639
      , act                                                                                                       // 2640
    );                                                                                                            // 2641
  };                                                                                                              // 2642
                                                                                                                  // 2643
  /**                                                                                                             // 2644
   * ### .strictEqual(actual, expected, [message])                                                                // 2645
   *                                                                                                              // 2646
   * Asserts strict equality (`===`) of `actual` and `expected`.                                                  // 2647
   *                                                                                                              // 2648
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');                                     // 2649
   *                                                                                                              // 2650
   * @name strictEqual                                                                                            // 2651
   * @param {Mixed} actual                                                                                        // 2652
   * @param {Mixed} expected                                                                                      // 2653
   * @param {String} message                                                                                      // 2654
   * @api public                                                                                                  // 2655
   */                                                                                                             // 2656
                                                                                                                  // 2657
  assert.strictEqual = function (act, exp, msg) {                                                                 // 2658
    new Assertion(act, msg).to.equal(exp);                                                                        // 2659
  };                                                                                                              // 2660
                                                                                                                  // 2661
  /**                                                                                                             // 2662
   * ### .notStrictEqual(actual, expected, [message])                                                             // 2663
   *                                                                                                              // 2664
   * Asserts strict inequality (`!==`) of `actual` and `expected`.                                                // 2665
   *                                                                                                              // 2666
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');                                        // 2667
   *                                                                                                              // 2668
   * @name notStrictEqual                                                                                         // 2669
   * @param {Mixed} actual                                                                                        // 2670
   * @param {Mixed} expected                                                                                      // 2671
   * @param {String} message                                                                                      // 2672
   * @api public                                                                                                  // 2673
   */                                                                                                             // 2674
                                                                                                                  // 2675
  assert.notStrictEqual = function (act, exp, msg) {                                                              // 2676
    new Assertion(act, msg).to.not.equal(exp);                                                                    // 2677
  };                                                                                                              // 2678
                                                                                                                  // 2679
  /**                                                                                                             // 2680
   * ### .deepEqual(actual, expected, [message])                                                                  // 2681
   *                                                                                                              // 2682
   * Asserts that `actual` is deeply equal to `expected`.                                                         // 2683
   *                                                                                                              // 2684
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });                                                    // 2685
   *                                                                                                              // 2686
   * @name deepEqual                                                                                              // 2687
   * @param {Mixed} actual                                                                                        // 2688
   * @param {Mixed} expected                                                                                      // 2689
   * @param {String} message                                                                                      // 2690
   * @api public                                                                                                  // 2691
   */                                                                                                             // 2692
                                                                                                                  // 2693
  assert.deepEqual = function (act, exp, msg) {                                                                   // 2694
    new Assertion(act, msg).to.eql(exp);                                                                          // 2695
  };                                                                                                              // 2696
                                                                                                                  // 2697
  /**                                                                                                             // 2698
   * ### .notDeepEqual(actual, expected, [message])                                                               // 2699
   *                                                                                                              // 2700
   * Assert that `actual` is not deeply equal to `expected`.                                                      // 2701
   *                                                                                                              // 2702
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });                                               // 2703
   *                                                                                                              // 2704
   * @name notDeepEqual                                                                                           // 2705
   * @param {Mixed} actual                                                                                        // 2706
   * @param {Mixed} expected                                                                                      // 2707
   * @param {String} message                                                                                      // 2708
   * @api public                                                                                                  // 2709
   */                                                                                                             // 2710
                                                                                                                  // 2711
  assert.notDeepEqual = function (act, exp, msg) {                                                                // 2712
    new Assertion(act, msg).to.not.eql(exp);                                                                      // 2713
  };                                                                                                              // 2714
                                                                                                                  // 2715
  /**                                                                                                             // 2716
   * ### .isTrue(value, [message])                                                                                // 2717
   *                                                                                                              // 2718
   * Asserts that `value` is true.                                                                                // 2719
   *                                                                                                              // 2720
   *     var teaServed = true;                                                                                    // 2721
   *     assert.isTrue(teaServed, 'the tea has been served');                                                     // 2722
   *                                                                                                              // 2723
   * @name isTrue                                                                                                 // 2724
   * @param {Mixed} value                                                                                         // 2725
   * @param {String} message                                                                                      // 2726
   * @api public                                                                                                  // 2727
   */                                                                                                             // 2728
                                                                                                                  // 2729
  assert.isAbove = function (val, abv, msg) {                                                                     // 2730
    new Assertion(val, msg).to.be.above(abv);                                                                     // 2731
  };                                                                                                              // 2732
                                                                                                                  // 2733
   /**                                                                                                            // 2734
   * ### .isAbove(valueToCheck, valueToBeAbove, [message])                                                        // 2735
   *                                                                                                              // 2736
   * Asserts `valueToCheck` is strictly greater than (>) `valueToBeAbove`                                         // 2737
   *                                                                                                              // 2738
   *     assert.isAbove(5, 2, '5 is strictly greater than 2');                                                    // 2739
   *                                                                                                              // 2740
   * @name isAbove                                                                                                // 2741
   * @param {Mixed} valueToCheck                                                                                  // 2742
   * @param {Mixed} valueToBeAbove                                                                                // 2743
   * @param {String} message                                                                                      // 2744
   * @api public                                                                                                  // 2745
   */                                                                                                             // 2746
                                                                                                                  // 2747
  assert.isBelow = function (val, blw, msg) {                                                                     // 2748
    new Assertion(val, msg).to.be.below(blw);                                                                     // 2749
  };                                                                                                              // 2750
                                                                                                                  // 2751
   /**                                                                                                            // 2752
   * ### .isBelow(valueToCheck, valueToBeBelow, [message])                                                        // 2753
   *                                                                                                              // 2754
   * Asserts `valueToCheck` is strictly less than (<) `valueToBeBelow`                                            // 2755
   *                                                                                                              // 2756
   *     assert.isBelow(3, 6, '3 is strictly less than 6');                                                       // 2757
   *                                                                                                              // 2758
   * @name isBelow                                                                                                // 2759
   * @param {Mixed} valueToCheck                                                                                  // 2760
   * @param {Mixed} valueToBeBelow                                                                                // 2761
   * @param {String} message                                                                                      // 2762
   * @api public                                                                                                  // 2763
   */                                                                                                             // 2764
                                                                                                                  // 2765
  assert.isTrue = function (val, msg) {                                                                           // 2766
    new Assertion(val, msg).is['true'];                                                                           // 2767
  };                                                                                                              // 2768
                                                                                                                  // 2769
  /**                                                                                                             // 2770
   * ### .isFalse(value, [message])                                                                               // 2771
   *                                                                                                              // 2772
   * Asserts that `value` is false.                                                                               // 2773
   *                                                                                                              // 2774
   *     var teaServed = false;                                                                                   // 2775
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');                                                         // 2776
   *                                                                                                              // 2777
   * @name isFalse                                                                                                // 2778
   * @param {Mixed} value                                                                                         // 2779
   * @param {String} message                                                                                      // 2780
   * @api public                                                                                                  // 2781
   */                                                                                                             // 2782
                                                                                                                  // 2783
  assert.isFalse = function (val, msg) {                                                                          // 2784
    new Assertion(val, msg).is['false'];                                                                          // 2785
  };                                                                                                              // 2786
                                                                                                                  // 2787
  /**                                                                                                             // 2788
   * ### .isNull(value, [message])                                                                                // 2789
   *                                                                                                              // 2790
   * Asserts that `value` is null.                                                                                // 2791
   *                                                                                                              // 2792
   *     assert.isNull(err, 'there was no error');                                                                // 2793
   *                                                                                                              // 2794
   * @name isNull                                                                                                 // 2795
   * @param {Mixed} value                                                                                         // 2796
   * @param {String} message                                                                                      // 2797
   * @api public                                                                                                  // 2798
   */                                                                                                             // 2799
                                                                                                                  // 2800
  assert.isNull = function (val, msg) {                                                                           // 2801
    new Assertion(val, msg).to.equal(null);                                                                       // 2802
  };                                                                                                              // 2803
                                                                                                                  // 2804
  /**                                                                                                             // 2805
   * ### .isNotNull(value, [message])                                                                             // 2806
   *                                                                                                              // 2807
   * Asserts that `value` is not null.                                                                            // 2808
   *                                                                                                              // 2809
   *     var tea = 'tasty chai';                                                                                  // 2810
   *     assert.isNotNull(tea, 'great, time for tea!');                                                           // 2811
   *                                                                                                              // 2812
   * @name isNotNull                                                                                              // 2813
   * @param {Mixed} value                                                                                         // 2814
   * @param {String} message                                                                                      // 2815
   * @api public                                                                                                  // 2816
   */                                                                                                             // 2817
                                                                                                                  // 2818
  assert.isNotNull = function (val, msg) {                                                                        // 2819
    new Assertion(val, msg).to.not.equal(null);                                                                   // 2820
  };                                                                                                              // 2821
                                                                                                                  // 2822
  /**                                                                                                             // 2823
   * ### .isUndefined(value, [message])                                                                           // 2824
   *                                                                                                              // 2825
   * Asserts that `value` is `undefined`.                                                                         // 2826
   *                                                                                                              // 2827
   *     var tea;                                                                                                 // 2828
   *     assert.isUndefined(tea, 'no tea defined');                                                               // 2829
   *                                                                                                              // 2830
   * @name isUndefined                                                                                            // 2831
   * @param {Mixed} value                                                                                         // 2832
   * @param {String} message                                                                                      // 2833
   * @api public                                                                                                  // 2834
   */                                                                                                             // 2835
                                                                                                                  // 2836
  assert.isUndefined = function (val, msg) {                                                                      // 2837
    new Assertion(val, msg).to.equal(undefined);                                                                  // 2838
  };                                                                                                              // 2839
                                                                                                                  // 2840
  /**                                                                                                             // 2841
   * ### .isDefined(value, [message])                                                                             // 2842
   *                                                                                                              // 2843
   * Asserts that `value` is not `undefined`.                                                                     // 2844
   *                                                                                                              // 2845
   *     var tea = 'cup of chai';                                                                                 // 2846
   *     assert.isDefined(tea, 'tea has been defined');                                                           // 2847
   *                                                                                                              // 2848
   * @name isDefined                                                                                              // 2849
   * @param {Mixed} value                                                                                         // 2850
   * @param {String} message                                                                                      // 2851
   * @api public                                                                                                  // 2852
   */                                                                                                             // 2853
                                                                                                                  // 2854
  assert.isDefined = function (val, msg) {                                                                        // 2855
    new Assertion(val, msg).to.not.equal(undefined);                                                              // 2856
  };                                                                                                              // 2857
                                                                                                                  // 2858
  /**                                                                                                             // 2859
   * ### .isFunction(value, [message])                                                                            // 2860
   *                                                                                                              // 2861
   * Asserts that `value` is a function.                                                                          // 2862
   *                                                                                                              // 2863
   *     function serveTea() { return 'cup of tea'; };                                                            // 2864
   *     assert.isFunction(serveTea, 'great, we can have tea now');                                               // 2865
   *                                                                                                              // 2866
   * @name isFunction                                                                                             // 2867
   * @param {Mixed} value                                                                                         // 2868
   * @param {String} message                                                                                      // 2869
   * @api public                                                                                                  // 2870
   */                                                                                                             // 2871
                                                                                                                  // 2872
  assert.isFunction = function (val, msg) {                                                                       // 2873
    new Assertion(val, msg).to.be.a('function');                                                                  // 2874
  };                                                                                                              // 2875
                                                                                                                  // 2876
  /**                                                                                                             // 2877
   * ### .isNotFunction(value, [message])                                                                         // 2878
   *                                                                                                              // 2879
   * Asserts that `value` is _not_ a function.                                                                    // 2880
   *                                                                                                              // 2881
   *     var serveTea = [ 'heat', 'pour', 'sip' ];                                                                // 2882
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');                                       // 2883
   *                                                                                                              // 2884
   * @name isNotFunction                                                                                          // 2885
   * @param {Mixed} value                                                                                         // 2886
   * @param {String} message                                                                                      // 2887
   * @api public                                                                                                  // 2888
   */                                                                                                             // 2889
                                                                                                                  // 2890
  assert.isNotFunction = function (val, msg) {                                                                    // 2891
    new Assertion(val, msg).to.not.be.a('function');                                                              // 2892
  };                                                                                                              // 2893
                                                                                                                  // 2894
  /**                                                                                                             // 2895
   * ### .isObject(value, [message])                                                                              // 2896
   *                                                                                                              // 2897
   * Asserts that `value` is an object (as revealed by                                                            // 2898
   * `Object.prototype.toString`).                                                                                // 2899
   *                                                                                                              // 2900
   *     var selection = { name: 'Chai', serve: 'with spices' };                                                  // 2901
   *     assert.isObject(selection, 'tea selection is an object');                                                // 2902
   *                                                                                                              // 2903
   * @name isObject                                                                                               // 2904
   * @param {Mixed} value                                                                                         // 2905
   * @param {String} message                                                                                      // 2906
   * @api public                                                                                                  // 2907
   */                                                                                                             // 2908
                                                                                                                  // 2909
  assert.isObject = function (val, msg) {                                                                         // 2910
    new Assertion(val, msg).to.be.a('object');                                                                    // 2911
  };                                                                                                              // 2912
                                                                                                                  // 2913
  /**                                                                                                             // 2914
   * ### .isNotObject(value, [message])                                                                           // 2915
   *                                                                                                              // 2916
   * Asserts that `value` is _not_ an object.                                                                     // 2917
   *                                                                                                              // 2918
   *     var selection = 'chai'                                                                                   // 2919
   *     assert.isNotObject(selection, 'tea selection is not an object');                                         // 2920
   *     assert.isNotObject(null, 'null is not an object');                                                       // 2921
   *                                                                                                              // 2922
   * @name isNotObject                                                                                            // 2923
   * @param {Mixed} value                                                                                         // 2924
   * @param {String} message                                                                                      // 2925
   * @api public                                                                                                  // 2926
   */                                                                                                             // 2927
                                                                                                                  // 2928
  assert.isNotObject = function (val, msg) {                                                                      // 2929
    new Assertion(val, msg).to.not.be.a('object');                                                                // 2930
  };                                                                                                              // 2931
                                                                                                                  // 2932
  /**                                                                                                             // 2933
   * ### .isArray(value, [message])                                                                               // 2934
   *                                                                                                              // 2935
   * Asserts that `value` is an array.                                                                            // 2936
   *                                                                                                              // 2937
   *     var menu = [ 'green', 'chai', 'oolong' ];                                                                // 2938
   *     assert.isArray(menu, 'what kind of tea do we want?');                                                    // 2939
   *                                                                                                              // 2940
   * @name isArray                                                                                                // 2941
   * @param {Mixed} value                                                                                         // 2942
   * @param {String} message                                                                                      // 2943
   * @api public                                                                                                  // 2944
   */                                                                                                             // 2945
                                                                                                                  // 2946
  assert.isArray = function (val, msg) {                                                                          // 2947
    new Assertion(val, msg).to.be.an('array');                                                                    // 2948
  };                                                                                                              // 2949
                                                                                                                  // 2950
  /**                                                                                                             // 2951
   * ### .isNotArray(value, [message])                                                                            // 2952
   *                                                                                                              // 2953
   * Asserts that `value` is _not_ an array.                                                                      // 2954
   *                                                                                                              // 2955
   *     var menu = 'green|chai|oolong';                                                                          // 2956
   *     assert.isNotArray(menu, 'what kind of tea do we want?');                                                 // 2957
   *                                                                                                              // 2958
   * @name isNotArray                                                                                             // 2959
   * @param {Mixed} value                                                                                         // 2960
   * @param {String} message                                                                                      // 2961
   * @api public                                                                                                  // 2962
   */                                                                                                             // 2963
                                                                                                                  // 2964
  assert.isNotArray = function (val, msg) {                                                                       // 2965
    new Assertion(val, msg).to.not.be.an('array');                                                                // 2966
  };                                                                                                              // 2967
                                                                                                                  // 2968
  /**                                                                                                             // 2969
   * ### .isString(value, [message])                                                                              // 2970
   *                                                                                                              // 2971
   * Asserts that `value` is a string.                                                                            // 2972
   *                                                                                                              // 2973
   *     var teaOrder = 'chai';                                                                                   // 2974
   *     assert.isString(teaOrder, 'order placed');                                                               // 2975
   *                                                                                                              // 2976
   * @name isString                                                                                               // 2977
   * @param {Mixed} value                                                                                         // 2978
   * @param {String} message                                                                                      // 2979
   * @api public                                                                                                  // 2980
   */                                                                                                             // 2981
                                                                                                                  // 2982
  assert.isString = function (val, msg) {                                                                         // 2983
    new Assertion(val, msg).to.be.a('string');                                                                    // 2984
  };                                                                                                              // 2985
                                                                                                                  // 2986
  /**                                                                                                             // 2987
   * ### .isNotString(value, [message])                                                                           // 2988
   *                                                                                                              // 2989
   * Asserts that `value` is _not_ a string.                                                                      // 2990
   *                                                                                                              // 2991
   *     var teaOrder = 4;                                                                                        // 2992
   *     assert.isNotString(teaOrder, 'order placed');                                                            // 2993
   *                                                                                                              // 2994
   * @name isNotString                                                                                            // 2995
   * @param {Mixed} value                                                                                         // 2996
   * @param {String} message                                                                                      // 2997
   * @api public                                                                                                  // 2998
   */                                                                                                             // 2999
                                                                                                                  // 3000
  assert.isNotString = function (val, msg) {                                                                      // 3001
    new Assertion(val, msg).to.not.be.a('string');                                                                // 3002
  };                                                                                                              // 3003
                                                                                                                  // 3004
  /**                                                                                                             // 3005
   * ### .isNumber(value, [message])                                                                              // 3006
   *                                                                                                              // 3007
   * Asserts that `value` is a number.                                                                            // 3008
   *                                                                                                              // 3009
   *     var cups = 2;                                                                                            // 3010
   *     assert.isNumber(cups, 'how many cups');                                                                  // 3011
   *                                                                                                              // 3012
   * @name isNumber                                                                                               // 3013
   * @param {Number} value                                                                                        // 3014
   * @param {String} message                                                                                      // 3015
   * @api public                                                                                                  // 3016
   */                                                                                                             // 3017
                                                                                                                  // 3018
  assert.isNumber = function (val, msg) {                                                                         // 3019
    new Assertion(val, msg).to.be.a('number');                                                                    // 3020
  };                                                                                                              // 3021
                                                                                                                  // 3022
  /**                                                                                                             // 3023
   * ### .isNotNumber(value, [message])                                                                           // 3024
   *                                                                                                              // 3025
   * Asserts that `value` is _not_ a number.                                                                      // 3026
   *                                                                                                              // 3027
   *     var cups = '2 cups please';                                                                              // 3028
   *     assert.isNotNumber(cups, 'how many cups');                                                               // 3029
   *                                                                                                              // 3030
   * @name isNotNumber                                                                                            // 3031
   * @param {Mixed} value                                                                                         // 3032
   * @param {String} message                                                                                      // 3033
   * @api public                                                                                                  // 3034
   */                                                                                                             // 3035
                                                                                                                  // 3036
  assert.isNotNumber = function (val, msg) {                                                                      // 3037
    new Assertion(val, msg).to.not.be.a('number');                                                                // 3038
  };                                                                                                              // 3039
                                                                                                                  // 3040
  /**                                                                                                             // 3041
   * ### .isBoolean(value, [message])                                                                             // 3042
   *                                                                                                              // 3043
   * Asserts that `value` is a boolean.                                                                           // 3044
   *                                                                                                              // 3045
   *     var teaReady = true                                                                                      // 3046
   *       , teaServed = false;                                                                                   // 3047
   *                                                                                                              // 3048
   *     assert.isBoolean(teaReady, 'is the tea ready');                                                          // 3049
   *     assert.isBoolean(teaServed, 'has tea been served');                                                      // 3050
   *                                                                                                              // 3051
   * @name isBoolean                                                                                              // 3052
   * @param {Mixed} value                                                                                         // 3053
   * @param {String} message                                                                                      // 3054
   * @api public                                                                                                  // 3055
   */                                                                                                             // 3056
                                                                                                                  // 3057
  assert.isBoolean = function (val, msg) {                                                                        // 3058
    new Assertion(val, msg).to.be.a('boolean');                                                                   // 3059
  };                                                                                                              // 3060
                                                                                                                  // 3061
  /**                                                                                                             // 3062
   * ### .isNotBoolean(value, [message])                                                                          // 3063
   *                                                                                                              // 3064
   * Asserts that `value` is _not_ a boolean.                                                                     // 3065
   *                                                                                                              // 3066
   *     var teaReady = 'yep'                                                                                     // 3067
   *       , teaServed = 'nope';                                                                                  // 3068
   *                                                                                                              // 3069
   *     assert.isNotBoolean(teaReady, 'is the tea ready');                                                       // 3070
   *     assert.isNotBoolean(teaServed, 'has tea been served');                                                   // 3071
   *                                                                                                              // 3072
   * @name isNotBoolean                                                                                           // 3073
   * @param {Mixed} value                                                                                         // 3074
   * @param {String} message                                                                                      // 3075
   * @api public                                                                                                  // 3076
   */                                                                                                             // 3077
                                                                                                                  // 3078
  assert.isNotBoolean = function (val, msg) {                                                                     // 3079
    new Assertion(val, msg).to.not.be.a('boolean');                                                               // 3080
  };                                                                                                              // 3081
                                                                                                                  // 3082
  /**                                                                                                             // 3083
   * ### .typeOf(value, name, [message])                                                                          // 3084
   *                                                                                                              // 3085
   * Asserts that `value`'s type is `name`, as determined by                                                      // 3086
   * `Object.prototype.toString`.                                                                                 // 3087
   *                                                                                                              // 3088
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');                                           // 3089
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');                                         // 3090
   *     assert.typeOf('tea', 'string', 'we have a string');                                                      // 3091
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');                                          // 3092
   *     assert.typeOf(null, 'null', 'we have a null');                                                           // 3093
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');                                           // 3094
   *                                                                                                              // 3095
   * @name typeOf                                                                                                 // 3096
   * @param {Mixed} value                                                                                         // 3097
   * @param {String} name                                                                                         // 3098
   * @param {String} message                                                                                      // 3099
   * @api public                                                                                                  // 3100
   */                                                                                                             // 3101
                                                                                                                  // 3102
  assert.typeOf = function (val, type, msg) {                                                                     // 3103
    new Assertion(val, msg).to.be.a(type);                                                                        // 3104
  };                                                                                                              // 3105
                                                                                                                  // 3106
  /**                                                                                                             // 3107
   * ### .notTypeOf(value, name, [message])                                                                       // 3108
   *                                                                                                              // 3109
   * Asserts that `value`'s type is _not_ `name`, as determined by                                                // 3110
   * `Object.prototype.toString`.                                                                                 // 3111
   *                                                                                                              // 3112
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');                                            // 3113
   *                                                                                                              // 3114
   * @name notTypeOf                                                                                              // 3115
   * @param {Mixed} value                                                                                         // 3116
   * @param {String} typeof name                                                                                  // 3117
   * @param {String} message                                                                                      // 3118
   * @api public                                                                                                  // 3119
   */                                                                                                             // 3120
                                                                                                                  // 3121
  assert.notTypeOf = function (val, type, msg) {                                                                  // 3122
    new Assertion(val, msg).to.not.be.a(type);                                                                    // 3123
  };                                                                                                              // 3124
                                                                                                                  // 3125
  /**                                                                                                             // 3126
   * ### .instanceOf(object, constructor, [message])                                                              // 3127
   *                                                                                                              // 3128
   * Asserts that `value` is an instance of `constructor`.                                                        // 3129
   *                                                                                                              // 3130
   *     var Tea = function (name) { this.name = name; }                                                          // 3131
   *       , chai = new Tea('chai');                                                                              // 3132
   *                                                                                                              // 3133
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');                                              // 3134
   *                                                                                                              // 3135
   * @name instanceOf                                                                                             // 3136
   * @param {Object} object                                                                                       // 3137
   * @param {Constructor} constructor                                                                             // 3138
   * @param {String} message                                                                                      // 3139
   * @api public                                                                                                  // 3140
   */                                                                                                             // 3141
                                                                                                                  // 3142
  assert.instanceOf = function (val, type, msg) {                                                                 // 3143
    new Assertion(val, msg).to.be.instanceOf(type);                                                               // 3144
  };                                                                                                              // 3145
                                                                                                                  // 3146
  /**                                                                                                             // 3147
   * ### .notInstanceOf(object, constructor, [message])                                                           // 3148
   *                                                                                                              // 3149
   * Asserts `value` is not an instance of `constructor`.                                                         // 3150
   *                                                                                                              // 3151
   *     var Tea = function (name) { this.name = name; }                                                          // 3152
   *       , chai = new String('chai');                                                                           // 3153
   *                                                                                                              // 3154
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');                                       // 3155
   *                                                                                                              // 3156
   * @name notInstanceOf                                                                                          // 3157
   * @param {Object} object                                                                                       // 3158
   * @param {Constructor} constructor                                                                             // 3159
   * @param {String} message                                                                                      // 3160
   * @api public                                                                                                  // 3161
   */                                                                                                             // 3162
                                                                                                                  // 3163
  assert.notInstanceOf = function (val, type, msg) {                                                              // 3164
    new Assertion(val, msg).to.not.be.instanceOf(type);                                                           // 3165
  };                                                                                                              // 3166
                                                                                                                  // 3167
  /**                                                                                                             // 3168
   * ### .include(haystack, needle, [message])                                                                    // 3169
   *                                                                                                              // 3170
   * Asserts that `haystack` includes `needle`. Works                                                             // 3171
   * for strings and arrays.                                                                                      // 3172
   *                                                                                                              // 3173
   *     assert.include('foobar', 'bar', 'foobar contains string "bar"');                                         // 3174
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');                                                  // 3175
   *                                                                                                              // 3176
   * @name include                                                                                                // 3177
   * @param {Array|String} haystack                                                                               // 3178
   * @param {Mixed} needle                                                                                        // 3179
   * @param {String} message                                                                                      // 3180
   * @api public                                                                                                  // 3181
   */                                                                                                             // 3182
                                                                                                                  // 3183
  assert.include = function (exp, inc, msg) {                                                                     // 3184
    new Assertion(exp, msg, assert.include).include(inc);                                                         // 3185
  };                                                                                                              // 3186
                                                                                                                  // 3187
  /**                                                                                                             // 3188
   * ### .notInclude(haystack, needle, [message])                                                                 // 3189
   *                                                                                                              // 3190
   * Asserts that `haystack` does not include `needle`. Works                                                     // 3191
   * for strings and arrays.                                                                                      // 3192
   *i                                                                                                             // 3193
   *     assert.notInclude('foobar', 'baz', 'string not include substring');                                      // 3194
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');                                    // 3195
   *                                                                                                              // 3196
   * @name notInclude                                                                                             // 3197
   * @param {Array|String} haystack                                                                               // 3198
   * @param {Mixed} needle                                                                                        // 3199
   * @param {String} message                                                                                      // 3200
   * @api public                                                                                                  // 3201
   */                                                                                                             // 3202
                                                                                                                  // 3203
  assert.notInclude = function (exp, inc, msg) {                                                                  // 3204
    new Assertion(exp, msg, assert.notInclude).not.include(inc);                                                  // 3205
  };                                                                                                              // 3206
                                                                                                                  // 3207
  /**                                                                                                             // 3208
   * ### .match(value, regexp, [message])                                                                         // 3209
   *                                                                                                              // 3210
   * Asserts that `value` matches the regular expression `regexp`.                                                // 3211
   *                                                                                                              // 3212
   *     assert.match('foobar', /^foo/, 'regexp matches');                                                        // 3213
   *                                                                                                              // 3214
   * @name match                                                                                                  // 3215
   * @param {Mixed} value                                                                                         // 3216
   * @param {RegExp} regexp                                                                                       // 3217
   * @param {String} message                                                                                      // 3218
   * @api public                                                                                                  // 3219
   */                                                                                                             // 3220
                                                                                                                  // 3221
  assert.match = function (exp, re, msg) {                                                                        // 3222
    new Assertion(exp, msg).to.match(re);                                                                         // 3223
  };                                                                                                              // 3224
                                                                                                                  // 3225
  /**                                                                                                             // 3226
   * ### .notMatch(value, regexp, [message])                                                                      // 3227
   *                                                                                                              // 3228
   * Asserts that `value` does not match the regular expression `regexp`.                                         // 3229
   *                                                                                                              // 3230
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');                                              // 3231
   *                                                                                                              // 3232
   * @name notMatch                                                                                               // 3233
   * @param {Mixed} value                                                                                         // 3234
   * @param {RegExp} regexp                                                                                       // 3235
   * @param {String} message                                                                                      // 3236
   * @api public                                                                                                  // 3237
   */                                                                                                             // 3238
                                                                                                                  // 3239
  assert.notMatch = function (exp, re, msg) {                                                                     // 3240
    new Assertion(exp, msg).to.not.match(re);                                                                     // 3241
  };                                                                                                              // 3242
                                                                                                                  // 3243
  /**                                                                                                             // 3244
   * ### .property(object, property, [message])                                                                   // 3245
   *                                                                                                              // 3246
   * Asserts that `object` has a property named by `property`.                                                    // 3247
   *                                                                                                              // 3248
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');                                                     // 3249
   *                                                                                                              // 3250
   * @name property                                                                                               // 3251
   * @param {Object} object                                                                                       // 3252
   * @param {String} property                                                                                     // 3253
   * @param {String} message                                                                                      // 3254
   * @api public                                                                                                  // 3255
   */                                                                                                             // 3256
                                                                                                                  // 3257
  assert.property = function (obj, prop, msg) {                                                                   // 3258
    new Assertion(obj, msg).to.have.property(prop);                                                               // 3259
  };                                                                                                              // 3260
                                                                                                                  // 3261
  /**                                                                                                             // 3262
   * ### .notProperty(object, property, [message])                                                                // 3263
   *                                                                                                              // 3264
   * Asserts that `object` does _not_ have a property named by `property`.                                        // 3265
   *                                                                                                              // 3266
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');                                               // 3267
   *                                                                                                              // 3268
   * @name notProperty                                                                                            // 3269
   * @param {Object} object                                                                                       // 3270
   * @param {String} property                                                                                     // 3271
   * @param {String} message                                                                                      // 3272
   * @api public                                                                                                  // 3273
   */                                                                                                             // 3274
                                                                                                                  // 3275
  assert.notProperty = function (obj, prop, msg) {                                                                // 3276
    new Assertion(obj, msg).to.not.have.property(prop);                                                           // 3277
  };                                                                                                              // 3278
                                                                                                                  // 3279
  /**                                                                                                             // 3280
   * ### .deepProperty(object, property, [message])                                                               // 3281
   *                                                                                                              // 3282
   * Asserts that `object` has a property named by `property`, which can be a                                     // 3283
   * string using dot- and bracket-notation for deep reference.                                                   // 3284
   *                                                                                                              // 3285
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');                                           // 3286
   *                                                                                                              // 3287
   * @name deepProperty                                                                                           // 3288
   * @param {Object} object                                                                                       // 3289
   * @param {String} property                                                                                     // 3290
   * @param {String} message                                                                                      // 3291
   * @api public                                                                                                  // 3292
   */                                                                                                             // 3293
                                                                                                                  // 3294
  assert.deepProperty = function (obj, prop, msg) {                                                               // 3295
    new Assertion(obj, msg).to.have.deep.property(prop);                                                          // 3296
  };                                                                                                              // 3297
                                                                                                                  // 3298
  /**                                                                                                             // 3299
   * ### .notDeepProperty(object, property, [message])                                                            // 3300
   *                                                                                                              // 3301
   * Asserts that `object` does _not_ have a property named by `property`, which                                  // 3302
   * can be a string using dot- and bracket-notation for deep reference.                                          // 3303
   *                                                                                                              // 3304
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');                                       // 3305
   *                                                                                                              // 3306
   * @name notDeepProperty                                                                                        // 3307
   * @param {Object} object                                                                                       // 3308
   * @param {String} property                                                                                     // 3309
   * @param {String} message                                                                                      // 3310
   * @api public                                                                                                  // 3311
   */                                                                                                             // 3312
                                                                                                                  // 3313
  assert.notDeepProperty = function (obj, prop, msg) {                                                            // 3314
    new Assertion(obj, msg).to.not.have.deep.property(prop);                                                      // 3315
  };                                                                                                              // 3316
                                                                                                                  // 3317
  /**                                                                                                             // 3318
   * ### .propertyVal(object, property, value, [message])                                                         // 3319
   *                                                                                                              // 3320
   * Asserts that `object` has a property named by `property` with value given                                    // 3321
   * by `value`.                                                                                                  // 3322
   *                                                                                                              // 3323
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');                                                // 3324
   *                                                                                                              // 3325
   * @name propertyVal                                                                                            // 3326
   * @param {Object} object                                                                                       // 3327
   * @param {String} property                                                                                     // 3328
   * @param {Mixed} value                                                                                         // 3329
   * @param {String} message                                                                                      // 3330
   * @api public                                                                                                  // 3331
   */                                                                                                             // 3332
                                                                                                                  // 3333
  assert.propertyVal = function (obj, prop, val, msg) {                                                           // 3334
    new Assertion(obj, msg).to.have.property(prop, val);                                                          // 3335
  };                                                                                                              // 3336
                                                                                                                  // 3337
  /**                                                                                                             // 3338
   * ### .propertyNotVal(object, property, value, [message])                                                      // 3339
   *                                                                                                              // 3340
   * Asserts that `object` has a property named by `property`, but with a value                                   // 3341
   * different from that given by `value`.                                                                        // 3342
   *                                                                                                              // 3343
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');                                              // 3344
   *                                                                                                              // 3345
   * @name propertyNotVal                                                                                         // 3346
   * @param {Object} object                                                                                       // 3347
   * @param {String} property                                                                                     // 3348
   * @param {Mixed} value                                                                                         // 3349
   * @param {String} message                                                                                      // 3350
   * @api public                                                                                                  // 3351
   */                                                                                                             // 3352
                                                                                                                  // 3353
  assert.propertyNotVal = function (obj, prop, val, msg) {                                                        // 3354
    new Assertion(obj, msg).to.not.have.property(prop, val);                                                      // 3355
  };                                                                                                              // 3356
                                                                                                                  // 3357
  /**                                                                                                             // 3358
   * ### .deepPropertyVal(object, property, value, [message])                                                     // 3359
   *                                                                                                              // 3360
   * Asserts that `object` has a property named by `property` with value given                                    // 3361
   * by `value`. `property` can use dot- and bracket-notation for deep                                            // 3362
   * reference.                                                                                                   // 3363
   *                                                                                                              // 3364
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');                              // 3365
   *                                                                                                              // 3366
   * @name deepPropertyVal                                                                                        // 3367
   * @param {Object} object                                                                                       // 3368
   * @param {String} property                                                                                     // 3369
   * @param {Mixed} value                                                                                         // 3370
   * @param {String} message                                                                                      // 3371
   * @api public                                                                                                  // 3372
   */                                                                                                             // 3373
                                                                                                                  // 3374
  assert.deepPropertyVal = function (obj, prop, val, msg) {                                                       // 3375
    new Assertion(obj, msg).to.have.deep.property(prop, val);                                                     // 3376
  };                                                                                                              // 3377
                                                                                                                  // 3378
  /**                                                                                                             // 3379
   * ### .deepPropertyNotVal(object, property, value, [message])                                                  // 3380
   *                                                                                                              // 3381
   * Asserts that `object` has a property named by `property`, but with a value                                   // 3382
   * different from that given by `value`. `property` can use dot- and                                            // 3383
   * bracket-notation for deep reference.                                                                         // 3384
   *                                                                                                              // 3385
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');                          // 3386
   *                                                                                                              // 3387
   * @name deepPropertyNotVal                                                                                     // 3388
   * @param {Object} object                                                                                       // 3389
   * @param {String} property                                                                                     // 3390
   * @param {Mixed} value                                                                                         // 3391
   * @param {String} message                                                                                      // 3392
   * @api public                                                                                                  // 3393
   */                                                                                                             // 3394
                                                                                                                  // 3395
  assert.deepPropertyNotVal = function (obj, prop, val, msg) {                                                    // 3396
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);                                                 // 3397
  };                                                                                                              // 3398
                                                                                                                  // 3399
  /**                                                                                                             // 3400
   * ### .lengthOf(object, length, [message])                                                                     // 3401
   *                                                                                                              // 3402
   * Asserts that `object` has a `length` property with the expected value.                                       // 3403
   *                                                                                                              // 3404
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');                                                    // 3405
   *     assert.lengthOf('foobar', 5, 'string has length of 6');                                                  // 3406
   *                                                                                                              // 3407
   * @name lengthOf                                                                                               // 3408
   * @param {Mixed} object                                                                                        // 3409
   * @param {Number} length                                                                                       // 3410
   * @param {String} message                                                                                      // 3411
   * @api public                                                                                                  // 3412
   */                                                                                                             // 3413
                                                                                                                  // 3414
  assert.lengthOf = function (exp, len, msg) {                                                                    // 3415
    new Assertion(exp, msg).to.have.length(len);                                                                  // 3416
  };                                                                                                              // 3417
                                                                                                                  // 3418
  /**                                                                                                             // 3419
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])                               // 3420
   *                                                                                                              // 3421
   * Asserts that `function` will throw an error that is an instance of                                           // 3422
   * `constructor`, or alternately that it will throw an error with message                                       // 3423
   * matching `regexp`.                                                                                           // 3424
   *                                                                                                              // 3425
   *     assert.throw(fn, 'function throws a reference error');                                                   // 3426
   *     assert.throw(fn, /function throws a reference error/);                                                   // 3427
   *     assert.throw(fn, ReferenceError);                                                                        // 3428
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');                                   // 3429
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);                                   // 3430
   *                                                                                                              // 3431
   * @name throws                                                                                                 // 3432
   * @alias throw                                                                                                 // 3433
   * @alias Throw                                                                                                 // 3434
   * @param {Function} function                                                                                   // 3435
   * @param {ErrorConstructor} constructor                                                                        // 3436
   * @param {RegExp} regexp                                                                                       // 3437
   * @param {String} message                                                                                      // 3438
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types                  // 3439
   * @api public                                                                                                  // 3440
   */                                                                                                             // 3441
                                                                                                                  // 3442
  assert.Throw = function (fn, errt, errs, msg) {                                                                 // 3443
    if ('string' === typeof errt || errt instanceof RegExp) {                                                     // 3444
      errs = errt;                                                                                                // 3445
      errt = null;                                                                                                // 3446
    }                                                                                                             // 3447
                                                                                                                  // 3448
    var assertErr = new Assertion(fn, msg).to.Throw(errt, errs);                                                  // 3449
    return flag(assertErr, 'object');                                                                             // 3450
  };                                                                                                              // 3451
                                                                                                                  // 3452
  /**                                                                                                             // 3453
   * ### .doesNotThrow(function, [constructor/regexp], [message])                                                 // 3454
   *                                                                                                              // 3455
   * Asserts that `function` will _not_ throw an error that is an instance of                                     // 3456
   * `constructor`, or alternately that it will not throw an error with message                                   // 3457
   * matching `regexp`.                                                                                           // 3458
   *                                                                                                              // 3459
   *     assert.doesNotThrow(fn, Error, 'function does not throw');                                               // 3460
   *                                                                                                              // 3461
   * @name doesNotThrow                                                                                           // 3462
   * @param {Function} function                                                                                   // 3463
   * @param {ErrorConstructor} constructor                                                                        // 3464
   * @param {RegExp} regexp                                                                                       // 3465
   * @param {String} message                                                                                      // 3466
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types                  // 3467
   * @api public                                                                                                  // 3468
   */                                                                                                             // 3469
                                                                                                                  // 3470
  assert.doesNotThrow = function (fn, type, msg) {                                                                // 3471
    if ('string' === typeof type) {                                                                               // 3472
      msg = type;                                                                                                 // 3473
      type = null;                                                                                                // 3474
    }                                                                                                             // 3475
                                                                                                                  // 3476
    new Assertion(fn, msg).to.not.Throw(type);                                                                    // 3477
  };                                                                                                              // 3478
                                                                                                                  // 3479
  /**                                                                                                             // 3480
   * ### .operator(val1, operator, val2, [message])                                                               // 3481
   *                                                                                                              // 3482
   * Compares two values using `operator`.                                                                        // 3483
   *                                                                                                              // 3484
   *     assert.operator(1, '<', 2, 'everything is ok');                                                          // 3485
   *     assert.operator(1, '>', 2, 'this will fail');                                                            // 3486
   *                                                                                                              // 3487
   * @name operator                                                                                               // 3488
   * @param {Mixed} val1                                                                                          // 3489
   * @param {String} operator                                                                                     // 3490
   * @param {Mixed} val2                                                                                          // 3491
   * @param {String} message                                                                                      // 3492
   * @api public                                                                                                  // 3493
   */                                                                                                             // 3494
                                                                                                                  // 3495
  assert.operator = function (val, operator, val2, msg) {                                                         // 3496
    if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {                                   // 3497
      throw new Error('Invalid operator "' + operator + '"');                                                     // 3498
    }                                                                                                             // 3499
    var test = new Assertion(eval(val + operator + val2), msg);                                                   // 3500
    test.assert(                                                                                                  // 3501
        true === flag(test, 'object')                                                                             // 3502
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)                         // 3503
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );                  // 3504
  };                                                                                                              // 3505
                                                                                                                  // 3506
  /**                                                                                                             // 3507
   * ### .closeTo(actual, expected, delta, [message])                                                             // 3508
   *                                                                                                              // 3509
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.                                  // 3510
   *                                                                                                              // 3511
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');                                                        // 3512
   *                                                                                                              // 3513
   * @name closeTo                                                                                                // 3514
   * @param {Number} actual                                                                                       // 3515
   * @param {Number} expected                                                                                     // 3516
   * @param {Number} delta                                                                                        // 3517
   * @param {String} message                                                                                      // 3518
   * @api public                                                                                                  // 3519
   */                                                                                                             // 3520
                                                                                                                  // 3521
  assert.closeTo = function (act, exp, delta, msg) {                                                              // 3522
    new Assertion(act, msg).to.be.closeTo(exp, delta);                                                            // 3523
  };                                                                                                              // 3524
                                                                                                                  // 3525
  /**                                                                                                             // 3526
   * ### .sameMembers(set1, set2, [message])                                                                      // 3527
   *                                                                                                              // 3528
   * Asserts that `set1` and `set2` have the same members.                                                        // 3529
   * Order is not taken into account.                                                                             // 3530
   *                                                                                                              // 3531
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');                                            // 3532
   *                                                                                                              // 3533
   * @name sameMembers                                                                                            // 3534
   * @param {Array} set1                                                                                          // 3535
   * @param {Array} set2                                                                                          // 3536
   * @param {String} message                                                                                      // 3537
   * @api public                                                                                                  // 3538
   */                                                                                                             // 3539
                                                                                                                  // 3540
  assert.sameMembers = function (set1, set2, msg) {                                                               // 3541
    new Assertion(set1, msg).to.have.same.members(set2);                                                          // 3542
  }                                                                                                               // 3543
                                                                                                                  // 3544
  /**                                                                                                             // 3545
   * ### .sameDeepMembers(set1, set2, [message])                                                                  // 3546
   *                                                                                                              // 3547
   * Asserts that `set1` and `set2` have the same members - using a deep equality checking.                       // 3548
   * Order is not taken into account.                                                                             // 3549
   *                                                                                                              // 3550
   *     assert.sameDeepMembers([ {b: 3}, {a: 2}, {c: 5} ], [ {c: 5}, {b: 3}, {a: 2} ], 'same deep members');     // 3551
   *                                                                                                              // 3552
   * @name sameDeepMembers                                                                                        // 3553
   * @param {Array} set1                                                                                          // 3554
   * @param {Array} set2                                                                                          // 3555
   * @param {String} message                                                                                      // 3556
   * @api public                                                                                                  // 3557
   */                                                                                                             // 3558
                                                                                                                  // 3559
  assert.sameDeepMembers = function (set1, set2, msg) {                                                           // 3560
    new Assertion(set1, msg).to.have.same.deep.members(set2);                                                     // 3561
  }                                                                                                               // 3562
                                                                                                                  // 3563
  /**                                                                                                             // 3564
   * ### .includeMembers(superset, subset, [message])                                                             // 3565
   *                                                                                                              // 3566
   * Asserts that `subset` is included in `superset`.                                                             // 3567
   * Order is not taken into account.                                                                             // 3568
   *                                                                                                              // 3569
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');                                         // 3570
   *                                                                                                              // 3571
   * @name includeMembers                                                                                         // 3572
   * @param {Array} superset                                                                                      // 3573
   * @param {Array} subset                                                                                        // 3574
   * @param {String} message                                                                                      // 3575
   * @api public                                                                                                  // 3576
   */                                                                                                             // 3577
                                                                                                                  // 3578
  assert.includeMembers = function (superset, subset, msg) {                                                      // 3579
    new Assertion(superset, msg).to.include.members(subset);                                                      // 3580
  }                                                                                                               // 3581
                                                                                                                  // 3582
   /**                                                                                                            // 3583
   * ### .changes(function, object, property)                                                                     // 3584
   *                                                                                                              // 3585
   * Asserts that a function changes the value of a property                                                      // 3586
   *                                                                                                              // 3587
   *     var obj = { val: 10 };                                                                                   // 3588
   *     var fn = function() { obj.val = 22 };                                                                    // 3589
   *     assert.changes(fn, obj, 'val');                                                                          // 3590
   *                                                                                                              // 3591
   * @name changes                                                                                                // 3592
   * @param {Function} modifier function                                                                          // 3593
   * @param {Object} object                                                                                       // 3594
   * @param {String} property name                                                                                // 3595
   * @param {String} message _optional_                                                                           // 3596
   * @api public                                                                                                  // 3597
   */                                                                                                             // 3598
                                                                                                                  // 3599
  assert.changes = function (fn, obj, prop) {                                                                     // 3600
    new Assertion(fn).to.change(obj, prop);                                                                       // 3601
  }                                                                                                               // 3602
                                                                                                                  // 3603
   /**                                                                                                            // 3604
   * ### .doesNotChange(function, object, property)                                                               // 3605
   *                                                                                                              // 3606
   * Asserts that a function does not changes the value of a property                                             // 3607
   *                                                                                                              // 3608
   *     var obj = { val: 10 };                                                                                   // 3609
   *     var fn = function() { console.log('foo'); };                                                             // 3610
   *     assert.doesNotChange(fn, obj, 'val');                                                                    // 3611
   *                                                                                                              // 3612
   * @name doesNotChange                                                                                          // 3613
   * @param {Function} modifier function                                                                          // 3614
   * @param {Object} object                                                                                       // 3615
   * @param {String} property name                                                                                // 3616
   * @param {String} message _optional_                                                                           // 3617
   * @api public                                                                                                  // 3618
   */                                                                                                             // 3619
                                                                                                                  // 3620
  assert.doesNotChange = function (fn, obj, prop) {                                                               // 3621
    new Assertion(fn).to.not.change(obj, prop);                                                                   // 3622
  }                                                                                                               // 3623
                                                                                                                  // 3624
   /**                                                                                                            // 3625
   * ### .increases(function, object, property)                                                                   // 3626
   *                                                                                                              // 3627
   * Asserts that a function increases an object property                                                         // 3628
   *                                                                                                              // 3629
   *     var obj = { val: 10 };                                                                                   // 3630
   *     var fn = function() { obj.val = 13 };                                                                    // 3631
   *     assert.increases(fn, obj, 'val');                                                                        // 3632
   *                                                                                                              // 3633
   * @name increases                                                                                              // 3634
   * @param {Function} modifier function                                                                          // 3635
   * @param {Object} object                                                                                       // 3636
   * @param {String} property name                                                                                // 3637
   * @param {String} message _optional_                                                                           // 3638
   * @api public                                                                                                  // 3639
   */                                                                                                             // 3640
                                                                                                                  // 3641
  assert.increases = function (fn, obj, prop) {                                                                   // 3642
    new Assertion(fn).to.increase(obj, prop);                                                                     // 3643
  }                                                                                                               // 3644
                                                                                                                  // 3645
   /**                                                                                                            // 3646
   * ### .doesNotIncrease(function, object, property)                                                             // 3647
   *                                                                                                              // 3648
   * Asserts that a function does not increase object property                                                    // 3649
   *                                                                                                              // 3650
   *     var obj = { val: 10 };                                                                                   // 3651
   *     var fn = function() { obj.val = 8 };                                                                     // 3652
   *     assert.doesNotIncrease(fn, obj, 'val');                                                                  // 3653
   *                                                                                                              // 3654
   * @name doesNotIncrease                                                                                        // 3655
   * @param {Function} modifier function                                                                          // 3656
   * @param {Object} object                                                                                       // 3657
   * @param {String} property name                                                                                // 3658
   * @param {String} message _optional_                                                                           // 3659
   * @api public                                                                                                  // 3660
   */                                                                                                             // 3661
                                                                                                                  // 3662
  assert.doesNotIncrease = function (fn, obj, prop) {                                                             // 3663
    new Assertion(fn).to.not.increase(obj, prop);                                                                 // 3664
  }                                                                                                               // 3665
                                                                                                                  // 3666
   /**                                                                                                            // 3667
   * ### .decreases(function, object, property)                                                                   // 3668
   *                                                                                                              // 3669
   * Asserts that a function decreases an object property                                                         // 3670
   *                                                                                                              // 3671
   *     var obj = { val: 10 };                                                                                   // 3672
   *     var fn = function() { obj.val = 5 };                                                                     // 3673
   *     assert.decreases(fn, obj, 'val');                                                                        // 3674
   *                                                                                                              // 3675
   * @name decreases                                                                                              // 3676
   * @param {Function} modifier function                                                                          // 3677
   * @param {Object} object                                                                                       // 3678
   * @param {String} property name                                                                                // 3679
   * @param {String} message _optional_                                                                           // 3680
   * @api public                                                                                                  // 3681
   */                                                                                                             // 3682
                                                                                                                  // 3683
  assert.decreases = function (fn, obj, prop) {                                                                   // 3684
    new Assertion(fn).to.decrease(obj, prop);                                                                     // 3685
  }                                                                                                               // 3686
                                                                                                                  // 3687
   /**                                                                                                            // 3688
   * ### .doesNotDecrease(function, object, property)                                                             // 3689
   *                                                                                                              // 3690
   * Asserts that a function does not decreases an object property                                                // 3691
   *                                                                                                              // 3692
   *     var obj = { val: 10 };                                                                                   // 3693
   *     var fn = function() { obj.val = 15 };                                                                    // 3694
   *     assert.doesNotDecrease(fn, obj, 'val');                                                                  // 3695
   *                                                                                                              // 3696
   * @name doesNotDecrease                                                                                        // 3697
   * @param {Function} modifier function                                                                          // 3698
   * @param {Object} object                                                                                       // 3699
   * @param {String} property name                                                                                // 3700
   * @param {String} message _optional_                                                                           // 3701
   * @api public                                                                                                  // 3702
   */                                                                                                             // 3703
                                                                                                                  // 3704
  assert.doesNotDecrease = function (fn, obj, prop) {                                                             // 3705
    new Assertion(fn).to.not.decrease(obj, prop);                                                                 // 3706
  }                                                                                                               // 3707
                                                                                                                  // 3708
  /*!                                                                                                             // 3709
   * Undocumented / untested                                                                                      // 3710
   */                                                                                                             // 3711
                                                                                                                  // 3712
  assert.ifError = function (val, msg) {                                                                          // 3713
    new Assertion(val, msg).to.not.be.ok;                                                                         // 3714
  };                                                                                                              // 3715
                                                                                                                  // 3716
  /*!                                                                                                             // 3717
   * Aliases.                                                                                                     // 3718
   */                                                                                                             // 3719
                                                                                                                  // 3720
  (function alias(name, as){                                                                                      // 3721
    assert[as] = assert[name];                                                                                    // 3722
    return alias;                                                                                                 // 3723
  })                                                                                                              // 3724
  ('Throw', 'throw')                                                                                              // 3725
  ('Throw', 'throws');                                                                                            // 3726
};                                                                                                                // 3727
                                                                                                                  // 3728
});                                                                                                               // 3729
                                                                                                                  // 3730
require.register("chai/lib/chai/interface/expect.js", function (exports, module) {                                // 3731
/*!                                                                                                               // 3732
 * chai                                                                                                           // 3733
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 3734
 * MIT Licensed                                                                                                   // 3735
 */                                                                                                               // 3736
                                                                                                                  // 3737
module.exports = function (chai, util) {                                                                          // 3738
  chai.expect = function (val, message) {                                                                         // 3739
    return new chai.Assertion(val, message);                                                                      // 3740
  };                                                                                                              // 3741
                                                                                                                  // 3742
  /**                                                                                                             // 3743
   * ### .fail(actual, expected, [message], [operator])                                                           // 3744
   *                                                                                                              // 3745
   * Throw a failure.                                                                                             // 3746
   *                                                                                                              // 3747
   * @name fail                                                                                                   // 3748
   * @param {Mixed} actual                                                                                        // 3749
   * @param {Mixed} expected                                                                                      // 3750
   * @param {String} message                                                                                      // 3751
   * @param {String} operator                                                                                     // 3752
   * @api public                                                                                                  // 3753
   */                                                                                                             // 3754
                                                                                                                  // 3755
  chai.expect.fail = function (actual, expected, message, operator) {                                             // 3756
    message = message || 'expect.fail()';                                                                         // 3757
    throw new chai.AssertionError(message, {                                                                      // 3758
        actual: actual                                                                                            // 3759
      , expected: expected                                                                                        // 3760
      , operator: operator                                                                                        // 3761
    }, chai.expect.fail);                                                                                         // 3762
  };                                                                                                              // 3763
};                                                                                                                // 3764
                                                                                                                  // 3765
});                                                                                                               // 3766
                                                                                                                  // 3767
require.register("chai/lib/chai/interface/should.js", function (exports, module) {                                // 3768
/*!                                                                                                               // 3769
 * chai                                                                                                           // 3770
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 3771
 * MIT Licensed                                                                                                   // 3772
 */                                                                                                               // 3773
                                                                                                                  // 3774
module.exports = function (chai, util) {                                                                          // 3775
  var Assertion = chai.Assertion;                                                                                 // 3776
                                                                                                                  // 3777
  function loadShould () {                                                                                        // 3778
    // explicitly define this method as function as to have it's name to include as `ssfi`                        // 3779
    function shouldGetter() {                                                                                     // 3780
      if (this instanceof String || this instanceof Number) {                                                     // 3781
        return new Assertion(this.constructor(this), null, shouldGetter);                                         // 3782
      } else if (this instanceof Boolean) {                                                                       // 3783
        return new Assertion(this == true, null, shouldGetter);                                                   // 3784
      }                                                                                                           // 3785
      return new Assertion(this, null, shouldGetter);                                                             // 3786
    }                                                                                                             // 3787
    function shouldSetter(value) {                                                                                // 3788
      // See https://github.com/chaijs/chai/issues/86: this makes                                                 // 3789
      // `whatever.should = someValue` actually set `someValue`, which is                                         // 3790
      // especially useful for `global.should = require('chai').should()`.                                        // 3791
      //                                                                                                          // 3792
      // Note that we have to use [[DefineProperty]] instead of [[Put]]                                           // 3793
      // since otherwise we would trigger this very setter!                                                       // 3794
      Object.defineProperty(this, 'should', {                                                                     // 3795
        value: value,                                                                                             // 3796
        enumerable: true,                                                                                         // 3797
        configurable: true,                                                                                       // 3798
        writable: true                                                                                            // 3799
      });                                                                                                         // 3800
    }                                                                                                             // 3801
    // modify Object.prototype to have `should`                                                                   // 3802
    Object.defineProperty(Object.prototype, 'should', {                                                           // 3803
      set: shouldSetter                                                                                           // 3804
      , get: shouldGetter                                                                                         // 3805
      , configurable: true                                                                                        // 3806
    });                                                                                                           // 3807
                                                                                                                  // 3808
    var should = {};                                                                                              // 3809
                                                                                                                  // 3810
    /**                                                                                                           // 3811
     * ### .fail(actual, expected, [message], [operator])                                                         // 3812
     *                                                                                                            // 3813
     * Throw a failure.                                                                                           // 3814
     *                                                                                                            // 3815
     * @name fail                                                                                                 // 3816
     * @param {Mixed} actual                                                                                      // 3817
     * @param {Mixed} expected                                                                                    // 3818
     * @param {String} message                                                                                    // 3819
     * @param {String} operator                                                                                   // 3820
     * @api public                                                                                                // 3821
     */                                                                                                           // 3822
                                                                                                                  // 3823
    should.fail = function (actual, expected, message, operator) {                                                // 3824
      message = message || 'should.fail()';                                                                       // 3825
      throw new chai.AssertionError(message, {                                                                    // 3826
          actual: actual                                                                                          // 3827
        , expected: expected                                                                                      // 3828
        , operator: operator                                                                                      // 3829
      }, should.fail);                                                                                            // 3830
    };                                                                                                            // 3831
                                                                                                                  // 3832
    should.equal = function (val1, val2, msg) {                                                                   // 3833
      new Assertion(val1, msg).to.equal(val2);                                                                    // 3834
    };                                                                                                            // 3835
                                                                                                                  // 3836
    should.Throw = function (fn, errt, errs, msg) {                                                               // 3837
      new Assertion(fn, msg).to.Throw(errt, errs);                                                                // 3838
    };                                                                                                            // 3839
                                                                                                                  // 3840
    should.exist = function (val, msg) {                                                                          // 3841
      new Assertion(val, msg).to.exist;                                                                           // 3842
    }                                                                                                             // 3843
                                                                                                                  // 3844
    // negation                                                                                                   // 3845
    should.not = {}                                                                                               // 3846
                                                                                                                  // 3847
    should.not.equal = function (val1, val2, msg) {                                                               // 3848
      new Assertion(val1, msg).to.not.equal(val2);                                                                // 3849
    };                                                                                                            // 3850
                                                                                                                  // 3851
    should.not.Throw = function (fn, errt, errs, msg) {                                                           // 3852
      new Assertion(fn, msg).to.not.Throw(errt, errs);                                                            // 3853
    };                                                                                                            // 3854
                                                                                                                  // 3855
    should.not.exist = function (val, msg) {                                                                      // 3856
      new Assertion(val, msg).to.not.exist;                                                                       // 3857
    }                                                                                                             // 3858
                                                                                                                  // 3859
    should['throw'] = should['Throw'];                                                                            // 3860
    should.not['throw'] = should.not['Throw'];                                                                    // 3861
                                                                                                                  // 3862
    return should;                                                                                                // 3863
  };                                                                                                              // 3864
                                                                                                                  // 3865
  chai.should = loadShould;                                                                                       // 3866
  chai.Should = loadShould;                                                                                       // 3867
};                                                                                                                // 3868
                                                                                                                  // 3869
});                                                                                                               // 3870
                                                                                                                  // 3871
require.register("chai/lib/chai/utils/addChainableMethod.js", function (exports, module) {                        // 3872
/*!                                                                                                               // 3873
 * Chai - addChainingMethod utility                                                                               // 3874
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 3875
 * MIT Licensed                                                                                                   // 3876
 */                                                                                                               // 3877
                                                                                                                  // 3878
/*!                                                                                                               // 3879
 * Module dependencies                                                                                            // 3880
 */                                                                                                               // 3881
                                                                                                                  // 3882
var transferFlags = require('chai/lib/chai/utils/transferFlags.js');                                              // 3883
var flag = require('chai/lib/chai/utils/flag.js');                                                                // 3884
var config = require('chai/lib/chai/config.js');                                                                  // 3885
                                                                                                                  // 3886
/*!                                                                                                               // 3887
 * Module variables                                                                                               // 3888
 */                                                                                                               // 3889
                                                                                                                  // 3890
// Check whether `__proto__` is supported                                                                         // 3891
var hasProtoSupport = '__proto__' in Object;                                                                      // 3892
                                                                                                                  // 3893
// Without `__proto__` support, this module will need to add properties to a function.                            // 3894
// However, some Function.prototype methods cannot be overwritten,                                                // 3895
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).                        // 3896
var excludeNames = /^(?:length|name|arguments|caller)$/;                                                          // 3897
                                                                                                                  // 3898
// Cache `Function` properties                                                                                    // 3899
var call  = Function.prototype.call,                                                                              // 3900
    apply = Function.prototype.apply;                                                                             // 3901
                                                                                                                  // 3902
/**                                                                                                               // 3903
 * ### addChainableMethod (ctx, name, method, chainingBehavior)                                                   // 3904
 *                                                                                                                // 3905
 * Adds a method to an object, such that the method can also be chained.                                          // 3906
 *                                                                                                                // 3907
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {                                 // 3908
 *       var obj = utils.flag(this, 'object');                                                                    // 3909
 *       new chai.Assertion(obj).to.be.equal(str);                                                                // 3910
 *     });                                                                                                        // 3911
 *                                                                                                                // 3912
 * Can also be accessed directly from `chai.Assertion`.                                                           // 3913
 *                                                                                                                // 3914
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);                                            // 3915
 *                                                                                                                // 3916
 * The result can then be used as both a method assertion, executing both `method` and                            // 3917
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.                            // 3918
 *                                                                                                                // 3919
 *     expect(fooStr).to.be.foo('bar');                                                                           // 3920
 *     expect(fooStr).to.be.foo.equal('foo');                                                                     // 3921
 *                                                                                                                // 3922
 * @param {Object} ctx object to which the method is added                                                        // 3923
 * @param {String} name of method to add                                                                          // 3924
 * @param {Function} method function to be used for `name`, when called                                           // 3925
 * @param {Function} chainingBehavior function to be called every time the property is accessed                   // 3926
 * @name addChainableMethod                                                                                       // 3927
 * @api public                                                                                                    // 3928
 */                                                                                                               // 3929
                                                                                                                  // 3930
module.exports = function (ctx, name, method, chainingBehavior) {                                                 // 3931
  if (typeof chainingBehavior !== 'function') {                                                                   // 3932
    chainingBehavior = function () { };                                                                           // 3933
  }                                                                                                               // 3934
                                                                                                                  // 3935
  var chainableBehavior = {                                                                                       // 3936
      method: method                                                                                              // 3937
    , chainingBehavior: chainingBehavior                                                                          // 3938
  };                                                                                                              // 3939
                                                                                                                  // 3940
  // save the methods so we can overwrite them later, if we need to.                                              // 3941
  if (!ctx.__methods) {                                                                                           // 3942
    ctx.__methods = {};                                                                                           // 3943
  }                                                                                                               // 3944
  ctx.__methods[name] = chainableBehavior;                                                                        // 3945
                                                                                                                  // 3946
  Object.defineProperty(ctx, name,                                                                                // 3947
    { get: function () {                                                                                          // 3948
        chainableBehavior.chainingBehavior.call(this);                                                            // 3949
                                                                                                                  // 3950
        var assert = function assert() {                                                                          // 3951
          var old_ssfi = flag(this, 'ssfi');                                                                      // 3952
          if (old_ssfi && config.includeStack === false)                                                          // 3953
            flag(this, 'ssfi', assert);                                                                           // 3954
          var result = chainableBehavior.method.apply(this, arguments);                                           // 3955
          return result === undefined ? this : result;                                                            // 3956
        };                                                                                                        // 3957
                                                                                                                  // 3958
        // Use `__proto__` if available                                                                           // 3959
        if (hasProtoSupport) {                                                                                    // 3960
          // Inherit all properties from the object by replacing the `Function` prototype                         // 3961
          var prototype = assert.__proto__ = Object.create(this);                                                 // 3962
          // Restore the `call` and `apply` methods from `Function`                                               // 3963
          prototype.call = call;                                                                                  // 3964
          prototype.apply = apply;                                                                                // 3965
        }                                                                                                         // 3966
        // Otherwise, redefine all properties (slow!)                                                             // 3967
        else {                                                                                                    // 3968
          var asserterNames = Object.getOwnPropertyNames(ctx);                                                    // 3969
          asserterNames.forEach(function (asserterName) {                                                         // 3970
            if (!excludeNames.test(asserterName)) {                                                               // 3971
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);                                        // 3972
              Object.defineProperty(assert, asserterName, pd);                                                    // 3973
            }                                                                                                     // 3974
          });                                                                                                     // 3975
        }                                                                                                         // 3976
                                                                                                                  // 3977
        transferFlags(this, assert);                                                                              // 3978
        return assert;                                                                                            // 3979
      }                                                                                                           // 3980
    , configurable: true                                                                                          // 3981
  });                                                                                                             // 3982
};                                                                                                                // 3983
                                                                                                                  // 3984
});                                                                                                               // 3985
                                                                                                                  // 3986
require.register("chai/lib/chai/utils/addMethod.js", function (exports, module) {                                 // 3987
/*!                                                                                                               // 3988
 * Chai - addMethod utility                                                                                       // 3989
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 3990
 * MIT Licensed                                                                                                   // 3991
 */                                                                                                               // 3992
                                                                                                                  // 3993
var config = require('chai/lib/chai/config.js');                                                                  // 3994
                                                                                                                  // 3995
/**                                                                                                               // 3996
 * ### .addMethod (ctx, name, method)                                                                             // 3997
 *                                                                                                                // 3998
 * Adds a method to the prototype of an object.                                                                   // 3999
 *                                                                                                                // 4000
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {                                          // 4001
 *       var obj = utils.flag(this, 'object');                                                                    // 4002
 *       new chai.Assertion(obj).to.be.equal(str);                                                                // 4003
 *     });                                                                                                        // 4004
 *                                                                                                                // 4005
 * Can also be accessed directly from `chai.Assertion`.                                                           // 4006
 *                                                                                                                // 4007
 *     chai.Assertion.addMethod('foo', fn);                                                                       // 4008
 *                                                                                                                // 4009
 * Then can be used as any other assertion.                                                                       // 4010
 *                                                                                                                // 4011
 *     expect(fooStr).to.be.foo('bar');                                                                           // 4012
 *                                                                                                                // 4013
 * @param {Object} ctx object to which the method is added                                                        // 4014
 * @param {String} name of method to add                                                                          // 4015
 * @param {Function} method function to be used for name                                                          // 4016
 * @name addMethod                                                                                                // 4017
 * @api public                                                                                                    // 4018
 */                                                                                                               // 4019
var flag = require('chai/lib/chai/utils/flag.js');                                                                // 4020
                                                                                                                  // 4021
module.exports = function (ctx, name, method) {                                                                   // 4022
  ctx[name] = function () {                                                                                       // 4023
    var old_ssfi = flag(this, 'ssfi');                                                                            // 4024
    if (old_ssfi && config.includeStack === false)                                                                // 4025
      flag(this, 'ssfi', ctx[name]);                                                                              // 4026
    var result = method.apply(this, arguments);                                                                   // 4027
    return result === undefined ? this : result;                                                                  // 4028
  };                                                                                                              // 4029
};                                                                                                                // 4030
                                                                                                                  // 4031
});                                                                                                               // 4032
                                                                                                                  // 4033
require.register("chai/lib/chai/utils/addProperty.js", function (exports, module) {                               // 4034
/*!                                                                                                               // 4035
 * Chai - addProperty utility                                                                                     // 4036
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4037
 * MIT Licensed                                                                                                   // 4038
 */                                                                                                               // 4039
                                                                                                                  // 4040
/**                                                                                                               // 4041
 * ### addProperty (ctx, name, getter)                                                                            // 4042
 *                                                                                                                // 4043
 * Adds a property to the prototype of an object.                                                                 // 4044
 *                                                                                                                // 4045
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {                                           // 4046
 *       var obj = utils.flag(this, 'object');                                                                    // 4047
 *       new chai.Assertion(obj).to.be.instanceof(Foo);                                                           // 4048
 *     });                                                                                                        // 4049
 *                                                                                                                // 4050
 * Can also be accessed directly from `chai.Assertion`.                                                           // 4051
 *                                                                                                                // 4052
 *     chai.Assertion.addProperty('foo', fn);                                                                     // 4053
 *                                                                                                                // 4054
 * Then can be used as any other assertion.                                                                       // 4055
 *                                                                                                                // 4056
 *     expect(myFoo).to.be.foo;                                                                                   // 4057
 *                                                                                                                // 4058
 * @param {Object} ctx object to which the property is added                                                      // 4059
 * @param {String} name of property to add                                                                        // 4060
 * @param {Function} getter function to be used for name                                                          // 4061
 * @name addProperty                                                                                              // 4062
 * @api public                                                                                                    // 4063
 */                                                                                                               // 4064
                                                                                                                  // 4065
module.exports = function (ctx, name, getter) {                                                                   // 4066
  Object.defineProperty(ctx, name,                                                                                // 4067
    { get: function () {                                                                                          // 4068
        var result = getter.call(this);                                                                           // 4069
        return result === undefined ? this : result;                                                              // 4070
      }                                                                                                           // 4071
    , configurable: true                                                                                          // 4072
  });                                                                                                             // 4073
};                                                                                                                // 4074
                                                                                                                  // 4075
});                                                                                                               // 4076
                                                                                                                  // 4077
require.register("chai/lib/chai/utils/flag.js", function (exports, module) {                                      // 4078
/*!                                                                                                               // 4079
 * Chai - flag utility                                                                                            // 4080
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4081
 * MIT Licensed                                                                                                   // 4082
 */                                                                                                               // 4083
                                                                                                                  // 4084
/**                                                                                                               // 4085
 * ### flag(object, key, [value])                                                                                 // 4086
 *                                                                                                                // 4087
 * Get or set a flag value on an object. If a                                                                     // 4088
 * value is provided it will be set, else it will                                                                 // 4089
 * return the currently set value or `undefined` if                                                               // 4090
 * the value is not set.                                                                                          // 4091
 *                                                                                                                // 4092
 *     utils.flag(this, 'foo', 'bar'); // setter                                                                  // 4093
 *     utils.flag(this, 'foo'); // getter, returns `bar`                                                          // 4094
 *                                                                                                                // 4095
 * @param {Object} object constructed Assertion                                                                   // 4096
 * @param {String} key                                                                                            // 4097
 * @param {Mixed} value (optional)                                                                                // 4098
 * @name flag                                                                                                     // 4099
 * @api private                                                                                                   // 4100
 */                                                                                                               // 4101
                                                                                                                  // 4102
module.exports = function (obj, key, value) {                                                                     // 4103
  var flags = obj.__flags || (obj.__flags = Object.create(null));                                                 // 4104
  if (arguments.length === 3) {                                                                                   // 4105
    flags[key] = value;                                                                                           // 4106
  } else {                                                                                                        // 4107
    return flags[key];                                                                                            // 4108
  }                                                                                                               // 4109
};                                                                                                                // 4110
                                                                                                                  // 4111
});                                                                                                               // 4112
                                                                                                                  // 4113
require.register("chai/lib/chai/utils/getActual.js", function (exports, module) {                                 // 4114
/*!                                                                                                               // 4115
 * Chai - getActual utility                                                                                       // 4116
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4117
 * MIT Licensed                                                                                                   // 4118
 */                                                                                                               // 4119
                                                                                                                  // 4120
/**                                                                                                               // 4121
 * # getActual(object, [actual])                                                                                  // 4122
 *                                                                                                                // 4123
 * Returns the `actual` value for an Assertion                                                                    // 4124
 *                                                                                                                // 4125
 * @param {Object} object (constructed Assertion)                                                                 // 4126
 * @param {Arguments} chai.Assertion.prototype.assert arguments                                                   // 4127
 */                                                                                                               // 4128
                                                                                                                  // 4129
module.exports = function (obj, args) {                                                                           // 4130
  return args.length > 4 ? args[4] : obj._obj;                                                                    // 4131
};                                                                                                                // 4132
                                                                                                                  // 4133
});                                                                                                               // 4134
                                                                                                                  // 4135
require.register("chai/lib/chai/utils/getEnumerableProperties.js", function (exports, module) {                   // 4136
/*!                                                                                                               // 4137
 * Chai - getEnumerableProperties utility                                                                         // 4138
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4139
 * MIT Licensed                                                                                                   // 4140
 */                                                                                                               // 4141
                                                                                                                  // 4142
/**                                                                                                               // 4143
 * ### .getEnumerableProperties(object)                                                                           // 4144
 *                                                                                                                // 4145
 * This allows the retrieval of enumerable property names of an object,                                           // 4146
 * inherited or not.                                                                                              // 4147
 *                                                                                                                // 4148
 * @param {Object} object                                                                                         // 4149
 * @returns {Array}                                                                                               // 4150
 * @name getEnumerableProperties                                                                                  // 4151
 * @api public                                                                                                    // 4152
 */                                                                                                               // 4153
                                                                                                                  // 4154
module.exports = function getEnumerableProperties(object) {                                                       // 4155
  var result = [];                                                                                                // 4156
  for (var name in object) {                                                                                      // 4157
    result.push(name);                                                                                            // 4158
  }                                                                                                               // 4159
  return result;                                                                                                  // 4160
};                                                                                                                // 4161
                                                                                                                  // 4162
});                                                                                                               // 4163
                                                                                                                  // 4164
require.register("chai/lib/chai/utils/getMessage.js", function (exports, module) {                                // 4165
/*!                                                                                                               // 4166
 * Chai - message composition utility                                                                             // 4167
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4168
 * MIT Licensed                                                                                                   // 4169
 */                                                                                                               // 4170
                                                                                                                  // 4171
/*!                                                                                                               // 4172
 * Module dependancies                                                                                            // 4173
 */                                                                                                               // 4174
                                                                                                                  // 4175
var flag = require('chai/lib/chai/utils/flag.js')                                                                 // 4176
  , getActual = require('chai/lib/chai/utils/getActual.js')                                                       // 4177
  , inspect = require('chai/lib/chai/utils/inspect.js')                                                           // 4178
  , objDisplay = require('chai/lib/chai/utils/objDisplay.js');                                                    // 4179
                                                                                                                  // 4180
/**                                                                                                               // 4181
 * ### .getMessage(object, message, negateMessage)                                                                // 4182
 *                                                                                                                // 4183
 * Construct the error message based on flags                                                                     // 4184
 * and template tags. Template tags will return                                                                   // 4185
 * a stringified inspection of the object referenced.                                                             // 4186
 *                                                                                                                // 4187
 * Message template tags:                                                                                         // 4188
 * - `#{this}` current asserted object                                                                            // 4189
 * - `#{act}` actual value                                                                                        // 4190
 * - `#{exp}` expected value                                                                                      // 4191
 *                                                                                                                // 4192
 * @param {Object} object (constructed Assertion)                                                                 // 4193
 * @param {Arguments} chai.Assertion.prototype.assert arguments                                                   // 4194
 * @name getMessage                                                                                               // 4195
 * @api public                                                                                                    // 4196
 */                                                                                                               // 4197
                                                                                                                  // 4198
module.exports = function (obj, args) {                                                                           // 4199
  var negate = flag(obj, 'negate')                                                                                // 4200
    , val = flag(obj, 'object')                                                                                   // 4201
    , expected = args[3]                                                                                          // 4202
    , actual = getActual(obj, args)                                                                               // 4203
    , msg = negate ? args[2] : args[1]                                                                            // 4204
    , flagMsg = flag(obj, 'message');                                                                             // 4205
                                                                                                                  // 4206
  if(typeof msg === "function") msg = msg();                                                                      // 4207
  msg = msg || '';                                                                                                // 4208
  msg = msg                                                                                                       // 4209
    .replace(/#{this}/g, objDisplay(val))                                                                         // 4210
    .replace(/#{act}/g, objDisplay(actual))                                                                       // 4211
    .replace(/#{exp}/g, objDisplay(expected));                                                                    // 4212
                                                                                                                  // 4213
  return flagMsg ? flagMsg + ': ' + msg : msg;                                                                    // 4214
};                                                                                                                // 4215
                                                                                                                  // 4216
});                                                                                                               // 4217
                                                                                                                  // 4218
require.register("chai/lib/chai/utils/getName.js", function (exports, module) {                                   // 4219
/*!                                                                                                               // 4220
 * Chai - getName utility                                                                                         // 4221
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4222
 * MIT Licensed                                                                                                   // 4223
 */                                                                                                               // 4224
                                                                                                                  // 4225
/**                                                                                                               // 4226
 * # getName(func)                                                                                                // 4227
 *                                                                                                                // 4228
 * Gets the name of a function, in a cross-browser way.                                                           // 4229
 *                                                                                                                // 4230
 * @param {Function} a function (usually a constructor)                                                           // 4231
 */                                                                                                               // 4232
                                                                                                                  // 4233
module.exports = function (func) {                                                                                // 4234
  if (func.name) return func.name;                                                                                // 4235
                                                                                                                  // 4236
  var match = /^\s?function ([^(]*)\(/.exec(func);                                                                // 4237
  return match && match[1] ? match[1] : "";                                                                       // 4238
};                                                                                                                // 4239
                                                                                                                  // 4240
});                                                                                                               // 4241
                                                                                                                  // 4242
require.register("chai/lib/chai/utils/getPathValue.js", function (exports, module) {                              // 4243
/*!                                                                                                               // 4244
 * Chai - getPathValue utility                                                                                    // 4245
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4246
 * @see https://github.com/logicalparadox/filtr                                                                   // 4247
 * MIT Licensed                                                                                                   // 4248
 */                                                                                                               // 4249
                                                                                                                  // 4250
var getPathInfo = require('chai/lib/chai/utils/getPathInfo.js');                                                  // 4251
                                                                                                                  // 4252
/**                                                                                                               // 4253
 * ### .getPathValue(path, object)                                                                                // 4254
 *                                                                                                                // 4255
 * This allows the retrieval of values in an                                                                      // 4256
 * object given a string path.                                                                                    // 4257
 *                                                                                                                // 4258
 *     var obj = {                                                                                                // 4259
 *         prop1: {                                                                                               // 4260
 *             arr: ['a', 'b', 'c']                                                                               // 4261
 *           , str: 'Hello'                                                                                       // 4262
 *         }                                                                                                      // 4263
 *       , prop2: {                                                                                               // 4264
 *             arr: [ { nested: 'Universe' } ]                                                                    // 4265
 *           , str: 'Hello again!'                                                                                // 4266
 *         }                                                                                                      // 4267
 *     }                                                                                                          // 4268
 *                                                                                                                // 4269
 * The following would be the results.                                                                            // 4270
 *                                                                                                                // 4271
 *     getPathValue('prop1.str', obj); // Hello                                                                   // 4272
 *     getPathValue('prop1.att[2]', obj); // b                                                                    // 4273
 *     getPathValue('prop2.arr[0].nested', obj); // Universe                                                      // 4274
 *                                                                                                                // 4275
 * @param {String} path                                                                                           // 4276
 * @param {Object} object                                                                                         // 4277
 * @returns {Object} value or `undefined`                                                                         // 4278
 * @name getPathValue                                                                                             // 4279
 * @api public                                                                                                    // 4280
 */                                                                                                               // 4281
module.exports = function(path, obj) {                                                                            // 4282
  var info = getPathInfo(path, obj);                                                                              // 4283
  return info.value;                                                                                              // 4284
};                                                                                                                // 4285
                                                                                                                  // 4286
});                                                                                                               // 4287
                                                                                                                  // 4288
require.register("chai/lib/chai/utils/getPathInfo.js", function (exports, module) {                               // 4289
/*!                                                                                                               // 4290
 * Chai - getPathInfo utility                                                                                     // 4291
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4292
 * MIT Licensed                                                                                                   // 4293
 */                                                                                                               // 4294
                                                                                                                  // 4295
var hasProperty = require('chai/lib/chai/utils/hasProperty.js');                                                  // 4296
                                                                                                                  // 4297
/**                                                                                                               // 4298
 * ### .getPathInfo(path, object)                                                                                 // 4299
 *                                                                                                                // 4300
 * This allows the retrieval of property info in an                                                               // 4301
 * object given a string path.                                                                                    // 4302
 *                                                                                                                // 4303
 * The path info consists of an object with the                                                                   // 4304
 * following properties:                                                                                          // 4305
 *                                                                                                                // 4306
 * * parent - The parent object of the property referenced by `path`                                              // 4307
 * * name - The name of the final property, a number if it was an array indexer                                   // 4308
 * * value - The value of the property, if it exists, otherwise `undefined`                                       // 4309
 * * exists - Whether the property exists or not                                                                  // 4310
 *                                                                                                                // 4311
 * @param {String} path                                                                                           // 4312
 * @param {Object} object                                                                                         // 4313
 * @returns {Object} info                                                                                         // 4314
 * @name getPathInfo                                                                                              // 4315
 * @api public                                                                                                    // 4316
 */                                                                                                               // 4317
                                                                                                                  // 4318
module.exports = function getPathInfo(path, obj) {                                                                // 4319
  var parsed = parsePath(path),                                                                                   // 4320
      last = parsed[parsed.length - 1];                                                                           // 4321
                                                                                                                  // 4322
  var info = {                                                                                                    // 4323
    parent: _getPathValue(parsed, obj, parsed.length - 1),                                                        // 4324
    name: last.p || last.i,                                                                                       // 4325
    value: _getPathValue(parsed, obj),                                                                            // 4326
  };                                                                                                              // 4327
  info.exists = hasProperty(info.name, info.parent);                                                              // 4328
                                                                                                                  // 4329
  return info;                                                                                                    // 4330
};                                                                                                                // 4331
                                                                                                                  // 4332
                                                                                                                  // 4333
/*!                                                                                                               // 4334
 * ## parsePath(path)                                                                                             // 4335
 *                                                                                                                // 4336
 * Helper function used to parse string object                                                                    // 4337
 * paths. Use in conjunction with `_getPathValue`.                                                                // 4338
 *                                                                                                                // 4339
 *      var parsed = parsePath('myobject.property.subprop');                                                      // 4340
 *                                                                                                                // 4341
 * ### Paths:                                                                                                     // 4342
 *                                                                                                                // 4343
 * * Can be as near infinitely deep and nested                                                                    // 4344
 * * Arrays are also valid using the formal `myobject.document[3].property`.                                      // 4345
 *                                                                                                                // 4346
 * @param {String} path                                                                                           // 4347
 * @returns {Object} parsed                                                                                       // 4348
 * @api private                                                                                                   // 4349
 */                                                                                                               // 4350
                                                                                                                  // 4351
function parsePath (path) {                                                                                       // 4352
  var str = path.replace(/\[/g, '.[')                                                                             // 4353
    , parts = str.match(/(\\\.|[^.]+?)+/g);                                                                       // 4354
  return parts.map(function (value) {                                                                             // 4355
    var re = /\[(\d+)\]$/                                                                                         // 4356
      , mArr = re.exec(value);                                                                                    // 4357
    if (mArr) return { i: parseFloat(mArr[1]) };                                                                  // 4358
    else return { p: value };                                                                                     // 4359
  });                                                                                                             // 4360
}                                                                                                                 // 4361
                                                                                                                  // 4362
                                                                                                                  // 4363
/*!                                                                                                               // 4364
 * ## _getPathValue(parsed, obj)                                                                                  // 4365
 *                                                                                                                // 4366
 * Helper companion function for `.parsePath` that returns                                                        // 4367
 * the value located at the parsed address.                                                                       // 4368
 *                                                                                                                // 4369
 *      var value = getPathValue(parsed, obj);                                                                    // 4370
 *                                                                                                                // 4371
 * @param {Object} parsed definition from `parsePath`.                                                            // 4372
 * @param {Object} object to search against                                                                       // 4373
 * @param {Number} object to search against                                                                       // 4374
 * @returns {Object|Undefined} value                                                                              // 4375
 * @api private                                                                                                   // 4376
 */                                                                                                               // 4377
                                                                                                                  // 4378
function _getPathValue (parsed, obj, index) {                                                                     // 4379
  var tmp = obj                                                                                                   // 4380
    , res;                                                                                                        // 4381
                                                                                                                  // 4382
  index = (index === undefined ? parsed.length : index);                                                          // 4383
                                                                                                                  // 4384
  for (var i = 0, l = index; i < l; i++) {                                                                        // 4385
    var part = parsed[i];                                                                                         // 4386
    if (tmp) {                                                                                                    // 4387
      if ('undefined' !== typeof part.p)                                                                          // 4388
        tmp = tmp[part.p];                                                                                        // 4389
      else if ('undefined' !== typeof part.i)                                                                     // 4390
        tmp = tmp[part.i];                                                                                        // 4391
      if (i == (l - 1)) res = tmp;                                                                                // 4392
    } else {                                                                                                      // 4393
      res = undefined;                                                                                            // 4394
    }                                                                                                             // 4395
  }                                                                                                               // 4396
  return res;                                                                                                     // 4397
}                                                                                                                 // 4398
                                                                                                                  // 4399
});                                                                                                               // 4400
                                                                                                                  // 4401
require.register("chai/lib/chai/utils/hasProperty.js", function (exports, module) {                               // 4402
/*!                                                                                                               // 4403
 * Chai - hasProperty utility                                                                                     // 4404
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4405
 * MIT Licensed                                                                                                   // 4406
 */                                                                                                               // 4407
                                                                                                                  // 4408
var type = require('chai/lib/chai/utils/type.js');                                                                // 4409
                                                                                                                  // 4410
/**                                                                                                               // 4411
 * ### .hasProperty(object, name)                                                                                 // 4412
 *                                                                                                                // 4413
 * This allows checking whether an object has                                                                     // 4414
 * named property or numeric array index.                                                                         // 4415
 *                                                                                                                // 4416
 * Basically does the same thing as the `in`                                                                      // 4417
 * operator but works properly with natives                                                                       // 4418
 * and null/undefined values.                                                                                     // 4419
 *                                                                                                                // 4420
 *     var obj = {                                                                                                // 4421
 *         arr: ['a', 'b', 'c']                                                                                   // 4422
 *       , str: 'Hello'                                                                                           // 4423
 *     }                                                                                                          // 4424
 *                                                                                                                // 4425
 * The following would be the results.                                                                            // 4426
 *                                                                                                                // 4427
 *     hasProperty('str', obj);  // true                                                                          // 4428
 *     hasProperty('constructor', obj);  // true                                                                  // 4429
 *     hasProperty('bar', obj);  // false                                                                         // 4430
 *                                                                                                                // 4431
 *     hasProperty('length', obj.str); // true                                                                    // 4432
 *     hasProperty(1, obj.str);  // true                                                                          // 4433
 *     hasProperty(5, obj.str);  // false                                                                         // 4434
 *                                                                                                                // 4435
 *     hasProperty('length', obj.arr);  // true                                                                   // 4436
 *     hasProperty(2, obj.arr);  // true                                                                          // 4437
 *     hasProperty(3, obj.arr);  // false                                                                         // 4438
 *                                                                                                                // 4439
 * @param {Objuect} object                                                                                        // 4440
 * @param {String|Number} name                                                                                    // 4441
 * @returns {Boolean} whether it exists                                                                           // 4442
 * @name getPathInfo                                                                                              // 4443
 * @api public                                                                                                    // 4444
 */                                                                                                               // 4445
                                                                                                                  // 4446
var literals = {                                                                                                  // 4447
    'number': Number                                                                                              // 4448
  , 'string': String                                                                                              // 4449
};                                                                                                                // 4450
                                                                                                                  // 4451
module.exports = function hasProperty(name, obj) {                                                                // 4452
  var ot = type(obj);                                                                                             // 4453
                                                                                                                  // 4454
  // Bad Object, obviously no props at all                                                                        // 4455
  if(ot === 'null' || ot === 'undefined')                                                                         // 4456
    return false;                                                                                                 // 4457
                                                                                                                  // 4458
  // The `in` operator does not work with certain literals                                                        // 4459
  // box these before the check                                                                                   // 4460
  if(literals[ot] && typeof obj !== 'object')                                                                     // 4461
    obj = new literals[ot](obj);                                                                                  // 4462
                                                                                                                  // 4463
  return name in obj;                                                                                             // 4464
};                                                                                                                // 4465
                                                                                                                  // 4466
});                                                                                                               // 4467
                                                                                                                  // 4468
require.register("chai/lib/chai/utils/getProperties.js", function (exports, module) {                             // 4469
/*!                                                                                                               // 4470
 * Chai - getProperties utility                                                                                   // 4471
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4472
 * MIT Licensed                                                                                                   // 4473
 */                                                                                                               // 4474
                                                                                                                  // 4475
/**                                                                                                               // 4476
 * ### .getProperties(object)                                                                                     // 4477
 *                                                                                                                // 4478
 * This allows the retrieval of property names of an object, enumerable or not,                                   // 4479
 * inherited or not.                                                                                              // 4480
 *                                                                                                                // 4481
 * @param {Object} object                                                                                         // 4482
 * @returns {Array}                                                                                               // 4483
 * @name getProperties                                                                                            // 4484
 * @api public                                                                                                    // 4485
 */                                                                                                               // 4486
                                                                                                                  // 4487
module.exports = function getProperties(object) {                                                                 // 4488
  var result = Object.getOwnPropertyNames(subject);                                                               // 4489
                                                                                                                  // 4490
  function addProperty(property) {                                                                                // 4491
    if (result.indexOf(property) === -1) {                                                                        // 4492
      result.push(property);                                                                                      // 4493
    }                                                                                                             // 4494
  }                                                                                                               // 4495
                                                                                                                  // 4496
  var proto = Object.getPrototypeOf(subject);                                                                     // 4497
  while (proto !== null) {                                                                                        // 4498
    Object.getOwnPropertyNames(proto).forEach(addProperty);                                                       // 4499
    proto = Object.getPrototypeOf(proto);                                                                         // 4500
  }                                                                                                               // 4501
                                                                                                                  // 4502
  return result;                                                                                                  // 4503
};                                                                                                                // 4504
                                                                                                                  // 4505
});                                                                                                               // 4506
                                                                                                                  // 4507
require.register("chai/lib/chai/utils/index.js", function (exports, module) {                                     // 4508
/*!                                                                                                               // 4509
 * chai                                                                                                           // 4510
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>                                                         // 4511
 * MIT Licensed                                                                                                   // 4512
 */                                                                                                               // 4513
                                                                                                                  // 4514
/*!                                                                                                               // 4515
 * Main exports                                                                                                   // 4516
 */                                                                                                               // 4517
                                                                                                                  // 4518
var exports = module.exports = {};                                                                                // 4519
                                                                                                                  // 4520
/*!                                                                                                               // 4521
 * test utility                                                                                                   // 4522
 */                                                                                                               // 4523
                                                                                                                  // 4524
exports.test = require('chai/lib/chai/utils/test.js');                                                            // 4525
                                                                                                                  // 4526
/*!                                                                                                               // 4527
 * type utility                                                                                                   // 4528
 */                                                                                                               // 4529
                                                                                                                  // 4530
exports.type = require('chai/lib/chai/utils/type.js');                                                            // 4531
                                                                                                                  // 4532
/*!                                                                                                               // 4533
 * message utility                                                                                                // 4534
 */                                                                                                               // 4535
                                                                                                                  // 4536
exports.getMessage = require('chai/lib/chai/utils/getMessage.js');                                                // 4537
                                                                                                                  // 4538
/*!                                                                                                               // 4539
 * actual utility                                                                                                 // 4540
 */                                                                                                               // 4541
                                                                                                                  // 4542
exports.getActual = require('chai/lib/chai/utils/getActual.js');                                                  // 4543
                                                                                                                  // 4544
/*!                                                                                                               // 4545
 * Inspect util                                                                                                   // 4546
 */                                                                                                               // 4547
                                                                                                                  // 4548
exports.inspect = require('chai/lib/chai/utils/inspect.js');                                                      // 4549
                                                                                                                  // 4550
/*!                                                                                                               // 4551
 * Object Display util                                                                                            // 4552
 */                                                                                                               // 4553
                                                                                                                  // 4554
exports.objDisplay = require('chai/lib/chai/utils/objDisplay.js');                                                // 4555
                                                                                                                  // 4556
/*!                                                                                                               // 4557
 * Flag utility                                                                                                   // 4558
 */                                                                                                               // 4559
                                                                                                                  // 4560
exports.flag = require('chai/lib/chai/utils/flag.js');                                                            // 4561
                                                                                                                  // 4562
/*!                                                                                                               // 4563
 * Flag transferring utility                                                                                      // 4564
 */                                                                                                               // 4565
                                                                                                                  // 4566
exports.transferFlags = require('chai/lib/chai/utils/transferFlags.js');                                          // 4567
                                                                                                                  // 4568
/*!                                                                                                               // 4569
 * Deep equal utility                                                                                             // 4570
 */                                                                                                               // 4571
                                                                                                                  // 4572
exports.eql = require('chaijs~deep-eql@0.1.3');                                                                   // 4573
                                                                                                                  // 4574
/*!                                                                                                               // 4575
 * Deep path value                                                                                                // 4576
 */                                                                                                               // 4577
                                                                                                                  // 4578
exports.getPathValue = require('chai/lib/chai/utils/getPathValue.js');                                            // 4579
                                                                                                                  // 4580
/*!                                                                                                               // 4581
 * Deep path info                                                                                                 // 4582
 */                                                                                                               // 4583
                                                                                                                  // 4584
exports.getPathInfo = require('chai/lib/chai/utils/getPathInfo.js');                                              // 4585
                                                                                                                  // 4586
/*!                                                                                                               // 4587
 * Check if a property exists                                                                                     // 4588
 */                                                                                                               // 4589
                                                                                                                  // 4590
exports.hasProperty = require('chai/lib/chai/utils/hasProperty.js');                                              // 4591
                                                                                                                  // 4592
/*!                                                                                                               // 4593
 * Function name                                                                                                  // 4594
 */                                                                                                               // 4595
                                                                                                                  // 4596
exports.getName = require('chai/lib/chai/utils/getName.js');                                                      // 4597
                                                                                                                  // 4598
/*!                                                                                                               // 4599
 * add Property                                                                                                   // 4600
 */                                                                                                               // 4601
                                                                                                                  // 4602
exports.addProperty = require('chai/lib/chai/utils/addProperty.js');                                              // 4603
                                                                                                                  // 4604
/*!                                                                                                               // 4605
 * add Method                                                                                                     // 4606
 */                                                                                                               // 4607
                                                                                                                  // 4608
exports.addMethod = require('chai/lib/chai/utils/addMethod.js');                                                  // 4609
                                                                                                                  // 4610
/*!                                                                                                               // 4611
 * overwrite Property                                                                                             // 4612
 */                                                                                                               // 4613
                                                                                                                  // 4614
exports.overwriteProperty = require('chai/lib/chai/utils/overwriteProperty.js');                                  // 4615
                                                                                                                  // 4616
/*!                                                                                                               // 4617
 * overwrite Method                                                                                               // 4618
 */                                                                                                               // 4619
                                                                                                                  // 4620
exports.overwriteMethod = require('chai/lib/chai/utils/overwriteMethod.js');                                      // 4621
                                                                                                                  // 4622
/*!                                                                                                               // 4623
 * Add a chainable method                                                                                         // 4624
 */                                                                                                               // 4625
                                                                                                                  // 4626
exports.addChainableMethod = require('chai/lib/chai/utils/addChainableMethod.js');                                // 4627
                                                                                                                  // 4628
/*!                                                                                                               // 4629
 * Overwrite chainable method                                                                                     // 4630
 */                                                                                                               // 4631
                                                                                                                  // 4632
exports.overwriteChainableMethod = require('chai/lib/chai/utils/overwriteChainableMethod.js');                    // 4633
                                                                                                                  // 4634
                                                                                                                  // 4635
});                                                                                                               // 4636
                                                                                                                  // 4637
require.register("chai/lib/chai/utils/inspect.js", function (exports, module) {                                   // 4638
// This is (almost) directly from Node.js utils                                                                   // 4639
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js                       // 4640
                                                                                                                  // 4641
var getName = require('chai/lib/chai/utils/getName.js');                                                          // 4642
var getProperties = require('chai/lib/chai/utils/getProperties.js');                                              // 4643
var getEnumerableProperties = require('chai/lib/chai/utils/getEnumerableProperties.js');                          // 4644
                                                                                                                  // 4645
module.exports = inspect;                                                                                         // 4646
                                                                                                                  // 4647
/**                                                                                                               // 4648
 * Echos the value of a value. Trys to print the value out                                                        // 4649
 * in the best way possible given the different types.                                                            // 4650
 *                                                                                                                // 4651
 * @param {Object} obj The object to print out.                                                                   // 4652
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)                                            // 4653
 *    properties of objects.                                                                                      // 4654
 * @param {Number} depth Depth in which to descend in object. Default is 2.                                       // 4655
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the                                         // 4656
 *    output. Default is false (no coloring).                                                                     // 4657
 */                                                                                                               // 4658
function inspect(obj, showHidden, depth, colors) {                                                                // 4659
  var ctx = {                                                                                                     // 4660
    showHidden: showHidden,                                                                                       // 4661
    seen: [],                                                                                                     // 4662
    stylize: function (str) { return str; }                                                                       // 4663
  };                                                                                                              // 4664
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));                                       // 4665
}                                                                                                                 // 4666
                                                                                                                  // 4667
// Returns true if object is a DOM element.                                                                       // 4668
var isDOMElement = function (object) {                                                                            // 4669
  if (typeof HTMLElement === 'object') {                                                                          // 4670
    return object instanceof HTMLElement;                                                                         // 4671
  } else {                                                                                                        // 4672
    return object &&                                                                                              // 4673
      typeof object === 'object' &&                                                                               // 4674
      object.nodeType === 1 &&                                                                                    // 4675
      typeof object.nodeName === 'string';                                                                        // 4676
  }                                                                                                               // 4677
};                                                                                                                // 4678
                                                                                                                  // 4679
function formatValue(ctx, value, recurseTimes) {                                                                  // 4680
  // Provide a hook for user-specified inspect functions.                                                         // 4681
  // Check that value is an object with an inspect function on it                                                 // 4682
  if (value && typeof value.inspect === 'function' &&                                                             // 4683
      // Filter out the util module, it's inspect function is special                                             // 4684
      value.inspect !== exports.inspect &&                                                                        // 4685
      // Also filter out any prototype objects using the circular check.                                          // 4686
      !(value.constructor && value.constructor.prototype === value)) {                                            // 4687
    var ret = value.inspect(recurseTimes);                                                                        // 4688
    if (typeof ret !== 'string') {                                                                                // 4689
      ret = formatValue(ctx, ret, recurseTimes);                                                                  // 4690
    }                                                                                                             // 4691
    return ret;                                                                                                   // 4692
  }                                                                                                               // 4693
                                                                                                                  // 4694
  // Primitive types cannot have properties                                                                       // 4695
  var primitive = formatPrimitive(ctx, value);                                                                    // 4696
  if (primitive) {                                                                                                // 4697
    return primitive;                                                                                             // 4698
  }                                                                                                               // 4699
                                                                                                                  // 4700
  // If this is a DOM element, try to get the outer HTML.                                                         // 4701
  if (isDOMElement(value)) {                                                                                      // 4702
    if ('outerHTML' in value) {                                                                                   // 4703
      return value.outerHTML;                                                                                     // 4704
      // This value does not have an outerHTML attribute,                                                         // 4705
      //   it could still be an XML element                                                                       // 4706
    } else {                                                                                                      // 4707
      // Attempt to serialize it                                                                                  // 4708
      try {                                                                                                       // 4709
        if (document.xmlVersion) {                                                                                // 4710
          var xmlSerializer = new XMLSerializer();                                                                // 4711
          return xmlSerializer.serializeToString(value);                                                          // 4712
        } else {                                                                                                  // 4713
          // Firefox 11- do not support outerHTML                                                                 // 4714
          //   It does, however, support innerHTML                                                                // 4715
          //   Use the following to render the element                                                            // 4716
          var ns = "http://www.w3.org/1999/xhtml";                                                                // 4717
          var container = document.createElementNS(ns, '_');                                                      // 4718
                                                                                                                  // 4719
          container.appendChild(value.cloneNode(false));                                                          // 4720
          html = container.innerHTML                                                                              // 4721
            .replace('><', '>' + value.innerHTML + '<');                                                          // 4722
          container.innerHTML = '';                                                                               // 4723
          return html;                                                                                            // 4724
        }                                                                                                         // 4725
      } catch (err) {                                                                                             // 4726
        // This could be a non-native DOM implementation,                                                         // 4727
        //   continue with the normal flow:                                                                       // 4728
        //   printing the element as if it is an object.                                                          // 4729
      }                                                                                                           // 4730
    }                                                                                                             // 4731
  }                                                                                                               // 4732
                                                                                                                  // 4733
  // Look up the keys of the object.                                                                              // 4734
  var visibleKeys = getEnumerableProperties(value);                                                               // 4735
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;                                                 // 4736
                                                                                                                  // 4737
  // Some type of object without properties can be shortcutted.                                                   // 4738
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,                                // 4739
  // a `stack` plus `description` property; ignore those for consistency.                                         // 4740
  if (keys.length === 0 || (isError(value) && (                                                                   // 4741
      (keys.length === 1 && keys[0] === 'stack') ||                                                               // 4742
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')                                     // 4743
     ))) {                                                                                                        // 4744
    if (typeof value === 'function') {                                                                            // 4745
      var name = getName(value);                                                                                  // 4746
      var nameSuffix = name ? ': ' + name : '';                                                                   // 4747
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');                                              // 4748
    }                                                                                                             // 4749
    if (isRegExp(value)) {                                                                                        // 4750
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');                                        // 4751
    }                                                                                                             // 4752
    if (isDate(value)) {                                                                                          // 4753
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');                                         // 4754
    }                                                                                                             // 4755
    if (isError(value)) {                                                                                         // 4756
      return formatError(value);                                                                                  // 4757
    }                                                                                                             // 4758
  }                                                                                                               // 4759
                                                                                                                  // 4760
  var base = '', array = false, braces = ['{', '}'];                                                              // 4761
                                                                                                                  // 4762
  // Make Array say that they are Array                                                                           // 4763
  if (isArray(value)) {                                                                                           // 4764
    array = true;                                                                                                 // 4765
    braces = ['[', ']'];                                                                                          // 4766
  }                                                                                                               // 4767
                                                                                                                  // 4768
  // Make functions say that they are functions                                                                   // 4769
  if (typeof value === 'function') {                                                                              // 4770
    var name = getName(value);                                                                                    // 4771
    var nameSuffix = name ? ': ' + name : '';                                                                     // 4772
    base = ' [Function' + nameSuffix + ']';                                                                       // 4773
  }                                                                                                               // 4774
                                                                                                                  // 4775
  // Make RegExps say that they are RegExps                                                                       // 4776
  if (isRegExp(value)) {                                                                                          // 4777
    base = ' ' + RegExp.prototype.toString.call(value);                                                           // 4778
  }                                                                                                               // 4779
                                                                                                                  // 4780
  // Make dates with properties first say the date                                                                // 4781
  if (isDate(value)) {                                                                                            // 4782
    base = ' ' + Date.prototype.toUTCString.call(value);                                                          // 4783
  }                                                                                                               // 4784
                                                                                                                  // 4785
  // Make error with message first say the error                                                                  // 4786
  if (isError(value)) {                                                                                           // 4787
    return formatError(value);                                                                                    // 4788
  }                                                                                                               // 4789
                                                                                                                  // 4790
  if (keys.length === 0 && (!array || value.length == 0)) {                                                       // 4791
    return braces[0] + base + braces[1];                                                                          // 4792
  }                                                                                                               // 4793
                                                                                                                  // 4794
  if (recurseTimes < 0) {                                                                                         // 4795
    if (isRegExp(value)) {                                                                                        // 4796
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');                                        // 4797
    } else {                                                                                                      // 4798
      return ctx.stylize('[Object]', 'special');                                                                  // 4799
    }                                                                                                             // 4800
  }                                                                                                               // 4801
                                                                                                                  // 4802
  ctx.seen.push(value);                                                                                           // 4803
                                                                                                                  // 4804
  var output;                                                                                                     // 4805
  if (array) {                                                                                                    // 4806
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);                                            // 4807
  } else {                                                                                                        // 4808
    output = keys.map(function(key) {                                                                             // 4809
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);                                   // 4810
    });                                                                                                           // 4811
  }                                                                                                               // 4812
                                                                                                                  // 4813
  ctx.seen.pop();                                                                                                 // 4814
                                                                                                                  // 4815
  return reduceToSingleString(output, base, braces);                                                              // 4816
}                                                                                                                 // 4817
                                                                                                                  // 4818
                                                                                                                  // 4819
function formatPrimitive(ctx, value) {                                                                            // 4820
  switch (typeof value) {                                                                                         // 4821
    case 'undefined':                                                                                             // 4822
      return ctx.stylize('undefined', 'undefined');                                                               // 4823
                                                                                                                  // 4824
    case 'string':                                                                                                // 4825
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')                                             // 4826
                                               .replace(/'/g, "\\'")                                              // 4827
                                               .replace(/\\"/g, '"') + '\'';                                      // 4828
      return ctx.stylize(simple, 'string');                                                                       // 4829
                                                                                                                  // 4830
    case 'number':                                                                                                // 4831
      if (value === 0 && (1/value) === -Infinity) {                                                               // 4832
        return ctx.stylize('-0', 'number');                                                                       // 4833
      }                                                                                                           // 4834
      return ctx.stylize('' + value, 'number');                                                                   // 4835
                                                                                                                  // 4836
    case 'boolean':                                                                                               // 4837
      return ctx.stylize('' + value, 'boolean');                                                                  // 4838
  }                                                                                                               // 4839
  // For some reason typeof null is "object", so special case here.                                               // 4840
  if (value === null) {                                                                                           // 4841
    return ctx.stylize('null', 'null');                                                                           // 4842
  }                                                                                                               // 4843
}                                                                                                                 // 4844
                                                                                                                  // 4845
                                                                                                                  // 4846
function formatError(value) {                                                                                     // 4847
  return '[' + Error.prototype.toString.call(value) + ']';                                                        // 4848
}                                                                                                                 // 4849
                                                                                                                  // 4850
                                                                                                                  // 4851
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {                                               // 4852
  var output = [];                                                                                                // 4853
  for (var i = 0, l = value.length; i < l; ++i) {                                                                 // 4854
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {                                                 // 4855
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,                                           // 4856
          String(i), true));                                                                                      // 4857
    } else {                                                                                                      // 4858
      output.push('');                                                                                            // 4859
    }                                                                                                             // 4860
  }                                                                                                               // 4861
  keys.forEach(function(key) {                                                                                    // 4862
    if (!key.match(/^\d+$/)) {                                                                                    // 4863
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,                                           // 4864
          key, true));                                                                                            // 4865
    }                                                                                                             // 4866
  });                                                                                                             // 4867
  return output;                                                                                                  // 4868
}                                                                                                                 // 4869
                                                                                                                  // 4870
                                                                                                                  // 4871
function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {                                      // 4872
  var name, str;                                                                                                  // 4873
  if (value.__lookupGetter__) {                                                                                   // 4874
    if (value.__lookupGetter__(key)) {                                                                            // 4875
      if (value.__lookupSetter__(key)) {                                                                          // 4876
        str = ctx.stylize('[Getter/Setter]', 'special');                                                          // 4877
      } else {                                                                                                    // 4878
        str = ctx.stylize('[Getter]', 'special');                                                                 // 4879
      }                                                                                                           // 4880
    } else {                                                                                                      // 4881
      if (value.__lookupSetter__(key)) {                                                                          // 4882
        str = ctx.stylize('[Setter]', 'special');                                                                 // 4883
      }                                                                                                           // 4884
    }                                                                                                             // 4885
  }                                                                                                               // 4886
  if (visibleKeys.indexOf(key) < 0) {                                                                             // 4887
    name = '[' + key + ']';                                                                                       // 4888
  }                                                                                                               // 4889
  if (!str) {                                                                                                     // 4890
    if (ctx.seen.indexOf(value[key]) < 0) {                                                                       // 4891
      if (recurseTimes === null) {                                                                                // 4892
        str = formatValue(ctx, value[key], null);                                                                 // 4893
      } else {                                                                                                    // 4894
        str = formatValue(ctx, value[key], recurseTimes - 1);                                                     // 4895
      }                                                                                                           // 4896
      if (str.indexOf('\n') > -1) {                                                                               // 4897
        if (array) {                                                                                              // 4898
          str = str.split('\n').map(function(line) {                                                              // 4899
            return '  ' + line;                                                                                   // 4900
          }).join('\n').substr(2);                                                                                // 4901
        } else {                                                                                                  // 4902
          str = '\n' + str.split('\n').map(function(line) {                                                       // 4903
            return '   ' + line;                                                                                  // 4904
          }).join('\n');                                                                                          // 4905
        }                                                                                                         // 4906
      }                                                                                                           // 4907
    } else {                                                                                                      // 4908
      str = ctx.stylize('[Circular]', 'special');                                                                 // 4909
    }                                                                                                             // 4910
  }                                                                                                               // 4911
  if (typeof name === 'undefined') {                                                                              // 4912
    if (array && key.match(/^\d+$/)) {                                                                            // 4913
      return str;                                                                                                 // 4914
    }                                                                                                             // 4915
    name = JSON.stringify('' + key);                                                                              // 4916
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {                                                             // 4917
      name = name.substr(1, name.length - 2);                                                                     // 4918
      name = ctx.stylize(name, 'name');                                                                           // 4919
    } else {                                                                                                      // 4920
      name = name.replace(/'/g, "\\'")                                                                            // 4921
                 .replace(/\\"/g, '"')                                                                            // 4922
                 .replace(/(^"|"$)/g, "'");                                                                       // 4923
      name = ctx.stylize(name, 'string');                                                                         // 4924
    }                                                                                                             // 4925
  }                                                                                                               // 4926
                                                                                                                  // 4927
  return name + ': ' + str;                                                                                       // 4928
}                                                                                                                 // 4929
                                                                                                                  // 4930
                                                                                                                  // 4931
function reduceToSingleString(output, base, braces) {                                                             // 4932
  var numLinesEst = 0;                                                                                            // 4933
  var length = output.reduce(function(prev, cur) {                                                                // 4934
    numLinesEst++;                                                                                                // 4935
    if (cur.indexOf('\n') >= 0) numLinesEst++;                                                                    // 4936
    return prev + cur.length + 1;                                                                                 // 4937
  }, 0);                                                                                                          // 4938
                                                                                                                  // 4939
  if (length > 60) {                                                                                              // 4940
    return braces[0] +                                                                                            // 4941
           (base === '' ? '' : base + '\n ') +                                                                    // 4942
           ' ' +                                                                                                  // 4943
           output.join(',\n  ') +                                                                                 // 4944
           ' ' +                                                                                                  // 4945
           braces[1];                                                                                             // 4946
  }                                                                                                               // 4947
                                                                                                                  // 4948
  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];                                            // 4949
}                                                                                                                 // 4950
                                                                                                                  // 4951
function isArray(ar) {                                                                                            // 4952
  return Array.isArray(ar) ||                                                                                     // 4953
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');                                     // 4954
}                                                                                                                 // 4955
                                                                                                                  // 4956
function isRegExp(re) {                                                                                           // 4957
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';                                      // 4958
}                                                                                                                 // 4959
                                                                                                                  // 4960
function isDate(d) {                                                                                              // 4961
  return typeof d === 'object' && objectToString(d) === '[object Date]';                                          // 4962
}                                                                                                                 // 4963
                                                                                                                  // 4964
function isError(e) {                                                                                             // 4965
  return typeof e === 'object' && objectToString(e) === '[object Error]';                                         // 4966
}                                                                                                                 // 4967
                                                                                                                  // 4968
function objectToString(o) {                                                                                      // 4969
  return Object.prototype.toString.call(o);                                                                       // 4970
}                                                                                                                 // 4971
                                                                                                                  // 4972
});                                                                                                               // 4973
                                                                                                                  // 4974
require.register("chai/lib/chai/utils/objDisplay.js", function (exports, module) {                                // 4975
/*!                                                                                                               // 4976
 * Chai - flag utility                                                                                            // 4977
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 4978
 * MIT Licensed                                                                                                   // 4979
 */                                                                                                               // 4980
                                                                                                                  // 4981
/*!                                                                                                               // 4982
 * Module dependancies                                                                                            // 4983
 */                                                                                                               // 4984
                                                                                                                  // 4985
var inspect = require('chai/lib/chai/utils/inspect.js');                                                          // 4986
var config = require('chai/lib/chai/config.js');                                                                  // 4987
                                                                                                                  // 4988
/**                                                                                                               // 4989
 * ### .objDisplay (object)                                                                                       // 4990
 *                                                                                                                // 4991
 * Determines if an object or an array matches                                                                    // 4992
 * criteria to be inspected in-line for error                                                                     // 4993
 * messages or should be truncated.                                                                               // 4994
 *                                                                                                                // 4995
 * @param {Mixed} javascript object to inspect                                                                    // 4996
 * @name objDisplay                                                                                               // 4997
 * @api public                                                                                                    // 4998
 */                                                                                                               // 4999
                                                                                                                  // 5000
module.exports = function (obj) {                                                                                 // 5001
  var str = inspect(obj)                                                                                          // 5002
    , type = Object.prototype.toString.call(obj);                                                                 // 5003
                                                                                                                  // 5004
  if (config.truncateThreshold && str.length >= config.truncateThreshold) {                                       // 5005
    if (type === '[object Function]') {                                                                           // 5006
      return !obj.name || obj.name === ''                                                                         // 5007
        ? '[Function]'                                                                                            // 5008
        : '[Function: ' + obj.name + ']';                                                                         // 5009
    } else if (type === '[object Array]') {                                                                       // 5010
      return '[ Array(' + obj.length + ') ]';                                                                     // 5011
    } else if (type === '[object Object]') {                                                                      // 5012
      var keys = Object.keys(obj)                                                                                 // 5013
        , kstr = keys.length > 2                                                                                  // 5014
          ? keys.splice(0, 2).join(', ') + ', ...'                                                                // 5015
          : keys.join(', ');                                                                                      // 5016
      return '{ Object (' + kstr + ') }';                                                                         // 5017
    } else {                                                                                                      // 5018
      return str;                                                                                                 // 5019
    }                                                                                                             // 5020
  } else {                                                                                                        // 5021
    return str;                                                                                                   // 5022
  }                                                                                                               // 5023
};                                                                                                                // 5024
                                                                                                                  // 5025
});                                                                                                               // 5026
                                                                                                                  // 5027
require.register("chai/lib/chai/utils/overwriteMethod.js", function (exports, module) {                           // 5028
/*!                                                                                                               // 5029
 * Chai - overwriteMethod utility                                                                                 // 5030
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 5031
 * MIT Licensed                                                                                                   // 5032
 */                                                                                                               // 5033
                                                                                                                  // 5034
/**                                                                                                               // 5035
 * ### overwriteMethod (ctx, name, fn)                                                                            // 5036
 *                                                                                                                // 5037
 * Overwites an already existing method and provides                                                              // 5038
 * access to previous function. Must return function                                                              // 5039
 * to be used for name.                                                                                           // 5040
 *                                                                                                                // 5041
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {                               // 5042
 *       return function (str) {                                                                                  // 5043
 *         var obj = utils.flag(this, 'object');                                                                  // 5044
 *         if (obj instanceof Foo) {                                                                              // 5045
 *           new chai.Assertion(obj.value).to.equal(str);                                                         // 5046
 *         } else {                                                                                               // 5047
 *           _super.apply(this, arguments);                                                                       // 5048
 *         }                                                                                                      // 5049
 *       }                                                                                                        // 5050
 *     });                                                                                                        // 5051
 *                                                                                                                // 5052
 * Can also be accessed directly from `chai.Assertion`.                                                           // 5053
 *                                                                                                                // 5054
 *     chai.Assertion.overwriteMethod('foo', fn);                                                                 // 5055
 *                                                                                                                // 5056
 * Then can be used as any other assertion.                                                                       // 5057
 *                                                                                                                // 5058
 *     expect(myFoo).to.equal('bar');                                                                             // 5059
 *                                                                                                                // 5060
 * @param {Object} ctx object whose method is to be overwritten                                                   // 5061
 * @param {String} name of method to overwrite                                                                    // 5062
 * @param {Function} method function that returns a function to be used for name                                  // 5063
 * @name overwriteMethod                                                                                          // 5064
 * @api public                                                                                                    // 5065
 */                                                                                                               // 5066
                                                                                                                  // 5067
module.exports = function (ctx, name, method) {                                                                   // 5068
  var _method = ctx[name]                                                                                         // 5069
    , _super = function () { return this; };                                                                      // 5070
                                                                                                                  // 5071
  if (_method && 'function' === typeof _method)                                                                   // 5072
    _super = _method;                                                                                             // 5073
                                                                                                                  // 5074
  ctx[name] = function () {                                                                                       // 5075
    var result = method(_super).apply(this, arguments);                                                           // 5076
    return result === undefined ? this : result;                                                                  // 5077
  }                                                                                                               // 5078
};                                                                                                                // 5079
                                                                                                                  // 5080
});                                                                                                               // 5081
                                                                                                                  // 5082
require.register("chai/lib/chai/utils/overwriteProperty.js", function (exports, module) {                         // 5083
/*!                                                                                                               // 5084
 * Chai - overwriteProperty utility                                                                               // 5085
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 5086
 * MIT Licensed                                                                                                   // 5087
 */                                                                                                               // 5088
                                                                                                                  // 5089
/**                                                                                                               // 5090
 * ### overwriteProperty (ctx, name, fn)                                                                          // 5091
 *                                                                                                                // 5092
 * Overwites an already existing property getter and provides                                                     // 5093
 * access to previous value. Must return function to use as getter.                                               // 5094
 *                                                                                                                // 5095
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {                                // 5096
 *       return function () {                                                                                     // 5097
 *         var obj = utils.flag(this, 'object');                                                                  // 5098
 *         if (obj instanceof Foo) {                                                                              // 5099
 *           new chai.Assertion(obj.name).to.equal('bar');                                                        // 5100
 *         } else {                                                                                               // 5101
 *           _super.call(this);                                                                                   // 5102
 *         }                                                                                                      // 5103
 *       }                                                                                                        // 5104
 *     });                                                                                                        // 5105
 *                                                                                                                // 5106
 *                                                                                                                // 5107
 * Can also be accessed directly from `chai.Assertion`.                                                           // 5108
 *                                                                                                                // 5109
 *     chai.Assertion.overwriteProperty('foo', fn);                                                               // 5110
 *                                                                                                                // 5111
 * Then can be used as any other assertion.                                                                       // 5112
 *                                                                                                                // 5113
 *     expect(myFoo).to.be.ok;                                                                                    // 5114
 *                                                                                                                // 5115
 * @param {Object} ctx object whose property is to be overwritten                                                 // 5116
 * @param {String} name of property to overwrite                                                                  // 5117
 * @param {Function} getter function that returns a getter function to be used for name                           // 5118
 * @name overwriteProperty                                                                                        // 5119
 * @api public                                                                                                    // 5120
 */                                                                                                               // 5121
                                                                                                                  // 5122
module.exports = function (ctx, name, getter) {                                                                   // 5123
  var _get = Object.getOwnPropertyDescriptor(ctx, name)                                                           // 5124
    , _super = function () {};                                                                                    // 5125
                                                                                                                  // 5126
  if (_get && 'function' === typeof _get.get)                                                                     // 5127
    _super = _get.get                                                                                             // 5128
                                                                                                                  // 5129
  Object.defineProperty(ctx, name,                                                                                // 5130
    { get: function () {                                                                                          // 5131
        var result = getter(_super).call(this);                                                                   // 5132
        return result === undefined ? this : result;                                                              // 5133
      }                                                                                                           // 5134
    , configurable: true                                                                                          // 5135
  });                                                                                                             // 5136
};                                                                                                                // 5137
                                                                                                                  // 5138
});                                                                                                               // 5139
                                                                                                                  // 5140
require.register("chai/lib/chai/utils/overwriteChainableMethod.js", function (exports, module) {                  // 5141
/*!                                                                                                               // 5142
 * Chai - overwriteChainableMethod utility                                                                        // 5143
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 5144
 * MIT Licensed                                                                                                   // 5145
 */                                                                                                               // 5146
                                                                                                                  // 5147
/**                                                                                                               // 5148
 * ### overwriteChainableMethod (ctx, name, method, chainingBehavior)                                             // 5149
 *                                                                                                                // 5150
 * Overwites an already existing chainable method                                                                 // 5151
 * and provides access to the previous function or                                                                // 5152
 * property.  Must return functions to be used for                                                                // 5153
 * name.                                                                                                          // 5154
 *                                                                                                                // 5155
 *     utils.overwriteChainableMethod(chai.Assertion.prototype, 'length',                                         // 5156
 *       function (_super) {                                                                                      // 5157
 *       }                                                                                                        // 5158
 *     , function (_super) {                                                                                      // 5159
 *       }                                                                                                        // 5160
 *     );                                                                                                         // 5161
 *                                                                                                                // 5162
 * Can also be accessed directly from `chai.Assertion`.                                                           // 5163
 *                                                                                                                // 5164
 *     chai.Assertion.overwriteChainableMethod('foo', fn, fn);                                                    // 5165
 *                                                                                                                // 5166
 * Then can be used as any other assertion.                                                                       // 5167
 *                                                                                                                // 5168
 *     expect(myFoo).to.have.length(3);                                                                           // 5169
 *     expect(myFoo).to.have.length.above(3);                                                                     // 5170
 *                                                                                                                // 5171
 * @param {Object} ctx object whose method / property is to be overwritten                                        // 5172
 * @param {String} name of method / property to overwrite                                                         // 5173
 * @param {Function} method function that returns a function to be used for name                                  // 5174
 * @param {Function} chainingBehavior function that returns a function to be used for property                    // 5175
 * @name overwriteChainableMethod                                                                                 // 5176
 * @api public                                                                                                    // 5177
 */                                                                                                               // 5178
                                                                                                                  // 5179
module.exports = function (ctx, name, method, chainingBehavior) {                                                 // 5180
  var chainableBehavior = ctx.__methods[name];                                                                    // 5181
                                                                                                                  // 5182
  var _chainingBehavior = chainableBehavior.chainingBehavior;                                                     // 5183
  chainableBehavior.chainingBehavior = function () {                                                              // 5184
    var result = chainingBehavior(_chainingBehavior).call(this);                                                  // 5185
    return result === undefined ? this : result;                                                                  // 5186
  };                                                                                                              // 5187
                                                                                                                  // 5188
  var _method = chainableBehavior.method;                                                                         // 5189
  chainableBehavior.method = function () {                                                                        // 5190
    var result = method(_method).apply(this, arguments);                                                          // 5191
    return result === undefined ? this : result;                                                                  // 5192
  };                                                                                                              // 5193
};                                                                                                                // 5194
                                                                                                                  // 5195
});                                                                                                               // 5196
                                                                                                                  // 5197
require.register("chai/lib/chai/utils/test.js", function (exports, module) {                                      // 5198
/*!                                                                                                               // 5199
 * Chai - test utility                                                                                            // 5200
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 5201
 * MIT Licensed                                                                                                   // 5202
 */                                                                                                               // 5203
                                                                                                                  // 5204
/*!                                                                                                               // 5205
 * Module dependancies                                                                                            // 5206
 */                                                                                                               // 5207
                                                                                                                  // 5208
var flag = require('chai/lib/chai/utils/flag.js');                                                                // 5209
                                                                                                                  // 5210
/**                                                                                                               // 5211
 * # test(object, expression)                                                                                     // 5212
 *                                                                                                                // 5213
 * Test and object for expression.                                                                                // 5214
 *                                                                                                                // 5215
 * @param {Object} object (constructed Assertion)                                                                 // 5216
 * @param {Arguments} chai.Assertion.prototype.assert arguments                                                   // 5217
 */                                                                                                               // 5218
                                                                                                                  // 5219
module.exports = function (obj, args) {                                                                           // 5220
  var negate = flag(obj, 'negate')                                                                                // 5221
    , expr = args[0];                                                                                             // 5222
  return negate ? !expr : expr;                                                                                   // 5223
};                                                                                                                // 5224
                                                                                                                  // 5225
});                                                                                                               // 5226
                                                                                                                  // 5227
require.register("chai/lib/chai/utils/transferFlags.js", function (exports, module) {                             // 5228
/*!                                                                                                               // 5229
 * Chai - transferFlags utility                                                                                   // 5230
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 5231
 * MIT Licensed                                                                                                   // 5232
 */                                                                                                               // 5233
                                                                                                                  // 5234
/**                                                                                                               // 5235
 * ### transferFlags(assertion, object, includeAll = true)                                                        // 5236
 *                                                                                                                // 5237
 * Transfer all the flags for `assertion` to `object`. If                                                         // 5238
 * `includeAll` is set to `false`, then the base Chai                                                             // 5239
 * assertion flags (namely `object`, `ssfi`, and `message`)                                                       // 5240
 * will not be transferred.                                                                                       // 5241
 *                                                                                                                // 5242
 *                                                                                                                // 5243
 *     var newAssertion = new Assertion();                                                                        // 5244
 *     utils.transferFlags(assertion, newAssertion);                                                              // 5245
 *                                                                                                                // 5246
 *     var anotherAsseriton = new Assertion(myObj);                                                               // 5247
 *     utils.transferFlags(assertion, anotherAssertion, false);                                                   // 5248
 *                                                                                                                // 5249
 * @param {Assertion} assertion the assertion to transfer the flags from                                          // 5250
 * @param {Object} object the object to transfer the flags to; usually a new assertion                            // 5251
 * @param {Boolean} includeAll                                                                                    // 5252
 * @name transferFlags                                                                                            // 5253
 * @api private                                                                                                   // 5254
 */                                                                                                               // 5255
                                                                                                                  // 5256
module.exports = function (assertion, object, includeAll) {                                                       // 5257
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));                                     // 5258
                                                                                                                  // 5259
  if (!object.__flags) {                                                                                          // 5260
    object.__flags = Object.create(null);                                                                         // 5261
  }                                                                                                               // 5262
                                                                                                                  // 5263
  includeAll = arguments.length === 3 ? includeAll : true;                                                        // 5264
                                                                                                                  // 5265
  for (var flag in flags) {                                                                                       // 5266
    if (includeAll ||                                                                                             // 5267
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {                                            // 5268
      object.__flags[flag] = flags[flag];                                                                         // 5269
    }                                                                                                             // 5270
  }                                                                                                               // 5271
};                                                                                                                // 5272
                                                                                                                  // 5273
});                                                                                                               // 5274
                                                                                                                  // 5275
require.register("chai/lib/chai/utils/type.js", function (exports, module) {                                      // 5276
/*!                                                                                                               // 5277
 * Chai - type utility                                                                                            // 5278
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>                                                    // 5279
 * MIT Licensed                                                                                                   // 5280
 */                                                                                                               // 5281
                                                                                                                  // 5282
/*!                                                                                                               // 5283
 * Detectable javascript natives                                                                                  // 5284
 */                                                                                                               // 5285
                                                                                                                  // 5286
var natives = {                                                                                                   // 5287
    '[object Arguments]': 'arguments'                                                                             // 5288
  , '[object Array]': 'array'                                                                                     // 5289
  , '[object Date]': 'date'                                                                                       // 5290
  , '[object Function]': 'function'                                                                               // 5291
  , '[object Number]': 'number'                                                                                   // 5292
  , '[object RegExp]': 'regexp'                                                                                   // 5293
  , '[object String]': 'string'                                                                                   // 5294
};                                                                                                                // 5295
                                                                                                                  // 5296
/**                                                                                                               // 5297
 * ### type(object)                                                                                               // 5298
 *                                                                                                                // 5299
 * Better implementation of `typeof` detection that can                                                           // 5300
 * be used cross-browser. Handles the inconsistencies of                                                          // 5301
 * Array, `null`, and `undefined` detection.                                                                      // 5302
 *                                                                                                                // 5303
 *     utils.type({}) // 'object'                                                                                 // 5304
 *     utils.type(null) // `null'                                                                                 // 5305
 *     utils.type(undefined) // `undefined`                                                                       // 5306
 *     utils.type([]) // `array`                                                                                  // 5307
 *                                                                                                                // 5308
 * @param {Mixed} object to detect type of                                                                        // 5309
 * @name type                                                                                                     // 5310
 * @api private                                                                                                   // 5311
 */                                                                                                               // 5312
                                                                                                                  // 5313
module.exports = function (obj) {                                                                                 // 5314
  var str = Object.prototype.toString.call(obj);                                                                  // 5315
  if (natives[str]) return natives[str];                                                                          // 5316
  if (obj === null) return 'null';                                                                                // 5317
  if (obj === undefined) return 'undefined';                                                                      // 5318
  if (obj === Object(obj)) return 'object';                                                                       // 5319
  return typeof obj;                                                                                              // 5320
};                                                                                                                // 5321
                                                                                                                  // 5322
});                                                                                                               // 5323
                                                                                                                  // 5324
chai = require("chai");                                                                                           // 5325
})()                                                                                                              // 5326
                                                                                                                  // 5327
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/practicalmeteor:chai/chai-string-1.1.1.js                                                             //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
(function (plugin) {                                                                                              // 1
  chai.use(plugin);                                                                                               // 2
}(function (chai, utils) {                                                                                        // 3
  chai.string = chai.string || {};                                                                                // 4
                                                                                                                  // 5
                                                                                                                  // 6
  chai.string.startsWith = function (str, prefix) {                                                               // 7
    return str.indexOf(prefix) === 0;                                                                             // 8
  };                                                                                                              // 9
                                                                                                                  // 10
  chai.string.endsWith = function (str, suffix) {                                                                 // 11
    return str.indexOf(suffix, str.length - suffix.length) !== -1;                                                // 12
  };                                                                                                              // 13
                                                                                                                  // 14
  chai.string.equalIgnoreCase = function (str1, str2) {                                                           // 15
    return str1.toLowerCase() === str2.toLowerCase();                                                             // 16
  };                                                                                                              // 17
                                                                                                                  // 18
  chai.string.singleLine = function(str) {                                                                        // 19
    return str.trim().indexOf("\n") === -1;                                                                       // 20
  };                                                                                                              // 21
                                                                                                                  // 22
  chai.string.reverseOf = function(str, reversed) {                                                               // 23
    return str.split('').reverse().join('') === reversed;                                                         // 24
  };                                                                                                              // 25
                                                                                                                  // 26
  chai.string.palindrome = function(str) {                                                                        // 27
    var len = str.length;                                                                                         // 28
    for ( var i = 0; i < Math.floor(len/2); i++ ) {                                                               // 29
      if (str[i] !== str[len - 1 - i]) {                                                                          // 30
        return false;                                                                                             // 31
      }                                                                                                           // 32
    }                                                                                                             // 33
    return true;                                                                                                  // 34
  };                                                                                                              // 35
                                                                                                                  // 36
  chai.string.entriesCount = function(str, substr, count) {                                                       // 37
    var i = 0,                                                                                                    // 38
      len = str.length,                                                                                           // 39
      matches = 0;                                                                                                // 40
    while (i < len) {                                                                                             // 41
      var indx = str.indexOf(substr, i);                                                                          // 42
      if (indx === -1) {                                                                                          // 43
        break;                                                                                                    // 44
      }                                                                                                           // 45
      else {                                                                                                      // 46
        matches++;                                                                                                // 47
        i = indx + 1;                                                                                             // 48
      }                                                                                                           // 49
    }                                                                                                             // 50
    return matches === count;                                                                                     // 51
  };                                                                                                              // 52
                                                                                                                  // 53
  var startsWithMethodWrapper = function (expected) {                                                             // 54
    var actual = this._obj;                                                                                       // 55
                                                                                                                  // 56
    return this.assert(                                                                                           // 57
      chai.string.startsWith(actual, expected),                                                                   // 58
      'expected ' + this._obj + ' to starts with ' + expected,                                                    // 59
      'expected ' + this._obj + ' to not starts with ' + expected                                                 // 60
    );                                                                                                            // 61
  };                                                                                                              // 62
                                                                                                                  // 63
  chai.Assertion.addChainableMethod('startsWith', startsWithMethodWrapper);                                       // 64
  chai.Assertion.addChainableMethod('startWith', startsWithMethodWrapper);                                        // 65
                                                                                                                  // 66
  var endsWithMethodWrapper = function (expected) {                                                               // 67
    var actual = this._obj;                                                                                       // 68
                                                                                                                  // 69
    return this.assert(                                                                                           // 70
      chai.string.endsWith(actual, expected),                                                                     // 71
      'expected ' + this._obj + ' to ends with ' + expected,                                                      // 72
      'expected ' + this._obj + ' to not ends with ' + expected                                                   // 73
    );                                                                                                            // 74
  };                                                                                                              // 75
                                                                                                                  // 76
  chai.Assertion.addChainableMethod('endsWith', endsWithMethodWrapper);                                           // 77
  chai.Assertion.addChainableMethod('endWith', endsWithMethodWrapper);                                            // 78
                                                                                                                  // 79
  chai.Assertion.addChainableMethod('equalIgnoreCase', function (expected) {                                      // 80
    var actual = this._obj;                                                                                       // 81
                                                                                                                  // 82
    return this.assert(                                                                                           // 83
      chai.string.equalIgnoreCase(actual, expected),                                                              // 84
      'expected ' + this._obj + ' to be equal to ' + expected + ' ignoring case',                                 // 85
      'expected ' + this._obj + ' to be not equal to ' + expected + ' ignoring case'                              // 86
    );                                                                                                            // 87
  });                                                                                                             // 88
                                                                                                                  // 89
  chai.Assertion.addChainableMethod('singleLine', function () {                                                   // 90
    var actual = this._obj;                                                                                       // 91
                                                                                                                  // 92
    return this.assert(                                                                                           // 93
      chai.string.singleLine(actual),                                                                             // 94
      'expected ' + this._obj + ' to be single line',                                                             // 95
      'expected ' + this._obj + ' to be not single line'                                                          // 96
    );                                                                                                            // 97
  });                                                                                                             // 98
                                                                                                                  // 99
  chai.Assertion.addChainableMethod('reverseOf', function(expected) {                                             // 100
    var actual = this._obj;                                                                                       // 101
                                                                                                                  // 102
    return this.assert(                                                                                           // 103
      chai.string.reverseOf(actual, expected),                                                                    // 104
      'expected ' + this._obj + ' to be reverse of ' + expected,                                                  // 105
      'expected ' + this._obj + ' to be not reverse of ' + expected                                               // 106
    );                                                                                                            // 107
  });                                                                                                             // 108
                                                                                                                  // 109
  chai.Assertion.addChainableMethod('palindrome', function () {                                                   // 110
    var actual = this._obj;                                                                                       // 111
                                                                                                                  // 112
    return this.assert(                                                                                           // 113
      chai.string.palindrome(actual),                                                                             // 114
      'expected ' + this._obj + ' to be palindrome',                                                              // 115
      'expected ' + this._obj + ' to be not palindrome'                                                           // 116
    );                                                                                                            // 117
  });                                                                                                             // 118
                                                                                                                  // 119
  chai.Assertion.addChainableMethod('entriesCount', function(substr, expected) {                                  // 120
    var actual = this._obj;                                                                                       // 121
                                                                                                                  // 122
    return this.assert(                                                                                           // 123
      chai.string.entriesCount(actual, substr, expected),                                                         // 124
      'expected ' + this._obj + ' to have ' + substr + ' ' + expected + ' time(s)',                               // 125
      'expected ' + this._obj + ' to not have ' + substr + ' ' + expected + ' time(s)'                            // 126
    );                                                                                                            // 127
  });                                                                                                             // 128
                                                                                                                  // 129
  // Asserts                                                                                                      // 130
  var assert = chai.assert;                                                                                       // 131
                                                                                                                  // 132
  assert.startsWith = function (val, exp, msg) {                                                                  // 133
    new chai.Assertion(val, msg).to.startsWith(exp);                                                              // 134
  };                                                                                                              // 135
                                                                                                                  // 136
  assert.notStartsWith = function (val, exp, msg) {                                                               // 137
    new chai.Assertion(val, msg).to.not.startsWith(exp);                                                          // 138
  };                                                                                                              // 139
                                                                                                                  // 140
  assert.endsWith = function (val, exp, msg) {                                                                    // 141
    new chai.Assertion(val, msg).to.endsWith(exp);                                                                // 142
  };                                                                                                              // 143
                                                                                                                  // 144
  assert.notEndsWith = function (val, exp, msg) {                                                                 // 145
    new chai.Assertion(val, msg).to.not.endsWith(exp);                                                            // 146
  };                                                                                                              // 147
                                                                                                                  // 148
  assert.equalIgnoreCase = function (val, exp, msg) {                                                             // 149
    new chai.Assertion(val, msg).to.be.equalIgnoreCase(exp);                                                      // 150
  };                                                                                                              // 151
                                                                                                                  // 152
  assert.notEqualIgnoreCase = function (val, exp, msg) {                                                          // 153
    new chai.Assertion(val, msg).to.not.be.equalIgnoreCase(exp);                                                  // 154
  };                                                                                                              // 155
                                                                                                                  // 156
  assert.singleLine = function(val, exp, msg) {                                                                   // 157
    new chai.Assertion(val, msg).to.be.singleLine();                                                              // 158
  };                                                                                                              // 159
                                                                                                                  // 160
  assert.notSingleLine = function(val, exp, msg) {                                                                // 161
    new chai.Assertion(val, msg).to.not.be.singleLine();                                                          // 162
  };                                                                                                              // 163
                                                                                                                  // 164
  assert.reverseOf = function(val, exp, msg) {                                                                    // 165
    new chai.Assertion(val, msg).to.be.reverseOf(exp);                                                            // 166
  };                                                                                                              // 167
                                                                                                                  // 168
  assert.notReverseOf = function(val, exp, msg) {                                                                 // 169
    new chai.Assertion(val, msg).to.not.be.reverseOf(exp);                                                        // 170
  };                                                                                                              // 171
                                                                                                                  // 172
  assert.palindrome = function(val, exp, msg) {                                                                   // 173
    new chai.Assertion(val, msg).to.be.palindrome();                                                              // 174
  };                                                                                                              // 175
                                                                                                                  // 176
  assert.notPalindrome = function(val, exp, msg) {                                                                // 177
    new chai.Assertion(val, msg).to.not.be.palindrome();                                                          // 178
  };                                                                                                              // 179
                                                                                                                  // 180
  assert.entriesCount = function(str, substr, count, msg) {                                                       // 181
    new chai.Assertion(str, msg).to.have.entriesCount(substr, count);                                             // 182
  }                                                                                                               // 183
                                                                                                                  // 184
}));                                                                                                              // 185
                                                                                                                  // 186
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/practicalmeteor:chai/config.coffee.js                                                                 //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var _ref, _ref1, _ref2, _ref3, _ref4;

if (Meteor.isServer) {
  chai.config.includeStack = ((_ref = Meteor.settings) != null ? (_ref1 = _ref.chai) != null ? _ref1.includeStack : void 0 : void 0) || true;
} else {
  chai.config.includeStack = ((_ref2 = Meteor.settings) != null ? (_ref3 = _ref2["public"]) != null ? (_ref4 = _ref3.chai) != null ? _ref4.includeStack : void 0 : void 0 : void 0) || true;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/practicalmeteor:chai/exports.js                                                                       //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
assert = chai.assert;                                                                                             // 1
expect = chai.expect;                                                                                             // 2
should = chai.should;                                                                                             // 3
                                                                                                                  // 4
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['practicalmeteor:chai'] = {}, {
  chai: chai,
  assert: assert,
  expect: expect,
  should: should
});

})();
