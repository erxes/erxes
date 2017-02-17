/* eslint-disable no-param-reassign */

/*
 * Form methods
 */

import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check, Match } from 'meteor/check';
import { Schemas, Collections } from '../form';

Meteor.methods({
  /* ----------------------- forms ----------------------- */

  'integrations.formInsert': (modifier) => {
    check(modifier, Schemas.Form);

    modifier.createdUser = this.userId;
    modifier.createdDate = new Date();

    // create
    Collections.Forms.insert(modifier);
    return modifier;
  },

  'integrations.formUpdate': (modifier, docId) => {
    check(modifier, { $set: Object, $unset: Match.Optional(Object) });
    check(modifier.$set, Schemas.Form);
    check(docId, String);

    // update
    Collections.Forms.update(docId, modifier);
  },

  'integrations.formDelete': (docId) => {
    check(docId, String);

    // remove
    Collections.Forms.remove(docId);
  },


  /* ----------------------- fields ----------------------- */

  'integrations.form.createField': (formId, modifier) => {
    check(formId, String);
    check(modifier, Schemas.Field);

    // set form
    modifier.formId = formId;

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

    modifier.order = order;

    // insert field
    return Collections.Fields.insert(modifier);
  },

  'integrations.form.updateField': (formId, fieldId, modifier) => {
    check(formId, String);
    check(fieldId, String);

    check(modifier, Schemas.Field);

    // update field
    Collections.Fields.update(fieldId, modifier);

    return fieldId;
  },

  'integrations.form.deleteField': (docId) => {
    check(docId, String);

    // remove
    Collections.Fields.remove(docId);
  },

  'integrations.form.updateFieldOrder': (formId, orders) => {
    check(formId, String);
    check(orders, Object);

    // update each field's order
    _.each(_.keys(orders), (fieldId) => {
      const order = orders[fieldId];
      Collections.Fields.update({ _id: fieldId }, { $set: { order } });
    });
  },
});
