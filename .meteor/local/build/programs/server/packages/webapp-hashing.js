(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var WebAppHashing;

var require = meteorInstall({"node_modules":{"meteor":{"webapp-hashing":{"webapp-hashing.js":function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/webapp-hashing/webapp-hashing.js                                                               //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
var crypto = Npm.require("crypto");                                                                        // 1
                                                                                                           //
WebAppHashing = {}; // Calculate a hash of all the client resources downloaded by the                      // 3
// browser, including the application HTML, runtime config, code, and                                      // 6
// static files.                                                                                           // 7
//                                                                                                         // 8
// This hash *must* change if any resources seen by the browser                                            // 9
// change, and ideally *doesn't* change for any server-only changes                                        // 10
// (but the second is a performance enhancement, not a hard                                                // 11
// requirement).                                                                                           // 12
                                                                                                           //
WebAppHashing.calculateClientHash = function (manifest, includeFilter, runtimeConfigOverride) {            // 14
  var hash = crypto.createHash('sha1'); // Omit the old hashed client values in the new hash. These may be
  // modified in the new boilerplate.                                                                      // 19
                                                                                                           //
  var runtimeCfg = _.omit(__meteor_runtime_config__, ['autoupdateVersion', 'autoupdateVersionRefreshable', 'autoupdateVersionCordova']);
                                                                                                           //
  if (runtimeConfigOverride) {                                                                             // 24
    runtimeCfg = runtimeConfigOverride;                                                                    // 25
  }                                                                                                        // 26
                                                                                                           //
  hash.update(JSON.stringify(runtimeCfg, 'utf8'));                                                         // 28
                                                                                                           //
  _.each(manifest, function (resource) {                                                                   // 30
    if ((!includeFilter || includeFilter(resource.type)) && (resource.where === 'client' || resource.where === 'internal')) {
      hash.update(resource.path);                                                                          // 33
      hash.update(resource.hash);                                                                          // 34
    }                                                                                                      // 35
  });                                                                                                      // 36
                                                                                                           //
  return hash.digest('hex');                                                                               // 37
};                                                                                                         // 38
                                                                                                           //
WebAppHashing.calculateCordovaCompatibilityHash = function (platformVersion, pluginVersions) {             // 40
  var hash = crypto.createHash('sha1');                                                                    // 42
  hash.update(platformVersion); // Sort plugins first so iteration order doesn't affect the hash           // 44
                                                                                                           //
  var plugins = Object.keys(pluginVersions).sort();                                                        // 47
                                                                                                           //
  for (var _iterator = plugins, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;                                                                                              // 48
                                                                                                           //
    if (_isArray) {                                                                                        // 48
      if (_i >= _iterator.length) break;                                                                   // 48
      _ref = _iterator[_i++];                                                                              // 48
    } else {                                                                                               // 48
      _i = _iterator.next();                                                                               // 48
      if (_i.done) break;                                                                                  // 48
      _ref = _i.value;                                                                                     // 48
    }                                                                                                      // 48
                                                                                                           //
    var plugin = _ref;                                                                                     // 48
    var version = pluginVersions[plugin];                                                                  // 49
    hash.update(plugin);                                                                                   // 50
    hash.update(version);                                                                                  // 51
  }                                                                                                        // 52
                                                                                                           //
  return hash.digest('hex');                                                                               // 54
};                                                                                                         // 55
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/webapp-hashing/webapp-hashing.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['webapp-hashing'] = {}, {
  WebAppHashing: WebAppHashing
});

})();

//# sourceMappingURL=webapp-hashing.js.map
