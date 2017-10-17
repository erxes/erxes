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
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/string-humanize.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/*
  Code source:
    https://github.com/jxson/string-humanize
    https://github.com/jxson/string-capitalize
 */

function capitalize(string){
  string = string || '';
  string = string.trim();

  if (string[0]) {
    string = string[0].toUpperCase() + string.substr(1).toLowerCase();
  }

  return string;
}

humanize = function humanize(string){
  string = string || '';
  string = string.toString(); // might be a number
  string = string.trim();
  string = string.replace(extname(string), '');
  string = underscore(string);
  string = string.replace(/[\W_]+/g, ' ');

  return capitalize(string);
}


function underscore(string){
  string = string || '';
  string = string.toString(); // might be a number
  string = string.trim();
  string = string.replace(/([a-z\d])([A-Z]+)/g, '$1_$2');
  string = string.replace(/[-\s]+/g, '_').toLowerCase();

  return string;
}

function extname(string){
  var index = string.lastIndexOf('.');
  var ext = string.substring(index, string.length);

  return (index === -1) ? '' : ext;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/mongo-object.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global MongoObject:true */


var isObject = function(obj) {
  return obj === Object(obj);
};

// getPrototypeOf polyfill
if (typeof Object.getPrototypeOf !== "function") {
  if (typeof "".__proto__ === "object") {
    Object.getPrototypeOf = function(object) {
      return object.__proto__;
    };
  } else {
    Object.getPrototypeOf = function(object) {
      // May break if the constructor has been tampered with
      return object.constructor.prototype;
    };
  }
}

/* Tests whether "obj" is an Object as opposed to
 * something that inherits from Object
 *
 * @param {any} obj
 * @returns {Boolean}
 */
var isBasicObject = function(obj) {
  return isObject(obj) && Object.getPrototypeOf(obj) === Object.prototype;
};

/* Takes a specific string that uses mongo-style dot notation
 * and returns a generic string equivalent. Replaces all numeric
 * "pieces" with a dollar sign ($).
 *
 * @param {type} name
 * @returns {unresolved}
 */
var makeGeneric = function makeGeneric(name) {
  if (typeof name !== "string") {
    return null;
  }
  return name.replace(/\.[0-9]+\./g, '.$.').replace(/\.[0-9]+$/g, '.$');
};

var appendAffectedKey = function appendAffectedKey(affectedKey, key) {
  if (key === "$each") {
    return affectedKey;
  } else {
    return (affectedKey ? affectedKey + "." + key : key);
  }
};

// Extracts operator piece, if present, from position string
var extractOp = function extractOp(position) {
  var firstPositionPiece = position.slice(0, position.indexOf("["));
  return (firstPositionPiece.substring(0, 1) === "$") ? firstPositionPiece : null;
};

/*
 * @constructor
 * @param {Object} objOrModifier
 * @param {string[]} blackBoxKeys - A list of the names of keys that shouldn't be traversed
 * @returns {undefined}
 *
 * Creates a new MongoObject instance. The object passed as the first argument
 * will be modified in place by calls to instance methods. Also, immediately
 * upon creation of the instance, the object will have any `undefined` keys
 * removed recursively.
 */
MongoObject = function(objOrModifier, blackBoxKeys) {
  var self = this;
  self._obj = objOrModifier;
  self._affectedKeys = {};
  self._genericAffectedKeys = {};
  self._parentPositions = [];
  self._positionsInsideArrays = [];
  self._objectPositions = [];

  function parseObj(val, currentPosition, affectedKey, operator, adjusted, isWithinArray) {

    // Adjust for first-level modifier operators
    if (!operator && affectedKey && affectedKey.substring(0, 1) === "$") {
      operator = affectedKey;
      affectedKey = null;
    }

    var affectedKeyIsBlackBox = false;
    var affectedKeyGeneric;
    var stop = false;
    if (affectedKey) {

      // Adjust for $push and $addToSet and $pull and $pop
      if (!adjusted) {
        if (operator === "$push" || operator === "$addToSet" || operator === "$pop") {
          // Adjust for $each
          // We can simply jump forward and pretend like the $each array
          // is the array for the field. This has the added benefit of
          // skipping past any $slice, which we also don't care about.
          if (isBasicObject(val) && "$each" in val) {
            val = val.$each;
            currentPosition = currentPosition + "[$each]";
          } else {
            affectedKey = affectedKey + ".0";
          }
          adjusted = true;
        } else if (operator === "$pull") {
          affectedKey = affectedKey + ".0";
          if (isBasicObject(val)) {
            stop = true;
          }
          adjusted = true;
        }
      }

      // Make generic key
      affectedKeyGeneric = makeGeneric(affectedKey);

      // Determine whether affected key should be treated as a black box
      affectedKeyIsBlackBox = _.contains(blackBoxKeys, affectedKeyGeneric);

      // Mark that this position affects this generic and non-generic key
      if (currentPosition) {
        self._affectedKeys[currentPosition] = affectedKey;
        self._genericAffectedKeys[currentPosition] = affectedKeyGeneric;

        // If we're within an array, mark this position so we can omit it from flat docs
        isWithinArray && self._positionsInsideArrays.push(currentPosition);
      }
    }

    if (stop) {
      return;
    }

    // Loop through arrays
    if (_.isArray(val) && !_.isEmpty(val)) {
      if (currentPosition) {
        // Mark positions with arrays that should be ignored when we want endpoints only
        self._parentPositions.push(currentPosition);
      }

      // Loop
      _.each(val, function(v, i) {
        parseObj(v, (currentPosition ? currentPosition + "[" + i + "]" : i), affectedKey + '.' + i, operator, adjusted, true);
      });
    }

    // Loop through object keys, only for basic objects,
    // but always for the passed-in object, even if it
    // is a custom object.
    else if ((isBasicObject(val) && !affectedKeyIsBlackBox) || !currentPosition) {
      if (currentPosition && !_.isEmpty(val)) {
        // Mark positions with objects that should be ignored when we want endpoints only
        self._parentPositions.push(currentPosition);
        // Mark positions with objects that should be left out of flat docs.
        self._objectPositions.push(currentPosition);
      }
      // Loop
      _.each(val, function(v, k) {
        if (v === void 0) {
          delete val[k];
        } else if (k !== "$slice") {
          parseObj(v, (currentPosition ? currentPosition + "[" + k + "]" : k), appendAffectedKey(affectedKey, k), operator, adjusted, isWithinArray);
        }
      });
    }

  }
  parseObj(self._obj);

  function reParseObj() {
    self._affectedKeys = {};
    self._genericAffectedKeys = {};
    self._parentPositions = [];
    self._positionsInsideArrays = [];
    self._objectPositions = [];
    parseObj(self._obj);
  }

  /**
   * @method MongoObject.forEachNode
   * @param {Function} func
   * @param {Object} [options]
   * @param {Boolean} [options.endPointsOnly=true] - Only call function for endpoints and not for nodes that contain other nodes
   * @returns {undefined}
   *
   * Runs a function for each endpoint node in the object tree, including all items in every array.
   * The function arguments are
   * (1) the value at this node
   * (2) a string representing the node position
   * (3) the representation of what would be changed in mongo, using mongo dot notation
   * (4) the generic equivalent of argument 3, with "$" instead of numeric pieces
   */
  self.forEachNode = function(func, options) {
    if (typeof func !== "function") {
      throw new Error("filter requires a loop function");
    }

    options = _.extend({
      endPointsOnly: true
    }, options);

    var updatedValues = {};
    _.each(self._affectedKeys, function(affectedKey, position) {
      if (options.endPointsOnly && _.contains(self._parentPositions, position)) {
        return; //only endpoints
      }
      func.call({
        value: self.getValueForPosition(position),
        operator: extractOp(position),
        position: position,
        key: affectedKey,
        genericKey: self._genericAffectedKeys[position],
        updateValue: function(newVal) {
          updatedValues[position] = newVal;
        },
        remove: function() {
          updatedValues[position] = void 0;
        }
      });
    });

    // Actually update/remove values as instructed
    _.each(updatedValues, function(newVal, position) {
      self.setValueForPosition(position, newVal);
    });

  };

  self.getValueForPosition = function(position) {
    var subkey, subkeys = position.split("["), current = self._obj;
    for (var i = 0, ln = subkeys.length; i < ln; i++) {
      subkey = subkeys[i];
      // If the subkey ends in "]", remove the ending
      if (subkey.slice(-1) === "]") {
        subkey = subkey.slice(0, -1);
      }
      current = current[subkey];
      if (!_.isArray(current) && !isBasicObject(current) && i < ln - 1) {
        return;
      }
    }
    return current;
  };

  /**
   * @method MongoObject.prototype.setValueForPosition
   * @param {String} position
   * @param {Any} value
   * @returns {undefined}
   */
  self.setValueForPosition = function(position, value) {
    var nextPiece, subkey, subkeys = position.split("["), current = self._obj;

    for (var i = 0, ln = subkeys.length; i < ln; i++) {
      subkey = subkeys[i];
      // If the subkey ends in "]", remove the ending
      if (subkey.slice(-1) === "]") {
        subkey = subkey.slice(0, -1);
      }
      // If we've reached the key in the object tree that needs setting or
      // deleting, do it.
      if (i === ln - 1) {
        current[subkey] = value;
        //if value is undefined, delete the property
        if (value === void 0) {
          delete current[subkey];
        }
      }
      // Otherwise attempt to keep moving deeper into the object.
      else {
        // If we're setting (as opposed to deleting) a key and we hit a place
        // in the ancestor chain where the keys are not yet created, create them.
        if (current[subkey] === void 0 && value !== void 0) {
          //see if the next piece is a number
          nextPiece = subkeys[i + 1];
          nextPiece = parseInt(nextPiece, 10);
          current[subkey] = isNaN(nextPiece) ? {} : [];
        }

        // Move deeper into the object
        current = current[subkey];

        // If we can go no further, then quit
        if (!_.isArray(current) && !isBasicObject(current) && i < ln - 1) {
          return;
        }
      }
    }

    reParseObj();
  };

  /**
   * @method MongoObject.prototype.removeValueForPosition
   * @param {String} position
   * @returns {undefined}
   */
  self.removeValueForPosition = function(position) {
    self.setValueForPosition(position, void 0);
  };

  /**
   * @method MongoObject.prototype.getKeyForPosition
   * @param {String} position
   * @returns {undefined}
   */
  self.getKeyForPosition = function(position) {
    return self._affectedKeys[position];
  };

  /**
   * @method MongoObject.prototype.getGenericKeyForPosition
   * @param {String} position
   * @returns {undefined}
   */
  self.getGenericKeyForPosition = function(position) {
    return self._genericAffectedKeys[position];
  };

  /**
   * @method MongoObject.getInfoForKey
   * @param {String} key - Non-generic key
   * @returns {undefined|Object}
   *
   * Returns the value and operator of the requested non-generic key.
   * Example: {value: 1, operator: "$pull"}
   */
  self.getInfoForKey = function(key) {
    // Get the info
    var position = self.getPositionForKey(key);
    if (position) {
      return {
        value: self.getValueForPosition(position),
        operator: extractOp(position)
      };
    }

    // If we haven't returned yet, check to see if there is an array value
    // corresponding to this key
    // We find the first item within the array, strip the last piece off the
    // position string, and then return whatever is at that new position in
    // the original object.
    var positions = self.getPositionsForGenericKey(key + ".$"), p, v;
    for (var i = 0, ln = positions.length; i < ln; i++) {
      p = positions[i];
      v = self.getValueForPosition(p) || self.getValueForPosition(p.slice(0, p.lastIndexOf("[")));
      if (v) {
        return {
          value: v,
          operator: extractOp(p)
        };
      }
    }
  };

  /**
   * @method MongoObject.getPositionForKey
   * @param {String} key - Non-generic key
   * @returns {undefined|String} Position string
   *
   * Returns the position string for the place in the object that
   * affects the requested non-generic key.
   * Example: 'foo[bar][0]'
   */
  self.getPositionForKey = function(key) {
    // Get the info
    for (var position in self._affectedKeys) {
      if (self._affectedKeys.hasOwnProperty(position)) {
        if (self._affectedKeys[position] === key) {
          // We return the first one we find. While it's
          // possible that multiple update operators could
          // affect the same non-generic key, we'll assume that's not the case.
          return position;
        }
      }
    }

    // If we haven't returned yet, we need to check for affected keys
  };

  /**
   * @method MongoObject.getPositionsForGenericKey
   * @param {String} key - Generic key
   * @returns {String[]} Array of position strings
   *
   * Returns an array of position strings for the places in the object that
   * affect the requested generic key.
   * Example: ['foo[bar][0]']
   */
  self.getPositionsForGenericKey = function(key) {
    // Get the info
    var list = [];
    for (var position in self._genericAffectedKeys) {
      if (self._genericAffectedKeys.hasOwnProperty(position)) {
        if (self._genericAffectedKeys[position] === key) {
          list.push(position);
        }
      }
    }

    return list;
  };

  /**
   * @deprecated Use getInfoForKey
   * @method MongoObject.getValueForKey
   * @param {String} key - Non-generic key
   * @returns {undefined|Any}
   *
   * Returns the value of the requested non-generic key
   */
  self.getValueForKey = function(key) {
    var position = self.getPositionForKey(key);
    if (position) {
      return self.getValueForPosition(position);
    }
  };

  /**
   * @method MongoObject.prototype.addKey
   * @param {String} key - Key to set
   * @param {Any} val - Value to give this key
   * @param {String} op - Operator under which to set it, or `null` for a non-modifier object
   * @returns {undefined}
   *
   * Adds `key` with value `val` under operator `op` to the source object.
   */
  self.addKey = function(key, val, op) {
    var position = op ? op + "[" + key + "]" : MongoObject._keyToPosition(key);
    self.setValueForPosition(position, val);
  };

  /**
   * @method MongoObject.prototype.removeGenericKeys
   * @param {String[]} keys
   * @returns {undefined}
   *
   * Removes anything that affects any of the generic keys in the list
   */
  self.removeGenericKeys = function(keys) {
    for (var position in self._genericAffectedKeys) {
      if (self._genericAffectedKeys.hasOwnProperty(position)) {
        if (_.contains(keys, self._genericAffectedKeys[position])) {
          self.removeValueForPosition(position);
        }
      }
    }
  };

  /**
   * @method MongoObject.removeGenericKey
   * @param {String} key
   * @returns {undefined}
   *
   * Removes anything that affects the requested generic key
   */
  self.removeGenericKey = function(key) {
    for (var position in self._genericAffectedKeys) {
      if (self._genericAffectedKeys.hasOwnProperty(position)) {
        if (self._genericAffectedKeys[position] === key) {
          self.removeValueForPosition(position);
        }
      }
    }
  };

  /**
   * @method MongoObject.removeKey
   * @param {String} key
   * @returns {undefined}
   *
   * Removes anything that affects the requested non-generic key
   */
  self.removeKey = function(key) {
    // We don't use getPositionForKey here because we want to be sure to
    // remove for all positions if there are multiple.
    for (var position in self._affectedKeys) {
      if (self._affectedKeys.hasOwnProperty(position)) {
        if (self._affectedKeys[position] === key) {
          self.removeValueForPosition(position);
        }
      }
    }
  };

  /**
   * @method MongoObject.removeKeys
   * @param {String[]} keys
   * @returns {undefined}
   *
   * Removes anything that affects any of the non-generic keys in the list
   */
  self.removeKeys = function(keys) {
    for (var i = 0, ln = keys.length; i < ln; i++) {
      self.removeKey(keys[i]);
    }
  };

  /**
   * @method MongoObject.filterGenericKeys
   * @param {Function} test - Test function
   * @returns {undefined}
   *
   * Passes all affected keys to a test function, which
   * should return false to remove whatever is affecting that key
   */
  self.filterGenericKeys = function(test) {
    var gk, checkedKeys = [], keysToRemove = [];
    for (var position in self._genericAffectedKeys) {
      if (self._genericAffectedKeys.hasOwnProperty(position)) {
        gk = self._genericAffectedKeys[position];
        if (!_.contains(checkedKeys, gk)) {
          checkedKeys.push(gk);
          if (gk && !test(gk)) {
            keysToRemove.push(gk);
          }
        }
      }
    }

    _.each(keysToRemove, function(key) {
      self.removeGenericKey(key);
    });
  };

  /**
   * @method MongoObject.setValueForKey
   * @param {String} key
   * @param {Any} val
   * @returns {undefined}
   *
   * Sets the value for every place in the object that affects
   * the requested non-generic key
   */
  self.setValueForKey = function(key, val) {
    // We don't use getPositionForKey here because we want to be sure to
    // set the value for all positions if there are multiple.
    for (var position in self._affectedKeys) {
      if (self._affectedKeys.hasOwnProperty(position)) {
        if (self._affectedKeys[position] === key) {
          self.setValueForPosition(position, val);
        }
      }
    }
  };

  /**
   * @method MongoObject.setValueForGenericKey
   * @param {String} key
   * @param {Any} val
   * @returns {undefined}
   *
   * Sets the value for every place in the object that affects
   * the requested generic key
   */
  self.setValueForGenericKey = function(key, val) {
    // We don't use getPositionForKey here because we want to be sure to
    // set the value for all positions if there are multiple.
    for (var position in self._genericAffectedKeys) {
      if (self._genericAffectedKeys.hasOwnProperty(position)) {
        if (self._genericAffectedKeys[position] === key) {
          self.setValueForPosition(position, val);
        }
      }
    }
  };

  /**
   * @method MongoObject.getObject
   * @returns {Object}
   *
   * Get the source object, potentially modified by other method calls on this
   * MongoObject instance.
   */
  self.getObject = function() {
    return self._obj;
  };

  /**
   * @method MongoObject.getFlatObject
   * @returns {Object}
   *
   * Gets a flat object based on the MongoObject instance.
   * In a flat object, the key is the name of the non-generic affectedKey,
   * with mongo dot notation if necessary, and the value is the value for
   * that key.
   *
   * With `keepArrays: true`, we don't flatten within arrays. Currently
   * MongoDB does not see a key such as `a.0.b` and automatically assume
   * an array. Instead it would create an object with key "0" if there
   * wasn't already an array saved as the value of `a`, which is rarely
   * if ever what we actually want. To avoid this confusion, we
   * set entire arrays.
   */
  self.getFlatObject = function(options) {
    options = options || {};
    var newObj = {};
    _.each(self._affectedKeys, function(affectedKey, position) {
      if (typeof affectedKey === "string" &&
        (options.keepArrays === true && !_.contains(self._positionsInsideArrays, position) && !_.contains(self._objectPositions, position)) ||
        (!options.keepArrays && !_.contains(self._parentPositions, position))
        ) {
        newObj[affectedKey] = self.getValueForPosition(position);
      }
    });
    return newObj;
  };

  /**
   * @method MongoObject.affectsKey
   * @param {String} key
   * @returns {Object}
   *
   * Returns true if the non-generic key is affected by this object
   */
  self.affectsKey = function(key) {
    return !!self.getPositionForKey(key);
  };

  /**
   * @method MongoObject.affectsGenericKey
   * @param {String} key
   * @returns {Object}
   *
   * Returns true if the generic key is affected by this object
   */
  self.affectsGenericKey = function(key) {
    for (var position in self._genericAffectedKeys) {
      if (self._genericAffectedKeys.hasOwnProperty(position)) {
        if (self._genericAffectedKeys[position] === key) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * @method MongoObject.affectsGenericKeyImplicit
   * @param {String} key
   * @returns {Object}
   *
   * Like affectsGenericKey, but will return true if a child key is affected
   */
  self.affectsGenericKeyImplicit = function(key) {
    for (var position in self._genericAffectedKeys) {
      if (self._genericAffectedKeys.hasOwnProperty(position)) {
        var affectedKey = self._genericAffectedKeys[position];

        // If the affected key is the test key
        if (affectedKey === key) {
          return true;
        }

        // If the affected key implies the test key because the affected key
        // starts with the test key followed by a period
        if (affectedKey.substring(0, key.length + 1) === key + ".") {
          return true;
        }

        // If the affected key implies the test key because the affected key
        // starts with the test key and the test key ends with ".$"
        var lastTwo = key.slice(-2);
        if (lastTwo === ".$" && key.slice(0, -2) === affectedKey) {
          return true;
        }
      }
    }
    return false;
  };
};

/** Takes a string representation of an object key and its value
 *  and updates "obj" to contain that key with that value.
 *
 *  Example keys and results if val is 1:
 *    "a" -> {a: 1}
 *    "a[b]" -> {a: {b: 1}}
 *    "a[b][0]" -> {a: {b: [1]}}
 *    "a[b.0.c]" -> {a: {'b.0.c': 1}}
 */

/** Takes a string representation of an object key and its value
 *  and updates "obj" to contain that key with that value.
 *
 *  Example keys and results if val is 1:
 *    "a" -> {a: 1}
 *    "a[b]" -> {a: {b: 1}}
 *    "a[b][0]" -> {a: {b: [1]}}
 *    "a[b.0.c]" -> {a: {'b.0.c': 1}}
 *
 * @param {any} val
 * @param {String} key
 * @param {Object} obj
 * @returns {undefined}
 */
MongoObject.expandKey = function(val, key, obj) {
  var nextPiece, subkey, subkeys = key.split("["), current = obj;
  for (var i = 0, ln = subkeys.length; i < ln; i++) {
    subkey = subkeys[i];
    if (subkey.slice(-1) === "]") {
      subkey = subkey.slice(0, -1);
    }
    if (i === ln - 1) {
      //last iteration; time to set the value; always overwrite
      current[subkey] = val;
      //if val is undefined, delete the property
      if (val === void 0) {
        delete current[subkey];
      }
    } else {
      //see if the next piece is a number
      nextPiece = subkeys[i + 1];
      nextPiece = parseInt(nextPiece, 10);
      if (!current[subkey]) {
        current[subkey] = isNaN(nextPiece) ? {} : [];
      }
    }
    current = current[subkey];
  }
};

MongoObject._keyToPosition = function keyToPosition(key, wrapAll) {
  var position = '';
  _.each(key.split("."), function (piece, i) {
    if (i === 0 && !wrapAll) {
      position += piece;
    } else {
      position += "[" + piece + "]";
    }
  });
  return position;
};

/**
 * @method MongoObject._positionToKey
 * @param {String} position
 * @returns {String} The key that this position in an object would affect.
 *
 * This is different from MongoObject.prototype.getKeyForPosition in that
 * this method does not depend on the requested position actually being
 * present in any particular MongoObject.
 */
MongoObject._positionToKey = function positionToKey(position) {
  //XXX Probably a better way to do this, but this is
  //foolproof for now.
  var mDoc = new MongoObject({});
  mDoc.setValueForPosition(position, 1); //value doesn't matter
  var key = mDoc.getKeyForPosition(position);
  mDoc = null;
  return key;
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/simple-schema-utility.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global Utility:true */

Utility = {
  appendAffectedKey: function appendAffectedKey(affectedKey, key) {
    if (key === "$each") {
      return affectedKey;
    } else {
      return (affectedKey ? affectedKey + "." + key : key);
    }
  },
  shouldCheck: function shouldCheck(key) {
    if (key === "$pushAll") {
      throw new Error("$pushAll is not supported; use $push + $each");
    }
    return !_.contains(["$pull", "$pullAll", "$pop", "$slice"], key);
  },
  errorObject: function errorObject(errorType, keyName, keyValue) {
    return {name: keyName, type: errorType, value: keyValue};
  },
  // Tests whether it's an Object as opposed to something that inherits from Object
  isBasicObject: function isBasicObject(obj) {
    return _.isObject(obj) && Object.getPrototypeOf(obj) === Object.prototype;
  },
  // The latest Safari returns false for Uint8Array, etc. instanceof Function
  // unlike other browsers.
  safariBugFix: function safariBugFix(type) {
    return (typeof Uint8Array !== "undefined" && type === Uint8Array) ||
      (typeof Uint16Array !== "undefined" && type === Uint16Array) ||
      (typeof Uint32Array !== "undefined" && type === Uint32Array) ||
      (typeof Uint8ClampedArray !== "undefined" && type === Uint8ClampedArray);
  },
  isNotNullOrUndefined: function isNotNullOrUndefined(val) {
    return val !== void 0 && val !== null;
  },
  // Extracts operator piece, if present, from position string
  extractOp: function extractOp(position) {
    var firstPositionPiece = position.slice(0, position.indexOf("["));
    return (firstPositionPiece.substring(0, 1) === "$") ? firstPositionPiece : null;
  },
  deleteIfPresent: function deleteIfPresent(obj, key) {
    if (key in obj) {
      delete obj[key];
    }
  },
  looksLikeModifier: function looksLikeModifier(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && key.substring(0, 1) === "$") {
        return true;
      }
    }
    return false;
  },
  dateToDateString: function dateToDateString(date) {
    var m = (date.getUTCMonth() + 1);
    if (m < 10) {
      m = "0" + m;
    }
    var d = date.getUTCDate();
    if (d < 10) {
      d = "0" + d;
    }
    return date.getUTCFullYear() + '-' + m + '-' + d;
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/simple-schema.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global SimpleSchema:true */
/* global SimpleSchemaValidationContext */
/* global MongoObject */
/* global Utility */

var schemaDefinition = {
  type: Match.Any,
  label: Match.Optional(Match.OneOf(String, Function)),
  optional: Match.Optional(Match.OneOf(Boolean, Function)),
  min: Match.Optional(Match.OneOf(Number, Date, Function)),
  max: Match.Optional(Match.OneOf(Number, Date, Function)),
  minCount: Match.Optional(Match.OneOf(Number, Function)),
  maxCount: Match.Optional(Match.OneOf(Number, Function)),
  allowedValues: Match.Optional(Match.OneOf([Match.Any], Function)),
  decimal: Match.Optional(Boolean),
  exclusiveMax: Match.Optional(Boolean),
  exclusiveMin: Match.Optional(Boolean),
  regEx: Match.Optional(Match.OneOf(RegExp, [RegExp])),
  custom: Match.Optional(Function),
  blackbox: Match.Optional(Boolean),
  autoValue: Match.Optional(Function),
  defaultValue: Match.Optional(Match.Any),
  trim: Match.Optional(Boolean)
};

/*
 * PRIVATE FUNCTIONS
 */

//called by clean()
var typeconvert = function(value, type) {
  var parsedDate;

  if (_.isArray(value) || (_.isObject(value) && !(value instanceof Date))) {
    return value; //can't and shouldn't convert arrays or objects
  }
  if (type === String) {
    if (typeof value !== "undefined" && value !== null && typeof value !== "string") {
      return value.toString();
    }
    return value;
  }
  if (type === Number) {
    if (typeof value === "string" && !_.isEmpty(value)) {
      //try to convert numeric strings to numbers
      var numberVal = Number(value);
      if (!isNaN(numberVal)) {
        return numberVal;
      } else {
        return value; //leave string; will fail validation
      }
    }
    return value;
  }
  //
  // If target type is a Date we can safely convert from either a
  // number (Integer value representing the number of milliseconds
  // since 1 January 1970 00:00:00 UTC) or a string that can be parsed
  // by Date.
  //
  if (type === Date) {
    if (typeof value === "string") {
      parsedDate = Date.parse(value);
      if (isNaN(parsedDate) === false) {
        return new Date(parsedDate);
      }
    }
    if (typeof value === "number") {
      return new Date(value);
    }
  }
  return value;
};

var expandSchema = function(schema) {
  // Flatten schema by inserting nested definitions
  _.each(schema, function(val, key) {
    var dot, type;
    if (!val) {
      return;
    }
    if (Match.test(val.type, SimpleSchema)) {
      dot = '.';
      type = val.type;
      val.type = Object;
    } else if (Match.test(val.type, [SimpleSchema])) {
      dot = '.$.';
      type = val.type[0];
      val.type = [Object];
    } else {
      return;
    }
    //add child schema definitions to parent schema
    _.each(type._schema, function(subVal, subKey) {
      var newKey = key + dot + subKey;
      if (!(newKey in schema)) {
        schema[newKey] = subVal;
      }
    });
  });
  return schema;
};

var adjustArrayFields = function(schema) {
  _.each(schema, function(def, existingKey) {
    if (_.isArray(def.type) || def.type === Array) {
      // Copy some options to array-item definition
      var itemKey = existingKey + ".$";
      if (!(itemKey in schema)) {
        schema[itemKey] = {};
      }
      if (_.isArray(def.type)) {
        schema[itemKey].type = def.type[0];
      }
      if (def.label) {
        schema[itemKey].label = def.label;
      }
      schema[itemKey].optional = true;
      if (typeof def.min !== "undefined") {
        schema[itemKey].min = def.min;
      }
      if (typeof def.max !== "undefined") {
        schema[itemKey].max = def.max;
      }
      if (typeof def.allowedValues !== "undefined") {
        schema[itemKey].allowedValues = def.allowedValues;
      }
      if (typeof def.decimal !== "undefined") {
        schema[itemKey].decimal = def.decimal;
      }
      if (typeof def.exclusiveMax !== "undefined") {
        schema[itemKey].exclusiveMax = def.exclusiveMax;
      }
      if (typeof def.exclusiveMin !== "undefined") {
        schema[itemKey].exclusiveMin = def.exclusiveMin;
      }
      if (typeof def.regEx !== "undefined") {
        schema[itemKey].regEx = def.regEx;
      }
      if (typeof def.blackbox !== "undefined") {
        schema[itemKey].blackbox = def.blackbox;
      }
      // Remove copied options and adjust type
      def.type = Array;
      _.each(['min', 'max', 'allowedValues', 'decimal', 'exclusiveMax', 'exclusiveMin', 'regEx', 'blackbox'], function(k) {
        Utility.deleteIfPresent(def, k);
      });
    }
  });
};

/**
 * Adds implied keys.
 * * If schema contains a key like "foo.$.bar" but not "foo", adds "foo".
 * * If schema contains a key like "foo" with an array type, adds "foo.$".
 * @param {Object} schema
 * @returns {Object} modified schema
 */
var addImplicitKeys = function(schema) {
  var arrayKeysToAdd = [], objectKeysToAdd = [], newKey, key, i, ln;

  // Pass 1 (objects)
  _.each(schema, function(def, existingKey) {
    var pos = existingKey.indexOf(".");
    while (pos !== -1) {
      newKey = existingKey.substring(0, pos);

      // It's an array item; nothing to add
      if (newKey.substring(newKey.length - 2) === ".$") {
        pos = -1;
      }
      // It's an array of objects; add it with type [Object] if not already in the schema
      else if (existingKey.substring(pos, pos + 3) === ".$.") {
        arrayKeysToAdd.push(newKey); // add later, since we are iterating over schema right now
        pos = existingKey.indexOf(".", pos + 3); // skip over next dot, find the one after
      }
      // It's an object; add it with type Object if not already in the schema
      else {
        objectKeysToAdd.push(newKey); // add later, since we are iterating over schema right now
        pos = existingKey.indexOf(".", pos + 1); // find next dot
      }
    }
  });

  for (i = 0, ln = arrayKeysToAdd.length; i < ln; i++) {
    key = arrayKeysToAdd[i];
    if (!(key in schema)) {
      schema[key] = {type: [Object], optional: true};
    }
  }

  for (i = 0, ln = objectKeysToAdd.length; i < ln; i++) {
    key = objectKeysToAdd[i];
    if (!(key in schema)) {
      schema[key] = {type: Object, optional: true};
    }
  }

  // Pass 2 (arrays)
  adjustArrayFields(schema);

  return schema;
};

var mergeSchemas = function(schemas) {

  // Merge all provided schema definitions.
  // This is effectively a shallow clone of each object, too,
  // which is what we want since we are going to manipulate it.
  var mergedSchema = {};
  _.each(schemas, function(schema) {

    // Create a temporary SS instance so that the internal object
    // we use for merging/extending will be fully expanded
    if (Match.test(schema, SimpleSchema)) {
      schema = schema._schema;
    } else {
      schema = addImplicitKeys(expandSchema(schema));
    }

    // Loop through and extend each individual field
    // definition. That way you can extend and overwrite
    // base field definitions.
    _.each(schema, function(def, field) {
      mergedSchema[field] = mergedSchema[field] || {};
      _.extend(mergedSchema[field], def);
    });

  });

  // If we merged some schemas, do this again to make sure
  // extended definitions are pushed into array item field
  // definitions properly.
  schemas.length && adjustArrayFields(mergedSchema);

  return mergedSchema;
};

// Returns an object relating the keys in the list
// to their parent object.
var getObjectKeys = function(schema, schemaKeyList) {
  var keyPrefix, remainingText, rKeys = {}, loopArray;
  _.each(schema, function(definition, fieldName) {
    if (definition.type === Object) {
      //object
      keyPrefix = fieldName + ".";
    } else {
      return;
    }

    loopArray = [];
    _.each(schemaKeyList, function(fieldName2) {
      if (fieldName2.startsWith(keyPrefix)) {
        remainingText = fieldName2.substring(keyPrefix.length);
        if (remainingText.indexOf(".") === -1) {
          loopArray.push(remainingText);
        }
      }
    });
    rKeys[keyPrefix] = loopArray;
  });
  return rKeys;
};

// returns an inflected version of fieldName to use as the label
var inflectedLabel = function(fieldName) {
  var label = fieldName, lastPeriod = label.lastIndexOf(".");
  if (lastPeriod !== -1) {
    label = label.substring(lastPeriod + 1);
    if (label === "$") {
      var pcs = fieldName.split(".");
      label = pcs[pcs.length - 2];
    }
  }
  if (label === "_id") {
    return "ID";
  }
  return humanize(label);
};

/**
 * @method getAutoValues
 * @private
 * @param {MongoObject} mDoc
 * @param {Boolean} [isModifier=false] - Is it a modifier doc?
 * @param {Object} [extendedAutoValueContext] - Object that will be added to the context when calling each autoValue function
 * @returns {undefined}
 *
 * Updates doc with automatic values from autoValue functions or default
 * values from defaultValue. Modifies the referenced object in place.
 */
function getAutoValues(mDoc, isModifier, extendedAutoValueContext) {
  var self = this;
  var doneKeys = [];

  //on the client we can add the userId if not already in the custom context
  if (Meteor.isClient && extendedAutoValueContext.userId === void 0) {
    extendedAutoValueContext.userId = (Meteor.userId && Meteor.userId()) || null;
  }

  function runAV(func) {
    var affectedKey = this.key;
    // If already called for this key, skip it
    if (_.contains(doneKeys, affectedKey)) {
      return;
    }
    var lastDot = affectedKey.lastIndexOf('.');
    var fieldParentName = lastDot === -1 ? '' : affectedKey.slice(0, lastDot + 1);
    var doUnset = false;
    var autoValue = func.call(_.extend({
      isSet: (this.value !== void 0),
      unset: function() {
        doUnset = true;
      },
      value: this.value,
      operator: this.operator,
      field: function(fName) {
        var keyInfo = mDoc.getInfoForKey(fName) || {};
        return {
          isSet: (keyInfo.value !== void 0),
          value: keyInfo.value,
          operator: keyInfo.operator || null
        };
      },
      siblingField: function(fName) {
        var keyInfo = mDoc.getInfoForKey(fieldParentName + fName) || {};
        return {
          isSet: (keyInfo.value !== void 0),
          value: keyInfo.value,
          operator: keyInfo.operator || null
        };
      }
    }, extendedAutoValueContext || {}), mDoc.getObject());

    // Update tracking of which keys we've run autovalue for
    doneKeys.push(affectedKey);

    if (autoValue === void 0) {
      if (doUnset) {
        mDoc.removeValueForPosition(this.position);
      }
      return;
    }

    // If the user's auto value is of the pseudo-modifier format, parse it
    // into operator and value.
    var op, newValue;
    if (_.isObject(autoValue)) {
      for (var key in autoValue) {
        if (autoValue.hasOwnProperty(key) && key.substring(0, 1) === "$") {
          op = key;
          newValue = autoValue[key];
          break;
        }
      }
    }

    // Add $set for updates and upserts if necessary
    if (!op && isModifier && this.position.slice(0, 1) !== '$') {
      op = "$set";
      newValue = autoValue;
    }

    // Update/change value
    if (op) {
      mDoc.removeValueForPosition(this.position);
      mDoc.setValueForPosition(op + '[' + affectedKey + ']', newValue);
    } else {
      mDoc.setValueForPosition(this.position, autoValue);
    }
  }

  _.each(self._autoValues, function(func, fieldName) {
    var positionSuffix, key, keySuffix, positions;

    // If we're under an array, run autovalue for all the properties of
    // any objects that are present in the nearest ancestor array.
    if (fieldName.indexOf("$") !== -1) {
      var testField = fieldName.slice(0, fieldName.lastIndexOf("$") + 1);
      keySuffix = fieldName.slice(testField.length + 1);
      positionSuffix = MongoObject._keyToPosition(keySuffix, true);
      keySuffix = '.' + keySuffix;
      positions = mDoc.getPositionsForGenericKey(testField);
    } else {

      // See if anything in the object affects this key
      positions = mDoc.getPositionsForGenericKey(fieldName);

      // Run autovalue for properties that are set in the object
      if (positions.length) {
        key = fieldName;
        keySuffix = '';
        positionSuffix = '';
      }

      // Run autovalue for properties that are NOT set in the object
      else {
        key = fieldName;
        keySuffix = '';
        positionSuffix = '';
        if (isModifier) {
          positions = ["$set[" + fieldName + "]"];
        } else {
          positions = [MongoObject._keyToPosition(fieldName)];
        }
      }

    }

    _.each(positions, function(position) {
      runAV.call({
        key: (key || MongoObject._positionToKey(position)) + keySuffix,
        value: mDoc.getValueForPosition(position + positionSuffix),
        operator: Utility.extractOp(position),
        position: position + positionSuffix
      }, func);
    });
  });
}

//exported
SimpleSchema = function(schemas, options) {
  var self = this;
  var firstLevelSchemaKeys = [];
  var fieldNameRoot;
  options = options || {};
  schemas = schemas || {};

  if (!_.isArray(schemas)) {
    schemas = [schemas];
  }

  // adjust and store a copy of the schema definitions
  self._schema = mergeSchemas(schemas);

  // store the list of defined keys for speedier checking
  self._schemaKeys = [];

  // store autoValue functions by key
  self._autoValues = {};

  // store the list of blackbox keys for passing to MongoObject constructor
  self._blackboxKeys = [];

  // a place to store custom validators for this instance
  self._validators = [];

  // a place to store custom error messages for this schema
  self._messages = {};

  self._depsMessages = new Deps.Dependency();
  self._depsLabels = {};

  _.each(self._schema, function(definition, fieldName) {
    // Validate the field definition
    if (!Match.test(definition, schemaDefinition)) {
      throw new Error('Invalid definition for ' + fieldName + ' field.');
    }

    fieldNameRoot = fieldName.split(".")[0];

    self._schemaKeys.push(fieldName);

    // We support defaultValue shortcut by converting it immediately into an
    // autoValue.
    if ('defaultValue' in definition) {
      if ('autoValue' in definition) {
        console.warn('SimpleSchema: Found both autoValue and defaultValue options for "' + fieldName + '". Ignoring defaultValue.');
      } else {
        if (fieldName.slice(-2) === ".$") {
          throw new Error('An array item field (one that ends with ".$") cannot have defaultValue.');
        }
        self._autoValues[fieldName] = (function defineAutoValue(v) {
          return function() {
            if (this.operator === null && !this.isSet) {
              return v;
            }
          };
        })(definition.defaultValue);
      }
    }

    if ('autoValue' in definition) {
      if (fieldName.slice(-2) === ".$") {
        throw new Error('An array item field (one that ends with ".$") cannot have autoValue.');
      }
      self._autoValues[fieldName] = definition.autoValue;
    }

    self._depsLabels[fieldName] = new Deps.Dependency();

    if (definition.blackbox === true) {
      self._blackboxKeys.push(fieldName);
    }

    if (!_.contains(firstLevelSchemaKeys, fieldNameRoot)) {
      firstLevelSchemaKeys.push(fieldNameRoot);
    }
  });


  // Cache these lists
  self._firstLevelSchemaKeys = firstLevelSchemaKeys;
  self._objectKeys = getObjectKeys(self._schema, self._schemaKeys);

  // We will store named validation contexts here
  self._validationContexts = {};
};

// This allows other packages or users to extend the schema
// definition options that are supported.
SimpleSchema.extendOptions = function(options) {
  _.extend(schemaDefinition, options);
};

// this domain regex matches all domains that have at least one .
// sadly IPv4 Adresses will be caught too but technically those are valid domains
// this expression is extracted from the original RFC 5322 mail expression
// a modification enforces that the tld consists only of characters
var RX_DOMAIN = '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z](?:[a-z-]*[a-z])?';
// this domain regex matches everythign that could be a domain in intranet
// that means "localhost" is a valid domain
var RX_NAME_DOMAIN = '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.|$))+';
// strict IPv4 expression which allows 0-255 per oktett
var RX_IPv4 = '(?:(?:[0-1]?\\d{1,2}|2[0-4]\\d|25[0-5])(?:\\.|$)){4}';
// strict IPv6 expression which allows (and validates) all shortcuts
var RX_IPv6 = '(?:(?:[\\dA-Fa-f]{1,4}(?::|$)){8}' // full adress
  + '|(?=(?:[^:\\s]|:[^:\\s])*::(?:[^:\\s]|:[^:\\s])*$)' // or min/max one '::'
  + '[\\dA-Fa-f]{0,4}(?:::?(?:[\\dA-Fa-f]{1,4}|$)){1,6})'; // and short adress
// this allows domains (also localhost etc) and ip adresses
var RX_WEAK_DOMAIN = '(?:' + [RX_NAME_DOMAIN,RX_IPv4,RX_IPv6].join('|') + ')';

SimpleSchema.RegEx = {
  // We use the RegExp suggested by W3C in http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
  // This is probably the same logic used by most browsers when type=email, which is our goal. It is
  // a very permissive expression. Some apps may wish to be more strict and can write their own RegExp.
  Email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,

  Domain: new RegExp('^' + RX_DOMAIN + '$'),
  WeakDomain: new RegExp('^' + RX_WEAK_DOMAIN + '$'),

  IP: new RegExp('^(?:' + RX_IPv4 + '|' + RX_IPv6 + ')$'),
  IPv4: new RegExp('^' + RX_IPv4 + '$'),
  IPv6: new RegExp('^' + RX_IPv6 + '$'),
  // URL RegEx from https://gist.github.com/dperini/729294
  // http://mathiasbynens.be/demo/url-regex
  Url: /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i,
  // unique id from the random package also used by minimongo
  // character list: https://github.com/meteor/meteor/blob/release/0.8.0/packages/random/random.js#L88
  // string length: https://github.com/meteor/meteor/blob/release/0.8.0/packages/random/random.js#L143
  Id: /^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/,
  // allows for a 5 digit zip code followed by a whitespace or dash and then 4 more digits
  // matches 11111 and 11111-1111 and 11111 1111
  ZipCode: /^\d{5}(?:[-\s]\d{4})?$/,
  // taken from google's libphonenumber library
  // https://github.com/googlei18n/libphonenumber/blob/master/javascript/i18n/phonenumbers/phonenumberutil.js
  // reference the VALID_PHONE_NUMBER_PATTERN key
  // allows for common phone number symbols including + () and -
  Phone: /^[0-9０-９٠-٩۰-۹]{2}$|^[+＋]*(?:[-x‐-―−ー－-／  ­​⁠　()（）［］.\[\]/~⁓∼～*]*[0-9０-９٠-٩۰-۹]){3,}[-x‐-―−ー－-／  ­​⁠　()（）［］.\[\]/~⁓∼～0-9０-９٠-٩۰-۹]*(?:;ext=([0-9０-９٠-٩۰-۹]{1,7})|[  \t,]*(?:e?xt(?:ensi(?:ó?|ó))?n?|ｅ?ｘｔｎ?|[,xｘ#＃~～]|int|anexo|ｉｎｔ)[:\.．]?[  \t,-]*([0-9０-９٠-٩۰-۹]{1,7})#?|[- ]+([0-9０-９٠-٩۰-۹]{1,5})#)?$/i
};

SimpleSchema._makeGeneric = function(name) {
  if (typeof name !== "string") {
    return null;
  }

  return name.replace(/\.[0-9]+(?=\.|$)/g, '.$');
};

SimpleSchema._depsGlobalMessages = new Deps.Dependency();

// Inherit from Match.Where
// This allow SimpleSchema instance to be recognized as a Match.Where instance as well
// as a SimpleSchema instance
SimpleSchema.prototype = new Match.Where();

// If an object is an instance of Match.Where, Meteor built-in check API will look at
// the function named `condition` and will pass it the document to validate
SimpleSchema.prototype.condition = function(obj) {
  var self = this;

  //determine whether obj is a modifier
  var isModifier, isNotModifier;
  _.each(obj, function(val, key) {
    if (key.substring(0, 1) === "$") {
      isModifier = true;
    } else {
      isNotModifier = true;
    }
  });

  if (isModifier && isNotModifier) {
    throw new Match.Error("Object cannot contain modifier operators alongside other keys");
  }

  var ctx = self.newContext();
  if (!ctx.validate(obj, {modifier: isModifier, filter: false, autoConvert: false})) {
    var error = ctx.getErrorObject();
    var matchError = new Match.Error(error.message);
    matchError.invalidKeys = error.invalidKeys;
    if (Meteor.isServer) {
      matchError.sanitizedError = error.sanitizedError;
    }
    throw matchError;
  }

  return true;
};

function logInvalidKeysForContext(context, name) {
  Meteor.startup(function() {
    Deps.autorun(function() {
      if (!context.isValid()) {
        console.log('SimpleSchema invalid keys for "' + name + '" context:', context.invalidKeys());
      }
    });
  });
}

SimpleSchema.prototype.namedContext = function(name) {
  var self = this;
  if (typeof name !== "string") {
    name = "default";
  }
  if (!self._validationContexts[name]) {
    self._validationContexts[name] = new SimpleSchemaValidationContext(self);

    // In debug mode, log all invalid key errors to the browser console
    if (SimpleSchema.debug && Meteor.isClient) {
      Deps.nonreactive(function() {
        logInvalidKeysForContext(self._validationContexts[name], name);
      });
    }
  }
  return self._validationContexts[name];
};

// Global custom validators
SimpleSchema._validators = [];
SimpleSchema.addValidator = function(func) {
  SimpleSchema._validators.push(func);
};

// Instance custom validators
SimpleSchema.prototype.addValidator = function(func) {
  this._validators.push(func);
};

/**
 * @method SimpleSchema.prototype.pick
 * @param {[fields]} The list of fields to pick to instantiate the subschema
 * @returns {SimpleSchema} The subschema
 */
SimpleSchema.prototype.pick = function(/* arguments */) {
  var self = this;
  var args = _.toArray(arguments);
  args.unshift(self._schema);

  var newSchema = _.pick.apply(null, args);
  return new SimpleSchema(newSchema);
};

SimpleSchema.prototype.omit = function() {
  var self = this;
  var args = _.toArray(arguments);
  args.unshift(self._schema);

  var newSchema = _.omit.apply(null, args);
  return new SimpleSchema(newSchema);
};


/**
 * @method SimpleSchema.prototype.clean
 * @param {Object} doc - Document or modifier to clean. Referenced object will be modified in place.
 * @param {Object} [options]
 * @param {Boolean} [options.filter=true] - Do filtering?
 * @param {Boolean} [options.autoConvert=true] - Do automatic type converting?
 * @param {Boolean} [options.removeEmptyStrings=true] - Remove keys in normal object or $set where the value is an empty string?
 * @param {Boolean} [options.trimStrings=true] - Trim string values?
 * @param {Boolean} [options.getAutoValues=true] - Inject automatic and default values?
 * @param {Boolean} [options.isModifier=false] - Is doc a modifier object?
 * @param {Object} [options.extendAutoValueContext] - This object will be added to the `this` context of autoValue functions.
 * @returns {Object} The modified doc.
 *
 * Cleans a document or modifier object. By default, will filter, automatically
 * type convert where possible, and inject automatic/default values. Use the options
 * to skip one or more of these.
 */
SimpleSchema.prototype.clean = function(doc, options) {
  var self = this;

  // By default, doc will be filtered and autoconverted
  options = _.extend({
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
    getAutoValues: true,
    isModifier: false,
    extendAutoValueContext: {}
  }, options || {});

  // Convert $pushAll (deprecated) to $push with $each
  if ("$pushAll" in doc) {
    console.warn("SimpleSchema.clean: $pushAll is deprecated; converting to $push with $each");
    doc.$push = doc.$push || {};
    for (var field in doc.$pushAll) {
      doc.$push[field] = doc.$push[field] || {};
      doc.$push[field].$each = doc.$push[field].$each || [];
      for (var i = 0, ln = doc.$pushAll[field].length; i < ln; i++) {
        doc.$push[field].$each.push(doc.$pushAll[field][i]);
      }
      delete doc.$pushAll;
    }
  }

  var mDoc = new MongoObject(doc, self._blackboxKeys);

  // Clean loop
  if (options.filter || options.autoConvert || options.removeEmptyStrings || options.trimStrings) {
    mDoc.forEachNode(function() {
      var gKey = this.genericKey, p, def, val;
      if (gKey) {
        def = self._schema[gKey];
        val = this.value;
        // Filter out props if necessary; any property is OK for $unset because we want to
        // allow conversions to remove props that have been removed from the schema.
        if (options.filter && this.operator !== "$unset" && !self.allowsKey(gKey)) {
          // XXX Special handling for $each; maybe this could be made nicer
          if (this.position.slice(-7) === "[$each]") {
            mDoc.removeValueForPosition(this.position.slice(0, -7));
          } else {
            this.remove();
          }
          if (SimpleSchema.debug) {
            console.info('SimpleSchema.clean: filtered out value that would have affected key "' + gKey + '", which is not allowed by the schema');
          }
          return; // no reason to do more
        }
        if (val !== void 0) {
          // Autoconvert values if requested and if possible
          var wasAutoConverted = false;
          if (options.autoConvert && this.operator !== "$unset" && def) {
            var newVal = typeconvert(val, def.type);
            // trim strings
            if (options.trimStrings && typeof newVal === "string") {
              newVal = newVal.trim();
            }
            if (newVal !== void 0 && newVal !== val) {
              // remove empty strings
              if (options.removeEmptyStrings && (!this.operator || this.operator === "$set") && typeof newVal === "string" && !newVal.length) {
                // For a document, we remove any fields that are being set to an empty string
                newVal = void 0;
                // For a modifier, we $unset any fields that are being set to an empty string
                if (this.operator === "$set" && this.position.match(/\[.+?\]/g).length < 2) {

                  p = this.position.replace("$set", "$unset");
                  mDoc.setValueForPosition(p, "");
                }
              }

              // Change value; if undefined, will remove it
              SimpleSchema.debug && console.info('SimpleSchema.clean: autoconverted value ' + val + ' from ' + typeof val + ' to ' + typeof newVal + ' for ' + gKey);
              this.updateValue(newVal);
              wasAutoConverted = true;
            }
          }
          if (!wasAutoConverted) {
            // trim strings
            if (options.trimStrings && typeof val === "string" && (!def || (def && def.trim !== false))) {
              this.updateValue(val.trim());
            }
            // remove empty strings
            if (options.removeEmptyStrings && (!this.operator || this.operator === "$set") && typeof val === "string" && !val.length) {
              // For a document, we remove any fields that are being set to an empty string
              this.remove();
              // For a modifier, we $unset any fields that are being set to an empty string. But only if we're not already within an entire object that is being set.
              if (this.operator === "$set" && this.position.match(/\[.+?\]/g).length < 2) {
                p = this.position.replace("$set", "$unset");
                mDoc.setValueForPosition(p, "");
              }
            }
          }
        }
      }
    }, {endPointsOnly: false});
  }

  // Set automatic values
  options.getAutoValues && getAutoValues.call(self, mDoc, options.isModifier, options.extendAutoValueContext);

  // Ensure we don't have any operators set to an empty object
  // since MongoDB 2.6+ will throw errors.
  if (options.isModifier) {
    for (var op in doc) {
      if (doc.hasOwnProperty(op) && _.isEmpty(doc[op])) {
        delete doc[op];
      }
    }
  }

  return doc;
};

// Returns the entire schema object or just the definition for one key
// in the schema.
SimpleSchema.prototype.schema = function(key) {
  var self = this;
  // if not null or undefined (more specific)
  if (key !== null && key !== void 0) {
    return self._schema[SimpleSchema._makeGeneric(key)];
  } else {
    return self._schema;
  }
};

// Returns the evaluated definition for one key in the schema
// key = non-generic key
// [propList] = props to include in the result, for performance
// [functionContext] = used for evaluating schema options that are functions
SimpleSchema.prototype.getDefinition = function(key, propList, functionContext) {
  var self = this;
  var defs = self.schema(key);
  if (!defs) {
    return;
  }

  if (_.isArray(propList)) {
    defs = _.pick(defs, propList);
  } else {
    defs = _.clone(defs);
  }

  // For any options that support specifying a function,
  // evaluate the functions.
  _.each(['min', 'max', 'minCount', 'maxCount', 'allowedValues', 'optional', 'label'], function (prop) {
    if (_.isFunction(defs[prop])) {
      defs[prop] = defs[prop].call(functionContext || {});
    }
  });

  // Inflect label if not defined
  defs.label = defs.label || inflectedLabel(key);

  return defs;
};

// Check if the key is a nested dot-syntax key inside of a blackbox object
SimpleSchema.prototype.keyIsInBlackBox = function(key) {
  var self = this;
  var parentPath = SimpleSchema._makeGeneric(key), lastDot, def;

  // Iterate the dot-syntax hierarchy until we find a key in our schema
  do {
    lastDot = parentPath.lastIndexOf('.');
    if (lastDot !== -1) {
      parentPath = parentPath.slice(0, lastDot); // Remove last path component
      def = self.getDefinition(parentPath);
    }
  } while (lastDot !== -1 && !def);

  return !!(def && def.blackbox);
};

// Use to dynamically change the schema labels.
SimpleSchema.prototype.labels = function(labels) {
  var self = this;
  _.each(labels, function(label, fieldName) {
    if (!_.isString(label) && !_.isFunction(label)) {
      return;
    }

    if (!(fieldName in self._schema)) {
      return;
    }

    self._schema[fieldName].label = label;
    self._depsLabels[fieldName] && self._depsLabels[fieldName].changed();
  });
};

// should be used to safely get a label as string
SimpleSchema.prototype.label = function(key) {
  var self = this;

  // Get all labels
  if (key === null || key === void 0) {
    var result = {};
    _.each(self.schema(), function(def, fieldName) {
      result[fieldName] = self.label(fieldName);
    });
    return result;
  }

  // Get label for one field
  var def = self.getDefinition(key);
  if (def) {
    var genericKey = SimpleSchema._makeGeneric(key);
    self._depsLabels[genericKey] && self._depsLabels[genericKey].depend();
    return def.label;
  }

  return null;
};

// Global messages

SimpleSchema._globalMessages = {
  required: "[label] is required",
  minString: "[label] must be at least [min] characters",
  maxString: "[label] cannot exceed [max] characters",
  minNumber: "[label] must be at least [min]",
  maxNumber: "[label] cannot exceed [max]",
  minNumberExclusive: "[label] must be greater than [min]",
  maxNumberExclusive: "[label] must be less than [max]",
  minDate: "[label] must be on or after [min]",
  maxDate: "[label] cannot be after [max]",
  badDate: "[label] is not a valid date",
  minCount: "You must specify at least [minCount] values",
  maxCount: "You cannot specify more than [maxCount] values",
  noDecimal: "[label] must be an integer",
  notAllowed: "[value] is not an allowed value",
  expectedString: "[label] must be a string",
  expectedNumber: "[label] must be a number",
  expectedBoolean: "[label] must be a boolean",
  expectedArray: "[label] must be an array",
  expectedObject: "[label] must be an object",
  expectedConstructor: "[label] must be a [type]",
  regEx: [
    {msg: "[label] failed regular expression validation"},
    {exp: SimpleSchema.RegEx.Email, msg: "[label] must be a valid e-mail address"},
    {exp: SimpleSchema.RegEx.WeakEmail, msg: "[label] must be a valid e-mail address"},
    {exp: SimpleSchema.RegEx.Domain, msg: "[label] must be a valid domain"},
    {exp: SimpleSchema.RegEx.WeakDomain, msg: "[label] must be a valid domain"},
    {exp: SimpleSchema.RegEx.IP, msg: "[label] must be a valid IPv4 or IPv6 address"},
    {exp: SimpleSchema.RegEx.IPv4, msg: "[label] must be a valid IPv4 address"},
    {exp: SimpleSchema.RegEx.IPv6, msg: "[label] must be a valid IPv6 address"},
    {exp: SimpleSchema.RegEx.Url, msg: "[label] must be a valid URL"},
    {exp: SimpleSchema.RegEx.Id, msg: "[label] must be a valid alphanumeric ID"}
  ],
  keyNotInSchema: "[key] is not allowed by the schema"
};

SimpleSchema.messages = function(messages) {
  _.extend(SimpleSchema._globalMessages, messages);
  SimpleSchema._depsGlobalMessages.changed();
};

// Schema-specific messages

SimpleSchema.prototype.messages = function(messages) {
  var self = this;
  _.extend(self._messages, messages);
  self._depsMessages.changed();
};

// Returns a string message for the given error type and key. Uses the
// def and value arguments to fill in placeholders in the error messages.
SimpleSchema.prototype.messageForError = function(type, key, def, value) {
  var self = this;

  // We proceed even if we can't get a definition because it might be a keyNotInSchema error
  def = def || self.getDefinition(key, ['regEx', 'label', 'minCount', 'maxCount', 'min', 'max', 'type']) || {};

  // Adjust for complex types, currently only regEx,
  // where we might have regEx.1 meaning the second
  // expression in the array.
  var firstTypePeriod = type.indexOf("."), index = null;
  if (firstTypePeriod !== -1) {
    index = type.substring(firstTypePeriod + 1);
    index = parseInt(index, 10);
    type = type.substring(0, firstTypePeriod);
  }

  // Which regExp is it?
  var regExpMatch;
  if (type === "regEx") {
    if (index !== null && index !== void 0 && !isNaN(index)) {
      regExpMatch = def.regEx[index];
    } else {
      regExpMatch = def.regEx;
    }
    if (regExpMatch) {
      regExpMatch = regExpMatch.toString();
    }
  }

  // Prep some strings to be used when finding the correct message for this error
  var typePlusKey = type + " " + key;
  var genericKey = SimpleSchema._makeGeneric(key);
  var typePlusGenKey = type + " " + genericKey;

  // reactively update when message templates are changed
  SimpleSchema._depsGlobalMessages.depend();
  self._depsMessages.depend();

  // Prep a function that finds the correct message for regEx errors
  function findRegExError(message) {
    if (type !== "regEx" || !_.isArray(message)) {
      return message;
    }
    // Parse regEx messages, which are provided in a special object array format
    // [{exp: RegExp, msg: "Foo"}]
    // Where `exp` is optional

    var msgObj;
    // First see if there's one where exp matches this expression
    if (regExpMatch) {
      msgObj = _.find(message, function (o) {
        return o.exp && o.exp.toString() === regExpMatch;
      });
    }

    // If not, see if there's a default message defined
    if (!msgObj) {
      msgObj = _.findWhere(message, {exp: null});
      if (!msgObj) {
        msgObj = _.findWhere(message, {exp: void 0});
      }
    }

    return msgObj ? msgObj.msg : null;
  }

  // Try finding the correct message to use at various levels, from most
  // specific to least specific.
  var message = self._messages[typePlusKey] ||                  // (1) Use schema-specific message for specific key
                self._messages[typePlusGenKey] ||               // (2) Use schema-specific message for generic key
                self._messages[type];                           // (3) Use schema-specific message for type
  message = findRegExError(message);

  if (!message) {
    message = SimpleSchema._globalMessages[typePlusKey] ||      // (4) Use global message for specific key
              SimpleSchema._globalMessages[typePlusGenKey] ||   // (5) Use global message for generic key
              SimpleSchema._globalMessages[type];               // (6) Use global message for type
    message = findRegExError(message);
  }

  if (!message) {
    return "Unknown validation error";
  }

  // Now replace all placeholders in the message with the correct values

  // [key]
  message = message.replace("[key]", key);

  // [label]
  // The call to self.label() establishes a reactive dependency, too
  message = message.replace("[label]", self.label(key));

  // [minCount]
  if (typeof def.minCount !== "undefined") {
    message = message.replace("[minCount]", def.minCount);
  }

  // [maxCount]
  if (typeof def.maxCount !== "undefined") {
    message = message.replace("[maxCount]", def.maxCount);
  }

  // [value]
  if (value !== void 0 && value !== null) {
    message = message.replace("[value]", value.toString());
  } else {
    message = message.replace("[value]", 'null');
  }

  // [min] and [max]
  var min = def.min;
  var max = def.max;
  if (def.type === Date || def.type === [Date]) {
    if (typeof min !== "undefined") {
      message = message.replace("[min]", Utility.dateToDateString(min));
    }
    if (typeof max !== "undefined") {
      message = message.replace("[max]", Utility.dateToDateString(max));
    }
  } else {
    if (typeof min !== "undefined") {
      message = message.replace("[min]", min);
    }
    if (typeof max !== "undefined") {
      message = message.replace("[max]", max);
    }
  }

  // [type]
  if (def.type instanceof Function) {
    message = message.replace("[type]", def.type.name);
  }

  // Now return the message
  return message;
};

// Returns true if key is explicitly allowed by the schema or implied
// by other explicitly allowed keys.
// The key string should have $ in place of any numeric array positions.
SimpleSchema.prototype.allowsKey = function(key) {
  var self = this;

  // Loop through all keys in the schema
  return _.any(self._schemaKeys, function(schemaKey) {

    // If the schema key is the test key, it's allowed.
    if (schemaKey === key) {
      return true;
    }

    // Black box handling
    if (self.schema(schemaKey).blackbox === true) {
      var kl = schemaKey.length;
      var compare1 = key.slice(0, kl + 2);
      var compare2 = compare1.slice(0, -1);

      // If the test key is the black box key + ".$", then the test
      // key is NOT allowed because black box keys are by definition
      // only for objects, and not for arrays.
      if (compare1 === schemaKey + '.$') {
        return false;
      }

      // Otherwise
      if (compare2 === schemaKey + '.') {
        return true;
      }
    }

    return false;
  });
};

SimpleSchema.prototype.newContext = function() {
  return new SimpleSchemaValidationContext(this);
};

// Returns all the child keys for the object identified by the generic prefix,
// or all the top level keys if no prefix is supplied.
SimpleSchema.prototype.objectKeys = function(keyPrefix) {
  var self = this;
  if (!keyPrefix) {
    return self._firstLevelSchemaKeys;
  }
  return self._objectKeys[keyPrefix + "."] || [];
};

SimpleSchema.prototype.validate = function (obj, options) {
  if (Package.check && Package['audit-argument-checks']) {
    // Call check but ignore the error to silence audit-argument-checks
    try { check(obj); } catch (e) { /* ignore error */ }
  }

  var validationContext = this.newContext();
  var isValid = validationContext.validate(obj, options);

  if (isValid) return;

  var errors = validationContext.invalidKeys().map(function (error) {
    return {
      name: error.name,
      type: error.type,
      details: {
        value: error.value
      }
    };
  });

  // In order for the message at the top of the stack trace to be useful,
  // we set it to the first validation error message.
  var message = validationContext.keyErrorMessage(errors[0].name);

  throw new Package['mdg:validation-error'].ValidationError(errors, message);
};

SimpleSchema.prototype.validator = function (options) {
  var self = this;
  options = options || {};
  return function (obj) {
    if (options.clean === true) self.clean(obj, options);
    self.validate(obj);
  };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/simple-schema-validation.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global Utility */
/* global _ */
/* global SimpleSchema */
/* global MongoObject */
/* global doValidation1:true */

function doTypeChecks(def, keyValue, op) {
  var expectedType = def.type;

  // String checks
  if (expectedType === String) {
    if (typeof keyValue !== "string") {
      return "expectedString";
    } else if (def.max !== null && def.max < keyValue.length) {
      return "maxString";
    } else if (def.min !== null && def.min > keyValue.length) {
      return "minString";
    } else if (def.regEx instanceof RegExp && !def.regEx.test(keyValue)) {
      return "regEx";
    } else if (_.isArray(def.regEx)) {
      var regExError;
      _.every(def.regEx, function(re, i) {
        if (!re.test(keyValue)) {
          regExError = "regEx." + i;
          return false;
        }
        return true;
      });
      if (regExError) {
        return regExError;
      }
    }
  }

  // Number checks
  else if (expectedType === Number) {
    if (typeof keyValue !== "number" || isNaN(keyValue)) {
      return "expectedNumber";
    } else if (op !== "$inc" && def.max !== null && (!!def.exclusiveMax ? def.max <= keyValue : def.max < keyValue)) {
       return !!def.exclusiveMax ? "maxNumberExclusive" : "maxNumber";
    } else if (op !== "$inc" && def.min !== null && (!!def.exclusiveMin ? def.min >= keyValue : def.min > keyValue)) {
       return !!def.exclusiveMin ? "minNumberExclusive" : "minNumber";
    } else if (!def.decimal && keyValue.toString().indexOf(".") > -1) {
      return "noDecimal";
    }
  }

  // Boolean checks
  else if (expectedType === Boolean) {
    if (typeof keyValue !== "boolean") {
      return "expectedBoolean";
    }
  }

  // Object checks
  else if (expectedType === Object) {
    if (!Utility.isBasicObject(keyValue)) {
      return "expectedObject";
    }
  }

  // Array checks
  else if (expectedType === Array) {
    if (!_.isArray(keyValue)) {
      return "expectedArray";
    } else if (def.minCount !== null && keyValue.length < def.minCount) {
      return "minCount";
    } else if (def.maxCount !== null && keyValue.length > def.maxCount) {
      return "maxCount";
    }
  }

  // Constructor function checks
  else if (expectedType instanceof Function || Utility.safariBugFix(expectedType)) {

    // Generic constructor checks
    if (!(keyValue instanceof expectedType)) {
      return "expectedConstructor";
    }

    // Date checks
    else if (expectedType === Date) {
      if (isNaN(keyValue.getTime())) {
        return "badDate";
      }

      if (_.isDate(def.min) && def.min.getTime() > keyValue.getTime()) {
        return "minDate";
      } else if (_.isDate(def.max) && def.max.getTime() < keyValue.getTime()) {
        return "maxDate";
      }
    }
  }

}

doValidation1 = function doValidation1(obj, isModifier, isUpsert, keyToValidate, ss, extendedCustomContext) {
  // First do some basic checks of the object, and throw errors if necessary
  if (!_.isObject(obj)) {
    throw new Error("The first argument of validate() or validateOne() must be an object");
  }

  if (!isModifier && Utility.looksLikeModifier(obj)) {
    throw new Error("When the validation object contains mongo operators, you must set the modifier option to true");
  }

  var invalidKeys = [];
  var mDoc; // for caching the MongoObject if necessary

  // Validation function called for each affected key
  function validate(val, affectedKey, affectedKeyGeneric, def, op, skipRequiredCheck, isInArrayItemObject, isInSubObject) {

    // Get the schema for this key, marking invalid if there isn't one.
    if (!def) {
      invalidKeys.push(Utility.errorObject("keyNotInSchema", affectedKey, val, def, ss));
      return;
    }

    // Check for missing required values. The general logic is this:
    // * If the operator is $unset or $rename, it's invalid.
    // * If the value is null, it's invalid.
    // * If the value is undefined and one of the following are true, it's invalid:
    //     * We're validating a key of a sub-object.
    //     * We're validating a key of an object that is an array item.
    //     * We're validating a document (as opposed to a modifier).
    //     * We're validating a key under the $set operator in a modifier, and it's an upsert.
    if (!skipRequiredCheck && !def.optional) {
      if (
        val === null ||
        op === "$unset" ||
        op === "$rename" ||
        (val === void 0 && (isInArrayItemObject || isInSubObject || !op || op === "$set"))
        ) {
        invalidKeys.push(Utility.errorObject("required", affectedKey, null, def, ss));
        return;
      }
    }

    // For $rename, make sure that the new name is allowed by the schema
    if (op === "$rename" && typeof val === "string" && !ss.allowsKey(val)) {
      invalidKeys.push(Utility.errorObject("keyNotInSchema", val, null, null, ss));
      return;
    }

    // Value checks are not necessary for null or undefined values
    // or for $unset or $rename values
    if (op !== "$unset" && op !== "$rename" && Utility.isNotNullOrUndefined(val)) {

      // Check that value is of the correct type
      var typeError = doTypeChecks(def, val, op);
      if (typeError) {
        invalidKeys.push(Utility.errorObject(typeError, affectedKey, val, def, ss));
        return;
      }

      // Check value against allowedValues array
      if (def.allowedValues && !_.contains(def.allowedValues, val)) {
        invalidKeys.push(Utility.errorObject("notAllowed", affectedKey, val, def, ss));
        return;
      }

    }

    // Perform custom validation
    var lastDot = affectedKey.lastIndexOf('.');
    var fieldParentName = lastDot === -1 ? '' : affectedKey.slice(0, lastDot + 1);
    var validators = def.custom ? [def.custom] : [];
    validators = validators.concat(ss._validators).concat(SimpleSchema._validators);
    _.every(validators, function(validator) {
      var errorType = validator.call(_.extend({
        key: affectedKey,
        genericKey: affectedKeyGeneric,
        definition: def,
        isSet: (val !== void 0),
        value: val,
        operator: op,
        field: function(fName) {
          mDoc = mDoc || new MongoObject(obj, ss._blackboxKeys); //create if necessary, cache for speed
          var keyInfo = mDoc.getInfoForKey(fName) || {};
          return {
            isSet: (keyInfo.value !== void 0),
            value: keyInfo.value,
            operator: keyInfo.operator
          };
        },
        siblingField: function(fName) {
          mDoc = mDoc || new MongoObject(obj, ss._blackboxKeys); //create if necessary, cache for speed
          var keyInfo = mDoc.getInfoForKey(fieldParentName + fName) || {};
          return {
            isSet: (keyInfo.value !== void 0),
            value: keyInfo.value,
            operator: keyInfo.operator
          };
        }
      }, extendedCustomContext || {}));
      if (typeof errorType === "string") {
        invalidKeys.push(Utility.errorObject(errorType, affectedKey, val, def, ss));
        return false;
      }
      return true;
    });
  }

  // The recursive function
  function checkObj(val, affectedKey, operator, setKeys, isInArrayItemObject, isInSubObject) {
    var affectedKeyGeneric, def;

    if (affectedKey) {
      // When we hit a blackbox key, we don't progress any further
      if (ss.keyIsInBlackBox(affectedKey)) {
        return;
      }

      // Make a generic version of the affected key, and use that
      // to get the schema for this key.
      affectedKeyGeneric = SimpleSchema._makeGeneric(affectedKey);
      def = ss.getDefinition(affectedKey);

      // Perform validation for this key
      if (!keyToValidate || keyToValidate === affectedKey || keyToValidate === affectedKeyGeneric) {
        // We can skip the required check for keys that are ancestors
        // of those in $set or $setOnInsert because they will be created
        // by MongoDB while setting.
        var skipRequiredCheck = _.some(setKeys, function(sk) {
          return (sk.slice(0, affectedKey.length + 1) === affectedKey + ".");
        });
        validate(val, affectedKey, affectedKeyGeneric, def, operator, skipRequiredCheck, isInArrayItemObject, isInSubObject);
      }
    }

    // Temporarily convert missing objects to empty objects
    // so that the looping code will be called and required
    // descendent keys can be validated.
    if ((val === void 0 || val === null) && (!def || (def.type === Object && !def.optional))) {
      val = {};
    }

    // Loop through arrays
    if (_.isArray(val)) {
      _.each(val, function(v, i) {
        checkObj(v, affectedKey + '.' + i, operator, setKeys);
      });
    }

    // Loop through object keys
    else if (Utility.isBasicObject(val) && (!def || !def.blackbox)) {

      // Get list of present keys
      var presentKeys = _.keys(val);

      // Check all present keys plus all keys defined by the schema.
      // This allows us to detect extra keys not allowed by the schema plus
      // any missing required keys, and to run any custom functions for other keys.
      var keysToCheck = _.union(presentKeys, ss.objectKeys(affectedKeyGeneric));

      // If this object is within an array, make sure we check for
      // required as if it's not a modifier
      isInArrayItemObject = (affectedKeyGeneric && affectedKeyGeneric.slice(-2) === ".$");

      // Check all keys in the merged list
      _.each(keysToCheck, function(key) {
        checkObj(val[key], Utility.appendAffectedKey(affectedKey, key), operator, setKeys, isInArrayItemObject, true);
      });
    }

  }

  function checkModifier(mod) {
    // Check for empty modifier
    if (_.isEmpty(mod)) {
      throw new Error("When the modifier option is true, validation object must have at least one operator");
    }

    // Get a list of all keys in $set and $setOnInsert combined, for use later
    var setKeys = _.keys(mod.$set || {}).concat(_.keys(mod.$setOnInsert || {}));

    // If this is an upsert, add all the $setOnInsert keys to $set;
    // since we don't know whether it will be an insert or update, we'll
    // validate upserts as if they will be an insert.
    if ("$setOnInsert" in mod) {
      if (isUpsert) {
        mod.$set = mod.$set || {};
        mod.$set = _.extend(mod.$set, mod.$setOnInsert);
      }
      delete mod.$setOnInsert;
    }

    // Loop through operators
    _.each(mod, function (opObj, op) {
      // If non-operators are mixed in, throw error
      if (op.slice(0, 1) !== "$") {
        throw new Error("When the modifier option is true, all validation object keys must be operators. Did you forget `$set`?");
      }
      if (Utility.shouldCheck(op)) {
        // For an upsert, missing props would not be set if an insert is performed,
        // so we add null keys to the modifier to force any "required" checks to fail
        if (isUpsert && op === "$set") {
          var presentKeys = _.keys(opObj);
          _.each(ss.objectKeys(), function (schemaKey) {
            if (!_.contains(presentKeys, schemaKey)) {
              checkObj(void 0, schemaKey, op, setKeys);
            }
          });
        }
        _.each(opObj, function (v, k) {
          if (op === "$push" || op === "$addToSet") {
            if (Utility.isBasicObject(v) && "$each" in v) {
              v = v.$each;
            } else {
              k = k + ".0";
            }
          }
          checkObj(v, k, op, setKeys);
        });
      }
    });
  }

  // Kick off the validation
  if (isModifier) {
    checkModifier(obj);
  } else {
    checkObj(obj);
  }

  // Make sure there is only one error per fieldName
  var addedFieldNames = [];
  invalidKeys = _.filter(invalidKeys, function(errObj) {
    if (!_.contains(addedFieldNames, errObj.name)) {
      addedFieldNames.push(errObj.name);
      return true;
    }
    return false;
  });

  return invalidKeys;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/simple-schema-validation-new.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global Utility */
/* global _ */
/* global SimpleSchema */
/* global MongoObject */
/* global Meteor */
/* global Random */
/* global doValidation2:true */

function doTypeChecks(def, keyValue, op) {
  var expectedType = def.type;

  // String checks
  if (expectedType === String) {
    if (typeof keyValue !== "string") {
      return "expectedString";
    } else if (def.max !== null && def.max < keyValue.length) {
      return "maxString";
    } else if (def.min !== null && def.min > keyValue.length) {
      return "minString";
    } else if (def.regEx instanceof RegExp && !def.regEx.test(keyValue)) {
      return "regEx";
    } else if (_.isArray(def.regEx)) {
      var regExError;
      _.every(def.regEx, function(re, i) {
        if (!re.test(keyValue)) {
          regExError = "regEx." + i;
          return false;
        }
        return true;
      });
      if (regExError) {
        return regExError;
      }
    }
  }

  // Number checks
  else if (expectedType === Number) {
    if (typeof keyValue !== "number" || isNaN(keyValue)) {
      return "expectedNumber";
    } else if (op !== "$inc" && def.max !== null && (!!def.exclusiveMax ? def.max <= keyValue : def.max < keyValue)) {
       return !!def.exclusiveMax ? "maxNumberExclusive" : "maxNumber";
    } else if (op !== "$inc" && def.min !== null && (!!def.exclusiveMin ? def.min >= keyValue : def.min > keyValue)) {
       return !!def.exclusiveMin ? "minNumberExclusive" : "minNumber";
    } else if (!def.decimal && keyValue.toString().indexOf(".") > -1) {
      return "noDecimal";
    }
  }

  // Boolean checks
  else if (expectedType === Boolean) {
    if (typeof keyValue !== "boolean") {
      return "expectedBoolean";
    }
  }

  // Object checks
  else if (expectedType === Object) {
    if (!Utility.isBasicObject(keyValue)) {
      return "expectedObject";
    }
  }

  // Array checks
  else if (expectedType === Array) {
    if (!_.isArray(keyValue)) {
      return "expectedArray";
    } else if (def.minCount !== null && keyValue.length < def.minCount) {
      return "minCount";
    } else if (def.maxCount !== null && keyValue.length > def.maxCount) {
      return "maxCount";
    }
  }

  // Constructor function checks
  else if (expectedType instanceof Function || Utility.safariBugFix(expectedType)) {

    // Generic constructor checks
    if (!(keyValue instanceof expectedType)) {
      return "expectedConstructor";
    }

    // Date checks
    else if (expectedType === Date) {
      if (isNaN(keyValue.getTime())) {
        return "badDate";
      }

      if (_.isDate(def.min) && def.min.getTime() > keyValue.getTime()) {
        return "minDate";
      } else if (_.isDate(def.max) && def.max.getTime() < keyValue.getTime()) {
        return "maxDate";
      }
    }
  }

}

doValidation2 = function doValidation2(obj, isModifier, isUpsert, keyToValidate, ss, extendedCustomContext) {

  // First do some basic checks of the object, and throw errors if necessary
  if (!_.isObject(obj)) {
    throw new Error("The first argument of validate() or validateOne() must be an object");
  }

  if (isModifier) {
    if (_.isEmpty(obj)) {
      throw new Error("When the modifier option is true, validation object must have at least one operator");
    } else {
      var allKeysAreOperators = _.every(obj, function(v, k) {
        return (k.substring(0, 1) === "$");
      });
      if (!allKeysAreOperators) {
        throw new Error("When the modifier option is true, all validation object keys must be operators");
      }

      // We use a LocalCollection to figure out what the resulting doc
      // would be in a worst case scenario. Then we validate that doc
      // so that we don't have to validate the modifier object directly.
      obj = convertModifierToDoc(obj, ss.schema(), isUpsert);
    }
  } else if (Utility.looksLikeModifier(obj)) {
    throw new Error("When the validation object contains mongo operators, you must set the modifier option to true");
  }

  var invalidKeys = [];
  var mDoc; // for caching the MongoObject if necessary

  // Validation function called for each affected key
  function validate(val, affectedKey, affectedKeyGeneric, def, op, skipRequiredCheck, strictRequiredCheck) {

    // Get the schema for this key, marking invalid if there isn't one.
    if (!def) {
      invalidKeys.push(Utility.errorObject("keyNotInSchema", affectedKey, val, def, ss));
      return;
    }

    // Check for missing required values. The general logic is this:
    // * If the operator is $unset or $rename, it's invalid.
    // * If the value is null, it's invalid.
    // * If the value is undefined and one of the following are true, it's invalid:
    //     * We're validating a key of a sub-object.
    //     * We're validating a key of an object that is an array item.
    //     * We're validating a document (as opposed to a modifier).
    //     * We're validating a key under the $set operator in a modifier, and it's an upsert.
    if (!skipRequiredCheck && !def.optional) {
      if (val === null || val === void 0) {
        invalidKeys.push(Utility.errorObject("required", affectedKey, null, def, ss));
        return;
      }
    }

    // Value checks are not necessary for null or undefined values
    if (Utility.isNotNullOrUndefined(val)) {

      // Check that value is of the correct type
      var typeError = doTypeChecks(def, val, op);
      if (typeError) {
        invalidKeys.push(Utility.errorObject(typeError, affectedKey, val, def, ss));
        return;
      }

      // Check value against allowedValues array
      if (def.allowedValues && !_.contains(def.allowedValues, val)) {
        invalidKeys.push(Utility.errorObject("notAllowed", affectedKey, val, def, ss));
        return;
      }

    }

    // Perform custom validation
    var lastDot = affectedKey.lastIndexOf('.');
    var fieldParentName = lastDot === -1 ? '' : affectedKey.slice(0, lastDot + 1);
    var validators = def.custom ? [def.custom] : [];
    validators = validators.concat(ss._validators).concat(SimpleSchema._validators);
    _.every(validators, function(validator) {
      var errorType = validator.call(_.extend({
        key: affectedKey,
        genericKey: affectedKeyGeneric,
        definition: def,
        isSet: (val !== void 0),
        value: val,
        operator: op,
        field: function(fName) {
          mDoc = mDoc || new MongoObject(obj, ss._blackboxKeys); //create if necessary, cache for speed
          var keyInfo = mDoc.getInfoForKey(fName) || {};
          return {
            isSet: (keyInfo.value !== void 0),
            value: keyInfo.value,
            operator: keyInfo.operator
          };
        },
        siblingField: function(fName) {
          mDoc = mDoc || new MongoObject(obj, ss._blackboxKeys); //create if necessary, cache for speed
          var keyInfo = mDoc.getInfoForKey(fieldParentName + fName) || {};
          return {
            isSet: (keyInfo.value !== void 0),
            value: keyInfo.value,
            operator: keyInfo.operator
          };
        }
      }, extendedCustomContext || {}));
      if (typeof errorType === "string") {
        invalidKeys.push(Utility.errorObject(errorType, affectedKey, val, def, ss));
        return false;
      }
      return true;
    });
  }

  // The recursive function
  function checkObj(val, affectedKey, skipRequiredCheck, strictRequiredCheck) {
    var affectedKeyGeneric, def;

    if (affectedKey) {

      // When we hit a blackbox key, we don't progress any further
      if (ss.keyIsInBlackBox(affectedKey)) {
        return;
      }

      // Make a generic version of the affected key, and use that
      // to get the schema for this key.
      affectedKeyGeneric = SimpleSchema._makeGeneric(affectedKey);
      def = ss.getDefinition(affectedKey);

      // Perform validation for this key
      if (!keyToValidate || keyToValidate === affectedKey || keyToValidate === affectedKeyGeneric) {
        validate(val, affectedKey, affectedKeyGeneric, def, null, skipRequiredCheck, strictRequiredCheck);
      }
    }

    // Temporarily convert missing objects to empty objects
    // so that the looping code will be called and required
    // descendent keys can be validated.
    if ((val === void 0 || val === null) && (!def || (def.type === Object && !def.optional))) {
      val = {};
    }

    // Loop through arrays
    if (_.isArray(val)) {
      _.each(val, function(v, i) {
        checkObj(v, affectedKey + '.' + i);
      });
    }

    // Loop through object keys
    else if (Utility.isBasicObject(val) && (!def || !def.blackbox)) {

      // Get list of present keys
      var presentKeys = _.keys(val);

      // Check all present keys plus all keys defined by the schema.
      // This allows us to detect extra keys not allowed by the schema plus
      // any missing required keys, and to run any custom functions for other keys.
      var keysToCheck = _.union(presentKeys, ss._schemaKeys);

      // If this object is within an array, make sure we check for
      // required as if it's not a modifier
      strictRequiredCheck = (affectedKeyGeneric && affectedKeyGeneric.slice(-2) === ".$");

      // Check all keys in the merged list
      _.each(keysToCheck, function(key) {
        if (Utility.shouldCheck(key)) {
          checkObj(val[key], Utility.appendAffectedKey(affectedKey, key), skipRequiredCheck, strictRequiredCheck);
        }
      });
    }

  }

  // Kick off the validation
  checkObj(obj);

  // Make sure there is only one error per fieldName
  var addedFieldNames = [];
  invalidKeys = _.filter(invalidKeys, function(errObj) {
    if (!_.contains(addedFieldNames, errObj.name)) {
      addedFieldNames.push(errObj.name);
      return true;
    }
    return false;
  });

  return invalidKeys;
};

function convertModifierToDoc(mod, schema, isUpsert) {
  // Create unmanaged LocalCollection as scratchpad
  var t = new Meteor.Collection(null);

  // LocalCollections are in memory, and it seems
  // that it's fine to use them synchronously on 
  // either client or server
  var id;
  if (isUpsert) {
    // We assume upserts will be inserts (conservative
    // validation of requiredness)
    id = Random.id();
    t.upsert({_id: id}, mod);
  } else {
    var mDoc = new MongoObject(mod);
    // Create a ficticious existing document
    var fakeDoc = new MongoObject({});
    _.each(schema, function (def, fieldName) {
      var setVal;
      // Prefill doc with empty arrays to avoid the
      // mongodb issue where it does not understand
      // that numeric pieces should create arrays.
      if (def.type === Array && mDoc.affectsGenericKey(fieldName)) {
        setVal = [];
      }
      // Set dummy values for required fields because
      // we assume any existing data would be valid.
      else if (!def.optional) {
        // TODO correct value type based on schema type
        if (def.type === Boolean) {
          setVal = true;
        } else if (def.type === Number) {
          setVal = def.min || 0;
        } else if (def.type === Date) {
          setVal = def.min || new Date();
        } else if (def.type === Array) {
          setVal = [];
        } else if (def.type === Object) {
          setVal = {};
        } else {
          setVal = "0";
        }
      }

      if (setVal !== void 0) {
        var key = fieldName.replace(/\.\$/g, ".0");
        var pos = MongoObject._keyToPosition(key, false);
        fakeDoc.setValueForPosition(pos, setVal);
      }
    });
    fakeDoc = fakeDoc.getObject();
    // Insert fake doc into local scratch collection
    id = t.insert(fakeDoc);
    // Now update it with the modifier
    t.update(id, mod);
  }
  
  var doc = t.findOne(id);
  // We're done with it
  t.remove(id);
  // Currently we don't validate _id unless it is
  // explicitly added to the schema
  if (!schema._id) {
    delete doc._id;
  }
  return doc;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/aldeed_simple-schema/simple-schema-context.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global SimpleSchema */
/* global SimpleSchemaValidationContext:true */
/* global doValidation1 */
/* global doValidation2 */

function doValidation(obj, isModifier, isUpsert, keyToValidate, ss, extendedCustomContext) {
  var useOld = true; //for now this can be manually changed to try the experimental method, which doesn't yet work properly
  var func = useOld ? doValidation1 : doValidation2;
  return func(obj, isModifier, isUpsert, keyToValidate, ss, extendedCustomContext);
}

/*
 * PUBLIC API
 */

SimpleSchemaValidationContext = function SimpleSchemaValidationContext(ss) {
  var self = this;
  self._simpleSchema = ss;
  self._schema = ss.schema();
  self._schemaKeys = _.keys(self._schema);
  self._invalidKeys = [];
  //set up validation dependencies
  self._deps = {};
  self._depsAny = new Deps.Dependency();
  _.each(self._schemaKeys, function(name) {
    self._deps[name] = new Deps.Dependency();
  });
};

//validates the object against the simple schema and sets a reactive array of error objects
SimpleSchemaValidationContext.prototype.validate = function simpleSchemaValidationContextValidate(doc, options) {
  var self = this;
  options = _.extend({
    modifier: false,
    upsert: false,
    extendedCustomContext: {}
  }, options || {});

  //on the client we can add the userId if not already in the custom context
  if (Meteor.isClient && options.extendedCustomContext.userId === void 0) {
    options.extendedCustomContext.userId = (Meteor.userId && Meteor.userId()) || null;
  }

  var invalidKeys = doValidation(doc, options.modifier, options.upsert, null, self._simpleSchema, options.extendedCustomContext);

  //now update self._invalidKeys and dependencies

  //note any currently invalid keys so that we can mark them as changed
  //due to new validation (they may be valid now, or invalid in a different way)
  var removedKeys = _.pluck(self._invalidKeys, "name");

  //update
  self._invalidKeys = invalidKeys;

  //add newly invalid keys to changedKeys
  var addedKeys = _.pluck(self._invalidKeys, "name");

  //mark all changed keys as changed
  var changedKeys = _.union(addedKeys, removedKeys);
  self._markKeysChanged(changedKeys);

  // Return true if it was valid; otherwise, return false
  return self._invalidKeys.length === 0;
};

//validates doc against self._schema for one key and sets a reactive array of error objects
SimpleSchemaValidationContext.prototype.validateOne = function simpleSchemaValidationContextValidateOne(doc, keyName, options) {
  var self = this, i, ln, k;
  options = _.extend({
    modifier: false,
    upsert: false,
    extendedCustomContext: {}
  }, options || {});

  //on the client we can add the userId if not already in the custom context
  if (Meteor.isClient && options.extendedCustomContext.userId === void 0) {
    options.extendedCustomContext.userId = (Meteor.userId && Meteor.userId()) || null;
  }

  var invalidKeys = doValidation(doc, options.modifier, options.upsert, keyName, self._simpleSchema, options.extendedCustomContext);

  //now update self._invalidKeys and dependencies

  //remove objects from self._invalidKeys where name = keyName
  var newInvalidKeys = [];
  for (i = 0, ln = self._invalidKeys.length; i < ln; i++) {
    k = self._invalidKeys[i];
    if (k.name !== keyName) {
      newInvalidKeys.push(k);
    }
  }
  self._invalidKeys = newInvalidKeys;

  //merge invalidKeys into self._invalidKeys
  for (i = 0, ln = invalidKeys.length; i < ln; i++) {
    k = invalidKeys[i];
    self._invalidKeys.push(k);
  }

  //mark key as changed due to new validation (they may be valid now, or invalid in a different way)
  self._markKeysChanged([keyName]);

  // Return true if it was valid; otherwise, return false
  return !self._keyIsInvalid(keyName);
};

//reset the invalidKeys array
SimpleSchemaValidationContext.prototype.resetValidation = function simpleSchemaValidationContextResetValidation() {
  var self = this;
  var removedKeys = _.pluck(self._invalidKeys, "name");
  self._invalidKeys = [];
  self._markKeysChanged(removedKeys);
};

SimpleSchemaValidationContext.prototype.isValid = function simpleSchemaValidationContextIsValid() {
  var self = this;
  self._depsAny.depend();
  return !self._invalidKeys.length;
};

SimpleSchemaValidationContext.prototype.invalidKeys = function simpleSchemaValidationContextInvalidKeys() {
  var self = this;
  self._depsAny.depend();
  return self._invalidKeys;
};

SimpleSchemaValidationContext.prototype.addInvalidKeys = function simpleSchemaValidationContextAddInvalidKeys(errors) {
  var self = this;

  if (!errors || !errors.length) {
    return;
  }

  var changedKeys = [];
  _.each(errors, function (errorObject) {
    changedKeys.push(errorObject.name);
    self._invalidKeys.push(errorObject);
  });

  self._markKeysChanged(changedKeys);
};

SimpleSchemaValidationContext.prototype._markKeysChanged = function simpleSchemaValidationContextMarkKeysChanged(keys) {
  var self = this;

  if (!keys || !keys.length) {
    return;
  }

  _.each(keys, function(name) {
    var genericName = SimpleSchema._makeGeneric(name);
    if (genericName in self._deps) {
      self._deps[genericName].changed();
    }
  });
  self._depsAny.changed();
};

SimpleSchemaValidationContext.prototype._getInvalidKeyObject = function simpleSchemaValidationContextGetInvalidKeyObject(name, genericName) {
  var self = this;
  genericName = genericName || SimpleSchema._makeGeneric(name);

  var errorObj = _.findWhere(self._invalidKeys, {name: name});
  if (!errorObj) {
    errorObj = _.findWhere(self._invalidKeys, {name: genericName});
  }
  return errorObj;
};

SimpleSchemaValidationContext.prototype._keyIsInvalid = function simpleSchemaValidationContextKeyIsInvalid(name, genericName) {
  return !!this._getInvalidKeyObject(name, genericName);
};

// Like the internal one, but with deps
SimpleSchemaValidationContext.prototype.keyIsInvalid = function simpleSchemaValidationContextKeyIsInvalid(name) {
  var self = this, genericName = SimpleSchema._makeGeneric(name);
  self._deps[genericName] && self._deps[genericName].depend();

  return self._keyIsInvalid(name, genericName);
};

SimpleSchemaValidationContext.prototype.keyErrorMessage = function simpleSchemaValidationContextKeyErrorMessage(name) {
  var self = this, genericName = SimpleSchema._makeGeneric(name);
  self._deps[genericName] && self._deps[genericName].depend();
  
  var errorObj = self._getInvalidKeyObject(name, genericName);
  if (!errorObj) {
    return "";
  }
  
  return self._simpleSchema.messageForError(errorObj.type, errorObj.name, null, errorObj.value);
};

SimpleSchemaValidationContext.prototype.getErrorObject = function simpleSchemaValidationContextGetErrorObject() {
  var self = this, message, invalidKeys = this._invalidKeys;
  if (invalidKeys.length) {
    message = self.keyErrorMessage(invalidKeys[0].name);
    // We add `message` prop to the invalidKeys.
    invalidKeys = _.map(invalidKeys, function (o) {
      return _.extend({message: self.keyErrorMessage(o.name)}, o);
    });
  } else {
    message = "Failed validation";
  }
  var error = new Error(message);
  error.invalidKeys = invalidKeys;
  // If on the server, we add a sanitized error, too, in case we're
  // called from a method.
  if (Meteor.isServer) {
    error.sanitizedError = new Meteor.Error(400, message);
  }
  return error;
};

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
