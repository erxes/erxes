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
var EJSON = Package.ejson.EJSON;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;

/* Package-scope variables */
var Log, exports;

var require = meteorInstall({"node_modules":{"meteor":{"logging":{"logging.js":["cli-color",function(require){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// packages/logging/logging.js                                                         //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
Log = function () {                                                                    // 1
  return Log.info.apply(this, arguments);                                              // 2
};                                                                                     // 3
                                                                                       // 4
/// FOR TESTING                                                                        // 5
var intercept = 0;                                                                     // 6
var interceptedLines = [];                                                             // 7
var suppress = 0;                                                                      // 8
                                                                                       // 9
// Intercept the next 'count' calls to a Log function. The actual                      // 10
// lines printed to the console can be cleared and read by calling                     // 11
// Log._intercepted().                                                                 // 12
Log._intercept = function (count) {                                                    // 13
  intercept += count;                                                                  // 14
};                                                                                     // 15
                                                                                       // 16
// Suppress the next 'count' calls to a Log function. Use this to stop                 // 17
// tests from spamming the console, especially with red errors that                    // 18
// might look like a failing test.                                                     // 19
Log._suppress = function (count) {                                                     // 20
  suppress += count;                                                                   // 21
};                                                                                     // 22
                                                                                       // 23
// Returns intercepted lines and resets the intercept counter.                         // 24
Log._intercepted = function () {                                                       // 25
  var lines = interceptedLines;                                                        // 26
  interceptedLines = [];                                                               // 27
  intercept = 0;                                                                       // 28
  return lines;                                                                        // 29
};                                                                                     // 30
                                                                                       // 31
// Either 'json' or 'colored-text'.                                                    // 32
//                                                                                     // 33
// When this is set to 'json', print JSON documents that are parsed by another         // 34
// process ('satellite' or 'meteor run'). This other process should call               // 35
// 'Log.format' for nice output.                                                       // 36
//                                                                                     // 37
// When this is set to 'colored-text', call 'Log.format' before printing.              // 38
// This should be used for logging from within satellite, since there is no            // 39
// other process that will be reading its standard output.                             // 40
Log.outputFormat = 'json';                                                             // 41
                                                                                       // 42
var LEVEL_COLORS = {                                                                   // 43
  debug: 'green',                                                                      // 44
  // leave info as the default color                                                   // 45
  warn: 'magenta',                                                                     // 46
  error: 'red'                                                                         // 47
};                                                                                     // 48
                                                                                       // 49
var META_COLOR = 'blue';                                                               // 50
                                                                                       // 51
// XXX package                                                                         // 52
var RESTRICTED_KEYS = ['time', 'timeInexact', 'level', 'file', 'line',                 // 53
                        'program', 'originApp', 'satellite', 'stderr'];                // 54
                                                                                       // 55
var FORMATTED_KEYS = RESTRICTED_KEYS.concat(['app', 'message']);                       // 56
                                                                                       // 57
var logInBrowser = function (obj) {                                                    // 58
  var str = Log.format(obj);                                                           // 59
                                                                                       // 60
  // XXX Some levels should be probably be sent to the server                          // 61
  var level = obj.level;                                                               // 62
                                                                                       // 63
  if ((typeof console !== 'undefined') && console[level]) {                            // 64
    console[level](str);                                                               // 65
  } else {                                                                             // 66
    // XXX Uses of Meteor._debug should probably be replaced by Log.debug or           // 67
    //     Log.info, and we should have another name for "do your best to              // 68
    //     call call console.log".                                                     // 69
    Meteor._debug(str);                                                                // 70
  }                                                                                    // 71
};                                                                                     // 72
                                                                                       // 73
// @returns {Object: { line: Number, file: String }}                                   // 74
Log._getCallerDetails = function () {                                                  // 75
  var getStack = function () {                                                         // 76
    // We do NOT use Error.prepareStackTrace here (a V8 extension that gets us a       // 77
    // pre-parsed stack) since it's impossible to compose it with the use of           // 78
    // Error.prepareStackTrace used on the server for source maps.                     // 79
    var err = new Error;                                                               // 80
    var stack = err.stack;                                                             // 81
    return stack;                                                                      // 82
  };                                                                                   // 83
                                                                                       // 84
  var stack = getStack();                                                              // 85
                                                                                       // 86
  if (!stack) return {};                                                               // 87
                                                                                       // 88
  var lines = stack.split('\n');                                                       // 89
                                                                                       // 90
  // looking for the first line outside the logging package (or an                     // 91
  // eval if we find that first)                                                       // 92
  var line;                                                                            // 93
  for (var i = 1; i < lines.length; ++i) {                                             // 94
    line = lines[i];                                                                   // 95
    if (line.match(/^\s*at eval \(eval/)) {                                            // 96
      return {file: "eval"};                                                           // 97
    }                                                                                  // 98
                                                                                       // 99
    if (!line.match(/packages\/(?:local-test[:_])?logging(?:\/|\.js)/))                // 100
      break;                                                                           // 101
  }                                                                                    // 102
                                                                                       // 103
  var details = {};                                                                    // 104
                                                                                       // 105
  // The format for FF is 'functionName@filePath:lineNumber'                           // 106
  // The format for V8 is 'functionName (packages/logging/logging.js:81)' or           // 107
  //                      'packages/logging/logging.js:81'                             // 108
  var match = /(?:[@(]| at )([^(]+?):([0-9:]+)(?:\)|$)/.exec(line);                    // 109
  if (!match)                                                                          // 110
    return details;                                                                    // 111
  // in case the matched block here is line:column                                     // 112
  details.line = match[2].split(':')[0];                                               // 113
                                                                                       // 114
  // Possible format: https://foo.bar.com/scripts/file.js?random=foobar                // 115
  // XXX: if you can write the following in better way, please do it                   // 116
  // XXX: what about evals?                                                            // 117
  details.file = match[1].split('/').slice(-1)[0].split('?')[0];                       // 118
                                                                                       // 119
  return details;                                                                      // 120
};                                                                                     // 121
                                                                                       // 122
_.each(['debug', 'info', 'warn', 'error'], function (level) {                          // 123
  // @param arg {String|Object}                                                        // 124
  Log[level] = function (arg) {                                                        // 125
    if (suppress) {                                                                    // 126
      suppress--;                                                                      // 127
      return;                                                                          // 128
    }                                                                                  // 129
                                                                                       // 130
    var intercepted = false;                                                           // 131
    if (intercept) {                                                                   // 132
      intercept--;                                                                     // 133
      intercepted = true;                                                              // 134
    }                                                                                  // 135
                                                                                       // 136
    var obj = (_.isObject(arg) && !_.isRegExp(arg) && !_.isDate(arg) ) ?               // 137
              arg : {message: new String(arg).toString() };                            // 138
                                                                                       // 139
    _.each(RESTRICTED_KEYS, function (key) {                                           // 140
      if (obj[key])                                                                    // 141
        throw new Error("Can't set '" + key + "' in log message");                     // 142
    });                                                                                // 143
                                                                                       // 144
    if (_.has(obj, 'message') && !_.isString(obj.message))                             // 145
      throw new Error("The 'message' field in log objects must be a string");          // 146
    if (!obj.omitCallerDetails)                                                        // 147
      obj = _.extend(Log._getCallerDetails(), obj);                                    // 148
    obj.time = new Date();                                                             // 149
    obj.level = level;                                                                 // 150
                                                                                       // 151
    // XXX allow you to enable 'debug', probably per-package                           // 152
    if (level === 'debug')                                                             // 153
      return;                                                                          // 154
                                                                                       // 155
    if (intercepted) {                                                                 // 156
      interceptedLines.push(EJSON.stringify(obj));                                     // 157
    } else if (Meteor.isServer) {                                                      // 158
      if (Log.outputFormat === 'colored-text') {                                       // 159
        console.log(Log.format(obj, {color: true}));                                   // 160
      } else if (Log.outputFormat === 'json') {                                        // 161
        console.log(EJSON.stringify(obj));                                             // 162
      } else {                                                                         // 163
        throw new Error("Unknown logging output format: " + Log.outputFormat);         // 164
      }                                                                                // 165
    } else {                                                                           // 166
      logInBrowser(obj);                                                               // 167
    }                                                                                  // 168
  };                                                                                   // 169
});                                                                                    // 170
                                                                                       // 171
// tries to parse line as EJSON. returns object if parse is successful, or null if not
Log.parse = function (line) {                                                          // 173
  var obj = null;                                                                      // 174
  if (line && line.charAt(0) === '{') { // might be json generated from calling 'Log'  // 175
    try { obj = EJSON.parse(line); } catch (e) {}                                      // 176
  }                                                                                    // 177
                                                                                       // 178
  // XXX should probably check fields other than 'time'                                // 179
  if (obj && obj.time && (obj.time instanceof Date))                                   // 180
    return obj;                                                                        // 181
  else                                                                                 // 182
    return null;                                                                       // 183
};                                                                                     // 184
                                                                                       // 185
// formats a log object into colored human and machine-readable text                   // 186
Log.format = function (obj, options) {                                                 // 187
  obj = EJSON.clone(obj); // don't mutate the argument                                 // 188
  options = options || {};                                                             // 189
                                                                                       // 190
  var time = obj.time;                                                                 // 191
  if (!(time instanceof Date))                                                         // 192
    throw new Error("'time' must be a Date object");                                   // 193
  var timeInexact = obj.timeInexact;                                                   // 194
                                                                                       // 195
  // store fields that are in FORMATTED_KEYS since we strip them                       // 196
  var level = obj.level || 'info';                                                     // 197
  var file = obj.file;                                                                 // 198
  var lineNumber = obj.line;                                                           // 199
  var appName = obj.app || '';                                                         // 200
  var originApp = obj.originApp;                                                       // 201
  var message = obj.message || '';                                                     // 202
  var program = obj.program || '';                                                     // 203
  var satellite = obj.satellite;                                                       // 204
  var stderr = obj.stderr || '';                                                       // 205
                                                                                       // 206
  _.each(FORMATTED_KEYS, function(key) {                                               // 207
    delete obj[key];                                                                   // 208
  });                                                                                  // 209
                                                                                       // 210
  if (!_.isEmpty(obj)) {                                                               // 211
    if (message) message += " ";                                                       // 212
    message += EJSON.stringify(obj);                                                   // 213
  }                                                                                    // 214
                                                                                       // 215
  var pad2 = function(n) { return n < 10 ? '0' + n : n.toString(); };                  // 216
  var pad3 = function(n) { return n < 100 ? '0' + pad2(n) : n.toString(); };           // 217
                                                                                       // 218
  var dateStamp = time.getFullYear().toString() +                                      // 219
    pad2(time.getMonth() + 1 /*0-based*/) +                                            // 220
    pad2(time.getDate());                                                              // 221
  var timeStamp = pad2(time.getHours()) +                                              // 222
        ':' +                                                                          // 223
        pad2(time.getMinutes()) +                                                      // 224
        ':' +                                                                          // 225
        pad2(time.getSeconds()) +                                                      // 226
        '.' +                                                                          // 227
        pad3(time.getMilliseconds());                                                  // 228
                                                                                       // 229
  // eg in San Francisco in June this will be '(-7)'                                   // 230
  var utcOffsetStr = '(' + (-(new Date().getTimezoneOffset() / 60)) + ')';             // 231
                                                                                       // 232
  var appInfo = '';                                                                    // 233
  if (appName) appInfo += appName;                                                     // 234
  if (originApp && originApp !== appName) appInfo += ' via ' + originApp;              // 235
  if (appInfo) appInfo = '[' + appInfo + '] ';                                         // 236
                                                                                       // 237
  var sourceInfoParts = [];                                                            // 238
  if (program) sourceInfoParts.push(program);                                          // 239
  if (file) sourceInfoParts.push(file);                                                // 240
  if (lineNumber) sourceInfoParts.push(lineNumber);                                    // 241
  var sourceInfo = _.isEmpty(sourceInfoParts) ?                                        // 242
    '' : '(' + sourceInfoParts.join(':') + ') ';                                       // 243
                                                                                       // 244
  if (satellite)                                                                       // 245
    sourceInfo += ['[', satellite, ']'].join('');                                      // 246
                                                                                       // 247
  var stderrIndicator = stderr ? '(STDERR) ' : '';                                     // 248
                                                                                       // 249
  var metaPrefix = [                                                                   // 250
    level.charAt(0).toUpperCase(),                                                     // 251
    dateStamp,                                                                         // 252
    '-',                                                                               // 253
    timeStamp,                                                                         // 254
    utcOffsetStr,                                                                      // 255
    timeInexact ? '? ' : ' ',                                                          // 256
    appInfo,                                                                           // 257
    sourceInfo,                                                                        // 258
    stderrIndicator].join('');                                                         // 259
                                                                                       // 260
  var prettify = function (line, color) {                                              // 261
    return (options.color && Meteor.isServer && color) ?                               // 262
      require('cli-color')[color](line) : line;                                        // 263
  };                                                                                   // 264
                                                                                       // 265
  return prettify(metaPrefix, options.metaColor || META_COLOR) +                       // 266
    prettify(message, LEVEL_COLORS[level]);                                            // 267
};                                                                                     // 268
                                                                                       // 269
// Turn a line of text into a loggable object.                                         // 270
// @param line {String}                                                                // 271
// @param override {Object}                                                            // 272
Log.objFromText = function (line, override) {                                          // 273
  var obj = {message: line, level: "info", time: new Date(), timeInexact: true};       // 274
  return _.extend(obj, override);                                                      // 275
};                                                                                     // 276
                                                                                       // 277
/////////////////////////////////////////////////////////////////////////////////////////

}],"node_modules":{"cli-color":{"package.json":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// ../../.1.1.17.6xtim6++os+web.browser+web.cordova/npm/node_modules/cli-color/package //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
exports.name = "cli-color";                                                            // 1
exports.version = "0.2.3";                                                             // 2
exports.main = "lib";                                                                  // 3
                                                                                       // 4
/////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"index.js":["es5-ext/lib/Object/descriptor","es5-ext/lib/Object/extend","es5-ext/lib/Object/map","es5-ext/lib/Object/reduce","es5-ext/lib/String/prototype/repeat","memoizee","tty","./_xterm-match",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/lib/index.js                     //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var d       = require('es5-ext/lib/Object/descriptor')                                 // 3
  , extend  = require('es5-ext/lib/Object/extend')                                     // 4
  , map     = require('es5-ext/lib/Object/map')                                        // 5
  , reduce  = require('es5-ext/lib/Object/reduce')                                     // 6
  , repeat  = require('es5-ext/lib/String/prototype/repeat')                           // 7
  , memoize = require('memoizee')                                                      // 8
  , tty     = require('tty')                                                           // 9
                                                                                       // 10
  , join = Array.prototype.join, defineProperty = Object.defineProperty                // 11
  , defineProperties = Object.defineProperties, abs = Math.abs                         // 12
  , floor = Math.floor, max = Math.max, min = Math.min                                 // 13
                                                                                       // 14
  , mods, proto, getFn, getMove, xtermMatch                                            // 15
  , up, down, right, left, getHeight, memoized;                                        // 16
                                                                                       // 17
mods = extend({                                                                        // 18
	// Style                                                                              // 19
	bold:      { _bold: [1, 22] },                                                        // 20
	italic:    { _italic: [3, 23] },                                                      // 21
	underline: { _underline: [4, 24] },                                                   // 22
	blink:     { _blink: [5, 25] },                                                       // 23
	inverse:   { _inverse: [7, 27] },                                                     // 24
	strike:    { _strike: [9, 29] }                                                       // 25
},                                                                                     // 26
                                                                                       // 27
	// Color                                                                              // 28
	['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']               // 29
		.reduce(function (obj, color, index) {                                               // 30
		// foreground                                                                        // 31
		obj[color] = { _fg: [30 + index, 39] };                                              // 32
		obj[color + 'Bright'] = { _fg: [90 + index, 39] };                                   // 33
                                                                                       // 34
		// background                                                                        // 35
		obj['bg' + color[0].toUpperCase() + color.slice(1)] =                                // 36
			{ _bg: [40 + index, 49] };                                                          // 37
		obj['bg' + color[0].toUpperCase() + color.slice(1) + 'Bright'] =                     // 38
			{ _bg: [100 + index, 49] };                                                         // 39
                                                                                       // 40
		return obj;                                                                          // 41
	}, {}));                                                                              // 42
                                                                                       // 43
// Some use cli-color as: console.log(clc.red('Error!'));                              // 44
// Which is inefficient as on each call it configures new clc object                   // 45
// with memoization we reuse once created object                                       // 46
memoized = memoize(function (scope, mod) {                                             // 47
	return defineProperty(getFn(), '_cliColorData',                                       // 48
		d(extend({}, scope._cliColorData, mod)));                                            // 49
});                                                                                    // 50
                                                                                       // 51
proto = Object.create(Function.prototype, extend(map(mods, function (mod) {            // 52
	return d.gs(function () { return memoized(this, mod); });                             // 53
}), {                                                                                  // 54
	// xterm (255) color                                                                  // 55
	xterm: d(memoize(function (code) {                                                    // 56
		code = isNaN(code) ? 255 : min(max(code, 0), 255);                                   // 57
		return defineProperty(getFn(), '_cliColorData',                                      // 58
			d(extend({}, this._cliColorData, {                                                  // 59
				_fg: [xtermMatch ? xtermMatch[code] : ('38;5;' + code), 39]                        // 60
			})));                                                                               // 61
	}, { method: 'xterm' })),                                                             // 62
	bgXterm: d(memoize(function (code) {                                                  // 63
		code = isNaN(code) ? 255 : min(max(code, 0), 255);                                   // 64
		return defineProperty(getFn(), '_cliColorData',                                      // 65
			d(extend({}, this._cliColorData, {                                                  // 66
				_bg: [xtermMatch ? (xtermMatch[code] + 10) : ('48;5;' + code), 49]                 // 67
			})));                                                                               // 68
	}, { method: 'bgXterm' }))                                                            // 69
}));                                                                                   // 70
                                                                                       // 71
if (process.platform === 'win32') {                                                    // 72
	xtermMatch = require('./_xterm-match');                                               // 73
}                                                                                      // 74
                                                                                       // 75
getFn = function () {                                                                  // 76
	var fn = function (/*…msg*/) {                                                        // 77
		var data = fn._cliColorData, close = '';                                             // 78
		return reduce(data, function (str, mod) {                                            // 79
			close = '\x1b[' + mod[1] + 'm' + close;                                             // 80
			return str + '\x1b[' + mod[0] + 'm';                                                // 81
		}, '', true) + join.call(arguments, ' ') + close;                                    // 82
	};                                                                                    // 83
	fn.__proto__ = proto;                                                                 // 84
	return fn;                                                                            // 85
};                                                                                     // 86
                                                                                       // 87
getMove = function (control) {                                                         // 88
	return function (num) {                                                               // 89
		num = isNaN(num) ? 0 : max(floor(num), 0);                                           // 90
		return num ? ('\x1b[' + num + control) : '';                                         // 91
	};                                                                                    // 92
};                                                                                     // 93
                                                                                       // 94
module.exports = defineProperties(getFn(), {                                           // 95
	width: d.gs(process.stdout.getWindowSize ? function () {                              // 96
		return process.stdout.getWindowSize()[0];                                            // 97
	} : function () {                                                                     // 98
		return tty.getWindowSize ? tty.getWindowSize()[1] : 0;                               // 99
	}),                                                                                   // 100
	height: d.gs(getHeight = process.stdout.getWindowSize ? function () {                 // 101
		return process.stdout.getWindowSize()[1];                                            // 102
	} : function () {                                                                     // 103
		return tty.getWindowSize ? tty.getWindowSize()[0] : 0;                               // 104
	}),                                                                                   // 105
	reset: d.gs(function () {                                                             // 106
		return repeat.call('\n', getHeight() - 1) + '\x1bc';                                 // 107
	}),                                                                                   // 108
	up: d(up = getMove('A')),                                                             // 109
	down: d(down = getMove('B')),                                                         // 110
	right: d(right = getMove('C')),                                                       // 111
	left: d(left = getMove('D')),                                                         // 112
	move: d(function (x, y) {                                                             // 113
		x = isNaN(x) ? 0 : floor(x);                                                         // 114
		y = isNaN(y) ? 0 : floor(y);                                                         // 115
		return ((x > 0) ? right(x) : left(-x)) + ((y > 0) ? down(y) : up(-y));               // 116
	}),                                                                                   // 117
	moveTo: d(function (x, y) {                                                           // 118
		x = isNaN(x) ? 1 : (max(floor(x), 0) + 1);                                           // 119
		y = isNaN(y) ? 1 : (max(floor(y), 0) + 1);                                           // 120
		return '\x1b[' + y + ';' + x + 'H';                                                  // 121
	}),                                                                                   // 122
	bol: d(function (n/*, erase*/) {                                                      // 123
		var dir;                                                                             // 124
		n = isNaN(n) ? 0 : Number(n);                                                        // 125
		dir = (n >= 0) ? 'E' : 'F';                                                          // 126
		n = floor(abs(n));                                                                   // 127
		return arguments[1] ?                                                                // 128
				(((!n || (dir === 'F')) ? '\x1b[0E\x1bK' : '') +                                   // 129
					repeat.call('\x1b[1' + dir + '\x1b[K', n)) : '\x1b[' + n + dir;                   // 130
	}),                                                                                   // 131
	beep: d('\x07'),                                                                      // 132
	xtermSupported: d(!xtermMatch),                                                       // 133
	_cliColorData: d({})                                                                  // 134
});                                                                                    // 135
                                                                                       // 136
/////////////////////////////////////////////////////////////////////////////////////////

}],"_xterm-match.js":["./_xterm-colors",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/lib/_xterm-match.js              //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var push = Array.prototype.push, reduce = Array.prototype.reduce, abs = Math.abs       // 3
  , colors, match, result, i;                                                          // 4
                                                                                       // 5
colors = require('./_xterm-colors').map(function (color) {                             // 6
	return {                                                                              // 7
		r: parseInt(color.slice(0, 2), 16),                                                  // 8
		g: parseInt(color.slice(2, 4), 16),                                                  // 9
		b: parseInt(color.slice(4), 16)                                                      // 10
	};                                                                                    // 11
});                                                                                    // 12
                                                                                       // 13
match = colors.slice(0, 16);                                                           // 14
                                                                                       // 15
module.exports = result = [];                                                          // 16
                                                                                       // 17
i = 0;                                                                                 // 18
while (i < 8) {                                                                        // 19
	result.push(30 + i++);                                                                // 20
}                                                                                      // 21
i = 0;                                                                                 // 22
while (i < 8) {                                                                        // 23
	result.push(90 + i++);                                                                // 24
}                                                                                      // 25
push.apply(result, colors.slice(16).map(function (data) {                              // 26
	var index, diff = Infinity;                                                           // 27
	match.every(function (match, i) {                                                     // 28
		var ndiff = reduce.call('rgb', function (diff, channel) {                            // 29
			return (diff += abs(match[channel] - data[channel]));                               // 30
		}, 0);                                                                               // 31
		if (ndiff < diff) {                                                                  // 32
			index = i;                                                                          // 33
			diff = ndiff;                                                                       // 34
		}                                                                                    // 35
		return ndiff;                                                                        // 36
	});                                                                                   // 37
	return result[index];                                                                 // 38
}));                                                                                   // 39
                                                                                       // 40
/////////////////////////////////////////////////////////////////////////////////////////

}],"_xterm-colors.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/lib/_xterm-colors.js             //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
module.exports = [                                                                     // 3
	"000000", "800000", "008000", "808000", "000080", "800080", "008080", "c0c0c0",       // 4
	"808080", "ff0000", "00ff00", "ffff00", "0000ff", "ff00ff", "00ffff", "ffffff",       // 5
                                                                                       // 6
	"000000", "00005f", "000087", "0000af", "0000d7", "0000ff",                           // 7
	"005f00", "005f5f", "005f87", "005faf", "005fd7", "005fff",                           // 8
	"008700", "00875f", "008787", "0087af", "0087d7", "0087ff",                           // 9
	"00af00", "00af5f", "00af87", "00afaf", "00afd7", "00afff",                           // 10
	"00d700", "00d75f", "00d787", "00d7af", "00d7d7", "00d7ff",                           // 11
	"00ff00", "00ff5f", "00ff87", "00ffaf", "00ffd7", "00ffff",                           // 12
                                                                                       // 13
	"5f0000", "5f005f", "5f0087", "5f00af", "5f00d7", "5f00ff",                           // 14
	"5f5f00", "5f5f5f", "5f5f87", "5f5faf", "5f5fd7", "5f5fff",                           // 15
	"5f8700", "5f875f", "5f8787", "5f87af", "5f87d7", "5f87ff",                           // 16
	"5faf00", "5faf5f", "5faf87", "5fafaf", "5fafd7", "5fafff",                           // 17
	"5fd700", "5fd75f", "5fd787", "5fd7af", "5fd7d7", "5fd7ff",                           // 18
	"5fff00", "5fff5f", "5fff87", "5fffaf", "5fffd7", "5fffff",                           // 19
                                                                                       // 20
	"870000", "87005f", "870087", "8700af", "8700d7", "8700ff",                           // 21
	"875f00", "875f5f", "875f87", "875faf", "875fd7", "875fff",                           // 22
	"878700", "87875f", "878787", "8787af", "8787d7", "8787ff",                           // 23
	"87af00", "87af5f", "87af87", "87afaf", "87afd7", "87afff",                           // 24
	"87d700", "87d75f", "87d787", "87d7af", "87d7d7", "87d7ff",                           // 25
	"87ff00", "87ff5f", "87ff87", "87ffaf", "87ffd7", "87ffff",                           // 26
                                                                                       // 27
	"af0000", "af005f", "af0087", "af00af", "af00d7", "af00ff",                           // 28
	"af5f00", "af5f5f", "af5f87", "af5faf", "af5fd7", "af5fff",                           // 29
	"af8700", "af875f", "af8787", "af87af", "af87d7", "af87ff",                           // 30
	"afaf00", "afaf5f", "afaf87", "afafaf", "afafd7", "afafff",                           // 31
	"afd700", "afd75f", "afd787", "afd7af", "afd7d7", "afd7ff",                           // 32
	"afff00", "afff5f", "afff87", "afffaf", "afffd7", "afffff",                           // 33
                                                                                       // 34
	"d70000", "d7005f", "d70087", "d700af", "d700d7", "d700ff",                           // 35
	"d75f00", "d75f5f", "d75f87", "d75faf", "d75fd7", "d75fff",                           // 36
	"d78700", "d7875f", "d78787", "d787af", "d787d7", "d787ff",                           // 37
	"d7af00", "d7af5f", "d7af87", "d7afaf", "d7afd7", "d7afff",                           // 38
	"d7d700", "d7d75f", "d7d787", "d7d7af", "d7d7d7", "d7d7ff",                           // 39
	"d7ff00", "d7ff5f", "d7ff87", "d7ffaf", "d7ffd7", "d7ffff",                           // 40
                                                                                       // 41
	"ff0000", "ff005f", "ff0087", "ff00af", "ff00d7", "ff00ff",                           // 42
	"ff5f00", "ff5f5f", "ff5f87", "ff5faf", "ff5fd7", "ff5fff",                           // 43
	"ff8700", "ff875f", "ff8787", "ff87af", "ff87d7", "ff87ff",                           // 44
	"ffaf00", "ffaf5f", "ffaf87", "ffafaf", "ffafd7", "ffafff",                           // 45
	"ffd700", "ffd75f", "ffd787", "ffd7af", "ffd7d7", "ffd7ff",                           // 46
	"ffff00", "ffff5f", "ffff87", "ffffaf", "ffffd7", "ffffff",                           // 47
                                                                                       // 48
	"080808", "121212", "1c1c1c", "262626", "303030", "3a3a3a",                           // 49
	"444444", "4e4e4e", "585858", "626262", "6c6c6c", "767676",                           // 50
	"808080", "8a8a8a", "949494", "9e9e9e", "a8a8a8", "b2b2b2",                           // 51
	"bcbcbc", "c6c6c6", "d0d0d0", "dadada", "e4e4e4", "eeeeee"                            // 52
];                                                                                     // 53
                                                                                       // 54
/////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"es5-ext":{"lib":{"Object":{"descriptor.js":["./is-callable","./valid-callable","./valid-value","./copy","./map","../String/is-string","../String/prototype/contains",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var isCallable = require('./is-callable')                                              // 3
  , callable   = require('./valid-callable')                                           // 4
  , validValue = require('./valid-value')                                              // 5
  , copy       = require('./copy')                                                     // 6
  , map        = require('./map')                                                      // 7
  , isString   = require('../String/is-string')                                        // 8
  , contains   = require('../String/prototype/contains')                               // 9
                                                                                       // 10
  , bind = Function.prototype.bind                                                     // 11
  , defineProperty = Object.defineProperty                                             // 12
  , d;                                                                                 // 13
                                                                                       // 14
d = module.exports = function (dscr, value) {                                          // 15
	var c, e, w;                                                                          // 16
	if (arguments.length < 2) {                                                           // 17
		value = dscr;                                                                        // 18
		dscr = null;                                                                         // 19
	}                                                                                     // 20
	if (dscr == null) {                                                                   // 21
		c = w = true;                                                                        // 22
		e = false;                                                                           // 23
	} else {                                                                              // 24
		c = contains.call(dscr, 'c');                                                        // 25
		e = contains.call(dscr, 'e');                                                        // 26
		w = contains.call(dscr, 'w');                                                        // 27
	}                                                                                     // 28
                                                                                       // 29
	return { value: value, configurable: c, enumerable: e, writable: w };                 // 30
};                                                                                     // 31
                                                                                       // 32
d.gs = function (dscr, get, set) {                                                     // 33
	var c, e;                                                                             // 34
	if (isCallable(dscr)) {                                                               // 35
		set = (get == null) ? undefined : callable(get);                                     // 36
		get = dscr;                                                                          // 37
		dscr = null;                                                                         // 38
	} else {                                                                              // 39
		get = (get == null) ? undefined : callable(get);                                     // 40
		set = (set == null) ? undefined : callable(set);                                     // 41
	}                                                                                     // 42
	if (dscr == null) {                                                                   // 43
		c = true;                                                                            // 44
		e = false;                                                                           // 45
	} else {                                                                              // 46
		c = contains.call(dscr, 'c');                                                        // 47
		e = contains.call(dscr, 'e');                                                        // 48
	}                                                                                     // 49
                                                                                       // 50
	return { get: get, set: set, configurable: c, enumerable: e };                        // 51
};                                                                                     // 52
                                                                                       // 53
d.binder = function self(name, dv) {                                                   // 54
	var value, dgs;                                                                       // 55
	if (!isString(name)) {                                                                // 56
		return map(name, function (dv, name) { return self(name, dv); });                    // 57
	}                                                                                     // 58
	value = validValue(dv) && callable(dv.value);                                         // 59
	dgs = copy(dv);                                                                       // 60
	delete dgs.writable;                                                                  // 61
	delete dgs.value;                                                                     // 62
	dgs.get = function () {                                                               // 63
		dv.value = bind.call(value, this);                                                   // 64
		defineProperty(this, name, dv);                                                      // 65
		return this[name];                                                                   // 66
	};                                                                                    // 67
	return dgs;                                                                           // 68
};                                                                                     // 69
                                                                                       // 70
/////////////////////////////////////////////////////////////////////////////////////////

}],"is-callable.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Inspired by: http://www.davidflanagan.com/2009/08/typeof-isfuncti.html              // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var forEach = Array.prototype.forEach.bind([]);                                        // 5
                                                                                       // 6
module.exports = function (obj) {                                                      // 7
	var type;                                                                             // 8
	if (!obj) {                                                                           // 9
		return false;                                                                        // 10
	}                                                                                     // 11
	type = typeof obj;                                                                    // 12
	if (type === 'function') {                                                            // 13
		return true;                                                                         // 14
	}                                                                                     // 15
	if (type !== 'object') {                                                              // 16
		return false;                                                                        // 17
	}                                                                                     // 18
                                                                                       // 19
	try {                                                                                 // 20
		forEach(obj);                                                                        // 21
		return true;                                                                         // 22
	} catch (e) {                                                                         // 23
		if (e instanceof TypeError) {                                                        // 24
			return false;                                                                       // 25
		}                                                                                    // 26
		throw e;                                                                             // 27
	}                                                                                     // 28
};                                                                                     // 29
                                                                                       // 30
/////////////////////////////////////////////////////////////////////////////////////////

},"valid-callable.js":["./is-callable",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var isCallable = require('./is-callable');                                             // 3
                                                                                       // 4
module.exports = function (fn) {                                                       // 5
	if (!isCallable(fn)) {                                                                // 6
		throw new TypeError(fn + " is not a function");                                      // 7
	}                                                                                     // 8
	return fn;                                                                            // 9
};                                                                                     // 10
                                                                                       // 11
/////////////////////////////////////////////////////////////////////////////////////////

}],"valid-value.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
module.exports = function (value) {                                                    // 3
	if (value == null) {                                                                  // 4
		throw new TypeError("Cannot use null or undefined");                                 // 5
	}                                                                                     // 6
	return value;                                                                         // 7
};                                                                                     // 8
                                                                                       // 9
/////////////////////////////////////////////////////////////////////////////////////////

},"copy.js":["./is-plain-object","./for-each","./extend","./valid-value",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var isPlainObject = require('./is-plain-object')                                       // 3
  , forEach       = require('./for-each')                                              // 4
  , extend        = require('./extend')                                                // 5
  , value         = require('./valid-value')                                           // 6
                                                                                       // 7
  , recursive;                                                                         // 8
                                                                                       // 9
recursive = function (to, from, cloned) {                                              // 10
	forEach(from, function (value, key) {                                                 // 11
		var index;                                                                           // 12
		if (isPlainObject(value)) {                                                          // 13
			if ((index = cloned[0].indexOf(value)) === -1) {                                    // 14
				cloned[0].push(value);                                                             // 15
				cloned[1].push(to[key] = extend({}, value));                                       // 16
				recursive(to[key], value, cloned);                                                 // 17
			} else {                                                                            // 18
				to[key] = cloned[1][index];                                                        // 19
			}                                                                                   // 20
		}                                                                                    // 21
	}, from);                                                                             // 22
};                                                                                     // 23
                                                                                       // 24
module.exports = function (obj/*, deep*/) {                                            // 25
	var copy;                                                                             // 26
	if ((copy = Object(value(obj))) === obj) {                                            // 27
		copy = extend({}, obj);                                                              // 28
		if (arguments[1]) {                                                                  // 29
			recursive(copy, obj, [[obj], [copy]]);                                              // 30
		}                                                                                    // 31
	}                                                                                     // 32
	return copy;                                                                          // 33
};                                                                                     // 34
                                                                                       // 35
/////////////////////////////////////////////////////////////////////////////////////////

}],"is-plain-object.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var getPrototypeOf = Object.getPrototypeOf, prototype = Object.prototype               // 3
  , toString = prototype.toString                                                      // 4
                                                                                       // 5
  , id = {}.toString();                                                                // 6
                                                                                       // 7
