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
var _ = Package.underscore._;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;

/* Package-scope variables */
var Reload;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// packages/reload/reload.js                                                               //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
/**                                                                                        // 1
 * This code does _NOT_ support hot (session-restoring) reloads on                         // 2
 * IE6,7. It only works on browsers with sessionStorage support.                           // 3
 *                                                                                         // 4
 * There are a couple approaches to add IE6,7 support:                                     // 5
 *                                                                                         // 6
 * - use IE's "userData" mechanism in combination with window.name.                        // 7
 * This mostly works, however the problem is that it can not get to the                    // 8
 * data until after DOMReady. This is a problem for us since this API                      // 9
 * relies on the data being ready before API users run. We could                           // 10
 * refactor using Meteor.startup in all API users, but that might slow                     // 11
 * page loads as we couldn't start the stream until after DOMReady.                        // 12
 * Here are some resources on this approach:                                               // 13
 * https://github.com/hugeinc/USTORE.js                                                    // 14
 * http://thudjs.tumblr.com/post/419577524/localstorage-userdata                           // 15
 * http://www.javascriptkit.com/javatutors/domstorage2.shtml                               // 16
 *                                                                                         // 17
 * - POST the data to the server, and have the server send it back on                      // 18
 * page load. This is nice because it sidesteps all the local storage                      // 19
 * compatibility issues, however it is kinda tricky. We can use a unique                   // 20
 * token in the URL, then get rid of it with HTML5 pushstate, but that                     // 21
 * only works on pushstate browsers.                                                       // 22
 *                                                                                         // 23
 * This will all need to be reworked entirely when we add server-side                      // 24
 * HTML rendering. In that case, the server will need to have access to                    // 25
 * the client's session to render properly.                                                // 26
 */                                                                                        // 27
                                                                                           // 28
// XXX when making this API public, also expose a flag for the app                         // 29
// developer to know whether a hot code push is happening. This is                         // 30
// useful for apps using `window.onbeforeunload`. See                                      // 31
// https://github.com/meteor/meteor/pull/657                                               // 32
                                                                                           // 33
Reload = {};                                                                               // 34
                                                                                           // 35
var KEY_NAME = 'Meteor_Reload';                                                            // 36
                                                                                           // 37
var old_data = {};                                                                         // 38
// read in old data at startup.                                                            // 39
var old_json;                                                                              // 40
                                                                                           // 41
// This logic for sessionStorage detection is based on browserstate/history.js             // 42
var safeSessionStorage = null;                                                             // 43
try {                                                                                      // 44
  // This throws a SecurityError on Chrome if cookies & localStorage are                   // 45
  // explicitly disabled                                                                   // 46
  //                                                                                       // 47
  // On Firefox with dom.storage.enabled set to false, sessionStorage is null              // 48
  //                                                                                       // 49
  // We can't even do (typeof sessionStorage) on Chrome, it throws.  So we rely            // 50
  // on the throw if sessionStorage == null; the alternative is browser                    // 51
  // detection, but this seems better.                                                     // 52
  safeSessionStorage = window.sessionStorage;                                              // 53
                                                                                           // 54
  // Check we can actually use it                                                          // 55
  if (safeSessionStorage) {                                                                // 56
    safeSessionStorage.setItem('__dummy__', '1');                                          // 57
    safeSessionStorage.removeItem('__dummy__');                                            // 58
  } else {                                                                                 // 59
    // Be consistently null, for safety                                                    // 60
    safeSessionStorage = null;                                                             // 61
  }                                                                                        // 62
} catch(e) {                                                                               // 63
  // Expected on chrome with strict security, or if sessionStorage not supported           // 64
  safeSessionStorage = null;                                                               // 65
}                                                                                          // 66
                                                                                           // 67
// Exported for test.                                                                      // 68
Reload._getData = function () {                                                            // 69
  return safeSessionStorage && safeSessionStorage.getItem(KEY_NAME);                       // 70
};                                                                                         // 71
                                                                                           // 72
