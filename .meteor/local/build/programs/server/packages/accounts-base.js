(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var Hook = Package['callback-hook'].Hook;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Accounts, EXPIRE_TOKENS_INTERVAL_MS, CONNECTION_CLOSE_DELAY_MS;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-base":{"server_main.js":["./accounts_server.js","./accounts_rate_limit.js","./url_server.js",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/accounts-base/server_main.js                                                                            //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.export({                                                                                                     // 1
  AccountsServer: function () {                                                                                     // 1
    return AccountsServer;                                                                                          // 1
  }                                                                                                                 // 1
});                                                                                                                 // 1
var AccountsServer = void 0;                                                                                        // 1
module.importSync("./accounts_server.js", {                                                                         // 1
  AccountsServer: function (v) {                                                                                    // 1
    AccountsServer = v;                                                                                             // 1
  }                                                                                                                 // 1
}, 0);                                                                                                              // 1
module.importSync("./accounts_rate_limit.js");                                                                      // 1
module.importSync("./url_server.js");                                                                               // 1
/**                                                                                                                 // 5
 * @namespace Accounts                                                                                              //
 * @summary The namespace for all server-side accounts-related methods.                                             //
 */Accounts = new AccountsServer(Meteor.server); // Users table. Don't use the normal autopublish, since we want to hide