module.exports = function (value) {                                                    // 8
	var proto;                                                                            // 9
	if (!value || (typeof value !== 'object') || (toString.call(value) !== id)) {         // 10
		return false;                                                                        // 11
	}                                                                                     // 12
	proto = getPrototypeOf(value);                                                        // 13
	return (proto === prototype) || (getPrototypeOf(proto) === null);                     // 14
};                                                                                     // 15
                                                                                       // 16
/////////////////////////////////////////////////////////////////////////////////////////

},"for-each.js":["./_iterate",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
module.exports = require('./_iterate')('forEach');                                     // 3
                                                                                       // 4
/////////////////////////////////////////////////////////////////////////////////////////

}],"_iterate.js":["./is-callable","./valid-callable","./valid-value",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Internal method, used by iteration functions.                                       // 1
// Calls a function for each key-value pair found in object                            // 2
// Optionally takes compareFn to iterate object in specific order                      // 3
                                                                                       // 4
'use strict';                                                                          // 5
                                                                                       // 6
var isCallable = require('./is-callable')                                              // 7
  , callable   = require('./valid-callable')                                           // 8
  , value      = require('./valid-value')                                              // 9
                                                                                       // 10
  , call = Function.prototype.call, keys = Object.keys;                                // 11
                                                                                       // 12
module.exports = function (method) {                                                   // 13
	return function (obj, cb/*, thisArg, compareFn*/) {                                   // 14
		var list, thisArg = arguments[2], compareFn = arguments[3];                          // 15
		obj = Object(value(obj));                                                            // 16
		callable(cb);                                                                        // 17
                                                                                       // 18
		list = keys(obj);                                                                    // 19
		if (compareFn) {                                                                     // 20
			list.sort(isCallable(compareFn) ? compareFn.bind(obj) : undefined);                 // 21
		}                                                                                    // 22
		return list[method](function (key, index) {                                          // 23
			return call.call(cb, thisArg, obj[key], key, obj, index);                           // 24
		});                                                                                  // 25
	};                                                                                    // 26
};                                                                                     // 27
                                                                                       // 28
/////////////////////////////////////////////////////////////////////////////////////////

}],"extend.js":["./valid-value",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var value = require('./valid-value')                                                   // 3
                                                                                       // 4
  , forEach = Array.prototype.forEach, slice = Array.prototype.slice                   // 5
  , keys = Object.keys                                                                 // 6
                                                                                       // 7
  , extend;                                                                            // 8
                                                                                       // 9
extend = function (src) {                                                              // 10
	keys(Object(src)).forEach(function (key) {                                            // 11
		this[key] = src[key];                                                                // 12
	}, this);                                                                             // 13
};                                                                                     // 14
                                                                                       // 15
module.exports = function (dest/*, …src*/) {                                           // 16
	forEach.call(arguments, value);                                                       // 17
	slice.call(arguments, 1).forEach(extend, dest);                                       // 18
	return dest;                                                                          // 19
};                                                                                     // 20
                                                                                       // 21
/////////////////////////////////////////////////////////////////////////////////////////

}],"map.js":["./valid-callable","./for-each",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var callable = require('./valid-callable')                                             // 3
  , forEach  = require('./for-each')                                                   // 4
                                                                                       // 5
  , call = Function.prototype.call;                                                    // 6
                                                                                       // 7
module.exports = function (obj, cb/*, thisArg*/) {                                     // 8
	var o = {}, thisArg = arguments[2];                                                   // 9
	callable(cb);                                                                         // 10
	forEach(obj, function (value, key, obj, index) {                                      // 11
		o[key] = call.call(cb, thisArg, value, key, obj, index);                             // 12
	});                                                                                   // 13
	return o;                                                                             // 14
};                                                                                     // 15
                                                                                       // 16
/////////////////////////////////////////////////////////////////////////////////////////

}],"reduce.js":["./is-callable","./valid-callable","./valid-value",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var isCallable = require('./is-callable')                                              // 3
  , callable   = require('./valid-callable')                                           // 4
  , value      = require('./valid-value')                                              // 5
                                                                                       // 6
  , call = Function.prototype.call, keys = Object.keys;                                // 7
                                                                                       // 8
module.exports = exports = function self(obj, cb/*, initial, compareFn*/) {            // 9
	var list, fn, initial, compareFn, initialized;                                        // 10
	value(obj) && callable(cb);                                                           // 11
                                                                                       // 12
	obj = Object(obj);                                                                    // 13
	initial = arguments[2];                                                               // 14
	compareFn = arguments[3];                                                             // 15
                                                                                       // 16
	list = keys(obj);                                                                     // 17
	if (compareFn) {                                                                      // 18
		list.sort(isCallable(compareFn) ? compareFn.bind(obj) : undefined);                  // 19
	}                                                                                     // 20
                                                                                       // 21
	fn = function (value, key, index) {                                                   // 22
		if (initialized) {                                                                   // 23
			return call.call(cb, undefined, value, obj[key], key, obj, index);                  // 24
		} else {                                                                             // 25
			initialized = true;                                                                 // 26
			return call.call(cb, undefined, obj[value], obj[key], key, obj, index,              // 27
				value);                                                                            // 28
		}                                                                                    // 29
	};                                                                                    // 30
                                                                                       // 31
	if ((arguments.length < 3) || (initial === self.NO_INITIAL)) {                        // 32
		return list.reduce(fn);                                                              // 33
	} else {                                                                              // 34
		initialized = true;                                                                  // 35
		return list.reduce(fn, initial);                                                     // 36
	}                                                                                     // 37
};                                                                                     // 38
exports.NO_INITIAL = {};                                                               // 39
                                                                                       // 40
/////////////////////////////////////////////////////////////////////////////////////////

}],"is.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Implementation credits go to:                                                       // 1
// http://wiki.ecmascript.org/doku.php?id=harmony:egal                                 // 2
                                                                                       // 3
