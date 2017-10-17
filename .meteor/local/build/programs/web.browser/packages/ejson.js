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
var Base64 = Package.base64.Base64;

/* Package-scope variables */
var EJSON, EJSONTest;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ejson/ejson.js                                                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/**                                                                                                                  // 1
 * @namespace                                                                                                        // 2
 * @summary Namespace for EJSON functions                                                                            // 3
 */                                                                                                                  // 4
EJSON = {};                                                                                                          // 5
EJSONTest = {};                                                                                                      // 6
                                                                                                                     // 7
                                                                                                                     // 8
                                                                                                                     // 9
// Custom type interface definition                                                                                  // 10
/**                                                                                                                  // 11
 * @class CustomType                                                                                                 // 12
 * @instanceName customType                                                                                          // 13
 * @memberOf EJSON                                                                                                   // 14
 * @summary The interface that a class must satisfy to be able to become an                                          // 15
 * EJSON custom type via EJSON.addType.                                                                              // 16
 */                                                                                                                  // 17
                                                                                                                     // 18
/**                                                                                                                  // 19
 * @function typeName                                                                                                // 20
 * @memberOf EJSON.CustomType                                                                                        // 21
 * @summary Return the tag used to identify this type.  This must match the tag used to register this type with [`EJSON.addType`](#ejson_add_type).
 * @locus Anywhere                                                                                                   // 23
 * @instance                                                                                                         // 24
 */                                                                                                                  // 25
                                                                                                                     // 26
/**                                                                                                                  // 27
 * @function toJSONValue                                                                                             // 28
 * @memberOf EJSON.CustomType                                                                                        // 29
 * @summary Serialize this instance into a JSON-compatible value.                                                    // 30
 * @locus Anywhere                                                                                                   // 31
 * @instance                                                                                                         // 32
 */                                                                                                                  // 33
                                                                                                                     // 34
/**                                                                                                                  // 35
 * @function clone                                                                                                   // 36
 * @memberOf EJSON.CustomType                                                                                        // 37
 * @summary Return a value `r` such that `this.equals(r)` is true, and modifications to `r` do not affect `this` and vice versa.
 * @locus Anywhere                                                                                                   // 39
 * @instance                                                                                                         // 40
 */                                                                                                                  // 41
                                                                                                                     // 42
/**                                                                                                                  // 43
 * @function equals                                                                                                  // 44
 * @memberOf EJSON.CustomType                                                                                        // 45
 * @summary Return `true` if `other` has a value equal to `this`; `false` otherwise.                                 // 46
 * @locus Anywhere                                                                                                   // 47
 * @param {Object} other Another object to compare this to.                                                          // 48
 * @instance                                                                                                         // 49
 */                                                                                                                  // 50
                                                                                                                     // 51
                                                                                                                     // 52
var customTypes = {};                                                                                                // 53
// Add a custom type, using a method of your choice to get to and                                                    // 54
// from a basic JSON-able representation.  The factory argument                                                      // 55
// is a function of JSON-able --> your object                                                                        // 56
// The type you add must have:                                                                                       // 57
// - A toJSONValue() method, so that Meteor can serialize it                                                         // 58
// - a typeName() method, to show how to look it up in our type table.                                               // 59
// It is okay if these methods are monkey-patched on.                                                                // 60
// EJSON.clone will use toJSONValue and the given factory to produce                                                 // 61
// a clone, but you may specify a method clone() that will be                                                        // 62
// used instead.                                                                                                     // 63
// Similarly, EJSON.equals will use toJSONValue to make comparisons,                                                 // 64
// but you may provide a method equals() instead.                                                                    // 65
/**                                                                                                                  // 66
 * @summary Add a custom datatype to EJSON.                                                                          // 67
 * @locus Anywhere                                                                                                   // 68
 * @param {String} name A tag for your custom type; must be unique among custom data types defined in your project, and must match the result of your type's `typeName` method.
 * @param {Function} factory A function that deserializes a JSON-compatible value into an instance of your type.  This should match the serialization performed by your type's `toJSONValue` method.
 */                                                                                                                  // 71
EJSON.addType = function (name, factory) {                                                                           // 72
  if (_.has(customTypes, name))                                                                                      // 73
    throw new Error("Type " + name + " already present");                                                            // 74
  customTypes[name] = factory;                                                                                       // 75
};                                                                                                                   // 76
                                                                                                                     // 77
