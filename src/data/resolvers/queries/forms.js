import { Forms } from '../../../db/models';

export default {
  /**
   * Forms list
   * @param {Object} args
   * @param {Integer} args.limit
   * @return {Promise} sorted forms list
   */
  forms(root, { limit }) {
    const forms = Forms.find({});
    const sort = { name: 1 };

    if (limit) {
      return forms.sort(sort).limit(limit);
    }

    return forms.sort(sort);
  },

  /**
   * Get one form
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found form
   */
  formDetail(root, { _id }) {
    return Forms.findOne({ _id });
  },

  /**
   * Get all forms count. We will use it in pager
   * @return {Promise} total count
   */
  formsTotalCount() {
    return Forms.find({}).count();
  },
};
