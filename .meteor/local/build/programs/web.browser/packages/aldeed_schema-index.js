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
var Collection2 = Package['aldeed:collection2-core'].Collection2;
var _ = Package.underscore._;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var check = Package.check.check;
var Match = Package.check.Match;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var Mongo = Package.mongo.Mongo;

var require = meteorInstall({"node_modules":{"meteor":{"aldeed:schema-index":{"lib":{"indexing.js":function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/aldeed_schema-index/lib/indexing.js                                                                     //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
// Extend the schema options allowed by SimpleSchema                                                                // 1
SimpleSchema.extendOptions({                                                                                        // 2
  index: Match.Optional(Match.OneOf(Number, String, Boolean)),                                                      // 3
  unique: Match.Optional(Boolean),                                                                                  // 4
  sparse: Match.Optional(Boolean)                                                                                   // 5
}); // Define validation error messages (legacy)                                                                    // 2
                                                                                                                    //
if (!SimpleSchema.version || SimpleSchema.version < 2) {                                                            // 9
  SimpleSchema.messages({                                                                                           // 10
    notUnique: '[label] must be unique'                                                                             // 11
  });                                                                                                               // 10
}                                                                                                                   // 13
                                                                                                                    //
if (Meteor.isServer) {                                                                                              // 15
  Collection2.on('schema.attached', function (collection, ss) {                                                     // 16
    // Define validation error messages                                                                             // 17
    if (ss.version >= 2) {                                                                                          // 18
      ss.messageBox.messages({                                                                                      // 19
        notUnique: '{{label}} must be unique'                                                                       // 20
      });                                                                                                           // 19
    }                                                                                                               // 22
                                                                                                                    //
    function ensureIndex(index, indexName, unique, sparse) {                                                        // 24
      Meteor.startup(function () {                                                                                  // 25
        collection._collection._ensureIndex(index, {                                                                // 26
          background: true,                                                                                         // 27
          name: indexName,                                                                                          // 28
          unique: unique,                                                                                           // 29
          sparse: sparse                                                                                            // 30
        });                                                                                                         // 26
      });                                                                                                           // 32
    }                                                                                                               // 33
                                                                                                                    //
    function dropIndex(indexName) {                                                                                 // 35
      Meteor.startup(function () {                                                                                  // 36
        try {                                                                                                       // 37
          collection._collection._dropIndex(indexName);                                                             // 38
        } catch (err) {// no index with that name, which is what we want                                            // 39
        }                                                                                                           // 41
      });                                                                                                           // 42
    }                                                                                                               // 43
                                                                                                                    //
    var propName = ss.version === 2 ? 'mergedSchema' : 'schema'; // Loop over fields definitions and ensure collection indexes (server side only)
                                                                                                                    //
    _.each(ss[propName](), function (definition, fieldName) {                                                       // 48
      if ('index' in definition || definition.unique === true) {                                                    // 49
        var index = {},                                                                                             // 50
            indexValue; // If they specified `unique: true` but not `index`,                                        // 50
        // we assume `index: 1` to set up the unique index in mongo                                                 // 52
                                                                                                                    //
        if ('index' in definition) {                                                                                // 53
          indexValue = definition.index;                                                                            // 54
          if (indexValue === true) indexValue = 1;                                                                  // 55
        } else {                                                                                                    // 56
          indexValue = 1;                                                                                           // 57
        }                                                                                                           // 58
                                                                                                                    //
        var indexName = 'c2_' + fieldName; // In the index object, we want object array keys without the ".$" piece
                                                                                                                    //
        var idxFieldName = fieldName.replace(/\.\$\./g, ".");                                                       // 61
        index[idxFieldName] = indexValue;                                                                           // 62
        var unique = !!definition.unique && (indexValue === 1 || indexValue === -1);                                // 63
        var sparse = definition.sparse || false; // If unique and optional, force sparse to prevent errors          // 64
                                                                                                                    //
        if (!sparse && unique && definition.optional) sparse = true;                                                // 67
                                                                                                                    //
        if (indexValue === false) {                                                                                 // 69
          dropIndex(indexName);                                                                                     // 70
        } else {                                                                                                    // 71
          ensureIndex(index, indexName, unique, sparse);                                                            // 72
        }                                                                                                           // 73
      }                                                                                                             // 74
    });                                                                                                             // 75
  });                                                                                                               // 76
}                                                                                                                   // 77
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/aldeed:schema-index/lib/indexing.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['aldeed:schema-index'] = {};

})();