var isInfOrNan = function (obj) {                                                                                    // 78
  return _.isNaN(obj) || obj === Infinity || obj === -Infinity;                                                      // 79
};                                                                                                                   // 80
                                                                                                                     // 81
var builtinConverters = [                                                                                            // 82
  { // Date                                                                                                          // 83
    matchJSONValue: function (obj) {                                                                                 // 84
      return _.has(obj, '$date') && _.size(obj) === 1;                                                               // 85
    },                                                                                                               // 86
    matchObject: function (obj) {                                                                                    // 87
      return obj instanceof Date;                                                                                    // 88
    },                                                                                                               // 89
    toJSONValue: function (obj) {                                                                                    // 90
      return {$date: obj.getTime()};                                                                                 // 91
    },                                                                                                               // 92
    fromJSONValue: function (obj) {                                                                                  // 93
      return new Date(obj.$date);                                                                                    // 94
    }                                                                                                                // 95
  },                                                                                                                 // 96
  { // NaN, Inf, -Inf. (These are the only objects with typeof !== 'object'                                          // 97
    // which we match.)                                                                                              // 98
    matchJSONValue: function (obj) {                                                                                 // 99
      return _.has(obj, '$InfNaN') && _.size(obj) === 1;                                                             // 100
    },                                                                                                               // 101
    matchObject: isInfOrNan,                                                                                         // 102
    toJSONValue: function (obj) {                                                                                    // 103
      var sign;                                                                                                      // 104
      if (_.isNaN(obj))                                                                                              // 105
        sign = 0;                                                                                                    // 106
      else if (obj === Infinity)                                                                                     // 107
        sign = 1;                                                                                                    // 108
      else                                                                                                           // 109
        sign = -1;                                                                                                   // 110
      return {$InfNaN: sign};                                                                                        // 111
    },                                                                                                               // 112
    fromJSONValue: function (obj) {                                                                                  // 113
      return obj.$InfNaN/0;                                                                                          // 114
    }                                                                                                                // 115
  },                                                                                                                 // 116
  { // Binary                                                                                                        // 117
    matchJSONValue: function (obj) {                                                                                 // 118
      return _.has(obj, '$binary') && _.size(obj) === 1;                                                             // 119
    },                                                                                                               // 120
    matchObject: function (obj) {                                                                                    // 121
      return typeof Uint8Array !== 'undefined' && obj instanceof Uint8Array                                          // 122
        || (obj && _.has(obj, '$Uint8ArrayPolyfill'));                                                               // 123
    },                                                                                                               // 124
    toJSONValue: function (obj) {                                                                                    // 125
      return {$binary: Base64.encode(obj)};                                                                          // 126
    },                                                                                                               // 127
    fromJSONValue: function (obj) {                                                                                  // 128
      return Base64.decode(obj.$binary);                                                                             // 129
    }                                                                                                                // 130
  },                                                                                                                 // 131
  { // Escaping one level                                                                                            // 132
    matchJSONValue: function (obj) {                                                                                 // 133
      return _.has(obj, '$escape') && _.size(obj) === 1;                                                             // 134
    },                                                                                                               // 135
    matchObject: function (obj) {                                                                                    // 136
      if (_.isEmpty(obj) || _.size(obj) > 2) {                                                                       // 137
        return false;                                                                                                // 138
      }                                                                                                              // 139
      return _.any(builtinConverters, function (converter) {                                                         // 140
        return converter.matchJSONValue(obj);                                                                        // 141
      });                                                                                                            // 142
    },                                                                                                               // 143
    toJSONValue: function (obj) {                                                                                    // 144
      var newObj = {};                                                                                               // 145
      _.each(obj, function (value, key) {                                                                            // 146
        newObj[key] = EJSON.toJSONValue(value);                                                                      // 147
      });                                                                                                            // 148
      return {$escape: newObj};                                                                                      // 149
    },                                                                                                               // 150
    fromJSONValue: function (obj) {                                                                                  // 151
      var newObj = {};                                                                                               // 152
      _.each(obj.$escape, function (value, key) {                                                                    // 153
        newObj[key] = EJSON.fromJSONValue(value);                                                                    // 154
      });                                                                                                            // 155
      return newObj;                                                                                                 // 156
    }                                                                                                                // 157
  },                                                                                                                 // 158
  { // Custom                                                                                                        // 159
    matchJSONValue: function (obj) {                                                                                 // 160
      return _.has(obj, '$type') && _.has(obj, '$value') && _.size(obj) === 2;                                       // 161
    },                                                                                                               // 162
    matchObject: function (obj) {                                                                                    // 163
      return EJSON._isCustomType(obj);                                                                               // 164
    },                                                                                                               // 165
    toJSONValue: function (obj) {                                                                                    // 166
      var jsonValue = Meteor._noYieldsAllowed(function () {                                                          // 167
        return obj.toJSONValue();                                                                                    // 168
      });                                                                                                            // 169
      return {$type: obj.typeName(), $value: jsonValue};                                                             // 170
    },                                                                                                               // 171
    fromJSONValue: function (obj) {                                                                                  // 172
      var typeName = obj.$type;                                                                                      // 173
      if (!_.has(customTypes, typeName))                                                                             // 174
        throw new Error("Custom EJSON type " + typeName + " is not defined");                                        // 175
      var converter = customTypes[typeName];                                                                         // 176
      return Meteor._noYieldsAllowed(function () {                                                                   // 177
        return converter(obj.$value);                                                                                // 178
      });                                                                                                            // 179
    }                                                                                                                // 180
  }                                                                                                                  // 181
];                                                                                                                   // 182
                                                                                                                     // 183
