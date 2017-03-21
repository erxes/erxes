/* eslint-disable no-param-reassign */

import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Integrations } from '/imports/api/integrations/integrations';
import { ErxesMixin } from '/imports/api/utils';
import { Forms, Fields } from './forms';

export const add = new ValidatedMethod({
  name: 'forms.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, Forms.schema);
  },

  run({ doc }) {
    doc.createdUserId = this.userId;
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
    // check whether has any field
    if (Fields.find({ formId: id }).count() > 0) {
      throw new Meteor.Error(
        'forms.cannotDelete.hasFields',
        'You cannot delete this form. This form has some fields.',
      );
    }

    // check whether used in integration
    if (Integrations.find({ formId: id }).count() > 0) {
      throw new Meteor.Error(
        'forms.cannotDelete.usedInIntegration',
        'You cannot delete this form. This form used in integration.',
      );
    }

    return Forms.remove(id);
  },
});

/* ----------------------- fields ----------------------- */

// add field
export const addField = new ValidatedMethod({
  name: 'forms.addField',
  mixins: [ErxesMixin],

  validate({ formId, doc }) {
    check(formId, String);
    check(doc, Fields.schema);
  },

  run({ formId, doc }) {
    // set form id
    doc.formId = formId;

    // find last field by order
    const lastField = Fields.findOne(
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
    return Fields.insert(doc);
  },
});

// edit field
export const editField = new ValidatedMethod({
  name: 'forms.editField',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, Fields.schema);
  },

  run({ _id, doc }) {
    // update field
    return Fields.update({ _id }, { $set: doc });
  },
});

// remove field
export const removeField = new ValidatedMethod({
  name: 'forms.removeField',
  mixins: [ErxesMixin],

  validate({ _id }) {
    check(_id, String);
  },

  run({ _id }) {
    Fields.remove(_id);
  },
});

// update field's orders
export const updateFieldsOrder = new ValidatedMethod({
  name: 'forms.updateFieldsOrder',
  mixins: [ErxesMixin],

  validate({ orderDics }) {
    check(orderDics, Array);
  },

  run({ orderDics }) {
    // update each field's order
    _.each(orderDics, ({ _id, order }) => {
      Fields.update({ _id }, { $set: { order } });
    });
  },
});
