import _ from 'underscore';
import * as mongoose from 'mongoose';
import { TAG_TYPES } from '../../data/constants';
import { Customers, Conversations, EngageMessages, Companies, Integrations } from '.';
import { field } from './utils';

const TagSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  type: field({
    type: String,
    enum: TAG_TYPES.ALL,
  }),
  colorCode: field({ type: String }),
  createdAt: field({ type: Date }),
  objectCount: field({ type: Number }),
});

/*
 * Validates tag uniquness
 * @param {Object} selector - mongoose selector object
 * @param {String} data.name - tag name
 * @param {String} data.type - tag type
 */
export const validateUniqueness = async (selector, name, type) => {
  // required name and type
  if (!name || !type) {
    return true;
  }

  // can't update name & type same time more than one tags.
  const count = await Tags.find(selector).count();

  if (selector && count > 1) {
    return false;
  }

  const obj = selector && (await Tags.findOne(selector));

  const filter = { name, type };

  if (obj) {
    filter._id = { $ne: obj._id };
  }

  const existing = await Tags.findOne(filter);

  if (existing) {
    return false;
  }

  return true;
};

/*
 * Common helper for taggable objects like conversation, engage, customer etc ...
 * @param {[String]} tagIds - Tag ids
 * @param {[String]} objectIds - conversation, engage or customer's ids
 * @param {MongooseCollection} collection - conversation, engage or customer's collections
 * @param {String} tagType - one of conversation, engageMessage, customer
 */
export const tagObject = async ({ tagIds, objectIds, collection, tagType }) => {
  const prevTagsCount = await Tags.find({
    _id: { $in: tagIds },
    type: tagType,
  }).count();

  if (prevTagsCount !== tagIds.length) {
    throw new Error('Tag not found.');
  }

  const objects = await collection.find({ _id: { $in: objectIds } }, { tagIds: 1 });

  let removeIds = [];

  objects.forEach(obj => {
    removeIds.push(obj.tagIds);
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
    const isUnique = await validateUniqueness(null, doc.name, doc.type);

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
    const isUnique = await validateUniqueness({ _id }, doc.name, doc.type);

    if (!isUnique) throw new Error('Tag duplicated');

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Remove Tag
   * @param  {[String]} ids
   * @return {Promise}
   */
  static async removeTag(ids) {
    const tagCount = await Tags.find({ _id: { $in: ids } }).count();

    if (tagCount !== ids.length) throw new Error('Tag not found');

    let count = 0;

    count += await Customers.find({ tagIds: { $in: ids } }).count();
    count += await Conversations.find({ tagIds: { $in: ids } }).count();
    count += await EngageMessages.find({ tagIds: { $in: ids } }).count();
    count += await Companies.find({ tagIds: { $in: ids } }).count();
    count += await Integrations.find({ tagIds: { $in: ids } }).count();

    if (count > 0) throw new Error("Can't remove a tag with tagged object(s)");

    return Tags.remove({ _id: { $in: ids } });
  }

  /**
   * Attach a tag
   * @param {String} type
   * @param {[String]} targetIds
   * @param {[String]} tagIds
   * @return {Promise} attach tag object
   */
  static async tagsTag(type, targetIds, tagIds) {
    let collection = Conversations;

    switch (type) {
      case 'customer':
        collection = Customers;
        break;
      case 'engageMessage':
        collection = EngageMessages;
        break;
      case 'company':
        collection = Companies;
        break;
      case 'integration':
        collection = Integrations;
        break;
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