EJSON._isCustomType = function (obj) {                                                                               // 184
  return obj &&                                                                                                      // 185
    typeof obj.toJSONValue === 'function' &&                                                                         // 186
    typeof obj.typeName === 'function' &&                                                                            // 187
    _.has(customTypes, obj.typeName());                                                                              // 188
};                                                                                                                   // 189
                                                                                                                     // 190
EJSON._getTypes = function () {                                                                                      // 191
  return customTypes;                                                                                                // 192
};                                                                                                                   // 193
                                                                                                                     // 194
EJSON._getConverters = function () {                                                                                 // 195
  return builtinConverters;                                                                                          // 196
};                                                                                                                   // 197
                                                                                                                     // 198
// for both arrays and objects, in-place modification.                                                               // 199
var adjustTypesToJSONValue =                                                                                         // 200
EJSON._adjustTypesToJSONValue = function (obj) {                                                                     // 201
  // Is it an atom that we need to adjust?                                                                           // 202
  if (obj === null)                                                                                                  // 203
    return null;                                                                                                     // 204
  var maybeChanged = toJSONValueHelper(obj);                                                                         // 205
  if (maybeChanged !== undefined)                                                                                    // 206
    return maybeChanged;                                                                                             // 207
                                                                                                                     // 208
  // Other atoms are unchanged.                                                                                      // 209
  if (typeof obj !== 'object')                                                                                       // 210
    return obj;                                                                                                      // 211
                                                                                                                     // 212
  // Iterate over array or object structure.                                                                         // 213
  _.each(obj, function (value, key) {                                                                                // 214
    if (typeof value !== 'object' && value !== undefined &&                                                          // 215
        !isInfOrNan(value))                                                                                          // 216
      return; // continue                                                                                            // 217
                                                                                                                     // 218
    var changed = toJSONValueHelper(value);                                                                          // 219
    if (changed) {                                                                                                   // 220
      obj[key] = changed;                                                                                            // 221
      return; // on to the next key                                                                                  // 222
    }                                                                                                                // 223
    // if we get here, value is an object but not adjustable                                                         // 224
    // at this level.  recurse.                                                                                      // 225
    adjustTypesToJSONValue(value);                                                                                   // 226
  });                                                                                                                // 227
  return obj;                                                                                                        // 228
};                                                                                                                   // 229
                                                                                                                     // 230
// Either return the JSON-compatible version of the argument, or undefined (if                                       // 231
// the item isn't itself replaceable, but maybe some fields in it are)                                               // 232
var toJSONValueHelper = function (item) {                                                                            // 233
  for (var i = 0; i < builtinConverters.length; i++) {                                                               // 234
    var converter = builtinConverters[i];                                                                            // 235
    if (converter.matchObject(item)) {                                                                               // 236
      return converter.toJSONValue(item);                                                                            // 237
    }                                                                                                                // 238
  }                                                                                                                  // 239
  return undefined;                                                                                                  // 240
};                                                                                                                   // 241
                                                                                                                     // 242
