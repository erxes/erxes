(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var _ = Package.underscore._;

/* Package-scope variables */
var PickerImp, Picker;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/meteorhacks_picker/packages/meteorhacks_picker.js                           //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
(function () {

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// packages/meteorhacks:picker/lib/implementation.js                             //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
var pathToRegexp = Npm.require('path-to-regexp');                                // 1
var Fiber = Npm.require('fibers');                                               // 2
var urlParse = Npm.require('url').parse;                                         // 3
                                                                                 // 4
PickerImp = function(filterFunction) {                                           // 5
  this.filterFunction = filterFunction;                                          // 6
  this.routes = [];                                                              // 7
  this.subRouters = [];                                                          // 8
  this.middlewares = [];                                                         // 9
}                                                                                // 10
                                                                                 // 11
PickerImp.prototype.middleware = function(callback) {                            // 12
  this.middlewares.push(callback);                                               // 13
};                                                                               // 14
                                                                                 // 15
PickerImp.prototype.route = function(path, callback) {                           // 16
  var regExp = pathToRegexp(path);                                               // 17
  regExp.callback = callback;                                                    // 18
  this.routes.push(regExp);                                                      // 19
  return this;                                                                   // 20
};                                                                               // 21
                                                                                 // 22
PickerImp.prototype.filter = function(callback) {                                // 23
  var subRouter = new PickerImp(callback);                                       // 24
  this.subRouters.push(subRouter);                                               // 25
  return subRouter;                                                              // 26
};                                                                               // 27
                                                                                 // 28
PickerImp.prototype._dispatch = function(req, res, bypass) {                     // 29
  var self = this;                                                               // 30
  var currentRoute = 0;                                                          // 31
  var currentSubRouter = 0;                                                      // 32
  var currentMiddleware = 0;                                                     // 33
                                                                                 // 34
  if(this.filterFunction) {                                                      // 35
    var result = this.filterFunction(req, res);                                  // 36
    if(!result) {                                                                // 37
      return bypass();                                                           // 38
    }                                                                            // 39
  }                                                                              // 40
                                                                                 // 41
  processNextMiddleware();                                                       // 42
  function processNextMiddleware () {                                            // 43
    var middleware = self.middlewares[currentMiddleware++];                      // 44
    if(middleware) {                                                             // 45
      self._processMiddleware(middleware, req, res, processNextMiddleware);      // 46
    } else {                                                                     // 47
      processNextRoute();                                                        // 48
    }                                                                            // 49
  }                                                                              // 50
                                                                                 // 51
  function processNextRoute () {                                                 // 52
    var route = self.routes[currentRoute++];                                     // 53
    if(route) {                                                                  // 54
      var uri = req.url.replace(/\?.*/, '');                                     // 55
      var m = uri.match(route);                                                  // 56
      if(m) {                                                                    // 57
        var params = self._buildParams(route.keys, m);                           // 58
        params.query = urlParse(req.url, true).query;                            // 59
        self._processRoute(route.callback, params, req, res, bypass);            // 60
      } else {                                                                   // 61
        processNextRoute();                                                      // 62
      }                                                                          // 63
    } else {                                                                     // 64
      processNextSubRouter();                                                    // 65
    }                                                                            // 66
  }                                                                              // 67
                                                                                 // 68
  function processNextSubRouter () {                                             // 69
    var subRouter = self.subRouters[currentSubRouter++];                         // 70
    if(subRouter) {                                                              // 71
      subRouter._dispatch(req, res, processNextSubRouter);                       // 72
    } else {                                                                     // 73
      bypass();                                                                  // 74
    }                                                                            // 75
  }                                                                              // 76
};                                                                               // 77
                                                                                 // 78
PickerImp.prototype._buildParams = function(keys, m) {                           // 79
  var params = {};                                                               // 80
  for(var lc=1; lc<m.length; lc++) {                                             // 81
    var key = keys[lc-1].name;                                                   // 82
    var value = m[lc];                                                           // 83
    params[key] = value;                                                         // 84
  }                                                                              // 85
                                                                                 // 86
  return params;                                                                 // 87
};                                                                               // 88
                                                                                 // 89
PickerImp.prototype._processRoute = function(callback, params, req, res, next) { // 90
  if(Fiber.current) {                                                            // 91
    doCall();                                                                    // 92
  } else {                                                                       // 93
    new Fiber(doCall).run();                                                     // 94
  }                                                                              // 95
                                                                                 // 96
  function doCall () {                                                           // 97
    callback.call(null, params, req, res, next);                                 // 98
  }                                                                              // 99
};                                                                               // 100
                                                                                 // 101
PickerImp.prototype._processMiddleware = function(middleware, req, res, next) {  // 102
  if(Fiber.current) {                                                            // 103
    doCall();                                                                    // 104
  } else {                                                                       // 105
    new Fiber(doCall).run();                                                     // 106
  }                                                                              // 107
                                                                                 // 108
  function doCall() {                                                            // 109
    middleware.call(null, req, res, next);                                       // 110
  }                                                                              // 111
};                                                                               // 112
///////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// packages/meteorhacks:picker/lib/instance.js                                   //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
Picker = new PickerImp();                                                        // 1
WebApp.rawConnectHandlers.use(function(req, res, next) {                         // 2
  Picker._dispatch(req, res, next);                                              // 3
});                                                                              // 4
                                                                                 // 5
///////////////////////////////////////////////////////////////////////////////////

}).call(this);

//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['meteorhacks:picker'] = {}, {
  Picker: Picker
});

})();
