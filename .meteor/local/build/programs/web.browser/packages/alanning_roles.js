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
var Accounts = Package['accounts-base'].Accounts;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Mongo = Package.mongo.Mongo;
var check = Package.check.check;
var Match = Package.check.Match;

/* Package-scope variables */
var Roles;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/alanning_roles/roles_common.js                                                                 //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
;(function () {                                                                                            // 1
                                                                                                           // 2
/**                                                                                                        // 3
 * Provides functions related to user authorization. Compatible with built-in Meteor accounts packages.    // 4
 *                                                                                                         // 5
 * @module Roles                                                                                           // 6
 */                                                                                                        // 7
                                                                                                           // 8
/**                                                                                                        // 9
 * Roles collection documents consist only of an id and a role name.                                       // 10
 *   ex: { _id:<uuid>, name: "admin" }                                                                     // 11
 */                                                                                                        // 12
if (!Meteor.roles) {                                                                                       // 13
  Meteor.roles = new Mongo.Collection("roles")                                                             // 14
}                                                                                                          // 15
                                                                                                           // 16
/**                                                                                                        // 17
 * Authorization package compatible with built-in Meteor accounts system.                                  // 18
 *                                                                                                         // 19
 * Stores user's current roles in a 'roles' field on the user object.                                      // 20
 *                                                                                                         // 21
 * @class Roles                                                                                            // 22
 * @constructor                                                                                            // 23
 */                                                                                                        // 24
if ('undefined' === typeof Roles) {                                                                        // 25
  Roles = {}                                                                                               // 26
}                                                                                                          // 27
                                                                                                           // 28
"use strict";                                                                                              // 29
                                                                                                           // 30
var mixingGroupAndNonGroupErrorMsg = "Roles error: Can't mix grouped and non-grouped roles for same user";
                                                                                                           // 32
_.extend(Roles, {                                                                                          // 33
                                                                                                           // 34
  /**                                                                                                      // 35
   * Constant used to reference the special 'global' group that                                            // 36
   * can be used to apply blanket permissions across all groups.                                           // 37
   *                                                                                                       // 38
   * @example                                                                                              // 39
   *     Roles.addUsersToRoles(user, 'admin', Roles.GLOBAL_GROUP)                                          // 40
   *     Roles.userIsInRole(user, 'admin') // => true                                                      // 41
   *                                                                                                       // 42
   *     Roles.setUserRoles(user, 'support-staff', Roles.GLOBAL_GROUP)                                     // 43
   *     Roles.userIsInRole(user, 'support-staff') // => true                                              // 44
   *     Roles.userIsInRole(user, 'admin') // => false                                                     // 45
   *                                                                                                       // 46
   * @property GLOBAL_GROUP                                                                                // 47
   * @type String                                                                                          // 48
   * @static                                                                                               // 49
   * @final                                                                                                // 50
   */                                                                                                      // 51
  GLOBAL_GROUP: '__global_roles__',                                                                        // 52
                                                                                                           // 53
                                                                                                           // 54
  /**                                                                                                      // 55
   * Create a new role. Whitespace will be trimmed.                                                        // 56
   *                                                                                                       // 57
   * @method createRole                                                                                    // 58
   * @param {String} role Name of role                                                                     // 59
   * @return {String} id of new role                                                                       // 60
   */                                                                                                      // 61
  createRole: function (role) {                                                                            // 62
    var id,                                                                                                // 63
        match                                                                                              // 64
                                                                                                           // 65
    if (!role                                                                                              // 66
        || 'string' !== typeof role                                                                        // 67
        || role.trim().length === 0) {                                                                     // 68
      return                                                                                               // 69
    }                                                                                                      // 70
                                                                                                           // 71
    try {                                                                                                  // 72
      id = Meteor.roles.insert({'name': role.trim()})                                                      // 73
      return id                                                                                            // 74
    } catch (e) {                                                                                          // 75
      // (from Meteor accounts-base package, insertUserDoc func)                                           // 76
      // XXX string parsing sucks, maybe                                                                   // 77
      // https://jira.mongodb.org/browse/SERVER-3069 will get fixed one day                                // 78
      if (/E11000 duplicate key error.*(index.*roles|roles.*index).*name/.test(e.err || e.errmsg)) {       // 79
        throw new Error("Role '" + role.trim() + "' already exists.")                                      // 80
      }                                                                                                    // 81
      else {                                                                                               // 82
        throw e                                                                                            // 83
      }                                                                                                    // 84
    }                                                                                                      // 85
  },                                                                                                       // 86
                                                                                                           // 87
  /**                                                                                                      // 88
   * Delete an existing role.  Will throw "Role in use" error if any users                                 // 89
   * are currently assigned to the target role.                                                            // 90
   *                                                                                                       // 91
   * @method deleteRole                                                                                    // 92
   * @param {String} role Name of role                                                                     // 93
   */                                                                                                      // 94
  deleteRole: function (role) {                                                                            // 95
    if (!role) return                                                                                      // 96
                                                                                                           // 97
    var foundExistingUser = Meteor.users.findOne(                                                          // 98
                              {roles: {$in: [role]}},                                                      // 99
                              {fields: {_id: 1}})                                                          // 100
                                                                                                           // 101
    if (foundExistingUser) {                                                                               // 102
      throw new Meteor.Error(403, 'Role in use')                                                           // 103
    }                                                                                                      // 104
                                                                                                           // 105
    var thisRole = Meteor.roles.findOne({name: role})                                                      // 106
    if (thisRole) {                                                                                        // 107
      Meteor.roles.remove({_id: thisRole._id})                                                             // 108
    }                                                                                                      // 109
  },                                                                                                       // 110
                                                                                                           // 111
  /**                                                                                                      // 112
   * Add users to roles. Will create roles as needed.                                                      // 113
   *                                                                                                       // 114
   * NOTE: Mixing grouped and non-grouped roles for the same user                                          // 115
   *       is not supported and will throw an error.                                                       // 116
   *                                                                                                       // 117
   * Makes 2 calls to database:                                                                            // 118
   *  1. retrieve list of all existing roles                                                               // 119
   *  2. update users' roles                                                                               // 120
   *                                                                                                       // 121
   * @example                                                                                              // 122
   *     Roles.addUsersToRoles(userId, 'admin')                                                            // 123
   *     Roles.addUsersToRoles(userId, ['view-secrets'], 'example.com')                                    // 124
   *     Roles.addUsersToRoles([user1, user2], ['user','editor'])                                          // 125
   *     Roles.addUsersToRoles([user1, user2], ['glorious-admin', 'perform-action'], 'example.org')        // 126
   *     Roles.addUsersToRoles(userId, 'admin', Roles.GLOBAL_GROUP)                                        // 127
   *                                                                                                       // 128
   * @method addUsersToRoles                                                                               // 129
   * @param {Array|String} users User id(s) or object(s) with an _id field                                 // 130
   * @param {Array|String} roles Name(s) of roles/permissions to add users to                              // 131
   * @param {String} [group] Optional group name. If supplied, roles will be                               // 132
   *                         specific to that group.                                                       // 133
   *                         Group names can not start with a '$' or contain                               // 134
   *                         null characters.  Periods in names '.' are                                    // 135
   *                         automatically converted to underscores.                                       // 136
   *                         The special group Roles.GLOBAL_GROUP provides                                 // 137
   *                         a convenient way to assign blanket roles/permissions                          // 138
   *                         across all groups.  The roles/permissions in the                              // 139
   *                         Roles.GLOBAL_GROUP group will be automatically                                // 140
   *                         included in checks for any group.                                             // 141
   */                                                                                                      // 142
  addUsersToRoles: function (users, roles, group) {                                                        // 143
    // use Template pattern to update user roles                                                           // 144
    Roles._updateUserRoles(users, roles, group, Roles._update_$addToSet_fn)                                // 145
  },                                                                                                       // 146
                                                                                                           // 147
  /**                                                                                                      // 148
   * Set a users roles/permissions.                                                                        // 149
   *                                                                                                       // 150
   * @example                                                                                              // 151
   *     Roles.setUserRoles(userId, 'admin')                                                               // 152
   *     Roles.setUserRoles(userId, ['view-secrets'], 'example.com')                                       // 153
   *     Roles.setUserRoles([user1, user2], ['user','editor'])                                             // 154
   *     Roles.setUserRoles([user1, user2], ['glorious-admin', 'perform-action'], 'example.org')           // 155
   *     Roles.setUserRoles(userId, 'admin', Roles.GLOBAL_GROUP)                                           // 156
   *                                                                                                       // 157
   * @method setUserRoles                                                                                  // 158
   * @param {Array|String} users User id(s) or object(s) with an _id field                                 // 159
   * @param {Array|String} roles Name(s) of roles/permissions to add users to                              // 160
   * @param {String} [group] Optional group name. If supplied, roles will be                               // 161
   *                         specific to that group.                                                       // 162
   *                         Group names can not start with '$'.                                           // 163
   *                         Periods in names '.' are automatically converted                              // 164
   *                         to underscores.                                                               // 165
   *                         The special group Roles.GLOBAL_GROUP provides                                 // 166
   *                         a convenient way to assign blanket roles/permissions                          // 167
   *                         across all groups.  The roles/permissions in the                              // 168
   *                         Roles.GLOBAL_GROUP group will be automatically                                // 169
   *                         included in checks for any group.                                             // 170
   */                                                                                                      // 171
  setUserRoles: function (users, roles, group) {                                                           // 172
    // use Template pattern to update user roles                                                           // 173
    Roles._updateUserRoles(users, roles, group, Roles._update_$set_fn)                                     // 174
  },                                                                                                       // 175
                                                                                                           // 176
  /**                                                                                                      // 177
   * Remove users from roles                                                                               // 178
   *                                                                                                       // 179
   * @example                                                                                              // 180
   *     Roles.removeUsersFromRoles(users.bob, 'admin')                                                    // 181
   *     Roles.removeUsersFromRoles([users.bob, users.joe], ['editor'])                                    // 182
   *     Roles.removeUsersFromRoles([users.bob, users.joe], ['editor', 'user'])                            // 183
   *     Roles.removeUsersFromRoles(users.eve, ['user'], 'group1')                                         // 184
   *                                                                                                       // 185
   * @method removeUsersFromRoles                                                                          // 186
   * @param {Array|String} users User id(s) or object(s) with an _id field                                 // 187
   * @param {Array|String} roles Name(s) of roles to remove users from                                     // 188
   * @param {String} [group] Optional. Group name. If supplied, only that                                  // 189
   *                         group will have roles removed.                                                // 190
   */                                                                                                      // 191
  removeUsersFromRoles: function (users, roles, group) {                                                   // 192
    var update                                                                                             // 193
                                                                                                           // 194
    if (!users) throw new Error ("Missing 'users' param")                                                  // 195
    if (!roles) throw new Error ("Missing 'roles' param")                                                  // 196
    if (group) {                                                                                           // 197
      if ('string' !== typeof group)                                                                       // 198
        throw new Error ("Roles error: Invalid parameter 'group'. Expected 'string' type")                 // 199
      if ('$' === group[0])                                                                                // 200
        throw new Error ("Roles error: groups can not start with '$'")                                     // 201
                                                                                                           // 202
      // convert any periods to underscores                                                                // 203
      group = group.replace(/\./g, '_')                                                                    // 204
    }                                                                                                      // 205
                                                                                                           // 206
    // ensure arrays                                                                                       // 207
    if (!_.isArray(users)) users = [users]                                                                 // 208
    if (!_.isArray(roles)) roles = [roles]                                                                 // 209
                                                                                                           // 210
    // ensure users is an array of user ids                                                                // 211
    users = _.reduce(users, function (memo, user) {                                                        // 212
      var _id                                                                                              // 213
      if ('string' === typeof user) {                                                                      // 214
        memo.push(user)                                                                                    // 215
      } else if ('object' === typeof user) {                                                               // 216
        _id = user._id                                                                                     // 217
        if ('string' === typeof _id) {                                                                     // 218
          memo.push(_id)                                                                                   // 219
        }                                                                                                  // 220
      }                                                                                                    // 221
      return memo                                                                                          // 222
    }, [])                                                                                                 // 223
                                                                                                           // 224
    // update all users, remove from roles set                                                             // 225
                                                                                                           // 226
    if (group) {                                                                                           // 227
      update = {$pullAll: {}}                                                                              // 228
      update.$pullAll['roles.'+group] = roles                                                              // 229
    } else {                                                                                               // 230
      update = {$pullAll: {roles: roles}}                                                                  // 231
    }                                                                                                      // 232
                                                                                                           // 233
    try {                                                                                                  // 234
      if (Meteor.isClient) {                                                                               // 235
        // Iterate over each user to fulfill Meteor's 'one update per ID' policy                           // 236
        _.each(users, function (user) {                                                                    // 237
          Meteor.users.update({_id:user}, update)                                                          // 238
        })                                                                                                 // 239
      } else {                                                                                             // 240
        // On the server we can leverage MongoDB's $in operator for performance                            // 241
        Meteor.users.update({_id:{$in:users}}, update, {multi: true})                                      // 242
      }                                                                                                    // 243
    }                                                                                                      // 244
    catch (ex) {                                                                                           // 245
      if (ex.name === 'MongoError' && isMongoMixError(ex.err || ex.errmsg)) {                              // 246
        throw new Error (mixingGroupAndNonGroupErrorMsg)                                                   // 247
      }                                                                                                    // 248
                                                                                                           // 249
      throw ex                                                                                             // 250
    }                                                                                                      // 251
  },                                                                                                       // 252
                                                                                                           // 253
  /**                                                                                                      // 254
   * Check if user has specified permissions/roles                                                         // 255
   *                                                                                                       // 256
   * @example                                                                                              // 257
   *     // non-group usage                                                                                // 258
   *     Roles.userIsInRole(user, 'admin')                                                                 // 259
   *     Roles.userIsInRole(user, ['admin','editor'])                                                      // 260
   *     Roles.userIsInRole(userId, 'admin')                                                               // 261
   *     Roles.userIsInRole(userId, ['admin','editor'])                                                    // 262
   *                                                                                                       // 263
   *     // per-group usage                                                                                // 264
   *     Roles.userIsInRole(user,   ['admin','editor'], 'group1')                                          // 265
   *     Roles.userIsInRole(userId, ['admin','editor'], 'group1')                                          // 266
   *     Roles.userIsInRole(userId, ['admin','editor'], Roles.GLOBAL_GROUP)                                // 267
   *                                                                                                       // 268
   *     // this format can also be used as short-hand for Roles.GLOBAL_GROUP                              // 269
   *     Roles.userIsInRole(user, 'admin')                                                                 // 270
   *                                                                                                       // 271
   * @method userIsInRole                                                                                  // 272
   * @param {String|Object} user User Id or actual user object                                             // 273
   * @param {String|Array} roles Name of role/permission or Array of                                       // 274
   *                            roles/permissions to check against.  If array,                             // 275
   *                            will return true if user is in _any_ role.                                 // 276
   * @param {String} [group] Optional. Name of group.  If supplied, limits check                           // 277
   *                         to just that group.                                                           // 278
   *                         The user's Roles.GLOBAL_GROUP will always be checked                          // 279
   *                         whether group is specified or not.                                            // 280
   * @return {Boolean} true if user is in _any_ of the target roles                                        // 281
   */                                                                                                      // 282
  userIsInRole: function (user, roles, group) {                                                            // 283
    var id,                                                                                                // 284
        userRoles,                                                                                         // 285
        query,                                                                                             // 286
        groupQuery,                                                                                        // 287
        found = false                                                                                      // 288
                                                                                                           // 289
    // ensure array to simplify code                                                                       // 290
    if (!_.isArray(roles)) {                                                                               // 291
      roles = [roles]                                                                                      // 292
    }                                                                                                      // 293
                                                                                                           // 294
    if (!user) return false                                                                                // 295
    if (group) {                                                                                           // 296
      if ('string' !== typeof group) return false                                                          // 297
      if ('$' === group[0]) return false                                                                   // 298
                                                                                                           // 299
      // convert any periods to underscores                                                                // 300
      group = group.replace(/\./g, '_')                                                                    // 301
    }                                                                                                      // 302
                                                                                                           // 303
    if ('object' === typeof user) {                                                                        // 304
      userRoles = user.roles                                                                               // 305
      if (_.isArray(userRoles)) {                                                                          // 306
        return _.some(roles, function (role) {                                                             // 307
          return _.contains(userRoles, role)                                                               // 308
        })                                                                                                 // 309
      } else if (userRoles && 'object' === typeof userRoles) {                                             // 310
        // roles field is dictionary of groups                                                             // 311
        found = _.isArray(userRoles[group]) && _.some(roles, function (role) {                             // 312
          return _.contains(userRoles[group], role)                                                        // 313
        })                                                                                                 // 314
        if (!found) {                                                                                      // 315
          // not found in regular group or group not specified.                                            // 316
          // check Roles.GLOBAL_GROUP, if it exists                                                        // 317
          found = _.isArray(userRoles[Roles.GLOBAL_GROUP]) && _.some(roles, function (role) {              // 318
            return _.contains(userRoles[Roles.GLOBAL_GROUP], role)                                         // 319
          })                                                                                               // 320
        }                                                                                                  // 321
        return found                                                                                       // 322
      }                                                                                                    // 323
                                                                                                           // 324
      // missing roles field, try going direct via id                                                      // 325
      id = user._id                                                                                        // 326
    } else if ('string' === typeof user) {                                                                 // 327
      id = user                                                                                            // 328
    }                                                                                                      // 329
                                                                                                           // 330
    if (!id) return false                                                                                  // 331
                                                                                                           // 332
                                                                                                           // 333
    query = {_id: id, $or: []}                                                                             // 334
                                                                                                           // 335
    // always check Roles.GLOBAL_GROUP                                                                     // 336
    groupQuery = {}                                                                                        // 337
    groupQuery['roles.'+Roles.GLOBAL_GROUP] = {$in: roles}                                                 // 338
    query.$or.push(groupQuery)                                                                             // 339
                                                                                                           // 340
    if (group) {                                                                                           // 341
      // structure of query, when group specified including Roles.GLOBAL_GROUP                             // 342
      //   {_id: id,                                                                                       // 343
      //    $or: [                                                                                         // 344
      //      {'roles.group1':{$in: ['admin']}},                                                           // 345
      //      {'roles.__global_roles__':{$in: ['admin']}}                                                  // 346
      //    ]}                                                                                             // 347
      groupQuery = {}                                                                                      // 348
      groupQuery['roles.'+group] = {$in: roles}                                                            // 349
      query.$or.push(groupQuery)                                                                           // 350
    } else {                                                                                               // 351
      // structure of query, where group not specified. includes                                           // 352
      // Roles.GLOBAL_GROUP                                                                                // 353
      //   {_id: id,                                                                                       // 354
      //    $or: [                                                                                         // 355
      //      {roles: {$in: ['admin']}},                                                                   // 356
      //      {'roles.__global_roles__': {$in: ['admin']}}                                                 // 357
      //    ]}                                                                                             // 358
      query.$or.push({roles: {$in: roles}})                                                                // 359
    }                                                                                                      // 360
                                                                                                           // 361
    found = Meteor.users.findOne(query, {fields: {_id: 1}})                                                // 362
    return found ? true : false                                                                            // 363
  },                                                                                                       // 364
                                                                                                           // 365
  /**                                                                                                      // 366
   * Retrieve users roles                                                                                  // 367
   *                                                                                                       // 368
   * @method getRolesForUser                                                                               // 369
   * @param {String|Object} user User Id or actual user object                                             // 370
   * @param {String} [group] Optional name of group to restrict roles to.                                  // 371
   *                         User's Roles.GLOBAL_GROUP will also be included.                              // 372
   * @return {Array} Array of user's roles, unsorted.                                                      // 373
   */                                                                                                      // 374
  getRolesForUser: function (user, group) {                                                                // 375
    if (!user) return []                                                                                   // 376
    if (group) {                                                                                           // 377
      if ('string' !== typeof group) return []                                                             // 378
      if ('$' === group[0]) return []                                                                      // 379
                                                                                                           // 380
      // convert any periods to underscores                                                                // 381
      group = group.replace(/\./g, '_')                                                                    // 382
    }                                                                                                      // 383
                                                                                                           // 384
    if ('string' === typeof user) {                                                                        // 385
      user = Meteor.users.findOne(                                                                         // 386
               {_id: user},                                                                                // 387
               {fields: {roles: 1}})                                                                       // 388
                                                                                                           // 389
    } else if ('object' !== typeof user) {                                                                 // 390
      // invalid user object                                                                               // 391
      return []                                                                                            // 392
    }                                                                                                      // 393
                                                                                                           // 394
    if (!user || !user.roles) return []                                                                    // 395
                                                                                                           // 396
    if (group) {                                                                                           // 397
      return _.union(user.roles[group] || [], user.roles[Roles.GLOBAL_GROUP] || [])                        // 398
    }                                                                                                      // 399
                                                                                                           // 400
    if (_.isArray(user.roles))                                                                             // 401
      return user.roles                                                                                    // 402
                                                                                                           // 403
    // using groups but group not specified. return global group, if exists                                // 404
    return user.roles[Roles.GLOBAL_GROUP] || []                                                            // 405
  },                                                                                                       // 406
                                                                                                           // 407
  /**                                                                                                      // 408
   * Retrieve set of all existing roles                                                                    // 409
   *                                                                                                       // 410
   * @method getAllRoles                                                                                   // 411
   * @return {Cursor} cursor of existing roles                                                             // 412
   */                                                                                                      // 413
  getAllRoles: function () {                                                                               // 414
    return Meteor.roles.find({}, {sort: {name: 1}})                                                        // 415
  },                                                                                                       // 416
                                                                                                           // 417
  /**                                                                                                      // 418
   * Retrieve all users who are in target role.                                                            // 419
   *                                                                                                       // 420
   * NOTE: This is an expensive query; it performs a full collection scan                                  // 421
   * on the users collection since there is no index set on the 'roles' field.                             // 422
   * This is by design as most queries will specify an _id so the _id index is                             // 423
   * used automatically.                                                                                   // 424
   *                                                                                                       // 425
   * @method getUsersInRole                                                                                // 426
   * @param {Array|String} role Name of role/permission.  If array, users                                  // 427
   *                            returned will have at least one of the roles                               // 428
   *                            specified but need not have _all_ roles.                                   // 429
   * @param {String} [group] Optional name of group to restrict roles to.                                  // 430
   *                         User's Roles.GLOBAL_GROUP will also be checked.                               // 431
   * @param {Object} [options] Optional options which are passed directly                                  // 432
   *                           through to `Meteor.users.find(query, options)`                              // 433
   * @return {Cursor} cursor of users in role                                                              // 434
   */                                                                                                      // 435
  getUsersInRole: function (role, group, options) {                                                        // 436
    var query,                                                                                             // 437
        roles = role,                                                                                      // 438
        groupQuery                                                                                         // 439
                                                                                                           // 440
    // ensure array to simplify query logic                                                                // 441
    if (!_.isArray(roles)) roles = [roles]                                                                 // 442
                                                                                                           // 443
    if (group) {                                                                                           // 444
      if ('string' !== typeof group)                                                                       // 445
        throw new Error ("Roles error: Invalid parameter 'group'. Expected 'string' type")                 // 446
      if ('$' === group[0])                                                                                // 447
        throw new Error ("Roles error: groups can not start with '$'")                                     // 448
                                                                                                           // 449
      // convert any periods to underscores                                                                // 450
      group = group.replace(/\./g, '_')                                                                    // 451
    }                                                                                                      // 452
                                                                                                           // 453
    query = {$or: []}                                                                                      // 454
                                                                                                           // 455
    // always check Roles.GLOBAL_GROUP                                                                     // 456
    groupQuery = {}                                                                                        // 457
    groupQuery['roles.'+Roles.GLOBAL_GROUP] = {$in: roles}                                                 // 458
    query.$or.push(groupQuery)                                                                             // 459
                                                                                                           // 460
    if (group) {                                                                                           // 461
      // structure of query, when group specified including Roles.GLOBAL_GROUP                             // 462
      //   {                                                                                               // 463
      //    $or: [                                                                                         // 464
      //      {'roles.group1':{$in: ['admin']}},                                                           // 465
      //      {'roles.__global_roles__':{$in: ['admin']}}                                                  // 466
      //    ]}                                                                                             // 467
      groupQuery = {}                                                                                      // 468
      groupQuery['roles.'+group] = {$in: roles}                                                            // 469
      query.$or.push(groupQuery)                                                                           // 470
    } else {                                                                                               // 471
      // structure of query, where group not specified. includes                                           // 472
      // Roles.GLOBAL_GROUP                                                                                // 473
      //   {                                                                                               // 474
      //    $or: [                                                                                         // 475
      //      {roles: {$in: ['admin']}},                                                                   // 476
      //      {'roles.__global_roles__': {$in: ['admin']}}                                                 // 477
      //    ]}                                                                                             // 478
      query.$or.push({roles: {$in: roles}})                                                                // 479
    }                                                                                                      // 480
                                                                                                           // 481
    return Meteor.users.find(query, options);                                                              // 482
  },  // end getUsersInRole                                                                                // 483
                                                                                                           // 484
  /**                                                                                                      // 485
   * Retrieve users groups, if any                                                                         // 486
   *                                                                                                       // 487
   * @method getGroupsForUser                                                                              // 488
   * @param {String|Object} user User Id or actual user object                                             // 489
   * @param {String} [role] Optional name of roles to restrict groups to.                                  // 490
   *                                                                                                       // 491
   * @return {Array} Array of user's groups, unsorted. Roles.GLOBAL_GROUP will be omitted                  // 492
   */                                                                                                      // 493
  getGroupsForUser: function (user, role) {                                                                // 494
    var userGroups = [];                                                                                   // 495
                                                                                                           // 496
    if (!user) return []                                                                                   // 497
    if (role) {                                                                                            // 498
      if ('string' !== typeof role) return []                                                              // 499
      if ('$' === role[0]) return []                                                                       // 500
                                                                                                           // 501
      // convert any periods to underscores                                                                // 502
      role = role.replace('.', '_')                                                                        // 503
    }                                                                                                      // 504
                                                                                                           // 505
    if ('string' === typeof user) {                                                                        // 506
      user = Meteor.users.findOne(                                                                         // 507
               {_id: user},                                                                                // 508
               {fields: {roles: 1}})                                                                       // 509
                                                                                                           // 510
    }else if ('object' !== typeof user) {                                                                  // 511
      // invalid user object                                                                               // 512
      return []                                                                                            // 513
    }                                                                                                      // 514
                                                                                                           // 515
    //User has no roles or is not using groups                                                             // 516
    if (!user || !user.roles || _.isArray(user.roles)) return []                                           // 517
                                                                                                           // 518
    if (role) {                                                                                            // 519
      _.each(user.roles, function(groupRoles, groupName) {                                                 // 520
        if (_.contains(groupRoles, role) && groupName !== Roles.GLOBAL_GROUP) {                            // 521
          userGroups.push(groupName);                                                                      // 522
        }                                                                                                  // 523
      });                                                                                                  // 524
      return userGroups;                                                                                   // 525
    }else {                                                                                                // 526
      return _.without(_.keys(user.roles), Roles.GLOBAL_GROUP);                                            // 527
    }                                                                                                      // 528
                                                                                                           // 529
  }, //End getGroupsForUser                                                                                // 530
                                                                                                           // 531
                                                                                                           // 532
  /**                                                                                                      // 533
   * Private function 'template' that uses $set to construct an update object                              // 534
   * for MongoDB.  Passed to _updateUserRoles                                                              // 535
   *                                                                                                       // 536
   * @method _update_$set_fn                                                                               // 537
   * @protected                                                                                            // 538
   * @param {Array} roles                                                                                  // 539
   * @param {String} [group]                                                                               // 540
   * @return {Object} update object for use in MongoDB update command                                      // 541
   */                                                                                                      // 542
  _update_$set_fn: function  (roles, group) {                                                              // 543
    var update = {}                                                                                        // 544
                                                                                                           // 545
    if (group) {                                                                                           // 546
      // roles is a key/value dict object                                                                  // 547
      update.$set = {}                                                                                     // 548
      update.$set['roles.' + group] = roles                                                                // 549
    } else {                                                                                               // 550
      // roles is an array of strings                                                                      // 551
      update.$set = {roles: roles}                                                                         // 552
    }                                                                                                      // 553
                                                                                                           // 554
    return update                                                                                          // 555
  },  // end _update_$set_fn                                                                               // 556
                                                                                                           // 557
  /**                                                                                                      // 558
   * Private function 'template' that uses $addToSet to construct an update                                // 559
   * object for MongoDB.  Passed to _updateUserRoles                                                       // 560
   *                                                                                                       // 561
   * @method _update_$addToSet_fn                                                                          // 562
   * @protected                                                                                            // 563
   * @param {Array} roles                                                                                  // 564
   * @param {String} [group]                                                                               // 565
   * @return {Object} update object for use in MongoDB update command                                      // 566
   */                                                                                                      // 567
  _update_$addToSet_fn: function (roles, group) {                                                          // 568
    var update = {}                                                                                        // 569
                                                                                                           // 570
    if (group) {                                                                                           // 571
      // roles is a key/value dict object                                                                  // 572
      update.$addToSet = {}                                                                                // 573
      update.$addToSet['roles.' + group] = {$each: roles}                                                  // 574
    } else {                                                                                               // 575
      // roles is an array of strings                                                                      // 576
      update.$addToSet = {roles: {$each: roles}}                                                           // 577
    }                                                                                                      // 578
                                                                                                           // 579
    return update                                                                                          // 580
  },  // end _update_$addToSet_fn                                                                          // 581
                                                                                                           // 582
                                                                                                           // 583
  /**                                                                                                      // 584
   * Internal function that uses the Template pattern to adds or sets roles                                // 585
   * for users.                                                                                            // 586
   *                                                                                                       // 587
   * @method _updateUserRoles                                                                              // 588
   * @protected                                                                                            // 589
   * @param {Array|String} users user id(s) or object(s) with an _id field                                 // 590
   * @param {Array|String} roles name(s) of roles/permissions to add users to                              // 591
   * @param {String} group Group name. If not null or undefined, roles will be                             // 592
   *                         specific to that group.                                                       // 593
   *                         Group names can not start with '$'.                                           // 594
   *                         Periods in names '.' are automatically converted                              // 595
   *                         to underscores.                                                               // 596
   *                         The special group Roles.GLOBAL_GROUP provides                                 // 597
   *                         a convenient way to assign blanket roles/permissions                          // 598
   *                         across all groups.  The roles/permissions in the                              // 599
   *                         Roles.GLOBAL_GROUP group will be automatically                                // 600
   *                         included in checks for any group.                                             // 601
   * @param {Function} updateFactory Func which returns an update object that                              // 602
   *                         will be passed to Mongo.                                                      // 603
   *   @param {Array} roles                                                                                // 604
   *   @param {String} [group]                                                                             // 605
   */                                                                                                      // 606
  _updateUserRoles: function (users, roles, group, updateFactory) {                                        // 607
    if (!users) throw new Error ("Missing 'users' param")                                                  // 608
    if (!roles) throw new Error ("Missing 'roles' param")                                                  // 609
    if (group) {                                                                                           // 610
      if ('string' !== typeof group)                                                                       // 611
        throw new Error ("Roles error: Invalid parameter 'group'. Expected 'string' type")                 // 612
      if ('$' === group[0])                                                                                // 613
        throw new Error ("Roles error: groups can not start with '$'")                                     // 614
                                                                                                           // 615
      // convert any periods to underscores                                                                // 616
      group = group.replace(/\./g, '_')                                                                    // 617
    }                                                                                                      // 618
                                                                                                           // 619
    var existingRoles,                                                                                     // 620
        query,                                                                                             // 621
        update                                                                                             // 622
                                                                                                           // 623
    // ensure arrays to simplify code                                                                      // 624
    if (!_.isArray(users)) users = [users]                                                                 // 625
    if (!_.isArray(roles)) roles = [roles]                                                                 // 626
                                                                                                           // 627
    // remove invalid roles                                                                                // 628
    roles = _.reduce(roles, function (memo, role) {                                                        // 629
      if (role                                                                                             // 630
          && 'string' === typeof role                                                                      // 631
          && role.trim().length > 0) {                                                                     // 632
        memo.push(role.trim())                                                                             // 633
      }                                                                                                    // 634
      return memo                                                                                          // 635
    }, [])                                                                                                 // 636
                                                                                                           // 637
    // empty roles array is ok, since it might be a $set operation to clear roles                          // 638
    //if (roles.length === 0) return                                                                       // 639
                                                                                                           // 640
    // ensure all roles exist in 'roles' collection                                                        // 641
    existingRoles = _.reduce(Meteor.roles.find({}).fetch(), function (memo, role) {                        // 642
      memo[role.name] = true                                                                               // 643
      return memo                                                                                          // 644
    }, {})                                                                                                 // 645
    _.each(roles, function (role) {                                                                        // 646
      if (!existingRoles[role]) {                                                                          // 647
        Roles.createRole(role)                                                                             // 648
      }                                                                                                    // 649
    })                                                                                                     // 650
                                                                                                           // 651
    // ensure users is an array of user ids                                                                // 652
    users = _.reduce(users, function (memo, user) {                                                        // 653
      var _id                                                                                              // 654
      if ('string' === typeof user) {                                                                      // 655
        memo.push(user)                                                                                    // 656
      } else if ('object' === typeof user) {                                                               // 657
        _id = user._id                                                                                     // 658
        if ('string' === typeof _id) {                                                                     // 659
          memo.push(_id)                                                                                   // 660
        }                                                                                                  // 661
      }                                                                                                    // 662
      return memo                                                                                          // 663
    }, [])                                                                                                 // 664
                                                                                                           // 665
    // update all users                                                                                    // 666
    update = updateFactory(roles, group)                                                                   // 667
                                                                                                           // 668
    try {                                                                                                  // 669
      if (Meteor.isClient) {                                                                               // 670
        // On client, iterate over each user to fulfill Meteor's                                           // 671
        // 'one update per ID' policy                                                                      // 672
        _.each(users, function (user) {                                                                    // 673
          Meteor.users.update({_id: user}, update)                                                         // 674
        })                                                                                                 // 675
      } else {                                                                                             // 676
        // On the server we can use MongoDB's $in operator for                                             // 677
        // better performance                                                                              // 678
        Meteor.users.update(                                                                               // 679
          {_id: {$in: users}},                                                                             // 680
          update,                                                                                          // 681
          {multi: true})                                                                                   // 682
      }                                                                                                    // 683
    }                                                                                                      // 684
    catch (ex) {                                                                                           // 685
      if (ex.name === 'MongoError' && isMongoMixError(ex.err || ex.errmsg)) {                              // 686
        throw new Error (mixingGroupAndNonGroupErrorMsg)                                                   // 687
      }                                                                                                    // 688
                                                                                                           // 689
      throw ex                                                                                             // 690
    }                                                                                                      // 691
  }  // end _updateUserRoles                                                                               // 692
                                                                                                           // 693
})  // end _.extend(Roles ...)                                                                             // 694
                                                                                                           // 695
                                                                                                           // 696
function isMongoMixError (errorMsg) {                                                                      // 697
  var expectedMessages = [                                                                                 // 698
      'Cannot apply $addToSet modifier to non-array',                                                      // 699
      'Cannot apply $addToSet to a non-array field',                                                       // 700
      'Can only apply $pullAll to an array',                                                               // 701
      'Cannot apply $pull/$pullAll modifier to non-array',                                                 // 702
      "can't append to array using string field name",                                                     // 703
      'to traverse the element'                                                                            // 704
      ]                                                                                                    // 705
                                                                                                           // 706
  return _.some(expectedMessages, function (snippet) {                                                     // 707
    return strContains(errorMsg, snippet)                                                                  // 708
  })                                                                                                       // 709
}                                                                                                          // 710
                                                                                                           // 711
function strContains (haystack, needle) {                                                                  // 712
  return -1 !== haystack.indexOf(needle)                                                                   // 713
}                                                                                                          // 714
                                                                                                           // 715
}());                                                                                                      // 716
                                                                                                           // 717
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/alanning_roles/client/debug.js                                                                 //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
"use strict"                                                                                               // 1
                                                                                                           // 2
                                                                                                           // 3
