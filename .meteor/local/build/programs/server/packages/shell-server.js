(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"shell-server":{"main.js":["./shell-server.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/shell-server/main.js                                                                                   //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.importSync("./shell-server.js", {                                                                           // 1
  "*": function (v, k) {                                                                                           // 1
    exports[k] = v;                                                                                                // 1
  }                                                                                                                // 1
}, 0);                                                                                                             // 1
var listen = void 0;                                                                                               // 1
module.importSync("./shell-server.js", {                                                                           // 1
  listen: function (v) {                                                                                           // 1
    listen = v;                                                                                                    // 1
  }                                                                                                                // 1
}, 1);                                                                                                             // 1
var shellDir = process.env.METEOR_SHELL_DIR;                                                                       // 4
                                                                                                                   //
if (shellDir) {                                                                                                    // 5
  listen(shellDir);                                                                                                // 6
}                                                                                                                  // 7
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"shell-server.js":["babel-runtime/helpers/classCallCheck","babel-runtime/helpers/typeof","assert","path","stream","fs","net","vm","underscore","repl",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/shell-server/shell-server.js                                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");                                            //
                                                                                                                   //
var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);                                                   //
                                                                                                                   //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                            //
                                                                                                                   //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                   //
                                                                                                                   //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                  //
                                                                                                                   //
module.export({                                                                                                    // 1
  listen: function () {                                                                                            // 1
    return listen;                                                                                                 // 1
  },                                                                                                               // 1
  disable: function () {                                                                                           // 1
    return disable;                                                                                                // 1
  }                                                                                                                // 1
});                                                                                                                // 1
                                                                                                                   //
var assert = require("assert");                                                                                    // 1
                                                                                                                   //
var path = require("path");                                                                                        // 2
                                                                                                                   //
var stream = require("stream");                                                                                    // 3
                                                                                                                   //
var fs = require("fs");                                                                                            // 4
                                                                                                                   //
var net = require("net");                                                                                          // 5
                                                                                                                   //
var vm = require("vm");                                                                                            // 6
                                                                                                                   //
var _ = require("underscore");                                                                                     // 7
                                                                                                                   //
var INFO_FILE_MODE = parseInt("600", 8); // Only the owner can read or write.                                      // 8
                                                                                                                   //
var EXITING_MESSAGE = "Shell exiting..."; // Invoked by the server process to listen for incoming connections from
// shell clients. Each connection gets its own REPL instance.                                                      // 12
                                                                                                                   //
function listen(shellDir) {                                                                                        // 13
  function callback() {                                                                                            // 14
    new Server(shellDir).listen();                                                                                 // 15
  } // If the server is still in the very early stages of starting up,                                             // 16
  // Meteor.startup may not available yet.                                                                         // 19
                                                                                                                   //
                                                                                                                   //
  if ((typeof Meteor === "undefined" ? "undefined" : (0, _typeof3.default)(Meteor)) === "object") {                // 20
    Meteor.startup(callback);                                                                                      // 21
  } else if ((typeof __meteor_bootstrap__ === "undefined" ? "undefined" : (0, _typeof3.default)(__meteor_bootstrap__)) === "object") {
    var hooks = __meteor_bootstrap__.startupHooks;                                                                 // 23
                                                                                                                   //
    if (hooks) {                                                                                                   // 24
      hooks.push(callback);                                                                                        // 25
    } else {                                                                                                       // 26
      // As a fallback, just call the callback asynchronously.                                                     // 27
      setImmediate(callback);                                                                                      // 28
    }                                                                                                              // 29
  }                                                                                                                // 30
}                                                                                                                  // 31
                                                                                                                   //
function disable(shellDir) {                                                                                       // 34
  try {                                                                                                            // 35
    // Replace info.json with a file that says the shell server is                                                 // 36
    // disabled, so that any connected shell clients will fail to                                                  // 37
    // reconnect after the server process closes their sockets.                                                    // 38
    fs.writeFileSync(getInfoFile(shellDir), JSON.stringify({                                                       // 39
      status: "disabled",                                                                                          // 42
      reason: "Shell server has shut down."                                                                        // 43
    }) + "\n", {                                                                                                   // 41
      mode: INFO_FILE_MODE                                                                                         // 45
    });                                                                                                            // 45
  } catch (ignored) {}                                                                                             // 47
}                                                                                                                  // 48
                                                                                                                   //
var Server = function () {                                                                                         //
  function Server(shellDir) {                                                                                      // 51
    (0, _classCallCheck3.default)(this, Server);                                                                   // 51
    var self = this;                                                                                               // 52
    assert.ok(self instanceof Server);                                                                             // 53
    self.shellDir = shellDir;                                                                                      // 55
    self.key = Math.random().toString(36).slice(2);                                                                // 56
    self.server = net.createServer(function (socket) {                                                             // 58
      self.onConnection(socket);                                                                                   // 59
    }).on("error", function (err) {                                                                                // 60
      console.error(err.stack);                                                                                    // 61
    });                                                                                                            // 62
  }                                                                                                                // 63
                                                                                                                   //
  Server.prototype.listen = function () {                                                                          //
    function listen() {                                                                                            //
      var self = this;                                                                                             // 66
      var infoFile = getInfoFile(self.shellDir);                                                                   // 67
      fs.unlink(infoFile, function () {                                                                            // 69
        self.server.listen(0, "127.0.0.1", function () {                                                           // 70
          fs.writeFileSync(infoFile, JSON.stringify({                                                              // 71
            status: "enabled",                                                                                     // 72
            port: self.server.address().port,                                                                      // 73
            key: self.key                                                                                          // 74
          }) + "\n", {                                                                                             // 71
            mode: INFO_FILE_MODE                                                                                   // 76
          });                                                                                                      // 75
        });                                                                                                        // 78
      });                                                                                                          // 79
    }                                                                                                              // 80
                                                                                                                   //
    return listen;                                                                                                 //
  }();                                                                                                             //
                                                                                                                   //
  Server.prototype.onConnection = function () {                                                                    //
    function onConnection(socket) {                                                                                //
      var self = this; // Make sure this function doesn't try to write anything to the socket                      // 83
      // after it has been closed.                                                                                 // 86
                                                                                                                   //
      socket.on("close", function () {                                                                             // 87
        socket = null;                                                                                             // 88
      }); // If communication is not established within 1000ms of the first                                        // 89
      // connection, forcibly close the socket.                                                                    // 92
                                                                                                                   //
      var timeout = setTimeout(function () {                                                                       // 93
        if (socket) {                                                                                              // 94
          socket.removeAllListeners("data");                                                                       // 95
          socket.end(EXITING_MESSAGE + "\n");                                                                      // 96
        }                                                                                                          // 97
      }, 1000); // Let connecting clients configure certain REPL options by sending a                              // 98
      // JSON object over the socket. For example, only the client knows                                           // 101
      // whether it's running a TTY or an Emacs subshell or some other kind of                                     // 102
      // terminal, so the client must decide the value of options.terminal.                                        // 103
                                                                                                                   //
      readJSONFromStream(socket, function (error, options, replInputSocket) {                                      // 104
        clearTimeout(timeout);                                                                                     // 105
                                                                                                                   //
        if (error) {                                                                                               // 107
          socket = null;                                                                                           // 108
          console.error(error.stack);                                                                              // 109
          return;                                                                                                  // 110
        }                                                                                                          // 111
                                                                                                                   //
        if (options.key !== self.key) {                                                                            // 113
          if (socket) {                                                                                            // 114
            socket.end(EXITING_MESSAGE + "\n");                                                                    // 115
          }                                                                                                        // 116
                                                                                                                   //
          return;                                                                                                  // 117
        }                                                                                                          // 118
                                                                                                                   //
        delete options.key; // Set the columns to what is being requested by the client.                           // 119
                                                                                                                   //
        if (options.columns && socket) {                                                                           // 122
          socket.columns = options.columns;                                                                        // 123
        }                                                                                                          // 124
                                                                                                                   //
        delete options.columns;                                                                                    // 125
                                                                                                                   //
        if (options.evaluateAndExit) {                                                                             // 127
          evalCommand.call(Object.create(null), // Dummy repl object without ._RecoverableError.                   // 128
          "(" + options.evaluateAndExit.command + ")", null, // evalCommand ignores the context parameter, anyway  // 130
          options.evaluateAndExit.filename || "<meteor shell>", function (error, result) {                         // 132
            if (socket) {                                                                                          // 134
              var message = error ? {                                                                              // 135
                error: error + "",                                                                                 // 136
                code: 1                                                                                            // 137
              } : {                                                                                                // 135
                result: result                                                                                     // 139
              }; // Sending back a JSON payload allows the client to                                               // 138
              // distinguish between errors and successful results.                                                // 143
                                                                                                                   //
              socket.end(JSON.stringify(message) + "\n");                                                          // 144
            }                                                                                                      // 145
          });                                                                                                      // 146
          return;                                                                                                  // 148
        }                                                                                                          // 149
                                                                                                                   //
        delete options.evaluateAndExit; // Immutable options.                                                      // 150
                                                                                                                   //
        _.extend(options, {                                                                                        // 153
          input: replInputSocket,                                                                                  // 154
          output: socket                                                                                           // 155
        }); // Overridable options.                                                                                // 153
                                                                                                                   //
                                                                                                                   //
        _.defaults(options, {                                                                                      // 159
          prompt: "> ",                                                                                            // 160
          terminal: true,                                                                                          // 161
          useColors: true,                                                                                         // 162
          useGlobal: true,                                                                                         // 163
          ignoreUndefined: true                                                                                    // 164
        });                                                                                                        // 159
                                                                                                                   //
        self.startREPL(options);                                                                                   // 167
      });                                                                                                          // 168
    }                                                                                                              // 169
                                                                                                                   //
    return onConnection;                                                                                           //
  }();                                                                                                             //
                                                                                                                   //
  Server.prototype.startREPL = function () {                                                                       //
    function startREPL(options) {                                                                                  //
      var self = this; // Make sure this function doesn't try to write anything to the output                      // 172
      // stream after it has been closed.                                                                          // 175
                                                                                                                   //
      options.output.on("close", function () {                                                                     // 176
        options.output = null;                                                                                     // 177
      });                                                                                                          // 178
                                                                                                                   //
      var repl = self.repl = require("repl").start(options); // History persists across shell sessions!            // 180
                                                                                                                   //
                                                                                                                   //
      self.initializeHistory(); // Save the global `_` object in the server.  This is probably defined by the      // 183
      // underscore package.  It is unlikely to be the same object as the `var _ =                                 // 186
      // require('underscore')` in this file!                                                                      // 187
                                                                                                                   //
      var originalUnderscore = repl.context._;                                                                     // 188
      Object.defineProperty(repl.context, "_", {                                                                   // 190
        // Force the global _ variable to remain bound to underscore.                                              // 191
        get: function () {                                                                                         // 192
          return originalUnderscore;                                                                               // 192
        },                                                                                                         // 192
        // Expose the last REPL result as __ instead of _.                                                         // 194
        set: function (lastResult) {                                                                               // 195
          repl.context.__ = lastResult;                                                                            // 196
        },                                                                                                         // 197
        enumerable: true,                                                                                          // 199
        // Allow this property to be (re)defined more than once (e.g. each                                         // 201
        // time the server restarts).                                                                              // 202
        configurable: true                                                                                         // 203
      });                                                                                                          // 190
                                                                                                                   //
      if (Package.modules) {                                                                                       // 206
        // Use the same `require` function and `module` object visible to the                                      // 207
        // application.                                                                                            // 208
        var toBeInstalled = {};                                                                                    // 209
        var shellModuleName = "meteor-shell-" + Math.random().toString(36).slice(2) + ".js";                       // 210
                                                                                                                   //
        toBeInstalled[shellModuleName] = function (require, exports, module) {                                     // 213
          repl.context.module = module;                                                                            // 214
          repl.context.require = require; // Tab completion sometimes uses require.extensions, but only for        // 215
          // the keys.                                                                                             // 218
                                                                                                                   //
          require.extensions = {                                                                                   // 219
            ".js": true,                                                                                           // 220
            ".json": true,                                                                                         // 221
            ".node": true                                                                                          // 222
          };                                                                                                       // 219
        }; // This populates repl.context.{module,require} by evaluating the                                       // 224
        // module defined above.                                                                                   // 227
                                                                                                                   //
                                                                                                                   //
        Package.modules.meteorInstall(toBeInstalled)("./" + shellModuleName);                                      // 228
      }                                                                                                            // 229
                                                                                                                   //
      repl.context.repl = repl; // Some improvements to the existing help messages.                                // 231
                                                                                                                   //
      function addHelp(cmd, helpText) {                                                                            // 234
        var info = repl.commands[cmd] || repl.commands["." + cmd];                                                 // 235
                                                                                                                   //
        if (info) {                                                                                                // 236
          info.help = helpText;                                                                                    // 237
        }                                                                                                          // 238
      }                                                                                                            // 239
                                                                                                                   //
      addHelp("break", "Terminate current command input and display new prompt");                                  // 240
      addHelp("exit", "Disconnect from server and leave shell");                                                   // 241
      addHelp("help", "Show this help information"); // When the REPL exits, signal the attached client to exit by sending it
      // the special EXITING_MESSAGE.                                                                              // 245
                                                                                                                   //
      repl.on("exit", function () {                                                                                // 246
        if (options.output) {                                                                                      // 247
          options.output.write(EXITING_MESSAGE + "\n");                                                            // 248
          options.output.end();                                                                                    // 249
        }                                                                                                          // 250
      }); // When the server process exits, end the output stream but do not                                       // 251
      // signal the attached client to exit.                                                                       // 254
                                                                                                                   //
      process.on("exit", function () {                                                                             // 255
        if (options.output) {                                                                                      // 256
          options.output.end();                                                                                    // 257
        }                                                                                                          // 258
      }); // This Meteor-specific shell command rebuilds the application as if a                                   // 259
      // change was made to server code.                                                                           // 262
                                                                                                                   //
      repl.defineCommand("reload", {                                                                               // 263
        help: "Restart the server and the shell",                                                                  // 264
        action: function () {                                                                                      // 265
          process.exit(0);                                                                                         // 266
        }                                                                                                          // 267
      }); // TODO: Node 6: Revisit this as repl._RecoverableError is now exported.                                 // 263
      //       as `Recoverable` from `repl`.  Maybe revisit this entirely                                          // 271
      //       as the docs have been updated too:                                                                  // 272
      //       https://nodejs.org/api/repl.html#repl_custom_evaluation_functions                                   // 273
      //       https://github.com/nodejs/node/blob/v6.x/lib/repl.js#L1398                                          // 274
      // Trigger one recoverable error using the default eval function, just                                       // 275
      // to capture the Recoverable error constructor, so that our custom                                          // 276
      // evalCommand function can wrap recoverable errors properly.                                                // 277
                                                                                                                   //
      repl.eval("{", null, "<meteor shell>", function (error) {                                                    // 278
        // Capture the Recoverable error constructor.                                                              // 281
        repl._RecoverableError = error && error.constructor; // Now set repl.eval to the actual evalCommand function that we want
        // to use, bound to repl._domain if necessary.                                                             // 285
                                                                                                                   //
        repl.eval = repl._domain ? repl._domain.bind(evalCommand) : evalCommand; // Terminate the partial evaluation of the { command.
                                                                                                                   //
        repl.commands["break"].action.call(repl);                                                                  // 291
      });                                                                                                          // 292
    }                                                                                                              // 294
                                                                                                                   //
    return startREPL;                                                                                              //
  }(); // This function allows a persistent history of shell commands to be saved                                  //
  // to and loaded from .meteor/local/shell-history.                                                               // 297
                                                                                                                   //
                                                                                                                   //
  Server.prototype.initializeHistory = function () {                                                               //
    function initializeHistory() {                                                                                 //
      var self = this;                                                                                             // 299
      var rli = self.repl.rli;                                                                                     // 300
      var historyFile = getHistoryFile(self.shellDir);                                                             // 301
      var historyFd = fs.openSync(historyFile, "a+");                                                              // 302
      var historyLines = fs.readFileSync(historyFile, "utf8").split("\n");                                         // 303
      var seenLines = Object.create(null);                                                                         // 304
                                                                                                                   //
      if (!rli.history) {                                                                                          // 306
        rli.history = [];                                                                                          // 307
        rli.historyIndex = -1;                                                                                     // 308
      }                                                                                                            // 309
                                                                                                                   //
      while (rli.history && historyLines.length > 0) {                                                             // 311
        var line = historyLines.pop();                                                                             // 312
                                                                                                                   //
        if (line && /\S/.test(line) && !seenLines[line]) {                                                         // 313
          rli.history.push(line);                                                                                  // 314
          seenLines[line] = true;                                                                                  // 315
        }                                                                                                          // 316
      }                                                                                                            // 317
                                                                                                                   //
      rli.addListener("line", function (line) {                                                                    // 319
        if (historyFd >= 0 && /\S/.test(line)) {                                                                   // 320
          fs.writeSync(historyFd, line + "\n");                                                                    // 321
        }                                                                                                          // 322
      });                                                                                                          // 323
      self.repl.on("exit", function () {                                                                           // 325
        fs.closeSync(historyFd);                                                                                   // 326
        historyFd = -1;                                                                                            // 327
      });                                                                                                          // 328
    }                                                                                                              // 329
                                                                                                                   //
    return initializeHistory;                                                                                      //
  }();                                                                                                             //
                                                                                                                   //
  return Server;                                                                                                   //
}();                                                                                                               //
                                                                                                                   //
function readJSONFromStream(inputStream, callback) {                                                               // 332
  var outputStream = new stream.PassThrough();                                                                     // 333
  var dataSoFar = "";                                                                                              // 334
                                                                                                                   //
  function onData(buffer) {                                                                                        // 336
    var lines = buffer.toString("utf8").split("\n");                                                               // 337
                                                                                                                   //
    while (lines.length > 0) {                                                                                     // 339
      dataSoFar += lines.shift();                                                                                  // 340
                                                                                                                   //
      try {                                                                                                        // 342
        var json = JSON.parse(dataSoFar);                                                                          // 343
      } catch (error) {                                                                                            // 344
        if (error instanceof SyntaxError) {                                                                        // 345
          continue;                                                                                                // 346
        }                                                                                                          // 347
                                                                                                                   //
        return finish(error);                                                                                      // 349
      }                                                                                                            // 350
                                                                                                                   //
      if (lines.length > 0) {                                                                                      // 352
        outputStream.write(lines.join("\n"));                                                                      // 353
      }                                                                                                            // 354
                                                                                                                   //
      inputStream.pipe(outputStream);                                                                              // 356
      return finish(null, json);                                                                                   // 358
    }                                                                                                              // 359
  }                                                                                                                // 360
                                                                                                                   //
  function onClose() {                                                                                             // 362
    finish(new Error("stream unexpectedly closed"));                                                               // 363
  }                                                                                                                // 364
                                                                                                                   //
  var finished = false;                                                                                            // 366
                                                                                                                   //
  function finish(error, json) {                                                                                   // 367
    if (!finished) {                                                                                               // 368
      finished = true;                                                                                             // 369
      inputStream.removeListener("data", onData);                                                                  // 370
      inputStream.removeListener("error", finish);                                                                 // 371
      inputStream.removeListener("close", onClose);                                                                // 372
      callback(error, json, outputStream);                                                                         // 373
    }                                                                                                              // 374
  }                                                                                                                // 375
                                                                                                                   //
  inputStream.on("data", onData);                                                                                  // 377
  inputStream.on("error", finish);                                                                                 // 378
  inputStream.on("close", onClose);                                                                                // 379
}                                                                                                                  // 380
                                                                                                                   //
function getInfoFile(shellDir) {                                                                                   // 382
  return path.join(shellDir, "info.json");                                                                         // 383
}                                                                                                                  // 384
                                                                                                                   //
function getHistoryFile(shellDir) {                                                                                // 386
  return path.join(shellDir, "history");                                                                           // 387
} // Shell commands need to be executed in a Fiber in case they call into                                          // 388
// code that yields. Using a Promise is an even better idea, since it runs                                         // 391
// its callbacks in Fibers drawn from a pool, so the Fibers are recycled.                                          // 392
                                                                                                                   //
                                                                                                                   //
var evalCommandPromise = Promise.resolve();                                                                        // 393
                                                                                                                   //
function evalCommand(command, context, filename, callback) {                                                       // 395
  var repl = this;                                                                                                 // 396
                                                                                                                   //
  function wrapErrorIfRecoverable(error) {                                                                         // 398
    if (repl._RecoverableError && isRecoverableError(error, repl)) {                                               // 399
      return new repl._RecoverableError(error);                                                                    // 401
    } else {                                                                                                       // 402
      return error;                                                                                                // 403
    }                                                                                                              // 404
  }                                                                                                                // 405
                                                                                                                   //
  if (Package.ecmascript) {                                                                                        // 407
    var noParens = stripParens(command);                                                                           // 408
                                                                                                                   //
    if (noParens !== command) {                                                                                    // 409
      var classMatch = /^\s*class\s+(\w+)/.exec(noParens);                                                         // 410
                                                                                                                   //
      if (classMatch && classMatch[1] !== "extends") {                                                             // 411
        // If the command looks like a named ES2015 class, we remove the                                           // 412
        // extra layer of parentheses added by the REPL so that the                                                // 413
        // command will be evaluated as a class declaration rather than as                                         // 414
        // a named class expression. Note that you can still type (class A                                         // 415
        // {}) explicitly to evaluate a named class expression. The REPL                                           // 416
        // code that calls evalCommand handles named function expressions                                          // 417
        // similarly (first with and then without parentheses), but that                                           // 418
        // code doesn't know about ES2015 classes, which is why we have to                                         // 419
        // handle them here.                                                                                       // 420
        command = noParens;                                                                                        // 421
      }                                                                                                            // 422
    }                                                                                                              // 423
                                                                                                                   //
    try {                                                                                                          // 425
      command = Package.ecmascript.ECMAScript.compileForShell(command);                                            // 426
    } catch (error) {                                                                                              // 427
      callback(wrapErrorIfRecoverable(error));                                                                     // 428
      return;                                                                                                      // 429
    }                                                                                                              // 430
  }                                                                                                                // 431
                                                                                                                   //
  try {                                                                                                            // 433
    var script = new vm.Script(command, {                                                                          // 434
      filename: filename,                                                                                          // 435
      displayErrors: false                                                                                         // 436
    });                                                                                                            // 434
  } catch (parseError) {                                                                                           // 438
    callback(wrapErrorIfRecoverable(parseError));                                                                  // 439
    return;                                                                                                        // 440
  }                                                                                                                // 441
                                                                                                                   //
  evalCommandPromise.then(function () {                                                                            // 443
    callback(null, script.runInThisContext());                                                                     // 444
  }).catch(callback);                                                                                              // 445
}                                                                                                                  // 446
                                                                                                                   //
function stripParens(command) {                                                                                    // 448
  if (command.charAt(0) === "(" && command.charAt(command.length - 1) === ")") {                                   // 449
    return command.slice(1, command.length - 1);                                                                   // 451
  }                                                                                                                // 452
                                                                                                                   //
  return command;                                                                                                  // 453
} // The bailOnIllegalToken and isRecoverableError functions are taken from                                        // 454
// https://github.com/nodejs/node/blob/c9e670ea2a/lib/repl.js#L1227-L1253                                          // 457
                                                                                                                   //
                                                                                                                   //
function bailOnIllegalToken(parser) {                                                                              // 458
  return parser._literal === null && !parser.blockComment && !parser.regExpLiteral;                                // 459
} // If the error is that we've unexpectedly ended the input,                                                      // 462
// then let the user try to recover by adding more input.                                                          // 465
                                                                                                                   //
                                                                                                                   //
function isRecoverableError(e, repl) {                                                                             // 466
  if (e && e.name === 'SyntaxError') {                                                                             // 467
    var message = e.message;                                                                                       // 468
                                                                                                                   //
    if (message === 'Unterminated template literal' || message === 'Missing } in template expression') {           // 469
      repl._inTemplateLiteral = true;                                                                              // 471
      return true;                                                                                                 // 472
    }                                                                                                              // 473
                                                                                                                   //
    if (message.startsWith('Unexpected end of input') || message.startsWith('missing ) after argument list') || message.startsWith('Unexpected token')) {
      return true;                                                                                                 // 478
    }                                                                                                              // 479
                                                                                                                   //
    if (message === 'Invalid or unexpected token') {                                                               // 481
      return !bailOnIllegalToken(repl.lineParser);                                                                 // 482
    }                                                                                                              // 483
  }                                                                                                                // 484
                                                                                                                   //
  return false;                                                                                                    // 486
}                                                                                                                  // 487
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/shell-server/main.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['shell-server'] = exports;

})();

//# sourceMappingURL=shell-server.js.map
