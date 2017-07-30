import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { KbTopics } from '../collections';

// add
export const addKbTopic = new ValidatedMethod({
  name: 'knowledgebase.addKbTopic',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, { title: String, description: String, brandId: String });
  },

  run({ doc }) {
    return KbTopics.insert(Object.assign(doc));
  },
});

// edit
export const editKbTopic = new ValidatedMethod({
  name: 'knowledgebase.editKbTopic',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, { name: String, description: String, brandId: String });
  },

  run({ _id, doc }) {
    return KbTopics.update({ _id }, { $set: doc });
  },
});

// edit
export const removeKbTopic = new ValidatedMethod({
  name: 'knowledgebase.removeKbTopic',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return KbTopics.remove(id);
  },
});
