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
var IdMap = Package['id-map'].IdMap;
var OrderedDict = Package['ordered-dict'].OrderedDict;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var MongoID = Package['mongo-id'].MongoID;
var Random = Package.random.Random;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var GeoJSON = Package['geojson-utils'].GeoJSON;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var LocalCollection, Minimongo, MinimongoTest, MinimongoError, isArray, isPlainObject, isIndexable, isOperatorObject, isNumericKey, regexpElementMatcher, equalityElementMatcher, ELEMENT_OPERATORS, makeLookupFunction, expandArraysInBranches, projectionDetails, pathsToTree;

var require = meteorInstall({"node_modules":{"meteor":{"minimongo":{"minimongo.js":["./validation.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/minimongo.js                                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var assertHasValidFieldNames = void 0;                                                                                 // 1
module.importSync("./validation.js", {                                                                                 // 1
  assertHasValidFieldNames: function (v) {                                                                             // 1
    assertHasValidFieldNames = v;                                                                                      // 1
  }                                                                                                                    // 1
}, 0);                                                                                                                 // 1
                                                                                                                       //
// XXX type checking on selectors (graceful error if malformed)                                                        // 3
// LocalCollection: a set of documents that supports queries and modifiers.                                            // 5
// Cursor: a specification for a particular subset of documents, w/                                                    // 7
// a defined order, limit, and offset.  creating a Cursor with LocalCollection.find(),                                 // 8
// ObserveHandle: the return value of a live query.                                                                    // 10
LocalCollection = function (name) {                                                                                    // 12
  var self = this;                                                                                                     // 13
  self.name = name; // _id -> document (also containing id)                                                            // 14
                                                                                                                       //
  self._docs = new LocalCollection._IdMap();                                                                           // 16
  self._observeQueue = new Meteor._SynchronousQueue();                                                                 // 18
  self.next_qid = 1; // live query id generator                                                                        // 20
  // qid -> live query object. keys:                                                                                   // 22
  //  ordered: bool. ordered queries have addedBefore/movedBefore callbacks.                                           // 23
  //  results: array (ordered) or object (unordered) of current results                                                // 24
  //    (aliased with self._docs!)                                                                                     // 25
  //  resultsSnapshot: snapshot of results. null if not paused.                                                        // 26
  //  cursor: Cursor object for the query.                                                                             // 27
  //  selector, sorter, (callbacks): functions                                                                         // 28
                                                                                                                       //
  self.queries = {}; // null if not saving originals; an IdMap from id to original document value if                   // 29
  // saving originals. See comments before saveOriginals().                                                            // 32
                                                                                                                       //
  self._savedOriginals = null; // True when observers are paused and we should not send callbacks.                     // 33
                                                                                                                       //
  self.paused = false;                                                                                                 // 36
};                                                                                                                     // 37
                                                                                                                       //
Minimongo = {}; // Object exported only for unit testing.                                                              // 39
// Use it to export private functions to test in Tinytest.                                                             // 42
                                                                                                                       //
MinimongoTest = {};                                                                                                    // 43
                                                                                                                       //
MinimongoError = function (message) {                                                                                  // 45
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};                                // 45
                                                                                                                       //
  if (typeof message === "string" && options.field) {                                                                  // 46
    message += " for field '" + options.field + "'";                                                                   // 47
  }                                                                                                                    // 48
                                                                                                                       //
  var e = new Error(message);                                                                                          // 50
  e.name = "MinimongoError";                                                                                           // 51
  return e;                                                                                                            // 52
}; // options may include sort, skip, limit, reactive                                                                  // 53
// sort may be any of these forms:                                                                                     // 57
//     {a: 1, b: -1}                                                                                                   // 58
//     [["a", "asc"], ["b", "desc"]]                                                                                   // 59
//     ["a", ["b", "desc"]]                                                                                            // 60
//   (in the first form you're beholden to key enumeration order in                                                    // 61
//   your javascript VM)                                                                                               // 62
//                                                                                                                     // 63
// reactive: if given, and false, don't register with Tracker (default                                                 // 64
// is true)                                                                                                            // 65
//                                                                                                                     // 66
// XXX possibly should support retrieving a subset of fields? and                                                      // 67
// have it be a hint (ignored on the client, when not copying the                                                      // 68
// doc?)                                                                                                               // 69
//                                                                                                                     // 70
// XXX sort does not yet support subkeys ('a.b') .. fix that!                                                          // 71
// XXX add one more sort form: "key"                                                                                   // 72
// XXX tests                                                                                                           // 73
                                                                                                                       //
                                                                                                                       //
LocalCollection.prototype.find = function (selector, options) {                                                        // 74
  // default syntax for everything is to omit the selector argument.                                                   // 75
  // but if selector is explicitly passed in as false or undefined, we                                                 // 76
  // want a selector that matches nothing.                                                                             // 77
  if (arguments.length === 0) selector = {};                                                                           // 78
  return new LocalCollection.Cursor(this, selector, options);                                                          // 81
}; // don't call this ctor directly.  use LocalCollection.find().                                                      // 82
                                                                                                                       //
                                                                                                                       //
LocalCollection.Cursor = function (collection, selector, options) {                                                    // 86
  var self = this;                                                                                                     // 87
  if (!options) options = {};                                                                                          // 88
  self.collection = collection;                                                                                        // 90
  self.sorter = null;                                                                                                  // 91
  self.matcher = new Minimongo.Matcher(selector);                                                                      // 92
                                                                                                                       //
  if (LocalCollection._selectorIsId(selector)) {                                                                       // 94
    // stash for fast path                                                                                             // 95
    self._selectorId = selector;                                                                                       // 96
  } else if (LocalCollection._selectorIsIdPerhapsAsObject(selector)) {                                                 // 97
    // also do the fast path for { _id: idString }                                                                     // 98
    self._selectorId = selector._id;                                                                                   // 99
  } else {                                                                                                             // 100
    self._selectorId = undefined;                                                                                      // 101
                                                                                                                       //
    if (self.matcher.hasGeoQuery() || options.sort) {                                                                  // 102
      self.sorter = new Minimongo.Sorter(options.sort || [], {                                                         // 103
        matcher: self.matcher                                                                                          // 104
      });                                                                                                              // 104
    }                                                                                                                  // 105
  }                                                                                                                    // 106
                                                                                                                       //
  self.skip = options.skip;                                                                                            // 108
  self.limit = options.limit;                                                                                          // 109
  self.fields = options.fields;                                                                                        // 110
  self._projectionFn = LocalCollection._compileProjection(self.fields || {});                                          // 112
  self._transform = LocalCollection.wrapTransform(options.transform); // by default, queries register w/ Tracker when it is available.
                                                                                                                       //
  if (typeof Tracker !== "undefined") self.reactive = options.reactive === undefined ? true : options.reactive;        // 117
}; // Since we don't actually have a "nextObject" interface, there's really no                                         // 119
// reason to have a "rewind" interface.  All it did was make multiple calls                                            // 122
// to fetch/map/forEach return nothing the second time.                                                                // 123
// XXX COMPAT WITH 0.8.1                                                                                               // 124
                                                                                                                       //
                                                                                                                       //
LocalCollection.Cursor.prototype.rewind = function () {};                                                              // 125
                                                                                                                       //
LocalCollection.prototype.findOne = function (selector, options) {                                                     // 128
  if (arguments.length === 0) selector = {}; // NOTE: by setting limit 1 here, we end up using very inefficient        // 129
  // code that recomputes the whole query on each update. The upside is                                                // 133
  // that when you reactively depend on a findOne you only get                                                         // 134
  // invalidated when the found object changes, not any object in the                                                  // 135
  // collection. Most findOne will be by id, which has a fast path, so                                                 // 136
  // this might not be a big deal. In most cases, invalidation causes                                                  // 137
  // the called to re-query anyway, so this should be a net performance                                                // 138
  // improvement.                                                                                                      // 139
                                                                                                                       //
  options = options || {};                                                                                             // 140
  options.limit = 1;                                                                                                   // 141
  return this.find(selector, options).fetch()[0];                                                                      // 143
}; /**                                                                                                                 // 144
    * @callback IterationCallback                                                                                      //
    * @param {Object} doc                                                                                              //
    * @param {Number} index                                                                                            //
    */ /**                                                                                                             //
        * @summary Call `callback` once for each matching document, sequentially and synchronously.                    //
        * @locus Anywhere                                                                                              //
        * @method  forEach                                                                                             //
        * @instance                                                                                                    //
        * @memberOf Mongo.Cursor                                                                                       //
        * @param {IterationCallback} callback Function to call. It will be called with three arguments: the document, a 0-based index, and <em>cursor</em> itself.
        * @param {Any} [thisArg] An object which will be the value of `this` inside `callback`.                        //
        */                                                                                                             //
                                                                                                                       //
LocalCollection.Cursor.prototype.forEach = function (callback, thisArg) {                                              // 160
  var self = this;                                                                                                     // 161
                                                                                                                       //
  var objects = self._getRawObjects({                                                                                  // 163
    ordered: true                                                                                                      // 163
  });                                                                                                                  // 163
                                                                                                                       //
  if (self.reactive) {                                                                                                 // 165
    self._depend({                                                                                                     // 166
      addedBefore: true,                                                                                               // 167
      removed: true,                                                                                                   // 168
      changed: true,                                                                                                   // 169
      movedBefore: true                                                                                                // 170
    });                                                                                                                // 166
  }                                                                                                                    // 171
                                                                                                                       //
  _.each(objects, function (elt, i) {                                                                                  // 173
    // This doubles as a clone operation.                                                                              // 174
    elt = self._projectionFn(elt);                                                                                     // 175
    if (self._transform) elt = self._transform(elt);                                                                   // 177
    callback.call(thisArg, elt, i, self);                                                                              // 179
  });                                                                                                                  // 180
};                                                                                                                     // 181
                                                                                                                       //
LocalCollection.Cursor.prototype.getTransform = function () {                                                          // 183
  return this._transform;                                                                                              // 184
}; /**                                                                                                                 // 185
    * @summary Map callback over all matching documents.  Returns an Array.                                            //
    * @locus Anywhere                                                                                                  //
    * @method map                                                                                                      //
    * @instance                                                                                                        //
    * @memberOf Mongo.Cursor                                                                                           //
    * @param {IterationCallback} callback Function to call. It will be called with three arguments: the document, a 0-based index, and <em>cursor</em> itself.
    * @param {Any} [thisArg] An object which will be the value of `this` inside `callback`.                            //
    */                                                                                                                 //
                                                                                                                       //
LocalCollection.Cursor.prototype.map = function (callback, thisArg) {                                                  // 196
  var self = this;                                                                                                     // 197
  var res = [];                                                                                                        // 198
  self.forEach(function (doc, index) {                                                                                 // 199
    res.push(callback.call(thisArg, doc, index, self));                                                                // 200
  });                                                                                                                  // 201
  return res;                                                                                                          // 202
}; /**                                                                                                                 // 203
    * @summary Return all matching documents as an Array.                                                              //
    * @memberOf Mongo.Cursor                                                                                           //
    * @method  fetch                                                                                                   //
    * @instance                                                                                                        //
    * @locus Anywhere                                                                                                  //
    * @returns {Object[]}                                                                                              //
    */                                                                                                                 //
                                                                                                                       //
LocalCollection.Cursor.prototype.fetch = function () {                                                                 // 213
  var self = this;                                                                                                     // 214
  var res = [];                                                                                                        // 215
  self.forEach(function (doc) {                                                                                        // 216
    res.push(doc);                                                                                                     // 217
  });                                                                                                                  // 218
  return res;                                                                                                          // 219
}; /**                                                                                                                 // 220
    * @summary Returns the number of documents that match a query.                                                     //
    * @memberOf Mongo.Cursor                                                                                           //
    * @method  count                                                                                                   //
    * @instance                                                                                                        //
    * @locus Anywhere                                                                                                  //
    * @returns {Number}                                                                                                //
    */                                                                                                                 //
                                                                                                                       //
LocalCollection.Cursor.prototype.count = function () {                                                                 // 230
  var self = this;                                                                                                     // 231
  if (self.reactive) self._depend({                                                                                    // 233
    added: true,                                                                                                       // 234
    removed: true                                                                                                      // 234
  }, true /* allow the observe to be unordered */);                                                                    // 234
  return self._getRawObjects({                                                                                         // 237
    ordered: true                                                                                                      // 237
  }).length;                                                                                                           // 237
};                                                                                                                     // 238
                                                                                                                       //
LocalCollection.Cursor.prototype._publishCursor = function (sub) {                                                     // 240
  var self = this;                                                                                                     // 241
  if (!self.collection.name) throw new Error("Can't publish a cursor from a collection without a name.");              // 242
  var collection = self.collection.name; // XXX minimongo should not depend on mongo-livedata!                         // 244
                                                                                                                       //
  if (!Package.mongo) {                                                                                                // 247
    throw new Error("Can't publish from Minimongo without the `mongo` package.");                                      // 248
  }                                                                                                                    // 249
                                                                                                                       //
  return Package.mongo.Mongo.Collection._publishCursor(self, sub, collection);                                         // 251
};                                                                                                                     // 252
                                                                                                                       //
LocalCollection.Cursor.prototype._getCollectionName = function () {                                                    // 254
  var self = this;                                                                                                     // 255
  return self.collection.name;                                                                                         // 256
};                                                                                                                     // 257
                                                                                                                       //
LocalCollection._observeChangesCallbacksAreOrdered = function (callbacks) {                                            // 259
  if (callbacks.added && callbacks.addedBefore) throw new Error("Please specify only one of added() and addedBefore()");
  return !!(callbacks.addedBefore || callbacks.movedBefore);                                                           // 262
};                                                                                                                     // 263
                                                                                                                       //
LocalCollection._observeCallbacksAreOrdered = function (callbacks) {                                                   // 265
  if (callbacks.addedAt && callbacks.added) throw new Error("Please specify only one of added() and addedAt()");       // 266
  if (callbacks.changedAt && callbacks.changed) throw new Error("Please specify only one of changed() and changedAt()");
  if (callbacks.removed && callbacks.removedAt) throw new Error("Please specify only one of removed() and removedAt()");
  return !!(callbacks.addedAt || callbacks.movedTo || callbacks.changedAt || callbacks.removedAt);                     // 273
}; // the handle that comes back from observe.                                                                         // 275
                                                                                                                       //
                                                                                                                       //
LocalCollection.ObserveHandle = function () {}; // options to contain:                                                 // 278
//  * callbacks for observe():                                                                                         // 281
//    - addedAt (document, atIndex)                                                                                    // 282
//    - added (document)                                                                                               // 283
//    - changedAt (newDocument, oldDocument, atIndex)                                                                  // 284
//    - changed (newDocument, oldDocument)                                                                             // 285
//    - removedAt (document, atIndex)                                                                                  // 286
//    - removed (document)                                                                                             // 287
//    - movedTo (document, oldIndex, newIndex)                                                                         // 288
//                                                                                                                     // 289
// attributes available on returned query handle:                                                                      // 290
//  * stop(): end updates                                                                                              // 291
//  * collection: the collection this query is querying                                                                // 292
//                                                                                                                     // 293
// iff x is a returned query handle, (x instanceof                                                                     // 294
// LocalCollection.ObserveHandle) is true                                                                              // 295
//                                                                                                                     // 296
// initial results delivered through added callback                                                                    // 297
// XXX maybe callbacks should take a list of objects, to expose transactions?                                          // 298
// XXX maybe support field limiting (to limit what you're notified on)                                                 // 299
                                                                                                                       //
                                                                                                                       //
_.extend(LocalCollection.Cursor.prototype, {                                                                           // 301
  /**                                                                                                                  // 302
   * @summary Watch a query.  Receive callbacks as the result set changes.                                             //
   * @locus Anywhere                                                                                                   //
   * @memberOf Mongo.Cursor                                                                                            //
   * @instance                                                                                                         //
   * @param {Object} callbacks Functions to call to deliver the result set as it changes                               //
   */observe: function (options) {                                                                                     //
    var self = this;                                                                                                   // 310
    return LocalCollection._observeFromObserveChanges(self, options);                                                  // 311
  },                                                                                                                   // 312
  /**                                                                                                                  // 314
   * @summary Watch a query.  Receive callbacks as the result set changes.  Only the differences between the old and new documents are passed to the callbacks.
   * @locus Anywhere                                                                                                   //
   * @memberOf Mongo.Cursor                                                                                            //
   * @instance                                                                                                         //
   * @param {Object} callbacks Functions to call to deliver the result set as it changes                               //
   */observeChanges: function (options) {                                                                              //
    var self = this;                                                                                                   // 322
                                                                                                                       //
    var ordered = LocalCollection._observeChangesCallbacksAreOrdered(options); // there are several places that assume you aren't combining skip/limit with
    // unordered observe.  eg, update's EJSON.clone, and the "there are several"                                       // 327
    // comment in _modifyAndNotify                                                                                     // 328
    // XXX allow skip/limit with unordered observe                                                                     // 329
                                                                                                                       //
                                                                                                                       //
    if (!options._allow_unordered && !ordered && (self.skip || self.limit)) throw new Error("must use ordered observe (ie, 'addedBefore' instead of 'added') with skip or limit");
    if (self.fields && (self.fields._id === 0 || self.fields._id === false)) throw Error("You may not observe a cursor with {fields: {_id: 0}}");
    var query = {                                                                                                      // 336
      dirty: false,                                                                                                    // 337
      matcher: self.matcher,                                                                                           // 338
      // not fast pathed                                                                                               // 338
      sorter: ordered && self.sorter,                                                                                  // 339
      distances: self.matcher.hasGeoQuery() && ordered && new LocalCollection._IdMap(),                                // 340
      resultsSnapshot: null,                                                                                           // 342
      ordered: ordered,                                                                                                // 343
      cursor: self,                                                                                                    // 344
      projectionFn: self._projectionFn                                                                                 // 345
    };                                                                                                                 // 336
    var qid; // Non-reactive queries call added[Before] and then never call anything                                   // 347
    // else.                                                                                                           // 350
                                                                                                                       //
    if (self.reactive) {                                                                                               // 351
      qid = self.collection.next_qid++;                                                                                // 352
      self.collection.queries[qid] = query;                                                                            // 353
    }                                                                                                                  // 354
                                                                                                                       //
    query.results = self._getRawObjects({                                                                              // 355
      ordered: ordered,                                                                                                // 356
      distances: query.distances                                                                                       // 356
    });                                                                                                                // 355
    if (self.collection.paused) query.resultsSnapshot = ordered ? [] : new LocalCollection._IdMap(); // wrap callbacks we were passed. callbacks only fire when not paused and
    // are never undefined                                                                                             // 361
    // Filters out blacklisted fields according to cursor's projection.                                                // 362
    // XXX wrong place for this?                                                                                       // 363
    // furthermore, callbacks enqueue until the operation we're working on is                                          // 365
    // done.                                                                                                           // 366
                                                                                                                       //
    var wrapCallback = function (f) {                                                                                  // 367
      if (!f) return function () {};                                                                                   // 368
      return function () /*args*/{                                                                                     // 370
        var context = this;                                                                                            // 371
        var args = arguments;                                                                                          // 372
        if (self.collection.paused) return;                                                                            // 374
                                                                                                                       //
        self.collection._observeQueue.queueTask(function () {                                                          // 377
          f.apply(context, args);                                                                                      // 378
        });                                                                                                            // 379
      };                                                                                                               // 380
    };                                                                                                                 // 381
                                                                                                                       //
    query.added = wrapCallback(options.added);                                                                         // 382
    query.changed = wrapCallback(options.changed);                                                                     // 383
    query.removed = wrapCallback(options.removed);                                                                     // 384
                                                                                                                       //
    if (ordered) {                                                                                                     // 385
      query.addedBefore = wrapCallback(options.addedBefore);                                                           // 386
      query.movedBefore = wrapCallback(options.movedBefore);                                                           // 387
    }                                                                                                                  // 388
                                                                                                                       //
    if (!options._suppress_initial && !self.collection.paused) {                                                       // 390
      // XXX unify ordered and unordered interface                                                                     // 391
      var each = ordered ? _.bind(_.each, null, query.results) : _.bind(query.results.forEach, query.results);         // 392
      each(function (doc) {                                                                                            // 395
        var fields = EJSON.clone(doc);                                                                                 // 396
        delete fields._id;                                                                                             // 398
        if (ordered) query.addedBefore(doc._id, self._projectionFn(fields), null);                                     // 399
        query.added(doc._id, self._projectionFn(fields));                                                              // 401
      });                                                                                                              // 402
    }                                                                                                                  // 403
                                                                                                                       //
    var handle = new LocalCollection.ObserveHandle();                                                                  // 405
                                                                                                                       //
    _.extend(handle, {                                                                                                 // 406
      collection: self.collection,                                                                                     // 407
      stop: function () {                                                                                              // 408
        if (self.reactive) delete self.collection.queries[qid];                                                        // 409
      }                                                                                                                // 411
    });                                                                                                                // 406
                                                                                                                       //
    if (self.reactive && Tracker.active) {                                                                             // 414
      // XXX in many cases, the same observe will be recreated when                                                    // 415
      // the current autorun is rerun.  we could save work by                                                          // 416
      // letting it linger across rerun and potentially get                                                            // 417
      // repurposed if the same observe is performed, using logic                                                      // 418
      // similar to that of Meteor.subscribe.                                                                          // 419
      Tracker.onInvalidate(function () {                                                                               // 420
        handle.stop();                                                                                                 // 421
      });                                                                                                              // 422
    } // run the observe callbacks resulting from the initial contents                                                 // 423
    // before we leave the observe.                                                                                    // 425
                                                                                                                       //
                                                                                                                       //
    self.collection._observeQueue.drain();                                                                             // 426
                                                                                                                       //
    return handle;                                                                                                     // 428
  }                                                                                                                    // 429
}); // Returns a collection of matching objects, but doesn't deep copy them.                                           // 301
//                                                                                                                     // 433
// If ordered is set, returns a sorted array, respecting sorter, skip, and limit                                       // 434
// properties of the query.  if sorter is falsey, no sort -- you get the natural                                       // 435
// order.                                                                                                              // 436
//                                                                                                                     // 437
// If ordered is not set, returns an object mapping from ID to doc (sorter, skip                                       // 438
// and limit should not be set).                                                                                       // 439
//                                                                                                                     // 440
// If ordered is set and this cursor is a $near geoquery, then this function                                           // 441
// will use an _IdMap to track each distance from the $near argument point in                                          // 442
// order to use it as a sort key. If an _IdMap is passed in the 'distances'                                            // 443
// argument, this function will clear it and use it for this purpose (otherwise                                        // 444
// it will just create its own _IdMap). The observeChanges implementation uses                                         // 445
// this to remember the distances after this function returns.                                                         // 446
                                                                                                                       //
                                                                                                                       //
LocalCollection.Cursor.prototype._getRawObjects = function (options) {                                                 // 447
  var self = this;                                                                                                     // 448
  options = options || {}; // XXX use OrderedDict instead of array, and make IdMap and OrderedDict                     // 449
  // compatible                                                                                                        // 452
                                                                                                                       //
  var results = options.ordered ? [] : new LocalCollection._IdMap(); // fast path for single ID value                  // 453
                                                                                                                       //
  if (self._selectorId !== undefined) {                                                                                // 456
    // If you have non-zero skip and ask for a single id, you get                                                      // 457
    // nothing. This is so it matches the behavior of the '{_id: foo}'                                                 // 458
    // path.                                                                                                           // 459
    if (self.skip) return results;                                                                                     // 460
                                                                                                                       //
    var selectedDoc = self.collection._docs.get(self._selectorId);                                                     // 463
                                                                                                                       //
    if (selectedDoc) {                                                                                                 // 464
      if (options.ordered) results.push(selectedDoc);else results.set(self._selectorId, selectedDoc);                  // 465
    }                                                                                                                  // 469
                                                                                                                       //
    return results;                                                                                                    // 470
  } // slow path for arbitrary selector, sort, skip, limit                                                             // 471
  // in the observeChanges case, distances is actually part of the "query" (ie,                                        // 475
  // live results set) object.  in other cases, distances is only used inside                                          // 476
  // this function.                                                                                                    // 477
                                                                                                                       //
                                                                                                                       //
  var distances;                                                                                                       // 478
                                                                                                                       //
  if (self.matcher.hasGeoQuery() && options.ordered) {                                                                 // 479
    if (options.distances) {                                                                                           // 480
      distances = options.distances;                                                                                   // 481
      distances.clear();                                                                                               // 482
    } else {                                                                                                           // 483
      distances = new LocalCollection._IdMap();                                                                        // 484
    }                                                                                                                  // 485
  }                                                                                                                    // 486
                                                                                                                       //
  self.collection._docs.forEach(function (doc, id) {                                                                   // 488
    var matchResult = self.matcher.documentMatches(doc);                                                               // 489
                                                                                                                       //
    if (matchResult.result) {                                                                                          // 490
      if (options.ordered) {                                                                                           // 491
        results.push(doc);                                                                                             // 492
        if (distances && matchResult.distance !== undefined) distances.set(id, matchResult.distance);                  // 493
      } else {                                                                                                         // 495
        results.set(id, doc);                                                                                          // 496
      }                                                                                                                // 497
    } // Fast path for limited unsorted queries.                                                                       // 498
    // XXX 'length' check here seems wrong for ordered                                                                 // 500
                                                                                                                       //
                                                                                                                       //
    if (self.limit && !self.skip && !self.sorter && results.length === self.limit) return false; // break              // 501
                                                                                                                       //
    return true; // continue                                                                                           // 504
  });                                                                                                                  // 505
                                                                                                                       //
  if (!options.ordered) return results;                                                                                // 507
                                                                                                                       //
  if (self.sorter) {                                                                                                   // 510
    var comparator = self.sorter.getComparator({                                                                       // 511
      distances: distances                                                                                             // 511
    });                                                                                                                // 511
    results.sort(comparator);                                                                                          // 512
  }                                                                                                                    // 513
                                                                                                                       //
  var idx_start = self.skip || 0;                                                                                      // 515
  var idx_end = self.limit ? self.limit + idx_start : results.length;                                                  // 516
  return results.slice(idx_start, idx_end);                                                                            // 517
}; // XXX Maybe we need a version of observe that just calls a callback if                                             // 518
// anything changed.                                                                                                   // 521
                                                                                                                       //
                                                                                                                       //
LocalCollection.Cursor.prototype._depend = function (changers, _allow_unordered) {                                     // 522
  var self = this;                                                                                                     // 523
                                                                                                                       //
  if (Tracker.active) {                                                                                                // 525
    var v = new Tracker.Dependency();                                                                                  // 526
    v.depend();                                                                                                        // 527
                                                                                                                       //
    var notifyChange = _.bind(v.changed, v);                                                                           // 528
                                                                                                                       //
    var options = {                                                                                                    // 530
      _suppress_initial: true,                                                                                         // 531
      _allow_unordered: _allow_unordered                                                                               // 532
    };                                                                                                                 // 530
                                                                                                                       //
    _.each(['added', 'changed', 'removed', 'addedBefore', 'movedBefore'], function (fnName) {                          // 534
      if (changers[fnName]) options[fnName] = notifyChange;                                                            // 536
    }); // observeChanges will stop() when this computation is invalidated                                             // 538
                                                                                                                       //
                                                                                                                       //
    self.observeChanges(options);                                                                                      // 541
  }                                                                                                                    // 542
}; // XXX possibly enforce that 'undefined' does not appear (we assume                                                 // 543
// this in our handling of null and $exists)                                                                           // 546
                                                                                                                       //
                                                                                                                       //
LocalCollection.prototype.insert = function (doc, callback) {                                                          // 547
  var self = this;                                                                                                     // 548
  doc = EJSON.clone(doc);                                                                                              // 549
  assertHasValidFieldNames(doc);                                                                                       // 551
                                                                                                                       //
  if (!_.has(doc, '_id')) {                                                                                            // 553
    // if you really want to use ObjectIDs, set this global.                                                           // 554
    // Mongo.Collection specifies its own ids and does not use this code.                                              // 555
    doc._id = LocalCollection._useOID ? new MongoID.ObjectID() : Random.id();                                          // 556
  }                                                                                                                    // 558
                                                                                                                       //
  var id = doc._id;                                                                                                    // 559
  if (self._docs.has(id)) throw MinimongoError("Duplicate _id '" + id + "'");                                          // 561
                                                                                                                       //
  self._saveOriginal(id, undefined);                                                                                   // 564
                                                                                                                       //
  self._docs.set(id, doc);                                                                                             // 565
                                                                                                                       //
  var queriesToRecompute = []; // trigger live queries that match                                                      // 567
                                                                                                                       //
  for (var qid in meteorBabelHelpers.sanitizeForInObject(self.queries)) {                                              // 569
    var query = self.queries[qid];                                                                                     // 570
    if (query.dirty) continue;                                                                                         // 571
    var matchResult = query.matcher.documentMatches(doc);                                                              // 572
                                                                                                                       //
    if (matchResult.result) {                                                                                          // 573
      if (query.distances && matchResult.distance !== undefined) query.distances.set(id, matchResult.distance);        // 574
      if (query.cursor.skip || query.cursor.limit) queriesToRecompute.push(qid);else LocalCollection._insertInResults(query, doc);
    }                                                                                                                  // 580
  }                                                                                                                    // 581
                                                                                                                       //
  _.each(queriesToRecompute, function (qid) {                                                                          // 583
    if (self.queries[qid]) self._recomputeResults(self.queries[qid]);                                                  // 584
  });                                                                                                                  // 586
                                                                                                                       //
  self._observeQueue.drain(); // Defer because the caller likely doesn't expect the callback to be run                 // 587
  // immediately.                                                                                                      // 590
                                                                                                                       //
                                                                                                                       //
  if (callback) Meteor.defer(function () {                                                                             // 591
    callback(null, id);                                                                                                // 593
  });                                                                                                                  // 594
  return id;                                                                                                           // 595
}; // Iterates over a subset of documents that could match selector; calls                                             // 596
// f(doc, id) on each of them.  Specifically, if selector specifies                                                    // 599
// specific _id's, it only looks at those.  doc is *not* cloned: it is the                                             // 600
// same object that is in _docs.                                                                                       // 601
                                                                                                                       //
                                                                                                                       //
LocalCollection.prototype._eachPossiblyMatchingDoc = function (selector, f) {                                          // 602
  var self = this;                                                                                                     // 603
                                                                                                                       //
  var specificIds = LocalCollection._idsMatchedBySelector(selector);                                                   // 604
                                                                                                                       //
  if (specificIds) {                                                                                                   // 605
    for (var i = 0; i < specificIds.length; ++i) {                                                                     // 606
      var id = specificIds[i];                                                                                         // 607
                                                                                                                       //
      var doc = self._docs.get(id);                                                                                    // 608
                                                                                                                       //
      if (doc) {                                                                                                       // 609
        var breakIfFalse = f(doc, id);                                                                                 // 610
        if (breakIfFalse === false) break;                                                                             // 611
      }                                                                                                                // 613
    }                                                                                                                  // 614
  } else {                                                                                                             // 615
    self._docs.forEach(f);                                                                                             // 616
  }                                                                                                                    // 617
};                                                                                                                     // 618
                                                                                                                       //
LocalCollection.prototype.remove = function (selector, callback) {                                                     // 620
  var self = this; // Easy special case: if we're not calling observeChanges callbacks and we're                       // 621
  // not saving originals and we got asked to remove everything, then just empty                                       // 624
  // everything directly.                                                                                              // 625
                                                                                                                       //
  if (self.paused && !self._savedOriginals && EJSON.equals(selector, {})) {                                            // 626
    var result = self._docs.size();                                                                                    // 627
                                                                                                                       //
    self._docs.clear();                                                                                                // 628
                                                                                                                       //
    _.each(self.queries, function (query) {                                                                            // 629
      if (query.ordered) {                                                                                             // 630
        query.results = [];                                                                                            // 631
      } else {                                                                                                         // 632
        query.results.clear();                                                                                         // 633
      }                                                                                                                // 634
    });                                                                                                                // 635
                                                                                                                       //
    if (callback) {                                                                                                    // 636
      Meteor.defer(function () {                                                                                       // 637
        callback(null, result);                                                                                        // 638
      });                                                                                                              // 639
    }                                                                                                                  // 640
                                                                                                                       //
    return result;                                                                                                     // 641
  }                                                                                                                    // 642
                                                                                                                       //
  var matcher = new Minimongo.Matcher(selector);                                                                       // 644
  var remove = [];                                                                                                     // 645
                                                                                                                       //
  self._eachPossiblyMatchingDoc(selector, function (doc, id) {                                                         // 646
    if (matcher.documentMatches(doc).result) remove.push(id);                                                          // 647
  });                                                                                                                  // 649
                                                                                                                       //
  var queriesToRecompute = [];                                                                                         // 651
  var queryRemove = [];                                                                                                // 652
                                                                                                                       //
  for (var i = 0; i < remove.length; i++) {                                                                            // 653
    var removeId = remove[i];                                                                                          // 654
                                                                                                                       //
    var removeDoc = self._docs.get(removeId);                                                                          // 655
                                                                                                                       //
    _.each(self.queries, function (query, qid) {                                                                       // 656
      if (query.dirty) return;                                                                                         // 657
                                                                                                                       //
      if (query.matcher.documentMatches(removeDoc).result) {                                                           // 659
        if (query.cursor.skip || query.cursor.limit) queriesToRecompute.push(qid);else queryRemove.push({              // 660
          qid: qid,                                                                                                    // 663
          doc: removeDoc                                                                                               // 663
        });                                                                                                            // 663
      }                                                                                                                // 664
    });                                                                                                                // 665
                                                                                                                       //
    self._saveOriginal(removeId, removeDoc);                                                                           // 666
                                                                                                                       //
    self._docs.remove(removeId);                                                                                       // 667
  } // run live query callbacks _after_ we've removed the documents.                                                   // 668
                                                                                                                       //
                                                                                                                       //
  _.each(queryRemove, function (remove) {                                                                              // 671
    var query = self.queries[remove.qid];                                                                              // 672
                                                                                                                       //
    if (query) {                                                                                                       // 673
      query.distances && query.distances.remove(remove.doc._id);                                                       // 674
                                                                                                                       //
      LocalCollection._removeFromResults(query, remove.doc);                                                           // 675
    }                                                                                                                  // 676
  });                                                                                                                  // 677
                                                                                                                       //
  _.each(queriesToRecompute, function (qid) {                                                                          // 678
    var query = self.queries[qid];                                                                                     // 679
    if (query) self._recomputeResults(query);                                                                          // 680
  });                                                                                                                  // 682
                                                                                                                       //
  self._observeQueue.drain();                                                                                          // 683
                                                                                                                       //
  result = remove.length;                                                                                              // 684
  if (callback) Meteor.defer(function () {                                                                             // 685
    callback(null, result);                                                                                            // 687
  });                                                                                                                  // 688
  return result;                                                                                                       // 689
}; // XXX atomicity: if multi is true, and one modification fails, do                                                  // 690
// we rollback the whole operation, or what?                                                                           // 693
                                                                                                                       //
                                                                                                                       //
LocalCollection.prototype.update = function (selector, mod, options, callback) {                                       // 694
  var self = this;                                                                                                     // 695
                                                                                                                       //
  if (!callback && options instanceof Function) {                                                                      // 696
    callback = options;                                                                                                // 697
    options = null;                                                                                                    // 698
  }                                                                                                                    // 699
                                                                                                                       //
  if (!options) options = {};                                                                                          // 700
  var matcher = new Minimongo.Matcher(selector); // Save the original results of any query that we might need to       // 702
  // _recomputeResults on, because _modifyAndNotify will mutate the objects in                                         // 705
  // it. (We don't need to save the original results of paused queries because                                         // 706
  // they already have a resultsSnapshot and we won't be diffing in                                                    // 707
  // _recomputeResults.)                                                                                               // 708
                                                                                                                       //
  var qidToOriginalResults = {}; // We should only clone each document once, even if it appears in multiple queries    // 709
                                                                                                                       //
  var docMap = new LocalCollection._IdMap();                                                                           // 711
                                                                                                                       //
  var idsMatchedBySelector = LocalCollection._idsMatchedBySelector(selector);                                          // 712
                                                                                                                       //
  _.each(self.queries, function (query, qid) {                                                                         // 714
    if ((query.cursor.skip || query.cursor.limit) && !self.paused) {                                                   // 715
      // Catch the case of a reactive `count()` on a cursor with skip                                                  // 716
      // or limit, which registers an unordered observe. This is a                                                     // 717
      // pretty rare case, so we just clone the entire result set with                                                 // 718
      // no optimizations for documents that appear in these result                                                    // 719
      // sets and other queries.                                                                                       // 720
      if (query.results instanceof LocalCollection._IdMap) {                                                           // 721
        qidToOriginalResults[qid] = query.results.clone();                                                             // 722
        return;                                                                                                        // 723
      }                                                                                                                // 724
                                                                                                                       //
      if (!(query.results instanceof Array)) {                                                                         // 726
        throw new Error("Assertion failed: query.results not an array");                                               // 727
      } // Clones a document to be stored in `qidToOriginalResults`                                                    // 728
      // because it may be modified before the new and old result sets                                                 // 731
      // are diffed. But if we know exactly which document IDs we're                                                   // 732
      // going to modify, then we only need to clone those.                                                            // 733
                                                                                                                       //
                                                                                                                       //
      var memoizedCloneIfNeeded = function (doc) {                                                                     // 734
        if (docMap.has(doc._id)) {                                                                                     // 735
          return docMap.get(doc._id);                                                                                  // 736
        } else {                                                                                                       // 737
          var docToMemoize;                                                                                            // 738
                                                                                                                       //
          if (idsMatchedBySelector && !_.any(idsMatchedBySelector, function (id) {                                     // 740
            return EJSON.equals(id, doc._id);                                                                          // 741
          })) {                                                                                                        // 742
            docToMemoize = doc;                                                                                        // 743
          } else {                                                                                                     // 744
            docToMemoize = EJSON.clone(doc);                                                                           // 745
          }                                                                                                            // 746
                                                                                                                       //
          docMap.set(doc._id, docToMemoize);                                                                           // 748
          return docToMemoize;                                                                                         // 749
        }                                                                                                              // 750
      };                                                                                                               // 751
                                                                                                                       //
      qidToOriginalResults[qid] = query.results.map(memoizedCloneIfNeeded);                                            // 753
    }                                                                                                                  // 754
  });                                                                                                                  // 755
                                                                                                                       //
  var recomputeQids = {};                                                                                              // 756
  var updateCount = 0;                                                                                                 // 758
                                                                                                                       //
  self._eachPossiblyMatchingDoc(selector, function (doc, id) {                                                         // 760
    var queryResult = matcher.documentMatches(doc);                                                                    // 761
                                                                                                                       //
    if (queryResult.result) {                                                                                          // 762
      // XXX Should we save the original even if mod ends up being a no-op?                                            // 763
      self._saveOriginal(id, doc);                                                                                     // 764
                                                                                                                       //
      self._modifyAndNotify(doc, mod, recomputeQids, queryResult.arrayIndices);                                        // 765
                                                                                                                       //
      ++updateCount;                                                                                                   // 766
      if (!options.multi) return false; // break                                                                       // 767
    }                                                                                                                  // 769
                                                                                                                       //
    return true;                                                                                                       // 770
  });                                                                                                                  // 771
                                                                                                                       //
  _.each(recomputeQids, function (dummy, qid) {                                                                        // 773
    var query = self.queries[qid];                                                                                     // 774
    if (query) self._recomputeResults(query, qidToOriginalResults[qid]);                                               // 775
  });                                                                                                                  // 777
                                                                                                                       //
  self._observeQueue.drain(); // If we are doing an upsert, and we didn't modify any documents yet, then               // 778
  // it's time to do an insert. Figure out what document we are inserting, and                                         // 781
  // generate an id for it.                                                                                            // 782
                                                                                                                       //
                                                                                                                       //
  var insertedId;                                                                                                      // 783
                                                                                                                       //
  if (updateCount === 0 && options.upsert) {                                                                           // 784
    var newDoc = LocalCollection._removeDollarOperators(selector);                                                     // 785
                                                                                                                       //
    LocalCollection._modify(newDoc, mod, {                                                                             // 786
      isInsert: true                                                                                                   // 786
    });                                                                                                                // 786
                                                                                                                       //
    if (!newDoc._id && options.insertedId) newDoc._id = options.insertedId;                                            // 787
    insertedId = self.insert(newDoc);                                                                                  // 789
    updateCount = 1;                                                                                                   // 790
  } // Return the number of affected documents, or in the upsert case, an object                                       // 791
  // containing the number of affected docs and the id of the doc that was                                             // 794
  // inserted, if any.                                                                                                 // 795
                                                                                                                       //
                                                                                                                       //
  var result;                                                                                                          // 796
                                                                                                                       //
  if (options._returnObject) {                                                                                         // 797
    result = {                                                                                                         // 798
      numberAffected: updateCount                                                                                      // 799
    };                                                                                                                 // 798
    if (insertedId !== undefined) result.insertedId = insertedId;                                                      // 801
  } else {                                                                                                             // 803
    result = updateCount;                                                                                              // 804
  }                                                                                                                    // 805
                                                                                                                       //
  if (callback) Meteor.defer(function () {                                                                             // 807
    callback(null, result);                                                                                            // 809
  });                                                                                                                  // 810
  return result;                                                                                                       // 811
}; // A convenience wrapper on update. LocalCollection.upsert(sel, mod) is                                             // 812
// equivalent to LocalCollection.update(sel, mod, { upsert: true, _returnObject:                                       // 815
// true }).                                                                                                            // 816
                                                                                                                       //
                                                                                                                       //
LocalCollection.prototype.upsert = function (selector, mod, options, callback) {                                       // 817
  var self = this;                                                                                                     // 818
                                                                                                                       //
  if (!callback && typeof options === "function") {                                                                    // 819
    callback = options;                                                                                                // 820
    options = {};                                                                                                      // 821
  }                                                                                                                    // 822
                                                                                                                       //
  return self.update(selector, mod, _.extend({}, options, {                                                            // 823
    upsert: true,                                                                                                      // 824
    _returnObject: true                                                                                                // 825
  }), callback);                                                                                                       // 823
};                                                                                                                     // 827
                                                                                                                       //
LocalCollection.prototype._modifyAndNotify = function (doc, mod, recomputeQids, arrayIndices) {                        // 829
  var self = this;                                                                                                     // 831
  var matched_before = {};                                                                                             // 833
                                                                                                                       //
  for (var qid in meteorBabelHelpers.sanitizeForInObject(self.queries)) {                                              // 834
    var query = self.queries[qid];                                                                                     // 835
    if (query.dirty) continue;                                                                                         // 836
                                                                                                                       //
    if (query.ordered) {                                                                                               // 838
      matched_before[qid] = query.matcher.documentMatches(doc).result;                                                 // 839
    } else {                                                                                                           // 840
      // Because we don't support skip or limit (yet) in unordered queries, we                                         // 841
      // can just do a direct lookup.                                                                                  // 842
      matched_before[qid] = query.results.has(doc._id);                                                                // 843
    }                                                                                                                  // 844
  }                                                                                                                    // 845
                                                                                                                       //
  var old_doc = EJSON.clone(doc);                                                                                      // 847
                                                                                                                       //
  LocalCollection._modify(doc, mod, {                                                                                  // 849
    arrayIndices: arrayIndices                                                                                         // 849
  });                                                                                                                  // 849
                                                                                                                       //
  for (qid in meteorBabelHelpers.sanitizeForInObject(self.queries)) {                                                  // 851
    query = self.queries[qid];                                                                                         // 852
    if (query.dirty) continue;                                                                                         // 853
    var before = matched_before[qid];                                                                                  // 855
    var afterMatch = query.matcher.documentMatches(doc);                                                               // 856
    var after = afterMatch.result;                                                                                     // 857
    if (after && query.distances && afterMatch.distance !== undefined) query.distances.set(doc._id, afterMatch.distance);
                                                                                                                       //
    if (query.cursor.skip || query.cursor.limit) {                                                                     // 861
      // We need to recompute any query where the doc may have been in the                                             // 862
      // cursor's window either before or after the update. (Note that if skip                                         // 863
      // or limit is set, "before" and "after" being true do not necessarily                                           // 864
      // mean that the document is in the cursor's output after skip/limit is                                          // 865
      // applied... but if they are false, then the document definitely is NOT                                         // 866
      // in the output. So it's safe to skip recompute if neither before or                                            // 867
      // after are true.)                                                                                              // 868
      if (before || after) recomputeQids[qid] = true;                                                                  // 869
    } else if (before && !after) {                                                                                     // 871
      LocalCollection._removeFromResults(query, doc);                                                                  // 872
    } else if (!before && after) {                                                                                     // 873
      LocalCollection._insertInResults(query, doc);                                                                    // 874
    } else if (before && after) {                                                                                      // 875
      LocalCollection._updateInResults(query, doc, old_doc);                                                           // 876
    }                                                                                                                  // 877
  }                                                                                                                    // 878
}; // XXX the sorted-query logic below is laughably inefficient. we'll                                                 // 879
// need to come up with a better datastructure for this.                                                               // 882
//                                                                                                                     // 883
// XXX the logic for observing with a skip or a limit is even more                                                     // 884
// laughably inefficient. we recompute the whole results every time!                                                   // 885
                                                                                                                       //
                                                                                                                       //
LocalCollection._insertInResults = function (query, doc) {                                                             // 887
  var fields = EJSON.clone(doc);                                                                                       // 888
  delete fields._id;                                                                                                   // 889
                                                                                                                       //
  if (query.ordered) {                                                                                                 // 890
    if (!query.sorter) {                                                                                               // 891
      query.addedBefore(doc._id, query.projectionFn(fields), null);                                                    // 892
      query.results.push(doc);                                                                                         // 893
    } else {                                                                                                           // 894
      var i = LocalCollection._insertInSortedList(query.sorter.getComparator({                                         // 895
        distances: query.distances                                                                                     // 896
      }), query.results, doc);                                                                                         // 896
                                                                                                                       //
      var next = query.results[i + 1];                                                                                 // 898
      if (next) next = next._id;else next = null;                                                                      // 899
      query.addedBefore(doc._id, query.projectionFn(fields), next);                                                    // 903
    }                                                                                                                  // 904
                                                                                                                       //
    query.added(doc._id, query.projectionFn(fields));                                                                  // 905
  } else {                                                                                                             // 906
    query.added(doc._id, query.projectionFn(fields));                                                                  // 907
    query.results.set(doc._id, doc);                                                                                   // 908
  }                                                                                                                    // 909
};                                                                                                                     // 910
                                                                                                                       //
LocalCollection._removeFromResults = function (query, doc) {                                                           // 912
  if (query.ordered) {                                                                                                 // 913
    var i = LocalCollection._findInOrderedResults(query, doc);                                                         // 914
                                                                                                                       //
    query.removed(doc._id);                                                                                            // 915
    query.results.splice(i, 1);                                                                                        // 916
  } else {                                                                                                             // 917
    var id = doc._id; // in case callback mutates doc                                                                  // 918
                                                                                                                       //
    query.removed(doc._id);                                                                                            // 919
    query.results.remove(id);                                                                                          // 920
  }                                                                                                                    // 921
};                                                                                                                     // 922
                                                                                                                       //
LocalCollection._updateInResults = function (query, doc, old_doc) {                                                    // 924
  if (!EJSON.equals(doc._id, old_doc._id)) throw new Error("Can't change a doc's _id while updating");                 // 925
  var projectionFn = query.projectionFn;                                                                               // 927
  var changedFields = DiffSequence.makeChangedFields(projectionFn(doc), projectionFn(old_doc));                        // 928
                                                                                                                       //
  if (!query.ordered) {                                                                                                // 931
    if (!_.isEmpty(changedFields)) {                                                                                   // 932
      query.changed(doc._id, changedFields);                                                                           // 933
      query.results.set(doc._id, doc);                                                                                 // 934
    }                                                                                                                  // 935
                                                                                                                       //
    return;                                                                                                            // 936
  }                                                                                                                    // 937
                                                                                                                       //
  var orig_idx = LocalCollection._findInOrderedResults(query, doc);                                                    // 939
                                                                                                                       //
  if (!_.isEmpty(changedFields)) query.changed(doc._id, changedFields);                                                // 941
  if (!query.sorter) return; // just take it out and put it back in again, and see if the index                        // 943
  // changes                                                                                                           // 947
                                                                                                                       //
  query.results.splice(orig_idx, 1);                                                                                   // 948
                                                                                                                       //
  var new_idx = LocalCollection._insertInSortedList(query.sorter.getComparator({                                       // 949
    distances: query.distances                                                                                         // 950
  }), query.results, doc);                                                                                             // 950
                                                                                                                       //
  if (orig_idx !== new_idx) {                                                                                          // 952
    var next = query.results[new_idx + 1];                                                                             // 953
    if (next) next = next._id;else next = null;                                                                        // 954
    query.movedBefore && query.movedBefore(doc._id, next);                                                             // 958
  }                                                                                                                    // 959
}; // Recomputes the results of a query and runs observe callbacks for the                                             // 960
// difference between the previous results and the current results (unless                                             // 963
// paused). Used for skip/limit queries.                                                                               // 964
//                                                                                                                     // 965
// When this is used by insert or remove, it can just use query.results for the                                        // 966
// old results (and there's no need to pass in oldResults), because these                                              // 967
// operations don't mutate the documents in the collection. Update needs to pass                                       // 968
// in an oldResults which was deep-copied before the modifier was applied.                                             // 969
//                                                                                                                     // 970
// oldResults is guaranteed to be ignored if the query is not paused.                                                  // 971
                                                                                                                       //
                                                                                                                       //
LocalCollection.prototype._recomputeResults = function (query, oldResults) {                                           // 972
  var self = this;                                                                                                     // 973
                                                                                                                       //
  if (self.paused) {                                                                                                   // 974
    // There's no reason to recompute the results now as we're still paused.                                           // 975
    // By flagging the query as "dirty", the recompute will be performed                                               // 976
    // when resumeObservers is called.                                                                                 // 977
    query.dirty = true;                                                                                                // 978
    return;                                                                                                            // 979
  }                                                                                                                    // 980
                                                                                                                       //
  if (!self.paused && !oldResults) oldResults = query.results;                                                         // 982
  if (query.distances) query.distances.clear();                                                                        // 984
  query.results = query.cursor._getRawObjects({                                                                        // 986
    ordered: query.ordered,                                                                                            // 987
    distances: query.distances                                                                                         // 987
  });                                                                                                                  // 986
                                                                                                                       //
  if (!self.paused) {                                                                                                  // 989
    LocalCollection._diffQueryChanges(query.ordered, oldResults, query.results, query, {                               // 990
      projectionFn: query.projectionFn                                                                                 // 992
    });                                                                                                                // 992
  }                                                                                                                    // 993
};                                                                                                                     // 994
                                                                                                                       //
LocalCollection._findInOrderedResults = function (query, doc) {                                                        // 997
  if (!query.ordered) throw new Error("Can't call _findInOrderedResults on unordered query");                          // 998
                                                                                                                       //
  for (var i = 0; i < query.results.length; i++) {                                                                     // 1000
    if (query.results[i] === doc) return i;                                                                            // 1001
  }                                                                                                                    // 1000
                                                                                                                       //
  throw Error("object missing from query");                                                                            // 1003
}; // This binary search puts a value between any equal values, and the first                                          // 1004
// lesser value.                                                                                                       // 1007
                                                                                                                       //
                                                                                                                       //
LocalCollection._binarySearch = function (cmp, array, value) {                                                         // 1008
  var first = 0,                                                                                                       // 1009
      rangeLength = array.length;                                                                                      // 1009
                                                                                                                       //
  while (rangeLength > 0) {                                                                                            // 1011
    var halfRange = Math.floor(rangeLength / 2);                                                                       // 1012
                                                                                                                       //
    if (cmp(value, array[first + halfRange]) >= 0) {                                                                   // 1013
      first += halfRange + 1;                                                                                          // 1014
      rangeLength -= halfRange + 1;                                                                                    // 1015
    } else {                                                                                                           // 1016
      rangeLength = halfRange;                                                                                         // 1017
    }                                                                                                                  // 1018
  }                                                                                                                    // 1019
                                                                                                                       //
  return first;                                                                                                        // 1020
};                                                                                                                     // 1021
                                                                                                                       //
LocalCollection._insertInSortedList = function (cmp, array, value) {                                                   // 1023
  if (array.length === 0) {                                                                                            // 1024
    array.push(value);                                                                                                 // 1025
    return 0;                                                                                                          // 1026
  }                                                                                                                    // 1027
                                                                                                                       //
  var idx = LocalCollection._binarySearch(cmp, array, value);                                                          // 1029
                                                                                                                       //
  array.splice(idx, 0, value);                                                                                         // 1030
  return idx;                                                                                                          // 1031
}; // To track what documents are affected by a piece of code, call saveOriginals()                                    // 1032
// before it and retrieveOriginals() after it. retrieveOriginals returns an                                            // 1035
// object whose keys are the ids of the documents that were affected since the                                         // 1036
// call to saveOriginals(), and the values are equal to the document's contents                                        // 1037
// at the time of saveOriginals. (In the case of an inserted document, undefined                                       // 1038
// is the value.) You must alternate between calls to saveOriginals() and                                              // 1039
// retrieveOriginals().                                                                                                // 1040
                                                                                                                       //
                                                                                                                       //
LocalCollection.prototype.saveOriginals = function () {                                                                // 1041
  var self = this;                                                                                                     // 1042
  if (self._savedOriginals) throw new Error("Called saveOriginals twice without retrieveOriginals");                   // 1043
  self._savedOriginals = new LocalCollection._IdMap();                                                                 // 1045
};                                                                                                                     // 1046
                                                                                                                       //
LocalCollection.prototype.retrieveOriginals = function () {                                                            // 1047
  var self = this;                                                                                                     // 1048
  if (!self._savedOriginals) throw new Error("Called retrieveOriginals without saveOriginals");                        // 1049
  var originals = self._savedOriginals;                                                                                // 1052
  self._savedOriginals = null;                                                                                         // 1053
  return originals;                                                                                                    // 1054
};                                                                                                                     // 1055
                                                                                                                       //
LocalCollection.prototype._saveOriginal = function (id, doc) {                                                         // 1057
  var self = this; // Are we even trying to save originals?                                                            // 1058
                                                                                                                       //
  if (!self._savedOriginals) return; // Have we previously mutated the original (and so 'doc' is not actually          // 1060
  // original)?  (Note the 'has' check rather than truth: we store undefined                                           // 1063
  // here for inserted docs!)                                                                                          // 1064
                                                                                                                       //
  if (self._savedOriginals.has(id)) return;                                                                            // 1065
                                                                                                                       //
  self._savedOriginals.set(id, EJSON.clone(doc));                                                                      // 1067
}; // Pause the observers. No callbacks from observers will fire until                                                 // 1068
// 'resumeObservers' is called.                                                                                        // 1071
                                                                                                                       //
                                                                                                                       //
LocalCollection.prototype.pauseObservers = function () {                                                               // 1072
  // No-op if already paused.                                                                                          // 1073
  if (this.paused) return; // Set the 'paused' flag such that new observer messages don't fire.                        // 1074
                                                                                                                       //
  this.paused = true; // Take a snapshot of the query results for each query.                                          // 1078
                                                                                                                       //
  for (var qid in meteorBabelHelpers.sanitizeForInObject(this.queries)) {                                              // 1081
    var query = this.queries[qid];                                                                                     // 1082
    query.resultsSnapshot = EJSON.clone(query.results);                                                                // 1084
  }                                                                                                                    // 1085
}; // Resume the observers. Observers immediately receive change                                                       // 1086
// notifications to bring them to the current state of the                                                             // 1089
// database. Note that this is not just replaying all the changes that                                                 // 1090
// happened during the pause, it is a smarter 'coalesced' diff.                                                        // 1091
                                                                                                                       //
                                                                                                                       //
LocalCollection.prototype.resumeObservers = function () {                                                              // 1092
  var self = this; // No-op if not paused.                                                                             // 1093
                                                                                                                       //
  if (!this.paused) return; // Unset the 'paused' flag. Make sure to do this first, otherwise                          // 1095
  // observer methods won't actually fire when we trigger them.                                                        // 1099
                                                                                                                       //
  this.paused = false;                                                                                                 // 1100
                                                                                                                       //
  for (var qid in meteorBabelHelpers.sanitizeForInObject(this.queries)) {                                              // 1102
    var query = self.queries[qid];                                                                                     // 1103
                                                                                                                       //
    if (query.dirty) {                                                                                                 // 1104
      query.dirty = false; // re-compute results will perform `LocalCollection._diffQueryChanges` automatically.       // 1105
                                                                                                                       //
      self._recomputeResults(query, query.resultsSnapshot);                                                            // 1107
    } else {                                                                                                           // 1108
      // Diff the current results against the snapshot and send to observers.                                          // 1109
      // pass the query object for its observer callbacks.                                                             // 1110
      LocalCollection._diffQueryChanges(query.ordered, query.resultsSnapshot, query.results, query, {                  // 1111
        projectionFn: query.projectionFn                                                                               // 1113
      });                                                                                                              // 1113
    }                                                                                                                  // 1114
                                                                                                                       //
    query.resultsSnapshot = null;                                                                                      // 1115
  }                                                                                                                    // 1116
                                                                                                                       //
  self._observeQueue.drain();                                                                                          // 1117
};                                                                                                                     // 1118
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"wrap_transform.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/wrap_transform.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// Wrap a transform function to return objects that have the _id field                                                 // 1
// of the untransformed document. This ensures that subsystems such as                                                 // 2
// the observe-sequence package that call `observe` can keep track of                                                  // 3
// the documents identities.                                                                                           // 4
//                                                                                                                     // 5
// - Require that it returns objects                                                                                   // 6
// - If the return value has an _id field, verify that it matches the                                                  // 7
//   original _id field                                                                                                // 8
// - If the return value doesn't have an _id field, add it back.                                                       // 9
LocalCollection.wrapTransform = function (transform) {                                                                 // 10
  if (!transform) return null; // No need to doubly-wrap transforms.                                                   // 11
                                                                                                                       //
  if (transform.__wrappedTransform__) return transform;                                                                // 15
                                                                                                                       //
  var wrapped = function (doc) {                                                                                       // 18
    if (!_.has(doc, '_id')) {                                                                                          // 19
      // XXX do we ever have a transform on the oplog's collection? because that                                       // 20
      // collection has no _id.                                                                                        // 21
      throw new Error("can only transform documents with _id");                                                        // 22
    }                                                                                                                  // 23
                                                                                                                       //
    var id = doc._id; // XXX consider making tracker a weak dependency and checking Package.tracker here               // 25
                                                                                                                       //
    var transformed = Tracker.nonreactive(function () {                                                                // 27
      return transform(doc);                                                                                           // 28
    });                                                                                                                // 29
                                                                                                                       //
    if (!isPlainObject(transformed)) {                                                                                 // 31
      throw new Error("transform must return object");                                                                 // 32
    }                                                                                                                  // 33
                                                                                                                       //
    if (_.has(transformed, '_id')) {                                                                                   // 35
      if (!EJSON.equals(transformed._id, id)) {                                                                        // 36
        throw new Error("transformed document can't have different _id");                                              // 37
      }                                                                                                                // 38
    } else {                                                                                                           // 39
      transformed._id = id;                                                                                            // 40
    }                                                                                                                  // 41
                                                                                                                       //
    return transformed;                                                                                                // 42
  };                                                                                                                   // 43
                                                                                                                       //
  wrapped.__wrappedTransform__ = true;                                                                                 // 44
  return wrapped;                                                                                                      // 45
};                                                                                                                     // 46
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"helpers.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/helpers.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// Like _.isArray, but doesn't regard polyfilled Uint8Arrays on old browsers as                                        // 1
// arrays.                                                                                                             // 2
// XXX maybe this should be EJSON.isArray                                                                              // 3
isArray = function (x) {                                                                                               // 4
  return _.isArray(x) && !EJSON.isBinary(x);                                                                           // 5
}; // XXX maybe this should be EJSON.isObject, though EJSON doesn't know about                                         // 6
// RegExp                                                                                                              // 9
// XXX note that _type(undefined) === 3!!!!                                                                            // 10
                                                                                                                       //
                                                                                                                       //
isPlainObject = LocalCollection._isPlainObject = function (x) {                                                        // 11
  return x && LocalCollection._f._type(x) === 3;                                                                       // 12
};                                                                                                                     // 13
                                                                                                                       //
isIndexable = function (x) {                                                                                           // 15
  return isArray(x) || isPlainObject(x);                                                                               // 16
}; // Returns true if this is an object with at least one key and all keys begin                                       // 17
// with $.  Unless inconsistentOK is set, throws if some keys begin with $ and                                         // 20
// others don't.                                                                                                       // 21
                                                                                                                       //
                                                                                                                       //
isOperatorObject = function (valueSelector, inconsistentOK) {                                                          // 22
  if (!isPlainObject(valueSelector)) return false;                                                                     // 23
  var theseAreOperators = undefined;                                                                                   // 26
                                                                                                                       //
  _.each(valueSelector, function (value, selKey) {                                                                     // 27
    var thisIsOperator = selKey.substr(0, 1) === '$';                                                                  // 28
                                                                                                                       //
    if (theseAreOperators === undefined) {                                                                             // 29
      theseAreOperators = thisIsOperator;                                                                              // 30
    } else if (theseAreOperators !== thisIsOperator) {                                                                 // 31
      if (!inconsistentOK) throw new Error("Inconsistent operator: " + JSON.stringify(valueSelector));                 // 32
      theseAreOperators = false;                                                                                       // 35
    }                                                                                                                  // 36
  });                                                                                                                  // 37
                                                                                                                       //
  return !!theseAreOperators; // {} has no operators                                                                   // 38
}; // string can be converted to integer                                                                               // 39
                                                                                                                       //
                                                                                                                       //
isNumericKey = function (s) {                                                                                          // 43
  return (/^[0-9]+$/.test(s)                                                                                           // 44
  );                                                                                                                   // 44
};                                                                                                                     // 45
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"selector.js":["babel-runtime/helpers/typeof",function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/selector.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                                //
                                                                                                                       //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                       //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
// The minimongo selector compiler!                                                                                    // 1
// Terminology:                                                                                                        // 3
//  - a "selector" is the EJSON object representing a selector                                                         // 4
//  - a "matcher" is its compiled form (whether a full Minimongo.Matcher                                               // 5
//    object or one of the component lambdas that matches parts of it)                                                 // 6
//  - a "result object" is an object with a "result" field and maybe                                                   // 7
//    distance and arrayIndices.                                                                                       // 8
//  - a "branched value" is an object with a "value" field and maybe                                                   // 9
//    "dontIterate" and "arrayIndices".                                                                                // 10
//  - a "document" is a top-level object that can be stored in a collection.                                           // 11
//  - a "lookup function" is a function that takes in a document and returns                                           // 12
//    an array of "branched values".                                                                                   // 13
//  - a "branched matcher" maps from an array of branched values to a result                                           // 14
//    object.                                                                                                          // 15
//  - an "element matcher" maps from a single value to a bool.                                                         // 16
// Main entry point.                                                                                                   // 18
//   var matcher = new Minimongo.Matcher({a: {$gt: 5}});                                                               // 19
//   if (matcher.documentMatches({a: 7})) ...                                                                          // 20
Minimongo.Matcher = function (selector) {                                                                              // 21
  var self = this; // A set (object mapping string -> *) of all of the document paths looked                           // 22
  // at by the selector. Also includes the empty string if it may look at any                                          // 24
  // path (eg, $where).                                                                                                // 25
                                                                                                                       //
  self._paths = {}; // Set to true if compilation finds a $near.                                                       // 26
                                                                                                                       //
  self._hasGeoQuery = false; // Set to true if compilation finds a $where.                                             // 28
                                                                                                                       //
  self._hasWhere = false; // Set to false if compilation finds anything other than a simple equality or                // 30
  // one or more of '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin' used with                                       // 32
  // scalars as operands.                                                                                              // 33
                                                                                                                       //
  self._isSimple = true; // Set to a dummy document which always matches this Matcher. Or set to null                  // 34
  // if such document is too hard to find.                                                                             // 36
                                                                                                                       //
  self._matchingDocument = undefined; // A clone of the original selector. It may just be a function if the user       // 37
  // passed in a function; otherwise is definitely an object (eg, IDs are                                              // 39
  // translated into {_id: ID} first. Used by canBecomeTrueByModifier and                                              // 40
  // Sorter._useWithMatcher.                                                                                           // 41
                                                                                                                       //
  self._selector = null;                                                                                               // 42
  self._docMatcher = self._compileSelector(selector);                                                                  // 43
};                                                                                                                     // 44
                                                                                                                       //
_.extend(Minimongo.Matcher.prototype, {                                                                                // 46
  documentMatches: function (doc) {                                                                                    // 47
    if (!doc || (typeof doc === "undefined" ? "undefined" : (0, _typeof3.default)(doc)) !== "object") {                // 48
      throw Error("documentMatches needs a document");                                                                 // 49
    }                                                                                                                  // 50
                                                                                                                       //
    return this._docMatcher(doc);                                                                                      // 51
  },                                                                                                                   // 52
  hasGeoQuery: function () {                                                                                           // 53
    return this._hasGeoQuery;                                                                                          // 54
  },                                                                                                                   // 55
  hasWhere: function () {                                                                                              // 56
    return this._hasWhere;                                                                                             // 57
  },                                                                                                                   // 58
  isSimple: function () {                                                                                              // 59
    return this._isSimple;                                                                                             // 60
  },                                                                                                                   // 61
  // Given a selector, return a function that takes one argument, a                                                    // 63
  // document. It returns a result object.                                                                             // 64
  _compileSelector: function (selector) {                                                                              // 65
    var self = this; // you can pass a literal function instead of a selector                                          // 66
                                                                                                                       //
    if (selector instanceof Function) {                                                                                // 68
      self._isSimple = false;                                                                                          // 69
      self._selector = selector;                                                                                       // 70
                                                                                                                       //
      self._recordPathUsed('');                                                                                        // 71
                                                                                                                       //
      return function (doc) {                                                                                          // 72
        return {                                                                                                       // 73
          result: !!selector.call(doc)                                                                                 // 73
        };                                                                                                             // 73
      };                                                                                                               // 74
    } // shorthand -- scalars match _id                                                                                // 75
                                                                                                                       //
                                                                                                                       //
    if (LocalCollection._selectorIsId(selector)) {                                                                     // 78
      self._selector = {                                                                                               // 79
        _id: selector                                                                                                  // 79
      };                                                                                                               // 79
                                                                                                                       //
      self._recordPathUsed('_id');                                                                                     // 80
                                                                                                                       //
      return function (doc) {                                                                                          // 81
        return {                                                                                                       // 82
          result: EJSON.equals(doc._id, selector)                                                                      // 82
        };                                                                                                             // 82
      };                                                                                                               // 83
    } // protect against dangerous selectors.  falsey and {_id: falsey} are both                                       // 84
    // likely programmer error, and not what you want, particularly for                                                // 87
    // destructive operations.                                                                                         // 88
                                                                                                                       //
                                                                                                                       //
    if (!selector || '_id' in selector && !selector._id) {                                                             // 89
      self._isSimple = false;                                                                                          // 90
      return nothingMatcher;                                                                                           // 91
    } // Top level can't be an array or true or binary.                                                                // 92
                                                                                                                       //
                                                                                                                       //
    if (typeof selector === 'boolean' || isArray(selector) || EJSON.isBinary(selector)) throw new Error("Invalid selector: " + selector);
    self._selector = EJSON.clone(selector);                                                                            // 99
    return compileDocumentSelector(selector, self, {                                                                   // 100
      isRoot: true                                                                                                     // 100
    });                                                                                                                // 100
  },                                                                                                                   // 101
  _recordPathUsed: function (path) {                                                                                   // 102
    this._paths[path] = true;                                                                                          // 103
  },                                                                                                                   // 104
  // Returns a list of key paths the given selector is looking for. It includes                                        // 105
  // the empty string if there is a $where.                                                                            // 106
  _getPaths: function () {                                                                                             // 107
    return _.keys(this._paths);                                                                                        // 108
  }                                                                                                                    // 109
}); // Takes in a selector that could match a full document (eg, the original                                          // 46
// selector). Returns a function mapping document->result object.                                                      // 114
//                                                                                                                     // 115
// matcher is the Matcher object we are compiling.                                                                     // 116
//                                                                                                                     // 117
// If this is the root document selector (ie, not wrapped in $and or the like),                                        // 118
// then isRoot is true. (This is used by $near.)                                                                       // 119
                                                                                                                       //
                                                                                                                       //
var compileDocumentSelector = function (docSelector, matcher, options) {                                               // 120
  options = options || {};                                                                                             // 121
  var docMatchers = [];                                                                                                // 122
                                                                                                                       //
  _.each(docSelector, function (subSelector, key) {                                                                    // 123
    if (key.substr(0, 1) === '$') {                                                                                    // 124
      // Outer operators are either logical operators (they recurse back into                                          // 125
      // this function), or $where.                                                                                    // 126
      if (!_.has(LOGICAL_OPERATORS, key)) throw new Error("Unrecognized logical operator: " + key);                    // 127
      matcher._isSimple = false;                                                                                       // 129
      docMatchers.push(LOGICAL_OPERATORS[key](subSelector, matcher, options.inElemMatch));                             // 130
    } else {                                                                                                           // 132
      // Record this path, but only if we aren't in an elemMatcher, since in an                                        // 133
      // elemMatch this is a path inside an object in an array, not in the doc                                         // 134
      // root.                                                                                                         // 135
      if (!options.inElemMatch) matcher._recordPathUsed(key);                                                          // 136
      var lookUpByIndex = makeLookupFunction(key);                                                                     // 138
      var valueMatcher = compileValueSelector(subSelector, matcher, options.isRoot);                                   // 139
      docMatchers.push(function (doc) {                                                                                // 141
        var branchValues = lookUpByIndex(doc);                                                                         // 142
        return valueMatcher(branchValues);                                                                             // 143
      });                                                                                                              // 144
    }                                                                                                                  // 145
  });                                                                                                                  // 146
                                                                                                                       //
  return andDocumentMatchers(docMatchers);                                                                             // 148
}; // Takes in a selector that could match a key-indexed value in a document; eg,                                      // 149
// {$gt: 5, $lt: 9}, or a regular expression, or any non-expression object (to                                         // 152
// indicate equality).  Returns a branched matcher: a function mapping                                                 // 153
// [branched value]->result object.                                                                                    // 154
                                                                                                                       //
                                                                                                                       //
var compileValueSelector = function (valueSelector, matcher, isRoot) {                                                 // 155
  if (valueSelector instanceof RegExp) {                                                                               // 156
    matcher._isSimple = false;                                                                                         // 157
    return convertElementMatcherToBranchedMatcher(regexpElementMatcher(valueSelector));                                // 158
  } else if (isOperatorObject(valueSelector)) {                                                                        // 160
    return operatorBranchedMatcher(valueSelector, matcher, isRoot);                                                    // 161
  } else {                                                                                                             // 162
    return convertElementMatcherToBranchedMatcher(equalityElementMatcher(valueSelector));                              // 163
  }                                                                                                                    // 165
}; // Given an element matcher (which evaluates a single value), returns a branched                                    // 166
// value (which evaluates the element matcher on all the branches and returns a                                        // 169
// more structured return value possibly including arrayIndices).                                                      // 170
                                                                                                                       //
                                                                                                                       //
var convertElementMatcherToBranchedMatcher = function (elementMatcher, options) {                                      // 171
  options = options || {};                                                                                             // 173
  return function (branches) {                                                                                         // 174
    var expanded = branches;                                                                                           // 175
                                                                                                                       //
    if (!options.dontExpandLeafArrays) {                                                                               // 176
      expanded = expandArraysInBranches(branches, options.dontIncludeLeafArrays);                                      // 177
    }                                                                                                                  // 179
                                                                                                                       //
    var ret = {};                                                                                                      // 180
    ret.result = _.any(expanded, function (element) {                                                                  // 181
      var matched = elementMatcher(element.value); // Special case for $elemMatch: it means "true, and use this as an array
      // index if I didn't already have one".                                                                          // 185
                                                                                                                       //
      if (typeof matched === 'number') {                                                                               // 186
        // XXX This code dates from when we only stored a single array index                                           // 187
        // (for the outermost array). Should we be also including deeper array                                         // 188
        // indices from the $elemMatch match?                                                                          // 189
        if (!element.arrayIndices) element.arrayIndices = [matched];                                                   // 190
        matched = true;                                                                                                // 192
      } // If some element matched, and it's tagged with array indices, include                                        // 193
      // those indices in our result object.                                                                           // 196
                                                                                                                       //
                                                                                                                       //
      if (matched && element.arrayIndices) ret.arrayIndices = element.arrayIndices;                                    // 197
      return matched;                                                                                                  // 200
    });                                                                                                                // 201
    return ret;                                                                                                        // 202
  };                                                                                                                   // 203
}; // Takes a RegExp object and returns an element matcher.                                                            // 204
                                                                                                                       //
                                                                                                                       //
regexpElementMatcher = function (regexp) {                                                                             // 207
  return function (value) {                                                                                            // 208
    if (value instanceof RegExp) {                                                                                     // 209
      // Comparing two regexps means seeing if the regexps are identical                                               // 210
      // (really!). Underscore knows how.                                                                              // 211
      return _.isEqual(value, regexp);                                                                                 // 212
    } // Regexps only work against strings.                                                                            // 213
                                                                                                                       //
                                                                                                                       //
    if (typeof value !== 'string') return false; // Reset regexp's state to avoid inconsistent matching for objects with the
    // same value on consecutive calls of regexp.test. This happens only if the                                        // 219
    // regexp has the 'g' flag. Also note that ES6 introduces a new flag 'y' for                                       // 220
    // which we should *not* change the lastIndex but MongoDB doesn't support                                          // 221
    // either of these flags.                                                                                          // 222
                                                                                                                       //
    regexp.lastIndex = 0;                                                                                              // 223
    return regexp.test(value);                                                                                         // 225
  };                                                                                                                   // 226
}; // Takes something that is not an operator object and returns an element matcher                                    // 227
// for equality with that thing.                                                                                       // 230
                                                                                                                       //
                                                                                                                       //
equalityElementMatcher = function (elementSelector) {                                                                  // 231
  if (isOperatorObject(elementSelector)) throw Error("Can't create equalityValueSelector for operator object"); // Special-case: null and undefined are equal (if you got undefined in there
  // somewhere, or if you got it due to some branch being non-existent in the                                          // 236
  // weird special case), even though they aren't with EJSON.equals.                                                   // 237
                                                                                                                       //
  if (elementSelector == null) {                                                                                       // 238
    // undefined or null                                                                                               // 238
    return function (value) {                                                                                          // 239
      return value == null; // undefined or null                                                                       // 240
    };                                                                                                                 // 241
  }                                                                                                                    // 242
                                                                                                                       //
  return function (value) {                                                                                            // 244
    return LocalCollection._f._equal(elementSelector, value);                                                          // 245
  };                                                                                                                   // 246
}; // Takes an operator object (an object with $ keys) and returns a branched                                          // 247
// matcher for it.                                                                                                     // 250
                                                                                                                       //
                                                                                                                       //
var operatorBranchedMatcher = function (valueSelector, matcher, isRoot) {                                              // 251
  // Each valueSelector works separately on the various branches.  So one                                              // 252
  // operator can match one branch and another can match another branch.  This                                         // 253
  // is OK.                                                                                                            // 254
  var operatorMatchers = [];                                                                                           // 256
                                                                                                                       //
  _.each(valueSelector, function (operand, operator) {                                                                 // 257
    var simpleRange = _.contains(['$lt', '$lte', '$gt', '$gte'], operator) && _.isNumber(operand);                     // 258
                                                                                                                       //
    var simpleEquality = _.contains(['$ne', '$eq'], operator) && !_.isObject(operand);                                 // 260
    var simpleInclusion = _.contains(['$in', '$nin'], operator) && _.isArray(operand) && !_.any(operand, _.isObject);  // 261
                                                                                                                       //
    if (!(simpleRange || simpleInclusion || simpleEquality)) {                                                         // 264
      matcher._isSimple = false;                                                                                       // 265
    }                                                                                                                  // 266
                                                                                                                       //
    if (_.has(VALUE_OPERATORS, operator)) {                                                                            // 268
      operatorMatchers.push(VALUE_OPERATORS[operator](operand, valueSelector, matcher, isRoot));                       // 269
    } else if (_.has(ELEMENT_OPERATORS, operator)) {                                                                   // 271
      var options = ELEMENT_OPERATORS[operator];                                                                       // 272
      operatorMatchers.push(convertElementMatcherToBranchedMatcher(options.compileElementSelector(operand, valueSelector, matcher), options));
    } else {                                                                                                           // 278
      throw new Error("Unrecognized operator: " + operator);                                                           // 279
    }                                                                                                                  // 280
  });                                                                                                                  // 281
                                                                                                                       //
  return andBranchedMatchers(operatorMatchers);                                                                        // 283
};                                                                                                                     // 284
                                                                                                                       //
var compileArrayOfDocumentSelectors = function (selectors, matcher, inElemMatch) {                                     // 286
  if (!isArray(selectors) || _.isEmpty(selectors)) throw Error("$and/$or/$nor must be nonempty array");                // 288
  return _.map(selectors, function (subSelector) {                                                                     // 290
    if (!isPlainObject(subSelector)) throw Error("$or/$and/$nor entries need to be full objects");                     // 291
    return compileDocumentSelector(subSelector, matcher, {                                                             // 293
      inElemMatch: inElemMatch                                                                                         // 294
    });                                                                                                                // 294
  });                                                                                                                  // 295
}; // Operators that appear at the top level of a document selector.                                                   // 296
                                                                                                                       //
                                                                                                                       //
var LOGICAL_OPERATORS = {                                                                                              // 299
  $and: function (subSelector, matcher, inElemMatch) {                                                                 // 300
    var matchers = compileArrayOfDocumentSelectors(subSelector, matcher, inElemMatch);                                 // 301
    return andDocumentMatchers(matchers);                                                                              // 303
  },                                                                                                                   // 304
  $or: function (subSelector, matcher, inElemMatch) {                                                                  // 306
    var matchers = compileArrayOfDocumentSelectors(subSelector, matcher, inElemMatch); // Special case: if there is only one matcher, use it directly, *preserving*
    // any arrayIndices it returns.                                                                                    // 311
                                                                                                                       //
    if (matchers.length === 1) return matchers[0];                                                                     // 312
    return function (doc) {                                                                                            // 315
      var result = _.any(matchers, function (f) {                                                                      // 316
        return f(doc).result;                                                                                          // 317
      }); // $or does NOT set arrayIndices when it has multiple                                                        // 318
      // sub-expressions. (Tested against MongoDB.)                                                                    // 320
                                                                                                                       //
                                                                                                                       //
      return {                                                                                                         // 321
        result: result                                                                                                 // 321
      };                                                                                                               // 321
    };                                                                                                                 // 322
  },                                                                                                                   // 323
  $nor: function (subSelector, matcher, inElemMatch) {                                                                 // 325
    var matchers = compileArrayOfDocumentSelectors(subSelector, matcher, inElemMatch);                                 // 326
    return function (doc) {                                                                                            // 328
      var result = _.all(matchers, function (f) {                                                                      // 329
        return !f(doc).result;                                                                                         // 330
      }); // Never set arrayIndices, because we only match if nothing in particular                                    // 331
      // "matched" (and because this is consistent with MongoDB).                                                      // 333
                                                                                                                       //
                                                                                                                       //
      return {                                                                                                         // 334
        result: result                                                                                                 // 334
      };                                                                                                               // 334
    };                                                                                                                 // 335
  },                                                                                                                   // 336
  $where: function (selectorValue, matcher) {                                                                          // 338
    // Record that *any* path may be used.                                                                             // 339
    matcher._recordPathUsed('');                                                                                       // 340
                                                                                                                       //
    matcher._hasWhere = true;                                                                                          // 341
                                                                                                                       //
    if (!(selectorValue instanceof Function)) {                                                                        // 342
      // XXX MongoDB seems to have more complex logic to decide where or or not                                        // 343
      // to add "return"; not sure exactly what it is.                                                                 // 344
      selectorValue = Function("obj", "return " + selectorValue);                                                      // 345
    }                                                                                                                  // 346
                                                                                                                       //
    return function (doc) {                                                                                            // 347
      // We make the document available as both `this` and `obj`.                                                      // 348
      // XXX not sure what we should do if this throws                                                                 // 349
      return {                                                                                                         // 350
        result: selectorValue.call(doc, doc)                                                                           // 350
      };                                                                                                               // 350
    };                                                                                                                 // 351
  },                                                                                                                   // 352
  // This is just used as a comment in the query (in MongoDB, it also ends up in                                       // 354
  // query logs); it has no effect on the actual selection.                                                            // 355
  $comment: function () {                                                                                              // 356
    return function () {                                                                                               // 357
      return {                                                                                                         // 358
        result: true                                                                                                   // 358
      };                                                                                                               // 358
    };                                                                                                                 // 359
  }                                                                                                                    // 360
}; // Returns a branched matcher that matches iff the given matcher does not.                                          // 299
// Note that this implicitly "deMorganizes" the wrapped function.  ie, it                                              // 364
// means that ALL branch values need to fail to match innerBranchedMatcher.                                            // 365
                                                                                                                       //
var invertBranchedMatcher = function (branchedMatcher) {                                                               // 366
  return function (branchValues) {                                                                                     // 367
    var invertMe = branchedMatcher(branchValues); // We explicitly choose to strip arrayIndices here: it doesn't make sense to
    // say "update the array element that does not match something", at least                                          // 370
    // in mongo-land.                                                                                                  // 371
                                                                                                                       //
    return {                                                                                                           // 372
      result: !invertMe.result                                                                                         // 372
    };                                                                                                                 // 372
  };                                                                                                                   // 373
}; // Operators that (unlike LOGICAL_OPERATORS) pertain to individual paths in a                                       // 374
// document, but (unlike ELEMENT_OPERATORS) do not have a simple definition as                                         // 377
// "match each branched value independently and combine with                                                           // 378
// convertElementMatcherToBranchedMatcher".                                                                            // 379
                                                                                                                       //
                                                                                                                       //
var VALUE_OPERATORS = {                                                                                                // 380
  $eq: function (operand) {                                                                                            // 381
    return convertElementMatcherToBranchedMatcher(equalityElementMatcher(operand));                                    // 382
  },                                                                                                                   // 384
  $not: function (operand, valueSelector, matcher) {                                                                   // 385
    return invertBranchedMatcher(compileValueSelector(operand, matcher));                                              // 386
  },                                                                                                                   // 387
  $ne: function (operand) {                                                                                            // 388
    return invertBranchedMatcher(convertElementMatcherToBranchedMatcher(equalityElementMatcher(operand)));             // 389
  },                                                                                                                   // 391
  $nin: function (operand) {                                                                                           // 392
    return invertBranchedMatcher(convertElementMatcherToBranchedMatcher(ELEMENT_OPERATORS.$in.compileElementSelector(operand)));
  },                                                                                                                   // 395
  $exists: function (operand) {                                                                                        // 396
    var exists = convertElementMatcherToBranchedMatcher(function (value) {                                             // 397
      return value !== undefined;                                                                                      // 398
    });                                                                                                                // 399
    return operand ? exists : invertBranchedMatcher(exists);                                                           // 400
  },                                                                                                                   // 401
  // $options just provides options for $regex; its logic is inside $regex                                             // 402
  $options: function (operand, valueSelector) {                                                                        // 403
    if (!_.has(valueSelector, '$regex')) throw Error("$options needs a $regex");                                       // 404
    return everythingMatcher;                                                                                          // 406
  },                                                                                                                   // 407
  // $maxDistance is basically an argument to $near                                                                    // 408
  $maxDistance: function (operand, valueSelector) {                                                                    // 409
    if (!valueSelector.$near) throw Error("$maxDistance needs a $near");                                               // 410
    return everythingMatcher;                                                                                          // 412
  },                                                                                                                   // 413
  $all: function (operand, valueSelector, matcher) {                                                                   // 414
    if (!isArray(operand)) throw Error("$all requires array"); // Not sure why, but this seems to be what MongoDB does.
                                                                                                                       //
    if (_.isEmpty(operand)) return nothingMatcher;                                                                     // 418
    var branchedMatchers = [];                                                                                         // 421
                                                                                                                       //
    _.each(operand, function (criterion) {                                                                             // 422
      // XXX handle $all/$elemMatch combination                                                                        // 423
      if (isOperatorObject(criterion)) throw Error("no $ expressions in $all"); // This is always a regexp or equality selector.
                                                                                                                       //
      branchedMatchers.push(compileValueSelector(criterion, matcher));                                                 // 427
    }); // andBranchedMatchers does NOT require all selectors to return true on the                                    // 428
    // SAME branch.                                                                                                    // 430
                                                                                                                       //
                                                                                                                       //
    return andBranchedMatchers(branchedMatchers);                                                                      // 431
  },                                                                                                                   // 432
  $near: function (operand, valueSelector, matcher, isRoot) {                                                          // 433
    if (!isRoot) throw Error("$near can't be inside another $ operator");                                              // 434
    matcher._hasGeoQuery = true; // There are two kinds of geodata in MongoDB: legacy coordinate pairs and             // 436
    // GeoJSON. They use different distance metrics, too. GeoJSON queries are                                          // 439
    // marked with a $geometry property, though legacy coordinates can be                                              // 440
    // matched using $geometry.                                                                                        // 441
                                                                                                                       //
    var maxDistance, point, distance;                                                                                  // 443
                                                                                                                       //
    if (isPlainObject(operand) && _.has(operand, '$geometry')) {                                                       // 444
      // GeoJSON "2dsphere" mode.                                                                                      // 445
      maxDistance = operand.$maxDistance;                                                                              // 446
      point = operand.$geometry;                                                                                       // 447
                                                                                                                       //
      distance = function (value) {                                                                                    // 448
        // XXX: for now, we don't calculate the actual distance between, say,                                          // 449
        // polygon and circle. If people care about this use-case it will get                                          // 450
        // a priority.                                                                                                 // 451
        if (!value) return null;                                                                                       // 452
        if (!value.type) return GeoJSON.pointDistance(point, {                                                         // 454
          type: "Point",                                                                                               // 456
          coordinates: pointToArray(value)                                                                             // 456
        });                                                                                                            // 456
                                                                                                                       //
        if (value.type === "Point") {                                                                                  // 457
          return GeoJSON.pointDistance(point, value);                                                                  // 458
        } else {                                                                                                       // 459
          return GeoJSON.geometryWithinRadius(value, point, maxDistance) ? 0 : maxDistance + 1;                        // 460
        }                                                                                                              // 462
      };                                                                                                               // 463
    } else {                                                                                                           // 464
      maxDistance = valueSelector.$maxDistance;                                                                        // 465
      if (!isArray(operand) && !isPlainObject(operand)) throw Error("$near argument must be coordinate pair or GeoJSON");
      point = pointToArray(operand);                                                                                   // 468
                                                                                                                       //
      distance = function (value) {                                                                                    // 469
        if (!isArray(value) && !isPlainObject(value)) return null;                                                     // 470
        return distanceCoordinatePairs(point, value);                                                                  // 472
      };                                                                                                               // 473
    }                                                                                                                  // 474
                                                                                                                       //
    return function (branchedValues) {                                                                                 // 476
      // There might be multiple points in the document that match the given                                           // 477
      // field. Only one of them needs to be within $maxDistance, but we need to                                       // 478
      // evaluate all of them and use the nearest one for the implicit sort                                            // 479
      // specifier. (That's why we can't just use ELEMENT_OPERATORS here.)                                             // 480
      //                                                                                                               // 481
      // Note: This differs from MongoDB's implementation, where a document will                                       // 482
      // actually show up *multiple times* in the result set, with one entry for                                       // 483
      // each within-$maxDistance branching point.                                                                     // 484
      branchedValues = expandArraysInBranches(branchedValues);                                                         // 485
      var result = {                                                                                                   // 486
        result: false                                                                                                  // 486
      };                                                                                                               // 486
                                                                                                                       //
      _.each(branchedValues, function (branch) {                                                                       // 487
        if (!((0, _typeof3.default)(branch.value) === "object")) {                                                     // 488
          return;                                                                                                      // 489
        }                                                                                                              // 490
                                                                                                                       //
        var curDistance = distance(branch.value); // Skip branches that aren't real points or are too far away.        // 491
                                                                                                                       //
        if (curDistance === null || curDistance > maxDistance) return; // Skip anything that's a tie.                  // 493
                                                                                                                       //
        if (result.distance !== undefined && result.distance <= curDistance) return;                                   // 496
        result.result = true;                                                                                          // 498
        result.distance = curDistance;                                                                                 // 499
        if (!branch.arrayIndices) delete result.arrayIndices;else result.arrayIndices = branch.arrayIndices;           // 500
      });                                                                                                              // 504
                                                                                                                       //
      return result;                                                                                                   // 505
    };                                                                                                                 // 506
  }                                                                                                                    // 507
}; // Helpers for $near.                                                                                               // 380
                                                                                                                       //
var distanceCoordinatePairs = function (a, b) {                                                                        // 511
  a = pointToArray(a);                                                                                                 // 512
  b = pointToArray(b);                                                                                                 // 513
  var x = a[0] - b[0];                                                                                                 // 514
  var y = a[1] - b[1];                                                                                                 // 515
  if (_.isNaN(x) || _.isNaN(y)) return null;                                                                           // 516
  return Math.sqrt(x * x + y * y);                                                                                     // 518
}; // Makes sure we get 2 elements array and assume the first one to be x and                                          // 519
// the second one to y no matter what user passes.                                                                     // 521
// In case user passes { lon: x, lat: y } returns [x, y]                                                               // 522
                                                                                                                       //
                                                                                                                       //
var pointToArray = function (point) {                                                                                  // 523
  return _.map(point, _.identity);                                                                                     // 524
}; // Helper for $lt/$gt/$lte/$gte.                                                                                    // 525
                                                                                                                       //
                                                                                                                       //
var makeInequality = function (cmpValueComparator) {                                                                   // 528
  return {                                                                                                             // 529
    compileElementSelector: function (operand) {                                                                       // 530
      // Arrays never compare false with non-arrays for any inequality.                                                // 531
      // XXX This was behavior we observed in pre-release MongoDB 2.5, but                                             // 532
      //     it seems to have been reverted.                                                                           // 533
      //     See https://jira.mongodb.org/browse/SERVER-11444                                                          // 534
      if (isArray(operand)) {                                                                                          // 535
        return function () {                                                                                           // 536
          return false;                                                                                                // 537
        };                                                                                                             // 538
      } // Special case: consider undefined and null the same (so true with                                            // 539
      // $gte/$lte).                                                                                                   // 542
                                                                                                                       //
                                                                                                                       //
      if (operand === undefined) operand = null;                                                                       // 543
                                                                                                                       //
      var operandType = LocalCollection._f._type(operand);                                                             // 546
                                                                                                                       //
      return function (value) {                                                                                        // 548
        if (value === undefined) value = null; // Comparisons are never true among things of different type (except    // 549
        // null vs undefined).                                                                                         // 552
                                                                                                                       //
        if (LocalCollection._f._type(value) !== operandType) return false;                                             // 553
        return cmpValueComparator(LocalCollection._f._cmp(value, operand));                                            // 555
      };                                                                                                               // 556
    }                                                                                                                  // 557
  };                                                                                                                   // 529
};                                                                                                                     // 559
                                                                                                                       //
var isBitSet = function (value, bit) {                                                                                 // 561
  if (value === 0) return false;                                                                                       // 562
  return (value & 1 << bit) !== 0;                                                                                     // 564
};                                                                                                                     // 565
                                                                                                                       //
var eightBits = [0, 1, 2, 3, 4, 5, 6, 7];                                                                              // 567
                                                                                                                       //
var get8BitsSet = function (value) {                                                                                   // 568
  if (value === 0) return [];                                                                                          // 569
  return _.filter(eightBits, function (bit) {                                                                          // 571
    return isBitSet(value, bit);                                                                                       // 572
  });                                                                                                                  // 573
};                                                                                                                     // 574
                                                                                                                       //
var convertNumberToUint8Array = function (number) {                                                                    // 576
  var numOfBits = number.toString(2).length;                                                                           // 577
  var num8BitGroups = Math.ceil(numOfBits / 8);                                                                        // 578
  var byteArray = new Uint8Array(num8BitGroups);                                                                       // 579
                                                                                                                       //
  for (var i = 0; i < byteArray.length; i++) {                                                                         // 581
    var byte = number & 0xff;                                                                                          // 582
    byteArray[i] = byte;                                                                                               // 583
    number = (number - byte) / 256;                                                                                    // 584
  }                                                                                                                    // 585
                                                                                                                       //
  return byteArray;                                                                                                    // 587
};                                                                                                                     // 588
                                                                                                                       //
var ensureUint8Array = function (number) {                                                                             // 590
  return number instanceof Uint8Array ? number : convertNumberToUint8Array(number);                                    // 591
};                                                                                                                     // 593
                                                                                                                       //
var ensureOperandUint8Array = function (operand) {                                                                     // 595
  if (!(operand instanceof Uint8Array)) {                                                                              // 596
    operand = _.reduce(operand, function (num, n) {                                                                    // 597
      return num | 1 << n;                                                                                             // 598
    }, 0);                                                                                                             // 599
    operand = convertNumberToUint8Array(operand);                                                                      // 601
  }                                                                                                                    // 602
                                                                                                                       //
  return operand;                                                                                                      // 604
};                                                                                                                     // 605
                                                                                                                       //
var bitsClear = function (bitsSetOp, bitsSetVal) {                                                                     // 607
  return _.isUndefined(_.find(bitsSetOp, function (bit) {                                                              // 608
    return bitsSetVal.indexOf(bit) === -1;                                                                             // 610
  }));                                                                                                                 // 611
};                                                                                                                     // 613
                                                                                                                       //
var bitsSet = function (bitsSetOp, bitsSetVal) {                                                                       // 615
  return _.isUndefined(_.find(bitsSetOp, function (bit) {                                                              // 616
    return bitsSetVal.indexOf(bit) !== -1;                                                                             // 618
  }));                                                                                                                 // 619
};                                                                                                                     // 621
                                                                                                                       //
var anyBitCompare = function (operand, value, setOrClear) {                                                            // 623
  return _.isUndefined(_.find(operand, function (op, i) {                                                              // 624
    var bitsSetOp = get8BitsSet(op);                                                                                   // 626
    var bitsSetVal = get8BitsSet(value[i]);                                                                            // 627
    return setOrClear(bitsSetOp, bitsSetVal);                                                                          // 629
  }));                                                                                                                 // 630
};                                                                                                                     // 632
                                                                                                                       //
var allBitCompare = function (operand, value, setOrClear) {                                                            // 634
  return _.filter(operand, function (op, i) {                                                                          // 635
    var bitsSetOp = get8BitsSet(op);                                                                                   // 636
    var bitsSetVal = get8BitsSet(value[i]);                                                                            // 637
    return !setOrClear(bitsSetOp, bitsSetVal);                                                                         // 639
  }).length === 0;                                                                                                     // 640
}; // Each element selector contains:                                                                                  // 641
//  - compileElementSelector, a function with args:                                                                    // 644
//    - operand - the "right hand side" of the operator                                                                // 645
//    - valueSelector - the "context" for the operator (so that $regex can find                                        // 646
//      $options)                                                                                                      // 647
//    - matcher - the Matcher this is going into (so that $elemMatch can compile                                       // 648
//      more things)                                                                                                   // 649
//    returning a function mapping a single value to bool.                                                             // 650
//  - dontExpandLeafArrays, a bool which prevents expandArraysInBranches from                                          // 651
//    being called                                                                                                     // 652
//  - dontIncludeLeafArrays, a bool which causes an argument to be passed to                                           // 653
//    expandArraysInBranches if it is called                                                                           // 654
                                                                                                                       //
                                                                                                                       //
ELEMENT_OPERATORS = {                                                                                                  // 655
  $lt: makeInequality(function (cmpValue) {                                                                            // 656
    return cmpValue < 0;                                                                                               // 657
  }),                                                                                                                  // 658
  $gt: makeInequality(function (cmpValue) {                                                                            // 659
    return cmpValue > 0;                                                                                               // 660
  }),                                                                                                                  // 661
  $lte: makeInequality(function (cmpValue) {                                                                           // 662
    return cmpValue <= 0;                                                                                              // 663
  }),                                                                                                                  // 664
  $gte: makeInequality(function (cmpValue) {                                                                           // 665
    return cmpValue >= 0;                                                                                              // 666
  }),                                                                                                                  // 667
  $mod: {                                                                                                              // 668
    compileElementSelector: function (operand) {                                                                       // 669
      if (!(isArray(operand) && operand.length === 2 && typeof operand[0] === 'number' && typeof operand[1] === 'number')) {
        throw Error("argument to $mod must be an array of two numbers");                                               // 673
      } // XXX could require to be ints or round or something                                                          // 674
                                                                                                                       //
                                                                                                                       //
      var divisor = operand[0];                                                                                        // 676
      var remainder = operand[1];                                                                                      // 677
      return function (value) {                                                                                        // 678
        return typeof value === 'number' && value % divisor === remainder;                                             // 679
      };                                                                                                               // 680
    }                                                                                                                  // 681
  },                                                                                                                   // 668
  $in: {                                                                                                               // 683
    compileElementSelector: function (operand) {                                                                       // 684
      if (!isArray(operand)) throw Error("$in needs an array");                                                        // 685
      var elementMatchers = [];                                                                                        // 688
                                                                                                                       //
      _.each(operand, function (option) {                                                                              // 689
        if (option instanceof RegExp) elementMatchers.push(regexpElementMatcher(option));else if (isOperatorObject(option)) throw Error("cannot nest $ under $in");else elementMatchers.push(equalityElementMatcher(option));
      });                                                                                                              // 696
                                                                                                                       //
      return function (value) {                                                                                        // 698
        // Allow {a: {$in: [null]}} to match when 'a' does not exist.                                                  // 699
        if (value === undefined) value = null;                                                                         // 700
        return _.any(elementMatchers, function (e) {                                                                   // 702
          return e(value);                                                                                             // 703
        });                                                                                                            // 704
      };                                                                                                               // 705
    }                                                                                                                  // 706
  },                                                                                                                   // 683
  $size: {                                                                                                             // 708
    // {a: [[5, 5]]} must match {a: {$size: 1}} but not {a: {$size: 2}}, so we                                         // 709
    // don't want to consider the element [5,5] in the leaf array [[5,5]] as a                                         // 710
    // possible value.                                                                                                 // 711
    dontExpandLeafArrays: true,                                                                                        // 712
    compileElementSelector: function (operand) {                                                                       // 713
      if (typeof operand === 'string') {                                                                               // 714
        // Don't ask me why, but by experimentation, this seems to be what Mongo                                       // 715
        // does.                                                                                                       // 716
        operand = 0;                                                                                                   // 717
      } else if (typeof operand !== 'number') {                                                                        // 718
        throw Error("$size needs a number");                                                                           // 719
      }                                                                                                                // 720
                                                                                                                       //
      return function (value) {                                                                                        // 721
        return isArray(value) && value.length === operand;                                                             // 722
      };                                                                                                               // 723
    }                                                                                                                  // 724
  },                                                                                                                   // 708
  $type: {                                                                                                             // 726
    // {a: [5]} must not match {a: {$type: 4}} (4 means array), but it should                                          // 727
    // match {a: {$type: 1}} (1 means number), and {a: [[5]]} must match {$a:                                          // 728
    // {$type: 4}}. Thus, when we see a leaf array, we *should* expand it but                                          // 729
    // should *not* include it itself.                                                                                 // 730
    dontIncludeLeafArrays: true,                                                                                       // 731
    compileElementSelector: function (operand) {                                                                       // 732
      if (typeof operand !== 'number') throw Error("$type needs a number");                                            // 733
      return function (value) {                                                                                        // 735
        return value !== undefined && LocalCollection._f._type(value) === operand;                                     // 736
      };                                                                                                               // 738
    }                                                                                                                  // 739
  },                                                                                                                   // 726
  $bitsAnyClear: {                                                                                                     // 741
    compileElementSelector: function (operand, valueSelector, matcher) {                                               // 742
      if (!isArray(operand) && !(operand instanceof Uint8Array)) throw Error("$bitsAnyClear has to be an Array");      // 743
      return function (value) {                                                                                        // 745
        if (typeof value !== 'number' && !(value instanceof Uint8Array)) return false;                                 // 746
        if (value === 0) return true;                                                                                  // 749
        operand = ensureOperandUint8Array(operand);                                                                    // 752
        value = ensureUint8Array(value);                                                                               // 753
        return anyBitCompare(operand, value, bitsClear);                                                               // 755
      };                                                                                                               // 756
    }                                                                                                                  // 757
  },                                                                                                                   // 741
  $bitsAllClear: {                                                                                                     // 759
    compileElementSelector: function (operand, valueSelector, matcher) {                                               // 760
      if (!isArray(operand) && !(operand instanceof Uint8Array)) throw Error("$bitsAllClear has to be an Array");      // 761
      return function (value) {                                                                                        // 763
        if (typeof value !== 'number' && !(value instanceof Uint8Array)) return false;                                 // 764
        if (value === 0) return true;                                                                                  // 767
        operand = ensureOperandUint8Array(operand);                                                                    // 770
        value = ensureUint8Array(value);                                                                               // 771
        return allBitCompare(operand, value, bitsSet);                                                                 // 773
      };                                                                                                               // 774
    }                                                                                                                  // 775
  },                                                                                                                   // 759
  $bitsAllSet: {                                                                                                       // 777
    compileElementSelector: function (operand, valueSelector, matcher) {                                               // 778
      if (!isArray(operand) && !(operand instanceof Uint8Array)) throw Error("$bitsAllSet has to be an Array");        // 779
      return function (value) {                                                                                        // 781
        if (typeof value !== 'number' && !(value instanceof Uint8Array)) return false;                                 // 782
        operand = ensureOperandUint8Array(operand);                                                                    // 785
        value = ensureUint8Array(value);                                                                               // 786
        return allBitCompare(operand, value, bitsClear);                                                               // 788
      };                                                                                                               // 789
    }                                                                                                                  // 790
  },                                                                                                                   // 777
  $bitsAnySet: {                                                                                                       // 792
    compileElementSelector: function (operand, valueSelector, matcher) {                                               // 793
      if (!isArray(operand) && !(operand instanceof Uint8Array)) throw Error("$bitsAnySet has to be an Array");        // 794
      return function (value) {                                                                                        // 796
        if (typeof value !== 'number' && !(value instanceof Uint8Array)) return false;                                 // 797
        operand = ensureOperandUint8Array(operand);                                                                    // 800
        value = ensureUint8Array(value);                                                                               // 801
        return _.isUndefined(_.find(operand, function (op, i) {                                                        // 803
          var bitsSetOp = get8BitsSet(op);                                                                             // 805
          var bitsSetVal = get8BitsSet(value[i]);                                                                      // 806
          return bitsSet(bitsSetOp, bitsSetVal);                                                                       // 808
        }));                                                                                                           // 809
      };                                                                                                               // 811
    }                                                                                                                  // 812
  },                                                                                                                   // 792
  $regex: {                                                                                                            // 814
    compileElementSelector: function (operand, valueSelector) {                                                        // 815
      if (!(typeof operand === 'string' || operand instanceof RegExp)) throw Error("$regex has to be a string or RegExp");
      var regexp;                                                                                                      // 819
                                                                                                                       //
      if (valueSelector.$options !== undefined) {                                                                      // 820
        // Options passed in $options (even the empty string) always overrides                                         // 821
        // options in the RegExp object itself. (See also                                                              // 822
        // Mongo.Collection._rewriteSelector.)                                                                         // 823
        // Be clear that we only support the JS-supported options, not extended                                        // 825
        // ones (eg, Mongo supports x and s). Ideally we would implement x and s                                       // 826
        // by transforming the regexp, but not today...                                                                // 827
        if (/[^gim]/.test(valueSelector.$options)) throw new Error("Only the i, m, and g regexp options are supported");
        var regexSource = operand instanceof RegExp ? operand.source : operand;                                        // 831
        regexp = new RegExp(regexSource, valueSelector.$options);                                                      // 832
      } else if (operand instanceof RegExp) {                                                                          // 833
        regexp = operand;                                                                                              // 834
      } else {                                                                                                         // 835
        regexp = new RegExp(operand);                                                                                  // 836
      }                                                                                                                // 837
                                                                                                                       //
      return regexpElementMatcher(regexp);                                                                             // 838
    }                                                                                                                  // 839
  },                                                                                                                   // 814
  $elemMatch: {                                                                                                        // 841
    dontExpandLeafArrays: true,                                                                                        // 842
    compileElementSelector: function (operand, valueSelector, matcher) {                                               // 843
      if (!isPlainObject(operand)) throw Error("$elemMatch need an object");                                           // 844
      var subMatcher, isDocMatcher;                                                                                    // 847
                                                                                                                       //
      if (isOperatorObject(_.omit(operand, _.keys(LOGICAL_OPERATORS)), true)) {                                        // 848
        subMatcher = compileValueSelector(operand, matcher);                                                           // 849
        isDocMatcher = false;                                                                                          // 850
      } else {                                                                                                         // 851
        // This is NOT the same as compileValueSelector(operand), and not just                                         // 852
        // because of the slightly different calling convention.                                                       // 853
        // {$elemMatch: {x: 3}} means "an element has a field x:3", not                                                // 854
        // "consists only of a field x:3". Also, regexps and sub-$ are allowed.                                        // 855
        subMatcher = compileDocumentSelector(operand, matcher, {                                                       // 856
          inElemMatch: true                                                                                            // 857
        });                                                                                                            // 857
        isDocMatcher = true;                                                                                           // 858
      }                                                                                                                // 859
                                                                                                                       //
      return function (value) {                                                                                        // 861
        if (!isArray(value)) return false;                                                                             // 862
                                                                                                                       //
        for (var i = 0; i < value.length; ++i) {                                                                       // 864
          var arrayElement = value[i];                                                                                 // 865
          var arg;                                                                                                     // 866
                                                                                                                       //
          if (isDocMatcher) {                                                                                          // 867
            // We can only match {$elemMatch: {b: 3}} against objects.                                                 // 868
            // (We can also match against arrays, if there's numeric indices,                                          // 869
            // eg {$elemMatch: {'0.b': 3}} or {$elemMatch: {0: 3}}.)                                                   // 870
            if (!isPlainObject(arrayElement) && !isArray(arrayElement)) return false;                                  // 871
            arg = arrayElement;                                                                                        // 873
          } else {                                                                                                     // 874
            // dontIterate ensures that {a: {$elemMatch: {$gt: 5}}} matches                                            // 875
            // {a: [8]} but not {a: [[8]]}                                                                             // 876
            arg = [{                                                                                                   // 877
              value: arrayElement,                                                                                     // 877
              dontIterate: true                                                                                        // 877
            }];                                                                                                        // 877
          } // XXX support $near in $elemMatch by propagating $distance?                                               // 878
                                                                                                                       //
                                                                                                                       //
          if (subMatcher(arg).result) return i; // specially understood to mean "use as arrayIndices"                  // 880
        }                                                                                                              // 882
                                                                                                                       //
        return false;                                                                                                  // 883
      };                                                                                                               // 884
    }                                                                                                                  // 885
  }                                                                                                                    // 841
}; // makeLookupFunction(key) returns a lookup function.                                                               // 655
//                                                                                                                     // 890
// A lookup function takes in a document and returns an array of matching                                              // 891
// branches.  If no arrays are found while looking up the key, this array will                                         // 892
// have exactly one branches (possibly 'undefined', if some segment of the key                                         // 893
// was not found).                                                                                                     // 894
//                                                                                                                     // 895
// If arrays are found in the middle, this can have more than one element, since                                       // 896
// we "branch". When we "branch", if there are more key segments to look up,                                           // 897
// then we only pursue branches that are plain objects (not arrays or scalars).                                        // 898
// This means we can actually end up with no branches!                                                                 // 899
//                                                                                                                     // 900
// We do *NOT* branch on arrays that are found at the end (ie, at the last                                             // 901
// dotted member of the key). We just return that array; if you want to                                                // 902
// effectively "branch" over the array's values, post-process the lookup                                               // 903
// function with expandArraysInBranches.                                                                               // 904
//                                                                                                                     // 905
// Each branch is an object with keys:                                                                                 // 906
//  - value: the value at the branch                                                                                   // 907
//  - dontIterate: an optional bool; if true, it means that 'value' is an array                                        // 908
//    that expandArraysInBranches should NOT expand. This specifically happens                                         // 909
//    when there is a numeric index in the key, and ensures the                                                        // 910
//    perhaps-surprising MongoDB behavior where {'a.0': 5} does NOT                                                    // 911
//    match {a: [[5]]}.                                                                                                // 912
//  - arrayIndices: if any array indexing was done during lookup (either due to                                        // 913
//    explicit numeric indices or implicit branching), this will be an array of                                        // 914
//    the array indices used, from outermost to innermost; it is falsey or                                             // 915
//    absent if no array index is used. If an explicit numeric index is used,                                          // 916
//    the index will be followed in arrayIndices by the string 'x'.                                                    // 917
//                                                                                                                     // 918
//    Note: arrayIndices is used for two purposes. First, it is used to                                                // 919
//    implement the '$' modifier feature, which only ever looks at its first                                           // 920
//    element.                                                                                                         // 921
//                                                                                                                     // 922
//    Second, it is used for sort key generation, which needs to be able to tell                                       // 923
//    the difference between different paths. Moreover, it needs to                                                    // 924
//    differentiate between explicit and implicit branching, which is why                                              // 925
//    there's the somewhat hacky 'x' entry: this means that explicit and                                               // 926
//    implicit array lookups will have different full arrayIndices paths. (That                                        // 927
//    code only requires that different paths have different arrayIndices; it                                          // 928
//    doesn't actually "parse" arrayIndices. As an alternative, arrayIndices                                           // 929
//    could contain objects with flags like "implicit", but I think that only                                          // 930
//    makes the code surrounding them more complex.)                                                                   // 931
//                                                                                                                     // 932
//    (By the way, this field ends up getting passed around a lot without                                              // 933
//    cloning, so never mutate any arrayIndices field/var in this package!)                                            // 934
//                                                                                                                     // 935
//                                                                                                                     // 936
// At the top level, you may only pass in a plain object or array.                                                     // 937
//                                                                                                                     // 938
// See the test 'minimongo - lookup' for some examples of what lookup functions                                        // 939
// return.                                                                                                             // 940
                                                                                                                       //
makeLookupFunction = function (key, options) {                                                                         // 941
  options = options || {};                                                                                             // 942
  var parts = key.split('.');                                                                                          // 943
  var firstPart = parts.length ? parts[0] : '';                                                                        // 944
  var firstPartIsNumeric = isNumericKey(firstPart);                                                                    // 945
  var nextPartIsNumeric = parts.length >= 2 && isNumericKey(parts[1]);                                                 // 946
  var lookupRest;                                                                                                      // 947
                                                                                                                       //
  if (parts.length > 1) {                                                                                              // 948
    lookupRest = makeLookupFunction(parts.slice(1).join('.'));                                                         // 949
  }                                                                                                                    // 950
                                                                                                                       //
  var omitUnnecessaryFields = function (retVal) {                                                                      // 952
    if (!retVal.dontIterate) delete retVal.dontIterate;                                                                // 953
    if (retVal.arrayIndices && !retVal.arrayIndices.length) delete retVal.arrayIndices;                                // 955
    return retVal;                                                                                                     // 957
  }; // Doc will always be a plain object or an array.                                                                 // 958
  // apply an explicit numeric index, an array.                                                                        // 961
                                                                                                                       //
                                                                                                                       //
  return function (doc, arrayIndices) {                                                                                // 962
    if (!arrayIndices) arrayIndices = [];                                                                              // 963
                                                                                                                       //
    if (isArray(doc)) {                                                                                                // 966
      // If we're being asked to do an invalid lookup into an array (non-integer                                       // 967
      // or out-of-bounds), return no results (which is different from returning                                       // 968
      // a single undefined result, in that `null` equality checks won't match).                                       // 969
      if (!(firstPartIsNumeric && firstPart < doc.length)) return []; // Remember that we used this array index. Include an 'x' to indicate that
      // the previous index came from being considered as an explicit array                                            // 974
      // index (not branching).                                                                                        // 975
                                                                                                                       //
      arrayIndices = arrayIndices.concat(+firstPart, 'x');                                                             // 976
    } // Do our first lookup.                                                                                          // 977
                                                                                                                       //
                                                                                                                       //
    var firstLevel = doc[firstPart]; // If there is no deeper to dig, return what we found.                            // 980
    //                                                                                                                 // 983
    // If what we found is an array, most value selectors will choose to treat                                         // 984
    // the elements of the array as matchable values in their own right, but                                           // 985
    // that's done outside of the lookup function. (Exceptions to this are $size                                       // 986
    // and stuff relating to $elemMatch.  eg, {a: {$size: 2}} does not match {a:                                       // 987
    // [[1, 2]]}.)                                                                                                     // 988
    //                                                                                                                 // 989
    // That said, if we just did an *explicit* array lookup (on doc) to find                                           // 990
    // firstLevel, and firstLevel is an array too, we do NOT want value                                                // 991
    // selectors to iterate over it.  eg, {'a.0': 5} does not match {a: [[5]]}.                                        // 992
    // So in that case, we mark the return value as "don't iterate".                                                   // 993
                                                                                                                       //
    if (!lookupRest) {                                                                                                 // 994
      return [omitUnnecessaryFields({                                                                                  // 995
        value: firstLevel,                                                                                             // 996
        dontIterate: isArray(doc) && isArray(firstLevel),                                                              // 997
        arrayIndices: arrayIndices                                                                                     // 998
      })];                                                                                                             // 995
    } // We need to dig deeper.  But if we can't, because what we've found is not                                      // 999
    // an array or plain object, we're done. If we just did a numeric index into                                       // 1002
    // an array, we return nothing here (this is a change in Mongo 2.5 from                                            // 1003
    // Mongo 2.4, where {'a.0.b': null} stopped matching {a: [5]}). Otherwise,                                         // 1004
    // return a single `undefined` (which can, for example, match via equality                                         // 1005
    // with `null`).                                                                                                   // 1006
                                                                                                                       //
                                                                                                                       //
    if (!isIndexable(firstLevel)) {                                                                                    // 1007
      if (isArray(doc)) return [];                                                                                     // 1008
      return [omitUnnecessaryFields({                                                                                  // 1010
        value: undefined,                                                                                              // 1010
        arrayIndices: arrayIndices                                                                                     // 1011
      })];                                                                                                             // 1010
    }                                                                                                                  // 1012
                                                                                                                       //
    var result = [];                                                                                                   // 1014
                                                                                                                       //
    var appendToResult = function (more) {                                                                             // 1015
      Array.prototype.push.apply(result, more);                                                                        // 1016
    }; // Dig deeper: look up the rest of the parts on whatever we've found.                                           // 1017
    // (lookupRest is smart enough to not try to do invalid lookups into                                               // 1020
    // firstLevel if it's an array.)                                                                                   // 1021
                                                                                                                       //
                                                                                                                       //
    appendToResult(lookupRest(firstLevel, arrayIndices)); // If we found an array, then in *addition* to potentially treating the next
    // part as a literal integer lookup, we should also "branch": try to look up                                       // 1025
    // the rest of the parts on each array element in parallel.                                                        // 1026
    //                                                                                                                 // 1027
    // In this case, we *only* dig deeper into array elements that are plain                                           // 1028
    // objects. (Recall that we only got this far if we have further to dig.)                                          // 1029
    // This makes sense: we certainly don't dig deeper into non-indexable                                              // 1030
    // objects. And it would be weird to dig into an array: it's simpler to have                                       // 1031
    // a rule that explicit integer indexes only apply to an outer array, not to                                       // 1032
    // an array you find after a branching search.                                                                     // 1033
    //                                                                                                                 // 1034
    // In the special case of a numeric part in a *sort selector* (not a query                                         // 1035
    // selector), we skip the branching: we ONLY allow the numeric part to mean                                        // 1036
    // "look up this index" in that case, not "also look up this index in all                                          // 1037
    // the elements of the array".                                                                                     // 1038
                                                                                                                       //
    if (isArray(firstLevel) && !(nextPartIsNumeric && options.forSort)) {                                              // 1039
      _.each(firstLevel, function (branch, arrayIndex) {                                                               // 1040
        if (isPlainObject(branch)) {                                                                                   // 1041
          appendToResult(lookupRest(branch, arrayIndices.concat(arrayIndex)));                                         // 1042
        }                                                                                                              // 1045
      });                                                                                                              // 1046
    }                                                                                                                  // 1047
                                                                                                                       //
    return result;                                                                                                     // 1049
  };                                                                                                                   // 1050
};                                                                                                                     // 1051
                                                                                                                       //
MinimongoTest.makeLookupFunction = makeLookupFunction;                                                                 // 1052
                                                                                                                       //
expandArraysInBranches = function (branches, skipTheArrays) {                                                          // 1054
  var branchesOut = [];                                                                                                // 1055
                                                                                                                       //
  _.each(branches, function (branch) {                                                                                 // 1056
    var thisIsArray = isArray(branch.value); // We include the branch itself, *UNLESS* we it's an array that we're going
    // to iterate and we're told to skip arrays.  (That's right, we include some                                       // 1059
    // arrays even skipTheArrays is true: these are arrays that were found via                                         // 1060
    // explicit numerical indices.)                                                                                    // 1061
                                                                                                                       //
    if (!(skipTheArrays && thisIsArray && !branch.dontIterate)) {                                                      // 1062
      branchesOut.push({                                                                                               // 1063
        value: branch.value,                                                                                           // 1064
        arrayIndices: branch.arrayIndices                                                                              // 1065
      });                                                                                                              // 1063
    }                                                                                                                  // 1067
                                                                                                                       //
    if (thisIsArray && !branch.dontIterate) {                                                                          // 1068
      _.each(branch.value, function (leaf, i) {                                                                        // 1069
        branchesOut.push({                                                                                             // 1070
          value: leaf,                                                                                                 // 1071
          arrayIndices: (branch.arrayIndices || []).concat(i)                                                          // 1072
        });                                                                                                            // 1070
      });                                                                                                              // 1074
    }                                                                                                                  // 1075
  });                                                                                                                  // 1076
                                                                                                                       //
  return branchesOut;                                                                                                  // 1077
};                                                                                                                     // 1078
                                                                                                                       //
var nothingMatcher = function (docOrBranchedValues) {                                                                  // 1080
  return {                                                                                                             // 1081
    result: false                                                                                                      // 1081
  };                                                                                                                   // 1081
};                                                                                                                     // 1082
                                                                                                                       //
var everythingMatcher = function (docOrBranchedValues) {                                                               // 1084
  return {                                                                                                             // 1085
    result: true                                                                                                       // 1085
  };                                                                                                                   // 1085
}; // NB: We are cheating and using this function to implement "AND" for both                                          // 1086
// "document matchers" and "branched matchers". They both return result objects                                        // 1090
// but the argument is different: for the former it's a whole doc, whereas for                                         // 1091
// the latter it's an array of "branched values".                                                                      // 1092
                                                                                                                       //
                                                                                                                       //
var andSomeMatchers = function (subMatchers) {                                                                         // 1093
  if (subMatchers.length === 0) return everythingMatcher;                                                              // 1094
  if (subMatchers.length === 1) return subMatchers[0];                                                                 // 1096
  return function (docOrBranches) {                                                                                    // 1099
    var ret = {};                                                                                                      // 1100
    ret.result = _.all(subMatchers, function (f) {                                                                     // 1101
      var subResult = f(docOrBranches); // Copy a 'distance' number out of the first sub-matcher that has              // 1102
      // one. Yes, this means that if there are multiple $near fields in a                                             // 1104
      // query, something arbitrary happens; this appears to be consistent with                                        // 1105
      // Mongo.                                                                                                        // 1106
                                                                                                                       //
      if (subResult.result && subResult.distance !== undefined && ret.distance === undefined) {                        // 1107
        ret.distance = subResult.distance;                                                                             // 1109
      } // Similarly, propagate arrayIndices from sub-matchers... but to match                                         // 1110
      // MongoDB behavior, this time the *last* sub-matcher with arrayIndices                                          // 1112
      // wins.                                                                                                         // 1113
                                                                                                                       //
                                                                                                                       //
      if (subResult.result && subResult.arrayIndices) {                                                                // 1114
        ret.arrayIndices = subResult.arrayIndices;                                                                     // 1115
      }                                                                                                                // 1116
                                                                                                                       //
      return subResult.result;                                                                                         // 1117
    }); // If we didn't actually match, forget any extra metadata we came up with.                                     // 1118
                                                                                                                       //
    if (!ret.result) {                                                                                                 // 1121
      delete ret.distance;                                                                                             // 1122
      delete ret.arrayIndices;                                                                                         // 1123
    }                                                                                                                  // 1124
                                                                                                                       //
    return ret;                                                                                                        // 1125
  };                                                                                                                   // 1126
};                                                                                                                     // 1127
                                                                                                                       //
var andDocumentMatchers = andSomeMatchers;                                                                             // 1129
var andBranchedMatchers = andSomeMatchers; // helpers used by compiled selector code                                   // 1130
                                                                                                                       //
LocalCollection._f = {                                                                                                 // 1134
  // XXX for _all and _in, consider building 'inquery' at compile time..                                               // 1135
  _type: function (v) {                                                                                                // 1137
    if (typeof v === "number") return 1;                                                                               // 1138
    if (typeof v === "string") return 2;                                                                               // 1140
    if (typeof v === "boolean") return 8;                                                                              // 1142
    if (isArray(v)) return 4;                                                                                          // 1144
    if (v === null) return 10;                                                                                         // 1146
    if (v instanceof RegExp) // note that typeof(/x/) === "object"                                                     // 1148
      return 11;                                                                                                       // 1150
    if (typeof v === "function") return 13;                                                                            // 1151
    if (v instanceof Date) return 9;                                                                                   // 1153
    if (EJSON.isBinary(v)) return 5;                                                                                   // 1155
    if (v instanceof MongoID.ObjectID) return 7;                                                                       // 1157
    return 3; // object                                                                                                // 1159
    // XXX support some/all of these:                                                                                  // 1161
    // 14, symbol                                                                                                      // 1162
    // 15, javascript code with scope                                                                                  // 1163
    // 16, 18: 32-bit/64-bit integer                                                                                   // 1164
    // 17, timestamp                                                                                                   // 1165
    // 255, minkey                                                                                                     // 1166
    // 127, maxkey                                                                                                     // 1167
  },                                                                                                                   // 1168
  // deep equality test: use for literal document and array matches                                                    // 1170
  _equal: function (a, b) {                                                                                            // 1171
    return EJSON.equals(a, b, {                                                                                        // 1172
      keyOrderSensitive: true                                                                                          // 1172
    });                                                                                                                // 1172
  },                                                                                                                   // 1173
  // maps a type code to a value that can be used to sort values of                                                    // 1175
  // different types                                                                                                   // 1176
  _typeorder: function (t) {                                                                                           // 1177
    // http://www.mongodb.org/display/DOCS/What+is+the+Compare+Order+for+BSON+Types                                    // 1178
    // XXX what is the correct sort position for Javascript code?                                                      // 1179
    // ('100' in the matrix below)                                                                                     // 1180
    // XXX minkey/maxkey                                                                                               // 1181
    return [-1, // (not a type)                                                                                        // 1182
    1, // number                                                                                                       // 1183
    2, // string                                                                                                       // 1184
    3, // object                                                                                                       // 1185
    4, // array                                                                                                        // 1186
    5, // binary                                                                                                       // 1187
    -1, // deprecated                                                                                                  // 1188
    6, // ObjectID                                                                                                     // 1189
    7, // bool                                                                                                         // 1190
    8, // Date                                                                                                         // 1191
    0, // null                                                                                                         // 1192
    9, // RegExp                                                                                                       // 1193
    -1, // deprecated                                                                                                  // 1194
    100, // JS code                                                                                                    // 1195
    2, // deprecated (symbol)                                                                                          // 1196
    100, // JS code                                                                                                    // 1197
    1, // 32-bit int                                                                                                   // 1198
    8, // Mongo timestamp                                                                                              // 1199
    1 // 64-bit int                                                                                                    // 1200
    ][t];                                                                                                              // 1182
  },                                                                                                                   // 1202
  // compare two values of unknown type according to BSON ordering                                                     // 1204
  // semantics. (as an extension, consider 'undefined' to be less than                                                 // 1205
  // any other value.) return negative if a is less, positive if b is                                                  // 1206
  // less, or 0 if equal                                                                                               // 1207
  _cmp: function (a, b) {                                                                                              // 1208
    if (a === undefined) return b === undefined ? 0 : -1;                                                              // 1209
    if (b === undefined) return 1;                                                                                     // 1211
                                                                                                                       //
    var ta = LocalCollection._f._type(a);                                                                              // 1213
                                                                                                                       //
    var tb = LocalCollection._f._type(b);                                                                              // 1214
                                                                                                                       //
    var oa = LocalCollection._f._typeorder(ta);                                                                        // 1215
                                                                                                                       //
    var ob = LocalCollection._f._typeorder(tb);                                                                        // 1216
                                                                                                                       //
    if (oa !== ob) return oa < ob ? -1 : 1;                                                                            // 1217
    if (ta !== tb) // XXX need to implement this if we implement Symbol or integers, or                                // 1219
      // Timestamp                                                                                                     // 1221
      throw Error("Missing type coercion logic in _cmp");                                                              // 1222
                                                                                                                       //
    if (ta === 7) {                                                                                                    // 1223
      // ObjectID                                                                                                      // 1223
      // Convert to string.                                                                                            // 1224
      ta = tb = 2;                                                                                                     // 1225
      a = a.toHexString();                                                                                             // 1226
      b = b.toHexString();                                                                                             // 1227
    }                                                                                                                  // 1228
                                                                                                                       //
    if (ta === 9) {                                                                                                    // 1229
      // Date                                                                                                          // 1229
      // Convert to millis.                                                                                            // 1230
      ta = tb = 1;                                                                                                     // 1231
      a = a.getTime();                                                                                                 // 1232
      b = b.getTime();                                                                                                 // 1233
    }                                                                                                                  // 1234
                                                                                                                       //
    if (ta === 1) // double                                                                                            // 1236
      return a - b;                                                                                                    // 1237
    if (tb === 2) // string                                                                                            // 1238
      return a < b ? -1 : a === b ? 0 : 1;                                                                             // 1239
                                                                                                                       //
    if (ta === 3) {                                                                                                    // 1240
      // Object                                                                                                        // 1240
      // this could be much more efficient in the expected case ...                                                    // 1241
      var to_array = function (obj) {                                                                                  // 1242
        var ret = [];                                                                                                  // 1243
                                                                                                                       //
        for (var key in meteorBabelHelpers.sanitizeForInObject(obj)) {                                                 // 1244
          ret.push(key);                                                                                               // 1245
          ret.push(obj[key]);                                                                                          // 1246
        }                                                                                                              // 1247
                                                                                                                       //
        return ret;                                                                                                    // 1248
      };                                                                                                               // 1249
                                                                                                                       //
      return LocalCollection._f._cmp(to_array(a), to_array(b));                                                        // 1250
    }                                                                                                                  // 1251
                                                                                                                       //
    if (ta === 4) {                                                                                                    // 1252
      // Array                                                                                                         // 1252
      for (var i = 0;; i++) {                                                                                          // 1253
        if (i === a.length) return i === b.length ? 0 : -1;                                                            // 1254
        if (i === b.length) return 1;                                                                                  // 1256
                                                                                                                       //
        var s = LocalCollection._f._cmp(a[i], b[i]);                                                                   // 1258
                                                                                                                       //
        if (s !== 0) return s;                                                                                         // 1259
      }                                                                                                                // 1261
    }                                                                                                                  // 1262
                                                                                                                       //
    if (ta === 5) {                                                                                                    // 1263
      // binary                                                                                                        // 1263
      // Surprisingly, a small binary blob is always less than a large one in                                          // 1264
      // Mongo.                                                                                                        // 1265
      if (a.length !== b.length) return a.length - b.length;                                                           // 1266
                                                                                                                       //
      for (i = 0; i < a.length; i++) {                                                                                 // 1268
        if (a[i] < b[i]) return -1;                                                                                    // 1269
        if (a[i] > b[i]) return 1;                                                                                     // 1271
      }                                                                                                                // 1273
                                                                                                                       //
      return 0;                                                                                                        // 1274
    }                                                                                                                  // 1275
                                                                                                                       //
    if (ta === 8) {                                                                                                    // 1276
      // boolean                                                                                                       // 1276
      if (a) return b ? 0 : 1;                                                                                         // 1277
      return b ? -1 : 0;                                                                                               // 1278
    }                                                                                                                  // 1279
                                                                                                                       //
    if (ta === 10) // null                                                                                             // 1280
      return 0;                                                                                                        // 1281
    if (ta === 11) // regexp                                                                                           // 1282
      throw Error("Sorting not supported on regular expression"); // XXX                                               // 1283
    // 13: javascript code                                                                                             // 1284
    // 14: symbol                                                                                                      // 1285
    // 15: javascript code with scope                                                                                  // 1286
    // 16: 32-bit integer                                                                                              // 1287
    // 17: timestamp                                                                                                   // 1288
    // 18: 64-bit integer                                                                                              // 1289
    // 255: minkey                                                                                                     // 1290
    // 127: maxkey                                                                                                     // 1291
                                                                                                                       //
    if (ta === 13) // javascript code                                                                                  // 1292
      throw Error("Sorting not supported on Javascript code"); // XXX                                                  // 1293
                                                                                                                       //
    throw Error("Unknown type to sort");                                                                               // 1294
  }                                                                                                                    // 1295
}; // Oddball function used by upsert.                                                                                 // 1134
                                                                                                                       //
LocalCollection._removeDollarOperators = function (selector) {                                                         // 1299
  var selectorDoc = {};                                                                                                // 1300
                                                                                                                       //
  for (var k in meteorBabelHelpers.sanitizeForInObject(selector)) {                                                    // 1301
    if (k.substr(0, 1) !== '$') selectorDoc[k] = selector[k];                                                          // 1302
  }                                                                                                                    // 1301
                                                                                                                       //
  return selectorDoc;                                                                                                  // 1304
};                                                                                                                     // 1305
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"sort.js":["babel-runtime/helpers/typeof",function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/sort.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                                //
                                                                                                                       //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                       //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
// Give a sort spec, which can be in any of these forms:                                                               // 1
//   {"key1": 1, "key2": -1}                                                                                           // 2
//   [["key1", "asc"], ["key2", "desc"]]                                                                               // 3
//   ["key1", ["key2", "desc"]]                                                                                        // 4
//                                                                                                                     // 5
// (.. with the first form being dependent on the key enumeration                                                      // 6
// behavior of your javascript VM, which usually does what you mean in                                                 // 7
// this case if the key names don't look like integers ..)                                                             // 8
//                                                                                                                     // 9
// return a function that takes two objects, and returns -1 if the                                                     // 10
// first object comes first in order, 1 if the second object comes                                                     // 11
// first, or 0 if neither object comes before the other.                                                               // 12
Minimongo.Sorter = function (spec, options) {                                                                          // 14
  var self = this;                                                                                                     // 15
  options = options || {};                                                                                             // 16
  self._sortSpecParts = [];                                                                                            // 18
  self._sortFunction = null;                                                                                           // 19
                                                                                                                       //
  var addSpecPart = function (path, ascending) {                                                                       // 21
    if (!path) throw Error("sort keys must be non-empty");                                                             // 22
    if (path.charAt(0) === '$') throw Error("unsupported sort key: " + path);                                          // 24
                                                                                                                       //
    self._sortSpecParts.push({                                                                                         // 26
      path: path,                                                                                                      // 27
      lookup: makeLookupFunction(path, {                                                                               // 28
        forSort: true                                                                                                  // 28
      }),                                                                                                              // 28
      ascending: ascending                                                                                             // 29
    });                                                                                                                // 26
  };                                                                                                                   // 31
                                                                                                                       //
  if (spec instanceof Array) {                                                                                         // 33
    for (var i = 0; i < spec.length; i++) {                                                                            // 34
      if (typeof spec[i] === "string") {                                                                               // 35
        addSpecPart(spec[i], true);                                                                                    // 36
      } else {                                                                                                         // 37
        addSpecPart(spec[i][0], spec[i][1] !== "desc");                                                                // 38
      }                                                                                                                // 39
    }                                                                                                                  // 40
  } else if ((typeof spec === "undefined" ? "undefined" : (0, _typeof3.default)(spec)) === "object") {                 // 41
    _.each(spec, function (value, key) {                                                                               // 42
      addSpecPart(key, value >= 0);                                                                                    // 43
    });                                                                                                                // 44
  } else if (typeof spec === "function") {                                                                             // 45
    self._sortFunction = spec;                                                                                         // 46
  } else {                                                                                                             // 47
    throw Error("Bad sort specification: " + JSON.stringify(spec));                                                    // 48
  } // If a function is specified for sorting, we skip the rest.                                                       // 49
                                                                                                                       //
                                                                                                                       //
  if (self._sortFunction) return; // To implement affectedByModifier, we piggy-back on top of Matcher's                // 52
  // affectedByModifier code; we create a selector that is affected by the same                                        // 56
  // modifiers as this sort order. This is only implemented on the server.                                             // 57
                                                                                                                       //
  if (self.affectedByModifier) {                                                                                       // 58
    var selector = {};                                                                                                 // 59
                                                                                                                       //
    _.each(self._sortSpecParts, function (spec) {                                                                      // 60
      selector[spec.path] = 1;                                                                                         // 61
    });                                                                                                                // 62
                                                                                                                       //
    self._selectorForAffectedByModifier = new Minimongo.Matcher(selector);                                             // 63
  }                                                                                                                    // 64
                                                                                                                       //
  self._keyComparator = composeComparators(_.map(self._sortSpecParts, function (spec, i) {                             // 66
    return self._keyFieldComparator(i);                                                                                // 68
  })); // If you specify a matcher for this Sorter, _keyFilter may be set to a                                         // 69
  // function which selects whether or not a given "sort key" (tuple of values                                         // 72
  // for the different sort spec fields) is compatible with the selector.                                              // 73
                                                                                                                       //
  self._keyFilter = null;                                                                                              // 74
  options.matcher && self._useWithMatcher(options.matcher);                                                            // 75
}; // In addition to these methods, sorter_project.js defines combineIntoProjection                                    // 76
// on the server only.                                                                                                 // 79
                                                                                                                       //
                                                                                                                       //
_.extend(Minimongo.Sorter.prototype, {                                                                                 // 80
  getComparator: function (options) {                                                                                  // 81
    var self = this; // If we have no distances, just use the comparator from the source                               // 82
    // specification (which defaults to "everything is equal".                                                         // 85
                                                                                                                       //
    if (!options || !options.distances) {                                                                              // 86
      return self._getBaseComparator();                                                                                // 87
    }                                                                                                                  // 88
                                                                                                                       //
    var distances = options.distances; // Return a comparator which first tries the sort specification, and if that    // 90
    // says "it's equal", breaks ties using $near distances.                                                           // 93
                                                                                                                       //
    return composeComparators([self._getBaseComparator(), function (a, b) {                                            // 94
      if (!distances.has(a._id)) throw Error("Missing distance for " + a._id);                                         // 95
      if (!distances.has(b._id)) throw Error("Missing distance for " + b._id);                                         // 97
      return distances.get(a._id) - distances.get(b._id);                                                              // 99
    }]);                                                                                                               // 100
  },                                                                                                                   // 101
  _getPaths: function () {                                                                                             // 103
    var self = this;                                                                                                   // 104
    return _.pluck(self._sortSpecParts, 'path');                                                                       // 105
  },                                                                                                                   // 106
  // Finds the minimum key from the doc, according to the sort specs.  (We say                                         // 108
  // "minimum" here but this is with respect to the sort spec, so "descending"                                         // 109
  // sort fields mean we're finding the max for that field.)                                                           // 110
  //                                                                                                                   // 111
  // Note that this is NOT "find the minimum value of the first field, the                                             // 112
  // minimum value of the second field, etc"... it's "choose the                                                       // 113
  // lexicographically minimum value of the key vector, allowing only keys which                                       // 114
  // you can find along the same paths".  ie, for a doc {a: [{x: 0, y: 5}, {x:                                         // 115
  // 1, y: 3}]} with sort spec {'a.x': 1, 'a.y': 1}, the only keys are [0,5] and                                       // 116
  // [1,3], and the minimum key is [0,5]; notably, [0,3] is NOT a key.                                                 // 117
  _getMinKeyFromDoc: function (doc) {                                                                                  // 118
    var self = this;                                                                                                   // 119
    var minKey = null;                                                                                                 // 120
                                                                                                                       //
    self._generateKeysFromDoc(doc, function (key) {                                                                    // 122
      if (!self._keyCompatibleWithSelector(key)) return;                                                               // 123
                                                                                                                       //
      if (minKey === null) {                                                                                           // 126
        minKey = key;                                                                                                  // 127
        return;                                                                                                        // 128
      }                                                                                                                // 129
                                                                                                                       //
      if (self._compareKeys(key, minKey) < 0) {                                                                        // 130
        minKey = key;                                                                                                  // 131
      }                                                                                                                // 132
    }); // This could happen if our key filter somehow filters out all the keys even                                   // 133
    // though somehow the selector matches.                                                                            // 136
                                                                                                                       //
                                                                                                                       //
    if (minKey === null) throw Error("sort selector found no keys in doc?");                                           // 137
    return minKey;                                                                                                     // 139
  },                                                                                                                   // 140
  _keyCompatibleWithSelector: function (key) {                                                                         // 142
    var self = this;                                                                                                   // 143
    return !self._keyFilter || self._keyFilter(key);                                                                   // 144
  },                                                                                                                   // 145
  // Iterates over each possible "key" from doc (ie, over each branch), calling                                        // 147
  // 'cb' with the key.                                                                                                // 148
  _generateKeysFromDoc: function (doc, cb) {                                                                           // 149
    var self = this;                                                                                                   // 150
    if (self._sortSpecParts.length === 0) throw new Error("can't generate keys without a spec"); // maps index -> ({'' -> value} or {path -> value})
                                                                                                                       //
    var valuesByIndexAndPath = [];                                                                                     // 156
                                                                                                                       //
    var pathFromIndices = function (indices) {                                                                         // 158
      return indices.join(',') + ',';                                                                                  // 159
    };                                                                                                                 // 160
                                                                                                                       //
    var knownPaths = null;                                                                                             // 162
                                                                                                                       //
    _.each(self._sortSpecParts, function (spec, whichField) {                                                          // 164
      // Expand any leaf arrays that we find, and ignore those arrays                                                  // 165
      // themselves.  (We never sort based on an array itself.)                                                        // 166
      var branches = expandArraysInBranches(spec.lookup(doc), true); // If there are no values for a key (eg, key goes to an empty array),
      // pretend we found one null value.                                                                              // 170
                                                                                                                       //
      if (!branches.length) branches = [{                                                                              // 171
        value: null                                                                                                    // 172
      }];                                                                                                              // 172
      var usedPaths = false;                                                                                           // 174
      valuesByIndexAndPath[whichField] = {};                                                                           // 175
                                                                                                                       //
      _.each(branches, function (branch) {                                                                             // 176
        if (!branch.arrayIndices) {                                                                                    // 177
          // If there are no array indices for a branch, then it must be the                                           // 178
          // only branch, because the only thing that produces multiple branches                                       // 179
          // is the use of arrays.                                                                                     // 180
          if (branches.length > 1) throw Error("multiple branches but no array used?");                                // 181
          valuesByIndexAndPath[whichField][''] = branch.value;                                                         // 183
          return;                                                                                                      // 184
        }                                                                                                              // 185
                                                                                                                       //
        usedPaths = true;                                                                                              // 187
        var path = pathFromIndices(branch.arrayIndices);                                                               // 188
        if (_.has(valuesByIndexAndPath[whichField], path)) throw Error("duplicate path: " + path);                     // 189
        valuesByIndexAndPath[whichField][path] = branch.value; // If two sort fields both go into arrays, they have to go into the
        // exact same arrays and we have to find the same paths.  This is                                              // 194
        // roughly the same condition that makes MongoDB throw this strange                                            // 195
        // error message.  eg, the main thing is that if sort spec is {a: 1,                                           // 196
        // b:1} then a and b cannot both be arrays.                                                                    // 197
        //                                                                                                             // 198
        // (In MongoDB it seems to be OK to have {a: 1, 'a.x.y': 1} where 'a'                                          // 199
        // and 'a.x.y' are both arrays, but we don't allow this for now.                                               // 200
        // #NestedArraySort                                                                                            // 201
        // XXX achieve full compatibility here                                                                         // 202
                                                                                                                       //
        if (knownPaths && !_.has(knownPaths, path)) {                                                                  // 203
          throw Error("cannot index parallel arrays");                                                                 // 204
        }                                                                                                              // 205
      });                                                                                                              // 206
                                                                                                                       //
      if (knownPaths) {                                                                                                // 208
        // Similarly to above, paths must match everywhere, unless this is a                                           // 209
        // non-array field.                                                                                            // 210
        if (!_.has(valuesByIndexAndPath[whichField], '') && _.size(knownPaths) !== _.size(valuesByIndexAndPath[whichField])) {
          throw Error("cannot index parallel arrays!");                                                                // 213
        }                                                                                                              // 214
      } else if (usedPaths) {                                                                                          // 215
        knownPaths = {};                                                                                               // 216
                                                                                                                       //
        _.each(valuesByIndexAndPath[whichField], function (x, path) {                                                  // 217
          knownPaths[path] = true;                                                                                     // 218
        });                                                                                                            // 219
      }                                                                                                                // 220
    });                                                                                                                // 221
                                                                                                                       //
    if (!knownPaths) {                                                                                                 // 223
      // Easy case: no use of arrays.                                                                                  // 224
      var soleKey = _.map(valuesByIndexAndPath, function (values) {                                                    // 225
        if (!_.has(values, '')) throw Error("no value in sole key case?");                                             // 226
        return values[''];                                                                                             // 228
      });                                                                                                              // 229
                                                                                                                       //
      cb(soleKey);                                                                                                     // 230
      return;                                                                                                          // 231
    }                                                                                                                  // 232
                                                                                                                       //
    _.each(knownPaths, function (x, path) {                                                                            // 234
      var key = _.map(valuesByIndexAndPath, function (values) {                                                        // 235
        if (_.has(values, '')) return values[''];                                                                      // 236
        if (!_.has(values, path)) throw Error("missing path?");                                                        // 238
        return values[path];                                                                                           // 240
      });                                                                                                              // 241
                                                                                                                       //
      cb(key);                                                                                                         // 242
    });                                                                                                                // 243
  },                                                                                                                   // 244
  // Takes in two keys: arrays whose lengths match the number of spec                                                  // 246
  // parts. Returns negative, 0, or positive based on using the sort spec to                                           // 247
  // compare fields.                                                                                                   // 248
  _compareKeys: function (key1, key2) {                                                                                // 249
    var self = this;                                                                                                   // 250
                                                                                                                       //
    if (key1.length !== self._sortSpecParts.length || key2.length !== self._sortSpecParts.length) {                    // 251
      throw Error("Key has wrong length");                                                                             // 253
    }                                                                                                                  // 254
                                                                                                                       //
    return self._keyComparator(key1, key2);                                                                            // 256
  },                                                                                                                   // 257
  // Given an index 'i', returns a comparator that compares two key arrays based                                       // 259
  // on field 'i'.                                                                                                     // 260
  _keyFieldComparator: function (i) {                                                                                  // 261
    var self = this;                                                                                                   // 262
    var invert = !self._sortSpecParts[i].ascending;                                                                    // 263
    return function (key1, key2) {                                                                                     // 264
      var compare = LocalCollection._f._cmp(key1[i], key2[i]);                                                         // 265
                                                                                                                       //
      if (invert) compare = -compare;                                                                                  // 266
      return compare;                                                                                                  // 268
    };                                                                                                                 // 269
  },                                                                                                                   // 270
  // Returns a comparator that represents the sort specification (but not                                              // 272
  // including a possible geoquery distance tie-breaker).                                                              // 273
  _getBaseComparator: function () {                                                                                    // 274
    var self = this;                                                                                                   // 275
    if (self._sortFunction) return self._sortFunction; // If we're only sorting on geoquery distance and no specs, just say
    // everything is equal.                                                                                            // 281
                                                                                                                       //
    if (!self._sortSpecParts.length) {                                                                                 // 282
      return function (doc1, doc2) {                                                                                   // 283
        return 0;                                                                                                      // 284
      };                                                                                                               // 285
    }                                                                                                                  // 286
                                                                                                                       //
    return function (doc1, doc2) {                                                                                     // 288
      var key1 = self._getMinKeyFromDoc(doc1);                                                                         // 289
                                                                                                                       //
      var key2 = self._getMinKeyFromDoc(doc2);                                                                         // 290
                                                                                                                       //
      return self._compareKeys(key1, key2);                                                                            // 291
    };                                                                                                                 // 292
  },                                                                                                                   // 293
  // In MongoDB, if you have documents                                                                                 // 295
  //    {_id: 'x', a: [1, 10]} and                                                                                     // 296
  //    {_id: 'y', a: [5, 15]},                                                                                        // 297
  // then C.find({}, {sort: {a: 1}}) puts x before y (1 comes before 5).                                               // 298
  // But  C.find({a: {$gt: 3}}, {sort: {a: 1}}) puts y before x (1 does not                                            // 299
  // match the selector, and 5 comes before 10).                                                                       // 300
  //                                                                                                                   // 301
  // The way this works is pretty subtle!  For example, if the documents                                               // 302
  // are instead {_id: 'x', a: [{x: 1}, {x: 10}]}) and                                                                 // 303
  //             {_id: 'y', a: [{x: 5}, {x: 15}]}),                                                                    // 304
  // then C.find({'a.x': {$gt: 3}}, {sort: {'a.x': 1}}) and                                                            // 305
  //      C.find({a: {$elemMatch: {x: {$gt: 3}}}}, {sort: {'a.x': 1}})                                                 // 306
  // both follow this rule (y before x).  (ie, you do have to apply this                                               // 307
  // through $elemMatch.)                                                                                              // 308
  //                                                                                                                   // 309
  // So if you pass a matcher to this sorter's constructor, we will attempt to                                         // 310
  // skip sort keys that don't match the selector. The logic here is pretty                                            // 311
  // subtle and undocumented; we've gotten as close as we can figure out based                                         // 312
  // on our understanding of Mongo's behavior.                                                                         // 313
  _useWithMatcher: function (matcher) {                                                                                // 314
    var self = this;                                                                                                   // 315
    if (self._keyFilter) throw Error("called _useWithMatcher twice?"); // If we are only sorting by distance, then we're not going to bother to
    // build a key filter.                                                                                             // 321
    // XXX figure out how geoqueries interact with this stuff                                                          // 322
                                                                                                                       //
    if (_.isEmpty(self._sortSpecParts)) return;                                                                        // 323
    var selector = matcher._selector; // If the user just passed a literal function to find(), then we can't get a     // 326
    // key filter from it.                                                                                             // 329
                                                                                                                       //
    if (selector instanceof Function) return;                                                                          // 330
    var constraintsByPath = {};                                                                                        // 333
                                                                                                                       //
    _.each(self._sortSpecParts, function (spec, i) {                                                                   // 334
      constraintsByPath[spec.path] = [];                                                                               // 335
    });                                                                                                                // 336
                                                                                                                       //
    _.each(selector, function (subSelector, key) {                                                                     // 338
      // XXX support $and and $or                                                                                      // 339
      var constraints = constraintsByPath[key];                                                                        // 341
      if (!constraints) return; // XXX it looks like the real MongoDB implementation isn't "does the                   // 342
      // regexp match" but "does the value fall into a range named by the                                              // 346
      // literal prefix of the regexp", ie "foo" in /^foo(bar|baz)+/  But                                              // 347
      // "does the regexp match" is a good approximation.                                                              // 348
                                                                                                                       //
      if (subSelector instanceof RegExp) {                                                                             // 349
        // As far as we can tell, using either of the options that both we and                                         // 350
        // MongoDB support ('i' and 'm') disables use of the key filter. This                                          // 351
        // makes sense: MongoDB mostly appears to be calculating ranges of an                                          // 352
        // index to use, which means it only cares about regexps that match                                            // 353
        // one range (with a literal prefix), and both 'i' and 'm' prevent the                                         // 354
        // literal prefix of the regexp from actually meaning one range.                                               // 355
        if (subSelector.ignoreCase || subSelector.multiline) return;                                                   // 356
        constraints.push(regexpElementMatcher(subSelector));                                                           // 358
        return;                                                                                                        // 359
      }                                                                                                                // 360
                                                                                                                       //
      if (isOperatorObject(subSelector)) {                                                                             // 362
        _.each(subSelector, function (operand, operator) {                                                             // 363
          if (_.contains(['$lt', '$lte', '$gt', '$gte'], operator)) {                                                  // 364
            // XXX this depends on us knowing that these operators don't use any                                       // 365
            // of the arguments to compileElementSelector other than operand.                                          // 366
            constraints.push(ELEMENT_OPERATORS[operator].compileElementSelector(operand));                             // 367
          } // See comments in the RegExp block above.                                                                 // 369
                                                                                                                       //
                                                                                                                       //
          if (operator === '$regex' && !subSelector.$options) {                                                        // 372
            constraints.push(ELEMENT_OPERATORS.$regex.compileElementSelector(operand, subSelector));                   // 373
          } // XXX support {$exists: true}, $mod, $type, $in, $elemMatch                                               // 376
                                                                                                                       //
        });                                                                                                            // 379
                                                                                                                       //
        return;                                                                                                        // 380
      } // OK, it's an equality thing.                                                                                 // 381
                                                                                                                       //
                                                                                                                       //
      constraints.push(equalityElementMatcher(subSelector));                                                           // 384
    }); // It appears that the first sort field is treated differently from the                                        // 385
    // others; we shouldn't create a key filter unless the first sort field is                                         // 388
    // restricted, though after that point we can restrict the other sort fields                                       // 389
    // or not as we wish.                                                                                              // 390
                                                                                                                       //
                                                                                                                       //
    if (_.isEmpty(constraintsByPath[self._sortSpecParts[0].path])) return;                                             // 391
                                                                                                                       //
    self._keyFilter = function (key) {                                                                                 // 394
      return _.all(self._sortSpecParts, function (specPart, index) {                                                   // 395
        return _.all(constraintsByPath[specPart.path], function (f) {                                                  // 396
          return f(key[index]);                                                                                        // 397
        });                                                                                                            // 398
      });                                                                                                              // 399
    };                                                                                                                 // 400
  }                                                                                                                    // 401
}); // Given an array of comparators                                                                                   // 80
// (functions (a,b)->(negative or positive or zero)), returns a single                                                 // 405
// comparator which uses each comparator in order and returns the first                                                // 406
// non-zero value.                                                                                                     // 407
                                                                                                                       //
                                                                                                                       //
var composeComparators = function (comparatorArray) {                                                                  // 408
  return function (a, b) {                                                                                             // 409
    for (var i = 0; i < comparatorArray.length; ++i) {                                                                 // 410
      var compare = comparatorArray[i](a, b);                                                                          // 411
      if (compare !== 0) return compare;                                                                               // 412
    }                                                                                                                  // 414
                                                                                                                       //
    return 0;                                                                                                          // 415
  };                                                                                                                   // 416
};                                                                                                                     // 417
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"projection.js":["babel-runtime/helpers/typeof",function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/projection.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                                //
                                                                                                                       //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                       //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
// Knows how to compile a fields projection to a predicate function.                                                   // 1
// @returns - Function: a closure that filters out an object according to the                                          // 2
//            fields projection rules:                                                                                 // 3
//            @param obj - Object: MongoDB-styled document                                                             // 4
//            @returns - Object: a document with the fields filtered out                                               // 5
//                       according to projection rules. Doesn't retain subfields                                       // 6
//                       of passed argument.                                                                           // 7
LocalCollection._compileProjection = function (fields) {                                                               // 8
  LocalCollection._checkSupportedProjection(fields);                                                                   // 9
                                                                                                                       //
  var _idProjection = _.isUndefined(fields._id) ? true : fields._id;                                                   // 11
                                                                                                                       //
  var details = projectionDetails(fields); // returns transformed doc according to ruleTree                            // 12
                                                                                                                       //
  var transform = function (doc, ruleTree) {                                                                           // 15
    // Special case for "sets"                                                                                         // 16
    if (_.isArray(doc)) return _.map(doc, function (subdoc) {                                                          // 17
      return transform(subdoc, ruleTree);                                                                              // 18
    });                                                                                                                // 18
    var res = details.including ? {} : EJSON.clone(doc);                                                               // 20
                                                                                                                       //
    _.each(ruleTree, function (rule, key) {                                                                            // 21
      if (!_.has(doc, key)) return;                                                                                    // 22
                                                                                                                       //
      if (_.isObject(rule)) {                                                                                          // 24
        // For sub-objects/subsets we branch                                                                           // 25
        if (_.isObject(doc[key])) res[key] = transform(doc[key], rule); // Otherwise we don't even touch this subfield
      } else if (details.including) res[key] = EJSON.clone(doc[key]);else delete res[key];                             // 29
    });                                                                                                                // 33
                                                                                                                       //
    return res;                                                                                                        // 35
  };                                                                                                                   // 36
                                                                                                                       //
  return function (obj) {                                                                                              // 38
    var res = transform(obj, details.tree);                                                                            // 39
    if (_idProjection && _.has(obj, '_id')) res._id = obj._id;                                                         // 41
    if (!_idProjection && _.has(res, '_id')) delete res._id;                                                           // 43
    return res;                                                                                                        // 45
  };                                                                                                                   // 46
}; // Traverses the keys of passed projection and constructs a tree where all                                          // 47
// leaves are either all True or all False                                                                             // 50
// @returns Object:                                                                                                    // 51
//  - tree - Object - tree representation of keys involved in projection                                               // 52
//  (exception for '_id' as it is a special case handled separately)                                                   // 53
//  - including - Boolean - "take only certain fields" type of projection                                              // 54
                                                                                                                       //
                                                                                                                       //
projectionDetails = function (fields) {                                                                                // 55
  // Find the non-_id keys (_id is handled specially because it is included unless                                     // 56
  // explicitly excluded). Sort the keys, so that our code to detect overlaps                                          // 57
  // like 'foo' and 'foo.bar' can assume that 'foo' comes first.                                                       // 58
  var fieldsKeys = _.keys(fields).sort(); // If _id is the only field in the projection, do not remove it, since it is
  // required to determine if this is an exclusion or exclusion. Also keep an                                          // 62
  // inclusive _id, since inclusive _id follows the normal rules about mixing                                          // 63
  // inclusive and exclusive fields. If _id is not the only field in the                                               // 64
  // projection and is exclusive, remove it so it can be handled later by a                                            // 65
  // special case, since exclusive _id is always allowed.                                                              // 66
                                                                                                                       //
                                                                                                                       //
  if (fieldsKeys.length > 0 && !(fieldsKeys.length === 1 && fieldsKeys[0] === '_id') && !(_.contains(fieldsKeys, '_id') && fields['_id'])) fieldsKeys = _.reject(fieldsKeys, function (key) {
    return key === '_id';                                                                                              // 70
  });                                                                                                                  // 70
  var including = null; // Unknown                                                                                     // 72
                                                                                                                       //
  _.each(fieldsKeys, function (keyPath) {                                                                              // 74
    var rule = !!fields[keyPath];                                                                                      // 75
    if (including === null) including = rule;                                                                          // 76
    if (including !== rule) // This error message is copied from MongoDB shell                                         // 78
      throw MinimongoError("You cannot currently mix including and excluding fields.");                                // 80
  });                                                                                                                  // 81
                                                                                                                       //
  var projectionRulesTree = pathsToTree(fieldsKeys, function (path) {                                                  // 84
    return including;                                                                                                  // 86
  }, function (node, path, fullPath) {                                                                                 // 86
    // Check passed projection fields' keys: If you have two rules such as                                             // 88
    // 'foo.bar' and 'foo.bar.baz', then the result becomes ambiguous. If                                              // 89
    // that happens, there is a probability you are doing something wrong,                                             // 90
    // framework should notify you about such mistake earlier on cursor                                                // 91
    // compilation step than later during runtime.  Note, that real mongo                                              // 92
    // doesn't do anything about it and the later rule appears in projection                                           // 93
    // project, more priority it takes.                                                                                // 94
    //                                                                                                                 // 95
    // Example, assume following in mongo shell:                                                                       // 96
    // > db.coll.insert({ a: { b: 23, c: 44 } })                                                                       // 97
    // > db.coll.find({}, { 'a': 1, 'a.b': 1 })                                                                        // 98
    // { "_id" : ObjectId("520bfe456024608e8ef24af3"), "a" : { "b" : 23 } }                                            // 99
    // > db.coll.find({}, { 'a.b': 1, 'a': 1 })                                                                        // 100
    // { "_id" : ObjectId("520bfe456024608e8ef24af3"), "a" : { "b" : 23, "c" : 44 } }                                  // 101
    //                                                                                                                 // 102
    // Note, how second time the return set of keys is different.                                                      // 103
    var currentPath = fullPath;                                                                                        // 105
    var anotherPath = path;                                                                                            // 106
    throw MinimongoError("both " + currentPath + " and " + anotherPath + " found in fields option, using both of them may trigger " + "unexpected behavior. Did you mean to use only one of them?");
  });                                                                                                                  // 110
  return {                                                                                                             // 112
    tree: projectionRulesTree,                                                                                         // 113
    including: including                                                                                               // 114
  };                                                                                                                   // 112
}; // paths - Array: list of mongo style paths                                                                         // 116
// newLeafFn - Function: of form function(path) should return a scalar value to                                        // 119
//                       put into list created for that path                                                           // 120
// conflictFn - Function: of form function(node, path, fullPath) is called                                             // 121
//                        when building a tree path for 'fullPath' node on                                             // 122
//                        'path' was already a leaf with a value. Must return a                                        // 123
//                        conflict resolution.                                                                         // 124
// initial tree - Optional Object: starting tree.                                                                      // 125
// @returns - Object: tree represented as a set of nested objects                                                      // 126
                                                                                                                       //
                                                                                                                       //
pathsToTree = function (paths, newLeafFn, conflictFn, tree) {                                                          // 127
  tree = tree || {};                                                                                                   // 128
                                                                                                                       //
  _.each(paths, function (keyPath) {                                                                                   // 129
    var treePos = tree;                                                                                                // 130
    var pathArr = keyPath.split('.'); // use _.all just for iteration with break                                       // 131
                                                                                                                       //
    var success = _.all(pathArr.slice(0, -1), function (key, idx) {                                                    // 134
      if (!_.has(treePos, key)) treePos[key] = {};else if (!_.isObject(treePos[key])) {                                // 135
        treePos[key] = conflictFn(treePos[key], pathArr.slice(0, idx + 1).join('.'), keyPath); // break out of loop if we are failing for this path
                                                                                                                       //
        if (!_.isObject(treePos[key])) return false;                                                                   // 142
      }                                                                                                                // 144
      treePos = treePos[key];                                                                                          // 146
      return true;                                                                                                     // 147
    });                                                                                                                // 148
                                                                                                                       //
    if (success) {                                                                                                     // 150
      var lastKey = _.last(pathArr);                                                                                   // 151
                                                                                                                       //
      if (!_.has(treePos, lastKey)) treePos[lastKey] = newLeafFn(keyPath);else treePos[lastKey] = conflictFn(treePos[lastKey], keyPath, keyPath);
    }                                                                                                                  // 156
  });                                                                                                                  // 157
                                                                                                                       //
  return tree;                                                                                                         // 159
};                                                                                                                     // 160
                                                                                                                       //
LocalCollection._checkSupportedProjection = function (fields) {                                                        // 162
  if (!_.isObject(fields) || _.isArray(fields)) throw MinimongoError("fields option must be an object");               // 163
                                                                                                                       //
  _.each(fields, function (val, keyPath) {                                                                             // 166
    if (_.contains(keyPath.split('.'), '$')) throw MinimongoError("Minimongo doesn't support $ operator in projections yet.");
    if ((typeof val === "undefined" ? "undefined" : (0, _typeof3.default)(val)) === 'object' && _.intersection(['$elemMatch', '$meta', '$slice'], _.keys(val)).length > 0) throw MinimongoError("Minimongo doesn't support operators in projections yet.");
    if (_.indexOf([1, 0, true, false], val) === -1) throw MinimongoError("Projection values should be one of 1, 0, true, or false");
  });                                                                                                                  // 173
};                                                                                                                     // 174
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"modify.js":["babel-runtime/helpers/typeof","./validation.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/modify.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                                //
                                                                                                                       //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                       //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
var assertHasValidFieldNames = void 0,                                                                                 // 1
    assertIsValidFieldName = void 0;                                                                                   // 1
module.importSync("./validation.js", {                                                                                 // 1
  assertHasValidFieldNames: function (v) {                                                                             // 1
    assertHasValidFieldNames = v;                                                                                      // 1
  },                                                                                                                   // 1
  assertIsValidFieldName: function (v) {                                                                               // 1
    assertIsValidFieldName = v;                                                                                        // 1
  }                                                                                                                    // 1
}, 0);                                                                                                                 // 1
                                                                                                                       //
// XXX need a strategy for passing the binding of $ into this                                                          // 3
// function, from the compiled selector                                                                                // 4
//                                                                                                                     // 5
// maybe just {key.up.to.just.before.dollarsign: array_index}                                                          // 6
//                                                                                                                     // 7
// XXX atomicity: if one modification fails, do we roll back the whole                                                 // 8
// change?                                                                                                             // 9
//                                                                                                                     // 10
// options:                                                                                                            // 11
//   - isInsert is set when _modify is being called to compute the document to                                         // 12
//     insert as part of an upsert operation. We use this primarily to figure                                          // 13
//     out when to set the fields in $setOnInsert, if present.                                                         // 14
LocalCollection._modify = function (doc, mod, options) {                                                               // 15
  options = options || {};                                                                                             // 16
  if (!isPlainObject(mod)) throw MinimongoError("Modifier must be an object"); // Make sure the caller can't mutate our data structures.
                                                                                                                       //
  mod = EJSON.clone(mod);                                                                                              // 21
  var isModifier = isOperatorObject(mod);                                                                              // 23
  var newDoc;                                                                                                          // 25
                                                                                                                       //
  if (!isModifier) {                                                                                                   // 27
    if (mod._id && !EJSON.equals(doc._id, mod._id)) throw MinimongoError("Cannot change the _id of a document"); // replace the whole document
                                                                                                                       //
    assertHasValidFieldNames(mod);                                                                                     // 32
    newDoc = mod;                                                                                                      // 33
  } else {                                                                                                             // 34
    // apply modifiers to the doc.                                                                                     // 35
    newDoc = EJSON.clone(doc);                                                                                         // 36
                                                                                                                       //
    _.each(mod, function (operand, op) {                                                                               // 38
      var modFunc = MODIFIERS[op]; // Treat $setOnInsert as $set if this is an insert.                                 // 39
                                                                                                                       //
      if (options.isInsert && op === '$setOnInsert') modFunc = MODIFIERS['$set'];                                      // 41
      if (!modFunc) throw MinimongoError("Invalid modifier specified " + op);                                          // 43
                                                                                                                       //
      _.each(operand, function (arg, keypath) {                                                                        // 45
        if (keypath === '') {                                                                                          // 46
          throw MinimongoError("An empty update path is not valid.");                                                  // 47
        }                                                                                                              // 48
                                                                                                                       //
        if (keypath === '_id' && op !== '$setOnInsert') {                                                              // 50
          throw MinimongoError("Mod on _id not allowed");                                                              // 51
        }                                                                                                              // 52
                                                                                                                       //
        var keyparts = keypath.split('.');                                                                             // 54
                                                                                                                       //
        if (!_.all(keyparts, _.identity)) {                                                                            // 56
          throw MinimongoError("The update path '" + keypath + "' contains an empty field name, which is not allowed.");
        }                                                                                                              // 60
                                                                                                                       //
        var noCreate = _.has(NO_CREATE_MODIFIERS, op);                                                                 // 62
                                                                                                                       //
        var forbidArray = op === "$rename";                                                                            // 63
        var target = findModTarget(newDoc, keyparts, {                                                                 // 64
          noCreate: NO_CREATE_MODIFIERS[op],                                                                           // 65
          forbidArray: op === "$rename",                                                                               // 66
          arrayIndices: options.arrayIndices                                                                           // 67
        });                                                                                                            // 64
        var field = keyparts.pop();                                                                                    // 69
        modFunc(target, field, arg, keypath, newDoc);                                                                  // 70
      });                                                                                                              // 71
    });                                                                                                                // 72
  } // move new document into place.                                                                                   // 73
                                                                                                                       //
                                                                                                                       //
  _.each(_.keys(doc), function (k) {                                                                                   // 76
    // Note: this used to be for (var k in doc) however, this does not                                                 // 77
    // work right in Opera. Deleting from a doc while iterating over it                                                // 78
    // would sometimes cause opera to skip some keys.                                                                  // 79
    if (k !== '_id') delete doc[k];                                                                                    // 80
  });                                                                                                                  // 82
                                                                                                                       //
  _.each(newDoc, function (v, k) {                                                                                     // 83
    doc[k] = v;                                                                                                        // 84
  });                                                                                                                  // 85
}; // for a.b.c.2.d.e, keyparts should be ['a', 'b', 'c', '2', 'd', 'e'],                                              // 86
// and then you would operate on the 'e' property of the returned                                                      // 89
// object.                                                                                                             // 90
//                                                                                                                     // 91
// if options.noCreate is falsey, creates intermediate levels of                                                       // 92
// structure as necessary, like mkdir -p (and raises an exception if                                                   // 93
// that would mean giving a non-numeric property to an array.) if                                                      // 94
// options.noCreate is true, return undefined instead.                                                                 // 95
//                                                                                                                     // 96
// may modify the last element of keyparts to signal to the caller that it needs                                       // 97
// to use a different value to index into the returned object (for example,                                            // 98
// ['a', '01'] -> ['a', 1]).                                                                                           // 99
//                                                                                                                     // 100
// if forbidArray is true, return null if the keypath goes through an array.                                           // 101
//                                                                                                                     // 102
// if options.arrayIndices is set, use its first element for the (first) '$' in                                        // 103
// the path.                                                                                                           // 104
                                                                                                                       //
                                                                                                                       //
var findModTarget = function (doc, keyparts, options) {                                                                // 105
  options = options || {};                                                                                             // 106
  var usedArrayIndex = false;                                                                                          // 107
                                                                                                                       //
  for (var i = 0; i < keyparts.length; i++) {                                                                          // 108
    var last = i === keyparts.length - 1;                                                                              // 109
    var keypart = keyparts[i];                                                                                         // 110
    var indexable = isIndexable(doc);                                                                                  // 111
                                                                                                                       //
    if (!indexable) {                                                                                                  // 112
      if (options.noCreate) return undefined;                                                                          // 113
      var e = MinimongoError("cannot use the part '" + keypart + "' to traverse " + doc);                              // 115
      e.setPropertyError = true;                                                                                       // 117
      throw e;                                                                                                         // 118
    }                                                                                                                  // 119
                                                                                                                       //
    if (doc instanceof Array) {                                                                                        // 120
      if (options.forbidArray) return null;                                                                            // 121
                                                                                                                       //
      if (keypart === '$') {                                                                                           // 123
        if (usedArrayIndex) throw MinimongoError("Too many positional (i.e. '$') elements");                           // 124
                                                                                                                       //
        if (!options.arrayIndices || !options.arrayIndices.length) {                                                   // 126
          throw MinimongoError("The positional operator did not find the " + "match needed from the query");           // 127
        }                                                                                                              // 129
                                                                                                                       //
        keypart = options.arrayIndices[0];                                                                             // 130
        usedArrayIndex = true;                                                                                         // 131
      } else if (isNumericKey(keypart)) {                                                                              // 132
        keypart = parseInt(keypart);                                                                                   // 133
      } else {                                                                                                         // 134
        if (options.noCreate) return undefined;                                                                        // 135
        throw MinimongoError("can't append to array using string field name [" + keypart + "]");                       // 137
      }                                                                                                                // 140
                                                                                                                       //
      if (last) // handle 'a.01'                                                                                       // 141
        keyparts[i] = keypart;                                                                                         // 143
      if (options.noCreate && keypart >= doc.length) return undefined;                                                 // 144
                                                                                                                       //
      while (doc.length < keypart) {                                                                                   // 146
        doc.push(null);                                                                                                // 147
      }                                                                                                                // 146
                                                                                                                       //
      if (!last) {                                                                                                     // 148
        if (doc.length === keypart) doc.push({});else if ((0, _typeof3.default)(doc[keypart]) !== "object") throw MinimongoError("can't modify field '" + keyparts[i + 1] + "' of list value " + JSON.stringify(doc[keypart]));
      }                                                                                                                // 154
    } else {                                                                                                           // 155
      assertIsValidFieldName(keypart);                                                                                 // 156
                                                                                                                       //
      if (!(keypart in doc)) {                                                                                         // 157
        if (options.noCreate) return undefined;                                                                        // 158
        if (!last) doc[keypart] = {};                                                                                  // 160
      }                                                                                                                // 162
    }                                                                                                                  // 163
                                                                                                                       //
    if (last) return doc;                                                                                              // 165
    doc = doc[keypart];                                                                                                // 167
  } // notreached                                                                                                      // 168
                                                                                                                       //
};                                                                                                                     // 171
                                                                                                                       //
var NO_CREATE_MODIFIERS = {                                                                                            // 173
  $unset: true,                                                                                                        // 174
  $pop: true,                                                                                                          // 175
  $rename: true,                                                                                                       // 176
  $pull: true,                                                                                                         // 177
  $pullAll: true                                                                                                       // 178
};                                                                                                                     // 173
var MODIFIERS = {                                                                                                      // 181
  $currentDate: function (target, field, arg) {                                                                        // 182
    if ((typeof arg === "undefined" ? "undefined" : (0, _typeof3.default)(arg)) === "object" && arg.hasOwnProperty("$type")) {
      if (arg.$type !== "date") {                                                                                      // 184
        throw MinimongoError("Minimongo does currently only support the date type " + "in $currentDate modifiers", {   // 185
          field: field                                                                                                 // 188
        });                                                                                                            // 188
      }                                                                                                                // 189
    } else if (arg !== true) {                                                                                         // 190
      throw MinimongoError("Invalid $currentDate modifier", {                                                          // 191
        field: field                                                                                                   // 191
      });                                                                                                              // 191
    }                                                                                                                  // 192
                                                                                                                       //
    target[field] = new Date();                                                                                        // 193
  },                                                                                                                   // 194
  $min: function (target, field, arg) {                                                                                // 195
    if (typeof arg !== "number") {                                                                                     // 196
      throw MinimongoError("Modifier $min allowed for numbers only", {                                                 // 197
        field: field                                                                                                   // 197
      });                                                                                                              // 197
    }                                                                                                                  // 198
                                                                                                                       //
    if (field in target) {                                                                                             // 199
      if (typeof target[field] !== "number") {                                                                         // 200
        throw MinimongoError("Cannot apply $min modifier to non-number", {                                             // 201
          field: field                                                                                                 // 202
        });                                                                                                            // 202
      }                                                                                                                // 203
                                                                                                                       //
      if (target[field] > arg) {                                                                                       // 204
        target[field] = arg;                                                                                           // 205
      }                                                                                                                // 206
    } else {                                                                                                           // 207
      target[field] = arg;                                                                                             // 208
    }                                                                                                                  // 209
  },                                                                                                                   // 210
  $max: function (target, field, arg) {                                                                                // 211
    if (typeof arg !== "number") {                                                                                     // 212
      throw MinimongoError("Modifier $max allowed for numbers only", {                                                 // 213
        field: field                                                                                                   // 213
      });                                                                                                              // 213
    }                                                                                                                  // 214
                                                                                                                       //
    if (field in target) {                                                                                             // 215
      if (typeof target[field] !== "number") {                                                                         // 216
        throw MinimongoError("Cannot apply $max modifier to non-number", {                                             // 217
          field: field                                                                                                 // 218
        });                                                                                                            // 218
      }                                                                                                                // 219
                                                                                                                       //
      if (target[field] < arg) {                                                                                       // 220
        target[field] = arg;                                                                                           // 221
      }                                                                                                                // 222
    } else {                                                                                                           // 223
      target[field] = arg;                                                                                             // 224
    }                                                                                                                  // 225
  },                                                                                                                   // 226
  $inc: function (target, field, arg) {                                                                                // 227
    if (typeof arg !== "number") throw MinimongoError("Modifier $inc allowed for numbers only", {                      // 228
      field: field                                                                                                     // 229
    });                                                                                                                // 229
                                                                                                                       //
    if (field in target) {                                                                                             // 230
      if (typeof target[field] !== "number") throw MinimongoError("Cannot apply $inc modifier to non-number", {        // 231
        field: field                                                                                                   // 233
      });                                                                                                              // 233
      target[field] += arg;                                                                                            // 234
    } else {                                                                                                           // 235
      target[field] = arg;                                                                                             // 236
    }                                                                                                                  // 237
  },                                                                                                                   // 238
  $set: function (target, field, arg) {                                                                                // 239
    if (!_.isObject(target)) {                                                                                         // 240
      // not an array or an object                                                                                     // 240
      var e = MinimongoError("Cannot set property on non-object field", {                                              // 241
        field: field                                                                                                   // 242
      });                                                                                                              // 242
      e.setPropertyError = true;                                                                                       // 243
      throw e;                                                                                                         // 244
    }                                                                                                                  // 245
                                                                                                                       //
    if (target === null) {                                                                                             // 246
      var e = MinimongoError("Cannot set property on null", {                                                          // 247
        field: field                                                                                                   // 247
      });                                                                                                              // 247
      e.setPropertyError = true;                                                                                       // 248
      throw e;                                                                                                         // 249
    }                                                                                                                  // 250
                                                                                                                       //
    assertHasValidFieldNames(arg);                                                                                     // 251
    target[field] = arg;                                                                                               // 252
  },                                                                                                                   // 253
  $setOnInsert: function (target, field, arg) {// converted to `$set` in `_modify`                                     // 254
  },                                                                                                                   // 256
  $unset: function (target, field, arg) {                                                                              // 257
    if (target !== undefined) {                                                                                        // 258
      if (target instanceof Array) {                                                                                   // 259
        if (field in target) target[field] = null;                                                                     // 260
      } else delete target[field];                                                                                     // 262
    }                                                                                                                  // 264
  },                                                                                                                   // 265
  $push: function (target, field, arg) {                                                                               // 266
    if (target[field] === undefined) target[field] = [];                                                               // 267
    if (!(target[field] instanceof Array)) throw MinimongoError("Cannot apply $push modifier to non-array", {          // 269
      field: field                                                                                                     // 271
    });                                                                                                                // 271
                                                                                                                       //
    if (!(arg && arg.$each)) {                                                                                         // 273
      // Simple mode: not $each                                                                                        // 274
      assertHasValidFieldNames(arg);                                                                                   // 275
      target[field].push(arg);                                                                                         // 276
      return;                                                                                                          // 277
    } // Fancy mode: $each (and maybe $slice and $sort and $position)                                                  // 278
                                                                                                                       //
                                                                                                                       //
    var toPush = arg.$each;                                                                                            // 281
    if (!(toPush instanceof Array)) throw MinimongoError("$each must be an array", {                                   // 282
      field: field                                                                                                     // 283
    });                                                                                                                // 283
    assertHasValidFieldNames(toPush); // Parse $position                                                               // 284
                                                                                                                       //
    var position = undefined;                                                                                          // 287
                                                                                                                       //
    if ('$position' in arg) {                                                                                          // 288
      if (typeof arg.$position !== "number") throw MinimongoError("$position must be a numeric value", {               // 289
        field: field                                                                                                   // 290
      }); // XXX should check to make sure integer                                                                     // 290
                                                                                                                       //
      if (arg.$position < 0) throw MinimongoError("$position in $push must be zero or positive", {                     // 292
        field: field                                                                                                   // 294
      });                                                                                                              // 294
      position = arg.$position;                                                                                        // 295
    } // Parse $slice.                                                                                                 // 296
                                                                                                                       //
                                                                                                                       //
    var slice = undefined;                                                                                             // 299
                                                                                                                       //
    if ('$slice' in arg) {                                                                                             // 300
      if (typeof arg.$slice !== "number") throw MinimongoError("$slice must be a numeric value", {                     // 301
        field: field                                                                                                   // 302
      }); // XXX should check to make sure integer                                                                     // 302
                                                                                                                       //
      if (arg.$slice > 0) throw MinimongoError("$slice in $push must be zero or negative", {                           // 304
        field: field                                                                                                   // 306
      });                                                                                                              // 306
      slice = arg.$slice;                                                                                              // 307
    } // Parse $sort.                                                                                                  // 308
                                                                                                                       //
                                                                                                                       //
    var sortFunction = undefined;                                                                                      // 311
                                                                                                                       //
    if (arg.$sort) {                                                                                                   // 312
      if (slice === undefined) throw MinimongoError("$sort requires $slice to be present", {                           // 313
        field: field                                                                                                   // 314
      }); // XXX this allows us to use a $sort whose value is an array, but that's                                     // 314
      // actually an extension of the Node driver, so it won't work                                                    // 316
      // server-side. Could be confusing!                                                                              // 317
      // XXX is it correct that we don't do geo-stuff here?                                                            // 318
                                                                                                                       //
      sortFunction = new Minimongo.Sorter(arg.$sort).getComparator();                                                  // 319
                                                                                                                       //
      for (var i = 0; i < toPush.length; i++) {                                                                        // 320
        if (LocalCollection._f._type(toPush[i]) !== 3) {                                                               // 321
          throw MinimongoError("$push like modifiers using $sort " + "require all elements to be objects", {           // 322
            field: field                                                                                               // 323
          });                                                                                                          // 323
        }                                                                                                              // 324
      }                                                                                                                // 325
    } // Actually push.                                                                                                // 326
                                                                                                                       //
                                                                                                                       //
    if (position === undefined) {                                                                                      // 329
      for (var j = 0; j < toPush.length; j++) {                                                                        // 330
        target[field].push(toPush[j]);                                                                                 // 331
      }                                                                                                                // 330
    } else {                                                                                                           // 332
      var spliceArguments = [position, 0];                                                                             // 333
                                                                                                                       //
      for (var j = 0; j < toPush.length; j++) {                                                                        // 334
        spliceArguments.push(toPush[j]);                                                                               // 335
      }                                                                                                                // 334
                                                                                                                       //
      Array.prototype.splice.apply(target[field], spliceArguments);                                                    // 336
    } // Actually sort.                                                                                                // 337
                                                                                                                       //
                                                                                                                       //
    if (sortFunction) target[field].sort(sortFunction); // Actually slice.                                             // 340
                                                                                                                       //
    if (slice !== undefined) {                                                                                         // 344
      if (slice === 0) target[field] = []; // differs from Array.slice!                                                // 345
      else target[field] = target[field].slice(slice);                                                                 // 345
    }                                                                                                                  // 349
  },                                                                                                                   // 350
  $pushAll: function (target, field, arg) {                                                                            // 351
    if (!((typeof arg === "undefined" ? "undefined" : (0, _typeof3.default)(arg)) === "object" && arg instanceof Array)) throw MinimongoError("Modifier $pushAll/pullAll allowed for arrays only");
    assertHasValidFieldNames(arg);                                                                                     // 354
    var x = target[field];                                                                                             // 355
    if (x === undefined) target[field] = arg;else if (!(x instanceof Array)) throw MinimongoError("Cannot apply $pushAll modifier to non-array", {
      field: field                                                                                                     // 360
    });else {                                                                                                          // 360
      for (var i = 0; i < arg.length; i++) {                                                                           // 362
        x.push(arg[i]);                                                                                                // 363
      }                                                                                                                // 362
    }                                                                                                                  // 364
  },                                                                                                                   // 365
  $addToSet: function (target, field, arg) {                                                                           // 366
    var isEach = false;                                                                                                // 367
                                                                                                                       //
    if ((typeof arg === "undefined" ? "undefined" : (0, _typeof3.default)(arg)) === "object") {                        // 368
      //check if first key is '$each'                                                                                  // 369
      var keys = Object.keys(arg);                                                                                     // 370
                                                                                                                       //
      if (keys[0] === "$each") {                                                                                       // 371
        isEach = true;                                                                                                 // 372
      }                                                                                                                // 373
    }                                                                                                                  // 374
                                                                                                                       //
    var values = isEach ? arg["$each"] : [arg];                                                                        // 375
    assertHasValidFieldNames(values);                                                                                  // 376
    var x = target[field];                                                                                             // 377
    if (x === undefined) target[field] = values;else if (!(x instanceof Array)) throw MinimongoError("Cannot apply $addToSet modifier to non-array", {
      field: field                                                                                                     // 382
    });else {                                                                                                          // 382
      _.each(values, function (value) {                                                                                // 384
        for (var i = 0; i < x.length; i++) {                                                                           // 385
          if (LocalCollection._f._equal(value, x[i])) return;                                                          // 386
        }                                                                                                              // 385
                                                                                                                       //
        x.push(value);                                                                                                 // 388
      });                                                                                                              // 389
    }                                                                                                                  // 390
  },                                                                                                                   // 391
  $pop: function (target, field, arg) {                                                                                // 392
    if (target === undefined) return;                                                                                  // 393
    var x = target[field];                                                                                             // 395
    if (x === undefined) return;else if (!(x instanceof Array)) throw MinimongoError("Cannot apply $pop modifier to non-array", {
      field: field                                                                                                     // 400
    });else {                                                                                                          // 400
      if (typeof arg === 'number' && arg < 0) x.splice(0, 1);else x.pop();                                             // 402
    }                                                                                                                  // 406
  },                                                                                                                   // 407
  $pull: function (target, field, arg) {                                                                               // 408
    if (target === undefined) return;                                                                                  // 409
    var x = target[field];                                                                                             // 411
    if (x === undefined) return;else if (!(x instanceof Array)) throw MinimongoError("Cannot apply $pull/pullAll modifier to non-array", {
      field: field                                                                                                     // 416
    });else {                                                                                                          // 416
      var out = [];                                                                                                    // 418
                                                                                                                       //
      if (arg != null && (typeof arg === "undefined" ? "undefined" : (0, _typeof3.default)(arg)) === "object" && !(arg instanceof Array)) {
        // XXX would be much nicer to compile this once, rather than                                                   // 420
        // for each document we modify.. but usually we're not                                                         // 421
        // modifying that many documents, so we'll let it slide for                                                    // 422
        // now                                                                                                         // 423
        // XXX Minimongo.Matcher isn't up for the job, because we need                                                 // 425
        // to permit stuff like {$pull: {a: {$gt: 4}}}.. something                                                     // 426
        // like {$gt: 4} is not normally a complete selector.                                                          // 427
        // same issue as $elemMatch possibly?                                                                          // 428
        var matcher = new Minimongo.Matcher(arg);                                                                      // 429
                                                                                                                       //
        for (var i = 0; i < x.length; i++) {                                                                           // 430
          if (!matcher.documentMatches(x[i]).result) out.push(x[i]);                                                   // 431
        }                                                                                                              // 430
      } else {                                                                                                         // 433
        for (var i = 0; i < x.length; i++) {                                                                           // 434
          if (!LocalCollection._f._equal(x[i], arg)) out.push(x[i]);                                                   // 435
        }                                                                                                              // 434
      }                                                                                                                // 437
                                                                                                                       //
      target[field] = out;                                                                                             // 438
    }                                                                                                                  // 439
  },                                                                                                                   // 440
  $pullAll: function (target, field, arg) {                                                                            // 441
    if (!((typeof arg === "undefined" ? "undefined" : (0, _typeof3.default)(arg)) === "object" && arg instanceof Array)) throw MinimongoError("Modifier $pushAll/pullAll allowed for arrays only", {
      field: field                                                                                                     // 444
    });                                                                                                                // 444
    if (target === undefined) return;                                                                                  // 445
    var x = target[field];                                                                                             // 447
    if (x === undefined) return;else if (!(x instanceof Array)) throw MinimongoError("Cannot apply $pull/pullAll modifier to non-array", {
      field: field                                                                                                     // 452
    });else {                                                                                                          // 452
      var out = [];                                                                                                    // 454
                                                                                                                       //
      for (var i = 0; i < x.length; i++) {                                                                             // 455
        var exclude = false;                                                                                           // 456
                                                                                                                       //
        for (var j = 0; j < arg.length; j++) {                                                                         // 457
          if (LocalCollection._f._equal(x[i], arg[j])) {                                                               // 458
            exclude = true;                                                                                            // 459
            break;                                                                                                     // 460
          }                                                                                                            // 461
        }                                                                                                              // 462
                                                                                                                       //
        if (!exclude) out.push(x[i]);                                                                                  // 463
      }                                                                                                                // 465
                                                                                                                       //
      target[field] = out;                                                                                             // 466
    }                                                                                                                  // 467
  },                                                                                                                   // 468
  $rename: function (target, field, arg, keypath, doc) {                                                               // 469
    if (keypath === arg) // no idea why mongo has this restriction..                                                   // 470
      throw MinimongoError("$rename source must differ from target", {                                                 // 472
        field: field                                                                                                   // 472
      });                                                                                                              // 472
    if (target === null) throw MinimongoError("$rename source field invalid", {                                        // 473
      field: field                                                                                                     // 474
    });                                                                                                                // 474
    if (typeof arg !== "string") throw MinimongoError("$rename target must be a string", {                             // 475
      field: field                                                                                                     // 476
    });                                                                                                                // 476
                                                                                                                       //
    if (arg.indexOf('\0') > -1) {                                                                                      // 477
      // Null bytes are not allowed in Mongo field names                                                               // 478
      // https://docs.mongodb.com/manual/reference/limits/#Restrictions-on-Field-Names                                 // 479
      throw MinimongoError("The 'to' field for $rename cannot contain an embedded null byte", {                        // 480
        field: field                                                                                                   // 482
      });                                                                                                              // 482
    }                                                                                                                  // 483
                                                                                                                       //
    if (target === undefined) return;                                                                                  // 484
    var v = target[field];                                                                                             // 486
    delete target[field];                                                                                              // 487
    var keyparts = arg.split('.');                                                                                     // 489
    var target2 = findModTarget(doc, keyparts, {                                                                       // 490
      forbidArray: true                                                                                                // 490
    });                                                                                                                // 490
    if (target2 === null) throw MinimongoError("$rename target field invalid", {                                       // 491
      field: field                                                                                                     // 492
    });                                                                                                                // 492
    var field2 = keyparts.pop();                                                                                       // 493
    target2[field2] = v;                                                                                               // 494
  },                                                                                                                   // 495
  $bit: function (target, field, arg) {                                                                                // 496
    // XXX mongo only supports $bit on integers, and we only support                                                   // 497
    // native javascript numbers (doubles) so far, so we can't support $bit                                            // 498
    throw MinimongoError("$bit is not supported", {                                                                    // 499
      field: field                                                                                                     // 499
    });                                                                                                                // 499
  }                                                                                                                    // 500
};                                                                                                                     // 181
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"diff.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/diff.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// ordered: bool.                                                                                                      // 1
// old_results and new_results: collections of documents.                                                              // 2
//    if ordered, they are arrays.                                                                                     // 3
//    if unordered, they are IdMaps                                                                                    // 4
LocalCollection._diffQueryChanges = function (ordered, oldResults, newResults, observer, options) {                    // 5
  return DiffSequence.diffQueryChanges(ordered, oldResults, newResults, observer, options);                            // 6
};                                                                                                                     // 7
                                                                                                                       //
LocalCollection._diffQueryUnorderedChanges = function (oldResults, newResults, observer, options) {                    // 9
  return DiffSequence.diffQueryUnorderedChanges(oldResults, newResults, observer, options);                            // 10
};                                                                                                                     // 11
                                                                                                                       //
LocalCollection._diffQueryOrderedChanges = function (oldResults, newResults, observer, options) {                      // 14
  return DiffSequence.diffQueryOrderedChanges(oldResults, newResults, observer, options);                              // 16
};                                                                                                                     // 17
                                                                                                                       //
LocalCollection._diffObjects = function (left, right, callbacks) {                                                     // 19
  return DiffSequence.diffObjects(left, right, callbacks);                                                             // 20
};                                                                                                                     // 21
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"id_map.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/id_map.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
LocalCollection._IdMap = function () {                                                                                 // 1
  var self = this;                                                                                                     // 2
  IdMap.call(self, MongoID.idStringify, MongoID.idParse);                                                              // 3
};                                                                                                                     // 4
                                                                                                                       //
Meteor._inherits(LocalCollection._IdMap, IdMap);                                                                       // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"observe.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/observe.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// XXX maybe move these into another ObserveHelpers package or something                                               // 1
// _CachingChangeObserver is an object which receives observeChanges callbacks                                         // 3
// and keeps a cache of the current cursor state up to date in self.docs. Users                                        // 4
// of this class should read the docs field but not modify it. You should pass                                         // 5
// the "applyChange" field as the callbacks to the underlying observeChanges                                           // 6
// call. Optionally, you can specify your own observeChanges callbacks which are                                       // 7
// invoked immediately before the docs field is updated; this object is made                                           // 8
// available as `this` to those callbacks.                                                                             // 9
LocalCollection._CachingChangeObserver = function (options) {                                                          // 10
  var self = this;                                                                                                     // 11
  options = options || {};                                                                                             // 12
                                                                                                                       //
  var orderedFromCallbacks = options.callbacks && LocalCollection._observeChangesCallbacksAreOrdered(options.callbacks);
                                                                                                                       //
  if (_.has(options, 'ordered')) {                                                                                     // 16
    self.ordered = options.ordered;                                                                                    // 17
    if (options.callbacks && options.ordered !== orderedFromCallbacks) throw Error("ordered option doesn't match callbacks");
  } else if (options.callbacks) {                                                                                      // 20
    self.ordered = orderedFromCallbacks;                                                                               // 21
  } else {                                                                                                             // 22
    throw Error("must provide ordered or callbacks");                                                                  // 23
  }                                                                                                                    // 24
                                                                                                                       //
  var callbacks = options.callbacks || {};                                                                             // 25
                                                                                                                       //
  if (self.ordered) {                                                                                                  // 27
    self.docs = new OrderedDict(MongoID.idStringify);                                                                  // 28
    self.applyChange = {                                                                                               // 29
      addedBefore: function (id, fields, before) {                                                                     // 30
        var doc = EJSON.clone(fields);                                                                                 // 31
        doc._id = id;                                                                                                  // 32
        callbacks.addedBefore && callbacks.addedBefore.call(self, id, fields, before); // This line triggers if we provide added with movedBefore.
                                                                                                                       //
        callbacks.added && callbacks.added.call(self, id, fields); // XXX could `before` be a falsy ID?  Technically   // 36
        // idStringify seems to allow for them -- though                                                               // 38
        // OrderedDict won't call stringify on a falsy arg.                                                            // 39
                                                                                                                       //
        self.docs.putBefore(id, doc, before || null);                                                                  // 40
      },                                                                                                               // 41
      movedBefore: function (id, before) {                                                                             // 42
        var doc = self.docs.get(id);                                                                                   // 43
        callbacks.movedBefore && callbacks.movedBefore.call(self, id, before);                                         // 44
        self.docs.moveBefore(id, before || null);                                                                      // 45
      }                                                                                                                // 46
    };                                                                                                                 // 29
  } else {                                                                                                             // 48
    self.docs = new LocalCollection._IdMap();                                                                          // 49
    self.applyChange = {                                                                                               // 50
      added: function (id, fields) {                                                                                   // 51
        var doc = EJSON.clone(fields);                                                                                 // 52
        callbacks.added && callbacks.added.call(self, id, fields);                                                     // 53
        doc._id = id;                                                                                                  // 54
        self.docs.set(id, doc);                                                                                        // 55
      }                                                                                                                // 56
    };                                                                                                                 // 50
  } // The methods in _IdMap and OrderedDict used by these callbacks are                                               // 58
  // identical.                                                                                                        // 61
                                                                                                                       //
                                                                                                                       //
  self.applyChange.changed = function (id, fields) {                                                                   // 62
    var doc = self.docs.get(id);                                                                                       // 63
    if (!doc) throw new Error("Unknown id for changed: " + id);                                                        // 64
    callbacks.changed && callbacks.changed.call(self, id, EJSON.clone(fields));                                        // 66
    DiffSequence.applyChanges(doc, fields);                                                                            // 68
  };                                                                                                                   // 69
                                                                                                                       //
  self.applyChange.removed = function (id) {                                                                           // 70
    callbacks.removed && callbacks.removed.call(self, id);                                                             // 71
    self.docs.remove(id);                                                                                              // 72
  };                                                                                                                   // 73
};                                                                                                                     // 74
                                                                                                                       //
LocalCollection._observeFromObserveChanges = function (cursor, observeCallbacks) {                                     // 76
  var transform = cursor.getTransform() || function (doc) {                                                            // 77
    return doc;                                                                                                        // 77
  };                                                                                                                   // 77
                                                                                                                       //
  var suppressed = !!observeCallbacks._suppress_initial;                                                               // 78
  var observeChangesCallbacks;                                                                                         // 80
                                                                                                                       //
  if (LocalCollection._observeCallbacksAreOrdered(observeCallbacks)) {                                                 // 81
    // The "_no_indices" option sets all index arguments to -1 and skips the                                           // 82
    // linear scans required to generate them.  This lets observers that don't                                         // 83
    // need absolute indices benefit from the other features of this API --                                            // 84
    // relative order, transforms, and applyChanges -- without the speed hit.                                          // 85
    var indices = !observeCallbacks._no_indices;                                                                       // 86
    observeChangesCallbacks = {                                                                                        // 87
      addedBefore: function (id, fields, before) {                                                                     // 88
        var self = this;                                                                                               // 89
        if (suppressed || !(observeCallbacks.addedAt || observeCallbacks.added)) return;                               // 90
        var doc = transform(_.extend(fields, {                                                                         // 92
          _id: id                                                                                                      // 92
        }));                                                                                                           // 92
                                                                                                                       //
        if (observeCallbacks.addedAt) {                                                                                // 93
          var index = indices ? before ? self.docs.indexOf(before) : self.docs.size() : -1;                            // 94
          observeCallbacks.addedAt(doc, index, before);                                                                // 96
        } else {                                                                                                       // 97
          observeCallbacks.added(doc);                                                                                 // 98
        }                                                                                                              // 99
      },                                                                                                               // 100
      changed: function (id, fields) {                                                                                 // 101
        var self = this;                                                                                               // 102
        if (!(observeCallbacks.changedAt || observeCallbacks.changed)) return;                                         // 103
        var doc = EJSON.clone(self.docs.get(id));                                                                      // 105
        if (!doc) throw new Error("Unknown id for changed: " + id);                                                    // 106
        var oldDoc = transform(EJSON.clone(doc));                                                                      // 108
        DiffSequence.applyChanges(doc, fields);                                                                        // 109
        doc = transform(doc);                                                                                          // 110
                                                                                                                       //
        if (observeCallbacks.changedAt) {                                                                              // 111
          var index = indices ? self.docs.indexOf(id) : -1;                                                            // 112
          observeCallbacks.changedAt(doc, oldDoc, index);                                                              // 113
        } else {                                                                                                       // 114
          observeCallbacks.changed(doc, oldDoc);                                                                       // 115
        }                                                                                                              // 116
      },                                                                                                               // 117
      movedBefore: function (id, before) {                                                                             // 118
        var self = this;                                                                                               // 119
        if (!observeCallbacks.movedTo) return;                                                                         // 120
        var from = indices ? self.docs.indexOf(id) : -1;                                                               // 122
        var to = indices ? before ? self.docs.indexOf(before) : self.docs.size() : -1; // When not moving backwards, adjust for the fact that removing the
        // document slides everything back one slot.                                                                   // 127
                                                                                                                       //
        if (to > from) --to;                                                                                           // 128
        observeCallbacks.movedTo(transform(EJSON.clone(self.docs.get(id))), from, to, before || null);                 // 130
      },                                                                                                               // 132
      removed: function (id) {                                                                                         // 133
        var self = this;                                                                                               // 134
        if (!(observeCallbacks.removedAt || observeCallbacks.removed)) return; // technically maybe there should be an EJSON.clone here, but it's about
        // to be removed from self.docs!                                                                               // 138
                                                                                                                       //
        var doc = transform(self.docs.get(id));                                                                        // 139
                                                                                                                       //
        if (observeCallbacks.removedAt) {                                                                              // 140
          var index = indices ? self.docs.indexOf(id) : -1;                                                            // 141
          observeCallbacks.removedAt(doc, index);                                                                      // 142
        } else {                                                                                                       // 143
          observeCallbacks.removed(doc);                                                                               // 144
        }                                                                                                              // 145
      }                                                                                                                // 146
    };                                                                                                                 // 87
  } else {                                                                                                             // 148
    observeChangesCallbacks = {                                                                                        // 149
      added: function (id, fields) {                                                                                   // 150
        if (!suppressed && observeCallbacks.added) {                                                                   // 151
          var doc = _.extend(fields, {                                                                                 // 152
            _id: id                                                                                                    // 152
          });                                                                                                          // 152
                                                                                                                       //
          observeCallbacks.added(transform(doc));                                                                      // 153
        }                                                                                                              // 154
      },                                                                                                               // 155
      changed: function (id, fields) {                                                                                 // 156
        var self = this;                                                                                               // 157
                                                                                                                       //
        if (observeCallbacks.changed) {                                                                                // 158
          var oldDoc = self.docs.get(id);                                                                              // 159
          var doc = EJSON.clone(oldDoc);                                                                               // 160
          DiffSequence.applyChanges(doc, fields);                                                                      // 161
          observeCallbacks.changed(transform(doc), transform(EJSON.clone(oldDoc)));                                    // 162
        }                                                                                                              // 164
      },                                                                                                               // 165
      removed: function (id) {                                                                                         // 166
        var self = this;                                                                                               // 167
                                                                                                                       //
        if (observeCallbacks.removed) {                                                                                // 168
          observeCallbacks.removed(transform(self.docs.get(id)));                                                      // 169
        }                                                                                                              // 170
      }                                                                                                                // 171
    };                                                                                                                 // 149
  }                                                                                                                    // 173
                                                                                                                       //
  var changeObserver = new LocalCollection._CachingChangeObserver({                                                    // 175
    callbacks: observeChangesCallbacks                                                                                 // 176
  });                                                                                                                  // 176
  var handle = cursor.observeChanges(changeObserver.applyChange);                                                      // 177
  suppressed = false;                                                                                                  // 178
  return handle;                                                                                                       // 180
};                                                                                                                     // 181
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"objectid.js":["babel-runtime/helpers/typeof",function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/objectid.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                                //
                                                                                                                       //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                       //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
// Is this selector just shorthand for lookup by _id?                                                                  // 1
LocalCollection._selectorIsId = function (selector) {                                                                  // 2
  return typeof selector === "string" || typeof selector === "number" || selector instanceof MongoID.ObjectID;         // 3
}; // Is the selector just lookup by _id (shorthand or not)?                                                           // 6
                                                                                                                       //
                                                                                                                       //
LocalCollection._selectorIsIdPerhapsAsObject = function (selector) {                                                   // 9
  return LocalCollection._selectorIsId(selector) || selector && (typeof selector === "undefined" ? "undefined" : (0, _typeof3.default)(selector)) === "object" && selector._id && LocalCollection._selectorIsId(selector._id) && _.size(selector) === 1;
}; // If this is a selector which explicitly constrains the match by ID to a finite                                    // 14
// number of documents, returns a list of their IDs.  Otherwise returns                                                // 17
// null. Note that the selector may have other restrictions so it may not even                                         // 18
// match those document!  We care about $in and $and since those are generated                                         // 19
// access-controlled update and remove.                                                                                // 20
                                                                                                                       //
                                                                                                                       //
LocalCollection._idsMatchedBySelector = function (selector) {                                                          // 21
  // Is the selector just an ID?                                                                                       // 22
  if (LocalCollection._selectorIsId(selector)) return [selector];                                                      // 23
  if (!selector) return null; // Do we have an _id clause?                                                             // 25
                                                                                                                       //
  if (_.has(selector, '_id')) {                                                                                        // 29
    // Is the _id clause just an ID?                                                                                   // 30
    if (LocalCollection._selectorIsId(selector._id)) return [selector._id]; // Is the _id clause {_id: {$in: ["x", "y", "z"]}}?
                                                                                                                       //
    if (selector._id && selector._id.$in && _.isArray(selector._id.$in) && !_.isEmpty(selector._id.$in) && _.all(selector._id.$in, LocalCollection._selectorIsId)) {
      return selector._id.$in;                                                                                         // 38
    }                                                                                                                  // 39
                                                                                                                       //
    return null;                                                                                                       // 40
  } // If this is a top-level $and, and any of the clauses constrain their                                             // 41
  // documents, then the whole selector is constrained by any one clause's                                             // 44
  // constraint. (Well, by their intersection, but that seems unlikely.)                                               // 45
                                                                                                                       //
                                                                                                                       //
  if (selector.$and && _.isArray(selector.$and)) {                                                                     // 46
    for (var i = 0; i < selector.$and.length; ++i) {                                                                   // 47
      var subIds = LocalCollection._idsMatchedBySelector(selector.$and[i]);                                            // 48
                                                                                                                       //
      if (subIds) return subIds;                                                                                       // 49
    }                                                                                                                  // 51
  }                                                                                                                    // 52
                                                                                                                       //
  return null;                                                                                                         // 54
};                                                                                                                     // 55
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"validation.js":["babel-runtime/helpers/typeof",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/minimongo/validation.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _typeof2 = require("babel-runtime/helpers/typeof");                                                                //
                                                                                                                       //
var _typeof3 = _interopRequireDefault(_typeof2);                                                                       //
                                                                                                                       //
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }                      //
                                                                                                                       //
module.export({                                                                                                        // 1
  assertIsValidFieldName: function () {                                                                                // 1
    return assertIsValidFieldName;                                                                                     // 1
  },                                                                                                                   // 1
  assertHasValidFieldNames: function () {                                                                              // 1
    return assertHasValidFieldNames;                                                                                   // 1
  }                                                                                                                    // 1
});                                                                                                                    // 1
// Make sure field names do not contain Mongo restricted                                                               // 1
// characters ('.', '$', '\0').                                                                                        // 2
// https://docs.mongodb.com/manual/reference/limits/#Restrictions-on-Field-Names                                       // 3
var invalidCharMsg = {                                                                                                 // 4
  '.': "contain '.'",                                                                                                  // 5
  '$': "start with '$'",                                                                                               // 6
  '\0': "contain null bytes"                                                                                           // 7
};                                                                                                                     // 4
                                                                                                                       //
function assertIsValidFieldName(key) {                                                                                 // 9
  var match = void 0;                                                                                                  // 10
                                                                                                                       //
  if (_.isString(key) && (match = key.match(/^\$|\.|\0/))) {                                                           // 11
    throw MinimongoError("Key " + key + " must not " + invalidCharMsg[match[0]]);                                      // 12
  }                                                                                                                    // 13
}                                                                                                                      // 14
                                                                                                                       //
; // checks if all field names in an object are valid                                                                  // 14
                                                                                                                       //
function assertHasValidFieldNames(doc) {                                                                               // 17
  if (doc && (typeof doc === "undefined" ? "undefined" : (0, _typeof3.default)(doc)) === "object") {                   // 18
    JSON.stringify(doc, function (key, value) {                                                                        // 19
      assertIsValidFieldName(key);                                                                                     // 20
      return value;                                                                                                    // 21
    });                                                                                                                // 22
  }                                                                                                                    // 23
}                                                                                                                      // 24
                                                                                                                       //
;                                                                                                                      // 24
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/minimongo/minimongo.js");
require("./node_modules/meteor/minimongo/wrap_transform.js");
require("./node_modules/meteor/minimongo/helpers.js");
require("./node_modules/meteor/minimongo/selector.js");
require("./node_modules/meteor/minimongo/sort.js");
require("./node_modules/meteor/minimongo/projection.js");
require("./node_modules/meteor/minimongo/modify.js");
require("./node_modules/meteor/minimongo/diff.js");
require("./node_modules/meteor/minimongo/id_map.js");
require("./node_modules/meteor/minimongo/observe.js");
require("./node_modules/meteor/minimongo/objectid.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.minimongo = {}, {
  LocalCollection: LocalCollection,
  Minimongo: Minimongo,
  MinimongoTest: MinimongoTest,
  MinimongoError: MinimongoError
});

})();
