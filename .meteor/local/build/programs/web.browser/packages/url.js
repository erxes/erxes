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

/* Package-scope variables */
var URL, buildUrl;

(function(){

////////////////////////////////////////////////////////////////////////////
//                                                                        //
// packages/url/url_common.js                                             //
//                                                                        //
////////////////////////////////////////////////////////////////////////////
                                                                          //
URL = {};                                                                 // 1
                                                                          // 2
var encodeString = function (str) {                                       // 3
  return encodeURIComponent(str).replace(/\*/g, '%2A');                   // 4
};                                                                        // 5
                                                                          // 6
// Encode URL paramaters into a query string, handling nested objects and
// arrays properly.                                                       // 8
URL._encodeParams = function (params, prefix) {                           // 9
  var str = [];                                                           // 10
  var isParamsArray = Array.isArray(params);                              // 11
  for (var p in params) {                                                 // 12
    if (Object.prototype.hasOwnProperty.call(params, p)) {                // 13
      var k = prefix ? prefix + '[' + (isParamsArray ? '' : p) + ']' : p;
      var v = params[p];                                                  // 15
      if (typeof v === 'object') {                                        // 16
        str.push(this._encodeParams(v, k));                               // 17
      } else {                                                            // 18
        var encodedKey =                                                  // 19
          encodeString(k).replace('%5B', '[').replace('%5D', ']');        // 20
        str.push(encodedKey + '=' + encodeString(v));                     // 21
      }                                                                   // 22
    }                                                                     // 23
  }                                                                       // 24
  return str.join('&').replace(/%20/g, '+');                              // 25
};                                                                        // 26
                                                                          // 27
buildUrl = function(before_qmark, from_qmark, opt_query, opt_params) {    // 28
  var url_without_query = before_qmark;                                   // 29
  var query = from_qmark ? from_qmark.slice(1) : null;                    // 30
                                                                          // 31
  if (typeof opt_query === "string")                                      // 32
    query = String(opt_query);                                            // 33
                                                                          // 34
  if (opt_params) {                                                       // 35
    query = query || "";                                                  // 36
    var prms = URL._encodeParams(opt_params);                             // 37
    if (query && prms)                                                    // 38
      query += '&';                                                       // 39
    query += prms;                                                        // 40
  }                                                                       // 41
                                                                          // 42
  var url = url_without_query;                                            // 43
  if (query !== null)                                                     // 44
    url += ("?"+query);                                                   // 45
                                                                          // 46
  return url;                                                             // 47
};                                                                        // 48
                                                                          // 49
////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////
//                                                                        //
// packages/url/url_client.js                                             //
//                                                                        //
////////////////////////////////////////////////////////////////////////////
                                                                          //
URL._constructUrl = function (url, query, params) {                       // 1
  var query_match = /^(.*?)(\?.*)?$/.exec(url);                           // 2
  return buildUrl(query_match[1], query_match[2], query, params);         // 3
};                                                                        // 4
                                                                          // 5
////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.url = {}, {
  URL: URL
});

})();
