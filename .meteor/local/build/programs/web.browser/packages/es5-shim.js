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
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;

/* Package-scope variables */
var Date, parseInt, parseFloat, originalStringReplace;

var require = meteorInstall({"node_modules":{"meteor":{"es5-shim":{"client.js":["./import_globals.js","es5-shim/es5-shim.js","es5-shim/es5-sham.js","./console.js","./export_globals.js",function(require){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/es5-shim/client.js                                                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
require("./import_globals.js");                                                                                       // 1
require("es5-shim/es5-shim.js");                                                                                      // 2
require("es5-shim/es5-sham.js");                                                                                      // 3
require("./console.js");                                                                                              // 4
require("./export_globals.js");                                                                                       // 5
                                                                                                                      // 6
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"console.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/es5-shim/console.js                                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var hasOwn = Object.prototype.hasOwnProperty;                                                                         // 1
                                                                                                                      // 2
function wrap(method) {                                                                                               // 3
  var original = console[method];                                                                                     // 4
  if (original && typeof original === "object") {                                                                     // 5
    // Turn callable console method objects into actual functions.                                                    // 6
    console[method] = function () {                                                                                   // 7
      return Function.prototype.apply.call(                                                                           // 8
        original, console, arguments                                                                                  // 9
      );                                                                                                              // 10
    };                                                                                                                // 11
  }                                                                                                                   // 12
}                                                                                                                     // 13
                                                                                                                      // 14
if (typeof console === "object" &&                                                                                    // 15
    // In older Internet Explorers, methods like console.log are actually                                             // 16
    // callable objects rather than functions.                                                                        // 17
    typeof console.log === "object") {                                                                                // 18
  for (var method in console) {                                                                                       // 19
    // In most browsers, this hasOwn check will fail for all console                                                  // 20
    // methods anyway, but fortunately in IE8 the method objects we care                                              // 21
    // about are own properties.                                                                                      // 22
    if (hasOwn.call(console, method)) {                                                                               // 23
      wrap(method);                                                                                                   // 24
    }                                                                                                                 // 25
  }                                                                                                                   // 26
}                                                                                                                     // 27
                                                                                                                      // 28
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"export_globals.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/es5-shim/export_globals.js                                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
if (global.Date !== Date) {                                                                                           // 1
  global.Date = Date;                                                                                                 // 2
}                                                                                                                     // 3
                                                                                                                      // 4
if (global.parseInt !== parseInt) {                                                                                   // 5
  global.parseInt = parseInt;                                                                                         // 6
}                                                                                                                     // 7
                                                                                                                      // 8
if (global.parseFloat !== parseFloat) {                                                                               // 9
  global.parseFloat = parseFloat;                                                                                     // 10
}                                                                                                                     // 11
                                                                                                                      // 12
var Sp = String.prototype;                                                                                            // 13
if (Sp.replace !== originalStringReplace) {                                                                           // 14
  // Restore the original value of String#replace, because the es5-shim                                               // 15
  // reimplementation is buggy. See also import_globals.js.                                                           // 16
  Sp.replace = originalStringReplace;                                                                                 // 17
}                                                                                                                     // 18
                                                                                                                      // 19
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"import_globals.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/es5-shim/import_globals.js                                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// Because the es5-{shim,sham}.js code assigns to Date and parseInt,                                                  // 1
// Meteor treats them as package variables, and so declares them as                                                   // 2
// variables in package scope, which causes some references to Date and                                               // 3
// parseInt in the shim/sham code to refer to those undefined package                                                 // 4
// variables. The simplest solution seems to be to initialize the package                                             // 5
// variables to their appropriate global values.                                                                      // 6
Date = global.Date;                                                                                                   // 7
parseInt = global.parseInt;                                                                                           // 8
parseFloat = global.parseFloat;                                                                                       // 9
                                                                                                                      // 10
// Save the original String#replace method, because es5-shim's                                                        // 11
// reimplementation of it causes problems in markdown/showdown.js.                                                    // 12
// This original method will be restored in export_globals.js.                                                        // 13
originalStringReplace = String.prototype.replace;                                                                     // 14
                                                                                                                      // 15
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"es5-shim":{"es5-shim.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/es5-shim/node_modules/es5-shim/es5-shim.js                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/*!                                                                                                                   // 1
 * https://github.com/es-shims/es5-shim                                                                               // 2
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License                                                 // 3
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE                                                       // 4
 */                                                                                                                   // 5
                                                                                                                      // 6
// vim: ts=4 sts=4 sw=4 expandtab                                                                                     // 7
                                                                                                                      // 8
// Add semicolon to prevent IIFE from being passed as argument to concatenated code.                                  // 9
;                                                                                                                     // 10
                                                                                                                      // 11
// UMD (Universal Module Definition)                                                                                  // 12
// see https://github.com/umdjs/umd/blob/master/templates/returnExports.js                                            // 13
(function (root, factory) {                                                                                           // 14
    'use strict';                                                                                                     // 15
                                                                                                                      // 16
    /* global define, exports, module */                                                                              // 17
    if (typeof define === 'function' && define.amd) {                                                                 // 18
        // AMD. Register as an anonymous module.                                                                      // 19
        define(factory);                                                                                              // 20
    } else if (typeof exports === 'object') {                                                                         // 21
        // Node. Does not work with strict CommonJS, but                                                              // 22
        // only CommonJS-like enviroments that support module.exports,                                                // 23
        // like Node.                                                                                                 // 24
        module.exports = factory();                                                                                   // 25
    } else {                                                                                                          // 26
        // Browser globals (root is window)                                                                           // 27
        root.returnExports = factory();                                                                               // 28
    }                                                                                                                 // 29
}(this, function () {                                                                                                 // 30
    /**                                                                                                               // 31
     * Brings an environment as close to ECMAScript 5 compliance                                                      // 32
     * as is possible with the facilities of erstwhile engines.                                                       // 33
     *                                                                                                                // 34
     * Annotated ES5: http://es5.github.com/ (specific links below)                                                   // 35
     * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf                            // 36
     * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/               // 37
     */                                                                                                               // 38
                                                                                                                      // 39
    // Shortcut to an often accessed properties, in order to avoid multiple                                           // 40
    // dereference that costs universally. This also holds a reference to known-good                                  // 41
    // functions.                                                                                                     // 42
    var $Array = Array;                                                                                               // 43
    var ArrayPrototype = $Array.prototype;                                                                            // 44
    var $Object = Object;                                                                                             // 45
    var ObjectPrototype = $Object.prototype;                                                                          // 46
    var $Function = Function;                                                                                         // 47
    var FunctionPrototype = $Function.prototype;                                                                      // 48
    var $String = String;                                                                                             // 49
    var StringPrototype = $String.prototype;                                                                          // 50
    var $Number = Number;                                                                                             // 51
    var NumberPrototype = $Number.prototype;                                                                          // 52
    var array_slice = ArrayPrototype.slice;                                                                           // 53
    var array_splice = ArrayPrototype.splice;                                                                         // 54
    var array_push = ArrayPrototype.push;                                                                             // 55
    var array_unshift = ArrayPrototype.unshift;                                                                       // 56
    var array_concat = ArrayPrototype.concat;                                                                         // 57
    var array_join = ArrayPrototype.join;                                                                             // 58
    var call = FunctionPrototype.call;                                                                                // 59
    var apply = FunctionPrototype.apply;                                                                              // 60
    var max = Math.max;                                                                                               // 61
    var min = Math.min;                                                                                               // 62
                                                                                                                      // 63
    // Having a toString local variable name breaks in Opera so use to_string.                                        // 64
    var to_string = ObjectPrototype.toString;                                                                         // 65
                                                                                                                      // 66
    /* global Symbol */                                                                                               // 67
    /* eslint-disable one-var-declaration-per-line, no-redeclare, max-statements-per-line */                          // 68
    var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';                      // 69
    var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, constructorRegex = /^\s*class /, isES6ClassFn = function isES6ClassFn(value) { try { var fnStr = fnToStr.call(value); var singleStripped = fnStr.replace(/\/\/.*\n/g, ''); var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, ''); var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' '); return constructorRegex.test(spaceStripped); } catch (e) { return false; /* not a function */ } }, tryFunctionObject = function tryFunctionObject(value) { try { if (isES6ClassFn(value)) { return false; } fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]', isCallable = function isCallable(value) { if (!value) { return false; } if (typeof value !== 'function' && typeof value !== 'object') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } if (isES6ClassFn(value)) { return false; } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };
                                                                                                                      // 71
    var isRegex; /* inlined from https://npmjs.com/is-regex */ var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) { try { regexExec.call(value); return true; } catch (e) { return false; } }, regexClass = '[object RegExp]'; isRegex = function isRegex(value) { if (typeof value !== 'object') { return false; } return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass; };
    var isString; /* inlined from https://npmjs.com/is-string */ var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) { try { strValue.call(value); return true; } catch (e) { return false; } }, stringClass = '[object String]'; isString = function isString(value) { if (typeof value === 'string') { return true; } if (typeof value !== 'object') { return false; } return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass; };
    /* eslint-enable one-var-declaration-per-line, no-redeclare, max-statements-per-line */                           // 74
                                                                                                                      // 75
    /* inlined from http://npmjs.com/define-properties */                                                             // 76
    var supportsDescriptors = $Object.defineProperty && (function () {                                                // 77
        try {                                                                                                         // 78
            var obj = {};                                                                                             // 79
            $Object.defineProperty(obj, 'x', { enumerable: false, value: obj });                                      // 80
            for (var _ in obj) { // jscs:ignore disallowUnusedVariables                                               // 81
                return false;                                                                                         // 82
            }                                                                                                         // 83
            return obj.x === obj;                                                                                     // 84
        } catch (e) { /* this is ES3 */                                                                               // 85
            return false;                                                                                             // 86
        }                                                                                                             // 87
    }());                                                                                                             // 88
    var defineProperties = (function (has) {                                                                          // 89
        // Define configurable, writable, and non-enumerable props                                                    // 90
        // if they don't exist.                                                                                       // 91
        var defineProperty;                                                                                           // 92
        if (supportsDescriptors) {                                                                                    // 93
            defineProperty = function (object, name, method, forceAssign) {                                           // 94
                if (!forceAssign && (name in object)) {                                                               // 95
                    return;                                                                                           // 96
                }                                                                                                     // 97
                $Object.defineProperty(object, name, {                                                                // 98
                    configurable: true,                                                                               // 99
                    enumerable: false,                                                                                // 100
                    writable: true,                                                                                   // 101
                    value: method                                                                                     // 102
                });                                                                                                   // 103
            };                                                                                                        // 104
        } else {                                                                                                      // 105
            defineProperty = function (object, name, method, forceAssign) {                                           // 106
                if (!forceAssign && (name in object)) {                                                               // 107
                    return;                                                                                           // 108
                }                                                                                                     // 109
                object[name] = method;                                                                                // 110
            };                                                                                                        // 111
        }                                                                                                             // 112
        return function defineProperties(object, map, forceAssign) {                                                  // 113
            for (var name in map) {                                                                                   // 114
                if (has.call(map, name)) {                                                                            // 115
                    defineProperty(object, name, map[name], forceAssign);                                             // 116
                }                                                                                                     // 117
            }                                                                                                         // 118
        };                                                                                                            // 119
    }(ObjectPrototype.hasOwnProperty));                                                                               // 120
                                                                                                                      // 121
    //                                                                                                                // 122
    // Util                                                                                                           // 123
    // ======                                                                                                         // 124
    //                                                                                                                // 125
                                                                                                                      // 126
    /* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */                                 // 127
    var isPrimitive = function isPrimitive(input) {                                                                   // 128
        var type = typeof input;                                                                                      // 129
        return input === null || (type !== 'object' && type !== 'function');                                          // 130
    };                                                                                                                // 131
                                                                                                                      // 132
    var isActualNaN = $Number.isNaN || function isActualNaN(x) {                                                      // 133
        return x !== x;                                                                                               // 134
    };                                                                                                                // 135
                                                                                                                      // 136
    var ES = {                                                                                                        // 137
        // ES5 9.4                                                                                                    // 138
        // http://es5.github.com/#x9.4                                                                                // 139
        // http://jsperf.com/to-integer                                                                               // 140
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */                                    // 141
        ToInteger: function ToInteger(num) {                                                                          // 142
            var n = +num;                                                                                             // 143
            if (isActualNaN(n)) {                                                                                     // 144
                n = 0;                                                                                                // 145
            } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {                                                  // 146
                n = (n > 0 || -1) * Math.floor(Math.abs(n));                                                          // 147
            }                                                                                                         // 148
            return n;                                                                                                 // 149
        },                                                                                                            // 150
                                                                                                                      // 151
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */                                  // 152
        ToPrimitive: function ToPrimitive(input) {                                                                    // 153
            var val, valueOf, toStr;                                                                                  // 154
            if (isPrimitive(input)) {                                                                                 // 155
                return input;                                                                                         // 156
            }                                                                                                         // 157
            valueOf = input.valueOf;                                                                                  // 158
            if (isCallable(valueOf)) {                                                                                // 159
                val = valueOf.call(input);                                                                            // 160
                if (isPrimitive(val)) {                                                                               // 161
                    return val;                                                                                       // 162
                }                                                                                                     // 163
            }                                                                                                         // 164
            toStr = input.toString;                                                                                   // 165
            if (isCallable(toStr)) {                                                                                  // 166
                val = toStr.call(input);                                                                              // 167
                if (isPrimitive(val)) {                                                                               // 168
                    return val;                                                                                       // 169
                }                                                                                                     // 170
            }                                                                                                         // 171
            throw new TypeError();                                                                                    // 172
        },                                                                                                            // 173
                                                                                                                      // 174
        // ES5 9.9                                                                                                    // 175
        // http://es5.github.com/#x9.9                                                                                // 176
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */                                     // 177
        ToObject: function (o) {                                                                                      // 178
            if (o == null) { // this matches both null and undefined                                                  // 179
                throw new TypeError("can't convert " + o + ' to object');                                             // 180
            }                                                                                                         // 181
            return $Object(o);                                                                                        // 182
        },                                                                                                            // 183
                                                                                                                      // 184
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */                                     // 185
        ToUint32: function ToUint32(x) {                                                                              // 186
            return x >>> 0;                                                                                           // 187
        }                                                                                                             // 188
    };                                                                                                                // 189
                                                                                                                      // 190
    //                                                                                                                // 191
    // Function                                                                                                       // 192
    // ========                                                                                                       // 193
    //                                                                                                                // 194
                                                                                                                      // 195
    // ES-5 15.3.4.5                                                                                                  // 196
    // http://es5.github.com/#x15.3.4.5                                                                               // 197
                                                                                                                      // 198
    var Empty = function Empty() {};                                                                                  // 199
                                                                                                                      // 200
    defineProperties(FunctionPrototype, {                                                                             // 201
        bind: function bind(that) { // .length is 1                                                                   // 202
            // 1. Let Target be the this value.                                                                       // 203
            var target = this;                                                                                        // 204
            // 2. If IsCallable(Target) is false, throw a TypeError exception.                                        // 205
            if (!isCallable(target)) {                                                                                // 206
                throw new TypeError('Function.prototype.bind called on incompatible ' + target);                      // 207
            }                                                                                                         // 208
            // 3. Let A be a new (possibly empty) internal list of all of the                                         // 209
            //   argument values provided after thisArg (arg1, arg2 etc), in order.                                   // 210
            // XXX slicedArgs will stand in for "A" if used                                                           // 211
            var args = array_slice.call(arguments, 1); // for normal call                                             // 212
            // 4. Let F be a new native ECMAScript object.                                                            // 213
            // 11. Set the [[Prototype]] internal property of F to the standard                                       // 214
            //   built-in Function prototype object as specified in 15.3.3.1.                                         // 215
            // 12. Set the [[Call]] internal property of F as described in                                            // 216
            //   15.3.4.5.1.                                                                                          // 217
            // 13. Set the [[Construct]] internal property of F as described in                                       // 218
            //   15.3.4.5.2.                                                                                          // 219
            // 14. Set the [[HasInstance]] internal property of F as described in                                     // 220
            //   15.3.4.5.3.                                                                                          // 221
            var bound;                                                                                                // 222
            var binder = function () {                                                                                // 223
                                                                                                                      // 224
                if (this instanceof bound) {                                                                          // 225
                    // 15.3.4.5.2 [[Construct]]                                                                       // 226
                    // When the [[Construct]] internal method of a function object,                                   // 227
                    // F that was created using the bind function is called with a                                    // 228
                    // list of arguments ExtraArgs, the following steps are taken:                                    // 229
                    // 1. Let target be the value of F's [[TargetFunction]]                                           // 230
                    //   internal property.                                                                           // 231
                    // 2. If target has no [[Construct]] internal method, a                                           // 232
                    //   TypeError exception is thrown.                                                               // 233
                    // 3. Let boundArgs be the value of F's [[BoundArgs]] internal                                    // 234
                    //   property.                                                                                    // 235
                    // 4. Let args be a new list containing the same values as the                                    // 236
                    //   list boundArgs in the same order followed by the same                                        // 237
                    //   values as the list ExtraArgs in the same order.                                              // 238
                    // 5. Return the result of calling the [[Construct]] internal                                     // 239
                    //   method of target providing args as the arguments.                                            // 240
                                                                                                                      // 241
                    var result = apply.call(                                                                          // 242
                        target,                                                                                       // 243
                        this,                                                                                         // 244
                        array_concat.call(args, array_slice.call(arguments))                                          // 245
                    );                                                                                                // 246
                    if ($Object(result) === result) {                                                                 // 247
                        return result;                                                                                // 248
                    }                                                                                                 // 249
                    return this;                                                                                      // 250
                                                                                                                      // 251
                } else {                                                                                              // 252
                    // 15.3.4.5.1 [[Call]]                                                                            // 253
                    // When the [[Call]] internal method of a function object, F,                                     // 254
                    // which was created using the bind function is called with a                                     // 255
                    // this value and a list of arguments ExtraArgs, the following                                    // 256
                    // steps are taken:                                                                               // 257
                    // 1. Let boundArgs be the value of F's [[BoundArgs]] internal                                    // 258
                    //   property.                                                                                    // 259
                    // 2. Let boundThis be the value of F's [[BoundThis]] internal                                    // 260
                    //   property.                                                                                    // 261
                    // 3. Let target be the value of F's [[TargetFunction]] internal                                  // 262
                    //   property.                                                                                    // 263
                    // 4. Let args be a new list containing the same values as the                                    // 264
                    //   list boundArgs in the same order followed by the same                                        // 265
                    //   values as the list ExtraArgs in the same order.                                              // 266
                    // 5. Return the result of calling the [[Call]] internal method                                   // 267
                    //   of target providing boundThis as the this value and                                          // 268
                    //   providing args as the arguments.                                                             // 269
                                                                                                                      // 270
                    // equiv: target.call(this, ...boundArgs, ...args)                                                // 271
                    return apply.call(                                                                                // 272
                        target,                                                                                       // 273
                        that,                                                                                         // 274
                        array_concat.call(args, array_slice.call(arguments))                                          // 275
                    );                                                                                                // 276
                                                                                                                      // 277
                }                                                                                                     // 278
                                                                                                                      // 279
            };                                                                                                        // 280
                                                                                                                      // 281
            // 15. If the [[Class]] internal property of Target is "Function", then                                   // 282
            //     a. Let L be the length property of Target minus the length of A.                                   // 283
            //     b. Set the length own property of F to either 0 or L, whichever is                                 // 284
            //       larger.                                                                                          // 285
            // 16. Else set the length own property of F to 0.                                                        // 286
                                                                                                                      // 287
            var boundLength = max(0, target.length - args.length);                                                    // 288
                                                                                                                      // 289
            // 17. Set the attributes of the length own property of F to the values                                   // 290
            //   specified in 15.3.5.1.                                                                               // 291
            var boundArgs = [];                                                                                       // 292
            for (var i = 0; i < boundLength; i++) {                                                                   // 293
                array_push.call(boundArgs, '$' + i);                                                                  // 294
            }                                                                                                         // 295
                                                                                                                      // 296
            // XXX Build a dynamic function with desired amount of arguments is the only                              // 297
            // way to set the length property of a function.                                                          // 298
            // In environments where Content Security Policies enabled (Chrome extensions,                            // 299
            // for ex.) all use of eval or Function costructor throws an exception.                                   // 300
            // However in all of these environments Function.prototype.bind exists                                    // 301
            // and so this code will never be executed.                                                               // 302
            bound = $Function('binder', 'return function (' + array_join.call(boundArgs, ',') + '){ return binder.apply(this, arguments); }')(binder);
                                                                                                                      // 304
            if (target.prototype) {                                                                                   // 305
                Empty.prototype = target.prototype;                                                                   // 306
                bound.prototype = new Empty();                                                                        // 307
                // Clean up dangling references.                                                                      // 308
                Empty.prototype = null;                                                                               // 309
            }                                                                                                         // 310
                                                                                                                      // 311
            // TODO                                                                                                   // 312
            // 18. Set the [[Extensible]] internal property of F to true.                                             // 313
                                                                                                                      // 314
            // TODO                                                                                                   // 315
            // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).                                    // 316
            // 20. Call the [[DefineOwnProperty]] internal method of F with                                           // 317
            //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:                                   // 318
            //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and                                        // 319
            //   false.                                                                                               // 320
            // 21. Call the [[DefineOwnProperty]] internal method of F with                                           // 321
            //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,                                         // 322
            //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},                                   // 323
            //   and false.                                                                                           // 324
                                                                                                                      // 325
            // TODO                                                                                                   // 326
            // NOTE Function objects created using Function.prototype.bind do not                                     // 327
            // have a prototype property or the [[Code]], [[FormalParameters]], and                                   // 328
            // [[Scope]] internal properties.                                                                         // 329
            // XXX can't delete prototype in pure-js.                                                                 // 330
                                                                                                                      // 331
            // 22. Return F.                                                                                          // 332
            return bound;                                                                                             // 333
        }                                                                                                             // 334
    });                                                                                                               // 335
                                                                                                                      // 336
    // _Please note: Shortcuts are defined after `Function.prototype.bind` as we                                      // 337
    // use it in defining shortcuts.                                                                                  // 338
    var owns = call.bind(ObjectPrototype.hasOwnProperty);                                                             // 339
    var toStr = call.bind(ObjectPrototype.toString);                                                                  // 340
    var arraySlice = call.bind(array_slice);                                                                          // 341
    var arraySliceApply = apply.bind(array_slice);                                                                    // 342
    var strSlice = call.bind(StringPrototype.slice);                                                                  // 343
    var strSplit = call.bind(StringPrototype.split);                                                                  // 344
    var strIndexOf = call.bind(StringPrototype.indexOf);                                                              // 345
    var pushCall = call.bind(array_push);                                                                             // 346
    var isEnum = call.bind(ObjectPrototype.propertyIsEnumerable);                                                     // 347
    var arraySort = call.bind(ArrayPrototype.sort);                                                                   // 348
                                                                                                                      // 349
    //                                                                                                                // 350
    // Array                                                                                                          // 351
    // =====                                                                                                          // 352
    //                                                                                                                // 353
                                                                                                                      // 354
    var isArray = $Array.isArray || function isArray(obj) {                                                           // 355
        return toStr(obj) === '[object Array]';                                                                       // 356
    };                                                                                                                // 357
                                                                                                                      // 358
    // ES5 15.4.4.12                                                                                                  // 359
    // http://es5.github.com/#x15.4.4.13                                                                              // 360
    // Return len+argCount.                                                                                           // 361
    // [bugfix, ielt8]                                                                                                // 362
    // IE < 8 bug: [].unshift(0) === undefined but should be "1"                                                      // 363
    var hasUnshiftReturnValueBug = [].unshift(0) !== 1;                                                               // 364
    defineProperties(ArrayPrototype, {                                                                                // 365
        unshift: function () {                                                                                        // 366
            array_unshift.apply(this, arguments);                                                                     // 367
            return this.length;                                                                                       // 368
        }                                                                                                             // 369
    }, hasUnshiftReturnValueBug);                                                                                     // 370
                                                                                                                      // 371
    // ES5 15.4.3.2                                                                                                   // 372
    // http://es5.github.com/#x15.4.3.2                                                                               // 373
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray                             // 374
    defineProperties($Array, { isArray: isArray });                                                                   // 375
                                                                                                                      // 376
    // The IsCallable() check in the Array functions                                                                  // 377
    // has been replaced with a strict check on the                                                                   // 378
    // internal class of the object to trap cases where                                                               // 379
    // the provided function was actually a regular                                                                   // 380
    // expression literal, which in V8 and                                                                            // 381
    // JavaScriptCore is a typeof "function".  Only in                                                                // 382
    // V8 are regular expression literals permitted as                                                                // 383
    // reduce parameters, so it is desirable in the                                                                   // 384
    // general case for the shim to match the more                                                                    // 385
    // strict and common behavior of rejecting regular                                                                // 386
    // expressions.                                                                                                   // 387
                                                                                                                      // 388
    // ES5 15.4.4.18                                                                                                  // 389
    // http://es5.github.com/#x15.4.4.18                                                                              // 390
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach                             // 391
                                                                                                                      // 392
    // Check failure of by-index access of string characters (IE < 9)                                                 // 393
    // and failure of `0 in boxedString` (Rhino)                                                                      // 394
    var boxedString = $Object('a');                                                                                   // 395
    var splitString = boxedString[0] !== 'a' || !(0 in boxedString);                                                  // 396
                                                                                                                      // 397
    var properlyBoxesContext = function properlyBoxed(method) {                                                       // 398
        // Check node 0.6.21 bug where third parameter is not boxed                                                   // 399
        var properlyBoxesNonStrict = true;                                                                            // 400
        var properlyBoxesStrict = true;                                                                               // 401
        var threwException = false;                                                                                   // 402
        if (method) {                                                                                                 // 403
            try {                                                                                                     // 404
                method.call('foo', function (_, __, context) {                                                        // 405
                    if (typeof context !== 'object') {                                                                // 406
                        properlyBoxesNonStrict = false;                                                               // 407
                    }                                                                                                 // 408
                });                                                                                                   // 409
                                                                                                                      // 410
                method.call([1], function () {                                                                        // 411
                    'use strict';                                                                                     // 412
                                                                                                                      // 413
                    properlyBoxesStrict = typeof this === 'string';                                                   // 414
                }, 'x');                                                                                              // 415
            } catch (e) {                                                                                             // 416
                threwException = true;                                                                                // 417
            }                                                                                                         // 418
        }                                                                                                             // 419
        return !!method && !threwException && properlyBoxesNonStrict && properlyBoxesStrict;                          // 420
    };                                                                                                                // 421
                                                                                                                      // 422
    defineProperties(ArrayPrototype, {                                                                                // 423
        forEach: function forEach(callbackfn/*, thisArg*/) {                                                          // 424
            var object = ES.ToObject(this);                                                                           // 425
            var self = splitString && isString(this) ? strSplit(this, '') : object;                                   // 426
            var i = -1;                                                                                               // 427
            var length = ES.ToUint32(self.length);                                                                    // 428
            var T;                                                                                                    // 429
            if (arguments.length > 1) {                                                                               // 430
                T = arguments[1];                                                                                     // 431
            }                                                                                                         // 432
                                                                                                                      // 433
            // If no callback function or if callback is not a callable function                                      // 434
            if (!isCallable(callbackfn)) {                                                                            // 435
                throw new TypeError('Array.prototype.forEach callback must be a function');                           // 436
            }                                                                                                         // 437
                                                                                                                      // 438
            while (++i < length) {                                                                                    // 439
                if (i in self) {                                                                                      // 440
                    // Invoke the callback function with call, passing arguments:                                     // 441
                    // context, property value, property key, thisArg object                                          // 442
                    if (typeof T === 'undefined') {                                                                   // 443
                        callbackfn(self[i], i, object);                                                               // 444
                    } else {                                                                                          // 445
                        callbackfn.call(T, self[i], i, object);                                                       // 446
                    }                                                                                                 // 447
                }                                                                                                     // 448
            }                                                                                                         // 449
        }                                                                                                             // 450
    }, !properlyBoxesContext(ArrayPrototype.forEach));                                                                // 451
                                                                                                                      // 452
    // ES5 15.4.4.19                                                                                                  // 453
    // http://es5.github.com/#x15.4.4.19                                                                              // 454
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map                               // 455
    defineProperties(ArrayPrototype, {                                                                                // 456
        map: function map(callbackfn/*, thisArg*/) {                                                                  // 457
            var object = ES.ToObject(this);                                                                           // 458
            var self = splitString && isString(this) ? strSplit(this, '') : object;                                   // 459
            var length = ES.ToUint32(self.length);                                                                    // 460
            var result = $Array(length);                                                                              // 461
            var T;                                                                                                    // 462
            if (arguments.length > 1) {                                                                               // 463
                T = arguments[1];                                                                                     // 464
            }                                                                                                         // 465
                                                                                                                      // 466
            // If no callback function or if callback is not a callable function                                      // 467
            if (!isCallable(callbackfn)) {                                                                            // 468
                throw new TypeError('Array.prototype.map callback must be a function');                               // 469
            }                                                                                                         // 470
                                                                                                                      // 471
            for (var i = 0; i < length; i++) {                                                                        // 472
                if (i in self) {                                                                                      // 473
                    if (typeof T === 'undefined') {                                                                   // 474
                        result[i] = callbackfn(self[i], i, object);                                                   // 475
                    } else {                                                                                          // 476
                        result[i] = callbackfn.call(T, self[i], i, object);                                           // 477
                    }                                                                                                 // 478
                }                                                                                                     // 479
            }                                                                                                         // 480
            return result;                                                                                            // 481
        }                                                                                                             // 482
    }, !properlyBoxesContext(ArrayPrototype.map));                                                                    // 483
                                                                                                                      // 484
    // ES5 15.4.4.20                                                                                                  // 485
    // http://es5.github.com/#x15.4.4.20                                                                              // 486
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter                            // 487
    defineProperties(ArrayPrototype, {                                                                                // 488
        filter: function filter(callbackfn/*, thisArg*/) {                                                            // 489
            var object = ES.ToObject(this);                                                                           // 490
            var self = splitString && isString(this) ? strSplit(this, '') : object;                                   // 491
            var length = ES.ToUint32(self.length);                                                                    // 492
            var result = [];                                                                                          // 493
            var value;                                                                                                // 494
            var T;                                                                                                    // 495
            if (arguments.length > 1) {                                                                               // 496
                T = arguments[1];                                                                                     // 497
            }                                                                                                         // 498
                                                                                                                      // 499
            // If no callback function or if callback is not a callable function                                      // 500
            if (!isCallable(callbackfn)) {                                                                            // 501
                throw new TypeError('Array.prototype.filter callback must be a function');                            // 502
            }                                                                                                         // 503
                                                                                                                      // 504
            for (var i = 0; i < length; i++) {                                                                        // 505
                if (i in self) {                                                                                      // 506
                    value = self[i];                                                                                  // 507
                    if (typeof T === 'undefined' ? callbackfn(value, i, object) : callbackfn.call(T, value, i, object)) {
                        pushCall(result, value);                                                                      // 509
                    }                                                                                                 // 510
                }                                                                                                     // 511
            }                                                                                                         // 512
            return result;                                                                                            // 513
        }                                                                                                             // 514
    }, !properlyBoxesContext(ArrayPrototype.filter));                                                                 // 515
                                                                                                                      // 516
    // ES5 15.4.4.16                                                                                                  // 517
    // http://es5.github.com/#x15.4.4.16                                                                              // 518
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every                               // 519
    defineProperties(ArrayPrototype, {                                                                                // 520
        every: function every(callbackfn/*, thisArg*/) {                                                              // 521
            var object = ES.ToObject(this);                                                                           // 522
            var self = splitString && isString(this) ? strSplit(this, '') : object;                                   // 523
            var length = ES.ToUint32(self.length);                                                                    // 524
            var T;                                                                                                    // 525
            if (arguments.length > 1) {                                                                               // 526
                T = arguments[1];                                                                                     // 527
            }                                                                                                         // 528
                                                                                                                      // 529
            // If no callback function or if callback is not a callable function                                      // 530
            if (!isCallable(callbackfn)) {                                                                            // 531
                throw new TypeError('Array.prototype.every callback must be a function');                             // 532
            }                                                                                                         // 533
                                                                                                                      // 534
            for (var i = 0; i < length; i++) {                                                                        // 535
                if (i in self && !(typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                    return false;                                                                                     // 537
                }                                                                                                     // 538
            }                                                                                                         // 539
            return true;                                                                                              // 540
        }                                                                                                             // 541
    }, !properlyBoxesContext(ArrayPrototype.every));                                                                  // 542
                                                                                                                      // 543
    // ES5 15.4.4.17                                                                                                  // 544
    // http://es5.github.com/#x15.4.4.17                                                                              // 545
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some                                // 546
    defineProperties(ArrayPrototype, {                                                                                // 547
        some: function some(callbackfn/*, thisArg */) {                                                               // 548
            var object = ES.ToObject(this);                                                                           // 549
            var self = splitString && isString(this) ? strSplit(this, '') : object;                                   // 550
            var length = ES.ToUint32(self.length);                                                                    // 551
            var T;                                                                                                    // 552
            if (arguments.length > 1) {                                                                               // 553
                T = arguments[1];                                                                                     // 554
            }                                                                                                         // 555
                                                                                                                      // 556
            // If no callback function or if callback is not a callable function                                      // 557
            if (!isCallable(callbackfn)) {                                                                            // 558
                throw new TypeError('Array.prototype.some callback must be a function');                              // 559
            }                                                                                                         // 560
                                                                                                                      // 561
            for (var i = 0; i < length; i++) {                                                                        // 562
                if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                    return true;                                                                                      // 564
                }                                                                                                     // 565
            }                                                                                                         // 566
            return false;                                                                                             // 567
        }                                                                                                             // 568
    }, !properlyBoxesContext(ArrayPrototype.some));                                                                   // 569
                                                                                                                      // 570
    // ES5 15.4.4.21                                                                                                  // 571
    // http://es5.github.com/#x15.4.4.21                                                                              // 572
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce                            // 573
    var reduceCoercesToObject = false;                                                                                // 574
    if (ArrayPrototype.reduce) {                                                                                      // 575
        reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) {                // 576
            return list;                                                                                              // 577
        }) === 'object';                                                                                              // 578
    }                                                                                                                 // 579
    defineProperties(ArrayPrototype, {                                                                                // 580
        reduce: function reduce(callbackfn/*, initialValue*/) {                                                       // 581
            var object = ES.ToObject(this);                                                                           // 582
            var self = splitString && isString(this) ? strSplit(this, '') : object;                                   // 583
            var length = ES.ToUint32(self.length);                                                                    // 584
                                                                                                                      // 585
            // If no callback function or if callback is not a callable function                                      // 586
            if (!isCallable(callbackfn)) {                                                                            // 587
                throw new TypeError('Array.prototype.reduce callback must be a function');                            // 588
            }                                                                                                         // 589
                                                                                                                      // 590
            // no value to return if no initial value and an empty array                                              // 591
            if (length === 0 && arguments.length === 1) {                                                             // 592
                throw new TypeError('reduce of empty array with no initial value');                                   // 593
            }                                                                                                         // 594
                                                                                                                      // 595
            var i = 0;                                                                                                // 596
            var result;                                                                                               // 597
            if (arguments.length >= 2) {                                                                              // 598
                result = arguments[1];                                                                                // 599
            } else {                                                                                                  // 600
                do {                                                                                                  // 601
                    if (i in self) {                                                                                  // 602
                        result = self[i++];                                                                           // 603
                        break;                                                                                        // 604
                    }                                                                                                 // 605
                                                                                                                      // 606
                    // if array contains no values, no initial value to return                                        // 607
                    if (++i >= length) {                                                                              // 608
                        throw new TypeError('reduce of empty array with no initial value');                           // 609
                    }                                                                                                 // 610
                } while (true);                                                                                       // 611
            }                                                                                                         // 612
                                                                                                                      // 613
            for (; i < length; i++) {                                                                                 // 614
                if (i in self) {                                                                                      // 615
                    result = callbackfn(result, self[i], i, object);                                                  // 616
                }                                                                                                     // 617
            }                                                                                                         // 618
                                                                                                                      // 619
            return result;                                                                                            // 620
        }                                                                                                             // 621
    }, !reduceCoercesToObject);                                                                                       // 622
                                                                                                                      // 623
    // ES5 15.4.4.22                                                                                                  // 624
    // http://es5.github.com/#x15.4.4.22                                                                              // 625
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight                       // 626
    var reduceRightCoercesToObject = false;                                                                           // 627
    if (ArrayPrototype.reduceRight) {                                                                                 // 628
        reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) {      // 629
            return list;                                                                                              // 630
        }) === 'object';                                                                                              // 631
    }                                                                                                                 // 632
    defineProperties(ArrayPrototype, {                                                                                // 633
        reduceRight: function reduceRight(callbackfn/*, initial*/) {                                                  // 634
            var object = ES.ToObject(this);                                                                           // 635
            var self = splitString && isString(this) ? strSplit(this, '') : object;                                   // 636
            var length = ES.ToUint32(self.length);                                                                    // 637
                                                                                                                      // 638
            // If no callback function or if callback is not a callable function                                      // 639
            if (!isCallable(callbackfn)) {                                                                            // 640
                throw new TypeError('Array.prototype.reduceRight callback must be a function');                       // 641
            }                                                                                                         // 642
                                                                                                                      // 643
            // no value to return if no initial value, empty array                                                    // 644
            if (length === 0 && arguments.length === 1) {                                                             // 645
                throw new TypeError('reduceRight of empty array with no initial value');                              // 646
            }                                                                                                         // 647
                                                                                                                      // 648
            var result;                                                                                               // 649
            var i = length - 1;                                                                                       // 650
            if (arguments.length >= 2) {                                                                              // 651
                result = arguments[1];                                                                                // 652
            } else {                                                                                                  // 653
                do {                                                                                                  // 654
                    if (i in self) {                                                                                  // 655
                        result = self[i--];                                                                           // 656
                        break;                                                                                        // 657
                    }                                                                                                 // 658
                                                                                                                      // 659
                    // if array contains no values, no initial value to return                                        // 660
                    if (--i < 0) {                                                                                    // 661
                        throw new TypeError('reduceRight of empty array with no initial value');                      // 662
                    }                                                                                                 // 663
                } while (true);                                                                                       // 664
            }                                                                                                         // 665
                                                                                                                      // 666
            if (i < 0) {                                                                                              // 667
                return result;                                                                                        // 668
            }                                                                                                         // 669
                                                                                                                      // 670
            do {                                                                                                      // 671
                if (i in self) {                                                                                      // 672
                    result = callbackfn(result, self[i], i, object);                                                  // 673
                }                                                                                                     // 674
            } while (i--);                                                                                            // 675
                                                                                                                      // 676
            return result;                                                                                            // 677
        }                                                                                                             // 678
    }, !reduceRightCoercesToObject);                                                                                  // 679
                                                                                                                      // 680
    // ES5 15.4.4.14                                                                                                  // 681
    // http://es5.github.com/#x15.4.4.14                                                                              // 682
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf                             // 683
    var hasFirefox2IndexOfBug = ArrayPrototype.indexOf && [0, 1].indexOf(1, 2) !== -1;                                // 684
    defineProperties(ArrayPrototype, {                                                                                // 685
        indexOf: function indexOf(searchElement/*, fromIndex */) {                                                    // 686
            var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);                        // 687
            var length = ES.ToUint32(self.length);                                                                    // 688
                                                                                                                      // 689
            if (length === 0) {                                                                                       // 690
                return -1;                                                                                            // 691
            }                                                                                                         // 692
                                                                                                                      // 693
            var i = 0;                                                                                                // 694
            if (arguments.length > 1) {                                                                               // 695
                i = ES.ToInteger(arguments[1]);                                                                       // 696
            }                                                                                                         // 697
                                                                                                                      // 698
            // handle negative indices                                                                                // 699
            i = i >= 0 ? i : max(0, length + i);                                                                      // 700
            for (; i < length; i++) {                                                                                 // 701
                if (i in self && self[i] === searchElement) {                                                         // 702
                    return i;                                                                                         // 703
                }                                                                                                     // 704
            }                                                                                                         // 705
            return -1;                                                                                                // 706
        }                                                                                                             // 707
    }, hasFirefox2IndexOfBug);                                                                                        // 708
                                                                                                                      // 709
    // ES5 15.4.4.15                                                                                                  // 710
    // http://es5.github.com/#x15.4.4.15                                                                              // 711
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf                         // 712
    var hasFirefox2LastIndexOfBug = ArrayPrototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;                   // 713
    defineProperties(ArrayPrototype, {                                                                                // 714
        lastIndexOf: function lastIndexOf(searchElement/*, fromIndex */) {                                            // 715
            var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);                        // 716
            var length = ES.ToUint32(self.length);                                                                    // 717
                                                                                                                      // 718
            if (length === 0) {                                                                                       // 719
                return -1;                                                                                            // 720
            }                                                                                                         // 721
            var i = length - 1;                                                                                       // 722
            if (arguments.length > 1) {                                                                               // 723
                i = min(i, ES.ToInteger(arguments[1]));                                                               // 724
            }                                                                                                         // 725
            // handle negative indices                                                                                // 726
            i = i >= 0 ? i : length - Math.abs(i);                                                                    // 727
            for (; i >= 0; i--) {                                                                                     // 728
                if (i in self && searchElement === self[i]) {                                                         // 729
                    return i;                                                                                         // 730
                }                                                                                                     // 731
            }                                                                                                         // 732
            return -1;                                                                                                // 733
        }                                                                                                             // 734
    }, hasFirefox2LastIndexOfBug);                                                                                    // 735
                                                                                                                      // 736
    // ES5 15.4.4.12                                                                                                  // 737
    // http://es5.github.com/#x15.4.4.12                                                                              // 738
    var spliceNoopReturnsEmptyArray = (function () {                                                                  // 739
        var a = [1, 2];                                                                                               // 740
        var result = a.splice();                                                                                      // 741
        return a.length === 2 && isArray(result) && result.length === 0;                                              // 742
    }());                                                                                                             // 743
    defineProperties(ArrayPrototype, {                                                                                // 744
        // Safari 5.0 bug where .splice() returns undefined                                                           // 745
        splice: function splice(start, deleteCount) {                                                                 // 746
            if (arguments.length === 0) {                                                                             // 747
                return [];                                                                                            // 748
            } else {                                                                                                  // 749
                return array_splice.apply(this, arguments);                                                           // 750
            }                                                                                                         // 751
        }                                                                                                             // 752
    }, !spliceNoopReturnsEmptyArray);                                                                                 // 753
                                                                                                                      // 754
    var spliceWorksWithEmptyObject = (function () {                                                                   // 755
        var obj = {};                                                                                                 // 756
        ArrayPrototype.splice.call(obj, 0, 0, 1);                                                                     // 757
        return obj.length === 1;                                                                                      // 758
    }());                                                                                                             // 759
    defineProperties(ArrayPrototype, {                                                                                // 760
        splice: function splice(start, deleteCount) {                                                                 // 761
            if (arguments.length === 0) {                                                                             // 762
                return [];                                                                                            // 763
            }                                                                                                         // 764
            var args = arguments;                                                                                     // 765
            this.length = max(ES.ToInteger(this.length), 0);                                                          // 766
            if (arguments.length > 0 && typeof deleteCount !== 'number') {                                            // 767
                args = arraySlice(arguments);                                                                         // 768
                if (args.length < 2) {                                                                                // 769
                    pushCall(args, this.length - start);                                                              // 770
                } else {                                                                                              // 771
                    args[1] = ES.ToInteger(deleteCount);                                                              // 772
                }                                                                                                     // 773
            }                                                                                                         // 774
            return array_splice.apply(this, args);                                                                    // 775
        }                                                                                                             // 776
    }, !spliceWorksWithEmptyObject);                                                                                  // 777
    var spliceWorksWithLargeSparseArrays = (function () {                                                             // 778
        // Per https://github.com/es-shims/es5-shim/issues/295                                                        // 779
        // Safari 7/8 breaks with sparse arrays of size 1e5 or greater                                                // 780
        var arr = new $Array(1e5);                                                                                    // 781
        // note: the index MUST be 8 or larger or the test will false pass                                            // 782
        arr[8] = 'x';                                                                                                 // 783
        arr.splice(1, 1);                                                                                             // 784
        // note: this test must be defined *after* the indexOf shim                                                   // 785
        // per https://github.com/es-shims/es5-shim/issues/313                                                        // 786
        return arr.indexOf('x') === 7;                                                                                // 787
    }());                                                                                                             // 788
    var spliceWorksWithSmallSparseArrays = (function () {                                                             // 789
        // Per https://github.com/es-shims/es5-shim/issues/295                                                        // 790
        // Opera 12.15 breaks on this, no idea why.                                                                   // 791
        var n = 256;                                                                                                  // 792
        var arr = [];                                                                                                 // 793
        arr[n] = 'a';                                                                                                 // 794
        arr.splice(n + 1, 0, 'b');                                                                                    // 795
        return arr[n] === 'a';                                                                                        // 796
    }());                                                                                                             // 797
    defineProperties(ArrayPrototype, {                                                                                // 798
        splice: function splice(start, deleteCount) {                                                                 // 799
            var O = ES.ToObject(this);                                                                                // 800
            var A = [];                                                                                               // 801
            var len = ES.ToUint32(O.length);                                                                          // 802
            var relativeStart = ES.ToInteger(start);                                                                  // 803
            var actualStart = relativeStart < 0 ? max((len + relativeStart), 0) : min(relativeStart, len);            // 804
            var actualDeleteCount = min(max(ES.ToInteger(deleteCount), 0), len - actualStart);                        // 805
                                                                                                                      // 806
            var k = 0;                                                                                                // 807
            var from;                                                                                                 // 808
            while (k < actualDeleteCount) {                                                                           // 809
                from = $String(actualStart + k);                                                                      // 810
                if (owns(O, from)) {                                                                                  // 811
                    A[k] = O[from];                                                                                   // 812
                }                                                                                                     // 813
                k += 1;                                                                                               // 814
            }                                                                                                         // 815
                                                                                                                      // 816
            var items = arraySlice(arguments, 2);                                                                     // 817
            var itemCount = items.length;                                                                             // 818
            var to;                                                                                                   // 819
            if (itemCount < actualDeleteCount) {                                                                      // 820
                k = actualStart;                                                                                      // 821
                var maxK = len - actualDeleteCount;                                                                   // 822
                while (k < maxK) {                                                                                    // 823
                    from = $String(k + actualDeleteCount);                                                            // 824
                    to = $String(k + itemCount);                                                                      // 825
                    if (owns(O, from)) {                                                                              // 826
                        O[to] = O[from];                                                                              // 827
                    } else {                                                                                          // 828
                        delete O[to];                                                                                 // 829
                    }                                                                                                 // 830
                    k += 1;                                                                                           // 831
                }                                                                                                     // 832
                k = len;                                                                                              // 833
                var minK = len - actualDeleteCount + itemCount;                                                       // 834
                while (k > minK) {                                                                                    // 835
                    delete O[k - 1];                                                                                  // 836
                    k -= 1;                                                                                           // 837
                }                                                                                                     // 838
            } else if (itemCount > actualDeleteCount) {                                                               // 839
                k = len - actualDeleteCount;                                                                          // 840
                while (k > actualStart) {                                                                             // 841
                    from = $String(k + actualDeleteCount - 1);                                                        // 842
                    to = $String(k + itemCount - 1);                                                                  // 843
                    if (owns(O, from)) {                                                                              // 844
                        O[to] = O[from];                                                                              // 845
                    } else {                                                                                          // 846
                        delete O[to];                                                                                 // 847
                    }                                                                                                 // 848
                    k -= 1;                                                                                           // 849
                }                                                                                                     // 850
            }                                                                                                         // 851
            k = actualStart;                                                                                          // 852
            for (var i = 0; i < items.length; ++i) {                                                                  // 853
                O[k] = items[i];                                                                                      // 854
                k += 1;                                                                                               // 855
            }                                                                                                         // 856
            O.length = len - actualDeleteCount + itemCount;                                                           // 857
                                                                                                                      // 858
            return A;                                                                                                 // 859
        }                                                                                                             // 860
    }, !spliceWorksWithLargeSparseArrays || !spliceWorksWithSmallSparseArrays);                                       // 861
                                                                                                                      // 862
    var originalJoin = ArrayPrototype.join;                                                                           // 863
    var hasStringJoinBug;                                                                                             // 864
    try {                                                                                                             // 865
        hasStringJoinBug = Array.prototype.join.call('123', ',') !== '1,2,3';                                         // 866
    } catch (e) {                                                                                                     // 867
        hasStringJoinBug = true;                                                                                      // 868
    }                                                                                                                 // 869
    if (hasStringJoinBug) {                                                                                           // 870
        defineProperties(ArrayPrototype, {                                                                            // 871
            join: function join(separator) {                                                                          // 872
                var sep = typeof separator === 'undefined' ? ',' : separator;                                         // 873
                return originalJoin.call(isString(this) ? strSplit(this, '') : this, sep);                            // 874
            }                                                                                                         // 875
        }, hasStringJoinBug);                                                                                         // 876
    }                                                                                                                 // 877
                                                                                                                      // 878
    var hasJoinUndefinedBug = [1, 2].join(undefined) !== '1,2';                                                       // 879
    if (hasJoinUndefinedBug) {                                                                                        // 880
        defineProperties(ArrayPrototype, {                                                                            // 881
            join: function join(separator) {                                                                          // 882
                var sep = typeof separator === 'undefined' ? ',' : separator;                                         // 883
                return originalJoin.call(this, sep);                                                                  // 884
            }                                                                                                         // 885
        }, hasJoinUndefinedBug);                                                                                      // 886
    }                                                                                                                 // 887
                                                                                                                      // 888
    var pushShim = function push(item) {                                                                              // 889
        var O = ES.ToObject(this);                                                                                    // 890
        var n = ES.ToUint32(O.length);                                                                                // 891
        var i = 0;                                                                                                    // 892
        while (i < arguments.length) {                                                                                // 893
            O[n + i] = arguments[i];                                                                                  // 894
            i += 1;                                                                                                   // 895
        }                                                                                                             // 896
        O.length = n + i;                                                                                             // 897
        return n + i;                                                                                                 // 898
    };                                                                                                                // 899
                                                                                                                      // 900
    var pushIsNotGeneric = (function () {                                                                             // 901
        var obj = {};                                                                                                 // 902
        var result = Array.prototype.push.call(obj, undefined);                                                       // 903
        return result !== 1 || obj.length !== 1 || typeof obj[0] !== 'undefined' || !owns(obj, 0);                    // 904
    }());                                                                                                             // 905
    defineProperties(ArrayPrototype, {                                                                                // 906
        push: function push(item) {                                                                                   // 907
            if (isArray(this)) {                                                                                      // 908
                return array_push.apply(this, arguments);                                                             // 909
            }                                                                                                         // 910
            return pushShim.apply(this, arguments);                                                                   // 911
        }                                                                                                             // 912
    }, pushIsNotGeneric);                                                                                             // 913
                                                                                                                      // 914
    // This fixes a very weird bug in Opera 10.6 when pushing `undefined                                              // 915
    var pushUndefinedIsWeird = (function () {                                                                         // 916
        var arr = [];                                                                                                 // 917
        var result = arr.push(undefined);                                                                             // 918
        return result !== 1 || arr.length !== 1 || typeof arr[0] !== 'undefined' || !owns(arr, 0);                    // 919
    }());                                                                                                             // 920
    defineProperties(ArrayPrototype, { push: pushShim }, pushUndefinedIsWeird);                                       // 921
                                                                                                                      // 922
    // ES5 15.2.3.14                                                                                                  // 923
    // http://es5.github.io/#x15.4.4.10                                                                               // 924
    // Fix boxed string bug                                                                                           // 925
    defineProperties(ArrayPrototype, {                                                                                // 926
        slice: function (start, end) {                                                                                // 927
            var arr = isString(this) ? strSplit(this, '') : this;                                                     // 928
            return arraySliceApply(arr, arguments);                                                                   // 929
        }                                                                                                             // 930
    }, splitString);                                                                                                  // 931
                                                                                                                      // 932
    var sortIgnoresNonFunctions = (function () {                                                                      // 933
        try {                                                                                                         // 934
            [1, 2].sort(null);                                                                                        // 935
            [1, 2].sort({});                                                                                          // 936
            return true;                                                                                              // 937
        } catch (e) {}                                                                                                // 938
        return false;                                                                                                 // 939
    }());                                                                                                             // 940
    var sortThrowsOnRegex = (function () {                                                                            // 941
        // this is a problem in Firefox 4, in which `typeof /a/ === 'function'`                                       // 942
        try {                                                                                                         // 943
            [1, 2].sort(/a/);                                                                                         // 944
            return false;                                                                                             // 945
        } catch (e) {}                                                                                                // 946
        return true;                                                                                                  // 947
    }());                                                                                                             // 948
    var sortIgnoresUndefined = (function () {                                                                         // 949
        // applies in IE 8, for one.                                                                                  // 950
        try {                                                                                                         // 951
            [1, 2].sort(undefined);                                                                                   // 952
            return true;                                                                                              // 953
        } catch (e) {}                                                                                                // 954
        return false;                                                                                                 // 955
    }());                                                                                                             // 956
    defineProperties(ArrayPrototype, {                                                                                // 957
        sort: function sort(compareFn) {                                                                              // 958
            if (typeof compareFn === 'undefined') {                                                                   // 959
                return arraySort(this);                                                                               // 960
            }                                                                                                         // 961
            if (!isCallable(compareFn)) {                                                                             // 962
                throw new TypeError('Array.prototype.sort callback must be a function');                              // 963
            }                                                                                                         // 964
            return arraySort(this, compareFn);                                                                        // 965
        }                                                                                                             // 966
    }, sortIgnoresNonFunctions || !sortIgnoresUndefined || !sortThrowsOnRegex);                                       // 967
                                                                                                                      // 968
    //                                                                                                                // 969
    // Object                                                                                                         // 970
    // ======                                                                                                         // 971
    //                                                                                                                // 972
                                                                                                                      // 973
    // ES5 15.2.3.14                                                                                                  // 974
    // http://es5.github.com/#x15.2.3.14                                                                              // 975
                                                                                                                      // 976
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation                            // 977
    var hasDontEnumBug = !isEnum({ 'toString': null }, 'toString');                                                   // 978
    var hasProtoEnumBug = isEnum(function () {}, 'prototype');                                                        // 979
    var hasStringEnumBug = !owns('x', '0');                                                                           // 980
    var equalsConstructorPrototype = function (o) {                                                                   // 981
        var ctor = o.constructor;                                                                                     // 982
        return ctor && ctor.prototype === o;                                                                          // 983
    };                                                                                                                // 984
    var blacklistedKeys = {                                                                                           // 985
        $window: true,                                                                                                // 986
        $console: true,                                                                                               // 987
        $parent: true,                                                                                                // 988
        $self: true,                                                                                                  // 989
        $frame: true,                                                                                                 // 990
        $frames: true,                                                                                                // 991
        $frameElement: true,                                                                                          // 992
        $webkitIndexedDB: true,                                                                                       // 993
        $webkitStorageInfo: true,                                                                                     // 994
        $external: true                                                                                               // 995
    };                                                                                                                // 996
    var hasAutomationEqualityBug = (function () {                                                                     // 997
        /* globals window */                                                                                          // 998
        if (typeof window === 'undefined') {                                                                          // 999
            return false;                                                                                             // 1000
        }                                                                                                             // 1001
        for (var k in window) {                                                                                       // 1002
            try {                                                                                                     // 1003
                if (!blacklistedKeys['$' + k] && owns(window, k) && window[k] !== null && typeof window[k] === 'object') {
                    equalsConstructorPrototype(window[k]);                                                            // 1005
                }                                                                                                     // 1006
            } catch (e) {                                                                                             // 1007
                return true;                                                                                          // 1008
            }                                                                                                         // 1009
        }                                                                                                             // 1010
        return false;                                                                                                 // 1011
    }());                                                                                                             // 1012
    var equalsConstructorPrototypeIfNotBuggy = function (object) {                                                    // 1013
        if (typeof window === 'undefined' || !hasAutomationEqualityBug) {                                             // 1014
            return equalsConstructorPrototype(object);                                                                // 1015
        }                                                                                                             // 1016
        try {                                                                                                         // 1017
            return equalsConstructorPrototype(object);                                                                // 1018
        } catch (e) {                                                                                                 // 1019
            return false;                                                                                             // 1020
        }                                                                                                             // 1021
    };                                                                                                                // 1022
    var dontEnums = [                                                                                                 // 1023
        'toString',                                                                                                   // 1024
        'toLocaleString',                                                                                             // 1025
        'valueOf',                                                                                                    // 1026
        'hasOwnProperty',                                                                                             // 1027
        'isPrototypeOf',                                                                                              // 1028
        'propertyIsEnumerable',                                                                                       // 1029
        'constructor'                                                                                                 // 1030
    ];                                                                                                                // 1031
    var dontEnumsLength = dontEnums.length;                                                                           // 1032
                                                                                                                      // 1033
    // taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js                                // 1034
    // can be replaced with require('is-arguments') if we ever use a build process instead                            // 1035
    var isStandardArguments = function isArguments(value) {                                                           // 1036
        return toStr(value) === '[object Arguments]';                                                                 // 1037
    };                                                                                                                // 1038
    var isLegacyArguments = function isArguments(value) {                                                             // 1039
        return value !== null &&                                                                                      // 1040
            typeof value === 'object' &&                                                                              // 1041
            typeof value.length === 'number' &&                                                                       // 1042
            value.length >= 0 &&                                                                                      // 1043
            !isArray(value) &&                                                                                        // 1044
            isCallable(value.callee);                                                                                 // 1045
    };                                                                                                                // 1046
    var isArguments = isStandardArguments(arguments) ? isStandardArguments : isLegacyArguments;                       // 1047
                                                                                                                      // 1048
    defineProperties($Object, {                                                                                       // 1049
        keys: function keys(object) {                                                                                 // 1050
            var isFn = isCallable(object);                                                                            // 1051
            var isArgs = isArguments(object);                                                                         // 1052
            var isObject = object !== null && typeof object === 'object';                                             // 1053
            var isStr = isObject && isString(object);                                                                 // 1054
                                                                                                                      // 1055
            if (!isObject && !isFn && !isArgs) {                                                                      // 1056
                throw new TypeError('Object.keys called on a non-object');                                            // 1057
            }                                                                                                         // 1058
                                                                                                                      // 1059
            var theKeys = [];                                                                                         // 1060
            var skipProto = hasProtoEnumBug && isFn;                                                                  // 1061
            if ((isStr && hasStringEnumBug) || isArgs) {                                                              // 1062
                for (var i = 0; i < object.length; ++i) {                                                             // 1063
                    pushCall(theKeys, $String(i));                                                                    // 1064
                }                                                                                                     // 1065
            }                                                                                                         // 1066
                                                                                                                      // 1067
            if (!isArgs) {                                                                                            // 1068
                for (var name in object) {                                                                            // 1069
                    if (!(skipProto && name === 'prototype') && owns(object, name)) {                                 // 1070
                        pushCall(theKeys, $String(name));                                                             // 1071
                    }                                                                                                 // 1072
                }                                                                                                     // 1073
            }                                                                                                         // 1074
                                                                                                                      // 1075
            if (hasDontEnumBug) {                                                                                     // 1076
                var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);                                   // 1077
                for (var j = 0; j < dontEnumsLength; j++) {                                                           // 1078
                    var dontEnum = dontEnums[j];                                                                      // 1079
                    if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {                 // 1080
                        pushCall(theKeys, dontEnum);                                                                  // 1081
                    }                                                                                                 // 1082
                }                                                                                                     // 1083
            }                                                                                                         // 1084
            return theKeys;                                                                                           // 1085
        }                                                                                                             // 1086
    });                                                                                                               // 1087
                                                                                                                      // 1088
    var keysWorksWithArguments = $Object.keys && (function () {                                                       // 1089
        // Safari 5.0 bug                                                                                             // 1090
        return $Object.keys(arguments).length === 2;                                                                  // 1091
    }(1, 2));                                                                                                         // 1092
    var keysHasArgumentsLengthBug = $Object.keys && (function () {                                                    // 1093
        var argKeys = $Object.keys(arguments);                                                                        // 1094
        return arguments.length !== 1 || argKeys.length !== 1 || argKeys[0] !== 1;                                    // 1095
    }(1));                                                                                                            // 1096
    var originalKeys = $Object.keys;                                                                                  // 1097
    defineProperties($Object, {                                                                                       // 1098
        keys: function keys(object) {                                                                                 // 1099
            if (isArguments(object)) {                                                                                // 1100
                return originalKeys(arraySlice(object));                                                              // 1101
            } else {                                                                                                  // 1102
                return originalKeys(object);                                                                          // 1103
            }                                                                                                         // 1104
        }                                                                                                             // 1105
    }, !keysWorksWithArguments || keysHasArgumentsLengthBug);                                                         // 1106
                                                                                                                      // 1107
    //                                                                                                                // 1108
    // Date                                                                                                           // 1109
    // ====                                                                                                           // 1110
    //                                                                                                                // 1111
                                                                                                                      // 1112
    var hasNegativeMonthYearBug = new Date(-3509827329600292).getUTCMonth() !== 0;                                    // 1113
    var aNegativeTestDate = new Date(-1509842289600292);                                                              // 1114
    var aPositiveTestDate = new Date(1449662400000);                                                                  // 1115
    var hasToUTCStringFormatBug = aNegativeTestDate.toUTCString() !== 'Mon, 01 Jan -45875 11:59:59 GMT';              // 1116
    var hasToDateStringFormatBug;                                                                                     // 1117
    var hasToStringFormatBug;                                                                                         // 1118
    var timeZoneOffset = aNegativeTestDate.getTimezoneOffset();                                                       // 1119
    if (timeZoneOffset < -720) {                                                                                      // 1120
        hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Tue Jan 02 -45875';                          // 1121
        hasToStringFormatBug = !(/^Thu Dec 10 2015 \d\d:\d\d:\d\d GMT[-\+]\d\d\d\d(?: |$)/).test(aPositiveTestDate.toString());
    } else {                                                                                                          // 1123
        hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Mon Jan 01 -45875';                          // 1124
        hasToStringFormatBug = !(/^Wed Dec 09 2015 \d\d:\d\d:\d\d GMT[-\+]\d\d\d\d(?: |$)/).test(aPositiveTestDate.toString());
    }                                                                                                                 // 1126
                                                                                                                      // 1127
    var originalGetFullYear = call.bind(Date.prototype.getFullYear);                                                  // 1128
    var originalGetMonth = call.bind(Date.prototype.getMonth);                                                        // 1129
    var originalGetDate = call.bind(Date.prototype.getDate);                                                          // 1130
    var originalGetUTCFullYear = call.bind(Date.prototype.getUTCFullYear);                                            // 1131
    var originalGetUTCMonth = call.bind(Date.prototype.getUTCMonth);                                                  // 1132
    var originalGetUTCDate = call.bind(Date.prototype.getUTCDate);                                                    // 1133
    var originalGetUTCDay = call.bind(Date.prototype.getUTCDay);                                                      // 1134
    var originalGetUTCHours = call.bind(Date.prototype.getUTCHours);                                                  // 1135
    var originalGetUTCMinutes = call.bind(Date.prototype.getUTCMinutes);                                              // 1136
    var originalGetUTCSeconds = call.bind(Date.prototype.getUTCSeconds);                                              // 1137
    var originalGetUTCMilliseconds = call.bind(Date.prototype.getUTCMilliseconds);                                    // 1138
    var dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];                                                  // 1139
    var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];             // 1140
    var daysInMonth = function daysInMonth(month, year) {                                                             // 1141
        return originalGetDate(new Date(year, month, 0));                                                             // 1142
    };                                                                                                                // 1143
                                                                                                                      // 1144
    defineProperties(Date.prototype, {                                                                                // 1145
        getFullYear: function getFullYear() {                                                                         // 1146
            if (!this || !(this instanceof Date)) {                                                                   // 1147
                throw new TypeError('this is not a Date object.');                                                    // 1148
            }                                                                                                         // 1149
            var year = originalGetFullYear(this);                                                                     // 1150
            if (year < 0 && originalGetMonth(this) > 11) {                                                            // 1151
                return year + 1;                                                                                      // 1152
            }                                                                                                         // 1153
            return year;                                                                                              // 1154
        },                                                                                                            // 1155
        getMonth: function getMonth() {                                                                               // 1156
            if (!this || !(this instanceof Date)) {                                                                   // 1157
                throw new TypeError('this is not a Date object.');                                                    // 1158
            }                                                                                                         // 1159
            var year = originalGetFullYear(this);                                                                     // 1160
            var month = originalGetMonth(this);                                                                       // 1161
            if (year < 0 && month > 11) {                                                                             // 1162
                return 0;                                                                                             // 1163
            }                                                                                                         // 1164
            return month;                                                                                             // 1165
        },                                                                                                            // 1166
        getDate: function getDate() {                                                                                 // 1167
            if (!this || !(this instanceof Date)) {                                                                   // 1168
                throw new TypeError('this is not a Date object.');                                                    // 1169
            }                                                                                                         // 1170
            var year = originalGetFullYear(this);                                                                     // 1171
            var month = originalGetMonth(this);                                                                       // 1172
            var date = originalGetDate(this);                                                                         // 1173
            if (year < 0 && month > 11) {                                                                             // 1174
                if (month === 12) {                                                                                   // 1175
                    return date;                                                                                      // 1176
                }                                                                                                     // 1177
                var days = daysInMonth(0, year + 1);                                                                  // 1178
                return (days - date) + 1;                                                                             // 1179
            }                                                                                                         // 1180
            return date;                                                                                              // 1181
        },                                                                                                            // 1182
        getUTCFullYear: function getUTCFullYear() {                                                                   // 1183
            if (!this || !(this instanceof Date)) {                                                                   // 1184
                throw new TypeError('this is not a Date object.');                                                    // 1185
            }                                                                                                         // 1186
            var year = originalGetUTCFullYear(this);                                                                  // 1187
            if (year < 0 && originalGetUTCMonth(this) > 11) {                                                         // 1188
                return year + 1;                                                                                      // 1189
            }                                                                                                         // 1190
            return year;                                                                                              // 1191
        },                                                                                                            // 1192
        getUTCMonth: function getUTCMonth() {                                                                         // 1193
            if (!this || !(this instanceof Date)) {                                                                   // 1194
                throw new TypeError('this is not a Date object.');                                                    // 1195
            }                                                                                                         // 1196
            var year = originalGetUTCFullYear(this);                                                                  // 1197
            var month = originalGetUTCMonth(this);                                                                    // 1198
            if (year < 0 && month > 11) {                                                                             // 1199
                return 0;                                                                                             // 1200
            }                                                                                                         // 1201
            return month;                                                                                             // 1202
        },                                                                                                            // 1203
        getUTCDate: function getUTCDate() {                                                                           // 1204
            if (!this || !(this instanceof Date)) {                                                                   // 1205
                throw new TypeError('this is not a Date object.');                                                    // 1206
            }                                                                                                         // 1207
            var year = originalGetUTCFullYear(this);                                                                  // 1208
            var month = originalGetUTCMonth(this);                                                                    // 1209
            var date = originalGetUTCDate(this);                                                                      // 1210
            if (year < 0 && month > 11) {                                                                             // 1211
                if (month === 12) {                                                                                   // 1212
                    return date;                                                                                      // 1213
                }                                                                                                     // 1214
                var days = daysInMonth(0, year + 1);                                                                  // 1215
                return (days - date) + 1;                                                                             // 1216
            }                                                                                                         // 1217
            return date;                                                                                              // 1218
        }                                                                                                             // 1219
    }, hasNegativeMonthYearBug);                                                                                      // 1220
                                                                                                                      // 1221
    defineProperties(Date.prototype, {                                                                                // 1222
        toUTCString: function toUTCString() {                                                                         // 1223
            if (!this || !(this instanceof Date)) {                                                                   // 1224
                throw new TypeError('this is not a Date object.');                                                    // 1225
            }                                                                                                         // 1226
            var day = originalGetUTCDay(this);                                                                        // 1227
            var date = originalGetUTCDate(this);                                                                      // 1228
            var month = originalGetUTCMonth(this);                                                                    // 1229
            var year = originalGetUTCFullYear(this);                                                                  // 1230
            var hour = originalGetUTCHours(this);                                                                     // 1231
            var minute = originalGetUTCMinutes(this);                                                                 // 1232
            var second = originalGetUTCSeconds(this);                                                                 // 1233
            return dayName[day] + ', ' +                                                                              // 1234
                (date < 10 ? '0' + date : date) + ' ' +                                                               // 1235
                monthName[month] + ' ' +                                                                              // 1236
                year + ' ' +                                                                                          // 1237
                (hour < 10 ? '0' + hour : hour) + ':' +                                                               // 1238
                (minute < 10 ? '0' + minute : minute) + ':' +                                                         // 1239
                (second < 10 ? '0' + second : second) + ' GMT';                                                       // 1240
        }                                                                                                             // 1241
    }, hasNegativeMonthYearBug || hasToUTCStringFormatBug);                                                           // 1242
                                                                                                                      // 1243
    // Opera 12 has `,`                                                                                               // 1244
    defineProperties(Date.prototype, {                                                                                // 1245
        toDateString: function toDateString() {                                                                       // 1246
            if (!this || !(this instanceof Date)) {                                                                   // 1247
                throw new TypeError('this is not a Date object.');                                                    // 1248
            }                                                                                                         // 1249
            var day = this.getDay();                                                                                  // 1250
            var date = this.getDate();                                                                                // 1251
            var month = this.getMonth();                                                                              // 1252
            var year = this.getFullYear();                                                                            // 1253
            return dayName[day] + ' ' +                                                                               // 1254
                monthName[month] + ' ' +                                                                              // 1255
                (date < 10 ? '0' + date : date) + ' ' +                                                               // 1256
                year;                                                                                                 // 1257
        }                                                                                                             // 1258
    }, hasNegativeMonthYearBug || hasToDateStringFormatBug);                                                          // 1259
                                                                                                                      // 1260
    // can't use defineProperties here because of toString enumeration issue in IE <= 8                               // 1261
    if (hasNegativeMonthYearBug || hasToStringFormatBug) {                                                            // 1262
        Date.prototype.toString = function toString() {                                                               // 1263
            if (!this || !(this instanceof Date)) {                                                                   // 1264
                throw new TypeError('this is not a Date object.');                                                    // 1265
            }                                                                                                         // 1266
            var day = this.getDay();                                                                                  // 1267
            var date = this.getDate();                                                                                // 1268
            var month = this.getMonth();                                                                              // 1269
            var year = this.getFullYear();                                                                            // 1270
            var hour = this.getHours();                                                                               // 1271
            var minute = this.getMinutes();                                                                           // 1272
            var second = this.getSeconds();                                                                           // 1273
            var timezoneOffset = this.getTimezoneOffset();                                                            // 1274
            var hoursOffset = Math.floor(Math.abs(timezoneOffset) / 60);                                              // 1275
            var minutesOffset = Math.floor(Math.abs(timezoneOffset) % 60);                                            // 1276
            return dayName[day] + ' ' +                                                                               // 1277
                monthName[month] + ' ' +                                                                              // 1278
                (date < 10 ? '0' + date : date) + ' ' +                                                               // 1279
                year + ' ' +                                                                                          // 1280
                (hour < 10 ? '0' + hour : hour) + ':' +                                                               // 1281
                (minute < 10 ? '0' + minute : minute) + ':' +                                                         // 1282
                (second < 10 ? '0' + second : second) + ' GMT' +                                                      // 1283
                (timezoneOffset > 0 ? '-' : '+') +                                                                    // 1284
                (hoursOffset < 10 ? '0' + hoursOffset : hoursOffset) +                                                // 1285
                (minutesOffset < 10 ? '0' + minutesOffset : minutesOffset);                                           // 1286
        };                                                                                                            // 1287
        if (supportsDescriptors) {                                                                                    // 1288
            $Object.defineProperty(Date.prototype, 'toString', {                                                      // 1289
                configurable: true,                                                                                   // 1290
                enumerable: false,                                                                                    // 1291
                writable: true                                                                                        // 1292
            });                                                                                                       // 1293
        }                                                                                                             // 1294
    }                                                                                                                 // 1295
                                                                                                                      // 1296
    // ES5 15.9.5.43                                                                                                  // 1297
    // http://es5.github.com/#x15.9.5.43                                                                              // 1298
    // This function returns a String value represent the instance in time                                            // 1299
    // represented by this Date object. The format of the String is the Date Time                                     // 1300
    // string format defined in 15.9.1.15. All fields are present in the String.                                      // 1301
    // The time zone is always UTC, denoted by the suffix Z. If the time value of                                     // 1302
    // this object is not a finite Number a RangeError exception is thrown.                                           // 1303
    var negativeDate = -62198755200000;                                                                               // 1304
    var negativeYearString = '-000001';                                                                               // 1305
    var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;
    var hasSafari51DateBug = Date.prototype.toISOString && new Date(-1).toISOString() !== '1969-12-31T23:59:59.999Z';
                                                                                                                      // 1308
    var getTime = call.bind(Date.prototype.getTime);                                                                  // 1309
                                                                                                                      // 1310
    defineProperties(Date.prototype, {                                                                                // 1311
        toISOString: function toISOString() {                                                                         // 1312
            if (!isFinite(this) || !isFinite(getTime(this))) {                                                        // 1313
                // Adope Photoshop requires the second check.                                                         // 1314
                throw new RangeError('Date.prototype.toISOString called on non-finite value.');                       // 1315
            }                                                                                                         // 1316
                                                                                                                      // 1317
            var year = originalGetUTCFullYear(this);                                                                  // 1318
                                                                                                                      // 1319
            var month = originalGetUTCMonth(this);                                                                    // 1320
            // see https://github.com/es-shims/es5-shim/issues/111                                                    // 1321
            year += Math.floor(month / 12);                                                                           // 1322
            month = (month % 12 + 12) % 12;                                                                           // 1323
                                                                                                                      // 1324
            // the date time string format is specified in 15.9.1.15.                                                 // 1325
            var result = [month + 1, originalGetUTCDate(this), originalGetUTCHours(this), originalGetUTCMinutes(this), originalGetUTCSeconds(this)];
            year = (                                                                                                  // 1327
                (year < 0 ? '-' : (year > 9999 ? '+' : '')) +                                                         // 1328
                strSlice('00000' + Math.abs(year), (0 <= year && year <= 9999) ? -4 : -6)                             // 1329
            );                                                                                                        // 1330
                                                                                                                      // 1331
            for (var i = 0; i < result.length; ++i) {                                                                 // 1332
                // pad months, days, hours, minutes, and seconds to have two digits.                                  // 1333
                result[i] = strSlice('00' + result[i], -2);                                                           // 1334
            }                                                                                                         // 1335
            // pad milliseconds to have three digits.                                                                 // 1336
            return (                                                                                                  // 1337
                year + '-' + arraySlice(result, 0, 2).join('-') +                                                     // 1338
                'T' + arraySlice(result, 2).join(':') + '.' +                                                         // 1339
                strSlice('000' + originalGetUTCMilliseconds(this), -3) + 'Z'                                          // 1340
            );                                                                                                        // 1341
        }                                                                                                             // 1342
    }, hasNegativeDateBug || hasSafari51DateBug);                                                                     // 1343
                                                                                                                      // 1344
    // ES5 15.9.5.44                                                                                                  // 1345
    // http://es5.github.com/#x15.9.5.44                                                                              // 1346
    // This function provides a String representation of a Date object for use by                                     // 1347
    // JSON.stringify (15.12.3).                                                                                      // 1348
    var dateToJSONIsSupported = (function () {                                                                        // 1349
        try {                                                                                                         // 1350
            return Date.prototype.toJSON &&                                                                           // 1351
                new Date(NaN).toJSON() === null &&                                                                    // 1352
                new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&                                 // 1353
                Date.prototype.toJSON.call({ // generic                                                               // 1354
                    toISOString: function () { return true; }                                                         // 1355
                });                                                                                                   // 1356
        } catch (e) {                                                                                                 // 1357
            return false;                                                                                             // 1358
        }                                                                                                             // 1359
    }());                                                                                                             // 1360
    if (!dateToJSONIsSupported) {                                                                                     // 1361
        Date.prototype.toJSON = function toJSON(key) {                                                                // 1362
            // When the toJSON method is called with argument key, the following                                      // 1363
            // steps are taken:                                                                                       // 1364
                                                                                                                      // 1365
            // 1.  Let O be the result of calling ToObject, giving it the this                                        // 1366
            // value as its argument.                                                                                 // 1367
            // 2. Let tv be ES.ToPrimitive(O, hint Number).                                                           // 1368
            var O = $Object(this);                                                                                    // 1369
            var tv = ES.ToPrimitive(O);                                                                               // 1370
            // 3. If tv is a Number and is not finite, return null.                                                   // 1371
            if (typeof tv === 'number' && !isFinite(tv)) {                                                            // 1372
                return null;                                                                                          // 1373
            }                                                                                                         // 1374
            // 4. Let toISO be the result of calling the [[Get]] internal method of                                   // 1375
            // O with argument "toISOString".                                                                         // 1376
            var toISO = O.toISOString;                                                                                // 1377
            // 5. If IsCallable(toISO) is false, throw a TypeError exception.                                         // 1378
            if (!isCallable(toISO)) {                                                                                 // 1379
                throw new TypeError('toISOString property is not callable');                                          // 1380
            }                                                                                                         // 1381
            // 6. Return the result of calling the [[Call]] internal method of                                        // 1382
            //  toISO with O as the this value and an empty argument list.                                            // 1383
            return toISO.call(O);                                                                                     // 1384
                                                                                                                      // 1385
            // NOTE 1 The argument is ignored.                                                                        // 1386
                                                                                                                      // 1387
            // NOTE 2 The toJSON function is intentionally generic; it does not                                       // 1388
            // require that its this value be a Date object. Therefore, it can be                                     // 1389
            // transferred to other kinds of objects for use as a method. However,                                    // 1390
            // it does require that any such object have a toISOString method. An                                     // 1391
            // object is free to use the argument key to filter its                                                   // 1392
            // stringification.                                                                                       // 1393
        };                                                                                                            // 1394
    }                                                                                                                 // 1395
                                                                                                                      // 1396
    // ES5 15.9.4.2                                                                                                   // 1397
    // http://es5.github.com/#x15.9.4.2                                                                               // 1398
    // based on work shared by Daniel Friesen (dantman)                                                               // 1399
    // http://gist.github.com/303249                                                                                  // 1400
    var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;                                   // 1401
    var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z')) || !isNaN(Date.parse('2012-12-31T23:59:60.000Z'));
    var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));                                       // 1403
    if (doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {                                    // 1404
        // XXX global assignment won't work in embeddings that use                                                    // 1405
        // an alternate object for the context.                                                                       // 1406
        /* global Date: true */                                                                                       // 1407
        /* eslint-disable no-undef */                                                                                 // 1408
        var maxSafeUnsigned32Bit = Math.pow(2, 31) - 1;                                                               // 1409
        var hasSafariSignedIntBug = isActualNaN(new Date(1970, 0, 1, 0, 0, 0, maxSafeUnsigned32Bit + 1).getTime());   // 1410
        /* eslint-disable no-implicit-globals */                                                                      // 1411
        Date = (function (NativeDate) {                                                                               // 1412
        /* eslint-enable no-implicit-globals */                                                                       // 1413
        /* eslint-enable no-undef */                                                                                  // 1414
            // Date.length === 7                                                                                      // 1415
            var DateShim = function Date(Y, M, D, h, m, s, ms) {                                                      // 1416
                var length = arguments.length;                                                                        // 1417
                var date;                                                                                             // 1418
                if (this instanceof NativeDate) {                                                                     // 1419
                    var seconds = s;                                                                                  // 1420
                    var millis = ms;                                                                                  // 1421
                    if (hasSafariSignedIntBug && length >= 7 && ms > maxSafeUnsigned32Bit) {                          // 1422
                        // work around a Safari 8/9 bug where it treats the seconds as signed                         // 1423
                        var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;                 // 1424
                        var sToShift = Math.floor(msToShift / 1e3);                                                   // 1425
                        seconds += sToShift;                                                                          // 1426
                        millis -= sToShift * 1e3;                                                                     // 1427
                    }                                                                                                 // 1428
                    date = length === 1 && $String(Y) === Y ? // isString(Y)                                          // 1429
                        // We explicitly pass it through parse:                                                       // 1430
                        new NativeDate(DateShim.parse(Y)) :                                                           // 1431
                        // We have to manually make calls depending on argument                                       // 1432
                        // length here                                                                                // 1433
                        length >= 7 ? new NativeDate(Y, M, D, h, m, seconds, millis) :                                // 1434
                        length >= 6 ? new NativeDate(Y, M, D, h, m, seconds) :                                        // 1435
                        length >= 5 ? new NativeDate(Y, M, D, h, m) :                                                 // 1436
                        length >= 4 ? new NativeDate(Y, M, D, h) :                                                    // 1437
                        length >= 3 ? new NativeDate(Y, M, D) :                                                       // 1438
                        length >= 2 ? new NativeDate(Y, M) :                                                          // 1439
                        length >= 1 ? new NativeDate(Y instanceof NativeDate ? +Y : Y) :                              // 1440
                                      new NativeDate();                                                               // 1441
                } else {                                                                                              // 1442
                    date = NativeDate.apply(this, arguments);                                                         // 1443
                }                                                                                                     // 1444
                if (!isPrimitive(date)) {                                                                             // 1445
                    // Prevent mixups with unfixed Date object                                                        // 1446
                    defineProperties(date, { constructor: DateShim }, true);                                          // 1447
                }                                                                                                     // 1448
                return date;                                                                                          // 1449
            };                                                                                                        // 1450
                                                                                                                      // 1451
            // 15.9.1.15 Date Time String Format.                                                                     // 1452
            var isoDateExpression = new RegExp('^' +                                                                  // 1453
                '(\\d{4}|[+-]\\d{6})' + // four-digit year capture or sign +                                          // 1454
                                          // 6-digit extended year                                                    // 1455
                '(?:-(\\d{2})' + // optional month capture                                                            // 1456
                '(?:-(\\d{2})' + // optional day capture                                                              // 1457
                '(?:' + // capture hours:minutes:seconds.milliseconds                                                 // 1458
                    'T(\\d{2})' + // hours capture                                                                    // 1459
                    ':(\\d{2})' + // minutes capture                                                                  // 1460
                    '(?:' + // optional :seconds.milliseconds                                                         // 1461
                        ':(\\d{2})' + // seconds capture                                                              // 1462
                        '(?:(\\.\\d{1,}))?' + // milliseconds capture                                                 // 1463
                    ')?' +                                                                                            // 1464
                '(' + // capture UTC offset component                                                                 // 1465
                    'Z|' + // UTC capture                                                                             // 1466
                    '(?:' + // offset specifier +/-hours:minutes                                                      // 1467
                        '([-+])' + // sign capture                                                                    // 1468
                        '(\\d{2})' + // hours offset capture                                                          // 1469
                        ':(\\d{2})' + // minutes offset capture                                                       // 1470
                    ')' +                                                                                             // 1471
                ')?)?)?)?' +                                                                                          // 1472
            '$');                                                                                                     // 1473
                                                                                                                      // 1474
            var months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];                                // 1475
                                                                                                                      // 1476
            var dayFromMonth = function dayFromMonth(year, month) {                                                   // 1477
                var t = month > 1 ? 1 : 0;                                                                            // 1478
                return (                                                                                              // 1479
                    months[month] +                                                                                   // 1480
                    Math.floor((year - 1969 + t) / 4) -                                                               // 1481
                    Math.floor((year - 1901 + t) / 100) +                                                             // 1482
                    Math.floor((year - 1601 + t) / 400) +                                                             // 1483
                    365 * (year - 1970)                                                                               // 1484
                );                                                                                                    // 1485
            };                                                                                                        // 1486
                                                                                                                      // 1487
            var toUTC = function toUTC(t) {                                                                           // 1488
                var s = 0;                                                                                            // 1489
                var ms = t;                                                                                           // 1490
                if (hasSafariSignedIntBug && ms > maxSafeUnsigned32Bit) {                                             // 1491
                    // work around a Safari 8/9 bug where it treats the seconds as signed                             // 1492
                    var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;                     // 1493
                    var sToShift = Math.floor(msToShift / 1e3);                                                       // 1494
                    s += sToShift;                                                                                    // 1495
                    ms -= sToShift * 1e3;                                                                             // 1496
                }                                                                                                     // 1497
                return $Number(new NativeDate(1970, 0, 1, 0, 0, s, ms));                                              // 1498
            };                                                                                                        // 1499
                                                                                                                      // 1500
            // Copy any custom methods a 3rd party library may have added                                             // 1501
            for (var key in NativeDate) {                                                                             // 1502
                if (owns(NativeDate, key)) {                                                                          // 1503
                    DateShim[key] = NativeDate[key];                                                                  // 1504
                }                                                                                                     // 1505
            }                                                                                                         // 1506
                                                                                                                      // 1507
            // Copy "native" methods explicitly; they may be non-enumerable                                           // 1508
            defineProperties(DateShim, {                                                                              // 1509
                now: NativeDate.now,                                                                                  // 1510
                UTC: NativeDate.UTC                                                                                   // 1511
            }, true);                                                                                                 // 1512
            DateShim.prototype = NativeDate.prototype;                                                                // 1513
            defineProperties(DateShim.prototype, {                                                                    // 1514
                constructor: DateShim                                                                                 // 1515
            }, true);                                                                                                 // 1516
                                                                                                                      // 1517
            // Upgrade Date.parse to handle simplified ISO 8601 strings                                               // 1518
            var parseShim = function parse(string) {                                                                  // 1519
                var match = isoDateExpression.exec(string);                                                           // 1520
                if (match) {                                                                                          // 1521
                    // parse months, days, hours, minutes, seconds, and milliseconds                                  // 1522
                    // provide default values if necessary                                                            // 1523
                    // parse the UTC offset component                                                                 // 1524
                    var year = $Number(match[1]),                                                                     // 1525
                        month = $Number(match[2] || 1) - 1,                                                           // 1526
                        day = $Number(match[3] || 1) - 1,                                                             // 1527
                        hour = $Number(match[4] || 0),                                                                // 1528
                        minute = $Number(match[5] || 0),                                                              // 1529
                        second = $Number(match[6] || 0),                                                              // 1530
                        millisecond = Math.floor($Number(match[7] || 0) * 1000),                                      // 1531
                        // When time zone is missed, local offset should be used                                      // 1532
                        // (ES 5.1 bug)                                                                               // 1533
                        // see https://bugs.ecmascript.org/show_bug.cgi?id=112                                        // 1534
                        isLocalTime = Boolean(match[4] && !match[8]),                                                 // 1535
                        signOffset = match[9] === '-' ? 1 : -1,                                                       // 1536
                        hourOffset = $Number(match[10] || 0),                                                         // 1537
                        minuteOffset = $Number(match[11] || 0),                                                       // 1538
                        result;                                                                                       // 1539
                    var hasMinutesOrSecondsOrMilliseconds = minute > 0 || second > 0 || millisecond > 0;              // 1540
                    if (                                                                                              // 1541
                        hour < (hasMinutesOrSecondsOrMilliseconds ? 24 : 25) &&                                       // 1542
                        minute < 60 && second < 60 && millisecond < 1000 &&                                           // 1543
                        month > -1 && month < 12 && hourOffset < 24 &&                                                // 1544
                        minuteOffset < 60 && // detect invalid offsets                                                // 1545
                        day > -1 &&                                                                                   // 1546
                        day < (dayFromMonth(year, month + 1) - dayFromMonth(year, month))                             // 1547
                    ) {                                                                                               // 1548
                        result = (                                                                                    // 1549
                            (dayFromMonth(year, month) + day) * 24 +                                                  // 1550
                            hour +                                                                                    // 1551
                            hourOffset * signOffset                                                                   // 1552
                        ) * 60;                                                                                       // 1553
                        result = (                                                                                    // 1554
                            (result + minute + minuteOffset * signOffset) * 60 +                                      // 1555
                            second                                                                                    // 1556
                        ) * 1000 + millisecond;                                                                       // 1557
                        if (isLocalTime) {                                                                            // 1558
                            result = toUTC(result);                                                                   // 1559
                        }                                                                                             // 1560
                        if (-8.64e15 <= result && result <= 8.64e15) {                                                // 1561
                            return result;                                                                            // 1562
                        }                                                                                             // 1563
                    }                                                                                                 // 1564
                    return NaN;                                                                                       // 1565
                }                                                                                                     // 1566
                return NativeDate.parse.apply(this, arguments);                                                       // 1567
            };                                                                                                        // 1568
            defineProperties(DateShim, { parse: parseShim });                                                         // 1569
                                                                                                                      // 1570
            return DateShim;                                                                                          // 1571
        }(Date));                                                                                                     // 1572
        /* global Date: false */                                                                                      // 1573
    }                                                                                                                 // 1574
                                                                                                                      // 1575
    // ES5 15.9.4.4                                                                                                   // 1576
    // http://es5.github.com/#x15.9.4.4                                                                               // 1577
    if (!Date.now) {                                                                                                  // 1578
        Date.now = function now() {                                                                                   // 1579
            return new Date().getTime();                                                                              // 1580
        };                                                                                                            // 1581
    }                                                                                                                 // 1582
                                                                                                                      // 1583
    //                                                                                                                // 1584
    // Number                                                                                                         // 1585
    // ======                                                                                                         // 1586
    //                                                                                                                // 1587
                                                                                                                      // 1588
    // ES5.1 15.7.4.5                                                                                                 // 1589
    // http://es5.github.com/#x15.7.4.5                                                                               // 1590
    var hasToFixedBugs = NumberPrototype.toFixed && (                                                                 // 1591
      (0.00008).toFixed(3) !== '0.000' ||                                                                             // 1592
      (0.9).toFixed(0) !== '1' ||                                                                                     // 1593
      (1.255).toFixed(2) !== '1.25' ||                                                                                // 1594
      (1000000000000000128).toFixed(0) !== '1000000000000000128'                                                      // 1595
    );                                                                                                                // 1596
                                                                                                                      // 1597
    var toFixedHelpers = {                                                                                            // 1598
        base: 1e7,                                                                                                    // 1599
        size: 6,                                                                                                      // 1600
        data: [0, 0, 0, 0, 0, 0],                                                                                     // 1601
        multiply: function multiply(n, c) {                                                                           // 1602
            var i = -1;                                                                                               // 1603
            var c2 = c;                                                                                               // 1604
            while (++i < toFixedHelpers.size) {                                                                       // 1605
                c2 += n * toFixedHelpers.data[i];                                                                     // 1606
                toFixedHelpers.data[i] = c2 % toFixedHelpers.base;                                                    // 1607
                c2 = Math.floor(c2 / toFixedHelpers.base);                                                            // 1608
            }                                                                                                         // 1609
        },                                                                                                            // 1610
        divide: function divide(n) {                                                                                  // 1611
            var i = toFixedHelpers.size;                                                                              // 1612
            var c = 0;                                                                                                // 1613
            while (--i >= 0) {                                                                                        // 1614
                c += toFixedHelpers.data[i];                                                                          // 1615
                toFixedHelpers.data[i] = Math.floor(c / n);                                                           // 1616
                c = (c % n) * toFixedHelpers.base;                                                                    // 1617
            }                                                                                                         // 1618
        },                                                                                                            // 1619
        numToString: function numToString() {                                                                         // 1620
            var i = toFixedHelpers.size;                                                                              // 1621
            var s = '';                                                                                               // 1622
            while (--i >= 0) {                                                                                        // 1623
                if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {                                            // 1624
                    var t = $String(toFixedHelpers.data[i]);                                                          // 1625
                    if (s === '') {                                                                                   // 1626
                        s = t;                                                                                        // 1627
                    } else {                                                                                          // 1628
                        s += strSlice('0000000', 0, 7 - t.length) + t;                                                // 1629
                    }                                                                                                 // 1630
                }                                                                                                     // 1631
            }                                                                                                         // 1632
            return s;                                                                                                 // 1633
        },                                                                                                            // 1634
        pow: function pow(x, n, acc) {                                                                                // 1635
            return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));                 // 1636
        },                                                                                                            // 1637
        log: function log(x) {                                                                                        // 1638
            var n = 0;                                                                                                // 1639
            var x2 = x;                                                                                               // 1640
            while (x2 >= 4096) {                                                                                      // 1641
                n += 12;                                                                                              // 1642
                x2 /= 4096;                                                                                           // 1643
            }                                                                                                         // 1644
            while (x2 >= 2) {                                                                                         // 1645
                n += 1;                                                                                               // 1646
                x2 /= 2;                                                                                              // 1647
            }                                                                                                         // 1648
            return n;                                                                                                 // 1649
        }                                                                                                             // 1650
    };                                                                                                                // 1651
                                                                                                                      // 1652
    var toFixedShim = function toFixed(fractionDigits) {                                                              // 1653
        var f, x, s, m, e, z, j, k;                                                                                   // 1654
                                                                                                                      // 1655
        // Test for NaN and round fractionDigits down                                                                 // 1656
        f = $Number(fractionDigits);                                                                                  // 1657
        f = isActualNaN(f) ? 0 : Math.floor(f);                                                                       // 1658
                                                                                                                      // 1659
        if (f < 0 || f > 20) {                                                                                        // 1660
            throw new RangeError('Number.toFixed called with invalid number of decimals');                            // 1661
        }                                                                                                             // 1662
                                                                                                                      // 1663
        x = $Number(this);                                                                                            // 1664
                                                                                                                      // 1665
        if (isActualNaN(x)) {                                                                                         // 1666
            return 'NaN';                                                                                             // 1667
        }                                                                                                             // 1668
                                                                                                                      // 1669
        // If it is too big or small, return the string value of the number                                           // 1670
        if (x <= -1e21 || x >= 1e21) {                                                                                // 1671
            return $String(x);                                                                                        // 1672
        }                                                                                                             // 1673
                                                                                                                      // 1674
        s = '';                                                                                                       // 1675
                                                                                                                      // 1676
        if (x < 0) {                                                                                                  // 1677
            s = '-';                                                                                                  // 1678
            x = -x;                                                                                                   // 1679
        }                                                                                                             // 1680
                                                                                                                      // 1681
        m = '0';                                                                                                      // 1682
                                                                                                                      // 1683
        if (x > 1e-21) {                                                                                              // 1684
            // 1e-21 < x < 1e21                                                                                       // 1685
            // -70 < log2(x) < 70                                                                                     // 1686
            e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;                                            // 1687
            z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));                         // 1688
            z *= 0x10000000000000; // Math.pow(2, 52);                                                                // 1689
            e = 52 - e;                                                                                               // 1690
                                                                                                                      // 1691
            // -18 < e < 122                                                                                          // 1692
            // x = z / 2 ^ e                                                                                          // 1693
            if (e > 0) {                                                                                              // 1694
                toFixedHelpers.multiply(0, z);                                                                        // 1695
                j = f;                                                                                                // 1696
                                                                                                                      // 1697
                while (j >= 7) {                                                                                      // 1698
                    toFixedHelpers.multiply(1e7, 0);                                                                  // 1699
                    j -= 7;                                                                                           // 1700
                }                                                                                                     // 1701
                                                                                                                      // 1702
                toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);                                             // 1703
                j = e - 1;                                                                                            // 1704
                                                                                                                      // 1705
                while (j >= 23) {                                                                                     // 1706
                    toFixedHelpers.divide(1 << 23);                                                                   // 1707
                    j -= 23;                                                                                          // 1708
                }                                                                                                     // 1709
                                                                                                                      // 1710
                toFixedHelpers.divide(1 << j);                                                                        // 1711
                toFixedHelpers.multiply(1, 1);                                                                        // 1712
                toFixedHelpers.divide(2);                                                                             // 1713
                m = toFixedHelpers.numToString();                                                                     // 1714
            } else {                                                                                                  // 1715
                toFixedHelpers.multiply(0, z);                                                                        // 1716
                toFixedHelpers.multiply(1 << (-e), 0);                                                                // 1717
                m = toFixedHelpers.numToString() + strSlice('0.00000000000000000000', 2, 2 + f);                      // 1718
            }                                                                                                         // 1719
        }                                                                                                             // 1720
                                                                                                                      // 1721
        if (f > 0) {                                                                                                  // 1722
            k = m.length;                                                                                             // 1723
                                                                                                                      // 1724
            if (k <= f) {                                                                                             // 1725
                m = s + strSlice('0.0000000000000000000', 0, f - k + 2) + m;                                          // 1726
            } else {                                                                                                  // 1727
                m = s + strSlice(m, 0, k - f) + '.' + strSlice(m, k - f);                                             // 1728
            }                                                                                                         // 1729
        } else {                                                                                                      // 1730
            m = s + m;                                                                                                // 1731
        }                                                                                                             // 1732
                                                                                                                      // 1733
        return m;                                                                                                     // 1734
    };                                                                                                                // 1735
    defineProperties(NumberPrototype, { toFixed: toFixedShim }, hasToFixedBugs);                                      // 1736
                                                                                                                      // 1737
    var hasToPrecisionUndefinedBug = (function () {                                                                   // 1738
        try {                                                                                                         // 1739
            return 1.0.toPrecision(undefined) === '1';                                                                // 1740
        } catch (e) {                                                                                                 // 1741
            return true;                                                                                              // 1742
        }                                                                                                             // 1743
    }());                                                                                                             // 1744
    var originalToPrecision = NumberPrototype.toPrecision;                                                            // 1745
    defineProperties(NumberPrototype, {                                                                               // 1746
        toPrecision: function toPrecision(precision) {                                                                // 1747
            return typeof precision === 'undefined' ? originalToPrecision.call(this) : originalToPrecision.call(this, precision);
        }                                                                                                             // 1749
    }, hasToPrecisionUndefinedBug);                                                                                   // 1750
                                                                                                                      // 1751
    //                                                                                                                // 1752
    // String                                                                                                         // 1753
    // ======                                                                                                         // 1754
    //                                                                                                                // 1755
                                                                                                                      // 1756
    // ES5 15.5.4.14                                                                                                  // 1757
    // http://es5.github.com/#x15.5.4.14                                                                              // 1758
                                                                                                                      // 1759
    // [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]                                               // 1760
    // Many browsers do not split properly with regular expressions or they                                           // 1761
    // do not perform the split correctly under obscure conditions.                                                   // 1762
    // See http://blog.stevenlevithan.com/archives/cross-browser-split                                                // 1763
    // I've tested in many browsers and this seems to cover the deviant ones:                                         // 1764
    //    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]                                                          // 1765
    //    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]                                             // 1766
    //    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not                                        // 1767
    //       [undefined, "t", undefined, "e", ...]                                                                    // 1768
    //    ''.split(/.?/) should be [], not [""]                                                                       // 1769
    //    '.'.split(/()()/) should be ["."], not ["", "", "."]                                                        // 1770
                                                                                                                      // 1771
    if (                                                                                                              // 1772
        'ab'.split(/(?:ab)*/).length !== 2 ||                                                                         // 1773
        '.'.split(/(.?)(.?)/).length !== 4 ||                                                                         // 1774
        'tesst'.split(/(s)*/)[1] === 't' ||                                                                           // 1775
        'test'.split(/(?:)/, -1).length !== 4 ||                                                                      // 1776
        ''.split(/.?/).length ||                                                                                      // 1777
        '.'.split(/()()/).length > 1                                                                                  // 1778
    ) {                                                                                                               // 1779
        (function () {                                                                                                // 1780
            var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group
            var maxSafe32BitInt = Math.pow(2, 32) - 1;                                                                // 1782
                                                                                                                      // 1783
            StringPrototype.split = function (separator, limit) {                                                     // 1784
                var string = String(this);                                                                            // 1785
                if (typeof separator === 'undefined' && limit === 0) {                                                // 1786
                    return [];                                                                                        // 1787
                }                                                                                                     // 1788
                                                                                                                      // 1789
                // If `separator` is not a regex, use native split                                                    // 1790
                if (!isRegex(separator)) {                                                                            // 1791
                    return strSplit(this, separator, limit);                                                          // 1792
                }                                                                                                     // 1793
                                                                                                                      // 1794
                var output = [];                                                                                      // 1795
                var flags = (separator.ignoreCase ? 'i' : '') +                                                       // 1796
                            (separator.multiline ? 'm' : '') +                                                        // 1797
                            (separator.unicode ? 'u' : '') + // in ES6                                                // 1798
                            (separator.sticky ? 'y' : ''), // Firefox 3+ and ES6                                      // 1799
                    lastLastIndex = 0,                                                                                // 1800
                    // Make `global` and avoid `lastIndex` issues by working with a copy                              // 1801
                    separator2, match, lastIndex, lastLength;                                                         // 1802
                var separatorCopy = new RegExp(separator.source, flags + 'g');                                        // 1803
                if (!compliantExecNpcg) {                                                                             // 1804
                    // Doesn't need flags gy, but they don't hurt                                                     // 1805
                    separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);                          // 1806
                }                                                                                                     // 1807
                /* Values for `limit`, per the spec:                                                                  // 1808
                 * If undefined: 4294967295 // maxSafe32BitInt                                                        // 1809
                 * If 0, Infinity, or NaN: 0                                                                          // 1810
                 * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;        // 1811
                 * If negative number: 4294967296 - Math.floor(Math.abs(limit))                                       // 1812
                 * If other: Type-convert, then use the above rules                                                   // 1813
                 */                                                                                                   // 1814
                var splitLimit = typeof limit === 'undefined' ? maxSafe32BitInt : ES.ToUint32(limit);                 // 1815
                match = separatorCopy.exec(string);                                                                   // 1816
                while (match) {                                                                                       // 1817
                    // `separatorCopy.lastIndex` is not reliable cross-browser                                        // 1818
                    lastIndex = match.index + match[0].length;                                                        // 1819
                    if (lastIndex > lastLastIndex) {                                                                  // 1820
                        pushCall(output, strSlice(string, lastLastIndex, match.index));                               // 1821
                        // Fix browsers whose `exec` methods don't consistently return `undefined` for                // 1822
                        // nonparticipating capturing groups                                                          // 1823
                        if (!compliantExecNpcg && match.length > 1) {                                                 // 1824
                            /* eslint-disable no-loop-func */                                                         // 1825
                            match[0].replace(separator2, function () {                                                // 1826
                                for (var i = 1; i < arguments.length - 2; i++) {                                      // 1827
                                    if (typeof arguments[i] === 'undefined') {                                        // 1828
                                        match[i] = void 0;                                                            // 1829
                                    }                                                                                 // 1830
                                }                                                                                     // 1831
                            });                                                                                       // 1832
                            /* eslint-enable no-loop-func */                                                          // 1833
                        }                                                                                             // 1834
                        if (match.length > 1 && match.index < string.length) {                                        // 1835
                            array_push.apply(output, arraySlice(match, 1));                                           // 1836
                        }                                                                                             // 1837
                        lastLength = match[0].length;                                                                 // 1838
                        lastLastIndex = lastIndex;                                                                    // 1839
                        if (output.length >= splitLimit) {                                                            // 1840
                            break;                                                                                    // 1841
                        }                                                                                             // 1842
                    }                                                                                                 // 1843
                    if (separatorCopy.lastIndex === match.index) {                                                    // 1844
                        separatorCopy.lastIndex++; // Avoid an infinite loop                                          // 1845
                    }                                                                                                 // 1846
                    match = separatorCopy.exec(string);                                                               // 1847
                }                                                                                                     // 1848
                if (lastLastIndex === string.length) {                                                                // 1849
                    if (lastLength || !separatorCopy.test('')) {                                                      // 1850
                        pushCall(output, '');                                                                         // 1851
                    }                                                                                                 // 1852
                } else {                                                                                              // 1853
                    pushCall(output, strSlice(string, lastLastIndex));                                                // 1854
                }                                                                                                     // 1855
                return output.length > splitLimit ? arraySlice(output, 0, splitLimit) : output;                       // 1856
            };                                                                                                        // 1857
        }());                                                                                                         // 1858
                                                                                                                      // 1859
    // [bugfix, chrome]                                                                                               // 1860
    // If separator is undefined, then the result array contains just one String,                                     // 1861
    // which is the this value (converted to a String). If limit is not undefined,                                    // 1862
    // then the output array is truncated so that it contains no more than limit                                      // 1863
    // elements.                                                                                                      // 1864
    // "0".split(undefined, 0) -> []                                                                                  // 1865
    } else if ('0'.split(void 0, 0).length) {                                                                         // 1866
        StringPrototype.split = function split(separator, limit) {                                                    // 1867
            if (typeof separator === 'undefined' && limit === 0) {                                                    // 1868
                return [];                                                                                            // 1869
            }                                                                                                         // 1870
            return strSplit(this, separator, limit);                                                                  // 1871
        };                                                                                                            // 1872
    }                                                                                                                 // 1873
                                                                                                                      // 1874
    var str_replace = StringPrototype.replace;                                                                        // 1875
    var replaceReportsGroupsCorrectly = (function () {                                                                // 1876
        var groups = [];                                                                                              // 1877
        'x'.replace(/x(.)?/g, function (match, group) {                                                               // 1878
            pushCall(groups, group);                                                                                  // 1879
        });                                                                                                           // 1880
        return groups.length === 1 && typeof groups[0] === 'undefined';                                               // 1881
    }());                                                                                                             // 1882
                                                                                                                      // 1883
    if (!replaceReportsGroupsCorrectly) {                                                                             // 1884
        StringPrototype.replace = function replace(searchValue, replaceValue) {                                       // 1885
            var isFn = isCallable(replaceValue);                                                                      // 1886
            var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);                     // 1887
            if (!isFn || !hasCapturingGroups) {                                                                       // 1888
                return str_replace.call(this, searchValue, replaceValue);                                             // 1889
            } else {                                                                                                  // 1890
                var wrappedReplaceValue = function (match) {                                                          // 1891
                    var length = arguments.length;                                                                    // 1892
                    var originalLastIndex = searchValue.lastIndex;                                                    // 1893
                    searchValue.lastIndex = 0;                                                                        // 1894
                    var args = searchValue.exec(match) || [];                                                         // 1895
                    searchValue.lastIndex = originalLastIndex;                                                        // 1896
                    pushCall(args, arguments[length - 2], arguments[length - 1]);                                     // 1897
                    return replaceValue.apply(this, args);                                                            // 1898
                };                                                                                                    // 1899
                return str_replace.call(this, searchValue, wrappedReplaceValue);                                      // 1900
            }                                                                                                         // 1901
        };                                                                                                            // 1902
    }                                                                                                                 // 1903
                                                                                                                      // 1904
    // ECMA-262, 3rd B.2.3                                                                                            // 1905
    // Not an ECMAScript standard, although ECMAScript 3rd Edition has a                                              // 1906
    // non-normative section suggesting uniform semantics and it should be                                            // 1907
    // normalized across all browsers                                                                                 // 1908
    // [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE                                        // 1909
    var string_substr = StringPrototype.substr;                                                                       // 1910
    var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';                                                  // 1911
    defineProperties(StringPrototype, {                                                                               // 1912
        substr: function substr(start, length) {                                                                      // 1913
            var normalizedStart = start;                                                                              // 1914
            if (start < 0) {                                                                                          // 1915
                normalizedStart = max(this.length + start, 0);                                                        // 1916
            }                                                                                                         // 1917
            return string_substr.call(this, normalizedStart, length);                                                 // 1918
        }                                                                                                             // 1919
    }, hasNegativeSubstrBug);                                                                                         // 1920
                                                                                                                      // 1921
    // ES5 15.5.4.20                                                                                                  // 1922
    // whitespace from: http://es5.github.io/#x15.5.4.20                                                              // 1923
    var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +                                     // 1924
        '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +                                        // 1925
        '\u2029\uFEFF';                                                                                               // 1926
    var zeroWidth = '\u200b';                                                                                         // 1927
    var wsRegexChars = '[' + ws + ']';                                                                                // 1928
    var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');                                        // 1929
    var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');                                               // 1930
    var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());                              // 1931
    defineProperties(StringPrototype, {                                                                               // 1932
        // http://blog.stevenlevithan.com/archives/faster-trim-javascript                                             // 1933
        // http://perfectionkills.com/whitespace-deviations/                                                          // 1934
        trim: function trim() {                                                                                       // 1935
            if (typeof this === 'undefined' || this === null) {                                                       // 1936
                throw new TypeError("can't convert " + this + ' to object');                                          // 1937
            }                                                                                                         // 1938
            return $String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');                             // 1939
        }                                                                                                             // 1940
    }, hasTrimWhitespaceBug);                                                                                         // 1941
    var trim = call.bind(String.prototype.trim);                                                                      // 1942
                                                                                                                      // 1943
    var hasLastIndexBug = StringPrototype.lastIndexOf && 'abcあい'.lastIndexOf('あい', 2) !== -1;                         // 1944
    defineProperties(StringPrototype, {                                                                               // 1945
        lastIndexOf: function lastIndexOf(searchString) {                                                             // 1946
            if (typeof this === 'undefined' || this === null) {                                                       // 1947
                throw new TypeError("can't convert " + this + ' to object');                                          // 1948
            }                                                                                                         // 1949
            var S = $String(this);                                                                                    // 1950
            var searchStr = $String(searchString);                                                                    // 1951
            var numPos = arguments.length > 1 ? $Number(arguments[1]) : NaN;                                          // 1952
            var pos = isActualNaN(numPos) ? Infinity : ES.ToInteger(numPos);                                          // 1953
            var start = min(max(pos, 0), S.length);                                                                   // 1954
            var searchLen = searchStr.length;                                                                         // 1955
            var k = start + searchLen;                                                                                // 1956
            while (k > 0) {                                                                                           // 1957
                k = max(0, k - searchLen);                                                                            // 1958
                var index = strIndexOf(strSlice(S, k, start + searchLen), searchStr);                                 // 1959
                if (index !== -1) {                                                                                   // 1960
                    return k + index;                                                                                 // 1961
                }                                                                                                     // 1962
            }                                                                                                         // 1963
            return -1;                                                                                                // 1964
        }                                                                                                             // 1965
    }, hasLastIndexBug);                                                                                              // 1966
                                                                                                                      // 1967
    var originalLastIndexOf = StringPrototype.lastIndexOf;                                                            // 1968
    defineProperties(StringPrototype, {                                                                               // 1969
        lastIndexOf: function lastIndexOf(searchString) {                                                             // 1970
            return originalLastIndexOf.apply(this, arguments);                                                        // 1971
        }                                                                                                             // 1972
    }, StringPrototype.lastIndexOf.length !== 1);                                                                     // 1973
                                                                                                                      // 1974
    // ES-5 15.1.2.2                                                                                                  // 1975
    /* eslint-disable radix */                                                                                        // 1976
    if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {                                                  // 1977
    /* eslint-enable radix */                                                                                         // 1978
        /* global parseInt: true */                                                                                   // 1979
        parseInt = (function (origParseInt) {                                                                         // 1980
            var hexRegex = /^[\-+]?0[xX]/;                                                                            // 1981
            return function parseInt(str, radix) {                                                                    // 1982
                var string = trim(String(str));                                                                       // 1983
                var defaultedRadix = $Number(radix) || (hexRegex.test(string) ? 16 : 10);                             // 1984
                return origParseInt(string, defaultedRadix);                                                          // 1985
            };                                                                                                        // 1986
        }(parseInt));                                                                                                 // 1987
    }                                                                                                                 // 1988
                                                                                                                      // 1989
    // https://es5.github.io/#x15.1.2.3                                                                               // 1990
    if (1 / parseFloat('-0') !== -Infinity) {                                                                         // 1991
        /* global parseFloat: true */                                                                                 // 1992
        parseFloat = (function (origParseFloat) {                                                                     // 1993
            return function parseFloat(string) {                                                                      // 1994
                var inputString = trim(String(string));                                                               // 1995
                var result = origParseFloat(inputString);                                                             // 1996
                return result === 0 && strSlice(inputString, 0, 1) === '-' ? -0 : result;                             // 1997
            };                                                                                                        // 1998
        }(parseFloat));                                                                                               // 1999
    }                                                                                                                 // 2000
                                                                                                                      // 2001
    if (String(new RangeError('test')) !== 'RangeError: test') {                                                      // 2002
        var errorToStringShim = function toString() {                                                                 // 2003
            if (typeof this === 'undefined' || this === null) {                                                       // 2004
                throw new TypeError("can't convert " + this + ' to object');                                          // 2005
            }                                                                                                         // 2006
            var name = this.name;                                                                                     // 2007
            if (typeof name === 'undefined') {                                                                        // 2008
                name = 'Error';                                                                                       // 2009
            } else if (typeof name !== 'string') {                                                                    // 2010
                name = $String(name);                                                                                 // 2011
            }                                                                                                         // 2012
            var msg = this.message;                                                                                   // 2013
            if (typeof msg === 'undefined') {                                                                         // 2014
                msg = '';                                                                                             // 2015
            } else if (typeof msg !== 'string') {                                                                     // 2016
                msg = $String(msg);                                                                                   // 2017
            }                                                                                                         // 2018
            if (!name) {                                                                                              // 2019
                return msg;                                                                                           // 2020
            }                                                                                                         // 2021
            if (!msg) {                                                                                               // 2022
                return name;                                                                                          // 2023
            }                                                                                                         // 2024
            return name + ': ' + msg;                                                                                 // 2025
        };                                                                                                            // 2026
        // can't use defineProperties here because of toString enumeration issue in IE <= 8                           // 2027
        Error.prototype.toString = errorToStringShim;                                                                 // 2028
    }                                                                                                                 // 2029
                                                                                                                      // 2030
    if (supportsDescriptors) {                                                                                        // 2031
        var ensureNonEnumerable = function (obj, prop) {                                                              // 2032
            if (isEnum(obj, prop)) {                                                                                  // 2033
                var desc = Object.getOwnPropertyDescriptor(obj, prop);                                                // 2034
                if (desc.configurable) {                                                                              // 2035
                    desc.enumerable = false;                                                                          // 2036
                    Object.defineProperty(obj, prop, desc);                                                           // 2037
                }                                                                                                     // 2038
            }                                                                                                         // 2039
        };                                                                                                            // 2040
        ensureNonEnumerable(Error.prototype, 'message');                                                              // 2041
        if (Error.prototype.message !== '') {                                                                         // 2042
            Error.prototype.message = '';                                                                             // 2043
        }                                                                                                             // 2044
        ensureNonEnumerable(Error.prototype, 'name');                                                                 // 2045
    }                                                                                                                 // 2046
                                                                                                                      // 2047
    if (String(/a/mig) !== '/a/gim') {                                                                                // 2048
        var regexToString = function toString() {                                                                     // 2049
            var str = '/' + this.source + '/';                                                                        // 2050
            if (this.global) {                                                                                        // 2051
                str += 'g';                                                                                           // 2052
            }                                                                                                         // 2053
            if (this.ignoreCase) {                                                                                    // 2054
                str += 'i';                                                                                           // 2055
            }                                                                                                         // 2056
            if (this.multiline) {                                                                                     // 2057
                str += 'm';                                                                                           // 2058
            }                                                                                                         // 2059
            return str;                                                                                               // 2060
        };                                                                                                            // 2061
        // can't use defineProperties here because of toString enumeration issue in IE <= 8                           // 2062
        RegExp.prototype.toString = regexToString;                                                                    // 2063
    }                                                                                                                 // 2064
}));                                                                                                                  // 2065
                                                                                                                      // 2066
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"es5-sham.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// node_modules/meteor/es5-shim/node_modules/es5-shim/es5-sham.js                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/*!                                                                                                                   // 1
 * https://github.com/es-shims/es5-shim                                                                               // 2
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License                                                 // 3
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE                                                       // 4
 */                                                                                                                   // 5
                                                                                                                      // 6
