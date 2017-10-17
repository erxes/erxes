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
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var _ = Package.underscore._;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;

/* Package-scope variables */
var humanize, MongoObject, Utility, SimpleSchema, doValidation1, doValidation2, SimpleSchemaValidationContext;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/string-polyfills.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
if (!String.prototype.startsWith) {                                                                                    // 1
  String.prototype.startsWith = function(searchString, position) {                                                     // 2
    position = position || 0;                                                                                          // 3
    return this.indexOf(searchString, position) === position;                                                          // 4
  };                                                                                                                   // 5
}                                                                                                                      // 6
                                                                                                                       // 7
if (!String.prototype.trim) {                                                                                          // 8
  String.prototype.trim = function () {                                                                                // 9
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');                                                     // 10
  };                                                                                                                   // 11
}                                                                                                                      // 12
                                                                                                                       // 13
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/string-humanize.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/*                                                                                                                     // 1
  Code source:                                                                                                         // 2
    https://github.com/jxson/string-humanize                                                                           // 3
    https://github.com/jxson/string-capitalize                                                                         // 4
 */                                                                                                                    // 5
                                                                                                                       // 6
function capitalize(string){                                                                                           // 7
  string = string || '';                                                                                               // 8
  string = string.trim();                                                                                              // 9
                                                                                                                       // 10
  if (string[0]) {                                                                                                     // 11
    string = string[0].toUpperCase() + string.substr(1).toLowerCase();                                                 // 12
  }                                                                                                                    // 13
                                                                                                                       // 14
  return string;                                                                                                       // 15
}                                                                                                                      // 16
                                                                                                                       // 17
humanize = function humanize(string){                                                                                  // 18
  string = string || '';                                                                                               // 19
  string = string.toString(); // might be a number                                                                     // 20
  string = string.trim();                                                                                              // 21
  string = string.replace(extname(string), '');                                                                        // 22
  string = underscore(string);                                                                                         // 23
  string = string.replace(/[\W_]+/g, ' ');                                                                             // 24
                                                                                                                       // 25
  return capitalize(string);                                                                                           // 26
}                                                                                                                      // 27
                                                                                                                       // 28
                                                                                                                       // 29
function underscore(string){                                                                                           // 30
  string = string || '';                                                                                               // 31
  string = string.toString(); // might be a number                                                                     // 32
  string = string.trim();                                                                                              // 33
  string = string.replace(/([a-z\d])([A-Z]+)/g, '$1_$2');                                                              // 34
  string = string.replace(/[-\s]+/g, '_').toLowerCase();                                                               // 35
                                                                                                                       // 36
  return string;                                                                                                       // 37
}                                                                                                                      // 38
                                                                                                                       // 39
function extname(string){                                                                                              // 40
  var index = string.lastIndexOf('.');                                                                                 // 41
  var ext = string.substring(index, string.length);                                                                    // 42
                                                                                                                       // 43
  return (index === -1) ? '' : ext;                                                                                    // 44
}                                                                                                                      // 45
                                                                                                                       // 46
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/mongo-object.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global MongoObject:true */                                                                                          // 1
                                                                                                                       // 2
                                                                                                                       // 3
var isObject = function(obj) {                                                                                         // 4
  return obj === Object(obj);                                                                                          // 5
};                                                                                                                     // 6
                                                                                                                       // 7
// getPrototypeOf polyfill                                                                                             // 8
if (typeof Object.getPrototypeOf !== "function") {                                                                     // 9
  if (typeof "".__proto__ === "object") {                                                                              // 10
    Object.getPrototypeOf = function(object) {                                                                         // 11
      return object.__proto__;                                                                                         // 12
    };                                                                                                                 // 13
  } else {                                                                                                             // 14
    Object.getPrototypeOf = function(object) {                                                                         // 15
      // May break if the constructor has been tampered with                                                           // 16
      return object.constructor.prototype;                                                                             // 17
    };                                                                                                                 // 18
  }                                                                                                                    // 19
}                                                                                                                      // 20
                                                                                                                       // 21
/* Tests whether "obj" is an Object as opposed to                                                                      // 22
 * something that inherits from Object                                                                                 // 23
 *                                                                                                                     // 24
 * @param {any} obj                                                                                                    // 25
 * @returns {Boolean}                                                                                                  // 26
 */                                                                                                                    // 27
var isBasicObject = function(obj) {                                                                                    // 28
  return isObject(obj) && Object.getPrototypeOf(obj) === Object.prototype;                                             // 29
};                                                                                                                     // 30
                                                                                                                       // 31
/* Takes a specific string that uses mongo-style dot notation                                                          // 32
 * and returns a generic string equivalent. Replaces all numeric                                                       // 33
 * "pieces" with a dollar sign ($).                                                                                    // 34
 *                                                                                                                     // 35
 * @param {type} name                                                                                                  // 36
 * @returns {unresolved}                                                                                               // 37
 */                                                                                                                    // 38
var makeGeneric = function makeGeneric(name) {                                                                         // 39
  if (typeof name !== "string") {                                                                                      // 40
    return null;                                                                                                       // 41
  }                                                                                                                    // 42
  return name.replace(/\.[0-9]+\./g, '.$.').replace(/\.[0-9]+$/g, '.$');                                               // 43
};                                                                                                                     // 44
                                                                                                                       // 45
var appendAffectedKey = function appendAffectedKey(affectedKey, key) {                                                 // 46
  if (key === "$each") {                                                                                               // 47
    return affectedKey;                                                                                                // 48
  } else {                                                                                                             // 49
    return (affectedKey ? affectedKey + "." + key : key);                                                              // 50
  }                                                                                                                    // 51
};                                                                                                                     // 52
                                                                                                                       // 53
// Extracts operator piece, if present, from position string                                                           // 54
var extractOp = function extractOp(position) {                                                                         // 55
  var firstPositionPiece = position.slice(0, position.indexOf("["));                                                   // 56
  return (firstPositionPiece.substring(0, 1) === "$") ? firstPositionPiece : null;                                     // 57
};                                                                                                                     // 58
                                                                                                                       // 59
/*                                                                                                                     // 60
 * @constructor                                                                                                        // 61
 * @param {Object} objOrModifier                                                                                       // 62
 * @param {string[]} blackBoxKeys - A list of the names of keys that shouldn't be traversed                            // 63
 * @returns {undefined}                                                                                                // 64
 *                                                                                                                     // 65
 * Creates a new MongoObject instance. The object passed as the first argument                                         // 66
 * will be modified in place by calls to instance methods. Also, immediately                                           // 67
 * upon creation of the instance, the object will have any `undefined` keys                                            // 68
 * removed recursively.                                                                                                // 69
 */                                                                                                                    // 70
