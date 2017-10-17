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
var Random = Package.random.Random;

(function(){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// packages/localstorage/localstorage.js                                            //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
// Meteor._localStorage is not an ideal name, but we can change it later.           // 1
                                                                                    // 2
// Let's test to make sure that localStorage actually works. For example, in        // 3
// Safari with private browsing on, window.localStorage exists but actually         // 4
// trying to use it throws.                                                         // 5
// Accessing window.localStorage can also immediately throw an error in IE (#1291).
                                                                                    // 7
var key = '_localstorage_test_' + Random.id();                                      // 8
var retrieved;                                                                      // 9
try {                                                                               // 10
  if (window.localStorage) {                                                        // 11
    window.localStorage.setItem(key, key);                                          // 12
    retrieved = window.localStorage.getItem(key);                                   // 13
    window.localStorage.removeItem(key);                                            // 14
  }                                                                                 // 15
} catch (e) {                                                                       // 16
  // ... ignore                                                                     // 17
}                                                                                   // 18
if (key === retrieved) {                                                            // 19
  Meteor._localStorage = {                                                          // 20
    getItem: function (key) {                                                       // 21
      return window.localStorage.getItem(key);                                      // 22
    },                                                                              // 23
    setItem: function (key, value) {                                                // 24
      window.localStorage.setItem(key, value);                                      // 25
    },                                                                              // 26
    removeItem: function (key) {                                                    // 27
      window.localStorage.removeItem(key);                                          // 28
    }                                                                               // 29
  };                                                                                // 30
}                                                                                   // 31
                                                                                    // 32
if (!Meteor._localStorage) {                                                        // 33
  Meteor._debug(                                                                    // 34
    "You are running a browser with no localStorage or userData "                   // 35
      + "support. Logging in from one tab will not cause another "                  // 36
      + "tab to be logged in.");                                                    // 37
                                                                                    // 38
  Meteor._localStorage = {                                                          // 39
    _data: {},                                                                      // 40
                                                                                    // 41
    setItem: function (key, val) {                                                  // 42
      this._data[key] = val;                                                        // 43
    },                                                                              // 44
    removeItem: function (key) {                                                    // 45
      delete this._data[key];                                                       // 46
    },                                                                              // 47
    getItem: function (key) {                                                       // 48
      var value = this._data[key];                                                  // 49
      if (value === undefined)                                                      // 50
        return null;                                                                // 51
      else                                                                          // 52
        return value;                                                               // 53
    }                                                                               // 54
  };                                                                                // 55
}                                                                                   // 56
                                                                                    // 57
//////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.localstorage = {};

})();