'use strict';                                                                          // 4
                                                                                       // 5
module.exports = function (x, y) {                                                     // 6
	return (x === y) ?                                                                    // 7
			((x !== 0) || ((1 / x) === (1 / y))) :                                              // 8
			((x !== x) && (y !== y)); //jslint: skip                                            // 9
};                                                                                     // 10
                                                                                       // 11
/////////////////////////////////////////////////////////////////////////////////////////

},"is-empty.js":["./valid-value",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Object/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var value = require('./valid-value');                                                  // 3
                                                                                       // 4
module.exports = function (obj) {                                                      // 5
	var i;                                                                                // 6
	value(obj);                                                                           // 7
	for (i in obj) { //jslint: skip                                                       // 8
		if (obj.propertyIsEnumerable(i)) return false;                                       // 9
	}                                                                                     // 10
	return true;                                                                          // 11
};                                                                                     // 12
                                                                                       // 13
/////////////////////////////////////////////////////////////////////////////////////////

}]},"String":{"is-string.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/String/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var toString = Object.prototype.toString                                               // 3
                                                                                       // 4
  , id = toString.call('');                                                            // 5
                                                                                       // 6
module.exports = function (x) {                                                        // 7
	return (typeof x === 'string') || (x && (typeof x === 'object') &&                    // 8
		((x instanceof String) || (toString.call(x) === id))) || false;                      // 9
};                                                                                     // 10
                                                                                       // 11
/////////////////////////////////////////////////////////////////////////////////////////

},"prototype":{"contains.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/String/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var indexOf = String.prototype.indexOf;                                                // 3
                                                                                       // 4
module.exports = function (searchString/*, position*/) {                               // 5
	return indexOf.call(this, searchString, arguments[1]) > -1;                           // 6
};                                                                                     // 7
                                                                                       // 8
/////////////////////////////////////////////////////////////////////////////////////////

},"repeat.js":["../../Object/valid-value","../../Number/to-uint",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/String/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Not rocket science but taken from:                                                  // 1
// http://closure-library.googlecode.com/svn/trunk/closure/goog/string/string.js       // 2
                                                                                       // 3
'use strict';                                                                          // 4
                                                                                       // 5
var value  = require('../../Object/valid-value')                                       // 6
  , toUint = require('../../Number/to-uint');                                          // 7
                                                                                       // 8
module.exports = function (n) {                                                        // 9
	return new Array((isNaN(n) ? 1 : toUint(n)) + 1).join(String(value(this)));           // 10
};                                                                                     // 11
                                                                                       // 12
/////////////////////////////////////////////////////////////////////////////////////////

}]}},"Number":{"to-uint.js":["./to-int",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Number/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var toInt = require('./to-int')                                                        // 3
                                                                                       // 4
  , max = Math.max;                                                                    // 5
                                                                                       // 6
module.exports = function (value) { return max(0, toInt(value)); };                    // 7
                                                                                       // 8
/////////////////////////////////////////////////////////////////////////////////////////

}],"to-int.js":["../Math/sign",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Number/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var sign = require('../Math/sign')                                                     // 3
                                                                                       // 4
  , abs = Math.abs, floor = Math.floor;                                                // 5
                                                                                       // 6
module.exports = function (value) {                                                    // 7
	if (isNaN(value)) {                                                                   // 8
		return 0;                                                                            // 9
	}                                                                                     // 10
	value = Number(value);                                                                // 11
	if ((value === 0) || !isFinite(value)) {                                              // 12
		return value;                                                                        // 13
	}                                                                                     // 14
                                                                                       // 15
	return sign(value) * floor(abs(value));                                               // 16
};                                                                                     // 17
                                                                                       // 18
/////////////////////////////////////////////////////////////////////////////////////////

}],"is-nan.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Number/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
module.exports = function (value) {                                                    // 3
	return (value !== value); //jslint: skip                                              // 4
};                                                                                     // 5
                                                                                       // 6
