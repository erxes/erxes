/**
 * Form publications
 */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Messages } from '../engage';

// engage list
Meteor.publish('engage.messages.list', limit => {
  check(limit, Match.Optional(Number));

  return Messages.find();
});

// engage detail
Meteor.publish('engage.messages.detail', function engageDetail(id) {
  check(id, String);

  return Messages.find({ _id: id });
});
