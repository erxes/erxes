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
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var _ = Package.underscore._;
var check = Package.check.check;
var Match = Package.check.Match;
var Mongo = Package.mongo.Mongo;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var EJSON = Package.ejson.EJSON;
var EventEmitter = Package['raix:eventemitter'].EventEmitter;

/* Package-scope variables */
var Collection2;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/aldeed_collection2-core/lib/collection2.js                                                               //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// Exported only for listening to events                                                                             // 1
Collection2 = new EventEmitter();                                                                                    // 2
                                                                                                                     // 3
// backwards compatibility                                                                                           // 4
if (typeof Mongo === "undefined") {                                                                                  // 5
  Mongo = {};                                                                                                        // 6
  Mongo.Collection = Meteor.Collection;                                                                              // 7
}                                                                                                                    // 8
                                                                                                                     // 9
var addValidationErrorsPropName = SimpleSchema.version >= 2 ? 'addValidationErrors' : 'addInvalidKeys';              // 10
                                                                                                                     // 11
/**                                                                                                                  // 12
 * Mongo.Collection.prototype.attachSchema                                                                           // 13
 * @param {SimpleSchema|Object} ss - SimpleSchema instance or a schema definition object                             // 14
 *    from which to create a new SimpleSchema instance                                                               // 15
 * @param {Object} [options]                                                                                         // 16
 * @param {Boolean} [options.transform=false] Set to `true` if your document must be passed                          // 17
 *    through the collection's transform to properly validate.                                                       // 18
 * @param {Boolean} [options.replace=false] Set to `true` to replace any existing schema instead of combining        // 19
 * @return {undefined}                                                                                               // 20
 *                                                                                                                   // 21
 * Use this method to attach a schema to a collection created by another package,                                    // 22
 * such as Meteor.users. It is most likely unsafe to call this method more than                                      // 23
 * once for a single collection, or to call this for a collection that had a                                         // 24
 * schema object passed to its constructor.                                                                          // 25
 */                                                                                                                  // 26
Mongo.Collection.prototype.attachSchema = function c2AttachSchema(ss, options) {                                     // 27
  var self = this;                                                                                                   // 28
  options = options || {};                                                                                           // 29
                                                                                                                     // 30
  // Allow passing just the schema object                                                                            // 31
  if (!(ss instanceof SimpleSchema)) {                                                                               // 32
    ss = new SimpleSchema(ss);                                                                                       // 33
  }                                                                                                                  // 34
                                                                                                                     // 35
  self._c2 = self._c2 || {};                                                                                         // 36
                                                                                                                     // 37
  // If we've already attached one schema, we combine both into a new schema unless options.replace is `true`        // 38
  if (self._c2._simpleSchema && options.replace !== true) {                                                          // 39
    if (ss.version >= 2) {                                                                                           // 40
      var newSS = new SimpleSchema(self._c2._simpleSchema);                                                          // 41
      newSS.extend(ss);                                                                                              // 42
      ss = newSS;                                                                                                    // 43
    } else {                                                                                                         // 44
      ss = new SimpleSchema([self._c2._simpleSchema, ss]);                                                           // 45
    }                                                                                                                // 46
  }                                                                                                                  // 47
                                                                                                                     // 48
  var selector = options.selector;                                                                                   // 49
                                                                                                                     // 50
  function attachTo(obj) {                                                                                           // 51
    if (typeof selector === "object") {                                                                              // 52
      // Index of existing schema with identical selector                                                            // 53
      var schemaIndex = -1;                                                                                          // 54
                                                                                                                     // 55
      // we need an array to hold multiple schemas                                                                   // 56
      obj._c2._simpleSchemas = obj._c2._simpleSchemas || [];                                                         // 57
                                                                                                                     // 58
      // Loop through existing schemas with selectors                                                                // 59
      obj._c2._simpleSchemas.forEach(function (schema, index) {                                                      // 60
        // if we find a schema with an identical selector, save it's index                                           // 61
        if(_.isEqual(schema.selector, selector)) {                                                                   // 62
          schemaIndex = index;                                                                                       // 63
        }                                                                                                            // 64
      });                                                                                                            // 65
      if (schemaIndex === -1) {                                                                                      // 66
        // We didn't find the schema in our array - push it into the array                                           // 67
        obj._c2._simpleSchemas.push({                                                                                // 68
          schema: new SimpleSchema(ss),                                                                              // 69
          selector: selector,                                                                                        // 70
        });                                                                                                          // 71
      } else {                                                                                                       // 72
        // We found a schema with an identical selector in our array,                                                // 73
        if (options.replace !== true) {                                                                              // 74
          // Merge with existing schema unless options.replace is `true`                                             // 75
          if (obj._c2._simpleSchemas[schemaIndex].schema.version >= 2) {                                             // 76
            obj._c2._simpleSchemas[schemaIndex].schema.extend(ss);                                                   // 77
          } else {                                                                                                   // 78
            obj._c2._simpleSchemas[schemaIndex].schema = new SimpleSchema([obj._c2._simpleSchemas[schemaIndex].schema, ss]);
          }                                                                                                          // 80
        } else {                                                                                                     // 81
          // If options.repalce is `true` replace existing schema with new schema                                    // 82
          obj._c2._simpleSchemas[schemaIndex].schema = ss;                                                           // 83
        }                                                                                                            // 84
                                                                                                                     // 85
      }                                                                                                              // 86
                                                                                                                     // 87
      // Remove existing schemas without selector                                                                    // 88
      delete obj._c2._simpleSchema;                                                                                  // 89
    } else {                                                                                                         // 90
      // Track the schema in the collection                                                                          // 91
      obj._c2._simpleSchema = ss;                                                                                    // 92
                                                                                                                     // 93
      // Remove existing schemas with selector                                                                       // 94
      delete obj._c2._simpleSchemas;                                                                                 // 95
    }                                                                                                                // 96
  }                                                                                                                  // 97
                                                                                                                     // 98
  attachTo(self);                                                                                                    // 99
  // Attach the schema to the underlying LocalCollection, too                                                        // 100
  if (self._collection instanceof LocalCollection) {                                                                 // 101
    self._collection._c2 = self._collection._c2 || {};                                                               // 102
    attachTo(self._collection);                                                                                      // 103
  }                                                                                                                  // 104
                                                                                                                     // 105
  defineDeny(self, options);                                                                                         // 106
  keepInsecure(self);                                                                                                // 107
                                                                                                                     // 108
  Collection2.emit('schema.attached', self, ss, options);                                                            // 109
};                                                                                                                   // 110
                                                                                                                     // 111
