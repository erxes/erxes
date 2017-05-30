import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { EmailTemplates } from '../emailTemplates';

Meteor.publish('emailTemplates.list', function emailTemplatesList() {
  if (!this.userId) {
    return this.ready();
  }

  return EmailTemplates.find();
});

Meteor.publish('emailTemplates.getById', function emailTemplatesGetById(id) {
  check(id, String);

  if (!this.userId) {
    return this.ready();
  }

  return EmailTemplates.find({ _id: id });
});
