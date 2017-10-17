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
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var ReactiveDict = Package['reactive-dict'].ReactiveDict;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var EJSON = Package.ejson.EJSON;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;

/* Package-scope variables */
var page, qs, Triggers, Router, Group, Route, FlowRouter;

var require = meteorInstall({"node_modules":{"meteor":{"kadira:flow-router":{"client":{"modules.js":["page","qs",function(require){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/kadira_flow-router/client/modules.js                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
page = require('page');                                                                                               // 1
qs   = require('qs');                                                                                                 // 2
                                                                                                                      // 3
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"triggers.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/kadira_flow-router/client/triggers.js                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// a set of utility functions for triggers                                                                            // 1
                                                                                                                      // 2
Triggers = {};                                                                                                        // 3
                                                                                                                      // 4
// Apply filters for a set of triggers                                                                                // 5
// @triggers - a set of triggers                                                                                      // 6
// @filter - filter with array fileds with `only` and `except`                                                        // 7
//           support only either `only` or `except`, but not both                                                     // 8
Triggers.applyFilters = function(triggers, filter) {                                                                  // 9
  if(!(triggers instanceof Array)) {                                                                                  // 10
    triggers = [triggers];                                                                                            // 11
  }                                                                                                                   // 12
                                                                                                                      // 13
  if(!filter) {                                                                                                       // 14
    return triggers;                                                                                                  // 15
  }                                                                                                                   // 16
                                                                                                                      // 17
  if(filter.only && filter.except) {                                                                                  // 18
    throw new Error("Triggers don't support only and except filters at once");                                        // 19
  }                                                                                                                   // 20
                                                                                                                      // 21
  if(filter.only && !(filter.only instanceof Array)) {                                                                // 22
    throw new Error("only filters needs to be an array");                                                             // 23
  }                                                                                                                   // 24
                                                                                                                      // 25
  if(filter.except && !(filter.except instanceof Array)) {                                                            // 26
    throw new Error("except filters needs to be an array");                                                           // 27
  }                                                                                                                   // 28
                                                                                                                      // 29
  if(filter.only) {                                                                                                   // 30
    return Triggers.createRouteBoundTriggers(triggers, filter.only);                                                  // 31
  }                                                                                                                   // 32
                                                                                                                      // 33
  if(filter.except) {                                                                                                 // 34
    return Triggers.createRouteBoundTriggers(triggers, filter.except, true);                                          // 35
  }                                                                                                                   // 36
                                                                                                                      // 37
  throw new Error("Provided a filter but not supported");                                                             // 38
};                                                                                                                    // 39
                                                                                                                      // 40
//  create triggers by bounding them to a set of route names                                                          // 41
//  @triggers - a set of triggers                                                                                     // 42
//  @names - list of route names to be bound (trigger runs only for these names)                                      // 43
//  @negate - negate the result (triggers won't run for above names)                                                  // 44
Triggers.createRouteBoundTriggers = function(triggers, names, negate) {                                               // 45
  var namesMap = {};                                                                                                  // 46
  _.each(names, function(name) {                                                                                      // 47
    namesMap[name] = true;                                                                                            // 48
  });                                                                                                                 // 49
                                                                                                                      // 50
  var filteredTriggers = _.map(triggers, function(originalTrigger) {                                                  // 51
    var modifiedTrigger = function(context, next) {                                                                   // 52
      var routeName = context.route.name;                                                                             // 53
      var matched = (namesMap[routeName])? 1: -1;                                                                     // 54
      matched = (negate)? matched * -1 : matched;                                                                     // 55
                                                                                                                      // 56
      if(matched === 1) {                                                                                             // 57
        originalTrigger(context, next);                                                                               // 58
      }                                                                                                               // 59
    };                                                                                                                // 60
    return modifiedTrigger;                                                                                           // 61
  });                                                                                                                 // 62
                                                                                                                      // 63
  return filteredTriggers;                                                                                            // 64
};                                                                                                                    // 65
                                                                                                                      // 66
//  run triggers and abort if redirected or callback stopped                                                          // 67
//  @triggers - a set of triggers                                                                                     // 68
//  @context - context we need to pass (it must have the route)                                                       // 69
//  @redirectFn - function which used to redirect                                                                     // 70
//  @after - called after if only all the triggers runs                                                               // 71
Triggers.runTriggers = function(triggers, context, redirectFn, after) {                                               // 72
  var abort = false;                                                                                                  // 73
  var inCurrentLoop = true;                                                                                           // 74
  var alreadyRedirected = false;                                                                                      // 75
                                                                                                                      // 76
  for(var lc=0; lc<triggers.length; lc++) {                                                                           // 77
    var trigger = triggers[lc];                                                                                       // 78
    trigger(context, doRedirect, doStop);                                                                             // 79
                                                                                                                      // 80
    if(abort) {                                                                                                       // 81
      return;                                                                                                         // 82
    }                                                                                                                 // 83
  }                                                                                                                   // 84
                                                                                                                      // 85
  // mark that, we've exceeds the currentEventloop for                                                                // 86
  // this set of triggers.                                                                                            // 87
  inCurrentLoop = false;                                                                                              // 88
  after();                                                                                                            // 89
                                                                                                                      // 90
  function doRedirect(url, params, queryParams) {                                                                     // 91
    if(alreadyRedirected) {                                                                                           // 92
      throw new Error("already redirected");                                                                          // 93
    }                                                                                                                 // 94
                                                                                                                      // 95
    if(!inCurrentLoop) {                                                                                              // 96
      throw new Error("redirect needs to be done in sync");                                                           // 97
    }                                                                                                                 // 98
                                                                                                                      // 99
    if(!url) {                                                                                                        // 100
      throw new Error("trigger redirect requires an URL");                                                            // 101
    }                                                                                                                 // 102
                                                                                                                      // 103
    abort = true;                                                                                                     // 104
    alreadyRedirected = true;                                                                                         // 105
    redirectFn(url, params, queryParams);                                                                             // 106
  }                                                                                                                   // 107
                                                                                                                      // 108
  function doStop() {                                                                                                 // 109
    abort = true;                                                                                                     // 110
  }                                                                                                                   // 111
};                                                                                                                    // 112
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"router.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/kadira_flow-router/client/router.js                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
Router = function () {                                                                                                // 1
  var self = this;                                                                                                    // 2
  this.globals = [];                                                                                                  // 3
  this.subscriptions = Function.prototype;                                                                            // 4
                                                                                                                      // 5
  this._tracker = this._buildTracker();                                                                               // 6
  this._current = {};                                                                                                 // 7
                                                                                                                      // 8
  // tracks the current path change                                                                                   // 9
  this._onEveryPath = new Tracker.Dependency();                                                                       // 10
                                                                                                                      // 11
  this._globalRoute = new Route(this);                                                                                // 12
                                                                                                                      // 13
  // holds onRoute callbacks                                                                                          // 14
  this._onRouteCallbacks = [];                                                                                        // 15
                                                                                                                      // 16
  // if _askedToWait is true. We don't automatically start the router                                                 // 17
  // in Meteor.startup callback. (see client/_init.js)                                                                // 18
  // Instead user need to call `.initialize()                                                                         // 19
  this._askedToWait = false;                                                                                          // 20
  this._initialized = false;                                                                                          // 21
  this._triggersEnter = [];                                                                                           // 22
  this._triggersExit = [];                                                                                            // 23
  this._routes = [];                                                                                                  // 24
  this._routesMap = {};                                                                                               // 25
  this._updateCallbacks();                                                                                            // 26
  this.notFound = this.notfound = null;                                                                               // 27
  // indicate it's okay (or not okay) to run the tracker                                                              // 28
  // when doing subscriptions                                                                                         // 29
  // using a number and increment it help us to support FlowRouter.go()                                               // 30
  // and legitimate reruns inside tracker on the same event loop.                                                     // 31
  // this is a solution for #145                                                                                      // 32
  this.safeToRun = 0;                                                                                                 // 33
                                                                                                                      // 34
  // Meteor exposes to the client the path prefix that was defined using the                                          // 35
  // ROOT_URL environement variable on the server using the global runtime                                            // 36
  // configuration. See #315.                                                                                         // 37
  this._basePath = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';                                              // 38
                                                                                                                      // 39
  // this is a chain contains a list of old routes                                                                    // 40
  // most of the time, there is only one old route                                                                    // 41
  // but when it's the time for a trigger redirect we've a chain                                                      // 42
  this._oldRouteChain = [];                                                                                           // 43
                                                                                                                      // 44
  this.env = {                                                                                                        // 45
    replaceState: new Meteor.EnvironmentVariable(),                                                                   // 46
    reload: new Meteor.EnvironmentVariable(),                                                                         // 47
    trailingSlash: new Meteor.EnvironmentVariable()                                                                   // 48
  };                                                                                                                  // 49
                                                                                                                      // 50
  // redirect function used inside triggers                                                                           // 51
  this._redirectFn = function(pathDef, fields, queryParams) {                                                         // 52
    if (/^http(s)?:\/\//.test(pathDef)) {                                                                             // 53
        var message = "Redirects to URLs outside of the app are not supported in this version of Flow Router. Use 'window.location = yourUrl' instead";
        throw new Error(message);                                                                                     // 55
    }                                                                                                                 // 56
    self.withReplaceState(function() {                                                                                // 57
      var path = FlowRouter.path(pathDef, fields, queryParams);                                                       // 58
      self._page.redirect(path);                                                                                      // 59
    });                                                                                                               // 60
  };                                                                                                                  // 61
  this._initTriggersAPI();                                                                                            // 62
};                                                                                                                    // 63
                                                                                                                      // 64
Router.prototype.route = function(pathDef, options, group) {                                                          // 65
  if (!/^\/.*/.test(pathDef)) {                                                                                       // 66
    var message = "route's path must start with '/'";                                                                 // 67
    throw new Error(message);                                                                                         // 68
  }                                                                                                                   // 69
                                                                                                                      // 70
  options = options || {};                                                                                            // 71
  var self = this;                                                                                                    // 72
  var route = new Route(this, pathDef, options, group);                                                               // 73
                                                                                                                      // 74
  // calls when the page route being activates                                                                        // 75
  route._actionHandle = function (context, next) {                                                                    // 76
    var oldRoute = self._current.route;                                                                               // 77
    self._oldRouteChain.push(oldRoute);                                                                               // 78
                                                                                                                      // 79
    var queryParams = self._qs.parse(context.querystring);                                                            // 80
    // _qs.parse() gives us a object without prototypes,                                                              // 81
    // created with Object.create(null)                                                                               // 82
    // Meteor's check doesn't play nice with it.                                                                      // 83
    // So, we need to fix it by cloning it.                                                                           // 84
    // see more: https://github.com/meteorhacks/flow-router/issues/164                                                // 85
    queryParams = JSON.parse(JSON.stringify(queryParams));                                                            // 86
                                                                                                                      // 87
    self._current = {                                                                                                 // 88
      path: context.path,                                                                                             // 89
      context: context,                                                                                               // 90
      params: context.params,                                                                                         // 91
      queryParams: queryParams,                                                                                       // 92
      route: route,                                                                                                   // 93
      oldRoute: oldRoute                                                                                              // 94
    };                                                                                                                // 95
                                                                                                                      // 96
    // we need to invalidate if all the triggers have been completed                                                  // 97
    // if not that means, we've been redirected to another path                                                       // 98
    // then we don't need to invalidate                                                                               // 99
    var afterAllTriggersRan = function() {                                                                            // 100
      self._invalidateTracker();                                                                                      // 101
    };                                                                                                                // 102
                                                                                                                      // 103
    var triggers = self._triggersEnter.concat(route._triggersEnter);                                                  // 104
    Triggers.runTriggers(                                                                                             // 105
      triggers,                                                                                                       // 106
      self._current,                                                                                                  // 107
      self._redirectFn,                                                                                               // 108
      afterAllTriggersRan                                                                                             // 109
    );                                                                                                                // 110
  };                                                                                                                  // 111
                                                                                                                      // 112
  // calls when you exit from the page js route                                                                       // 113
  route._exitHandle = function(context, next) {                                                                       // 114
    var triggers = self._triggersExit.concat(route._triggersExit);                                                    // 115
    Triggers.runTriggers(                                                                                             // 116
      triggers,                                                                                                       // 117
      self._current,                                                                                                  // 118
      self._redirectFn,                                                                                               // 119
      next                                                                                                            // 120
    );                                                                                                                // 121
  };                                                                                                                  // 122
                                                                                                                      // 123
  this._routes.push(route);                                                                                           // 124
  if (options.name) {                                                                                                 // 125
    this._routesMap[options.name] = route;                                                                            // 126
  }                                                                                                                   // 127
                                                                                                                      // 128
  this._updateCallbacks();                                                                                            // 129
  this._triggerRouteRegister(route);                                                                                  // 130
                                                                                                                      // 131
  return route;                                                                                                       // 132
};                                                                                                                    // 133
                                                                                                                      // 134
Router.prototype.group = function(options) {                                                                          // 135
  return new Group(this, options);                                                                                    // 136
};                                                                                                                    // 137
                                                                                                                      // 138
Router.prototype.path = function(pathDef, fields, queryParams) {                                                      // 139
  if (this._routesMap[pathDef]) {                                                                                     // 140
    pathDef = this._routesMap[pathDef].pathDef;                                                                       // 141
  }                                                                                                                   // 142
                                                                                                                      // 143
  var path = "";                                                                                                      // 144
                                                                                                                      // 145
  // Prefix the path with the router global prefix                                                                    // 146
  if (this._basePath) {                                                                                               // 147
    path += "/" + this._basePath + "/";                                                                               // 148
  }                                                                                                                   // 149
                                                                                                                      // 150
  fields = fields || {};                                                                                              // 151
  var regExp = /(:[\w\(\)\\\+\*\.\?]+)+/g;                                                                            // 152
  path += pathDef.replace(regExp, function(key) {                                                                     // 153
    var firstRegexpChar = key.indexOf("(");                                                                           // 154
    // get the content behind : and (\\d+/)                                                                           // 155
    key = key.substring(1, (firstRegexpChar > 0)? firstRegexpChar: undefined);                                        // 156
    // remove +?*                                                                                                     // 157
    key = key.replace(/[\+\*\?]+/g, "");                                                                              // 158
                                                                                                                      // 159
    // this is to allow page js to keep the custom characters as it is                                                // 160
    // we need to encode 2 times otherwise "/" char does not work properly                                            // 161
    // So, in that case, when I includes "/" it will think it's a part of the                                         // 162
    // route. encoding 2times fixes it                                                                                // 163
    return encodeURIComponent(encodeURIComponent(fields[key] || ""));                                                 // 164
  });                                                                                                                 // 165
                                                                                                                      // 166
  // Replace multiple slashes with single slash                                                                       // 167
  path = path.replace(/\/\/+/g, "/");                                                                                 // 168
                                                                                                                      // 169
  // remove trailing slash                                                                                            // 170
  // but keep the root slash if it's the only one                                                                     // 171
  path = path.match(/^\/{1}$/) ? path: path.replace(/\/$/, "");                                                       // 172
                                                                                                                      // 173
  // explictly asked to add a trailing slash                                                                          // 174
  if(this.env.trailingSlash.get() && _.last(path) !== "/") {                                                          // 175
    path += "/";                                                                                                      // 176
  }                                                                                                                   // 177
                                                                                                                      // 178
  var strQueryParams = this._qs.stringify(queryParams || {});                                                         // 179
  if(strQueryParams) {                                                                                                // 180
    path += "?" + strQueryParams;                                                                                     // 181
  }                                                                                                                   // 182
                                                                                                                      // 183
  return path;                                                                                                        // 184
};                                                                                                                    // 185
                                                                                                                      // 186
Router.prototype.go = function(pathDef, fields, queryParams) {                                                        // 187
  var path = this.path(pathDef, fields, queryParams);                                                                 // 188
                                                                                                                      // 189
  var useReplaceState = this.env.replaceState.get();                                                                  // 190
  if(useReplaceState) {                                                                                               // 191
    this._page.replace(path);                                                                                         // 192
  } else {                                                                                                            // 193
    this._page(path);                                                                                                 // 194
  }                                                                                                                   // 195
};                                                                                                                    // 196
                                                                                                                      // 197
Router.prototype.reload = function() {                                                                                // 198
  var self = this;                                                                                                    // 199
                                                                                                                      // 200
  self.env.reload.withValue(true, function() {                                                                        // 201
    self._page.replace(self._current.path);                                                                           // 202
  });                                                                                                                 // 203
};                                                                                                                    // 204
                                                                                                                      // 205
Router.prototype.redirect = function(path) {                                                                          // 206
  this._page.redirect(path);                                                                                          // 207
};                                                                                                                    // 208
                                                                                                                      // 209
Router.prototype.setParams = function(newParams) {                                                                    // 210
  if(!this._current.route) {return false;}                                                                            // 211
                                                                                                                      // 212
  var pathDef = this._current.route.pathDef;                                                                          // 213
  var existingParams = this._current.params;                                                                          // 214
  var params = {};                                                                                                    // 215
  _.each(_.keys(existingParams), function(key) {                                                                      // 216
    params[key] = existingParams[key];                                                                                // 217
  });                                                                                                                 // 218
                                                                                                                      // 219
  params = _.extend(params, newParams);                                                                               // 220
  var queryParams = this._current.queryParams;                                                                        // 221
                                                                                                                      // 222
  this.go(pathDef, params, queryParams);                                                                              // 223
  return true;                                                                                                        // 224
};                                                                                                                    // 225
                                                                                                                      // 226
Router.prototype.setQueryParams = function(newParams) {                                                               // 227
  if(!this._current.route) {return false;}                                                                            // 228
                                                                                                                      // 229
  var queryParams = _.clone(this._current.queryParams);                                                               // 230
  _.extend(queryParams, newParams);                                                                                   // 231
                                                                                                                      // 232
  for (var k in queryParams) {                                                                                        // 233
    if (queryParams[k] === null || queryParams[k] === undefined) {                                                    // 234
      delete queryParams[k];                                                                                          // 235
    }                                                                                                                 // 236
  }                                                                                                                   // 237
                                                                                                                      // 238
  var pathDef = this._current.route.pathDef;                                                                          // 239
  var params = this._current.params;                                                                                  // 240
  this.go(pathDef, params, queryParams);                                                                              // 241
  return true;                                                                                                        // 242
};                                                                                                                    // 243
                                                                                                                      // 244
// .current is not reactive                                                                                           // 245
// This is by design. use .getParam() instead                                                                         // 246
// If you really need to watch the path change, use .watchPathChange()                                                // 247
Router.prototype.current = function() {                                                                               // 248
  // We can't trust outside, that's why we clone this                                                                 // 249
  // Anyway, we can't clone the whole object since it has non-jsonable values                                         // 250
  // That's why we clone what's really needed.                                                                        // 251
  var current = _.clone(this._current);                                                                               // 252
  current.queryParams = EJSON.clone(current.queryParams);                                                             // 253
  current.params = EJSON.clone(current.params);                                                                       // 254
  return current;                                                                                                     // 255
};                                                                                                                    // 256
                                                                                                                      // 257
// Implementing Reactive APIs                                                                                         // 258
var reactiveApis = [                                                                                                  // 259
  'getParam', 'getQueryParam',                                                                                        // 260
  'getRouteName', 'watchPathChange'                                                                                   // 261
];                                                                                                                    // 262
reactiveApis.forEach(function(api) {                                                                                  // 263
  Router.prototype[api] = function(arg1) {                                                                            // 264
    // when this is calling, there may not be any route initiated                                                     // 265
    // so we need to handle it                                                                                        // 266
    var currentRoute = this._current.route;                                                                           // 267
    if(!currentRoute) {                                                                                               // 268
      this._onEveryPath.depend();                                                                                     // 269
      return;                                                                                                         // 270
    }                                                                                                                 // 271
                                                                                                                      // 272
    // currently, there is only one argument. If we've more let's add more args                                       // 273
    // this is not clean code, but better in performance                                                              // 274
    return currentRoute[api].call(currentRoute, arg1);                                                                // 275
  };                                                                                                                  // 276
});                                                                                                                   // 277
                                                                                                                      // 278
Router.prototype.subsReady = function() {                                                                             // 279
  var callback = null;                                                                                                // 280
  var args = _.toArray(arguments);                                                                                    // 281
                                                                                                                      // 282
  if (typeof _.last(args) === "function") {                                                                           // 283
    callback = args.pop();                                                                                            // 284
  }                                                                                                                   // 285
                                                                                                                      // 286
  var currentRoute = this.current().route;                                                                            // 287
  var globalRoute = this._globalRoute;                                                                                // 288
                                                                                                                      // 289
  // we need to depend for every route change and                                                                     // 290
  // rerun subscriptions to check the ready state                                                                     // 291
  this._onEveryPath.depend();                                                                                         // 292
                                                                                                                      // 293
  if(!currentRoute) {                                                                                                 // 294
    return false;                                                                                                     // 295
  }                                                                                                                   // 296
                                                                                                                      // 297
  var subscriptions;                                                                                                  // 298
  if(args.length === 0) {                                                                                             // 299
    subscriptions = _.values(globalRoute.getAllSubscriptions());                                                      // 300
    subscriptions = subscriptions.concat(_.values(currentRoute.getAllSubscriptions()));                               // 301
  } else {                                                                                                            // 302
    subscriptions = _.map(args, function(subName) {                                                                   // 303
      return globalRoute.getSubscription(subName) || currentRoute.getSubscription(subName);                           // 304
    });                                                                                                               // 305
  }                                                                                                                   // 306
                                                                                                                      // 307
  var isReady = function() {                                                                                          // 308
    var ready =  _.every(subscriptions, function(sub) {                                                               // 309
      return sub && sub.ready();                                                                                      // 310
    });                                                                                                               // 311
                                                                                                                      // 312
    return ready;                                                                                                     // 313
  };                                                                                                                  // 314
                                                                                                                      // 315
  if (callback) {                                                                                                     // 316
    Tracker.autorun(function(c) {                                                                                     // 317
      if (isReady()) {                                                                                                // 318
        callback();                                                                                                   // 319
        c.stop();                                                                                                     // 320
      }                                                                                                               // 321
    });                                                                                                               // 322
  } else {                                                                                                            // 323
    return isReady();                                                                                                 // 324
  }                                                                                                                   // 325
};                                                                                                                    // 326
                                                                                                                      // 327
Router.prototype.withReplaceState = function(fn) {                                                                    // 328
  return this.env.replaceState.withValue(true, fn);                                                                   // 329
};                                                                                                                    // 330
                                                                                                                      // 331
Router.prototype.withTrailingSlash = function(fn) {                                                                   // 332
  return this.env.trailingSlash.withValue(true, fn);                                                                  // 333
};                                                                                                                    // 334
                                                                                                                      // 335
Router.prototype._notfoundRoute = function(context) {                                                                 // 336
  this._current = {                                                                                                   // 337
    path: context.path,                                                                                               // 338
    context: context,                                                                                                 // 339
    params: [],                                                                                                       // 340
    queryParams: {},                                                                                                  // 341
  };                                                                                                                  // 342
                                                                                                                      // 343
  // XXX this.notfound kept for backwards compatibility                                                               // 344
  this.notFound = this.notFound || this.notfound;                                                                     // 345
  if(!this.notFound) {                                                                                                // 346
    console.error("There is no route for the path:", context.path);                                                   // 347
    return;                                                                                                           // 348
  }                                                                                                                   // 349
                                                                                                                      // 350
  this._current.route = new Route(this, "*", this.notFound);                                                          // 351
  this._invalidateTracker();                                                                                          // 352
};                                                                                                                    // 353
                                                                                                                      // 354
Router.prototype.initialize = function(options) {                                                                     // 355
  options = options || {};                                                                                            // 356
                                                                                                                      // 357
  if(this._initialized) {                                                                                             // 358
    throw new Error("FlowRouter is already initialized");                                                             // 359
  }                                                                                                                   // 360
                                                                                                                      // 361
  var self = this;                                                                                                    // 362
  this._updateCallbacks();                                                                                            // 363
                                                                                                                      // 364
  // Implementing idempotent routing                                                                                  // 365
  // by overriding page.js`s "show" method.                                                                           // 366
  // Why?                                                                                                             // 367
  // It is impossible to bypass exit triggers,                                                                        // 368
  // because they execute before the handler and                                                                      // 369
  // can not know what the next path is, inside exit trigger.                                                         // 370
  //                                                                                                                  // 371
  // we need override both show, replace to make this work                                                            // 372
  // since we use redirect when we are talking about withReplaceState                                                 // 373
  _.each(['show', 'replace'], function(fnName) {                                                                      // 374
    var original = self._page[fnName];                                                                                // 375
    self._page[fnName] = function(path, state, dispatch, push) {                                                      // 376
      var reload = self.env.reload.get();                                                                             // 377
      if (!reload && self._current.path === path) {                                                                   // 378
        return;                                                                                                       // 379
      }                                                                                                               // 380
                                                                                                                      // 381
      original.call(this, path, state, dispatch, push);                                                               // 382
    };                                                                                                                // 383
  });                                                                                                                 // 384
                                                                                                                      // 385
  // this is very ugly part of pagejs and it does decoding few times                                                  // 386
  // in unpredicatable manner. See #168                                                                               // 387
  // this is the default behaviour and we need keep it like that                                                      // 388
  // we are doing a hack. see .path()                                                                                 // 389
  this._page.base(this._basePath);                                                                                    // 390
  this._page({                                                                                                        // 391
    decodeURLComponents: true,                                                                                        // 392
    hashbang: !!options.hashbang                                                                                      // 393
  });                                                                                                                 // 394
                                                                                                                      // 395
  this._initialized = true;                                                                                           // 396
};                                                                                                                    // 397
                                                                                                                      // 398
Router.prototype._buildTracker = function() {                                                                         // 399
  var self = this;                                                                                                    // 400
                                                                                                                      // 401
  // main autorun function                                                                                            // 402
  var tracker = Tracker.autorun(function () {                                                                         // 403
    if(!self._current || !self._current.route) {                                                                      // 404
      return;                                                                                                         // 405
    }                                                                                                                 // 406
                                                                                                                      // 407
    // see the definition of `this._processingContexts`                                                               // 408
    var currentContext = self._current;                                                                               // 409
    var route = currentContext.route;                                                                                 // 410
    var path = currentContext.path;                                                                                   // 411
                                                                                                                      // 412
    if(self.safeToRun === 0) {                                                                                        // 413
      var message =                                                                                                   // 414
        "You can't use reactive data sources like Session" +                                                          // 415
        " inside the `.subscriptions` method!";                                                                       // 416
      throw new Error(message);                                                                                       // 417
    }                                                                                                                 // 418
                                                                                                                      // 419
    // We need to run subscriptions inside a Tracker                                                                  // 420
    // to stop subs when switching between routes                                                                     // 421
    // But we don't need to run this tracker with                                                                     // 422
    // other reactive changes inside the .subscription method                                                         // 423
    // We tackle this with the `safeToRun` variable                                                                   // 424
    self._globalRoute.clearSubscriptions();                                                                           // 425
    self.subscriptions.call(self._globalRoute, path);                                                                 // 426
    route.callSubscriptions(currentContext);                                                                          // 427
                                                                                                                      // 428
    // otherwise, computations inside action will trigger to re-run                                                   // 429
    // this computation. which we do not need.                                                                        // 430
    Tracker.nonreactive(function() {                                                                                  // 431
      var isRouteChange = currentContext.oldRoute !== currentContext.route;                                           // 432
      var isFirstRoute = !currentContext.oldRoute;                                                                    // 433
      // first route is not a route change                                                                            // 434
      if(isFirstRoute) {                                                                                              // 435
        isRouteChange = false;                                                                                        // 436
      }                                                                                                               // 437
                                                                                                                      // 438
      // Clear oldRouteChain just before calling the action                                                           // 439
      // We still need to get a copy of the oldestRoute first                                                         // 440
      // It's very important to get the oldest route and registerRouteClose() it                                      // 441
      // See: https://github.com/kadirahq/flow-router/issues/314                                                      // 442
      var oldestRoute = self._oldRouteChain[0];                                                                       // 443
      self._oldRouteChain = [];                                                                                       // 444
                                                                                                                      // 445
      currentContext.route.registerRouteChange(currentContext, isRouteChange);                                        // 446
      route.callAction(currentContext);                                                                               // 447
                                                                                                                      // 448
      Tracker.afterFlush(function() {                                                                                 // 449
        self._onEveryPath.changed();                                                                                  // 450
        if(isRouteChange) {                                                                                           // 451
          // We need to trigger that route (definition itself) has changed.                                           // 452
          // So, we need to re-run all the register callbacks to current route                                        // 453
          // This is pretty important, otherwise tracker                                                              // 454
          // can't identify new route's items                                                                         // 455
                                                                                                                      // 456
          // We also need to afterFlush, otherwise this will re-run                                                   // 457
          // helpers on templates which are marked for destroying                                                     // 458
          if(oldestRoute) {                                                                                           // 459
            oldestRoute.registerRouteClose();                                                                         // 460
          }                                                                                                           // 461
        }                                                                                                             // 462
      });                                                                                                             // 463
    });                                                                                                               // 464
                                                                                                                      // 465
    self.safeToRun--;                                                                                                 // 466
  });                                                                                                                 // 467
                                                                                                                      // 468
  return tracker;                                                                                                     // 469
};                                                                                                                    // 470
                                                                                                                      // 471
Router.prototype._invalidateTracker = function() {                                                                    // 472
  var self = this;                                                                                                    // 473
  this.safeToRun++;                                                                                                   // 474
  this._tracker.invalidate();                                                                                         // 475
  // After the invalidation we need to flush to make changes imediately                                               // 476
  // otherwise, we have face some issues context mix-maches and so on.                                                // 477
  // But there are some cases we can't flush. So we need to ready for that.                                           // 478
                                                                                                                      // 479
  // we clearly know, we can't flush inside an autorun                                                                // 480
  // this may leads some issues on flow-routing                                                                       // 481
  // we may need to do some warning                                                                                   // 482
  if(!Tracker.currentComputation) {                                                                                   // 483
    // Still there are some cases where we can't flush                                                                // 484
    //  eg:- when there is a flush currently                                                                          // 485
    // But we've no public API or hacks to get that state                                                             // 486
    // So, this is the only solution                                                                                  // 487
    try {                                                                                                             // 488
      Tracker.flush();                                                                                                // 489
    } catch(ex) {                                                                                                     // 490
      // only handling "while flushing" errors                                                                        // 491
      if(!/Tracker\.flush while flushing/.test(ex.message)) {                                                         // 492
        return;                                                                                                       // 493
      }                                                                                                               // 494
                                                                                                                      // 495
      // XXX: fix this with a proper solution by removing subscription mgt.                                           // 496
      // from the router. Then we don't need to run invalidate using a tracker                                        // 497
                                                                                                                      // 498
      // this happens when we are trying to invoke a route change                                                     // 499
      // with inside a route chnage. (eg:- Template.onCreated)                                                        // 500
      // Since we use page.js and tracker, we don't have much control                                                 // 501
      // over this process.                                                                                           // 502
      // only solution is to defer route execution.                                                                   // 503
                                                                                                                      // 504
      // It's possible to have more than one path want to defer                                                       // 505
      // But, we only need to pick the last one.                                                                      // 506
      // self._nextPath = self._current.path;                                                                         // 507
      Meteor.defer(function() {                                                                                       // 508
        var path = self._nextPath;                                                                                    // 509
        if(!path) {                                                                                                   // 510
          return;                                                                                                     // 511
        }                                                                                                             // 512
                                                                                                                      // 513
        delete self._nextPath;                                                                                        // 514
        self.env.reload.withValue(true, function() {                                                                  // 515
          self.go(path);                                                                                              // 516
        });                                                                                                           // 517
      });                                                                                                             // 518
    }                                                                                                                 // 519
  }                                                                                                                   // 520
};                                                                                                                    // 521
                                                                                                                      // 522
Router.prototype._updateCallbacks = function () {                                                                     // 523
  var self = this;                                                                                                    // 524
                                                                                                                      // 525
  self._page.callbacks = [];                                                                                          // 526
  self._page.exits = [];                                                                                              // 527
                                                                                                                      // 528
  _.each(self._routes, function(route) {                                                                              // 529
    self._page(route.pathDef, route._actionHandle);                                                                   // 530
    self._page.exit(route.pathDef, route._exitHandle);                                                                // 531
  });                                                                                                                 // 532
                                                                                                                      // 533
  self._page("*", function(context) {                                                                                 // 534
    self._notfoundRoute(context);                                                                                     // 535
  });                                                                                                                 // 536
};                                                                                                                    // 537
                                                                                                                      // 538
Router.prototype._initTriggersAPI = function() {                                                                      // 539
  var self = this;                                                                                                    // 540
  this.triggers = {                                                                                                   // 541
    enter: function(triggers, filter) {                                                                               // 542
      triggers = Triggers.applyFilters(triggers, filter);                                                             // 543
      if(triggers.length) {                                                                                           // 544
        self._triggersEnter = self._triggersEnter.concat(triggers);                                                   // 545
      }                                                                                                               // 546
    },                                                                                                                // 547
                                                                                                                      // 548
    exit: function(triggers, filter) {                                                                                // 549
      triggers = Triggers.applyFilters(triggers, filter);                                                             // 550
      if(triggers.length) {                                                                                           // 551
        self._triggersExit = self._triggersExit.concat(triggers);                                                     // 552
      }                                                                                                               // 553
    }                                                                                                                 // 554
  };                                                                                                                  // 555
};                                                                                                                    // 556
                                                                                                                      // 557
Router.prototype.wait = function() {                                                                                  // 558
  if(this._initialized) {                                                                                             // 559
    throw new Error("can't wait after FlowRouter has been initialized");                                              // 560
  }                                                                                                                   // 561
                                                                                                                      // 562
  this._askedToWait = true;                                                                                           // 563
};                                                                                                                    // 564
                                                                                                                      // 565
Router.prototype.onRouteRegister = function(cb) {                                                                     // 566
  this._onRouteCallbacks.push(cb);                                                                                    // 567
};                                                                                                                    // 568
                                                                                                                      // 569
Router.prototype._triggerRouteRegister = function(currentRoute) {                                                     // 570
  // We should only need to send a safe set of fields on the route                                                    // 571
  // object.                                                                                                          // 572
  // This is not to hide what's inside the route object, but to show                                                  // 573
  // these are the public APIs                                                                                        // 574
  var routePublicApi = _.pick(currentRoute, 'name', 'pathDef', 'path');                                               // 575
  var omittingOptionFields = [                                                                                        // 576
    'triggersEnter', 'triggersExit', 'action', 'subscriptions', 'name'                                                // 577
  ];                                                                                                                  // 578
  routePublicApi.options = _.omit(currentRoute.options, omittingOptionFields);                                        // 579
                                                                                                                      // 580
  _.each(this._onRouteCallbacks, function(cb) {                                                                       // 581
    cb(routePublicApi);                                                                                               // 582
  });                                                                                                                 // 583
};                                                                                                                    // 584
                                                                                                                      // 585
Router.prototype._page = page;                                                                                        // 586
Router.prototype._qs = qs;                                                                                            // 587
                                                                                                                      // 588
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"group.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/kadira_flow-router/client/group.js                                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
Group = function(router, options, parent) {                                                                           // 1
  options = options || {};                                                                                            // 2
                                                                                                                      // 3
  if (options.prefix && !/^\/.*/.test(options.prefix)) {                                                              // 4
    var message = "group's prefix must start with '/'";                                                               // 5
    throw new Error(message);                                                                                         // 6
  }                                                                                                                   // 7
                                                                                                                      // 8
  this._router = router;                                                                                              // 9
  this.prefix = options.prefix || '';                                                                                 // 10
  this.name = options.name;                                                                                           // 11
  this.options = options;                                                                                             // 12
                                                                                                                      // 13
  this._triggersEnter = options.triggersEnter || [];                                                                  // 14
  this._triggersExit = options.triggersExit || [];                                                                    // 15
  this._subscriptions = options.subscriptions || Function.prototype;                                                  // 16
                                                                                                                      // 17
  this.parent = parent;                                                                                               // 18
  if (this.parent) {                                                                                                  // 19
    this.prefix = parent.prefix + this.prefix;                                                                        // 20
                                                                                                                      // 21
    this._triggersEnter = parent._triggersEnter.concat(this._triggersEnter);                                          // 22
    this._triggersExit = this._triggersExit.concat(parent._triggersExit);                                             // 23
  }                                                                                                                   // 24
};                                                                                                                    // 25
                                                                                                                      // 26
Group.prototype.route = function(pathDef, options, group) {                                                           // 27
  options = options || {};                                                                                            // 28
                                                                                                                      // 29
  if (!/^\/.*/.test(pathDef)) {                                                                                       // 30
    var message = "route's path must start with '/'";                                                                 // 31
    throw new Error(message);                                                                                         // 32
  }                                                                                                                   // 33
                                                                                                                      // 34
  group = group || this;                                                                                              // 35
  pathDef = this.prefix + pathDef;                                                                                    // 36
                                                                                                                      // 37
  var triggersEnter = options.triggersEnter || [];                                                                    // 38
  options.triggersEnter = this._triggersEnter.concat(triggersEnter);                                                  // 39
                                                                                                                      // 40
  var triggersExit = options.triggersExit || [];                                                                      // 41
  options.triggersExit = triggersExit.concat(this._triggersExit);                                                     // 42
                                                                                                                      // 43
  return this._router.route(pathDef, options, group);                                                                 // 44
};                                                                                                                    // 45
                                                                                                                      // 46
Group.prototype.group = function(options) {                                                                           // 47
  return new Group(this._router, options, this);                                                                      // 48
};                                                                                                                    // 49
                                                                                                                      // 50
Group.prototype.callSubscriptions = function(current) {                                                               // 51
  if (this.parent) {                                                                                                  // 52
    this.parent.callSubscriptions(current);                                                                           // 53
  }                                                                                                                   // 54
                                                                                                                      // 55
  this._subscriptions.call(current.route, current.params, current.queryParams);                                       // 56
};                                                                                                                    // 57
                                                                                                                      // 58
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"route.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/kadira_flow-router/client/route.js                                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
Route = function(router, pathDef, options, group) {                                                                   // 1
  options = options || {};                                                                                            // 2
                                                                                                                      // 3
  this.options = options;                                                                                             // 4
  this.pathDef = pathDef                                                                                              // 5
                                                                                                                      // 6
  // Route.path is deprecated and will be removed in 3.0                                                              // 7
  this.path = pathDef;                                                                                                // 8
                                                                                                                      // 9
  if (options.name) {                                                                                                 // 10
    this.name = options.name;                                                                                         // 11
  }                                                                                                                   // 12
                                                                                                                      // 13
  this._action = options.action || Function.prototype;                                                                // 14
  this._subscriptions = options.subscriptions || Function.prototype;                                                  // 15
  this._triggersEnter = options.triggersEnter || [];                                                                  // 16
  this._triggersExit = options.triggersExit || [];                                                                    // 17
  this._subsMap = {};                                                                                                 // 18
  this._router = router;                                                                                              // 19
                                                                                                                      // 20
  this._params = new ReactiveDict();                                                                                  // 21
  this._queryParams = new ReactiveDict();                                                                             // 22
  this._routeCloseDep = new Tracker.Dependency();                                                                     // 23
                                                                                                                      // 24
  // tracks the changes in the URL                                                                                    // 25
  this._pathChangeDep = new Tracker.Dependency();                                                                     // 26
                                                                                                                      // 27
  this.group = group;                                                                                                 // 28
};                                                                                                                    // 29
                                                                                                                      // 30
Route.prototype.clearSubscriptions = function() {                                                                     // 31
  this._subsMap = {};                                                                                                 // 32
};                                                                                                                    // 33
                                                                                                                      // 34
Route.prototype.register = function(name, sub, options) {                                                             // 35
  this._subsMap[name] = sub;                                                                                          // 36
};                                                                                                                    // 37
                                                                                                                      // 38
                                                                                                                      // 39
Route.prototype.getSubscription = function(name) {                                                                    // 40
  return this._subsMap[name];                                                                                         // 41
};                                                                                                                    // 42
                                                                                                                      // 43
                                                                                                                      // 44
Route.prototype.getAllSubscriptions = function() {                                                                    // 45
  return this._subsMap;                                                                                               // 46
};                                                                                                                    // 47
                                                                                                                      // 48
Route.prototype.callAction = function(current) {                                                                      // 49
  var self = this;                                                                                                    // 50
  self._action(current.params, current.queryParams);                                                                  // 51
};                                                                                                                    // 52
                                                                                                                      // 53
Route.prototype.callSubscriptions = function(current) {                                                               // 54
  this.clearSubscriptions();                                                                                          // 55
  if (this.group) {                                                                                                   // 56
    this.group.callSubscriptions(current);                                                                            // 57
  }                                                                                                                   // 58
                                                                                                                      // 59
  this._subscriptions(current.params, current.queryParams);                                                           // 60
};                                                                                                                    // 61
                                                                                                                      // 62
Route.prototype.getRouteName = function() {                                                                           // 63
  this._routeCloseDep.depend();                                                                                       // 64
  return this.name;                                                                                                   // 65
};                                                                                                                    // 66
                                                                                                                      // 67
Route.prototype.getParam = function(key) {                                                                            // 68
  this._routeCloseDep.depend();                                                                                       // 69
  return this._params.get(key);                                                                                       // 70
};                                                                                                                    // 71
                                                                                                                      // 72
Route.prototype.getQueryParam = function(key) {                                                                       // 73
  this._routeCloseDep.depend();                                                                                       // 74
  return this._queryParams.get(key);                                                                                  // 75
};                                                                                                                    // 76
                                                                                                                      // 77
Route.prototype.watchPathChange = function() {                                                                        // 78
  this._pathChangeDep.depend();                                                                                       // 79
};                                                                                                                    // 80
                                                                                                                      // 81
Route.prototype.registerRouteClose = function() {                                                                     // 82
  this._params = new ReactiveDict();                                                                                  // 83
  this._queryParams = new ReactiveDict();                                                                             // 84
  this._routeCloseDep.changed();                                                                                      // 85
  this._pathChangeDep.changed();                                                                                      // 86
};                                                                                                                    // 87
                                                                                                                      // 88
Route.prototype.registerRouteChange = function(currentContext, routeChanging) {                                       // 89
  // register params                                                                                                  // 90
  var params = currentContext.params;                                                                                 // 91
  this._updateReactiveDict(this._params, params);                                                                     // 92
                                                                                                                      // 93
  // register query params                                                                                            // 94
  var queryParams = currentContext.queryParams;                                                                       // 95
  this._updateReactiveDict(this._queryParams, queryParams);                                                           // 96
                                                                                                                      // 97
  // if the route is changing, we need to defer triggering path changing                                              // 98
  // if we did this, old route's path watchers will detect this                                                       // 99
  // Real issue is, above watcher will get removed with the new route                                                 // 100
  // So, we don't need to trigger it now                                                                              // 101
  // We are doing it on the route close event. So, if they exists they'll                                             // 102
  // get notify that                                                                                                  // 103
  if(!routeChanging) {                                                                                                // 104
    this._pathChangeDep.changed();                                                                                    // 105
  }                                                                                                                   // 106
};                                                                                                                    // 107
                                                                                                                      // 108
Route.prototype._updateReactiveDict = function(dict, newValues) {                                                     // 109
  var currentKeys = _.keys(newValues);                                                                                // 110
  var oldKeys = _.keys(dict.keyDeps);                                                                                 // 111
                                                                                                                      // 112
  // set new values                                                                                                   // 113
  //  params is an array. So, _.each(params) does not works                                                           // 114
  //  to iterate params                                                                                               // 115
  _.each(currentKeys, function(key) {                                                                                 // 116
    dict.set(key, newValues[key]);                                                                                    // 117
  });                                                                                                                 // 118
                                                                                                                      // 119
  // remove keys which does not exisits here                                                                          // 120
  var removedKeys = _.difference(oldKeys, currentKeys);                                                               // 121
  _.each(removedKeys, function(key) {                                                                                 // 122
    dict.set(key, undefined);                                                                                         // 123
  });                                                                                                                 // 124
};                                                                                                                    // 125
                                                                                                                      // 126
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"_init.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/kadira_flow-router/client/_init.js                                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// Export Router Instance                                                                                             // 1
FlowRouter = new Router();                                                                                            // 2
FlowRouter.Router = Router;                                                                                           // 3
FlowRouter.Route = Route;                                                                                             // 4
                                                                                                                      // 5
// Initialize FlowRouter                                                                                              // 6
Meteor.startup(function () {                                                                                          // 7
  if(!FlowRouter._askedToWait) {                                                                                      // 8
    FlowRouter.initialize();                                                                                          // 9
  }                                                                                                                   // 10
});                                                                                                                   // 11
                                                                                                                      // 12
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lib":{"router.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/kadira_flow-router/lib/router.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
Router.prototype.url = function() {                                                                                   // 1
  // We need to remove the leading base path, or "/", as it will be inserted                                          // 2
  // automatically by `Meteor.absoluteUrl` as documented in:                                                          // 3
  // http://docs.meteor.com/#/full/meteor_absoluteurl                                                                 // 4
  var completePath = this.path.apply(this, arguments);                                                                // 5
  var basePath = this._basePath || '/';                                                                               // 6
  var pathWithoutBase = completePath.replace(new RegExp('^' + basePath), '');                                         // 7
  return Meteor.absoluteUrl(pathWithoutBase);                                                                         // 8
};                                                                                                                    // 9
                                                                                                                      // 10
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"page":{"index.js":["path-to-regexp",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/kadira_flow-router/node_modules/page/index.js                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
  /* globals require, module */                                                                                       // 1
                                                                                                                      // 2
  'use strict';                                                                                                       // 3
                                                                                                                      // 4
  /**                                                                                                                 // 5
   * Module dependencies.                                                                                             // 6
   */                                                                                                                 // 7
                                                                                                                      // 8
  var pathtoRegexp = require('path-to-regexp');                                                                       // 9
                                                                                                                      // 10
  /**                                                                                                                 // 11
   * Module exports.                                                                                                  // 12
   */                                                                                                                 // 13
                                                                                                                      // 14
  module.exports = page;                                                                                              // 15
                                                                                                                      // 16
  /**                                                                                                                 // 17
   * Detect click event                                                                                               // 18
   */                                                                                                                 // 19
  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';               // 20
                                                                                                                      // 21
  /**                                                                                                                 // 22
   * To work properly with the URL                                                                                    // 23
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API                               // 24
   */                                                                                                                 // 25
                                                                                                                      // 26
  var location = ('undefined' !== typeof window) && (window.history.location || window.location);                     // 27
                                                                                                                      // 28
  /**                                                                                                                 // 29
   * Perform initial dispatch.                                                                                        // 30
   */                                                                                                                 // 31
                                                                                                                      // 32
  var dispatch = true;                                                                                                // 33
                                                                                                                      // 34
                                                                                                                      // 35
  /**                                                                                                                 // 36
   * Decode URL components (query string, pathname, hash).                                                            // 37
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.                                     // 38
   */                                                                                                                 // 39
  var decodeURLComponents = true;                                                                                     // 40
                                                                                                                      // 41
  /**                                                                                                                 // 42
   * Base path.                                                                                                       // 43
   */                                                                                                                 // 44
                                                                                                                      // 45
  var base = '';                                                                                                      // 46
                                                                                                                      // 47
  /**                                                                                                                 // 48
   * Running flag.                                                                                                    // 49
   */                                                                                                                 // 50
                                                                                                                      // 51
  var running;                                                                                                        // 52
                                                                                                                      // 53
  /**                                                                                                                 // 54
   * HashBang option                                                                                                  // 55
   */                                                                                                                 // 56
                                                                                                                      // 57
  var hashbang = false;                                                                                               // 58
                                                                                                                      // 59
  /**                                                                                                                 // 60
   * Previous context, for capturing                                                                                  // 61
   * page exit events.                                                                                                // 62
   */                                                                                                                 // 63
                                                                                                                      // 64
  var prevContext;                                                                                                    // 65
                                                                                                                      // 66
  /**                                                                                                                 // 67
   * Register `path` with callback `fn()`,                                                                            // 68
   * or route `path`, or redirection,                                                                                 // 69
   * or `page.start()`.                                                                                               // 70
   *                                                                                                                  // 71
   *   page(fn);                                                                                                      // 72
   *   page('*', fn);                                                                                                 // 73
   *   page('/user/:id', load, user);                                                                                 // 74
   *   page('/user/' + user.id, { some: 'thing' });                                                                   // 75
   *   page('/user/' + user.id);                                                                                      // 76
   *   page('/from', '/to')                                                                                           // 77
   *   page();                                                                                                        // 78
   *                                                                                                                  // 79
   * @param {string|!Function|!Object} path                                                                           // 80
   * @param {Function=} fn                                                                                            // 81
   * @api public                                                                                                      // 82
   */                                                                                                                 // 83
                                                                                                                      // 84
  function page(path, fn) {                                                                                           // 85
    // <callback>                                                                                                     // 86
    if ('function' === typeof path) {                                                                                 // 87
      return page('*', path);                                                                                         // 88
    }                                                                                                                 // 89
                                                                                                                      // 90
    // route <path> to <callback ...>                                                                                 // 91
    if ('function' === typeof fn) {                                                                                   // 92
      var route = new Route(/** @type {string} */ (path));                                                            // 93
      for (var i = 1; i < arguments.length; ++i) {                                                                    // 94
        page.callbacks.push(route.middleware(arguments[i]));                                                          // 95
      }                                                                                                               // 96
      // show <path> with [state]                                                                                     // 97
    } else if ('string' === typeof path) {                                                                            // 98
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);                                                   // 99
      // start [options]                                                                                              // 100
    } else {                                                                                                          // 101
      page.start(path);                                                                                               // 102
    }                                                                                                                 // 103
  }                                                                                                                   // 104
                                                                                                                      // 105
  /**                                                                                                                 // 106
   * Callback functions.                                                                                              // 107
   */                                                                                                                 // 108
                                                                                                                      // 109
  page.callbacks = [];                                                                                                // 110
  page.exits = [];                                                                                                    // 111
                                                                                                                      // 112
  /**                                                                                                                 // 113
   * Current path being processed                                                                                     // 114
   * @type {string}                                                                                                   // 115
   */                                                                                                                 // 116
  page.current = '';                                                                                                  // 117
                                                                                                                      // 118
  /**                                                                                                                 // 119
   * Number of pages navigated to.                                                                                    // 120
   * @type {number}                                                                                                   // 121
   *                                                                                                                  // 122
   *     page.len == 0;                                                                                               // 123
   *     page('/login');                                                                                              // 124
   *     page.len == 1;                                                                                               // 125
   */                                                                                                                 // 126
                                                                                                                      // 127
  page.len = 0;                                                                                                       // 128
                                                                                                                      // 129
  /**                                                                                                                 // 130
   * Get or set basepath to `path`.                                                                                   // 131
   *                                                                                                                  // 132
   * @param {string} path                                                                                             // 133
   * @api public                                                                                                      // 134
   */                                                                                                                 // 135
                                                                                                                      // 136
  page.base = function(path) {                                                                                        // 137
    if (0 === arguments.length) return base;                                                                          // 138
    base = path;                                                                                                      // 139
  };                                                                                                                  // 140
                                                                                                                      // 141
  /**                                                                                                                 // 142
   * Bind with the given `options`.                                                                                   // 143
   *                                                                                                                  // 144
   * Options:                                                                                                         // 145
   *                                                                                                                  // 146
   *    - `click` bind to click events [true]                                                                         // 147
   *    - `popstate` bind to popstate [true]                                                                          // 148
   *    - `dispatch` perform initial dispatch [true]                                                                  // 149
   *                                                                                                                  // 150
   * @param {Object} options                                                                                          // 151
   * @api public                                                                                                      // 152
   */                                                                                                                 // 153
                                                                                                                      // 154
  page.start = function(options) {                                                                                    // 155
    options = options || {};                                                                                          // 156
    if (running) return;                                                                                              // 157
    running = true;                                                                                                   // 158
    if (false === options.dispatch) dispatch = false;                                                                 // 159
    if (false === options.decodeURLComponents) decodeURLComponents = false;                                           // 160
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);                           // 161
    if (false !== options.click) {                                                                                    // 162
      document.addEventListener(clickEvent, onclick, false);                                                          // 163
    }                                                                                                                 // 164
    if (true === options.hashbang) hashbang = true;                                                                   // 165
    if (!dispatch) return;                                                                                            // 166
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);                                                                          // 168
  };                                                                                                                  // 169
                                                                                                                      // 170
  /**                                                                                                                 // 171
   * Unbind click and popstate event handlers.                                                                        // 172
   *                                                                                                                  // 173
   * @api public                                                                                                      // 174
   */                                                                                                                 // 175
                                                                                                                      // 176
  page.stop = function() {                                                                                            // 177
    if (!running) return;                                                                                             // 178
    page.current = '';                                                                                                // 179
    page.len = 0;                                                                                                     // 180
    running = false;                                                                                                  // 181
    document.removeEventListener(clickEvent, onclick, false);                                                         // 182
    window.removeEventListener('popstate', onpopstate, false);                                                        // 183
  };                                                                                                                  // 184
                                                                                                                      // 185
  /**                                                                                                                 // 186
   * Show `path` with optional `state` object.                                                                        // 187
   *                                                                                                                  // 188
   * @param {string} path                                                                                             // 189
   * @param {Object=} state                                                                                           // 190
   * @param {boolean=} dispatch                                                                                       // 191
   * @param {boolean=} push                                                                                           // 192
   * @return {!Context}                                                                                               // 193
   * @api public                                                                                                      // 194
   */                                                                                                                 // 195
                                                                                                                      // 196
  page.show = function(path, state, dispatch, push) {                                                                 // 197
    var ctx = new Context(path, state);                                                                               // 198
    page.current = ctx.path;                                                                                          // 199
    if (false !== dispatch) page.dispatch(ctx);                                                                       // 200
    if (false !== ctx.handled && false !== push) ctx.pushState();                                                     // 201
    return ctx;                                                                                                       // 202
  };                                                                                                                  // 203
                                                                                                                      // 204
  /**                                                                                                                 // 205
   * Goes back in the history                                                                                         // 206
   * Back should always let the current route push state and then go back.                                            // 207
   *                                                                                                                  // 208
   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base    // 209
   * @param {Object=} state                                                                                           // 210
   * @api public                                                                                                      // 211
   */                                                                                                                 // 212
                                                                                                                      // 213
  page.back = function(path, state) {                                                                                 // 214
    if (page.len > 0) {                                                                                               // 215
      // this may need more testing to see if all browsers                                                            // 216
      // wait for the next tick to go back in history                                                                 // 217
      history.back();                                                                                                 // 218
      page.len--;                                                                                                     // 219
    } else if (path) {                                                                                                // 220
      setTimeout(function() {                                                                                         // 221
        page.show(path, state);                                                                                       // 222
      });                                                                                                             // 223
    }else{                                                                                                            // 224
      setTimeout(function() {                                                                                         // 225
        page.show(base, state);                                                                                       // 226
      });                                                                                                             // 227
    }                                                                                                                 // 228
  };                                                                                                                  // 229
                                                                                                                      // 230
                                                                                                                      // 231
  /**                                                                                                                 // 232
   * Register route to redirect from one path to other                                                                // 233
   * or just redirect to another route                                                                                // 234
   *                                                                                                                  // 235
   * @param {string} from - if param 'to' is undefined redirects to 'from'                                            // 236
   * @param {string=} to                                                                                              // 237
   * @api public                                                                                                      // 238
   */                                                                                                                 // 239
  page.redirect = function(from, to) {                                                                                // 240
    // Define route from a path to another                                                                            // 241
    if ('string' === typeof from && 'string' === typeof to) {                                                         // 242
      page(from, function(e) {                                                                                        // 243
        setTimeout(function() {                                                                                       // 244
          page.replace(/** @type {!string} */ (to));                                                                  // 245
        }, 0);                                                                                                        // 246
      });                                                                                                             // 247
    }                                                                                                                 // 248
                                                                                                                      // 249
    // Wait for the push state and replace it with another                                                            // 250
    if ('string' === typeof from && 'undefined' === typeof to) {                                                      // 251
      setTimeout(function() {                                                                                         // 252
        page.replace(from);                                                                                           // 253
      }, 0);                                                                                                          // 254
    }                                                                                                                 // 255
  };                                                                                                                  // 256
                                                                                                                      // 257
  /**                                                                                                                 // 258
   * Replace `path` with optional `state` object.                                                                     // 259
   *                                                                                                                  // 260
   * @param {string} path                                                                                             // 261
   * @param {Object=} state                                                                                           // 262
   * @param {boolean=} init                                                                                           // 263
   * @param {boolean=} dispatch                                                                                       // 264
   * @return {!Context}                                                                                               // 265
   * @api public                                                                                                      // 266
   */                                                                                                                 // 267
                                                                                                                      // 268
                                                                                                                      // 269
  page.replace = function(path, state, init, dispatch) {                                                              // 270
    var ctx = new Context(path, state);                                                                               // 271
    page.current = ctx.path;                                                                                          // 272
    ctx.init = init;                                                                                                  // 273
    ctx.save(); // save before dispatching, which may redirect                                                        // 274
    if (false !== dispatch) page.dispatch(ctx);                                                                       // 275
    return ctx;                                                                                                       // 276
  };                                                                                                                  // 277
                                                                                                                      // 278
  /**                                                                                                                 // 279
   * Dispatch the given `ctx`.                                                                                        // 280
   *                                                                                                                  // 281
   * @param {Context} ctx                                                                                             // 282
   * @api private                                                                                                     // 283
   */                                                                                                                 // 284
  page.dispatch = function(ctx) {                                                                                     // 285
    var prev = prevContext,                                                                                           // 286
      i = 0,                                                                                                          // 287
      j = 0;                                                                                                          // 288
                                                                                                                      // 289
    prevContext = ctx;                                                                                                // 290
                                                                                                                      // 291
    function nextExit() {                                                                                             // 292
      var fn = page.exits[j++];                                                                                       // 293
      if (!fn) return nextEnter();                                                                                    // 294
      fn(prev, nextExit);                                                                                             // 295
    }                                                                                                                 // 296
                                                                                                                      // 297
    function nextEnter() {                                                                                            // 298
      var fn = page.callbacks[i++];                                                                                   // 299
                                                                                                                      // 300
      if (ctx.path !== page.current) {                                                                                // 301
        ctx.handled = false;                                                                                          // 302
        return;                                                                                                       // 303
      }                                                                                                               // 304
      if (!fn) return unhandled(ctx);                                                                                 // 305
      fn(ctx, nextEnter);                                                                                             // 306
    }                                                                                                                 // 307
                                                                                                                      // 308
    if (prev) {                                                                                                       // 309
      nextExit();                                                                                                     // 310
    } else {                                                                                                          // 311
      nextEnter();                                                                                                    // 312
    }                                                                                                                 // 313
  };                                                                                                                  // 314
                                                                                                                      // 315
  /**                                                                                                                 // 316
   * Unhandled `ctx`. When it's not the initial                                                                       // 317
   * popstate then redirect. If you wish to handle                                                                    // 318
   * 404s on your own use `page('*', callback)`.                                                                      // 319
   *                                                                                                                  // 320
   * @param {Context} ctx                                                                                             // 321
   * @api private                                                                                                     // 322
   */                                                                                                                 // 323
  function unhandled(ctx) {                                                                                           // 324
    if (ctx.handled) return;                                                                                          // 325
    var current;                                                                                                      // 326
                                                                                                                      // 327
    if (hashbang) {                                                                                                   // 328
      current = base + location.hash.replace('#!', '');                                                               // 329
    } else {                                                                                                          // 330
      current = location.pathname + location.search;                                                                  // 331
    }                                                                                                                 // 332
                                                                                                                      // 333
    if (current === ctx.canonicalPath) return;                                                                        // 334
    page.stop();                                                                                                      // 335
    ctx.handled = false;                                                                                              // 336
    location.href = ctx.canonicalPath;                                                                                // 337
  }                                                                                                                   // 338
                                                                                                                      // 339
  /**                                                                                                                 // 340
   * Register an exit route on `path` with                                                                            // 341
   * callback `fn()`, which will be called                                                                            // 342
   * on the previous context when a new                                                                               // 343
   * page is visited.                                                                                                 // 344
   */                                                                                                                 // 345
  page.exit = function(path, fn) {                                                                                    // 346
    if (typeof path === 'function') {                                                                                 // 347
      return page.exit('*', path);                                                                                    // 348
    }                                                                                                                 // 349
                                                                                                                      // 350
    var route = new Route(path);                                                                                      // 351
    for (var i = 1; i < arguments.length; ++i) {                                                                      // 352
      page.exits.push(route.middleware(arguments[i]));                                                                // 353
    }                                                                                                                 // 354
  };                                                                                                                  // 355
                                                                                                                      // 356
  /**                                                                                                                 // 357
   * Remove URL encoding from the given `str`.                                                                        // 358
   * Accommodates whitespace in both x-www-form-urlencoded                                                            // 359
   * and regular percent-encoded form.                                                                                // 360
   *                                                                                                                  // 361
   * @param {string} val - URL component to decode                                                                    // 362
   */                                                                                                                 // 363
  function decodeURLEncodedURIComponent(val) {                                                                        // 364
    if (typeof val !== 'string') { return val; }                                                                      // 365
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;                                   // 366
  }                                                                                                                   // 367
                                                                                                                      // 368
  /**                                                                                                                 // 369
   * Initialize a new "request" `Context`                                                                             // 370
   * with the given `path` and optional initial `state`.                                                              // 371
   *                                                                                                                  // 372
   * @constructor                                                                                                     // 373
   * @param {string} path                                                                                             // 374
   * @param {Object=} state                                                                                           // 375
   * @api public                                                                                                      // 376
   */                                                                                                                 // 377
                                                                                                                      // 378
  function Context(path, state) {                                                                                     // 379
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;                     // 380
    var i = path.indexOf('?');                                                                                        // 381
                                                                                                                      // 382
    this.canonicalPath = path;                                                                                        // 383
    this.path = path.replace(base, '') || '/';                                                                        // 384
    if (hashbang) this.path = this.path.replace('#!', '') || '/';                                                     // 385
                                                                                                                      // 386
    this.title = document.title;                                                                                      // 387
    this.state = state || {};                                                                                         // 388
    this.state.path = path;                                                                                           // 389
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';                                     // 390
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);                                       // 391
    this.params = {};                                                                                                 // 392
                                                                                                                      // 393
    // fragment                                                                                                       // 394
    this.hash = '';                                                                                                   // 395
    if (!hashbang) {                                                                                                  // 396
      if (!~this.path.indexOf('#')) return;                                                                           // 397
      var parts = this.path.split('#');                                                                               // 398
      this.path = parts[0];                                                                                           // 399
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';                                                       // 400
      this.querystring = this.querystring.split('#')[0];                                                              // 401
    }                                                                                                                 // 402
  }                                                                                                                   // 403
                                                                                                                      // 404
  /**                                                                                                                 // 405
   * Expose `Context`.                                                                                                // 406
   */                                                                                                                 // 407
                                                                                                                      // 408
  page.Context = Context;                                                                                             // 409
                                                                                                                      // 410
  /**                                                                                                                 // 411
   * Push state.                                                                                                      // 412
   *                                                                                                                  // 413
   * @api private                                                                                                     // 414
   */                                                                                                                 // 415
                                                                                                                      // 416
  Context.prototype.pushState = function() {                                                                          // 417
    page.len++;                                                                                                       // 418
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };                                                                                                                  // 420
                                                                                                                      // 421
  /**                                                                                                                 // 422
   * Save the context state.                                                                                          // 423
   *                                                                                                                  // 424
   * @api public                                                                                                      // 425
   */                                                                                                                 // 426
                                                                                                                      // 427
  Context.prototype.save = function() {                                                                               // 428
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };                                                                                                                  // 430
                                                                                                                      // 431
  /**                                                                                                                 // 432
   * Initialize `Route` with the given HTTP `path`,                                                                   // 433
   * and an array of `callbacks` and `options`.                                                                       // 434
   *                                                                                                                  // 435
   * Options:                                                                                                         // 436
   *                                                                                                                  // 437
   *   - `sensitive`    enable case-sensitive routes                                                                  // 438
   *   - `strict`       enable strict matching for trailing slashes                                                   // 439
   *                                                                                                                  // 440
   * @constructor                                                                                                     // 441
   * @param {string} path                                                                                             // 442
   * @param {Object=} options                                                                                         // 443
   * @api private                                                                                                     // 444
   */                                                                                                                 // 445
                                                                                                                      // 446
  function Route(path, options) {                                                                                     // 447
    options = options || {};                                                                                          // 448
    this.path = (path === '*') ? '(.*)' : path;                                                                       // 449
    this.method = 'GET';                                                                                              // 450
    this.regexp = pathtoRegexp(this.path,                                                                             // 451
      this.keys = [],                                                                                                 // 452
      options);                                                                                                       // 453
  }                                                                                                                   // 454
                                                                                                                      // 455
  /**                                                                                                                 // 456
   * Expose `Route`.                                                                                                  // 457
   */                                                                                                                 // 458
                                                                                                                      // 459
  page.Route = Route;                                                                                                 // 460
                                                                                                                      // 461
  /**                                                                                                                 // 462
   * Return route middleware with                                                                                     // 463
   * the given callback `fn()`.                                                                                       // 464
   *                                                                                                                  // 465
   * @param {Function} fn                                                                                             // 466
   * @return {Function}                                                                                               // 467
   * @api public                                                                                                      // 468
   */                                                                                                                 // 469
                                                                                                                      // 470
  Route.prototype.middleware = function(fn) {                                                                         // 471
    var self = this;                                                                                                  // 472
    return function(ctx, next) {                                                                                      // 473
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);                                                     // 474
      next();                                                                                                         // 475
    };                                                                                                                // 476
  };                                                                                                                  // 477
                                                                                                                      // 478
  /**                                                                                                                 // 479
   * Check if this route matches `path`, if so                                                                        // 480
   * populate `params`.                                                                                               // 481
   *                                                                                                                  // 482
   * @param {string} path                                                                                             // 483
   * @param {Object} params                                                                                           // 484
   * @return {boolean}                                                                                                // 485
   * @api private                                                                                                     // 486
   */                                                                                                                 // 487
                                                                                                                      // 488
  Route.prototype.match = function(path, params) {                                                                    // 489
    var keys = this.keys,                                                                                             // 490
      qsIndex = path.indexOf('?'),                                                                                    // 491
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,                                                            // 492
      m = this.regexp.exec(decodeURIComponent(pathname));                                                             // 493
                                                                                                                      // 494
    if (!m) return false;                                                                                             // 495
                                                                                                                      // 496
    for (var i = 1, len = m.length; i < len; ++i) {                                                                   // 497
      var key = keys[i - 1];                                                                                          // 498
      var val = decodeURLEncodedURIComponent(m[i]);                                                                   // 499
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {                                            // 500
        params[key.name] = val;                                                                                       // 501
      }                                                                                                               // 502
    }                                                                                                                 // 503
                                                                                                                      // 504
    return true;                                                                                                      // 505
  };                                                                                                                  // 506
                                                                                                                      // 507
                                                                                                                      // 508
  /**                                                                                                                 // 509
   * Handle "populate" events.                                                                                        // 510
   */                                                                                                                 // 511
                                                                                                                      // 512
  var onpopstate = (function () {                                                                                     // 513
    var loaded = false;                                                                                               // 514
    if ('undefined' === typeof window) {                                                                              // 515
      return;                                                                                                         // 516
    }                                                                                                                 // 517
    if (document.readyState === 'complete') {                                                                         // 518
      loaded = true;                                                                                                  // 519
    } else {                                                                                                          // 520
      window.addEventListener('load', function() {                                                                    // 521
        setTimeout(function() {                                                                                       // 522
          loaded = true;                                                                                              // 523
        }, 0);                                                                                                        // 524
      });                                                                                                             // 525
    }                                                                                                                 // 526
    return function onpopstate(e) {                                                                                   // 527
      if (!loaded) return;                                                                                            // 528
      if (e.state) {                                                                                                  // 529
        var path = e.state.path;                                                                                      // 530
        page.replace(path, e.state);                                                                                  // 531
      } else {                                                                                                        // 532
        page.show(location.pathname + location.hash, undefined, undefined, false);                                    // 533
      }                                                                                                               // 534
    };                                                                                                                // 535
  })();                                                                                                               // 536
  /**                                                                                                                 // 537
   * Handle "click" events.                                                                                           // 538
   */                                                                                                                 // 539
                                                                                                                      // 540
  function onclick(e) {                                                                                               // 541
                                                                                                                      // 542
    if (1 !== which(e)) return;                                                                                       // 543
                                                                                                                      // 544
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;                                                                 // 545
    if (e.defaultPrevented) return;                                                                                   // 546
                                                                                                                      // 547
                                                                                                                      // 548
                                                                                                                      // 549
    // ensure link                                                                                                    // 550
    var el = e.target;                                                                                                // 551
    while (el && 'A' !== el.nodeName) el = el.parentNode;                                                             // 552
    if (!el || 'A' !== el.nodeName) return;                                                                           // 553
                                                                                                                      // 554
                                                                                                                      // 555
                                                                                                                      // 556
    // Ignore if tag has                                                                                              // 557
    // 1. "download" attribute                                                                                        // 558
    // 2. rel="external" attribute                                                                                    // 559
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;                                 // 560
                                                                                                                      // 561
    // ensure non-hash for the same path                                                                              // 562
    var link = el.getAttribute('href');                                                                               // 563
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;                          // 564
                                                                                                                      // 565
                                                                                                                      // 566
                                                                                                                      // 567
    // Check for mailto: in the href                                                                                  // 568
    if (link && link.indexOf('mailto:') > -1) return;                                                                 // 569
                                                                                                                      // 570
    // check target                                                                                                   // 571
    if (el.target) return;                                                                                            // 572
                                                                                                                      // 573
    // x-origin                                                                                                       // 574
    if (!sameOrigin(el.href)) return;                                                                                 // 575
                                                                                                                      // 576
                                                                                                                      // 577
                                                                                                                      // 578
    // rebuild path                                                                                                   // 579
    var path = el.pathname + el.search + (el.hash || '');                                                             // 580
                                                                                                                      // 581
    path = path[0] !== '/' ? '/' + path : path;                                                                       // 582
                                                                                                                      // 583
    // strip leading "/[drive letter]:" on NW.js on Windows                                                           // 584
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {                                             // 585
      path = path.replace(/^\/[a-zA-Z]:\//, '/');                                                                     // 586
    }                                                                                                                 // 587
                                                                                                                      // 588
    // same page                                                                                                      // 589
    var orig = path;                                                                                                  // 590
                                                                                                                      // 591
    if (path.indexOf(base) === 0) {                                                                                   // 592
      path = path.substr(base.length);                                                                                // 593
    }                                                                                                                 // 594
                                                                                                                      // 595
    if (hashbang) path = path.replace('#!', '');                                                                      // 596
                                                                                                                      // 597
    if (base && orig === path) return;                                                                                // 598
                                                                                                                      // 599
    e.preventDefault();                                                                                               // 600
    page.show(orig);                                                                                                  // 601
  }                                                                                                                   // 602
                                                                                                                      // 603
  /**                                                                                                                 // 604
   * Event button.                                                                                                    // 605
   */                                                                                                                 // 606
                                                                                                                      // 607
  function which(e) {                                                                                                 // 608
    e = e || window.event;                                                                                            // 609
    return null === e.which ? e.button : e.which;                                                                     // 610
  }                                                                                                                   // 611
                                                                                                                      // 612
  /**                                                                                                                 // 613
   * Check if `href` is the same origin.                                                                              // 614
   */                                                                                                                 // 615
                                                                                                                      // 616
  function sameOrigin(href) {                                                                                         // 617
    var origin = location.protocol + '//' + location.hostname;                                                        // 618
    if (location.port) origin += ':' + location.port;                                                                 // 619
    return (href && (0 === href.indexOf(origin)));                                                                    // 620
  }                                                                                                                   // 621
                                                                                                                      // 622
  page.sameOrigin = sameOrigin;                                                                                       // 623
                                                                                                                      // 624
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"node_modules":{"path-to-regexp":{"index.js":["isarray",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/kadira_flow-router/node_modules/page/node_modules/path-to-regexp/index.js                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var isarray = require('isarray')                                                                                      // 1
                                                                                                                      // 2
/**                                                                                                                   // 3
 * Expose `pathToRegexp`.                                                                                             // 4
 */                                                                                                                   // 5
module.exports = pathToRegexp                                                                                         // 6
module.exports.parse = parse                                                                                          // 7
module.exports.compile = compile                                                                                      // 8
module.exports.tokensToFunction = tokensToFunction                                                                    // 9
module.exports.tokensToRegExp = tokensToRegExp                                                                        // 10
                                                                                                                      // 11
/**                                                                                                                   // 12
 * The main path matching regexp utility.                                                                             // 13
 *                                                                                                                    // 14
 * @type {RegExp}                                                                                                     // 15
 */                                                                                                                   // 16
var PATH_REGEXP = new RegExp([                                                                                        // 17
  // Match escaped characters that would otherwise appear in future matches.                                          // 18
  // This allows the user to escape special characters that won't transform.                                          // 19
  '(\\\\.)',                                                                                                          // 20
  // Match Express-style parameters and un-named parameters with a prefix                                             // 21
  // and optional suffixes. Matches appear as:                                                                        // 22
  //                                                                                                                  // 23
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]                                               // 24
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]                                // 25
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]                                        // 26
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'                    // 27
].join('|'), 'g')                                                                                                     // 28
                                                                                                                      // 29
/**                                                                                                                   // 30
 * Parse a string for the raw tokens.                                                                                 // 31
 *                                                                                                                    // 32
 * @param  {String} str                                                                                               // 33
 * @return {Array}                                                                                                    // 34
 */                                                                                                                   // 35
function parse (str) {                                                                                                // 36
  var tokens = []                                                                                                     // 37
  var key = 0                                                                                                         // 38
  var index = 0                                                                                                       // 39
  var path = ''                                                                                                       // 40
  var res                                                                                                             // 41
                                                                                                                      // 42
  while ((res = PATH_REGEXP.exec(str)) != null) {                                                                     // 43
    var m = res[0]                                                                                                    // 44
    var escaped = res[1]                                                                                              // 45
    var offset = res.index                                                                                            // 46
    path += str.slice(index, offset)                                                                                  // 47
    index = offset + m.length                                                                                         // 48
                                                                                                                      // 49
    // Ignore already escaped sequences.                                                                              // 50
    if (escaped) {                                                                                                    // 51
      path += escaped[1]                                                                                              // 52
      continue                                                                                                        // 53
    }                                                                                                                 // 54
                                                                                                                      // 55
    // Push the current path onto the tokens.                                                                         // 56
    if (path) {                                                                                                       // 57
      tokens.push(path)                                                                                               // 58
      path = ''                                                                                                       // 59
    }                                                                                                                 // 60
                                                                                                                      // 61
    var prefix = res[2]                                                                                               // 62
    var name = res[3]                                                                                                 // 63
    var capture = res[4]                                                                                              // 64
    var group = res[5]                                                                                                // 65
    var suffix = res[6]                                                                                               // 66
    var asterisk = res[7]                                                                                             // 67
                                                                                                                      // 68
    var repeat = suffix === '+' || suffix === '*'                                                                     // 69
    var optional = suffix === '?' || suffix === '*'                                                                   // 70
    var delimiter = prefix || '/'                                                                                     // 71
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')                                    // 72
                                                                                                                      // 73
    tokens.push({                                                                                                     // 74
      name: name || key++,                                                                                            // 75
      prefix: prefix || '',                                                                                           // 76
      delimiter: delimiter,                                                                                           // 77
      optional: optional,                                                                                             // 78
      repeat: repeat,                                                                                                 // 79
      pattern: escapeGroup(pattern)                                                                                   // 80
    })                                                                                                                // 81
  }                                                                                                                   // 82
                                                                                                                      // 83
  // Match any characters still remaining.                                                                            // 84
  if (index < str.length) {                                                                                           // 85
    path += str.substr(index)                                                                                         // 86
  }                                                                                                                   // 87
                                                                                                                      // 88
  // If the path exists, push it onto the end.                                                                        // 89
  if (path) {                                                                                                         // 90
    tokens.push(path)                                                                                                 // 91
  }                                                                                                                   // 92
                                                                                                                      // 93
  return tokens                                                                                                       // 94
}                                                                                                                     // 95
                                                                                                                      // 96
/**                                                                                                                   // 97
 * Compile a string to a template function for the path.                                                              // 98
 *                                                                                                                    // 99
 * @param  {String}   str                                                                                             // 100
 * @return {Function}                                                                                                 // 101
 */                                                                                                                   // 102
function compile (str) {                                                                                              // 103
  return tokensToFunction(parse(str))                                                                                 // 104
}                                                                                                                     // 105
                                                                                                                      // 106
/**                                                                                                                   // 107
 * Expose a method for transforming tokens into the path function.                                                    // 108
 */                                                                                                                   // 109
function tokensToFunction (tokens) {                                                                                  // 110
  // Compile all the tokens into regexps.                                                                             // 111
  var matches = new Array(tokens.length)                                                                              // 112
                                                                                                                      // 113
  // Compile all the patterns before compilation.                                                                     // 114
  for (var i = 0; i < tokens.length; i++) {                                                                           // 115
    if (typeof tokens[i] === 'object') {                                                                              // 116
      matches[i] = new RegExp('^' + tokens[i].pattern + '$')                                                          // 117
    }                                                                                                                 // 118
  }                                                                                                                   // 119
                                                                                                                      // 120
  return function (obj) {                                                                                             // 121
    var path = ''                                                                                                     // 122
    var data = obj || {}                                                                                              // 123
                                                                                                                      // 124
    for (var i = 0; i < tokens.length; i++) {                                                                         // 125
      var token = tokens[i]                                                                                           // 126
                                                                                                                      // 127
      if (typeof token === 'string') {                                                                                // 128
        path += token                                                                                                 // 129
                                                                                                                      // 130
        continue                                                                                                      // 131
      }                                                                                                               // 132
                                                                                                                      // 133
      var value = data[token.name]                                                                                    // 134
      var segment                                                                                                     // 135
                                                                                                                      // 136
      if (value == null) {                                                                                            // 137
        if (token.optional) {                                                                                         // 138
          continue                                                                                                    // 139
        } else {                                                                                                      // 140
          throw new TypeError('Expected "' + token.name + '" to be defined')                                          // 141
        }                                                                                                             // 142
      }                                                                                                               // 143
                                                                                                                      // 144
      if (isarray(value)) {                                                                                           // 145
        if (!token.repeat) {                                                                                          // 146
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')            // 147
        }                                                                                                             // 148
                                                                                                                      // 149
        if (value.length === 0) {                                                                                     // 150
          if (token.optional) {                                                                                       // 151
            continue                                                                                                  // 152
          } else {                                                                                                    // 153
            throw new TypeError('Expected "' + token.name + '" to not be empty')                                      // 154
          }                                                                                                           // 155
        }                                                                                                             // 156
                                                                                                                      // 157
        for (var j = 0; j < value.length; j++) {                                                                      // 158
          segment = encodeURIComponent(value[j])                                                                      // 159
                                                                                                                      // 160
          if (!matches[i].test(segment)) {                                                                            // 161
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }                                                                                                           // 163
                                                                                                                      // 164
          path += (j === 0 ? token.prefix : token.delimiter) + segment                                                // 165
        }                                                                                                             // 166
                                                                                                                      // 167
        continue                                                                                                      // 168
      }                                                                                                               // 169
                                                                                                                      // 170
      segment = encodeURIComponent(value)                                                                             // 171
                                                                                                                      // 172
      if (!matches[i].test(segment)) {                                                                                // 173
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }                                                                                                               // 175
                                                                                                                      // 176
      path += token.prefix + segment                                                                                  // 177
    }                                                                                                                 // 178
                                                                                                                      // 179
    return path                                                                                                       // 180
  }                                                                                                                   // 181
}                                                                                                                     // 182
                                                                                                                      // 183
/**                                                                                                                   // 184
 * Escape a regular expression string.                                                                                // 185
 *                                                                                                                    // 186
 * @param  {String} str                                                                                               // 187
 * @return {String}                                                                                                   // 188
 */                                                                                                                   // 189
function escapeString (str) {                                                                                         // 190
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')                                                              // 191
}                                                                                                                     // 192
                                                                                                                      // 193
/**                                                                                                                   // 194
 * Escape the capturing group by escaping special characters and meaning.                                             // 195
 *                                                                                                                    // 196
 * @param  {String} group                                                                                             // 197
 * @return {String}                                                                                                   // 198
 */                                                                                                                   // 199
function escapeGroup (group) {                                                                                        // 200
  return group.replace(/([=!:$\/()])/g, '\\$1')                                                                       // 201
}                                                                                                                     // 202
                                                                                                                      // 203
/**                                                                                                                   // 204
 * Attach the keys as a property of the regexp.                                                                       // 205
 *                                                                                                                    // 206
 * @param  {RegExp} re                                                                                                // 207
 * @param  {Array}  keys                                                                                              // 208
 * @return {RegExp}                                                                                                   // 209
 */                                                                                                                   // 210
function attachKeys (re, keys) {                                                                                      // 211
  re.keys = keys                                                                                                      // 212
  return re                                                                                                           // 213
}                                                                                                                     // 214
                                                                                                                      // 215
/**                                                                                                                   // 216
 * Get the flags for a regexp from the options.                                                                       // 217
 *                                                                                                                    // 218
 * @param  {Object} options                                                                                           // 219
 * @return {String}                                                                                                   // 220
 */                                                                                                                   // 221
function flags (options) {                                                                                            // 222
  return options.sensitive ? '' : 'i'                                                                                 // 223
}                                                                                                                     // 224
                                                                                                                      // 225
/**                                                                                                                   // 226
 * Pull out keys from a regexp.                                                                                       // 227
 *                                                                                                                    // 228
 * @param  {RegExp} path                                                                                              // 229
 * @param  {Array}  keys                                                                                              // 230
 * @return {RegExp}                                                                                                   // 231
 */                                                                                                                   // 232
function regexpToRegexp (path, keys) {                                                                                // 233
  // Use a negative lookahead to match only capturing groups.                                                         // 234
  var groups = path.source.match(/\((?!\?)/g)                                                                         // 235
                                                                                                                      // 236
  if (groups) {                                                                                                       // 237
    for (var i = 0; i < groups.length; i++) {                                                                         // 238
      keys.push({                                                                                                     // 239
        name: i,                                                                                                      // 240
        prefix: null,                                                                                                 // 241
        delimiter: null,                                                                                              // 242
        optional: false,                                                                                              // 243
        repeat: false,                                                                                                // 244
        pattern: null                                                                                                 // 245
      })                                                                                                              // 246
    }                                                                                                                 // 247
  }                                                                                                                   // 248
                                                                                                                      // 249
  return attachKeys(path, keys)                                                                                       // 250
}                                                                                                                     // 251
                                                                                                                      // 252
/**                                                                                                                   // 253
 * Transform an array into a regexp.                                                                                  // 254
 *                                                                                                                    // 255
 * @param  {Array}  path                                                                                              // 256
 * @param  {Array}  keys                                                                                              // 257
 * @param  {Object} options                                                                                           // 258
 * @return {RegExp}                                                                                                   // 259
 */                                                                                                                   // 260
function arrayToRegexp (path, keys, options) {                                                                        // 261
  var parts = []                                                                                                      // 262
                                                                                                                      // 263
  for (var i = 0; i < path.length; i++) {                                                                             // 264
    parts.push(pathToRegexp(path[i], keys, options).source)                                                           // 265
  }                                                                                                                   // 266
                                                                                                                      // 267
  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))                                              // 268
                                                                                                                      // 269
  return attachKeys(regexp, keys)                                                                                     // 270
}                                                                                                                     // 271
                                                                                                                      // 272
/**                                                                                                                   // 273
 * Create a path regexp from string input.                                                                            // 274
 *                                                                                                                    // 275
 * @param  {String} path                                                                                              // 276
 * @param  {Array}  keys                                                                                              // 277
 * @param  {Object} options                                                                                           // 278
 * @return {RegExp}                                                                                                   // 279
 */                                                                                                                   // 280
function stringToRegexp (path, keys, options) {                                                                       // 281
  var tokens = parse(path)                                                                                            // 282
  var re = tokensToRegExp(tokens, options)                                                                            // 283
                                                                                                                      // 284
  // Attach keys back to the regexp.                                                                                  // 285
  for (var i = 0; i < tokens.length; i++) {                                                                           // 286
    if (typeof tokens[i] !== 'string') {                                                                              // 287
      keys.push(tokens[i])                                                                                            // 288
    }                                                                                                                 // 289
  }                                                                                                                   // 290
                                                                                                                      // 291
  return attachKeys(re, keys)                                                                                         // 292
}                                                                                                                     // 293
                                                                                                                      // 294
/**                                                                                                                   // 295
 * Expose a function for taking tokens and returning a RegExp.                                                        // 296
 *                                                                                                                    // 297
 * @param  {Array}  tokens                                                                                            // 298
 * @param  {Array}  keys                                                                                              // 299
 * @param  {Object} options                                                                                           // 300
 * @return {RegExp}                                                                                                   // 301
 */                                                                                                                   // 302
function tokensToRegExp (tokens, options) {                                                                           // 303
  options = options || {}                                                                                             // 304
                                                                                                                      // 305
  var strict = options.strict                                                                                         // 306
  var end = options.end !== false                                                                                     // 307
  var route = ''                                                                                                      // 308
  var lastToken = tokens[tokens.length - 1]                                                                           // 309
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)                                          // 310
                                                                                                                      // 311
  // Iterate over the tokens and create our regexp string.                                                            // 312
  for (var i = 0; i < tokens.length; i++) {                                                                           // 313
    var token = tokens[i]                                                                                             // 314
                                                                                                                      // 315
    if (typeof token === 'string') {                                                                                  // 316
      route += escapeString(token)                                                                                    // 317
    } else {                                                                                                          // 318
      var prefix = escapeString(token.prefix)                                                                         // 319
      var capture = token.pattern                                                                                     // 320
                                                                                                                      // 321
      if (token.repeat) {                                                                                             // 322
        capture += '(?:' + prefix + capture + ')*'                                                                    // 323
      }                                                                                                               // 324
                                                                                                                      // 325
      if (token.optional) {                                                                                           // 326
        if (prefix) {                                                                                                 // 327
          capture = '(?:' + prefix + '(' + capture + '))?'                                                            // 328
        } else {                                                                                                      // 329
          capture = '(' + capture + ')?'                                                                              // 330
        }                                                                                                             // 331
      } else {                                                                                                        // 332
        capture = prefix + '(' + capture + ')'                                                                        // 333
      }                                                                                                               // 334
                                                                                                                      // 335
      route += capture                                                                                                // 336
    }                                                                                                                 // 337
  }                                                                                                                   // 338
                                                                                                                      // 339
  // In non-strict mode we allow a slash at the end of match. If the path to                                          // 340
  // match already ends with a slash, we remove it for consistency. The slash                                         // 341
  // is valid at the end of a path match, not in the middle. This is important                                        // 342
  // in non-ending mode, where "/test/" shouldn't match "/test//route".                                               // 343
  if (!strict) {                                                                                                      // 344
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'                                            // 345
  }                                                                                                                   // 346
                                                                                                                      // 347
  if (end) {                                                                                                          // 348
    route += '$'                                                                                                      // 349
  } else {                                                                                                            // 350
    // In non-ending mode, we need the capturing groups to match as much as                                           // 351
    // possible by using a positive lookahead to the end or next path segment.                                        // 352
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'                                                               // 353
  }                                                                                                                   // 354
                                                                                                                      // 355
  return new RegExp('^' + route, flags(options))                                                                      // 356
}                                                                                                                     // 357
                                                                                                                      // 358
/**                                                                                                                   // 359
 * Normalize the given path string, returning a regular expression.                                                   // 360
 *                                                                                                                    // 361
 * An empty array can be passed in for the keys, which will hold the                                                  // 362
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will                                          // 363
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.                                        // 364
 *                                                                                                                    // 365
 * @param  {(String|RegExp|Array)} path                                                                               // 366
 * @param  {Array}                 [keys]                                                                             // 367
 * @param  {Object}                [options]                                                                          // 368
 * @return {RegExp}                                                                                                   // 369
 */                                                                                                                   // 370
function pathToRegexp (path, keys, options) {                                                                         // 371
  keys = keys || []                                                                                                   // 372
                                                                                                                      // 373
  if (!isarray(keys)) {                                                                                               // 374
    options = keys                                                                                                    // 375
    keys = []                                                                                                         // 376
  } else if (!options) {                                                                                              // 377
    options = {}                                                                                                      // 378
  }                                                                                                                   // 379
                                                                                                                      // 380
  if (path instanceof RegExp) {                                                                                       // 381
    return regexpToRegexp(path, keys, options)                                                                        // 382
  }                                                                                                                   // 383
                                                                                                                      // 384
  if (isarray(path)) {                                                                                                // 385
    return arrayToRegexp(path, keys, options)                                                                         // 386
  }                                                                                                                   // 387
                                                                                                                      // 388
  return stringToRegexp(path, keys, options)                                                                          // 389
}                                                                                                                     // 390
                                                                                                                      // 391
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"node_modules":{"isarray":{"package.json":function(require,exports){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// ../../.2.12.1.8euui++os+web.browser+web.cordova/npm/node_modules/page/node_modules/path-to-regexp/node_modules/isa //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
exports.name = "isarray";                                                                                             // 1
exports.version = "0.0.1";                                                                                            // 2
exports.main = "index.js";                                                                                            // 3
                                                                                                                      // 4
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/kadira_flow-router/node_modules/page/node_modules/path-to-regexp/node_modules/isarray/index.js //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.exports = Array.isArray || function (arr) {                                                                    // 1
  return Object.prototype.toString.call(arr) == '[object Array]';                                                     // 2
};                                                                                                                    // 3
                                                                                                                      // 4
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},"qs":{"package.json":function(require,exports){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// ../../.2.12.1.8euui++os+web.browser+web.cordova/npm/node_modules/qs/package.json                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
exports.name = "qs";                                                                                                  // 1
exports.version = "5.2.0";                                                                                            // 2
exports.main = "lib/index.js";                                                                                        // 3
                                                                                                                      // 4
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"index.js":["./stringify","./parse",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/kadira_flow-router/node_modules/qs/lib/index.js                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// Load modules                                                                                                       // 1
                                                                                                                      // 2
var Stringify = require('./stringify');                                                                               // 3
var Parse = require('./parse');                                                                                       // 4
                                                                                                                      // 5
                                                                                                                      // 6
// Declare internals                                                                                                  // 7
                                                                                                                      // 8
var internals = {};                                                                                                   // 9
                                                                                                                      // 10
                                                                                                                      // 11
module.exports = {                                                                                                    // 12
    stringify: Stringify,                                                                                             // 13
    parse: Parse                                                                                                      // 14
};                                                                                                                    // 15
                                                                                                                      // 16
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"stringify.js":["./utils",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/kadira_flow-router/node_modules/qs/lib/stringify.js                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// Load modules                                                                                                       // 1
                                                                                                                      // 2
var Utils = require('./utils');                                                                                       // 3
                                                                                                                      // 4
                                                                                                                      // 5
// Declare internals                                                                                                  // 6
                                                                                                                      // 7
var internals = {                                                                                                     // 8
    delimiter: '&',                                                                                                   // 9
    arrayPrefixGenerators: {                                                                                          // 10
        brackets: function (prefix, key) {                                                                            // 11
                                                                                                                      // 12
            return prefix + '[]';                                                                                     // 13
        },                                                                                                            // 14
        indices: function (prefix, key) {                                                                             // 15
                                                                                                                      // 16
            return prefix + '[' + key + ']';                                                                          // 17
        },                                                                                                            // 18
        repeat: function (prefix, key) {                                                                              // 19
                                                                                                                      // 20
            return prefix;                                                                                            // 21
        }                                                                                                             // 22
    },                                                                                                                // 23
    strictNullHandling: false,                                                                                        // 24
    skipNulls: false,                                                                                                 // 25
    encode: true                                                                                                      // 26
};                                                                                                                    // 27
                                                                                                                      // 28
                                                                                                                      // 29
internals.stringify = function (obj, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort) {
                                                                                                                      // 31
    if (typeof filter === 'function') {                                                                               // 32
        obj = filter(prefix, obj);                                                                                    // 33
    }                                                                                                                 // 34
    else if (Utils.isBuffer(obj)) {                                                                                   // 35
        obj = obj.toString();                                                                                         // 36
    }                                                                                                                 // 37
    else if (obj instanceof Date) {                                                                                   // 38
        obj = obj.toISOString();                                                                                      // 39
    }                                                                                                                 // 40
    else if (obj === null) {                                                                                          // 41
        if (strictNullHandling) {                                                                                     // 42
            return encode ? Utils.encode(prefix) : prefix;                                                            // 43
        }                                                                                                             // 44
                                                                                                                      // 45
        obj = '';                                                                                                     // 46
    }                                                                                                                 // 47
                                                                                                                      // 48
    if (typeof obj === 'string' ||                                                                                    // 49
        typeof obj === 'number' ||                                                                                    // 50
        typeof obj === 'boolean') {                                                                                   // 51
                                                                                                                      // 52
        if (encode) {                                                                                                 // 53
            return [Utils.encode(prefix) + '=' + Utils.encode(obj)];                                                  // 54
        }                                                                                                             // 55
        return [prefix + '=' + obj];                                                                                  // 56
    }                                                                                                                 // 57
                                                                                                                      // 58
    var values = [];                                                                                                  // 59
                                                                                                                      // 60
    if (typeof obj === 'undefined') {                                                                                 // 61
        return values;                                                                                                // 62
    }                                                                                                                 // 63
                                                                                                                      // 64
    var objKeys;                                                                                                      // 65
    if (Array.isArray(filter)) {                                                                                      // 66
        objKeys = filter;                                                                                             // 67
    } else {                                                                                                          // 68
        var keys = Object.keys(obj);                                                                                  // 69
        objKeys = sort ? keys.sort(sort) : keys;                                                                      // 70
    }                                                                                                                 // 71
                                                                                                                      // 72
    for (var i = 0, il = objKeys.length; i < il; ++i) {                                                               // 73
        var key = objKeys[i];                                                                                         // 74
                                                                                                                      // 75
        if (skipNulls &&                                                                                              // 76
            obj[key] === null) {                                                                                      // 77
                                                                                                                      // 78
            continue;                                                                                                 // 79
        }                                                                                                             // 80
                                                                                                                      // 81
        if (Array.isArray(obj)) {                                                                                     // 82
            values = values.concat(internals.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, skipNulls, encode, filter));
        }                                                                                                             // 84
        else {                                                                                                        // 85
            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix, strictNullHandling, skipNulls, encode, filter));
        }                                                                                                             // 87
    }                                                                                                                 // 88
                                                                                                                      // 89
    return values;                                                                                                    // 90
};                                                                                                                    // 91
                                                                                                                      // 92
                                                                                                                      // 93
module.exports = function (obj, options) {                                                                            // 94
                                                                                                                      // 95
    options = options || {};                                                                                          // 96
    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;               // 97
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : internals.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : internals.skipNulls;                 // 99
    var encode = typeof options.encode === 'boolean' ? options.encode : internals.encode;                             // 100
    var sort = typeof options.sort === 'function' ? options.sort : null;                                              // 101
    var objKeys;                                                                                                      // 102
    var filter;                                                                                                       // 103
    if (typeof options.filter === 'function') {                                                                       // 104
        filter = options.filter;                                                                                      // 105
        obj = filter('', obj);                                                                                        // 106
    }                                                                                                                 // 107
    else if (Array.isArray(options.filter)) {                                                                         // 108
        objKeys = filter = options.filter;                                                                            // 109
    }                                                                                                                 // 110
                                                                                                                      // 111
    var keys = [];                                                                                                    // 112
                                                                                                                      // 113
    if (typeof obj !== 'object' ||                                                                                    // 114
        obj === null) {                                                                                               // 115
                                                                                                                      // 116
        return '';                                                                                                    // 117
    }                                                                                                                 // 118
                                                                                                                      // 119
    var arrayFormat;                                                                                                  // 120
    if (options.arrayFormat in internals.arrayPrefixGenerators) {                                                     // 121
        arrayFormat = options.arrayFormat;                                                                            // 122
    }                                                                                                                 // 123
    else if ('indices' in options) {                                                                                  // 124
        arrayFormat = options.indices ? 'indices' : 'repeat';                                                         // 125
    }                                                                                                                 // 126
    else {                                                                                                            // 127
        arrayFormat = 'indices';                                                                                      // 128
    }                                                                                                                 // 129
                                                                                                                      // 130
    var generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];                                           // 131
                                                                                                                      // 132
    if (!objKeys) {                                                                                                   // 133
        objKeys = Object.keys(obj);                                                                                   // 134
    }                                                                                                                 // 135
                                                                                                                      // 136
    if (sort) {                                                                                                       // 137
        objKeys.sort(sort);                                                                                           // 138
    }                                                                                                                 // 139
                                                                                                                      // 140
    for (var i = 0, il = objKeys.length; i < il; ++i) {                                                               // 141
        var key = objKeys[i];                                                                                         // 142
                                                                                                                      // 143
        if (skipNulls &&                                                                                              // 144
            obj[key] === null) {                                                                                      // 145
                                                                                                                      // 146
            continue;                                                                                                 // 147
        }                                                                                                             // 148
                                                                                                                      // 149
        keys = keys.concat(internals.stringify(obj[key], key, generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort));
    }                                                                                                                 // 151
                                                                                                                      // 152
    return keys.join(delimiter);                                                                                      // 153
};                                                                                                                    // 154
                                                                                                                      // 155
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"utils.js":function(require,exports){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/kadira_flow-router/node_modules/qs/lib/utils.js                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// Load modules                                                                                                       // 1
                                                                                                                      // 2
                                                                                                                      // 3
// Declare internals                                                                                                  // 4
                                                                                                                      // 5
var internals = {};                                                                                                   // 6
internals.hexTable = new Array(256);                                                                                  // 7
for (var h = 0; h < 256; ++h) {                                                                                       // 8
    internals.hexTable[h] = '%' + ((h < 16 ? '0' : '') + h.toString(16)).toUpperCase();                               // 9
}                                                                                                                     // 10
                                                                                                                      // 11
                                                                                                                      // 12
exports.arrayToObject = function (source, options) {                                                                  // 13
                                                                                                                      // 14
    var obj = options.plainObjects ? Object.create(null) : {};                                                        // 15
    for (var i = 0, il = source.length; i < il; ++i) {                                                                // 16
        if (typeof source[i] !== 'undefined') {                                                                       // 17
                                                                                                                      // 18
            obj[i] = source[i];                                                                                       // 19
        }                                                                                                             // 20
    }                                                                                                                 // 21
                                                                                                                      // 22
    return obj;                                                                                                       // 23
};                                                                                                                    // 24
                                                                                                                      // 25
                                                                                                                      // 26
exports.merge = function (target, source, options) {                                                                  // 27
                                                                                                                      // 28
    if (!source) {                                                                                                    // 29
        return target;                                                                                                // 30
    }                                                                                                                 // 31
                                                                                                                      // 32
    if (typeof source !== 'object') {                                                                                 // 33
        if (Array.isArray(target)) {                                                                                  // 34
            target.push(source);                                                                                      // 35
        }                                                                                                             // 36
        else if (typeof target === 'object') {                                                                        // 37
            target[source] = true;                                                                                    // 38
        }                                                                                                             // 39
        else {                                                                                                        // 40
            target = [target, source];                                                                                // 41
        }                                                                                                             // 42
                                                                                                                      // 43
        return target;                                                                                                // 44
    }                                                                                                                 // 45
                                                                                                                      // 46
    if (typeof target !== 'object') {                                                                                 // 47
        target = [target].concat(source);                                                                             // 48
        return target;                                                                                                // 49
    }                                                                                                                 // 50
                                                                                                                      // 51
    if (Array.isArray(target) &&                                                                                      // 52
        !Array.isArray(source)) {                                                                                     // 53
                                                                                                                      // 54
        target = exports.arrayToObject(target, options);                                                              // 55
    }                                                                                                                 // 56
                                                                                                                      // 57
    var keys = Object.keys(source);                                                                                   // 58
    for (var k = 0, kl = keys.length; k < kl; ++k) {                                                                  // 59
        var key = keys[k];                                                                                            // 60
        var value = source[key];                                                                                      // 61
                                                                                                                      // 62
        if (!Object.prototype.hasOwnProperty.call(target, key)) {                                                     // 63
            target[key] = value;                                                                                      // 64
        }                                                                                                             // 65
        else {                                                                                                        // 66
            target[key] = exports.merge(target[key], value, options);                                                 // 67
        }                                                                                                             // 68
    }                                                                                                                 // 69
                                                                                                                      // 70
    return target;                                                                                                    // 71
};                                                                                                                    // 72
                                                                                                                      // 73
                                                                                                                      // 74
exports.decode = function (str) {                                                                                     // 75
                                                                                                                      // 76
    try {                                                                                                             // 77
        return decodeURIComponent(str.replace(/\+/g, ' '));                                                           // 78
    } catch (e) {                                                                                                     // 79
        return str;                                                                                                   // 80
    }                                                                                                                 // 81
};                                                                                                                    // 82
                                                                                                                      // 83
exports.encode = function (str) {                                                                                     // 84
                                                                                                                      // 85
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.               // 86
    // It has been adapted here for stricter adherence to RFC 3986                                                    // 87
    if (str.length === 0) {                                                                                           // 88
        return str;                                                                                                   // 89
    }                                                                                                                 // 90
                                                                                                                      // 91
    if (typeof str !== 'string') {                                                                                    // 92
        str = '' + str;                                                                                               // 93
    }                                                                                                                 // 94
                                                                                                                      // 95
    var out = '';                                                                                                     // 96
    for (var i = 0, il = str.length; i < il; ++i) {                                                                   // 97
        var c = str.charCodeAt(i);                                                                                    // 98
                                                                                                                      // 99
        if (c === 0x2D || // -                                                                                        // 100
            c === 0x2E || // .                                                                                        // 101
            c === 0x5F || // _                                                                                        // 102
            c === 0x7E || // ~                                                                                        // 103
            (c >= 0x30 && c <= 0x39) || // 0-9                                                                        // 104
            (c >= 0x41 && c <= 0x5A) || // a-z                                                                        // 105
            (c >= 0x61 && c <= 0x7A)) { // A-Z                                                                        // 106
                                                                                                                      // 107
            out += str[i];                                                                                            // 108
            continue;                                                                                                 // 109
        }                                                                                                             // 110
                                                                                                                      // 111
        if (c < 0x80) {                                                                                               // 112
            out += internals.hexTable[c];                                                                             // 113
            continue;                                                                                                 // 114
        }                                                                                                             // 115
                                                                                                                      // 116
        if (c < 0x800) {                                                                                              // 117
            out += internals.hexTable[0xC0 | (c >> 6)] + internals.hexTable[0x80 | (c & 0x3F)];                       // 118
            continue;                                                                                                 // 119
        }                                                                                                             // 120
                                                                                                                      // 121
        if (c < 0xD800 || c >= 0xE000) {                                                                              // 122
            out += internals.hexTable[0xE0 | (c >> 12)] + internals.hexTable[0x80 | ((c >> 6) & 0x3F)] + internals.hexTable[0x80 | (c & 0x3F)];
            continue;                                                                                                 // 124
        }                                                                                                             // 125
                                                                                                                      // 126
        ++i;                                                                                                          // 127
        c = 0x10000 + (((c & 0x3FF) << 10) | (str.charCodeAt(i) & 0x3FF));                                            // 128
        out += internals.hexTable[0xF0 | (c >> 18)] + internals.hexTable[0x80 | ((c >> 12) & 0x3F)] + internals.hexTable[0x80 | ((c >> 6) & 0x3F)] + internals.hexTable[0x80 | (c & 0x3F)];
    }                                                                                                                 // 130
                                                                                                                      // 131
    return out;                                                                                                       // 132
};                                                                                                                    // 133
                                                                                                                      // 134
exports.compact = function (obj, refs) {                                                                              // 135
                                                                                                                      // 136
    if (typeof obj !== 'object' ||                                                                                    // 137
        obj === null) {                                                                                               // 138
                                                                                                                      // 139
        return obj;                                                                                                   // 140
    }                                                                                                                 // 141
                                                                                                                      // 142
    refs = refs || [];                                                                                                // 143
    var lookup = refs.indexOf(obj);                                                                                   // 144
    if (lookup !== -1) {                                                                                              // 145
        return refs[lookup];                                                                                          // 146
    }                                                                                                                 // 147
                                                                                                                      // 148
    refs.push(obj);                                                                                                   // 149
                                                                                                                      // 150
    if (Array.isArray(obj)) {                                                                                         // 151
        var compacted = [];                                                                                           // 152
                                                                                                                      // 153
        for (var i = 0, il = obj.length; i < il; ++i) {                                                               // 154
            if (typeof obj[i] !== 'undefined') {                                                                      // 155
                compacted.push(obj[i]);                                                                               // 156
            }                                                                                                         // 157
        }                                                                                                             // 158
                                                                                                                      // 159
        return compacted;                                                                                             // 160
    }                                                                                                                 // 161
                                                                                                                      // 162
    var keys = Object.keys(obj);                                                                                      // 163
    for (i = 0, il = keys.length; i < il; ++i) {                                                                      // 164
        var key = keys[i];                                                                                            // 165
        obj[key] = exports.compact(obj[key], refs);                                                                   // 166
    }                                                                                                                 // 167
                                                                                                                      // 168
    return obj;                                                                                                       // 169
};                                                                                                                    // 170
                                                                                                                      // 171
                                                                                                                      // 172
exports.isRegExp = function (obj) {                                                                                   // 173
                                                                                                                      // 174
    return Object.prototype.toString.call(obj) === '[object RegExp]';                                                 // 175
};                                                                                                                    // 176
                                                                                                                      // 177
                                                                                                                      // 178
exports.isBuffer = function (obj) {                                                                                   // 179
                                                                                                                      // 180
    if (obj === null ||                                                                                               // 181
        typeof obj === 'undefined') {                                                                                 // 182
                                                                                                                      // 183
        return false;                                                                                                 // 184
    }                                                                                                                 // 185
                                                                                                                      // 186
    return !!(obj.constructor &&                                                                                      // 187
              obj.constructor.isBuffer &&                                                                             // 188
              obj.constructor.isBuffer(obj));                                                                         // 189
};                                                                                                                    // 190
                                                                                                                      // 191
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"parse.js":["./utils",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/kadira_flow-router/node_modules/qs/lib/parse.js                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// Load modules                                                                                                       // 1
                                                                                                                      // 2
var Utils = require('./utils');                                                                                       // 3
                                                                                                                      // 4
                                                                                                                      // 5
// Declare internals                                                                                                  // 6
                                                                                                                      // 7
var internals = {                                                                                                     // 8
    delimiter: '&',                                                                                                   // 9
    depth: 5,                                                                                                         // 10
    arrayLimit: 20,                                                                                                   // 11
    parameterLimit: 1000,                                                                                             // 12
    strictNullHandling: false,                                                                                        // 13
    plainObjects: false,                                                                                              // 14
    allowPrototypes: false,                                                                                           // 15
    allowDots: false                                                                                                  // 16
};                                                                                                                    // 17
                                                                                                                      // 18
                                                                                                                      // 19
internals.parseValues = function (str, options) {                                                                     // 20
                                                                                                                      // 21
    var obj = {};                                                                                                     // 22
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);
                                                                                                                      // 24
    for (var i = 0, il = parts.length; i < il; ++i) {                                                                 // 25
        var part = parts[i];                                                                                          // 26
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;                             // 27
                                                                                                                      // 28
        if (pos === -1) {                                                                                             // 29
            obj[Utils.decode(part)] = '';                                                                             // 30
                                                                                                                      // 31
            if (options.strictNullHandling) {                                                                         // 32
                obj[Utils.decode(part)] = null;                                                                       // 33
            }                                                                                                         // 34
        }                                                                                                             // 35
        else {                                                                                                        // 36
            var key = Utils.decode(part.slice(0, pos));                                                               // 37
            var val = Utils.decode(part.slice(pos + 1));                                                              // 38
                                                                                                                      // 39
            if (!Object.prototype.hasOwnProperty.call(obj, key)) {                                                    // 40
                obj[key] = val;                                                                                       // 41
            }                                                                                                         // 42
            else {                                                                                                    // 43
                obj[key] = [].concat(obj[key]).concat(val);                                                           // 44
            }                                                                                                         // 45
        }                                                                                                             // 46
    }                                                                                                                 // 47
                                                                                                                      // 48
    return obj;                                                                                                       // 49
};                                                                                                                    // 50
                                                                                                                      // 51
                                                                                                                      // 52
internals.parseObject = function (chain, val, options) {                                                              // 53
                                                                                                                      // 54
    if (!chain.length) {                                                                                              // 55
        return val;                                                                                                   // 56
    }                                                                                                                 // 57
                                                                                                                      // 58
    var root = chain.shift();                                                                                         // 59
                                                                                                                      // 60
    var obj;                                                                                                          // 61
    if (root === '[]') {                                                                                              // 62
        obj = [];                                                                                                     // 63
        obj = obj.concat(internals.parseObject(chain, val, options));                                                 // 64
    }                                                                                                                 // 65
    else {                                                                                                            // 66
        obj = options.plainObjects ? Object.create(null) : {};                                                        // 67
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;     // 68
        var index = parseInt(cleanRoot, 10);                                                                          // 69
        var indexString = '' + index;                                                                                 // 70
        if (!isNaN(index) &&                                                                                          // 71
            root !== cleanRoot &&                                                                                     // 72
            indexString === cleanRoot &&                                                                              // 73
            index >= 0 &&                                                                                             // 74
            (options.parseArrays &&                                                                                   // 75
             index <= options.arrayLimit)) {                                                                          // 76
                                                                                                                      // 77
            obj = [];                                                                                                 // 78
            obj[index] = internals.parseObject(chain, val, options);                                                  // 79
        }                                                                                                             // 80
        else {                                                                                                        // 81
            obj[cleanRoot] = internals.parseObject(chain, val, options);                                              // 82
        }                                                                                                             // 83
    }                                                                                                                 // 84
                                                                                                                      // 85
    return obj;                                                                                                       // 86
};                                                                                                                    // 87
                                                                                                                      // 88
                                                                                                                      // 89
internals.parseKeys = function (key, val, options) {                                                                  // 90
                                                                                                                      // 91
    if (!key) {                                                                                                       // 92
        return;                                                                                                       // 93
    }                                                                                                                 // 94
                                                                                                                      // 95
    // Transform dot notation to bracket notation                                                                     // 96
                                                                                                                      // 97
    if (options.allowDots) {                                                                                          // 98
        key = key.replace(/\.([^\.\[]+)/g, '[$1]');                                                                   // 99
    }                                                                                                                 // 100
                                                                                                                      // 101
    // The regex chunks                                                                                               // 102
                                                                                                                      // 103
    var parent = /^([^\[\]]*)/;                                                                                       // 104
    var child = /(\[[^\[\]]*\])/g;                                                                                    // 105
                                                                                                                      // 106
    // Get the parent                                                                                                 // 107
                                                                                                                      // 108
    var segment = parent.exec(key);                                                                                   // 109
                                                                                                                      // 110
    // Stash the parent if it exists                                                                                  // 111
                                                                                                                      // 112
    var keys = [];                                                                                                    // 113
    if (segment[1]) {                                                                                                 // 114
        // If we aren't using plain objects, optionally prefix keys                                                   // 115
        // that would overwrite object prototype properties                                                           // 116
        if (!options.plainObjects &&                                                                                  // 117
            Object.prototype.hasOwnProperty(segment[1])) {                                                            // 118
                                                                                                                      // 119
            if (!options.allowPrototypes) {                                                                           // 120
                return;                                                                                               // 121
            }                                                                                                         // 122
        }                                                                                                             // 123
                                                                                                                      // 124
        keys.push(segment[1]);                                                                                        // 125
    }                                                                                                                 // 126
                                                                                                                      // 127
    // Loop through children appending to the array until we hit depth                                                // 128
                                                                                                                      // 129
    var i = 0;                                                                                                        // 130
    while ((segment = child.exec(key)) !== null && i < options.depth) {                                               // 131
                                                                                                                      // 132
        ++i;                                                                                                          // 133
        if (!options.plainObjects &&                                                                                  // 134
            Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {                                      // 135
                                                                                                                      // 136
            if (!options.allowPrototypes) {                                                                           // 137
                continue;                                                                                             // 138
            }                                                                                                         // 139
        }                                                                                                             // 140
        keys.push(segment[1]);                                                                                        // 141
    }                                                                                                                 // 142
                                                                                                                      // 143
    // If there's a remainder, just add whatever is left                                                              // 144
                                                                                                                      // 145
    if (segment) {                                                                                                    // 146
        keys.push('[' + key.slice(segment.index) + ']');                                                              // 147
    }                                                                                                                 // 148
                                                                                                                      // 149
    return internals.parseObject(keys, val, options);                                                                 // 150
};                                                                                                                    // 151
                                                                                                                      // 152
                                                                                                                      // 153
module.exports = function (str, options) {                                                                            // 154
                                                                                                                      // 155
    options = options || {};                                                                                          // 156
    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;                              // 158
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;          // 159
    options.parseArrays = options.parseArrays !== false;                                                              // 160
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : internals.allowDots;             // 161
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : internals.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : internals.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : internals.strictNullHandling;
                                                                                                                      // 166
    if (str === '' ||                                                                                                 // 167
        str === null ||                                                                                               // 168
        typeof str === 'undefined') {                                                                                 // 169
                                                                                                                      // 170
        return options.plainObjects ? Object.create(null) : {};                                                       // 171
    }                                                                                                                 // 172
                                                                                                                      // 173
    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;                                // 174
    var obj = options.plainObjects ? Object.create(null) : {};                                                        // 175
                                                                                                                      // 176
    // Iterate over the keys and setup the new object                                                                 // 177
                                                                                                                      // 178
    var keys = Object.keys(tempObj);                                                                                  // 179
    for (var i = 0, il = keys.length; i < il; ++i) {                                                                  // 180
        var key = keys[i];                                                                                            // 181
        var newObj = internals.parseKeys(key, tempObj[key], options);                                                 // 182
        obj = Utils.merge(obj, newObj, options);                                                                      // 183
    }                                                                                                                 // 184
                                                                                                                      // 185
    return Utils.compact(obj);                                                                                        // 186
};                                                                                                                    // 187
                                                                                                                      // 188
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/kadira:flow-router/client/modules.js");
require("./node_modules/meteor/kadira:flow-router/client/triggers.js");
require("./node_modules/meteor/kadira:flow-router/client/router.js");
require("./node_modules/meteor/kadira:flow-router/client/group.js");
require("./node_modules/meteor/kadira:flow-router/client/route.js");
require("./node_modules/meteor/kadira:flow-router/client/_init.js");
require("./node_modules/meteor/kadira:flow-router/lib/router.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['kadira:flow-router'] = {}, {
  FlowRouter: FlowRouter
});

})();