MongoObject = function(objOrModifier, blackBoxKeys) {                                                                  // 71
  var self = this;                                                                                                     // 72
  self._obj = objOrModifier;                                                                                           // 73
  self._affectedKeys = {};                                                                                             // 74
  self._genericAffectedKeys = {};                                                                                      // 75
  self._parentPositions = [];                                                                                          // 76
  self._positionsInsideArrays = [];                                                                                    // 77
  self._objectPositions = [];                                                                                          // 78
                                                                                                                       // 79
  function parseObj(val, currentPosition, affectedKey, operator, adjusted, isWithinArray) {                            // 80
                                                                                                                       // 81
    // Adjust for first-level modifier operators                                                                       // 82
    if (!operator && affectedKey && affectedKey.substring(0, 1) === "$") {                                             // 83
      operator = affectedKey;                                                                                          // 84
      affectedKey = null;                                                                                              // 85
    }                                                                                                                  // 86
                                                                                                                       // 87
    var affectedKeyIsBlackBox = false;                                                                                 // 88
    var affectedKeyGeneric;                                                                                            // 89
    var stop = false;                                                                                                  // 90
    if (affectedKey) {                                                                                                 // 91
                                                                                                                       // 92
      // Adjust for $push and $addToSet and $pull and $pop                                                             // 93
      if (!adjusted) {                                                                                                 // 94
        if (operator === "$push" || operator === "$addToSet" || operator === "$pop") {                                 // 95
          // Adjust for $each                                                                                          // 96
          // We can simply jump forward and pretend like the $each array                                               // 97
          // is the array for the field. This has the added benefit of                                                 // 98
          // skipping past any $slice, which we also don't care about.                                                 // 99
          if (isBasicObject(val) && "$each" in val) {                                                                  // 100
            val = val.$each;                                                                                           // 101
            currentPosition = currentPosition + "[$each]";                                                             // 102
          } else {                                                                                                     // 103
            affectedKey = affectedKey + ".0";                                                                          // 104
          }                                                                                                            // 105
          adjusted = true;                                                                                             // 106
        } else if (operator === "$pull") {                                                                             // 107
          affectedKey = affectedKey + ".0";                                                                            // 108
          if (isBasicObject(val)) {                                                                                    // 109
            stop = true;                                                                                               // 110
          }                                                                                                            // 111
          adjusted = true;                                                                                             // 112
        }                                                                                                              // 113
      }                                                                                                                // 114
                                                                                                                       // 115
      // Make generic key                                                                                              // 116
      affectedKeyGeneric = makeGeneric(affectedKey);                                                                   // 117
                                                                                                                       // 118
      // Determine whether affected key should be treated as a black box                                               // 119
      affectedKeyIsBlackBox = _.contains(blackBoxKeys, affectedKeyGeneric);                                            // 120
                                                                                                                       // 121
      // Mark that this position affects this generic and non-generic key                                              // 122
      if (currentPosition) {                                                                                           // 123
        self._affectedKeys[currentPosition] = affectedKey;                                                             // 124
        self._genericAffectedKeys[currentPosition] = affectedKeyGeneric;                                               // 125
                                                                                                                       // 126
        // If we're within an array, mark this position so we can omit it from flat docs                               // 127
        isWithinArray && self._positionsInsideArrays.push(currentPosition);                                            // 128
      }                                                                                                                // 129
    }                                                                                                                  // 130
                                                                                                                       // 131
    if (stop) {                                                                                                        // 132
      return;                                                                                                          // 133
    }                                                                                                                  // 134
                                                                                                                       // 135
    // Loop through arrays                                                                                             // 136
    if (_.isArray(val) && !_.isEmpty(val)) {                                                                           // 137
      if (currentPosition) {                                                                                           // 138
        // Mark positions with arrays that should be ignored when we want endpoints only                               // 139
        self._parentPositions.push(currentPosition);                                                                   // 140
      }                                                                                                                // 141
                                                                                                                       // 142
      // Loop                                                                                                          // 143
      _.each(val, function(v, i) {                                                                                     // 144
        parseObj(v, (currentPosition ? currentPosition + "[" + i + "]" : i), affectedKey + '.' + i, operator, adjusted, true);
      });                                                                                                              // 146
    }                                                                                                                  // 147
                                                                                                                       // 148
    // Loop through object keys, only for basic objects,                                                               // 149
    // but always for the passed-in object, even if it                                                                 // 150
    // is a custom object.                                                                                             // 151
    else if ((isBasicObject(val) && !affectedKeyIsBlackBox) || !currentPosition) {                                     // 152
      if (currentPosition && !_.isEmpty(val)) {                                                                        // 153
        // Mark positions with objects that should be ignored when we want endpoints only                              // 154
        self._parentPositions.push(currentPosition);                                                                   // 155
        // Mark positions with objects that should be left out of flat docs.                                           // 156
        self._objectPositions.push(currentPosition);                                                                   // 157
      }                                                                                                                // 158
      // Loop                                                                                                          // 159
      _.each(val, function(v, k) {                                                                                     // 160
        if (v === void 0) {                                                                                            // 161
          delete val[k];                                                                                               // 162
        } else if (k !== "$slice") {                                                                                   // 163
          parseObj(v, (currentPosition ? currentPosition + "[" + k + "]" : k), appendAffectedKey(affectedKey, k), operator, adjusted, isWithinArray);
        }                                                                                                              // 165
      });                                                                                                              // 166
    }                                                                                                                  // 167
                                                                                                                       // 168
  }                                                                                                                    // 169
  parseObj(self._obj);                                                                                                 // 170
                                                                                                                       // 171
  function reParseObj() {                                                                                              // 172
    self._affectedKeys = {};                                                                                           // 173
    self._genericAffectedKeys = {};                                                                                    // 174
    self._parentPositions = [];                                                                                        // 175
    self._positionsInsideArrays = [];                                                                                  // 176
    self._objectPositions = [];                                                                                        // 177
    parseObj(self._obj);                                                                                               // 178
  }                                                                                                                    // 179
                                                                                                                       // 180
  /**                                                                                                                  // 181
   * @method MongoObject.forEachNode                                                                                   // 182
   * @param {Function} func                                                                                            // 183
   * @param {Object} [options]                                                                                         // 184
   * @param {Boolean} [options.endPointsOnly=true] - Only call function for endpoints and not for nodes that contain other nodes
   * @returns {undefined}                                                                                              // 186
   *                                                                                                                   // 187
   * Runs a function for each endpoint node in the object tree, including all items in every array.                    // 188
   * The function arguments are                                                                                        // 189
   * (1) the value at this node                                                                                        // 190
   * (2) a string representing the node position                                                                       // 191
   * (3) the representation of what would be changed in mongo, using mongo dot notation                                // 192
   * (4) the generic equivalent of argument 3, with "$" instead of numeric pieces                                      // 193
   */                                                                                                                  // 194
  self.forEachNode = function(func, options) {                                                                         // 195
    if (typeof func !== "function") {                                                                                  // 196
      throw new Error("filter requires a loop function");                                                              // 197
    }                                                                                                                  // 198
                                                                                                                       // 199
    options = _.extend({                                                                                               // 200
      endPointsOnly: true                                                                                              // 201
    }, options);                                                                                                       // 202
                                                                                                                       // 203
    var updatedValues = {};                                                                                            // 204
    _.each(self._affectedKeys, function(affectedKey, position) {                                                       // 205
      if (options.endPointsOnly && _.contains(self._parentPositions, position)) {                                      // 206
        return; //only endpoints                                                                                       // 207
      }                                                                                                                // 208
      func.call({                                                                                                      // 209
        value: self.getValueForPosition(position),                                                                     // 210
        operator: extractOp(position),                                                                                 // 211
        position: position,                                                                                            // 212
        key: affectedKey,                                                                                              // 213
        genericKey: self._genericAffectedKeys[position],                                                               // 214
        updateValue: function(newVal) {                                                                                // 215
          updatedValues[position] = newVal;                                                                            // 216
        },                                                                                                             // 217
        remove: function() {                                                                                           // 218
          updatedValues[position] = void 0;                                                                            // 219
        }                                                                                                              // 220
      });                                                                                                              // 221
    });                                                                                                                // 222
                                                                                                                       // 223
    // Actually update/remove values as instructed                                                                     // 224
    _.each(updatedValues, function(newVal, position) {                                                                 // 225
      self.setValueForPosition(position, newVal);                                                                      // 226
    });                                                                                                                // 227
                                                                                                                       // 228
  };                                                                                                                   // 229
                                                                                                                       // 230
  self.getValueForPosition = function(position) {                                                                      // 231
    var subkey, subkeys = position.split("["), current = self._obj;                                                    // 232
    for (var i = 0, ln = subkeys.length; i < ln; i++) {                                                                // 233
      subkey = subkeys[i];                                                                                             // 234
      // If the subkey ends in "]", remove the ending                                                                  // 235
      if (subkey.slice(-1) === "]") {                                                                                  // 236
        subkey = subkey.slice(0, -1);                                                                                  // 237
      }                                                                                                                // 238
      current = current[subkey];                                                                                       // 239
      if (!_.isArray(current) && !isBasicObject(current) && i < ln - 1) {                                              // 240
        return;                                                                                                        // 241
      }                                                                                                                // 242
    }                                                                                                                  // 243
    return current;                                                                                                    // 244
  };                                                                                                                   // 245
                                                                                                                       // 246
  /**                                                                                                                  // 247
   * @method MongoObject.prototype.setValueForPosition                                                                 // 248
   * @param {String} position                                                                                          // 249
   * @param {Any} value                                                                                                // 250
   * @returns {undefined}                                                                                              // 251
   */                                                                                                                  // 252
  self.setValueForPosition = function(position, value) {                                                               // 253
    var nextPiece, subkey, subkeys = position.split("["), current = self._obj;                                         // 254
                                                                                                                       // 255
    for (var i = 0, ln = subkeys.length; i < ln; i++) {                                                                // 256
      subkey = subkeys[i];                                                                                             // 257
      // If the subkey ends in "]", remove the ending                                                                  // 258
      if (subkey.slice(-1) === "]") {                                                                                  // 259
        subkey = subkey.slice(0, -1);                                                                                  // 260
      }                                                                                                                // 261
      // If we've reached the key in the object tree that needs setting or                                             // 262
      // deleting, do it.                                                                                              // 263
      if (i === ln - 1) {                                                                                              // 264
        current[subkey] = value;                                                                                       // 265
        //if value is undefined, delete the property                                                                   // 266
        if (value === void 0) {                                                                                        // 267
          delete current[subkey];                                                                                      // 268
        }                                                                                                              // 269
      }                                                                                                                // 270
      // Otherwise attempt to keep moving deeper into the object.                                                      // 271
      else {                                                                                                           // 272
        // If we're setting (as opposed to deleting) a key and we hit a place                                          // 273
        // in the ancestor chain where the keys are not yet created, create them.                                      // 274
        if (current[subkey] === void 0 && value !== void 0) {                                                          // 275
          //see if the next piece is a number                                                                          // 276
          nextPiece = subkeys[i + 1];                                                                                  // 277
          nextPiece = parseInt(nextPiece, 10);                                                                         // 278
          current[subkey] = isNaN(nextPiece) ? {} : [];                                                                // 279
        }                                                                                                              // 280
                                                                                                                       // 281
        // Move deeper into the object                                                                                 // 282
        current = current[subkey];                                                                                     // 283
                                                                                                                       // 284
        // If we can go no further, then quit                                                                          // 285
        if (!_.isArray(current) && !isBasicObject(current) && i < ln - 1) {                                            // 286
          return;                                                                                                      // 287
        }                                                                                                              // 288
      }                                                                                                                // 289
    }                                                                                                                  // 290
                                                                                                                       // 291
    reParseObj();                                                                                                      // 292
  };                                                                                                                   // 293
                                                                                                                       // 294
  /**                                                                                                                  // 295
   * @method MongoObject.prototype.removeValueForPosition                                                              // 296
   * @param {String} position                                                                                          // 297
   * @returns {undefined}                                                                                              // 298
   */                                                                                                                  // 299
  self.removeValueForPosition = function(position) {                                                                   // 300
    self.setValueForPosition(position, void 0);                                                                        // 301
  };                                                                                                                   // 302
                                                                                                                       // 303
  /**                                                                                                                  // 304
   * @method MongoObject.prototype.getKeyForPosition                                                                   // 305
   * @param {String} position                                                                                          // 306
   * @returns {undefined}                                                                                              // 307
   */                                                                                                                  // 308
  self.getKeyForPosition = function(position) {                                                                        // 309
    return self._affectedKeys[position];                                                                               // 310
  };                                                                                                                   // 311
                                                                                                                       // 312
  /**                                                                                                                  // 313
   * @method MongoObject.prototype.getGenericKeyForPosition                                                            // 314
   * @param {String} position                                                                                          // 315
   * @returns {undefined}                                                                                              // 316
   */                                                                                                                  // 317
  self.getGenericKeyForPosition = function(position) {                                                                 // 318
    return self._genericAffectedKeys[position];                                                                        // 319
  };                                                                                                                   // 320
                                                                                                                       // 321
  /**                                                                                                                  // 322
   * @method MongoObject.getInfoForKey                                                                                 // 323
   * @param {String} key - Non-generic key                                                                             // 324
   * @returns {undefined|Object}                                                                                       // 325
   *                                                                                                                   // 326
   * Returns the value and operator of the requested non-generic key.                                                  // 327
   * Example: {value: 1, operator: "$pull"}                                                                            // 328
   */                                                                                                                  // 329
  self.getInfoForKey = function(key) {                                                                                 // 330
    // Get the info                                                                                                    // 331
    var position = self.getPositionForKey(key);                                                                        // 332
    if (position) {                                                                                                    // 333
      return {                                                                                                         // 334
        value: self.getValueForPosition(position),                                                                     // 335
        operator: extractOp(position)                                                                                  // 336
      };                                                                                                               // 337
    }                                                                                                                  // 338
                                                                                                                       // 339
    // If we haven't returned yet, check to see if there is an array value                                             // 340
    // corresponding to this key                                                                                       // 341
    // We find the first item within the array, strip the last piece off the                                           // 342
    // position string, and then return whatever is at that new position in                                            // 343
    // the original object.                                                                                            // 344
    var positions = self.getPositionsForGenericKey(key + ".$"), p, v;                                                  // 345
    for (var i = 0, ln = positions.length; i < ln; i++) {                                                              // 346
      p = positions[i];                                                                                                // 347
      v = self.getValueForPosition(p) || self.getValueForPosition(p.slice(0, p.lastIndexOf("[")));                     // 348
      if (v) {                                                                                                         // 349
        return {                                                                                                       // 350
          value: v,                                                                                                    // 351
          operator: extractOp(p)                                                                                       // 352
        };                                                                                                             // 353
      }                                                                                                                // 354
    }                                                                                                                  // 355
  };                                                                                                                   // 356
                                                                                                                       // 357
  /**                                                                                                                  // 358
   * @method MongoObject.getPositionForKey                                                                             // 359
   * @param {String} key - Non-generic key                                                                             // 360
   * @returns {undefined|String} Position string                                                                       // 361
   *                                                                                                                   // 362
   * Returns the position string for the place in the object that                                                      // 363
   * affects the requested non-generic key.                                                                            // 364
   * Example: 'foo[bar][0]'                                                                                            // 365
   */                                                                                                                  // 366
  self.getPositionForKey = function(key) {                                                                             // 367
    // Get the info                                                                                                    // 368
    for (var position in self._affectedKeys) {                                                                         // 369
      if (self._affectedKeys.hasOwnProperty(position)) {                                                               // 370
        if (self._affectedKeys[position] === key) {                                                                    // 371
          // We return the first one we find. While it's                                                               // 372
          // possible that multiple update operators could                                                             // 373
          // affect the same non-generic key, we'll assume that's not the case.                                        // 374
          return position;                                                                                             // 375
        }                                                                                                              // 376
      }                                                                                                                // 377
    }                                                                                                                  // 378
                                                                                                                       // 379
    // If we haven't returned yet, we need to check for affected keys                                                  // 380
  };                                                                                                                   // 381
                                                                                                                       // 382
  /**                                                                                                                  // 383
   * @method MongoObject.getPositionsForGenericKey                                                                     // 384
   * @param {String} key - Generic key                                                                                 // 385
   * @returns {String[]} Array of position strings                                                                     // 386
   *                                                                                                                   // 387
   * Returns an array of position strings for the places in the object that                                            // 388
   * affect the requested generic key.                                                                                 // 389
   * Example: ['foo[bar][0]']                                                                                          // 390
   */                                                                                                                  // 391
  self.getPositionsForGenericKey = function(key) {                                                                     // 392
    // Get the info                                                                                                    // 393
    var list = [];                                                                                                     // 394
    for (var position in self._genericAffectedKeys) {                                                                  // 395
      if (self._genericAffectedKeys.hasOwnProperty(position)) {                                                        // 396
        if (self._genericAffectedKeys[position] === key) {                                                             // 397
          list.push(position);                                                                                         // 398
        }                                                                                                              // 399
      }                                                                                                                // 400
    }                                                                                                                  // 401
                                                                                                                       // 402
    return list;                                                                                                       // 403
  };                                                                                                                   // 404
                                                                                                                       // 405
  /**                                                                                                                  // 406
   * @deprecated Use getInfoForKey                                                                                     // 407
   * @method MongoObject.getValueForKey                                                                                // 408
   * @param {String} key - Non-generic key                                                                             // 409
   * @returns {undefined|Any}                                                                                          // 410
   *                                                                                                                   // 411
   * Returns the value of the requested non-generic key                                                                // 412
   */                                                                                                                  // 413
  self.getValueForKey = function(key) {                                                                                // 414
    var position = self.getPositionForKey(key);                                                                        // 415
    if (position) {                                                                                                    // 416
      return self.getValueForPosition(position);                                                                       // 417
    }                                                                                                                  // 418
  };                                                                                                                   // 419
                                                                                                                       // 420
  /**                                                                                                                  // 421
   * @method MongoObject.prototype.addKey                                                                              // 422
   * @param {String} key - Key to set                                                                                  // 423
   * @param {Any} val - Value to give this key                                                                         // 424
   * @param {String} op - Operator under which to set it, or `null` for a non-modifier object                          // 425
   * @returns {undefined}                                                                                              // 426
   *                                                                                                                   // 427
   * Adds `key` with value `val` under operator `op` to the source object.                                             // 428
   */                                                                                                                  // 429
  self.addKey = function(key, val, op) {                                                                               // 430
    var position = op ? op + "[" + key + "]" : MongoObject._keyToPosition(key);                                        // 431
    self.setValueForPosition(position, val);                                                                           // 432
  };                                                                                                                   // 433
                                                                                                                       // 434
  /**                                                                                                                  // 435
   * @method MongoObject.prototype.removeGenericKeys                                                                   // 436
   * @param {String[]} keys                                                                                            // 437
   * @returns {undefined}                                                                                              // 438
   *                                                                                                                   // 439
   * Removes anything that affects any of the generic keys in the list                                                 // 440
   */                                                                                                                  // 441
  self.removeGenericKeys = function(keys) {                                                                            // 442
    for (var position in self._genericAffectedKeys) {                                                                  // 443
      if (self._genericAffectedKeys.hasOwnProperty(position)) {                                                        // 444
        if (_.contains(keys, self._genericAffectedKeys[position])) {                                                   // 445
          self.removeValueForPosition(position);                                                                       // 446
        }                                                                                                              // 447
      }                                                                                                                // 448
    }                                                                                                                  // 449
  };                                                                                                                   // 450
                                                                                                                       // 451
  /**                                                                                                                  // 452
   * @method MongoObject.removeGenericKey                                                                              // 453
   * @param {String} key                                                                                               // 454
   * @returns {undefined}                                                                                              // 455
   *                                                                                                                   // 456
   * Removes anything that affects the requested generic key                                                           // 457
   */                                                                                                                  // 458
  self.removeGenericKey = function(key) {                                                                              // 459
    for (var position in self._genericAffectedKeys) {                                                                  // 460
      if (self._genericAffectedKeys.hasOwnProperty(position)) {                                                        // 461
        if (self._genericAffectedKeys[position] === key) {                                                             // 462
          self.removeValueForPosition(position);                                                                       // 463
        }                                                                                                              // 464
      }                                                                                                                // 465
    }                                                                                                                  // 466
  };                                                                                                                   // 467
                                                                                                                       // 468
  /**                                                                                                                  // 469
   * @method MongoObject.removeKey                                                                                     // 470
   * @param {String} key                                                                                               // 471
   * @returns {undefined}                                                                                              // 472
   *                                                                                                                   // 473
   * Removes anything that affects the requested non-generic key                                                       // 474
   */                                                                                                                  // 475
  self.removeKey = function(key) {                                                                                     // 476
    // We don't use getPositionForKey here because we want to be sure to                                               // 477
    // remove for all positions if there are multiple.                                                                 // 478
    for (var position in self._affectedKeys) {                                                                         // 479
      if (self._affectedKeys.hasOwnProperty(position)) {                                                               // 480
        if (self._affectedKeys[position] === key) {                                                                    // 481
          self.removeValueForPosition(position);                                                                       // 482
        }                                                                                                              // 483
      }                                                                                                                // 484
    }                                                                                                                  // 485
  };                                                                                                                   // 486
                                                                                                                       // 487
  /**                                                                                                                  // 488
   * @method MongoObject.removeKeys                                                                                    // 489
   * @param {String[]} keys                                                                                            // 490
   * @returns {undefined}                                                                                              // 491
   *                                                                                                                   // 492
   * Removes anything that affects any of the non-generic keys in the list                                             // 493
   */                                                                                                                  // 494
  self.removeKeys = function(keys) {                                                                                   // 495
    for (var i = 0, ln = keys.length; i < ln; i++) {                                                                   // 496
      self.removeKey(keys[i]);                                                                                         // 497
    }                                                                                                                  // 498
  };                                                                                                                   // 499
                                                                                                                       // 500
  /**                                                                                                                  // 501
   * @method MongoObject.filterGenericKeys                                                                             // 502
   * @param {Function} test - Test function                                                                            // 503
   * @returns {undefined}                                                                                              // 504
   *                                                                                                                   // 505
   * Passes all affected keys to a test function, which                                                                // 506
   * should return false to remove whatever is affecting that key                                                      // 507
   */                                                                                                                  // 508
  self.filterGenericKeys = function(test) {                                                                            // 509
    var gk, checkedKeys = [], keysToRemove = [];                                                                       // 510
    for (var position in self._genericAffectedKeys) {                                                                  // 511
      if (self._genericAffectedKeys.hasOwnProperty(position)) {                                                        // 512
        gk = self._genericAffectedKeys[position];                                                                      // 513
        if (!_.contains(checkedKeys, gk)) {                                                                            // 514
          checkedKeys.push(gk);                                                                                        // 515
          if (gk && !test(gk)) {                                                                                       // 516
            keysToRemove.push(gk);                                                                                     // 517
          }                                                                                                            // 518
        }                                                                                                              // 519
      }                                                                                                                // 520
    }                                                                                                                  // 521
                                                                                                                       // 522
    _.each(keysToRemove, function(key) {                                                                               // 523
      self.removeGenericKey(key);                                                                                      // 524
    });                                                                                                                // 525
  };                                                                                                                   // 526
                                                                                                                       // 527
  /**                                                                                                                  // 528
   * @method MongoObject.setValueForKey                                                                                // 529
   * @param {String} key                                                                                               // 530
   * @param {Any} val                                                                                                  // 531
   * @returns {undefined}                                                                                              // 532
   *                                                                                                                   // 533
   * Sets the value for every place in the object that affects                                                         // 534
   * the requested non-generic key                                                                                     // 535
   */                                                                                                                  // 536
  self.setValueForKey = function(key, val) {                                                                           // 537
    // We don't use getPositionForKey here because we want to be sure to                                               // 538
    // set the value for all positions if there are multiple.                                                          // 539
    for (var position in self._affectedKeys) {                                                                         // 540
      if (self._affectedKeys.hasOwnProperty(position)) {                                                               // 541
        if (self._affectedKeys[position] === key) {                                                                    // 542
          self.setValueForPosition(position, val);                                                                     // 543
        }                                                                                                              // 544
      }                                                                                                                // 545
    }                                                                                                                  // 546
  };                                                                                                                   // 547
                                                                                                                       // 548
  /**                                                                                                                  // 549
   * @method MongoObject.setValueForGenericKey                                                                         // 550
   * @param {String} key                                                                                               // 551
   * @param {Any} val                                                                                                  // 552
   * @returns {undefined}                                                                                              // 553
   *                                                                                                                   // 554
   * Sets the value for every place in the object that affects                                                         // 555
   * the requested generic key                                                                                         // 556
   */                                                                                                                  // 557
  self.setValueForGenericKey = function(key, val) {                                                                    // 558
    // We don't use getPositionForKey here because we want to be sure to                                               // 559
    // set the value for all positions if there are multiple.                                                          // 560
    for (var position in self._genericAffectedKeys) {                                                                  // 561
      if (self._genericAffectedKeys.hasOwnProperty(position)) {                                                        // 562
        if (self._genericAffectedKeys[position] === key) {                                                             // 563
          self.setValueForPosition(position, val);                                                                     // 564
        }                                                                                                              // 565
      }                                                                                                                // 566
    }                                                                                                                  // 567
  };                                                                                                                   // 568
                                                                                                                       // 569
  /**                                                                                                                  // 570
   * @method MongoObject.getObject                                                                                     // 571
   * @returns {Object}                                                                                                 // 572
   *                                                                                                                   // 573
   * Get the source object, potentially modified by other method calls on this                                         // 574
   * MongoObject instance.                                                                                             // 575
   */                                                                                                                  // 576
  self.getObject = function() {                                                                                        // 577
    return self._obj;                                                                                                  // 578
  };                                                                                                                   // 579
                                                                                                                       // 580
  /**                                                                                                                  // 581
   * @method MongoObject.getFlatObject                                                                                 // 582
   * @returns {Object}                                                                                                 // 583
   *                                                                                                                   // 584
   * Gets a flat object based on the MongoObject instance.                                                             // 585
   * In a flat object, the key is the name of the non-generic affectedKey,                                             // 586
   * with mongo dot notation if necessary, and the value is the value for                                              // 587
   * that key.                                                                                                         // 588
   *                                                                                                                   // 589
   * With `keepArrays: true`, we don't flatten within arrays. Currently                                                // 590
   * MongoDB does not see a key such as `a.0.b` and automatically assume                                               // 591
   * an array. Instead it would create an object with key "0" if there                                                 // 592
   * wasn't already an array saved as the value of `a`, which is rarely                                                // 593
   * if ever what we actually want. To avoid this confusion, we                                                        // 594
   * set entire arrays.                                                                                                // 595
   */                                                                                                                  // 596
  self.getFlatObject = function(options) {                                                                             // 597
    options = options || {};                                                                                           // 598
    var newObj = {};                                                                                                   // 599
    _.each(self._affectedKeys, function(affectedKey, position) {                                                       // 600
      if (typeof affectedKey === "string" &&                                                                           // 601
        (options.keepArrays === true && !_.contains(self._positionsInsideArrays, position) && !_.contains(self._objectPositions, position)) ||
        (!options.keepArrays && !_.contains(self._parentPositions, position))                                          // 603
        ) {                                                                                                            // 604
        newObj[affectedKey] = self.getValueForPosition(position);                                                      // 605
      }                                                                                                                // 606
    });                                                                                                                // 607
    return newObj;                                                                                                     // 608
  };                                                                                                                   // 609
                                                                                                                       // 610
  /**                                                                                                                  // 611
   * @method MongoObject.affectsKey                                                                                    // 612
   * @param {String} key                                                                                               // 613
   * @returns {Object}                                                                                                 // 614
   *                                                                                                                   // 615
   * Returns true if the non-generic key is affected by this object                                                    // 616
   */                                                                                                                  // 617
  self.affectsKey = function(key) {                                                                                    // 618
    return !!self.getPositionForKey(key);                                                                              // 619
  };                                                                                                                   // 620
                                                                                                                       // 621
  /**                                                                                                                  // 622
   * @method MongoObject.affectsGenericKey                                                                             // 623
   * @param {String} key                                                                                               // 624
   * @returns {Object}                                                                                                 // 625
   *                                                                                                                   // 626
   * Returns true if the generic key is affected by this object                                                        // 627
   */                                                                                                                  // 628
  self.affectsGenericKey = function(key) {                                                                             // 629
    for (var position in self._genericAffectedKeys) {                                                                  // 630
      if (self._genericAffectedKeys.hasOwnProperty(position)) {                                                        // 631
        if (self._genericAffectedKeys[position] === key) {                                                             // 632
          return true;                                                                                                 // 633
        }                                                                                                              // 634
      }                                                                                                                // 635
    }                                                                                                                  // 636
    return false;                                                                                                      // 637
  };                                                                                                                   // 638
                                                                                                                       // 639
  /**                                                                                                                  // 640
   * @method MongoObject.affectsGenericKeyImplicit                                                                     // 641
   * @param {String} key                                                                                               // 642
   * @returns {Object}                                                                                                 // 643
   *                                                                                                                   // 644
   * Like affectsGenericKey, but will return true if a child key is affected                                           // 645
   */                                                                                                                  // 646
  self.affectsGenericKeyImplicit = function(key) {                                                                     // 647
    for (var position in self._genericAffectedKeys) {                                                                  // 648
      if (self._genericAffectedKeys.hasOwnProperty(position)) {                                                        // 649
        var affectedKey = self._genericAffectedKeys[position];                                                         // 650
                                                                                                                       // 651
        // If the affected key is the test key                                                                         // 652
        if (affectedKey === key) {                                                                                     // 653
          return true;                                                                                                 // 654
        }                                                                                                              // 655
                                                                                                                       // 656
        // If the affected key implies the test key because the affected key                                           // 657
        // starts with the test key followed by a period                                                               // 658
        if (affectedKey.substring(0, key.length + 1) === key + ".") {                                                  // 659
          return true;                                                                                                 // 660
        }                                                                                                              // 661
                                                                                                                       // 662
        // If the affected key implies the test key because the affected key                                           // 663
        // starts with the test key and the test key ends with ".$"                                                    // 664
        var lastTwo = key.slice(-2);                                                                                   // 665
        if (lastTwo === ".$" && key.slice(0, -2) === affectedKey) {                                                    // 666
          return true;                                                                                                 // 667
        }                                                                                                              // 668
      }                                                                                                                // 669
    }                                                                                                                  // 670
    return false;                                                                                                      // 671
  };                                                                                                                   // 672
};                                                                                                                     // 673
                                                                                                                       // 674
/** Takes a string representation of an object key and its value                                                       // 675
 *  and updates "obj" to contain that key with that value.                                                             // 676
 *                                                                                                                     // 677
 *  Example keys and results if val is 1:                                                                              // 678
 *    "a" -> {a: 1}                                                                                                    // 679
 *    "a[b]" -> {a: {b: 1}}                                                                                            // 680
 *    "a[b][0]" -> {a: {b: [1]}}                                                                                       // 681
 *    "a[b.0.c]" -> {a: {'b.0.c': 1}}                                                                                  // 682
 */                                                                                                                    // 683
                                                                                                                       // 684
/** Takes a string representation of an object key and its value                                                       // 685
 *  and updates "obj" to contain that key with that value.                                                             // 686
 *                                                                                                                     // 687
 *  Example keys and results if val is 1:                                                                              // 688
 *    "a" -> {a: 1}                                                                                                    // 689
 *    "a[b]" -> {a: {b: 1}}                                                                                            // 690
 *    "a[b][0]" -> {a: {b: [1]}}                                                                                       // 691
 *    "a[b.0.c]" -> {a: {'b.0.c': 1}}                                                                                  // 692
 *                                                                                                                     // 693
 * @param {any} val                                                                                                    // 694
 * @param {String} key                                                                                                 // 695
 * @param {Object} obj                                                                                                 // 696
 * @returns {undefined}                                                                                                // 697
 */                                                                                                                    // 698
MongoObject.expandKey = function(val, key, obj) {                                                                      // 699
  var nextPiece, subkey, subkeys = key.split("["), current = obj;                                                      // 700
  for (var i = 0, ln = subkeys.length; i < ln; i++) {                                                                  // 701
    subkey = subkeys[i];                                                                                               // 702
    if (subkey.slice(-1) === "]") {                                                                                    // 703
      subkey = subkey.slice(0, -1);                                                                                    // 704
    }                                                                                                                  // 705
    if (i === ln - 1) {                                                                                                // 706
      //last iteration; time to set the value; always overwrite                                                        // 707
      current[subkey] = val;                                                                                           // 708
      //if val is undefined, delete the property                                                                       // 709
      if (val === void 0) {                                                                                            // 710
        delete current[subkey];                                                                                        // 711
      }                                                                                                                // 712
    } else {                                                                                                           // 713
      //see if the next piece is a number                                                                              // 714
      nextPiece = subkeys[i + 1];                                                                                      // 715
      nextPiece = parseInt(nextPiece, 10);                                                                             // 716
      if (!current[subkey]) {                                                                                          // 717
        current[subkey] = isNaN(nextPiece) ? {} : [];                                                                  // 718
      }                                                                                                                // 719
    }                                                                                                                  // 720
    current = current[subkey];                                                                                         // 721
  }                                                                                                                    // 722
};                                                                                                                     // 723
                                                                                                                       // 724