////////////////////////////////////////////////////////////                                               // 4
// Debugging helpers                                                                                       // 5
//                                                                                                         // 6
// Run this in your browser console to turn on debugging                                                   // 7
// for this package:                                                                                       // 8
//                                                                                                         // 9
//   localstorage.setItem('Roles.debug', true)                                                             // 10
//                                                                                                         // 11
                                                                                                           // 12
Roles.debug = false                                                                                        // 13
                                                                                                           // 14
try {                                                                                                      // 15
  if (localStorage) {                                                                                      // 16
    var temp = localStorage.getItem("Roles.debug")                                                         // 17
                                                                                                           // 18
    if ('undefined' !== typeof temp) {                                                                     // 19
      Roles.debug = !!temp                                                                                 // 20
    }                                                                                                      // 21
  }                                                                                                        // 22
} catch (ex) {                                                                                             // 23
  // ignore: accessing localStorage when its disabled throws                                               // 24
  // https://github.com/meteor/meteor/issues/5759                                                          // 25
}                                                                                                          // 26
                                                                                                           // 27
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/alanning_roles/client/uiHelpers.js                                                             //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
"use strict"                                                                                               // 1
                                                                                                           // 2
/**                                                                                                        // 3
 * Convenience functions for use on client.                                                                // 4
 *                                                                                                         // 5
 * NOTE: You must restrict user actions on the server-side; any                                            // 6
 * client-side checks are strictly for convenience and must not be                                         // 7
 * trusted.                                                                                                // 8
 *                                                                                                         // 9
 * @module UIHelpers                                                                                       // 10
 */                                                                                                        // 11
                                                                                                           // 12
                                                                                                           // 13