_.each([Mongo.Collection, LocalCollection], function (obj) {                                                         // 112
  /**                                                                                                                // 113
   * simpleSchema                                                                                                    // 114
   * @description function detect the correct schema by given params. If it                                          // 115
   * detect multi-schema presence in `self`, then it made an attempt to find a                                       // 116
   * `selector` in args                                                                                              // 117
   * @param {Object} doc - It could be <update> on update/upsert or document                                         // 118
   * itself on insert/remove                                                                                         // 119
   * @param {Object} [options] - It could be <update> on update/upsert etc                                           // 120
   * @param {Object} [query] - it could be <query> on update/upsert                                                  // 121
   * @return {Object} Schema                                                                                         // 122
   */                                                                                                                // 123
  obj.prototype.simpleSchema = function (doc, options, query) {                                                      // 124
    if (!this._c2) return null;                                                                                      // 125
    if (this._c2._simpleSchema) return this._c2._simpleSchema;                                                       // 126
                                                                                                                     // 127
    var schemas = this._c2._simpleSchemas;                                                                           // 128
    if (schemas && schemas.length > 0) {                                                                             // 129
      if (!doc) throw new Error('collection.simpleSchema() requires doc argument when there are multiple schemas');  // 130
                                                                                                                     // 131
      var schema, selector, target;                                                                                  // 132
      for (var i = 0; i < schemas.length; i++) {                                                                     // 133
        schema = schemas[i];                                                                                         // 134
        selector = Object.keys(schema.selector)[0];                                                                  // 135
                                                                                                                     // 136
        // We will set this to undefined because in theory you might want to select                                  // 137
        // on a null value.                                                                                          // 138
        target = undefined;                                                                                          // 139
                                                                                                                     // 140
        // here we are looking for selector in different places                                                      // 141
        // $set should have more priority here                                                                       // 142
        if (doc.$set && typeof doc.$set[selector] !== 'undefined') {                                                 // 143
          target = doc.$set[selector];                                                                               // 144
        } else if (typeof doc[selector] !== 'undefined') {                                                           // 145
          target = doc[selector];                                                                                    // 146
        } else if (options && options.selector) {                                                                    // 147
          target = options.selector[selector];                                                                       // 148
        } else if (query && query[selector]) { // on upsert/update operations                                        // 149
          target = query[selector];                                                                                  // 150
        }                                                                                                            // 151
                                                                                                                     // 152
        // we need to compare given selector with doc property or option to                                          // 153
        // find right schema                                                                                         // 154
        if (target !== undefined && target === schema.selector[selector]) {                                          // 155
          return schema.schema;                                                                                      // 156
        }                                                                                                            // 157
      }                                                                                                              // 158
    }                                                                                                                // 159
                                                                                                                     // 160
    return null;                                                                                                     // 161
  };                                                                                                                 // 162
});                                                                                                                  // 163
                                                                                                                     // 164
