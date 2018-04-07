import { Channels, Integrations, Forms } from '../../../db/models';
import { socUtils } from '../../../trackers/twitterTracker';
import { getConfig, getPageList } from '../../../trackers/facebook';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

/*
 * Common helper for integrations & integrationsTotalCount
 * @param {String} kind - Messenger, Facebook etc ...
 * @param {String} channelId - Channel id
 * @param {String} brandId - Brand id
 * @return generated query
 */
const generateFilterQuery = async ({ kind, channelId, brandId, searchValue, tag }) => {
  const query = {};

  if (kind) {
    query.kind = kind;
  }

  // filter integrations by channel
  if (channelId) {
    const channel = await Channels.findOne({ _id: channelId });
    query._id = { $in: channel.integrationIds };
  }

  // filter integrations by brand
  if (brandId) {
    query.brandId = brandId;
  }

  if (searchValue) {
    query.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  // filtering integrations by form tag
  if (tag) {
    const forms = await Forms.find({ tagIds: tag });
    const formIds = [];

    for (let form of forms) {
      formIds.push(form._id);
    }

    query.formId = { $in: formIds };
  }

  return query;
};

const integrationQueries = {
  /**
   * Integrations list
   * @param {Object} args - Search params
   * @return {Promise} filterd and sorted integrations list
   */
  async integrations(root, args) {
    const query = await generateFilterQuery(args);
    const integrations = paginate(Integrations.find(query), args);

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
  async integrationsTotalCount(root, args) {
    const query = await generateFilterQuery(args);
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
