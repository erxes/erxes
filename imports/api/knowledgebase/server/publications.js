/**
 * Form publications
 */

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { KbGroups } from '../collections';

// form list
Meteor.publish('kb_groups.list', function kbGroupsList(params) {
  // console.log("params: ", params);
  check(params, {
    limit: Match.Optional(Number),
  });

  Counts.publish(this, 'kb_groups.list.count', KbGroups.find({}, {}), {
    noReady: true,
  });

  return KbGroups.find({});
});

// form detail
Meteor.publish('kb_groups.detail', id => {
  check(id, String);

  return KbGroups.find({ createdUser: this.userId, _id: id });
});
