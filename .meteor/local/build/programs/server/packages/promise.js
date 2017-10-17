(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;

/* Package-scope variables */
var Promise;

var require = meteorInstall({"node_modules":{"meteor":{"promise":{"server.js":["meteor-promise","./common.js","fibers",function(require,exports){

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// packages/promise/server.js                                                //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
require("meteor-promise").makeCompatible(
  exports.Promise = require("./common.js").Promise,
  // Allow every Promise callback to run in a Fiber drawn from a pool of
  // reusable Fibers.
  require("fibers")
);

///////////////////////////////////////////////////////////////////////////////

}],"common.js":["promise/lib/es6-extensions",function(require,exports){

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// packages/promise/common.js                                                //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
var global = this;

if (typeof global.Promise === "function") {
  exports.Promise = global.Promise;
} else {
  exports.Promise = require("promise/lib/es6-extensions");
}

exports.Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = this;

  if (arguments.length > 0) {
    self = this.then.apply(this, arguments);
  }

  self.then(null, function (err) {
    Meteor._setImmediate(function () {
      throw err;
    });
  });
};

///////////////////////////////////////////////////////////////////////////////

}],"node_modules":{"meteor-promise":{"package.json":function(require,exports){

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// ../../.0.8.8.1opqzm9++os+web.browser+web.cordova/npm/node_modules/meteor- //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
exports.name = "meteor-promise";
exports.version = "0.8.0";
exports.main = "promise_server.js";

///////////////////////////////////////////////////////////////////////////////

},"promise_server.js":function(require,exports){

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// node_modules/meteor/promise/node_modules/meteor-promise/promise_server.js //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
var assert = require("assert");
var fiberPool = require("./fiber_pool.js").makePool();

exports.makeCompatible = function (Promise, Fiber) {
  var es6PromiseThen = Promise.prototype.then;

  if (typeof Fiber === "function") {
    Promise.Fiber = Fiber;
  }

  // Replace Promise.prototype.then with a wrapper that ensures the
  // onResolved and onRejected callbacks always run in a Fiber.
  Promise.prototype.then = function (onResolved, onRejected) {
    var P = this.constructor;

    if (typeof P.Fiber === "function") {
      var fiber = P.Fiber.current;
      var dynamics = cloneFiberOwnProperties(fiber);

      return es6PromiseThen.call(
        this,
        wrapCallback(onResolved, P, dynamics),
        wrapCallback(onRejected, P, dynamics)
      );
    }

    return es6PromiseThen.call(this, onResolved, onRejected);
  };

  Promise.awaitAll = function (args) {
    return awaitPromise(this.all(args));
  };

  Promise.await = function (arg) {
    return awaitPromise(this.resolve(arg));
  };

  Promise.prototype.await = function () {
    return awaitPromise(this);
  };

  // Yield the current Fiber until the given Promise has been fulfilled.
  function awaitPromise(promise) {
    var Promise = promise.constructor;
    var Fiber = Promise.Fiber;

    assert.strictEqual(
      typeof Fiber, "function",
      "Cannot await unless Promise.Fiber is defined"
    );

    var fiber = Fiber.current;

    assert.ok(
      fiber instanceof Fiber,
      "Cannot await without a Fiber"
    );

    var run = fiber.run;
    var throwInto = fiber.throwInto;

    if (process.domain) {
      run = process.domain.bind(run);
      throwInto = process.domain.bind(throwInto);
    }

    // The overridden es6PromiseThen function is adequate here because these
    // two callbacks do not need to run in a Fiber.
    es6PromiseThen.call(promise, function (result) {
      tryCatchNextTick(fiber, run, [result]);
    }, function (error) {
      tryCatchNextTick(fiber, throwInto, [error]);
    });

    return stackSafeYield(Fiber, awaitPromise);
  }

  function stackSafeYield(Fiber, caller) {
    try {
      return Fiber.yield();
    } catch (thrown) {
      if (thrown) {
        var e = new Error;
        Error.captureStackTrace(e, caller);
        thrown.stack += e.stack.replace(/^.*?\n/, "\n => awaited here:\n");
      }
      throw thrown;
    }
  }

  // Return a wrapper function that returns a Promise for the eventual
  // result of the original function.
  Promise.async = function (fn, allowReuseOfCurrentFiber) {
    var Promise = this;
    return function () {
      return Promise.asyncApply(
        fn, this, arguments,
        allowReuseOfCurrentFiber
      );
    };
  };

  Promise.asyncApply = function (
    fn, context, args, allowReuseOfCurrentFiber
  ) {
    var Promise = this;
    var Fiber = Promise.Fiber;
    var fiber = Fiber && Fiber.current;

    if (fiber && allowReuseOfCurrentFiber) {
      return this.resolve(fn.apply(context, args));
    }

    return fiberPool.run({
      callback: fn,
      context: context,
      args: args,
      dynamics: cloneFiberOwnProperties(fiber)
    }, Promise);
  };
};

function wrapCallback(callback, Promise, dynamics) {
  if (! callback) {
    return callback;
  }

  // Don't wrap callbacks that are flagged as not wanting to be called in a
  // fiber.
  if (callback._meteorPromiseAlreadyWrapped) {
    return callback;
  }

  var result = function (arg) {
    return fiberPool.run({
      callback: callback,
      args: [arg], // Avoid dealing with arguments objects.
      dynamics: dynamics
    }, Promise);
  };

  // Flag this callback as not wanting to be called in a fiber because it is
  // already creating a fiber.
  result._meteorPromiseAlreadyWrapped = true;

  return result;
}

function cloneFiberOwnProperties(fiber) {
  if (fiber) {
    var dynamics = {};

    Object.keys(fiber).forEach(function (key) {
      dynamics[key] = shallowClone(fiber[key]);
    });

    return dynamics;
  }
}

function shallowClone(value) {
  if (Array.isArray(value)) {
    return value.slice(0);
  }

  if (value && typeof value === "object") {
    var copy = Object.create(Object.getPrototypeOf(value));
    var keys = Object.keys(value);
    var keyCount = keys.length;

    for (var i = 0; i < keyCount; ++i) {
      var key = keys[i];
      copy[key] = value[key];
    }

    return copy;
  }

  return value;
}

// Invoke method with args against object in a try-catch block,
// re-throwing any exceptions in the next tick of the event loop, so that
// they won't get captured/swallowed by the caller.
function tryCatchNextTick(object, method, args) {
  try {
    return method.apply(object, args);
  } catch (error) {
    process.nextTick(function () {
      throw error;
    });
  }
}

///////////////////////////////////////////////////////////////////////////////

}},"promise":{"lib":{"es6-extensions.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// node_modules/meteor/promise/node_modules/promise/lib/es6-extensions.js    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js');

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._61);
  p._81 = 1;
  p._65 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._81 === 3) {
            val = val._65;
          }
          if (val._81 === 1) return res(i, val._65);
          if (val._81 === 2) reject(val._65);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

///////////////////////////////////////////////////////////////////////////////

}}}}}}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/promise/server.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.promise = exports, {
  Promise: Promise
});

})();
