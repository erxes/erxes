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
var Mongo = Package.mongo.Mongo;

(function(){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// packages/dburles_collection-helpers/collection-helpers.js                //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
Mongo.Collection.prototype.helpers = function(helpers) {                    // 1
  var self = this;                                                          // 2
                                                                            // 3
  if (self._transform && ! self._helpers)                                   // 4
    throw new Meteor.Error("Can't apply helpers to '" +                     // 5
      self._name + "' a transform function already exists!");               // 6
                                                                            // 7
  if (! self._helpers) {                                                    // 8
    self._helpers = function Document(doc) { return _.extend(this, doc); };
    self._transform = function(doc) {                                       // 10
      return new self._helpers(doc);                                        // 11
    };                                                                      // 12
  }                                                                         // 13
                                                                            // 14
  _.each(helpers, function(helper, key) {                                   // 15
    self._helpers.prototype[key] = helper;                                  // 16
  });                                                                       // 17
};                                                                          // 18
                                                                            // 19
//////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['dburles:collection-helpers'] = {};

})();
