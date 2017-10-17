(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Babel = Package['babel-compiler'].Babel;
var BabelCompiler = Package['babel-compiler'].BabelCompiler;

/* Package-scope variables */
var ECMAScript;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/ecmascript/ecmascript.js                                 //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
ECMAScript = {                                                       // 1
  compileForShell: function (command) {                              // 2
    var babelOptions = Babel.getDefaultOptions();                    // 3
    babelOptions.sourceMap = false;                                  // 4
    babelOptions.ast = false;                                        // 5
    return Babel.compile(command, babelOptions).code;                // 6
  }                                                                  // 7
};                                                                   // 1
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.ecmascript = {}, {
  ECMAScript: ECMAScript
});

})();

//# sourceMappingURL=ecmascript.js.map
