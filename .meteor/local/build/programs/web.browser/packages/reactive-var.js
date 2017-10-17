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
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;

/* Package-scope variables */
var ReactiveVar;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/reactive-var/reactive-var.js                                                                        //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
/*                                                                                                              // 1
 * ## [new] ReactiveVar(initialValue, [equalsFunc])                                                             // 2
 *                                                                                                              // 3
 * A ReactiveVar holds a single value that can be get and set,                                                  // 4
 * such that calling `set` will invalidate any Computations that                                                // 5
 * called `get`, according to the usual contract for reactive                                                   // 6
 * data sources.                                                                                                // 7
 *                                                                                                              // 8
 * A ReactiveVar is much like a Session variable -- compare `foo.get()`                                         // 9
 * to `Session.get("foo")` -- but it doesn't have a global name and isn't                                       // 10
 * automatically migrated across hot code pushes.  Also, while Session                                          // 11
 * variables can only hold JSON or EJSON, ReactiveVars can hold any value.                                      // 12
 *                                                                                                              // 13
 * An important property of ReactiveVars, which is sometimes the reason                                         // 14
 * to use one, is that setting the value to the same value as before has                                        // 15
 * no effect, meaning ReactiveVars can be used to absorb extra                                                  // 16
 * invalidations that wouldn't serve a purpose.  However, by default,                                           // 17
 * ReactiveVars are extremely conservative about what changes they                                              // 18
 * absorb.  Calling `set` with an object argument will *always* trigger                                         // 19
 * invalidations, because even if the new value is `===` the old value,                                         // 20
 * the object may have been mutated.  You can change the default behavior                                       // 21
 * by passing a function of two arguments, `oldValue` and `newValue`,                                           // 22
 * to the constructor as `equalsFunc`.                                                                          // 23
 *                                                                                                              // 24
 * This class is extremely basic right now, but the idea is to evolve                                           // 25
 * it into the ReactiveVar of Geoff's Lickable Forms proposal.                                                  // 26
 */                                                                                                             // 27
                                                                                                                // 28
/**                                                                                                             // 29
 * @class                                                                                                       // 30
 * @instanceName reactiveVar                                                                                    // 31
 * @summary Constructor for a ReactiveVar, which represents a single reactive variable.                         // 32
 * @locus Client                                                                                                // 33
 * @param {Any} initialValue The initial value to set.  `equalsFunc` is ignored when setting the initial value.
 * @param {Function} [equalsFunc] Optional.  A function of two arguments, called on the old value and the new value whenever the ReactiveVar is set.  If it returns true, no set is performed.  If omitted, the default `equalsFunc` returns true if its arguments are `===` and are of type number, boolean, string, undefined, or null.
 */                                                                                                             // 36
ReactiveVar = function (initialValue, equalsFunc) {                                                             // 37
  if (! (this instanceof ReactiveVar))                                                                          // 38
    // called without `new`                                                                                     // 39
    return new ReactiveVar(initialValue, equalsFunc);                                                           // 40
                                                                                                                // 41
  this.curValue = initialValue;                                                                                 // 42
  this.equalsFunc = equalsFunc;                                                                                 // 43
  this.dep = new Tracker.Dependency;                                                                            // 44
};                                                                                                              // 45
                                                                                                                // 46
ReactiveVar._isEqual = function (oldValue, newValue) {                                                          // 47
  var a = oldValue, b = newValue;                                                                               // 48
  // Two values are "equal" here if they are `===` and are                                                      // 49
  // number, boolean, string, undefined, or null.                                                               // 50
  if (a !== b)                                                                                                  // 51
    return false;                                                                                               // 52
  else                                                                                                          // 53
    return ((!a) || (typeof a === 'number') || (typeof a === 'boolean') ||                                      // 54
            (typeof a === 'string'));                                                                           // 55
};                                                                                                              // 56
                                                                                                                // 57
/**                                                                                                             // 58
 * @summary Returns the current value of the ReactiveVar, establishing a reactive dependency.                   // 59
 * @locus Client                                                                                                // 60
 */                                                                                                             // 61
ReactiveVar.prototype.get = function () {                                                                       // 62
  if (Tracker.active)                                                                                           // 63
    this.dep.depend();                                                                                          // 64
                                                                                                                // 65
  return this.curValue;                                                                                         // 66
};                                                                                                              // 67
                                                                                                                // 68
/**                                                                                                             // 69
 * @summary Sets the current value of the ReactiveVar, invalidating the Computations that called `get` if `newValue` is different from the old value.
 * @locus Client                                                                                                // 71
 * @param {Any} newValue                                                                                        // 72
 */                                                                                                             // 73
ReactiveVar.prototype.set = function (newValue) {                                                               // 74
  var oldValue = this.curValue;                                                                                 // 75
                                                                                                                // 76
  if ((this.equalsFunc || ReactiveVar._isEqual)(oldValue, newValue))                                            // 77
    // value is same as last time                                                                               // 78
    return;                                                                                                     // 79
                                                                                                                // 80
  this.curValue = newValue;                                                                                     // 81
  this.dep.changed();                                                                                           // 82
};                                                                                                              // 83
                                                                                                                // 84
ReactiveVar.prototype.toString = function () {                                                                  // 85
  return 'ReactiveVar{' + this.get() + '}';                                                                     // 86
};                                                                                                              // 87
                                                                                                                // 88
ReactiveVar.prototype._numListeners = function() {                                                              // 89
  // Tests want to know.                                                                                        // 90
  // Accesses a private field of Tracker.Dependency.                                                            // 91
  var count = 0;                                                                                                // 92
  for (var id in this.dep._dependentsById)                                                                      // 93
    count++;                                                                                                    // 94
  return count;                                                                                                 // 95
};                                                                                                              // 96
                                                                                                                // 97
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['reactive-var'] = {}, {
  ReactiveVar: ReactiveVar
});

})();
