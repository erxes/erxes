import { Tags } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { publishConversationsChanged } from './conversations';

const tagMutations = {
  /**
  * Create new tag
  * @param {String} doc.name
  * @param {String} doc.type
  * @param {String} doc.colorCode
  * @return {Promise} newly created tag object
  */
  tagsAdd(root, doc) {
    return Tags.createTag(doc);
  },

  /**
  * Edit tag
  * @param {String} doc.name
  * @param {String} doc.type
  * @param {String} doc.colorCode
  * @return {Promise} updated tag object
  */
  tagsEdit(root, { _id, ...doc }) {
    return Tags.updateTag(_id, doc);
  },

  /**
  * Remove tag
  * @param {[String]} ids
  * @return {Promise}
  */
  tagsRemove(root, { ids }) {
    return Tags.removeTag(ids);
  },

  /**
  * Attach a tag
  * @param {String} type
  * @param {[String]} targetIds
  * @param {[String]} tagIds
  */
  tagsTag(root, { type, targetIds, tagIds }) {
    if (type === 'conversation') {
      publishConversationsChanged(targetIds, 'tag');
    }

    return Tags.tagsTag(type, targetIds, tagIds);
  },
};

moduleRequireLogin(tagMutations);

export default tagMutations;