// some fields. Code to autopublish this is in accounts_server.js.                                                  // 12
// XXX Allow users to configure this collection name.                                                               // 13
/**                                                                                                                 // 15
 * @summary A [Mongo.Collection](#collections) containing user documents.                                           //
 * @locus Anywhere                                                                                                  //
 * @type {Mongo.Collection}                                                                                         //
 * @importFromPackage meteor                                                                                        //
*/                                                                                                                  //
Meteor.users = Accounts.users;                                                                                      // 21
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"accounts_common.js":["babel-runtime/helpers/classCallCheck",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/accounts-base/accounts_common.js                                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                             //
                                                                                                                    //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                    //
                                                                                                                    //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                   //
                                                                                                                    //
module.export({                                                                                                     // 1
  AccountsCommon: function () {                                                                                     // 1
    return AccountsCommon;                                                                                          // 1
  }                                                                                                                 // 1
});                                                                                                                 // 1
                                                                                                                    //
var AccountsCommon = function () {                                                                                  //
  function AccountsCommon(options) {                                                                                // 11
    (0, _classCallCheck3.default)(this, AccountsCommon);                                                            // 11
    // Currently this is read directly by packages like accounts-password                                           // 12
    // and accounts-ui-unstyled.                                                                                    // 13
    this._options = {}; // Note that setting this.connection = null causes this.users to be a                       // 14
    // LocalCollection, which is not what we want.                                                                  // 17
                                                                                                                    //
    this.connection = undefined;                                                                                    // 18
                                                                                                                    //
    this._initConnection(options || {}); // There is an allow call in accounts_server.js that restricts writes to   // 19
    // this collection.                                                                                             // 22
                                                                                                                    //
                                                                                                                    //
    this.users = new Mongo.Collection("users", {                                                                    // 23
      _preventAutopublish: true,                                                                                    // 24
      connection: this.connection                                                                                   // 25
    }); // Callback exceptions are printed with Meteor._debug and ignored.                                          // 23
                                                                                                                    //
    this._onLoginHook = new Hook({                                                                                  // 29
      bindEnvironment: false,                                                                                       // 30
      debugPrintExceptions: "onLogin callback"                                                                      // 31
    });                                                                                                             // 29
    this._onLoginFailureHook = new Hook({                                                                           // 34
      bindEnvironment: false,                                                                                       // 35
      debugPrintExceptions: "onLoginFailure callback"                                                               // 36
    });                                                                                                             // 34
    this._onLogoutHook = new Hook({                                                                                 // 39
      bindEnvironment: false,                                                                                       // 40
      debugPrintExceptions: "onLogout callback"                                                                     // 41
    });                                                                                                             // 39
  } /**                                                                                                             // 43
     * @summary Get the current user id, or `null` if no user is logged in. A reactive data source.                 //
     * @locus Anywhere but publish functions                                                                        //
     */                                                                                                             //
                                                                                                                    //
  AccountsCommon.prototype.userId = function () {                                                                   //
    function userId() {                                                                                             //
      throw new Error("userId method not implemented");                                                             // 50
    }                                                                                                               // 51
                                                                                                                    //
    return userId;                                                                                                  //
  }(); /**                                                                                                          //
        * @summary Get the current user record, or `null` if no user is logged in. A reactive data source.          //
        * @locus Anywhere but publish functions                                                                     //
        */                                                                                                          //
                                                                                                                    //
  AccountsCommon.prototype.user = function () {                                                                     //
    function user() {                                                                                               //
      var userId = this.userId();                                                                                   // 58
      return userId ? this.users.findOne(userId) : null;                                                            // 59
    }                                                                                                               // 60
                                                                                                                    //
    return user;                                                                                                    //
  }(); // Set up config for the accounts system. Call this on both the client                                       //
  // and the server.                                                                                                // 63
  //                                                                                                                // 64
  // Note that this method gets overridden on AccountsServer.prototype, but                                         // 65
  // the overriding method calls the overridden method.                                                             // 66
  //                                                                                                                // 67
  // XXX we should add some enforcement that this is called on both the                                             // 68
  // client and the server. Otherwise, a user can                                                                   // 69
  // 'forbidClientAccountCreation' only on the client and while it looks                                            // 70
  // like their app is secure, the server will still accept createUser                                              // 71
  // calls. https://github.com/meteor/meteor/issues/828                                                             // 72
  //                                                                                                                // 73
  // @param options {Object} an object with fields:                                                                 // 74
  // - sendVerificationEmail {Boolean}                                                                              // 75
  //     Send email address verification emails to new users created from                                           // 76
  //     client signups.                                                                                            // 77
  // - forbidClientAccountCreation {Boolean}                                                                        // 78
  //     Do not allow clients to create accounts directly.                                                          // 79
  // - restrictCreationByEmailDomain {Function or String}                                                           // 80
  //     Require created users to have an email matching the function or                                            // 81
  //     having the string as domain.                                                                               // 82
  // - loginExpirationInDays {Number}                                                                               // 83
  //     Number of days since login until a user is logged out (login token                                         // 84
  //     expires).                                                                                                  // 85
  // - passwordResetTokenExpirationInDays {Number}                                                                  // 86
  //     Number of days since password reset token creation until the                                               // 87
  //     token cannt be used any longer (password reset token expires).                                             // 88
  // - ambiguousErrorMessages {Boolean}                                                                             // 89
  //     Return ambiguous error messages from login failures to prevent                                             // 90
  //     user enumeration.                                                                                          // 91
  /**                                                                                                               // 93
   * @summary Set global accounts options.                                                                          //
   * @locus Anywhere                                                                                                //
   * @param {Object} options                                                                                        //
   * @param {Boolean} options.sendVerificationEmail New users with an email address will receive an address verification email.
   * @param {Boolean} options.forbidClientAccountCreation Calls to [`createUser`](#accounts_createuser) from the client will be rejected. In addition, if you are using [accounts-ui](#accountsui), the "Create account" link will not be available.
   * @param {String | Function} options.restrictCreationByEmailDomain If set to a string, only allows new users if the domain part of their email address matches the string. If set to a function, only allows new users if the function returns true.  The function is passed the full email address of the proposed new user.  Works with password-based sign-in and external services that expose email addresses (Google, Facebook, GitHub). All existing users still can log in after enabling this option. Example: `Accounts.config({ restrictCreationByEmailDomain: 'school.edu' })`.
   * @param {Number} options.loginExpirationInDays The number of days from when a user logs in until their token expires and they are logged out. Defaults to 90. Set to `null` to disable login expiration.
   * @param {String} options.oauthSecretKey When using the `oauth-encryption` package, the 16 byte key using to encrypt sensitive account credentials in the database, encoded in base64.  This option may only be specifed on the server.  See packages/oauth-encryption/README.md for details.
   * @param {Number} options.passwordResetTokenExpirationInDays The number of days from when a link to reset password is sent until token expires and user can't reset password with the link anymore. Defaults to 3.
   * @param {Number} options.passwordEnrollTokenExpirationInDays The number of days from when a link to set inital password is sent until token expires and user can't set password with the link anymore. Defaults to 30.
   * @param {Boolean} options.ambiguousErrorMessages Return ambiguous error messages from login failures to prevent user enumeration. Defaults to false.
   */                                                                                                               //
                                                                                                                    //
  AccountsCommon.prototype.config = function () {                                                                   //
    function config(options) {                                                                                      //
      var self = this; // We don't want users to accidentally only call Accounts.config on the                      // 107
      // client, where some of the options will have partial effects (eg removing                                   // 110
      // the "create account" button from accounts-ui if forbidClientAccountCreation                                // 111
      // is set, or redirecting Google login to a specific-domain page) without                                     // 112
      // having their full effects.                                                                                 // 113
                                                                                                                    //
      if (Meteor.isServer) {                                                                                        // 114
        __meteor_runtime_config__.accountsConfigCalled = true;                                                      // 115
      } else if (!__meteor_runtime_config__.accountsConfigCalled) {                                                 // 116
        // XXX would be nice to "crash" the client and replace the UI with an error                                 // 117
        // message, but there's no trivial way to do this.                                                          // 118
        Meteor._debug("Accounts.config was called on the client but not on the " + "server; some configuration options may not take effect.");
      } // We need to validate the oauthSecretKey option at the time                                                // 121
      // Accounts.config is called. We also deliberately don't store the                                            // 124
      // oauthSecretKey in Accounts._options.                                                                       // 125
                                                                                                                    //
                                                                                                                    //
      if (_.has(options, "oauthSecretKey")) {                                                                       // 126
        if (Meteor.isClient) throw new Error("The oauthSecretKey option may only be specified on the server");      // 127
        if (!Package["oauth-encryption"]) throw new Error("The oauth-encryption package must be loaded to set oauthSecretKey");
        Package["oauth-encryption"].OAuthEncryption.loadKey(options.oauthSecretKey);                                // 131
        options = _.omit(options, "oauthSecretKey");                                                                // 132
      } // validate option keys                                                                                     // 133
                                                                                                                    //
                                                                                                                    //
      var VALID_KEYS = ["sendVerificationEmail", "forbidClientAccountCreation", "passwordEnrollTokenExpirationInDays", "restrictCreationByEmailDomain", "loginExpirationInDays", "passwordResetTokenExpirationInDays", "ambiguousErrorMessages"];
                                                                                                                    //
      _.each(_.keys(options), function (key) {                                                                      // 139
        if (!_.contains(VALID_KEYS, key)) {                                                                         // 140
          throw new Error("Accounts.config: Invalid key: " + key);                                                  // 141
        }                                                                                                           // 142
      }); // set values in Accounts._options                                                                        // 143
                                                                                                                    //
                                                                                                                    //
      _.each(VALID_KEYS, function (key) {                                                                           // 146
        if (key in options) {                                                                                       // 147
          if (key in self._options) {                                                                               // 148
            throw new Error("Can't set `" + key + "` more than once");                                              // 149
          }                                                                                                         // 150
                                                                                                                    //
          self._options[key] = options[key];                                                                        // 151
        }                                                                                                           // 152
      });                                                                                                           // 153
    }                                                                                                               // 154
                                                                                                                    //
    return config;                                                                                                  //
  }(); /**                                                                                                          //
        * @summary Register a callback to be called after a login attempt succeeds.                                 //
        * @locus Anywhere                                                                                           //
        * @param {Function} func The callback to be called when login is successful.                                //
        */                                                                                                          //
                                                                                                                    //
  AccountsCommon.prototype.onLogin = function () {                                                                  //
    function onLogin(func) {                                                                                        //
      return this._onLoginHook.register(func);                                                                      // 162
    }                                                                                                               // 163
                                                                                                                    //
    return onLogin;                                                                                                 //
  }(); /**                                                                                                          //
        * @summary Register a callback to be called after a login attempt fails.                                    //
        * @locus Anywhere                                                                                           //
        * @param {Function} func The callback to be called after the login has failed.                              //
        */                                                                                                          //
                                                                                                                    //
  AccountsCommon.prototype.onLoginFailure = function () {                                                           //
    function onLoginFailure(func) {                                                                                 //
      return this._onLoginFailureHook.register(func);                                                               // 171
    }                                                                                                               // 172
                                                                                                                    //
    return onLoginFailure;                                                                                          //
  }(); /**                                                                                                          //
        * @summary Register a callback to be called after a logout attempt succeeds.                                //
        * @locus Anywhere                                                                                           //
        * @param {Function} func The callback to be called when logout is successful.                               //
        */                                                                                                          //
                                                                                                                    //
  AccountsCommon.prototype.onLogout = function () {                                                                 //
    function onLogout(func) {                                                                                       //
      return this._onLogoutHook.register(func);                                                                     // 180
    }                                                                                                               // 181
                                                                                                                    //
    return onLogout;                                                                                                //
  }();                                                                                                              //
                                                                                                                    //
  AccountsCommon.prototype._initConnection = function () {                                                          //
    function _initConnection(options) {                                                                             //
      if (!Meteor.isClient) {                                                                                       // 184
        return;                                                                                                     // 185
      } // The connection used by the Accounts system. This is the connection                                       // 186
      // that will get logged in by Meteor.login(), and this is the                                                 // 189
      // connection whose login state will be reflected by Meteor.userId().                                         // 190
      //                                                                                                            // 191
      // It would be much preferable for this to be in accounts_client.js,                                          // 192
      // but it has to be here because it's needed to create the                                                    // 193
      // Meteor.users collection.                                                                                   // 194
                                                                                                                    //
                                                                                                                    //
      if (options.connection) {                                                                                     // 196
        this.connection = options.connection;                                                                       // 197
      } else if (options.ddpUrl) {                                                                                  // 198
        this.connection = DDP.connect(options.ddpUrl);                                                              // 199
      } else if (typeof __meteor_runtime_config__ !== "undefined" && __meteor_runtime_config__.ACCOUNTS_CONNECTION_URL) {
        // Temporary, internal hook to allow the server to point the client                                         // 202
        // to a different authentication server. This is for a very                                                 // 203
        // particular use case that comes up when implementing a oauth                                              // 204
        // server. Unsupported and may go away at any point in time.                                                // 205
        //                                                                                                          // 206
        // We will eventually provide a general way to use account-base                                             // 207
        // against any DDP connection, not just one special one.                                                    // 208
        this.connection = DDP.connect(__meteor_runtime_config__.ACCOUNTS_CONNECTION_URL);                           // 209
      } else {                                                                                                      // 211
        this.connection = Meteor.connection;                                                                        // 212
      }                                                                                                             // 213
    }                                                                                                               // 214
                                                                                                                    //
    return _initConnection;                                                                                         //
  }();                                                                                                              //
                                                                                                                    //
  AccountsCommon.prototype._getTokenLifetimeMs = function () {                                                      //
    function _getTokenLifetimeMs() {                                                                                //
      return (this._options.loginExpirationInDays || DEFAULT_LOGIN_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000;          // 217
    }                                                                                                               // 219
                                                                                                                    //
    return _getTokenLifetimeMs;                                                                                     //
  }();                                                                                                              //
                                                                                                                    //
  AccountsCommon.prototype._getPasswordResetTokenLifetimeMs = function () {                                         //
    function _getPasswordResetTokenLifetimeMs() {                                                                   //
      return (this._options.passwordResetTokenExpirationInDays || DEFAULT_PASSWORD_RESET_TOKEN_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000;
    }                                                                                                               // 224
                                                                                                                    //
    return _getPasswordResetTokenLifetimeMs;                                                                        //
  }();                                                                                                              //
                                                                                                                    //
  AccountsCommon.prototype._getPasswordEnrollTokenLifetimeMs = function () {                                        //
    function _getPasswordEnrollTokenLifetimeMs() {                                                                  //
      return (this._options.passwordEnrollTokenExpirationInDays || DEFAULT_PASSWORD_ENROLL_TOKEN_EXPIRATION_DAYS) * 24 * 60 * 60 * 1000;
    }                                                                                                               // 229
                                                                                                                    //
    return _getPasswordEnrollTokenLifetimeMs;                                                                       //
  }();                                                                                                              //
                                                                                                                    //
  AccountsCommon.prototype._tokenExpiration = function () {                                                         //
    function _tokenExpiration(when) {                                                                               //
      // We pass when through the Date constructor for backwards compatibility;                                     // 232
      // `when` used to be a number.                                                                                // 233
      return new Date(new Date(when).getTime() + this._getTokenLifetimeMs());                                       // 234
    }                                                                                                               // 235
                                                                                                                    //
    return _tokenExpiration;                                                                                        //
  }();                                                                                                              //
                                                                                                                    //
  AccountsCommon.prototype._tokenExpiresSoon = function () {                                                        //
    function _tokenExpiresSoon(when) {                                                                              //
      var minLifetimeMs = .1 * this._getTokenLifetimeMs();                                                          // 238
                                                                                                                    //
      var minLifetimeCapMs = MIN_TOKEN_LIFETIME_CAP_SECS * 1000;                                                    // 239
      if (minLifetimeMs > minLifetimeCapMs) minLifetimeMs = minLifetimeCapMs;                                       // 240
      return new Date() > new Date(when) - minLifetimeMs;                                                           // 242
    }                                                                                                               // 243
                                                                                                                    //
    return _tokenExpiresSoon;                                                                                       //
  }();                                                                                                              //
                                                                                                                    //
  return AccountsCommon;                                                                                            //
}();                                                                                                                //
                                                                                                                    //
var Ap = AccountsCommon.prototype; // Note that Accounts is defined separately in accounts_client.js and            // 246
// accounts_server.js.                                                                                              // 249
/**                                                                                                                 // 251
 * @summary Get the current user id, or `null` if no user is logged in. A reactive data source.                     //
 * @locus Anywhere but publish functions                                                                            //
 * @importFromPackage meteor                                                                                        //
 */                                                                                                                 //
                                                                                                                    //
Meteor.userId = function () {                                                                                       // 256
  return Accounts.userId();                                                                                         // 257
}; /**                                                                                                              // 258
    * @summary Get the current user record, or `null` if no user is logged in. A reactive data source.              //
    * @locus Anywhere but publish functions                                                                         //
    * @importFromPackage meteor                                                                                     //
    */                                                                                                              //
                                                                                                                    //
Meteor.user = function () {                                                                                         // 265
  return Accounts.user();                                                                                           // 266
}; // how long (in days) until a login token expires                                                                // 267
                                                                                                                    //
                                                                                                                    //
var DEFAULT_LOGIN_EXPIRATION_DAYS = 90; // how long (in days) until reset password token expires                    // 270
                                                                                                                    //
var DEFAULT_PASSWORD_RESET_TOKEN_EXPIRATION_DAYS = 3; // how long (in days) until enrol password token expires      // 272
                                                                                                                    //
var DEFAULT_PASSWORD_ENROLL_TOKEN_EXPIRATION_DAYS = 30; // Clients don't try to auto-login with a token that is going to expire within
// .1 * DEFAULT_LOGIN_EXPIRATION_DAYS, capped at MIN_TOKEN_LIFETIME_CAP_SECS.                                       // 276
// Tries to avoid abrupt disconnects from expiring tokens.                                                          // 277
                                                                                                                    //
var MIN_TOKEN_LIFETIME_CAP_SECS = 3600; // one hour                                                                 // 278
// how often (in milliseconds) we check for expired tokens                                                          // 279
                                                                                                                    //
EXPIRE_TOKENS_INTERVAL_MS = 600 * 1000; // 10 minutes                                                               // 280
// how long we wait before logging out clients when Meteor.logoutOtherClients is                                    // 281
// called                                                                                                           // 282
                                                                                                                    //
CONNECTION_CLOSE_DELAY_MS = 10 * 1000; // loginServiceConfiguration and ConfigError are maintained for backwards compatibility
                                                                                                                    //
Meteor.startup(function () {                                                                                        // 286
  var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;                                 // 287
  Ap.loginServiceConfiguration = ServiceConfiguration.configurations;                                               // 289
  Ap.ConfigError = ServiceConfiguration.ConfigError;                                                                // 290
}); // Thrown when the user cancels the login process (eg, closes an oauth                                          // 291
// popup, declines retina scan, etc)                                                                                // 294
                                                                                                                    //
var lceName = 'Accounts.LoginCancelledError';                                                                       // 295
Ap.LoginCancelledError = Meteor.makeErrorType(lceName, function (description) {                                     // 296
  this.message = description;                                                                                       // 299
});                                                                                                                 // 300
Ap.LoginCancelledError.prototype.name = lceName; // This is used to transmit specific subclass errors over the wire. We should
// come up with a more generic way to do this (eg, with some sort of symbolic                                       // 305
// error code rather than a number).                                                                                // 306
                                                                                                                    //
Ap.LoginCancelledError.numericError = 0x8acdc2f;                                                                    // 307
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"accounts_rate_limit.js":["./accounts_common.js",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/accounts-base/accounts_rate_limit.js                                                                    //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var AccountsCommon = void 0;                                                                                        // 1
module.importSync("./accounts_common.js", {                                                                         // 1
  AccountsCommon: function (v) {                                                                                    // 1
    AccountsCommon = v;                                                                                             // 1
  }                                                                                                                 // 1
}, 0);                                                                                                              // 1
var Ap = AccountsCommon.prototype;                                                                                  // 3
var defaultRateLimiterRuleId; // Removes default rate limiting rule                                                 // 4
                                                                                                                    //
Ap.removeDefaultRateLimit = function () {                                                                           // 6
  var resp = DDPRateLimiter.removeRule(defaultRateLimiterRuleId);                                                   // 7
  defaultRateLimiterRuleId = null;                                                                                  // 8
  return resp;                                                                                                      // 9
}; // Add a default rule of limiting logins, creating new users and password reset                                  // 10
// to 5 times every 10 seconds per connection.                                                                      // 13
                                                                                                                    //
                                                                                                                    //
Ap.addDefaultRateLimit = function () {                                                                              // 14
  if (!defaultRateLimiterRuleId) {                                                                                  // 15
    defaultRateLimiterRuleId = DDPRateLimiter.addRule({                                                             // 16
      userId: null,                                                                                                 // 17
      clientAddress: null,                                                                                          // 18
      type: 'method',                                                                                               // 19
      name: function (name) {                                                                                       // 20
        return _.contains(['login', 'createUser', 'resetPassword', 'forgotPassword'], name);                        // 21
      },                                                                                                            // 23
      connectionId: function (connectionId) {                                                                       // 24
        return true;                                                                                                // 25
      }                                                                                                             // 26
    }, 5, 10000);                                                                                                   // 16
  }                                                                                                                 // 28
};                                                                                                                  // 29
                                                                                                                    //
Ap.addDefaultRateLimit();                                                                                           // 31
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"accounts_server.js":["babel-runtime/helpers/extends","babel-runtime/helpers/classCallCheck","babel-runtime/helpers/possibleConstructorReturn","babel-runtime/helpers/inherits","./accounts_common.js",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/accounts-base/accounts_server.js                                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var _extends2 = require("babel-runtime/helpers/extends");                                                           //
                                                                                                                    //
var _extends3 = _interopRequireDefault(_extends2);                                                                  //
                                                                                                                    //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                             //
                                                                                                                    //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                    //
                                                                                                                    //
var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");                       //
                                                                                                                    //
var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);                              //
                                                                                                                    //
var _inherits2 = require("babel-runtime/helpers/inherits");                                                         //
                                                                                                                    //
var _inherits3 = _interopRequireDefault(_inherits2);                                                                //
                                                                                                                    //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                   //
                                                                                                                    //
module.export({                                                                                                     // 1
  AccountsServer: function () {                                                                                     // 1
    return AccountsServer;                                                                                          // 1
  }                                                                                                                 // 1
});                                                                                                                 // 1
var AccountsCommon = void 0;                                                                                        // 1
module.importSync("./accounts_common.js", {                                                                         // 1
  AccountsCommon: function (v) {                                                                                    // 1
    AccountsCommon = v;                                                                                             // 1
  }                                                                                                                 // 1
}, 0);                                                                                                              // 1
                                                                                                                    //
var crypto = Npm.require('crypto');                                                                                 // 1
                                                                                                                    //
var AccountsServer = function (_AccountsCommon) {                                                                   //
  (0, _inherits3.default)(AccountsServer, _AccountsCommon);                                                         //
                                                                                                                    //
  // Note that this constructor is less likely to be instantiated multiple                                          // 14
  // times than the `AccountsClient` constructor, because a single server                                           // 15
  // can provide only one set of methods.                                                                           // 16
  function AccountsServer(server) {                                                                                 // 17
    (0, _classCallCheck3.default)(this, AccountsServer);                                                            // 17
                                                                                                                    //
    var _this = (0, _possibleConstructorReturn3.default)(this, _AccountsCommon.call(this));                         // 17
                                                                                                                    //
    _this._server = server || Meteor.server; // Set up the server's methods, as if by calling Meteor.methods.       // 20
                                                                                                                    //
    _this._initServerMethods();                                                                                     // 22
                                                                                                                    //
    _this._initAccountDataHooks(); // If autopublish is on, publish these user fields. Login service                // 24
    // packages (eg accounts-google) add to these by calling                                                        // 27
    // addAutopublishFields.  Notably, this isn't implemented with multiple                                         // 28
    // publishes since DDP only merges only across top-level fields, not                                            // 29
    // subfields (such as 'services.facebook.accessToken')                                                          // 30
                                                                                                                    //
                                                                                                                    //
    _this._autopublishFields = {                                                                                    // 31
      loggedInUser: ['profile', 'username', 'emails'],                                                              // 32
      otherUsers: ['profile', 'username']                                                                           // 33
    };                                                                                                              // 31
                                                                                                                    //
    _this._initServerPublications(); // connectionId -> {connection, loginToken}                                    // 35
                                                                                                                    //
                                                                                                                    //
    _this._accountData = {}; // connection id -> observe handle for the login token that this connection is         // 38
    // currently associated with, or a number. The number indicates that we are in                                  // 41
    // the process of setting up the observe (using a number instead of a single                                    // 42
    // sentinel allows multiple attempts to set up the observe to identify which                                    // 43
    // one was theirs).                                                                                             // 44
                                                                                                                    //
    _this._userObservesForConnections = {};                                                                         // 45
    _this._nextUserObserveNumber = 1; // for the number described above.                                            // 46
    // list of all registered handlers.                                                                             // 48
                                                                                                                    //
    _this._loginHandlers = [];                                                                                      // 49
    setupUsersCollection(_this.users);                                                                              // 51
    setupDefaultLoginHandlers(_this);                                                                               // 52
    setExpireTokensInterval(_this);                                                                                 // 53
    _this._validateLoginHook = new Hook({                                                                           // 55
      bindEnvironment: false                                                                                        // 55
    });                                                                                                             // 55
    _this._validateNewUserHooks = [defaultValidateNewUserHook.bind(_this)];                                         // 56
                                                                                                                    //
    _this._deleteSavedTokensForAllUsersOnStartup();                                                                 // 60
                                                                                                                    //
    _this._skipCaseInsensitiveChecksForTest = {};                                                                   // 62
    return _this;                                                                                                   // 17
  } ///                                                                                                             // 63
  /// CURRENT USER                                                                                                  // 66
  ///                                                                                                               // 67
  // @override of "abstract" non-implementation in accounts_common.js                                               // 69
                                                                                                                    //
                                                                                                                    //
  AccountsServer.prototype.userId = function () {                                                                   //
    function userId() {                                                                                             //
      // This function only works if called inside a method. In theory, it                                          // 71
      // could also be called from publish statements, since they also                                              // 72
      // have a userId associated with them. However, given that publish                                            // 73
      // functions aren't reactive, using any of the infomation from                                                // 74
      // Meteor.user() in a publish function will always use the value                                              // 75
      // from when the function first runs. This is likely not what the                                             // 76
      // user expects. The way to make this work in a publish is to do                                              // 77
      // Meteor.find(this.userId).observe and recompute when the user                                               // 78
      // record changes.                                                                                            // 79
      var currentInvocation = DDP._CurrentInvocation.get();                                                         // 80
                                                                                                                    //
      if (!currentInvocation) throw new Error("Meteor.userId can only be invoked in method calls. Use this.userId in publish functions.");
      return currentInvocation.userId;                                                                              // 83
    }                                                                                                               // 84
                                                                                                                    //
    return userId;                                                                                                  //
  }(); ///                                                                                                          //
  /// LOGIN HOOKS                                                                                                   // 87
  ///                                                                                                               // 88
  /**                                                                                                               // 90
   * @summary Validate login attempts.                                                                              //
   * @locus Server                                                                                                  //
   * @param {Function} func Called whenever a login is attempted (either successful or unsuccessful).  A login can be aborted by returning a falsy value or throwing an exception.
   */                                                                                                               //
                                                                                                                    //
  AccountsServer.prototype.validateLoginAttempt = function () {                                                     //
    function validateLoginAttempt(func) {                                                                           //
      // Exceptions inside the hook callback are passed up to us.                                                   // 96
      return this._validateLoginHook.register(func);                                                                // 97
    }                                                                                                               // 98
                                                                                                                    //
    return validateLoginAttempt;                                                                                    //
  }(); /**                                                                                                          //
        * @summary Set restrictions on new user creation.                                                           //
        * @locus Server                                                                                             //
        * @param {Function} func Called whenever a new user is created. Takes the new user object, and returns true to allow the creation or false to abort.
        */                                                                                                          //
                                                                                                                    //
  AccountsServer.prototype.validateNewUser = function () {                                                          //
    function validateNewUser(func) {                                                                                //
      this._validateNewUserHooks.push(func);                                                                        // 106
    }                                                                                                               // 107
                                                                                                                    //
    return validateNewUser;                                                                                         //
  }(); ///                                                                                                          //
  /// CREATE USER HOOKS                                                                                             // 110
  ///                                                                                                               // 111
  /**                                                                                                               // 113
   * @summary Customize new user creation.                                                                          //
   * @locus Server                                                                                                  //
   * @param {Function} func Called whenever a new user is created. Return the new user object, or throw an `Error` to abort the creation.
   */                                                                                                               //
                                                                                                                    //
  AccountsServer.prototype.onCreateUser = function () {                                                             //
    function onCreateUser(func) {                                                                                   //
      if (this._onCreateUserHook) {                                                                                 // 119
        throw new Error("Can only call onCreateUser once");                                                         // 120
      }                                                                                                             // 121
                                                                                                                    //
      this._onCreateUserHook = func;                                                                                // 123
    }                                                                                                               // 124
                                                                                                                    //
    return onCreateUser;                                                                                            //
  }();                                                                                                              //
                                                                                                                    //
  return AccountsServer;                                                                                            //
}(AccountsCommon);                                                                                                  //
                                                                                                                    //
;                                                                                                                   // 125
var Ap = AccountsServer.prototype; // Give each login hook callback a fresh cloned copy of the attempt              // 127
// object, but don't clone the connection.                                                                          // 130
//                                                                                                                  // 131
                                                                                                                    //
function cloneAttemptWithConnection(connection, attempt) {                                                          // 132
  var clonedAttempt = EJSON.clone(attempt);                                                                         // 133
  clonedAttempt.connection = connection;                                                                            // 134
  return clonedAttempt;                                                                                             // 135
}                                                                                                                   // 136
                                                                                                                    //
Ap._validateLogin = function (connection, attempt) {                                                                // 138
  this._validateLoginHook.each(function (callback) {                                                                // 139
    var ret;                                                                                                        // 140
                                                                                                                    //
    try {                                                                                                           // 141
      ret = callback(cloneAttemptWithConnection(connection, attempt));                                              // 142
    } catch (e) {                                                                                                   // 143
      attempt.allowed = false; // XXX this means the last thrown error overrides previous error                     // 145
      // messages. Maybe this is surprising to users and we should make                                             // 147
      // overriding errors more explicit. (see                                                                      // 148
      // https://github.com/meteor/meteor/issues/1960)                                                              // 149
                                                                                                                    //
      attempt.error = e;                                                                                            // 150
      return true;                                                                                                  // 151
    }                                                                                                               // 152
                                                                                                                    //
    if (!ret) {                                                                                                     // 153
      attempt.allowed = false; // don't override a specific error provided by a previous                            // 154
      // validator or the initial attempt (eg "incorrect password").                                                // 156
                                                                                                                    //
      if (!attempt.error) attempt.error = new Meteor.Error(403, "Login forbidden");                                 // 157
    }                                                                                                               // 159
                                                                                                                    //
    return true;                                                                                                    // 160
  });                                                                                                               // 161
};                                                                                                                  // 162
                                                                                                                    //
Ap._successfulLogin = function (connection, attempt) {                                                              // 165
  this._onLoginHook.each(function (callback) {                                                                      // 166
    callback(cloneAttemptWithConnection(connection, attempt));                                                      // 167
    return true;                                                                                                    // 168
  });                                                                                                               // 169
};                                                                                                                  // 170
                                                                                                                    //
Ap._failedLogin = function (connection, attempt) {                                                                  // 172
  this._onLoginFailureHook.each(function (callback) {                                                               // 173
    callback(cloneAttemptWithConnection(connection, attempt));                                                      // 174
    return true;                                                                                                    // 175
  });                                                                                                               // 176
};                                                                                                                  // 177
                                                                                                                    //
Ap._successfulLogout = function (connection, userId) {                                                              // 179
  var user = userId && this.users.findOne(userId);                                                                  // 180
                                                                                                                    //
  this._onLogoutHook.each(function (callback) {                                                                     // 181
    callback({                                                                                                      // 182
      user: user,                                                                                                   // 182
      connection: connection                                                                                        // 182
    });                                                                                                             // 182
    return true;                                                                                                    // 183
  });                                                                                                               // 184
}; ///                                                                                                              // 185
/// LOGIN METHODS                                                                                                   // 188
///                                                                                                                 // 189
// Login methods return to the client an object containing these                                                    // 191
// fields when the user was logged in successfully:                                                                 // 192
//                                                                                                                  // 193
//   id: userId                                                                                                     // 194
//   token: *                                                                                                       // 195
//   tokenExpires: *                                                                                                // 196
//                                                                                                                  // 197
// tokenExpires is optional and intends to provide a hint to the                                                    // 198
// client as to when the token will expire. If not provided, the                                                    // 199
// client will call Accounts._tokenExpiration, passing it the date                                                  // 200
// that it received the token.                                                                                      // 201
//                                                                                                                  // 202
// The login method will throw an error back to the client if the user                                              // 203
// failed to log in.                                                                                                // 204
//                                                                                                                  // 205
//                                                                                                                  // 206
// Login handlers and service specific login methods such as                                                        // 207
// `createUser` internally return a `result` object containing these                                                // 208
// fields:                                                                                                          // 209
//                                                                                                                  // 210
//   type:                                                                                                          // 211
//     optional string; the service name, overrides the handler                                                     // 212
//     default if present.                                                                                          // 213
//                                                                                                                  // 214
//   error:                                                                                                         // 215
//     exception; if the user is not allowed to login, the reason why.                                              // 216
//                                                                                                                  // 217
//   userId:                                                                                                        // 218
//     string; the user id of the user attempting to login (if                                                      // 219
//     known), required for an allowed login.                                                                       // 220
//                                                                                                                  // 221
//   options:                                                                                                       // 222
//     optional object merged into the result returned by the login                                                 // 223
//     method; used by HAMK from SRP.                                                                               // 224
//                                                                                                                  // 225
//   stampedLoginToken:                                                                                             // 226
//     optional object with `token` and `when` indicating the login                                                 // 227
//     token is already present in the database, returned by the                                                    // 228
//     "resume" login handler.                                                                                      // 229
//                                                                                                                  // 230
// For convenience, login methods can also throw an exception, which                                                // 231
// is converted into an {error} result.  However, if the id of the                                                  // 232
// user attempting the login is known, a {userId, error} result should                                              // 233
// be returned instead since the user id is not captured when an                                                    // 234
// exception is thrown.                                                                                             // 235
//                                                                                                                  // 236
// This internal `result` object is automatically converted into the                                                // 237
// public {id, token, tokenExpires} object returned to the client.                                                  // 238
// Try a login method, converting thrown exceptions into an {error}                                                 // 241
// result.  The `type` argument is a default, inserted into the result                                              // 242
// object if not explicitly returned.                                                                               // 243
//                                                                                                                  // 244
                                                                                                                    //
                                                                                                                    //
var tryLoginMethod = function (type, fn) {                                                                          // 245
  var result;                                                                                                       // 246
                                                                                                                    //
  try {                                                                                                             // 247
    result = fn();                                                                                                  // 248
  } catch (e) {                                                                                                     // 249
    result = {                                                                                                      // 251
      error: e                                                                                                      // 251
    };                                                                                                              // 251
  }                                                                                                                 // 252
                                                                                                                    //
  if (result && !result.type && type) result.type = type;                                                           // 254
  return result;                                                                                                    // 257
}; // Log in a user on a connection.                                                                                // 258
//                                                                                                                  // 262
// We use the method invocation to set the user id on the connection,                                               // 263
// not the connection object directly. setUserId is tied to methods to                                              // 264
// enforce clear ordering of method application (using wait methods on                                              // 265
// the client, and a no setUserId after unblock restriction on the                                                  // 266
// server)                                                                                                          // 267
//                                                                                                                  // 268
// The `stampedLoginToken` parameter is optional.  When present, it                                                 // 269
// indicates that the login token has already been inserted into the                                                // 270
// database and doesn't need to be inserted again.  (It's used by the                                               // 271
// "resume" login handler).                                                                                         // 272
                                                                                                                    //
                                                                                                                    //
Ap._loginUser = function (methodInvocation, userId, stampedLoginToken) {                                            // 273
  var self = this;                                                                                                  // 274
                                                                                                                    //
  if (!stampedLoginToken) {                                                                                         // 276
    stampedLoginToken = self._generateStampedLoginToken();                                                          // 277
                                                                                                                    //
    self._insertLoginToken(userId, stampedLoginToken);                                                              // 278
  } // This order (and the avoidance of yields) is important to make                                                // 279
  // sure that when publish functions are rerun, they see a                                                         // 282
  // consistent view of the world: the userId is set and matches                                                    // 283
  // the login token on the connection (not that there is                                                           // 284
  // currently a public API for reading the login token on a                                                        // 285
  // connection).                                                                                                   // 286
                                                                                                                    //
                                                                                                                    //
  Meteor._noYieldsAllowed(function () {                                                                             // 287
    self._setLoginToken(userId, methodInvocation.connection, self._hashLoginToken(stampedLoginToken.token));        // 288
  });                                                                                                               // 293
                                                                                                                    //
  methodInvocation.setUserId(userId);                                                                               // 295
  return {                                                                                                          // 297
    id: userId,                                                                                                     // 298
    token: stampedLoginToken.token,                                                                                 // 299
    tokenExpires: self._tokenExpiration(stampedLoginToken.when)                                                     // 300
  };                                                                                                                // 297
}; // After a login method has completed, call the login hooks.  Note                                               // 302
// that `attemptLogin` is called for *all* login attempts, even ones                                                // 306
// which aren't successful (such as an invalid password, etc).                                                      // 307
//                                                                                                                  // 308
// If the login is allowed and isn't aborted by a validate login hook                                               // 309
// callback, log in the user.                                                                                       // 310
//                                                                                                                  // 311
                                                                                                                    //
                                                                                                                    //
Ap._attemptLogin = function (methodInvocation, methodName, methodArgs, result) {                                    // 312
  if (!result) throw new Error("result is required"); // XXX A programming error in a login handler can lead to this occuring, and
  // then we don't call onLogin or onLoginFailure callbacks. Should                                                 // 322
  // tryLoginMethod catch this case and turn it into an error?                                                      // 323
                                                                                                                    //
  if (!result.userId && !result.error) throw new Error("A login method must specify a userId or an error");         // 324
  var user;                                                                                                         // 327
  if (result.userId) user = this.users.findOne(result.userId);                                                      // 328
  var attempt = {                                                                                                   // 331
    type: result.type || "unknown",                                                                                 // 332
    allowed: !!(result.userId && !result.error),                                                                    // 333
    methodName: methodName,                                                                                         // 334
    methodArguments: _.toArray(methodArgs)                                                                          // 335
  };                                                                                                                // 331
  if (result.error) attempt.error = result.error;                                                                   // 337
  if (user) attempt.user = user; // _validateLogin may mutate `attempt` by adding an error and changing allowed     // 339
  // to false, but that's the only change it can make (and the user's callbacks                                     // 343
  // only get a clone of `attempt`).                                                                                // 344
                                                                                                                    //
  this._validateLogin(methodInvocation.connection, attempt);                                                        // 345
                                                                                                                    //
  if (attempt.allowed) {                                                                                            // 347
    var ret = _.extend(this._loginUser(methodInvocation, result.userId, result.stampedLoginToken), result.options || {});
                                                                                                                    //
    this._successfulLogin(methodInvocation.connection, attempt);                                                    // 356
                                                                                                                    //
    return ret;                                                                                                     // 357
  } else {                                                                                                          // 358
    this._failedLogin(methodInvocation.connection, attempt);                                                        // 360
                                                                                                                    //
    throw attempt.error;                                                                                            // 361
  }                                                                                                                 // 362
}; // All service specific login methods should go through this function.                                           // 363
// Ensure that thrown exceptions are caught and that login hook                                                     // 367
// callbacks are still called.                                                                                      // 368
//                                                                                                                  // 369
                                                                                                                    //
                                                                                                                    //
Ap._loginMethod = function (methodInvocation, methodName, methodArgs, type, fn) {                                   // 370
  return this._attemptLogin(methodInvocation, methodName, methodArgs, tryLoginMethod(type, fn));                    // 377
}; // Report a login attempt failed outside the context of a normal login                                           // 383
// method. This is for use in the case where there is a multi-step login                                            // 387
// procedure (eg SRP based password login). If a method early in the                                                // 388
// chain fails, it should call this function to report a failure. There                                             // 389
// is no corresponding method for a successful login; methods that can                                              // 390
// succeed at logging a user in should always be actual login methods                                               // 391
// (using either Accounts._loginMethod or Accounts.registerLoginHandler).                                           // 392
                                                                                                                    //
                                                                                                                    //
Ap._reportLoginFailure = function (methodInvocation, methodName, methodArgs, result) {                              // 393
  var attempt = {                                                                                                   // 399
    type: result.type || "unknown",                                                                                 // 400
    allowed: false,                                                                                                 // 401
    error: result.error,                                                                                            // 402
    methodName: methodName,                                                                                         // 403
    methodArguments: _.toArray(methodArgs)                                                                          // 404
  };                                                                                                                // 399
                                                                                                                    //
  if (result.userId) {                                                                                              // 407
    attempt.user = this.users.findOne(result.userId);                                                               // 408
  }                                                                                                                 // 409
                                                                                                                    //
  this._validateLogin(methodInvocation.connection, attempt);                                                        // 411
                                                                                                                    //
  this._failedLogin(methodInvocation.connection, attempt); // _validateLogin may mutate attempt to set a new error message. Return
  // the modified version.                                                                                          // 415
                                                                                                                    //
                                                                                                                    //
  return attempt;                                                                                                   // 416
}; ///                                                                                                              // 417
/// LOGIN HANDLERS                                                                                                  // 421
///                                                                                                                 // 422
// The main entry point for auth packages to hook in to login.                                                      // 424
//                                                                                                                  // 425
// A login handler is a login method which can return `undefined` to                                                // 426
// indicate that the login request is not handled by this handler.                                                  // 427
//                                                                                                                  // 428
// @param name {String} Optional.  The service name, used by default                                                // 429
// if a specific service name isn't returned in the result.                                                         // 430
//                                                                                                                  // 431
// @param handler {Function} A function that receives an options object                                             // 432
// (as passed as an argument to the `login` method) and returns one of:                                             // 433
// - `undefined`, meaning don't handle;                                                                             // 434
// - a login method result object                                                                                   // 435
                                                                                                                    //
                                                                                                                    //
Ap.registerLoginHandler = function (name, handler) {                                                                // 437
  if (!handler) {                                                                                                   // 438
    handler = name;                                                                                                 // 439
    name = null;                                                                                                    // 440
  }                                                                                                                 // 441
                                                                                                                    //
  this._loginHandlers.push({                                                                                        // 443
    name: name,                                                                                                     // 444
    handler: handler                                                                                                // 445
  });                                                                                                               // 443
}; // Checks a user's credentials against all the registered login                                                  // 447
// handlers, and returns a login token if the credentials are valid. It                                             // 451
// is like the login method, except that it doesn't set the logged-in                                               // 452
// user on the connection. Throws a Meteor.Error if logging in fails,                                               // 453
// including the case where none of the login handlers handled the login                                            // 454
// request. Otherwise, returns {id: userId, token: *, tokenExpires: *}.                                             // 455
//                                                                                                                  // 456
// For example, if you want to login with a plaintext password, `options` could be                                  // 457
//   { user: { username: <username> }, password: <password> }, or                                                   // 458
//   { user: { email: <email> }, password: <password> }.                                                            // 459
// Try all of the registered login handlers until one of them doesn't                                               // 461
// return `undefined`, meaning it handled this call to `login`. Return                                              // 462
// that return value.                                                                                               // 463
                                                                                                                    //
                                                                                                                    //
Ap._runLoginHandlers = function (methodInvocation, options) {                                                       // 464
  for (var i = 0; i < this._loginHandlers.length; ++i) {                                                            // 465
    var handler = this._loginHandlers[i];                                                                           // 466
    var result = tryLoginMethod(handler.name, function () {                                                         // 468
      return handler.handler.call(methodInvocation, options);                                                       // 471
    });                                                                                                             // 472
                                                                                                                    //
    if (result) {                                                                                                   // 475
      return result;                                                                                                // 476
    }                                                                                                               // 477
                                                                                                                    //
    if (result !== undefined) {                                                                                     // 479
      throw new Meteor.Error(400, "A login handler should return a result or undefined");                           // 480
    }                                                                                                               // 481
  }                                                                                                                 // 482
                                                                                                                    //
  return {                                                                                                          // 484
    type: null,                                                                                                     // 485
    error: new Meteor.Error(400, "Unrecognized options for login request")                                          // 486
  };                                                                                                                // 484
}; // Deletes the given loginToken from the database.                                                               // 488
//                                                                                                                  // 491
// For new-style hashed token, this will cause all connections                                                      // 492
// associated with the token to be closed.                                                                          // 493
//                                                                                                                  // 494
// Any connections associated with old-style unhashed tokens will be                                                // 495
// in the process of becoming associated with hashed tokens and then                                                // 496
// they'll get closed.                                                                                              // 497
                                                                                                                    //
                                                                                                                    //
Ap.destroyToken = function (userId, loginToken) {                                                                   // 498
  this.users.update(userId, {                                                                                       // 499
    $pull: {                                                                                                        // 500
      "services.resume.loginTokens": {                                                                              // 501
        $or: [{                                                                                                     // 502
          hashedToken: loginToken                                                                                   // 503
        }, {                                                                                                        // 503
          token: loginToken                                                                                         // 504
        }]                                                                                                          // 504
      }                                                                                                             // 501
    }                                                                                                               // 500
  });                                                                                                               // 499
};                                                                                                                  // 509
                                                                                                                    //
Ap._initServerMethods = function () {                                                                               // 511
  // The methods created in this function need to be created here so that                                           // 512
  // this variable is available in their scope.                                                                     // 513
  var accounts = this; // This object will be populated with methods and then passed to                             // 514
  // accounts._server.methods further below.                                                                        // 517
                                                                                                                    //
  var methods = {}; // @returns {Object|null}                                                                       // 518
  //   If successful, returns {token: reconnectToken, id: userId}                                                   // 521
  //   If unsuccessful (for example, if the user closed the oauth login popup),                                     // 522
  //     throws an error describing the reason                                                                      // 523
                                                                                                                    //
  methods.login = function (options) {                                                                              // 524
    var self = this; // Login handlers should really also check whatever field they look at in                      // 525
    // options, but we don't enforce it.                                                                            // 528
                                                                                                                    //
    check(options, Object);                                                                                         // 529
                                                                                                                    //
    var result = accounts._runLoginHandlers(self, options);                                                         // 531
                                                                                                                    //
    return accounts._attemptLogin(self, "login", arguments, result);                                                // 533
  };                                                                                                                // 534
                                                                                                                    //
  methods.logout = function () {                                                                                    // 536
    var token = accounts._getLoginToken(this.connection.id);                                                        // 537
                                                                                                                    //
    accounts._setLoginToken(this.userId, this.connection, null);                                                    // 538
                                                                                                                    //
    if (token && this.userId) accounts.destroyToken(this.userId, token);                                            // 539
                                                                                                                    //
    accounts._successfulLogout(this.connection, this.userId);                                                       // 541
                                                                                                                    //
    this.setUserId(null);                                                                                           // 542
  }; // Delete all the current user's tokens and close all open connections logged                                  // 543
  // in as this user. Returns a fresh new login token that this client can                                          // 546
  // use. Tests set Accounts._noConnectionCloseDelayForTest to delete tokens                                        // 547
  // immediately instead of using a delay.                                                                          // 548
  //                                                                                                                // 549
  // XXX COMPAT WITH 0.7.2                                                                                          // 550
  // This single `logoutOtherClients` method has been replaced with two                                             // 551
  // methods, one that you call to get a new token, and another that you                                            // 552
  // call to remove all tokens except your own. The new design allows                                               // 553
  // clients to know when other clients have actually been logged                                                   // 554
  // out. (The `logoutOtherClients` method guarantees the caller that                                               // 555
  // the other clients will be logged out at some point, but makes no                                               // 556
  // guarantees about when.) This method is left in for backwards                                                   // 557
  // compatibility, especially since application code might be calling                                              // 558
  // this method directly.                                                                                          // 559
  //                                                                                                                // 560
  // @returns {Object} Object with token and tokenExpires keys.                                                     // 561
                                                                                                                    //
                                                                                                                    //
  methods.logoutOtherClients = function () {                                                                        // 562
    var self = this;                                                                                                // 563
    var user = accounts.users.findOne(self.userId, {                                                                // 564
      fields: {                                                                                                     // 565
        "services.resume.loginTokens": true                                                                         // 566
      }                                                                                                             // 565
    });                                                                                                             // 564
                                                                                                                    //
    if (user) {                                                                                                     // 569
      // Save the current tokens in the database to be deleted in                                                   // 570
      // CONNECTION_CLOSE_DELAY_MS ms. This gives other connections in the                                          // 571
      // caller's browser time to find the fresh token in localStorage. We save                                     // 572
      // the tokens in the database in case we crash before actually deleting                                       // 573
      // them.                                                                                                      // 574
      var tokens = user.services.resume.loginTokens;                                                                // 575
                                                                                                                    //
      var newToken = accounts._generateStampedLoginToken();                                                         // 576
                                                                                                                    //
      var userId = self.userId;                                                                                     // 577
      accounts.users.update(userId, {                                                                               // 578
        $set: {                                                                                                     // 579
          "services.resume.loginTokensToDelete": tokens,                                                            // 580
          "services.resume.haveLoginTokensToDelete": true                                                           // 581
        },                                                                                                          // 579
        $push: {                                                                                                    // 583
          "services.resume.loginTokens": accounts._hashStampedToken(newToken)                                       // 583
        }                                                                                                           // 583
      });                                                                                                           // 578
      Meteor.setTimeout(function () {                                                                               // 585
        // The observe on Meteor.users will take care of closing the connections                                    // 586
        // associated with `tokens`.                                                                                // 587
        accounts._deleteSavedTokensForUser(userId, tokens);                                                         // 588
      }, accounts._noConnectionCloseDelayForTest ? 0 : CONNECTION_CLOSE_DELAY_MS); // We do not set the login token on this connection, but instead the
      // observe closes the connection and the client will reconnect with the                                       // 592
      // new token.                                                                                                 // 593
                                                                                                                    //
      return {                                                                                                      // 594
        token: newToken.token,                                                                                      // 595
        tokenExpires: accounts._tokenExpiration(newToken.when)                                                      // 596
      };                                                                                                            // 594
    } else {                                                                                                        // 598
      throw new Meteor.Error("You are not logged in.");                                                             // 599
    }                                                                                                               // 600
  }; // Generates a new login token with the same expiration as the                                                 // 601
  // connection's current token and saves it to the database. Associates                                            // 604
  // the connection with this new token and returns it. Throws an error                                             // 605
  // if called on a connection that isn't logged in.                                                                // 606
  //                                                                                                                // 607
  // @returns Object                                                                                                // 608
  //   If successful, returns { token: <new token>, id: <user id>,                                                  // 609
  //   tokenExpires: <expiration date> }.                                                                           // 610
                                                                                                                    //
                                                                                                                    //
  methods.getNewToken = function () {                                                                               // 611
    var self = this;                                                                                                // 612
    var user = accounts.users.findOne(self.userId, {                                                                // 613
      fields: {                                                                                                     // 614
        "services.resume.loginTokens": 1                                                                            // 614
      }                                                                                                             // 614
    });                                                                                                             // 613
                                                                                                                    //
    if (!self.userId || !user) {                                                                                    // 616
      throw new Meteor.Error("You are not logged in.");                                                             // 617
    } // Be careful not to generate a new token that has a later                                                    // 618
    // expiration than the curren token. Otherwise, a bad guy with a                                                // 620
    // stolen token could use this method to stop his stolen token from                                             // 621
    // ever expiring.                                                                                               // 622
                                                                                                                    //
                                                                                                                    //
    var currentHashedToken = accounts._getLoginToken(self.connection.id);                                           // 623
                                                                                                                    //
    var currentStampedToken = _.find(user.services.resume.loginTokens, function (stampedToken) {                    // 624
      return stampedToken.hashedToken === currentHashedToken;                                                       // 627
    });                                                                                                             // 628
                                                                                                                    //
    if (!currentStampedToken) {                                                                                     // 630
      // safety belt: this should never happen                                                                      // 630
      throw new Meteor.Error("Invalid login token");                                                                // 631
    }                                                                                                               // 632
                                                                                                                    //
    var newStampedToken = accounts._generateStampedLoginToken();                                                    // 633
                                                                                                                    //
    newStampedToken.when = currentStampedToken.when;                                                                // 634
                                                                                                                    //
    accounts._insertLoginToken(self.userId, newStampedToken);                                                       // 635
                                                                                                                    //
    return accounts._loginUser(self, self.userId, newStampedToken);                                                 // 636
  }; // Removes all tokens except the token associated with the current                                             // 637
  // connection. Throws an error if the connection is not logged                                                    // 640
  // in. Returns nothing on success.                                                                                // 641
                                                                                                                    //
                                                                                                                    //
  methods.removeOtherTokens = function () {                                                                         // 642
    var self = this;                                                                                                // 643
                                                                                                                    //
    if (!self.userId) {                                                                                             // 644
      throw new Meteor.Error("You are not logged in.");                                                             // 645
    }                                                                                                               // 646
                                                                                                                    //
    var currentToken = accounts._getLoginToken(self.connection.id);                                                 // 647
                                                                                                                    //
    accounts.users.update(self.userId, {                                                                            // 648
      $pull: {                                                                                                      // 649
        "services.resume.loginTokens": {                                                                            // 650
          hashedToken: {                                                                                            // 650
            $ne: currentToken                                                                                       // 650
          }                                                                                                         // 650
        }                                                                                                           // 650
      }                                                                                                             // 649
    });                                                                                                             // 648
  }; // Allow a one-time configuration for a login service. Modifications                                           // 653
  // to this collection are also allowed in insecure mode.                                                          // 656
                                                                                                                    //
                                                                                                                    //
  methods.configureLoginService = function (options) {                                                              // 657
    check(options, Match.ObjectIncluding({                                                                          // 658
      service: String                                                                                               // 658
    })); // Don't let random users configure a service we haven't added yet (so                                     // 658
    // that when we do later add it, it's set up with their configuration                                           // 660
    // instead of ours).                                                                                            // 661
    // XXX if service configuration is oauth-specific then this code should                                         // 662
    //     be in accounts-oauth; if it's not then the registry should be                                            // 663
    //     in this package                                                                                          // 664
                                                                                                                    //
    if (!(accounts.oauth && _.contains(accounts.oauth.serviceNames(), options.service))) {                          // 665
      throw new Meteor.Error(403, "Service unknown");                                                               // 667
    }                                                                                                               // 668
                                                                                                                    //
    var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;                               // 670
    if (ServiceConfiguration.configurations.findOne({                                                               // 672
      service: options.service                                                                                      // 672
    })) throw new Meteor.Error(403, "Service " + options.service + " already configured");                          // 672
    if (_.has(options, "secret") && usingOAuthEncryption()) options.secret = OAuthEncryption.seal(options.secret);  // 675
    ServiceConfiguration.configurations.insert(options);                                                            // 678
  };                                                                                                                // 679
                                                                                                                    //
  accounts._server.methods(methods);                                                                                // 681
};                                                                                                                  // 682
                                                                                                                    //
Ap._initAccountDataHooks = function () {                                                                            // 684
  var accounts = this;                                                                                              // 685
                                                                                                                    //
  accounts._server.onConnection(function (connection) {                                                             // 687
    accounts._accountData[connection.id] = {                                                                        // 688
      connection: connection                                                                                        // 689
    };                                                                                                              // 688
    connection.onClose(function () {                                                                                // 692
      accounts._removeTokenFromConnection(connection.id);                                                           // 693
                                                                                                                    //
      delete accounts._accountData[connection.id];                                                                  // 694
    });                                                                                                             // 695
  });                                                                                                               // 696
};                                                                                                                  // 697
                                                                                                                    //
Ap._initServerPublications = function () {                                                                          // 699
  var accounts = this; // Publish all login service configuration fields other than secret.                         // 700
                                                                                                                    //
  accounts._server.publish("meteor.loginServiceConfiguration", function () {                                        // 703
    var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;                               // 704
    return ServiceConfiguration.configurations.find({}, {                                                           // 706
      fields: {                                                                                                     // 706
        secret: 0                                                                                                   // 706
      }                                                                                                             // 706
    });                                                                                                             // 706
  }, {                                                                                                              // 707
    is_auto: true                                                                                                   // 707
  }); // not techincally autopublish, but stops the warning.                                                        // 707
  // Publish the current user's record to the client.                                                               // 709
                                                                                                                    //
                                                                                                                    //
  accounts._server.publish(null, function () {                                                                      // 710
    if (this.userId) {                                                                                              // 711
      return accounts.users.find({                                                                                  // 712
        _id: this.userId                                                                                            // 713
      }, {                                                                                                          // 712
        fields: {                                                                                                   // 715
          profile: 1,                                                                                               // 716
          username: 1,                                                                                              // 717
          emails: 1                                                                                                 // 718
        }                                                                                                           // 715
      });                                                                                                           // 714
    } else {                                                                                                        // 721
      return null;                                                                                                  // 722
    }                                                                                                               // 723
  }, /*suppress autopublish warning*/{                                                                              // 724
    is_auto: true                                                                                                   // 724
  }); // Use Meteor.startup to give other packages a chance to call                                                 // 724
  // addAutopublishFields.                                                                                          // 727
                                                                                                                    //
                                                                                                                    //
  Package.autopublish && Meteor.startup(function () {                                                               // 728
    // ['profile', 'username'] -> {profile: 1, username: 1}                                                         // 729
    var toFieldSelector = function (fields) {                                                                       // 730
      return _.object(_.map(fields, function (field) {                                                              // 731
        return [field, 1];                                                                                          // 732
      }));                                                                                                          // 733
    };                                                                                                              // 734
                                                                                                                    //
    accounts._server.publish(null, function () {                                                                    // 736
      if (this.userId) {                                                                                            // 737
        return accounts.users.find({                                                                                // 738
          _id: this.userId                                                                                          // 739
        }, {                                                                                                        // 738
          fields: toFieldSelector(accounts._autopublishFields.loggedInUser)                                         // 741
        });                                                                                                         // 740
      } else {                                                                                                      // 743
        return null;                                                                                                // 744
      }                                                                                                             // 745
    }, /*suppress autopublish warning*/{                                                                            // 746
      is_auto: true                                                                                                 // 746
    }); // XXX this publish is neither dedup-able nor is it optimized by our special                                // 746
    // treatment of queries on a specific _id. Therefore this will have O(n^2)                                      // 749
    // run-time performance every time a user document is changed (eg someone                                       // 750
    // logging in). If this is a problem, we can instead write a manual publish                                     // 751
    // function which filters out fields based on 'this.userId'.                                                    // 752
                                                                                                                    //
                                                                                                                    //
    accounts._server.publish(null, function () {                                                                    // 753
      var selector = this.userId ? {                                                                                // 754
        _id: {                                                                                                      // 755
          $ne: this.userId                                                                                          // 755
        }                                                                                                           // 755
      } : {};                                                                                                       // 754
      return accounts.users.find(selector, {                                                                        // 758
        fields: toFieldSelector(accounts._autopublishFields.otherUsers)                                             // 759
      });                                                                                                           // 758
    }, /*suppress autopublish warning*/{                                                                            // 761
      is_auto: true                                                                                                 // 761
    });                                                                                                             // 761
  });                                                                                                               // 762
}; // Add to the list of fields or subfields to be automatically                                                    // 763
// published if autopublish is on. Must be called from top-level                                                    // 766
// code (ie, before Meteor.startup hooks run).                                                                      // 767
//                                                                                                                  // 768
// @param opts {Object} with:                                                                                       // 769
//   - forLoggedInUser {Array} Array of fields published to the logged-in user                                      // 770
//   - forOtherUsers {Array} Array of fields published to users that aren't logged in                               // 771
                                                                                                                    //
                                                                                                                    //
Ap.addAutopublishFields = function (opts) {                                                                         // 772
  this._autopublishFields.loggedInUser.push.apply(this._autopublishFields.loggedInUser, opts.forLoggedInUser);      // 773
                                                                                                                    //
  this._autopublishFields.otherUsers.push.apply(this._autopublishFields.otherUsers, opts.forOtherUsers);            // 775
}; ///                                                                                                              // 777
/// ACCOUNT DATA                                                                                                    // 780
///                                                                                                                 // 781
// HACK: This is used by 'meteor-accounts' to get the loginToken for a                                              // 783
// connection. Maybe there should be a public way to do that.                                                       // 784
                                                                                                                    //
                                                                                                                    //
Ap._getAccountData = function (connectionId, field) {                                                               // 785
  var data = this._accountData[connectionId];                                                                       // 786
  return data && data[field];                                                                                       // 787
};                                                                                                                  // 788
                                                                                                                    //
Ap._setAccountData = function (connectionId, field, value) {                                                        // 790
  var data = this._accountData[connectionId]; // safety belt. shouldn't happen. accountData is set in onConnection,
  // we don't have a connectionId until it is set.                                                                  // 794
                                                                                                                    //
  if (!data) return;                                                                                                // 795
  if (value === undefined) delete data[field];else data[field] = value;                                             // 798
}; ///                                                                                                              // 802
/// RECONNECT TOKENS                                                                                                // 806
///                                                                                                                 // 807
/// support reconnecting using a meteor login token                                                                 // 808
                                                                                                                    //
                                                                                                                    //
Ap._hashLoginToken = function (loginToken) {                                                                        // 810
  var hash = crypto.createHash('sha256');                                                                           // 811
  hash.update(loginToken);                                                                                          // 812
  return hash.digest('base64');                                                                                     // 813
}; // {token, when} => {hashedToken, when}                                                                          // 814
                                                                                                                    //
                                                                                                                    //
Ap._hashStampedToken = function (stampedToken) {                                                                    // 818
  return _.extend(_.omit(stampedToken, 'token'), {                                                                  // 819
    hashedToken: this._hashLoginToken(stampedToken.token)                                                           // 820
  });                                                                                                               // 819
}; // Using $addToSet avoids getting an index error if another client                                               // 822
// logging in simultaneously has already inserted the new hashed                                                    // 826
// token.                                                                                                           // 827
                                                                                                                    //
                                                                                                                    //
Ap._insertHashedLoginToken = function (userId, hashedToken, query) {                                                // 828
  query = query ? _.clone(query) : {};                                                                              // 829
  query._id = userId;                                                                                               // 830
  this.users.update(query, {                                                                                        // 831
    $addToSet: {                                                                                                    // 832
      "services.resume.loginTokens": hashedToken                                                                    // 833
    }                                                                                                               // 832
  });                                                                                                               // 831
}; // Exported for tests.                                                                                           // 836
                                                                                                                    //
                                                                                                                    //
Ap._insertLoginToken = function (userId, stampedToken, query) {                                                     // 840
  this._insertHashedLoginToken(userId, this._hashStampedToken(stampedToken), query);                                // 841
};                                                                                                                  // 846
                                                                                                                    //
Ap._clearAllLoginTokens = function (userId) {                                                                       // 849
  this.users.update(userId, {                                                                                       // 850
    $set: {                                                                                                         // 851
      'services.resume.loginTokens': []                                                                             // 852
    }                                                                                                               // 851
  });                                                                                                               // 850
}; // test hook                                                                                                     // 855
                                                                                                                    //
                                                                                                                    //
Ap._getUserObserve = function (connectionId) {                                                                      // 858
  return this._userObservesForConnections[connectionId];                                                            // 859
}; // Clean up this connection's association with the token: that is, stop                                          // 860
// the observe that we started when we associated the connection with                                               // 863
// this token.                                                                                                      // 864
                                                                                                                    //
                                                                                                                    //
Ap._removeTokenFromConnection = function (connectionId) {                                                           // 865
  if (_.has(this._userObservesForConnections, connectionId)) {                                                      // 866
    var observe = this._userObservesForConnections[connectionId];                                                   // 867
                                                                                                                    //
    if (typeof observe === 'number') {                                                                              // 868
      // We're in the process of setting up an observe for this connection. We                                      // 869
      // can't clean up that observe yet, but if we delete the placeholder for                                      // 870
      // this connection, then the observe will get cleaned up as soon as it has                                    // 871
      // been set up.                                                                                               // 872
      delete this._userObservesForConnections[connectionId];                                                        // 873
    } else {                                                                                                        // 874
      delete this._userObservesForConnections[connectionId];                                                        // 875
      observe.stop();                                                                                               // 876
    }                                                                                                               // 877
  }                                                                                                                 // 878
};                                                                                                                  // 879
                                                                                                                    //
Ap._getLoginToken = function (connectionId) {                                                                       // 881
  return this._getAccountData(connectionId, 'loginToken');                                                          // 882
}; // newToken is a hashed token.                                                                                   // 883
                                                                                                                    //
                                                                                                                    //
Ap._setLoginToken = function (userId, connection, newToken) {                                                       // 886
  var self = this;                                                                                                  // 887
                                                                                                                    //
  self._removeTokenFromConnection(connection.id);                                                                   // 889
                                                                                                                    //
  self._setAccountData(connection.id, 'loginToken', newToken);                                                      // 890
                                                                                                                    //
  if (newToken) {                                                                                                   // 892
    // Set up an observe for this token. If the token goes away, we need                                            // 893
    // to close the connection.  We defer the observe because there's                                               // 894
    // no need for it to be on the critical path for login; we just need                                            // 895
    // to ensure that the connection will get closed at some point if                                               // 896
    // the token gets deleted.                                                                                      // 897
    //                                                                                                              // 898
    // Initially, we set the observe for this connection to a number; this                                          // 899
    // signifies to other code (which might run while we yield) that we are in                                      // 900
    // the process of setting up an observe for this connection. Once the                                           // 901
    // observe is ready to go, we replace the number with the real observe                                          // 902
    // handle (unless the placeholder has been deleted or replaced by a                                             // 903
    // different placehold number, signifying that the connection was closed                                        // 904
    // already -- in this case we just clean up the observe that we started).                                       // 905
    var myObserveNumber = ++self._nextUserObserveNumber;                                                            // 906
    self._userObservesForConnections[connection.id] = myObserveNumber;                                              // 907
    Meteor.defer(function () {                                                                                      // 908
      // If something else happened on this connection in the meantime (it got                                      // 909
      // closed, or another call to _setLoginToken happened), just do                                               // 910
      // nothing. We don't need to start an observe for an old connection or old                                    // 911
      // token.                                                                                                     // 912
      if (self._userObservesForConnections[connection.id] !== myObserveNumber) {                                    // 913
        return;                                                                                                     // 914
      }                                                                                                             // 915
                                                                                                                    //
      var foundMatchingUser; // Because we upgrade unhashed login tokens to hashed tokens at                        // 917
      // login time, sessions will only be logged in with a hashed                                                  // 919
      // token. Thus we only need to observe hashed tokens here.                                                    // 920
                                                                                                                    //
      var observe = self.users.find({                                                                               // 921
        _id: userId,                                                                                                // 922
        'services.resume.loginTokens.hashedToken': newToken                                                         // 923
      }, {                                                                                                          // 921
        fields: {                                                                                                   // 924
          _id: 1                                                                                                    // 924
        }                                                                                                           // 924
      }).observeChanges({                                                                                           // 924
        added: function () {                                                                                        // 925
          foundMatchingUser = true;                                                                                 // 926
        },                                                                                                          // 927
        removed: function () {                                                                                      // 928
          connection.close(); // The onClose callback for the connection takes care of                              // 929
          // cleaning up the observe handle and any other state we have                                             // 931
          // lying around.                                                                                          // 932
        }                                                                                                           // 933
      }); // If the user ran another login or logout command we were waiting for the                                // 924
      // defer or added to fire (ie, another call to _setLoginToken occurred),                                      // 937
      // then we let the later one win (start an observe, etc) and just stop our                                    // 938
      // observe now.                                                                                               // 939
      //                                                                                                            // 940
      // Similarly, if the connection was already closed, then the onClose                                          // 941
      // callback would have called _removeTokenFromConnection and there won't                                      // 942
      // be an entry in _userObservesForConnections. We can stop the observe.                                       // 943
                                                                                                                    //
      if (self._userObservesForConnections[connection.id] !== myObserveNumber) {                                    // 944
        observe.stop();                                                                                             // 945
        return;                                                                                                     // 946
      }                                                                                                             // 947
                                                                                                                    //
      self._userObservesForConnections[connection.id] = observe;                                                    // 949
                                                                                                                    //
      if (!foundMatchingUser) {                                                                                     // 951
        // We've set up an observe on the user associated with `newToken`,                                          // 952
        // so if the new token is removed from the database, we'll close                                            // 953
        // the connection. But the token might have already been deleted                                            // 954
        // before we set up the observe, which wouldn't have closed the                                             // 955
        // connection because the observe wasn't running yet.                                                       // 956
        connection.close();                                                                                         // 957
      }                                                                                                             // 958
    });                                                                                                             // 959
  }                                                                                                                 // 960
};                                                                                                                  // 961
                                                                                                                    //
function setupDefaultLoginHandlers(accounts) {                                                                      // 963
  accounts.registerLoginHandler("resume", function (options) {                                                      // 964
    return defaultResumeLoginHandler.call(this, accounts, options);                                                 // 965
  });                                                                                                               // 966
} // Login handler for resume tokens.                                                                               // 967
                                                                                                                    //
                                                                                                                    //
function defaultResumeLoginHandler(accounts, options) {                                                             // 970
  if (!options.resume) return undefined;                                                                            // 971
  check(options.resume, String);                                                                                    // 974
                                                                                                                    //
  var hashedToken = accounts._hashLoginToken(options.resume); // First look for just the new-style hashed login token, to avoid
  // sending the unhashed token to the database in a query if we don't                                              // 979
  // need to.                                                                                                       // 980
                                                                                                                    //
                                                                                                                    //
  var user = accounts.users.findOne({                                                                               // 981
    "services.resume.loginTokens.hashedToken": hashedToken                                                          // 982
  });                                                                                                               // 982
                                                                                                                    //
  if (!user) {                                                                                                      // 984
    // If we didn't find the hashed login token, try also looking for                                               // 985
    // the old-style unhashed token.  But we need to look for either                                                // 986
    // the old-style token OR the new-style token, because another                                                  // 987
    // client connection logging in simultaneously might have already                                               // 988
    // converted the token.                                                                                         // 989
    user = accounts.users.findOne({                                                                                 // 990
      $or: [{                                                                                                       // 991
        "services.resume.loginTokens.hashedToken": hashedToken                                                      // 992
      }, {                                                                                                          // 992
        "services.resume.loginTokens.token": options.resume                                                         // 993
      }]                                                                                                            // 993
    });                                                                                                             // 990
  }                                                                                                                 // 996
                                                                                                                    //
  if (!user) return {                                                                                               // 998
    error: new Meteor.Error(403, "You've been logged out by the server. Please log in again.")                      // 1000
  }; // Find the token, which will either be an object with fields                                                  // 999
  // {hashedToken, when} for a hashed token or {token, when} for an                                                 // 1004
  // unhashed token.                                                                                                // 1005
                                                                                                                    //
  var oldUnhashedStyleToken;                                                                                        // 1006
                                                                                                                    //
  var token = _.find(user.services.resume.loginTokens, function (token) {                                           // 1007
    return token.hashedToken === hashedToken;                                                                       // 1008
  });                                                                                                               // 1009
                                                                                                                    //
  if (token) {                                                                                                      // 1010
    oldUnhashedStyleToken = false;                                                                                  // 1011
  } else {                                                                                                          // 1012
    token = _.find(user.services.resume.loginTokens, function (token) {                                             // 1013
      return token.token === options.resume;                                                                        // 1014
    });                                                                                                             // 1015
    oldUnhashedStyleToken = true;                                                                                   // 1016
  }                                                                                                                 // 1017
                                                                                                                    //
  var tokenExpires = accounts._tokenExpiration(token.when);                                                         // 1019
                                                                                                                    //
  if (new Date() >= tokenExpires) return {                                                                          // 1020
    userId: user._id,                                                                                               // 1022
    error: new Meteor.Error(403, "Your session has expired. Please log in again.")                                  // 1023
  }; // Update to a hashed token when an unhashed token is encountered.                                             // 1021
                                                                                                                    //
  if (oldUnhashedStyleToken) {                                                                                      // 1027
    // Only add the new hashed token if the old unhashed token still                                                // 1028
    // exists (this avoids resurrecting the token if it was deleted                                                 // 1029
    // after we read it).  Using $addToSet avoids getting an index                                                  // 1030
    // error if another client logging in simultaneously has already                                                // 1031
    // inserted the new hashed token.                                                                               // 1032
    accounts.users.update({                                                                                         // 1033
      _id: user._id,                                                                                                // 1035
      "services.resume.loginTokens.token": options.resume                                                           // 1036
    }, {                                                                                                            // 1034
      $addToSet: {                                                                                                  // 1038
        "services.resume.loginTokens": {                                                                            // 1039
          "hashedToken": hashedToken,                                                                               // 1040
          "when": token.when                                                                                        // 1041
        }                                                                                                           // 1039
      }                                                                                                             // 1038
    }); // Remove the old token *after* adding the new, since otherwise                                             // 1038
    // another client trying to login between our removing the old and                                              // 1047
    // adding the new wouldn't find a token to login with.                                                          // 1048
                                                                                                                    //
    accounts.users.update(user._id, {                                                                               // 1049
      $pull: {                                                                                                      // 1050
        "services.resume.loginTokens": {                                                                            // 1051
          "token": options.resume                                                                                   // 1051
        }                                                                                                           // 1051
      }                                                                                                             // 1050
    });                                                                                                             // 1049
  }                                                                                                                 // 1054
                                                                                                                    //
  return {                                                                                                          // 1056
    userId: user._id,                                                                                               // 1057
    stampedLoginToken: {                                                                                            // 1058
      token: options.resume,                                                                                        // 1059
      when: token.when                                                                                              // 1060
    }                                                                                                               // 1058
  };                                                                                                                // 1056
} // (Also used by Meteor Accounts server and tests).                                                               // 1063
//                                                                                                                  // 1066
                                                                                                                    //
                                                                                                                    //
Ap._generateStampedLoginToken = function () {                                                                       // 1067
  return {                                                                                                          // 1068
    token: Random.secret(),                                                                                         // 1069
    when: new Date()                                                                                                // 1070
  };                                                                                                                // 1068
}; ///                                                                                                              // 1072
/// TOKEN EXPIRATION                                                                                                // 1075
///                                                                                                                 // 1076
                                                                                                                    //
                                                                                                                    //
function expirePasswordToken(accounts, oldestValidDate, tokenFilter, userId) {                                      // 1078
  var userFilter = userId ? {                                                                                       // 1079
    _id: userId                                                                                                     // 1079
  } : {};                                                                                                           // 1079
  var resetRangeOr = {                                                                                              // 1080
    $or: [{                                                                                                         // 1081
      "services.password.reset.when": {                                                                             // 1082
        $lt: oldestValidDate                                                                                        // 1082
      }                                                                                                             // 1082
    }, {                                                                                                            // 1082
      "services.password.reset.when": {                                                                             // 1083
        $lt: +oldestValidDate                                                                                       // 1083
      }                                                                                                             // 1083
    }]                                                                                                              // 1083
  };                                                                                                                // 1080
  var expireFilter = {                                                                                              // 1086
    $and: [tokenFilter, resetRangeOr]                                                                               // 1086
  };                                                                                                                // 1086
  accounts.users.update((0, _extends3.default)({}, userFilter, expireFilter), {                                     // 1088
    $unset: {                                                                                                       // 1089
      "services.password.reset": ""                                                                                 // 1090
    }                                                                                                               // 1089
  }, {                                                                                                              // 1088
    multi: true                                                                                                     // 1092
  });                                                                                                               // 1092
} // Deletes expired tokens from the database and closes all open connections                                       // 1093
// associated with these tokens.                                                                                    // 1096
//                                                                                                                  // 1097
// Exported for tests. Also, the arguments are only used by                                                         // 1098
// tests. oldestValidDate is simulate expiring tokens without waiting                                               // 1099
// for them to actually expire. userId is used by tests to only expire                                              // 1100
// tokens for the test user.                                                                                        // 1101
                                                                                                                    //
                                                                                                                    //
Ap._expireTokens = function (oldestValidDate, userId) {                                                             // 1102
  var tokenLifetimeMs = this._getTokenLifetimeMs(); // when calling from a test with extra arguments, you must specify both!
                                                                                                                    //
                                                                                                                    //
  if (oldestValidDate && !userId || !oldestValidDate && userId) {                                                   // 1106
    throw new Error("Bad test. Must specify both oldestValidDate and userId.");                                     // 1107
  }                                                                                                                 // 1108
                                                                                                                    //
  oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);                                      // 1110
  var userFilter = userId ? {                                                                                       // 1112
    _id: userId                                                                                                     // 1112
  } : {}; // Backwards compatible with older versions of meteor that stored login token                             // 1112
  // timestamps as numbers.                                                                                         // 1116
                                                                                                                    //
  this.users.update(_.extend(userFilter, {                                                                          // 1117
    $or: [{                                                                                                         // 1118
      "services.resume.loginTokens.when": {                                                                         // 1119
        $lt: oldestValidDate                                                                                        // 1119
      }                                                                                                             // 1119
    }, {                                                                                                            // 1119
      "services.resume.loginTokens.when": {                                                                         // 1120
        $lt: +oldestValidDate                                                                                       // 1120
      }                                                                                                             // 1120
    }]                                                                                                              // 1120
  }), {                                                                                                             // 1117
    $pull: {                                                                                                        // 1123
      "services.resume.loginTokens": {                                                                              // 1124
        $or: [{                                                                                                     // 1125
          when: {                                                                                                   // 1126
            $lt: oldestValidDate                                                                                    // 1126
          }                                                                                                         // 1126
        }, {                                                                                                        // 1126
          when: {                                                                                                   // 1127
            $lt: +oldestValidDate                                                                                   // 1127
          }                                                                                                         // 1127
        }]                                                                                                          // 1127
      }                                                                                                             // 1124
    }                                                                                                               // 1123
  }, {                                                                                                              // 1122
    multi: true                                                                                                     // 1131
  }); // The observe on Meteor.users will take care of closing connections for                                      // 1131
  // expired tokens.                                                                                                // 1133
}; // Deletes expired password reset tokens from the database.                                                      // 1134
//                                                                                                                  // 1137
// Exported for tests. Also, the arguments are only used by                                                         // 1138
// tests. oldestValidDate is simulate expiring tokens without waiting                                               // 1139
// for them to actually expire. userId is used by tests to only expire                                              // 1140
// tokens for the test user.                                                                                        // 1141
                                                                                                                    //
                                                                                                                    //
Ap._expirePasswordResetTokens = function (oldestValidDate, userId) {                                                // 1142
  var tokenLifetimeMs = this._getPasswordResetTokenLifetimeMs(); // when calling from a test with extra arguments, you must specify both!
                                                                                                                    //
                                                                                                                    //
  if (oldestValidDate && !userId || !oldestValidDate && userId) {                                                   // 1146
    throw new Error("Bad test. Must specify both oldestValidDate and userId.");                                     // 1147
  }                                                                                                                 // 1148
                                                                                                                    //
  oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);                                      // 1150
  var tokenFilter = {                                                                                               // 1153
    $or: [{                                                                                                         // 1154
      "services.password.reset.reason": "reset"                                                                     // 1155
    }, {                                                                                                            // 1155
      "services.password.reset.reason": {                                                                           // 1156
        $exists: false                                                                                              // 1156
      }                                                                                                             // 1156
    }]                                                                                                              // 1156
  };                                                                                                                // 1153
  expirePasswordToken(this, oldestValidDate, tokenFilter, userId);                                                  // 1160
}; // Deletes expired password enroll tokens from the database.                                                     // 1161
//                                                                                                                  // 1164
// Exported for tests. Also, the arguments are only used by                                                         // 1165
// tests. oldestValidDate is simulate expiring tokens without waiting                                               // 1166
// for them to actually expire. userId is used by tests to only expire                                              // 1167
// tokens for the test user.                                                                                        // 1168
                                                                                                                    //
                                                                                                                    //
Ap._expirePasswordEnrollTokens = function (oldestValidDate, userId) {                                               // 1169
  var tokenLifetimeMs = this._getPasswordEnrollTokenLifetimeMs(); // when calling from a test with extra arguments, you must specify both!
                                                                                                                    //
                                                                                                                    //
  if (oldestValidDate && !userId || !oldestValidDate && userId) {                                                   // 1173
    throw new Error("Bad test. Must specify both oldestValidDate and userId.");                                     // 1174
  }                                                                                                                 // 1175
                                                                                                                    //
  oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);                                      // 1177
  var tokenFilter = {                                                                                               // 1180
    "services.password.reset.reason": "enroll"                                                                      // 1181
  };                                                                                                                // 1180
  expirePasswordToken(this, oldestValidDate, tokenFilter, userId);                                                  // 1184
}; // @override from accounts_common.js                                                                             // 1185
                                                                                                                    //
                                                                                                                    //
Ap.config = function (options) {                                                                                    // 1188
  // Call the overridden implementation of the method.                                                              // 1189
  var superResult = AccountsCommon.prototype.config.apply(this, arguments); // If the user set loginExpirationInDays to null, then we need to clear the
  // timer that periodically expires tokens.                                                                        // 1193
                                                                                                                    //
  if (_.has(this._options, "loginExpirationInDays") && this._options.loginExpirationInDays === null && this.expireTokenInterval) {
    Meteor.clearInterval(this.expireTokenInterval);                                                                 // 1197
    this.expireTokenInterval = null;                                                                                // 1198
  }                                                                                                                 // 1199
                                                                                                                    //
  return superResult;                                                                                               // 1201
};                                                                                                                  // 1202
                                                                                                                    //
function setExpireTokensInterval(accounts) {                                                                        // 1204
  accounts.expireTokenInterval = Meteor.setInterval(function () {                                                   // 1205
    accounts._expireTokens();                                                                                       // 1206
                                                                                                                    //
    accounts._expirePasswordResetTokens();                                                                          // 1207
                                                                                                                    //
    accounts._expirePasswordEnrollTokens();                                                                         // 1208
  }, EXPIRE_TOKENS_INTERVAL_MS);                                                                                    // 1209
} ///                                                                                                               // 1210
/// OAuth Encryption Support                                                                                        // 1214
///                                                                                                                 // 1215
                                                                                                                    //
                                                                                                                    //
var OAuthEncryption = Package["oauth-encryption"] && Package["oauth-encryption"].OAuthEncryption;                   // 1217
                                                                                                                    //
function usingOAuthEncryption() {                                                                                   // 1221
  return OAuthEncryption && OAuthEncryption.keyIsLoaded();                                                          // 1222
} // OAuth service data is temporarily stored in the pending credentials                                            // 1223
// collection during the oauth authentication process.  Sensitive data                                              // 1227
// such as access tokens are encrypted without the user id because                                                  // 1228
// we don't know the user id yet.  We re-encrypt these fields with the                                              // 1229
// user id included when storing the service data permanently in                                                    // 1230
// the users collection.                                                                                            // 1231
//                                                                                                                  // 1232
                                                                                                                    //
                                                                                                                    //
function pinEncryptedFieldsToUser(serviceData, userId) {                                                            // 1233
  _.each(_.keys(serviceData), function (key) {                                                                      // 1234
    var value = serviceData[key];                                                                                   // 1235
    if (OAuthEncryption && OAuthEncryption.isSealed(value)) value = OAuthEncryption.seal(OAuthEncryption.open(value), userId);
    serviceData[key] = value;                                                                                       // 1238
  });                                                                                                               // 1239
} // Encrypt unencrypted login service secrets when oauth-encryption is                                             // 1240
// added.                                                                                                           // 1244
//                                                                                                                  // 1245
// XXX For the oauthSecretKey to be available here at startup, the                                                  // 1246
// developer must call Accounts.config({oauthSecretKey: ...}) at load                                               // 1247
// time, instead of in a Meteor.startup block, because the startup                                                  // 1248
// block in the app code will run after this accounts-base startup                                                  // 1249
// block.  Perhaps we need a post-startup callback?                                                                 // 1250
                                                                                                                    //
                                                                                                                    //
Meteor.startup(function () {                                                                                        // 1252
  if (!usingOAuthEncryption()) {                                                                                    // 1253
    return;                                                                                                         // 1254
  }                                                                                                                 // 1255
                                                                                                                    //
  var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;                                 // 1257
  ServiceConfiguration.configurations.find({                                                                        // 1260
    $and: [{                                                                                                        // 1261
      secret: {                                                                                                     // 1262
        $exists: true                                                                                               // 1262
      }                                                                                                             // 1262
    }, {                                                                                                            // 1261
      "secret.algorithm": {                                                                                         // 1264
        $exists: false                                                                                              // 1264
      }                                                                                                             // 1264
    }]                                                                                                              // 1263
  }).forEach(function (config) {                                                                                    // 1260
    ServiceConfiguration.configurations.update(config._id, {                                                        // 1267
      $set: {                                                                                                       // 1268
        secret: OAuthEncryption.seal(config.secret)                                                                 // 1269
      }                                                                                                             // 1268
    });                                                                                                             // 1267
  });                                                                                                               // 1272
}); // XXX see comment on Accounts.createUser in passwords_server about adding a                                    // 1273
// second "server options" argument.                                                                                // 1276
                                                                                                                    //
function defaultCreateUserHook(options, user) {                                                                     // 1277
  if (options.profile) user.profile = options.profile;                                                              // 1278
  return user;                                                                                                      // 1280
} // Called by accounts-password                                                                                    // 1281
                                                                                                                    //
                                                                                                                    //
Ap.insertUserDoc = function (options, user) {                                                                       // 1284
  // - clone user document, to protect from modification                                                            // 1285
  // - add createdAt timestamp                                                                                      // 1286
  // - prepare an _id, so that you can modify other collections (eg                                                 // 1287
  // create a first task for every new user)                                                                        // 1288
  //                                                                                                                // 1289
  // XXX If the onCreateUser or validateNewUser hooks fail, we might                                                // 1290
  // end up having modified some other collection                                                                   // 1291
  // inappropriately. The solution is probably to have onCreateUser                                                 // 1292
  // accept two callbacks - one that gets called before inserting                                                   // 1293
  // the user document (in which you can modify its contents), and                                                  // 1294
  // one that gets called after (in which you should change other                                                   // 1295
  // collections)                                                                                                   // 1296
  user = _.extend({                                                                                                 // 1297
    createdAt: new Date(),                                                                                          // 1298
    _id: Random.id()                                                                                                // 1299
  }, user);                                                                                                         // 1297
                                                                                                                    //
  if (user.services) {                                                                                              // 1302
    _.each(user.services, function (serviceData) {                                                                  // 1303
      pinEncryptedFieldsToUser(serviceData, user._id);                                                              // 1304
    });                                                                                                             // 1305
  }                                                                                                                 // 1306
                                                                                                                    //
  var fullUser;                                                                                                     // 1308
                                                                                                                    //
  if (this._onCreateUserHook) {                                                                                     // 1309
    fullUser = this._onCreateUserHook(options, user); // This is *not* part of the API. We need this because we can't isolate
    // the global server environment between tests, meaning we can't test                                           // 1313
    // both having a create user hook set and not having one set.                                                   // 1314
                                                                                                                    //
    if (fullUser === 'TEST DEFAULT HOOK') fullUser = defaultCreateUserHook(options, user);                          // 1315
  } else {                                                                                                          // 1317
    fullUser = defaultCreateUserHook(options, user);                                                                // 1318
  }                                                                                                                 // 1319
                                                                                                                    //
  _.each(this._validateNewUserHooks, function (hook) {                                                              // 1321
    if (!hook(fullUser)) throw new Meteor.Error(403, "User validation failed");                                     // 1322
  });                                                                                                               // 1324
                                                                                                                    //
  var userId;                                                                                                       // 1326
                                                                                                                    //
  try {                                                                                                             // 1327
    userId = this.users.insert(fullUser);                                                                           // 1328
  } catch (e) {                                                                                                     // 1329
    // XXX string parsing sucks, maybe                                                                              // 1330
    // https://jira.mongodb.org/browse/SERVER-3069 will get fixed one day                                           // 1331
    if (e.name !== 'MongoError') throw e;                                                                           // 1332
    if (e.code !== 11000) throw e;                                                                                  // 1333
    if (e.errmsg.indexOf('emails.address') !== -1) throw new Meteor.Error(403, "Email already exists.");            // 1334
    if (e.errmsg.indexOf('username') !== -1) throw new Meteor.Error(403, "Username already exists."); // XXX better error reporting for services.facebook.id duplicate, etc
                                                                                                                    //
    throw e;                                                                                                        // 1339
  }                                                                                                                 // 1340
                                                                                                                    //
  return userId;                                                                                                    // 1341
}; // Helper function: returns false if email does not match company domain from                                    // 1342
// the configuration.                                                                                               // 1345
                                                                                                                    //
                                                                                                                    //
Ap._testEmailDomain = function (email) {                                                                            // 1346
  var domain = this._options.restrictCreationByEmailDomain;                                                         // 1347
  return !domain || _.isFunction(domain) && domain(email) || _.isString(domain) && new RegExp('@' + Meteor._escapeRegExp(domain) + '$', 'i').test(email);
}; // Validate new user's email or Google/Facebook/GitHub account's email                                           // 1352
                                                                                                                    //
                                                                                                                    //
function defaultValidateNewUserHook(user) {                                                                         // 1355
  var self = this;                                                                                                  // 1356
  var domain = self._options.restrictCreationByEmailDomain;                                                         // 1357
  if (!domain) return true;                                                                                         // 1358
  var emailIsGood = false;                                                                                          // 1361
                                                                                                                    //
  if (!_.isEmpty(user.emails)) {                                                                                    // 1362
    emailIsGood = _.any(user.emails, function (email) {                                                             // 1363
      return self._testEmailDomain(email.address);                                                                  // 1364
    });                                                                                                             // 1365
  } else if (!_.isEmpty(user.services)) {                                                                           // 1366
    // Find any email of any service and check it                                                                   // 1367
    emailIsGood = _.any(user.services, function (service) {                                                         // 1368
      return service.email && self._testEmailDomain(service.email);                                                 // 1369
    });                                                                                                             // 1370
  }                                                                                                                 // 1371
                                                                                                                    //
  if (emailIsGood) return true;                                                                                     // 1373
  if (_.isString(domain)) throw new Meteor.Error(403, "@" + domain + " email required");else throw new Meteor.Error(403, "Email doesn't match the criteria.");
} ///                                                                                                               // 1380
/// MANAGING USER OBJECTS                                                                                           // 1383
///                                                                                                                 // 1384
// Updates or creates a user after we authenticate with a 3rd party.                                                // 1386
//                                                                                                                  // 1387
// @param serviceName {String} Service name (eg, twitter).                                                          // 1388
// @param serviceData {Object} Data to store in the user's record                                                   // 1389
//        under services[serviceName]. Must include an "id" field                                                   // 1390
//        which is a unique identifier for the user in the service.                                                 // 1391
// @param options {Object, optional} Other options to pass to insertUserDoc                                         // 1392
//        (eg, profile)                                                                                             // 1393
// @returns {Object} Object with token and id keys, like the result                                                 // 1394
//        of the "login" method.                                                                                    // 1395
//                                                                                                                  // 1396
                                                                                                                    //
                                                                                                                    //
Ap.updateOrCreateUserFromExternalService = function (serviceName, serviceData, options) {                           // 1397
  options = _.clone(options || {});                                                                                 // 1402
  if (serviceName === "password" || serviceName === "resume") throw new Error("Can't use updateOrCreateUserFromExternalService with internal service " + serviceName);
  if (!_.has(serviceData, 'id')) throw new Error("Service data for service " + serviceName + " must include id"); // Look for a user with the appropriate service user id.
                                                                                                                    //
  var selector = {};                                                                                                // 1413
  var serviceIdKey = "services." + serviceName + ".id"; // XXX Temporary special case for Twitter. (Issue #629)     // 1414
  //   The serviceData.id will be a string representation of an integer.                                            // 1417
  //   We want it to match either a stored string or int representation.                                            // 1418
  //   This is to cater to earlier versions of Meteor storing twitter                                               // 1419
  //   user IDs in number form, and recent versions storing them as strings.                                        // 1420
  //   This can be removed once migration technology is in place, and twitter                                       // 1421
  //   users stored with integer IDs have been migrated to string IDs.                                              // 1422
                                                                                                                    //
  if (serviceName === "twitter" && !isNaN(serviceData.id)) {                                                        // 1423
    selector["$or"] = [{}, {}];                                                                                     // 1424
    selector["$or"][0][serviceIdKey] = serviceData.id;                                                              // 1425
    selector["$or"][1][serviceIdKey] = parseInt(serviceData.id, 10);                                                // 1426
  } else {                                                                                                          // 1427
    selector[serviceIdKey] = serviceData.id;                                                                        // 1428
  }                                                                                                                 // 1429
                                                                                                                    //
  var user = this.users.findOne(selector);                                                                          // 1431
                                                                                                                    //
  if (user) {                                                                                                       // 1433
    pinEncryptedFieldsToUser(serviceData, user._id); // We *don't* process options (eg, profile) for update, but we do replace
    // the serviceData (eg, so that we keep an unexpired access token and                                           // 1437
    // don't cache old email addresses in serviceData.email).                                                       // 1438
    // XXX provide an onUpdateUser hook which would let apps update                                                 // 1439
    //     the profile too                                                                                          // 1440
                                                                                                                    //
    var setAttrs = {};                                                                                              // 1441
                                                                                                                    //
    _.each(serviceData, function (value, key) {                                                                     // 1442
      setAttrs["services." + serviceName + "." + key] = value;                                                      // 1443
    }); // XXX Maybe we should re-use the selector above and notice if the update                                   // 1444
    //     touches nothing?                                                                                         // 1447
                                                                                                                    //
                                                                                                                    //
    this.users.update(user._id, {                                                                                   // 1448
      $set: setAttrs                                                                                                // 1449
    });                                                                                                             // 1448
    return {                                                                                                        // 1452
      type: serviceName,                                                                                            // 1453
      userId: user._id                                                                                              // 1454
    };                                                                                                              // 1452
  } else {                                                                                                          // 1457
    // Create a new user with the service data. Pass other options through to                                       // 1458
    // insertUserDoc.                                                                                               // 1459
    user = {                                                                                                        // 1460
      services: {}                                                                                                  // 1460
    };                                                                                                              // 1460
    user.services[serviceName] = serviceData;                                                                       // 1461
    return {                                                                                                        // 1462
      type: serviceName,                                                                                            // 1463
      userId: this.insertUserDoc(options, user)                                                                     // 1464
    };                                                                                                              // 1462
  }                                                                                                                 // 1466
};                                                                                                                  // 1467
                                                                                                                    //
function setupUsersCollection(users) {                                                                              // 1469
  ///                                                                                                               // 1470
  /// RESTRICTING WRITES TO USER OBJECTS                                                                            // 1471
  ///                                                                                                               // 1472
  users.allow({                                                                                                     // 1473
    // clients can modify the profile field of their own document, and                                              // 1474
    // nothing else.                                                                                                // 1475
    update: function (userId, user, fields, modifier) {                                                             // 1476
      // make sure it is our record                                                                                 // 1477
      if (user._id !== userId) return false; // user can only modify the 'profile' field. sets to multiple          // 1478
      // sub-keys (eg profile.foo and profile.bar) are merged into entry                                            // 1482
      // in the fields list.                                                                                        // 1483
                                                                                                                    //
      if (fields.length !== 1 || fields[0] !== 'profile') return false;                                             // 1484
      return true;                                                                                                  // 1487
    },                                                                                                              // 1488
    fetch: ['_id'] // we only look at _id.                                                                          // 1489
                                                                                                                    //
  }); /// DEFAULT INDEXES ON USERS                                                                                  // 1473
                                                                                                                    //
  users._ensureIndex('username', {                                                                                  // 1493
    unique: 1,                                                                                                      // 1493
    sparse: 1                                                                                                       // 1493
  });                                                                                                               // 1493
                                                                                                                    //
  users._ensureIndex('emails.address', {                                                                            // 1494
    unique: 1,                                                                                                      // 1494
    sparse: 1                                                                                                       // 1494
  });                                                                                                               // 1494
                                                                                                                    //
  users._ensureIndex('services.resume.loginTokens.hashedToken', {                                                   // 1495
    unique: 1,                                                                                                      // 1496
    sparse: 1                                                                                                       // 1496
  });                                                                                                               // 1496
                                                                                                                    //
  users._ensureIndex('services.resume.loginTokens.token', {                                                         // 1497
    unique: 1,                                                                                                      // 1498
    sparse: 1                                                                                                       // 1498
  }); // For taking care of logoutOtherClients calls that crashed before the                                        // 1498
  // tokens were deleted.                                                                                           // 1500
                                                                                                                    //
                                                                                                                    //
  users._ensureIndex('services.resume.haveLoginTokensToDelete', {                                                   // 1501
    sparse: 1                                                                                                       // 1502
  }); // For expiring login tokens                                                                                  // 1502
                                                                                                                    //
                                                                                                                    //
  users._ensureIndex("services.resume.loginTokens.when", {                                                          // 1504
    sparse: 1                                                                                                       // 1504
  }); // For expiring password tokens                                                                               // 1504
                                                                                                                    //
                                                                                                                    //
  users._ensureIndex('services.password.reset.when', {                                                              // 1506
    sparse: 1                                                                                                       // 1506
  });                                                                                                               // 1506
} ///                                                                                                               // 1507
/// CLEAN UP FOR `logoutOtherClients`                                                                               // 1510
///                                                                                                                 // 1511
                                                                                                                    //
                                                                                                                    //
Ap._deleteSavedTokensForUser = function (userId, tokensToDelete) {                                                  // 1513
  if (tokensToDelete) {                                                                                             // 1514
    this.users.update(userId, {                                                                                     // 1515
      $unset: {                                                                                                     // 1516
        "services.resume.haveLoginTokensToDelete": 1,                                                               // 1517
        "services.resume.loginTokensToDelete": 1                                                                    // 1518
      },                                                                                                            // 1516
      $pullAll: {                                                                                                   // 1520
        "services.resume.loginTokens": tokensToDelete                                                               // 1521
      }                                                                                                             // 1520
    });                                                                                                             // 1515
  }                                                                                                                 // 1524
};                                                                                                                  // 1525
                                                                                                                    //
Ap._deleteSavedTokensForAllUsersOnStartup = function () {                                                           // 1527
  var self = this; // If we find users who have saved tokens to delete on startup, delete                           // 1528
  // them now. It's possible that the server could have crashed and come                                            // 1531
  // back up before new tokens are found in localStorage, but this                                                  // 1532
  // shouldn't happen very often. We shouldn't put a delay here because                                             // 1533
  // that would give a lot of power to an attacker with a stolen login                                              // 1534
  // token and the ability to crash the server.                                                                     // 1535
                                                                                                                    //
  Meteor.startup(function () {                                                                                      // 1536
    self.users.find({                                                                                               // 1537
      "services.resume.haveLoginTokensToDelete": true                                                               // 1538
    }, {                                                                                                            // 1537
      "services.resume.loginTokensToDelete": 1                                                                      // 1540
    }).forEach(function (user) {                                                                                    // 1539
      self._deleteSavedTokensForUser(user._id, user.services.resume.loginTokensToDelete);                           // 1542
    });                                                                                                             // 1546
  });                                                                                                               // 1547
};                                                                                                                  // 1548
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"url_server.js":["./accounts_server.js",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/accounts-base/url_server.js                                                                             //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var AccountsServer = void 0;                                                                                        // 1
module.importSync("./accounts_server.js", {                                                                         // 1
  AccountsServer: function (v) {                                                                                    // 1
    AccountsServer = v;                                                                                             // 1
  }                                                                                                                 // 1
}, 0);                                                                                                              // 1
// XXX These should probably not actually be public?                                                                // 3
AccountsServer.prototype.urls = {                                                                                   // 5
  resetPassword: function (token) {                                                                                 // 6
    return Meteor.absoluteUrl('#/reset-password/' + token);                                                         // 7
  },                                                                                                                // 8
  verifyEmail: function (token) {                                                                                   // 10
    return Meteor.absoluteUrl('#/verify-email/' + token);                                                           // 11
  },                                                                                                                // 12
  enrollAccount: function (token) {                                                                                 // 14
    return Meteor.absoluteUrl('#/enroll-account/' + token);                                                         // 15
  }                                                                                                                 // 16
};                                                                                                                  // 5
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/accounts-base/server_main.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['accounts-base'] = exports, {
  Accounts: Accounts
});

})();

//# sourceMappingURL=accounts-base.js.map