/**                                                                                                                  // 243
 * @summary Serialize an EJSON-compatible value into its plain JSON representation.                                  // 244
 * @locus Anywhere                                                                                                   // 245
 * @param {EJSON} val A value to serialize to plain JSON.                                                            // 246
 */                                                                                                                  // 247
EJSON.toJSONValue = function (item) {                                                                                // 248
  var changed = toJSONValueHelper(item);                                                                             // 249
  if (changed !== undefined)                                                                                         // 250
    return changed;                                                                                                  // 251
  if (typeof item === 'object') {                                                                                    // 252
    item = EJSON.clone(item);                                                                                        // 253
    adjustTypesToJSONValue(item);                                                                                    // 254
  }                                                                                                                  // 255
  return item;                                                                                                       // 256
};                                                                                                                   // 257
                                                                                                                     // 258
// for both arrays and objects. Tries its best to just                                                               // 259
// use the object you hand it, but may return something                                                              // 260
// different if the object you hand it itself needs changing.                                                        // 261
//                                                                                                                   // 262
var adjustTypesFromJSONValue =                                                                                       // 263
EJSON._adjustTypesFromJSONValue = function (obj) {                                                                   // 264
  if (obj === null)                                                                                                  // 265
    return null;                                                                                                     // 266
  var maybeChanged = fromJSONValueHelper(obj);                                                                       // 267
  if (maybeChanged !== obj)                                                                                          // 268
    return maybeChanged;                                                                                             // 269
                                                                                                                     // 270
  // Other atoms are unchanged.                                                                                      // 271
  if (typeof obj !== 'object')                                                                                       // 272
    return obj;                                                                                                      // 273
                                                                                                                     // 274
  _.each(obj, function (value, key) {                                                                                // 275
    if (typeof value === 'object') {                                                                                 // 276
      var changed = fromJSONValueHelper(value);                                                                      // 277
      if (value !== changed) {                                                                                       // 278
        obj[key] = changed;                                                                                          // 279
        return;                                                                                                      // 280
      }                                                                                                              // 281
      // if we get here, value is an object but not adjustable                                                       // 282
      // at this level.  recurse.                                                                                    // 283
      adjustTypesFromJSONValue(value);                                                                               // 284
    }                                                                                                                // 285
  });                                                                                                                // 286
  return obj;                                                                                                        // 287
};                                                                                                                   // 288
                                                                                                                     // 289
// Either return the argument changed to have the non-json                                                           // 290
// rep of itself (the Object version) or the argument itself.                                                        // 291
                                                                                                                     // 292
// DOES NOT RECURSE.  For actually getting the fully-changed value, use                                              // 293
// EJSON.fromJSONValue                                                                                               // 294
var fromJSONValueHelper = function (value) {                                                                         // 295
  if (typeof value === 'object' && value !== null) {                                                                 // 296
    if (_.size(value) <= 2                                                                                           // 297
        && _.all(value, function (v, k) {                                                                            // 298
          return typeof k === 'string' && k.substr(0, 1) === '$';                                                    // 299
        })) {                                                                                                        // 300
      for (var i = 0; i < builtinConverters.length; i++) {                                                           // 301
        var converter = builtinConverters[i];                                                                        // 302
        if (converter.matchJSONValue(value)) {                                                                       // 303
          return converter.fromJSONValue(value);                                                                     // 304
        }                                                                                                            // 305
      }                                                                                                              // 306
    }                                                                                                                // 307
  }                                                                                                                  // 308
  return value;                                                                                                      // 309
};                                                                                                                   // 310
                                                                                                                     // 311
/**                                                                                                                  // 312
 * @summary Deserialize an EJSON value from its plain JSON representation.                                           // 313
 * @locus Anywhere                                                                                                   // 314
 * @param {JSONCompatible} val A value to deserialize into EJSON.                                                    // 315
 */                                                                                                                  // 316
EJSON.fromJSONValue = function (item) {                                                                              // 317
  var changed = fromJSONValueHelper(item);                                                                           // 318
  if (changed === item && typeof item === 'object') {                                                                // 319
    item = EJSON.clone(item);                                                                                        // 320
    adjustTypesFromJSONValue(item);                                                                                  // 321
    return item;                                                                                                     // 322
  } else {                                                                                                           // 323
    return changed;                                                                                                  // 324
  }                                                                                                                  // 325
};                                                                                                                   // 326
                                                                                                                     // 327
