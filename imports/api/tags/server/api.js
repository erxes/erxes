import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { TAG_TYPES } from '../constants';
import { Tags } from '../tags';

// eslint-disable-next-line import/prefer-default-export
export function tagObject({ tagIds, objectIds, collection }) {
  check(collection, Mongo.Collection);
  check(
    collection.TAG_TYPE,
    Match.Where(t => {
      // eslint-disable-line new-cap
      check(t, String);
      return TAG_TYPES.ALL_LIST.indexOf(t) > -1;
    }),
  );

  check(tagIds, [String]);
  check(objectIds, [String]);

  const type = collection.TAG_TYPE;

  if (Tags.find({ _id: { $in: tagIds }, type }).count() !== tagIds.length) {
    throw new Meteor.Error('tags.tagObject.notFound', 'Tag not found.');
  }

  const objects = collection.find({ _id: { $in: objectIds } }, { fields: { tagIds: 1 } });

  let removeIds = [];

  objects.forEach(obj => {
    removeIds.push(obj.tagIds || []);
  });

  removeIds = _.uniq(_.flatten(removeIds));

  Tags.update({ _id: { $in: removeIds } }, { $inc: { objectCount: -1 } }, { multi: true });

  collection.update({ _id: { $in: objectIds } }, { $set: { tagIds } }, { multi: true });

  Tags.update({ _id: { $in: tagIds } }, { $inc: { objectCount: 1 } }, { multi: true });
}
