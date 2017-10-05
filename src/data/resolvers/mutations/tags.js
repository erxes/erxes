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

async function tagObject({ tagIds, objectIds, collection, tagType }) {
  if ((await Tags.find({ _id: { $in: tagIds }, type: tagType }).count()) !== tagIds.length) {
    throw new Error('Tag not found.');
  }

  const objects = await collection.find({ _id: { $in: objectIds } }, { fields: { tagIds: 1 } });

  let removeIds = [];

  objects.forEach(obj => {
    removeIds.push(obj.tagIds || []);
  });

  removeIds = _.uniq(_.flatten(removeIds));

  await Tags.update({ _id: { $in: removeIds } }, { $inc: { objectCount: -1 } }, { multi: true });

  await collection.update({ _id: { $in: objectIds } }, { $set: { tagIds } }, { multi: true });

  await Tags.update({ _id: { $in: tagIds } }, { $inc: { objectCount: 1 } }, { multi: true });
}

export default {
  /**
   * Create new tag
   * @return {Promise} tag object
   */
  async tagsAdd(root, { name, type, colorCode }, { user }) {
    if (user) {
      const isUnique = await validateUniqueness(null, { name, type, colorCode });
      if (!isUnique) {
        throw new Error('Tag duplicated');
      }

      return await Tags.createTag({ name, type, colorCode });
    }
  },

  /**
   * Update tag
   * @return {Promise} tag object
   */
  async tagsEdit(root, { _id, name, type, colorCode }, { user }) {
    if (user) {
      const isUnique = await validateUniqueness({ _id }, { name, type, colorCode });
      if (!isUnique) {
        throw new Error('Tag duplicated');
      }

      await Tags.update({ _id: _id }, { name, type, colorCode });
      return Tags.findOne({ _id });
    }
  },

  /**
   * Delete tag
   * @return {Promise}
   */
  async tagsRemove(root, { ids }, { user }) {
    if (user) {
      const tagCount = await Tags.find({ _id: { $in: ids } }).count();
      if (tagCount !== ids.length) {
        throw new Error('Tag not found');
      }

      let count = 0;

      count += await Customers.find({ tagIds: { $in: ids } }).count();
      count += await Conversations.find({ tagIds: { $in: ids } }).count();
      count += await EngageMessages.find({ tagIds: { $in: ids } }).count();

      if (count > 0) {
        throw new Error("Can't remove a tag with tagged object(s)");
      }

      return Tags.remove({ _id: { $in: ids } });
    }
  },

  /**
   * Attach a tag
   * @return {Promise}
   */
  async tagsTag(root, { type, targetIds, tagIds }, { user }) {
    if (user) {
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
  },
};
