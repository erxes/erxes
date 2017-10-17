(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var IdMap = Package['id-map'].IdMap;

/* Package-scope variables */
var MaxHeap, MinHeap, MinMaxHeap;

(function(){

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// packages/binary-heap/max-heap.js                                                   //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //
// Constructor of Heap
// - comparator - Function - given two items returns a number
// - options:
//   - initData - Array - Optional - the initial data in a format:
//        Object:
//          - id - String - unique id of the item
//          - value - Any - the data value
//      each value is retained
//   - IdMap - Constructor - Optional - custom IdMap class to store id->index
//       mappings internally. Standard IdMap is used by default.
MaxHeap = function (comparator, options) {
  if (! _.isFunction(comparator))
    throw new Error('Passed comparator is invalid, should be a comparison function');
  var self = this;

  // a C-style comparator that is given two values and returns a number,
  // negative if the first value is less than the second, positive if the second
  // value is greater than the first and zero if they are equal.
  self._comparator = comparator;

  options = _.defaults(options || {}, { IdMap: IdMap });

  // _heapIdx maps an id to an index in the Heap array the corresponding value
  // is located on.
  self._heapIdx = new options.IdMap;

  // The Heap data-structure implemented as a 0-based contiguous array where
  // every item on index idx is a node in a complete binary tree. Every node can
  // have children on indexes idx*2+1 and idx*2+2, except for the leaves. Every
  // node has a parent on index (idx-1)/2;
  self._heap = [];

  // If the initial array is passed, we can build the heap in linear time
  // complexity (O(N)) compared to linearithmic time complexity (O(nlogn)) if
  // we push elements one by one.
  if (_.isArray(options.initData))
    self._initFromData(options.initData);
};

_.extend(MaxHeap.prototype, {
  // Builds a new heap in-place in linear time based on passed data
  _initFromData: function (data) {
    var self = this;

    self._heap = _.map(data, function (o) {
      return { id: o.id, value: o.value };
    });

    _.each(data, function (o, i) {
      self._heapIdx.set(o.id, i);
    });

    if (! data.length)
      return;

    // start from the first non-leaf - the parent of the last leaf
    for (var i = parentIdx(data.length - 1); i >= 0; i--)
      self._downHeap(i);
  },

  _downHeap: function (idx) {
    var self = this;

    while (leftChildIdx(idx) < self.size()) {
      var left = leftChildIdx(idx);
      var right = rightChildIdx(idx);
      var largest = idx;

      if (left < self.size()) {
        largest = self._maxIndex(largest, left);
      }
      if (right < self.size()) {
        largest = self._maxIndex(largest, right);
      }

      if (largest === idx)
        break;

      self._swap(largest, idx);
      idx = largest;
    }
  },

  _upHeap: function (idx) {
    var self = this;

    while (idx > 0) {
      var parent = parentIdx(idx);
      if (self._maxIndex(parent, idx) === idx) {
        self._swap(parent, idx)
        idx = parent;
      } else {
        break;
      }
    }
  },

  _maxIndex: function (idxA, idxB) {
    var self = this;
    var valueA = self._get(idxA);
    var valueB = self._get(idxB);
    return self._comparator(valueA, valueB) >= 0 ? idxA : idxB;
  },

  // Internal: gets raw data object placed on idxth place in heap
  _get: function (idx) {
    var self = this;
    return self._heap[idx].value;
  },

  _swap: function (idxA, idxB) {
    var self = this;
    var recA = self._heap[idxA];
    var recB = self._heap[idxB];

    self._heapIdx.set(recA.id, idxB);
    self._heapIdx.set(recB.id, idxA);

    self._heap[idxA] = recB;
    self._heap[idxB] = recA;
  },

  get: function (id) {
    var self = this;
    if (! self.has(id))
      return null;
    return self._get(self._heapIdx.get(id));
  },
  set: function (id, value) {
    var self = this;

    if (self.has(id)) {
      if (self.get(id) === value)
        return;

      var idx = self._heapIdx.get(id);
      self._heap[idx].value = value;

      // Fix the new value's position
      // Either bubble new value up if it is greater than its parent
      self._upHeap(idx);
      // or bubble it down if it is smaller than one of its children
      self._downHeap(idx);
    } else {
      self._heapIdx.set(id, self._heap.length);
      self._heap.push({ id: id, value: value });
      self._upHeap(self._heap.length - 1);
    }
  },
  remove: function (id) {
    var self = this;

    if (self.has(id)) {
      var last = self._heap.length - 1;
      var idx = self._heapIdx.get(id);

      if (idx !== last) {
        self._swap(idx, last);
        self._heap.pop();
        self._heapIdx.remove(id);

        // Fix the swapped value's position
        self._upHeap(idx);
        self._downHeap(idx);
      } else {
        self._heap.pop();
        self._heapIdx.remove(id);
      }
    }
  },
  has: function (id) {
    var self = this;
    return self._heapIdx.has(id);
  },
  empty: function () {
    var self = this;
    return !self.size();
  },
  clear: function () {
    var self = this;
    self._heap = [];
    self._heapIdx.clear();
  },
  // iterate over values in no particular order
  forEach: function (iterator) {
    var self = this;
    _.each(self._heap, function (obj) {
      return iterator(obj.value, obj.id);
    });
  },
  size: function () {
    var self = this;
    return self._heap.length;
  },
  setDefault: function (id, def) {
    var self = this;
    if (self.has(id))
      return self.get(id);
    self.set(id, def);
    return def;
  },
  clone: function () {
    var self = this;
    var clone = new MaxHeap(self._comparator, self._heap);
    return clone;
  },

  maxElementId: function () {
    var self = this;
    return self.size() ? self._heap[0].id : null;
  },

  _selfCheck: function () {
    var self = this;
    for (var i = 1; i < self._heap.length; i++)
      if (self._maxIndex(parentIdx(i), i) !== parentIdx(i))
          throw new Error("An item with id " + self._heap[i].id +
                          " has a parent younger than it: " +
                          self._heap[parentIdx(i)].id);
  }
});

function leftChildIdx (i) { return i * 2 + 1; }
function rightChildIdx (i) { return i * 2 + 2; }
function parentIdx (i) { return (i - 1) >> 1; }


////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// packages/binary-heap/min-heap.js                                                   //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //
MinHeap = function (comparator, options) {
  var self = this;
  MaxHeap.call(self, function (a, b) {
    return -comparator(a, b);
  }, options);
};

Meteor._inherits(MinHeap, MaxHeap);

_.extend(MinHeap.prototype, {
  maxElementId: function () {
    throw new Error("Cannot call maxElementId on MinHeap");
  },
  minElementId: function () {
    var self = this;
    return MaxHeap.prototype.maxElementId.call(self);
  }
});


////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// packages/binary-heap/min-max-heap.js                                               //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //
// This implementation of Min/Max-Heap is just a subclass of Max-Heap
// with a Min-Heap as an encapsulated property.
//
// Most of the operations are just proxy methods to call the same method on both
// heaps.
//
// This implementation takes 2*N memory but is fairly simple to write and
// understand. And the constant factor of a simple Heap is usually smaller
// compared to other two-way priority queues like Min/Max Heaps
// (http://www.cs.otago.ac.nz/staffpriv/mike/Papers/MinMaxHeaps/MinMaxHeaps.pdf)
// and Interval Heaps
// (http://www.cise.ufl.edu/~sahni/dsaac/enrich/c13/double.htm)
MinMaxHeap = function (comparator, options) {
  var self = this;

  MaxHeap.call(self, comparator, options);
  self._minHeap = new MinHeap(comparator, options);
};

Meteor._inherits(MinMaxHeap, MaxHeap);

_.extend(MinMaxHeap.prototype, {
  set: function (id, value) {
    var self = this;
    MaxHeap.prototype.set.apply(self, arguments);
    self._minHeap.set(id, value);
  },
  remove: function (id) {
    var self = this;
    MaxHeap.prototype.remove.apply(self, arguments);
    self._minHeap.remove(id);
  },
  clear: function () {
    var self = this;
    MaxHeap.prototype.clear.apply(self, arguments);
    self._minHeap.clear();
  },
  setDefault: function (id, def) {
    var self = this;
    MaxHeap.prototype.setDefault.apply(self, arguments);
    return self._minHeap.setDefault(id, def);
  },
  clone: function () {
    var self = this;
    var clone = new MinMaxHeap(self._comparator, self._heap);
    return clone;
  },
  minElementId: function () {
    var self = this;
    return self._minHeap.minElementId();
  }
});


////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['binary-heap'] = {}, {
  MaxHeap: MaxHeap,
  MinHeap: MinHeap,
  MinMaxHeap: MinMaxHeap
});

})();
