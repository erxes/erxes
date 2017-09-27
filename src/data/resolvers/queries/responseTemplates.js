import { ResponseTemplates } from '../../../db/models';

export default {
  /**
   * Response templates list
   * @param {Object} args
   * @param {Integer} args.limit
   * @return {Promise} response template objects
   */
  responseTemplates(root, { limit }) {
    const responseTemplate = ResponseTemplates.find({});

    if (limit) {
      return responseTemplate.limit(limit);
    }

    return responseTemplate;
  },

  /**
   * Get all response templates count. We will use it in pager
   * @return {Promise} total count
   */
  responseTemplatesTotalCount() {
    return ResponseTemplates.find({}).count();
  },
};
