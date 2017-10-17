(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Random;

var require = meteorInstall({"node_modules":{"meteor":{"random":{"random.js":function(require){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/random/random.js                                                                                     //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
// We use cryptographically strong PRNGs (crypto.getRandomBytes() on the server,                                 // 1
// window.crypto.getRandomValues() in the browser) when available. If these                                      // 2
// PRNGs fail, we fall back to the Alea PRNG, which is not cryptographically                                     // 3
// strong, and we seed it with various sources such as the date, Math.random,                                    // 4
// and window size on the client.  When using crypto.getRandomValues(), our                                      // 5
// primitive is hexString(), from which we construct fraction(). When using                                      // 6
// window.crypto.getRandomValues() or alea, the primitive is fraction and we use                                 // 7
// that to construct hex string.                                                                                 // 8
if (Meteor.isServer) var nodeCrypto = Npm.require('crypto'); // see http://baagoe.org/en/wiki/Better_random_numbers_for_javascript
// for a full discussion and Alea implementation.                                                                // 14
                                                                                                                 //
var Alea = function () {                                                                                         // 15
  function Mash() {                                                                                              // 16
    var n = 0xefc8249d;                                                                                          // 17
                                                                                                                 //
    var mash = function (data) {                                                                                 // 19
      data = data.toString();                                                                                    // 20
                                                                                                                 //
      for (var i = 0; i < data.length; i++) {                                                                    // 21
        n += data.charCodeAt(i);                                                                                 // 22
        var h = 0.02519603282416938 * n;                                                                         // 23
        n = h >>> 0;                                                                                             // 24
        h -= n;                                                                                                  // 25
        h *= n;                                                                                                  // 26
        n = h >>> 0;                                                                                             // 27
        h -= n;                                                                                                  // 28
        n += h * 0x100000000; // 2^32                                                                            // 29
      }                                                                                                          // 30
                                                                                                                 //
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32                                                        // 31
    };                                                                                                           // 32
                                                                                                                 //
    mash.version = 'Mash 0.9';                                                                                   // 34
    return mash;                                                                                                 // 35
  }                                                                                                              // 36
                                                                                                                 //
  return function (args) {                                                                                       // 38
    var s0 = 0;                                                                                                  // 39
    var s1 = 0;                                                                                                  // 40
    var s2 = 0;                                                                                                  // 41
    var c = 1;                                                                                                   // 42
                                                                                                                 //
    if (args.length == 0) {                                                                                      // 44
      args = [+new Date()];                                                                                      // 45
    }                                                                                                            // 46
                                                                                                                 //
    var mash = Mash();                                                                                           // 47
    s0 = mash(' ');                                                                                              // 48
    s1 = mash(' ');                                                                                              // 49
    s2 = mash(' ');                                                                                              // 50
                                                                                                                 //
    for (var i = 0; i < args.length; i++) {                                                                      // 52
      s0 -= mash(args[i]);                                                                                       // 53
                                                                                                                 //
      if (s0 < 0) {                                                                                              // 54
        s0 += 1;                                                                                                 // 55
      }                                                                                                          // 56
                                                                                                                 //
      s1 -= mash(args[i]);                                                                                       // 57
                                                                                                                 //
      if (s1 < 0) {                                                                                              // 58
        s1 += 1;                                                                                                 // 59
      }                                                                                                          // 60
                                                                                                                 //
      s2 -= mash(args[i]);                                                                                       // 61
                                                                                                                 //
      if (s2 < 0) {                                                                                              // 62
        s2 += 1;                                                                                                 // 63
      }                                                                                                          // 64
    }                                                                                                            // 65
                                                                                                                 //
    mash = null;                                                                                                 // 66
                                                                                                                 //
    var random = function () {                                                                                   // 68
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32                                                // 69
                                                                                                                 //
      s0 = s1;                                                                                                   // 70
      s1 = s2;                                                                                                   // 71
      return s2 = t - (c = t | 0);                                                                               // 72
    };                                                                                                           // 73
                                                                                                                 //
    random.uint32 = function () {                                                                                // 74
      return random() * 0x100000000; // 2^32                                                                     // 75
    };                                                                                                           // 76
                                                                                                                 //
    random.fract53 = function () {                                                                               // 77
      return random() + (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53                             // 78
    };                                                                                                           // 80
                                                                                                                 //
    random.version = 'Alea 0.9';                                                                                 // 81
    random.args = args;                                                                                          // 82
    return random;                                                                                               // 83
  }(Array.prototype.slice.call(arguments));                                                                      // 85
};                                                                                                               // 86
                                                                                                                 //
var UNMISTAKABLE_CHARS = "23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz";                              // 88
var BASE64_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" + "0123456789-_"; // `type` is one of `RandomGenerator.Type` as defined below.
//                                                                                                               // 93
// options:                                                                                                      // 94
// - seeds: (required, only for RandomGenerator.Type.ALEA) an array                                              // 95
//   whose items will be `toString`ed and used as the seed to the Alea                                           // 96
//   algorithm                                                                                                   // 97
                                                                                                                 //
var RandomGenerator = function (type, options) {                                                                 // 98
  var self = this;                                                                                               // 99
  self.type = type;                                                                                              // 100
                                                                                                                 //
  if (!RandomGenerator.Type[type]) {                                                                             // 102
    throw new Error("Unknown random generator type: " + type);                                                   // 103
  }                                                                                                              // 104
                                                                                                                 //
  if (type === RandomGenerator.Type.ALEA) {                                                                      // 106
    if (!options.seeds) {                                                                                        // 107
      throw new Error("No seeds were provided for Alea PRNG");                                                   // 108
    }                                                                                                            // 109
                                                                                                                 //
    self.alea = Alea.apply(null, options.seeds);                                                                 // 110
  }                                                                                                              // 111
}; // Types of PRNGs supported by the `RandomGenerator` class                                                    // 112
                                                                                                                 //
                                                                                                                 //
RandomGenerator.Type = {                                                                                         // 115
  // Use Node's built-in `crypto.getRandomBytes` (cryptographically                                              // 116
  // secure but not seedable, runs only on the server). Reverts to                                               // 117
  // `crypto.getPseudoRandomBytes` in the extremely uncommon case that                                           // 118
  // there isn't enough entropy yet                                                                              // 119
  NODE_CRYPTO: "NODE_CRYPTO",                                                                                    // 120
  // Use non-IE browser's built-in `window.crypto.getRandomValues`                                               // 122
  // (cryptographically secure but not seedable, runs only in the                                                // 123
  // browser).                                                                                                   // 124
  BROWSER_CRYPTO: "BROWSER_CRYPTO",                                                                              // 125
  // Use the *fast*, seedaable and not cryptographically secure                                                  // 127
  // Alea algorithm                                                                                              // 128
  ALEA: "ALEA"                                                                                                   // 129
}; /**                                                                                                           // 115
    * @name Random.fraction                                                                                      //
    * @summary Return a number between 0 and 1, like `Math.random`.                                              //
    * @locus Anywhere                                                                                            //
    */                                                                                                           //
                                                                                                                 //
RandomGenerator.prototype.fraction = function () {                                                               // 137
  var self = this;                                                                                               // 138
                                                                                                                 //
  if (self.type === RandomGenerator.Type.ALEA) {                                                                 // 139
    return self.alea();                                                                                          // 140
  } else if (self.type === RandomGenerator.Type.NODE_CRYPTO) {                                                   // 141
    var numerator = parseInt(self.hexString(8), 16);                                                             // 142
    return numerator * 2.3283064365386963e-10; // 2^-32                                                          // 143
  } else if (self.type === RandomGenerator.Type.BROWSER_CRYPTO) {                                                // 144
    var array = new Uint32Array(1);                                                                              // 145
    window.crypto.getRandomValues(array);                                                                        // 146
    return array[0] * 2.3283064365386963e-10; // 2^-32                                                           // 147
  } else {                                                                                                       // 148
    throw new Error('Unknown random generator type: ' + self.type);                                              // 149
  }                                                                                                              // 150
}; /**                                                                                                           // 151
    * @name Random.hexString                                                                                     //
    * @summary Return a random string of `n` hexadecimal digits.                                                 //
    * @locus Anywhere                                                                                            //
    * @param {Number} n Length of the string                                                                     //
    */                                                                                                           //
                                                                                                                 //
RandomGenerator.prototype.hexString = function (digits) {                                                        // 159
  var self = this;                                                                                               // 160
                                                                                                                 //
  if (self.type === RandomGenerator.Type.NODE_CRYPTO) {                                                          // 161
    var numBytes = Math.ceil(digits / 2);                                                                        // 162
    var bytes; // Try to get cryptographically strong randomness. Fall back to                                   // 163
    // non-cryptographically strong if not available.                                                            // 165
                                                                                                                 //
    try {                                                                                                        // 166
      bytes = nodeCrypto.randomBytes(numBytes);                                                                  // 167
    } catch (e) {                                                                                                // 168
      // XXX should re-throw any error except insufficient entropy                                               // 169
      bytes = nodeCrypto.pseudoRandomBytes(numBytes);                                                            // 170
    }                                                                                                            // 171
                                                                                                                 //
    var result = bytes.toString("hex"); // If the number of digits is odd, we'll have generated an extra 4 bits  // 172
    // of randomness, so we need to trim the last digit.                                                         // 174
                                                                                                                 //
    return result.substring(0, digits);                                                                          // 175
  } else {                                                                                                       // 176
    return this._randomString(digits, "0123456789abcdef");                                                       // 177
  }                                                                                                              // 178
};                                                                                                               // 179
                                                                                                                 //
RandomGenerator.prototype._randomString = function (charsCount, alphabet) {                                      // 181
  var self = this;                                                                                               // 183
  var digits = [];                                                                                               // 184
                                                                                                                 //
  for (var i = 0; i < charsCount; i++) {                                                                         // 185
    digits[i] = self.choice(alphabet);                                                                           // 186
  }                                                                                                              // 187
                                                                                                                 //
  return digits.join("");                                                                                        // 188
}; /**                                                                                                           // 189
    * @name Random.id                                                                                            //
    * @summary Return a unique identifier, such as `"Jjwjg6gouWLXhMGKW"`, that is                                //
    * likely to be unique in the whole world.                                                                    //
    * @locus Anywhere                                                                                            //
    * @param {Number} [n] Optional length of the identifier in characters                                        //
    *   (defaults to 17)                                                                                         //
    */                                                                                                           //
                                                                                                                 //
RandomGenerator.prototype.id = function (charsCount) {                                                           // 199
  var self = this; // 17 characters is around 96 bits of entropy, which is the amount of                         // 200
  // state in the Alea PRNG.                                                                                     // 202
                                                                                                                 //
  if (charsCount === undefined) charsCount = 17;                                                                 // 203
  return self._randomString(charsCount, UNMISTAKABLE_CHARS);                                                     // 206
}; /**                                                                                                           // 207
    * @name Random.secret                                                                                        //
    * @summary Return a random string of printable characters with 6 bits of                                     //
    * entropy per character. Use `Random.secret` for security-critical secrets                                   //
    * that are intended for machine, rather than human, consumption.                                             //
    * @locus Anywhere                                                                                            //
    * @param {Number} [n] Optional length of the secret string (defaults to 43                                   //
    *   characters, or 256 bits of entropy)                                                                      //
    */                                                                                                           //
                                                                                                                 //
RandomGenerator.prototype.secret = function (charsCount) {                                                       // 218
  var self = this; // Default to 256 bits of entropy, or 43 characters at 6 bits per                             // 219
  // character.                                                                                                  // 221
                                                                                                                 //
  if (charsCount === undefined) charsCount = 43;                                                                 // 222
  return self._randomString(charsCount, BASE64_CHARS);                                                           // 224
}; /**                                                                                                           // 225
    * @name Random.choice                                                                                        //
    * @summary Return a random element of the given array or string.                                             //
    * @locus Anywhere                                                                                            //
    * @param {Array|String} arrayOrString Array or string to choose from                                         //
    */                                                                                                           //
                                                                                                                 //
RandomGenerator.prototype.choice = function (arrayOrString) {                                                    // 233
  var index = Math.floor(this.fraction() * arrayOrString.length);                                                // 234
  if (typeof arrayOrString === "string") return arrayOrString.substr(index, 1);else return arrayOrString[index];
}; // instantiate RNG.  Heuristically collect entropy from various sources when a                                // 239
// cryptographic PRNG isn't available.                                                                           // 242
// client sources                                                                                                // 244
                                                                                                                 //
                                                                                                                 //
var height = typeof window !== 'undefined' && window.innerHeight || typeof document !== 'undefined' && document.documentElement && document.documentElement.clientHeight || typeof document !== 'undefined' && document.body && document.body.clientHeight || 1;
var width = typeof window !== 'undefined' && window.innerWidth || typeof document !== 'undefined' && document.documentElement && document.documentElement.clientWidth || typeof document !== 'undefined' && document.body && document.body.clientWidth || 1;
var agent = typeof navigator !== 'undefined' && navigator.userAgent || "";                                       // 263
                                                                                                                 //
function createAleaGeneratorWithGeneratedSeed() {                                                                // 265
  return new RandomGenerator(RandomGenerator.Type.ALEA, {                                                        // 266
    seeds: [new Date(), height, width, agent, Math.random()]                                                     // 268
  });                                                                                                            // 268
}                                                                                                                // 269
                                                                                                                 //
;                                                                                                                // 269
                                                                                                                 //
if (Meteor.isServer) {                                                                                           // 271
  Random = new RandomGenerator(RandomGenerator.Type.NODE_CRYPTO);                                                // 272
} else {                                                                                                         // 273
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {                         // 274
    Random = new RandomGenerator(RandomGenerator.Type.BROWSER_CRYPTO);                                           // 276
  } else {                                                                                                       // 277
    // On IE 10 and below, there's no browser crypto API                                                         // 278
    // available. Fall back to Alea                                                                              // 279
    //                                                                                                           // 280
    // XXX looks like at the moment, we use Alea in IE 11 as well,                                               // 281
    // which has `window.msCrypto` instead of `window.crypto`.                                                   // 282
    Random = createAleaGeneratorWithGeneratedSeed();                                                             // 283
  }                                                                                                              // 284
} // Create a non-cryptographically secure PRNG with a given seed (using                                         // 285
// the Alea algorithm)                                                                                           // 288
                                                                                                                 //
                                                                                                                 //
Random.createWithSeeds = function () {                                                                           // 289
  for (var _len = arguments.length, seeds = Array(_len), _key = 0; _key < _len; _key++) {                        // 289
    seeds[_key] = arguments[_key];                                                                               // 289
  }                                                                                                              // 289
                                                                                                                 //
  if (seeds.length === 0) {                                                                                      // 290
    throw new Error("No seeds were provided");                                                                   // 291
  }                                                                                                              // 292
                                                                                                                 //
  return new RandomGenerator(RandomGenerator.Type.ALEA, {                                                        // 293
    seeds: seeds                                                                                                 // 293
  });                                                                                                            // 293
}; // Used like `Random`, but much faster and not cryptographically                                              // 294
// secure                                                                                                        // 297
                                                                                                                 //
                                                                                                                 //
Random.insecure = createAleaGeneratorWithGeneratedSeed();                                                        // 298
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"deprecated.js":function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/random/deprecated.js                                                                                 //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
// Before this package existed, we used to use this Meteor.uuid()                                                // 1
// implementing the RFC 4122 v4 UUID. It is no longer documented                                                 // 2
// and will go away.                                                                                             // 3
// XXX COMPAT WITH 0.5.6                                                                                         // 4
Meteor.uuid = function () {                                                                                      // 5
  var HEX_DIGITS = "0123456789abcdef";                                                                           // 6
  var s = [];                                                                                                    // 7
                                                                                                                 //
  for (var i = 0; i < 36; i++) {                                                                                 // 8
    s[i] = Random.choice(HEX_DIGITS);                                                                            // 9
  }                                                                                                              // 10
                                                                                                                 //
  s[14] = "4";                                                                                                   // 11
  s[19] = HEX_DIGITS.substr(parseInt(s[19], 16) & 0x3 | 0x8, 1);                                                 // 12
  s[8] = s[13] = s[18] = s[23] = "-";                                                                            // 13
  var uuid = s.join("");                                                                                         // 15
  return uuid;                                                                                                   // 16
};                                                                                                               // 17
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/random/random.js");
require("./node_modules/meteor/random/deprecated.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.random = {}, {
  Random: Random
});

})();

//# sourceMappingURL=random.js.map
