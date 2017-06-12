import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { KBGroups } from './collections';

const generateCode = () => {
  // generate code automatically
  let code = Random.id().substr(0, 6);

  while (KBGroups.findOne({ code })) {
    code = Random.id().substr(0, 6);
  }

  return code;
};

export const add = new ValidatedMethod({
  name: 'kbgroups.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, KBGroups.schema);
  },

  run({ doc }) {
    doc.code = generateCode();
    doc.createdUserId = this.userId;
    doc.createdDate = new Date();

    // create
    return KBGroups.insert(doc);
  },
});

// form edit
export const edit = new ValidatedMethod({
  name: 'kbgroups.edit',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, KBGroups.schema);
  },

  run({ id, doc }) {
    return KBGroups.update(id, { $set: doc });
  },
});

// form remove
export const remove = new ValidatedMethod({
  name: 'kbgroups.remove',
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

    return KBGroups.remove(id);
  },
});
