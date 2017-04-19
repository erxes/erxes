import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { Tags, FormSchema } from './tags';

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

    return Tags.remove({ _id: { $in: ids } });
  },
});