// vim: ts=4 sts=4 sw=4 expandtab                                                                                     // 7
                                                                                                                      // 8
// Add semicolon to prevent IIFE from being passed as argument to concatenated code.                                  // 9
;                                                                                                                     // 10
                                                                                                                      // 11
// UMD (Universal Module Definition)                                                                                  // 12
// see https://github.com/umdjs/umd/blob/master/templates/returnExports.js                                            // 13
(function (root, factory) {                                                                                           // 14
    'use strict';                                                                                                     // 15
                                                                                                                      // 16
    /* global define, exports, module */                                                                              // 17
    if (typeof define === 'function' && define.amd) {                                                                 // 18
        // AMD. Register as an anonymous module.                                                                      // 19
        define(factory);                                                                                              // 20
    } else if (typeof exports === 'object') {                                                                         // 21
        // Node. Does not work with strict CommonJS, but                                                              // 22
        // only CommonJS-like enviroments that support module.exports,                                                // 23
        // like Node.                                                                                                 // 24
        module.exports = factory();                                                                                   // 25
    } else {                                                                                                          // 26
        // Browser globals (root is window)                                                                           // 27
        root.returnExports = factory();                                                                               // 28
    }                                                                                                                 // 29
}(this, function () {                                                                                                 // 30
                                                                                                                      // 31
    var call = Function.call;                                                                                         // 32
    var prototypeOfObject = Object.prototype;                                                                         // 33
    var owns = call.bind(prototypeOfObject.hasOwnProperty);                                                           // 34
    var isEnumerable = call.bind(prototypeOfObject.propertyIsEnumerable);                                             // 35
    var toStr = call.bind(prototypeOfObject.toString);                                                                // 36
                                                                                                                      // 37
    // If JS engine supports accessors creating shortcuts.                                                            // 38
    var defineGetter;                                                                                                 // 39
    var defineSetter;                                                                                                 // 40
    var lookupGetter;                                                                                                 // 41
    var lookupSetter;                                                                                                 // 42
    var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');                                              // 43
    if (supportsAccessors) {                                                                                          // 44
        /* eslint-disable no-underscore-dangle */                                                                     // 45
        defineGetter = call.bind(prototypeOfObject.__defineGetter__);                                                 // 46
        defineSetter = call.bind(prototypeOfObject.__defineSetter__);                                                 // 47
        lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);                                                 // 48
        lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);                                                 // 49
        /* eslint-enable no-underscore-dangle */                                                                      // 50
    }                                                                                                                 // 51
                                                                                                                      // 52
    var isPrimitive = function isPrimitive(o) {                                                                       // 53
        return o == null || (typeof o !== 'object' && typeof o !== 'function');                                       // 54
    };                                                                                                                // 55
                                                                                                                      // 56
    // ES5 15.2.3.2                                                                                                   // 57
    // http://es5.github.com/#x15.2.3.2                                                                               // 58
    if (!Object.getPrototypeOf) {                                                                                     // 59
        // https://github.com/es-shims/es5-shim/issues#issue/2                                                        // 60
        // http://ejohn.org/blog/objectgetprototypeof/                                                                // 61
        // recommended by fschaefer on github                                                                         // 62
        //                                                                                                            // 63
        // sure, and webreflection says ^_^                                                                           // 64
        // ... this will nerever possibly return null                                                                 // 65
        // ... Opera Mini breaks here with infinite loops                                                             // 66
        Object.getPrototypeOf = function getPrototypeOf(object) {                                                     // 67
            /* eslint-disable no-proto */                                                                             // 68
            var proto = object.__proto__;                                                                             // 69
            /* eslint-enable no-proto */                                                                              // 70
            if (proto || proto === null) {                                                                            // 71
                return proto;                                                                                         // 72
            } else if (toStr(object.constructor) === '[object Function]') {                                           // 73
                return object.constructor.prototype;                                                                  // 74
            } else if (object instanceof Object) {                                                                    // 75
                return prototypeOfObject;                                                                             // 76
            } else {                                                                                                  // 77
                // Correctly return null for Objects created with `Object.create(null)`                               // 78
                // (shammed or native) or `{ __proto__: null}`.  Also returns null for                                // 79
                // cross-realm objects on browsers that lack `__proto__` support (like                                // 80
                // IE <11), but that's the best we can do.                                                            // 81
                return null;                                                                                          // 82
            }                                                                                                         // 83
        };                                                                                                            // 84
    }                                                                                                                 // 85
                                                                                                                      // 86
    // ES5 15.2.3.3                                                                                                   // 87
    // http://es5.github.com/#x15.2.3.3                                                                               // 88
                                                                                                                      // 89
    var doesGetOwnPropertyDescriptorWork = function doesGetOwnPropertyDescriptorWork(object) {                        // 90
        try {                                                                                                         // 91
            object.sentinel = 0;                                                                                      // 92
            return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0;                                   // 93
        } catch (exception) {                                                                                         // 94
            return false;                                                                                             // 95
        }                                                                                                             // 96
    };                                                                                                                // 97
                                                                                                                      // 98
    // check whether getOwnPropertyDescriptor works if it's given. Otherwise, shim partially.                         // 99
    if (Object.defineProperty) {                                                                                      // 100
        var getOwnPropertyDescriptorWorksOnObject = doesGetOwnPropertyDescriptorWork({});                             // 101
        var getOwnPropertyDescriptorWorksOnDom = typeof document === 'undefined' ||                                   // 102
        doesGetOwnPropertyDescriptorWork(document.createElement('div'));                                              // 103
        if (!getOwnPropertyDescriptorWorksOnDom || !getOwnPropertyDescriptorWorksOnObject) {                          // 104
            var getOwnPropertyDescriptorFallback = Object.getOwnPropertyDescriptor;                                   // 105
        }                                                                                                             // 106
    }                                                                                                                 // 107
                                                                                                                      // 108
    if (!Object.getOwnPropertyDescriptor || getOwnPropertyDescriptorFallback) {                                       // 109
        var ERR_NON_OBJECT = 'Object.getOwnPropertyDescriptor called on a non-object: ';                              // 110
                                                                                                                      // 111
        /* eslint-disable no-proto */                                                                                 // 112
        Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {                       // 113
            if (isPrimitive(object)) {                                                                                // 114
                throw new TypeError(ERR_NON_OBJECT + object);                                                         // 115
            }                                                                                                         // 116
                                                                                                                      // 117
            // make a valiant attempt to use the real getOwnPropertyDescriptor                                        // 118
            // for I8's DOM elements.                                                                                 // 119
            if (getOwnPropertyDescriptorFallback) {                                                                   // 120
                try {                                                                                                 // 121
                    return getOwnPropertyDescriptorFallback.call(Object, object, property);                           // 122
                } catch (exception) {                                                                                 // 123
                    // try the shim if the real one doesn't work                                                      // 124
                }                                                                                                     // 125
            }                                                                                                         // 126
                                                                                                                      // 127
            var descriptor;                                                                                           // 128
                                                                                                                      // 129
            // If object does not owns property return undefined immediately.                                         // 130
            if (!owns(object, property)) {                                                                            // 131
                return descriptor;                                                                                    // 132
            }                                                                                                         // 133
                                                                                                                      // 134
            // If object has a property then it's for sure `configurable`, and                                        // 135
            // probably `enumerable`. Detect enumerability though.                                                    // 136
            descriptor = {                                                                                            // 137
                enumerable: isEnumerable(object, property),                                                           // 138
                configurable: true                                                                                    // 139
            };                                                                                                        // 140
                                                                                                                      // 141
            // If JS engine supports accessor properties then property may be a                                       // 142
            // getter or setter.                                                                                      // 143
            if (supportsAccessors) {                                                                                  // 144
                // Unfortunately `__lookupGetter__` will return a getter even                                         // 145
                // if object has own non getter property along with a same named                                      // 146
                // inherited getter. To avoid misbehavior we temporary remove                                         // 147
                // `__proto__` so that `__lookupGetter__` will return getter only                                     // 148
                // if it's owned by an object.                                                                        // 149
                var prototype = object.__proto__;                                                                     // 150
                var notPrototypeOfObject = object !== prototypeOfObject;                                              // 151
                // avoid recursion problem, breaking in Opera Mini when                                               // 152
                // Object.getOwnPropertyDescriptor(Object.prototype, 'toString')                                      // 153
                // or any other Object.prototype accessor                                                             // 154
                if (notPrototypeOfObject) {                                                                           // 155
                    object.__proto__ = prototypeOfObject;                                                             // 156
                }                                                                                                     // 157
                                                                                                                      // 158
                var getter = lookupGetter(object, property);                                                          // 159
                var setter = lookupSetter(object, property);                                                          // 160
                                                                                                                      // 161
                if (notPrototypeOfObject) {                                                                           // 162
                    // Once we have getter and setter we can put values back.                                         // 163
                    object.__proto__ = prototype;                                                                     // 164
                }                                                                                                     // 165
                                                                                                                      // 166
                if (getter || setter) {                                                                               // 167
                    if (getter) {                                                                                     // 168
                        descriptor.get = getter;                                                                      // 169
                    }                                                                                                 // 170
                    if (setter) {                                                                                     // 171
                        descriptor.set = setter;                                                                      // 172
                    }                                                                                                 // 173
                    // If it was accessor property we're done and return here                                         // 174
                    // in order to avoid adding `value` to the descriptor.                                            // 175
                    return descriptor;                                                                                // 176
                }                                                                                                     // 177
            }                                                                                                         // 178
                                                                                                                      // 179
            // If we got this far we know that object has an own property that is                                     // 180
            // not an accessor so we set it as a value and return descriptor.                                         // 181
            descriptor.value = object[property];                                                                      // 182
            descriptor.writable = true;                                                                               // 183
            return descriptor;                                                                                        // 184
        };                                                                                                            // 185
        /* eslint-enable no-proto */                                                                                  // 186
    }                                                                                                                 // 187
                                                                                                                      // 188
    // ES5 15.2.3.4                                                                                                   // 189
    // http://es5.github.com/#x15.2.3.4                                                                               // 190
    if (!Object.getOwnPropertyNames) {                                                                                // 191
        Object.getOwnPropertyNames = function getOwnPropertyNames(object) {                                           // 192
            return Object.keys(object);                                                                               // 193
        };                                                                                                            // 194
    }                                                                                                                 // 195
                                                                                                                      // 196
    // ES5 15.2.3.5                                                                                                   // 197
    // http://es5.github.com/#x15.2.3.5                                                                               // 198
    if (!Object.create) {                                                                                             // 199
                                                                                                                      // 200
        // Contributed by Brandon Benvie, October, 2012                                                               // 201
        var createEmpty;                                                                                              // 202
        var supportsProto = !({ __proto__: null } instanceof Object);                                                 // 203
                            // the following produces false positives                                                 // 204
                            // in Opera Mini => not a reliable check                                                  // 205
                            // Object.prototype.__proto__ === null                                                    // 206
                                                                                                                      // 207
        // Check for document.domain and active x support                                                             // 208
        // No need to use active x approach when document.domain is not set                                           // 209
        // see https://github.com/es-shims/es5-shim/issues/150                                                        // 210
        // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346                                 // 211
        /* global ActiveXObject */                                                                                    // 212
        var shouldUseActiveX = function shouldUseActiveX() {                                                          // 213
            // return early if document.domain not set                                                                // 214
            if (!document.domain) {                                                                                   // 215
                return false;                                                                                         // 216
            }                                                                                                         // 217
                                                                                                                      // 218
            try {                                                                                                     // 219
                return !!new ActiveXObject('htmlfile');                                                               // 220
            } catch (exception) {                                                                                     // 221
                return false;                                                                                         // 222
            }                                                                                                         // 223
        };                                                                                                            // 224
                                                                                                                      // 225
        // This supports IE8 when document.domain is used                                                             // 226
        // see https://github.com/es-shims/es5-shim/issues/150                                                        // 227
        // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346                                 // 228
        var getEmptyViaActiveX = function getEmptyViaActiveX() {                                                      // 229
            var empty;                                                                                                // 230
            var xDoc;                                                                                                 // 231
                                                                                                                      // 232
            xDoc = new ActiveXObject('htmlfile');                                                                     // 233
                                                                                                                      // 234
            var script = 'script';                                                                                    // 235
            xDoc.write('<' + script + '></' + script + '>');                                                          // 236
            xDoc.close();                                                                                             // 237
                                                                                                                      // 238
            empty = xDoc.parentWindow.Object.prototype;                                                               // 239
            xDoc = null;                                                                                              // 240
                                                                                                                      // 241
            return empty;                                                                                             // 242
        };                                                                                                            // 243
                                                                                                                      // 244
        // The original implementation using an iframe                                                                // 245
        // before the activex approach was added                                                                      // 246
        // see https://github.com/es-shims/es5-shim/issues/150                                                        // 247
        var getEmptyViaIFrame = function getEmptyViaIFrame() {                                                        // 248
            var iframe = document.createElement('iframe');                                                            // 249
            var parent = document.body || document.documentElement;                                                   // 250
            var empty;                                                                                                // 251
                                                                                                                      // 252
            iframe.style.display = 'none';                                                                            // 253
            parent.appendChild(iframe);                                                                               // 254
            /* eslint-disable no-script-url */                                                                        // 255
            iframe.src = 'javascript:';                                                                               // 256
            /* eslint-enable no-script-url */                                                                         // 257
                                                                                                                      // 258
            empty = iframe.contentWindow.Object.prototype;                                                            // 259
            parent.removeChild(iframe);                                                                               // 260
            iframe = null;                                                                                            // 261
                                                                                                                      // 262
            return empty;                                                                                             // 263
        };                                                                                                            // 264
                                                                                                                      // 265
        /* global document */                                                                                         // 266
        if (supportsProto || typeof document === 'undefined') {                                                       // 267
            createEmpty = function () {                                                                               // 268
                return { __proto__: null };                                                                           // 269
            };                                                                                                        // 270
        } else {                                                                                                      // 271
            // In old IE __proto__ can't be used to manually set `null`, nor does                                     // 272
            // any other method exist to make an object that inherits from nothing,                                   // 273
            // aside from Object.prototype itself. Instead, create a new global                                       // 274
            // object and *steal* its Object.prototype and strip it bare. This is                                     // 275
            // used as the prototype to create nullary objects.                                                       // 276
            createEmpty = function () {                                                                               // 277
                // Determine which approach to use                                                                    // 278
                // see https://github.com/es-shims/es5-shim/issues/150                                                // 279
                var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();                          // 280
                                                                                                                      // 281
                delete empty.constructor;                                                                             // 282
                delete empty.hasOwnProperty;                                                                          // 283
                delete empty.propertyIsEnumerable;                                                                    // 284
                delete empty.isPrototypeOf;                                                                           // 285
                delete empty.toLocaleString;                                                                          // 286
                delete empty.toString;                                                                                // 287
                delete empty.valueOf;                                                                                 // 288
                                                                                                                      // 289
                var Empty = function Empty() {};                                                                      // 290
                Empty.prototype = empty;                                                                              // 291
                // short-circuit future calls                                                                         // 292
                createEmpty = function () {                                                                           // 293
                    return new Empty();                                                                               // 294
                };                                                                                                    // 295
                return new Empty();                                                                                   // 296
            };                                                                                                        // 297
        }                                                                                                             // 298
                                                                                                                      // 299
        Object.create = function create(prototype, properties) {                                                      // 300
                                                                                                                      // 301
            var object;                                                                                               // 302
            var Type = function Type() {}; // An empty constructor.                                                   // 303
                                                                                                                      // 304
            if (prototype === null) {                                                                                 // 305
                object = createEmpty();                                                                               // 306
            } else {                                                                                                  // 307
                if (prototype !== null && isPrimitive(prototype)) {                                                   // 308
                    // In the native implementation `parent` can be `null`                                            // 309
                    // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)                               // 310
                    // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`                      // 311
                    // like they are in modern browsers. Using `Object.create` on DOM elements                        // 312
                    // is...err...probably inappropriate, but the native version allows for it.                       // 313
                    throw new TypeError('Object prototype may only be an Object or null'); // same msg as Chrome      // 314
                }                                                                                                     // 315
                Type.prototype = prototype;                                                                           // 316
                object = new Type();                                                                                  // 317
                // IE has no built-in implementation of `Object.getPrototypeOf`                                       // 318
                // neither `__proto__`, but this manually setting `__proto__` will                                    // 319
                // guarantee that `Object.getPrototypeOf` will work as expected with                                  // 320
                // objects created using `Object.create`                                                              // 321
                /* eslint-disable no-proto */                                                                         // 322
                object.__proto__ = prototype;                                                                         // 323
                /* eslint-enable no-proto */                                                                          // 324
            }                                                                                                         // 325
                                                                                                                      // 326
            if (properties !== void 0) {                                                                              // 327
                Object.defineProperties(object, properties);                                                          // 328
            }                                                                                                         // 329
                                                                                                                      // 330
            return object;                                                                                            // 331
        };                                                                                                            // 332
    }                                                                                                                 // 333
                                                                                                                      // 334
    // ES5 15.2.3.6                                                                                                   // 335
    // http://es5.github.com/#x15.2.3.6                                                                               // 336
                                                                                                                      // 337
    // Patch for WebKit and IE8 standard mode                                                                         // 338
    // Designed by hax <hax.github.com>                                                                               // 339
    // related issue: https://github.com/es-shims/es5-shim/issues#issue/5                                             // 340
    // IE8 Reference:                                                                                                 // 341
    //     http://msdn.microsoft.com/en-us/library/dd282900.aspx                                                      // 342
    //     http://msdn.microsoft.com/en-us/library/dd229916.aspx                                                      // 343
    // WebKit Bugs:                                                                                                   // 344
    //     https://bugs.webkit.org/show_bug.cgi?id=36423                                                              // 345
                                                                                                                      // 346
    var doesDefinePropertyWork = function doesDefinePropertyWork(object) {                                            // 347
        try {                                                                                                         // 348
            Object.defineProperty(object, 'sentinel', {});                                                            // 349
            return 'sentinel' in object;                                                                              // 350
        } catch (exception) {                                                                                         // 351
            return false;                                                                                             // 352
        }                                                                                                             // 353
    };                                                                                                                // 354
                                                                                                                      // 355
    // check whether defineProperty works if it's given. Otherwise,                                                   // 356
    // shim partially.                                                                                                // 357
    if (Object.defineProperty) {                                                                                      // 358
        var definePropertyWorksOnObject = doesDefinePropertyWork({});                                                 // 359
        var definePropertyWorksOnDom = typeof document === 'undefined' ||                                             // 360
            doesDefinePropertyWork(document.createElement('div'));                                                    // 361
        if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {                                              // 362
            var definePropertyFallback = Object.defineProperty,                                                       // 363
                definePropertiesFallback = Object.defineProperties;                                                   // 364
        }                                                                                                             // 365
    }                                                                                                                 // 366
                                                                                                                      // 367
    if (!Object.defineProperty || definePropertyFallback) {                                                           // 368
        var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';                                   // 369
        var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';                                   // 370
        var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';           // 371
                                                                                                                      // 372
        Object.defineProperty = function defineProperty(object, property, descriptor) {                               // 373
            if (isPrimitive(object)) {                                                                                // 374
                throw new TypeError(ERR_NON_OBJECT_TARGET + object);                                                  // 375
            }                                                                                                         // 376
            if (isPrimitive(descriptor)) {                                                                            // 377
                throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);                                          // 378
            }                                                                                                         // 379
            // make a valiant attempt to use the real defineProperty                                                  // 380
            // for I8's DOM elements.                                                                                 // 381
            if (definePropertyFallback) {                                                                             // 382
                try {                                                                                                 // 383
                    return definePropertyFallback.call(Object, object, property, descriptor);                         // 384
                } catch (exception) {                                                                                 // 385
                    // try the shim if the real one doesn't work                                                      // 386
                }                                                                                                     // 387
            }                                                                                                         // 388
                                                                                                                      // 389
            // If it's a data property.                                                                               // 390
            if ('value' in descriptor) {                                                                              // 391
                // fail silently if 'writable', 'enumerable', or 'configurable'                                       // 392
                // are requested but not supported                                                                    // 393
                /*                                                                                                    // 394
                // alternate approach:                                                                                // 395
                if ( // can't implement these features; allow false but not true                                      // 396
                    ('writable' in descriptor && !descriptor.writable) ||                                             // 397
                    ('enumerable' in descriptor && !descriptor.enumerable) ||                                         // 398
                    ('configurable' in descriptor && !descriptor.configurable)                                        // 399
                ))                                                                                                    // 400
                    throw new RangeError(                                                                             // 401
                        'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
                    );                                                                                                // 403
                */                                                                                                    // 404
                                                                                                                      // 405
                if (supportsAccessors && (lookupGetter(object, property) || lookupSetter(object, property))) {        // 406
                    // As accessors are supported only on engines implementing                                        // 407
                    // `__proto__` we can safely override `__proto__` while defining                                  // 408
                    // a property to make sure that we don't hit an inherited                                         // 409
                    // accessor.                                                                                      // 410
                    /* eslint-disable no-proto */                                                                     // 411
                    var prototype = object.__proto__;                                                                 // 412
                    object.__proto__ = prototypeOfObject;                                                             // 413
                    // Deleting a property anyway since getter / setter may be                                        // 414
                    // defined on object itself.                                                                      // 415
                    delete object[property];                                                                          // 416
                    object[property] = descriptor.value;                                                              // 417
                    // Setting original `__proto__` back now.                                                         // 418
                    object.__proto__ = prototype;                                                                     // 419
                    /* eslint-enable no-proto */                                                                      // 420
                } else {                                                                                              // 421
                    object[property] = descriptor.value;                                                              // 422
                }                                                                                                     // 423
            } else {                                                                                                  // 424
                var hasGetter = 'get' in descriptor;                                                                  // 425
                var hasSetter = 'set' in descriptor;                                                                  // 426
                if (!supportsAccessors && (hasGetter || hasSetter)) {                                                 // 427
                    throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);                                                 // 428
                }                                                                                                     // 429
                // If we got that far then getters and setters can be defined !!                                      // 430
                if (hasGetter) {                                                                                      // 431
                    defineGetter(object, property, descriptor.get);                                                   // 432
                }                                                                                                     // 433
                if (hasSetter) {                                                                                      // 434
                    defineSetter(object, property, descriptor.set);                                                   // 435
                }                                                                                                     // 436
            }                                                                                                         // 437
            return object;                                                                                            // 438
        };                                                                                                            // 439
    }                                                                                                                 // 440
                                                                                                                      // 441
    // ES5 15.2.3.7                                                                                                   // 442
    // http://es5.github.com/#x15.2.3.7                                                                               // 443
    if (!Object.defineProperties || definePropertiesFallback) {                                                       // 444
        Object.defineProperties = function defineProperties(object, properties) {                                     // 445
            // make a valiant attempt to use the real defineProperties                                                // 446
            if (definePropertiesFallback) {                                                                           // 447
                try {                                                                                                 // 448
                    return definePropertiesFallback.call(Object, object, properties);                                 // 449
                } catch (exception) {                                                                                 // 450
                    // try the shim if the real one doesn't work                                                      // 451
                }                                                                                                     // 452
            }                                                                                                         // 453
                                                                                                                      // 454
            Object.keys(properties).forEach(function (property) {                                                     // 455
                if (property !== '__proto__') {                                                                       // 456
                    Object.defineProperty(object, property, properties[property]);                                    // 457
                }                                                                                                     // 458
            });                                                                                                       // 459
            return object;                                                                                            // 460
        };                                                                                                            // 461
    }                                                                                                                 // 462
                                                                                                                      // 463
    // ES5 15.2.3.8                                                                                                   // 464
    // http://es5.github.com/#x15.2.3.8                                                                               // 465
    if (!Object.seal) {                                                                                               // 466
        Object.seal = function seal(object) {                                                                         // 467
            if (Object(object) !== object) {                                                                          // 468
                throw new TypeError('Object.seal can only be called on Objects.');                                    // 469
            }                                                                                                         // 470
            // this is misleading and breaks feature-detection, but                                                   // 471
            // allows "securable" code to "gracefully" degrade to working                                             // 472
            // but insecure code.                                                                                     // 473
            return object;                                                                                            // 474
        };                                                                                                            // 475
    }                                                                                                                 // 476
                                                                                                                      // 477
    // ES5 15.2.3.9                                                                                                   // 478
    // http://es5.github.com/#x15.2.3.9                                                                               // 479
    if (!Object.freeze) {                                                                                             // 480
        Object.freeze = function freeze(object) {                                                                     // 481
            if (Object(object) !== object) {                                                                          // 482
                throw new TypeError('Object.freeze can only be called on Objects.');                                  // 483
            }                                                                                                         // 484
            // this is misleading and breaks feature-detection, but                                                   // 485
            // allows "securable" code to "gracefully" degrade to working                                             // 486
            // but insecure code.                                                                                     // 487
            return object;                                                                                            // 488
        };                                                                                                            // 489
    }                                                                                                                 // 490
                                                                                                                      // 491
    // detect a Rhino bug and patch it                                                                                // 492
    try {                                                                                                             // 493
        Object.freeze(function () {});                                                                                // 494
    } catch (exception) {                                                                                             // 495
        Object.freeze = (function (freezeObject) {                                                                    // 496
            return function freeze(object) {                                                                          // 497
                if (typeof object === 'function') {                                                                   // 498
                    return object;                                                                                    // 499
                } else {                                                                                              // 500
                    return freezeObject(object);                                                                      // 501
                }                                                                                                     // 502
            };                                                                                                        // 503
        }(Object.freeze));                                                                                            // 504
    }                                                                                                                 // 505
                                                                                                                      // 506
    // ES5 15.2.3.10                                                                                                  // 507
    // http://es5.github.com/#x15.2.3.10                                                                              // 508
    if (!Object.preventExtensions) {                                                                                  // 509
        Object.preventExtensions = function preventExtensions(object) {                                               // 510
            if (Object(object) !== object) {                                                                          // 511
                throw new TypeError('Object.preventExtensions can only be called on Objects.');                       // 512
            }                                                                                                         // 513
            // this is misleading and breaks feature-detection, but                                                   // 514
            // allows "securable" code to "gracefully" degrade to working                                             // 515
            // but insecure code.                                                                                     // 516
            return object;                                                                                            // 517
        };                                                                                                            // 518
    }                                                                                                                 // 519
                                                                                                                      // 520
    // ES5 15.2.3.11                                                                                                  // 521
    // http://es5.github.com/#x15.2.3.11                                                                              // 522
    if (!Object.isSealed) {                                                                                           // 523
        Object.isSealed = function isSealed(object) {                                                                 // 524
            if (Object(object) !== object) {                                                                          // 525
                throw new TypeError('Object.isSealed can only be called on Objects.');                                // 526
            }                                                                                                         // 527
            return false;                                                                                             // 528
        };                                                                                                            // 529
    }                                                                                                                 // 530
                                                                                                                      // 531
    // ES5 15.2.3.12                                                                                                  // 532
    // http://es5.github.com/#x15.2.3.12                                                                              // 533
    if (!Object.isFrozen) {                                                                                           // 534
        Object.isFrozen = function isFrozen(object) {                                                                 // 535
            if (Object(object) !== object) {                                                                          // 536
                throw new TypeError('Object.isFrozen can only be called on Objects.');                                // 537
            }                                                                                                         // 538
            return false;                                                                                             // 539
        };                                                                                                            // 540
    }                                                                                                                 // 541
                                                                                                                      // 542
    // ES5 15.2.3.13                                                                                                  // 543
    // http://es5.github.com/#x15.2.3.13                                                                              // 544
    if (!Object.isExtensible) {                                                                                       // 545
        Object.isExtensible = function isExtensible(object) {                                                         // 546
            // 1. If Type(O) is not Object throw a TypeError exception.                                               // 547
            if (Object(object) !== object) {                                                                          // 548
                throw new TypeError('Object.isExtensible can only be called on Objects.');                            // 549
            }                                                                                                         // 550
            // 2. Return the Boolean value of the [[Extensible]] internal property of O.                              // 551
            var name = '';                                                                                            // 552
            while (owns(object, name)) {                                                                              // 553
                name += '?';                                                                                          // 554
            }                                                                                                         // 555
            object[name] = true;                                                                                      // 556
            var returnValue = owns(object, name);                                                                     // 557
            delete object[name];                                                                                      // 558
            return returnValue;                                                                                       // 559
        };                                                                                                            // 560
    }                                                                                                                 // 561
                                                                                                                      // 562
}));                                                                                                                  // 563
                                                                                                                      // 564
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/es5-shim/client.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['es5-shim'] = exports;

})();
