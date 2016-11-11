/* global StubCollections:true */
/* global sinon */

const SYMBOLS = _.keys(Mongo.Collection.prototype);

const stubPair = function(pair) {
  SYMBOLS.forEach((symbol) => {
    sinon.stub(pair.collection, symbol, _.bind(pair.localCollection[symbol], pair.localCollection));
  });
};

const restorePair = function(pair) {
  SYMBOLS.forEach((symbol) => {
    pair.collection[symbol].restore();
  });
};

StubCollections = {
  _pairs: {},
  _collections: [],
  add(collections) {
    StubCollections._collections.push(...collections);
  },
  stub(collections) {
    collections = collections || StubCollections._collections;
    [].concat(collections).forEach((collection) => {
      if (!StubCollections._pairs[collection._name]) {
        const options = {transform: collection._transform};

        const pair = {
          localCollection: new collection.constructor(null, options),
          collection
        };

        stubPair(pair);
        StubCollections._pairs[collection._name] = pair;
      }
    });
  },
  restore: function() {
    _.each(StubCollections._pairs, restorePair);
    StubCollections._pairs = {};
  }
};
