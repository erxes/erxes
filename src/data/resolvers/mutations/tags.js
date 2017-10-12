import _ from 'underscore';
import { Tags, Customers, Conversations, EngageMessages } from '../../../db/models';

const validateUniqueness = async (selector, data) => {
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

const tagObject = async ({ tagIds, objectIds, collection, tagType }) => {
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

export default {
  /**
  * Create new tag
  * @param {String} doc.name
  * @param {String} doc.type
  * @param {String} doc.colorCode
  * @return {Promise} tag object
  */
  async tagsAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    if (!doc.name) throw new Error('Name is required field');

    if (!doc.type) throw new Error('Type is required field');

    const isUnique = await validateUniqueness(null, doc);

    if (!isUnique) throw new Error('Tag duplicated');

    return Tags.createTag(doc);
  },

  /**
  * Update tag
  * @param {String} doc.name
  * @param {String} doc.type
  * @param {String} doc.colorCode
  * @return {Promise} tag object
  */
  async tagsEdit(root, { _id, ...doc }, { user }) {
    if (!user) throw new Error('Login required');

    const isUnique = await validateUniqueness({ _id }, doc);

    if (!isUnique) throw new Error('Tag duplicated');

    await Tags.update({ _id: _id }, doc);
    return Tags.findOne({ _id });
  },

  /**
  * Delete tag
  * @param {[String]} ids
  * @return {Promise}
  */
  async tagsRemove(root, { ids }, { user }) {
    if (!user) throw new Error('Login required');

    const tagCount = await Tags.find({ _id: { $in: ids } }).count();

    if (tagCount !== ids.length) throw new Error('Tag not found');

    let count = 0;

    count += await Customers.find({ tagIds: { $in: ids } }).count();
    count += await Conversations.find({ tagIds: { $in: ids } }).count();
    count += await EngageMessages.find({ tagIds: { $in: ids } }).count();

    if (count > 0) throw new Error("Can't remove a tag with tagged object(s)");

    return Tags.remove({ _id: { $in: ids } });
  },

  /**
  * Attach a tag
  * @param {String} type
  * @param {[String]} targetIds
  * @param {[String]} tagIds
  * @return {Promise}
  */
  async tagsTag(root, { type, targetIds, tagIds }, { user }) {
    if (!user) throw new Error('Login required');

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
  },
};
