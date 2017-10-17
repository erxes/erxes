(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;

/* Package-scope variables */
var EventEmitter;

(function(){

////////////////////////////////////////////////////////////////////////////
//                                                                        //
// packages/raix_eventemitter/packages/raix_eventemitter.js               //
//                                                                        //
////////////////////////////////////////////////////////////////////////////
                                                                          //
(function () {

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/raix:eventemitter/eventemitter.server.js                 //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
/* global EventEmitter: true */                                      // 1
EventEmitter = Npm.require('events').EventEmitter;                   // 2
                                                                     // 3
///////////////////////////////////////////////////////////////////////

}).call(this);

////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['raix:eventemitter'] = {}, {
  EventEmitter: EventEmitter
});

})();