/**                                                                                                                  // 328
 * @summary Serialize a value to a string.                                                                           // 329
                                                                                                                     // 330
For EJSON values, the serialization fully represents the value. For non-EJSON values, serializes the same way as `JSON.stringify`.
 * @locus Anywhere                                                                                                   // 332
 * @param {EJSON} val A value to stringify.                                                                          // 333
 * @param {Object} [options]                                                                                         // 334
 * @param {Boolean | Integer | String} options.indent Indents objects and arrays for easy readability.  When `true`, indents by 2 spaces; when an integer, indents by that number of spaces; and when a string, uses the string as the indentation pattern.
 * @param {Boolean} options.canonical When `true`, stringifies keys in an object in sorted order.                    // 336
 */                                                                                                                  // 337
EJSON.stringify = function (item, options) {                                                                         // 338
  var json = EJSON.toJSONValue(item);                                                                                // 339
  if (options && (options.canonical || options.indent)) {                                                            // 340
    return EJSON._canonicalStringify(json, options);                                                                 // 341
  } else {                                                                                                           // 342
    return JSON.stringify(json);                                                                                     // 343
  }                                                                                                                  // 344
};                                                                                                                   // 345
                                                                                                                     // 346
/**                                                                                                                  // 347
 * @summary Parse a string into an EJSON value. Throws an error if the string is not valid EJSON.                    // 348
 * @locus Anywhere                                                                                                   // 349
 * @param {String} str A string to parse into an EJSON value.                                                        // 350
 */                                                                                                                  // 351
EJSON.parse = function (item) {                                                                                      // 352
  if (typeof item !== 'string')                                                                                      // 353
    throw new Error("EJSON.parse argument should be a string");                                                      // 354
  return EJSON.fromJSONValue(JSON.parse(item));                                                                      // 355
};                                                                                                                   // 356
                                                                                                                     // 357
/**                                                                                                                  // 358
 * @summary Returns true if `x` is a buffer of binary data, as returned from [`EJSON.newBinary`](#ejson_new_binary).
 * @param {Object} x The variable to check.                                                                          // 360
 * @locus Anywhere                                                                                                   // 361
 */                                                                                                                  // 362
EJSON.isBinary = function (obj) {                                                                                    // 363
  return !!((typeof Uint8Array !== 'undefined' && obj instanceof Uint8Array) ||                                      // 364
    (obj && obj.$Uint8ArrayPolyfill));                                                                               // 365
};                                                                                                                   // 366
                                                                                                                     // 367
/**                                                                                                                  // 368
 * @summary Return true if `a` and `b` are equal to each other.  Return false otherwise.  Uses the `equals` method on `a` if present, otherwise performs a deep comparison.
 * @locus Anywhere                                                                                                   // 370
 * @param {EJSON} a                                                                                                  // 371
 * @param {EJSON} b                                                                                                  // 372
 * @param {Object} [options]                                                                                         // 373
 * @param {Boolean} options.keyOrderSensitive Compare in key sensitive order, if supported by the JavaScript implementation.  For example, `{a: 1, b: 2}` is equal to `{b: 2, a: 1}` only when `keyOrderSensitive` is `false`.  The default is `false`.
 */                                                                                                                  // 375
