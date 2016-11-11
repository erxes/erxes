import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Customers } from '/imports/api/customers/customers';
import { Tickets } from '/imports/api/tickets/tickets';

import { TAG_TYPES } from './constants';

class TagsCollection extends Mongo.Collection {
  insert(doc, callback) {
    // extend doc with auto values
    const tag = _.extend(
      {
        createdAt: new Date(),
        objectCount: 0,
      },
      doc
    );

    if (!this.validateUniqueness(null, tag)) {
      throw new Meteor.Error('tags.insert.restricted', 'Tag duplicated');
    }

    return super.insert(tag, callback);
  }

  update(selector, modifier) {
    const set = modifier.$set || {};

    if (!this.validateUniqueness(selector, set)) {
      throw new Meteor.Error('tags.update.restricted', 'Tag duplicated');
    }

    return super.update(selector, modifier);
  }

  validateUniqueness(selector, data) {
    const { name, type } = data;
    const filter = { name, type };

    if (!name || !type) {
      return true;
    }

    // can't update name & type same time more than one tags.
    if (selector && this.find(selector).count() > 1) {
      return false;
    }

    const obj = selector && this.findOne(selector);
    if (obj) {
      filter._id = { $ne: obj._id };
    }

    if (this.findOne(filter)) {
      return false;
    }

    return true;
  }

  remove(selector, callback) {
    const tagIds = this.find(selector, { fields: { _id: 1 } }).map(t => t._id);

    let count = Customers.find({ tagIds: { $in: tagIds } }).count();
    count += Tickets.find({ tagIds: { $in: tagIds } }).count();

    // can't remove a tag with tagged objects
    if (count > 0) {
      throw new Meteor.Error('tags.remove.restricted',
        'Can\'t remove a tag with tagged object(s)');
    }

    return super.remove(selector, callback);
  }
}

export const Tags = new TagsCollection('tags');

Tags.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


export const FormSchema = new SimpleSchema({
  name: {
    type: String,
  },

  type: {
    type: String,
    allowedValues: TAG_TYPES.ALL_LIST,
  },

  colorCode: {
    type: String,
  },
});

Tags.schema = new SimpleSchema([
  FormSchema,
  {
    createdAt: {
      type: Date,
    },

    objectCount: {
      type: Number,
    },
  },
]);

Tags.attachSchema(Tags.schema);

Tags.publicFields = {
  name: 1,
  type: 1,
  createdAt: 1,
  colorCode: 1,
};

Factory.define('tag', Tags, {
  name: () => Random.id(),
  type: () => TAG_TYPES.TICKET,
  colorCode: () => '#000',
});
