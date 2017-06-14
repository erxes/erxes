/**
 * Form publications
 */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { KbGroups } from '../collections';

// form list
Meteor.publish('kbgroups.list', limit => {
  check(limit, Match.Optional(Number));

  return KbGroups.find();
});

// form detail
Meteor.publish('kbgroups.detail', id => {
  check(id, String);

  return KbGroups.find({ createdUser: this.userId, _id: id });
});

// // form field list
// Meteor.publish('forms.fieldList', formIds => {
//   check(formIds, [String]);

//   const selector = {
//     $and: [{ formId: { $in: formIds } }],
//   };

//   return Fields.find(selector, { sort: { order: 1 } });
// });
