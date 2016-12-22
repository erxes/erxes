/* eslint-disable new-cap */

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Channels } from '../channels';

Meteor.publish('channels.list', function channelsList(params) {
  if (! this.userId) {
    return this.ready();
  }

  // check params
  check(params, {
    memberIds: Match.Optional([String]),
    limit: Match.Optional(Number),
  });

  Counts.publish(this, 'channels.list.count', Channels.find(), { noReady: true });
  const query = {};

  // filter by member ids
  if (params.memberIds) {
    query.memberIds = { $in: params.memberIds };
  }

  return Channels.find(
    query,
    {
      fields: Channels.publicFields,
      sort: { createdAt: -1 },
      limit: params.limit,
    }
  );
});

Meteor.publish('channels.getById', function channelsGetById(id) {
  check(id, String);

  if (! this.userId) {
    return this.ready();
  }

  return Channels.find(
    { _id: id },
    { fields: Channels.publicFields }
  );
});