if (safeSessionStorage) {                                                                  // 73
  old_json = Reload._getData();                                                            // 74
  safeSessionStorage.removeItem(KEY_NAME);                                                 // 75
} else {                                                                                   // 76
  // Unsupported browser (IE 6,7) or locked down security settings.                        // 77
  // No session resumption.                                                                // 78
  // Meteor._debug("XXX UNSUPPORTED BROWSER/SETTINGS");                                    // 79
}                                                                                          // 80
                                                                                           // 81
if (!old_json) old_json = '{}';                                                            // 82
var old_parsed = {};                                                                       // 83
try {                                                                                      // 84
  old_parsed = JSON.parse(old_json);                                                       // 85
  if (typeof old_parsed !== "object") {                                                    // 86
    Meteor._debug("Got bad data on reload. Ignoring.");                                    // 87
    old_parsed = {};                                                                       // 88
  }                                                                                        // 89
} catch (err) {                                                                            // 90
  Meteor._debug("Got invalid JSON on reload. Ignoring.");                                  // 91
}                                                                                          // 92
                                                                                           // 93
if (old_parsed.reload && typeof old_parsed.data === "object") {                            // 94
  // Meteor._debug("Restoring reload data.");                                              // 95
  old_data = old_parsed.data;                                                              // 96
}                                                                                          // 97
                                                                                           // 98
                                                                                           // 99
var providers = [];                                                                        // 100
                                                                                           // 101
////////// External API //////////                                                         // 102
                                                                                           // 103
// Packages that support migration should register themselves by calling                   // 104
// this function. When it's time to migrate, callback will be called                       // 105
// with one argument, the "retry function," and an optional 'option'                       // 106
// argument (containing a key 'immediateMigration'). If the package                        // 107
// is ready to migrate, it should return [true, data], where data is                       // 108
// its migration data, an arbitrary JSON value (or [true] if it has                        // 109
// no migration data this time). If the package needs more time                            // 110
// before it is ready to migrate, it should return false. Then, once                       // 111
// it is ready to migrating again, it should call the retry                                // 112
// function. The retry function will return immediately, but will                          // 113
// schedule the migration to be retried, meaning that every package                        // 114
// will be polled once again for its migration data. If they are all                       // 115
// ready this time, then the migration will happen. name must be set if there              // 116
// is migration data. If 'immediateMigration' is set in the options                        // 117
// argument, then it doesn't matter whether the package is ready to                        // 118
// migrate or not; the reload will happen immediately without waiting                      // 119
// (used for OAuth redirect login).                                                        // 120
//                                                                                         // 121
Reload._onMigrate = function (name, callback) {                                            // 122
  if (!callback) {                                                                         // 123
    // name not provided, so first arg is callback.                                        // 124
    callback = name;                                                                       // 125
    name = undefined;                                                                      // 126
  }                                                                                        // 127
  providers.push({name: name, callback: callback});                                        // 128
};                                                                                         // 129
                                                                                           // 130
// Called by packages when they start up.                                                  // 131
// Returns the object that was saved, or undefined if none saved.                          // 132
//                                                                                         // 133
Reload._migrationData = function (name) {                                                  // 134
  return old_data[name];                                                                   // 135
};                                                                                         // 136
                                                                                           // 137
// Options are the same as for `Reload._migrate`.                                          // 138
var pollProviders = function (tryReload, options) {                                        // 139
  tryReload = tryReload || function () {};                                                 // 140
  options = options || {};                                                                 // 141
                                                                                           // 142
  var migrationData = {};                                                                  // 143
  var remaining = _.clone(providers);                                                      // 144
  var allReady = true;                                                                     // 145
  while (remaining.length) {                                                               // 146
    var p = remaining.shift();                                                             // 147
    var status = p.callback(tryReload, options);                                           // 148
    if (!status[0])                                                                        // 149
      allReady = false;                                                                    // 150
    if (status.length > 1 && p.name)                                                       // 151
      migrationData[p.name] = status[1];                                                   // 152
  };                                                                                       // 153
  if (allReady || options.immediateMigration)                                              // 154
    return migrationData;                                                                  // 155
  else                                                                                     // 156
    return null;                                                                           // 157
};                                                                                         // 158
                                                                                           // 159
