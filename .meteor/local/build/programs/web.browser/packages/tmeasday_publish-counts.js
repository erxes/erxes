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
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var Counts;

(function(){

/////////////////////////////////////////////////////////////////////////////////////
//                                                                                 //
// packages/tmeasday_publish-counts/client/publish-counts.js                       //
//                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////
                                                                                   //
Counts = new Mongo.Collection('counts');                                           // 1
                                                                                   // 2
Counts.get = function countsGet (name) {                                           // 3
  var count = this.findOne(name);                                                  // 4
  return count && count.count || 0;                                                // 5
};                                                                                 // 6
                                                                                   // 7
Counts.has = function countsHas (name) {                                           // 8
  return !!this.findOne(name);                                                     // 9
};                                                                                 // 10
                                                                                   // 11
if (Package.templating) {                                                          // 12
  Package.templating.Template.registerHelper('getPublishedCount', function(name) {
    return Counts.get(name);                                                       // 14
  });                                                                              // 15
                                                                                   // 16
  Package.templating.Template.registerHelper('hasPublishedCount', function(name) {
    return Counts.has(name);                                                       // 18
  });                                                                              // 19
}                                                                                  // 20
                                                                                   // 21
/////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['tmeasday:publish-counts'] = {}, {
  Counts: Counts
});

})();
