import { Integrations } from '../../../db/models';

export default {
  /**
   * Integrations list
   * @param {Object} args
   * @param {Integer} args.limit
   * @param {String} args.kind
   * @return {Promise} filterd and sorted integrations list
   */
  integrations(root, { limit, kind }) {
    const query = {};
    const sort = { createdAt: -1 };

    if (kind) {
      query.kind = kind;
    }

    const integrations = Integrations.find(query);

    if (limit) {
      return integrations.sort(sort).limit(limit);
    }

    return integrations.sort(sort);
  },

  /**
   * Get one integration
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found integration
   */
  integrationDetail(root, { _id }) {
    return Integrations.findOne({ _id });
  },

  /**
   * Get all integrations count. We will use it in pager
   * @return {Promise} total count
   */
  integrationsTotalCount(root, { kind }) {
    return Integrations.find({ kind }).count();
  },
};
