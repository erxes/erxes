import { Integrations } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const integrationQueries = {
  /**
   * Integrations list
   * @param {Object} params - Search params
   * @return {Promise} filterd and sorted integrations list
   */
  integrations(root, { params = {} }) {
    const query = {};

    if (params.kind) {
      query.kind = params.kind;
    }

    const integrations = paginate(Integrations.find(query), params);

    return integrations.sort({ createdAt: -1 });
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