/////////////////////////////////////////////////////////////////////////////////////////

},"is-number.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Number/ //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var toString = Object.prototype.toString                                               // 3
                                                                                       // 4
  , id = toString.call(1);                                                             // 5
                                                                                       // 6
module.exports = function (x) {                                                        // 7
	return ((typeof x === 'number') ||                                                    // 8
		((x instanceof Number) ||                                                            // 9
			((typeof x === 'object') && (toString.call(x) === id))));                           // 10
};                                                                                     // 11
                                                                                       // 12
/////////////////////////////////////////////////////////////////////////////////////////

}},"Math":{"sign.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Math/si //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
module.exports = function (value) {                                                    // 3
	value = Number(value);                                                                // 4
	if (isNaN(value) || (value === 0)) {                                                  // 5
		return value;                                                                        // 6
	}                                                                                     // 7
	return (value > 0) ? 1 : -1;                                                          // 8
};                                                                                     // 9
                                                                                       // 10
/////////////////////////////////////////////////////////////////////////////////////////

}},"Error":{"custom.js":["../Object/descriptor","../Object/extend",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Error/c //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var d      = require('../Object/descriptor')                                           // 3
  , extend = require('../Object/extend')                                               // 4
                                                                                       // 5
  , captureStackTrace = Error.captureStackTrace                                        // 6
  , CustomError;                                                                       // 7
                                                                                       // 8
CustomError = module.exports = function CustomError(message, code/*, ext*/) {          // 9
	var ext = arguments[2];                                                               // 10
	if (ext != null) extend(this, ext);                                                   // 11
	this.message = String(message);                                                       // 12
	if (code != null) this.code = String(code);                                           // 13
	if (captureStackTrace) captureStackTrace(this, CustomError);                          // 14
};                                                                                     // 15
                                                                                       // 16
CustomError.prototype = Object.create(Error.prototype, {                               // 17
	constructor: d(CustomError),                                                          // 18
	name: d('CustomError')                                                                // 19
});                                                                                    // 20
                                                                                       // 21
/////////////////////////////////////////////////////////////////////////////////////////

}]},"Array":{"prototype":{"e-index-of.js":["../../Number/is-nan","../../Object/is","../../Object/valid-value",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Array/p //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var numIsNaN = require('../../Number/is-nan')                                          // 3
  , ois      = require('../../Object/is')                                              // 4
  , value    = require('../../Object/valid-value')                                     // 5
                                                                                       // 6
  , indexOf = Array.prototype.indexOf;                                                 // 7
                                                                                       // 8
module.exports = function (searchElement/*, fromIndex*/) {                             // 9
	var i;                                                                                // 10
	if (!numIsNaN(searchElement) && (searchElement !== 0)) {                              // 11
		return indexOf.apply(this, arguments);                                               // 12
	}                                                                                     // 13
                                                                                       // 14
	for (i = (arguments[1] >>> 0); i < (value(this).length >>> 0); ++i) {                 // 15
		if (this.hasOwnProperty(i) && ois(searchElement, this[i])) {                         // 16
			return i;                                                                           // 17
		}                                                                                    // 18
	}                                                                                     // 19
	return -1;                                                                            // 20
};                                                                                     // 21
                                                                                       // 22
/////////////////////////////////////////////////////////////////////////////////////////

}],"last.js":["./last-index",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Array/p //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var lastIndex = require('./last-index');                                               // 3
                                                                                       // 4
module.exports = function () {                                                         // 5
	var i;                                                                                // 6
	if ((i = lastIndex.call(this)) !== null) {                                            // 7
		return this[i];                                                                      // 8
	}                                                                                     // 9
	return undefined;                                                                     // 10
};                                                                                     // 11
                                                                                       // 12
/////////////////////////////////////////////////////////////////////////////////////////

}],"last-index.js":["../../Object/valid-value",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Array/p //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var value = require('../../Object/valid-value');                                       // 3
                                                                                       // 4
module.exports = function () {                                                         // 5
	var i, l;                                                                             // 6
	if (!(l = (value(this).length >>> 0))) {                                              // 7
		return null;                                                                         // 8
	}                                                                                     // 9
	i = l - 1;                                                                            // 10
	while (!this.hasOwnProperty(i)) {                                                     // 11
		if (--i === -1) {                                                                    // 12
			return null;                                                                        // 13
		}                                                                                    // 14
	}                                                                                     // 15
	return i;                                                                             // 16
};                                                                                     // 17
                                                                                       // 18
/////////////////////////////////////////////////////////////////////////////////////////

}]},"from.js":["../Function/is-arguments",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Array/f //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var isArguments   = require('../Function/is-arguments')                                // 3
                                                                                       // 4
  , isArray = Array.isArray, slice = Array.prototype.slice;                            // 5
                                                                                       // 6
module.exports = function (obj) {                                                      // 7
	if (isArray(obj)) {                                                                   // 8
		return obj;                                                                          // 9
	} else if (isArguments(obj)) {                                                        // 10
		return (obj.length === 1) ? [obj[0]] : Array.apply(null, obj);                       // 11
	} else {                                                                              // 12
		return slice.call(obj);                                                              // 13
	}                                                                                     // 14
};                                                                                     // 15
                                                                                       // 16
/////////////////////////////////////////////////////////////////////////////////////////

}]},"Function":{"is-arguments.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/Functio //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var toString = Object.prototype.toString                                               // 3
                                                                                       // 4
  , id = toString.call((function () { return arguments; }()));                         // 5
                                                                                       // 6
module.exports = function (x) {                                                        // 7
	return toString.call(x) === id;                                                       // 8
};                                                                                     // 9
                                                                                       // 10
/////////////////////////////////////////////////////////////////////////////////////////

}},"global.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/es5-ext/lib/global. //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
module.exports = new Function("return this")();                                        // 3
                                                                                       // 4
