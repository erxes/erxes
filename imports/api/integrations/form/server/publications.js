/**
 * Form publications
 */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Collections } from '../form';

// form list
Meteor.publish('integrations.formList', function formList() {
  return Collections.Forms.find({ createdUser: this.userId });
});

// form detail
Meteor.publish('integrations.formDetail', function formDetail(id) {
  check(id, String);

  return Collections.Forms.find({ createdUser: this.userId, _id: id });
});


// form field list
Meteor.publish('integrations.form.fieldList', (formIds) => {
  check(formIds, [String]);

  const selector = {
    $and: [
      { formId: { $in: formIds } },
    ],
  };

  return Collections.Fields.find(selector, { sort: { order: 1 } });
});
