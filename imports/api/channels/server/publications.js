import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Channels } from '../channels';

Meteor.publish('channels.list', function channelsList(params) {
  // check params
  check(params, {
    memberIds: Match.Optional([String]),
    integrationIds: Match.Optional([String]),
    limit: Match.Optional(Number),
    origin: Match.Optional(String),
  });

  if (!this.userId) {
    return this.ready();
  }

  Counts.publish(this, 'channels.list.count', Channels.find(), {
    noReady: true,
  });

  const user = Meteor.users.findOne(this.userId);
  const query = {};

  // show all channels in settings for only owners
  if (!(params.origin === 'settings' && user.isOwner)) {
    query.memberIds = { $in: [this.userId] };
  }

  // filter by intgration ids
  if (params.integrationIds) {
    query.integrationIds = { $in: params.integrationIds };
  }

  return Channels.find(query, {
    fields: Channels.publicFields,
    sort: { createdAt: -1 },
    limit: params.limit,
  });
});

Meteor.publish('channels.getById', function channelsGetById(id) {
  check(id, String);

  if (!this.userId) {
    return this.ready();
  }

  return Channels.find({ _id: id }, { fields: Channels.publicFields });
});