EJSON.equals = function (a, b, options) {                                                                            // 376
  var i;                                                                                                             // 377
  var keyOrderSensitive = !!(options && options.keyOrderSensitive);                                                  // 378
  if (a === b)                                                                                                       // 379
    return true;                                                                                                     // 380
  if (_.isNaN(a) && _.isNaN(b))                                                                                      // 381
    return true; // This differs from the IEEE spec for NaN equality, b/c we don't want                              // 382
                 // anything ever with a NaN to be poisoned from becoming equal to anything.                         // 383
  if (!a || !b) // if either one is falsy, they'd have to be === to be equal                                         // 384
    return false;                                                                                                    // 385
  if (!(typeof a === 'object' && typeof b === 'object'))                                                             // 386
    return false;                                                                                                    // 387
  if (a instanceof Date && b instanceof Date)                                                                        // 388
    return a.valueOf() === b.valueOf();                                                                              // 389
  if (EJSON.isBinary(a) && EJSON.isBinary(b)) {                                                                      // 390
    if (a.length !== b.length)                                                                                       // 391
      return false;                                                                                                  // 392
    for (i = 0; i < a.length; i++) {                                                                                 // 393
      if (a[i] !== b[i])                                                                                             // 394
        return false;                                                                                                // 395
    }                                                                                                                // 396
    return true;                                                                                                     // 397
  }                                                                                                                  // 398
  if (typeof (a.equals) === 'function')                                                                              // 399
    return a.equals(b, options);                                                                                     // 400
  if (typeof (b.equals) === 'function')                                                                              // 401
    return b.equals(a, options);                                                                                     // 402
  if (a instanceof Array) {                                                                                          // 403
    if (!(b instanceof Array))                                                                                       // 404
      return false;                                                                                                  // 405
    if (a.length !== b.length)                                                                                       // 406
      return false;                                                                                                  // 407
    for (i = 0; i < a.length; i++) {                                                                                 // 408
      if (!EJSON.equals(a[i], b[i], options))                                                                        // 409
        return false;                                                                                                // 410
    }                                                                                                                // 411
    return true;                                                                                                     // 412
  }                                                                                                                  // 413
  // fallback for custom types that don't implement their own equals                                                 // 414
  switch (EJSON._isCustomType(a) + EJSON._isCustomType(b)) {                                                         // 415
    case 1: return false;                                                                                            // 416
    case 2: return EJSON.equals(EJSON.toJSONValue(a), EJSON.toJSONValue(b));                                         // 417
  }                                                                                                                  // 418
  // fall back to structural equality of objects                                                                     // 419
  var ret;                                                                                                           // 420
  if (keyOrderSensitive) {                                                                                           // 421
    var bKeys = [];                                                                                                  // 422
    _.each(b, function (val, x) {                                                                                    // 423
        bKeys.push(x);                                                                                               // 424
    });                                                                                                              // 425
    i = 0;                                                                                                           // 426
    ret = _.all(a, function (val, x) {                                                                               // 427
      if (i >= bKeys.length) {                                                                                       // 428
        return false;                                                                                                // 429
      }                                                                                                              // 430
      if (x !== bKeys[i]) {                                                                                          // 431
        return false;                                                                                                // 432
      }                                                                                                              // 433
      if (!EJSON.equals(val, b[bKeys[i]], options)) {                                                                // 434
        return false;                                                                                                // 435
      }                                                                                                              // 436
      i++;                                                                                                           // 437
      return true;                                                                                                   // 438
    });                                                                                                              // 439
    return ret && i === bKeys.length;                                                                                // 440
  } else {                                                                                                           // 441
    i = 0;                                                                                                           // 442
    ret = _.all(a, function (val, key) {                                                                             // 443
      if (!_.has(b, key)) {                                                                                          // 444
        return false;                                                                                                // 445
      }                                                                                                              // 446
      if (!EJSON.equals(val, b[key], options)) {                                                                     // 447
        return false;                                                                                                // 448
      }                                                                                                              // 449
      i++;                                                                                                           // 450
      return true;                                                                                                   // 451
    });                                                                                                              // 452
    return ret && _.size(b) === i;                                                                                   // 453
  }                                                                                                                  // 454
};                                                                                                                   // 455
                                                                                                                     // 456
/**                                                                                                                  // 457
 * @summary Return a deep copy of `val`.                                                                             // 458
 * @locus Anywhere                                                                                                   // 459
 * @param {EJSON} val A value to copy.                                                                               // 460
 */                                                                                                                  // 461
