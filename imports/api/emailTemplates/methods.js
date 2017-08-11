import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { EmailTemplates } from './emailTemplates';

// email template add
export const add = new ValidatedMethod({
  name: 'emailTemplates.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, EmailTemplates.schema);
  },

  run({ doc }) {
    return EmailTemplates.insert(doc);
  },
});

// email template edit
export const edit = new ValidatedMethod({
  name: 'emailTemplates.edit',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, EmailTemplates.schema);
  },

  run({ id, doc }) {
    return EmailTemplates.update(id, { $set: doc });
  },
});

// email template remove
export const remove = new ValidatedMethod({
  name: 'emailTemplates.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return EmailTemplates.remove({ _id: id });
  },
});
