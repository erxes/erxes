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
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// packages/aldeed_schema-deny/lib/deny.js                                             //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
// Extend the schema options allowed by SimpleSchema
SimpleSchema.extendOptions({
  denyInsert: Match.Optional(Boolean),
  denyUpdate: Match.Optional(Boolean),
});

// Define validation error messages
if (!SimpleSchema.version || SimpleSchema.version < 2) {
  SimpleSchema.messages({
    insertNotAllowed: '[label] cannot be set during an insert',
    updateNotAllowed: '[label] cannot be set during an update'
  });
}

Collection2.on('schema.attached', function (collection, ss) {
  if (ss.version >= 2) {
    ss.messageBox.messages({
      insertNotAllowed: '{{label}} cannot be set during an insert',
      updateNotAllowed: '{{label}} cannot be set during an update'
    });
  }

  ss.addValidator(function() {
    if (!this.isSet) return;

    var def = this.definition;

    if (def.denyInsert && this.isInsert) return 'insertNotAllowed';
    if (def.denyUpdate && (this.isUpdate || this.isUpsert)) return 'updateNotAllowed';
  });
});

/////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['aldeed:schema-deny'] = {};

})();
