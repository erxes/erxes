import { Tags } from '../../../db/models';

export default {
  /**
  * Create new tag
  * @param {String} doc.name
  * @param {String} doc.type
  * @param {String} doc.colorCode
  * @return {Promise} newly created tag object
  */
  tagsAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    return Tags.createTag(doc);
  },

  /**
  * Edit tag
  * @param {String} doc.name
  * @param {String} doc.type
  * @param {String} doc.colorCode
  * @return {Promise} updated tag object
  */
  tagsEdit(root, { _id, ...doc }, { user }) {
    if (!user) throw new Error('Login required');

    return Tags.updateTag(_id, doc);
  },

  /**
  * Remove tag
  * @param {[String]} ids
  * @return {Promise}
  */
  tagsRemove(root, { ids }, { user }) {
    if (!user) throw new Error('Login required');

    return Tags.removeTag(ids);
  },

  /**
  * Attach a tag
  * @param {String} type
  * @param {[String]} targetIds
  * @param {[String]} tagIds
  */
  tagsTag(root, { type, targetIds, tagIds }, { user }) {
    if (!user) throw new Error('Login required');

    Tags.tagsTag(type, targetIds, tagIds);
  },
};
