(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Log = Package.logging.Log;
var _ = Package.underscore._;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var Boilerplate = Package['boilerplate-generator'].Boilerplate;
var WebAppHashing = Package['webapp-hashing'].WebAppHashing;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var WebApp, WebAppInternals, main;

var require = meteorInstall({"node_modules":{"meteor":{"webapp":{"webapp_server.js":["babel-runtime/helpers/typeof",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/webapp/webapp_server.js                                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                               //
                                                                                                                      //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                      //
                                                                                                                      //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                     //
                                                                                                                      //
////////// Requires //////////                                                                                        // 1
var fs = Npm.require("fs");                                                                                           // 3
                                                                                                                      //
var http = Npm.require("http");                                                                                       // 4
                                                                                                                      //
var os = Npm.require("os");                                                                                           // 5
                                                                                                                      //
var path = Npm.require("path");                                                                                       // 6
                                                                                                                      //
var url = Npm.require("url");                                                                                         // 7
                                                                                                                      //
var crypto = Npm.require("crypto");                                                                                   // 8
                                                                                                                      //
var connect = Npm.require('connect');                                                                                 // 10
                                                                                                                      //
var parseurl = Npm.require('parseurl');                                                                               // 11
                                                                                                                      //
var useragent = Npm.require('useragent');                                                                             // 12
                                                                                                                      //
var send = Npm.require('send');                                                                                       // 13
                                                                                                                      //
var Future = Npm.require('fibers/future');                                                                            // 15
                                                                                                                      //
var Fiber = Npm.require('fibers');                                                                                    // 16
                                                                                                                      //
var SHORT_SOCKET_TIMEOUT = 5 * 1000;                                                                                  // 18
var LONG_SOCKET_TIMEOUT = 120 * 1000;                                                                                 // 19
WebApp = {};                                                                                                          // 21
WebAppInternals = {};                                                                                                 // 22
WebAppInternals.NpmModules = {                                                                                        // 24
  connect: {                                                                                                          // 25
    version: Npm.require('connect/package.json').version,                                                             // 26
    module: connect                                                                                                   // 27
  }                                                                                                                   // 25
};                                                                                                                    // 24
WebApp.defaultArch = 'web.browser'; // XXX maps archs to manifests                                                    // 31
                                                                                                                      //
WebApp.clientPrograms = {}; // XXX maps archs to program path on filesystem                                           // 34
                                                                                                                      //
var archPath = {};                                                                                                    // 37
                                                                                                                      //
var bundledJsCssUrlRewriteHook = function (url) {                                                                     // 39
  var bundledPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';                                           // 40
  return bundledPrefix + url;                                                                                         // 42
};                                                                                                                    // 43
                                                                                                                      //
var sha1 = function (contents) {                                                                                      // 45
  var hash = crypto.createHash('sha1');                                                                               // 46
  hash.update(contents);                                                                                              // 47
  return hash.digest('hex');                                                                                          // 48
};                                                                                                                    // 49
                                                                                                                      //
var readUtf8FileSync = function (filename) {                                                                          // 51
  return Meteor.wrapAsync(fs.readFile)(filename, 'utf8');                                                             // 52
}; // #BrowserIdentification                                                                                          // 53
//                                                                                                                    // 56
// We have multiple places that want to identify the browser: the                                                     // 57
// unsupported browser page, the appcache package, and, eventually                                                    // 58
// delivering browser polyfills only as needed.                                                                       // 59
//                                                                                                                    // 60
// To avoid detecting the browser in multiple places ad-hoc, we create a                                              // 61
// Meteor "browser" object. It uses but does not expose the npm                                                       // 62
// useragent module (we could choose a different mechanism to identify                                                // 63
// the browser in the future if we wanted to).  The browser object                                                    // 64
// contains                                                                                                           // 65
//                                                                                                                    // 66
// * `name`: the name of the browser in camel case                                                                    // 67
// * `major`, `minor`, `patch`: integers describing the browser version                                               // 68
//                                                                                                                    // 69
// Also here is an early version of a Meteor `request` object, intended                                               // 70
// to be a high-level description of the request without exposing                                                     // 71
// details of connect's low-level `req`.  Currently it contains:                                                      // 72
//                                                                                                                    // 73
// * `browser`: browser identification object described above                                                         // 74
// * `url`: parsed url, including parsed query params                                                                 // 75
//                                                                                                                    // 76
// As a temporary hack there is a `categorizeRequest` function on WebApp which                                        // 77
// converts a connect `req` to a Meteor `request`. This can go away once smart                                        // 78
// packages such as appcache are being passed a `request` object directly when                                        // 79
// they serve content.                                                                                                // 80
//                                                                                                                    // 81
// This allows `request` to be used uniformly: it is passed to the html                                               // 82
// attributes hook, and the appcache package can use it when deciding                                                 // 83
// whether to generate a 404 for the manifest.                                                                        // 84
//                                                                                                                    // 85
// Real routing / server side rendering will probably refactor this                                                   // 86
// heavily.                                                                                                           // 87
// e.g. "Mobile Safari" => "mobileSafari"                                                                             // 90
                                                                                                                      //
                                                                                                                      //
var camelCase = function (name) {                                                                                     // 91
  var parts = name.split(' ');                                                                                        // 92
  parts[0] = parts[0].toLowerCase();                                                                                  // 93
                                                                                                                      //
  for (var i = 1; i < parts.length; ++i) {                                                                            // 94
    parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substr(1);                                                 // 95
  }                                                                                                                   // 96
                                                                                                                      //
  return parts.join('');                                                                                              // 97
};                                                                                                                    // 98
                                                                                                                      //
var identifyBrowser = function (userAgentString) {                                                                    // 100
  var userAgent = useragent.lookup(userAgentString);                                                                  // 101
  return {                                                                                                            // 102
    name: camelCase(userAgent.family),                                                                                // 103
    major: +userAgent.major,                                                                                          // 104
    minor: +userAgent.minor,                                                                                          // 105
    patch: +userAgent.patch                                                                                           // 106
  };                                                                                                                  // 102
}; // XXX Refactor as part of implementing real routing.                                                              // 108
                                                                                                                      //
                                                                                                                      //
WebAppInternals.identifyBrowser = identifyBrowser;                                                                    // 111
                                                                                                                      //
WebApp.categorizeRequest = function (req) {                                                                           // 113
  return _.extend({                                                                                                   // 114
    browser: identifyBrowser(req.headers['user-agent']),                                                              // 115
    url: url.parse(req.url, true)                                                                                     // 116
  }, _.pick(req, 'dynamicHead', 'dynamicBody'));                                                                      // 114
}; // HTML attribute hooks: functions to be called to determine any attributes to                                     // 118
// be added to the '<html>' tag. Each function is passed a 'request' object (see                                      // 121
// #BrowserIdentification) and should return null or object.                                                          // 122
                                                                                                                      //
                                                                                                                      //
var htmlAttributeHooks = [];                                                                                          // 123
                                                                                                                      //
var getHtmlAttributes = function (request) {                                                                          // 124
  var combinedAttributes = {};                                                                                        // 125
                                                                                                                      //
  _.each(htmlAttributeHooks || [], function (hook) {                                                                  // 126
    var attributes = hook(request);                                                                                   // 127
    if (attributes === null) return;                                                                                  // 128
    if ((typeof attributes === "undefined" ? "undefined" : (0, _typeof3.default)(attributes)) !== 'object') throw Error("HTML attribute hook must return null or object");
                                                                                                                      //
    _.extend(combinedAttributes, attributes);                                                                         // 132
  });                                                                                                                 // 133
                                                                                                                      //
  return combinedAttributes;                                                                                          // 134
};                                                                                                                    // 135
                                                                                                                      //
WebApp.addHtmlAttributeHook = function (hook) {                                                                       // 136
  htmlAttributeHooks.push(hook);                                                                                      // 137
}; // Serve app HTML for this URL?                                                                                    // 138
                                                                                                                      //
                                                                                                                      //
var appUrl = function (url) {                                                                                         // 141
  if (url === '/favicon.ico' || url === '/robots.txt') return false; // NOTE: app.manifest is not a web standard like favicon.ico and
  // robots.txt. It is a file name we have chosen to use for HTML5                                                    // 146
  // appcache URLs. It is included here to prevent using an appcache                                                  // 147
  // then removing it from poisoning an app permanently. Eventually,                                                  // 148
  // once we have server side routing, this won't be needed as                                                        // 149
  // unknown URLs with return a 404 automatically.                                                                    // 150
                                                                                                                      //
  if (url === '/app.manifest') return false; // Avoid serving app HTML for declared routes such as /sockjs/.          // 151
                                                                                                                      //
  if (RoutePolicy.classify(url)) return false; // we currently return app HTML on all URLs by default                 // 155
                                                                                                                      //
  return true;                                                                                                        // 159
}; // We need to calculate the client hash after all packages have loaded                                             // 160
// to give them a chance to populate __meteor_runtime_config__.                                                       // 164
//                                                                                                                    // 165
// Calculating the hash during startup means that packages can only                                                   // 166
// populate __meteor_runtime_config__ during load, not during startup.                                                // 167
//                                                                                                                    // 168
// Calculating instead it at the beginning of main after all startup                                                  // 169
// hooks had run would allow packages to also populate                                                                // 170
// __meteor_runtime_config__ during startup, but that's too late for                                                  // 171
// autoupdate because it needs to have the client hash at startup to                                                  // 172
// insert the auto update version itself into                                                                         // 173
// __meteor_runtime_config__ to get it to the client.                                                                 // 174
//                                                                                                                    // 175
// An alternative would be to give autoupdate a "post-start,                                                          // 176
// pre-listen" hook to allow it to insert the auto update version at                                                  // 177
// the right moment.                                                                                                  // 178
                                                                                                                      //
                                                                                                                      //
Meteor.startup(function () {                                                                                          // 180
  var calculateClientHash = WebAppHashing.calculateClientHash;                                                        // 181
                                                                                                                      //
  WebApp.clientHash = function (archName) {                                                                           // 182
    archName = archName || WebApp.defaultArch;                                                                        // 183
    return calculateClientHash(WebApp.clientPrograms[archName].manifest);                                             // 184
  };                                                                                                                  // 185
                                                                                                                      //
  WebApp.calculateClientHashRefreshable = function (archName) {                                                       // 187
    archName = archName || WebApp.defaultArch;                                                                        // 188
    return calculateClientHash(WebApp.clientPrograms[archName].manifest, function (name) {                            // 189
      return name === "css";                                                                                          // 191
    });                                                                                                               // 192
  };                                                                                                                  // 193
                                                                                                                      //
  WebApp.calculateClientHashNonRefreshable = function (archName) {                                                    // 194
    archName = archName || WebApp.defaultArch;                                                                        // 195
    return calculateClientHash(WebApp.clientPrograms[archName].manifest, function (name) {                            // 196
      return name !== "css";                                                                                          // 198
    });                                                                                                               // 199
  };                                                                                                                  // 200
                                                                                                                      //
  WebApp.calculateClientHashCordova = function () {                                                                   // 201
    var archName = 'web.cordova';                                                                                     // 202
    if (!WebApp.clientPrograms[archName]) return 'none';                                                              // 203
    return calculateClientHash(WebApp.clientPrograms[archName].manifest, null, _.pick(__meteor_runtime_config__, 'PUBLIC_SETTINGS'));
  };                                                                                                                  // 209
}); // When we have a request pending, we want the socket timeout to be long, to                                      // 210
// give ourselves a while to serve it, and to allow sockjs long polls to                                              // 215
// complete.  On the other hand, we want to close idle sockets relatively                                             // 216
// quickly, so that we can shut down relatively promptly but cleanly, without                                         // 217
// cutting off anyone's response.                                                                                     // 218
                                                                                                                      //
WebApp._timeoutAdjustmentRequestCallback = function (req, res) {                                                      // 219
  // this is really just req.socket.setTimeout(LONG_SOCKET_TIMEOUT);                                                  // 220
  req.setTimeout(LONG_SOCKET_TIMEOUT); // Insert our new finish listener to run BEFORE the existing one which removes
  // the response from the socket.                                                                                    // 223
                                                                                                                      //
  var finishListeners = res.listeners('finish'); // XXX Apparently in Node 0.12 this event was called 'prefinish'.    // 224
  // https://github.com/joyent/node/commit/7c9b6070                                                                   // 226
  // But it has switched back to 'finish' in Node v4:                                                                 // 227
  // https://github.com/nodejs/node/pull/1411                                                                         // 228
                                                                                                                      //
  res.removeAllListeners('finish');                                                                                   // 229
  res.on('finish', function () {                                                                                      // 230
    res.setTimeout(SHORT_SOCKET_TIMEOUT);                                                                             // 231
  });                                                                                                                 // 232
                                                                                                                      //
  _.each(finishListeners, function (l) {                                                                              // 233
    res.on('finish', l);                                                                                              // 233
  });                                                                                                                 // 233
}; // Will be updated by main before we listen.                                                                       // 234
// Map from client arch to boilerplate object.                                                                        // 238
// Boilerplate object has:                                                                                            // 239
//   - func: XXX                                                                                                      // 240
//   - baseData: XXX                                                                                                  // 241
                                                                                                                      //
                                                                                                                      //
var boilerplateByArch = {}; // Given a request (as returned from `categorizeRequest`), return the                     // 242
// boilerplate HTML to serve for that request.                                                                        // 245
//                                                                                                                    // 246
// If a previous connect middleware has rendered content for the head or body,                                        // 247
// returns the boilerplate with that content patched in otherwise                                                     // 248
// memoizes on HTML attributes (used by, eg, appcache) and whether inline                                             // 249
// scripts are currently allowed.                                                                                     // 250
// XXX so far this function is always called with arch === 'web.browser'                                              // 251
                                                                                                                      //
var memoizedBoilerplate = {};                                                                                         // 252
                                                                                                                      //
var getBoilerplate = function (request, arch) {                                                                       // 253
  var useMemoized = !(request.dynamicHead || request.dynamicBody);                                                    // 254
  var htmlAttributes = getHtmlAttributes(request);                                                                    // 255
                                                                                                                      //
  if (useMemoized) {                                                                                                  // 257
    // The only thing that changes from request to request (unless extra                                              // 258
    // content is added to the head or body) are the HTML attributes                                                  // 259
    // (used by, eg, appcache) and whether inline scripts are allowed, so we                                          // 260
    // can memoize based on that.                                                                                     // 261
    var memHash = JSON.stringify({                                                                                    // 262
      inlineScriptsAllowed: inlineScriptsAllowed,                                                                     // 263
      htmlAttributes: htmlAttributes,                                                                                 // 264
      arch: arch                                                                                                      // 265
    });                                                                                                               // 262
                                                                                                                      //
    if (!memoizedBoilerplate[memHash]) {                                                                              // 268
      memoizedBoilerplate[memHash] = boilerplateByArch[arch].toHTML({                                                 // 269
        htmlAttributes: htmlAttributes                                                                                // 270
      });                                                                                                             // 269
    }                                                                                                                 // 272
                                                                                                                      //
    return memoizedBoilerplate[memHash];                                                                              // 273
  }                                                                                                                   // 274
                                                                                                                      //
  var boilerplateOptions = _.extend({                                                                                 // 276
    htmlAttributes: htmlAttributes                                                                                    // 277
  }, _.pick(request, 'dynamicHead', 'dynamicBody'));                                                                  // 276
                                                                                                                      //
  return boilerplateByArch[arch].toHTML(boilerplateOptions);                                                          // 280
};                                                                                                                    // 281
                                                                                                                      //
WebAppInternals.generateBoilerplateInstance = function (arch, manifest, additionalOptions) {                          // 283
  additionalOptions = additionalOptions || {};                                                                        // 286
                                                                                                                      //
  var runtimeConfig = _.extend(_.clone(__meteor_runtime_config__), additionalOptions.runtimeConfigOverrides || {});   // 288
                                                                                                                      //
  return new Boilerplate(arch, manifest, _.extend({                                                                   // 292
    pathMapper: function (itemPath) {                                                                                 // 294
      return path.join(archPath[arch], itemPath);                                                                     // 295
    },                                                                                                                // 295
    baseDataExtension: {                                                                                              // 296
      additionalStaticJs: _.map(additionalStaticJs || [], function (contents, pathname) {                             // 297
        return {                                                                                                      // 300
          pathname: pathname,                                                                                         // 301
          contents: contents                                                                                          // 302
        };                                                                                                            // 300
      }),                                                                                                             // 304
      // Convert to a JSON string, then get rid of most weird characters, then                                        // 306
      // wrap in double quotes. (The outermost JSON.stringify really ought to                                         // 307
      // just be "wrap in double quotes" but we use it to be safe.) This might                                        // 308
      // end up inside a <script> tag so we need to be careful to not include                                         // 309
      // "</script>", but normal {{spacebars}} escaping escapes too much! See                                         // 310
      // https://github.com/meteor/meteor/issues/3730                                                                 // 311
      meteorRuntimeConfig: JSON.stringify(encodeURIComponent(JSON.stringify(runtimeConfig))),                         // 312
      rootUrlPathPrefix: __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '',                                        // 314
      bundledJsCssUrlRewriteHook: bundledJsCssUrlRewriteHook,                                                         // 315
      inlineScriptsAllowed: WebAppInternals.inlineScriptsAllowed(),                                                   // 316
      inline: additionalOptions.inline                                                                                // 317
    }                                                                                                                 // 296
  }, additionalOptions));                                                                                             // 293
}; // A mapping from url path to "info". Where "info" has the following fields:                                       // 321
// - type: the type of file to be served                                                                              // 324
// - cacheable: optionally, whether the file should be cached or not                                                  // 325
// - sourceMapUrl: optionally, the url of the source map                                                              // 326
//                                                                                                                    // 327
// Info also contains one of the following:                                                                           // 328
// - content: the stringified content that should be served at this path                                              // 329
// - absolutePath: the absolute path on disk to the file                                                              // 330
                                                                                                                      //
                                                                                                                      //
var staticFiles; // Serve static files from the manifest or added with                                                // 332
// `addStaticJs`. Exported for tests.                                                                                 // 335
                                                                                                                      //
WebAppInternals.staticFilesMiddleware = function (staticFiles, req, res, next) {                                      // 336
  if ('GET' != req.method && 'HEAD' != req.method && 'OPTIONS' != req.method) {                                       // 337
    next();                                                                                                           // 338
    return;                                                                                                           // 339
  }                                                                                                                   // 340
                                                                                                                      //
  var pathname = parseurl(req).pathname;                                                                              // 341
                                                                                                                      //
  try {                                                                                                               // 342
    pathname = decodeURIComponent(pathname);                                                                          // 343
  } catch (e) {                                                                                                       // 344
    next();                                                                                                           // 345
    return;                                                                                                           // 346
  }                                                                                                                   // 347
                                                                                                                      //
  var serveStaticJs = function (s) {                                                                                  // 349
    res.writeHead(200, {                                                                                              // 350
      'Content-type': 'application/javascript; charset=UTF-8'                                                         // 351
    });                                                                                                               // 350
    res.write(s);                                                                                                     // 353
    res.end();                                                                                                        // 354
  };                                                                                                                  // 355
                                                                                                                      //
  if (pathname === "/meteor_runtime_config.js" && !WebAppInternals.inlineScriptsAllowed()) {                          // 357
    serveStaticJs("__meteor_runtime_config__ = " + JSON.stringify(__meteor_runtime_config__) + ";");                  // 359
    return;                                                                                                           // 361
  } else if (_.has(additionalStaticJs, pathname) && !WebAppInternals.inlineScriptsAllowed()) {                        // 362
    serveStaticJs(additionalStaticJs[pathname]);                                                                      // 364
    return;                                                                                                           // 365
  }                                                                                                                   // 366
                                                                                                                      //
  if (!_.has(staticFiles, pathname)) {                                                                                // 368
    next();                                                                                                           // 369
    return;                                                                                                           // 370
  } // We don't need to call pause because, unlike 'static', once we call into                                        // 371
  // 'send' and yield to the event loop, we never call another handler with                                           // 374
  // 'next'.                                                                                                          // 375
                                                                                                                      //
                                                                                                                      //
  var info = staticFiles[pathname]; // Cacheable files are files that should never change. Typically                  // 377
  // named by their hash (eg meteor bundled js and css files).                                                        // 380
  // We cache them ~forever (1yr).                                                                                    // 381
                                                                                                                      //
  var maxAge = info.cacheable ? 1000 * 60 * 60 * 24 * 365 : 0; // Set the X-SourceMap header, which current Chrome, FireFox, and Safari
  // understand.  (The SourceMap header is slightly more spec-correct but FF                                          // 387
  // doesn't understand it.)                                                                                          // 388
  //                                                                                                                  // 389
  // You may also need to enable source maps in Chrome: open dev tools, click                                         // 390
  // the gear in the bottom right corner, and select "enable source maps".                                            // 391
                                                                                                                      //
  if (info.sourceMapUrl) {                                                                                            // 392
    res.setHeader('X-SourceMap', __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + info.sourceMapUrl);                 // 393
  }                                                                                                                   // 396
                                                                                                                      //
  if (info.type === "js") {                                                                                           // 398
    res.setHeader("Content-Type", "application/javascript; charset=UTF-8");                                           // 399
  } else if (info.type === "css") {                                                                                   // 400
    res.setHeader("Content-Type", "text/css; charset=UTF-8");                                                         // 401
  } else if (info.type === "json") {                                                                                  // 402
    res.setHeader("Content-Type", "application/json; charset=UTF-8");                                                 // 403
  }                                                                                                                   // 404
                                                                                                                      //
  if (info.hash) {                                                                                                    // 406
    res.setHeader('ETag', '"' + info.hash + '"');                                                                     // 407
  }                                                                                                                   // 408
                                                                                                                      //
  if (info.content) {                                                                                                 // 410
    res.write(info.content);                                                                                          // 411
    res.end();                                                                                                        // 412
  } else {                                                                                                            // 413
    send(req, info.absolutePath, {                                                                                    // 414
      maxage: maxAge,                                                                                                 // 415
      dotfiles: 'allow',                                                                                              // 416
      // if we specified a dotfile in the manifest, serve it                                                          // 416
      lastModified: false // don't set last-modified based on the file date                                           // 417
                                                                                                                      //
    }).on('error', function (err) {                                                                                   // 414
      Log.error("Error serving static file " + err);                                                                  // 419
      res.writeHead(500);                                                                                             // 420
      res.end();                                                                                                      // 421
    }).on('directory', function () {                                                                                  // 422
      Log.error("Unexpected directory " + info.absolutePath);                                                         // 424
      res.writeHead(500);                                                                                             // 425
      res.end();                                                                                                      // 426
    }).pipe(res);                                                                                                     // 427
  }                                                                                                                   // 429
};                                                                                                                    // 430
                                                                                                                      //
var getUrlPrefixForArch = function (arch) {                                                                           // 432
  // XXX we rely on the fact that arch names don't contain slashes                                                    // 433
  // in that case we would need to uri escape it                                                                      // 434
  // We add '__' to the beginning of non-standard archs to "scope" the url                                            // 436
  // to Meteor internals.                                                                                             // 437
  return arch === WebApp.defaultArch ? '' : '/' + '__' + arch.replace(/^web\./, '');                                  // 438
}; // parse port to see if its a Windows Server style named pipe. If so, return as-is (String), otherwise return as Int
                                                                                                                      //
                                                                                                                      //
WebAppInternals.parsePort = function (port) {                                                                         // 443
  if (/\\\\?.+\\pipe\\?.+/.test(port)) {                                                                              // 444
    return port;                                                                                                      // 445
  }                                                                                                                   // 446
                                                                                                                      //
  return parseInt(port);                                                                                              // 448
};                                                                                                                    // 449
                                                                                                                      //
var runWebAppServer = function () {                                                                                   // 451
  var shuttingDown = false;                                                                                           // 452
  var syncQueue = new Meteor._SynchronousQueue();                                                                     // 453
                                                                                                                      //
  var getItemPathname = function (itemUrl) {                                                                          // 455
    return decodeURIComponent(url.parse(itemUrl).pathname);                                                           // 456
  };                                                                                                                  // 457
                                                                                                                      //
  WebAppInternals.reloadClientPrograms = function () {                                                                // 459
    syncQueue.runTask(function () {                                                                                   // 460
      staticFiles = {};                                                                                               // 461
                                                                                                                      //
      var generateClientProgram = function (clientPath, arch) {                                                       // 462
        // read the control for the client we'll be serving up                                                        // 463
        var clientJsonPath = path.join(__meteor_bootstrap__.serverDir, clientPath);                                   // 464
        var clientDir = path.dirname(clientJsonPath);                                                                 // 466
        var clientJson = JSON.parse(readUtf8FileSync(clientJsonPath));                                                // 467
        if (clientJson.format !== "web-program-pre1") throw new Error("Unsupported format for client assets: " + JSON.stringify(clientJson.format));
        if (!clientJsonPath || !clientDir || !clientJson) throw new Error("Client config file not parsed.");          // 472
        var urlPrefix = getUrlPrefixForArch(arch);                                                                    // 475
        var manifest = clientJson.manifest;                                                                           // 477
                                                                                                                      //
        _.each(manifest, function (item) {                                                                            // 478
          if (item.url && item.where === "client") {                                                                  // 479
            staticFiles[urlPrefix + getItemPathname(item.url)] = {                                                    // 480
              absolutePath: path.join(clientDir, item.path),                                                          // 481
              cacheable: item.cacheable,                                                                              // 482
              hash: item.hash,                                                                                        // 483
              // Link from source to its map                                                                          // 484
              sourceMapUrl: item.sourceMapUrl,                                                                        // 485
              type: item.type                                                                                         // 486
            };                                                                                                        // 480
                                                                                                                      //
            if (item.sourceMap) {                                                                                     // 489
              // Serve the source map too, under the specified URL. We assume all                                     // 490
              // source maps are cacheable.                                                                           // 491
              staticFiles[urlPrefix + getItemPathname(item.sourceMapUrl)] = {                                         // 492
                absolutePath: path.join(clientDir, item.sourceMap),                                                   // 493
                cacheable: true                                                                                       // 494
              };                                                                                                      // 492
            }                                                                                                         // 496
          }                                                                                                           // 497
        });                                                                                                           // 498
                                                                                                                      //
        var program = {                                                                                               // 500
          format: "web-program-pre1",                                                                                 // 501
          manifest: manifest,                                                                                         // 502
          version: process.env.AUTOUPDATE_VERSION || WebAppHashing.calculateClientHash(manifest, null, _.pick(__meteor_runtime_config__, "PUBLIC_SETTINGS")),
          cordovaCompatibilityVersions: clientJson.cordovaCompatibilityVersions,                                      // 509
          PUBLIC_SETTINGS: __meteor_runtime_config__.PUBLIC_SETTINGS                                                  // 510
        };                                                                                                            // 500
        WebApp.clientPrograms[arch] = program; // Serve the program as a string at /foo/<arch>/manifest.json          // 513
        // XXX change manifest.json -> program.json                                                                   // 516
                                                                                                                      //
        staticFiles[urlPrefix + getItemPathname('/manifest.json')] = {                                                // 517
          content: JSON.stringify(program),                                                                           // 518
          cacheable: false,                                                                                           // 519
          hash: program.version,                                                                                      // 520
          type: "json"                                                                                                // 521
        };                                                                                                            // 517
      };                                                                                                              // 523
                                                                                                                      //
      try {                                                                                                           // 525
        var clientPaths = __meteor_bootstrap__.configJson.clientPaths;                                                // 526
                                                                                                                      //
        _.each(clientPaths, function (clientPath, arch) {                                                             // 527
          archPath[arch] = path.dirname(clientPath);                                                                  // 528
          generateClientProgram(clientPath, arch);                                                                    // 529
        }); // Exported for tests.                                                                                    // 530
                                                                                                                      //
                                                                                                                      //
        WebAppInternals.staticFiles = staticFiles;                                                                    // 533
      } catch (e) {                                                                                                   // 534
        Log.error("Error reloading the client program: " + e.stack);                                                  // 535
        process.exit(1);                                                                                              // 536
      }                                                                                                               // 537
    });                                                                                                               // 538
  };                                                                                                                  // 539
                                                                                                                      //
  WebAppInternals.generateBoilerplate = function () {                                                                 // 541
    // This boilerplate will be served to the mobile devices when used with                                           // 542
    // Meteor/Cordova for the Hot-Code Push and since the file will be served by                                      // 543
    // the device's server, it is important to set the DDP url to the actual                                          // 544
    // Meteor server accepting DDP connections and not the device's file server.                                      // 545
    var defaultOptionsForArch = {                                                                                     // 546
      'web.cordova': {                                                                                                // 547
        runtimeConfigOverrides: {                                                                                     // 548
          // XXX We use absoluteUrl() here so that we serve https://                                                  // 549
          // URLs to cordova clients if force-ssl is in use. If we were                                               // 550
          // to use __meteor_runtime_config__.ROOT_URL instead of                                                     // 551
          // absoluteUrl(), then Cordova clients would immediately get a                                              // 552
          // HCP setting their DDP_DEFAULT_CONNECTION_URL to                                                          // 553
          // http://example.meteor.com. This breaks the app, because                                                  // 554
          // force-ssl doesn't serve CORS headers on 302                                                              // 555
          // redirects. (Plus it's undesirable to have clients                                                        // 556
          // connecting to http://example.meteor.com when force-ssl is                                                // 557
          // in use.)                                                                                                 // 558
          DDP_DEFAULT_CONNECTION_URL: process.env.MOBILE_DDP_URL || Meteor.absoluteUrl(),                             // 559
          ROOT_URL: process.env.MOBILE_ROOT_URL || Meteor.absoluteUrl()                                               // 561
        }                                                                                                             // 548
      }                                                                                                               // 547
    };                                                                                                                // 546
    syncQueue.runTask(function () {                                                                                   // 567
      _.each(WebApp.clientPrograms, function (program, archName) {                                                    // 568
        boilerplateByArch[archName] = WebAppInternals.generateBoilerplateInstance(archName, program.manifest, defaultOptionsForArch[archName]);
      }); // Clear the memoized boilerplate cache.                                                                    // 573
                                                                                                                      //
                                                                                                                      //
      memoizedBoilerplate = {}; // Configure CSS injection for the default arch                                       // 576
      // XXX implement the CSS injection for all archs?                                                               // 579
                                                                                                                      //
      var cssFiles = boilerplateByArch[WebApp.defaultArch].baseData.css; // Rewrite all CSS files (which are written directly to <style> tags)
      // by autoupdate_client to use the CDN prefix/etc                                                               // 582
                                                                                                                      //
      var allCss = _.map(cssFiles, function (cssFile) {                                                               // 583
        return {                                                                                                      // 584
          url: bundledJsCssUrlRewriteHook(cssFile.url)                                                                // 584
        };                                                                                                            // 584
      });                                                                                                             // 585
                                                                                                                      //
      WebAppInternals.refreshableAssets = {                                                                           // 586
        allCss: allCss                                                                                                // 586
      };                                                                                                              // 586
    });                                                                                                               // 587
  };                                                                                                                  // 588
                                                                                                                      //
  WebAppInternals.reloadClientPrograms(); // webserver                                                                // 590
                                                                                                                      //
  var app = connect(); // Packages and apps can add handlers that run before any other Meteor                         // 593
  // handlers via WebApp.rawConnectHandlers.                                                                          // 596
                                                                                                                      //
  var rawConnectHandlers = connect();                                                                                 // 597
  app.use(rawConnectHandlers); // Auto-compress any json, javascript, or text.                                        // 598
                                                                                                                      //
  app.use(connect.compress()); // We're not a proxy; reject (without crashing) attempts to treat us like              // 601
  // one. (See #1212.)                                                                                                // 604
                                                                                                                      //
  app.use(function (req, res, next) {                                                                                 // 605
    if (RoutePolicy.isValidUrl(req.url)) {                                                                            // 606
      next();                                                                                                         // 607
      return;                                                                                                         // 608
    }                                                                                                                 // 609
                                                                                                                      //
    res.writeHead(400);                                                                                               // 610
    res.write("Not a proxy");                                                                                         // 611
    res.end();                                                                                                        // 612
  }); // Strip off the path prefix, if it exists.                                                                     // 613
                                                                                                                      //
  app.use(function (request, response, next) {                                                                        // 616
    var pathPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX;                                                  // 617
                                                                                                                      //
    var url = Npm.require('url').parse(request.url);                                                                  // 618
                                                                                                                      //
    var pathname = url.pathname; // check if the path in the url starts with the path prefix (and the part            // 619
    // after the path prefix must start with a / if it exists.)                                                       // 621
                                                                                                                      //
    if (pathPrefix && pathname.substring(0, pathPrefix.length) === pathPrefix && (pathname.length == pathPrefix.length || pathname.substring(pathPrefix.length, pathPrefix.length + 1) === "/")) {
      request.url = request.url.substring(pathPrefix.length);                                                         // 625
      next();                                                                                                         // 626
    } else if (pathname === "/favicon.ico" || pathname === "/robots.txt") {                                           // 627
      next();                                                                                                         // 628
    } else if (pathPrefix) {                                                                                          // 629
      response.writeHead(404);                                                                                        // 630
      response.write("Unknown path");                                                                                 // 631
      response.end();                                                                                                 // 632
    } else {                                                                                                          // 633
      next();                                                                                                         // 634
    }                                                                                                                 // 635
  }); // Parse the query string into res.query. Used by oauth_server, but it's                                        // 636
  // generally pretty handy..                                                                                         // 639
                                                                                                                      //
  app.use(connect.query()); // Serve static files from the manifest.                                                  // 640
  // This is inspired by the 'static' middleware.                                                                     // 643
                                                                                                                      //
  app.use(function (req, res, next) {                                                                                 // 644
    Fiber(function () {                                                                                               // 645
      WebAppInternals.staticFilesMiddleware(staticFiles, req, res, next);                                             // 646
    }).run();                                                                                                         // 647
  }); // Packages and apps can add handlers to this via WebApp.connectHandlers.                                       // 648
  // They are inserted before our default handler.                                                                    // 651
                                                                                                                      //
  var packageAndAppHandlers = connect();                                                                              // 652
  app.use(packageAndAppHandlers);                                                                                     // 653
  var suppressConnectErrors = false; // connect knows it is an error handler because it has 4 arguments instead of    // 655
  // 3. go figure.  (It is not smart enough to find such a thing if it's hidden                                       // 657
  // inside packageAndAppHandlers.)                                                                                   // 658
                                                                                                                      //
  app.use(function (err, req, res, next) {                                                                            // 659
    if (!err || !suppressConnectErrors || !req.headers['x-suppress-error']) {                                         // 660
      next(err);                                                                                                      // 661
      return;                                                                                                         // 662
    }                                                                                                                 // 663
                                                                                                                      //
    res.writeHead(err.status, {                                                                                       // 664
      'Content-Type': 'text/plain'                                                                                    // 664
    });                                                                                                               // 664
    res.end("An error message");                                                                                      // 665
  });                                                                                                                 // 666
  app.use(function (req, res, next) {                                                                                 // 668
    Fiber(function () {                                                                                               // 669
      if (!appUrl(req.url)) return next();                                                                            // 670
      var headers = {                                                                                                 // 673
        'Content-Type': 'text/html; charset=utf-8'                                                                    // 674
      };                                                                                                              // 673
      if (shuttingDown) headers['Connection'] = 'Close';                                                              // 676
      var request = WebApp.categorizeRequest(req);                                                                    // 679
                                                                                                                      //
      if (request.url.query && request.url.query['meteor_css_resource']) {                                            // 681
        // In this case, we're requesting a CSS resource in the meteor-specific                                       // 682
        // way, but we don't have it.  Serve a static css file that indicates that                                    // 683
        // we didn't have it, so we can detect that and refresh.  Make sure                                           // 684
        // that any proxies or CDNs don't cache this error!  (Normally proxies                                        // 685
        // or CDNs are smart enough not to cache error pages, but in order to                                         // 686
        // make this hack work, we need to return the CSS file as a 200, which                                        // 687
        // would otherwise be cached.)                                                                                // 688
        headers['Content-Type'] = 'text/css; charset=utf-8';                                                          // 689
        headers['Cache-Control'] = 'no-cache';                                                                        // 690
        res.writeHead(200, headers);                                                                                  // 691
        res.write(".meteor-css-not-found-error { width: 0px;}");                                                      // 692
        res.end();                                                                                                    // 693
        return undefined;                                                                                             // 694
      }                                                                                                               // 695
                                                                                                                      //
      if (request.url.query && request.url.query['meteor_js_resource']) {                                             // 697
        // Similarly, we're requesting a JS resource that we don't have.                                              // 698
        // Serve an uncached 404. (We can't use the same hack we use for CSS,                                         // 699
        // because actually acting on that hack requires us to have the JS                                            // 700
        // already!)                                                                                                  // 701
        headers['Cache-Control'] = 'no-cache';                                                                        // 702
        res.writeHead(404, headers);                                                                                  // 703
        res.end("404 Not Found");                                                                                     // 704
        return undefined;                                                                                             // 705
      }                                                                                                               // 706
                                                                                                                      //
      if (request.url.query && request.url.query['meteor_dont_serve_index']) {                                        // 708
        // When downloading files during a Cordova hot code push, we need                                             // 709
        // to detect if a file is not available instead of inadvertently                                              // 710
        // downloading the default index page.                                                                        // 711
        // So similar to the situation above, we serve an uncached 404.                                               // 712
        headers['Cache-Control'] = 'no-cache';                                                                        // 713
        res.writeHead(404, headers);                                                                                  // 714
        res.end("404 Not Found");                                                                                     // 715
        return undefined;                                                                                             // 716
      } // /packages/asdfsad ... /__cordova/dafsdf.js                                                                 // 717
                                                                                                                      //
                                                                                                                      //
      var pathname = parseurl(req).pathname;                                                                          // 720
      var archKey = pathname.split('/')[1];                                                                           // 721
      var archKeyCleaned = 'web.' + archKey.replace(/^__/, '');                                                       // 722
                                                                                                                      //
      if (!/^__/.test(archKey) || !_.has(archPath, archKeyCleaned)) {                                                 // 724
        archKey = WebApp.defaultArch;                                                                                 // 725
      } else {                                                                                                        // 726
        archKey = archKeyCleaned;                                                                                     // 727
      }                                                                                                               // 728
                                                                                                                      //
      var boilerplate;                                                                                                // 730
                                                                                                                      //
      try {                                                                                                           // 731
        boilerplate = getBoilerplate(request, archKey);                                                               // 732
      } catch (e) {                                                                                                   // 733
        Log.error("Error running template: " + e.stack);                                                              // 734
        res.writeHead(500, headers);                                                                                  // 735
        res.end();                                                                                                    // 736
        return undefined;                                                                                             // 737
      }                                                                                                               // 738
                                                                                                                      //
      var statusCode = res.statusCode ? res.statusCode : 200;                                                         // 740
      res.writeHead(statusCode, headers);                                                                             // 741
      res.write(boilerplate);                                                                                         // 742
      res.end();                                                                                                      // 743
      return undefined;                                                                                               // 744
    }).run();                                                                                                         // 745
  }); // Return 404 by default, if no other handlers serve this URL.                                                  // 746
                                                                                                                      //
  app.use(function (req, res) {                                                                                       // 749
    res.writeHead(404);                                                                                               // 750
    res.end();                                                                                                        // 751
  });                                                                                                                 // 752
  var httpServer = http.createServer(app);                                                                            // 755
  var onListeningCallbacks = []; // After 5 seconds w/o data on a socket, kill it.  On the other hand, if             // 756
  // there's an outstanding request, give it a higher timeout instead (to avoid                                       // 759
  // killing long-polling requests)                                                                                   // 760
                                                                                                                      //
  httpServer.setTimeout(SHORT_SOCKET_TIMEOUT); // Do this here, and then also in livedata/stream_server.js, because   // 761
  // stream_server.js kills all the current request handlers when installing its                                      // 764
  // own.                                                                                                             // 765
                                                                                                                      //
  httpServer.on('request', WebApp._timeoutAdjustmentRequestCallback); // If the client gave us a bad request, tell it instead of just closing the
  // socket. This lets load balancers in front of us differentiate between "a                                         // 769
  // server is randomly closing sockets for no reason" and "client sent a bad                                         // 770
  // request".                                                                                                        // 771
  //                                                                                                                  // 772
  // This will only work on Node 6; Node 4 destroys the socket before calling                                         // 773
  // this event. See https://github.com/nodejs/node/pull/4557/ for details.                                           // 774
                                                                                                                      //
  httpServer.on('clientError', function (err, socket) {                                                               // 775
    // Pre-Node-6, do nothing.                                                                                        // 776
    if (socket.destroyed) {                                                                                           // 777
      return;                                                                                                         // 778
    }                                                                                                                 // 779
                                                                                                                      //
    if (err.message === 'Parse Error') {                                                                              // 781
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');                                                                 // 782
    } else {                                                                                                          // 783
      // For other errors, use the default behavior as if we had no clientError                                       // 784
      // handler.                                                                                                     // 785
      socket.destroy(err);                                                                                            // 786
    }                                                                                                                 // 787
  }); // start up app                                                                                                 // 788
                                                                                                                      //
  _.extend(WebApp, {                                                                                                  // 791
    connectHandlers: packageAndAppHandlers,                                                                           // 792
    rawConnectHandlers: rawConnectHandlers,                                                                           // 793
    httpServer: httpServer,                                                                                           // 794
    connectApp: app,                                                                                                  // 795
    // For testing.                                                                                                   // 796
    suppressConnectErrors: function () {                                                                              // 797
      suppressConnectErrors = true;                                                                                   // 798
    },                                                                                                                // 799
    onListening: function (f) {                                                                                       // 800
      if (onListeningCallbacks) onListeningCallbacks.push(f);else f();                                                // 801
    }                                                                                                                 // 805
  }); // Let the rest of the packages (and Meteor.startup hooks) insert connect                                       // 791
  // middlewares and update __meteor_runtime_config__, then keep going to set up                                      // 809
  // actually serving HTML.                                                                                           // 810
                                                                                                                      //
                                                                                                                      //
  main = function (argv) {                                                                                            // 811
    WebAppInternals.generateBoilerplate(); // only start listening after all the startup code has run.                // 812
                                                                                                                      //
    var localPort = WebAppInternals.parsePort(process.env.PORT) || 0;                                                 // 815
    var host = process.env.BIND_IP;                                                                                   // 816
    var localIp = host || '0.0.0.0';                                                                                  // 817
    httpServer.listen(localPort, localIp, Meteor.bindEnvironment(function () {                                        // 818
      if (process.env.METEOR_PRINT_ON_LISTEN) console.log("LISTENING"); // must match run-app.js                      // 819
                                                                                                                      //
      var callbacks = onListeningCallbacks;                                                                           // 822
      onListeningCallbacks = null;                                                                                    // 823
                                                                                                                      //
      _.each(callbacks, function (x) {                                                                                // 824
        x();                                                                                                          // 824
      });                                                                                                             // 824
    }, function (e) {                                                                                                 // 826
      console.error("Error listening:", e);                                                                           // 827
      console.error(e && e.stack);                                                                                    // 828
    }));                                                                                                              // 829
    return 'DAEMON';                                                                                                  // 831
  };                                                                                                                  // 832
};                                                                                                                    // 833
                                                                                                                      //
runWebAppServer();                                                                                                    // 836
var inlineScriptsAllowed = true;                                                                                      // 839
                                                                                                                      //
WebAppInternals.inlineScriptsAllowed = function () {                                                                  // 841
  return inlineScriptsAllowed;                                                                                        // 842
};                                                                                                                    // 843
                                                                                                                      //
WebAppInternals.setInlineScriptsAllowed = function (value) {                                                          // 845
  inlineScriptsAllowed = value;                                                                                       // 846
  WebAppInternals.generateBoilerplate();                                                                              // 847
};                                                                                                                    // 848
                                                                                                                      //
WebAppInternals.setBundledJsCssUrlRewriteHook = function (hookFn) {                                                   // 851
  bundledJsCssUrlRewriteHook = hookFn;                                                                                // 852
  WebAppInternals.generateBoilerplate();                                                                              // 853
};                                                                                                                    // 854
                                                                                                                      //
WebAppInternals.setBundledJsCssPrefix = function (prefix) {                                                           // 856
  var self = this;                                                                                                    // 857
  self.setBundledJsCssUrlRewriteHook(function (url) {                                                                 // 858
    return prefix + url;                                                                                              // 860
  });                                                                                                                 // 861
}; // Packages can call `WebAppInternals.addStaticJs` to specify static                                               // 862
// JavaScript to be included in the app. This static JS will be inlined,                                              // 865
// unless inline scripts have been disabled, in which case it will be                                                 // 866
// served under `/<sha1 of contents>`.                                                                                // 867
                                                                                                                      //
                                                                                                                      //
var additionalStaticJs = {};                                                                                          // 868
                                                                                                                      //
WebAppInternals.addStaticJs = function (contents) {                                                                   // 869
  additionalStaticJs["/" + sha1(contents) + ".js"] = contents;                                                        // 870
}; // Exported for tests                                                                                              // 871
                                                                                                                      //
                                                                                                                      //
WebAppInternals.getBoilerplate = getBoilerplate;                                                                      // 874
WebAppInternals.additionalStaticJs = additionalStaticJs;                                                              // 875
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/webapp/webapp_server.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.webapp = {}, {
  WebApp: WebApp,
  main: main,
  WebAppInternals: WebAppInternals
});

})();

//# sourceMappingURL=webapp.js.map
