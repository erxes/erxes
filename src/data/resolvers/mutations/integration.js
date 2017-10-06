import { Integrations } from '../../../db/models';

export default {
  /**
   * Create a new messenger integration
   * @param {Object}
   * @param {String} doc.title
   * @param {String} doc.brandId
   * @return {Promise} returns the messenger integration
   * @throws {Error} apollo level error based on validation
   */
  integrationsCreateMessengerIntegration(root, doc) {
    return Integrations.createMessengerIntegration(doc);
  },

  /**
   * Edit a messenger integration
   * @param {Object}
   * @param {String} args.id
   * @param {String} args.title
   * @param {String} args.brandId
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
   */
  integrationsEditMessengerIntegration(root, { id, ...fields }) {
    return Integrations.updateMessengerIntegration(id, fields);
  },

  /**
   * Edit/save messenger appearance data
   * @param {Object}
   * @param {String} args.id
   * @param {String} args.color
   * @param {String} args.wallpaper
   * @param {String} args.logo
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
   */
  integrationsSaveMessengerAppearanceData(root, { id, uiOptions }) {
    return Integrations.saveMessengerAppearanceData(id, uiOptions);
  },

  /**
   * Edit/save messenger data
   * @param {Object}
   * @param {String} args.id
   * @param {Boolean} args.notifyCustomer
   * @param {String} args.availabilityMethod
   * @param {Boolean} args.isOnline
   * @param {String} args.onlineHours.day
   * @param {String} args.onlineHours.from
   * @param {String} args.onlineHours.to
   * @param {String} args.timezone
   * @param {String} args.welcomeMessage
   * @param {String} args.awayMessage
   * @param {String} args.thankYouMessage
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
   */
  integrationsSaveMessengerConfigs(root, { id, messengerData }) {
    return Integrations.saveMessengerConfigs(id, messengerData);
  },

  /**
   * Create a new messenger integration
   * @param {Object}
   * @param {String} doc.title
   * @param {String} doc.brandId
   * @param {String} doc.formId
   * @param {Object} doc.formData
   * @return {Promise} returns the messenger integration
   * @throws {Error} apollo level error based on validation
   */
  integrationsCreateFormIntegration(root, doc) {
    return Integrations.createFormIntegration(doc);
  },

  /**
   * Edit a form integration
   * @param {Object}
   * @param {String} doc.title
   * @param {String} doc.brandId
   * @param {String} doc.formId
   * @param {Object} doc.formData
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
   */
  integrationsEditFormIntegration(root, { id, ...doc }) {
    return Integrations.updateFormIntegration(id, doc);
  },

  /**
  * Delete an integration
   * @param {Object}
   * @param {String} args.id
   * @return {Promise} returns the messenger integration
   * @throws {Error} apollo level error based on validation
   */
  integrationsRemove(root, { id }) {
    return Integrations.removeIntegration({ _id: id });
  },
};