// Wrap DB write operation methods                                                                                   // 165
_.each(['insert', 'update'], function(methodName) {                                                                  // 166
  var _super = Mongo.Collection.prototype[methodName];                                                               // 167
  Mongo.Collection.prototype[methodName] = function() {                                                              // 168
    var self = this, options,                                                                                        // 169
        args = _.toArray(arguments);                                                                                 // 170
                                                                                                                     // 171
    options = (methodName === "insert") ? args[1] : args[2];                                                         // 172
                                                                                                                     // 173
    // Support missing options arg                                                                                   // 174
    if (!options || typeof options === "function") {                                                                 // 175
      options = {};                                                                                                  // 176
    }                                                                                                                // 177
                                                                                                                     // 178
    if (self._c2 && options.bypassCollection2 !== true) {                                                            // 179
      var userId = null;                                                                                             // 180
      try { // https://github.com/aldeed/meteor-collection2/issues/175                                               // 181
        userId = Meteor.userId();                                                                                    // 182
      } catch (err) {}                                                                                               // 183
                                                                                                                     // 184
      args = doValidate.call(                                                                                        // 185
        self,                                                                                                        // 186
        methodName,                                                                                                  // 187
        args,                                                                                                        // 188
        true, // getAutoValues                                                                                       // 189
        userId,                                                                                                      // 190
        Meteor.isServer // isFromTrustedCode                                                                         // 191
      );                                                                                                             // 192
      if (!args) {                                                                                                   // 193
        // doValidate already called the callback or threw the error so we're done.                                  // 194
        // But insert should always return an ID to match core behavior.                                             // 195
        return methodName === "insert" ? self._makeNewID() : undefined;                                              // 196
      }                                                                                                              // 197
    } else {                                                                                                         // 198
      // We still need to adjust args because insert does not take options                                           // 199
      if (methodName === "insert" && typeof args[1] !== 'function') args.splice(1, 1);                               // 200
    }                                                                                                                // 201
                                                                                                                     // 202
    return _super.apply(self, args);                                                                                 // 203
  };                                                                                                                 // 204
});                                                                                                                  // 205
                                                                                                                     // 206
/*                                                                                                                   // 207
 * Private                                                                                                           // 208
 */                                                                                                                  // 209
                                                                                                                     // 210