EJSON.clone = function (v) {                                                                                         // 462
  var ret;                                                                                                           // 463
  if (typeof v !== "object")                                                                                         // 464
    return v;                                                                                                        // 465
  if (v === null)                                                                                                    // 466
    return null; // null has typeof "object"                                                                         // 467
  if (v instanceof Date)                                                                                             // 468
    return new Date(v.getTime());                                                                                    // 469
  // RegExps are not really EJSON elements (eg we don't define a serialization                                       // 470
  // for them), but they're immutable anyway, so we can support them in clone.                                       // 471
  if (v instanceof RegExp)                                                                                           // 472
    return v;                                                                                                        // 473
  if (EJSON.isBinary(v)) {                                                                                           // 474
    ret = EJSON.newBinary(v.length);                                                                                 // 475
    for (var i = 0; i < v.length; i++) {                                                                             // 476
      ret[i] = v[i];                                                                                                 // 477
    }                                                                                                                // 478
    return ret;                                                                                                      // 479
  }                                                                                                                  // 480
  // XXX: Use something better than underscore's isArray                                                             // 481
  if (_.isArray(v) || _.isArguments(v)) {                                                                            // 482
    // For some reason, _.map doesn't work in this context on Opera (weird test                                      // 483
    // failures).                                                                                                    // 484
    ret = [];                                                                                                        // 485
    for (i = 0; i < v.length; i++)                                                                                   // 486
      ret[i] = EJSON.clone(v[i]);                                                                                    // 487
    return ret;                                                                                                      // 488
  }                                                                                                                  // 489
  // handle general user-defined typed Objects if they have a clone method                                           // 490
  if (typeof v.clone === 'function') {                                                                               // 491
    return v.clone();                                                                                                // 492
  }                                                                                                                  // 493
  // handle other custom types                                                                                       // 494
  if (EJSON._isCustomType(v)) {                                                                                      // 495
    return EJSON.fromJSONValue(EJSON.clone(EJSON.toJSONValue(v)), true);                                             // 496
  }                                                                                                                  // 497
  // handle other objects                                                                                            // 498
  ret = {};                                                                                                          // 499
  _.each(v, function (value, key) {                                                                                  // 500
    ret[key] = EJSON.clone(value);                                                                                   // 501
  });                                                                                                                // 502
  return ret;                                                                                                        // 503
};                                                                                                                   // 504
                                                                                                                     // 505
/**                                                                                                                  // 506
 * @summary Allocate a new buffer of binary data that EJSON can serialize.                                           // 507
 * @locus Anywhere                                                                                                   // 508
 * @param {Number} size The number of bytes of binary data to allocate.                                              // 509
 */                                                                                                                  // 510
// EJSON.newBinary is the public documented API for this functionality,                                              // 511
// but the implementation is in the 'base64' package to avoid                                                        // 512
// introducing a circular dependency. (If the implementation were here,                                              // 513
// then 'base64' would have to use EJSON.newBinary, and 'ejson' would                                                // 514
// also have to use 'base64'.)                                                                                       // 515
EJSON.newBinary = Base64.newBinary;                                                                                  // 516
                                                                                                                     // 517
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ejson/stringify.js                                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// Based on json2.js from https://github.com/douglascrockford/JSON-js                                                // 1
//                                                                                                                   // 2
//    json2.js                                                                                                       // 3
//    2012-10-08                                                                                                     // 4
//                                                                                                                   // 5
//    Public Domain.                                                                                                 // 6
//                                                                                                                   // 7
//    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.                                                        // 8
                                                                                                                     // 9
function quote(string) {                                                                                             // 10
  return JSON.stringify(string);                                                                                     // 11
}                                                                                                                    // 12
                                                                                                                     // 13
