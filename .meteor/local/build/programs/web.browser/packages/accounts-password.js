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
var Accounts = Package['accounts-base'].Accounts;
var SRP = Package.srp.SRP;
var SHA256 = Package.sha.SHA256;
var EJSON = Package.ejson.EJSON;
var DDP = Package['ddp-client'].DDP;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-password":{"password_client.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/accounts-password/password_client.js                                                              //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
// Used in the various functions below to handle errors consistently                                          // 1
function reportError(error, callback) {                                                                       // 2
  if (callback) {                                                                                             // 3
    callback(error);                                                                                          // 4
  } else {                                                                                                    // 5
    throw error;                                                                                              // 6
  }                                                                                                           // 7
}                                                                                                             // 8
                                                                                                              //
; // Attempt to log in with a password.                                                                       // 8
//                                                                                                            // 11
// @param selector {String|Object} One of the following:                                                      // 12
//   - {username: (username)}                                                                                 // 13
//   - {email: (email)}                                                                                       // 14
//   - a string which may be a username or email, depending on whether                                        // 15
//     it contains "@".                                                                                       // 16
// @param password {String}                                                                                   // 17
// @param callback {Function(error|undefined)}                                                                // 18
/**                                                                                                           // 20
 * @summary Log the user in with a password.                                                                  //
 * @locus Client                                                                                              //
 * @param {Object | String} user                                                                              //
 *   Either a string interpreted as a username or an email; or an object with a                               //
 *   single key: `email`, `username` or `id`. Username or email match in a case                               //
 *   insensitive manner.                                                                                      //
 * @param {String} password The user's password.                                                              //
 * @param {Function} [callback] Optional callback.                                                            //
 *   Called with no arguments on success, or with a single `Error` argument                                   //
 *   on failure.                                                                                              //
 * @importFromPackage meteor                                                                                  //
 */                                                                                                           //
                                                                                                              //
Meteor.loginWithPassword = function (selector, password, callback) {                                          // 33
  if (typeof selector === 'string') if (selector.indexOf('@') === -1) selector = {                            // 34
    username: selector                                                                                        // 36
  };else selector = {                                                                                         // 36
    email: selector                                                                                           // 38
  };                                                                                                          // 38
  Accounts.callLoginMethod({                                                                                  // 40
    methodArguments: [{                                                                                       // 41
      user: selector,                                                                                         // 42
      password: Accounts._hashPassword(password)                                                              // 43
    }],                                                                                                       // 41
    userCallback: function (error, result) {                                                                  // 45
      if (error && error.error === 400 && error.reason === 'old password format') {                           // 46
        // The "reason" string should match the error thrown in the                                           // 48
        // password login handler in password_server.js.                                                      // 49
        // XXX COMPAT WITH 0.8.1.3                                                                            // 51
        // If this user's last login was with a previous version of                                           // 52
        // Meteor that used SRP, then the server throws this error to                                         // 53
        // indicate that we should try again. The error includes the                                          // 54
        // user's SRP identity. We provide a value derived from the                                           // 55
        // identity and the password to prove to the server that we know                                      // 56
        // the password without requiring a full SRP flow, as well as                                         // 57
        // SHA256(password), which the server bcrypts and stores in                                           // 58
        // place of the old SRP information for this user.                                                    // 59
        srpUpgradePath({                                                                                      // 60
          upgradeError: error,                                                                                // 61
          userSelector: selector,                                                                             // 62
          plaintextPassword: password                                                                         // 63
        }, callback);                                                                                         // 60
      } else if (error) {                                                                                     // 65
        reportError(error, callback);                                                                         // 67
      } else {                                                                                                // 68
        callback && callback();                                                                               // 69
      }                                                                                                       // 70
    }                                                                                                         // 71
  });                                                                                                         // 40
};                                                                                                            // 73
                                                                                                              //
Accounts._hashPassword = function (password) {                                                                // 75
  return {                                                                                                    // 76
    digest: SHA256(password),                                                                                 // 77
    algorithm: "sha-256"                                                                                      // 78
  };                                                                                                          // 76
}; // XXX COMPAT WITH 0.8.1.3                                                                                 // 80
// The server requested an upgrade from the old SRP password format,                                          // 83
// so supply the needed SRP identity to login. Options:                                                       // 84
//   - upgradeError: the error object that the server returned to tell                                        // 85
//     us to upgrade from SRP to bcrypt.                                                                      // 86
//   - userSelector: selector to retrieve the user object                                                     // 87
//   - plaintextPassword: the password as a string                                                            // 88
                                                                                                              //
                                                                                                              //
