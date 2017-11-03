import { Integrations } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const integrationQueries = {
  /**
   * Integrations list
   * @param {Object} object
   * @param {Object} object2 - Apollo input data
   * @param {Integer} object2.limit
   * @param {String} object2.kind
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
   * @param {Object} object
   * @param {Object} object2 - Apollo input data
   * @param {String} object2._id - Integration id
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
    const query = {};

    if (kind) {
      query.kind = kind;
    }

    return Integrations.find(query).count();
  },
};

moduleRequireLogin(integrationQueries);

export default integrationQueries;
