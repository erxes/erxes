import { Integrations } from '../../../db/models';
import { socUtils } from '../../../trackers/twitterTracker';
import { requireLogin, requireAdmin } from '../../permissions';

const integrationMutations = {
  /**
   * Create a new messenger integration
   * @param {Object} root
   * @param {Object} doc - Integration main doc object
   * @param {string} doc.name - Integration name
   * @param {string} doc.brandId - Integration brand id
   * @return {Promise} return Promise resolving Integration document
   */
  integrationsCreateMessengerIntegration(root, doc) {
    return Integrations.createMessengerIntegration(doc);
  },

  /**
   * Update messenger integration
   * @param {Object} root
   * @param {string} object2  - Integration main document object
   * @param {string} object2._id - Integration id
   * @param {string} object2.name - Integration name
   * @param {string} object2.brandId - Integration brand id
   * @return {Promise} return Promise resolving Integration document
   */
  integrationsEditMessengerIntegration(root, { _id, ...fields }) {
    return Integrations.updateMessengerIntegration(_id, fields);
  },

  /**
   * Update/save messenger appearance data
   * @param {Object} root
   * @param {Object} object2 Graphql input data
   * @param {string} object2._id - Integration id
   * @param {Object} object2 - MessengerUiOptions subdocument object
   * @param {string} object2.color - MessengerUiOptions color
   * @param {string} object2.wallpaper - MessengerUiOptions wallpaper
   * @param {string} object2.logo - MessengerUiOptions logo
   * @return {Promise} return Promise resolving Integration document
   */
  integrationsSaveMessengerAppearanceData(root, { _id, uiOptions }) {
    return Integrations.saveMessengerAppearanceData(_id, uiOptions);
  },

  /**
   * Update/save messenger data
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {string} object2._id - Integration id
   * @param {MessengerData} object2.messengerData - MessengerData subdocument
   *     object related to this integration
   * @return {Promise} return Promise resolving Integration document
   */
  integrationsSaveMessengerConfigs(root, { _id, messengerData }) {
    return Integrations.saveMessengerConfigs(_id, messengerData);
  },

  /**
   * Create a new messenger integration
   * @param {Object} root
   * @param {Object} doc - Integration object
   * @param {string} doc.name - Integration name
   * @param {string} doc.brandId - Integration brand id
   * @param {string} doc.formId - Integration form id
   * @param {FormData} doc.formData - Integration form data sumbdocument object
   * @return {Promise} return Promise resolving Integration document
   */
  integrationsCreateFormIntegration(root, doc) {
    return Integrations.createFormIntegration(doc);
  },

  /**
   * Create a new twitter integration
   * @param {Object} root
   * @param {Object} queryParams - Url params
   * @param {String} brandId - Integration brand id
   * @return {Promise} return Promise resolving Integration document
   */
  async integrationsCreateTwitterIntegration(root, { queryParams, brandId }) {
    const data = await socUtils.authenticate(queryParams);

    const integration = await Integrations.createTwitterIntegration({
      name: data.info.name,
      brandId,
      twitterData: {
        info: data.info,
        token: data.tokens.auth.token,
        tokenSecret: data.tokens.auth.token_secret,
      },
    });

    // start tracking new twitter entries
    socUtils.trackIntegration(integration);

    return integration;
  },

  /**
   * Create a new facebook integration
   * @param {Object} root
   * @param {String} brandId - Integration brand id
   * @param {String} name - Integration name
   * @param {String} appId - Facebook app id in .env
   * @param {String} pageIds - Selected facebook page ids
   * @return {Promise} return Promise resolving Integration document
   */
  async integrationsCreateFacebookIntegration(root, { name, brandId, appId, pageIds }) {
    return await Integrations.createFacebookIntegration({
      name,
      brandId,
      facebookData: {
        appId,
        pageIds,
      },
    });
  },

  /**
   * Edit a form integration
   * @param {Object}
   * @param {Object} doc - Integration object
   * @param {string} doc._id - Integration id
   * @param {string} doc.name - Integration name
   * @param {string} doc.brandId - Integration brand id
   * @param {string} doc.formId - Integration form id
   * @param {FormData} doc.formData - Integration form data subdocument object
   * @param {Object} object3 - The middleware data
   * @param {Object} object3.user - The user making this action
   * @return {Promise} return Promise resolving Integration document
   */
  integrationsEditFormIntegration(root, { _id, ...doc }) {
    return Integrations.updateFormIntegration(_id, doc);
  },

  /**
  * Delete an integration
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {string} object2._id - Integration id
   * @param {Object} object3 - The middleware data
   * @param {Object} object3.user - The user making this action
   * @return {Promise}
   */
  integrationsRemove(root, { _id }) {
    return Integrations.removeIntegration(_id);
  },
};

requireLogin(integrationMutations, 'integrationsCreateMessengerIntegration');
requireLogin(integrationMutations, 'integrationsEditMessengerIntegration');
requireLogin(integrationMutations, 'integrationsSaveMessengerAppearanceData');
requireLogin(integrationMutations, 'integrationsSaveMessengerConfigs');
requireLogin(integrationMutations, 'integrationsCreateFormIntegration');
requireLogin(integrationMutations, 'integrationsEditFormIntegration');
requireLogin(integrationMutations, 'integrationsCreateTwitterIntegration');
requireLogin(integrationMutations, 'integrationsCreateFacebookIntegration');
requireAdmin(integrationMutations, 'integrationsRemove');

export default integrationMutations;