/////////////////////////////////////////////////////////////////////////////////////////

}}},"memoizee":{"package.json":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// ../../.1.1.17.6xtim6++os+web.browser+web.cordova/npm/node_modules/cli-color/node_mo //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
exports.name = "memoizee";                                                             // 1
exports.version = "0.2.5";                                                             // 2
exports.main = "lib";                                                                  // 3
                                                                                       // 4
/////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"index.js":["./regular","./primitive","./ext/dispose","./ext/resolvers","./ext/async","./ext/ref-counter","./ext/method","./ext/max-age","./ext/max",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/index. //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Provides memoize with all options                                                   // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var regular   = require('./regular')                                                   // 5
  , primitive = require('./primitive')                                                 // 6
                                                                                       // 7
  , call = Function.prototype.call;                                                    // 8
                                                                                       // 9
// Order is significant!                                                               // 10
require('./ext/dispose');                                                              // 11
require('./ext/resolvers');                                                            // 12
require('./ext/async');                                                                // 13
require('./ext/ref-counter');                                                          // 14
require('./ext/method');                                                               // 15
require('./ext/max-age');                                                              // 16
require('./ext/max');                                                                  // 17
                                                                                       // 18
module.exports = function (fn/* options */) {                                          // 19
	var options = Object(arguments[1]);                                                   // 20
	return call.call(options.primitive ? primitive : regular, this, fn, options);         // 21
};                                                                                     // 22
                                                                                       // 23
/////////////////////////////////////////////////////////////////////////////////////////

}],"regular.js":["es5-ext/lib/Error/custom","es5-ext/lib/Array/prototype/e-index-of","event-emitter/lib/has-listeners","./_base",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/regula //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Memoize working in object mode (supports any type of arguments)                     // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var CustomError  = require('es5-ext/lib/Error/custom')                                 // 5
  , indexOf      = require('es5-ext/lib/Array/prototype/e-index-of')                   // 6
  , hasListeners = require('event-emitter/lib/has-listeners')                          // 7
                                                                                       // 8
  , apply = Function.prototype.apply;                                                  // 9
                                                                                       // 10
// Results are saved internally within array matrix:                                   // 11
// [0] -> Result of calling function with no arguments                                 // 12
// [1] -> Matrix that keeps results when function is called with one argument          // 13
//        [1][0] -> Array of arguments with which                                      // 14
//                 function have been called                                           // 15
//        [1][1] -> Array of results that matches [1][0] array                         // 16
// [2] -> Matrix that keeps results when function is called with two arguments         // 17
//        [2][0] -> Array of first (of two) arguments with which                       // 18
//                function have been called                                            // 19
//        [2][1] -> Matrixes that keeps results for two arguments function calls       // 20
//                  Each matrix matches first argument found in [2][0]                 // 21
//                  [2][1][x][0] -> Array of second arguments with which               // 22
//                                  function have been called.                         // 23
//                  [2][1][x][1] -> Array of results that matches [2][1][x][0]         // 24
//                                   arguments array                                   // 25
// ...and so on                                                                        // 26
module.exports = require('./_base')(function (conf, length) {                          // 27
	var map, map1, map2, get, set, clear, count, fn                                       // 28
	  , hitListeners, initListeners, purgeListeners                                       // 29
	  , cache = conf.cache = {}, argsCache;                                               // 30
                                                                                       // 31
	if (length === 0) {                                                                   // 32
		map = null;                                                                          // 33
		get = conf.get = function () { return map; };                                        // 34
		set = function () { return ((map = 1)); };                                           // 35
		clear = function () { map = null; };                                                 // 36
		conf.clearAll = function () {                                                        // 37
			map = null;                                                                         // 38
			cache = conf.cache = {};                                                            // 39
		};                                                                                   // 40
	} else {                                                                              // 41
		count = 0;                                                                           // 42
		if (length === 1) {                                                                  // 43
			map1 = [];                                                                          // 44
			map2 = [];                                                                          // 45
			get = conf.get = function (args) {                                                  // 46
				var index = indexOf.call(map1, args[0]);                                           // 47
				return (index === -1) ? null : map2[index];                                        // 48
			};                                                                                  // 49
			set = function (args) {                                                             // 50
				map1.push(args[0]);                                                                // 51
				map2.push(++count);                                                                // 52
				return count;                                                                      // 53
			};                                                                                  // 54
			clear = function (id) {                                                             // 55
				var index = indexOf.call(map2, id);                                                // 56
				if (index !== -1) {                                                                // 57
					map1.splice(index, 1);                                                            // 58
					map2.splice(index, 1);                                                            // 59
				}                                                                                  // 60
			};                                                                                  // 61
			conf.clearAll = function () {                                                       // 62
				map1 = [];                                                                         // 63
				map2 = [];                                                                         // 64
				cache = conf.cache = {};                                                           // 65
			};                                                                                  // 66
		} else if (length === false) {                                                       // 67
			map = [];                                                                           // 68
			argsCache = {};                                                                     // 69
			get = conf.get = function (args) {                                                  // 70
				var index = 0, set = map, i, length = args.length;                                 // 71
				if (length === 0) {                                                                // 72
					return set[length] || null;                                                       // 73
				} else if ((set = set[length])) {                                                  // 74
					while (index < (length - 1)) {                                                    // 75
						i = indexOf.call(set[0], args[index]);                                           // 76
						if (i === -1) return null;                                                       // 77
						set = set[1][i];                                                                 // 78
						++index;                                                                         // 79
					}                                                                                 // 80
					i = indexOf.call(set[0], args[index]);                                            // 81
					if (i === -1) return null;                                                        // 82
					return set[1][i] || null;                                                         // 83
				}                                                                                  // 84
				return null;                                                                       // 85
			};                                                                                  // 86
			set = function (args) {                                                             // 87
				var index = 0, set = map, i, length = args.length;                                 // 88
				if (length === 0) {                                                                // 89
					set[length] = ++count;                                                            // 90
				} else {                                                                           // 91
					if (!set[length]) {                                                               // 92
						set[length] = [[], []];                                                          // 93
					}                                                                                 // 94
					set = set[length];                                                                // 95
					while (index < (length - 1)) {                                                    // 96
						i = indexOf.call(set[0], args[index]);                                           // 97
						if (i === -1) {                                                                  // 98
							i = set[0].push(args[index]) - 1;                                               // 99
							set[1].push([[], []]);                                                          // 100
						}                                                                                // 101
						set = set[1][i];                                                                 // 102
						++index;                                                                         // 103
					}                                                                                 // 104
					i = indexOf.call(set[0], args[index]);                                            // 105
					if (i === -1) {                                                                   // 106
						i = set[0].push(args[index]) - 1;                                                // 107
					}                                                                                 // 108
					set[1][i] = ++count;                                                              // 109
				}                                                                                  // 110
				argsCache[count] = args;                                                           // 111
				return count;                                                                      // 112
			};                                                                                  // 113
			clear = function (id) {                                                             // 114
				var index = 0, set = map, i, args = argsCache[id], length = args.length            // 115
				  , path = [];                                                                     // 116
				if (length === 0) {                                                                // 117
					delete set[length];                                                               // 118
				} else if ((set = set[length])) {                                                  // 119
					while (index < (length - 1)) {                                                    // 120
						i = indexOf.call(set[0], args[index]);                                           // 121
						if (i === -1) {                                                                  // 122
							return;                                                                         // 123
						}                                                                                // 124
						path.push(set, i);                                                               // 125
						set = set[1][i];                                                                 // 126
						++index;                                                                         // 127
					}                                                                                 // 128
					i = indexOf.call(set[0], args[index]);                                            // 129
					if (i === -1) {                                                                   // 130
						return;                                                                          // 131
					}                                                                                 // 132
					id = set[1][i];                                                                   // 133
					set[0].splice(i, 1);                                                              // 134
					set[1].splice(i, 1);                                                              // 135
					while (!set[0].length && path.length) {                                           // 136
						i = path.pop();                                                                  // 137
						set = path.pop();                                                                // 138
						set[0].splice(i, 1);                                                             // 139
						set[1].splice(i, 1);                                                             // 140
					}                                                                                 // 141
				}                                                                                  // 142
				delete argsCache[id];                                                              // 143
			};                                                                                  // 144
			conf.clearAll = function () {                                                       // 145
				map = [];                                                                          // 146
				cache = conf.cache = {};                                                           // 147
				argsCache = {};                                                                    // 148
			};                                                                                  // 149
		} else {                                                                             // 150
			map = [[], []];                                                                     // 151
			argsCache = {};                                                                     // 152
			get = conf.get = function (args) {                                                  // 153
				var index = 0, set = map, i;                                                       // 154
				while (index < (length - 1)) {                                                     // 155
					i = indexOf.call(set[0], args[index]);                                            // 156
					if (i === -1) return null;                                                        // 157
					set = set[1][i];                                                                  // 158
					++index;                                                                          // 159
				}                                                                                  // 160
				i = indexOf.call(set[0], args[index]);                                             // 161
				if (i === -1) return null;                                                         // 162
				return set[1][i] || null;                                                          // 163
			};                                                                                  // 164
			set = function (args) {                                                             // 165
				var index = 0, set = map, i;                                                       // 166
				while (index < (length - 1)) {                                                     // 167
					i = indexOf.call(set[0], args[index]);                                            // 168
					if (i === -1) {                                                                   // 169
						i = set[0].push(args[index]) - 1;                                                // 170
						set[1].push([[], []]);                                                           // 171
					}                                                                                 // 172
					set = set[1][i];                                                                  // 173
					++index;                                                                          // 174
				}                                                                                  // 175
				i = indexOf.call(set[0], args[index]);                                             // 176
				if (i === -1) {                                                                    // 177
					i = set[0].push(args[index]) - 1;                                                 // 178
				}                                                                                  // 179
				set[1][i] = ++count;                                                               // 180
				argsCache[count] = args;                                                           // 181
				return count;                                                                      // 182
			};                                                                                  // 183
			clear = function (id) {                                                             // 184
				var index = 0, set = map, i, path = [], args = argsCache[id];                      // 185
				while (index < (length - 1)) {                                                     // 186
					i = indexOf.call(set[0], args[index]);                                            // 187
					if (i === -1) {                                                                   // 188
						return;                                                                          // 189
					}                                                                                 // 190
					path.push(set, i);                                                                // 191
					set = set[1][i];                                                                  // 192
					++index;                                                                          // 193
				}                                                                                  // 194
				i = indexOf.call(set[0], args[index]);                                             // 195
				if (i === -1) {                                                                    // 196
					return;                                                                           // 197
				}                                                                                  // 198
				id = set[1][i];                                                                    // 199
				set[0].splice(i, 1);                                                               // 200
				set[1].splice(i, 1);                                                               // 201
				while (!set[0].length && path.length) {                                            // 202
					i = path.pop();                                                                   // 203
					set = path.pop();                                                                 // 204
					set[0].splice(i, 1);                                                              // 205
					set[1].splice(i, 1);                                                              // 206
				}                                                                                  // 207
				delete argsCache[id];                                                              // 208
			};                                                                                  // 209
			conf.clearAll = function () {                                                       // 210
				map = [[], []];                                                                    // 211
				cache = conf.cache = {};                                                           // 212
				argsCache = {};                                                                    // 213
			};                                                                                  // 214
		}                                                                                    // 215
	}                                                                                     // 216
	conf.memoized = function () {                                                         // 217
		var id = get(arguments), value;                                                      // 218
		if (id != null) {                                                                    // 219
			hitListeners && conf.emit('hit', id, arguments, this);                              // 220
			return cache[id];                                                                   // 221
		} else {                                                                             // 222
			value = apply.call(fn, this, arguments);                                            // 223
			id = get(arguments);                                                                // 224
			if (id != null) {                                                                   // 225
				throw new CustomError("Circular invocation", 'CIRCULAR_INVOCATION');               // 226
			}                                                                                   // 227
			id = set(arguments);                                                                // 228
			cache[id] = value;                                                                  // 229
			initListeners && conf.emit('init', id);                                             // 230
			return value;                                                                       // 231
		}                                                                                    // 232
	};                                                                                    // 233
	conf.clear = function (id) {                                                          // 234
		if (cache.hasOwnProperty(id)) {                                                      // 235
			purgeListeners && conf.emit('purge', id);                                           // 236
			clear(id);                                                                          // 237
			delete cache[id];                                                                   // 238
		}                                                                                    // 239
	};                                                                                    // 240
                                                                                       // 241
	conf.once('ready', function () {                                                      // 242
		fn = conf.fn;                                                                        // 243
		hitListeners = hasListeners(conf, 'hit');                                            // 244
		initListeners = hasListeners(conf, 'init');                                          // 245
		purgeListeners = hasListeners(conf, 'purge');                                        // 246
	});                                                                                   // 247
});                                                                                    // 248
                                                                                       // 249
/////////////////////////////////////////////////////////////////////////////////////////

}],"_base.js":["es5-ext/lib/Object/valid-callable","es5-ext/lib/Object/for-each","event-emitter/lib/core",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/_base. //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// To be used internally, memoize factory                                              // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var callable = require('es5-ext/lib/Object/valid-callable')                            // 5
  , forEach  = require('es5-ext/lib/Object/for-each')                                  // 6
  , ee       = require('event-emitter/lib/core')                                       // 7
                                                                                       // 8
  , ext;                                                                               // 9
                                                                                       // 10
module.exports = exports = function (core) {                                           // 11
	return function self(fn/*, options */) {                                              // 12
		var options, length, get, clear, conf;                                               // 13
                                                                                       // 14
		callable(fn);                                                                        // 15
		if (fn.memoized) {                                                                   // 16
			// Do not memoize already memoized function                                         // 17
			return fn;                                                                          // 18
		}                                                                                    // 19
                                                                                       // 20
		options = Object(arguments[1]);                                                      // 21
		conf = ee({ memoize: self, fn: fn });                                                // 22
                                                                                       // 23
		// Normalize length                                                                  // 24
		if (isNaN(options.length)) {                                                         // 25
			length = fn.length;                                                                 // 26
			// Special case                                                                     // 27
			if (options.async && ext.async) {                                                   // 28
				--length;                                                                          // 29
			}                                                                                   // 30
		} else {                                                                             // 31
			length = (options.length === false) ? false : (options.length >>> 0);               // 32
		}                                                                                    // 33
                                                                                       // 34
		core(conf, length);                                                                  // 35
                                                                                       // 36
		forEach(ext, function (fn, name) {                                                   // 37
			if (fn.force) {                                                                     // 38
				fn(conf, options);                                                                 // 39
			} else if (options[name]) {                                                         // 40
				fn(options[name], conf, options);                                                  // 41
			}                                                                                   // 42
		});                                                                                  // 43
                                                                                       // 44
		fn = conf.fn;                                                                        // 45
		get = conf.get;                                                                      // 46
		clear = conf.clear;                                                                  // 47
                                                                                       // 48
		conf.memoized.clear = function () { clear(get(arguments)); };                        // 49
		conf.memoized.clearAll = function () {                                               // 50
			conf.emit('purgeall');                                                              // 51
			conf.clearAll();                                                                    // 52
		};                                                                                   // 53
		conf.memoized.memoized = true;                                                       // 54
		conf.emit('ready');                                                                  // 55
		return conf.memoized;                                                                // 56
	};                                                                                    // 57
};                                                                                     // 58
ext = exports.ext = {};                                                                // 59
                                                                                       // 60
/////////////////////////////////////////////////////////////////////////////////////////

}],"primitive.js":["es5-ext/lib/Error/custom","event-emitter/lib/has-listeners","./_base",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/primit //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Memoize working in primitive mode                                                   // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var CustomError  = require('es5-ext/lib/Error/custom')                                 // 5
  , hasListeners = require('event-emitter/lib/has-listeners')                          // 6
                                                                                       // 7
  , getId0 = function () { return ''; }                                                // 8
  , getId1 = function (args) { return args[0]; }                                       // 9
                                                                                       // 10
  , apply = Function.prototype.apply, call = Function.prototype.call;                  // 11
                                                                                       // 12
module.exports = require('./_base')(function (conf, length) {                          // 13
	var get, cache = conf.cache = {}, fn                                                  // 14
	  , hitListeners, initListeners, purgeListeners;                                      // 15
                                                                                       // 16
	if (length === 1) {                                                                   // 17
		get = conf.get = getId1;                                                             // 18
	} else if (length === false) {                                                        // 19
		get = conf.get = function (args) {                                                   // 20
			var id = '', i, length = args.length;                                               // 21
			if (length) {                                                                       // 22
				id += args[i = 0];                                                                 // 23
				while (--length) {                                                                 // 24
					id += '\u0001' + args[++i];                                                       // 25
				}                                                                                  // 26
			} else {                                                                            // 27
				id = '\u0002';                                                                     // 28
			}                                                                                   // 29
			return id;                                                                          // 30
		};                                                                                   // 31
	} else if (length) {                                                                  // 32
		get = conf.get = function (args) {                                                   // 33
			var id = String(args[0]), i = 0, l = length;                                        // 34
			while (--l) { id += '\u0001' + args[++i]; }                                         // 35
			return id;                                                                          // 36
		};                                                                                   // 37
	} else {                                                                              // 38
		get = conf.get = getId0;                                                             // 39
	}                                                                                     // 40
                                                                                       // 41
	conf.memoized = (length === 1) ? function (id) {                                      // 42
		var value;                                                                           // 43
		if (cache.hasOwnProperty(id)) {                                                      // 44
			hitListeners && conf.emit('hit', id, arguments, this);                              // 45
			return cache[id];                                                                   // 46
		} else {                                                                             // 47
			if (arguments.length === 1) {                                                       // 48
				value = call.call(fn, this, id);                                                   // 49
			} else {                                                                            // 50
				value = apply.call(fn, this, arguments);                                           // 51
			}                                                                                   // 52
			if (cache.hasOwnProperty(id)) {                                                     // 53
				throw new CustomError("Circular invocation", 'CIRCULAR_INVOCATION');               // 54
			}                                                                                   // 55
			cache[id] = value;                                                                  // 56
			initListeners && conf.emit('init', id);                                             // 57
			return value;                                                                       // 58
		}                                                                                    // 59
	} : function () {                                                                     // 60
		var id = get(arguments), value;                                                      // 61
		if (cache.hasOwnProperty(id)) {                                                      // 62
			hitListeners && conf.emit('hit', id, arguments, this);                              // 63
			return cache[id];                                                                   // 64
		} else {                                                                             // 65
			value = apply.call(conf.fn, this, arguments);                                       // 66
			if (cache.hasOwnProperty(id)) {                                                     // 67
				throw new CustomError("Circular invocation", 'CIRCULAR_INVOCATION');               // 68
			}                                                                                   // 69
			cache[id] = value;                                                                  // 70
			initListeners && conf.emit('init', id);                                             // 71
			return value;                                                                       // 72
		}                                                                                    // 73
	};                                                                                    // 74
                                                                                       // 75
	conf.clear = function (id) {                                                          // 76
		if (cache.hasOwnProperty(id)) {                                                      // 77
			purgeListeners && conf.emit('purge', id);                                           // 78
			delete cache[id];                                                                   // 79
		}                                                                                    // 80
	};                                                                                    // 81
	conf.clearAll = function () { cache = conf.cache = {}; };                             // 82
                                                                                       // 83
	conf.once('ready', function () {                                                      // 84
		fn = conf.fn;                                                                        // 85
		hitListeners = hasListeners(conf, 'hit');                                            // 86
		initListeners = hasListeners(conf, 'init');                                          // 87
		purgeListeners = hasListeners(conf, 'purge');                                        // 88
	});                                                                                   // 89
});                                                                                    // 90
                                                                                       // 91
/////////////////////////////////////////////////////////////////////////////////////////

}],"ext":{"dispose.js":["es5-ext/lib/Object/valid-callable","es5-ext/lib/Object/for-each","../_base",function(require){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/ext/di //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Call dispose callback on each cache purge                                           // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var callable = require('es5-ext/lib/Object/valid-callable')                            // 5
  , forEach  = require('es5-ext/lib/Object/for-each')                                  // 6
  , ext      = require('../_base').ext                                                 // 7
                                                                                       // 8
  , slice = Array.prototype.slice;                                                     // 9
                                                                                       // 10
ext.dispose = function (dispose, conf, options) {                                      // 11
	var clear, async;                                                                     // 12
                                                                                       // 13
	callable(dispose);                                                                    // 14
                                                                                       // 15
	async = (options.async && ext.async);                                                 // 16
	conf.on('purge' + (async ? 'async' : ''), clear =  async ? function (id) {            // 17
		var value = conf.async[id];                                                          // 18
		delete conf.cache[id];                                                               // 19
		dispose.apply(conf.memoized['_memoize:context_'], slice.call(value, 1));             // 20
	} : function (id) {                                                                   // 21
		var value = conf.cache[id];                                                          // 22
		delete conf.cache[id];                                                               // 23
		dispose.call(conf.memoized['_memoize:context_'], value);                             // 24
	});                                                                                   // 25
                                                                                       // 26
	if (!async) {                                                                         // 27
		conf.on('purgeall', function () {                                                    // 28
			forEach(conf.cache, function (value, id) { clear(id); });                           // 29
		});                                                                                  // 30
	}                                                                                     // 31
};                                                                                     // 32
                                                                                       // 33
/////////////////////////////////////////////////////////////////////////////////////////

}],"resolvers.js":["es5-ext/lib/Array/from","es5-ext/lib/Object/for-each","es5-ext/lib/Object/valid-callable","../_base",function(require){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/ext/re //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Normalize arguments before passing them to underlying function                      // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var toArray    = require('es5-ext/lib/Array/from')                                     // 5
  , forEach    = require('es5-ext/lib/Object/for-each')                                // 6
  , callable   = require('es5-ext/lib/Object/valid-callable')                          // 7
                                                                                       // 8
  , slice = Array.prototype.slice                                                      // 9
                                                                                       // 10
  , resolve;                                                                           // 11
                                                                                       // 12
resolve = function (args) {                                                            // 13
	return this.map(function (r, i) {                                                     // 14
		return r ? r(args[i]) : args[i];                                                     // 15
	}).concat(slice.call(args, this.length));                                             // 16
};                                                                                     // 17
                                                                                       // 18
require('../_base').ext.resolvers = function (resolvers, conf) {                       // 19
	var resolver;                                                                         // 20
                                                                                       // 21
	resolver = toArray(resolvers);                                                        // 22
	resolver.forEach(function (r) { (r == null) || callable(r); });                       // 23
	resolver = resolve.bind(resolver);                                                    // 24
                                                                                       // 25
	(function (fn) {                                                                      // 26
		conf.memoized = function () {                                                        // 27
			var value;                                                                          // 28
			conf.memoized.args = arguments;                                                     // 29
			value = fn.apply(this, resolver(arguments));                                        // 30
			delete conf.memoized.args;                                                          // 31
			return value;                                                                       // 32
		};                                                                                   // 33
		forEach(fn, function (value, name) {                                                 // 34
			conf.memoized[name] = function () {                                                 // 35
				return fn[name].apply(this, resolver(arguments));                                  // 36
			};                                                                                  // 37
		});                                                                                  // 38
	}(conf.memoized));                                                                    // 39
};                                                                                     // 40
                                                                                       // 41
/////////////////////////////////////////////////////////////////////////////////////////

}],"async.js":["es5-ext/lib/Array/from","es5-ext/lib/Array/prototype/last","es5-ext/lib/Object/for-each","es5-ext/lib/Object/is-callable","next-tick","../_base",function(require){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/ext/as //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Support for asynchronous functions                                                  // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var toArray    = require('es5-ext/lib/Array/from')                                     // 5
  , last       = require('es5-ext/lib/Array/prototype/last')                           // 6
  , forEach    = require('es5-ext/lib/Object/for-each')                                // 7
  , isCallable = require('es5-ext/lib/Object/is-callable')                             // 8
  , nextTick   = require('next-tick')                                                  // 9
                                                                                       // 10
  , isArray = Array.isArray, slice = Array.prototype.slice                             // 11
  , apply = Function.prototype.apply;                                                  // 12
                                                                                       // 13
require('../_base').ext.async = function (ignore, conf) {                              // 14
	var cache, purge;                                                                     // 15
                                                                                       // 16
	cache = conf.async = {};                                                              // 17
                                                                                       // 18
	(function (org) {                                                                     // 19
		var value, cb, initContext, initArgs, fn, resolver;                                  // 20
                                                                                       // 21
		conf.on('init', function (id) {                                                      // 22
			value.id = id;                                                                      // 23
			cache[id] = cb ? [cb] : [];                                                         // 24
		});                                                                                  // 25
                                                                                       // 26
		conf.on('hit', function (id, syncArgs, syncCtx) {                                    // 27
			if (!cb) {                                                                          // 28
				return;                                                                            // 29
			}                                                                                   // 30
                                                                                       // 31
			if (isArray(cache[id])) {                                                           // 32
				cache[id].push(cb);                                                                // 33
			} else {                                                                            // 34
				nextTick(function (cb, id, ctx, args) {                                            // 35
					if (cache[id]) {                                                                  // 36
						conf.emit('hitasync', id, syncArgs, syncCtx);                                    // 37
						apply.call(cb, this.context, this);                                              // 38
					} else {                                                                          // 39
						// Purged in a meantime, we shouldn't rely on cached value, recall               // 40
						fn.apply(ctx, args);                                                             // 41
					}                                                                                 // 42
				}.bind(cache[id], cb, id, initContext, initArgs));                                 // 43
				initContext = initArgs = null;                                                     // 44
			}                                                                                   // 45
		});                                                                                  // 46
		conf.fn = function () {                                                              // 47
			var args, asyncArgs;                                                                // 48
			args = arguments;                                                                   // 49
			asyncArgs = toArray(args);                                                          // 50
			asyncArgs.push(value = function self(err) {                                         // 51
				var i, cb, waiting, res;                                                           // 52
				if (self.id == null) {                                                             // 53
					// Shouldn't happen, means async callback was called sync way                     // 54
					nextTick(apply.bind(self, this, arguments));                                      // 55
					return;                                                                           // 56
				}                                                                                  // 57
				waiting = cache[self.id];                                                          // 58
				if (conf.cache.hasOwnProperty(self.id)) {                                          // 59
					if (err) {                                                                        // 60
						delete cache[self.id];                                                           // 61
						conf.clear(self.id);                                                             // 62
					} else {                                                                          // 63
						arguments.context = this;                                                        // 64
						cache[self.id] = arguments;                                                      // 65
						conf.emit('initasync', self.id, waiting.length);                                 // 66
					}                                                                                 // 67
				} else {                                                                           // 68
					delete cache[self.id];                                                            // 69
				}                                                                                  // 70
				for (i = 0; (cb = waiting[i]); ++i) {                                              // 71
					res = apply.call(cb, this, arguments);                                            // 72
				}                                                                                  // 73
				return res;                                                                        // 74
			});                                                                                 // 75
			return apply.call(org, this, asyncArgs);                                            // 76
		};                                                                                   // 77
                                                                                       // 78
		fn = conf.memoized;                                                                  // 79
		resolver = function (args) {                                                         // 80
			cb = last.call(args);                                                               // 81
			if (isCallable(cb)) {                                                               // 82
				return slice.call(args, 0, -1);                                                    // 83
			} else {                                                                            // 84
				cb = null;                                                                         // 85
				return args;                                                                       // 86
			}                                                                                   // 87
		};                                                                                   // 88
		conf.memoized = function () {                                                        // 89
			return fn.apply(initContext = this, initArgs = resolver(arguments));                // 90
		};                                                                                   // 91
		forEach(fn, function (value, name) {                                                 // 92
			conf.memoized[name] = function () {                                                 // 93
				return fn[name].apply(this, resolver(arguments));                                  // 94
			};                                                                                  // 95
		});                                                                                  // 96
                                                                                       // 97
	}(conf.fn));                                                                          // 98
                                                                                       // 99
	conf.on('purge', purge = function (id) {                                              // 100
		// If false, we don't have value yet, so we assume that intention is not             // 101
		// to memoize this call. After value is obtained we don't cache it but               // 102
		// gracefully pass to callback                                                       // 103
		if (!isArray(cache[id])) {                                                           // 104
			conf.emit('purgeasync', id);                                                        // 105
			delete cache[id];                                                                   // 106
		}                                                                                    // 107
	});                                                                                   // 108
                                                                                       // 109
	conf.on('purgeall', function () {                                                     // 110
		forEach(conf.async, function (value, id) { purge(id); });                            // 111
	});                                                                                   // 112
};                                                                                     // 113
                                                                                       // 114
/////////////////////////////////////////////////////////////////////////////////////////

}],"ref-counter.js":["../_base",function(require){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/ext/re //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Reference counter, useful for garbage collector like functionality                  // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var ext = require('../_base').ext;                                                     // 5
                                                                                       // 6
ext.refCounter = function (ignore, conf, options) {                                    // 7
	var cache, async;                                                                     // 8
                                                                                       // 9
	cache = {};                                                                           // 10
	async = options.async && ext.async;                                                   // 11
                                                                                       // 12
	conf.on('init' + (async ? 'async' : ''), async ? function (id, length) {              // 13
		cache[id] = length;                                                                  // 14
	} : function (id) { cache[id] = 1; });                                                // 15
	conf.on('hit' + (async ? 'async' : ''), function (id) { ++cache[id]; });              // 16
	conf.on('purge' + (async ? 'async' : ''), function (id) {                             // 17
		delete cache[id];                                                                    // 18
	});                                                                                   // 19
	if (!async) {                                                                         // 20
		conf.on('purgeall', function () { cache = {}; });                                    // 21
	}                                                                                     // 22
                                                                                       // 23
	conf.memoized.clearRef = function () {                                                // 24
		var id = conf.get(arguments);                                                        // 25
		if (cache.hasOwnProperty(id)) {                                                      // 26
			if (!--cache[id]) {                                                                 // 27
				conf.clear(id);                                                                    // 28
				return true;                                                                       // 29
			}                                                                                   // 30
			return false;                                                                       // 31
		}                                                                                    // 32
		return null;                                                                         // 33
	};                                                                                    // 34
};                                                                                     // 35
                                                                                       // 36
/////////////////////////////////////////////////////////////////////////////////////////

}],"method.js":["es5-ext/lib/Object/descriptor","es5-ext/lib/global","es5-ext/lib/Object/extend","es5-ext/lib/String/is-string","../_base",function(require){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/ext/me //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Memoized methods factory                                                            // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var d        = require('es5-ext/lib/Object/descriptor')                                // 5
  , global   = require('es5-ext/lib/global')                                           // 6
  , extend   = require('es5-ext/lib/Object/extend')                                    // 7
  , isString = require('es5-ext/lib/String/is-string')                                 // 8
                                                                                       // 9
  , create = Object.create, defineProperty = Object.defineProperty;                    // 10
                                                                                       // 11
require('../_base').ext.method = function (method, conf, options) {                    // 12
	if (isString(options.method)) {                                                       // 13
		method = { name: String(options.method),                                             // 14
			descriptor: { configurable: true, writable: true } };                               // 15
	} else {                                                                              // 16
		method = options.method;                                                             // 17
		method.name = String(method.name);                                                   // 18
		method.descriptor = (method.descriptor == null) ?                                    // 19
				{ configurable: true, writable: true } : Object(method.descriptor);                // 20
	}                                                                                     // 21
	options = create(options);                                                            // 22
	options.method = undefined;                                                           // 23
                                                                                       // 24
	(function (fn) {                                                                      // 25
		conf.memoized = function () {                                                        // 26
			var memoized;                                                                       // 27
			if (this && (this !== global)) {                                                    // 28
				memoized = method.descriptor.value =                                               // 29
					conf.memoize(conf.fn.bind(this), options);                                        // 30
				defineProperty(this, method.name, method.descriptor);                              // 31
				defineProperty(memoized, '_memoize:context_', d(this));                            // 32
				return memoized.apply(this, arguments);                                            // 33
			}                                                                                   // 34
			return fn.apply(this, arguments);                                                   // 35
		};                                                                                   // 36
		extend(conf.memoized, fn);                                                           // 37
	}(conf.memoized));                                                                    // 38
};                                                                                     // 39
                                                                                       // 40
/////////////////////////////////////////////////////////////////////////////////////////

}],"max-age.js":["es5-ext/lib/Number/is-number","es5-ext/lib/Object/for-each","next-tick","../_base",function(require){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/ext/ma //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Timeout cached values                                                               // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var isNumber = require('es5-ext/lib/Number/is-number')                                 // 5
  , forEach  = require('es5-ext/lib/Object/for-each')                                  // 6
  , nextTick = require('next-tick')                                                    // 7
  , ext      = require('../_base').ext                                                 // 8
                                                                                       // 9
  , max = Math.max, min = Math.min;                                                    // 10
                                                                                       // 11
ext.maxAge = function (maxAge, conf, options) {                                        // 12
	var cache, async, preFetchAge, preFetchCache;                                         // 13
                                                                                       // 14
	maxAge = maxAge >>> 0;                                                                // 15
	if (!maxAge) {                                                                        // 16
		return;                                                                              // 17
	}                                                                                     // 18
                                                                                       // 19
	cache = {};                                                                           // 20
	async = options.async && ext.async;                                                   // 21
	conf.on('init' + (async ? 'async' : ''), function (id) {                              // 22
		cache[id] = setTimeout(function () { conf.clear(id); }, maxAge);                     // 23
		if (preFetchCache) {                                                                 // 24
			preFetchCache[id] = setTimeout(function () { delete preFetchCache[id]; },           // 25
				preFetchAge);                                                                      // 26
		}                                                                                    // 27
	});                                                                                   // 28
	conf.on('purge' + (async ? 'async' : ''), function (id) {                             // 29
		clearTimeout(cache[id]);                                                             // 30
		if (preFetchCache && preFetchCache[id]) {                                            // 31
			clearTimeout(preFetchCache[id]);                                                    // 32
			delete preFetchCache[id];                                                           // 33
		}                                                                                    // 34
		delete cache[id];                                                                    // 35
	});                                                                                   // 36
                                                                                       // 37
	if (options.preFetch) {                                                               // 38
		if (isNumber(options.preFetch)) {                                                    // 39
			preFetchAge = max(min(Number(options.preFetch), 1), 0);                             // 40
		} else {                                                                             // 41
			preFetchAge = 0.333;                                                                // 42
		}                                                                                    // 43
		if (preFetchAge) {                                                                   // 44
			preFetchCache = {};                                                                 // 45
			preFetchAge = (1 - preFetchAge) * maxAge;                                           // 46
			conf.on('hit' + (async ? 'async' : ''), function (id, args, ctx) {                  // 47
				if (!preFetchCache[id]) {                                                          // 48
					preFetchCache[id] = true;                                                         // 49
					nextTick(function () {                                                            // 50
						if (preFetchCache[id] === true) {                                                // 51
							delete preFetchCache[id];                                                       // 52
							conf.clear(id);                                                                 // 53
							conf.memoized.apply(ctx, args);                                                 // 54
						}                                                                                // 55
					});                                                                               // 56
				}                                                                                  // 57
			});                                                                                 // 58
		}                                                                                    // 59
	}                                                                                     // 60
                                                                                       // 61
	if (!async) {                                                                         // 62
		conf.on('purgeall', function () {                                                    // 63
			forEach(cache, function (id) {                                                      // 64
				clearTimeout(id);                                                                  // 65
			});                                                                                 // 66
			cache = {};                                                                         // 67
			if (preFetchCache) {                                                                // 68
				forEach(preFetchCache, function (id) {                                             // 69
					clearTimeout(id);                                                                 // 70
				});                                                                                // 71
				preFetchCache = {};                                                                // 72
			}                                                                                   // 73
		});                                                                                  // 74
	}                                                                                     // 75
};                                                                                     // 76
                                                                                       // 77
/////////////////////////////////////////////////////////////////////////////////////////

}],"max.js":["../_base",function(require){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/lib/ext/ma //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Limit cache size, LRU (least recently used) algorithm.                              // 1
                                                                                       // 2
'use strict';                                                                          // 3
                                                                                       // 4
var ext = require('../_base').ext;                                                     // 5
                                                                                       // 6
ext.max = function (max, conf, options) {                                              // 7
	var index, base, size, queue, map, async;                                             // 8
                                                                                       // 9
	max = max >>> 0;                                                                      // 10
	if (!max) {                                                                           // 11
		return;                                                                              // 12
	}                                                                                     // 13
                                                                                       // 14
	index = -1;                                                                           // 15
	base = size = 0;                                                                      // 16
	queue = {};                                                                           // 17
	map = {};                                                                             // 18
	async = options.async && ext.async;                                                   // 19
                                                                                       // 20
	conf.on('init' + (async ? 'async' : ''), function (id) {                              // 21
		queue[++index] = id;                                                                 // 22
		map[id] = index;                                                                     // 23
		++size;                                                                              // 24
		if (size > max) {                                                                    // 25
			conf.clear(queue[base]);                                                            // 26
		}                                                                                    // 27
	});                                                                                   // 28
                                                                                       // 29
	conf.on('hit' + (async ? 'async' : ''), function (id) {                               // 30
		var oldIndex = map[id];                                                              // 31
		queue[++index] = id;                                                                 // 32
		map[id] = index;                                                                     // 33
		delete queue[oldIndex];                                                              // 34
		if (base === oldIndex) {                                                             // 35
			while (!queue.hasOwnProperty(++base)) continue; //jslint: skip                      // 36
		}                                                                                    // 37
	});                                                                                   // 38
                                                                                       // 39
	conf.on('purge' + (async ? 'async' : ''), function (id) {                             // 40
		var oldIndex = map[id];                                                              // 41
		delete queue[oldIndex];                                                              // 42
		--size;                                                                              // 43
		if (base === oldIndex) {                                                             // 44
			if (!size) {                                                                        // 45
				index = -1;                                                                        // 46
				base = 0;                                                                          // 47
			} else {                                                                            // 48
				while (!queue.hasOwnProperty(++base)) continue; //jslint: skip                     // 49
			}                                                                                   // 50
		}                                                                                    // 51
	});                                                                                   // 52
                                                                                       // 53
	if (!async) {                                                                         // 54
		conf.on('purgeall', function () {                                                    // 55
			index = -1;                                                                         // 56
			base = size = 0;                                                                    // 57
			queue = {};                                                                         // 58
			map = {};                                                                           // 59
		});                                                                                  // 60
	}                                                                                     // 61
};                                                                                     // 62
                                                                                       // 63
/////////////////////////////////////////////////////////////////////////////////////////

}]}},"node_modules":{"event-emitter":{"lib":{"has-listeners.js":["es5-ext/lib/Object/is-empty","es5-ext/lib/Object/valid-value","./_id",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/node_modul //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var isEmpty = require('es5-ext/lib/Object/is-empty')                                   // 3
  , value   = require('es5-ext/lib/Object/valid-value')                                // 4
  , id      = require('./_id');                                                        // 5
                                                                                       // 6
module.exports = function (obj/*, type*/) {                                            // 7
	var type;                                                                             // 8
	value(obj);                                                                           // 9
	type = arguments[1];                                                                  // 10
	if (arguments.length > 1) {                                                           // 11
		return obj.hasOwnProperty(id) && obj[id].hasOwnProperty(type);                       // 12
	} else {                                                                              // 13
		return obj.hasOwnProperty(id) && !isEmpty(obj[id]);                                  // 14
	}                                                                                     // 15
};                                                                                     // 16
                                                                                       // 17
/////////////////////////////////////////////////////////////////////////////////////////

}],"_id.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/node_modul //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
module.exports = '_ee2_';                                                              // 3
                                                                                       // 4
/////////////////////////////////////////////////////////////////////////////////////////

},"core.js":["es5-ext/lib/Object/descriptor","es5-ext/lib/Object/valid-callable","./_id",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/node_modul //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
var d        = require('es5-ext/lib/Object/descriptor')                                // 3
  , callable = require('es5-ext/lib/Object/valid-callable')                            // 4
  , id       = require('./_id')                                                        // 5
                                                                                       // 6
  , apply = Function.prototype.apply, call = Function.prototype.call                   // 7
  , create = Object.create, defineProperty = Object.defineProperty                     // 8
  , defineProperties = Object.defineProperties                                         // 9
  , descriptor = { configurable: true, enumerable: false, writable: true }             // 10
                                                                                       // 11
  , on, once, off, emit                                                                // 12
  , colId, methods, descriptors, base;                                                 // 13
                                                                                       // 14
colId = id + 'l_';                                                                     // 15
                                                                                       // 16
on = function (type, listener) {                                                       // 17
	var data;                                                                             // 18
                                                                                       // 19
	callable(listener);                                                                   // 20
                                                                                       // 21
	if (!this.hasOwnProperty(id)) {                                                       // 22
		data = descriptor.value = {};                                                        // 23
		defineProperty(this, id, descriptor);                                                // 24
		descriptor.value = null;                                                             // 25
	} else {                                                                              // 26
		data = this[id];                                                                     // 27
	}                                                                                     // 28
	if (!data.hasOwnProperty(type)) data[type] = listener;                                // 29
	else if (data[type].hasOwnProperty(colId)) data[type].push(listener);                 // 30
	else (data[type] = [data[type], listener])[colId] = true;                             // 31
                                                                                       // 32
	return this;                                                                          // 33
};                                                                                     // 34
                                                                                       // 35
once = function (type, listener) {                                                     // 36
	var once, self;                                                                       // 37
                                                                                       // 38
	callable(listener);                                                                   // 39
	self = this;                                                                          // 40
	on.call(this, type, once = function () {                                              // 41
		off.call(self, type, once);                                                          // 42
		apply.call(listener, this, arguments);                                               // 43
	});                                                                                   // 44
                                                                                       // 45
	once._listener = listener;                                                            // 46
	return this;                                                                          // 47
};                                                                                     // 48
                                                                                       // 49
off = function (type, listener) {                                                      // 50
	var data, listeners, candidate, i;                                                    // 51
                                                                                       // 52
	callable(listener);                                                                   // 53
                                                                                       // 54
	if (!this.hasOwnProperty(id)) return this;                                            // 55
	data = this[id];                                                                      // 56
	if (!data.hasOwnProperty(type)) return this;                                          // 57
	listeners = data[type];                                                               // 58
                                                                                       // 59
	if (listeners.hasOwnProperty(colId)) {                                                // 60
		for (i = 0; (candidate = listeners[i]); ++i) {                                       // 61
			if ((candidate === listener) || (candidate._listener === listener)) {               // 62
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];                     // 63
				else listeners.splice(i, 1);                                                       // 64
			}                                                                                   // 65
		}                                                                                    // 66
	} else {                                                                              // 67
		if ((listeners === listener) || (listeners._listener === listener)) {                // 68
			delete data[type];                                                                  // 69
		}                                                                                    // 70
	}                                                                                     // 71
                                                                                       // 72
	return this;                                                                          // 73
};                                                                                     // 74
                                                                                       // 75
emit = function (type) {                                                               // 76
	var data, i, l, listener, listeners, args;                                            // 77
                                                                                       // 78
	if (!this.hasOwnProperty(id)) return;                                                 // 79
	data = this[id];                                                                      // 80
	if (!data.hasOwnProperty(type)) return;                                               // 81
	listeners = data[type];                                                               // 82
                                                                                       // 83
	if (listeners.hasOwnProperty(colId)) {                                                // 84
		l = arguments.length;                                                                // 85
		args = new Array(l - 1);                                                             // 86
		for (i = 1; i < l; ++i) {                                                            // 87
			args[i - 1] = arguments[i];                                                         // 88
		}                                                                                    // 89
                                                                                       // 90
		listeners = listeners.slice();                                                       // 91
		for (i = 0; (listener = listeners[i]); ++i) {                                        // 92
			apply.call(listener, this, args);                                                   // 93
		}                                                                                    // 94
	} else {                                                                              // 95
		switch (arguments.length) {                                                          // 96
		case 1:                                                                              // 97
			call.call(listeners, this);                                                         // 98
			break;                                                                              // 99
		case 2:                                                                              // 100
			call.call(listeners, this, arguments[1]);                                           // 101
			break;                                                                              // 102
		case 3:                                                                              // 103
			call.call(listeners, this, arguments[1], arguments[2]);                             // 104
			break;                                                                              // 105
		default:                                                                             // 106
			l = arguments.length;                                                               // 107
			args = new Array(l - 1);                                                            // 108
			for (i = 1; i < l; ++i) {                                                           // 109
				args[i - 1] = arguments[i];                                                        // 110
			}                                                                                   // 111
			apply.call(listeners, this, args);                                                  // 112
		}                                                                                    // 113
	}                                                                                     // 114
};                                                                                     // 115
                                                                                       // 116
methods = {                                                                            // 117
	on: on,                                                                               // 118
	once: once,                                                                           // 119
	off: off,                                                                             // 120
	emit: emit                                                                            // 121
};                                                                                     // 122
                                                                                       // 123
descriptors = {                                                                        // 124
	on: d(on),                                                                            // 125
	once: d(once),                                                                        // 126
	off: d(off),                                                                          // 127
	emit: d(emit)                                                                         // 128
};                                                                                     // 129
                                                                                       // 130
base = defineProperties({}, descriptors);                                              // 131
                                                                                       // 132
module.exports = exports = function (o) {                                              // 133
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);         // 134
};                                                                                     // 135
exports.methods = methods;                                                             // 136
                                                                                       // 137
