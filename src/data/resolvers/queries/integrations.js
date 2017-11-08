import { Integrations } from '../../../db/models';
import { socUtils } from '../../../social/twitterTracker';
import { getConfig, getPageList } from '../../../social/facebook';
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

  /**
   * Generate twitter integration auth url using credentials in .env
   * @return {Promise} - Generated url
   */
  integrationGetTwitterAuthUrl() {
    return socUtils.getTwitterAuthorizeUrl();
  },

  /**
   * Get facebook app list .env
   * @return {Promise} - Apps list
   */
  integrationFacebookAppsList() {
    return getConfig().map(app => ({
      id: app.id,
      name: app.name,
    }));
  },

  /**
   * Get facebook pages by appId
   * @return {Promise} - Page list
   */
  async integrationFacebookPagesList(root, { appId }) {
    const app = getConfig().find(app => app.id === appId);

    if (!app) {
      return [];
    }

    return getPageList(app.accessToken);
  },
};

moduleRequireLogin(integrationQueries);

export default integrationQueries;
