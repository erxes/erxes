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
var Symbol, Map, Set;

var require = meteorInstall({"node_modules":{"meteor":{"ecmascript-runtime":{"runtime.js":["meteor-ecmascript-runtime",function(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/ecmascript-runtime/runtime.js                            //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
// TODO Allow just api.mainModule("meteor-ecmascript-runtime");
module.exports = require("meteor-ecmascript-runtime");

///////////////////////////////////////////////////////////////////////

}],"node_modules":{"meteor-ecmascript-runtime":{"package.json":function(require,exports){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// ../../.0.3.15.5nl5kj++os+web.browser+web.cordova/npm/node_modules //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
exports.name = "meteor-ecmascript-runtime";
exports.version = "0.2.9";
exports.main = "index.js";

///////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// node_modules/meteor/ecmascript-runtime/node_modules/meteor-ecmasc //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
require("core-js/es6/object");
require("core-js/es6/array");
require("core-js/es6/string");
require("core-js/es6/function");
require("core-js/fn/array/includes");
require("core-js/fn/object/values");
require("core-js/fn/object/entries");
require("core-js/fn/object/get-own-property-descriptors");
require("core-js/fn/string/pad-start");
require("core-js/fn/string/pad-end");
require("core-js/fn/string/trim-start");
require("core-js/fn/string/trim-end");

Symbol = exports.Symbol = global.Symbol ||
  require("core-js/es6/symbol");

Map = exports.Map = require("core-js/es6/map");
Set = exports.Set = require("core-js/es6/set");

///////////////////////////////////////////////////////////////////////

}}}}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/ecmascript-runtime/runtime.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['ecmascript-runtime'] = exports, {
  Symbol: Symbol,
  Map: Map,
  Set: Set
});

})();
