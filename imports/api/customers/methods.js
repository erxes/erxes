import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { check } from 'meteor/check';
import { ErxesMixin } from '/imports/api/utils';
import Segments from './segments';


export const createSegment = new ValidatedMethod({
  name: 'customers.createSegment',
  mixins: [ErxesMixin],

  validate: Segments.simpleSchema().validator(),

  run(doc) {
    return Segments.insert(doc);
  },
});

export const editSegment = new ValidatedMethod({
  name: 'customers.editSegment',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, Segments.simpleSchema());
  },

  run({ id, doc }) {
    return Segments.update(id, { $set: doc });
  },
});

export const removeSegment = new ValidatedMethod({
  name: 'customers.removeSegment',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return Segments.remove(id);
  },
});
