import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { TAG_TYPES } from './constants';

class TagsCollection extends Mongo.Collection {
  insert(doc, callback) {
    // extend doc with auto values
    const tag = Object.assign(
      {
        createdAt: new Date(),
        objectCount: 0,
      },
      doc,
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
}

export const Tags = new TagsCollection('tags');

Tags.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
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

// helper for conversation, customer, engage message etc ...
export const TagItemSchema = new SimpleSchema({
  type: {
    type: String,
  },
  targetIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
  },
  tagIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
  },
});

Tags.publicFields = {
  name: 1,
  type: 1,
  createdAt: 1,
  colorCode: 1,
};

Factory.define('tag', Tags, {
  name: () => Random.id(),
  type: () => TAG_TYPES.CONVERSATION,
  colorCode: () => '#000',
});
