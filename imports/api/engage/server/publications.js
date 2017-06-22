/**
 * Form publications
 */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Tags } from '/imports/api/tags/tags';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { MESSAGE_KINDS } from '../constants';
import { Messages } from '../engage';

// engage list
Meteor.publish('engage.messages.list', function engageMessagesList(params) {
  check(params, {
    kind: Match.Optional(String),
    status: Match.Optional(String),
    tag: Match.Optional(String),
  });

  if (!this.userId) {
    return this.ready();
  }

  let query = {};

  // basic count helper
  const count = (name, selector) => {
    const fields = { _id: 1 };
    Counts.publish(this, name, Messages.find(selector, { fields }), { noReady: true });
  };

  // all count
  count('engage.messages.all', {});

  // auto count
  count('engage.messages.auto', { kind: MESSAGE_KINDS.AUTO });

  // visitor auto count
  count('engage.messages.visitorAuto', { kind: MESSAGE_KINDS.VISITOR_AUTO });

  // manual count
  count('engage.messages.manual', { kind: MESSAGE_KINDS.MANUAL });

  // manual or auto
  if (params.kind) {
    query.kind = params.kind;
  }

  // status filter && count ===================

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

  // Tag filter && count ===================

  const tagQueryBuilder = tagId => ({ tagIds: tagId });

  const tags = Tags.find({ type: TAG_TYPES.ENGAGE_MESSAGE }, { fields: { _id: 1 } });

  tags
    .fetch()
    .forEach(tag =>
      count(`engage.messages.tag.${tag._id}`, { ...query, ...tagQueryBuilder(tag._id) }),
    );

  // filter by tag
  if (params.tag) {
    query = { ...query, ...tagQueryBuilder(params.tag) };
  }

  return Messages.find(query);
});

// engage detail
Meteor.publish('engage.messages.detail', function engageDetail(id) {
  check(id, String);

  return Messages.find({ _id: id });
});