////////////////////////////////////////////////////////////                                               // 14
// UI helpers                                                                                              // 15
//                                                                                                         // 16
// Use a semi-private variable rather than declaring UI                                                    // 17
// helpers directly so that we can unit test the helpers.                                                  // 18
// XXX For some reason, the UI helpers are not registered                                                  // 19
// before the tests run.                                                                                   // 20
//                                                                                                         // 21
Roles._uiHelpers = {                                                                                       // 22
                                                                                                           // 23
  /**                                                                                                      // 24
   * UI helper to check if current user is in at least one                                                 // 25
   * of the target roles.  For use in client-side templates.                                               // 26
   *                                                                                                       // 27
   * @example                                                                                              // 28
   *     {{#if isInRole 'admin'}}                                                                          // 29
   *     {{/if}}                                                                                           // 30
   *                                                                                                       // 31
   *     {{#if isInRole 'editor,user'}}                                                                    // 32
   *     {{/if}}                                                                                           // 33
   *                                                                                                       // 34
   *     {{#if isInRole 'editor,user' 'group1'}}                                                           // 35
   *     {{/if}}                                                                                           // 36
   *                                                                                                       // 37
   * @method isInRole                                                                                      // 38
   * @param {String} role Name of role or comma-seperated list of roles                                    // 39
   * @param {String} [group] Optional, name of group to check                                              // 40
   * @return {Boolean} true if current user is in at least one of the target roles                         // 41
   * @static                                                                                               // 42
   * @for UIHelpers                                                                                        // 43
   */                                                                                                      // 44
  isInRole: function (role, group) {                                                                       // 45
    var user = Meteor.user(),                                                                              // 46
        comma = (role || '').indexOf(','),                                                                 // 47
        roles                                                                                              // 48
                                                                                                           // 49
    if (!user) return false                                                                                // 50
    if (!Match.test(role, String)) return false                                                            // 51
                                                                                                           // 52
    if (comma !== -1) {                                                                                    // 53
      roles = _.reduce(role.split(','), function (memo, r) {                                               // 54
        if (!r || !r.trim()) {                                                                             // 55
          return memo                                                                                      // 56
        }                                                                                                  // 57
        memo.push(r.trim())                                                                                // 58
        return memo                                                                                        // 59
      }, [])                                                                                               // 60
    } else {                                                                                               // 61
      roles = [role]                                                                                       // 62
    }                                                                                                      // 63
                                                                                                           // 64
    if (Match.test(group, String)) {                                                                       // 65
      return Roles.userIsInRole(user, roles, group)                                                        // 66
    }                                                                                                      // 67
                                                                                                           // 68
    return Roles.userIsInRole(user, roles)                                                                 // 69
  }                                                                                                        // 70
}                                                                                                          // 71
                                                                                                           // 72
                                                                                                           // 73
                                                                                                           // 74
