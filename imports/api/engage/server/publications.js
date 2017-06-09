/**
 * Form publications
 */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Messages } from '../engage';

// engage list
Meteor.publish('engage.messages.list', function engageMessagesList(params) {
  check(params, {
    type: Match.Optional(String),
    status: Match.Optional(String),
  });

  if (!this.userId) {
    return this.ready();
  }

  let query = {};

  // basic count helper
  const count = (name, q) => {
    Counts.publish(this, name, Messages.find(q), { noReady: true });
  };

  // all count
  count('engage.messages.all', {});

  // auto count
  count('engage.messages.auto', { isAuto: true });

  // manual count
  count('engage.messages.manual', { isAuto: false });

  // manual or auto
  if (params.type) {
    query.isAuto = params.type === 'auto';
  }

  // status query builder
  const statusQueryBuilder = status => {
    if (status === 'live') {
      return { isLive: true };
    }

    if (status === 'draft') {
      return { isDraft: true };
    }

    if (status === 'paused') {
      return { isLive: false };
    }

    if (status === 'yours') {
      return { fromUserId: this.userId };
    }

    return {};
  };

  // filter by status
  if (params.status) {
    query = { ...query, ...statusQueryBuilder(params.status) };
  }

  ['live', 'draft', 'paused', 'yours'].forEach(status =>
    count(`engage.messages.status.${status}`, { ...query, ...statusQueryBuilder(status) }),
  );

  return Messages.find(query);
});

// engage detail
Meteor.publish('engage.messages.detail', function engageDetail(id) {
  check(id, String);

  return Messages.find({ _id: id });
});