var str = function (key, holder, singleIndent, outerIndent, canonical) {                                             // 14
                                                                                                                     // 15
  // Produce a string from holder[key].                                                                              // 16
                                                                                                                     // 17
  var i;          // The loop counter.                                                                               // 18
  var k;          // The member key.                                                                                 // 19
  var v;          // The member value.                                                                               // 20
  var length;                                                                                                        // 21
  var innerIndent = outerIndent;                                                                                     // 22
  var partial;                                                                                                       // 23
  var value = holder[key];                                                                                           // 24
                                                                                                                     // 25
  // What happens next depends on the value's type.                                                                  // 26
                                                                                                                     // 27
  switch (typeof value) {                                                                                            // 28
  case 'string':                                                                                                     // 29
    return quote(value);                                                                                             // 30
  case 'number':                                                                                                     // 31
    // JSON numbers must be finite. Encode non-finite numbers as null.                                               // 32
    return isFinite(value) ? String(value) : 'null';                                                                 // 33
  case 'boolean':                                                                                                    // 34
    return String(value);                                                                                            // 35
  // If the type is 'object', we might be dealing with an object or an array or                                      // 36
  // null.                                                                                                           // 37
  case 'object':                                                                                                     // 38
    // Due to a specification blunder in ECMAScript, typeof null is 'object',                                        // 39
    // so watch out for that case.                                                                                   // 40
    if (!value) {                                                                                                    // 41
      return 'null';                                                                                                 // 42
    }                                                                                                                // 43
    // Make an array to hold the partial results of stringifying this object value.                                  // 44
    innerIndent = outerIndent + singleIndent;                                                                        // 45
    partial = [];                                                                                                    // 46
                                                                                                                     // 47
    // Is the value an array?                                                                                        // 48
    if (_.isArray(value) || _.isArguments(value)) {                                                                  // 49
                                                                                                                     // 50
      // The value is an array. Stringify every element. Use null as a placeholder                                   // 51
      // for non-JSON values.                                                                                        // 52
                                                                                                                     // 53
      length = value.length;                                                                                         // 54
      for (i = 0; i < length; i += 1) {                                                                              // 55
        partial[i] = str(i, value, singleIndent, innerIndent, canonical) || 'null';                                  // 56
      }                                                                                                              // 57
                                                                                                                     // 58
      // Join all of the elements together, separated with commas, and wrap them in                                  // 59
      // brackets.                                                                                                   // 60
                                                                                                                     // 61
      if (partial.length === 0) {                                                                                    // 62
        v = '[]';                                                                                                    // 63
      } else if (innerIndent) {                                                                                      // 64
        v = '[\n' + innerIndent + partial.join(',\n' + innerIndent) + '\n' + outerIndent + ']';                      // 65
      } else {                                                                                                       // 66
        v = '[' + partial.join(',') + ']';                                                                           // 67
      }                                                                                                              // 68
      return v;                                                                                                      // 69
    }                                                                                                                // 70
                                                                                                                     // 71
                                                                                                                     // 72
    // Iterate through all of the keys in the object.                                                                // 73
    var keys = _.keys(value);                                                                                        // 74
    if (canonical)                                                                                                   // 75
      keys = keys.sort();                                                                                            // 76
    _.each(keys, function (k) {                                                                                      // 77
      v = str(k, value, singleIndent, innerIndent, canonical);                                                       // 78
      if (v) {                                                                                                       // 79
        partial.push(quote(k) + (innerIndent ? ': ' : ':') + v);                                                     // 80
      }                                                                                                              // 81
    });                                                                                                              // 82
                                                                                                                     // 83
                                                                                                                     // 84
    // Join all of the member texts together, separated with commas,                                                 // 85
    // and wrap them in braces.                                                                                      // 86
                                                                                                                     // 87
    if (partial.length === 0) {                                                                                      // 88
      v = '{}';                                                                                                      // 89
    } else if (innerIndent) {                                                                                        // 90
      v = '{\n' + innerIndent + partial.join(',\n' + innerIndent) + '\n' + outerIndent + '}';                        // 91
    } else {                                                                                                         // 92
      v = '{' + partial.join(',') + '}';                                                                             // 93
    }                                                                                                                // 94
    return v;                                                                                                        // 95
  }                                                                                                                  // 96
}                                                                                                                    // 97
                                                                                                                     // 98
// If the JSON object does not yet have a stringify method, give it one.                                             // 99
                                                                                                                     // 100
EJSON._canonicalStringify = function (value, options) {                                                              // 101
  // Make a fake root object containing our value under the key of ''.                                               // 102
  // Return the result of stringifying the value.                                                                    // 103
  options = _.extend({                                                                                               // 104
    indent: "",                                                                                                      // 105
    canonical: false                                                                                                 // 106
  }, options);                                                                                                       // 107
  if (options.indent === true) {                                                                                     // 108
    options.indent = "  ";                                                                                           // 109
  } else if (typeof options.indent === 'number') {                                                                   // 110
    var newIndent = "";                                                                                              // 111
    for (var i = 0; i < options.indent; i++) {                                                                       // 112
      newIndent += ' ';                                                                                              // 113
    }                                                                                                                // 114
    options.indent = newIndent;                                                                                      // 115
  }                                                                                                                  // 116
  return str('', {'': value}, options.indent, "", options.canonical);                                                // 117
};                                                                                                                   // 118
                                                                                                                     // 119
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.ejson = {}, {
  EJSON: EJSON,
  EJSONTest: EJSONTest
});

})();
