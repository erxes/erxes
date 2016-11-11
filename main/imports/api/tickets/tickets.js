import faker from 'faker';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Customers } from '/imports/api/customers/customers';
import { Brands } from '/imports/api/brands/brands';
import { Integrations } from '/imports/api/integrations/integrations';
import { Tags } from '/imports/api/tags/tags';

import { TICKET_STATUSES } from './constants';

class TicketsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ticket = _.extend(
      {
        createdAt: new Date(),
        number: this.find().count() + 1,
        commentCount: 0,
      },
      doc
    );

    return super.insert(ticket, callback);
  }

  update(selector, modifier, options) {
    const set = modifier.$set || {};

    if (set.number) {
      throw new Meteor.Error('invalid-data', 'Can\'t change "number" field!');
    }

    return super.update(selector, modifier, options);
  }

  remove(selector, callback) {
    const tickets = this.find(selector).fetch();

    const result = super.remove(selector, callback);

    let removeIds = [];
    tickets.forEach((obj) => {
      removeIds.push(obj.tagIds || []);
    });

    removeIds = _.uniq(_.flatten(removeIds));
    Tags.update({ _id: { $in: removeIds } }, { $inc: { objectCount: -1 } });

    return result;
  }
}

export const Tickets = new TicketsCollection('tickets');

Tickets.TAG_TYPE = 'ticket';

Tickets.helpers({
  customer() {
    return Customers.findOne(this.customerId);
  },

  brand() {
    return Brands.findOne(this.brandId);
  },

  integration() {
    return Integrations.findOne({
      brandId: this.brandId,
      kind: 'in_app_messaging',
    });
  },

  tags() {
    return Tags.find({ _id: { $in: this.tagIds || [] } }).fetch();
  },

  assignedUser() {
    return Meteor.users.findOne(this.assignedUserId);
  },

  participatedUsers() {
    const query = { _id: { $in: this.participatedUserIds || [] } };
    return Meteor.users.find(query).fetch();
  },

  participatorCount() {
    return this.participatedUserIds && this.participatedUserIds.length || 0;
  },
});

export function addParticipator({ ticketId, userId }) {
  if (ticketId && userId) {
    Tickets.update(ticketId, { $addToSet: { participatedUserIds: userId } });
  }
}

Tickets.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Tickets.schema = new SimpleSchema({
  number: {
    type: Number,
  },

  content: {
    type: String,
  },

  customerId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  brandId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  assignedUserId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },

  status: {
    type: String,
    allowedValues: TICKET_STATUSES.ALL_LIST,
  },

  participatedUserIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },

  tagIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },

  // users's informed history
  readUserIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },

  createdAt: {
    type: Date,
  },

  commentCount: {
    type: Number,
  },
});

Tickets.attachSchema(Tickets.schema);

Tickets.publicFields = {
  number: 1,
  assignedUserId: 1,
  content: 1,
  customerId: 1,
  brandId: 1,
  status: 1,
  createdAt: 1,
  commentCount: 1,
  participatedUserIds: 1,
  readUserIds: 1,
  tagIds: 1,
};

Factory.define('ticket', Tickets, {
  content: () => faker.lorem.sentence(),
  customerId: () => Random.id(),
  brandId: () => Random.id(),
  status: () => TICKET_STATUSES.NEW,
});
