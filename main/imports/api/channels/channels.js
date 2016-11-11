import faker from 'faker';

import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';


class ChannelsCollection extends Mongo.Collection {
  insert(doc, callback) {
    // extend doc with auto values
    const modifier = _.extend(
      {
        createdAt: new Date(),
        ticketCount: 0,
        openTicketCount: 0,
      },
      doc
    );

    // add current user to members
    if (modifier.memberIds.indexOf(modifier.userId) === -1) {
      modifier.memberIds.push(modifier.userId);
    }

    return super.insert(modifier, callback);
  }
}

export const Channels = new ChannelsCollection('channels');

Channels.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Channels.schema = new SimpleSchema({
  name: {
    type: String,
  },

  description: {
    type: String,
    optional: true,
  },

  integrationIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
  },

  memberIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
  },
});

Channels.schemaExtra = new SimpleSchema({
  createdAt: {
    type: Date,
  },

  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  // All ticket count
  ticketCount: {
    type: Number,
  },

  // Open/unresolved ticket count
  openTicketCount: {
    type: Number,
  },
});

Channels.attachSchema(Channels.schema);
Channels.attachSchema(Channels.schemaExtra);

Channels.publicFields = {
  name: 1,
  description: 1,
  integrationIds: 1,
  memberIds: 1,
  userId: 1,
  createdAt: 1,
  openTicketCount: 1,
  ticketCount: 1,
};

Factory.define('channel', Channels, {
  name: () => faker.random.word(),
  memberIds: () => [Random.id()],
  integrationIds: () => [Random.id()],
  userId: () => Random.id(),
});
