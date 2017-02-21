/**
 * Form publications
 */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Forms, Fields } from '../forms';

// form list
Meteor.publish('forms.list', function formList(limit) {
  check(limit, Number);

  return Forms.find({ createdUser: this.userId });
});

// form detail
Meteor.publish('forms.detail', function formDetail(id) {
  check(id, String);

  return Forms.find({ createdUser: this.userId, _id: id });
});


// form field list
Meteor.publish('forms.fieldList', (formIds) => {
  check(formIds, [String]);

  const selector = {
    $and: [
      { formId: { $in: formIds } },
    ],
  };

  return Fields.find(selector, { sort: { order: 1 } });
});