var srpUpgradePath = function (options, callback) {                                                           // 89
  var details;                                                                                                // 90
                                                                                                              //
  try {                                                                                                       // 91
    details = EJSON.parse(options.upgradeError.details);                                                      // 92
  } catch (e) {}                                                                                              // 93
                                                                                                              //
  if (!(details && details.format === 'srp')) {                                                               // 94
    reportError(new Meteor.Error(400, "Password is old. Please reset your " + "password."), callback);        // 95
  } else {                                                                                                    // 98
    Accounts.callLoginMethod({                                                                                // 99
      methodArguments: [{                                                                                     // 100
        user: options.userSelector,                                                                           // 101
        srp: SHA256(details.identity + ":" + options.plaintextPassword),                                      // 102
        password: Accounts._hashPassword(options.plaintextPassword)                                           // 103
      }],                                                                                                     // 100
      userCallback: callback                                                                                  // 105
    });                                                                                                       // 99
  }                                                                                                           // 107
}; // Attempt to log in as a new user.                                                                        // 108
/**                                                                                                           // 112
 * @summary Create a new user.                                                                                //
 * @locus Anywhere                                                                                            //
 * @param {Object} options                                                                                    //
 * @param {String} options.username A unique name for this user.                                              //
 * @param {String} options.email The user's email address.                                                    //
 * @param {String} options.password The user's password. This is __not__ sent in plain text over the wire.    //
 * @param {Object} options.profile The user's profile, typically including the `name` field.                  //
 * @param {Function} [callback] Client only, optional callback. Called with no arguments on success, or with a single `Error` argument on failure.
 * @importFromPackage accounts-base                                                                           //
 */                                                                                                           //
                                                                                                              //
Accounts.createUser = function (options, callback) {                                                          // 123
  options = _.clone(options); // we'll be modifying options                                                   // 124
                                                                                                              //
  if (typeof options.password !== 'string') throw new Error("options.password must be a string");             // 126
                                                                                                              //
  if (!options.password) {                                                                                    // 128
    return reportError(new Meteor.Error(400, "Password may not be empty"), callback);                         // 129
  } // Replace password with the hashed password.                                                             // 130
                                                                                                              //
                                                                                                              //
  options.password = Accounts._hashPassword(options.password);                                                // 133
  Accounts.callLoginMethod({                                                                                  // 135
    methodName: 'createUser',                                                                                 // 136
    methodArguments: [options],                                                                               // 137
    userCallback: callback                                                                                    // 138
  });                                                                                                         // 135
}; // Change password. Must be logged in.                                                                     // 140
//                                                                                                            // 143
// @param oldPassword {String|null} By default servers no longer allow                                        // 144
//   changing password without the old password, but they could so we                                         // 145
//   support passing no password to the server and letting it decide.                                         // 146
// @param newPassword {String}                                                                                // 147
// @param callback {Function(error|undefined)}                                                                // 148
/**                                                                                                           // 150
 * @summary Change the current user's password. Must be logged in.                                            //
 * @locus Client                                                                                              //
 * @param {String} oldPassword The user's current password. This is __not__ sent in plain text over the wire.
 * @param {String} newPassword A new password for the user. This is __not__ sent in plain text over the wire.
 * @param {Function} [callback] Optional callback. Called with no arguments on success, or with a single `Error` argument on failure.
 * @importFromPackage accounts-base                                                                           //
 */                                                                                                           //
                                                                                                              //
Accounts.changePassword = function (oldPassword, newPassword, callback) {                                     // 158
  if (!Meteor.user()) {                                                                                       // 159
    return reportError(new Error("Must be logged in to change password."), callback);                         // 160
  }                                                                                                           // 161
                                                                                                              //
  check(newPassword, String);                                                                                 // 163
                                                                                                              //
  if (!newPassword) {                                                                                         // 164
    return reportError(new Meteor.Error(400, "Password may not be empty"), callback);                         // 165
  }                                                                                                           // 166
                                                                                                              //
  Accounts.connection.apply('changePassword', [oldPassword ? Accounts._hashPassword(oldPassword) : null, Accounts._hashPassword(newPassword)], function (error, result) {
    if (error || !result) {                                                                                   // 173
      if (error && error.error === 400 && error.reason === 'old password format') {                           // 174
        // XXX COMPAT WITH 0.8.1.3                                                                            // 176
        // The server is telling us to upgrade from SRP to bcrypt, as                                         // 177
        // in Meteor.loginWithPassword.                                                                       // 178
        srpUpgradePath({                                                                                      // 179
          upgradeError: error,                                                                                // 180
          userSelector: {                                                                                     // 181
            id: Meteor.userId()                                                                               // 181
          },                                                                                                  // 181
          plaintextPassword: oldPassword                                                                      // 182
        }, function (err) {                                                                                   // 179
          if (err) {                                                                                          // 184
            reportError(err, callback);                                                                       // 185
          } else {                                                                                            // 186
            // Now that we've successfully migrated from srp to                                               // 187
            // bcrypt, try changing the password again.                                                       // 188
            Accounts.changePassword(oldPassword, newPassword, callback);                                      // 189
          }                                                                                                   // 190
        });                                                                                                   // 191
      } else {                                                                                                // 192
        // A normal error, not an error telling us to upgrade to bcrypt                                       // 193
        reportError(error || new Error("No result from changePassword."), callback);                          // 194
      }                                                                                                       // 196
    } else {                                                                                                  // 197
      callback && callback();                                                                                 // 198
    }                                                                                                         // 199
  });                                                                                                         // 200
}; // Sends an email to a user with a link that can be used to reset                                          // 202
// their password                                                                                             // 205
//                                                                                                            // 206
// @param options {Object}                                                                                    // 207
//   - email: (email)                                                                                         // 208
// @param callback (optional) {Function(error|undefined)}                                                     // 209
/**                                                                                                           // 211
 * @summary Request a forgot password email.                                                                  //
 * @locus Client                                                                                              //
 * @param {Object} options                                                                                    //
 * @param {String} options.email The email address to send a password reset link.                             //
 * @param {Function} [callback] Optional callback. Called with no arguments on success, or with a single `Error` argument on failure.
 * @importFromPackage accounts-base                                                                           //
 */                                                                                                           //
                                                                                                              //
