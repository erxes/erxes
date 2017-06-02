/**
 * Form publications
 */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Messages } from '../engage';

// engage list
Meteor.publish('engage.messages.list', params => {
  check(params, {
    type: Match.Optional(String),
  });

  return Messages.find({ isAuto: params.type === 'auto' });
});

// engage detail
Meteor.publish('engage.messages.detail', function engageDetail(id) {
  check(id, String);

  return Messages.find({ _id: id });
});
