/* eslint-disable no-param-reassign */

import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { Forms, Collections, Schemas } from './forms';

export const add = new ValidatedMethod({
  name: 'forms.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, Forms.schema);
  },

  run({ doc }) {
    doc.createdUser = this.userId;
    doc.createdDate = new Date();

    // create
    return Forms.insert(doc);
  },
});

// form edit
export const edit = new ValidatedMethod({
  name: 'forms.edit',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, Forms.schema);
  },

  run({ id, doc }) {
    return Forms.update(id, { $set: doc });
  },
});

// form remove
export const remove = new ValidatedMethod({
  name: 'forms.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return Forms.remove(id);
  },
});


Meteor.methods({
  /* ----------------------- fields ----------------------- */

  'forms.createField': (formId, doc) => {
    check(formId, String);
    check(doc, Schemas.Field);

    // set form id
    doc.formId = formId;

    // find last field by order
    const lastField = Collections.Fields.findOne(
      {},
      { fields: { order: 1 }, sort: { order: -1 } },
    );

    // if there is no field then start with 0
    let order = 0;

    if (lastField) {
      order = lastField.order + 1;
    }

    doc.order = order;

    // insert field
    return Collections.Fields.insert(doc);
  },

  'forms.updateField': (formId, fieldId, doc) => {
    check(formId, String);
    check(fieldId, String);

    check(doc, Schemas.Field);

    // update field
    Collections.Fields.update(fieldId, doc);

    return fieldId;
  },

  'forms.deleteField': (docId) => {
    check(docId, String);

    // remove
    Collections.Fields.remove(docId);
  },

  'forms.updateFieldOrder': (formId, orders) => {
    check(formId, String);
    check(orders, Object);

    // update each field's order
    _.each(_.keys(orders), (fieldId) => {
      const order = orders[fieldId];
      Collections.Fields.update({ _id: fieldId }, { $set: { order } });
    });
  },
});