////////////////////////////////////////////////////////////                                               // 75
// Register UI helpers                                                                                     // 76
//                                                                                                         // 77
                                                                                                           // 78
if (Roles.debug && console.log) {                                                                          // 79
  console.log("[roles] Roles.debug =", Roles.debug)                                                        // 80
}                                                                                                          // 81
                                                                                                           // 82
if ('undefined' !== typeof Package.blaze &&                                                                // 83
    'undefined' !== typeof Package.blaze.Blaze &&                                                          // 84
    'function'  === typeof Package.blaze.Blaze.registerHelper) {                                           // 85
  _.each(Roles._uiHelpers, function (func, name) {                                                         // 86
    if (Roles.debug && console.log) {                                                                      // 87
      console.log("[roles] registering Blaze helper '" + name + "'")                                       // 88
    }                                                                                                      // 89
    Package.blaze.Blaze.registerHelper(name, func)                                                         // 90
  })                                                                                                       // 91
}                                                                                                          // 92
                                                                                                           // 93
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/alanning_roles/client/subscriptions.js                                                         //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
"use strict"                                                                                               // 1
                                                                                                           // 2
                                                                                                           // 3
/**                                                                                                        // 4
 * Subscription handle for the currently logged in user's permissions.                                     // 5
 *                                                                                                         // 6
 * NOTE: The corresponding publish function, `_roles`, depends on                                          // 7
 * `this.userId` so it will automatically re-run when the currently                                        // 8
 * logged-in user changes.                                                                                 // 9
 *                                                                                                         // 10
 * @example                                                                                                // 11
 *                                                                                                         // 12
 *     `Roles.subscription.ready()` // => `true` if user roles have been loaded                            // 13
 *                                                                                                         // 14
 * @property subscription                                                                                  // 15
 * @type Object                                                                                            // 16
 * @for Roles                                                                                              // 17
 */                                                                                                        // 18
                                                                                                           // 19
Tracker.autorun(function () {                                                                              // 20
  Roles.subscription = Meteor.subscribe("_roles")                                                          // 21
})                                                                                                         // 22
                                                                                                           // 23
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['alanning:roles'] = {}, {
  Roles: Roles
});

})();
