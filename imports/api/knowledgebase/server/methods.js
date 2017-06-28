import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { KbGroups } from '../collections';

// add
export const addKbGroup = new ValidatedMethod({
  name: 'knowledgebase.addKbGroup',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, { title: String, brandId: String });
  },

  run({ doc }) {
    return KbGroups.insert(Object.assign(doc));
  },
});

// edit
export const editKbGroup = new ValidatedMethod({
  name: 'knowledgebase.editKbGroup',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, { name: String, brandId: String });
  },

  run({ _id, doc }) {
    return KbGroups.update({ _id }, { $set: doc });
  },
});
