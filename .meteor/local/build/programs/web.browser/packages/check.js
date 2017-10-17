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
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var check, Match;

var require = meteorInstall({"node_modules":{"meteor":{"check":{"match.js":["./isPlainObject.js",function(require,exports){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/check/match.js                                                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// XXX docs                                                                                                          // 1
                                                                                                                     // 2
// Things we explicitly do NOT support:                                                                              // 3
//    - heterogenous arrays                                                                                          // 4
                                                                                                                     // 5
var currentArgumentChecker = new Meteor.EnvironmentVariable;                                                         // 6
var isPlainObject = require("./isPlainObject.js").isPlainObject;                                                     // 7
                                                                                                                     // 8
/**                                                                                                                  // 9
 * @summary Check that a value matches a [pattern](#matchpatterns).                                                  // 10
 * If the value does not match the pattern, throw a `Match.Error`.                                                   // 11
 *                                                                                                                   // 12
 * Particularly useful to assert that arguments to a function have the right                                         // 13
 * types and structure.                                                                                              // 14
 * @locus Anywhere                                                                                                   // 15
 * @param {Any} value The value to check                                                                             // 16
 * @param {MatchPattern} pattern The pattern to match                                                                // 17
 * `value` against                                                                                                   // 18
 */                                                                                                                  // 19
var check = exports.check = function (value, pattern) {                                                              // 20
  // Record that check got called, if somebody cared.                                                                // 21
  //                                                                                                                 // 22
  // We use getOrNullIfOutsideFiber so that it's OK to call check()                                                  // 23
  // from non-Fiber server contexts; the downside is that if you forget to                                           // 24
  // bindEnvironment on some random callback in your method/publisher,                                               // 25
  // it might not find the argumentChecker and you'll get an error about                                             // 26
  // not checking an argument that it looks like you're checking (instead                                            // 27
  // of just getting a "Node code must run in a Fiber" error).                                                       // 28
  var argChecker = currentArgumentChecker.getOrNullIfOutsideFiber();                                                 // 29
  if (argChecker)                                                                                                    // 30
    argChecker.checking(value);                                                                                      // 31
  var result = testSubtree(value, pattern);                                                                          // 32
  if (result) {                                                                                                      // 33
    var err = new Match.Error(result.message);                                                                       // 34
    if (result.path) {                                                                                               // 35
      err.message += " in field " + result.path;                                                                     // 36
      err.path = result.path;                                                                                        // 37
    }                                                                                                                // 38
    throw err;                                                                                                       // 39
  }                                                                                                                  // 40
};                                                                                                                   // 41
                                                                                                                     // 42
/**                                                                                                                  // 43
 * @namespace Match                                                                                                  // 44
 * @summary The namespace for all Match types and methods.                                                           // 45
 */                                                                                                                  // 46
var Match = exports.Match = {                                                                                        // 47
  Optional: function (pattern) {                                                                                     // 48
    return new Optional(pattern);                                                                                    // 49
  },                                                                                                                 // 50
  Maybe: function (pattern) {                                                                                        // 51
    return new Maybe(pattern);                                                                                       // 52
  },                                                                                                                 // 53
  OneOf: function (/*arguments*/) {                                                                                  // 54
    return new OneOf(_.toArray(arguments));                                                                          // 55
  },                                                                                                                 // 56
  Any: ['__any__'],                                                                                                  // 57
  Where: function (condition) {                                                                                      // 58
    return new Where(condition);                                                                                     // 59
  },                                                                                                                 // 60
  ObjectIncluding: function (pattern) {                                                                              // 61
    return new ObjectIncluding(pattern);                                                                             // 62
  },                                                                                                                 // 63
  ObjectWithValues: function (pattern) {                                                                             // 64
    return new ObjectWithValues(pattern);                                                                            // 65
  },                                                                                                                 // 66
  // Matches only signed 32-bit integers                                                                             // 67
  Integer: ['__integer__'],                                                                                          // 68
                                                                                                                     // 69
  // XXX matchers should know how to describe themselves for errors                                                  // 70
  Error: Meteor.makeErrorType("Match.Error", function (msg) {                                                        // 71
    this.message = "Match error: " + msg;                                                                            // 72
    // The path of the value that failed to match. Initially empty, this gets                                        // 73
    // populated by catching and rethrowing the exception as it goes back up the                                     // 74
    // stack.                                                                                                        // 75
    // E.g.: "vals[3].entity.created"                                                                                // 76
    this.path = "";                                                                                                  // 77
    // If this gets sent over DDP, don't give full internal details but at least                                     // 78
    // provide something better than 500 Internal server error.                                                      // 79
    this.sanitizedError = new Meteor.Error(400, "Match failed");                                                     // 80
  }),                                                                                                                // 81
                                                                                                                     // 82
  // Tests to see if value matches pattern. Unlike check, it merely returns true                                     // 83
  // or false (unless an error other than Match.Error was thrown). It does not                                       // 84
  // interact with _failIfArgumentsAreNotAllChecked.                                                                 // 85
  // XXX maybe also implement a Match.match which returns more information about                                     // 86
  //     failures but without using exception handling or doing what check()                                         // 87
  //     does with _failIfArgumentsAreNotAllChecked and Meteor.Error conversion                                      // 88
                                                                                                                     // 89
  /**                                                                                                                // 90
   * @summary Returns true if the value matches the pattern.                                                         // 91
   * @locus Anywhere                                                                                                 // 92
   * @param {Any} value The value to check                                                                           // 93
   * @param {MatchPattern} pattern The pattern to match `value` against                                              // 94
   */                                                                                                                // 95
  test: function (value, pattern) {                                                                                  // 96
    return !testSubtree(value, pattern);                                                                             // 97
  },                                                                                                                 // 98
                                                                                                                     // 99
  // Runs `f.apply(context, args)`. If check() is not called on every element of                                     // 100
  // `args` (either directly or in the first level of an array), throws an error                                     // 101
  // (using `description` in the message).                                                                           // 102
  //                                                                                                                 // 103
  _failIfArgumentsAreNotAllChecked: function (f, context, args, description) {                                       // 104
    var argChecker = new ArgumentChecker(args, description);                                                         // 105
    var result = currentArgumentChecker.withValue(argChecker, function () {                                          // 106
      return f.apply(context, args);                                                                                 // 107
    });                                                                                                              // 108
    // If f didn't itself throw, make sure it checked all of its arguments.                                          // 109
    argChecker.throwUnlessAllArgumentsHaveBeenChecked();                                                             // 110
    return result;                                                                                                   // 111
  }                                                                                                                  // 112
};                                                                                                                   // 113
                                                                                                                     // 114
var Optional = function (pattern) {                                                                                  // 115
  this.pattern = pattern;                                                                                            // 116
};                                                                                                                   // 117
                                                                                                                     // 118
var Maybe = function (pattern) {                                                                                     // 119
  this.pattern = pattern;                                                                                            // 120
};                                                                                                                   // 121
                                                                                                                     // 122
var OneOf = function (choices) {                                                                                     // 123
  if (_.isEmpty(choices))                                                                                            // 124
    throw new Error("Must provide at least one choice to Match.OneOf");                                              // 125
  this.choices = choices;                                                                                            // 126
};                                                                                                                   // 127
                                                                                                                     // 128
var Where = function (condition) {                                                                                   // 129
  this.condition = condition;                                                                                        // 130
};                                                                                                                   // 131
                                                                                                                     // 132
var ObjectIncluding = function (pattern) {                                                                           // 133
  this.pattern = pattern;                                                                                            // 134
};                                                                                                                   // 135
                                                                                                                     // 136
var ObjectWithValues = function (pattern) {                                                                          // 137
  this.pattern = pattern;                                                                                            // 138
};                                                                                                                   // 139
                                                                                                                     // 140
var stringForErrorMessage = function (value, options) {                                                              // 141
  options = options || {};                                                                                           // 142
                                                                                                                     // 143
  if ( value === null ) return "null";                                                                               // 144
                                                                                                                     // 145
  if ( options.onlyShowType ) {                                                                                      // 146
    return typeof value;                                                                                             // 147
  }                                                                                                                  // 148
                                                                                                                     // 149
  // Your average non-object things.  Saves from doing the try/catch below for.                                      // 150
  if ( typeof value !== "object" ) {                                                                                 // 151
    return EJSON.stringify(value)                                                                                    // 152
  }                                                                                                                  // 153
                                                                                                                     // 154
  try {                                                                                                              // 155
    // Find objects with circular references since EJSON doesn't support them yet (Issue #4778 + Unaccepted PR)      // 156
    // If the native stringify is going to choke, EJSON.stringify is going to choke too.                             // 157
    JSON.stringify(value);                                                                                           // 158
  } catch (stringifyError) {                                                                                         // 159
    if ( stringifyError.name === "TypeError" ) {                                                                     // 160
      return typeof value;                                                                                           // 161
    }                                                                                                                // 162
  }                                                                                                                  // 163
                                                                                                                     // 164
  return EJSON.stringify(value);                                                                                     // 165
};                                                                                                                   // 166
                                                                                                                     // 167
var typeofChecks = [                                                                                                 // 168
  [String, "string"],                                                                                                // 169
  [Number, "number"],                                                                                                // 170
  [Boolean, "boolean"],                                                                                              // 171
  // While we don't allow undefined/function in EJSON, this is good for optional                                     // 172
  // arguments with OneOf.                                                                                           // 173
  [Function, "function"],                                                                                            // 174
  [undefined, "undefined"]                                                                                           // 175
];                                                                                                                   // 176
                                                                                                                     // 177
// Return `false` if it matches. Otherwise, return an object with a `message` and a `path` field.                    // 178
var testSubtree = function (value, pattern) {                                                                        // 179
  // Match anything!                                                                                                 // 180
  if (pattern === Match.Any)                                                                                         // 181
    return false;                                                                                                    // 182
                                                                                                                     // 183
  // Basic atomic types.                                                                                             // 184
  // Do not match boxed objects (e.g. String, Boolean)                                                               // 185
  for (var i = 0; i < typeofChecks.length; ++i) {                                                                    // 186
    if (pattern === typeofChecks[i][0]) {                                                                            // 187
      if (typeof value === typeofChecks[i][1])                                                                       // 188
        return false;                                                                                                // 189
      return {                                                                                                       // 190
        message: "Expected " + typeofChecks[i][1] + ", got " + stringForErrorMessage(value, { onlyShowType: true }),
        path: ""                                                                                                     // 192
      };                                                                                                             // 193
    }                                                                                                                // 194
  }                                                                                                                  // 195
                                                                                                                     // 196
  if (pattern === null) {                                                                                            // 197
    if (value === null) {                                                                                            // 198
      return false;                                                                                                  // 199
    }                                                                                                                // 200
    return {                                                                                                         // 201
      message: "Expected null, got " + stringForErrorMessage(value),                                                 // 202
      path: ""                                                                                                       // 203
    };                                                                                                               // 204
  }                                                                                                                  // 205
                                                                                                                     // 206
  // Strings, numbers, and booleans match literally. Goes well with Match.OneOf.                                     // 207
  if (typeof pattern === "string" || typeof pattern === "number" || typeof pattern === "boolean") {                  // 208
    if (value === pattern)                                                                                           // 209
      return false;                                                                                                  // 210
    return {                                                                                                         // 211
      message: "Expected " + pattern + ", got " + stringForErrorMessage(value),                                      // 212
      path: ""                                                                                                       // 213
    };                                                                                                               // 214
  }                                                                                                                  // 215
                                                                                                                     // 216
  // Match.Integer is special type encoded with array                                                                // 217
  if (pattern === Match.Integer) {                                                                                   // 218
    // There is no consistent and reliable way to check if variable is a 64-bit                                      // 219
    // integer. One of the popular solutions is to get reminder of division by 1                                     // 220
    // but this method fails on really large floats with big precision.                                              // 221
    // E.g.: 1.348192308491824e+23 % 1 === 0 in V8                                                                   // 222
    // Bitwise operators work consistantly but always cast variable to 32-bit                                        // 223
    // signed integer according to JavaScript specs.                                                                 // 224
    if (typeof value === "number" && (value | 0) === value)                                                          // 225
      return false;                                                                                                  // 226
    return {                                                                                                         // 227
      message: "Expected Integer, got " + stringForErrorMessage(value),                                              // 228
      path: ""                                                                                                       // 229
    };                                                                                                               // 230
  }                                                                                                                  // 231
                                                                                                                     // 232
  // "Object" is shorthand for Match.ObjectIncluding({});                                                            // 233
  if (pattern === Object)                                                                                            // 234
    pattern = Match.ObjectIncluding({});                                                                             // 235
                                                                                                                     // 236
  // Array (checked AFTER Any, which is implemented as an Array).                                                    // 237
  if (pattern instanceof Array) {                                                                                    // 238
    if (pattern.length !== 1) {                                                                                      // 239
      return {                                                                                                       // 240
        message: "Bad pattern: arrays must have one type element" + stringForErrorMessage(pattern),                  // 241
        path: ""                                                                                                     // 242
      };                                                                                                             // 243
    }                                                                                                                // 244
    if (!_.isArray(value) && !_.isArguments(value)) {                                                                // 245
      return {                                                                                                       // 246
        message: "Expected array, got " + stringForErrorMessage(value),                                              // 247
        path: ""                                                                                                     // 248
      };                                                                                                             // 249
    }                                                                                                                // 250
                                                                                                                     // 251
    for (var i = 0, length = value.length; i < length; i++) {                                                        // 252
      var result = testSubtree(value[i], pattern[0]);                                                                // 253
      if (result) {                                                                                                  // 254
        result.path = _prependPath(i, result.path);                                                                  // 255
        return result;                                                                                               // 256
      }                                                                                                              // 257
    }                                                                                                                // 258
    return false;                                                                                                    // 259
  }                                                                                                                  // 260
                                                                                                                     // 261
  // Arbitrary validation checks. The condition can return false or throw a                                          // 262
  // Match.Error (ie, it can internally use check()) to fail.                                                        // 263
  if (pattern instanceof Where) {                                                                                    // 264
    var result;                                                                                                      // 265
    try {                                                                                                            // 266
      result = pattern.condition(value);                                                                             // 267
    } catch (err) {                                                                                                  // 268
      if (!(err instanceof Match.Error))                                                                             // 269
        throw err;                                                                                                   // 270
      return {                                                                                                       // 271
        message: err.message,                                                                                        // 272
        path: err.path                                                                                               // 273
      };                                                                                                             // 274
    }                                                                                                                // 275
    if (result)                                                                                                      // 276
      return false;                                                                                                  // 277
    // XXX this error is terrible                                                                                    // 278
    return {                                                                                                         // 279
      message: "Failed Match.Where validation",                                                                      // 280
      path: ""                                                                                                       // 281
    };                                                                                                               // 282
  }                                                                                                                  // 283
                                                                                                                     // 284
                                                                                                                     // 285
  if (pattern instanceof Maybe) {                                                                                    // 286
    pattern = Match.OneOf(undefined, null, pattern.pattern);                                                         // 287
  }                                                                                                                  // 288
  else if (pattern instanceof Optional) {                                                                            // 289
    pattern = Match.OneOf(undefined, pattern.pattern);                                                               // 290
  }                                                                                                                  // 291
                                                                                                                     // 292
  if (pattern instanceof OneOf) {                                                                                    // 293
    for (var i = 0; i < pattern.choices.length; ++i) {                                                               // 294
      var result = testSubtree(value, pattern.choices[i]);                                                           // 295
      if (!result) {                                                                                                 // 296
        // No error? Yay, return.                                                                                    // 297
        return false;                                                                                                // 298
      }                                                                                                              // 299
      // Match errors just mean try another choice.                                                                  // 300
    }                                                                                                                // 301
    // XXX this error is terrible                                                                                    // 302
    return {                                                                                                         // 303
      message: "Failed Match.OneOf, Match.Maybe or Match.Optional validation",                                       // 304
      path: ""                                                                                                       // 305
    };                                                                                                               // 306
  }                                                                                                                  // 307
                                                                                                                     // 308
  // A function that isn't something we special-case is assumed to be a                                              // 309
  // constructor.                                                                                                    // 310
  if (pattern instanceof Function) {                                                                                 // 311
    if (value instanceof pattern)                                                                                    // 312
      return false;                                                                                                  // 313
    return {                                                                                                         // 314
      message: "Expected " + (pattern.name ||"particular constructor"),                                              // 315
      path: ""                                                                                                       // 316
    };                                                                                                               // 317
  }                                                                                                                  // 318
                                                                                                                     // 319
  var unknownKeysAllowed = false;                                                                                    // 320
  var unknownKeyPattern;                                                                                             // 321
  if (pattern instanceof ObjectIncluding) {                                                                          // 322
    unknownKeysAllowed = true;                                                                                       // 323
    pattern = pattern.pattern;                                                                                       // 324
  }                                                                                                                  // 325
  if (pattern instanceof ObjectWithValues) {                                                                         // 326
    unknownKeysAllowed = true;                                                                                       // 327
    unknownKeyPattern = [pattern.pattern];                                                                           // 328
    pattern = {};  // no required keys                                                                               // 329
  }                                                                                                                  // 330
                                                                                                                     // 331
  if (typeof pattern !== "object") {                                                                                 // 332
    return {                                                                                                         // 333
      message: "Bad pattern: unknown pattern type",                                                                  // 334
      path: ""                                                                                                       // 335
    };                                                                                                               // 336
  }                                                                                                                  // 337
                                                                                                                     // 338
  // An object, with required and optional keys. Note that this does NOT do                                          // 339
  // structural matches against objects of special types that happen to match                                        // 340
  // the pattern: this really needs to be a plain old {Object}!                                                      // 341
  if (typeof value !== 'object') {                                                                                   // 342
    return {                                                                                                         // 343
      message: "Expected object, got " + typeof value,                                                               // 344
      path: ""                                                                                                       // 345
    };                                                                                                               // 346
  }                                                                                                                  // 347
  if (value === null) {                                                                                              // 348
    return {                                                                                                         // 349
      message: "Expected object, got null",                                                                          // 350
      path: ""                                                                                                       // 351
    };                                                                                                               // 352
  }                                                                                                                  // 353
  if (! isPlainObject(value)) {                                                                                      // 354
    return {                                                                                                         // 355
      message: "Expected plain object",                                                                              // 356
      path: ""                                                                                                       // 357
    };                                                                                                               // 358
  }                                                                                                                  // 359
                                                                                                                     // 360
  var requiredPatterns = {};                                                                                         // 361
  var optionalPatterns = {};                                                                                         // 362
  _.each(pattern, function (subPattern, key) {                                                                       // 363
    if (subPattern instanceof Optional || subPattern instanceof Maybe)                                               // 364
      optionalPatterns[key] = subPattern.pattern;                                                                    // 365
    else                                                                                                             // 366
      requiredPatterns[key] = subPattern;                                                                            // 367
  });                                                                                                                // 368
                                                                                                                     // 369
  //XXX: replace with underscore's _.allKeys if Meteor updates underscore to 1.8+ (or lodash)                        // 370
  var allKeys = function(obj){                                                                                       // 371
    var keys = [];                                                                                                   // 372
    if (_.isObject(obj)){                                                                                            // 373
      for (var key in obj) keys.push(key);                                                                           // 374
    }                                                                                                                // 375
    return keys;                                                                                                     // 376
  }                                                                                                                  // 377
                                                                                                                     // 378
  for (var keys = allKeys(value), i = 0, length = keys.length; i < length; i++) {                                    // 379
    var key = keys[i];                                                                                               // 380
    var subValue = value[key];                                                                                       // 381
    if (_.has(requiredPatterns, key)) {                                                                              // 382
      var result = testSubtree(subValue, requiredPatterns[key]);                                                     // 383
      if (result) {                                                                                                  // 384
        result.path = _prependPath(key, result.path);                                                                // 385
        return result;                                                                                               // 386
      }                                                                                                              // 387
      delete requiredPatterns[key];                                                                                  // 388
    } else if (_.has(optionalPatterns, key)) {                                                                       // 389
      var result = testSubtree(subValue, optionalPatterns[key]);                                                     // 390
      if (result) {                                                                                                  // 391
        result.path = _prependPath(key, result.path);                                                                // 392
        return result;                                                                                               // 393
      }                                                                                                              // 394
    } else {                                                                                                         // 395
      if (!unknownKeysAllowed) {                                                                                     // 396
        return {                                                                                                     // 397
          message: "Unknown key",                                                                                    // 398
          path: key                                                                                                  // 399
        };                                                                                                           // 400
      }                                                                                                              // 401
      if (unknownKeyPattern) {                                                                                       // 402
        var result = testSubtree(subValue, unknownKeyPattern[0]);                                                    // 403
        if (result) {                                                                                                // 404
          result.path = _prependPath(key, result.path);                                                              // 405
          return result;                                                                                             // 406
        }                                                                                                            // 407
      }                                                                                                              // 408
    }                                                                                                                // 409
  }                                                                                                                  // 410
                                                                                                                     // 411
  var keys = _.keys(requiredPatterns);                                                                               // 412
  if (keys.length) {                                                                                                 // 413
    return {                                                                                                         // 414
      message: "Missing key '" + keys[0] + "'",                                                                      // 415
      path: ""                                                                                                       // 416
    };                                                                                                               // 417
  }                                                                                                                  // 418
};                                                                                                                   // 419
                                                                                                                     // 420
var ArgumentChecker = function (args, description) {                                                                 // 421
  var self = this;                                                                                                   // 422
  // Make a SHALLOW copy of the arguments. (We'll be doing identity checks                                           // 423
  // against its contents.)                                                                                          // 424
  self.args = _.clone(args);                                                                                         // 425
  // Since the common case will be to check arguments in order, and we splice                                        // 426
  // out arguments when we check them, make it so we splice out from the end                                         // 427
  // rather than the beginning.                                                                                      // 428
  self.args.reverse();                                                                                               // 429
  self.description = description;                                                                                    // 430
};                                                                                                                   // 431
                                                                                                                     // 432
_.extend(ArgumentChecker.prototype, {                                                                                // 433
  checking: function (value) {                                                                                       // 434
    var self = this;                                                                                                 // 435
    if (self._checkingOneValue(value))                                                                               // 436
      return;                                                                                                        // 437
    // Allow check(arguments, [String]) or check(arguments.slice(1), [String])                                       // 438
    // or check([foo, bar], [String]) to count... but only if value wasn't                                           // 439
    // itself an argument.                                                                                           // 440
    if (_.isArray(value) || _.isArguments(value)) {                                                                  // 441
      _.each(value, _.bind(self._checkingOneValue, self));                                                           // 442
    }                                                                                                                // 443
  },                                                                                                                 // 444
  _checkingOneValue: function (value) {                                                                              // 445
    var self = this;                                                                                                 // 446
    for (var i = 0; i < self.args.length; ++i) {                                                                     // 447
      // Is this value one of the arguments? (This can have a false positive if                                      // 448
      // the argument is an interned primitive, but it's still a good enough                                         // 449
      // check.)                                                                                                     // 450
      // (NaN is not === to itself, so we have to check specially.)                                                  // 451
      if (value === self.args[i] || (_.isNaN(value) && _.isNaN(self.args[i]))) {                                     // 452
        self.args.splice(i, 1);                                                                                      // 453
        return true;                                                                                                 // 454
      }                                                                                                              // 455
    }                                                                                                                // 456
    return false;                                                                                                    // 457
  },                                                                                                                 // 458
  throwUnlessAllArgumentsHaveBeenChecked: function () {                                                              // 459
    var self = this;                                                                                                 // 460
    if (!_.isEmpty(self.args))                                                                                       // 461
      throw new Error("Did not check() all arguments during " +                                                      // 462
                      self.description);                                                                             // 463
  }                                                                                                                  // 464
});                                                                                                                  // 465
                                                                                                                     // 466
var _jsKeywords = ["do", "if", "in", "for", "let", "new", "try", "var", "case",                                      // 467
  "else", "enum", "eval", "false", "null", "this", "true", "void", "with",                                           // 468
  "break", "catch", "class", "const", "super", "throw", "while", "yield",                                            // 469
  "delete", "export", "import", "public", "return", "static", "switch",                                              // 470
  "typeof", "default", "extends", "finally", "package", "private", "continue",                                       // 471
  "debugger", "function", "arguments", "interface", "protected", "implements",                                       // 472
  "instanceof"];                                                                                                     // 473
                                                                                                                     // 474
// Assumes the base of path is already escaped properly                                                              // 475
// returns key + base                                                                                                // 476
var _prependPath = function (key, base) {                                                                            // 477
  if ((typeof key) === "number" || key.match(/^[0-9]+$/))                                                            // 478
    key = "[" + key + "]";                                                                                           // 479
  else if (!key.match(/^[a-z_$][0-9a-z_$]*$/i) || _.contains(_jsKeywords, key))                                      // 480
    key = JSON.stringify([key]);                                                                                     // 481
                                                                                                                     // 482
  if (base && base[0] !== "[")                                                                                       // 483
    return key + '.' + base;                                                                                         // 484
  return key + base;                                                                                                 // 485
};                                                                                                                   // 486
                                                                                                                     // 487
                                                                                                                     // 488
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"isPlainObject.js":function(require,exports){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/check/isPlainObject.js                                                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// Copy of jQuery.isPlainObject for the server side from jQuery v3.1.1.                                              // 1
                                                                                                                     // 2
var class2type = {};                                                                                                 // 3
                                                                                                                     // 4
var toString = class2type.toString;                                                                                  // 5
                                                                                                                     // 6
var hasOwn = class2type.hasOwnProperty;                                                                              // 7
                                                                                                                     // 8
var fnToString = hasOwn.toString;                                                                                    // 9
                                                                                                                     // 10
var ObjectFunctionString = fnToString.call(Object);                                                                  // 11
                                                                                                                     // 12
var getProto = Object.getPrototypeOf;                                                                                // 13
                                                                                                                     // 14
exports.isPlainObject = function( obj ) {                                                                            // 15
  var proto,                                                                                                         // 16
    Ctor;                                                                                                            // 17
                                                                                                                     // 18
  // Detect obvious negatives                                                                                        // 19
  // Use toString instead of jQuery.type to catch host objects                                                       // 20
  if (!obj || toString.call(obj) !== "[object Object]") {                                                            // 21
    return false;                                                                                                    // 22
  }                                                                                                                  // 23
                                                                                                                     // 24
  proto = getProto(obj);                                                                                             // 25
                                                                                                                     // 26
  // Objects with no prototype (e.g., `Object.create( null )`) are plain                                             // 27
  if (!proto) {                                                                                                      // 28
    return true;                                                                                                     // 29
  }                                                                                                                  // 30
                                                                                                                     // 31
  // Objects with prototype are plain iff they were constructed by a global Object function                          // 32
  Ctor = hasOwn.call(proto, "constructor") && proto.constructor;                                                     // 33
  return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;                               // 34
};                                                                                                                   // 35
                                                                                                                     // 36
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/check/match.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.check = exports, {
  check: check,
  Match: Match
});

})();
