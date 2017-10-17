(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var meteorBabelHelpers;

var require = meteorInstall({"node_modules":{"meteor":{"babel-runtime":{"babel-runtime.js":["meteor-babel-helpers","babel-runtime/regenerator",function(require,exports){

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// packages/babel-runtime/babel-runtime.js                                    //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
                                                                              //
exports.meteorBabelHelpers = require("meteor-babel-helpers");

// Returns true if a given absolute identifier will be provided at runtime
// by the babel-runtime package.
exports.checkHelper = function checkHelper(id) {
  // There used to be more complicated logic here, when the babel-runtime
  // package provided helper implementations of its own, but now this
  // function exists just for backwards compatibility.
  return false;
};

try {
  var regeneratorRuntime = require("babel-runtime/regenerator");
} catch (e) {
  throw new Error([
    "The babel-runtime npm package could not be found in your node_modules ",
    "directory. Please run the following command to install it:",
    "",
    "  meteor npm install --save babel-runtime",
    ""
  ].join("\n"));
}

if (regeneratorRuntime &&
    typeof Promise === "function" &&
    typeof Promise.asyncApply === "function") {
  // If Promise.asyncApply is defined, use it to wrap calls to
  // runtime.async so that the entire async function will run in its own
  // Fiber, not just the code that comes after the first await.
  var realAsync = regeneratorRuntime.async;
  regeneratorRuntime.async = function () {
    return Promise.asyncApply(realAsync, regeneratorRuntime, arguments);
  };
}

////////////////////////////////////////////////////////////////////////////////

}],"node_modules":{"meteor-babel-helpers":{"package.json":function(require,exports){

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// ../../.1.0.1.mvduck++os+web.browser+web.cordova/npm/node_modules/meteor-ba //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
                                                                              //
exports.name = "meteor-babel-helpers";
exports.version = "0.0.3";
exports.main = "index.js";

////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// node_modules/meteor/babel-runtime/node_modules/meteor-babel-helpers/index. //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
                                                                              //
function canDefineNonEnumerableProperties() {
  var testObj = {};
  var testPropName = "t";

  try {
    Object.defineProperty(testObj, testPropName, {
      enumerable: false,
      value: testObj
    });

    for (var k in testObj) {
      if (k === testPropName) {
        return false;
      }
    }
  } catch (e) {
    return false;
  }

  return testObj[testPropName] === testObj;
}

function sanitizeEasy(value) {
  return value;
}

function sanitizeHard(obj) {
  if (Array.isArray(obj)) {
    var newObj = {};
    var keys = Object.keys(obj);
    var keyCount = keys.length;
    for (var i = 0; i < keyCount; ++i) {
      var key = keys[i];
      newObj[key] = obj[key];
    }
    return newObj;
  }

  return obj;
}

meteorBabelHelpers = module.exports = {
  // Meteor-specific runtime helper for wrapping the object of for-in
  // loops, so that inherited Array methods defined by es5-shim can be
  // ignored in browsers where they cannot be defined as non-enumerable.
  sanitizeForInObject: canDefineNonEnumerableProperties()
    ? sanitizeEasy
    : sanitizeHard,

  // Exposed so that we can test sanitizeForInObject in environments that
  // support defining non-enumerable properties.
  _sanitizeForInObjectHard: sanitizeHard
};

////////////////////////////////////////////////////////////////////////////////

}}}}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/babel-runtime/babel-runtime.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['babel-runtime'] = exports, {
  meteorBabelHelpers: meteorBabelHelpers
});

})();
