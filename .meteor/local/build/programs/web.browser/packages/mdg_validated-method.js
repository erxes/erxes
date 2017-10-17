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
var check = Package.check.check;
var Match = Package.check.Match;
var DDP = Package['ddp-client'].DDP;
var _ = Package.underscore._;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var ValidatedMethod;

var require = meteorInstall({"node_modules":{"meteor":{"mdg:validated-method":{"validated-method.js":["babel-runtime/helpers/classCallCheck",function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mdg_validated-method/validated-method.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                                //
                                                                                                                       //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                       //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
/* global ValidatedMethod:true */ValidatedMethod = function () {                                                       // 1
  function ValidatedMethod(options) {                                                                                  // 4
    var _connection$methods;                                                                                           // 4
                                                                                                                       //
    (0, _classCallCheck3.default)(this, ValidatedMethod);                                                              // 4
    // Default to no mixins                                                                                            // 5
    options.mixins = options.mixins || [];                                                                             // 6
    check(options.mixins, [Function]);                                                                                 // 7
    check(options.name, String);                                                                                       // 8
    options = applyMixins(options, options.mixins); // connection argument defaults to Meteor, which is where Methods are defined on client and
    // server                                                                                                          // 12
                                                                                                                       //
    options.connection = options.connection || Meteor; // Allow validate: null shorthand for methods that take no arguments
                                                                                                                       //
    if (options.validate === null) {                                                                                   // 16
      options.validate = function () {};                                                                               // 17
    } // If this is null/undefined, make it an empty object                                                            // 18
                                                                                                                       //
                                                                                                                       //
    options.applyOptions = options.applyOptions || {};                                                                 // 21
    check(options, Match.ObjectIncluding({                                                                             // 23
      name: String,                                                                                                    // 24
      validate: Function,                                                                                              // 25
      run: Function,                                                                                                   // 26
      mixins: [Function],                                                                                              // 27
      connection: Object,                                                                                              // 28
      applyOptions: Object                                                                                             // 29
    })); // Default options passed to Meteor.apply, can be overridden with applyOptions                                // 23
                                                                                                                       //
    var defaultApplyOptions = {                                                                                        // 33
      // Make it possible to get the ID of an inserted item                                                            // 34
      returnStubValue: true,                                                                                           // 35
      // Don't call the server method if the client stub throws an error, so that we don't end                         // 37
      // up doing validations twice                                                                                    // 38
      throwStubExceptions: true                                                                                        // 39
    };                                                                                                                 // 33
    options.applyOptions = _.extend({}, defaultApplyOptions, options.applyOptions); // Attach all options to the ValidatedMethod instance
                                                                                                                       //
    _.extend(this, options);                                                                                           // 45
                                                                                                                       //
    var method = this;                                                                                                 // 47
    this.connection.methods((_connection$methods = {}, _connection$methods[options.name] = function (args) {           // 48
      // Silence audit-argument-checks since arguments are always checked when using this package                      // 50
      check(args, Match.Any);                                                                                          // 51
      var methodInvocation = this;                                                                                     // 52
      return method._execute(methodInvocation, args);                                                                  // 54
    }, _connection$methods));                                                                                          // 55
  }                                                                                                                    // 57
                                                                                                                       //
  ValidatedMethod.prototype.call = function () {                                                                       // 3
    function call(args, callback) {                                                                                    // 3
      // Accept calling with just a callback                                                                           // 60
      if (_.isFunction(args)) {                                                                                        // 61
        callback = args;                                                                                               // 62
        args = {};                                                                                                     // 63
      }                                                                                                                // 64
                                                                                                                       //
      try {                                                                                                            // 66
        return this.connection.apply(this.name, [args], this.applyOptions, callback);                                  // 67
      } catch (err) {                                                                                                  // 68
        if (callback) {                                                                                                // 69
          // Get errors from the stub in the same way as from the server-side method                                   // 70
          callback(err);                                                                                               // 71
        } else {                                                                                                       // 72
          // No callback passed, throw instead of silently failing; this is what                                       // 73
          // "normal" Methods do if you don't pass a callback.                                                         // 74
          throw err;                                                                                                   // 75
        }                                                                                                              // 76
      }                                                                                                                // 77
    }                                                                                                                  // 78
                                                                                                                       //
    return call;                                                                                                       // 3
  }();                                                                                                                 // 3
                                                                                                                       //
  ValidatedMethod.prototype._execute = function () {                                                                   // 3
    function _execute(methodInvocation, args) {                                                                        // 3
      methodInvocation = methodInvocation || {}; // Add `this.name` to reference the Method name                       // 81
                                                                                                                       //
      methodInvocation.name = this.name;                                                                               // 84
      var validateResult = this.validate.bind(methodInvocation)(args);                                                 // 86
                                                                                                                       //
      if (typeof validateResult !== 'undefined') {                                                                     // 88
        throw new Error("Returning from validate doesn't do anything; perhaps you meant to throw an error?");          // 89
      }                                                                                                                // 91
                                                                                                                       //
      return this.run.bind(methodInvocation)(args);                                                                    // 93
    }                                                                                                                  // 94
                                                                                                                       //
    return _execute;                                                                                                   // 3
  }();                                                                                                                 // 3
                                                                                                                       //
  return ValidatedMethod;                                                                                              // 3
}(); // Mixins get a chance to transform the arguments before they are passed to the actual Method                     // 3
                                                                                                                       //
                                                                                                                       //
function applyMixins(args, mixins) {                                                                                   // 98
  // You can pass nested arrays so that people can ship mixin packs                                                    // 99
  var flatMixins = _.flatten(mixins); // Save name of the method here, so we can attach it to potential error messages
                                                                                                                       //
                                                                                                                       //
  var _args = args,                                                                                                    // 98
      name = _args.name;                                                                                               // 98
  flatMixins.forEach(function (mixin) {                                                                                // 104
    args = mixin(args);                                                                                                // 105
                                                                                                                       //
    if (!Match.test(args, Object)) {                                                                                   // 107
      var functionName = mixin.toString().match(/function\s(\w+)/);                                                    // 108
      var msg = 'One of the mixins';                                                                                   // 109
                                                                                                                       //
      if (functionName) {                                                                                              // 111
        msg = "The function '" + functionName[1] + "'";                                                                // 112
      }                                                                                                                // 113
                                                                                                                       //
      throw new Error("Error in " + name + " method: " + msg + " didn't return the options object.");                  // 115
    }                                                                                                                  // 116
  });                                                                                                                  // 117
  return args;                                                                                                         // 119
}                                                                                                                      // 120
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/mdg:validated-method/validated-method.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['mdg:validated-method'] = {}, {
  ValidatedMethod: ValidatedMethod
});

})();