/////////////////////////////////////////////////////////////////////////////////////////

}]}},"next-tick":{"package.json":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// ../../.1.1.17.6xtim6++os+web.browser+web.cordova/npm/node_modules/cli-color/node_mo //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
exports.name = "next-tick";                                                            // 1
exports.version = "0.1.0";                                                             // 2
exports.main = "lib/next-tick";                                                        // 3
                                                                                       // 4
/////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"next-tick.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// node_modules/meteor/logging/node_modules/cli-color/node_modules/memoizee/node_modul //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
'use strict';                                                                          // 1
                                                                                       // 2
if ((typeof process !== 'undefined') && process &&                                     // 3
		(typeof process.nextTick === 'function')) {                                          // 4
                                                                                       // 5
	// Node.js                                                                            // 6
	module.exports = process.nextTick;                                                    // 7
                                                                                       // 8
} else if (typeof setImmediate === 'function') {                                       // 9
                                                                                       // 10
	// W3C Draft                                                                          // 11
	// https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html       // 12
	module.exports = function (cb) { setImmediate(cb); };                                 // 13
                                                                                       // 14
} else {                                                                               // 15
                                                                                       // 16
	// Wide available standard                                                            // 17
	module.exports = function (cb) { setTimeout(cb, 0); };                                // 18
}                                                                                      // 19
                                                                                       // 20
/////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/logging/logging.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.logging = {}, {
  Log: Log
});

})();
