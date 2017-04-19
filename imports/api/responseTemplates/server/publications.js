import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ResponseTemplates } from '../responseTemplates';

Meteor.publish('responseTemplates.list', function responseTemplatesList() {
  if (!this.userId) {
    return this.ready();
  }

  return ResponseTemplates.find();
});

Meteor.publish('responseTemplates.getById', function responseTemplatesGetById(id) {
  check(id, String);

  if (!this.userId) {
    return this.ready();
  }

  return ResponseTemplates.find({ _id: id });
});
