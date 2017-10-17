(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var NpmModuleBcrypt = Package['npm-bcrypt'].NpmModuleBcrypt;
var Accounts = Package['accounts-base'].Accounts;
var SRP = Package.srp.SRP;
var SHA256 = Package.sha.SHA256;
var EJSON = Package.ejson.EJSON;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var Email = Package.email.Email;
var EmailInternals = Package.email.EmailInternals;
var Random = Package.random.Random;
var check = Package.check.check;
var Match = Package.check.Match;
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

var require = meteorInstall({"node_modules":{"meteor":{"accounts-password":{"email_templates.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-password/email_templates.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
function greet(welcomeMsg) {                                                                                           // 1
  return function (user, url) {                                                                                        // 2
    var greeting = user.profile && user.profile.name ? "Hello " + user.profile.name + "," : "Hello,";                  // 3
    return greeting + "\n\n" + welcomeMsg + ", simply click the link below.\n\n" + url + "\n\nThanks.\n";              // 5
  };                                                                                                                   // 13
} /**                                                                                                                  // 14
   * @summary Options to customize emails sent from the Accounts system.                                               //
   * @locus Server                                                                                                     //
   * @importFromPackage accounts-base                                                                                  //
   */                                                                                                                  //
                                                                                                                       //
Accounts.emailTemplates = {                                                                                            // 21
  from: "Meteor Accounts <no-reply@meteor.com>",                                                                       // 22
  siteName: Meteor.absoluteUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''),                                       // 23
  resetPassword: {                                                                                                     // 25
    subject: function (user) {                                                                                         // 26
      return "How to reset your password on " + Accounts.emailTemplates.siteName;                                      // 27
    },                                                                                                                 // 28
    text: greet("To reset your password")                                                                              // 29
  },                                                                                                                   // 25
  verifyEmail: {                                                                                                       // 31
    subject: function (user) {                                                                                         // 32
      return "How to verify email address on " + Accounts.emailTemplates.siteName;                                     // 33
    },                                                                                                                 // 34
    text: greet("To verify your account email")                                                                        // 35
  },                                                                                                                   // 31
  enrollAccount: {                                                                                                     // 37
    subject: function (user) {                                                                                         // 38
      return "An account has been created for you on " + Accounts.emailTemplates.siteName;                             // 39
    },                                                                                                                 // 40
    text: greet("To start using the service")                                                                          // 41
  }                                                                                                                    // 37
};                                                                                                                     // 21
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"password_server.js":["babel-runtime/helpers/typeof",function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-password/password_server.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                                //
                                                                                                                       //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                       //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
/// BCRYPT                                                                                                             // 1
var bcrypt = NpmModuleBcrypt;                                                                                          // 3
var bcryptHash = Meteor.wrapAsync(bcrypt.hash);                                                                        // 4
var bcryptCompare = Meteor.wrapAsync(bcrypt.compare); // User records have a 'services.password.bcrypt' field on them to hold
// their hashed passwords (unless they have a 'services.password.srp'                                                  // 8
// field, in which case they will be upgraded to bcrypt the next time                                                  // 9
// they log in).                                                                                                       // 10
//                                                                                                                     // 11
// When the client sends a password to the server, it can either be a                                                  // 12
// string (the plaintext password) or an object with keys 'digest' and                                                 // 13
// 'algorithm' (must be "sha-256" for now). The Meteor client always sends                                             // 14
// password objects { digest: *, algorithm: "sha-256" }, but DDP clients                                               // 15
// that don't have access to SHA can just send plaintext passwords as                                                  // 16
// strings.                                                                                                            // 17
//                                                                                                                     // 18
// When the server receives a plaintext password as a string, it always                                                // 19
// hashes it with SHA256 before passing it into bcrypt. When the server                                                // 20
// receives a password as an object, it asserts that the algorithm is                                                  // 21
// "sha-256" and then passes the digest to bcrypt.                                                                     // 22
                                                                                                                       //
Accounts._bcryptRounds = 10; // Given a 'password' from the client, extract the string that we should                  // 25
// bcrypt. 'password' can be one of:                                                                                   // 28
//  - String (the plaintext password)                                                                                  // 29
//  - Object with 'digest' and 'algorithm' keys. 'algorithm' must be "sha-256".                                        // 30
//                                                                                                                     // 31
                                                                                                                       //
var getPasswordString = function (password) {                                                                          // 32
  if (typeof password === "string") {                                                                                  // 33
    password = SHA256(password);                                                                                       // 34
  } else {                                                                                                             // 35
    // 'password' is an object                                                                                         // 35
    if (password.algorithm !== "sha-256") {                                                                            // 36
      throw new Error("Invalid password hash algorithm. " + "Only 'sha-256' is allowed.");                             // 37
    }                                                                                                                  // 39
                                                                                                                       //
    password = password.digest;                                                                                        // 40
  }                                                                                                                    // 41
                                                                                                                       //
  return password;                                                                                                     // 42
}; // Use bcrypt to hash the password for storage in the database.                                                     // 43
// `password` can be a string (in which case it will be run through                                                    // 46
// SHA256 before bcrypt) or an object with properties `digest` and                                                     // 47
// `algorithm` (in which case we bcrypt `password.digest`).                                                            // 48
//                                                                                                                     // 49
                                                                                                                       //
                                                                                                                       //
var hashPassword = function (password) {                                                                               // 50
  password = getPasswordString(password);                                                                              // 51
  return bcryptHash(password, Accounts._bcryptRounds);                                                                 // 52
}; // Check whether the provided password matches the bcrypt'ed password in                                            // 53
// the database user record. `password` can be a string (in which case                                                 // 56
// it will be run through SHA256 before bcrypt) or an object with                                                      // 57
// properties `digest` and `algorithm` (in which case we bcrypt                                                        // 58
// `password.digest`).                                                                                                 // 59
//                                                                                                                     // 60
                                                                                                                       //
                                                                                                                       //
Accounts._checkPassword = function (user, password) {                                                                  // 61
  var result = {                                                                                                       // 62
    userId: user._id                                                                                                   // 63
  };                                                                                                                   // 62
  password = getPasswordString(password);                                                                              // 66
                                                                                                                       //
  if (!bcryptCompare(password, user.services.password.bcrypt)) {                                                       // 68
    result.error = handleError("Incorrect password", false);                                                           // 69
  }                                                                                                                    // 70
                                                                                                                       //
  return result;                                                                                                       // 72
};                                                                                                                     // 73
                                                                                                                       //
var checkPassword = Accounts._checkPassword; ///                                                                       // 74
/// ERROR HANDLER                                                                                                      // 77
///                                                                                                                    // 78
                                                                                                                       //
var handleError = function (msg) {                                                                                     // 79
  var throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;                           // 79
  var error = new Meteor.Error(403, Accounts._options.ambiguousErrorMessages ? "Login failure. Please check your login credentials." : msg);
                                                                                                                       //
  if (throwError) {                                                                                                    // 86
    throw error;                                                                                                       // 87
  }                                                                                                                    // 88
                                                                                                                       //
  return error;                                                                                                        // 89
}; ///                                                                                                                 // 90
/// LOGIN                                                                                                              // 93
///                                                                                                                    // 94
                                                                                                                       //
                                                                                                                       //
Accounts._findUserByQuery = function (query) {                                                                         // 96
  var user = null;                                                                                                     // 97
                                                                                                                       //
  if (query.id) {                                                                                                      // 99
    user = Meteor.users.findOne({                                                                                      // 100
      _id: query.id                                                                                                    // 100
    });                                                                                                                // 100
  } else {                                                                                                             // 101
    var fieldName;                                                                                                     // 102
    var fieldValue;                                                                                                    // 103
                                                                                                                       //
    if (query.username) {                                                                                              // 104
      fieldName = 'username';                                                                                          // 105
      fieldValue = query.username;                                                                                     // 106
    } else if (query.email) {                                                                                          // 107
      fieldName = 'emails.address';                                                                                    // 108
      fieldValue = query.email;                                                                                        // 109
    } else {                                                                                                           // 110
      throw new Error("shouldn't happen (validation missed something)");                                               // 111
    }                                                                                                                  // 112
                                                                                                                       //
    var selector = {};                                                                                                 // 113
    selector[fieldName] = fieldValue;                                                                                  // 114
    user = Meteor.users.findOne(selector); // If user is not found, try a case insensitive lookup                      // 115
                                                                                                                       //
    if (!user) {                                                                                                       // 117
      selector = selectorForFastCaseInsensitiveLookup(fieldName, fieldValue);                                          // 118
      var candidateUsers = Meteor.users.find(selector).fetch(); // No match if multiple candidates are found           // 119
                                                                                                                       //
      if (candidateUsers.length === 1) {                                                                               // 121
        user = candidateUsers[0];                                                                                      // 122
      }                                                                                                                // 123
    }                                                                                                                  // 124
  }                                                                                                                    // 125
                                                                                                                       //
  return user;                                                                                                         // 127
}; /**                                                                                                                 // 128
    * @summary Finds the user with the specified username.                                                             //
    * First tries to match username case sensitively; if that fails, it                                                //
    * tries case insensitively; but if more than one user matches the case                                             //
    * insensitive search, it returns null.                                                                             //
    * @locus Server                                                                                                    //
    * @param {String} username The username to look for                                                                //
    * @returns {Object} A user if found, else null                                                                     //
    * @importFromPackage accounts-base                                                                                 //
    */                                                                                                                 //
                                                                                                                       //
Accounts.findUserByUsername = function (username) {                                                                    // 140
  return Accounts._findUserByQuery({                                                                                   // 141
    username: username                                                                                                 // 142
  });                                                                                                                  // 141
}; /**                                                                                                                 // 144
    * @summary Finds the user with the specified email.                                                                //
    * First tries to match email case sensitively; if that fails, it                                                   //
    * tries case insensitively; but if more than one user matches the case                                             //
    * insensitive search, it returns null.                                                                             //
    * @locus Server                                                                                                    //
    * @param {String} email The email address to look for                                                              //
    * @returns {Object} A user if found, else null                                                                     //
    * @importFromPackage accounts-base                                                                                 //
    */                                                                                                                 //
                                                                                                                       //
Accounts.findUserByEmail = function (email) {                                                                          // 156
  return Accounts._findUserByQuery({                                                                                   // 157
    email: email                                                                                                       // 158
  });                                                                                                                  // 157
}; // Generates a MongoDB selector that can be used to perform a fast case                                             // 160
// insensitive lookup for the given fieldName and string. Since MongoDB does                                           // 163
// not support case insensitive indexes, and case insensitive regex queries                                            // 164
// are slow, we construct a set of prefix selectors for all permutations of                                            // 165
// the first 4 characters ourselves. We first attempt to matching against                                              // 166
// these, and because 'prefix expression' regex queries do use indexes (see                                            // 167
// http://docs.mongodb.org/v2.6/reference/operator/query/regex/#index-use),                                            // 168
// this has been found to greatly improve performance (from 1200ms to 5ms in a                                         // 169
// test with 1.000.000 users).                                                                                         // 170
                                                                                                                       //
                                                                                                                       //
var selectorForFastCaseInsensitiveLookup = function (fieldName, string) {                                              // 171
  // Performance seems to improve up to 4 prefix characters                                                            // 172
  var prefix = string.substring(0, Math.min(string.length, 4));                                                        // 173
                                                                                                                       //
  var orClause = _.map(generateCasePermutationsForString(prefix), function (prefixPermutation) {                       // 174
    var selector = {};                                                                                                 // 176
    selector[fieldName] = new RegExp('^' + Meteor._escapeRegExp(prefixPermutation));                                   // 177
    return selector;                                                                                                   // 179
  });                                                                                                                  // 180
                                                                                                                       //
  var caseInsensitiveClause = {};                                                                                      // 181
  caseInsensitiveClause[fieldName] = new RegExp('^' + Meteor._escapeRegExp(string) + '$', 'i');                        // 182
  return {                                                                                                             // 184
    $and: [{                                                                                                           // 184
      $or: orClause                                                                                                    // 184
    }, caseInsensitiveClause]                                                                                          // 184
  };                                                                                                                   // 184
}; // Generates permutations of all case variations of a given string.                                                 // 185
                                                                                                                       //
                                                                                                                       //
var generateCasePermutationsForString = function (string) {                                                            // 188
  var permutations = [''];                                                                                             // 189
                                                                                                                       //
  for (var i = 0; i < string.length; i++) {                                                                            // 190
    var ch = string.charAt(i);                                                                                         // 191
    permutations = _.flatten(_.map(permutations, function (prefix) {                                                   // 192
      var lowerCaseChar = ch.toLowerCase();                                                                            // 193
      var upperCaseChar = ch.toUpperCase(); // Don't add unneccesary permutations when ch is not a letter              // 194
                                                                                                                       //
      if (lowerCaseChar === upperCaseChar) {                                                                           // 196
        return [prefix + ch];                                                                                          // 197
      } else {                                                                                                         // 198
        return [prefix + lowerCaseChar, prefix + upperCaseChar];                                                       // 199
      }                                                                                                                // 200
    }));                                                                                                               // 201
  }                                                                                                                    // 202
                                                                                                                       //
  return permutations;                                                                                                 // 203
};                                                                                                                     // 204
                                                                                                                       //
var checkForCaseInsensitiveDuplicates = function (fieldName, displayName, fieldValue, ownUserId) {                     // 206
  // Some tests need the ability to add users with the same case insensitive                                           // 207
  // value, hence the _skipCaseInsensitiveChecksForTest check                                                          // 208
  var skipCheck = _.has(Accounts._skipCaseInsensitiveChecksForTest, fieldValue);                                       // 209
                                                                                                                       //
  if (fieldValue && !skipCheck) {                                                                                      // 211
    var matchedUsers = Meteor.users.find(selectorForFastCaseInsensitiveLookup(fieldName, fieldValue)).fetch();         // 212
                                                                                                                       //
    if (matchedUsers.length > 0 && ( // If we don't have a userId yet, any match we find is a duplicate                // 215
    !ownUserId || // Otherwise, check to see if there are multiple matches or a match                                  // 217
    // that is not us                                                                                                  // 219
    matchedUsers.length > 1 || matchedUsers[0]._id !== ownUserId)) {                                                   // 220
      handleError(displayName + " already exists.");                                                                   // 221
    }                                                                                                                  // 222
  }                                                                                                                    // 223
}; // XXX maybe this belongs in the check package                                                                      // 224
                                                                                                                       //
                                                                                                                       //
var NonEmptyString = Match.Where(function (x) {                                                                        // 227
  check(x, String);                                                                                                    // 228
  return x.length > 0;                                                                                                 // 229
});                                                                                                                    // 230
var userQueryValidator = Match.Where(function (user) {                                                                 // 232
  check(user, {                                                                                                        // 233
    id: Match.Optional(NonEmptyString),                                                                                // 234
    username: Match.Optional(NonEmptyString),                                                                          // 235
    email: Match.Optional(NonEmptyString)                                                                              // 236
  });                                                                                                                  // 233
  if (_.keys(user).length !== 1) throw new Match.Error("User property must have exactly one field");                   // 238
  return true;                                                                                                         // 240
});                                                                                                                    // 241
var passwordValidator = Match.OneOf(String, {                                                                          // 243
  digest: String,                                                                                                      // 245
  algorithm: String                                                                                                    // 245
}); // Handler to login with a password.                                                                               // 245
//                                                                                                                     // 249
// The Meteor client sets options.password to an object with keys                                                      // 250
// 'digest' (set to SHA256(password)) and 'algorithm' ("sha-256").                                                     // 251
//                                                                                                                     // 252
// For other DDP clients which don't have access to SHA, the handler                                                   // 253
// also accepts the plaintext password in options.password as a string.                                                // 254
//                                                                                                                     // 255
// (It might be nice if servers could turn the plaintext password                                                      // 256
// option off. Or maybe it should be opt-in, not opt-out?                                                              // 257
// Accounts.config option?)                                                                                            // 258
//                                                                                                                     // 259
// Note that neither password option is secure without SSL.                                                            // 260
//                                                                                                                     // 261
                                                                                                                       //
Accounts.registerLoginHandler("password", function (options) {                                                         // 262
  if (!options.password || options.srp) return undefined; // don't handle                                              // 263
                                                                                                                       //
  check(options, {                                                                                                     // 266
    user: userQueryValidator,                                                                                          // 267
    password: passwordValidator                                                                                        // 268
  });                                                                                                                  // 266
                                                                                                                       //
  var user = Accounts._findUserByQuery(options.user);                                                                  // 272
                                                                                                                       //
  if (!user) {                                                                                                         // 273
    handleError("User not found");                                                                                     // 274
  }                                                                                                                    // 275
                                                                                                                       //
  if (!user.services || !user.services.password || !(user.services.password.bcrypt || user.services.password.srp)) {   // 277
    handleError("User has no password set");                                                                           // 279
  }                                                                                                                    // 280
                                                                                                                       //
  if (!user.services.password.bcrypt) {                                                                                // 282
    if (typeof options.password === "string") {                                                                        // 283
      // The client has presented a plaintext password, and the user is                                                // 284
      // not upgraded to bcrypt yet. We don't attempt to tell the client                                               // 285
      // to upgrade to bcrypt, because it might be a standalone DDP                                                    // 286
      // client doesn't know how to do such a thing.                                                                   // 287
      var verifier = user.services.password.srp;                                                                       // 288
      var newVerifier = SRP.generateVerifier(options.password, {                                                       // 289
        identity: verifier.identity,                                                                                   // 290
        salt: verifier.salt                                                                                            // 290
      });                                                                                                              // 289
                                                                                                                       //
      if (verifier.verifier !== newVerifier.verifier) {                                                                // 292
        return {                                                                                                       // 293
          userId: Accounts._options.ambiguousErrorMessages ? null : user._id,                                          // 294
          error: handleError("Incorrect password", false)                                                              // 295
        };                                                                                                             // 293
      }                                                                                                                // 297
                                                                                                                       //
      return {                                                                                                         // 299
        userId: user._id                                                                                               // 299
      };                                                                                                               // 299
    } else {                                                                                                           // 300
      // Tell the client to use the SRP upgrade process.                                                               // 301
      throw new Meteor.Error(400, "old password format", EJSON.stringify({                                             // 302
        format: 'srp',                                                                                                 // 303
        identity: user.services.password.srp.identity                                                                  // 304
      }));                                                                                                             // 302
    }                                                                                                                  // 306
  }                                                                                                                    // 307
                                                                                                                       //
  return checkPassword(user, options.password);                                                                        // 309
}); // Handler to login using the SRP upgrade path. To use this login                                                  // 313
// handler, the client must provide:                                                                                   // 316
//   - srp: H(identity + ":" + password)                                                                               // 317
//   - password: a string or an object with properties 'digest' and 'algorithm'                                        // 318
//                                                                                                                     // 319
// We use `options.srp` to verify that the client knows the correct                                                    // 320
// password without doing a full SRP flow. Once we've checked that, we                                                 // 321
// upgrade the user to bcrypt and remove the SRP information from the                                                  // 322
// user document.                                                                                                      // 323
//                                                                                                                     // 324
// The client ends up using this login handler after trying the normal                                                 // 325
// login handler (above), which throws an error telling the client to                                                  // 326
// try the SRP upgrade path.                                                                                           // 327
//                                                                                                                     // 328
// XXX COMPAT WITH 0.8.1.3                                                                                             // 329
                                                                                                                       //
Accounts.registerLoginHandler("password", function (options) {                                                         // 330
  if (!options.srp || !options.password) {                                                                             // 331
    return undefined; // don't handle                                                                                  // 332
  }                                                                                                                    // 333
                                                                                                                       //
  check(options, {                                                                                                     // 335
    user: userQueryValidator,                                                                                          // 336
    srp: String,                                                                                                       // 337
    password: passwordValidator                                                                                        // 338
  });                                                                                                                  // 335
                                                                                                                       //
  var user = Accounts._findUserByQuery(options.user);                                                                  // 341
                                                                                                                       //
  if (!user) {                                                                                                         // 342
    handleError("User not found");                                                                                     // 343
  } // Check to see if another simultaneous login has already upgraded                                                 // 344
  // the user record to bcrypt.                                                                                        // 347
                                                                                                                       //
                                                                                                                       //
  if (user.services && user.services.password && user.services.password.bcrypt) {                                      // 348
    return checkPassword(user, options.password);                                                                      // 349
  }                                                                                                                    // 350
                                                                                                                       //
  if (!(user.services && user.services.password && user.services.password.srp)) {                                      // 352
    handleError("User has no password set");                                                                           // 353
  }                                                                                                                    // 354
                                                                                                                       //
  var v1 = user.services.password.srp.verifier;                                                                        // 356
  var v2 = SRP.generateVerifier(null, {                                                                                // 357
    hashedIdentityAndPassword: options.srp,                                                                            // 360
    salt: user.services.password.srp.salt                                                                              // 361
  }).verifier;                                                                                                         // 359
                                                                                                                       //
  if (v1 !== v2) {                                                                                                     // 364
    return {                                                                                                           // 365
      userId: Accounts._options.ambiguousErrorMessages ? null : user._id,                                              // 366
      error: handleError("Incorrect password", false)                                                                  // 367
    };                                                                                                                 // 365
  } // Upgrade to bcrypt on successful login.                                                                          // 369
                                                                                                                       //
                                                                                                                       //
  var salted = hashPassword(options.password);                                                                         // 372
  Meteor.users.update(user._id, {                                                                                      // 373
    $unset: {                                                                                                          // 376
      'services.password.srp': 1                                                                                       // 376
    },                                                                                                                 // 376
    $set: {                                                                                                            // 377
      'services.password.bcrypt': salted                                                                               // 377
    }                                                                                                                  // 377
  });                                                                                                                  // 375
  return {                                                                                                             // 381
    userId: user._id                                                                                                   // 381
  };                                                                                                                   // 381
}); ///                                                                                                                // 382
/// CHANGING                                                                                                           // 386
///                                                                                                                    // 387
/**                                                                                                                    // 389
 * @summary Change a user's username. Use this instead of updating the                                                 //
 * database directly. The operation will fail if there is an existing user                                             //
 * with a username only differing in case.                                                                             //
 * @locus Server                                                                                                       //
 * @param {String} userId The ID of the user to update.                                                                //
 * @param {String} newUsername A new username for the user.                                                            //
 * @importFromPackage accounts-base                                                                                    //
 */                                                                                                                    //
                                                                                                                       //
Accounts.setUsername = function (userId, newUsername) {                                                                // 398
  check(userId, NonEmptyString);                                                                                       // 399
  check(newUsername, NonEmptyString);                                                                                  // 400
  var user = Meteor.users.findOne(userId);                                                                             // 402
                                                                                                                       //
  if (!user) {                                                                                                         // 403
    handleError("User not found");                                                                                     // 404
  }                                                                                                                    // 405
                                                                                                                       //
  var oldUsername = user.username; // Perform a case insensitive check for duplicates before update                    // 407
                                                                                                                       //
  checkForCaseInsensitiveDuplicates('username', 'Username', newUsername, user._id);                                    // 410
  Meteor.users.update({                                                                                                // 412
    _id: user._id                                                                                                      // 412
  }, {                                                                                                                 // 412
    $set: {                                                                                                            // 412
      username: newUsername                                                                                            // 412
    }                                                                                                                  // 412
  }); // Perform another check after update, in case a matching user has been                                          // 412
  // inserted in the meantime                                                                                          // 415
                                                                                                                       //
  try {                                                                                                                // 416
    checkForCaseInsensitiveDuplicates('username', 'Username', newUsername, user._id);                                  // 417
  } catch (ex) {                                                                                                       // 418
    // Undo update if the check fails                                                                                  // 419
    Meteor.users.update({                                                                                              // 420
      _id: user._id                                                                                                    // 420
    }, {                                                                                                               // 420
      $set: {                                                                                                          // 420
        username: oldUsername                                                                                          // 420
      }                                                                                                                // 420
    });                                                                                                                // 420
    throw ex;                                                                                                          // 421
  }                                                                                                                    // 422
}; // Let the user change their own password if they know the old                                                      // 423
// password. `oldPassword` and `newPassword` should be objects with keys                                               // 426
// `digest` and `algorithm` (representing the SHA256 of the password).                                                 // 427
//                                                                                                                     // 428
// XXX COMPAT WITH 0.8.1.3                                                                                             // 429
// Like the login method, if the user hasn't been upgraded from SRP to                                                 // 430
// bcrypt yet, then this method will throw an 'old password format'                                                    // 431
// error. The client should call the SRP upgrade login handler and then                                                // 432
// retry this method again.                                                                                            // 433
//                                                                                                                     // 434
// UNLIKE the login method, there is no way to avoid getting SRP upgrade                                               // 435
// errors thrown. The reasoning for this is that clients using this                                                    // 436
// method directly will need to be updated anyway because we no longer                                                 // 437
// support the SRP flow that they would have been doing to use this                                                    // 438
// method previously.                                                                                                  // 439
                                                                                                                       //
                                                                                                                       //
Meteor.methods({                                                                                                       // 440
  changePassword: function (oldPassword, newPassword) {                                                                // 440
    check(oldPassword, passwordValidator);                                                                             // 441
    check(newPassword, passwordValidator);                                                                             // 442
                                                                                                                       //
    if (!this.userId) {                                                                                                // 444
      throw new Meteor.Error(401, "Must be logged in");                                                                // 445
    }                                                                                                                  // 446
                                                                                                                       //
    var user = Meteor.users.findOne(this.userId);                                                                      // 448
                                                                                                                       //
    if (!user) {                                                                                                       // 449
      handleError("User not found");                                                                                   // 450
    }                                                                                                                  // 451
                                                                                                                       //
    if (!user.services || !user.services.password || !user.services.password.bcrypt && !user.services.password.srp) {  // 453
      handleError("User has no password set");                                                                         // 455
    }                                                                                                                  // 456
                                                                                                                       //
    if (!user.services.password.bcrypt) {                                                                              // 458
      throw new Meteor.Error(400, "old password format", EJSON.stringify({                                             // 459
        format: 'srp',                                                                                                 // 460
        identity: user.services.password.srp.identity                                                                  // 461
      }));                                                                                                             // 459
    }                                                                                                                  // 463
                                                                                                                       //
    var result = checkPassword(user, oldPassword);                                                                     // 465
                                                                                                                       //
    if (result.error) {                                                                                                // 466
      throw result.error;                                                                                              // 467
    }                                                                                                                  // 468
                                                                                                                       //
    var hashed = hashPassword(newPassword); // It would be better if this removed ALL existing tokens and replaced     // 470
    // the token for the current connection with a new one, but that would                                             // 473
    // be tricky, so we'll settle for just replacing all tokens other than                                             // 474
    // the one for the current connection.                                                                             // 475
                                                                                                                       //
    var currentToken = Accounts._getLoginToken(this.connection.id);                                                    // 476
                                                                                                                       //
    Meteor.users.update({                                                                                              // 477
      _id: this.userId                                                                                                 // 478
    }, {                                                                                                               // 478
      $set: {                                                                                                          // 480
        'services.password.bcrypt': hashed                                                                             // 480
      },                                                                                                               // 480
      $pull: {                                                                                                         // 481
        'services.resume.loginTokens': {                                                                               // 482
          hashedToken: {                                                                                               // 482
            $ne: currentToken                                                                                          // 482
          }                                                                                                            // 482
        }                                                                                                              // 482
      },                                                                                                               // 481
      $unset: {                                                                                                        // 484
        'services.password.reset': 1                                                                                   // 484
      }                                                                                                                // 484
    });                                                                                                                // 479
    return {                                                                                                           // 488
      passwordChanged: true                                                                                            // 488
    };                                                                                                                 // 488
  }                                                                                                                    // 489
}); // Force change the users password.                                                                                // 440
/**                                                                                                                    // 494
 * @summary Forcibly change the password for a user.                                                                   //
 * @locus Server                                                                                                       //
 * @param {String} userId The id of the user to update.                                                                //
 * @param {String} newPassword A new password for the user.                                                            //
 * @param {Object} [options]                                                                                           //
 * @param {Object} options.logout Logout all current connections with this userId (default: true)                      //
 * @importFromPackage accounts-base                                                                                    //
 */                                                                                                                    //
                                                                                                                       //
Accounts.setPassword = function (userId, newPlaintextPassword, options) {                                              // 503
  options = _.extend({                                                                                                 // 504
    logout: true                                                                                                       // 504
  }, options);                                                                                                         // 504
  var user = Meteor.users.findOne(userId);                                                                             // 506
                                                                                                                       //
  if (!user) {                                                                                                         // 507
    throw new Meteor.Error(403, "User not found");                                                                     // 508
  }                                                                                                                    // 509
                                                                                                                       //
  var update = {                                                                                                       // 511
    $unset: {                                                                                                          // 512
      'services.password.srp': 1,                                                                                      // 513
      // XXX COMPAT WITH 0.8.1.3                                                                                       // 513
      'services.password.reset': 1                                                                                     // 514
    },                                                                                                                 // 512
    $set: {                                                                                                            // 516
      'services.password.bcrypt': hashPassword(newPlaintextPassword)                                                   // 516
    }                                                                                                                  // 516
  };                                                                                                                   // 511
                                                                                                                       //
  if (options.logout) {                                                                                                // 519
    update.$unset['services.resume.loginTokens'] = 1;                                                                  // 520
  }                                                                                                                    // 521
                                                                                                                       //
  Meteor.users.update({                                                                                                // 523
    _id: user._id                                                                                                      // 523
  }, update);                                                                                                          // 523
}; ///                                                                                                                 // 524
/// RESETTING VIA EMAIL                                                                                                // 528
///                                                                                                                    // 529
// Method called by a user to request a password reset email. This is                                                  // 531
// the start of the reset process.                                                                                     // 532
                                                                                                                       //
                                                                                                                       //
Meteor.methods({                                                                                                       // 533
  forgotPassword: function (options) {                                                                                 // 533
    check(options, {                                                                                                   // 534
      email: String                                                                                                    // 534
    });                                                                                                                // 534
    var user = Accounts.findUserByEmail(options.email);                                                                // 536
                                                                                                                       //
    if (!user) {                                                                                                       // 537
      handleError("User not found");                                                                                   // 538
    }                                                                                                                  // 539
                                                                                                                       //
    var emails = _.pluck(user.emails || [], 'address');                                                                // 541
                                                                                                                       //
    var caseSensitiveEmail = _.find(emails, function (email) {                                                         // 542
      return email.toLowerCase() === options.email.toLowerCase();                                                      // 543
    });                                                                                                                // 544
                                                                                                                       //
    Accounts.sendResetPasswordEmail(user._id, caseSensitiveEmail);                                                     // 546
  }                                                                                                                    // 547
}); // send the user an email with a link that when opened allows the user                                             // 533
// to set a new password, without the old password.                                                                    // 550
/**                                                                                                                    // 552
 * @summary Send an email with a link the user can use to reset their password.                                        //
 * @locus Server                                                                                                       //
 * @param {String} userId The id of the user to send email to.                                                         //
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first email in the list.
 * @importFromPackage accounts-base                                                                                    //
 */                                                                                                                    //
                                                                                                                       //
Accounts.sendResetPasswordEmail = function (userId, email) {                                                           // 559
  // Make sure the user exists, and email is one of their addresses.                                                   // 560
  var user = Meteor.users.findOne(userId);                                                                             // 561
                                                                                                                       //
  if (!user) {                                                                                                         // 562
    handleError("Can't find user");                                                                                    // 563
  } // pick the first email if we weren't passed an email.                                                             // 564
                                                                                                                       //
                                                                                                                       //
  if (!email && user.emails && user.emails[0]) {                                                                       // 567
    email = user.emails[0].address;                                                                                    // 568
  } // make sure we have a valid email                                                                                 // 569
                                                                                                                       //
                                                                                                                       //
  if (!email || !_.contains(_.pluck(user.emails || [], 'address'), email)) {                                           // 572
    handleError("No such email for user.");                                                                            // 573
  }                                                                                                                    // 574
                                                                                                                       //
  var token = Random.secret();                                                                                         // 576
  var when = new Date();                                                                                               // 577
  var tokenRecord = {                                                                                                  // 578
    token: token,                                                                                                      // 579
    email: email,                                                                                                      // 580
    when: when,                                                                                                        // 581
    reason: 'reset'                                                                                                    // 582
  };                                                                                                                   // 578
  Meteor.users.update(userId, {                                                                                        // 584
    $set: {                                                                                                            // 584
      "services.password.reset": tokenRecord                                                                           // 585
    }                                                                                                                  // 584
  }); // before passing to template, update user object with new token                                                 // 584
                                                                                                                       //
  Meteor._ensure(user, 'services', 'password').reset = tokenRecord;                                                    // 588
  var resetPasswordUrl = Accounts.urls.resetPassword(token);                                                           // 590
  var options = {                                                                                                      // 592
    to: email,                                                                                                         // 593
    from: Accounts.emailTemplates.resetPassword.from ? Accounts.emailTemplates.resetPassword.from(user) : Accounts.emailTemplates.from,
    subject: Accounts.emailTemplates.resetPassword.subject(user)                                                       // 597
  };                                                                                                                   // 592
                                                                                                                       //
  if (typeof Accounts.emailTemplates.resetPassword.text === 'function') {                                              // 600
    options.text = Accounts.emailTemplates.resetPassword.text(user, resetPasswordUrl);                                 // 601
  }                                                                                                                    // 603
                                                                                                                       //
  if (typeof Accounts.emailTemplates.resetPassword.html === 'function') {                                              // 605
    options.html = Accounts.emailTemplates.resetPassword.html(user, resetPasswordUrl);                                 // 606
  }                                                                                                                    // 608
                                                                                                                       //
  if ((0, _typeof3.default)(Accounts.emailTemplates.headers) === 'object') {                                           // 610
    options.headers = Accounts.emailTemplates.headers;                                                                 // 611
  }                                                                                                                    // 612
                                                                                                                       //
  Email.send(options);                                                                                                 // 614
}; // send the user an email informing them that their account was created, with                                       // 615
// a link that when opened both marks their email as verified and forces them                                          // 618
// to choose their password. The email must be one of the addresses in the                                             // 619
// user's emails field, or undefined to pick the first email automatically.                                            // 620
//                                                                                                                     // 621
// This is not called automatically. It must be called manually if you                                                 // 622
// want to use enrollment emails.                                                                                      // 623
/**                                                                                                                    // 625
 * @summary Send an email with a link the user can use to set their initial password.                                  //
 * @locus Server                                                                                                       //
 * @param {String} userId The id of the user to send email to.                                                         //
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first email in the list.
 * @importFromPackage accounts-base                                                                                    //
 */                                                                                                                    //
                                                                                                                       //
Accounts.sendEnrollmentEmail = function (userId, email) {                                                              // 632
  // XXX refactor! This is basically identical to sendResetPasswordEmail.                                              // 633
  // Make sure the user exists, and email is in their addresses.                                                       // 635
  var user = Meteor.users.findOne(userId);                                                                             // 636
                                                                                                                       //
  if (!user) {                                                                                                         // 637
    throw new Error("Can't find user");                                                                                // 638
  } // pick the first email if we weren't passed an email.                                                             // 639
                                                                                                                       //
                                                                                                                       //
  if (!email && user.emails && user.emails[0]) {                                                                       // 641
    email = user.emails[0].address;                                                                                    // 642
  } // make sure we have a valid email                                                                                 // 643
                                                                                                                       //
                                                                                                                       //
  if (!email || !_.contains(_.pluck(user.emails || [], 'address'), email)) {                                           // 645
    throw new Error("No such email for user.");                                                                        // 646
  }                                                                                                                    // 647
                                                                                                                       //
  var token = Random.secret();                                                                                         // 649
  var when = new Date();                                                                                               // 650
  var tokenRecord = {                                                                                                  // 651
    token: token,                                                                                                      // 652
    email: email,                                                                                                      // 653
    when: when,                                                                                                        // 654
    reason: 'enroll'                                                                                                   // 655
  };                                                                                                                   // 651
  Meteor.users.update(userId, {                                                                                        // 657
    $set: {                                                                                                            // 657
      "services.password.reset": tokenRecord                                                                           // 658
    }                                                                                                                  // 657
  }); // before passing to template, update user object with new token                                                 // 657
                                                                                                                       //
  Meteor._ensure(user, 'services', 'password').reset = tokenRecord;                                                    // 662
  var enrollAccountUrl = Accounts.urls.enrollAccount(token);                                                           // 664
  var options = {                                                                                                      // 666
    to: email,                                                                                                         // 667
    from: Accounts.emailTemplates.enrollAccount.from ? Accounts.emailTemplates.enrollAccount.from(user) : Accounts.emailTemplates.from,
    subject: Accounts.emailTemplates.enrollAccount.subject(user)                                                       // 671
  };                                                                                                                   // 666
                                                                                                                       //
  if (typeof Accounts.emailTemplates.enrollAccount.text === 'function') {                                              // 674
    options.text = Accounts.emailTemplates.enrollAccount.text(user, enrollAccountUrl);                                 // 675
  }                                                                                                                    // 677
                                                                                                                       //
  if (typeof Accounts.emailTemplates.enrollAccount.html === 'function') {                                              // 679
    options.html = Accounts.emailTemplates.enrollAccount.html(user, enrollAccountUrl);                                 // 680
  }                                                                                                                    // 682
                                                                                                                       //
  if ((0, _typeof3.default)(Accounts.emailTemplates.headers) === 'object') {                                           // 684
    options.headers = Accounts.emailTemplates.headers;                                                                 // 685
  }                                                                                                                    // 686
                                                                                                                       //
  Email.send(options);                                                                                                 // 688
}; // Take token from sendResetPasswordEmail or sendEnrollmentEmail, change                                            // 689
// the users password, and log them in.                                                                                // 693
                                                                                                                       //
                                                                                                                       //
Meteor.methods({                                                                                                       // 694
  resetPassword: function (token, newPassword) {                                                                       // 694
    var self = this;                                                                                                   // 695
    return Accounts._loginMethod(self, "resetPassword", arguments, "password", function () {                           // 696
      check(token, String);                                                                                            // 702
      check(newPassword, passwordValidator);                                                                           // 703
      var user = Meteor.users.findOne({                                                                                // 705
        "services.password.reset.token": token                                                                         // 706
      });                                                                                                              // 705
                                                                                                                       //
      if (!user) {                                                                                                     // 707
        throw new Meteor.Error(403, "Token expired");                                                                  // 708
      }                                                                                                                // 709
                                                                                                                       //
      var when = user.services.password.reset.when;                                                                    // 710
      var reason = user.services.password.reset.reason;                                                                // 711
                                                                                                                       //
      var tokenLifetimeMs = Accounts._getPasswordResetTokenLifetimeMs();                                               // 712
                                                                                                                       //
      if (reason === "enroll") {                                                                                       // 713
        tokenLifetimeMs = Accounts._getPasswordEnrollTokenLifetimeMs();                                                // 714
      }                                                                                                                // 715
                                                                                                                       //
      var currentTimeMs = Date.now();                                                                                  // 716
      if (currentTimeMs - when > tokenLifetimeMs) throw new Meteor.Error(403, "Token expired");                        // 717
      var email = user.services.password.reset.email;                                                                  // 719
      if (!_.include(_.pluck(user.emails || [], 'address'), email)) return {                                           // 720
        userId: user._id,                                                                                              // 722
        error: new Meteor.Error(403, "Token has invalid email address")                                                // 723
      };                                                                                                               // 721
      var hashed = hashPassword(newPassword); // NOTE: We're about to invalidate tokens on the user, who we might be   // 726
      // logged in as. Make sure to avoid logging ourselves out if this                                                // 729
      // happens. But also make sure not to leave the connection in a state                                            // 730
      // of having a bad token set if things fail.                                                                     // 731
                                                                                                                       //
      var oldToken = Accounts._getLoginToken(self.connection.id);                                                      // 732
                                                                                                                       //
      Accounts._setLoginToken(user._id, self.connection, null);                                                        // 733
                                                                                                                       //
      var resetToOldToken = function () {                                                                              // 734
        Accounts._setLoginToken(user._id, self.connection, oldToken);                                                  // 735
      };                                                                                                               // 736
                                                                                                                       //
      try {                                                                                                            // 738
        // Update the user record by:                                                                                  // 739
        // - Changing the password to the new one                                                                      // 740
        // - Forgetting about the reset token that was just used                                                       // 741
        // - Verifying their email, since they got the password reset via email.                                       // 742
        var affectedRecords = Meteor.users.update({                                                                    // 743
          _id: user._id,                                                                                               // 745
          'emails.address': email,                                                                                     // 746
          'services.password.reset.token': token                                                                       // 747
        }, {                                                                                                           // 744
          $set: {                                                                                                      // 749
            'services.password.bcrypt': hashed,                                                                        // 749
            'emails.$.verified': true                                                                                  // 750
          },                                                                                                           // 749
          $unset: {                                                                                                    // 751
            'services.password.reset': 1,                                                                              // 751
            'services.password.srp': 1                                                                                 // 752
          }                                                                                                            // 751
        });                                                                                                            // 749
        if (affectedRecords !== 1) return {                                                                            // 753
          userId: user._id,                                                                                            // 755
          error: new Meteor.Error(403, "Invalid email")                                                                // 756
        };                                                                                                             // 754
      } catch (err) {                                                                                                  // 758
        resetToOldToken();                                                                                             // 759
        throw err;                                                                                                     // 760
      } // Replace all valid login tokens with new ones (changing                                                      // 761
      // password should invalidate existing sessions).                                                                // 764
                                                                                                                       //
                                                                                                                       //
      Accounts._clearAllLoginTokens(user._id);                                                                         // 765
                                                                                                                       //
      return {                                                                                                         // 767
        userId: user._id                                                                                               // 767
      };                                                                                                               // 767
    });                                                                                                                // 768
  }                                                                                                                    // 770
}); ///                                                                                                                // 694
/// EMAIL VERIFICATION                                                                                                 // 773
///                                                                                                                    // 774
// send the user an email with a link that when opened marks that                                                      // 777
// address as verified                                                                                                 // 778
/**                                                                                                                    // 780
 * @summary Send an email with a link the user can use verify their email address.                                     //
 * @locus Server                                                                                                       //
 * @param {String} userId The id of the user to send email to.                                                         //
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first unverified email in the list.
 * @importFromPackage accounts-base                                                                                    //
 */                                                                                                                    //
                                                                                                                       //
Accounts.sendVerificationEmail = function (userId, address) {                                                          // 787
  // XXX Also generate a link using which someone can delete this                                                      // 788
  // account if they own said address but weren't those who created                                                    // 789
  // this account.                                                                                                     // 790
  // Make sure the user exists, and address is one of their addresses.                                                 // 792
  var user = Meteor.users.findOne(userId);                                                                             // 793
  if (!user) throw new Error("Can't find user"); // pick the first unverified address if we weren't passed an address.
                                                                                                                       //
  if (!address) {                                                                                                      // 797
    var email = _.find(user.emails || [], function (e) {                                                               // 798
      return !e.verified;                                                                                              // 799
    });                                                                                                                // 799
                                                                                                                       //
    address = (email || {}).address;                                                                                   // 800
                                                                                                                       //
    if (!address) {                                                                                                    // 802
      throw new Error("That user has no unverified email addresses.");                                                 // 803
    }                                                                                                                  // 804
  } // make sure we have a valid address                                                                               // 805
                                                                                                                       //
                                                                                                                       //
  if (!address || !_.contains(_.pluck(user.emails || [], 'address'), address)) throw new Error("No such email address for user.");
  var tokenRecord = {                                                                                                  // 811
    token: Random.secret(),                                                                                            // 812
    address: address,                                                                                                  // 813
    when: new Date()                                                                                                   // 814
  };                                                                                                                   // 811
  Meteor.users.update({                                                                                                // 815
    _id: userId                                                                                                        // 816
  }, {                                                                                                                 // 816
    $push: {                                                                                                           // 817
      'services.email.verificationTokens': tokenRecord                                                                 // 817
    }                                                                                                                  // 817
  }); // before passing to template, update user object with new token                                                 // 817
                                                                                                                       //
  Meteor._ensure(user, 'services', 'email');                                                                           // 820
                                                                                                                       //
  if (!user.services.email.verificationTokens) {                                                                       // 821
    user.services.email.verificationTokens = [];                                                                       // 822
  }                                                                                                                    // 823
                                                                                                                       //
  user.services.email.verificationTokens.push(tokenRecord);                                                            // 824
  var verifyEmailUrl = Accounts.urls.verifyEmail(tokenRecord.token);                                                   // 826
  var options = {                                                                                                      // 828
    to: address,                                                                                                       // 829
    from: Accounts.emailTemplates.verifyEmail.from ? Accounts.emailTemplates.verifyEmail.from(user) : Accounts.emailTemplates.from,
    subject: Accounts.emailTemplates.verifyEmail.subject(user)                                                         // 833
  };                                                                                                                   // 828
                                                                                                                       //
  if (typeof Accounts.emailTemplates.verifyEmail.text === 'function') {                                                // 836
    options.text = Accounts.emailTemplates.verifyEmail.text(user, verifyEmailUrl);                                     // 837
  }                                                                                                                    // 839
                                                                                                                       //
  if (typeof Accounts.emailTemplates.verifyEmail.html === 'function') options.html = Accounts.emailTemplates.verifyEmail.html(user, verifyEmailUrl);
                                                                                                                       //
  if ((0, _typeof3.default)(Accounts.emailTemplates.headers) === 'object') {                                           // 845
    options.headers = Accounts.emailTemplates.headers;                                                                 // 846
  }                                                                                                                    // 847
                                                                                                                       //
  Email.send(options);                                                                                                 // 849
}; // Take token from sendVerificationEmail, mark the email as verified,                                               // 850
// and log them in.                                                                                                    // 853
                                                                                                                       //
                                                                                                                       //
Meteor.methods({                                                                                                       // 854
  verifyEmail: function (token) {                                                                                      // 854
    var self = this;                                                                                                   // 855
    return Accounts._loginMethod(self, "verifyEmail", arguments, "password", function () {                             // 856
      check(token, String);                                                                                            // 862
      var user = Meteor.users.findOne({                                                                                // 864
        'services.email.verificationTokens.token': token                                                               // 865
      });                                                                                                              // 865
      if (!user) throw new Meteor.Error(403, "Verify email link expired");                                             // 866
                                                                                                                       //
      var tokenRecord = _.find(user.services.email.verificationTokens, function (t) {                                  // 869
        return t.token == token;                                                                                       // 871
      });                                                                                                              // 872
                                                                                                                       //
      if (!tokenRecord) return {                                                                                       // 873
        userId: user._id,                                                                                              // 875
        error: new Meteor.Error(403, "Verify email link expired")                                                      // 876
      };                                                                                                               // 874
                                                                                                                       //
      var emailsRecord = _.find(user.emails, function (e) {                                                            // 879
        return e.address == tokenRecord.address;                                                                       // 880
      });                                                                                                              // 881
                                                                                                                       //
      if (!emailsRecord) return {                                                                                      // 882
        userId: user._id,                                                                                              // 884
        error: new Meteor.Error(403, "Verify email link is for unknown address")                                       // 885
      }; // By including the address in the query, we can use 'emails.$' in the                                        // 883
      // modifier to get a reference to the specific object in the emails                                              // 889
      // array. See                                                                                                    // 890
      // http://www.mongodb.org/display/DOCS/Updating/#Updating-The%24positionaloperator)                              // 891
      // http://www.mongodb.org/display/DOCS/Updating#Updating-%24pull                                                 // 892
                                                                                                                       //
      Meteor.users.update({                                                                                            // 893
        _id: user._id,                                                                                                 // 894
        'emails.address': tokenRecord.address                                                                          // 895
      }, {                                                                                                             // 894
        $set: {                                                                                                        // 896
          'emails.$.verified': true                                                                                    // 896
        },                                                                                                             // 896
        $pull: {                                                                                                       // 897
          'services.email.verificationTokens': {                                                                       // 897
            address: tokenRecord.address                                                                               // 897
          }                                                                                                            // 897
        }                                                                                                              // 897
      });                                                                                                              // 896
      return {                                                                                                         // 899
        userId: user._id                                                                                               // 899
      };                                                                                                               // 899
    });                                                                                                                // 900
  }                                                                                                                    // 902
}); /**                                                                                                                // 854
     * @summary Add an email address for a user. Use this instead of directly                                          //
     * updating the database. The operation will fail if there is a different user                                     //
     * with an email only differing in case. If the specified user has an existing                                     //
     * email only differing in case however, we replace it.                                                            //
     * @locus Server                                                                                                   //
     * @param {String} userId The ID of the user to update.                                                            //
     * @param {String} newEmail A new email address for the user.                                                      //
     * @param {Boolean} [verified] Optional - whether the new email address should                                     //
     * be marked as verified. Defaults to false.                                                                       //
     * @importFromPackage accounts-base                                                                                //
     */                                                                                                                //
                                                                                                                       //
Accounts.addEmail = function (userId, newEmail, verified) {                                                            // 916
  check(userId, NonEmptyString);                                                                                       // 917
  check(newEmail, NonEmptyString);                                                                                     // 918
  check(verified, Match.Optional(Boolean));                                                                            // 919
                                                                                                                       //
  if (_.isUndefined(verified)) {                                                                                       // 921
    verified = false;                                                                                                  // 922
  }                                                                                                                    // 923
                                                                                                                       //
  var user = Meteor.users.findOne(userId);                                                                             // 925
  if (!user) throw new Meteor.Error(403, "User not found"); // Allow users to change their own email to a version with a different case
  // We don't have to call checkForCaseInsensitiveDuplicates to do a case                                              // 931
  // insensitive check across all emails in the database here because: (1) if                                          // 932
  // there is no case-insensitive duplicate between this user and other users,                                         // 933
  // then we are OK and (2) if this would create a conflict with other users                                           // 934
  // then there would already be a case-insensitive duplicate and we can't fix                                         // 935
  // that in this code anyway.                                                                                         // 936
                                                                                                                       //
  var caseInsensitiveRegExp = new RegExp('^' + Meteor._escapeRegExp(newEmail) + '$', 'i');                             // 937
                                                                                                                       //
  var didUpdateOwnEmail = _.any(user.emails, function (email, index) {                                                 // 940
    if (caseInsensitiveRegExp.test(email.address)) {                                                                   // 941
      Meteor.users.update({                                                                                            // 942
        _id: user._id,                                                                                                 // 943
        'emails.address': email.address                                                                                // 944
      }, {                                                                                                             // 942
        $set: {                                                                                                        // 945
          'emails.$.address': newEmail,                                                                                // 946
          'emails.$.verified': verified                                                                                // 947
        }                                                                                                              // 945
      });                                                                                                              // 945
      return true;                                                                                                     // 949
    }                                                                                                                  // 950
                                                                                                                       //
    return false;                                                                                                      // 952
  }); // In the other updates below, we have to do another call to                                                     // 953
  // checkForCaseInsensitiveDuplicates to make sure that no conflicting values                                         // 956
  // were added to the database in the meantime. We don't have to do this for                                          // 957
  // the case where the user is updating their email address to one that is the                                        // 958
  // same as before, but only different because of capitalization. Read the                                            // 959
  // big comment above to understand why.                                                                              // 960
                                                                                                                       //
                                                                                                                       //
  if (didUpdateOwnEmail) {                                                                                             // 962
    return;                                                                                                            // 963
  } // Perform a case insensitive check for duplicates before update                                                   // 964
                                                                                                                       //
                                                                                                                       //
  checkForCaseInsensitiveDuplicates('emails.address', 'Email', newEmail, user._id);                                    // 967
  Meteor.users.update({                                                                                                // 969
    _id: user._id                                                                                                      // 970
  }, {                                                                                                                 // 969
    $addToSet: {                                                                                                       // 972
      emails: {                                                                                                        // 973
        address: newEmail,                                                                                             // 974
        verified: verified                                                                                             // 975
      }                                                                                                                // 973
    }                                                                                                                  // 972
  }); // Perform another check after update, in case a matching user has been                                          // 971
  // inserted in the meantime                                                                                          // 981
                                                                                                                       //
  try {                                                                                                                // 982
    checkForCaseInsensitiveDuplicates('emails.address', 'Email', newEmail, user._id);                                  // 983
  } catch (ex) {                                                                                                       // 984
    // Undo update if the check fails                                                                                  // 985
    Meteor.users.update({                                                                                              // 986
      _id: user._id                                                                                                    // 986
    }, {                                                                                                               // 986
      $pull: {                                                                                                         // 987
        emails: {                                                                                                      // 987
          address: newEmail                                                                                            // 987
        }                                                                                                              // 987
      }                                                                                                                // 987
    });                                                                                                                // 987
    throw ex;                                                                                                          // 988
  }                                                                                                                    // 989
}; /**                                                                                                                 // 990
    * @summary Remove an email address for a user. Use this instead of updating                                        //
    * the database directly.                                                                                           //
    * @locus Server                                                                                                    //
    * @param {String} userId The ID of the user to update.                                                             //
    * @param {String} email The email address to remove.                                                               //
    * @importFromPackage accounts-base                                                                                 //
    */                                                                                                                 //
                                                                                                                       //
Accounts.removeEmail = function (userId, email) {                                                                      // 1000
  check(userId, NonEmptyString);                                                                                       // 1001
  check(email, NonEmptyString);                                                                                        // 1002
  var user = Meteor.users.findOne(userId);                                                                             // 1004
  if (!user) throw new Meteor.Error(403, "User not found");                                                            // 1005
  Meteor.users.update({                                                                                                // 1008
    _id: user._id                                                                                                      // 1008
  }, {                                                                                                                 // 1008
    $pull: {                                                                                                           // 1009
      emails: {                                                                                                        // 1009
        address: email                                                                                                 // 1009
      }                                                                                                                // 1009
    }                                                                                                                  // 1009
  });                                                                                                                  // 1009
}; ///                                                                                                                 // 1010
/// CREATING USERS                                                                                                     // 1013
///                                                                                                                    // 1014
// Shared createUser function called from the createUser method, both                                                  // 1016
// if originates in client or server code. Calls user provided hooks,                                                  // 1017
// does the actual user insertion.                                                                                     // 1018
//                                                                                                                     // 1019
// returns the user id                                                                                                 // 1020
                                                                                                                       //
                                                                                                                       //
var createUser = function (options) {                                                                                  // 1021
  // Unknown keys allowed, because a onCreateUserHook can take arbitrary                                               // 1022
  // options.                                                                                                          // 1023
  check(options, Match.ObjectIncluding({                                                                               // 1024
    username: Match.Optional(String),                                                                                  // 1025
    email: Match.Optional(String),                                                                                     // 1026
    password: Match.Optional(passwordValidator)                                                                        // 1027
  }));                                                                                                                 // 1024
  var username = options.username;                                                                                     // 1030
  var email = options.email;                                                                                           // 1031
  if (!username && !email) throw new Meteor.Error(400, "Need to set a username or email");                             // 1032
  var user = {                                                                                                         // 1035
    services: {}                                                                                                       // 1035
  };                                                                                                                   // 1035
                                                                                                                       //
  if (options.password) {                                                                                              // 1036
    var hashed = hashPassword(options.password);                                                                       // 1037
    user.services.password = {                                                                                         // 1038
      bcrypt: hashed                                                                                                   // 1038
    };                                                                                                                 // 1038
  }                                                                                                                    // 1039
                                                                                                                       //
  if (username) user.username = username;                                                                              // 1041
  if (email) user.emails = [{                                                                                          // 1043
    address: email,                                                                                                    // 1044
    verified: false                                                                                                    // 1044
  }]; // Perform a case insensitive check before insert                                                                // 1044
                                                                                                                       //
  checkForCaseInsensitiveDuplicates('username', 'Username', username);                                                 // 1047
  checkForCaseInsensitiveDuplicates('emails.address', 'Email', email);                                                 // 1048
  var userId = Accounts.insertUserDoc(options, user); // Perform another check after insert, in case a matching user has been
  // inserted in the meantime                                                                                          // 1052
                                                                                                                       //
  try {                                                                                                                // 1053
    checkForCaseInsensitiveDuplicates('username', 'Username', username, userId);                                       // 1054
    checkForCaseInsensitiveDuplicates('emails.address', 'Email', email, userId);                                       // 1055
  } catch (ex) {                                                                                                       // 1056
    // Remove inserted user if the check fails                                                                         // 1057
    Meteor.users.remove(userId);                                                                                       // 1058
    throw ex;                                                                                                          // 1059
  }                                                                                                                    // 1060
                                                                                                                       //
  return userId;                                                                                                       // 1061
}; // method for create user. Requests come from the client.                                                           // 1062
                                                                                                                       //
                                                                                                                       //
Meteor.methods({                                                                                                       // 1065
  createUser: function (options) {                                                                                     // 1065
    var self = this;                                                                                                   // 1066
    return Accounts._loginMethod(self, "createUser", arguments, "password", function () {                              // 1067
      // createUser() above does more checking.                                                                        // 1073
      check(options, Object);                                                                                          // 1074
      if (Accounts._options.forbidClientAccountCreation) return {                                                      // 1075
        error: new Meteor.Error(403, "Signups forbidden")                                                              // 1077
      }; // Create user. result contains id and token.                                                                 // 1076
                                                                                                                       //
      var userId = createUser(options); // safety belt. createUser is supposed to throw on error. send 500 error       // 1081
      // instead of sending a verification email with empty userid.                                                    // 1083
                                                                                                                       //
      if (!userId) throw new Error("createUser failed to insert new user"); // If `Accounts._options.sendVerificationEmail` is set, register
      // a token to verify the user's primary email, and send it to                                                    // 1088
      // that address.                                                                                                 // 1089
                                                                                                                       //
      if (options.email && Accounts._options.sendVerificationEmail) Accounts.sendVerificationEmail(userId, options.email); // client gets logged in as the new user afterwards.
                                                                                                                       //
      return {                                                                                                         // 1094
        userId: userId                                                                                                 // 1094
      };                                                                                                               // 1094
    });                                                                                                                // 1095
  }                                                                                                                    // 1097
}); // Create user directly on the server.                                                                             // 1065
//                                                                                                                     // 1100
// Unlike the client version, this does not log you in as this user                                                    // 1101
// after creation.                                                                                                     // 1102
//                                                                                                                     // 1103
// returns userId or throws an error if it can't create                                                                // 1104
//                                                                                                                     // 1105
// XXX add another argument ("server options") that gets sent to onCreateUser,                                         // 1106
// which is always empty when called from the createUser method? eg, "admin:                                           // 1107
// true", which we want to prevent the client from setting, but which a custom                                         // 1108
// method calling Accounts.createUser could set?                                                                       // 1109
//                                                                                                                     // 1110
                                                                                                                       //
Accounts.createUser = function (options, callback) {                                                                   // 1111
  options = _.clone(options); // XXX allow an optional callback?                                                       // 1112
                                                                                                                       //
  if (callback) {                                                                                                      // 1115
    throw new Error("Accounts.createUser with callback not supported on the server yet.");                             // 1116
  }                                                                                                                    // 1117
                                                                                                                       //
  return createUser(options);                                                                                          // 1119
}; ///                                                                                                                 // 1120
/// PASSWORD-SPECIFIC INDEXES ON USERS                                                                                 // 1123
///                                                                                                                    // 1124
                                                                                                                       //
                                                                                                                       //
Meteor.users._ensureIndex('services.email.verificationTokens.token', {                                                 // 1125
  unique: 1,                                                                                                           // 1126
  sparse: 1                                                                                                            // 1126
});                                                                                                                    // 1126
                                                                                                                       //
Meteor.users._ensureIndex('services.password.reset.token', {                                                           // 1127
  unique: 1,                                                                                                           // 1128
  sparse: 1                                                                                                            // 1128
});                                                                                                                    // 1128
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/accounts-password/email_templates.js");
require("./node_modules/meteor/accounts-password/password_server.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['accounts-password'] = {};

})();

//# sourceMappingURL=accounts-password.js.map
