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
var Router, Group, Route, FlowRouter, FastRender;

var require = meteorInstall({"node_modules":{"meteor":{"kadira:flow-router":{"server":{"router.js":function(require){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// packages/kadira_flow-router/server/router.js                                     //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
var Qs = Npm.require('qs');

Router = function () {
  this._routes = [];
  this._routesMap = {};
  this.subscriptions = Function.prototype;

  // holds onRoute callbacks
  this._onRouteCallbacks = [];
};

Router.prototype.route = function(pathDef, options) {
  if (!/^\/.*/.test(pathDef)) {
    var message = "route's path must start with '/'";
    throw new Error(message);
  }
  
  options = options || {};
  var route = new Route(this, pathDef, options);
  this._routes.push(route);

  if (options.name) {
    this._routesMap[options.name] = route;
  }

  this._triggerRouteRegister(route);
  return route;
};

Router.prototype.group = function(options) {
  return new Group(this, options);
};

Router.prototype.path = function(pathDef, fields, queryParams) {
  if (this._routesMap[pathDef]) {
    pathDef = this._routesMap[pathDef].path;
  }

  fields = fields || {};
  var regExp = /(:[\w\(\)\\\+\*\.\?]+)+/g;
  var path = pathDef.replace(regExp, function(key) {
    var firstRegexpChar = key.indexOf("(");
    // get the content behind : and (\\d+/)
    key = key.substring(1, (firstRegexpChar > 0)? firstRegexpChar: undefined);
    // remove +?*
    key = key.replace(/[\+\*\?]+/g, "");

    return fields[key] || "";
  });

  path = path.replace(/\/\/+/g, "/"); // Replace multiple slashes with single slash

  // remove trailing slash
  // but keep the root slash if it's the only one
  path = path.match(/^\/{1}$/) ? path: path.replace(/\/$/, "");

  var strQueryParams = Qs.stringify(queryParams || {});
  if(strQueryParams) {
    path += "?" + strQueryParams;
  }

  return path;
};

Router.prototype.onRouteRegister = function(cb) {
  this._onRouteCallbacks.push(cb);
};

Router.prototype._triggerRouteRegister = function(currentRoute) {
  // We should only need to send a safe set of fields on the route
  // object.
  // This is not to hide what's inside the route object, but to show 
  // these are the public APIs
  var routePublicApi = _.pick(currentRoute, 'name', 'pathDef', 'path');
  var omittingOptionFields = [
    'triggersEnter', 'triggersExit', 'action', 'subscriptions', 'name'
  ];
  routePublicApi.options = _.omit(currentRoute.options, omittingOptionFields);

  _.each(this._onRouteCallbacks, function(cb) {
    cb(routePublicApi);
  });
};


Router.prototype.go = function() {
  // client only
};


Router.prototype.current = function() {
  // client only
};


Router.prototype.triggers = {
  enter: function() {
    // client only
  },
  exit: function() {
    // client only
  }
};

Router.prototype.middleware = function() {
  // client only
};


Router.prototype.getState = function() {
  // client only
};


Router.prototype.getAllStates = function() {
  // client only
};


Router.prototype.setState = function() {
  // client only
};


Router.prototype.removeState = function() {
  // client only
};


Router.prototype.clearStates = function() {
  // client only
};


Router.prototype.ready = function() {
  // client only
};


Router.prototype.initialize = function() {
  // client only
};

Router.prototype.wait = function() {
  // client only
};

//////////////////////////////////////////////////////////////////////////////////////

},"group.js":function(){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// packages/kadira_flow-router/server/group.js                                      //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
Group = function(router, options) {
  options = options || {};
  this.prefix = options.prefix || '';
  this.options = options;
  this._router = router;
};

Group.prototype.route = function(pathDef, options) {
  pathDef = this.prefix + pathDef;
  return this._router.route(pathDef, options);
};

Group.prototype.group = function(options) {
  var group = new Group(this._router, options);
  group.parent = this;

  return group;
};

//////////////////////////////////////////////////////////////////////////////////////

},"route.js":function(){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// packages/kadira_flow-router/server/route.js                                      //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
Route = function(router, pathDef, options) {
  options = options || {};
  this.options = options;
  this.name = options.name;
  this.pathDef = pathDef;

  // Route.path is deprecated and will be removed in 3.0
  this.path = pathDef;

  this.action = options.action || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._subsMap = {};
};


Route.prototype.register = function(name, sub, options) {
  this._subsMap[name] = sub;
};


Route.prototype.subscription = function(name) {
  return this._subsMap[name];
};


Route.prototype.middleware = function(middleware) {
 
};

//////////////////////////////////////////////////////////////////////////////////////

},"_init.js":function(){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// packages/kadira_flow-router/server/_init.js                                      //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
// Export Router Instance
FlowRouter = new Router();
FlowRouter.Router = Router;
FlowRouter.Route = Route;

//////////////////////////////////////////////////////////////////////////////////////

},"plugins":{"fast_render.js":function(){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// packages/kadira_flow-router/server/plugins/fast_render.js                        //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
if(!Package['meteorhacks:fast-render']) {
  return;
}

FastRender = Package['meteorhacks:fast-render'].FastRender;

// hack to run after eveything else on startup
Meteor.startup(function () {
  Meteor.startup(function () {
    setupFastRender();
  });
});

function setupFastRender () {
  _.each(FlowRouter._routes, function (route) {
    FastRender.route(route.pathDef, function (routeParams, path) {
      var self = this;

      // anyone using Meteor.subscribe for something else?
      var original = Meteor.subscribe;
      Meteor.subscribe = function () {
        return _.toArray(arguments);
      };

      route._subsMap = {};
      FlowRouter.subscriptions.call(route, path);
      if(route.subscriptions) {
        var queryParams = routeParams.query;
        var params = _.omit(routeParams, 'query');
        route.subscriptions(params, queryParams);
      }
      _.each(route._subsMap, function (args) {
        self.subscribe.apply(self, args);
      });

      // restore Meteor.subscribe, ... on server side
      Meteor.subscribe = original;
    });
  });
}

//////////////////////////////////////////////////////////////////////////////////////

}}},"lib":{"router.js":function(){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// packages/kadira_flow-router/lib/router.js                                        //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
Router.prototype.url = function() {
  // We need to remove the leading base path, or "/", as it will be inserted
  // automatically by `Meteor.absoluteUrl` as documented in:
  // http://docs.meteor.com/#/full/meteor_absoluteurl
  var completePath = this.path.apply(this, arguments);
  var basePath = this._basePath || '/';
  var pathWithoutBase = completePath.replace(new RegExp('^' + basePath), '');
  return Meteor.absoluteUrl(pathWithoutBase);
};

//////////////////////////////////////////////////////////////////////////////////////

}}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/kadira:flow-router/server/router.js");
require("./node_modules/meteor/kadira:flow-router/server/group.js");
require("./node_modules/meteor/kadira:flow-router/server/route.js");
require("./node_modules/meteor/kadira:flow-router/server/_init.js");
require("./node_modules/meteor/kadira:flow-router/server/plugins/fast_render.js");
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