function doValidate(type, args, getAutoValues, userId, isFromTrustedCode) {                                          // 211
  var self = this, doc, callback, error, options, isUpsert, selector, last, hasCallback;                             // 212
                                                                                                                     // 213
  if (!args.length) {                                                                                                // 214
    throw new Error(type + " requires an argument");                                                                 // 215
  }                                                                                                                  // 216
                                                                                                                     // 217
  // Gather arguments and cache the selector                                                                         // 218
  if (type === "insert") {                                                                                           // 219
    doc = args[0];                                                                                                   // 220
    options = args[1];                                                                                               // 221
    callback = args[2];                                                                                              // 222
                                                                                                                     // 223
    // The real insert doesn't take options                                                                          // 224
    if (typeof options === "function") {                                                                             // 225
      args = [doc, options];                                                                                         // 226
    } else if (typeof callback === "function") {                                                                     // 227
      args = [doc, callback];                                                                                        // 228
    } else {                                                                                                         // 229
      args = [doc];                                                                                                  // 230
    }                                                                                                                // 231
  } else if (type === "update") {                                                                                    // 232
    selector = args[0];                                                                                              // 233
    doc = args[1];                                                                                                   // 234
    options = args[2];                                                                                               // 235
    callback = args[3];                                                                                              // 236
  } else {                                                                                                           // 237
    throw new Error("invalid type argument");                                                                        // 238
  }                                                                                                                  // 239
                                                                                                                     // 240
  var validatedObjectWasInitiallyEmpty = _.isEmpty(doc);                                                             // 241
                                                                                                                     // 242
  // Support missing options arg                                                                                     // 243
  if (!callback && typeof options === "function") {                                                                  // 244
    callback = options;                                                                                              // 245
    options = {};                                                                                                    // 246
  }                                                                                                                  // 247
  options = options || {};                                                                                           // 248
                                                                                                                     // 249
  last = args.length - 1;                                                                                            // 250
                                                                                                                     // 251
  hasCallback = (typeof args[last] === 'function');                                                                  // 252
                                                                                                                     // 253
  // If update was called with upsert:true, flag as an upsert                                                        // 254
  isUpsert = (type === "update" && options.upsert === true);                                                         // 255
                                                                                                                     // 256
  // we need to pass `doc` and `options` to `simpleSchema` method, that's why                                        // 257
  // schema declaration moved here                                                                                   // 258
  var schema = self.simpleSchema(doc, options, selector);                                                            // 259
  var isLocalCollection = (self._connection === null);                                                               // 260
                                                                                                                     // 261
  // On the server and for local collections, we allow passing `getAutoValues: false` to disable autoValue functions
  if ((Meteor.isServer || isLocalCollection) && options.getAutoValues === false) {                                   // 263
    getAutoValues = false;                                                                                           // 264
  }                                                                                                                  // 265
                                                                                                                     // 266
  // Determine validation context                                                                                    // 267
  var validationContext = options.validationContext;                                                                 // 268
  if (validationContext) {                                                                                           // 269
    if (typeof validationContext === 'string') {                                                                     // 270
      validationContext = schema.namedContext(validationContext);                                                    // 271
    }                                                                                                                // 272
  } else {                                                                                                           // 273
    validationContext = schema.namedContext();                                                                       // 274
  }                                                                                                                  // 275
                                                                                                                     // 276
  // Add a default callback function if we're on the client and no callback was given                                // 277
  if (Meteor.isClient && !callback) {                                                                                // 278
    // Client can't block, so it can't report errors by exception,                                                   // 279
    // only by callback. If they forget the callback, give them a                                                    // 280
    // default one that logs the error, so they aren't totally                                                       // 281
    // baffled if their writes don't work because their database is                                                  // 282
    // down.                                                                                                         // 283
    callback = function(err) {                                                                                       // 284
      if (err) {                                                                                                     // 285
        Meteor._debug(type + " failed: " + (err.reason || err.stack));                                               // 286
      }                                                                                                              // 287
    };                                                                                                               // 288
  }                                                                                                                  // 289
                                                                                                                     // 290
  // If client validation is fine or is skipped but then something                                                   // 291
  // is found to be invalid on the server, we get that error back                                                    // 292
  // as a special Meteor.Error that we need to parse.                                                                // 293
  if (Meteor.isClient && hasCallback) {                                                                              // 294
    callback = args[last] = wrapCallbackForParsingServerErrors(validationContext, callback);                         // 295
  }                                                                                                                  // 296
                                                                                                                     // 297
  var schemaAllowsId = schema.allowsKey("_id");                                                                      // 298
  if (type === "insert" && !doc._id && schemaAllowsId) {                                                             // 299
    doc._id = self._makeNewID();                                                                                     // 300
  }                                                                                                                  // 301
                                                                                                                     // 302
  // Get the docId for passing in the autoValue/custom context                                                       // 303
  var docId;                                                                                                         // 304
  if (type === 'insert') {                                                                                           // 305
    docId = doc._id; // might be undefined                                                                           // 306
  } else if (type === "update" && selector) {                                                                        // 307
    docId = typeof selector === 'string' || selector instanceof Mongo.ObjectID ? selector : selector._id;            // 308
  }                                                                                                                  // 309
                                                                                                                     // 310
  // If _id has already been added, remove it temporarily if it's                                                    // 311
  // not explicitly defined in the schema.                                                                           // 312
  var cachedId;                                                                                                      // 313
  if (doc._id && !schemaAllowsId) {                                                                                  // 314
    cachedId = doc._id;                                                                                              // 315
    delete doc._id;                                                                                                  // 316
  }                                                                                                                  // 317
                                                                                                                     // 318
  function doClean(docToClean, getAutoValues, filter, autoConvert, removeEmptyStrings, trimStrings) {                // 319
    // Clean the doc/modifier in place                                                                               // 320
    schema.clean(docToClean, {                                                                                       // 321
      mutate: true,                                                                                                  // 322
      filter: filter,                                                                                                // 323
      autoConvert: autoConvert,                                                                                      // 324
      getAutoValues: getAutoValues,                                                                                  // 325
      isModifier: (type !== "insert"),                                                                               // 326
      removeEmptyStrings: removeEmptyStrings,                                                                        // 327
      trimStrings: trimStrings,                                                                                      // 328
      extendAutoValueContext: _.extend({                                                                             // 329
        isInsert: (type === "insert"),                                                                               // 330
        isUpdate: (type === "update" && options.upsert !== true),                                                    // 331
        isUpsert: isUpsert,                                                                                          // 332
        userId: userId,                                                                                              // 333
        isFromTrustedCode: isFromTrustedCode,                                                                        // 334
        docId: docId,                                                                                                // 335
        isLocalCollection: isLocalCollection                                                                         // 336
      }, options.extendAutoValueContext || {})                                                                       // 337
    });                                                                                                              // 338
  }                                                                                                                  // 339
                                                                                                                     // 340
  // Preliminary cleaning on both client and server. On the server and for local                                     // 341
  // collections, automatic values will also be set at this point.                                                   // 342
  doClean(                                                                                                           // 343
    doc,                                                                                                             // 344
    getAutoValues,                                                                                                   // 345
    options.filter !== false,                                                                                        // 346
    options.autoConvert !== false,                                                                                   // 347
    options.removeEmptyStrings !== false,                                                                            // 348
    options.trimStrings !== false                                                                                    // 349
  );                                                                                                                 // 350
                                                                                                                     // 351
  // We clone before validating because in some cases we need to adjust the                                          // 352
  // object a bit before validating it. If we adjusted `doc` itself, our                                             // 353
  // changes would persist into the database.                                                                        // 354
  var docToValidate = {};                                                                                            // 355
  for (var prop in doc) {                                                                                            // 356
    // We omit prototype properties when cloning because they will not be valid                                      // 357
    // and mongo omits them when saving to the database anyway.                                                      // 358
    if (doc.hasOwnProperty(prop)) {                                                                                  // 359
      docToValidate[prop] = doc[prop];                                                                               // 360
    }                                                                                                                // 361
  }                                                                                                                  // 362
                                                                                                                     // 363
  // On the server, upserts are possible; SimpleSchema handles upserts pretty                                        // 364
  // well by default, but it will not know about the fields in the selector,                                         // 365
  // which are also stored in the database if an insert is performed. So we                                          // 366
  // will allow these fields to be considered for validation by adding them                                          // 367
  // to the $set in the modifier. This is no doubt prone to errors, but there                                        // 368
  // probably isn't any better way right now.                                                                        // 369
  if (Meteor.isServer && isUpsert && _.isObject(selector)) {                                                         // 370
    var set = docToValidate.$set || {};                                                                              // 371
    docToValidate.$set = _.clone(selector);                                                                          // 372
    if (!schemaAllowsId) delete docToValidate.$set._id;                                                              // 373
    _.extend(docToValidate.$set, set);                                                                               // 374
  }                                                                                                                  // 375
                                                                                                                     // 376
  // Set automatic values for validation on the client.                                                              // 377
  // On the server, we already updated doc with auto values, but on the client,                                      // 378
  // we will add them to docToValidate for validation purposes only.                                                 // 379
  // This is because we want all actual values generated on the server.                                              // 380
  if (Meteor.isClient && !isLocalCollection) {                                                                       // 381
    doClean(docToValidate, true, false, false, false, false);                                                        // 382
  }                                                                                                                  // 383
                                                                                                                     // 384
  // XXX Maybe move this into SimpleSchema                                                                           // 385
  if (!validatedObjectWasInitiallyEmpty && _.isEmpty(docToValidate)) {                                               // 386
    throw new Error('After filtering out keys not in the schema, your ' +                                            // 387
      (type === 'update' ? 'modifier' : 'object') +                                                                  // 388
      ' is now empty');                                                                                              // 389
  }                                                                                                                  // 390
                                                                                                                     // 391
  // Validate doc                                                                                                    // 392
  var isValid;                                                                                                       // 393
  if (options.validate === false) {                                                                                  // 394
    isValid = true;                                                                                                  // 395
  } else {                                                                                                           // 396
    isValid = validationContext.validate(docToValidate, {                                                            // 397
      modifier: (type === "update" || type === "upsert"),                                                            // 398
      upsert: isUpsert,                                                                                              // 399
      extendedCustomContext: _.extend({                                                                              // 400
        isInsert: (type === "insert"),                                                                               // 401
        isUpdate: (type === "update" && options.upsert !== true),                                                    // 402
        isUpsert: isUpsert,                                                                                          // 403
        userId: userId,                                                                                              // 404
        isFromTrustedCode: isFromTrustedCode,                                                                        // 405
        docId: docId,                                                                                                // 406
        isLocalCollection: isLocalCollection                                                                         // 407
      }, options.extendedCustomContext || {})                                                                        // 408
    });                                                                                                              // 409
  }                                                                                                                  // 410
                                                                                                                     // 411
  if (isValid) {                                                                                                     // 412
    // Add the ID back                                                                                               // 413
    if (cachedId) {                                                                                                  // 414
      doc._id = cachedId;                                                                                            // 415
    }                                                                                                                // 416
                                                                                                                     // 417
    // Update the args to reflect the cleaned doc                                                                    // 418
    // XXX not sure this is necessary since we mutate                                                                // 419
    if (type === "insert") {                                                                                         // 420
      args[0] = doc;                                                                                                 // 421
    } else {                                                                                                         // 422
      args[1] = doc;                                                                                                 // 423
    }                                                                                                                // 424
                                                                                                                     // 425
    // If callback, set invalidKey when we get a mongo unique error                                                  // 426
    if (Meteor.isServer && hasCallback) {                                                                            // 427
      args[last] = wrapCallbackForParsingMongoValidationErrors(validationContext, args[last]);                       // 428
    }                                                                                                                // 429
                                                                                                                     // 430
    return args;                                                                                                     // 431
  } else {                                                                                                           // 432
    error = getErrorObject(validationContext);                                                                       // 433
    if (callback) {                                                                                                  // 434
      // insert/update/upsert pass `false` when there's an error, so we do that                                      // 435
      callback(error, false);                                                                                        // 436
    } else {                                                                                                         // 437
      throw error;                                                                                                   // 438
    }                                                                                                                // 439
  }                                                                                                                  // 440
}                                                                                                                    // 441
                                                                                                                     // 442
