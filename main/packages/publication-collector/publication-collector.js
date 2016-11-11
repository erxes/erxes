/* global PublicationCollector:true */

const EventEmitter = Npm.require("events").EventEmitter;

// This file describes something like Subscription in
// meteor/meteor/packages/ddp/livedata_server.js, but instead of sending
// over a socket it just collects data
PublicationCollector = function(options = {}) {
  // Object where the keys are collection names, and then the keys are _ids
  this.responseData = {};

  this.userId = options.userId;
};

// So that we can listen to ready event in a reasonable way
Meteor._inherits(PublicationCollector, EventEmitter);

_.extend(PublicationCollector.prototype, {
  collect(name, ...args) {
    if (_.isFunction(args[args.length - 1])) {
      this.on('ready', args.pop());
    }

    const handler = Meteor.server.publish_handlers[name];
    const result = handler.call(this, ...args);

    // TODO -- we should check that result has _publishCursor? What does _runHandler do?
    if (result) {
      // array-ize
      [].concat(result).forEach(cur => cur._publishCursor(this));
      this.ready();
    }
  },
  added(collection, id, fields) {
    check(collection, String);
    check(id, String);

    this._ensureCollectionInRes(collection);

    // Make sure to ignore the _id in fields
    const addedDocument = _.extend({_id: id}, _.omit(fields, "_id"));
    this.responseData[collection][id] = addedDocument;
  },
  changed(collection, id, fields) {
    check(collection, String);
    check(id, String);

    this._ensureCollectionInRes(collection);

    const existingDocument = this.responseData[collection][id];
    const fieldsNoId = _.omit(fields, "_id");
    _.extend(existingDocument, fieldsNoId);

    // Delete all keys that were undefined in fields (except _id)
    _.forEach(fields, (value, key) => {
      if (value === undefined) {
        delete existingDocument[key];
      }
    });
  },
  removed(collection, id) {
    check(collection, String);
    check(id, String);

    this._ensureCollectionInRes(collection);

    delete this.responseData[collection][id];

    if (_.isEmpty(this.responseData[collection])) {
      delete this.responseData[collection];
    }
  },
  ready() {
    this.emit('ready', this._generateResponse());
  },
  onStop() {
    // no-op in HTTP
  },
  error(error) {
    throw error;
  },
  _ensureCollectionInRes(collection) {
    this.responseData[collection] = this.responseData[collection] || {};
  },
  _generateResponse() {
    const output = {};

    _.forEach(this.responseData, (documents, collectionName) => {
      output[collectionName] = _.values(documents);
    });

    return output;
  }
});
