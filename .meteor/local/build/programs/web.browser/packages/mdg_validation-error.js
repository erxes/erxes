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
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var ValidationError;

var require = meteorInstall({"node_modules":{"meteor":{"mdg:validation-error":{"validation-error.js":["babel-runtime/helpers/classCallCheck","babel-runtime/helpers/possibleConstructorReturn","babel-runtime/helpers/inherits",function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mdg_validation-error/validation-error.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                                //
                                                                                                                       //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                       //
                                                                                                                       //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                          //
                                                                                                                       //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                                 //
                                                                                                                       //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                            //
                                                                                                                       //
var _inherits3 = _interopRequireDefault(_inherits2);                                                                   //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
// The "details" property of the ValidationError must be an array of objects                                           // 1
// containing at least two properties. The "name" and "type" properties are                                            // 2
// required.                                                                                                           // 3
var errorsPattern = [Match.ObjectIncluding({                                                                           // 4
  name: String,                                                                                                        // 5
  type: String                                                                                                         // 6
})];                                                                                                                   // 4
                                                                                                                       //
ValidationError = function (_Meteor$Error) {                                                                           // 9
  (0, _inherits3.default)(_class, _Meteor$Error);                                                                      // 9
                                                                                                                       //
  function _class(errors) {                                                                                            // 10
    var _this, _ret;                                                                                                   // 10
                                                                                                                       //
    var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ValidationError.DEFAULT_MESSAGE;
    (0, _classCallCheck3.default)(this, _class);                                                                       // 10
    check(errors, errorsPattern);                                                                                      // 11
    check(message, String);                                                                                            // 12
    return _ret = (_this = (0, _possibleConstructorReturn3.default)(this, _Meteor$Error.call(this, ValidationError.ERROR_CODE, message, errors)), _this), (0, _possibleConstructorReturn3.default)(_this, _ret);
  } // Static method checking if a given Meteor.Error is an instance of                                                // 15
  // ValidationError.                                                                                                  // 18
                                                                                                                       //
                                                                                                                       //
  _class.is = function () {                                                                                            // 9
    function is(err) {                                                                                                 // 9
      return err instanceof Meteor.Error && err.error === ValidationError.ERROR_CODE;                                  // 20
    }                                                                                                                  // 21
                                                                                                                       //
    return is;                                                                                                         // 9
  }();                                                                                                                 // 9
                                                                                                                       //
  return _class;                                                                                                       // 9
}(Meteor.Error); // Universal validation error code to be use in applications and packages.                            // 9
                                                                                                                       //
                                                                                                                       //
ValidationError.ERROR_CODE = 'validation-error'; // Default validation error message that can be changed globally.     // 25
                                                                                                                       //
ValidationError.DEFAULT_MESSAGE = 'Validation failed';                                                                 // 27
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/mdg:validation-error/validation-error.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['mdg:validation-error'] = {}, {
  ValidationError: ValidationError
});

})();