function getErrorObject(context) {                                                                                   // 443
  var message;                                                                                                       // 444
  var invalidKeys = SimpleSchema.version >= 2 ? context.validationErrors() : context.invalidKeys();                  // 445
  if (invalidKeys.length) {                                                                                          // 446
    message = context.keyErrorMessage(invalidKeys[0].name);                                                          // 447
  } else {                                                                                                           // 448
    message = "Failed validation";                                                                                   // 449
  }                                                                                                                  // 450
  var error = new Error(message);                                                                                    // 451
  error.invalidKeys = invalidKeys;                                                                                   // 452
  error.validationContext = context;                                                                                 // 453
  // If on the server, we add a sanitized error, too, in case we're                                                  // 454
  // called from a method.                                                                                           // 455
  if (Meteor.isServer) {                                                                                             // 456
    error.sanitizedError = new Meteor.Error(400, message, EJSON.stringify(error.invalidKeys));                       // 457
  }                                                                                                                  // 458
  return error;                                                                                                      // 459
}                                                                                                                    // 460
                                                                                                                     // 461
function addUniqueError(context, errorMessage) {                                                                     // 462
  var name = errorMessage.split('c2_')[1].split(' ')[0];                                                             // 463
  var val = errorMessage.split('dup key:')[1].split('"')[1];                                                         // 464
                                                                                                                     // 465
  context[addValidationErrorsPropName]([{                                                                            // 466
    name: name,                                                                                                      // 467
    type: 'notUnique',                                                                                               // 468
    value: val                                                                                                       // 469
  }]);                                                                                                               // 470
}                                                                                                                    // 471
                                                                                                                     // 472
