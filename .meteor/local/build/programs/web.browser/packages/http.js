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
var URL = Package.url.URL;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var makeErrorByStatus, populateData, HTTP;

var require = meteorInstall({"node_modules":{"meteor":{"http":{"httpcall_common.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/http/httpcall_common.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var MAX_LENGTH = 500; // if you change this, also change the appropriate test                                          // 1
                                                                                                                       //
makeErrorByStatus = function (statusCode, content) {                                                                   // 3
  var message = "failed [" + statusCode + "]";                                                                         // 4
                                                                                                                       //
  if (content) {                                                                                                       // 6
    var stringContent = typeof content == "string" ? content : content.toString();                                     // 7
    message += ' ' + truncate(stringContent.replace(/\n/g, ' '), MAX_LENGTH);                                          // 10
  }                                                                                                                    // 11
                                                                                                                       //
  return new Error(message);                                                                                           // 13
};                                                                                                                     // 14
                                                                                                                       //
function truncate(str, length) {                                                                                       // 16
  return str.length > length ? str.slice(0, length) + '...' : str;                                                     // 17
} // Fill in `response.data` if the content-type is JSON.                                                              // 18
                                                                                                                       //
                                                                                                                       //
populateData = function (response) {                                                                                   // 21
  // Read Content-Type header, up to a ';' if there is one.                                                            // 22
  // A typical header might be "application/json; charset=utf-8"                                                       // 23
  // or just "application/json".                                                                                       // 24
  var contentType = (response.headers['content-type'] || ';').split(';')[0]; // Only try to parse data as JSON if server sets correct content type.
                                                                                                                       //
  if (_.include(['application/json', 'text/javascript', 'application/javascript', 'application/x-javascript'], contentType)) {
    try {                                                                                                              // 30
      response.data = JSON.parse(response.content);                                                                    // 31
    } catch (err) {                                                                                                    // 32
      response.data = null;                                                                                            // 33
    }                                                                                                                  // 34
  } else {                                                                                                             // 35
    response.data = null;                                                                                              // 36
  }                                                                                                                    // 37
};                                                                                                                     // 38
                                                                                                                       //
HTTP = {}; /**                                                                                                         // 40
            * @summary Send an HTTP `GET` request. Equivalent to calling [`HTTP.call`](#http_call) with "GET" as the first argument.
            * @param {String} url The URL to which the request should be sent.                                         //
            * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                            //
            * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client.
            * @locus Anywhere                                                                                          //
            */                                                                                                         //
                                                                                                                       //
HTTP.get = function () /* varargs */{                                                                                  // 49
  return HTTP.call.apply(this, ["GET"].concat(_.toArray(arguments)));                                                  // 50
}; /**                                                                                                                 // 51
    * @summary Send an HTTP `POST` request. Equivalent to calling [`HTTP.call`](#http_call) with "POST" as the first argument.
    * @param {String} url The URL to which the request should be sent.                                                 //
    * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    //
    * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client.
    * @locus Anywhere                                                                                                  //
    */                                                                                                                 //
                                                                                                                       //
HTTP.post = function () /* varargs */{                                                                                 // 60
  return HTTP.call.apply(this, ["POST"].concat(_.toArray(arguments)));                                                 // 61
}; /**                                                                                                                 // 62
    * @summary Send an HTTP `PUT` request. Equivalent to calling [`HTTP.call`](#http_call) with "PUT" as the first argument.
    * @param {String} url The URL to which the request should be sent.                                                 //
    * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    //
    * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client.
    * @locus Anywhere                                                                                                  //
    */                                                                                                                 //
                                                                                                                       //
HTTP.put = function () /* varargs */{                                                                                  // 71
  return HTTP.call.apply(this, ["PUT"].concat(_.toArray(arguments)));                                                  // 72
}; /**                                                                                                                 // 73
    * @summary Send an HTTP `DELETE` request. Equivalent to calling [`HTTP.call`](#http_call) with "DELETE" as the first argument. (Named `del` to avoid conflict with the Javascript keyword `delete`)
    * @param {String} url The URL to which the request should be sent.                                                 //
    * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    //
    * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client.
    * @locus Anywhere                                                                                                  //
    */                                                                                                                 //
                                                                                                                       //
HTTP.del = function () /* varargs */{                                                                                  // 82
  return HTTP.call.apply(this, ["DELETE"].concat(_.toArray(arguments)));                                               // 83
}; /**                                                                                                                 // 84
    * @summary Send an HTTP `PATCH` request. Equivalent to calling [`HTTP.call`](#http_call) with "PATCH" as the first argument.
    * @param {String} url The URL to which the request should be sent.                                                 //
    * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    //
    * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client.
    * @locus Anywhere                                                                                                  //
    */                                                                                                                 //
                                                                                                                       //
HTTP.patch = function () /* varargs */{                                                                                // 93
  return HTTP.call.apply(this, ["PATCH"].concat(_.toArray(arguments)));                                                // 94
};                                                                                                                     // 95
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"httpcall_client.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/http/httpcall_client.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    // 1
 * @summary Perform an outbound HTTP request.                                                                          //
 * @locus Anywhere                                                                                                     //
 * @param {String} method The [HTTP method](http://en.wikipedia.org/wiki/HTTP_method) to use, such as "`GET`", "`POST`", or "`HEAD`".
 * @param {String} url The URL to retrieve.                                                                            //
 * @param {Object} [options]                                                                                           //
 * @param {String} options.content String to use as the HTTP request body.                                             //
 * @param {Object} options.data JSON-able object to stringify and use as the HTTP request body. Overwrites `content`.  //
 * @param {String} options.query Query string to go in the URL. Overwrites any query string in `url`.                  //
 * @param {Object} options.params Dictionary of request parameters to be encoded and placed in the URL (for GETs) or request body (for POSTs).  If `content` or `data` is specified, `params` will always be placed in the URL.
 * @param {String} options.auth HTTP basic authentication string of the form `"username:password"`                     //
 * @param {Object} options.headers Dictionary of strings, headers to add to the HTTP request.                          //
 * @param {Number} options.timeout Maximum time in milliseconds to wait for the request before failing.  There is no timeout by default.
 * @param {Boolean} options.followRedirects If `true`, transparently follow HTTP redirects. Cannot be set to `false` on the client. Default `true`.
 * @param {Object} options.npmRequestOptions On the server, `HTTP.call` is implemented by using the [npm `request` module](https://www.npmjs.com/package/request). Any options in this object will be passed directly to the `request` invocation.
 * @param {Function} options.beforeSend On the client, this will be called before the request is sent to allow for more direct manipulation of the underlying XMLHttpRequest object, which will be passed as the first argument. If the callback returns `false`, the request will be not be send.
 * @param {Function} [asyncCallback] Optional callback.  If passed, the method runs asynchronously, instead of synchronously, and calls asyncCallback.  On the client, this callback is required.
 */HTTP.call = function (method, url, options, callback) {                                                             //
  ////////// Process arguments //////////                                                                              // 21
  if (!callback && typeof options === "function") {                                                                    // 23
    // support (method, url, callback) argument list                                                                   // 24
    callback = options;                                                                                                // 25
    options = null;                                                                                                    // 26
  }                                                                                                                    // 27
                                                                                                                       //
  options = options || {};                                                                                             // 29
  if (typeof callback !== "function") throw new Error("Can't make a blocking HTTP call from the client; callback required.");
  method = (method || "").toUpperCase();                                                                               // 35
  var headers = {};                                                                                                    // 37
  var content = options.content;                                                                                       // 39
                                                                                                                       //
  if (options.data) {                                                                                                  // 40
    content = JSON.stringify(options.data);                                                                            // 41
    headers['Content-Type'] = 'application/json';                                                                      // 42
  }                                                                                                                    // 43
                                                                                                                       //
  var params_for_url, params_for_body;                                                                                 // 45
  if (content || method === "GET" || method === "HEAD") params_for_url = options.params;else params_for_body = options.params;
  url = URL._constructUrl(url, options.query, params_for_url);                                                         // 51
  if (options.followRedirects === false) throw new Error("Option followRedirects:false not supported on client.");     // 53
                                                                                                                       //
  if (_.has(options, 'npmRequestOptions')) {                                                                           // 56
    throw new Error("Option npmRequestOptions not supported on client.");                                              // 57
  }                                                                                                                    // 58
                                                                                                                       //
  var username, password;                                                                                              // 60
                                                                                                                       //
  if (options.auth) {                                                                                                  // 61
    var colonLoc = options.auth.indexOf(':');                                                                          // 62
    if (colonLoc < 0) throw new Error('auth option should be of the form "username:password"');                        // 63
    username = options.auth.substring(0, colonLoc);                                                                    // 65
    password = options.auth.substring(colonLoc + 1);                                                                   // 66
  }                                                                                                                    // 67
                                                                                                                       //
  if (params_for_body) {                                                                                               // 69
    content = URL._encodeParams(params_for_body);                                                                      // 70
  }                                                                                                                    // 71
                                                                                                                       //
  _.extend(headers, options.headers || {}); ////////// Callback wrapping //////////                                    // 73
  // wrap callback to add a 'response' property on an error, in case                                                   // 77
  // we have both (http 4xx/5xx error, which has a response payload)                                                   // 78
                                                                                                                       //
                                                                                                                       //
  callback = function (callback) {                                                                                     // 79
    return function (error, response) {                                                                                // 80
      if (error && response) error.response = response;                                                                // 81
      callback(error, response);                                                                                       // 83
    };                                                                                                                 // 84
  }(callback); // safety belt: only call the callback once.                                                            // 85
                                                                                                                       //
                                                                                                                       //
  callback = _.once(callback); ////////// Kickoff! //////////                                                          // 88
  // from this point on, errors are because of something remote, not                                                   // 93
  // something we should check in advance. Turn exceptions into error                                                  // 94
  // results.                                                                                                          // 95
                                                                                                                       //
  try {                                                                                                                // 96
    // setup XHR object                                                                                                // 97
    var xhr;                                                                                                           // 98
    if (typeof XMLHttpRequest !== "undefined") xhr = new XMLHttpRequest();else if (typeof ActiveXObject !== "undefined") xhr = new ActiveXObject("Microsoft.XMLHttp"); // IE6
    else throw new Error("Can't create XMLHttpRequest"); // ???                                                        // 101
                                                                                                                       //
    xhr.open(method, url, true, username, password);                                                                   // 106
                                                                                                                       //
    for (var k in meteorBabelHelpers.sanitizeForInObject(headers)) {                                                   // 108
      xhr.setRequestHeader(k, headers[k]);                                                                             // 109
    } // setup timeout                                                                                                 // 108
                                                                                                                       //
                                                                                                                       //
    var timed_out = false;                                                                                             // 113
    var timer;                                                                                                         // 114
                                                                                                                       //
    if (options.timeout) {                                                                                             // 115
      timer = Meteor.setTimeout(function () {                                                                          // 116
        timed_out = true;                                                                                              // 117
        xhr.abort();                                                                                                   // 118
      }, options.timeout);                                                                                             // 119
    }                                                                                                                  // 120
                                                                                                                       //
    ; // callback on complete                                                                                          // 120
                                                                                                                       //
    xhr.onreadystatechange = function (evt) {                                                                          // 123
      if (xhr.readyState === 4) {                                                                                      // 124
        // COMPLETE                                                                                                    // 124
        if (timer) Meteor.clearTimeout(timer);                                                                         // 125
                                                                                                                       //
        if (timed_out) {                                                                                               // 128
          callback(new Error("timeout"));                                                                              // 129
        } else if (!xhr.status) {                                                                                      // 130
          // no HTTP response                                                                                          // 131
          callback(new Error("network"));                                                                              // 132
        } else {                                                                                                       // 133
          var response = {};                                                                                           // 135
          response.statusCode = xhr.status;                                                                            // 136
          response.content = xhr.responseText;                                                                         // 137
          response.headers = {};                                                                                       // 139
          var header_str = xhr.getAllResponseHeaders(); // https://github.com/meteor/meteor/issues/553                 // 140
          //                                                                                                           // 143
          // In Firefox there is a weird issue, sometimes                                                              // 144
          // getAllResponseHeaders returns the empty string, but                                                       // 145
          // getResponseHeader returns correct results. Possibly this                                                  // 146
          // issue:                                                                                                    // 147
          // https://bugzilla.mozilla.org/show_bug.cgi?id=608735                                                       // 148
          //                                                                                                           // 149
          // If this happens we can't get a full list of headers, but                                                  // 150
          // at least get content-type so our JSON decoding happens                                                    // 151
          // correctly. In theory, we could try and rescue more header                                                 // 152
          // values with a list of common headers, but content-type is                                                 // 153
          // the only vital one for now.                                                                               // 154
                                                                                                                       //
          if ("" === header_str && xhr.getResponseHeader("content-type")) header_str = "content-type: " + xhr.getResponseHeader("content-type");
          var headers_raw = header_str.split(/\r?\n/);                                                                 // 159
                                                                                                                       //
          _.each(headers_raw, function (h) {                                                                           // 160
            var m = /^(.*?):(?:\s+)(.*)$/.exec(h);                                                                     // 161
            if (m && m.length === 3) response.headers[m[1].toLowerCase()] = m[2];                                      // 162
          });                                                                                                          // 164
                                                                                                                       //
          populateData(response);                                                                                      // 166
          var error = null;                                                                                            // 168
          if (response.statusCode >= 400) error = makeErrorByStatus(response.statusCode, response.content);            // 169
          callback(error, response);                                                                                   // 172
        }                                                                                                              // 173
      }                                                                                                                // 174
    }; // Allow custom control over XHR and abort early.                                                               // 175
                                                                                                                       //
                                                                                                                       //
    if (options.beforeSend) {                                                                                          // 178
      // Sanity                                                                                                        // 179
      var beforeSend = _.once(options.beforeSend); // Call the callback and check to see if the request was aborted    // 180
                                                                                                                       //
                                                                                                                       //
      if (false === beforeSend.call(null, xhr, options)) {                                                             // 183
        return xhr.abort();                                                                                            // 184
      }                                                                                                                // 185
    } // send it on its way                                                                                            // 186
                                                                                                                       //
                                                                                                                       //
    xhr.send(content);                                                                                                 // 189
  } catch (err) {                                                                                                      // 191
    callback(err);                                                                                                     // 192
  }                                                                                                                    // 193
};                                                                                                                     // 195
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"deprecated.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/http/deprecated.js                                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// The HTTP object used to be called Meteor.http.                                                                      // 1
// XXX COMPAT WITH 0.6.4                                                                                               // 2
Meteor.http = HTTP;                                                                                                    // 3
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/http/httpcall_common.js");
require("./node_modules/meteor/http/httpcall_client.js");
require("./node_modules/meteor/http/deprecated.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.http = {}, {
  HTTP: HTTP
});

})();
