import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tags } from '../tags';


Meteor.publish('tags.tagList', function tagList(type) {
  check(type, String);

  if (!this.userId) {
    return this.ready();
  }

  return Tags.find({ type }, { fields: Tags.publicFields });
});


Meteor.publish('tags.tagListByIds', function tagList(tagIds) {
  check(tagIds, [String]);

  if (!this.userId) {
    return this.ready();
  }

  return Tags.find({ _id: { $in: tagIds } }, { fields: Tags.publicFields });
});