MongoObject._keyToPosition = function keyToPosition(key, wrapAll) {                                                    // 725
  var position = '';                                                                                                   // 726
  _.each(key.split("."), function (piece, i) {                                                                         // 727
    if (i === 0 && !wrapAll) {                                                                                         // 728
      position += piece;                                                                                               // 729
    } else {                                                                                                           // 730
      position += "[" + piece + "]";                                                                                   // 731
    }                                                                                                                  // 732
  });                                                                                                                  // 733
  return position;                                                                                                     // 734
};                                                                                                                     // 735
                                                                                                                       // 736
/**                                                                                                                    // 737
 * @method MongoObject._positionToKey                                                                                  // 738
 * @param {String} position                                                                                            // 739
 * @returns {String} The key that this position in an object would affect.                                             // 740
 *                                                                                                                     // 741
 * This is different from MongoObject.prototype.getKeyForPosition in that                                              // 742
 * this method does not depend on the requested position actually being                                                // 743
 * present in any particular MongoObject.                                                                              // 744
 */                                                                                                                    // 745
MongoObject._positionToKey = function positionToKey(position) {                                                        // 746
  //XXX Probably a better way to do this, but this is                                                                  // 747
  //foolproof for now.                                                                                                 // 748
  var mDoc = new MongoObject({});                                                                                      // 749
  mDoc.setValueForPosition(position, 1); //value doesn't matter                                                        // 750
  var key = mDoc.getKeyForPosition(position);                                                                          // 751
  mDoc = null;                                                                                                         // 752
  return key;                                                                                                          // 753
};                                                                                                                     // 754
                                                                                                                       // 755
                                                                                                                       // 756
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/simple-schema-utility.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global Utility:true */                                                                                              // 1
                                                                                                                       // 2
Utility = {                                                                                                            // 3
  appendAffectedKey: function appendAffectedKey(affectedKey, key) {                                                    // 4
    if (key === "$each") {                                                                                             // 5
      return affectedKey;                                                                                              // 6
    } else {                                                                                                           // 7
      return (affectedKey ? affectedKey + "." + key : key);                                                            // 8
    }                                                                                                                  // 9
  },                                                                                                                   // 10
  shouldCheck: function shouldCheck(key) {                                                                             // 11
    if (key === "$pushAll") {                                                                                          // 12
      throw new Error("$pushAll is not supported; use $push + $each");                                                 // 13
    }                                                                                                                  // 14
    return !_.contains(["$pull", "$pullAll", "$pop", "$slice"], key);                                                  // 15
  },                                                                                                                   // 16
  errorObject: function errorObject(errorType, keyName, keyValue) {                                                    // 17
    return {name: keyName, type: errorType, value: keyValue};                                                          // 18
  },                                                                                                                   // 19
  // Tests whether it's an Object as opposed to something that inherits from Object                                    // 20
  isBasicObject: function isBasicObject(obj) {                                                                         // 21
    return _.isObject(obj) && Object.getPrototypeOf(obj) === Object.prototype;                                         // 22
  },                                                                                                                   // 23
  // The latest Safari returns false for Uint8Array, etc. instanceof Function                                          // 24
  // unlike other browsers.                                                                                            // 25
  safariBugFix: function safariBugFix(type) {                                                                          // 26
    return (typeof Uint8Array !== "undefined" && type === Uint8Array) ||                                               // 27
      (typeof Uint16Array !== "undefined" && type === Uint16Array) ||                                                  // 28
      (typeof Uint32Array !== "undefined" && type === Uint32Array) ||                                                  // 29
      (typeof Uint8ClampedArray !== "undefined" && type === Uint8ClampedArray);                                        // 30
  },                                                                                                                   // 31
  isNotNullOrUndefined: function isNotNullOrUndefined(val) {                                                           // 32
    return val !== void 0 && val !== null;                                                                             // 33
  },                                                                                                                   // 34
  // Extracts operator piece, if present, from position string                                                         // 35
  extractOp: function extractOp(position) {                                                                            // 36
    var firstPositionPiece = position.slice(0, position.indexOf("["));                                                 // 37
    return (firstPositionPiece.substring(0, 1) === "$") ? firstPositionPiece : null;                                   // 38
  },                                                                                                                   // 39
  deleteIfPresent: function deleteIfPresent(obj, key) {                                                                // 40
    if (key in obj) {                                                                                                  // 41
      delete obj[key];                                                                                                 // 42
    }                                                                                                                  // 43
  },                                                                                                                   // 44
  looksLikeModifier: function looksLikeModifier(obj) {                                                                 // 45
    for (var key in obj) {                                                                                             // 46
      if (obj.hasOwnProperty(key) && key.substring(0, 1) === "$") {                                                    // 47
        return true;                                                                                                   // 48
      }                                                                                                                // 49
    }                                                                                                                  // 50
    return false;                                                                                                      // 51
  },                                                                                                                   // 52
  dateToDateString: function dateToDateString(date) {                                                                  // 53
    var m = (date.getUTCMonth() + 1);                                                                                  // 54
    if (m < 10) {                                                                                                      // 55
      m = "0" + m;                                                                                                     // 56
    }                                                                                                                  // 57
    var d = date.getUTCDate();                                                                                         // 58
    if (d < 10) {                                                                                                      // 59
      d = "0" + d;                                                                                                     // 60
    }                                                                                                                  // 61
    return date.getUTCFullYear() + '-' + m + '-' + d;                                                                  // 62
  }                                                                                                                    // 63
};                                                                                                                     // 64
                                                                                                                       // 65
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/simple-schema.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global SimpleSchema:true */                                                                                         // 1
/* global SimpleSchemaValidationContext */                                                                             // 2
/* global MongoObject */                                                                                               // 3
/* global Utility */                                                                                                   // 4
                                                                                                                       // 5
var schemaDefinition = {                                                                                               // 6
  type: Match.Any,                                                                                                     // 7
  label: Match.Optional(Match.OneOf(String, Function)),                                                                // 8
  optional: Match.Optional(Match.OneOf(Boolean, Function)),                                                            // 9
  min: Match.Optional(Match.OneOf(Number, Date, Function)),                                                            // 10
  max: Match.Optional(Match.OneOf(Number, Date, Function)),                                                            // 11
  minCount: Match.Optional(Match.OneOf(Number, Function)),                                                             // 12
  maxCount: Match.Optional(Match.OneOf(Number, Function)),                                                             // 13
  allowedValues: Match.Optional(Match.OneOf([Match.Any], Function)),                                                   // 14
  decimal: Match.Optional(Boolean),                                                                                    // 15
  exclusiveMax: Match.Optional(Boolean),                                                                               // 16
  exclusiveMin: Match.Optional(Boolean),                                                                               // 17
  regEx: Match.Optional(Match.OneOf(RegExp, [RegExp])),                                                                // 18
  custom: Match.Optional(Function),                                                                                    // 19
  blackbox: Match.Optional(Boolean),                                                                                   // 20
  autoValue: Match.Optional(Function),                                                                                 // 21
  defaultValue: Match.Optional(Match.Any),                                                                             // 22
  trim: Match.Optional(Boolean)                                                                                        // 23
};                                                                                                                     // 24
                                                                                                                       // 25
/*                                                                                                                     // 26
 * PRIVATE FUNCTIONS                                                                                                   // 27
 */                                                                                                                    // 28
                                                                                                                       // 29
//called by clean()                                                                                                    // 30
var typeconvert = function(value, type) {                                                                              // 31
  var parsedDate;                                                                                                      // 32
                                                                                                                       // 33
  if (_.isArray(value) || (_.isObject(value) && !(value instanceof Date))) {                                           // 34
    return value; //can't and shouldn't convert arrays or objects                                                      // 35
  }                                                                                                                    // 36
  if (type === String) {                                                                                               // 37
    if (typeof value !== "undefined" && value !== null && typeof value !== "string") {                                 // 38
      return value.toString();                                                                                         // 39
    }                                                                                                                  // 40
    return value;                                                                                                      // 41
  }                                                                                                                    // 42
  if (type === Number) {                                                                                               // 43
    if (typeof value === "string" && !_.isEmpty(value)) {                                                              // 44
      //try to convert numeric strings to numbers                                                                      // 45
      var numberVal = Number(value);                                                                                   // 46
      if (!isNaN(numberVal)) {                                                                                         // 47
        return numberVal;                                                                                              // 48
      } else {                                                                                                         // 49
        return value; //leave string; will fail validation                                                             // 50
      }                                                                                                                // 51
    }                                                                                                                  // 52
    return value;                                                                                                      // 53
  }                                                                                                                    // 54
  //                                                                                                                   // 55
  // If target type is a Date we can safely convert from either a                                                      // 56
  // number (Integer value representing the number of milliseconds                                                     // 57
  // since 1 January 1970 00:00:00 UTC) or a string that can be parsed                                                 // 58
  // by Date.                                                                                                          // 59
  //                                                                                                                   // 60
  if (type === Date) {                                                                                                 // 61
    if (typeof value === "string") {                                                                                   // 62
      parsedDate = Date.parse(value);                                                                                  // 63
      if (isNaN(parsedDate) === false) {                                                                               // 64
        return new Date(parsedDate);                                                                                   // 65
      }                                                                                                                // 66
    }                                                                                                                  // 67
    if (typeof value === "number") {                                                                                   // 68
      return new Date(value);                                                                                          // 69
    }                                                                                                                  // 70
  }                                                                                                                    // 71
  return value;                                                                                                        // 72
};                                                                                                                     // 73
                                                                                                                       // 74
var expandSchema = function(schema) {                                                                                  // 75
  // Flatten schema by inserting nested definitions                                                                    // 76
  _.each(schema, function(val, key) {                                                                                  // 77
    var dot, type;                                                                                                     // 78
    if (!val) {                                                                                                        // 79
      return;                                                                                                          // 80
    }                                                                                                                  // 81
    if (Match.test(val.type, SimpleSchema)) {                                                                          // 82
      dot = '.';                                                                                                       // 83
      type = val.type;                                                                                                 // 84
      val.type = Object;                                                                                               // 85
    } else if (Match.test(val.type, [SimpleSchema])) {                                                                 // 86
      dot = '.$.';                                                                                                     // 87
      type = val.type[0];                                                                                              // 88
      val.type = [Object];                                                                                             // 89
    } else {                                                                                                           // 90
      return;                                                                                                          // 91
    }                                                                                                                  // 92
    //add child schema definitions to parent schema                                                                    // 93
    _.each(type._schema, function(subVal, subKey) {                                                                    // 94
      var newKey = key + dot + subKey;                                                                                 // 95
      if (!(newKey in schema)) {                                                                                       // 96
        schema[newKey] = subVal;                                                                                       // 97
      }                                                                                                                // 98
    });                                                                                                                // 99
  });                                                                                                                  // 100
  return schema;                                                                                                       // 101
};                                                                                                                     // 102
                                                                                                                       // 103
var adjustArrayFields = function(schema) {                                                                             // 104
  _.each(schema, function(def, existingKey) {                                                                          // 105
    if (_.isArray(def.type) || def.type === Array) {                                                                   // 106
      // Copy some options to array-item definition                                                                    // 107
      var itemKey = existingKey + ".$";                                                                                // 108
      if (!(itemKey in schema)) {                                                                                      // 109
        schema[itemKey] = {};                                                                                          // 110
      }                                                                                                                // 111
      if (_.isArray(def.type)) {                                                                                       // 112
        schema[itemKey].type = def.type[0];                                                                            // 113
      }                                                                                                                // 114
      if (def.label) {                                                                                                 // 115
        schema[itemKey].label = def.label;                                                                             // 116
      }                                                                                                                // 117
      schema[itemKey].optional = true;                                                                                 // 118
      if (typeof def.min !== "undefined") {                                                                            // 119
        schema[itemKey].min = def.min;                                                                                 // 120
      }                                                                                                                // 121
      if (typeof def.max !== "undefined") {                                                                            // 122
        schema[itemKey].max = def.max;                                                                                 // 123
      }                                                                                                                // 124
      if (typeof def.allowedValues !== "undefined") {                                                                  // 125
        schema[itemKey].allowedValues = def.allowedValues;                                                             // 126
      }                                                                                                                // 127
      if (typeof def.decimal !== "undefined") {                                                                        // 128
        schema[itemKey].decimal = def.decimal;                                                                         // 129
      }                                                                                                                // 130
      if (typeof def.exclusiveMax !== "undefined") {                                                                   // 131
        schema[itemKey].exclusiveMax = def.exclusiveMax;                                                               // 132
      }                                                                                                                // 133
      if (typeof def.exclusiveMin !== "undefined") {                                                                   // 134
        schema[itemKey].exclusiveMin = def.exclusiveMin;                                                               // 135
      }                                                                                                                // 136
      if (typeof def.regEx !== "undefined") {                                                                          // 137
        schema[itemKey].regEx = def.regEx;                                                                             // 138
      }                                                                                                                // 139
      if (typeof def.blackbox !== "undefined") {                                                                       // 140
        schema[itemKey].blackbox = def.blackbox;                                                                       // 141
      }                                                                                                                // 142
      // Remove copied options and adjust type                                                                         // 143
      def.type = Array;                                                                                                // 144
      _.each(['min', 'max', 'allowedValues', 'decimal', 'exclusiveMax', 'exclusiveMin', 'regEx', 'blackbox'], function(k) {
        Utility.deleteIfPresent(def, k);                                                                               // 146
      });                                                                                                              // 147
    }                                                                                                                  // 148
  });                                                                                                                  // 149
};                                                                                                                     // 150
                                                                                                                       // 151
/**                                                                                                                    // 152
 * Adds implied keys.                                                                                                  // 153
 * * If schema contains a key like "foo.$.bar" but not "foo", adds "foo".                                              // 154
 * * If schema contains a key like "foo" with an array type, adds "foo.$".                                             // 155
 * @param {Object} schema                                                                                              // 156
 * @returns {Object} modified schema                                                                                   // 157
 */                                                                                                                    // 158
var addImplicitKeys = function(schema) {                                                                               // 159
  var arrayKeysToAdd = [], objectKeysToAdd = [], newKey, key, i, ln;                                                   // 160
                                                                                                                       // 161
  // Pass 1 (objects)                                                                                                  // 162
  _.each(schema, function(def, existingKey) {                                                                          // 163
    var pos = existingKey.indexOf(".");                                                                                // 164
    while (pos !== -1) {                                                                                               // 165
      newKey = existingKey.substring(0, pos);                                                                          // 166
                                                                                                                       // 167
      // It's an array item; nothing to add                                                                            // 168
      if (newKey.substring(newKey.length - 2) === ".$") {                                                              // 169
        pos = -1;                                                                                                      // 170
      }                                                                                                                // 171
      // It's an array of objects; add it with type [Object] if not already in the schema                              // 172
      else if (existingKey.substring(pos, pos + 3) === ".$.") {                                                        // 173
        arrayKeysToAdd.push(newKey); // add later, since we are iterating over schema right now                        // 174
        pos = existingKey.indexOf(".", pos + 3); // skip over next dot, find the one after                             // 175
      }                                                                                                                // 176
      // It's an object; add it with type Object if not already in the schema                                          // 177
      else {                                                                                                           // 178
        objectKeysToAdd.push(newKey); // add later, since we are iterating over schema right now                       // 179
        pos = existingKey.indexOf(".", pos + 1); // find next dot                                                      // 180
      }                                                                                                                // 181
    }                                                                                                                  // 182
  });                                                                                                                  // 183
                                                                                                                       // 184
  for (i = 0, ln = arrayKeysToAdd.length; i < ln; i++) {                                                               // 185
    key = arrayKeysToAdd[i];                                                                                           // 186
    if (!(key in schema)) {                                                                                            // 187
      schema[key] = {type: [Object], optional: true};                                                                  // 188
    }                                                                                                                  // 189
  }                                                                                                                    // 190
                                                                                                                       // 191
  for (i = 0, ln = objectKeysToAdd.length; i < ln; i++) {                                                              // 192
    key = objectKeysToAdd[i];                                                                                          // 193
    if (!(key in schema)) {                                                                                            // 194
      schema[key] = {type: Object, optional: true};                                                                    // 195
    }                                                                                                                  // 196
  }                                                                                                                    // 197
                                                                                                                       // 198
  // Pass 2 (arrays)                                                                                                   // 199
  adjustArrayFields(schema);                                                                                           // 200
                                                                                                                       // 201
  return schema;                                                                                                       // 202
};                                                                                                                     // 203
                                                                                                                       // 204
var mergeSchemas = function(schemas) {                                                                                 // 205
                                                                                                                       // 206
  // Merge all provided schema definitions.                                                                            // 207
  // This is effectively a shallow clone of each object, too,                                                          // 208
  // which is what we want since we are going to manipulate it.                                                        // 209
  var mergedSchema = {};                                                                                               // 210
  _.each(schemas, function(schema) {                                                                                   // 211
                                                                                                                       // 212
    // Create a temporary SS instance so that the internal object                                                      // 213
    // we use for merging/extending will be fully expanded                                                             // 214
    if (Match.test(schema, SimpleSchema)) {                                                                            // 215
      schema = schema._schema;                                                                                         // 216
    } else {                                                                                                           // 217
      schema = addImplicitKeys(expandSchema(schema));                                                                  // 218
    }                                                                                                                  // 219
                                                                                                                       // 220
    // Loop through and extend each individual field                                                                   // 221
    // definition. That way you can extend and overwrite                                                               // 222
    // base field definitions.                                                                                         // 223
    _.each(schema, function(def, field) {                                                                              // 224
      mergedSchema[field] = mergedSchema[field] || {};                                                                 // 225
      _.extend(mergedSchema[field], def);                                                                              // 226
    });                                                                                                                // 227
                                                                                                                       // 228
  });                                                                                                                  // 229
                                                                                                                       // 230
  // If we merged some schemas, do this again to make sure                                                             // 231
  // extended definitions are pushed into array item field                                                             // 232
  // definitions properly.                                                                                             // 233
  schemas.length && adjustArrayFields(mergedSchema);                                                                   // 234
                                                                                                                       // 235
  return mergedSchema;                                                                                                 // 236
};                                                                                                                     // 237
                                                                                                                       // 238
// Returns an object relating the keys in the list                                                                     // 239
// to their parent object.                                                                                             // 240
var getObjectKeys = function(schema, schemaKeyList) {                                                                  // 241
  var keyPrefix, remainingText, rKeys = {}, loopArray;                                                                 // 242
  _.each(schema, function(definition, fieldName) {                                                                     // 243
    if (definition.type === Object) {                                                                                  // 244
      //object                                                                                                         // 245
      keyPrefix = fieldName + ".";                                                                                     // 246
    } else {                                                                                                           // 247
      return;                                                                                                          // 248
    }                                                                                                                  // 249
                                                                                                                       // 250
    loopArray = [];                                                                                                    // 251
    _.each(schemaKeyList, function(fieldName2) {                                                                       // 252
      if (fieldName2.startsWith(keyPrefix)) {                                                                          // 253
        remainingText = fieldName2.substring(keyPrefix.length);                                                        // 254
        if (remainingText.indexOf(".") === -1) {                                                                       // 255
          loopArray.push(remainingText);                                                                               // 256
        }                                                                                                              // 257
      }                                                                                                                // 258
    });                                                                                                                // 259
    rKeys[keyPrefix] = loopArray;                                                                                      // 260
  });                                                                                                                  // 261
  return rKeys;                                                                                                        // 262
};                                                                                                                     // 263
                                                                                                                       // 264
// returns an inflected version of fieldName to use as the label                                                       // 265
var inflectedLabel = function(fieldName) {                                                                             // 266
  var label = fieldName, lastPeriod = label.lastIndexOf(".");                                                          // 267
  if (lastPeriod !== -1) {                                                                                             // 268
    label = label.substring(lastPeriod + 1);                                                                           // 269
    if (label === "$") {                                                                                               // 270
      var pcs = fieldName.split(".");                                                                                  // 271
      label = pcs[pcs.length - 2];                                                                                     // 272
    }                                                                                                                  // 273
  }                                                                                                                    // 274
  if (label === "_id") {                                                                                               // 275
    return "ID";                                                                                                       // 276
  }                                                                                                                    // 277
  return humanize(label);                                                                                              // 278
};                                                                                                                     // 279
                                                                                                                       // 280