// Options are:                                                                            // 160
//  - immediateMigration: true if the page will be reloaded immediately                    // 161
//    regardless of whether packages report that they are ready or not.                    // 162
Reload._migrate = function (tryReload, options) {                                          // 163
  // Make sure each package is ready to go, and collect their                              // 164
  // migration data                                                                        // 165
  var migrationData = pollProviders(tryReload, options);                                   // 166
  if (migrationData === null)                                                              // 167
    return false; // not ready yet..                                                       // 168
                                                                                           // 169
  try {                                                                                    // 170
    // Persist the migration data                                                          // 171
    var json = JSON.stringify({                                                            // 172
      data: migrationData, reload: true                                                    // 173
    });                                                                                    // 174
  } catch (err) {                                                                          // 175
    Meteor._debug("Couldn't serialize data for migration", migrationData);                 // 176
    throw err;                                                                             // 177
  }                                                                                        // 178
                                                                                           // 179
  if (safeSessionStorage) {                                                                // 180
    try {                                                                                  // 181
      safeSessionStorage.setItem(KEY_NAME, json);                                          // 182
    } catch (err) {                                                                        // 183
      // We should have already checked this, but just log - don't throw                   // 184
      Meteor._debug("Couldn't save data for migration to sessionStorage", err);            // 185
    }                                                                                      // 186
  } else {                                                                                 // 187
    Meteor._debug("Browser does not support sessionStorage. Not saving migration state.");
  }                                                                                        // 189
                                                                                           // 190
  return true;                                                                             // 191
};                                                                                         // 192
                                                                                           // 193
// Allows tests to isolate the list of providers.                                          // 194
Reload._withFreshProvidersForTest = function (f) {                                         // 195
  var originalProviders = _.clone(providers);                                              // 196
  providers = [];                                                                          // 197
  try {                                                                                    // 198
    f();                                                                                   // 199
  } finally {                                                                              // 200
    providers = originalProviders;                                                         // 201
  }                                                                                        // 202
};                                                                                         // 203
                                                                                           // 204
// Migrating reload: reload this page (presumably to pick up a new                         // 205
// version of the code or assets), but save the program state and                          // 206
// migrate it over. This function returns immediately. The reload                          // 207
// will happen at some point in the future once all of the packages                        // 208
// are ready to migrate.                                                                   // 209
//                                                                                         // 210
var reloading = false;                                                                     // 211
Reload._reload = function (options) {                                                      // 212
  options = options || {};                                                                 // 213
                                                                                           // 214
  if (reloading)                                                                           // 215
    return;                                                                                // 216
  reloading = true;                                                                        // 217
                                                                                           // 218
  var tryReload = function () { _.defer(function () {                                      // 219
    if (Reload._migrate(tryReload, options)) {                                             // 220
      // We'd like to make the browser reload the page using location.replace()            // 221
      // instead of location.reload(), because this avoids validating assets               // 222
      // with the server if we still have a valid cached copy. This doesn't work           // 223
      // when the location contains a hash however, because that wouldn't reload           // 224
      // the page and just scroll to the hash location instead.                            // 225
      if (window.location.hash || window.location.href.endsWith("#")) {                    // 226
        window.location.reload();                                                          // 227
      } else {                                                                             // 228
        window.location.replace(window.location.href);                                     // 229
      }                                                                                    // 230
    }                                                                                      // 231
  }); };                                                                                   // 232
                                                                                           // 233
  tryReload();                                                                             // 234
};                                                                                         // 235
                                                                                           // 236
/////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// packages/reload/deprecated.js                                                           //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
// Reload functionality used to live on Meteor._reload. Be nice and try not to             // 1
// break code that uses it, even though it's internal.                                     // 2
// XXX COMPAT WITH 0.6.4                                                                   // 3
Meteor._reload = {                                                                         // 4
  onMigrate: Reload._onMigrate,                                                            // 5
  migrationData: Reload._migrationData,                                                    // 6
  reload: Reload._reload                                                                   // 7
};                                                                                         // 8
                                                                                           // 9
/////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.reload = {}, {
  Reload: Reload
});

})();
