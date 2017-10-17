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

/* Package-scope variables */
var DiffSequence;

(function(){

/////////////////////////////////////////////////////////////////////////////////////
//                                                                                 //
// packages/diff-sequence/diff.js                                                  //
//                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////
                                                                                   //
DiffSequence = {};                                                                 // 1
                                                                                   // 2
// ordered: bool.                                                                  // 3
// old_results and new_results: collections of documents.                          // 4
//    if ordered, they are arrays.                                                 // 5
//    if unordered, they are IdMaps                                                // 6
DiffSequence.diffQueryChanges = function (ordered, oldResults, newResults,         // 7
                                              observer, options) {                 // 8
  if (ordered)                                                                     // 9
    DiffSequence.diffQueryOrderedChanges(                                          // 10
      oldResults, newResults, observer, options);                                  // 11
  else                                                                             // 12
    DiffSequence.diffQueryUnorderedChanges(                                        // 13
      oldResults, newResults, observer, options);                                  // 14
};                                                                                 // 15
                                                                                   // 16
DiffSequence.diffQueryUnorderedChanges = function (oldResults, newResults,         // 17
                                                       observer, options) {        // 18
  options = options || {};                                                         // 19
  var projectionFn = options.projectionFn || EJSON.clone;                          // 20
                                                                                   // 21
  if (observer.movedBefore) {                                                      // 22
    throw new Error("_diffQueryUnordered called with a movedBefore observer!");    // 23
  }                                                                                // 24
                                                                                   // 25
  newResults.forEach(function (newDoc, id) {                                       // 26
    var oldDoc = oldResults.get(id);                                               // 27
    if (oldDoc) {                                                                  // 28
      if (observer.changed && !EJSON.equals(oldDoc, newDoc)) {                     // 29
        var projectedNew = projectionFn(newDoc);                                   // 30
        var projectedOld = projectionFn(oldDoc);                                   // 31
        var changedFields =                                                        // 32
              DiffSequence.makeChangedFields(projectedNew, projectedOld);          // 33
        if (! _.isEmpty(changedFields)) {                                          // 34
          observer.changed(id, changedFields);                                     // 35
        }                                                                          // 36
      }                                                                            // 37
    } else if (observer.added) {                                                   // 38
      var fields = projectionFn(newDoc);                                           // 39
      delete fields._id;                                                           // 40
      observer.added(newDoc._id, fields);                                          // 41
    }                                                                              // 42
  });                                                                              // 43
                                                                                   // 44
  if (observer.removed) {                                                          // 45
    oldResults.forEach(function (oldDoc, id) {                                     // 46
      if (!newResults.has(id))                                                     // 47
        observer.removed(id);                                                      // 48
    });                                                                            // 49
  }                                                                                // 50
};                                                                                 // 51
                                                                                   // 52
                                                                                   // 53
DiffSequence.diffQueryOrderedChanges = function (old_results, new_results,         // 54
                                                     observer, options) {          // 55
  options = options || {};                                                         // 56
  var projectionFn = options.projectionFn || EJSON.clone;                          // 57
                                                                                   // 58
  var new_presence_of_id = {};                                                     // 59
  _.each(new_results, function (doc) {                                             // 60
    if (new_presence_of_id[doc._id])                                               // 61
      Meteor._debug("Duplicate _id in new_results");                               // 62
    new_presence_of_id[doc._id] = true;                                            // 63
  });                                                                              // 64
                                                                                   // 65
  var old_index_of_id = {};                                                        // 66
  _.each(old_results, function (doc, i) {                                          // 67
    if (doc._id in old_index_of_id)                                                // 68
      Meteor._debug("Duplicate _id in old_results");                               // 69
    old_index_of_id[doc._id] = i;                                                  // 70
  });                                                                              // 71
                                                                                   // 72
  // ALGORITHM:                                                                    // 73
  //                                                                               // 74
  // To determine which docs should be considered "moved" (and which               // 75
  // merely change position because of other docs moving) we run                   // 76
  // a "longest common subsequence" (LCS) algorithm.  The LCS of the               // 77
  // old doc IDs and the new doc IDs gives the docs that should NOT be             // 78
  // considered moved.                                                             // 79
                                                                                   // 80
  // To actually call the appropriate callbacks to get from the old state to the   // 81
  // new state:                                                                    // 82
                                                                                   // 83
  // First, we call removed() on all the items that only appear in the old         // 84
  // state.                                                                        // 85
                                                                                   // 86
  // Then, once we have the items that should not move, we walk through the new    // 87
  // results array group-by-group, where a "group" is a set of items that have     // 88
  // moved, anchored on the end by an item that should not move.  One by one, we   // 89
  // move each of those elements into place "before" the anchoring end-of-group    // 90
  // item, and fire changed events on them if necessary.  Then we fire a changed   // 91
  // event on the anchor, and move on to the next group.  There is always at       // 92
  // least one group; the last group is anchored by a virtual "null" id at the     // 93
  // end.                                                                          // 94
                                                                                   // 95
  // Asymptotically: O(N k) where k is number of ops, or potentially               // 96
  // O(N log N) if inner loop of LCS were made to be binary search.                // 97
                                                                                   // 98
                                                                                   // 99
  //////// LCS (longest common sequence, with respect to _id)                      // 100
  // (see Wikipedia article on Longest Increasing Subsequence,                     // 101
  // where the LIS is taken of the sequence of old indices of the                  // 102
  // docs in new_results)                                                          // 103
  //                                                                               // 104
  // unmoved: the output of the algorithm; members of the LCS,                     // 105
  // in the form of indices into new_results                                       // 106
  var unmoved = [];                                                                // 107
  // max_seq_len: length of LCS found so far                                       // 108
  var max_seq_len = 0;                                                             // 109
  // seq_ends[i]: the index into new_results of the last doc in a                  // 110
  // common subsequence of length of i+1 <= max_seq_len                            // 111
  var N = new_results.length;                                                      // 112
  var seq_ends = new Array(N);                                                     // 113
  // ptrs:  the common subsequence ending with new_results[n] extends              // 114
  // a common subsequence ending with new_results[ptr[n]], unless                  // 115
  // ptr[n] is -1.                                                                 // 116
  var ptrs = new Array(N);                                                         // 117
  // virtual sequence of old indices of new results                                // 118
  var old_idx_seq = function(i_new) {                                              // 119
    return old_index_of_id[new_results[i_new]._id];                                // 120
  };                                                                               // 121
  // for each item in new_results, use it to extend a common subsequence           // 122
  // of length j <= max_seq_len                                                    // 123
  for(var i=0; i<N; i++) {                                                         // 124
    if (old_index_of_id[new_results[i]._id] !== undefined) {                       // 125
      var j = max_seq_len;                                                         // 126
      // this inner loop would traditionally be a binary search,                   // 127
      // but scanning backwards we will likely find a subseq to extend             // 128
      // pretty soon, bounded for example by the total number of ops.              // 129
      // If this were to be changed to a binary search, we'd still want            // 130
      // to scan backwards a bit as an optimization.                               // 131
      while (j > 0) {                                                              // 132
        if (old_idx_seq(seq_ends[j-1]) < old_idx_seq(i))                           // 133
          break;                                                                   // 134
        j--;                                                                       // 135
      }                                                                            // 136
                                                                                   // 137
      ptrs[i] = (j === 0 ? -1 : seq_ends[j-1]);                                    // 138
      seq_ends[j] = i;                                                             // 139
      if (j+1 > max_seq_len)                                                       // 140
        max_seq_len = j+1;                                                         // 141
    }                                                                              // 142
  }                                                                                // 143
                                                                                   // 144
  // pull out the LCS/LIS into unmoved                                             // 145
  var idx = (max_seq_len === 0 ? -1 : seq_ends[max_seq_len-1]);                    // 146
  while (idx >= 0) {                                                               // 147
    unmoved.push(idx);                                                             // 148
    idx = ptrs[idx];                                                               // 149
  }                                                                                // 150
  // the unmoved item list is built backwards, so fix that                         // 151
  unmoved.reverse();                                                               // 152
                                                                                   // 153
  // the last group is always anchored by the end of the result list, which is     // 154
  // an id of "null"                                                               // 155
  unmoved.push(new_results.length);                                                // 156
                                                                                   // 157
  _.each(old_results, function (doc) {                                             // 158
    if (!new_presence_of_id[doc._id])                                              // 159
      observer.removed && observer.removed(doc._id);                               // 160
  });                                                                              // 161
  // for each group of things in the new_results that is anchored by an unmoved    // 162
  // element, iterate through the things before it.                                // 163
  var startOfGroup = 0;                                                            // 164
  _.each(unmoved, function (endOfGroup) {                                          // 165
    var groupId = new_results[endOfGroup] ? new_results[endOfGroup]._id : null;    // 166
    var oldDoc, newDoc, fields, projectedNew, projectedOld;                        // 167
    for (var i = startOfGroup; i < endOfGroup; i++) {                              // 168
      newDoc = new_results[i];                                                     // 169
      if (!_.has(old_index_of_id, newDoc._id)) {                                   // 170
        fields = projectionFn(newDoc);                                             // 171
        delete fields._id;                                                         // 172
        observer.addedBefore && observer.addedBefore(newDoc._id, fields, groupId);
        observer.added && observer.added(newDoc._id, fields);                      // 174
      } else {                                                                     // 175
        // moved                                                                   // 176
        oldDoc = old_results[old_index_of_id[newDoc._id]];                         // 177
        projectedNew = projectionFn(newDoc);                                       // 178
        projectedOld = projectionFn(oldDoc);                                       // 179
        fields = DiffSequence.makeChangedFields(projectedNew, projectedOld);       // 180
        if (!_.isEmpty(fields)) {                                                  // 181
          observer.changed && observer.changed(newDoc._id, fields);                // 182
        }                                                                          // 183
        observer.movedBefore && observer.movedBefore(newDoc._id, groupId);         // 184
      }                                                                            // 185
    }                                                                              // 186
    if (groupId) {                                                                 // 187
      newDoc = new_results[endOfGroup];                                            // 188
      oldDoc = old_results[old_index_of_id[newDoc._id]];                           // 189
      projectedNew = projectionFn(newDoc);                                         // 190
      projectedOld = projectionFn(oldDoc);                                         // 191
      fields = DiffSequence.makeChangedFields(projectedNew, projectedOld);         // 192
      if (!_.isEmpty(fields)) {                                                    // 193
        observer.changed && observer.changed(newDoc._id, fields);                  // 194
      }                                                                            // 195
    }                                                                              // 196
    startOfGroup = endOfGroup+1;                                                   // 197
  });                                                                              // 198
                                                                                   // 199
                                                                                   // 200
};                                                                                 // 201
                                                                                   // 202
                                                                                   // 203
// General helper for diff-ing two objects.                                        // 204
// callbacks is an object like so:                                                 // 205
// { leftOnly: function (key, leftValue) {...},                                    // 206
//   rightOnly: function (key, rightValue) {...},                                  // 207
//   both: function (key, leftValue, rightValue) {...},                            // 208
// }                                                                               // 209
DiffSequence.diffObjects = function (left, right, callbacks) {                     // 210
  _.each(left, function (leftValue, key) {                                         // 211
    if (_.has(right, key))                                                         // 212
      callbacks.both && callbacks.both(key, leftValue, right[key]);                // 213
    else                                                                           // 214
      callbacks.leftOnly && callbacks.leftOnly(key, leftValue);                    // 215
  });                                                                              // 216
  if (callbacks.rightOnly) {                                                       // 217
    _.each(right, function(rightValue, key) {                                      // 218
      if (!_.has(left, key))                                                       // 219
        callbacks.rightOnly(key, rightValue);                                      // 220
    });                                                                            // 221
  }                                                                                // 222
};                                                                                 // 223
                                                                                   // 224
                                                                                   // 225
DiffSequence.makeChangedFields = function (newDoc, oldDoc) {                       // 226
  var fields = {};                                                                 // 227
  DiffSequence.diffObjects(oldDoc, newDoc, {                                       // 228
    leftOnly: function (key, value) {                                              // 229
      fields[key] = undefined;                                                     // 230
    },                                                                             // 231
    rightOnly: function (key, value) {                                             // 232
      fields[key] = value;                                                         // 233
    },                                                                             // 234
    both: function (key, leftValue, rightValue) {                                  // 235
      if (!EJSON.equals(leftValue, rightValue))                                    // 236
        fields[key] = rightValue;                                                  // 237
    }                                                                              // 238
  });                                                                              // 239
  return fields;                                                                   // 240
};                                                                                 // 241
                                                                                   // 242
DiffSequence.applyChanges = function (doc, changeFields) {                         // 243
  _.each(changeFields, function (value, key) {                                     // 244
    if (value === undefined)                                                       // 245
      delete doc[key];                                                             // 246
    else                                                                           // 247
      doc[key] = value;                                                            // 248
  });                                                                              // 249
};                                                                                 // 250
                                                                                   // 251
                                                                                   // 252
/////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['diff-sequence'] = {}, {
  DiffSequence: DiffSequence
});

})();