/**                                                                                                                    // 281
 * @method getAutoValues                                                                                               // 282
 * @private                                                                                                            // 283
 * @param {MongoObject} mDoc                                                                                           // 284
 * @param {Boolean} [isModifier=false] - Is it a modifier doc?                                                         // 285
 * @param {Object} [extendedAutoValueContext] - Object that will be added to the context when calling each autoValue function
 * @returns {undefined}                                                                                                // 287
 *                                                                                                                     // 288
 * Updates doc with automatic values from autoValue functions or default                                               // 289
 * values from defaultValue. Modifies the referenced object in place.                                                  // 290
 */                                                                                                                    // 291
function getAutoValues(mDoc, isModifier, extendedAutoValueContext) {                                                   // 292
  var self = this;                                                                                                     // 293
  var doneKeys = [];                                                                                                   // 294
                                                                                                                       // 295
  //on the client we can add the userId if not already in the custom context                                           // 296
  if (Meteor.isClient && extendedAutoValueContext.userId === void 0) {                                                 // 297
    extendedAutoValueContext.userId = (Meteor.userId && Meteor.userId()) || null;                                      // 298
  }                                                                                                                    // 299
                                                                                                                       // 300
  function runAV(func) {                                                                                               // 301
    var affectedKey = this.key;                                                                                        // 302
    // If already called for this key, skip it                                                                         // 303
    if (_.contains(doneKeys, affectedKey)) {                                                                           // 304
      return;                                                                                                          // 305
    }                                                                                                                  // 306
    var lastDot = affectedKey.lastIndexOf('.');                                                                        // 307
    var fieldParentName = lastDot === -1 ? '' : affectedKey.slice(0, lastDot + 1);                                     // 308
    var doUnset = false;                                                                                               // 309
    var autoValue = func.call(_.extend({                                                                               // 310
      isSet: (this.value !== void 0),                                                                                  // 311
      unset: function() {                                                                                              // 312
        doUnset = true;                                                                                                // 313
      },                                                                                                               // 314
      value: this.value,                                                                                               // 315
      operator: this.operator,                                                                                         // 316
      field: function(fName) {                                                                                         // 317
        var keyInfo = mDoc.getInfoForKey(fName) || {};                                                                 // 318
        return {                                                                                                       // 319
          isSet: (keyInfo.value !== void 0),                                                                           // 320
          value: keyInfo.value,                                                                                        // 321
          operator: keyInfo.operator || null                                                                           // 322
        };                                                                                                             // 323
      },                                                                                                               // 324
      siblingField: function(fName) {                                                                                  // 325
        var keyInfo = mDoc.getInfoForKey(fieldParentName + fName) || {};                                               // 326
        return {                                                                                                       // 327
          isSet: (keyInfo.value !== void 0),                                                                           // 328
          value: keyInfo.value,                                                                                        // 329
          operator: keyInfo.operator || null                                                                           // 330
        };                                                                                                             // 331
      }                                                                                                                // 332
    }, extendedAutoValueContext || {}), mDoc.getObject());                                                             // 333
                                                                                                                       // 334
    // Update tracking of which keys we've run autovalue for                                                           // 335
    doneKeys.push(affectedKey);                                                                                        // 336
                                                                                                                       // 337
    if (autoValue === void 0) {                                                                                        // 338
      if (doUnset) {                                                                                                   // 339
        mDoc.removeValueForPosition(this.position);                                                                    // 340
      }                                                                                                                // 341
      return;                                                                                                          // 342
    }                                                                                                                  // 343
                                                                                                                       // 344
    // If the user's auto value is of the pseudo-modifier format, parse it                                             // 345
    // into operator and value.                                                                                        // 346
    var op, newValue;                                                                                                  // 347
    if (_.isObject(autoValue)) {                                                                                       // 348
      for (var key in autoValue) {                                                                                     // 349
        if (autoValue.hasOwnProperty(key) && key.substring(0, 1) === "$") {                                            // 350
          op = key;                                                                                                    // 351
          newValue = autoValue[key];                                                                                   // 352
          break;                                                                                                       // 353
        }                                                                                                              // 354
      }                                                                                                                // 355
    }                                                                                                                  // 356
                                                                                                                       // 357
    // Add $set for updates and upserts if necessary                                                                   // 358
    if (!op && isModifier && this.position.slice(0, 1) !== '$') {                                                      // 359
      op = "$set";                                                                                                     // 360
      newValue = autoValue;                                                                                            // 361
    }                                                                                                                  // 362
                                                                                                                       // 363
    // Update/change value                                                                                             // 364
    if (op) {                                                                                                          // 365
      mDoc.removeValueForPosition(this.position);                                                                      // 366
      mDoc.setValueForPosition(op + '[' + affectedKey + ']', newValue);                                                // 367
    } else {                                                                                                           // 368
      mDoc.setValueForPosition(this.position, autoValue);                                                              // 369
    }                                                                                                                  // 370
  }                                                                                                                    // 371
                                                                                                                       // 372
  _.each(self._autoValues, function(func, fieldName) {                                                                 // 373
    var positionSuffix, key, keySuffix, positions;                                                                     // 374
                                                                                                                       // 375
    // If we're under an array, run autovalue for all the properties of                                                // 376
    // any objects that are present in the nearest ancestor array.                                                     // 377
    if (fieldName.indexOf("$") !== -1) {                                                                               // 378
      var testField = fieldName.slice(0, fieldName.lastIndexOf("$") + 1);                                              // 379
      keySuffix = fieldName.slice(testField.length + 1);                                                               // 380
      positionSuffix = MongoObject._keyToPosition(keySuffix, true);                                                    // 381
      keySuffix = '.' + keySuffix;                                                                                     // 382
      positions = mDoc.getPositionsForGenericKey(testField);                                                           // 383
    } else {                                                                                                           // 384
                                                                                                                       // 385
      // See if anything in the object affects this key                                                                // 386
      positions = mDoc.getPositionsForGenericKey(fieldName);                                                           // 387
                                                                                                                       // 388
      // Run autovalue for properties that are set in the object                                                       // 389
      if (positions.length) {                                                                                          // 390
        key = fieldName;                                                                                               // 391
        keySuffix = '';                                                                                                // 392
        positionSuffix = '';                                                                                           // 393
      }                                                                                                                // 394
                                                                                                                       // 395
      // Run autovalue for properties that are NOT set in the object                                                   // 396
      else {                                                                                                           // 397
        key = fieldName;                                                                                               // 398
        keySuffix = '';                                                                                                // 399
        positionSuffix = '';                                                                                           // 400
        if (isModifier) {                                                                                              // 401
          positions = ["$set[" + fieldName + "]"];                                                                     // 402
        } else {                                                                                                       // 403
          positions = [MongoObject._keyToPosition(fieldName)];                                                         // 404
        }                                                                                                              // 405
      }                                                                                                                // 406
                                                                                                                       // 407
    }                                                                                                                  // 408
                                                                                                                       // 409
    _.each(positions, function(position) {                                                                             // 410
      runAV.call({                                                                                                     // 411
        key: (key || MongoObject._positionToKey(position)) + keySuffix,                                                // 412
        value: mDoc.getValueForPosition(position + positionSuffix),                                                    // 413
        operator: Utility.extractOp(position),                                                                         // 414
        position: position + positionSuffix                                                                            // 415
      }, func);                                                                                                        // 416
    });                                                                                                                // 417
  });                                                                                                                  // 418
}                                                                                                                      // 419
                                                                                                                       // 420
//exported                                                                                                             // 421
SimpleSchema = function(schemas, options) {                                                                            // 422
  var self = this;                                                                                                     // 423
  var firstLevelSchemaKeys = [];                                                                                       // 424
  var fieldNameRoot;                                                                                                   // 425
  options = options || {};                                                                                             // 426
  schemas = schemas || {};                                                                                             // 427
                                                                                                                       // 428
  if (!_.isArray(schemas)) {                                                                                           // 429
    schemas = [schemas];                                                                                               // 430
  }                                                                                                                    // 431
                                                                                                                       // 432
  // adjust and store a copy of the schema definitions                                                                 // 433
  self._schema = mergeSchemas(schemas);                                                                                // 434
                                                                                                                       // 435
  // store the list of defined keys for speedier checking                                                              // 436
  self._schemaKeys = [];                                                                                               // 437
                                                                                                                       // 438
  // store autoValue functions by key                                                                                  // 439
  self._autoValues = {};                                                                                               // 440
                                                                                                                       // 441
  // store the list of blackbox keys for passing to MongoObject constructor                                            // 442
  self._blackboxKeys = [];                                                                                             // 443
                                                                                                                       // 444
  // a place to store custom validators for this instance                                                              // 445
  self._validators = [];                                                                                               // 446
                                                                                                                       // 447
  // a place to store custom error messages for this schema                                                            // 448
  self._messages = {};                                                                                                 // 449
                                                                                                                       // 450
  self._depsMessages = new Deps.Dependency();                                                                          // 451
  self._depsLabels = {};                                                                                               // 452
                                                                                                                       // 453
  _.each(self._schema, function(definition, fieldName) {                                                               // 454
    // Validate the field definition                                                                                   // 455
    if (!Match.test(definition, schemaDefinition)) {                                                                   // 456
      throw new Error('Invalid definition for ' + fieldName + ' field.');                                              // 457
    }                                                                                                                  // 458
                                                                                                                       // 459
    fieldNameRoot = fieldName.split(".")[0];                                                                           // 460
                                                                                                                       // 461
    self._schemaKeys.push(fieldName);                                                                                  // 462
                                                                                                                       // 463
    // We support defaultValue shortcut by converting it immediately into an                                           // 464
    // autoValue.                                                                                                      // 465
    if ('defaultValue' in definition) {                                                                                // 466
      if ('autoValue' in definition) {                                                                                 // 467
        console.warn('SimpleSchema: Found both autoValue and defaultValue options for "' + fieldName + '". Ignoring defaultValue.');
      } else {                                                                                                         // 469
        if (fieldName.slice(-2) === ".$") {                                                                            // 470
          throw new Error('An array item field (one that ends with ".$") cannot have defaultValue.');                  // 471
        }                                                                                                              // 472
        self._autoValues[fieldName] = (function defineAutoValue(v) {                                                   // 473
          return function() {                                                                                          // 474
            if (this.operator === null && !this.isSet) {                                                               // 475
              return v;                                                                                                // 476
            }                                                                                                          // 477
          };                                                                                                           // 478
        })(definition.defaultValue);                                                                                   // 479
      }                                                                                                                // 480
    }                                                                                                                  // 481
                                                                                                                       // 482
    if ('autoValue' in definition) {                                                                                   // 483
      if (fieldName.slice(-2) === ".$") {                                                                              // 484
        throw new Error('An array item field (one that ends with ".$") cannot have autoValue.');                       // 485
      }                                                                                                                // 486
      self._autoValues[fieldName] = definition.autoValue;                                                              // 487
    }                                                                                                                  // 488
                                                                                                                       // 489
    self._depsLabels[fieldName] = new Deps.Dependency();                                                               // 490
                                                                                                                       // 491
    if (definition.blackbox === true) {                                                                                // 492
      self._blackboxKeys.push(fieldName);                                                                              // 493
    }                                                                                                                  // 494
                                                                                                                       // 495
    if (!_.contains(firstLevelSchemaKeys, fieldNameRoot)) {                                                            // 496
      firstLevelSchemaKeys.push(fieldNameRoot);                                                                        // 497
    }                                                                                                                  // 498
  });                                                                                                                  // 499
                                                                                                                       // 500
                                                                                                                       // 501
  // Cache these lists                                                                                                 // 502
  self._firstLevelSchemaKeys = firstLevelSchemaKeys;                                                                   // 503
  self._objectKeys = getObjectKeys(self._schema, self._schemaKeys);                                                    // 504
                                                                                                                       // 505
  // We will store named validation contexts here                                                                      // 506
  self._validationContexts = {};                                                                                       // 507
};                                                                                                                     // 508
                                                                                                                       // 509
// This allows other packages or users to extend the schema                                                            // 510
// definition options that are supported.                                                                              // 511
SimpleSchema.extendOptions = function(options) {                                                                       // 512
  _.extend(schemaDefinition, options);                                                                                 // 513
};                                                                                                                     // 514
                                                                                                                       // 515
// this domain regex matches all domains that have at least one .                                                      // 516
// sadly IPv4 Adresses will be caught too but technically those are valid domains                                      // 517
// this expression is extracted from the original RFC 5322 mail expression                                             // 518
// a modification enforces that the tld consists only of characters                                                    // 519
var RX_DOMAIN = '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z](?:[a-z-]*[a-z])?';                                       // 520
// this domain regex matches everythign that could be a domain in intranet                                             // 521
// that means "localhost" is a valid domain                                                                            // 522
var RX_NAME_DOMAIN = '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.|$))+';                                                  // 523
// strict IPv4 expression which allows 0-255 per oktett                                                                // 524
var RX_IPv4 = '(?:(?:[0-1]?\\d{1,2}|2[0-4]\\d|25[0-5])(?:\\.|$)){4}';                                                  // 525
// strict IPv6 expression which allows (and validates) all shortcuts                                                   // 526
var RX_IPv6 = '(?:(?:[\\dA-Fa-f]{1,4}(?::|$)){8}' // full adress                                                       // 527
  + '|(?=(?:[^:\\s]|:[^:\\s])*::(?:[^:\\s]|:[^:\\s])*$)' // or min/max one '::'                                        // 528
  + '[\\dA-Fa-f]{0,4}(?:::?(?:[\\dA-Fa-f]{1,4}|$)){1,6})'; // and short adress                                         // 529
// this allows domains (also localhost etc) and ip adresses                                                            // 530
var RX_WEAK_DOMAIN = '(?:' + [RX_NAME_DOMAIN,RX_IPv4,RX_IPv6].join('|') + ')';                                         // 531
                                                                                                                       // 532
