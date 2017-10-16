import _ from 'underscore';
import mongoose from 'mongoose';
import Random from 'meteor-random';
import { TAG_TYPES } from '../../data/constants';
import { Customers, Conversations, EngageMessages } from '.';

const TagSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  type: {
    type: String,
    enum: TAG_TYPES.ALL_LIST,
  },
  colorCode: String,
  createdAt: Date,
  objectCount: Number,
});

export const validateUniqueness = async (selector, data) => {
  const { name, type } = data;
  const filter = { name, type };

  if (!name || !type) {
    return true;
  }

  // can't update name & type same time more than one tags.
  const count = await Tags.find(selector).count();

  if (selector && count > 1) {
    return false;
  }

  const obj = selector && (await Tags.findOne(selector));

  if (obj) {
    filter._id = { $ne: obj._id };
  }

  const existing = await Tags.findOne(filter);

  if (existing) {
    return false;
  }

  return true;
};

export const tagObject = async ({ tagIds, objectIds, collection, tagType }) => {
  if ((await Tags.find({ _id: { $in: tagIds }, type: tagType }).count()) !== tagIds.length) {
    throw new Error('Tag not found.');
  }

  const objects = await collection.find({ _id: { $in: objectIds } }, { tagIds: 1 });

  let removeIds = [];

  objects.forEach(obj => {
    removeIds.push(obj.tagIds || []);
  });

  removeIds = _.uniq(_.flatten(removeIds));

  await Tags.update({ _id: { $in: removeIds } }, { $inc: { objectCount: -1 } }, { multi: true });

  await collection.update({ _id: { $in: objectIds } }, { $set: { tagIds } }, { multi: true });

  await Tags.update({ _id: { $in: tagIds } }, { $inc: { objectCount: 1 } }, { multi: true });
};

class Tag {
  /**
   * Create a tag
   * @param  {Object} doc
   * @return {Promise} Newly created tag object
   */
  static async createTag(doc) {
    const isUnique = await validateUniqueness(null, doc);

    if (!isUnique) throw new Error('Tag duplicated');

    return this.create({
      ...doc,
      createdAt: new Date(),
    });
  }

  /**
   * Update Tag
   * @param  {Object} doc
   * @return {Promise} updated tag object
   */
  static async updateTag(_id, doc) {
    const isUnique = await validateUniqueness({ _id }, doc);

    if (!isUnique) throw new Error('Tag duplicated');

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Remove Tag
   * @param  {[String]} ids
   * @return {Promise} removed tag object
   */
  static async removeTag(ids) {
    const tagCount = await Tags.find({ _id: { $in: ids } }).count();

    if (tagCount !== ids.length) throw new Error('Tag not found');

    let count = 0;

    count += await Customers.find({ tagIds: { $in: ids } }).count();
    count += await Conversations.find({ tagIds: { $in: ids } }).count();
    count += await EngageMessages.find({ tagIds: { $in: ids } }).count();

    if (count > 0) throw new Error("Can't remove a tag with tagged object(s)");

    return await Tags.remove({ _id: { $in: ids } });
  }

  /**
   * Attach a tag
   * @param {String} type
   * @param {[String]} targetIds
   * @param {[String]} tagIds
   * @return {Promise} removed tag object
   */
  static async tagsTag(type, targetIds, tagIds) {
    let collection = Conversations;

    if (type === 'customer') {
      collection = Customers;
    }

    if (type === 'engageMessage') {
      collection = EngageMessages;
    }

    await tagObject({
      tagIds,
      objectIds: targetIds,
      collection,
      tagType: type,
    });
  }
}

TagSchema.loadClass(Tag);
const Tags = mongoose.model('tags', TagSchema);

export default Tags;
