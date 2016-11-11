import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';

import { ErxesMixin } from '/imports/api/utils';
import { Integrations } from './integrations';

// integration add
export const add = new ValidatedMethod({
  name: 'integrations.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, Integrations.schema);
  },

  run({ doc }) {
    return Integrations.insert(_.extend({ userId: this.userId }, doc));
  },
});


// integration edit
export const edit = new ValidatedMethod({
  name: 'integrations.edit',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, Integrations.schema);
  },

  run({ id, doc }) {
    return Integrations.update(id, { $set: doc });
  },
});


// integration remove
export const remove = new ValidatedMethod({
  name: 'integrations.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return Integrations.remove(id);
  },
});