function wrapCallbackForParsingMongoValidationErrors(validationContext, cb) {                                        // 473
  return function wrappedCallbackForParsingMongoValidationErrors(error) {                                            // 474
    var args = _.toArray(arguments);                                                                                 // 475
    if (error &&                                                                                                     // 476
        ((error.name === "MongoError" && error.code === 11001) || error.message.indexOf('MongoError: E11000' !== -1)) &&
        error.message.indexOf('c2_') !== -1) {                                                                       // 478
      addUniqueError(validationContext, error.message);                                                              // 479
      args[0] = getErrorObject(validationContext);                                                                   // 480
    }                                                                                                                // 481
    return cb.apply(this, args);                                                                                     // 482
  };                                                                                                                 // 483
}                                                                                                                    // 484
                                                                                                                     // 485
function wrapCallbackForParsingServerErrors(validationContext, cb) {                                                 // 486
  return function wrappedCallbackForParsingServerErrors(error) {                                                     // 487
    var args = _.toArray(arguments);                                                                                 // 488
    // Handle our own validation errors                                                                              // 489
    if (error instanceof Meteor.Error &&                                                                             // 490
        error.error === 400 &&                                                                                       // 491
        error.reason === "INVALID" &&                                                                                // 492
        typeof error.details === "string") {                                                                         // 493
      var invalidKeysFromServer = EJSON.parse(error.details);                                                        // 494
      validationContext[addValidationErrorsPropName](invalidKeysFromServer);                                         // 495
      args[0] = getErrorObject(validationContext);                                                                   // 496
    }                                                                                                                // 497
    // Handle Mongo unique index errors, which are forwarded to the client as 409 errors                             // 498
    else if (error instanceof Meteor.Error &&                                                                        // 499
             error.error === 409 &&                                                                                  // 500
             error.reason &&                                                                                         // 501
             error.reason.indexOf('E11000') !== -1 &&                                                                // 502
             error.reason.indexOf('c2_') !== -1) {                                                                   // 503
      addUniqueError(validationContext, error.reason);                                                               // 504
      args[0] = getErrorObject(validationContext);                                                                   // 505
    }                                                                                                                // 506
    return cb.apply(this, args);                                                                                     // 507
  };                                                                                                                 // 508
}                                                                                                                    // 509
                                                                                                                     // 510
