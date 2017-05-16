import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { ErxesMixin } from '/imports/api/utils';
import Segments from './segments';
import { Customers } from './customers';

/**
 * Segments
 */

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

/**
 * Internal notes
 */

export const createInternalNote = new ValidatedMethod({
  name: 'customers.createInternalNote',
  mixins: [ErxesMixin],

  validate({ customerId, internalNote }) {
    check(customerId, String);
    check(internalNote, String);
  },

  run({ customerId, internalNote }) {
    const internalNoteObj = {
      _id: Random.id(),
      content: internalNote,
      createdBy: this.userId,
      createdDate: new Date(),
    };

    Customers.update(customerId, { $addToSet: { internalNotes: internalNoteObj } });
  },
});

export const removeInternalNote = new ValidatedMethod({
  name: 'customers.removeInternalNote',
  mixins: [ErxesMixin],

  validate({ customerId, internalNoteId }) {
    check(customerId, String);
    check(internalNoteId, String);
  },

  run({ customerId, internalNoteId }) {
    const notes = Customers.findOne(customerId).internalNotes || [];
    const canDelete = !!notes.find(n => n.createdBy === this.userId);
    if (!canDelete) {
      throw new Meteor.Error('permissionDenied', 'Permission denied.');
    }
    Customers.update(customerId, { $pull: { internalNotes: { _id: internalNoteId } } });
  },
});