SimpleSchema.RegEx = {                                                                                                 // 533
  // We use the RegExp suggested by W3C in http://www.w3.org/TR/html5/forms.html#valid-e-mail-address                  // 534
  // This is probably the same logic used by most browsers when type=email, which is our goal. It is                   // 535
  // a very permissive expression. Some apps may wish to be more strict and can write their own RegExp.                // 536
  Email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                                                                                                                       // 538
  Domain: new RegExp('^' + RX_DOMAIN + '$'),                                                                           // 539
  WeakDomain: new RegExp('^' + RX_WEAK_DOMAIN + '$'),                                                                  // 540
                                                                                                                       // 541
  IP: new RegExp('^(?:' + RX_IPv4 + '|' + RX_IPv6 + ')$'),                                                             // 542
  IPv4: new RegExp('^' + RX_IPv4 + '$'),                                                                               // 543
  IPv6: new RegExp('^' + RX_IPv6 + '$'),                                                                               // 544
  // URL RegEx from https://gist.github.com/dperini/729294                                                             // 545
  // http://mathiasbynens.be/demo/url-regex                                                                            // 546
  Url: /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i,
  // unique id from the random package also used by minimongo                                                          // 548
  // character list: https://github.com/meteor/meteor/blob/release/0.8.0/packages/random/random.js#L88                 // 549
  // string length: https://github.com/meteor/meteor/blob/release/0.8.0/packages/random/random.js#L143                 // 550
  Id: /^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/,                                               // 551
  // allows for a 5 digit zip code followed by a whitespace or dash and then 4 more digits                             // 552
  // matches 11111 and 11111-1111 and 11111 1111                                                                       // 553
  ZipCode: /^\d{5}(?:[-\s]\d{4})?$/,                                                                                   // 554
  // taken from google's libphonenumber library                                                                        // 555
  // https://github.com/googlei18n/libphonenumber/blob/master/javascript/i18n/phonenumbers/phonenumberutil.js          // 556
  // reference the VALID_PHONE_NUMBER_PATTERN key                                                                      // 557
  // allows for common phone number symbols including + () and -                                                       // 558
  Phone: /^[0-9０-９٠-٩۰-۹]{2}$|^[+＋]*(?:[-x‐-―−ー－-／  ­​⁠　()（）［］.\[\]/~⁓∼～*]*[0-9０-９٠-٩۰-۹]){3,}[-x‐-―−ー－-／  ­​⁠　()（）［］.\[\]/~⁓∼～0-9０-９٠-٩۰-۹]*(?:;ext=([0-9０-９٠-٩۰-۹]{1,7})|[  \t,]*(?:e?xt(?:ensi(?:ó?|ó))?n?|ｅ?ｘｔｎ?|[,xｘ#＃~～]|int|anexo|ｉｎｔ)[:\.．]?[  \t,-]*([0-9０-９٠-٩۰-۹]{1,7})#?|[- ]+([0-9０-９٠-٩۰-۹]{1,5})#)?$/i
};                                                                                                                     // 560
                                                                                                                       // 561
SimpleSchema._makeGeneric = function(name) {                                                                           // 562
  if (typeof name !== "string") {                                                                                      // 563
    return null;                                                                                                       // 564
  }                                                                                                                    // 565
                                                                                                                       // 566
  return name.replace(/\.[0-9]+(?=\.|$)/g, '.$');                                                                      // 567
};                                                                                                                     // 568
                                                                                                                       // 569
SimpleSchema._depsGlobalMessages = new Deps.Dependency();                                                              // 570
                                                                                                                       // 571
// Inherit from Match.Where                                                                                            // 572
// This allow SimpleSchema instance to be recognized as a Match.Where instance as well                                 // 573
// as a SimpleSchema instance                                                                                          // 574
SimpleSchema.prototype = new Match.Where();                                                                            // 575
                                                                                                                       // 576
// If an object is an instance of Match.Where, Meteor built-in check API will look at                                  // 577
// the function named `condition` and will pass it the document to validate                                            // 578
SimpleSchema.prototype.condition = function(obj) {                                                                     // 579
  var self = this;                                                                                                     // 580
                                                                                                                       // 581
  //determine whether obj is a modifier                                                                                // 582
  var isModifier, isNotModifier;                                                                                       // 583
  _.each(obj, function(val, key) {                                                                                     // 584
    if (key.substring(0, 1) === "$") {                                                                                 // 585
      isModifier = true;                                                                                               // 586
    } else {                                                                                                           // 587
      isNotModifier = true;                                                                                            // 588
    }                                                                                                                  // 589
  });                                                                                                                  // 590
                                                                                                                       // 591
  if (isModifier && isNotModifier) {                                                                                   // 592
    throw new Match.Error("Object cannot contain modifier operators alongside other keys");                            // 593
  }                                                                                                                    // 594
                                                                                                                       // 595
  var ctx = self.newContext();                                                                                         // 596
  if (!ctx.validate(obj, {modifier: isModifier, filter: false, autoConvert: false})) {                                 // 597
    var error = ctx.getErrorObject();                                                                                  // 598
    var matchError = new Match.Error(error.message);                                                                   // 599
    matchError.invalidKeys = error.invalidKeys;                                                                        // 600
    if (Meteor.isServer) {                                                                                             // 601
      matchError.sanitizedError = error.sanitizedError;                                                                // 602
    }                                                                                                                  // 603
    throw matchError;                                                                                                  // 604
  }                                                                                                                    // 605
                                                                                                                       // 606
  return true;                                                                                                         // 607
};                                                                                                                     // 608
                                                                                                                       // 609
function logInvalidKeysForContext(context, name) {                                                                     // 610
  Meteor.startup(function() {                                                                                          // 611
    Deps.autorun(function() {                                                                                          // 612
      if (!context.isValid()) {                                                                                        // 613
        console.log('SimpleSchema invalid keys for "' + name + '" context:', context.invalidKeys());                   // 614
      }                                                                                                                // 615
    });                                                                                                                // 616
  });                                                                                                                  // 617
}                                                                                                                      // 618
                                                                                                                       // 619
SimpleSchema.prototype.namedContext = function(name) {                                                                 // 620
  var self = this;                                                                                                     // 621
  if (typeof name !== "string") {                                                                                      // 622
    name = "default";                                                                                                  // 623
  }                                                                                                                    // 624
  if (!self._validationContexts[name]) {                                                                               // 625
    self._validationContexts[name] = new SimpleSchemaValidationContext(self);                                          // 626
                                                                                                                       // 627
    // In debug mode, log all invalid key errors to the browser console                                                // 628
    if (SimpleSchema.debug && Meteor.isClient) {                                                                       // 629
      Deps.nonreactive(function() {                                                                                    // 630
        logInvalidKeysForContext(self._validationContexts[name], name);                                                // 631
      });                                                                                                              // 632
    }                                                                                                                  // 633
  }                                                                                                                    // 634
  return self._validationContexts[name];                                                                               // 635
};                                                                                                                     // 636
                                                                                                                       // 637
// Global custom validators                                                                                            // 638
SimpleSchema._validators = [];                                                                                         // 639
SimpleSchema.addValidator = function(func) {                                                                           // 640
  SimpleSchema._validators.push(func);                                                                                 // 641
};                                                                                                                     // 642
                                                                                                                       // 643
// Instance custom validators                                                                                          // 644
SimpleSchema.prototype.addValidator = function(func) {                                                                 // 645
  this._validators.push(func);                                                                                         // 646
};                                                                                                                     // 647
                                                                                                                       // 648
/**                                                                                                                    // 649
 * @method SimpleSchema.prototype.pick                                                                                 // 650
 * @param {[fields]} The list of fields to pick to instantiate the subschema                                           // 651
 * @returns {SimpleSchema} The subschema                                                                               // 652
 */                                                                                                                    // 653
SimpleSchema.prototype.pick = function(/* arguments */) {                                                              // 654
  var self = this;                                                                                                     // 655
  var args = _.toArray(arguments);                                                                                     // 656
  args.unshift(self._schema);                                                                                          // 657
                                                                                                                       // 658
  var newSchema = _.pick.apply(null, args);                                                                            // 659
  return new SimpleSchema(newSchema);                                                                                  // 660
};                                                                                                                     // 661
                                                                                                                       // 662
SimpleSchema.prototype.omit = function() {                                                                             // 663
  var self = this;                                                                                                     // 664
  var args = _.toArray(arguments);                                                                                     // 665
  args.unshift(self._schema);                                                                                          // 666
                                                                                                                       // 667
  var newSchema = _.omit.apply(null, args);                                                                            // 668
  return new SimpleSchema(newSchema);                                                                                  // 669
};                                                                                                                     // 670
                                                                                                                       // 671
                                                                                                                       // 672
/**                                                                                                                    // 673
 * @method SimpleSchema.prototype.clean                                                                                // 674
 * @param {Object} doc - Document or modifier to clean. Referenced object will be modified in place.                   // 675
 * @param {Object} [options]                                                                                           // 676
 * @param {Boolean} [options.filter=true] - Do filtering?                                                              // 677
 * @param {Boolean} [options.autoConvert=true] - Do automatic type converting?                                         // 678
 * @param {Boolean} [options.removeEmptyStrings=true] - Remove keys in normal object or $set where the value is an empty string?
 * @param {Boolean} [options.trimStrings=true] - Trim string values?                                                   // 680
 * @param {Boolean} [options.getAutoValues=true] - Inject automatic and default values?                                // 681
 * @param {Boolean} [options.isModifier=false] - Is doc a modifier object?                                             // 682
 * @param {Object} [options.extendAutoValueContext] - This object will be added to the `this` context of autoValue functions.
 * @returns {Object} The modified doc.                                                                                 // 684
 *                                                                                                                     // 685
 * Cleans a document or modifier object. By default, will filter, automatically                                        // 686
 * type convert where possible, and inject automatic/default values. Use the options                                   // 687
 * to skip one or more of these.                                                                                       // 688
 */                                                                                                                    // 689
SimpleSchema.prototype.clean = function(doc, options) {                                                                // 690
  var self = this;                                                                                                     // 691
                                                                                                                       // 692
  // By default, doc will be filtered and autoconverted                                                                // 693
  options = _.extend({                                                                                                 // 694
    filter: true,                                                                                                      // 695
    autoConvert: true,                                                                                                 // 696
    removeEmptyStrings: true,                                                                                          // 697
    trimStrings: true,                                                                                                 // 698
    getAutoValues: true,                                                                                               // 699
    isModifier: false,                                                                                                 // 700
    extendAutoValueContext: {}                                                                                         // 701
  }, options || {});                                                                                                   // 702
                                                                                                                       // 703
  // Convert $pushAll (deprecated) to $push with $each                                                                 // 704
  if ("$pushAll" in doc) {                                                                                             // 705
    console.warn("SimpleSchema.clean: $pushAll is deprecated; converting to $push with $each");                        // 706
    doc.$push = doc.$push || {};                                                                                       // 707
    for (var field in doc.$pushAll) {                                                                                  // 708
      doc.$push[field] = doc.$push[field] || {};                                                                       // 709
      doc.$push[field].$each = doc.$push[field].$each || [];                                                           // 710
      for (var i = 0, ln = doc.$pushAll[field].length; i < ln; i++) {                                                  // 711
        doc.$push[field].$each.push(doc.$pushAll[field][i]);                                                           // 712
      }                                                                                                                // 713
      delete doc.$pushAll;                                                                                             // 714
    }                                                                                                                  // 715
  }                                                                                                                    // 716
                                                                                                                       // 717
  var mDoc = new MongoObject(doc, self._blackboxKeys);                                                                 // 718
                                                                                                                       // 719
  // Clean loop                                                                                                        // 720
  if (options.filter || options.autoConvert || options.removeEmptyStrings || options.trimStrings) {                    // 721
    mDoc.forEachNode(function() {                                                                                      // 722
      var gKey = this.genericKey, p, def, val;                                                                         // 723
      if (gKey) {                                                                                                      // 724
        def = self._schema[gKey];                                                                                      // 725
        val = this.value;                                                                                              // 726
        // Filter out props if necessary; any property is OK for $unset because we want to                             // 727
        // allow conversions to remove props that have been removed from the schema.                                   // 728
        if (options.filter && this.operator !== "$unset" && !self.allowsKey(gKey)) {                                   // 729
          // XXX Special handling for $each; maybe this could be made nicer                                            // 730
          if (this.position.slice(-7) === "[$each]") {                                                                 // 731
            mDoc.removeValueForPosition(this.position.slice(0, -7));                                                   // 732
          } else {                                                                                                     // 733
            this.remove();                                                                                             // 734
          }                                                                                                            // 735
          if (SimpleSchema.debug) {                                                                                    // 736
            console.info('SimpleSchema.clean: filtered out value that would have affected key "' + gKey + '", which is not allowed by the schema');
          }                                                                                                            // 738
          return; // no reason to do more                                                                              // 739
        }                                                                                                              // 740
        if (val !== void 0) {                                                                                          // 741
          // Autoconvert values if requested and if possible                                                           // 742
          var wasAutoConverted = false;                                                                                // 743
          if (options.autoConvert && this.operator !== "$unset" && def) {                                              // 744
            var newVal = typeconvert(val, def.type);                                                                   // 745
            // trim strings                                                                                            // 746
            if (options.trimStrings && typeof newVal === "string") {                                                   // 747
              newVal = newVal.trim();                                                                                  // 748
            }                                                                                                          // 749
            if (newVal !== void 0 && newVal !== val) {                                                                 // 750
              // remove empty strings                                                                                  // 751
              if (options.removeEmptyStrings && (!this.operator || this.operator === "$set") && typeof newVal === "string" && !newVal.length) {
                // For a document, we remove any fields that are being set to an empty string                          // 753
                newVal = void 0;                                                                                       // 754
                // For a modifier, we $unset any fields that are being set to an empty string                          // 755
                if (this.operator === "$set" && this.position.match(/\[.+?\]/g).length < 2) {                          // 756
                                                                                                                       // 757
                  p = this.position.replace("$set", "$unset");                                                         // 758
                  mDoc.setValueForPosition(p, "");                                                                     // 759
                }                                                                                                      // 760
              }                                                                                                        // 761
                                                                                                                       // 762
              // Change value; if undefined, will remove it                                                            // 763
              SimpleSchema.debug && console.info('SimpleSchema.clean: autoconverted value ' + val + ' from ' + typeof val + ' to ' + typeof newVal + ' for ' + gKey);
              this.updateValue(newVal);                                                                                // 765
              wasAutoConverted = true;                                                                                 // 766
            }                                                                                                          // 767
          }                                                                                                            // 768
          if (!wasAutoConverted) {                                                                                     // 769
            // trim strings                                                                                            // 770
            if (options.trimStrings && typeof val === "string" && (!def || (def && def.trim !== false))) {             // 771
              this.updateValue(val.trim());                                                                            // 772
            }                                                                                                          // 773
            // remove empty strings                                                                                    // 774
            if (options.removeEmptyStrings && (!this.operator || this.operator === "$set") && typeof val === "string" && !val.length) {
              // For a document, we remove any fields that are being set to an empty string                            // 776
              this.remove();                                                                                           // 777
              // For a modifier, we $unset any fields that are being set to an empty string. But only if we're not already within an entire object that is being set.
              if (this.operator === "$set" && this.position.match(/\[.+?\]/g).length < 2) {                            // 779
                p = this.position.replace("$set", "$unset");                                                           // 780
                mDoc.setValueForPosition(p, "");                                                                       // 781
              }                                                                                                        // 782
            }                                                                                                          // 783
          }                                                                                                            // 784
        }                                                                                                              // 785
      }                                                                                                                // 786
    }, {endPointsOnly: false});                                                                                        // 787
  }                                                                                                                    // 788
                                                                                                                       // 789
  // Set automatic values                                                                                              // 790
  options.getAutoValues && getAutoValues.call(self, mDoc, options.isModifier, options.extendAutoValueContext);         // 791
                                                                                                                       // 792
  // Ensure we don't have any operators set to an empty object                                                         // 793
  // since MongoDB 2.6+ will throw errors.                                                                             // 794
  if (options.isModifier) {                                                                                            // 795
    for (var op in doc) {                                                                                              // 796
      if (doc.hasOwnProperty(op) && _.isEmpty(doc[op])) {                                                              // 797
        delete doc[op];                                                                                                // 798
      }                                                                                                                // 799
    }                                                                                                                  // 800
  }                                                                                                                    // 801
                                                                                                                       // 802
  return doc;                                                                                                          // 803
};                                                                                                                     // 804
                                                                                                                       // 805
// Returns the entire schema object or just the definition for one key                                                 // 806
// in the schema.                                                                                                      // 807
SimpleSchema.prototype.schema = function(key) {                                                                        // 808
  var self = this;                                                                                                     // 809
  // if not null or undefined (more specific)                                                                          // 810
  if (key !== null && key !== void 0) {                                                                                // 811
    return self._schema[SimpleSchema._makeGeneric(key)];                                                               // 812
  } else {                                                                                                             // 813
    return self._schema;                                                                                               // 814
  }                                                                                                                    // 815
};                                                                                                                     // 816
                                                                                                                       // 817
// Returns the evaluated definition for one key in the schema                                                          // 818
// key = non-generic key                                                                                               // 819
// [propList] = props to include in the result, for performance                                                        // 820
// [functionContext] = used for evaluating schema options that are functions                                           // 821
SimpleSchema.prototype.getDefinition = function(key, propList, functionContext) {                                      // 822
  var self = this;                                                                                                     // 823
  var defs = self.schema(key);                                                                                         // 824
  if (!defs) {                                                                                                         // 825
    return;                                                                                                            // 826
  }                                                                                                                    // 827
                                                                                                                       // 828
  if (_.isArray(propList)) {                                                                                           // 829
    defs = _.pick(defs, propList);                                                                                     // 830
  } else {                                                                                                             // 831
    defs = _.clone(defs);                                                                                              // 832
  }                                                                                                                    // 833
                                                                                                                       // 834
  // For any options that support specifying a function,                                                               // 835
  // evaluate the functions.                                                                                           // 836
  _.each(['min', 'max', 'minCount', 'maxCount', 'allowedValues', 'optional', 'label'], function (prop) {               // 837
    if (_.isFunction(defs[prop])) {                                                                                    // 838
      defs[prop] = defs[prop].call(functionContext || {});                                                             // 839
    }                                                                                                                  // 840
  });                                                                                                                  // 841
                                                                                                                       // 842
  // Inflect label if not defined                                                                                      // 843
  defs.label = defs.label || inflectedLabel(key);                                                                      // 844
                                                                                                                       // 845
  return defs;                                                                                                         // 846
};                                                                                                                     // 847
                                                                                                                       // 848
// Check if the key is a nested dot-syntax key inside of a blackbox object                                             // 849
SimpleSchema.prototype.keyIsInBlackBox = function(key) {                                                               // 850
  var self = this;                                                                                                     // 851
  var parentPath = SimpleSchema._makeGeneric(key), lastDot, def;                                                       // 852
                                                                                                                       // 853
  // Iterate the dot-syntax hierarchy until we find a key in our schema                                                // 854
  do {                                                                                                                 // 855
    lastDot = parentPath.lastIndexOf('.');                                                                             // 856
    if (lastDot !== -1) {                                                                                              // 857
      parentPath = parentPath.slice(0, lastDot); // Remove last path component                                         // 858
      def = self.getDefinition(parentPath);                                                                            // 859
    }                                                                                                                  // 860
  } while (lastDot !== -1 && !def);                                                                                    // 861
                                                                                                                       // 862
  return !!(def && def.blackbox);                                                                                      // 863
};                                                                                                                     // 864
                                                                                                                       // 865
// Use to dynamically change the schema labels.                                                                        // 866
SimpleSchema.prototype.labels = function(labels) {                                                                     // 867
  var self = this;                                                                                                     // 868
  _.each(labels, function(label, fieldName) {                                                                          // 869
    if (!_.isString(label) && !_.isFunction(label)) {                                                                  // 870
      return;                                                                                                          // 871
    }                                                                                                                  // 872
                                                                                                                       // 873
    if (!(fieldName in self._schema)) {                                                                                // 874
      return;                                                                                                          // 875
    }                                                                                                                  // 876
                                                                                                                       // 877
    self._schema[fieldName].label = label;                                                                             // 878
    self._depsLabels[fieldName] && self._depsLabels[fieldName].changed();                                              // 879
  });                                                                                                                  // 880
};                                                                                                                     // 881
                                                                                                                       // 882
// should be used to safely get a label as string                                                                      // 883
SimpleSchema.prototype.label = function(key) {                                                                         // 884
  var self = this;                                                                                                     // 885
                                                                                                                       // 886
  // Get all labels                                                                                                    // 887
  if (key === null || key === void 0) {                                                                                // 888
    var result = {};                                                                                                   // 889
    _.each(self.schema(), function(def, fieldName) {                                                                   // 890
      result[fieldName] = self.label(fieldName);                                                                       // 891
    });                                                                                                                // 892
    return result;                                                                                                     // 893
  }                                                                                                                    // 894
                                                                                                                       // 895
  // Get label for one field                                                                                           // 896
  var def = self.getDefinition(key);                                                                                   // 897
  if (def) {                                                                                                           // 898
    var genericKey = SimpleSchema._makeGeneric(key);                                                                   // 899
    self._depsLabels[genericKey] && self._depsLabels[genericKey].depend();                                             // 900
    return def.label;                                                                                                  // 901
  }                                                                                                                    // 902
                                                                                                                       // 903
  return null;                                                                                                         // 904
};                                                                                                                     // 905
                                                                                                                       // 906
// Global messages                                                                                                     // 907
                                                                                                                       // 908
SimpleSchema._globalMessages = {                                                                                       // 909
  required: "[label] is required",                                                                                     // 910
  minString: "[label] must be at least [min] characters",                                                              // 911
  maxString: "[label] cannot exceed [max] characters",                                                                 // 912
  minNumber: "[label] must be at least [min]",                                                                         // 913
  maxNumber: "[label] cannot exceed [max]",                                                                            // 914
  minNumberExclusive: "[label] must be greater than [min]",                                                            // 915
  maxNumberExclusive: "[label] must be less than [max]",                                                               // 916
  minDate: "[label] must be on or after [min]",                                                                        // 917
  maxDate: "[label] cannot be after [max]",                                                                            // 918
  badDate: "[label] is not a valid date",                                                                              // 919
  minCount: "You must specify at least [minCount] values",                                                             // 920
  maxCount: "You cannot specify more than [maxCount] values",                                                          // 921
  noDecimal: "[label] must be an integer",                                                                             // 922
  notAllowed: "[value] is not an allowed value",                                                                       // 923
  expectedString: "[label] must be a string",                                                                          // 924
  expectedNumber: "[label] must be a number",                                                                          // 925
  expectedBoolean: "[label] must be a boolean",                                                                        // 926
  expectedArray: "[label] must be an array",                                                                           // 927
  expectedObject: "[label] must be an object",                                                                         // 928
  expectedConstructor: "[label] must be a [type]",                                                                     // 929
  regEx: [                                                                                                             // 930
    {msg: "[label] failed regular expression validation"},                                                             // 931
    {exp: SimpleSchema.RegEx.Email, msg: "[label] must be a valid e-mail address"},                                    // 932
    {exp: SimpleSchema.RegEx.WeakEmail, msg: "[label] must be a valid e-mail address"},                                // 933
    {exp: SimpleSchema.RegEx.Domain, msg: "[label] must be a valid domain"},                                           // 934
    {exp: SimpleSchema.RegEx.WeakDomain, msg: "[label] must be a valid domain"},                                       // 935
    {exp: SimpleSchema.RegEx.IP, msg: "[label] must be a valid IPv4 or IPv6 address"},                                 // 936
    {exp: SimpleSchema.RegEx.IPv4, msg: "[label] must be a valid IPv4 address"},                                       // 937
    {exp: SimpleSchema.RegEx.IPv6, msg: "[label] must be a valid IPv6 address"},                                       // 938
    {exp: SimpleSchema.RegEx.Url, msg: "[label] must be a valid URL"},                                                 // 939
    {exp: SimpleSchema.RegEx.Id, msg: "[label] must be a valid alphanumeric ID"}                                       // 940
  ],                                                                                                                   // 941
  keyNotInSchema: "[key] is not allowed by the schema"                                                                 // 942
};                                                                                                                     // 943
                                                                                                                       // 944
SimpleSchema.messages = function(messages) {                                                                           // 945
  _.extend(SimpleSchema._globalMessages, messages);                                                                    // 946
  SimpleSchema._depsGlobalMessages.changed();                                                                          // 947
};                                                                                                                     // 948
                                                                                                                       // 949
// Schema-specific messages                                                                                            // 950
                                                                                                                       // 951
SimpleSchema.prototype.messages = function(messages) {                                                                 // 952
  var self = this;                                                                                                     // 953
  _.extend(self._messages, messages);                                                                                  // 954
  self._depsMessages.changed();                                                                                        // 955
};                                                                                                                     // 956
                                                                                                                       // 957
// Returns a string message for the given error type and key. Uses the                                                 // 958
// def and value arguments to fill in placeholders in the error messages.                                              // 959
SimpleSchema.prototype.messageForError = function(type, key, def, value) {                                             // 960
  var self = this;                                                                                                     // 961
                                                                                                                       // 962
  // We proceed even if we can't get a definition because it might be a keyNotInSchema error                           // 963
  def = def || self.getDefinition(key, ['regEx', 'label', 'minCount', 'maxCount', 'min', 'max', 'type']) || {};        // 964
                                                                                                                       // 965
  // Adjust for complex types, currently only regEx,                                                                   // 966
  // where we might have regEx.1 meaning the second                                                                    // 967
  // expression in the array.                                                                                          // 968
  var firstTypePeriod = type.indexOf("."), index = null;                                                               // 969
  if (firstTypePeriod !== -1) {                                                                                        // 970
    index = type.substring(firstTypePeriod + 1);                                                                       // 971
    index = parseInt(index, 10);                                                                                       // 972
    type = type.substring(0, firstTypePeriod);                                                                         // 973
  }                                                                                                                    // 974
                                                                                                                       // 975
  // Which regExp is it?                                                                                               // 976
  var regExpMatch;                                                                                                     // 977
  if (type === "regEx") {                                                                                              // 978
    if (index !== null && index !== void 0 && !isNaN(index)) {                                                         // 979
      regExpMatch = def.regEx[index];                                                                                  // 980
    } else {                                                                                                           // 981
      regExpMatch = def.regEx;                                                                                         // 982
    }                                                                                                                  // 983
    if (regExpMatch) {                                                                                                 // 984
      regExpMatch = regExpMatch.toString();                                                                            // 985
    }                                                                                                                  // 986
  }                                                                                                                    // 987
                                                                                                                       // 988
  // Prep some strings to be used when finding the correct message for this error                                      // 989
  var typePlusKey = type + " " + key;                                                                                  // 990
  var genericKey = SimpleSchema._makeGeneric(key);                                                                     // 991
  var typePlusGenKey = type + " " + genericKey;                                                                        // 992
                                                                                                                       // 993
  // reactively update when message templates are changed                                                              // 994
  SimpleSchema._depsGlobalMessages.depend();                                                                           // 995
  self._depsMessages.depend();                                                                                         // 996
                                                                                                                       // 997
  // Prep a function that finds the correct message for regEx errors                                                   // 998
  function findRegExError(message) {                                                                                   // 999
    if (type !== "regEx" || !_.isArray(message)) {                                                                     // 1000
      return message;                                                                                                  // 1001
    }                                                                                                                  // 1002
    // Parse regEx messages, which are provided in a special object array format                                       // 1003
    // [{exp: RegExp, msg: "Foo"}]                                                                                     // 1004
    // Where `exp` is optional                                                                                         // 1005
                                                                                                                       // 1006
    var msgObj;                                                                                                        // 1007
    // First see if there's one where exp matches this expression                                                      // 1008
    if (regExpMatch) {                                                                                                 // 1009
      msgObj = _.find(message, function (o) {                                                                          // 1010
        return o.exp && o.exp.toString() === regExpMatch;                                                              // 1011
      });                                                                                                              // 1012
    }                                                                                                                  // 1013
                                                                                                                       // 1014
    // If not, see if there's a default message defined                                                                // 1015
    if (!msgObj) {                                                                                                     // 1016
      msgObj = _.findWhere(message, {exp: null});                                                                      // 1017
      if (!msgObj) {                                                                                                   // 1018
        msgObj = _.findWhere(message, {exp: void 0});                                                                  // 1019
      }                                                                                                                // 1020
    }                                                                                                                  // 1021
                                                                                                                       // 1022
    return msgObj ? msgObj.msg : null;                                                                                 // 1023
  }                                                                                                                    // 1024
                                                                                                                       // 1025
  // Try finding the correct message to use at various levels, from most                                               // 1026
  // specific to least specific.                                                                                       // 1027
  var message = self._messages[typePlusKey] ||                  // (1) Use schema-specific message for specific key    // 1028
                self._messages[typePlusGenKey] ||               // (2) Use schema-specific message for generic key     // 1029
                self._messages[type];                           // (3) Use schema-specific message for type            // 1030
  message = findRegExError(message);                                                                                   // 1031
                                                                                                                       // 1032
  if (!message) {                                                                                                      // 1033
    message = SimpleSchema._globalMessages[typePlusKey] ||      // (4) Use global message for specific key             // 1034
              SimpleSchema._globalMessages[typePlusGenKey] ||   // (5) Use global message for generic key              // 1035
              SimpleSchema._globalMessages[type];               // (6) Use global message for type                     // 1036
    message = findRegExError(message);                                                                                 // 1037
  }                                                                                                                    // 1038
                                                                                                                       // 1039
  if (!message) {                                                                                                      // 1040
    return "Unknown validation error";                                                                                 // 1041
  }                                                                                                                    // 1042
                                                                                                                       // 1043
  // Now replace all placeholders in the message with the correct values                                               // 1044
                                                                                                                       // 1045
  // [key]                                                                                                             // 1046
  message = message.replace("[key]", key);                                                                             // 1047
                                                                                                                       // 1048
  // [label]                                                                                                           // 1049
  // The call to self.label() establishes a reactive dependency, too                                                   // 1050
  message = message.replace("[label]", self.label(key));                                                               // 1051
                                                                                                                       // 1052
  // [minCount]                                                                                                        // 1053
  if (typeof def.minCount !== "undefined") {                                                                           // 1054
    message = message.replace("[minCount]", def.minCount);                                                             // 1055
  }                                                                                                                    // 1056
                                                                                                                       // 1057
  // [maxCount]                                                                                                        // 1058
  if (typeof def.maxCount !== "undefined") {                                                                           // 1059
    message = message.replace("[maxCount]", def.maxCount);                                                             // 1060
  }                                                                                                                    // 1061
                                                                                                                       // 1062
  // [value]                                                                                                           // 1063
  if (value !== void 0 && value !== null) {                                                                            // 1064
    message = message.replace("[value]", value.toString());                                                            // 1065
  } else {                                                                                                             // 1066
    message = message.replace("[value]", 'null');                                                                      // 1067
  }                                                                                                                    // 1068
                                                                                                                       // 1069
  // [min] and [max]                                                                                                   // 1070
  var min = def.min;                                                                                                   // 1071
  var max = def.max;                                                                                                   // 1072
  if (def.type === Date || def.type === [Date]) {                                                                      // 1073
    if (typeof min !== "undefined") {                                                                                  // 1074
      message = message.replace("[min]", Utility.dateToDateString(min));                                               // 1075
    }                                                                                                                  // 1076
    if (typeof max !== "undefined") {                                                                                  // 1077
      message = message.replace("[max]", Utility.dateToDateString(max));                                               // 1078
    }                                                                                                                  // 1079
  } else {                                                                                                             // 1080
    if (typeof min !== "undefined") {                                                                                  // 1081
      message = message.replace("[min]", min);                                                                         // 1082
    }                                                                                                                  // 1083
    if (typeof max !== "undefined") {                                                                                  // 1084
      message = message.replace("[max]", max);                                                                         // 1085
    }                                                                                                                  // 1086
  }                                                                                                                    // 1087
                                                                                                                       // 1088
  // [type]                                                                                                            // 1089
  if (def.type instanceof Function) {                                                                                  // 1090
    message = message.replace("[type]", def.type.name);                                                                // 1091
  }                                                                                                                    // 1092
                                                                                                                       // 1093
  // Now return the message                                                                                            // 1094
  return message;                                                                                                      // 1095
};                                                                                                                     // 1096
                                                                                                                       // 1097
// Returns true if key is explicitly allowed by the schema or implied                                                  // 1098
// by other explicitly allowed keys.                                                                                   // 1099
// The key string should have $ in place of any numeric array positions.                                               // 1100
SimpleSchema.prototype.allowsKey = function(key) {                                                                     // 1101
  var self = this;                                                                                                     // 1102
                                                                                                                       // 1103
  // Loop through all keys in the schema                                                                               // 1104
  return _.any(self._schemaKeys, function(schemaKey) {                                                                 // 1105
                                                                                                                       // 1106
    // If the schema key is the test key, it's allowed.                                                                // 1107
    if (schemaKey === key) {                                                                                           // 1108
      return true;                                                                                                     // 1109
    }                                                                                                                  // 1110
                                                                                                                       // 1111
    // Black box handling                                                                                              // 1112
    if (self.schema(schemaKey).blackbox === true) {                                                                    // 1113
      var kl = schemaKey.length;                                                                                       // 1114
      var compare1 = key.slice(0, kl + 2);                                                                             // 1115
      var compare2 = compare1.slice(0, -1);                                                                            // 1116
                                                                                                                       // 1117
      // If the test key is the black box key + ".$", then the test                                                    // 1118
      // key is NOT allowed because black box keys are by definition                                                   // 1119
      // only for objects, and not for arrays.                                                                         // 1120
      if (compare1 === schemaKey + '.$') {                                                                             // 1121
        return false;                                                                                                  // 1122
      }                                                                                                                // 1123
                                                                                                                       // 1124
      // Otherwise                                                                                                     // 1125
      if (compare2 === schemaKey + '.') {                                                                              // 1126
        return true;                                                                                                   // 1127
      }                                                                                                                // 1128
    }                                                                                                                  // 1129
                                                                                                                       // 1130
    return false;                                                                                                      // 1131
  });                                                                                                                  // 1132
};                                                                                                                     // 1133
                                                                                                                       // 1134
SimpleSchema.prototype.newContext = function() {                                                                       // 1135
  return new SimpleSchemaValidationContext(this);                                                                      // 1136
};                                                                                                                     // 1137
                                                                                                                       // 1138
// Returns all the child keys for the object identified by the generic prefix,                                         // 1139
// or all the top level keys if no prefix is supplied.                                                                 // 1140
SimpleSchema.prototype.objectKeys = function(keyPrefix) {                                                              // 1141
  var self = this;                                                                                                     // 1142
  if (!keyPrefix) {                                                                                                    // 1143
    return self._firstLevelSchemaKeys;                                                                                 // 1144
  }                                                                                                                    // 1145
  return self._objectKeys[keyPrefix + "."] || [];                                                                      // 1146
};                                                                                                                     // 1147
                                                                                                                       // 1148
SimpleSchema.prototype.validate = function (obj, options) {                                                            // 1149
  if (Package.check && Package['audit-argument-checks']) {                                                             // 1150
    // Call check but ignore the error to silence audit-argument-checks                                                // 1151
    try { check(obj); } catch (e) { /* ignore error */ }                                                               // 1152
  }                                                                                                                    // 1153
                                                                                                                       // 1154
  var validationContext = this.newContext();                                                                           // 1155
  var isValid = validationContext.validate(obj, options);                                                              // 1156
                                                                                                                       // 1157
  if (isValid) return;                                                                                                 // 1158
                                                                                                                       // 1159
  var errors = validationContext.invalidKeys().map(function (error) {                                                  // 1160
    return {                                                                                                           // 1161
      name: error.name,                                                                                                // 1162
      type: error.type,                                                                                                // 1163
      details: {                                                                                                       // 1164
        value: error.value                                                                                             // 1165
      }                                                                                                                // 1166
    };                                                                                                                 // 1167
  });                                                                                                                  // 1168
                                                                                                                       // 1169
  // In order for the message at the top of the stack trace to be useful,                                              // 1170
  // we set it to the first validation error message.                                                                  // 1171
  var message = validationContext.keyErrorMessage(errors[0].name);                                                     // 1172
                                                                                                                       // 1173
  throw new Package['mdg:validation-error'].ValidationError(errors, message);                                          // 1174
};                                                                                                                     // 1175
                                                                                                                       // 1176
SimpleSchema.prototype.validator = function (options) {                                                                // 1177
  var self = this;                                                                                                     // 1178
  options = options || {};                                                                                             // 1179
  return function (obj) {                                                                                              // 1180
    if (options.clean === true) self.clean(obj, options);                                                              // 1181
    self.validate(obj);                                                                                                // 1182
  };                                                                                                                   // 1183
};                                                                                                                     // 1184
                                                                                                                       // 1185
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/simple-schema-validation.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global Utility */                                                                                                   // 1
/* global _ */                                                                                                         // 2
/* global SimpleSchema */                                                                                              // 3
/* global MongoObject */                                                                                               // 4
/* global doValidation1:true */                                                                                        // 5
                                                                                                                       // 6
function doTypeChecks(def, keyValue, op) {                                                                             // 7
  var expectedType = def.type;                                                                                         // 8
                                                                                                                       // 9
  // String checks                                                                                                     // 10
  if (expectedType === String) {                                                                                       // 11
    if (typeof keyValue !== "string") {                                                                                // 12
      return "expectedString";                                                                                         // 13
    } else if (def.max !== null && def.max < keyValue.length) {                                                        // 14
      return "maxString";                                                                                              // 15
    } else if (def.min !== null && def.min > keyValue.length) {                                                        // 16
      return "minString";                                                                                              // 17
    } else if (def.regEx instanceof RegExp && !def.regEx.test(keyValue)) {                                             // 18
      return "regEx";                                                                                                  // 19
    } else if (_.isArray(def.regEx)) {                                                                                 // 20
      var regExError;                                                                                                  // 21
      _.every(def.regEx, function(re, i) {                                                                             // 22
        if (!re.test(keyValue)) {                                                                                      // 23
          regExError = "regEx." + i;                                                                                   // 24
          return false;                                                                                                // 25
        }                                                                                                              // 26
        return true;                                                                                                   // 27
      });                                                                                                              // 28
      if (regExError) {                                                                                                // 29
        return regExError;                                                                                             // 30
      }                                                                                                                // 31
    }                                                                                                                  // 32
  }                                                                                                                    // 33
                                                                                                                       // 34
  // Number checks                                                                                                     // 35
  else if (expectedType === Number) {                                                                                  // 36
    if (typeof keyValue !== "number" || isNaN(keyValue)) {                                                             // 37
      return "expectedNumber";                                                                                         // 38
    } else if (op !== "$inc" && def.max !== null && (!!def.exclusiveMax ? def.max <= keyValue : def.max < keyValue)) {
       return !!def.exclusiveMax ? "maxNumberExclusive" : "maxNumber";                                                 // 40
    } else if (op !== "$inc" && def.min !== null && (!!def.exclusiveMin ? def.min >= keyValue : def.min > keyValue)) {
       return !!def.exclusiveMin ? "minNumberExclusive" : "minNumber";                                                 // 42
    } else if (!def.decimal && keyValue.toString().indexOf(".") > -1) {                                                // 43
      return "noDecimal";                                                                                              // 44
    }                                                                                                                  // 45
  }                                                                                                                    // 46
                                                                                                                       // 47
  // Boolean checks                                                                                                    // 48
  else if (expectedType === Boolean) {                                                                                 // 49
    if (typeof keyValue !== "boolean") {                                                                               // 50
      return "expectedBoolean";                                                                                        // 51
    }                                                                                                                  // 52
  }                                                                                                                    // 53
                                                                                                                       // 54
  // Object checks                                                                                                     // 55
  else if (expectedType === Object) {                                                                                  // 56
    if (!Utility.isBasicObject(keyValue)) {                                                                            // 57
      return "expectedObject";                                                                                         // 58
    }                                                                                                                  // 59
  }                                                                                                                    // 60
                                                                                                                       // 61
  // Array checks                                                                                                      // 62
  else if (expectedType === Array) {                                                                                   // 63
    if (!_.isArray(keyValue)) {                                                                                        // 64
      return "expectedArray";                                                                                          // 65
    } else if (def.minCount !== null && keyValue.length < def.minCount) {                                              // 66
      return "minCount";                                                                                               // 67
    } else if (def.maxCount !== null && keyValue.length > def.maxCount) {                                              // 68
      return "maxCount";                                                                                               // 69
    }                                                                                                                  // 70
  }                                                                                                                    // 71
                                                                                                                       // 72
  // Constructor function checks                                                                                       // 73
  else if (expectedType instanceof Function || Utility.safariBugFix(expectedType)) {                                   // 74
                                                                                                                       // 75
    // Generic constructor checks                                                                                      // 76
    if (!(keyValue instanceof expectedType)) {                                                                         // 77
      return "expectedConstructor";                                                                                    // 78
    }                                                                                                                  // 79
                                                                                                                       // 80
    // Date checks                                                                                                     // 81
    else if (expectedType === Date) {                                                                                  // 82
      if (isNaN(keyValue.getTime())) {                                                                                 // 83
        return "badDate";                                                                                              // 84
      }                                                                                                                // 85
                                                                                                                       // 86
      if (_.isDate(def.min) && def.min.getTime() > keyValue.getTime()) {                                               // 87
        return "minDate";                                                                                              // 88
      } else if (_.isDate(def.max) && def.max.getTime() < keyValue.getTime()) {                                        // 89
        return "maxDate";                                                                                              // 90
      }                                                                                                                // 91
    }                                                                                                                  // 92
  }                                                                                                                    // 93
                                                                                                                       // 94
}                                                                                                                      // 95
                                                                                                                       // 96
doValidation1 = function doValidation1(obj, isModifier, isUpsert, keyToValidate, ss, extendedCustomContext) {          // 97
  // First do some basic checks of the object, and throw errors if necessary                                           // 98
  if (!_.isObject(obj)) {                                                                                              // 99
    throw new Error("The first argument of validate() or validateOne() must be an object");                            // 100
  }                                                                                                                    // 101
                                                                                                                       // 102
  if (!isModifier && Utility.looksLikeModifier(obj)) {                                                                 // 103
    throw new Error("When the validation object contains mongo operators, you must set the modifier option to true");  // 104
  }                                                                                                                    // 105
                                                                                                                       // 106
  var invalidKeys = [];                                                                                                // 107
  var mDoc; // for caching the MongoObject if necessary                                                                // 108
                                                                                                                       // 109
  // Validation function called for each affected key                                                                  // 110
  function validate(val, affectedKey, affectedKeyGeneric, def, op, skipRequiredCheck, isInArrayItemObject, isInSubObject) {
                                                                                                                       // 112
    // Get the schema for this key, marking invalid if there isn't one.                                                // 113
    if (!def) {                                                                                                        // 114
      invalidKeys.push(Utility.errorObject("keyNotInSchema", affectedKey, val, def, ss));                              // 115
      return;                                                                                                          // 116
    }                                                                                                                  // 117
                                                                                                                       // 118
    // Check for missing required values. The general logic is this:                                                   // 119
    // * If the operator is $unset or $rename, it's invalid.                                                           // 120
    // * If the value is null, it's invalid.                                                                           // 121
    // * If the value is undefined and one of the following are true, it's invalid:                                    // 122
    //     * We're validating a key of a sub-object.                                                                   // 123
    //     * We're validating a key of an object that is an array item.                                                // 124
    //     * We're validating a document (as opposed to a modifier).                                                   // 125
    //     * We're validating a key under the $set operator in a modifier, and it's an upsert.                         // 126
    if (!skipRequiredCheck && !def.optional) {                                                                         // 127
      if (                                                                                                             // 128
        val === null ||                                                                                                // 129
        op === "$unset" ||                                                                                             // 130
        op === "$rename" ||                                                                                            // 131
        (val === void 0 && (isInArrayItemObject || isInSubObject || !op || op === "$set"))                             // 132
        ) {                                                                                                            // 133
        invalidKeys.push(Utility.errorObject("required", affectedKey, null, def, ss));                                 // 134
        return;                                                                                                        // 135
      }                                                                                                                // 136
    }                                                                                                                  // 137
                                                                                                                       // 138
    // For $rename, make sure that the new name is allowed by the schema                                               // 139
    if (op === "$rename" && typeof val === "string" && !ss.allowsKey(val)) {                                           // 140
      invalidKeys.push(Utility.errorObject("keyNotInSchema", val, null, null, ss));                                    // 141
      return;                                                                                                          // 142
    }                                                                                                                  // 143
                                                                                                                       // 144
    // Value checks are not necessary for null or undefined values                                                     // 145
    // or for $unset or $rename values                                                                                 // 146
    if (op !== "$unset" && op !== "$rename" && Utility.isNotNullOrUndefined(val)) {                                    // 147
                                                                                                                       // 148
      // Check that value is of the correct type                                                                       // 149
      var typeError = doTypeChecks(def, val, op);                                                                      // 150
      if (typeError) {                                                                                                 // 151
        invalidKeys.push(Utility.errorObject(typeError, affectedKey, val, def, ss));                                   // 152
        return;                                                                                                        // 153
      }                                                                                                                // 154
                                                                                                                       // 155
      // Check value against allowedValues array                                                                       // 156
      if (def.allowedValues && !_.contains(def.allowedValues, val)) {                                                  // 157
        invalidKeys.push(Utility.errorObject("notAllowed", affectedKey, val, def, ss));                                // 158
        return;                                                                                                        // 159
      }                                                                                                                // 160
                                                                                                                       // 161
    }                                                                                                                  // 162
                                                                                                                       // 163
    // Perform custom validation                                                                                       // 164
    var lastDot = affectedKey.lastIndexOf('.');                                                                        // 165
    var fieldParentName = lastDot === -1 ? '' : affectedKey.slice(0, lastDot + 1);                                     // 166
    var validators = def.custom ? [def.custom] : [];                                                                   // 167
    validators = validators.concat(ss._validators).concat(SimpleSchema._validators);                                   // 168
    _.every(validators, function(validator) {                                                                          // 169
      var errorType = validator.call(_.extend({                                                                        // 170
        key: affectedKey,                                                                                              // 171
        genericKey: affectedKeyGeneric,                                                                                // 172
        definition: def,                                                                                               // 173
        isSet: (val !== void 0),                                                                                       // 174
        value: val,                                                                                                    // 175
        operator: op,                                                                                                  // 176
        field: function(fName) {                                                                                       // 177
          mDoc = mDoc || new MongoObject(obj, ss._blackboxKeys); //create if necessary, cache for speed                // 178
          var keyInfo = mDoc.getInfoForKey(fName) || {};                                                               // 179
          return {                                                                                                     // 180
            isSet: (keyInfo.value !== void 0),                                                                         // 181
            value: keyInfo.value,                                                                                      // 182
            operator: keyInfo.operator                                                                                 // 183
          };                                                                                                           // 184
        },                                                                                                             // 185
        siblingField: function(fName) {                                                                                // 186
          mDoc = mDoc || new MongoObject(obj, ss._blackboxKeys); //create if necessary, cache for speed                // 187
          var keyInfo = mDoc.getInfoForKey(fieldParentName + fName) || {};                                             // 188
          return {                                                                                                     // 189
            isSet: (keyInfo.value !== void 0),                                                                         // 190
            value: keyInfo.value,                                                                                      // 191
            operator: keyInfo.operator                                                                                 // 192
          };                                                                                                           // 193
        }                                                                                                              // 194
      }, extendedCustomContext || {}));                                                                                // 195
      if (typeof errorType === "string") {                                                                             // 196
        invalidKeys.push(Utility.errorObject(errorType, affectedKey, val, def, ss));                                   // 197
        return false;                                                                                                  // 198
      }                                                                                                                // 199
      return true;                                                                                                     // 200
    });                                                                                                                // 201
  }                                                                                                                    // 202
                                                                                                                       // 203
  // The recursive function                                                                                            // 204
  function checkObj(val, affectedKey, operator, setKeys, isInArrayItemObject, isInSubObject) {                         // 205
    var affectedKeyGeneric, def;                                                                                       // 206
                                                                                                                       // 207
    if (affectedKey) {                                                                                                 // 208
      // When we hit a blackbox key, we don't progress any further                                                     // 209
      if (ss.keyIsInBlackBox(affectedKey)) {                                                                           // 210
        return;                                                                                                        // 211
      }                                                                                                                // 212
                                                                                                                       // 213
      // Make a generic version of the affected key, and use that                                                      // 214
      // to get the schema for this key.                                                                               // 215
      affectedKeyGeneric = SimpleSchema._makeGeneric(affectedKey);                                                     // 216
      def = ss.getDefinition(affectedKey);                                                                             // 217
                                                                                                                       // 218
      // Perform validation for this key                                                                               // 219
      if (!keyToValidate || keyToValidate === affectedKey || keyToValidate === affectedKeyGeneric) {                   // 220
        // We can skip the required check for keys that are ancestors                                                  // 221
        // of those in $set or $setOnInsert because they will be created                                               // 222
        // by MongoDB while setting.                                                                                   // 223
        var skipRequiredCheck = _.some(setKeys, function(sk) {                                                         // 224
          return (sk.slice(0, affectedKey.length + 1) === affectedKey + ".");                                          // 225
        });                                                                                                            // 226
        validate(val, affectedKey, affectedKeyGeneric, def, operator, skipRequiredCheck, isInArrayItemObject, isInSubObject);
      }                                                                                                                // 228
    }                                                                                                                  // 229
                                                                                                                       // 230
    // Temporarily convert missing objects to empty objects                                                            // 231
    // so that the looping code will be called and required                                                            // 232
    // descendent keys can be validated.                                                                               // 233
    if ((val === void 0 || val === null) && (!def || (def.type === Object && !def.optional))) {                        // 234
      val = {};                                                                                                        // 235
    }                                                                                                                  // 236
                                                                                                                       // 237
    // Loop through arrays                                                                                             // 238
    if (_.isArray(val)) {                                                                                              // 239
      _.each(val, function(v, i) {                                                                                     // 240
        checkObj(v, affectedKey + '.' + i, operator, setKeys);                                                         // 241
      });                                                                                                              // 242
    }                                                                                                                  // 243
                                                                                                                       // 244
    // Loop through object keys                                                                                        // 245
    else if (Utility.isBasicObject(val) && (!def || !def.blackbox)) {                                                  // 246
                                                                                                                       // 247
      // Get list of present keys                                                                                      // 248
      var presentKeys = _.keys(val);                                                                                   // 249
                                                                                                                       // 250
      // Check all present keys plus all keys defined by the schema.                                                   // 251
      // This allows us to detect extra keys not allowed by the schema plus                                            // 252
      // any missing required keys, and to run any custom functions for other keys.                                    // 253
      var keysToCheck = _.union(presentKeys, ss.objectKeys(affectedKeyGeneric));                                       // 254
                                                                                                                       // 255
      // If this object is within an array, make sure we check for                                                     // 256
      // required as if it's not a modifier                                                                            // 257
      isInArrayItemObject = (affectedKeyGeneric && affectedKeyGeneric.slice(-2) === ".$");                             // 258
                                                                                                                       // 259
      // Check all keys in the merged list                                                                             // 260
      _.each(keysToCheck, function(key) {                                                                              // 261
        checkObj(val[key], Utility.appendAffectedKey(affectedKey, key), operator, setKeys, isInArrayItemObject, true);
      });                                                                                                              // 263
    }                                                                                                                  // 264
                                                                                                                       // 265
  }                                                                                                                    // 266
                                                                                                                       // 267
  function checkModifier(mod) {                                                                                        // 268
    // Check for empty modifier                                                                                        // 269
    if (_.isEmpty(mod)) {                                                                                              // 270
      throw new Error("When the modifier option is true, validation object must have at least one operator");          // 271
    }                                                                                                                  // 272
                                                                                                                       // 273
    // Get a list of all keys in $set and $setOnInsert combined, for use later                                         // 274
    var setKeys = _.keys(mod.$set || {}).concat(_.keys(mod.$setOnInsert || {}));                                       // 275
                                                                                                                       // 276
    // If this is an upsert, add all the $setOnInsert keys to $set;                                                    // 277
    // since we don't know whether it will be an insert or update, we'll                                               // 278
    // validate upserts as if they will be an insert.                                                                  // 279
    if ("$setOnInsert" in mod) {                                                                                       // 280
      if (isUpsert) {                                                                                                  // 281
        mod.$set = mod.$set || {};                                                                                     // 282
        mod.$set = _.extend(mod.$set, mod.$setOnInsert);                                                               // 283
      }                                                                                                                // 284
      delete mod.$setOnInsert;                                                                                         // 285
    }                                                                                                                  // 286
                                                                                                                       // 287
    // Loop through operators                                                                                          // 288
    _.each(mod, function (opObj, op) {                                                                                 // 289
      // If non-operators are mixed in, throw error                                                                    // 290
      if (op.slice(0, 1) !== "$") {                                                                                    // 291
        throw new Error("When the modifier option is true, all validation object keys must be operators. Did you forget `$set`?");
      }                                                                                                                // 293
      if (Utility.shouldCheck(op)) {                                                                                   // 294
        // For an upsert, missing props would not be set if an insert is performed,                                    // 295
        // so we add null keys to the modifier to force any "required" checks to fail                                  // 296
        if (isUpsert && op === "$set") {                                                                               // 297
          var presentKeys = _.keys(opObj);                                                                             // 298
          _.each(ss.objectKeys(), function (schemaKey) {                                                               // 299
            if (!_.contains(presentKeys, schemaKey)) {                                                                 // 300
              checkObj(void 0, schemaKey, op, setKeys);                                                                // 301
            }                                                                                                          // 302
          });                                                                                                          // 303
        }                                                                                                              // 304
        _.each(opObj, function (v, k) {                                                                                // 305
          if (op === "$push" || op === "$addToSet") {                                                                  // 306
            if (Utility.isBasicObject(v) && "$each" in v) {                                                            // 307
              v = v.$each;                                                                                             // 308
            } else {                                                                                                   // 309
              k = k + ".0";                                                                                            // 310
            }                                                                                                          // 311
          }                                                                                                            // 312
          checkObj(v, k, op, setKeys);                                                                                 // 313
        });                                                                                                            // 314
      }                                                                                                                // 315
    });                                                                                                                // 316
  }                                                                                                                    // 317
                                                                                                                       // 318
  // Kick off the validation                                                                                           // 319
  if (isModifier) {                                                                                                    // 320
    checkModifier(obj);                                                                                                // 321
  } else {                                                                                                             // 322
    checkObj(obj);                                                                                                     // 323
  }                                                                                                                    // 324
                                                                                                                       // 325
  // Make sure there is only one error per fieldName                                                                   // 326
  var addedFieldNames = [];                                                                                            // 327
  invalidKeys = _.filter(invalidKeys, function(errObj) {                                                               // 328
    if (!_.contains(addedFieldNames, errObj.name)) {                                                                   // 329
      addedFieldNames.push(errObj.name);                                                                               // 330
      return true;                                                                                                     // 331
    }                                                                                                                  // 332
    return false;                                                                                                      // 333
  });                                                                                                                  // 334
                                                                                                                       // 335
  return invalidKeys;                                                                                                  // 336
};                                                                                                                     // 337
                                                                                                                       // 338
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/simple-schema-validation-new.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global Utility */                                                                                                   // 1
/* global _ */                                                                                                         // 2
/* global SimpleSchema */                                                                                              // 3
/* global MongoObject */                                                                                               // 4
/* global Meteor */                                                                                                    // 5
/* global Random */                                                                                                    // 6
/* global doValidation2:true */                                                                                        // 7
                                                                                                                       // 8
function doTypeChecks(def, keyValue, op) {                                                                             // 9
  var expectedType = def.type;                                                                                         // 10
                                                                                                                       // 11
  // String checks                                                                                                     // 12
  if (expectedType === String) {                                                                                       // 13
    if (typeof keyValue !== "string") {                                                                                // 14
      return "expectedString";                                                                                         // 15
    } else if (def.max !== null && def.max < keyValue.length) {                                                        // 16
      return "maxString";                                                                                              // 17
    } else if (def.min !== null && def.min > keyValue.length) {                                                        // 18
      return "minString";                                                                                              // 19
    } else if (def.regEx instanceof RegExp && !def.regEx.test(keyValue)) {                                             // 20
      return "regEx";                                                                                                  // 21
    } else if (_.isArray(def.regEx)) {                                                                                 // 22
      var regExError;                                                                                                  // 23
      _.every(def.regEx, function(re, i) {                                                                             // 24
        if (!re.test(keyValue)) {                                                                                      // 25
          regExError = "regEx." + i;                                                                                   // 26
          return false;                                                                                                // 27
        }                                                                                                              // 28
        return true;                                                                                                   // 29
      });                                                                                                              // 30
      if (regExError) {                                                                                                // 31
        return regExError;                                                                                             // 32
      }                                                                                                                // 33
    }                                                                                                                  // 34
  }                                                                                                                    // 35
                                                                                                                       // 36
  // Number checks                                                                                                     // 37
  else if (expectedType === Number) {                                                                                  // 38
    if (typeof keyValue !== "number" || isNaN(keyValue)) {                                                             // 39
      return "expectedNumber";                                                                                         // 40
    } else if (op !== "$inc" && def.max !== null && (!!def.exclusiveMax ? def.max <= keyValue : def.max < keyValue)) {
       return !!def.exclusiveMax ? "maxNumberExclusive" : "maxNumber";                                                 // 42
    } else if (op !== "$inc" && def.min !== null && (!!def.exclusiveMin ? def.min >= keyValue : def.min > keyValue)) {
       return !!def.exclusiveMin ? "minNumberExclusive" : "minNumber";                                                 // 44
    } else if (!def.decimal && keyValue.toString().indexOf(".") > -1) {                                                // 45
      return "noDecimal";                                                                                              // 46
    }                                                                                                                  // 47
  }                                                                                                                    // 48
                                                                                                                       // 49
  // Boolean checks                                                                                                    // 50
  else if (expectedType === Boolean) {                                                                                 // 51
    if (typeof keyValue !== "boolean") {                                                                               // 52
      return "expectedBoolean";                                                                                        // 53
    }                                                                                                                  // 54
  }                                                                                                                    // 55
                                                                                                                       // 56
  // Object checks                                                                                                     // 57
  else if (expectedType === Object) {                                                                                  // 58
    if (!Utility.isBasicObject(keyValue)) {                                                                            // 59
      return "expectedObject";                                                                                         // 60
    }                                                                                                                  // 61
  }                                                                                                                    // 62
                                                                                                                       // 63
  // Array checks                                                                                                      // 64
  else if (expectedType === Array) {                                                                                   // 65
    if (!_.isArray(keyValue)) {                                                                                        // 66
      return "expectedArray";                                                                                          // 67
    } else if (def.minCount !== null && keyValue.length < def.minCount) {                                              // 68
      return "minCount";                                                                                               // 69
    } else if (def.maxCount !== null && keyValue.length > def.maxCount) {                                              // 70
      return "maxCount";                                                                                               // 71
    }                                                                                                                  // 72
  }                                                                                                                    // 73
                                                                                                                       // 74
  // Constructor function checks                                                                                       // 75
  else if (expectedType instanceof Function || Utility.safariBugFix(expectedType)) {                                   // 76
                                                                                                                       // 77
    // Generic constructor checks                                                                                      // 78
    if (!(keyValue instanceof expectedType)) {                                                                         // 79
      return "expectedConstructor";                                                                                    // 80
    }                                                                                                                  // 81
                                                                                                                       // 82
    // Date checks                                                                                                     // 83
    else if (expectedType === Date) {                                                                                  // 84
      if (isNaN(keyValue.getTime())) {                                                                                 // 85
        return "badDate";                                                                                              // 86
      }                                                                                                                // 87
                                                                                                                       // 88
      if (_.isDate(def.min) && def.min.getTime() > keyValue.getTime()) {                                               // 89
        return "minDate";                                                                                              // 90
      } else if (_.isDate(def.max) && def.max.getTime() < keyValue.getTime()) {                                        // 91
        return "maxDate";                                                                                              // 92
      }                                                                                                                // 93
    }                                                                                                                  // 94
  }                                                                                                                    // 95
                                                                                                                       // 96
}                                                                                                                      // 97
                                                                                                                       // 98
doValidation2 = function doValidation2(obj, isModifier, isUpsert, keyToValidate, ss, extendedCustomContext) {          // 99
                                                                                                                       // 100
  // First do some basic checks of the object, and throw errors if necessary                                           // 101
  if (!_.isObject(obj)) {                                                                                              // 102
    throw new Error("The first argument of validate() or validateOne() must be an object");                            // 103
  }                                                                                                                    // 104
                                                                                                                       // 105
  if (isModifier) {                                                                                                    // 106
    if (_.isEmpty(obj)) {                                                                                              // 107
      throw new Error("When the modifier option is true, validation object must have at least one operator");          // 108
    } else {                                                                                                           // 109
      var allKeysAreOperators = _.every(obj, function(v, k) {                                                          // 110
        return (k.substring(0, 1) === "$");                                                                            // 111
      });                                                                                                              // 112
      if (!allKeysAreOperators) {                                                                                      // 113
        throw new Error("When the modifier option is true, all validation object keys must be operators");             // 114
      }                                                                                                                // 115
                                                                                                                       // 116
      // We use a LocalCollection to figure out what the resulting doc                                                 // 117
      // would be in a worst case scenario. Then we validate that doc                                                  // 118
      // so that we don't have to validate the modifier object directly.                                               // 119
      obj = convertModifierToDoc(obj, ss.schema(), isUpsert);                                                          // 120
    }                                                                                                                  // 121
  } else if (Utility.looksLikeModifier(obj)) {                                                                         // 122
    throw new Error("When the validation object contains mongo operators, you must set the modifier option to true");  // 123
  }                                                                                                                    // 124
                                                                                                                       // 125
  var invalidKeys = [];                                                                                                // 126
  var mDoc; // for caching the MongoObject if necessary                                                                // 127
                                                                                                                       // 128
  // Validation function called for each affected key                                                                  // 129
  function validate(val, affectedKey, affectedKeyGeneric, def, op, skipRequiredCheck, strictRequiredCheck) {           // 130
                                                                                                                       // 131
    // Get the schema for this key, marking invalid if there isn't one.                                                // 132
    if (!def) {                                                                                                        // 133
      invalidKeys.push(Utility.errorObject("keyNotInSchema", affectedKey, val, def, ss));                              // 134
      return;                                                                                                          // 135
    }                                                                                                                  // 136
                                                                                                                       // 137
    // Check for missing required values. The general logic is this:                                                   // 138
    // * If the operator is $unset or $rename, it's invalid.                                                           // 139
    // * If the value is null, it's invalid.                                                                           // 140
    // * If the value is undefined and one of the following are true, it's invalid:                                    // 141
    //     * We're validating a key of a sub-object.                                                                   // 142
    //     * We're validating a key of an object that is an array item.                                                // 143
    //     * We're validating a document (as opposed to a modifier).                                                   // 144
    //     * We're validating a key under the $set operator in a modifier, and it's an upsert.                         // 145
    if (!skipRequiredCheck && !def.optional) {                                                                         // 146
      if (val === null || val === void 0) {                                                                            // 147
        invalidKeys.push(Utility.errorObject("required", affectedKey, null, def, ss));                                 // 148
        return;                                                                                                        // 149
      }                                                                                                                // 150
    }                                                                                                                  // 151
                                                                                                                       // 152
    // Value checks are not necessary for null or undefined values                                                     // 153
    if (Utility.isNotNullOrUndefined(val)) {                                                                           // 154
                                                                                                                       // 155
      // Check that value is of the correct type                                                                       // 156
      var typeError = doTypeChecks(def, val, op);                                                                      // 157
      if (typeError) {                                                                                                 // 158
        invalidKeys.push(Utility.errorObject(typeError, affectedKey, val, def, ss));                                   // 159
        return;                                                                                                        // 160
      }                                                                                                                // 161
                                                                                                                       // 162
      // Check value against allowedValues array                                                                       // 163
      if (def.allowedValues && !_.contains(def.allowedValues, val)) {                                                  // 164
        invalidKeys.push(Utility.errorObject("notAllowed", affectedKey, val, def, ss));                                // 165
        return;                                                                                                        // 166
      }                                                                                                                // 167
                                                                                                                       // 168
    }                                                                                                                  // 169
                                                                                                                       // 170
    // Perform custom validation                                                                                       // 171
    var lastDot = affectedKey.lastIndexOf('.');                                                                        // 172
    var fieldParentName = lastDot === -1 ? '' : affectedKey.slice(0, lastDot + 1);                                     // 173
    var validators = def.custom ? [def.custom] : [];                                                                   // 174
    validators = validators.concat(ss._validators).concat(SimpleSchema._validators);                                   // 175
    _.every(validators, function(validator) {                                                                          // 176
      var errorType = validator.call(_.extend({                                                                        // 177
        key: affectedKey,                                                                                              // 178
        genericKey: affectedKeyGeneric,                                                                                // 179
        definition: def,                                                                                               // 180
        isSet: (val !== void 0),                                                                                       // 181
        value: val,                                                                                                    // 182
        operator: op,                                                                                                  // 183
        field: function(fName) {                                                                                       // 184
          mDoc = mDoc || new MongoObject(obj, ss._blackboxKeys); //create if necessary, cache for speed                // 185
          var keyInfo = mDoc.getInfoForKey(fName) || {};                                                               // 186
          return {                                                                                                     // 187
            isSet: (keyInfo.value !== void 0),                                                                         // 188
            value: keyInfo.value,                                                                                      // 189
            operator: keyInfo.operator                                                                                 // 190
          };                                                                                                           // 191
        },                                                                                                             // 192
        siblingField: function(fName) {                                                                                // 193
          mDoc = mDoc || new MongoObject(obj, ss._blackboxKeys); //create if necessary, cache for speed                // 194
          var keyInfo = mDoc.getInfoForKey(fieldParentName + fName) || {};                                             // 195
          return {                                                                                                     // 196
            isSet: (keyInfo.value !== void 0),                                                                         // 197
            value: keyInfo.value,                                                                                      // 198
            operator: keyInfo.operator                                                                                 // 199
          };                                                                                                           // 200
        }                                                                                                              // 201
      }, extendedCustomContext || {}));                                                                                // 202
      if (typeof errorType === "string") {                                                                             // 203
        invalidKeys.push(Utility.errorObject(errorType, affectedKey, val, def, ss));                                   // 204
        return false;                                                                                                  // 205
      }                                                                                                                // 206
      return true;                                                                                                     // 207
    });                                                                                                                // 208
  }                                                                                                                    // 209
                                                                                                                       // 210
  // The recursive function                                                                                            // 211
  function checkObj(val, affectedKey, skipRequiredCheck, strictRequiredCheck) {                                        // 212
    var affectedKeyGeneric, def;                                                                                       // 213
                                                                                                                       // 214
    if (affectedKey) {                                                                                                 // 215
                                                                                                                       // 216
      // When we hit a blackbox key, we don't progress any further                                                     // 217
      if (ss.keyIsInBlackBox(affectedKey)) {                                                                           // 218
        return;                                                                                                        // 219
      }                                                                                                                // 220
                                                                                                                       // 221
      // Make a generic version of the affected key, and use that                                                      // 222
      // to get the schema for this key.                                                                               // 223
      affectedKeyGeneric = SimpleSchema._makeGeneric(affectedKey);                                                     // 224
      def = ss.getDefinition(affectedKey);                                                                             // 225
                                                                                                                       // 226
      // Perform validation for this key                                                                               // 227
      if (!keyToValidate || keyToValidate === affectedKey || keyToValidate === affectedKeyGeneric) {                   // 228
        validate(val, affectedKey, affectedKeyGeneric, def, null, skipRequiredCheck, strictRequiredCheck);             // 229
      }                                                                                                                // 230
    }                                                                                                                  // 231
                                                                                                                       // 232
    // Temporarily convert missing objects to empty objects                                                            // 233
    // so that the looping code will be called and required                                                            // 234
    // descendent keys can be validated.                                                                               // 235
    if ((val === void 0 || val === null) && (!def || (def.type === Object && !def.optional))) {                        // 236
      val = {};                                                                                                        // 237
    }                                                                                                                  // 238
                                                                                                                       // 239
    // Loop through arrays                                                                                             // 240
    if (_.isArray(val)) {                                                                                              // 241
      _.each(val, function(v, i) {                                                                                     // 242
        checkObj(v, affectedKey + '.' + i);                                                                            // 243
      });                                                                                                              // 244
    }                                                                                                                  // 245
                                                                                                                       // 246
    // Loop through object keys                                                                                        // 247
    else if (Utility.isBasicObject(val) && (!def || !def.blackbox)) {                                                  // 248
                                                                                                                       // 249
      // Get list of present keys                                                                                      // 250
      var presentKeys = _.keys(val);                                                                                   // 251
                                                                                                                       // 252
      // Check all present keys plus all keys defined by the schema.                                                   // 253
      // This allows us to detect extra keys not allowed by the schema plus                                            // 254
      // any missing required keys, and to run any custom functions for other keys.                                    // 255
      var keysToCheck = _.union(presentKeys, ss._schemaKeys);                                                          // 256
                                                                                                                       // 257
      // If this object is within an array, make sure we check for                                                     // 258
      // required as if it's not a modifier                                                                            // 259
      strictRequiredCheck = (affectedKeyGeneric && affectedKeyGeneric.slice(-2) === ".$");                             // 260
                                                                                                                       // 261
      // Check all keys in the merged list                                                                             // 262
      _.each(keysToCheck, function(key) {                                                                              // 263
        if (Utility.shouldCheck(key)) {                                                                                // 264
          checkObj(val[key], Utility.appendAffectedKey(affectedKey, key), skipRequiredCheck, strictRequiredCheck);     // 265
        }                                                                                                              // 266
      });                                                                                                              // 267
    }                                                                                                                  // 268
                                                                                                                       // 269
  }                                                                                                                    // 270
                                                                                                                       // 271
  // Kick off the validation                                                                                           // 272
  checkObj(obj);                                                                                                       // 273
                                                                                                                       // 274
  // Make sure there is only one error per fieldName                                                                   // 275
  var addedFieldNames = [];                                                                                            // 276
  invalidKeys = _.filter(invalidKeys, function(errObj) {                                                               // 277
    if (!_.contains(addedFieldNames, errObj.name)) {                                                                   // 278
      addedFieldNames.push(errObj.name);                                                                               // 279
      return true;                                                                                                     // 280
    }                                                                                                                  // 281
    return false;                                                                                                      // 282
  });                                                                                                                  // 283
                                                                                                                       // 284
  return invalidKeys;                                                                                                  // 285
};                                                                                                                     // 286
                                                                                                                       // 287
function convertModifierToDoc(mod, schema, isUpsert) {                                                                 // 288
  // Create unmanaged LocalCollection as scratchpad                                                                    // 289
  var t = new Meteor.Collection(null);                                                                                 // 290
                                                                                                                       // 291
  // LocalCollections are in memory, and it seems                                                                      // 292
  // that it's fine to use them synchronously on                                                                       // 293
  // either client or server                                                                                           // 294
  var id;                                                                                                              // 295
  if (isUpsert) {                                                                                                      // 296
    // We assume upserts will be inserts (conservative                                                                 // 297
    // validation of requiredness)                                                                                     // 298
    id = Random.id();                                                                                                  // 299
    t.upsert({_id: id}, mod);                                                                                          // 300
  } else {                                                                                                             // 301
    var mDoc = new MongoObject(mod);                                                                                   // 302
    // Create a ficticious existing document                                                                           // 303
    var fakeDoc = new MongoObject({});                                                                                 // 304
    _.each(schema, function (def, fieldName) {                                                                         // 305
      var setVal;                                                                                                      // 306
      // Prefill doc with empty arrays to avoid the                                                                    // 307
      // mongodb issue where it does not understand                                                                    // 308
      // that numeric pieces should create arrays.                                                                     // 309
      if (def.type === Array && mDoc.affectsGenericKey(fieldName)) {                                                   // 310
        setVal = [];                                                                                                   // 311
      }                                                                                                                // 312
      // Set dummy values for required fields because                                                                  // 313
      // we assume any existing data would be valid.                                                                   // 314
      else if (!def.optional) {                                                                                        // 315
        // TODO correct value type based on schema type                                                                // 316
        if (def.type === Boolean) {                                                                                    // 317
          setVal = true;                                                                                               // 318
        } else if (def.type === Number) {                                                                              // 319
          setVal = def.min || 0;                                                                                       // 320
        } else if (def.type === Date) {                                                                                // 321
          setVal = def.min || new Date();                                                                              // 322
        } else if (def.type === Array) {                                                                               // 323
          setVal = [];                                                                                                 // 324
        } else if (def.type === Object) {                                                                              // 325
          setVal = {};                                                                                                 // 326
        } else {                                                                                                       // 327
          setVal = "0";                                                                                                // 328
        }                                                                                                              // 329
      }                                                                                                                // 330
                                                                                                                       // 331
      if (setVal !== void 0) {                                                                                         // 332
        var key = fieldName.replace(/\.\$/g, ".0");                                                                    // 333
        var pos = MongoObject._keyToPosition(key, false);                                                              // 334
        fakeDoc.setValueForPosition(pos, setVal);                                                                      // 335
      }                                                                                                                // 336
    });                                                                                                                // 337
    fakeDoc = fakeDoc.getObject();                                                                                     // 338
    // Insert fake doc into local scratch collection                                                                   // 339
    id = t.insert(fakeDoc);                                                                                            // 340
    // Now update it with the modifier                                                                                 // 341
    t.update(id, mod);                                                                                                 // 342
  }                                                                                                                    // 343
                                                                                                                       // 344
  var doc = t.findOne(id);                                                                                             // 345
  // We're done with it                                                                                                // 346
  t.remove(id);                                                                                                        // 347
  // Currently we don't validate _id unless it is                                                                      // 348
  // explicitly added to the schema                                                                                    // 349
  if (!schema._id) {                                                                                                   // 350
    delete doc._id;                                                                                                    // 351
  }                                                                                                                    // 352
  return doc;                                                                                                          // 353
}                                                                                                                      // 354
                                                                                                                       // 355
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/simple-schema-context.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global SimpleSchema */                                                                                              // 1
/* global SimpleSchemaValidationContext:true */                                                                        // 2
/* global doValidation1 */                                                                                             // 3
/* global doValidation2 */                                                                                             // 4
                                                                                                                       // 5
function doValidation(obj, isModifier, isUpsert, keyToValidate, ss, extendedCustomContext) {                           // 6
  var useOld = true; //for now this can be manually changed to try the experimental method, which doesn't yet work properly
  var func = useOld ? doValidation1 : doValidation2;                                                                   // 8
  return func(obj, isModifier, isUpsert, keyToValidate, ss, extendedCustomContext);                                    // 9
}                                                                                                                      // 10
                                                                                                                       // 11
/*                                                                                                                     // 12
 * PUBLIC API                                                                                                          // 13
 */                                                                                                                    // 14
                                                                                                                       // 15
SimpleSchemaValidationContext = function SimpleSchemaValidationContext(ss) {                                           // 16
  var self = this;                                                                                                     // 17
  self._simpleSchema = ss;                                                                                             // 18
  self._schema = ss.schema();                                                                                          // 19
  self._schemaKeys = _.keys(self._schema);                                                                             // 20
  self._invalidKeys = [];                                                                                              // 21
  //set up validation dependencies                                                                                     // 22
  self._deps = {};                                                                                                     // 23
  self._depsAny = new Deps.Dependency();                                                                               // 24
  _.each(self._schemaKeys, function(name) {                                                                            // 25
    self._deps[name] = new Deps.Dependency();                                                                          // 26
  });                                                                                                                  // 27
};                                                                                                                     // 28
                                                                                                                       // 29
//validates the object against the simple schema and sets a reactive array of error objects                            // 30
SimpleSchemaValidationContext.prototype.validate = function simpleSchemaValidationContextValidate(doc, options) {      // 31
  var self = this;                                                                                                     // 32
  options = _.extend({                                                                                                 // 33
    modifier: false,                                                                                                   // 34
    upsert: false,                                                                                                     // 35
    extendedCustomContext: {}                                                                                          // 36
  }, options || {});                                                                                                   // 37
                                                                                                                       // 38
  //on the client we can add the userId if not already in the custom context                                           // 39
  if (Meteor.isClient && options.extendedCustomContext.userId === void 0) {                                            // 40
    options.extendedCustomContext.userId = (Meteor.userId && Meteor.userId()) || null;                                 // 41
  }                                                                                                                    // 42
                                                                                                                       // 43
  var invalidKeys = doValidation(doc, options.modifier, options.upsert, null, self._simpleSchema, options.extendedCustomContext);
                                                                                                                       // 45
  //now update self._invalidKeys and dependencies                                                                      // 46
                                                                                                                       // 47
  //note any currently invalid keys so that we can mark them as changed                                                // 48
  //due to new validation (they may be valid now, or invalid in a different way)                                       // 49
  var removedKeys = _.pluck(self._invalidKeys, "name");                                                                // 50
                                                                                                                       // 51
  //update                                                                                                             // 52
  self._invalidKeys = invalidKeys;                                                                                     // 53
                                                                                                                       // 54
  //add newly invalid keys to changedKeys                                                                              // 55
  var addedKeys = _.pluck(self._invalidKeys, "name");                                                                  // 56
                                                                                                                       // 57
  //mark all changed keys as changed                                                                                   // 58
  var changedKeys = _.union(addedKeys, removedKeys);                                                                   // 59
  self._markKeysChanged(changedKeys);                                                                                  // 60
                                                                                                                       // 61
  // Return true if it was valid; otherwise, return false                                                              // 62
  return self._invalidKeys.length === 0;                                                                               // 63
};                                                                                                                     // 64
                                                                                                                       // 65
//validates doc against self._schema for one key and sets a reactive array of error objects                            // 66
SimpleSchemaValidationContext.prototype.validateOne = function simpleSchemaValidationContextValidateOne(doc, keyName, options) {
  var self = this, i, ln, k;                                                                                           // 68
  options = _.extend({                                                                                                 // 69
    modifier: false,                                                                                                   // 70
    upsert: false,                                                                                                     // 71
    extendedCustomContext: {}                                                                                          // 72
  }, options || {});                                                                                                   // 73
                                                                                                                       // 74
  //on the client we can add the userId if not already in the custom context                                           // 75
  if (Meteor.isClient && options.extendedCustomContext.userId === void 0) {                                            // 76
    options.extendedCustomContext.userId = (Meteor.userId && Meteor.userId()) || null;                                 // 77
  }                                                                                                                    // 78
                                                                                                                       // 79
  var invalidKeys = doValidation(doc, options.modifier, options.upsert, keyName, self._simpleSchema, options.extendedCustomContext);
                                                                                                                       // 81
  //now update self._invalidKeys and dependencies                                                                      // 82
                                                                                                                       // 83
  //remove objects from self._invalidKeys where name = keyName                                                         // 84
  var newInvalidKeys = [];                                                                                             // 85
  for (i = 0, ln = self._invalidKeys.length; i < ln; i++) {                                                            // 86
    k = self._invalidKeys[i];                                                                                          // 87
    if (k.name !== keyName) {                                                                                          // 88
      newInvalidKeys.push(k);                                                                                          // 89
    }                                                                                                                  // 90
  }                                                                                                                    // 91
  self._invalidKeys = newInvalidKeys;                                                                                  // 92
                                                                                                                       // 93
  //merge invalidKeys into self._invalidKeys                                                                           // 94
  for (i = 0, ln = invalidKeys.length; i < ln; i++) {                                                                  // 95
    k = invalidKeys[i];                                                                                                // 96
    self._invalidKeys.push(k);                                                                                         // 97
  }                                                                                                                    // 98
                                                                                                                       // 99
  //mark key as changed due to new validation (they may be valid now, or invalid in a different way)                   // 100
  self._markKeysChanged([keyName]);                                                                                    // 101
                                                                                                                       // 102
  // Return true if it was valid; otherwise, return false                                                              // 103
  return !self._keyIsInvalid(keyName);                                                                                 // 104
};                                                                                                                     // 105
                                                                                                                       // 106
//reset the invalidKeys array                                                                                          // 107
SimpleSchemaValidationContext.prototype.resetValidation = function simpleSchemaValidationContextResetValidation() {    // 108
  var self = this;                                                                                                     // 109
  var removedKeys = _.pluck(self._invalidKeys, "name");                                                                // 110
  self._invalidKeys = [];                                                                                              // 111
  self._markKeysChanged(removedKeys);                                                                                  // 112
};                                                                                                                     // 113
                                                                                                                       // 114
SimpleSchemaValidationContext.prototype.isValid = function simpleSchemaValidationContextIsValid() {                    // 115
  var self = this;                                                                                                     // 116
  self._depsAny.depend();                                                                                              // 117
  return !self._invalidKeys.length;                                                                                    // 118
};                                                                                                                     // 119
                                                                                                                       // 120
SimpleSchemaValidationContext.prototype.invalidKeys = function simpleSchemaValidationContextInvalidKeys() {            // 121
  var self = this;                                                                                                     // 122
  self._depsAny.depend();                                                                                              // 123
  return self._invalidKeys;                                                                                            // 124
};                                                                                                                     // 125
                                                                                                                       // 126
SimpleSchemaValidationContext.prototype.addInvalidKeys = function simpleSchemaValidationContextAddInvalidKeys(errors) {
  var self = this;                                                                                                     // 128
                                                                                                                       // 129
  if (!errors || !errors.length) {                                                                                     // 130
    return;                                                                                                            // 131
  }                                                                                                                    // 132
                                                                                                                       // 133
  var changedKeys = [];                                                                                                // 134
  _.each(errors, function (errorObject) {                                                                              // 135
    changedKeys.push(errorObject.name);                                                                                // 136
    self._invalidKeys.push(errorObject);                                                                               // 137
  });                                                                                                                  // 138
                                                                                                                       // 139
  self._markKeysChanged(changedKeys);                                                                                  // 140
};                                                                                                                     // 141
                                                                                                                       // 142
SimpleSchemaValidationContext.prototype._markKeysChanged = function simpleSchemaValidationContextMarkKeysChanged(keys) {
  var self = this;                                                                                                     // 144
                                                                                                                       // 145
  if (!keys || !keys.length) {                                                                                         // 146
    return;                                                                                                            // 147
  }                                                                                                                    // 148
                                                                                                                       // 149
  _.each(keys, function(name) {                                                                                        // 150
    var genericName = SimpleSchema._makeGeneric(name);                                                                 // 151
    if (genericName in self._deps) {                                                                                   // 152
      self._deps[genericName].changed();                                                                               // 153
    }                                                                                                                  // 154
  });                                                                                                                  // 155
  self._depsAny.changed();                                                                                             // 156
};                                                                                                                     // 157
                                                                                                                       // 158
SimpleSchemaValidationContext.prototype._getInvalidKeyObject = function simpleSchemaValidationContextGetInvalidKeyObject(name, genericName) {
  var self = this;                                                                                                     // 160
  genericName = genericName || SimpleSchema._makeGeneric(name);                                                        // 161
                                                                                                                       // 162
  var errorObj = _.findWhere(self._invalidKeys, {name: name});                                                         // 163
  if (!errorObj) {                                                                                                     // 164
    errorObj = _.findWhere(self._invalidKeys, {name: genericName});                                                    // 165
  }                                                                                                                    // 166
  return errorObj;                                                                                                     // 167
};                                                                                                                     // 168
                                                                                                                       // 169
SimpleSchemaValidationContext.prototype._keyIsInvalid = function simpleSchemaValidationContextKeyIsInvalid(name, genericName) {
  return !!this._getInvalidKeyObject(name, genericName);                                                               // 171
};                                                                                                                     // 172
                                                                                                                       // 173
// Like the internal one, but with deps                                                                                // 174
SimpleSchemaValidationContext.prototype.keyIsInvalid = function simpleSchemaValidationContextKeyIsInvalid(name) {      // 175
  var self = this, genericName = SimpleSchema._makeGeneric(name);                                                      // 176
  self._deps[genericName] && self._deps[genericName].depend();                                                         // 177
                                                                                                                       // 178
  return self._keyIsInvalid(name, genericName);                                                                        // 179
};                                                                                                                     // 180
                                                                                                                       // 181
SimpleSchemaValidationContext.prototype.keyErrorMessage = function simpleSchemaValidationContextKeyErrorMessage(name) {
  var self = this, genericName = SimpleSchema._makeGeneric(name);                                                      // 183
  self._deps[genericName] && self._deps[genericName].depend();                                                         // 184
                                                                                                                       // 185
  var errorObj = self._getInvalidKeyObject(name, genericName);                                                         // 186
  if (!errorObj) {                                                                                                     // 187
    return "";                                                                                                         // 188
  }                                                                                                                    // 189
                                                                                                                       // 190
  return self._simpleSchema.messageForError(errorObj.type, errorObj.name, null, errorObj.value);                       // 191
};                                                                                                                     // 192
                                                                                                                       // 193
SimpleSchemaValidationContext.prototype.getErrorObject = function simpleSchemaValidationContextGetErrorObject() {      // 194
  var self = this, message, invalidKeys = this._invalidKeys;                                                           // 195
  if (invalidKeys.length) {                                                                                            // 196
    message = self.keyErrorMessage(invalidKeys[0].name);                                                               // 197
    // We add `message` prop to the invalidKeys.                                                                       // 198
    invalidKeys = _.map(invalidKeys, function (o) {                                                                    // 199
      return _.extend({message: self.keyErrorMessage(o.name)}, o);                                                     // 200
    });                                                                                                                // 201
  } else {                                                                                                             // 202
    message = "Failed validation";                                                                                     // 203
  }                                                                                                                    // 204
  var error = new Error(message);                                                                                      // 205
  error.invalidKeys = invalidKeys;                                                                                     // 206
  // If on the server, we add a sanitized error, too, in case we're                                                    // 207
  // called from a method.                                                                                             // 208
  if (Meteor.isServer) {                                                                                               // 209
    error.sanitizedError = new Meteor.Error(400, message);                                                             // 210
  }                                                                                                                    // 211
  return error;                                                                                                        // 212
};                                                                                                                     // 213
                                                                                                                       // 214
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['aldeed:simple-schema'] = {}, {
  SimpleSchema: SimpleSchema,
  MongoObject: MongoObject,
  humanize: humanize
});

})();