var alreadyInsecured = {};                                                                                           // 511
function keepInsecure(c) {                                                                                           // 512
  // If insecure package is in use, we need to add allow rules that return                                           // 513
  // true. Otherwise, it would seemingly turn off insecure mode.                                                     // 514
  if (Package && Package.insecure && !alreadyInsecured[c._name]) {                                                   // 515
    c.allow({                                                                                                        // 516
      insert: function() {                                                                                           // 517
        return true;                                                                                                 // 518
      },                                                                                                             // 519
      update: function() {                                                                                           // 520
        return true;                                                                                                 // 521
      },                                                                                                             // 522
      remove: function () {                                                                                          // 523
        return true;                                                                                                 // 524
      },                                                                                                             // 525
      fetch: [],                                                                                                     // 526
      transform: null                                                                                                // 527
    });                                                                                                              // 528
    alreadyInsecured[c._name] = true;                                                                                // 529
  }                                                                                                                  // 530
  // If insecure package is NOT in use, then adding the two deny functions                                           // 531
  // does not have any effect on the main app's security paradigm. The                                               // 532
  // user will still be required to add at least one allow function of her                                           // 533
  // own for each operation for this collection. And the user may still add                                          // 534
  // additional deny functions, but does not have to.                                                                // 535
}                                                                                                                    // 536
                                                                                                                     // 537