Accounts.forgotPassword = function (options, callback) {                                                      // 219
  if (!options.email) {                                                                                       // 220
    return reportError(new Meteor.Error(400, "Must pass options.email"), callback);                           // 221
  }                                                                                                           // 222
                                                                                                              //
  if (callback) {                                                                                             // 224
    Accounts.connection.call("forgotPassword", options, callback);                                            // 225
  } else {                                                                                                    // 226
    Accounts.connection.call("forgotPassword", options);                                                      // 227
  }                                                                                                           // 228
}; // Resets a password based on a token originally created by                                                // 229
// Accounts.forgotPassword, and then logs in the matching user.                                               // 232
//                                                                                                            // 233
// @param token {String}                                                                                      // 234
// @param newPassword {String}                                                                                // 235
// @param callback (optional) {Function(error|undefined)}                                                     // 236
/**                                                                                                           // 238
 * @summary Reset the password for a user using a token received in email. Logs the user in afterwards.       //
 * @locus Client                                                                                              //
 * @param {String} token The token retrieved from the reset password URL.                                     //
 * @param {String} newPassword A new password for the user. This is __not__ sent in plain text over the wire.
 * @param {Function} [callback] Optional callback. Called with no arguments on success, or with a single `Error` argument on failure.
 * @importFromPackage accounts-base                                                                           //
 */                                                                                                           //
                                                                                                              //
Accounts.resetPassword = function (token, newPassword, callback) {                                            // 246
  check(token, String);                                                                                       // 247
  check(newPassword, String);                                                                                 // 248
                                                                                                              //
  if (!newPassword) {                                                                                         // 250
    return reportError(new Meteor.Error(400, "Password may not be empty"), callback);                         // 251
  }                                                                                                           // 252
                                                                                                              //
  Accounts.callLoginMethod({                                                                                  // 254
    methodName: 'resetPassword',                                                                              // 255
    methodArguments: [token, Accounts._hashPassword(newPassword)],                                            // 256
    userCallback: callback                                                                                    // 257
  });                                                                                                         // 254
}; // Verifies a user's email address based on a token originally                                             // 258
// created by Accounts.sendVerificationEmail                                                                  // 261
//                                                                                                            // 262
// @param token {String}                                                                                      // 263
// @param callback (optional) {Function(error|undefined)}                                                     // 264
/**                                                                                                           // 266
 * @summary Marks the user's email address as verified. Logs the user in afterwards.                          //
 * @locus Client                                                                                              //
 * @param {String} token The token retrieved from the verification URL.                                       //
 * @param {Function} [callback] Optional callback. Called with no arguments on success, or with a single `Error` argument on failure.
 * @importFromPackage accounts-base                                                                           //
 */                                                                                                           //
                                                                                                              //
Accounts.verifyEmail = function (token, callback) {                                                           // 273
  if (!token) {                                                                                               // 274
    return reportError(new Meteor.Error(400, "Need to pass token"), callback);                                // 275
  }                                                                                                           // 276
                                                                                                              //
  Accounts.callLoginMethod({                                                                                  // 278
    methodName: 'verifyEmail',                                                                                // 279
    methodArguments: [token],                                                                                 // 280
    userCallback: callback                                                                                    // 281
  });                                                                                                         // 278
};                                                                                                            // 282
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/accounts-password/password_client.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['accounts-password'] = {};

})();
