(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;

/* Package-scope variables */
var NpmModuleBcrypt;

var require = meteorInstall({"node_modules":{"meteor":{"npm-bcrypt":{"wrapper.js":["assert","bcrypt","bcryptjs",function(require,exports){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// packages/npm-bcrypt/wrapper.js                                           //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
var assert = require("assert");

// The bcryptjs package has a slightly larger API than the native bcrypt
// package, so we stick to the smaller API for consistency.
var methods = {
  compare: true,
  compareSync: true,
  genSalt: true,
  genSaltSync: true,
  getRounds: true,
  hash: true,
  hashSync: true
};

try {
  // If you really need the native `bcrypt` package, then you should
  // `meteor npm install --save bcrypt` into the node_modules directory in
  // the root of your application.
  var bcrypt = require("bcrypt");
} catch (e) {
  bcrypt = require("bcryptjs");
  console.warn([
    "Note: you are using a pure-JavaScript implementation of bcrypt.",
    "While this implementation will work correctly, it is known to be",
    "approximately three times slower than the native implementation.",
    "In order to use the native implementation instead, run",
    "",
    "  meteor npm install --save bcrypt",
    "",
    "in the root directory of your application."
  ].join("\n"));
}

exports.NpmModuleBcrypt = {};
Object.keys(methods).forEach(function (key) {
  assert.strictEqual(typeof bcrypt[key], "function");
  exports.NpmModuleBcrypt[key] = bcrypt[key];
});

//////////////////////////////////////////////////////////////////////////////

}],"node_modules":{"bcryptjs":{"package.json":function(require,exports){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// ../../.0.9.2.11julyr++os+web.browser+web.cordova/npm/node_modules/bcrypt //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
exports.name = "bcryptjs";
exports.version = "2.3.0";
exports.main = "index.js";

//////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// node_modules/meteor/npm-bcrypt/node_modules/bcryptjs/index.js            //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
/*
 Copyright (c) 2012 Nevins Bartolomeo <nevins.bartolomeo@gmail.com>
 Copyright (c) 2012 Shane Girish <shaneGirish@gmail.com>
 Copyright (c) 2013 Daniel Wirtz <dcode@dcode.io>

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

module.exports = require("./dist/bcrypt.js");

//////////////////////////////////////////////////////////////////////////////

}}}}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/npm-bcrypt/wrapper.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['npm-bcrypt'] = exports, {
  NpmModuleBcrypt: NpmModuleBcrypt
});

})();