var alreadyDefined = {};                                                                                             // 538
function defineDeny(c, options) {                                                                                    // 539
  if (!alreadyDefined[c._name]) {                                                                                    // 540
                                                                                                                     // 541
    var isLocalCollection = (c._connection === null);                                                                // 542
                                                                                                                     // 543
    // First define deny functions to extend doc with the results of clean                                           // 544
    // and autovalues. This must be done with "transform: null" or we would be                                       // 545
    // extending a clone of doc and therefore have no effect.                                                        // 546
    c.deny({                                                                                                         // 547
      insert: function(userId, doc) {                                                                                // 548
        // Referenced doc is cleaned in place                                                                        // 549
        c.simpleSchema(doc).clean(doc, {                                                                             // 550
          mutate: true,                                                                                              // 551
          isModifier: false,                                                                                         // 552
          // We don't do these here because they are done on the client if desired                                   // 553
          filter: false,                                                                                             // 554
          autoConvert: false,                                                                                        // 555
          removeEmptyStrings: false,                                                                                 // 556
          trimStrings: false,                                                                                        // 557
          extendAutoValueContext: {                                                                                  // 558
            isInsert: true,                                                                                          // 559
            isUpdate: false,                                                                                         // 560
            isUpsert: false,                                                                                         // 561
            userId: userId,                                                                                          // 562
            isFromTrustedCode: false,                                                                                // 563
            docId: doc._id,                                                                                          // 564
            isLocalCollection: isLocalCollection                                                                     // 565
          }                                                                                                          // 566
        });                                                                                                          // 567
                                                                                                                     // 568
        return false;                                                                                                // 569
      },                                                                                                             // 570
      update: function(userId, doc, fields, modifier) {                                                              // 571
        // Referenced modifier is cleaned in place                                                                   // 572
        c.simpleSchema(modifier).clean(modifier, {                                                                   // 573
          mutate: true,                                                                                              // 574
          isModifier: true,                                                                                          // 575
          // We don't do these here because they are done on the client if desired                                   // 576
          filter: false,                                                                                             // 577
          autoConvert: false,                                                                                        // 578
          removeEmptyStrings: false,                                                                                 // 579
          trimStrings: false,                                                                                        // 580
          extendAutoValueContext: {                                                                                  // 581
            isInsert: false,                                                                                         // 582
            isUpdate: true,                                                                                          // 583
            isUpsert: false,                                                                                         // 584
            userId: userId,                                                                                          // 585
            isFromTrustedCode: false,                                                                                // 586
            docId: doc && doc._id,                                                                                   // 587
            isLocalCollection: isLocalCollection                                                                     // 588
          }                                                                                                          // 589
        });                                                                                                          // 590
                                                                                                                     // 591
        return false;                                                                                                // 592
      },                                                                                                             // 593
      fetch: ['_id'],                                                                                                // 594
      transform: null                                                                                                // 595
    });                                                                                                              // 596
                                                                                                                     // 597
    // Second define deny functions to validate again on the server                                                  // 598
    // for client-initiated inserts and updates. These should be                                                     // 599
    // called after the clean/autovalue functions since we're adding                                                 // 600
    // them after. These must *not* have "transform: null" if options.transform is true because                      // 601
    // we need to pass the doc through any transforms to be sure                                                     // 602
    // that custom types are properly recognized for type validation.                                                // 603
    c.deny(_.extend({                                                                                                // 604
      insert: function(userId, doc) {                                                                                // 605
        // We pass the false options because we will have done them on client if desired                             // 606
        doValidate.call(                                                                                             // 607
          c,                                                                                                         // 608
          "insert",                                                                                                  // 609
          [                                                                                                          // 610
            doc,                                                                                                     // 611
            {                                                                                                        // 612
              trimStrings: false,                                                                                    // 613
              removeEmptyStrings: false,                                                                             // 614
              filter: false,                                                                                         // 615
              autoConvert: false                                                                                     // 616
            },                                                                                                       // 617
            function(error) {                                                                                        // 618
              if (error) {                                                                                           // 619
                throw new Meteor.Error(400, 'INVALID', EJSON.stringify(error.invalidKeys));                          // 620
              }                                                                                                      // 621
            }                                                                                                        // 622
          ],                                                                                                         // 623
          false, // getAutoValues                                                                                    // 624
          userId,                                                                                                    // 625
          false // isFromTrustedCode                                                                                 // 626
        );                                                                                                           // 627
                                                                                                                     // 628
        return false;                                                                                                // 629
      },                                                                                                             // 630
      update: function(userId, doc, fields, modifier) {                                                              // 631
        // NOTE: This will never be an upsert because client-side upserts                                            // 632
        // are not allowed once you define allow/deny functions.                                                     // 633
        // We pass the false options because we will have done them on client if desired                             // 634
        doValidate.call(                                                                                             // 635
          c,                                                                                                         // 636
          "update",                                                                                                  // 637
          [                                                                                                          // 638
            {_id: doc && doc._id},                                                                                   // 639
            modifier,                                                                                                // 640
            {                                                                                                        // 641
              trimStrings: false,                                                                                    // 642
              removeEmptyStrings: false,                                                                             // 643
              filter: false,                                                                                         // 644
              autoConvert: false                                                                                     // 645
            },                                                                                                       // 646
            function(error) {                                                                                        // 647
              if (error) {                                                                                           // 648
                throw new Meteor.Error(400, 'INVALID', EJSON.stringify(error.invalidKeys));                          // 649
              }                                                                                                      // 650
            }                                                                                                        // 651
          ],                                                                                                         // 652
          false, // getAutoValues                                                                                    // 653
          userId,                                                                                                    // 654
          false // isFromTrustedCode                                                                                 // 655
        );                                                                                                           // 656
                                                                                                                     // 657
        return false;                                                                                                // 658
      },                                                                                                             // 659
      fetch: ['_id']                                                                                                 // 660
    }, options.transform === true ? {} : {transform: null}));                                                        // 661
                                                                                                                     // 662
    // note that we've already done this collection so that we don't do it again                                     // 663
    // if attachSchema is called again                                                                               // 664
    alreadyDefined[c._name] = true;                                                                                  // 665
  }                                                                                                                  // 666
}                                                                                                                    // 667
                                                                                                                     // 668
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['aldeed:collection2-core'] = {}, {
  Collection2: Collection2
});

})();
