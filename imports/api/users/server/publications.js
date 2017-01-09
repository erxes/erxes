/* eslint-disable new-cap */

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';


const publicFields = {
  isOwner: 1,
  username: 1,
  details: 1,
  emailSignatures: 1,
  emails: 1,
};

Meteor.publish(null, function loggedInUserFields() {
  if (!this.userId) {
    return this.ready();
  }

  return Meteor.users.find(this.userId, { fields: publicFields });
});

Meteor.publish('users.list', function usersList(params) {
  check(params, {
    ids: Match.Optional([String]),
    limit: Match.Optional(Number),
  });

  if (!this.userId) {
    return this.ready();
  }

  Counts.publish(this, 'users.list.count', Meteor.users.find(), { noReady: true });

  return Meteor.users.find({}, { fields: publicFields, limit: params.limit });
});
