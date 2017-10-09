import { Fields } from '../../../db/models';

export default {
  /**
   * Fields list
   * @param {Object} args
   * @return {Promise} sorted fields list
   */
  fields(root, { contentType, contentTypeId }) {
    const query = { contentType };

    if (contentTypeId) {
      query.contentTypeId = contentTypeId;
    }

    return Fields.find(query).sort({ order: 1 });
  },
};
