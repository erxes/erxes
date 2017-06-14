import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Tags } from './tags';

export class TagsCollection extends Mongo.Collection {
  remove(selector, callback) {
    const objects = this.find(selector).fetch();
    const result = super.remove(selector, callback);

    // remove tag items that using removing objects
    let removeIds = [];

    objects.forEach(obj => {
      removeIds.push(obj.tagIds || []);
    });

    removeIds = _.uniq(_.flatten(removeIds));
    Tags.update({ _id: { $in: removeIds } }, { $inc: { objectCount: -1 } });

    return result;
  }
}

export const tagsHelper = {
  tags() {
    return Tags.find({ _id: { $in: this.tagIds || [] } }).fetch();
  },
};

export const tagSchemaOptions = () => ({
  tagIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
});
