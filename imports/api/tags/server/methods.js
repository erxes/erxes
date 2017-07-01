import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Customers } from '/imports/api/customers/customers';
import { Conversations } from '/imports/api/conversations/conversations';
import { Messages } from '/imports/api/engage/engage';
import { ErxesMixin } from '/imports/api/utils';
import { Tags, FormSchema, TagItemSchema } from '../tags';
import { TAG_TYPES } from '../constants';
import { tagObject } from './api';

export const add = new ValidatedMethod({
  name: 'tags.add',
  validate: FormSchema.validator(),
  mixins: [ErxesMixin],

  run(doc) {
    return Tags.insert(doc);
  },
});

export const edit = new ValidatedMethod({
  name: 'tags.edit',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, FormSchema);
  },

  run({ id, doc }) {
    if (!Tags.findOne(id)) {
      throw new Meteor.Error('tags.edit.notFound', 'Tag not found');
    }

    return Tags.update(id, { $set: doc });
  },
});

export const remove = new ValidatedMethod({
  name: 'tags.remove',
  mixins: [ErxesMixin],

  validate(ids) {
    check(ids, [String]);
  },

  run(ids) {
    const tagCount = Tags.find({ _id: { $in: ids } }).count();

    if (tagCount !== ids.length) {
      throw new Meteor.Error('tags.remove.notFound', 'Tag not found');
    }

    let count = 0;

    count += Customers.find({ tagIds: { $in: ids } }).count();
    count += Conversations.find({ tagIds: { $in: ids } }).count();
    count += Messages.find({ tagIds: { $in: ids } }).count();

    // can't remove a tag with tagged objects
    if (count > 0) {
      throw new Meteor.Error('tags.remove.restricted', "Can't remove a tag with tagged object(s)");
    }

    return Tags.remove({ _id: { $in: ids } });
  },
});

// actual tag action
export const tag = new ValidatedMethod({
  name: 'tags.tag',
  mixins: [ErxesMixin],
  validate: TagItemSchema.validator(),

  run({ type, targetIds, tagIds }) {
    let collection = Conversations;

    if (type === TAG_TYPES.CUSTOMER) {
      collection = Customers;
    }

    if (type === TAG_TYPES.ENGAGE_MESSAGE) {
      collection = Messages;
    }

    tagObject({
      tagIds,
      objectIds: targetIds,
      collection,
    });
  },
});
