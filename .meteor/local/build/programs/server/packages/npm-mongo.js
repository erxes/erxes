(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;

/* Package-scope variables */
var NpmModuleMongodb, NpmModuleMongodbVersion;

(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// packages/npm-mongo/wrapper.js                                       //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
NpmModuleMongodb = Npm.require('mongodb');
NpmModuleMongodbVersion = Npm.require('mongodb/package.json').version;

/////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['npm-mongo'] = {}, {
  NpmModuleMongodb: NpmModuleMongodb,
  NpmModuleMongodbVersion: NpmModuleMongodbVersion
});

})();
