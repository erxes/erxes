import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { KbTopics } from './collections';

const generateCode = () => {
  // generate code automatically
  let code = Random.id().substr(0, 6);

  while (KbTopics.findOne({ code })) {
    code = Random.id().substr(0, 6);
  }

  return code;
};

export const add = new ValidatedMethod({
  name: 'kb_topics.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, KbTopics.schema);
  },

  run({ doc }) {
    doc.code = generateCode();
    doc.createdUserId = this.userId;
    doc.createdDate = new Date();

    // create
    return KbTopics.insert(doc);
  },
});

// form edit
export const edit = new ValidatedMethod({
  name: 'kb_topics.edit',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, KbTopics.schema);
  },

  run({ id, doc }) {
    return KbTopics.update(id, { $set: doc });
  },
});

// form remove
export const remove = new ValidatedMethod({
  name: 'kb_topics.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    // check whether has any field
    if (Fields.find({ formId: id }).count() > 0) {
      throw new Meteor.Error(
        'forms.cannotDelete.hasFields',
        'You cannot delete this form. This form has some fields.',
      );
    }

    return KbTopics.remove(id);
  },
});
