/* eslint-disable new-cap */

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Channels } from '../channels';

Meteor.publish('channels.list', function channelsList(params) {
  if (! this.userId) {
    return this.ready();
  }

  // check params
  check(params, {
    memberIds: Match.Optional([String]),
    integrationIds: Match.Optional([String]),
  });

  const query = {};

  // filter by member ids
  if (params.memberIds) {
    query.memberIds = { $in: params.memberIds };
  }

  // filter by intgration ids
  if (params.integrationIds) {
    query.integrationIds = { $in: params.integrationIds };
  }

  return Channels.find(
    query,
    { fields: Channels.publicFields }
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
