import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { ResponseTemplates } from '../responseTemplates';

// response template add
export const add = new ValidatedMethod({
  name: 'responseTemplates.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, ResponseTemplates.schema);
  },

  run({ doc }) {
    return ResponseTemplates.insert(doc);
  },
});

// response template edit
export const edit = new ValidatedMethod({
  name: 'responseTemplates.edit',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, ResponseTemplates.schema);
  },

  run({ id, doc }) {
    return ResponseTemplates.update(id, { $set: doc });
  },
});

// response template remove
export const remove = new ValidatedMethod({
  name: 'responseTemplates.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return ResponseTemplates.remove({ _id: id });
  },
});
